import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function AuthLayout({ children }) {
  const session = await getServerSession(authOptions);

  // Redirect to profile if already authenticated
  if (session) {
    redirect('/profile');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}

// Add metadata for auth pages
export const metadata = {
  title: {
    template: '%s - SafePlate',
    default: 'Authentication - SafePlate',
  },
  description: 'Authenticate with SafePlate to manage your allergen preferences',
};