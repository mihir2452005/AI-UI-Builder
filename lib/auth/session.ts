// lib/auth/session.ts

import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth-options';

/**
 * Session Utilities
 * 
 * Helper functions for working with NextAuth sessions
 */

/**
 * Get the current session in Server Components
 * 
 * @returns Promise resolving to the current session or null
 */
export async function getCurrentSession() {
  return getServerSession(authOptions);
}

/**
 * Get the current user from the session
 * 
 * @returns Promise resolving to the current user or null
 */
export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

/**
 * Require authentication
 * 
 * Throws an error if the user is not authenticated
 * Useful for API routes and server actions
 * 
 * @returns Promise resolving to the current user
 * @throws Error if user is not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized - Please sign in');
  }
  
  return user;
}

/**
 * Check if user is authenticated
 * 
 * @returns Promise resolving to true if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return !!session?.user;
}
