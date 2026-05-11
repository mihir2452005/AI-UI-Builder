'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

/**
 * Authentication Error Page
 * 
 * Displays user-friendly error messages for authentication failures.
 * 
 * Features:
 * - Maps error codes to readable messages
 * - Provides action buttons to retry
 * - Clean, accessible UI
 * 
 * Requirements:
 * - 13.5: Error handling and display
 */

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  // Map error codes to user-friendly messages
  const getErrorDetails = (error: string | null): { title: string; description: string } => {
    const errorMap: Record<string, { title: string; description: string }> = {
      'Configuration': {
        title: 'Configuration Error',
        description: 'There is a problem with the server configuration. Please contact support.',
      },
      'AccessDenied': {
        title: 'Access Denied',
        description: 'You do not have permission to sign in.',
      },
      'Verification': {
        title: 'Verification Failed',
        description: 'The verification token has expired or has already been used.',
      },
      'OAuthSignin': {
        title: 'OAuth Sign In Error',
        description: 'Error occurred while trying to sign in with the OAuth provider.',
      },
      'OAuthCallback': {
        title: 'OAuth Callback Error',
        description: 'Error occurred during the OAuth callback process.',
      },
      'OAuthCreateAccount': {
        title: 'OAuth Account Creation Error',
        description: 'Could not create an account with the OAuth provider.',
      },
      'EmailCreateAccount': {
        title: 'Email Account Creation Error',
        description: 'Could not create an account with the provided email.',
      },
      'Callback': {
        title: 'Callback Error',
        description: 'Error occurred during the authentication callback.',
      },
      'OAuthAccountNotLinked': {
        title: 'Account Not Linked',
        description: 'This email is already registered with a different sign-in method. Please use your original sign-in method.',
      },
      'EmailSignin': {
        title: 'Email Sign In Error',
        description: 'Error occurred while sending the verification email.',
      },
      'CredentialsSignin': {
        title: 'Sign In Failed',
        description: 'The email or password you entered is incorrect. Please try again.',
      },
      'SessionRequired': {
        title: 'Session Required',
        description: 'You must be signed in to access this page.',
      },
      'Default': {
        title: 'Authentication Error',
        description: 'An unexpected error occurred during authentication. Please try again.',
      },
    };

    return errorMap[error || 'Default'] || errorMap['Default'];
  };

  const errorDetails = getErrorDetails(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Error card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Error icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Error details */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {errorDetails.title}
            </h1>
            <p className="text-gray-600">
              {errorDetails.description}
            </p>
          </div>

          {/* Error code (for debugging) */}
          {error && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 text-center">
                Error code: <span className="font-mono">{error}</span>
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="block w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
            >
              Try signing in again
            </Link>

            <Link
              href="/auth/signup"
              className="block w-full bg-white text-gray-700 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors text-center"
            >
              Create a new account
            </Link>

            <Link
              href="/"
              className="block w-full text-gray-600 py-3 rounded-lg font-medium hover:text-gray-900 transition-colors text-center"
            >
              Go to homepage
            </Link>
          </div>
        </div>

        {/* Support link */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Need help?{' '}
          <a
            href="mailto:support@aiuibuilder.com"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
