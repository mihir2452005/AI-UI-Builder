// lib/db/prisma.ts

import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 * 
 * This pattern prevents multiple instances of Prisma Client in development
 * due to Next.js hot reloading. In production, it creates a single instance.
 * 
 * Requirements: 23.1, 23.6
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Gracefully disconnect Prisma Client on application shutdown
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Connect to the database explicitly (optional, as Prisma connects lazily)
 */
export async function connectPrisma(): Promise<void> {
  await prisma.$connect();
}

/**
 * Check database connection health
 * @returns true if database is accessible, false otherwise
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

/**
 * Execute a database transaction with automatic retry logic
 * @param fn Transaction function to execute
 * @param maxRetries Maximum number of retry attempts (default: 3)
 * @returns Result of the transaction
 */
export async function withTransaction<T>(
  fn: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        return await fn(tx);
      });
    } catch (error) {
      lastError = error as Error;
      
      // Log retry attempt
      if (attempt < maxRetries - 1) {
        console.warn(
          `Transaction failed (attempt ${attempt + 1}/${maxRetries}), retrying...`,
          error
        );
        
        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  throw new Error(
    `Transaction failed after ${maxRetries} attempts: ${lastError?.message}`
  );
}

/**
 * Safely execute a database query with error handling
 * @param fn Query function to execute
 * @returns Result of the query or null if error occurs
 */
export async function safeQuery<T>(
  fn: () => Promise<T>
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    console.error('Database query failed:', error);
    return null;
  }
}

/**
 * Get database statistics for monitoring
 * @returns Database connection pool statistics
 */
export async function getDatabaseStats() {
  try {
    // Basic connection check
    const isConnected = await checkDatabaseConnection();
    return {
      connected: isConnected,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to get database stats:', error);
    return null;
  }
}
