import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        // Public paths that don't require authentication
        const publicPaths = [
          '/',
          '/auth/signin',
          '/auth/signup',
          '/auth/error',
          '/api/auth',
        ];

        const path = req.nextUrl.pathname;
        
        // Allow public paths without authentication
        if (publicPaths.some(p => path.startsWith(p))) {
          return true;
        }

        // Require authentication for all other paths
        return !!token;
      }
    }
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};