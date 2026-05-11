# Quick Start Guide

Get your AI UI Builder up and running in 15 minutes!

## 🚀 Fast Track Setup

### 1. Install Dependencies (1 min)
```bash
npm install
```

### 2. Set Up Database (5 min)

**Option A: Supabase (Recommended - Easiest)**
1. Go to https://supabase.com → Sign up
2. Create new project
3. Copy connection string from Settings → Database
4. Paste into `.env` as `DATABASE_URL`

**Option B: Local PostgreSQL**
```bash
# Install PostgreSQL, then:
psql -U postgres
CREATE DATABASE ai_ui_builder;
\q
```
Update `.env`:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/ai_ui_builder?schema=public"
```

### 3. Generate NextAuth Secret (30 sec)
```bash
# Run this command:
openssl rand -base64 32

# Or use Node:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Copy output to `.env` as `NEXTAUTH_SECRET`

### 4. Set Up Google OAuth (3 min)
1. Go to https://console.cloud.google.com/
2. Create project → Enable Google+ API
3. Create OAuth credentials
4. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret to `.env`

### 5. Set Up GitHub OAuth (2 min)
1. Go to https://github.com/settings/developers
2. New OAuth App
3. Callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env`

### 6. Choose AI Provider (2 min)

**OpenAI (Recommended):**
1. Go to https://platform.openai.com/api-keys
2. Create API key
3. Add to `.env`:
```env
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-proj-..."
```

**OR Anthropic:**
1. Go to https://console.anthropic.com/settings/keys
2. Create API key
3. Add to `.env`:
```env
AI_PROVIDER="anthropic"
ANTHROPIC_API_KEY="sk-ant-..."
```

### 7. Set Up Redis Cache (2 min)
1. Go to https://upstash.com/ → Sign up
2. Create Redis database
3. Copy REST URL and Token to `.env`:
```env
REDIS_URL="https://..."
REDIS_TOKEN="..."
```

### 8. Run Migrations (1 min)
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 9. Start Development Server (30 sec)
```bash
npm run dev
```

### 10. Test It! (1 min)
1. Open http://localhost:3000/auth/signin
2. Try signing in with Google or GitHub
3. Try creating an account with email/password

---

## 📋 Your .env File Should Look Like This:

```env
# Database
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="Xk9vL2mN8pQ4rS6tU0wY3zA5bC7dE1fG"

# Google OAuth
GOOGLE_CLIENT_ID="123456789-abc.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abc123"

# GitHub OAuth
GITHUB_CLIENT_ID="Iv1.abc123"
GITHUB_CLIENT_SECRET="abc123xyz789"

# AI Provider (choose one)
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-proj-abc123..."

# Redis Cache
REDIS_URL="https://us1-abc123.upstash.io"
REDIS_TOKEN="AYABCDEFabc123"

# Optional (can skip for now)
# BLOB_READ_WRITE_TOKEN="vercel_blob_rw_abc123"
```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] `npm run dev` starts without errors
- [ ] Can access http://localhost:3000/auth/signin
- [ ] Google sign-in button works
- [ ] GitHub sign-in button works
- [ ] Can create account with email/password
- [ ] Can sign in with email/password
- [ ] No errors in browser console (F12)
- [ ] No errors in terminal

---

## 🆘 Quick Troubleshooting

**"Can't reach database server"**
→ Check DATABASE_URL is correct and database is running

**"redirect_uri_mismatch"**
→ Verify OAuth callback URLs match exactly in Google/GitHub settings

**"NEXTAUTH_SECRET is not set"**
→ Restart dev server after adding to .env

**"Invalid API key"**
→ Check AI provider key is correct and billing is set up

**Still stuck?**
→ See ENV_SETUP_GUIDE.md for detailed troubleshooting

---

## 🎯 What's Next?

Once authentication works:

1. **Explore the codebase**
   - Check out `app/auth/` for UI pages
   - Look at `lib/auth/` for authentication logic
   - Review `prisma/schema.prisma` for database models

2. **Continue development**
   - Next task: Implement protected route middleware
   - Then: Build core type definitions
   - Then: Set up state management

3. **Read the docs**
   - IMPLEMENTATION_STATUS.md - See what's done
   - ENV_SETUP_GUIDE.md - Detailed setup guide
   - Task-specific READMEs in each directory

---

## 💡 Pro Tips

1. **Use Supabase for database** - Easiest setup, free tier is generous
2. **Start with OpenAI** - More documentation and examples available
3. **Test OAuth in incognito** - Avoids cached credentials
4. **Keep .env.example updated** - Template for team members
5. **Use Prisma Studio** - Visual database browser (`npx prisma studio`)

---

## 🔗 Quick Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Google Cloud Console](https://console.cloud.google.com/)
- [GitHub OAuth Apps](https://github.com/settings/developers)
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Upstash Dashboard](https://console.upstash.com/)
- [Prisma Studio](http://localhost:5555) (after running `npx prisma studio`)

---

**Time to complete:** ~15 minutes  
**Difficulty:** Easy  
**Prerequisites:** Node.js 18+, npm, Git

Ready to build something amazing! 🚀
