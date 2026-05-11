import Link from 'next/link';

/**
 * Email Verification Request Page
 * 
 * Displayed after a user requests email verification.
 * Informs the user to check their email for a verification link.
 * 
 * Requirements:
 * - 13.5: Email verification support
 */

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Verification card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Email icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* Message */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Check your email
            </h1>
            <p className="text-gray-600 mb-4">
              A sign-in link has been sent to your email address.
            </p>
            <p className="text-sm text-gray-500">
              Click the link in the email to sign in to your account.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-sm font-semibold text-blue-900 mb-2">
              What to do next:
            </h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Check your inbox for an email from AI UI Builder</li>
              <li>• Click the sign-in link in the email</li>
              <li>• The link will expire in 24 hours</li>
            </ul>
          </div>

          {/* Troubleshooting */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Didn&apos;t receive the email?
            </p>
            <ul className="text-xs text-gray-500 space-y-1 mb-6">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• Wait a few minutes and check again</li>
            </ul>

            <Link
              href="/auth/signin"
              className="inline-block text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              ← Back to sign in
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
