// lib/db/examples.ts

/**
 * Example usage patterns for the Prisma client and database utilities
 * 
 * These examples demonstrate common database operations and best practices.
 * This file is for documentation purposes and is not imported in production code.
 */

import { prisma, withTransaction, safeQuery, checkDatabaseConnection } from './prisma';

/**
 * Example 1: Basic CRUD operations
 */
export async function exampleBasicCRUD() {
  // Create a user
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'John Doe',
    },
  });

  // Read user
  const foundUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { name: 'Jane Doe' },
  });

  // Delete user (soft delete recommended in production)
  await prisma.user.delete({
    where: { id: user.id },
  });

  return { user, foundUser, updatedUser };
}

/**
 * Example 2: Creating related records with transaction
 */
export async function exampleCreateUserWithProject() {
  return await withTransaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: {
        email: 'newuser@example.com',
        name: 'New User',
      },
    });

    // Create project for the user
    const project = await tx.project.create({
      data: {
        name: 'My First Project',
        description: 'A sample project',
        userId: user.id,
        uiDocument: {
          id: 'doc_1',
          version: '1.0',
          metadata: {
            name: 'My First Project',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            promptHistory: [],
          },
          designTokens: {
            colors: {},
            spacing: {},
            typography: {},
            shadows: {},
          },
          breakpoints: [
            { name: 'mobile', minWidth: 0, maxWidth: 767 },
            { name: 'desktop', minWidth: 768 },
          ],
          tree: {
            id: 'root',
            type: 'Container',
            props: {},
            styles: { base: {} },
            children: [],
            metadata: {},
          },
        },
      },
    });

    return { user, project };
  });
}

/**
 * Example 3: Querying with relations
 */
export async function exampleQueryWithRelations(userId: string) {
  // Get user with all their projects
  const userWithProjects = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      projects: {
        orderBy: { updatedAt: 'desc' },
        take: 10, // Limit to 10 most recent projects
      },
    },
  });

  return userWithProjects;
}

/**
 * Example 4: Safe query that won't throw on error
 */
export async function exampleSafeQuery(userId: string) {
  // This will return null if the query fails or user doesn't exist
  const user = await safeQuery(() =>
    prisma.user.findUnique({
      where: { id: userId },
    })
  );

  if (!user) {
    console.log('User not found or query failed');
    return null;
  }

  return user;
}

/**
 * Example 5: Pagination
 */
export async function examplePagination(userId: string, page = 1, pageSize = 10) {
  const skip = (page - 1) * pageSize;

  const [projects, totalCount] = await Promise.all([
    prisma.project.findMany({
      where: { userId },
      skip,
      take: pageSize,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail: true,
        updatedAt: true,
        // Don't include uiDocument for list view (performance)
      },
    }),
    prisma.project.count({
      where: { userId },
    }),
  ]);

  return {
    projects,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
}

/**
 * Example 6: Batch operations
 */
export async function exampleBatchOperations(projectIds: string[]) {
  // Update multiple projects at once
  const result = await prisma.project.updateMany({
    where: {
      id: { in: projectIds },
    },
    data: {
      updatedAt: new Date(),
    },
  });

  return result;
}

/**
 * Example 7: Complex filtering and search
 */
export async function exampleSearchProjects(userId: string, searchTerm: string) {
  const projects = await prisma.project.findMany({
    where: {
      userId,
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ],
    },
    orderBy: { updatedAt: 'desc' },
  });

  return projects;
}

/**
 * Example 8: Health check endpoint usage
 */
export async function exampleHealthCheck() {
  const isHealthy = await checkDatabaseConnection();

  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    database: {
      connected: isHealthy,
    },
  };
}

/**
 * Example 9: Soft delete pattern (recommended for Requirement 23.8)
 */
export async function exampleSoftDelete(projectId: string) {
  // Instead of deleting, mark as deleted with a timestamp
  // Note: This requires adding a deletedAt field to the schema
  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      // deletedAt: new Date(), // Uncomment when schema is updated
      updatedAt: new Date(),
    },
  });

  return project;
}

/**
 * Example 10: Transaction with error handling and rollback
 */
export async function exampleTransactionWithRollback(
  userId: string,
  projectName: string
) {
  try {
    return await withTransaction(async (tx) => {
      // Verify user exists
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Create project
      const project = await tx.project.create({
        data: {
          name: projectName,
          userId: user.id,
          uiDocument: {},
        },
      });

      // If any operation fails, the entire transaction will rollback
      return project;
    });
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}
