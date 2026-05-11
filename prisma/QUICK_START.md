# Database Quick Start Guide

## 🚀 Get Started in 30 Seconds

```bash
npm run db:setup
```

That's it! This command will:
- ✅ Start PostgreSQL in Docker
- ✅ Create database schema
- ✅ Run migrations
- ✅ Generate Prisma Client

---

## 📋 Common Commands

### Setup & Migration
```bash
npm run db:setup          # First-time setup (automated)
npm run db:migrate        # Create new migration
npm run db:generate       # Regenerate Prisma Client
```

### Development
```bash
npm run db:studio         # Open database GUI
docker-compose logs postgres  # View database logs
docker-compose ps         # Check container status
```

### Maintenance
```bash
docker-compose restart postgres  # Restart database
docker-compose down       # Stop database
docker-compose up -d      # Start database
npm run db:reset          # Reset database (⚠️ deletes data)
```

---

## 🔧 Manual Setup (Alternative)

If you prefer step-by-step control:

```bash
# 1. Start PostgreSQL
docker-compose up -d

# 2. Wait for startup (5 seconds)
sleep 5

# 3. Run migration
npx prisma migrate dev --name init

# 4. Generate client
npx prisma generate

# 5. Verify
npx prisma studio
```

---

## 🌐 Using External Database

Using Supabase, Railway, Neon, or other cloud database?

```bash
# 1. Update .env with your database URL
DATABASE_URL="postgresql://user:pass@host:port/db"

# 2. Run migration
npx prisma migrate dev --name init

# 3. Generate client
npx prisma generate
```

---

## ✅ Verify Setup

### Check if database is running:
```bash
docker-compose ps
```

Expected output:
```
NAME                  STATUS
ai_ui_builder_db      Up (healthy)
```

### Open database GUI:
```bash
npm run db:studio
```

You should see 5 tables:
- ✅ users
- ✅ accounts
- ✅ sessions
- ✅ verification_tokens
- ✅ projects

---

## 🐛 Troubleshooting

### "Can't reach database server"
```bash
docker-compose restart postgres
docker-compose logs postgres
```

### "Port 5432 already in use"
```bash
# Check what's using the port
lsof -i :5432  # macOS/Linux
netstat -ano | findstr :5432  # Windows

# Stop other PostgreSQL or change port in docker-compose.yml
```

### "Migration already exists"
```bash
npx prisma migrate status
npx prisma migrate reset  # ⚠️ Deletes all data
```

---

## 📚 More Information

- **Full Guide**: See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- **Status**: See [MIGRATION_STATUS.md](./MIGRATION_STATUS.md)
- **Schema**: See [schema.prisma](./schema.prisma)
- **Usage Examples**: See [../lib/db/USAGE.md](../lib/db/USAGE.md)

---

## 🎯 Next Steps

After database setup:

1. ✅ Database is ready
2. ➡️ Run `npm run dev` to start the app
3. ➡️ Implement authentication (Task 3)
4. ➡️ Create API routes (Task 8)

---

## 💡 Pro Tips

- Use `npm run db:studio` to visually explore your database
- Run `npm run db:migrate` after changing `schema.prisma`
- Always run `npm run db:generate` after migrations
- Use Docker for local dev, managed services for production
- Keep your `.env` file secure and never commit it

---

**Need help?** Check the full [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed instructions.
