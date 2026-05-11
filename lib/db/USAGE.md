# Prisma Client Usage Guide

## Quick Start

The Prisma client singleton is ready to use. Simply import it in your API routes or server components:

```typescript
import { prisma } from '@/lib/db';
```

## Example: API Route Usage

### app/api/projects/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Query user's projects
    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, uiDocument } = body;

    // Create new project
    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId: session.user.id,
        uiDocument,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### app/api/projects/[id]/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma, withTransaction } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const project = await prisma.project.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (project.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, uiDocument } = body;

    // Use transaction to ensure atomicity
    const project = await withTransaction(async (tx) => {
      // Verify ownership
      const existingProject = await tx.project.findUnique({
        where: { id: params.id },
      });

      if (!existingProject) {
        throw new Error('Project not found');
      }

      if (existingProject.userId !== session.user.id) {
        throw new Error('Forbidden');
      }

      // Update project
      return await tx.project.update({
        where: { id: params.id },
        data: {
          name,
          description,
          uiDocument,
          updatedAt: new Date(),
        },
      });
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Failed to update project:', error);
    
    if (error.message === 'Project not found') {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    if (error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Example: Server Component Usage

### app/dashboard/page.tsx

```typescript
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Fetch user's projects directly in server component
  const projects = await prisma.project.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      description: true,
      thumbnail: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 10,
  });

  return (
    <div>
      <h1>My Projects</h1>
      <div className="grid grid-cols-3 gap-4">
        {projects.map((project) => (
          <div key={project.id} className="border rounded p-4">
            <h2>{project.name}</h2>
            <p>{project.description}</p>
            <p className="text-sm text-gray-500">
              Updated: {project.updatedAt.toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Example: Health Check Endpoint

### app/api/health/route.ts

```typescript
import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/db';

export async function GET() {
  const isDatabaseHealthy = await checkDatabaseConnection();

  const health = {
    status: isDatabaseHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: isDatabaseHealthy ? 'up' : 'down',
      },
    },
  };

  const statusCode = isDatabaseHealthy ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
```

## Best Practices

1. **Always check authentication** before database operations
2. **Verify ownership** before allowing access to resources
3. **Use transactions** for operations that modify multiple records
4. **Handle errors gracefully** and return appropriate HTTP status codes
5. **Use select** to limit returned fields for better performance
6. **Add indexes** to frequently queried fields (already done in schema)
7. **Implement pagination** for list endpoints
8. **Log errors** for debugging and monitoring

## Common Patterns

### Pagination

```typescript
const page = 1;
const pageSize = 10;
const skip = (page - 1) * pageSize;

const [projects, totalCount] = await Promise.all([
  prisma.project.findMany({
    where: { userId },
    skip,
    take: pageSize,
    orderBy: { updatedAt: 'desc' },
  }),
  prisma.project.count({ where: { userId } }),
]);
```

### Search

```typescript
const projects = await prisma.project.findMany({
  where: {
    userId,
    OR: [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
    ],
  },
});
```

### Soft Delete

```typescript
// Mark as deleted instead of removing
await prisma.project.update({
  where: { id: projectId },
  data: {
    // Add deletedAt field to schema first
    // deletedAt: new Date(),
  },
});

// Filter out deleted records
const projects = await prisma.project.findMany({
  where: {
    userId,
    // deletedAt: null,
  },
});
```

## Environment Setup

Make sure your `.env` file contains:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

For production, use a secure connection string from your database provider (Supabase, Railway, etc.).

## Next Steps

1. Run migrations: `npx prisma migrate dev`
2. Generate Prisma Client: `npx prisma generate`
3. Seed database (optional): `npx prisma db seed`
4. View data: `npx prisma studio`

## Troubleshooting

### "Too many connections" error

This usually happens in development due to hot reloading. The singleton pattern should prevent this, but if you still see it:

1. Restart your dev server
2. Check that you're importing from `@/lib/db` and not creating new instances
3. Reduce the number of concurrent requests in development

### Type errors

If you see type errors after updating the schema:

1. Run `npx prisma generate` to regenerate the Prisma Client
2. Restart your TypeScript server in VS Code

### Connection errors

1. Verify your `DATABASE_URL` is correct
2. Check that your database is running
3. Ensure your IP is whitelisted (for cloud databases)
4. Use `checkDatabaseConnection()` to diagnose connection issues
