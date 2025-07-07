'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin');
    }
  }, [status, router]);

  const handleSignOut = async () => {
    await signOut({ 
      redirect: true,
      callbackUrl: '/auth/signin'
    });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
            <h1 className="text-3xl font-bold text-gray-900">
              Profile Settings
            </h1>
            <div className="flex items-center space-x-4">
              <Link
                href="/scan"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Scan Menu
              </Link>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
            {/* Profile Section */}
            <div className="p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <div className="mt-1 text-gray-900">{session.user.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 text-gray-900">{session.user.email}</div>
                </div>
              </div>
            </div>

            {/* Allergen Settings */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium text-gray-900">
                  Allergen Preferences
                </h2>
                <button
                  className="text-sm text-blue-600 hover:text-blue-500"
                  onClick={() => {/* TODO: Implement allergen management */}}
                >
                  Manage Allergens
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-500 text-sm">
                  No allergens configured yet. Add allergens to receive personalized warnings when scanning menus.
                </p>
              </div>
            </div>

            {/* Recent Scans */}
            <div className="p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">
                Recent Scans
              </h2>
              <div className="space-y-4">
                <p className="text-gray-500 text-sm">
                  No recent menu scans. Use the Scan Menu button above to start scanning menus for allergens.
                </p>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium text-gray-900">
                  Notification Settings
                </h2>
                <div>
                  <span className="text-sm text-gray-500">
                    Notifications are enabled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}