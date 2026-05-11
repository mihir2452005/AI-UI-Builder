// app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

/**
 * NextAuth.js API Route Handler
 * 
 * This is the catch-all route handler for NextAuth.js authentication.
 * It handles all authentication requests including:
 * - Sign in/out
 * - OAuth callbacks
 * - Session management
 * - CSRF token generation
 * 
 * Routes handled:
 * - GET  /api/auth/signin
 * - POST /api/auth/signin/:provider
 * - GET  /api/auth/callback/:provider
 * - GET  /api/auth/signout
 * - POST /api/auth/signout
 * - GET  /api/auth/session
 * - GET  /api/auth/csrf
 * - GET  /api/auth/providers
 * 
 * Requirements:
 * - 13.1: Email and password registration
 * - 13.2: OAuth authentication with Google and GitHub
 * - 13.6: User workspace loading on login
 * 
 * @see https://next-auth.js.org/configuration/initialization#route-handlers-app
 */
const handler = NextAuth(authOptions);

// Export handlers for both GET and POST requests
export { handler as GET, handler as POST };
