import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { getDBModels } from '@/lib/db';

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { 
          label: "Email", 
          type: "email",
          placeholder: "your@email.com"
        },
        password: { 
          label: "Password", 
          type: "password" 
        }
      },
      async authorize(credentials) {
        try {
          console.log('Attempting authentication for:', credentials?.email);
          
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Please provide both email and password');
          }

          const { User } = await getDBModels();
          
          if (!User) {
            console.error('User model not initialized');
            throw new Error('Authentication system unavailable');
          }

          const user = await User.findOne({ 
            email: credentials.email.toLowerCase() 
          }).select('+password');

          if (!user) {
            console.log('No user found for email:', credentials.email);
            throw new Error('Invalid email or password');
          }

          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            console.log('Invalid password for user:', credentials.email);
            throw new Error('Invalid email or password');
          }

          console.log('Authentication successful for:', credentials.email);
          
          // Update last login timestamp
          await User.findByIdAndUpdate(user._id, {
            lastLogin: new Date()
          });

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw error;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    }
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };