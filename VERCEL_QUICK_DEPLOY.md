# Vercel Quick Deploy Guide

## 🚀 Deploy in 15 Minutes

### Prerequisites
- ✅ Code on GitHub
- ✅ Local development working
- ✅ OAuth credentials ready
- ✅ AI API key ready

---

## Step 1: Create Vercel Account (2 min)

1. Go to https://vercel.com/signup
2. Click "Continue with GitHub"
3. Authorize Vercel

---

## Step 2: Import Project (1 min)

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Click "Import" next to your repository
4. Click "Deploy" (will fail - that's OK!)

---

## Step 3: Set Up Production Database (5 min)

### Supabase (Recommended)

1. Go to https://supabase.com/dashboard
2. Click "New project"
3. Fill in:
   - Name: `ai-ui-builder-prod`
   - Password: [generate strong password]
   - Region: [closest to you]
4. Click "Create"
5. Wait ~2 minutes
6. Go to Settings → Database
7. Copy "Connection pooling" URI (Transaction mode)
8. Replace `[YOUR-PASSWORD]` with your password

---

## Step 4: Add Environment Variables (5 min)

In Vercel → Settings → Environment Variables, add:

```env
# Database
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# NextAuth
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=[generate with: openssl rand -base64 32]

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# AI Provider
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...

# Redis
REDIS_URL=https://...upstash.io
REDIS_TOKEN=...
```

Select "Production, Preview, Development" for all.

---

## Step 5: Run Database Migrations (2 min)

```bash
# Set production database URL
export DATABASE_URL="your-supabase-connection-string"

# Run migrations
npx prisma migrate deploy
```

---

## Step 6: Update OAuth Callbacks (3 min)

### Google
1. Go to https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Click your OAuth client
4. Add redirect URI: `https://your-project.vercel.app/api/auth/callback/google`
5. Save

### GitHub
1. Go to https://github.com/settings/developers
2. Click your OAuth App
3. Update callback URL: `https://your-project.vercel.app/api/auth/callback/github`
4. Save

---

## Step 7: Redeploy (1 min)

1. Go to Vercel → Deployments
2. Click latest deployment
3. Click "..." → "Redeploy"
4. Wait for deployment

---

## Step 8: Test (2 min)

1. Visit `https://your-project.vercel.app`
2. Go to `/auth/signin`
3. Test Google sign-in ✅
4. Test GitHub sign-in ✅
5. Test email/password ✅

---

## ✅ Done!

Your app is live at: `https://your-project.vercel.app`

---

## 🔧 Quick Fixes

### Build Failed?
→ Add to `package.json`:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

### OAuth Not Working?
→ Check callback URLs match exactly

### Database Connection Failed?
→ Verify DATABASE_URL is correct

---

## 📊 What You Get

- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments on push
- ✅ Preview deployments for PRs
- ✅ Analytics
- ✅ 99.99% uptime

---

## 💰 Cost

**Free Tier:**
- Vercel: Free (Hobby plan)
- Supabase: Free (500MB database)
- Total: $0/month

**Production:**
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Total: $45/month

---

## 🆘 Need Help?

See **VERCEL_DEPLOYMENT_GUIDE.md** for detailed instructions.

---

**Time:** 15 minutes  
**Difficulty:** Easy  
**Result:** Production-ready app! 🎉
