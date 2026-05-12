# Deploy to Production - Complete Guide

**Production URL**: https://ai-ui-builder-one.vercel.app/

---

## 🚀 Quick Deploy (3 Commands)

```bash
# 1. Commit all changes
git add .
git commit -m "Production deployment with fixes and health check"

# 2. Push to trigger deployment
git push origin main

# 3. Check health endpoint
curl https://ai-ui-builder-one.vercel.app/api/health
```

---

## ✅ Pre-Deployment Checklist

### Code Ready
- [x] All bug fixes applied
- [x] OpenAI model changed to gpt-4o-mini
- [x] Better error messages added
- [x] Health check endpoint created
- [x] Test AI page exists
- [x] All tests passing (69/69)
- [x] No TypeScript errors

### Files to Deploy
- [x] `lib/ai/models/openai-model.ts` (fixed model)
- [x] `lib/ai/models/index.ts` (fixed model)
- [x] `app/api/health/route.ts` (new health check)
- [x] `app/test-ai/page.tsx` (AI test page)
- [x] `app/api/test-ai/route.ts` (AI test API)
- [x] All documentation files

---

## 📋 Vercel Configuration

### Step 1: Environment Variables

Go to: https://vercel.com/your-project/settings/environment-variables

**Required Variables:**

```bash
# NextAuth (CRITICAL)
NEXTAUTH_URL=https://ai-ui-builder-one.vercel.app
NEXTAUTH_SECRET=<generate-new-secret>

# Database (CRITICAL)
DATABASE_URL=<your-production-database-url>

# AI Provider (CRITICAL)
AI_PROVIDER=openai
OPENAI_API_KEY=<your-openai-api-key>

# Google OAuth (REQUIRED for Google sign-in)
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# GitHub OAuth (REQUIRED for GitHub sign-in)
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>

# Redis Cache (OPTIONAL but recommended)
REDIS_URL=<your-redis-url>
REDIS_TOKEN=<your-redis-token>
```

**Generate NEXTAUTH_SECRET:**
```bash
# Run this command and copy the output
openssl rand -base64 32
```

### Step 2: Build Configuration

**Build Command:**
```bash
prisma generate && prisma migrate deploy && next build
```

**Install Command:**
```bash
npm install
```

**Output Directory:**
```
.next
```

---

## 🔐 OAuth Configuration

### Google OAuth

1. **Go to Google Cloud Console**
   - URL: https://console.cloud.google.com/
   - Select your project

2. **Navigate to Credentials**
   - APIs & Services → Credentials
   - Click on your OAuth 2.0 Client ID

3. **Add Production Redirect URI**
   ```
   https://ai-ui-builder-one.vercel.app/api/auth/callback/google
   ```

4. **Keep Development URI Too**
   ```
   http://localhost:3000/api/auth/callback/google
   ```

5. **Save Changes**

### GitHub OAuth

1. **Go to GitHub Developer Settings**
   - URL: https://github.com/settings/developers
   - Click on your OAuth App

2. **Update Callback URL**
   ```
   https://ai-ui-builder-one.vercel.app/api/auth/callback/github
   ```

3. **Save Changes**

**Note**: You can only have ONE callback URL for GitHub. For development, you'll need to change it back or create a separate OAuth app.

---

## 🗄️ Database Setup

### Option 1: Vercel Postgres (Easiest)

1. Go to Vercel dashboard
2. Select your project
3. Click "Storage" tab
4. Click "Create Database"
5. Select "Postgres"
6. Database URL will be automatically added to environment variables

### Option 2: External Database

**Recommended Providers:**
- Supabase (Free tier available)
- Railway (Free tier available)
- Neon (Serverless Postgres)
- PlanetScale (MySQL alternative)

**Setup:**
1. Create database
2. Get connection URL
3. Add to Vercel environment variables as `DATABASE_URL`
4. Apply migrations:
   ```bash
   npx prisma migrate deploy
   ```

---

## 🚀 Deployment Process

### Step 1: Commit Changes

```bash
# Check what's changed
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Production deployment: Bug fixes, health check, and AI test page"
```

### Step 2: Push to Deploy

```bash
# Push to main branch (triggers Vercel deployment)
git push origin main
```

### Step 3: Monitor Deployment

1. **Watch Vercel Dashboard**
   - Go to: https://vercel.com/your-project/deployments
   - Watch build progress
   - Check for errors

2. **Or Use Vercel CLI**
   ```bash
   # Install Vercel CLI if not installed
   npm i -g vercel

   # Watch deployment
   vercel --prod
   ```

### Step 4: Verify Deployment

```bash
# Check health endpoint
curl https://ai-ui-builder-one.vercel.app/api/health

# Should return JSON with health status
```

---

## 🧪 Post-Deployment Testing

### Test 1: Health Check

**URL**: https://ai-ui-builder-one.vercel.app/api/health

**Expected Response:**
```json
{
  "status": "ok",
  "health": {
    "percentage": 100,
    "status": "healthy"
  },
  "checks": {
    "nextAuth": {
      "hasUrl": true,
      "hasSecret": true
    },
    "database": {
      "hasUrl": true
    },
    "ai": {
      "provider": "openai",
      "hasOpenAIKey": true
    },
    "oauth": {
      "hasGoogleClientId": true,
      "hasGoogleClientSecret": true,
      "hasGitHubClientId": true,
      "hasGitHubClientSecret": true
    }
  }
}
```

**If health < 100%:**
- Check which variables are missing
- Add them in Vercel dashboard
- Redeploy

---

### Test 2: Pages Load

Visit each page:

1. **Home**: https://ai-ui-builder-one.vercel.app/
   - ✅ Should load without errors

2. **Sign In**: https://ai-ui-builder-one.vercel.app/auth/signin
   - ✅ Should show sign-in form
   - ✅ OAuth buttons visible

3. **Sign Up**: https://ai-ui-builder-one.vercel.app/auth/signup
   - ✅ Should show sign-up form
   - ✅ OAuth buttons visible

4. **Test AI**: https://ai-ui-builder-one.vercel.app/test-ai
   - ✅ Should load (not 404)
   - ✅ Form visible

---

### Test 3: User Registration

1. Visit: https://ai-ui-builder-one.vercel.app/auth/signup
2. Fill form:
   - Name: "Production Test"
   - Email: "prod-test@example.com"
   - Password: "testpass123"
3. Submit

**Expected:**
- ✅ Account created
- ✅ Redirected to dashboard
- ✅ No errors

**If Fails:**
- Check Vercel function logs
- Verify DATABASE_URL
- Check database is accessible

---

### Test 4: User Sign In

1. Visit: https://ai-ui-builder-one.vercel.app/auth/signin
2. Enter credentials from Test 3
3. Submit

**Expected:**
- ✅ Successfully signed in
- ✅ Redirected to dashboard
- ✅ Session created

---

### Test 5: Google OAuth

1. Visit: https://ai-ui-builder-one.vercel.app/auth/signin
2. Click "Continue with Google"
3. Authorize

**Expected:**
- ✅ Redirected to Google
- ✅ Authorized successfully
- ✅ Redirected back to app
- ✅ Signed in

**If "redirect_uri_mismatch":**
- Check redirect URI in Google Console
- Must be exact: `https://ai-ui-builder-one.vercel.app/api/auth/callback/google`
- Wait 1-2 minutes after saving

---

### Test 6: GitHub OAuth

1. Visit: https://ai-ui-builder-one.vercel.app/auth/signin
2. Click "Continue with GitHub"
3. Authorize

**Expected:**
- ✅ Redirected to GitHub
- ✅ Authorized successfully
- ✅ Redirected back to app
- ✅ Signed in

---

### Test 7: AI Engine

1. Sign in first (any method)
2. Visit: https://ai-ui-builder-one.vercel.app/test-ai
3. Enter prompt: "Create a simple button"
4. Click "Test AI Engine"

**Expected:**
- ✅ UI generated successfully
- ✅ No errors
- ✅ Valid JSON returned
- ✅ Generation time displayed

**If Fails:**
- Check OPENAI_API_KEY is set
- Verify API key is valid
- Check Vercel function logs
- Try different prompt

---

## 🐛 Troubleshooting

### Build Fails

**Check:**
1. Build logs in Vercel dashboard
2. TypeScript errors
3. Missing dependencies

**Solution:**
```bash
# Test build locally
npm run build

# If successful, push again
git push origin main
```

---

### Runtime Errors

**Check:**
1. Function logs in Vercel dashboard
2. Environment variables
3. Database connection

**Solution:**
- Review error message
- Check corresponding environment variable
- Verify configuration

---

### OAuth Not Working

**Check:**
1. Redirect URIs configured correctly
2. OAuth credentials in Vercel
3. NEXTAUTH_URL is correct

**Solution:**
- Verify redirect URIs are exact
- No trailing slashes
- HTTPS (not HTTP)
- Wait 1-2 minutes after changes

---

### Database Connection Failed

**Check:**
1. DATABASE_URL is set
2. Database allows Vercel connections
3. Migrations applied

**Solution:**
```bash
# Test connection
export DATABASE_URL="your-production-url"
npx prisma db push

# Apply migrations
npx prisma migrate deploy
```

---

## 📊 Monitoring

### Vercel Dashboard

Monitor:
- Deployment status
- Build logs
- Function logs
- Analytics
- Error rates

### Health Check

Regularly check:
```bash
curl https://ai-ui-builder-one.vercel.app/api/health
```

Should always return `"status": "healthy"`

---

## ✅ Deployment Complete Checklist

### Configuration
- [ ] All environment variables set in Vercel
- [ ] NEXTAUTH_URL points to production
- [ ] NEXTAUTH_SECRET generated and set
- [ ] DATABASE_URL configured
- [ ] AI_PROVIDER and API key set
- [ ] OAuth credentials configured

### OAuth
- [ ] Google redirect URI added
- [ ] GitHub redirect URI added
- [ ] OAuth credentials match Vercel variables

### Database
- [ ] Production database created
- [ ] Migrations applied
- [ ] Database accessible from Vercel

### Deployment
- [ ] Latest code pushed
- [ ] Build successful
- [ ] No build errors
- [ ] No runtime errors

### Testing
- [ ] Health check returns 100%
- [ ] All pages load
- [ ] User registration works
- [ ] User sign in works
- [ ] Google OAuth works
- [ ] GitHub OAuth works
- [ ] AI engine works
- [ ] Protected routes work

---

## 🎉 Success!

Once all tests pass:

✅ **Production is LIVE and WORKING**

You can now:
1. Share the URL: https://ai-ui-builder-one.vercel.app/
2. Proceed with Task 7: AI Generation API Route
3. Continue development with confidence

---

## 📞 Support

**Vercel Support**: https://vercel.com/support  
**Documentation**: See PRODUCTION_SETUP_GUIDE.md  
**Troubleshooting**: See PRODUCTION_TESTING_REPORT.md

---

**Status**: READY TO DEPLOY  
**Estimated Time**: 15-30 minutes  
**Difficulty**: Medium
