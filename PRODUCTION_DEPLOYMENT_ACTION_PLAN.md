# Production Deployment - Action Plan

**Production URL**: https://ai-ui-builder-one.vercel.app/  
**Status**: Code is ready, needs configuration  
**Date**: May 12, 2026

---

## 🎯 Quick Summary

All code fixes are complete and ready to deploy:
- ✅ OpenAI model changed from `gpt-4` to `gpt-4o-mini` (more accessible)
- ✅ Better error messages added
- ✅ Health check endpoint created
- ✅ All tests passing (69/69)
- ✅ No TypeScript errors

**What's needed**: Deploy code + Configure Vercel environment + Configure OAuth

---

## 📋 Step-by-Step Action Plan

### Step 1: Deploy Latest Code (2 minutes)

```bash
# Commit all changes
git add .
git commit -m "Production deployment: Bug fixes and health check"

# Push to trigger Vercel deployment
git push origin main
```

**Wait for deployment**: Go to https://vercel.com/your-project/deployments and watch the build complete.

---

### Step 2: Configure Environment Variables in Vercel (5 minutes)

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables (if not already set):

#### Critical Variables (Required)

```bash
# NextAuth - MUST match production URL exactly
NEXTAUTH_URL=https://ai-ui-builder-one.vercel.app
NEXTAUTH_SECRET=<generate-new-secret-see-below>

# Database - Your production database URL
DATABASE_URL=<your-production-postgres-url>

# AI Provider - Choose openai or anthropic
AI_PROVIDER=openai
OPENAI_API_KEY=<your-openai-api-key>
```

#### OAuth Variables (Required for Google/GitHub sign-in)

```bash
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>
```

#### Optional Variables (Recommended)

```bash
# Redis Cache (improves performance)
REDIS_URL=<your-upstash-redis-url>
REDIS_TOKEN=<your-upstash-redis-token>
```

**Generate NEXTAUTH_SECRET:**
```bash
# Run this command and copy the output
openssl rand -base64 32
```

**After adding variables**: Redeploy from Vercel dashboard or push a new commit.

---

### Step 3: Fix OAuth redirect_uri_mismatch (5 minutes)

This is the error you saw: `Error 400: redirect_uri_mismatch`

#### Fix Google OAuth:

1. **Go to Google Cloud Console**
   - URL: https://console.cloud.google.com/
   - Select your project

2. **Navigate to Credentials**
   - Click: APIs & Services → Credentials
   - Click on your OAuth 2.0 Client ID

3. **Add Production Redirect URI**
   
   Add this EXACT URI (copy-paste to avoid typos):
   ```
   https://ai-ui-builder-one.vercel.app/api/auth/callback/google
   ```

4. **Keep Development URI Too** (for local testing)
   ```
   http://localhost:3000/api/auth/callback/google
   ```

5. **Click Save**

#### Fix GitHub OAuth:

1. **Go to GitHub Developer Settings**
   - URL: https://github.com/settings/developers
   - Click on your OAuth App

2. **Update Authorization Callback URL**
   
   Set to this EXACT URL:
   ```
   https://ai-ui-builder-one.vercel.app/api/auth/callback/github
   ```

3. **Click "Update application"**

**Important Notes:**
- ⚠️ The redirect URI must match **exactly** (no trailing slashes, correct protocol)
- ⚠️ Changes may take 1-2 minutes to propagate
- ⚠️ GitHub only allows ONE callback URL (you'll need to change it back for local dev, or create a separate OAuth app for production)

---

### Step 4: Test Health Check (1 minute)

After deployment completes and environment variables are set:

```bash
curl https://ai-ui-builder-one.vercel.app/api/health
```

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
- Check which variables are `false`
- Add missing variables in Vercel
- Redeploy

---

### Step 5: Test Core Functionality (10 minutes)

#### Test 1: Pages Load

Visit these URLs and verify they load without errors:

1. **Home**: https://ai-ui-builder-one.vercel.app/
   - ✅ Should show landing page

2. **Sign In**: https://ai-ui-builder-one.vercel.app/auth/signin
   - ✅ Should show sign-in form
   - ✅ OAuth buttons visible

3. **Sign Up**: https://ai-ui-builder-one.vercel.app/auth/signup
   - ✅ Should show sign-up form
   - ✅ OAuth buttons visible

#### Test 2: User Registration (Email/Password)

1. Go to: https://ai-ui-builder-one.vercel.app/auth/signup
2. Fill in:
   - Name: "Production Test"
   - Email: "test@example.com"
   - Password: "testpass123"
3. Click "Create account"

**Expected:**
- ✅ Account created
- ✅ Redirected to dashboard
- ✅ No errors

**If fails:**
- Check Vercel function logs
- Verify DATABASE_URL is set
- Check database is accessible

#### Test 3: Google OAuth

1. Go to: https://ai-ui-builder-one.vercel.app/auth/signin
2. Click "Continue with Google"
3. Authorize the app

**Expected:**
- ✅ Redirected to Google
- ✅ Authorized successfully
- ✅ Redirected back to app
- ✅ Signed in

**If "redirect_uri_mismatch":**
- Double-check redirect URI in Google Console
- Must be exact: `https://ai-ui-builder-one.vercel.app/api/auth/callback/google`
- Wait 1-2 minutes after saving

#### Test 4: GitHub OAuth

1. Go to: https://ai-ui-builder-one.vercel.app/auth/signin
2. Click "Continue with GitHub"
3. Authorize the app

**Expected:**
- ✅ Redirected to GitHub
- ✅ Authorized successfully
- ✅ Redirected back to app
- ✅ Signed in

#### Test 5: AI Engine

1. Sign in first (any method)
2. Go to: https://ai-ui-builder-one.vercel.app/test-ai
3. Enter prompt: "Create a simple button"
4. Click "Test AI Engine"

**Expected:**
- ✅ UI generated successfully
- ✅ No errors
- ✅ Valid JSON returned
- ✅ Generation time displayed

**If fails:**
- Check OPENAI_API_KEY is set
- Verify API key is valid
- Check Vercel function logs
- Verify model is `gpt-4o-mini` (should be by default)

---

## 🐛 Troubleshooting Common Issues

### Issue 1: "OpenAI API error: 404 The model `gpt-4` does not exist"

**Status**: ✅ FIXED - Model changed to `gpt-4o-mini`

**If you still see this error:**
1. Verify the latest code is deployed
2. Check `lib/ai/models/index.ts` uses `gpt-4o-mini`
3. Clear any caches

### Issue 2: "Error 400: redirect_uri_mismatch"

**Status**: ⚠️ NEEDS CONFIGURATION

**Solution:**
1. Add production redirect URIs in OAuth provider consoles (see Step 3 above)
2. Wait 1-2 minutes for changes to propagate
3. Try again

### Issue 3: Health check shows missing variables

**Solution:**
1. Add missing variables in Vercel dashboard
2. Redeploy from Vercel dashboard
3. Test health check again

### Issue 4: Database connection failed

**Solution:**
1. Verify DATABASE_URL is correct
2. Check database allows connections from Vercel
3. Test connection locally first
4. Check Prisma migrations are applied

### Issue 5: AI generation fails

**Solution:**
1. Check OPENAI_API_KEY is set and valid
2. Verify API key has credits
3. Check OpenAI API status: https://status.openai.com/
4. Review Vercel function logs for specific error

---

## 📊 Success Checklist

Production is ready when all these are checked:

### Configuration
- [ ] Latest code deployed to Vercel
- [ ] All environment variables set in Vercel
- [ ] NEXTAUTH_URL points to production URL
- [ ] NEXTAUTH_SECRET generated and set
- [ ] DATABASE_URL configured
- [ ] AI_PROVIDER and API key set
- [ ] OAuth credentials configured

### OAuth
- [ ] Google redirect URI added for production
- [ ] GitHub redirect URI added for production
- [ ] OAuth credentials match Vercel variables

### Testing
- [ ] Health check returns 100%
- [ ] All pages load without errors
- [ ] User registration works
- [ ] User sign-in works
- [ ] Google OAuth works
- [ ] GitHub OAuth works
- [ ] AI engine generates UI successfully
- [ ] Protected routes redirect correctly
- [ ] No errors in Vercel function logs

---

## 🎉 When Everything Works

You'll know production is ready when:

1. ✅ Health endpoint shows 100% healthy
2. ✅ You can create an account
3. ✅ You can sign in with email/password
4. ✅ OAuth works (Google and GitHub)
5. ✅ AI generates UI from prompts
6. ✅ No errors in logs

**Then you can:**
- ✅ Share the production URL with users
- ✅ Proceed with Task 7 (AI Generation API Route)
- ✅ Continue development with confidence

---

## 📞 Quick Reference

### Important URLs

- **Production**: https://ai-ui-builder-one.vercel.app/
- **Health Check**: https://ai-ui-builder-one.vercel.app/api/health
- **Vercel Dashboard**: https://vercel.com/your-project
- **Google Console**: https://console.cloud.google.com/
- **GitHub OAuth**: https://github.com/settings/developers

### Environment Variables Template

```bash
# Copy this to Vercel environment variables
NEXTAUTH_URL=https://ai-ui-builder-one.vercel.app
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
DATABASE_URL=<your-postgres-url>
AI_PROVIDER=openai
OPENAI_API_KEY=<your-key>
GOOGLE_CLIENT_ID=<your-id>
GOOGLE_CLIENT_SECRET=<your-secret>
GITHUB_CLIENT_ID=<your-id>
GITHUB_CLIENT_SECRET=<your-secret>
```

### OAuth Redirect URIs

```
Google: https://ai-ui-builder-one.vercel.app/api/auth/callback/google
GitHub: https://ai-ui-builder-one.vercel.app/api/auth/callback/github
```

---

## 🚀 Ready to Deploy!

**Estimated Time**: 15-20 minutes total

**Steps**:
1. Deploy code (2 min)
2. Configure environment (5 min)
3. Configure OAuth (5 min)
4. Test health check (1 min)
5. Test functionality (10 min)

**Let's get started!** 🎯
