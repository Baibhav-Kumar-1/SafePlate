import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getModels } from './db';

/**
 * Get the current authenticated user with their full profile
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  try {
    const { User } = await getModels();
    const user = await User.findById(session.user.id).select('-password');
    return user ? user.toObject() : null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

/**
 * Middleware to protect routes - use in Server Components
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return session;
}

/**
 * Test database connection and auth configuration
 */
export async function validateAuthSetup() {
  try {
    // Test database connection
    const { User } = await getModels();
    await User.findOne({}); // Simple query to test connection

    // Verify required environment variables
    const requiredEnvVars = [
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'MONGODB_URI',
    ];

    const missingVars = requiredEnvVars.filter(
      varName => !process.env[varName]
    );

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}`
      );
    }

    return {
      success: true,
      message: 'Authentication setup is valid',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Authentication setup validation failed',
      error: error.message,
    };
  }
}

/**
 * Check if user has required permissions
 */
export function hasPermission(user, permission) {
  // Basic permission check - can be expanded based on requirements
  if (!user) return false;
  
  // For now, just check if user is authenticated
  return true;
}

/**
 * Format error messages for client
 */
export function formatAuthError(error) {
  const errorMessages = {
    CredentialsSignin: 'Invalid email or password',
    Default: 'An error occurred during authentication',
  };

  return errorMessages[error] || errorMessages.Default;
}