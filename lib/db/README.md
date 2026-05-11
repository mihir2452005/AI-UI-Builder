# Database Utilities

This directory contains the Prisma client singleton and database helper utilities.

## Requirements

- **23.1**: Database SHALL store all user projects with automatic backups
- **23.6**: Database SHALL maintain referential integrity between users, projects, and assets

## Files

### `prisma.ts`

The main Prisma client singleton implementation following Next.js best practices.

**Key Features:**
- Singleton pattern to prevent multiple instances in development
- Automatic connection management
- Configurable logging (verbose in development, errors only in production)
- Connection health checks
- Transaction helpers with retry logic
- Safe query execution with error handling

### `index.ts`

Centralized exports for all database utilities.

## Usage

### Basic Usage

```typescript
import { prisma } from '@/lib/db';

// Query users
const users = await prisma.user.findMany();

// Create a project
const project = await prisma.project.create({
  data: {
    name: 'My Project',
    userId: 'user_123',
    uiDocument: {},
  },
});
```

### Connection Health Check

```typescript
import { checkDatabaseConnection } from '@/lib/db';

const isHealthy = await checkDatabaseConnection();
if (!isHealthy) {
  console.error('Database is not accessible');
}
```

### Transaction with Retry Logic

```typescript
import { withTransaction } from '@/lib/db';

const result = await withTransaction(async (tx) => {
  // Create user
  const user = await tx.user.create({
    data: { email: 'user@example.com' },
  });
  
  // Create project for user
  const project = await tx.project.create({
    data: {
      name: 'First Project',
      userId: user.id,
      uiDocument: {},
    },
  });
  
  return { user, project };
});
```

### Safe Query Execution

```typescript
import { safeQuery } from '@/lib/db';

// Returns null if query fails instead of throwing
const user = await safeQuery(() =>
  prisma.user.findUnique({
    where: { id: 'user_123' },
  })
);

if (!user) {
  console.log('User not found or query failed');
}
```

### Graceful Shutdown

```typescript
import { disconnectPrisma } from '@/lib/db';

// In your application shutdown handler
process.on('SIGTERM', async () => {
  await disconnectPrisma();
  process.exit(0);
});
```

## Best Practices

1. **Always use the singleton**: Import `prisma` from `@/lib/db`, never create new `PrismaClient` instances
2. **Use transactions for related operations**: Wrap multiple database operations in `withTransaction` to ensure atomicity
3. **Handle errors gracefully**: Use `safeQuery` for non-critical queries where you want to handle failures without throwing
4. **Check connection health**: Use `checkDatabaseConnection` in health check endpoints
5. **Clean up on shutdown**: Call `disconnectPrisma` when your application shuts down

## Why Singleton Pattern?

In development, Next.js hot reloading can create multiple instances of `PrismaClient`, which:
- Exhausts database connections
- Causes "Too many connections" errors
- Degrades performance

The singleton pattern ensures only one `PrismaClient` instance exists across hot reloads by storing it on the `globalThis` object.

## Environment Variables

Required environment variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

Optional:
```env
NODE_ENV="development" # Enables verbose logging
```

## Testing

Tests are located in `__tests__/prisma.test.ts` and verify:
- Singleton behavior
- Connection health checks
- Transaction retry logic
- Safe query error handling

Run tests with:
```bash
npm test lib/db
```

## Monitoring

Use `getDatabaseStats()` to get connection pool metrics:

```typescript
import { getDatabaseStats } from '@/lib/db';

const stats = await getDatabaseStats();
console.log('Database metrics:', stats);
```

## Related Documentation

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Best Practices](https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices)
- [Database Schema](../../prisma/schema.prisma)
