# Production Setup Guide - Complete Configuration

**Production URL**: https://ai-ui-builder-one.vercel.app/

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Set Environment Variables in Vercel

Go to: https://vercel.com/your-project/settings/environment-variables

Add these variables:

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://ai-ui-builder-one.vercel.app
NEXTAUTH_SECRET=generate-a-new-secret-for-production

# Database (Production)
DATABASE_URL=your-production-postgresql-url

# AI Provider
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Redis Cache (Optional but Recommended)
REDIS_URL=your-redis-url
REDIS_TOKEN=your-redis-token
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

### Step 2: Configure Google OAuth

1. Go to: https://console.cloud.google.com/
2. Select your project
3. Navigate to: APIs & Services → Credentials
4. Click on your OAuth 2.0 Client ID
5. Add to "Authorized redirect URIs":
   ```
   https://ai-ui-builder-one.vercel.app/api/auth/callback/google
   ```
6. Click "Save"

---

### Step 3: Configure GitHub OAuth

1. Go to: https://github.com/settings/developers
2. Click on your OAuth App
3. Set "Authorization callback URL" to:
   ```
   https://ai-ui-builder-one.vercel.app/api/auth/callback/github
   ```
4. Click "Update application"

---

### Step 4: Deploy Latest Code

```bash
# Commit and push latest changes
git add .
git commit -m "Production deployment with all fixes"
git push origin main

# Vercel will automatically deploy
```

---

### Step 5: Test Production

Visit these URLs and test:

1. **Home**: https://ai-ui-builder-one.vercel.app/
2. **Sign Up**: https://ai-ui-builder-one.vercel.app/auth/signup
3. **Sign In**: https://ai-ui-builder-one.vercel.app/auth/signin
4. **Test AI**: https://ai-ui-builder-one.vercel.app/test-ai

---

## 📝 Detailed Configuration

### Database Setup

#### Option 1: Vercel Postgres (Recommended)

1. Go to Vercel dashboard
2. Select your project
3. Go to "Storage" tab
4. Click "Create Database"
5. Select "Postgres"
6. Copy the DATABASE_URL
7. Add to environment variables

#### Option 2: External Database (Supabase, Railway, etc.)

1. Create PostgreSQL database
2. Get connection string
3. Add to Vercel environment variables as DATABASE_URL
4. Ensure database allows connections from Vercel IPs

#### Apply Migrations

```bash
# Set DATABASE_URL locally to production database
export DATABASE_URL="your-production-database-url"

# Apply migrations
npx prisma migrate deploy

# Or configure Vercel build command:
# prisma generate && prisma migrate deploy && next build
```

---

### Redis Setup (Optional but Recommended)

#### Using Upstash (Free Tier Available)

1. Go to: https://upstash.com/
2. Create account
3. Create Redis database
4. Copy REST URL and Token
5. Add to Vercel environment variables:
   ```
   REDIS_URL=your-upstash-rest-url
   REDIS_TOKEN=your-upstash-token
   ```

---

### OpenAI API Setup

1. Go to: https://platform.openai.com/api-keys
2. Create new API key
3. Copy the key
4. Add to Vercel environment variables:
   ```
   OPENAI_API_KEY=sk-...
   ```

**Note**: The app uses `gpt-4o-mini` by default (accessible to most accounts)

---

## 🧪 Testing Checklist

### Test 1: Environment Variables

Create a test endpoint to verify configuration:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    environment: {
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasAIProvider: !!process.env.AI_PROVIDER,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasGoogleOAuth: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      hasGitHubOAuth: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    },
  });
}
```

Visit: https://ai-ui-builder-one.vercel.app/api/health

**Expected**: All values should be `true`

---

### Test 2: User Registration

1. Visit: https://ai-ui-builder-one.vercel.app/auth/signup
2. Fill in form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "testpass123"
   - Confirm: "testpass123"
3. Click "Create account"

**Expected**:
- ✅ Account created
- ✅ Redirected to dashboard
- ✅ No errors

**If Fails**:
- Check Vercel function logs
- Verify DATABASE_URL is set
- Check database is accessible

---

### Test 3: User Sign In

1. Visit: https://ai-ui-builder-one.vercel.app/auth/signin
2. Enter credentials
3. Click "Sign in"

**Expected**:
- ✅ Successfully signed in
- ✅ Redirected to dashboard
- ✅ Session created

---

### Test 4: Google OAuth

1. Visit: https://ai-ui-builder-one.vercel.app/auth/signin
2. Click "Continue with Google"
3. Authorize

**Expected**:
- ✅ Redirected to Google
- ✅ Authorized
- ✅ Redirected back
- ✅ Signed in

**If Fails**:
- Check redirect URI in Google Console
- Verify it's exactly: `https://ai-ui-builder-one.vercel.app/api/auth/callback/google`
- Check OAuth credentials in Vercel

---

### Test 5: GitHub OAuth

1. Visit: https://ai-ui-builder-one.vercel.app/auth/signin
2. Click "Continue with GitHub"
3. Authorize

**Expected**:
- ✅ Redirected to GitHub
- ✅ Authorized
- ✅ Redirected back
- ✅ Signed in

---

### Test 6: AI Engine

1. Visit: https://ai-ui-builder-one.vercel.app/test-ai
2. Enter prompt: "Create a button"
3. Click "Test AI Engine"

**Expected**:
- ✅ UI generated
- ✅ No errors
- ✅ Valid JSON returned

**If Fails**:
- Check OPENAI_API_KEY is set
- Verify API key is valid
- Check Vercel function logs

---

## 🔧 Troubleshooting

### Issue: Pages Not Loading

**Check:**
1. Vercel deployment status
2. Build logs for errors
3. Function logs for runtime errors

**Solution:**
```bash
# View logs
vercel logs https://ai-ui-builder-one.vercel.app

# Or check Vercel dashboard
```

---

### Issue: Database Connection Failed

**Check:**
1. DATABASE_URL is set correctly
2. Database allows Vercel connections
3. Connection string format is correct

**Solution:**
```bash
# Test connection locally
export DATABASE_URL="your-production-url"
npx prisma db push

# If successful, connection string is correct
```

---

### Issue: OAuth Not Working

**Check:**
1. Redirect URIs are configured correctly
2. OAuth credentials match environment variables
3. NEXTAUTH_URL is set to production URL

**Solution:**
- Verify redirect URIs are exact
- No trailing slashes
- HTTPS (not HTTP)
- Wait 1-2 minutes after saving changes

---

### Issue: AI Generation Fails

**Check:**
1. OPENAI_API_KEY is set
2. API key is valid
3. Model is accessible

**Solution:**
```bash
# Test API key locally
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Should return list of models
```

---

## 📊 Monitoring

### Vercel Analytics

Enable in Vercel dashboard:
1. Go to project settings
2. Enable "Analytics"
3. View real-time metrics

### Error Tracking

Check function logs:
1. Go to Vercel dashboard
2. Select deployment
3. View "Functions" tab
4. Check for errors

### Performance

Monitor:
- Page load times
- API response times
- Database query times
- AI generation times

---

## 🎯 Production Checklist

### Before Going Live

- [ ] All environment variables set
- [ ] OAuth redirect URIs configured
- [ ] Database migrations applied
- [ ] Latest code deployed
- [ ] All tests passing
- [ ] No build errors
- [ ] No runtime errors

### After Going Live

- [ ] User registration works
- [ ] User sign in works
- [ ] Google OAuth works
- [ ] GitHub OAuth works
- [ ] AI generation works
- [ ] Protected routes work
- [ ] No console errors
- [ ] Performance is acceptable

---

## 🚀 Ready for Production

Once all tests pass:

1. ✅ Environment configured
2. ✅ OAuth working
3. ✅ Database connected
4. ✅ AI engine working
5. ✅ All features tested

**Status**: READY TO PROCEED WITH NEXT TASKS

---

## 📞 Support

If issues persist:

1. Check Vercel logs
2. Review environment variables
3. Test OAuth configuration
4. Verify database connection
5. Check API keys

**Vercel Support**: https://vercel.com/support
**NextAuth.js Docs**: https://next-auth.js.org/deployment
