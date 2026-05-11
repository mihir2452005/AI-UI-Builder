# Vercel Deployment Guide - Complete Setup

This guide covers deploying your AI UI Builder to Vercel with all necessary configurations.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Vercel Account Setup](#vercel-account-setup)
3. [Project Deployment](#project-deployment)
4. [Environment Variables Configuration](#environment-variables-configuration)
5. [Database Setup (Production)](#database-setup-production)
6. [Vercel Blob Storage Setup](#vercel-blob-storage-setup)
7. [Domain Configuration](#domain-configuration)
8. [OAuth Callback URLs Update](#oauth-callback-urls-update)
9. [Testing Production Deployment](#testing-production-deployment)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying to Vercel, ensure you have:

- ✅ GitHub account with your project repository
- ✅ All code committed and pushed to GitHub
- ✅ Local development working (`npm run dev`)
- ✅ Database setup (we'll use Supabase for production)
- ✅ OAuth credentials (Google, GitHub)
- ✅ AI API key (OpenAI or Anthropic)
- ✅ Redis cache (Upstash)

---

## 1. Vercel Account Setup

### Step 1.1: Create Vercel Account

1. Go to **https://vercel.com/signup**
2. Click **"Continue with GitHub"** (recommended)
3. Authorize Vercel to access your GitHub account
4. Complete the signup process

### Step 1.2: Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

Then login:
```bash
vercel login
```

---

## 2. Project Deployment

### Step 2.1: Push Your Code to GitHub

If you haven't already:

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - AI UI Builder"

# Create GitHub repository and push
# Follow GitHub's instructions to create a new repository
git remote add origin https://github.com/yourusername/ai-ui-builder.git
git branch -M main
git push -u origin main
```

### Step 2.2: Import Project to Vercel

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to **https://vercel.com/dashboard**
2. Click **"Add New..."** → **"Project"**
3. Click **"Import"** next to your GitHub repository
4. If you don't see it, click **"Adjust GitHub App Permissions"**
5. Select your repository: `ai-ui-builder` (or whatever you named it)
6. Click **"Import"**

**Option B: Via Vercel CLI**

```bash
# In your project directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? [Your account]
# - Link to existing project? No
# - What's your project's name? ai-ui-builder
# - In which directory is your code located? ./
# - Want to override the settings? No
```

### Step 2.3: Configure Build Settings

Vercel should auto-detect Next.js. Verify these settings:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build` or `next build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Development Command:** `npm run dev`

Click **"Deploy"** (but it will fail without environment variables - that's expected!)

---

## 3. Environment Variables Configuration

### Step 3.1: Access Environment Variables

1. In your Vercel project dashboard
2. Go to **"Settings"** tab
3. Click **"Environment Variables"** in the left sidebar

### Step 3.2: Add All Environment Variables

Add each variable one by one. Click **"Add"** for each:

#### Database (Production)

**Variable:** `DATABASE_URL`  
**Value:** (We'll get this from Supabase - see Section 5)  
**Environments:** Production, Preview, Development

#### NextAuth Configuration

**Variable:** `NEXTAUTH_URL`  
**Value:** `https://your-project.vercel.app` (use your actual Vercel URL)  
**Environments:** Production

**Variable:** `NEXTAUTH_URL`  
**Value:** `https://your-project-git-branch.vercel.app`  
**Environments:** Preview

**Variable:** `NEXTAUTH_SECRET`  
**Value:** Generate a new one for production:
```bash
openssl rand -base64 32
```
**Environments:** Production, Preview, Development

#### Google OAuth

**Variable:** `GOOGLE_CLIENT_ID`  
**Value:** Your Google Client ID  
**Environments:** Production, Preview, Development

**Variable:** `GOOGLE_CLIENT_SECRET`  
**Value:** Your Google Client Secret  
**Environments:** Production, Preview, Development

#### GitHub OAuth

**Variable:** `GITHUB_CLIENT_ID`  
**Value:** Your GitHub Client ID  
**Environments:** Production, Preview, Development

**Variable:** `GITHUB_CLIENT_SECRET`  
**Value:** Your GitHub Client Secret  
**Environments:** Production, Preview, Development

#### AI Provider

**Variable:** `AI_PROVIDER`  
**Value:** `openai` or `anthropic`  
**Environments:** Production, Preview, Development

**Variable:** `OPENAI_API_KEY` (if using OpenAI)  
**Value:** Your OpenAI API key  
**Environments:** Production, Preview, Development

**Variable:** `ANTHROPIC_API_KEY` (if using Anthropic)  
**Value:** Your Anthropic API key  
**Environments:** Production, Preview, Development

#### Redis Cache

**Variable:** `REDIS_URL`  
**Value:** Your Upstash Redis URL  
**Environments:** Production, Preview, Development

**Variable:** `REDIS_TOKEN`  
**Value:** Your Upstash Redis token  
**Environments:** Production, Preview, Development

#### Vercel Blob Storage (Optional)

**Variable:** `BLOB_READ_WRITE_TOKEN`  
**Value:** (We'll get this in Section 6)  
**Environments:** Production, Preview, Development

---

## 4. Database Setup (Production)

### Option A: Supabase (Recommended)

#### Step 4.1: Create Supabase Project

1. Go to **https://supabase.com/dashboard**
2. Click **"New project"**
3. Fill in:
   - **Name:** `ai-ui-builder-prod`
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free (or Pro if needed)
4. Click **"Create new project"**
5. Wait for project to be created (~2 minutes)

#### Step 4.2: Get Connection String

1. In your Supabase project dashboard
2. Go to **"Settings"** → **"Database"**
3. Scroll to **"Connection string"**
4. Select **"Connection pooling"** tab
5. Mode: **"Transaction"**
6. Copy the connection string (URI format)
7. Replace `[YOUR-PASSWORD]` with your actual database password

Example:
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### Step 4.3: Add to Vercel

1. Go back to Vercel → Settings → Environment Variables
2. Add `DATABASE_URL` with your Supabase connection string
3. Select all environments (Production, Preview, Development)
4. Click **"Save"**

#### Step 4.4: Run Migrations on Production Database

**Option 1: Using Vercel CLI**

```bash
# Set production database URL temporarily
export DATABASE_URL="your-supabase-connection-string"

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

**Option 2: Using Prisma Studio**

```bash
# Connect to production database
DATABASE_URL="your-supabase-connection-string" npx prisma studio
```

**Option 3: Via Supabase SQL Editor**

1. Go to Supabase → SQL Editor
2. Copy the SQL from `prisma/migrations/[timestamp]_init/migration.sql`
3. Paste and run it

### Option B: Railway

#### Step 4.1: Create Railway Project

1. Go to **https://railway.app/**
2. Sign up with GitHub
3. Click **"New Project"**
4. Select **"Provision PostgreSQL"**
5. Wait for database to be created

#### Step 4.2: Get Connection String

1. Click on the PostgreSQL service
2. Go to **"Connect"** tab
3. Copy **"Postgres Connection URL"**

#### Step 4.3: Add to Vercel

Same as Supabase - add to Vercel environment variables

---

## 5. Vercel Blob Storage Setup

Vercel Blob is used for storing project thumbnails and user-uploaded assets.

### Step 5.1: Create Blob Storage

1. In your Vercel project dashboard
2. Go to **"Storage"** tab
3. Click **"Create Database"**
4. Select **"Blob"**
5. Name: `ai-ui-builder-assets`
6. Click **"Create"**

### Step 5.2: Get Token

1. After creation, you'll see the Blob storage
2. Go to **"Settings"** tab of the Blob storage
3. Copy the **"BLOB_READ_WRITE_TOKEN"**

### Step 5.3: Add to Environment Variables

The token should be automatically added to your environment variables. Verify:

1. Go to Settings → Environment Variables
2. Check if `BLOB_READ_WRITE_TOKEN` exists
3. If not, add it manually with the token you copied

---

## 6. Domain Configuration

### Step 6.1: Get Your Vercel URL

After deployment, you'll get a URL like:
```
https://ai-ui-builder-abc123.vercel.app
```

### Step 6.2: Add Custom Domain (Optional)

1. Go to **"Settings"** → **"Domains"**
2. Click **"Add"**
3. Enter your domain: `yourdomain.com`
4. Follow Vercel's instructions to:
   - Add DNS records to your domain registrar
   - Verify domain ownership
5. Wait for DNS propagation (~24 hours max, usually minutes)

### Step 6.3: Update NEXTAUTH_URL

1. Go to Settings → Environment Variables
2. Update `NEXTAUTH_URL` for Production:
   - If using Vercel URL: `https://ai-ui-builder-abc123.vercel.app`
   - If using custom domain: `https://yourdomain.com`
3. Click **"Save"**

---

## 7. OAuth Callback URLs Update

You need to update OAuth callback URLs for production.

### Step 7.1: Update Google OAuth

1. Go to **https://console.cloud.google.com/**
2. Select your project
3. Go to **"APIs & Services"** → **"Credentials"**
4. Click on your OAuth client
5. Add to **"Authorized JavaScript origins":**
   - `https://your-project.vercel.app`
   - `https://yourdomain.com` (if using custom domain)
6. Add to **"Authorized redirect URIs":**
   - `https://your-project.vercel.app/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (if using custom domain)
7. Click **"Save"**

### Step 7.2: Update GitHub OAuth

1. Go to **https://github.com/settings/developers**
2. Click on your OAuth App
3. Update **"Homepage URL":**
   - `https://your-project.vercel.app`
4. Update **"Authorization callback URL":**
   - `https://your-project.vercel.app/api/auth/callback/github`
5. Click **"Update application"**

### Step 7.3: Create Separate OAuth Apps for Production (Recommended)

For better security, create separate OAuth apps for production:

**Google:**
- Create a new OAuth client in Google Cloud Console
- Name it "AI UI Builder - Production"
- Use production URLs only
- Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel

**GitHub:**
- Create a new OAuth App in GitHub
- Name it "AI UI Builder - Production"
- Use production URLs only
- Update `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in Vercel

---

## 8. Redeploy with Environment Variables

### Step 8.1: Trigger Redeployment

After adding all environment variables:

**Option A: Via Dashboard**
1. Go to **"Deployments"** tab
2. Click on the latest deployment
3. Click **"..."** (three dots)
4. Click **"Redeploy"**
5. Check **"Use existing Build Cache"** (optional)
6. Click **"Redeploy"**

**Option B: Via Git Push**
```bash
# Make a small change (e.g., update README)
git add .
git commit -m "Trigger redeployment"
git push
```

**Option C: Via Vercel CLI**
```bash
vercel --prod
```

### Step 8.2: Monitor Deployment

1. Watch the build logs in real-time
2. Check for any errors
3. Wait for "Ready" status

---

## 9. Testing Production Deployment

### Step 9.1: Access Your Site

Visit your production URL:
```
https://your-project.vercel.app
```

### Step 9.2: Test Authentication

1. Go to `/auth/signin`
2. Test Google OAuth sign-in
3. Test GitHub OAuth sign-in
4. Test email/password registration
5. Test email/password sign-in

### Step 9.3: Check Database

1. Verify users are being created in Supabase
2. Go to Supabase → Table Editor → `users`
3. You should see your test user

### Step 9.4: Test Core Features

1. Create a new project
2. Test AI generation (if AI keys are configured)
3. Test project saving
4. Test sign-out

---

## 10. Vercel Configuration Files

### Step 10.1: Create vercel.json

Create a `vercel.json` file in your project root:

```json
{
  "buildCommand": "prisma generate && next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_URL": "@nextauth_url",
    "NEXTAUTH_SECRET": "@nextauth_secret"
  },
  "build": {
    "env": {
      "DATABASE_URL": "@database_url"
    }
  }
}
```

### Step 10.2: Update package.json Scripts

Add Vercel-specific scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

### Step 10.3: Create .vercelignore

Create a `.vercelignore` file:

```
node_modules
.next
.env
.env.local
*.log
.DS_Store
.vscode
.idea
coverage
.nyc_output
```

---

## 11. Monitoring and Analytics

### Step 11.1: Enable Vercel Analytics

1. Go to **"Analytics"** tab in your project
2. Click **"Enable Analytics"**
3. Install the package:
   ```bash
   npm install @vercel/analytics
   ```

4. Add to your root layout (`app/layout.tsx`):
   ```typescript
   import { Analytics } from '@vercel/analytics/react';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

### Step 11.2: Enable Speed Insights

1. Go to **"Speed Insights"** tab
2. Click **"Enable Speed Insights"**
3. Install the package:
   ```bash
   npm install @vercel/speed-insights
   ```

4. Add to your root layout:
   ```typescript
   import { SpeedInsights } from '@vercel/speed-insights/next';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <SpeedInsights />
         </body>
       </html>
     );
   }
   ```

---

## 12. Troubleshooting

### Build Failures

**Error: "Prisma Client not generated"**

**Solution:** Update build command:
```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

**Error: "Cannot find module '@prisma/client'"**

**Solution:** Add postinstall script:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Database Connection Issues

**Error: "Can't reach database server"**

**Solution:**
1. Check DATABASE_URL is correct
2. Verify Supabase project is running
3. Check connection pooling is enabled
4. Try direct connection string instead of pooled

**Error: "SSL connection required"**

**Solution:** Add `?sslmode=require` to DATABASE_URL:
```
postgresql://user:pass@host:5432/db?sslmode=require
```

### Authentication Issues

**Error: "redirect_uri_mismatch"**

**Solution:**
1. Update OAuth callback URLs in Google/GitHub
2. Make sure they match your production URL exactly
3. Include `/api/auth/callback/google` or `/api/auth/callback/github`

**Error: "NEXTAUTH_URL is not set"**

**Solution:**
1. Add NEXTAUTH_URL to Vercel environment variables
2. Set to your production URL
3. Redeploy

### Environment Variable Issues

**Error: "Environment variable not found"**

**Solution:**
1. Go to Settings → Environment Variables
2. Verify all required variables are set
3. Check they're enabled for the right environments
4. Redeploy after adding variables

---

## 13. Production Checklist

### Pre-Deployment
- [ ] All code committed and pushed to GitHub
- [ ] Local development working
- [ ] All tests passing
- [ ] Environment variables documented
- [ ] Database migrations ready

### Vercel Setup
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Build settings configured
- [ ] All environment variables added
- [ ] Production database created (Supabase/Railway)
- [ ] Database migrations run on production
- [ ] Vercel Blob storage created (optional)

### OAuth Configuration
- [ ] Google OAuth production URLs added
- [ ] GitHub OAuth production URLs added
- [ ] Separate production OAuth apps created (recommended)
- [ ] OAuth credentials added to Vercel

### Domain & SSL
- [ ] Custom domain added (optional)
- [ ] DNS records configured
- [ ] SSL certificate active
- [ ] NEXTAUTH_URL updated

### Testing
- [ ] Production site accessible
- [ ] Google OAuth sign-in works
- [ ] GitHub OAuth sign-in works
- [ ] Email/password registration works
- [ ] Email/password sign-in works
- [ ] Database records created
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance acceptable

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Speed Insights enabled
- [ ] Error tracking configured
- [ ] Logs monitored

---

## 14. Cost Estimation

### Vercel
- **Hobby Plan:** Free
  - 100 GB bandwidth
  - Unlimited deployments
  - Automatic HTTPS
  - Perfect for development/testing

- **Pro Plan:** $20/month
  - 1 TB bandwidth
  - Advanced analytics
  - Team collaboration
  - Recommended for production

### Supabase
- **Free Plan:** $0/month
  - 500 MB database
  - 1 GB file storage
  - 2 GB bandwidth
  - Good for MVP

- **Pro Plan:** $25/month
  - 8 GB database
  - 100 GB file storage
  - 250 GB bandwidth
  - Daily backups

### Total Estimated Cost
- **Development:** $0/month (all free tiers)
- **Production (Small):** $20-45/month
- **Production (Medium):** $45-100/month

---

## 15. Next Steps After Deployment

1. **Monitor Performance**
   - Check Vercel Analytics
   - Monitor Speed Insights
   - Review error logs

2. **Set Up CI/CD**
   - Automatic deployments on push
   - Preview deployments for PRs
   - Automated testing

3. **Configure Backups**
   - Database backups (Supabase handles this)
   - Code backups (GitHub)
   - Environment variable backups

4. **Security Hardening**
   - Enable 2FA on Vercel
   - Rotate secrets regularly
   - Review access logs
   - Set up rate limiting

5. **Performance Optimization**
   - Enable caching
   - Optimize images
   - Minimize bundle size
   - Use CDN for assets

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)

---

**Deployment Time:** ~30-45 minutes  
**Difficulty:** Medium  
**Prerequisites:** Working local development

Good luck with your deployment! 🚀
