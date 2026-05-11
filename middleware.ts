import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware to protect routes that require authentication
 * 
 * Protected routes:
 * - /dashboard - User dashboard and project management
 * - /editor - UI editor workspace
 * 
 * Requirements:
 * - 13.6: Session-based access control
 * - 13.8: Redirect unauthenticated users to sign-in
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if user is authenticated
  const isAuthenticated = !!token;

  // Define protected routes
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/editor');

  // Redirect unauthenticated users to sign-in page
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL('/auth/signin', request.url);
    // Add callback URL to redirect back after sign-in
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Allow authenticated users or non-protected routes
  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 * 
 * Matcher configuration:
 * - Runs on /dashboard and /editor routes
 * - Excludes API routes, static files, and Next.js internals
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|auth).*)',
  ],
};
