# Database Migration Guide

This guide explains how to set up the PostgreSQL database and run Prisma migrations for the AI UI Builder SaaS platform.

## Prerequisites

- Docker and Docker Compose installed (for local development)
- Node.js and npm installed
- Prisma CLI installed (included in project dependencies)

## Local Development Setup

### Option 1: Using Docker Compose (Recommended)

1. **Start PostgreSQL container:**
   ```bash
   docker-compose up -d
   ```

2. **Verify the database is running:**
   ```bash
   docker-compose ps
   ```
   
   You should see the `ai_ui_builder_db` container running.

3. **Check database health:**
   ```bash
   docker-compose logs postgres
   ```

4. **Run the initial migration:**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Verify the migration:**
   ```bash
   npx prisma studio
   ```
   
   This opens Prisma Studio in your browser where you can view the database schema.

### Option 2: Using External PostgreSQL

If you're using an external PostgreSQL instance (e.g., Supabase, Railway, Neon):

1. **Update the `.env` file with your database URL:**
   ```env
   DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
   ```

2. **Run the initial migration:**
   ```bash
   npx prisma migrate dev --name init
   ```

## Migration Commands

### Create a new migration
```bash
npx prisma migrate dev --name <migration_name>
```

### Apply pending migrations
```bash
npx prisma migrate deploy
```

### Reset the database (WARNING: Deletes all data)
```bash
npx prisma migrate reset
```

### Generate Prisma Client
```bash
npx prisma generate
```

### View database in Prisma Studio
```bash
npx prisma studio
```

## Database Schema

The initial migration creates the following tables:

### `users`
- User accounts with email authentication
- Supports OAuth providers (Google, GitHub)
- Tracks email verification status

### `accounts`
- OAuth provider account information
- Links users to external authentication providers
- Stores access tokens and refresh tokens

### `sessions`
- User session management
- JWT session tokens
- Session expiration tracking

### `verification_tokens`
- Email verification tokens
- Password reset tokens
- Token expiration management

### `projects`
- User UI projects
- Stores UIDocument JSON
- Tracks project metadata (name, description, thumbnail)
- Includes timestamps for creation and updates

## Troubleshooting

### Connection Issues

If you get a "Can't reach database server" error:

1. **Check if PostgreSQL is running:**
   ```bash
   docker-compose ps
   ```

2. **Restart the container:**
   ```bash
   docker-compose restart postgres
   ```

3. **Check container logs:**
   ```bash
   docker-compose logs postgres
   ```

### Migration Conflicts

If you encounter migration conflicts:

1. **Check migration status:**
   ```bash
   npx prisma migrate status
   ```

2. **Resolve conflicts manually or reset:**
   ```bash
   npx prisma migrate reset
   ```

### Permission Issues

If you get permission errors:

1. **Ensure the database user has proper permissions**
2. **Check the DATABASE_URL in your `.env` file**
3. **Verify the PostgreSQL user exists and has CREATE privileges**

## Production Deployment

For production environments:

1. **Use a managed PostgreSQL service** (e.g., AWS RDS, Google Cloud SQL, Supabase)

2. **Set the DATABASE_URL environment variable** in your deployment platform

3. **Run migrations during deployment:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Enable connection pooling** for better performance:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/db?schema=public&connection_limit=10&pool_timeout=20"
   ```

## Backup and Recovery

### Create a backup
```bash
docker exec ai_ui_builder_db pg_dump -U user ai_ui_builder > backup.sql
```

### Restore from backup
```bash
docker exec -i ai_ui_builder_db psql -U user ai_ui_builder < backup.sql
```

## Next Steps

After running the initial migration:

1. ✅ Database schema is created
2. ✅ Prisma Client is generated
3. ✅ Ready to implement authentication system (Task 3)
4. ✅ Ready to create API routes for project management (Task 8)

## References

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
