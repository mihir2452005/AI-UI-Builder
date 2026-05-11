# Environment Variables Setup Guide

This guide will walk you through setting up all required environment variables for the AI-Powered UI Builder SaaS platform.

## 📋 Table of Contents

1. [Database Setup (PostgreSQL)](#1-database-setup-postgresql)
2. [NextAuth Configuration](#2-nextauth-configuration)
3. [Google OAuth Setup](#3-google-oauth-setup)
4. [GitHub OAuth Setup](#4-github-oauth-setup)
5. [AI Provider Setup](#5-ai-provider-setup)
6. [Redis Cache Setup (Upstash)](#6-redis-cache-setup-upstash)
7. [Vercel Blob Storage (Optional)](#7-vercel-blob-storage-optional)
8. [Final .env File Example](#8-final-env-file-example)
9. [Verification Steps](#9-verification-steps)

---

## 1. Database Setup (PostgreSQL)

### Option A: Local PostgreSQL (Development)

**Step 1:** Install PostgreSQL
```bash
# Windows (using Chocolatey)
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/
```

**Step 2:** Create Database
```bash
# Open PowerShell and connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ai_ui_builder;

# Create user (optional)
CREATE USER aibuilder WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ai_ui_builder TO aibuilder;

# Exit
\q
```

**Step 3:** Update DATABASE_URL
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/ai_ui_builder?schema=public"
```

### Option B: Supabase (Recommended for Production)

**Step 1:** Create Supabase Account
- Go to https://supabase.com
- Sign up for free account
- Create new project

**Step 2:** Get Connection String
- Go to Project Settings → Database
- Copy the "Connection string" under "Connection pooling"
- Mode: Transaction
- Copy the URI format

**Step 3:** Update DATABASE_URL
```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### Option C: Railway

**Step 1:** Create Railway Account
- Go to https://railway.app
- Sign up with GitHub
- Create new project → Add PostgreSQL

**Step 2:** Get Connection String
- Click on PostgreSQL service
- Go to "Connect" tab
- Copy "Postgres Connection URL"

**Step 3:** Update DATABASE_URL
```env
DATABASE_URL="postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway"
```

---

## 2. NextAuth Configuration

### NEXTAUTH_URL

**Development:**
```env
NEXTAUTH_URL="http://localhost:3000"
```

**Production:**
```env
NEXTAUTH_URL="https://yourdomain.com"
```

### NEXTAUTH_SECRET

**Generate a secure secret:**

**Option 1: Using OpenSSL (Recommended)**
```bash
# In PowerShell or Git Bash
openssl rand -base64 32
```

**Option 2: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option 3: Online Generator**
- Go to https://generate-secret.vercel.app/32
- Copy the generated secret

**Update .env:**
```env
NEXTAUTH_SECRET="your-generated-secret-here-abc123xyz789"
```

⚠️ **Important:** Never commit this secret to version control!

---

## 3. Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "AI UI Builder"
4. Click "Create"

### Step 2: Enable Google+ API

1. In the left sidebar, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" (for testing) or "Internal" (for organization)
3. Click "Create"
4. Fill in required fields:
   - **App name:** AI UI Builder
   - **User support email:** your-email@example.com
   - **Developer contact:** your-email@example.com
5. Click "Save and Continue"
6. Skip "Scopes" (click "Save and Continue")
7. Add test users (your email) if using External
8. Click "Save and Continue"

### Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Configure:
   - **Name:** AI UI Builder Web Client
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)
5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

### Step 5: Update .env

```env
GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklmnopqrstuvwxyz"
```

---

## 4. GitHub OAuth Setup

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in the form:
   - **Application name:** AI UI Builder
   - **Homepage URL:** `http://localhost:3000` (dev) or `https://yourdomain.com` (prod)
   - **Application description:** AI-powered UI builder for students and developers
   - **Authorization callback URL:** 
     - Development: `http://localhost:3000/api/auth/callback/github`
     - Production: `https://yourdomain.com/api/auth/callback/github`
4. Click "Register application"

### Step 2: Generate Client Secret

1. On the OAuth app page, click "Generate a new client secret"
2. Copy the **Client ID** (shown at top)
3. Copy the **Client Secret** (shown once - save it now!)

### Step 3: Update .env

```env
GITHUB_CLIENT_ID="Iv1.a1b2c3d4e5f6g7h8"
GITHUB_CLIENT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
```

---

## 5. AI Provider Setup

You need to choose **ONE** AI provider. The platform will use this for all users.

### Option A: OpenAI (Recommended)

**Step 1: Create OpenAI Account**
1. Go to https://platform.openai.com/signup
2. Sign up for an account
3. Add payment method (required for API access)

**Step 2: Create API Key**
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name it: "AI UI Builder"
4. Copy the key (starts with `sk-`)

**Step 3: Update .env**
```env
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-proj-abc123xyz789..."
# Leave ANTHROPIC_API_KEY empty or remove it
```

**Pricing:** ~$0.01-0.03 per UI generation (GPT-4)

### Option B: Anthropic (Claude)

**Step 1: Create Anthropic Account**
1. Go to https://console.anthropic.com/
2. Sign up for an account
3. Add payment method

**Step 2: Create API Key**
1. Go to https://console.anthropic.com/settings/keys
2. Click "Create Key"
3. Name it: "AI UI Builder"
4. Copy the key (starts with `sk-ant-`)

**Step 3: Update .env**
```env
AI_PROVIDER="anthropic"
ANTHROPIC_API_KEY="sk-ant-api03-abc123xyz789..."
# Leave OPENAI_API_KEY empty or remove it
```

**Pricing:** ~$0.015-0.075 per UI generation (Claude 3 Sonnet)

---

## 6. Redis Cache Setup (Upstash)

Redis is used for prompt caching and rate limiting.

### Step 1: Create Upstash Account

1. Go to https://upstash.com/
2. Sign up with GitHub or email
3. Verify your email

### Step 2: Create Redis Database

1. Click "Create Database"
2. Configure:
   - **Name:** ai-ui-builder-cache
   - **Type:** Regional (cheaper) or Global (faster)
   - **Region:** Choose closest to your users
   - **Eviction:** allkeys-lru (recommended)
3. Click "Create"

### Step 3: Get Connection Details

1. On the database page, click "REST API" tab
2. Copy:
   - **UPSTASH_REDIS_REST_URL** (this is your REDIS_URL)
   - **UPSTASH_REDIS_REST_TOKEN** (this is your REDIS_TOKEN)

### Step 4: Update .env

```env
REDIS_URL="https://us1-abc123.upstash.io"
REDIS_TOKEN="AYABCDEFabcdef123456789xyz"
```

**Free Tier:** 10,000 commands/day (sufficient for development)

---

## 7. Vercel Blob Storage (Optional)

Used for storing project thumbnails and user-uploaded assets.

### Step 1: Create Vercel Account

1. Go to https://vercel.com/signup
2. Sign up with GitHub
3. Create a new project (or use existing)

### Step 2: Enable Blob Storage

1. Go to your project dashboard
2. Click "Storage" tab
3. Click "Create Database" → "Blob"
4. Name it: "ai-ui-builder-assets"
5. Click "Create"

### Step 3: Get Token

1. On the Blob storage page, go to "Settings"
2. Copy the **BLOB_READ_WRITE_TOKEN**

### Step 4: Update .env

```env
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_abc123xyz789"
```

**Alternative:** You can skip this for now and use local file storage during development.

---

## 8. Final .env File Example

Here's what your complete `.env` file should look like:

```env
# Database (Choose one option)
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/ai_ui_builder?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="Xk9vL2mN8pQ4rS6tU0wY3zA5bC7dE1fG"

# OAuth Providers
GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklmnopqrstuvwxyz"
GITHUB_CLIENT_ID="Iv1.a1b2c3d4e5f6g7h8"
GITHUB_CLIENT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"

# AI Services (Choose ONE provider)
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-proj-abc123xyz789..."
# ANTHROPIC_API_KEY=""  # Leave empty if using OpenAI

# Redis Cache (Upstash)
REDIS_URL="https://us1-abc123.upstash.io"
REDIS_TOKEN="AYABCDEFabcdef123456789xyz"

# Vercel Blob Storage (Optional - can skip for development)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_abc123xyz789"
```

---

## 9. Verification Steps

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Generate Prisma Client

```bash
npx prisma generate
```

### Step 3: Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### Step 4: Test Database Connection

```bash
npx prisma studio
```

This should open Prisma Studio at http://localhost:5555

### Step 5: Start Development Server

```bash
npm run dev
```

### Step 6: Test Authentication

1. Open http://localhost:3000/auth/signin
2. Try signing in with Google
3. Try signing in with GitHub
4. Try creating an account with email/password

### Step 7: Check for Errors

Look for any error messages in:
- Browser console (F12)
- Terminal where `npm run dev` is running

---

## 🔧 Troubleshooting

### Database Connection Issues

**Error:** "Can't reach database server"
```bash
# Check if PostgreSQL is running
# Windows:
Get-Service -Name postgresql*

# Start if not running:
Start-Service postgresql-x64-14
```

**Error:** "Authentication failed"
- Double-check username and password in DATABASE_URL
- Ensure user has proper permissions

### OAuth Issues

**Error:** "redirect_uri_mismatch"
- Verify callback URLs in Google/GitHub settings match exactly
- Include `/api/auth/callback/google` or `/api/auth/callback/github`
- Check for http vs https

**Error:** "Access blocked: This app's request is invalid"
- Complete OAuth consent screen configuration
- Add your email as a test user (for External apps)

### NextAuth Issues

**Error:** "NEXTAUTH_SECRET is not set"
- Ensure NEXTAUTH_SECRET is in .env file
- Restart development server after adding

**Error:** "NEXTAUTH_URL is not set"
- Add NEXTAUTH_URL to .env
- Must match your actual URL (http://localhost:3000 for dev)

### AI Provider Issues

**Error:** "Invalid API key"
- Verify API key is correct and active
- Check for extra spaces or quotes
- Ensure billing is set up (OpenAI/Anthropic require payment method)

**Error:** "Rate limit exceeded"
- You've hit API limits
- Wait or upgrade your plan

### Redis Issues

**Error:** "Connection refused"
- Verify REDIS_URL and REDIS_TOKEN are correct
- Check Upstash dashboard for database status

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Upstash Documentation](https://docs.upstash.com/)

---

## 🔒 Security Best Practices

1. **Never commit .env to version control**
   - Already in .gitignore
   - Use .env.example for templates

2. **Use strong secrets**
   - Generate NEXTAUTH_SECRET with cryptographic tools
   - Don't use simple passwords

3. **Rotate API keys regularly**
   - Especially if exposed or compromised
   - Set up key rotation schedule

4. **Use environment-specific values**
   - Different keys for dev/staging/production
   - Never use production keys in development

5. **Limit OAuth app permissions**
   - Only request necessary scopes
   - Review permissions regularly

---

## ✅ Quick Setup Checklist

- [ ] PostgreSQL database created and accessible
- [ ] DATABASE_URL configured and tested
- [ ] NEXTAUTH_SECRET generated (32+ characters)
- [ ] NEXTAUTH_URL set correctly
- [ ] Google OAuth app created and credentials added
- [ ] GitHub OAuth app created and credentials added
- [ ] AI provider chosen (OpenAI or Anthropic)
- [ ] AI API key obtained and added
- [ ] Upstash Redis database created
- [ ] Redis URL and token added
- [ ] (Optional) Vercel Blob storage configured
- [ ] Dependencies installed (`npm install`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Database migrated (`npx prisma migrate dev`)
- [ ] Development server starts without errors
- [ ] Can access sign-in page
- [ ] OAuth sign-in works
- [ ] Email/password registration works

---

**Need Help?** If you encounter issues not covered here, check:
1. Terminal error messages
2. Browser console (F12)
3. Project documentation in `/docs`
4. Create an issue on GitHub

Good luck with your AI UI Builder setup! 🚀
