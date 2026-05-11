// lib/auth/index.ts

/**
 * Authentication Module
 * 
 * Centralized exports for authentication functionality
 */

export { authOptions } from './auth-options';
export {
  hashPassword,
  verifyPassword,
  validatePassword,
  validateAndHashPassword,
  type PasswordValidationResult,
} from './password';
export {
  getCurrentSession,
  getCurrentUser,
  requireAuth,
  isAuthenticated,
} from './session';
