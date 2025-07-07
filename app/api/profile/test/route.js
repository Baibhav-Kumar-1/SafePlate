import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getModels } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user exists in database
    const { User } = await getModels();
    const user = await User.findById(session.user.id).select('-password');

    if (!user) {
      return Response.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json({
      message: 'Authentication working correctly',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        allergens: user.allergens,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}