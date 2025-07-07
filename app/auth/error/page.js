'use client';

import { useSearchParams } from 'next/navigation';

function getErrorMessage(error) {
  const errorMessages = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'Access denied. You do not have permission to view this page.',
    Verification: 'The verification link may have expired or already been used.',
    Default: 'An authentication error occurred. Please try again.'
  };

  return errorMessages[error] || errorMessages.Default;
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorMessage = getErrorMessage(error);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
          Authentication Error
        </h1>
        
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{errorMessage}</p>
        </div>

        <div className="text-center">
          <a
            href="/auth/signin"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    </main>
  );
}