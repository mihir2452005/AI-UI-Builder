// lib/auth/password.ts

import bcrypt from 'bcryptjs';

/**
 * Password Utilities
 * 
 * Provides functions for password hashing, verification, and validation
 * Uses bcrypt for secure password hashing
 */

/**
 * Hash a password using bcrypt
 * 
 * @param password - Plain text password to hash
 * @returns Promise resolving to hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Higher = more secure but slower
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 * 
 * @param password - Plain text password to verify
 * @param hash - Hashed password to compare against
 * @returns Promise resolving to true if password matches
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Password validation rules (Requirement 13.4)
 * 
 * Requirements:
 * - Minimum length of 8 characters
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate password against requirements
 * 
 * @param password - Password to validate
 * @returns Validation result with errors if any
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  
  // Check minimum length (Requirement 13.4)
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate and hash password
 * 
 * Convenience function that validates and hashes in one step
 * 
 * @param password - Password to validate and hash
 * @returns Promise resolving to hashed password
 * @throws Error if password is invalid
 */
export async function validateAndHashPassword(
  password: string
): Promise<string> {
  const validation = validatePassword(password);
  
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }
  
  return hashPassword(password);
}
