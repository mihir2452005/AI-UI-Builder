// lib/db/index.ts

/**
 * Database utilities and Prisma client exports
 * 
 * This module provides a centralized export for all database-related
 * functionality including the Prisma client singleton and helper utilities.
 * 
 * Requirements: 23.1, 23.6
 */

export {
  prisma,
  connectPrisma,
  disconnectPrisma,
  checkDatabaseConnection,
  withTransaction,
  safeQuery,
  getDatabaseStats,
} from './prisma';

// Re-export Prisma types for convenience
export type { PrismaClient } from '@prisma/client';
