# OAuth Setup Fix - Detailed Guide

## Problem: redirect_uri_mismatch Error

When you try to sign in with Google or GitHub, you see:
```
Error 400: redirect_uri_mismatch
You can't sign in because this app sent an invalid request.
```

This happens because the OAuth providers don't have the correct redirect URIs configured.

---

## Solution: Configure Redirect URIs

### Step 1: Fix Google OAuth

#### 1.1 Go to Google Cloud Console
Visit: https://console.cloud.google.com/

#### 1.2 Select Your Project
- Click on the project dropdown at the top
- Select the project that contains your OAuth credentials
- If you don't have a project, create one first

#### 1.3 Navigate to Credentials
- In the left sidebar, click **"APIs & Services"**
- Click **"Credentials"**

#### 1.4 Find Your OAuth 2.0 Client ID
- Look for your OAuth 2.0 Client ID in the list
- It should show your `GOOGLE_CLIENT_ID` from .env
- Click on the client ID name to edit it

#### 1.5 Add Authorized Redirect URIs
Scroll down to **"Authorized redirect URIs"** section and add:

**For Local Development:**
```
http://localhost:3000/api/auth/callback/google
http://127.0.0.1:3000/api/auth/callback/google
```

**For Production (when deploying):**
```
https://yourdomain.com/api/auth/callback/google
```

#### 1.6 Save Changes
- Click **"Save"** at the bottom
- Wait 1-2 minutes for changes to propagate

---

### Step 2: Fix GitHub OAuth

#### 2.1 Go to GitHub Developer Settings
Visit: https://github.com/settings/developers

#### 2.2 Select Your OAuth App
- Click on **"OAuth Apps"** in the left sidebar
- Click on your app name

#### 2.3 Update Authorization Callback URL
Set the **"Authorization callback URL"** to:

**For Local Development:**
```
http://localhost:3000/api/auth/callback/github
```

**For Production (when deploying):**
```
https://yourdomain.com/api/auth/callback/github
```

#### 2.4 Save Changes
- Click **"Update application"**
- Changes take effect immediately

---

## Step 3: Verify Configuration

### 3.1 Check Your .env File

Make sure these are set correctly:

```bash
# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"  # Must match your dev server URL
NEXTAUTH_SECRET="your-secret-here"    # Must be set

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### 3.2 Restart Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### 3.3 Clear Browser Cache

- Open DevTools (F12)
- Right-click the refresh button
- Select "Empty Cache and Hard Reload"
- Or use Incognito/Private mode

---

## Step 4: Test OAuth

### Test Google OAuth

1. Visit: http://localhost:3000/auth/signin
2. Click **"Sign in with Google"**
3. Select your Google account
4. Authorize the app
5. Should redirect back to dashboard

**Expected Result:** ✅ Successfully signed in

### Test GitHub OAuth

1. Visit: http://localhost:3000/auth/signin
2. Click **"Sign in with GitHub"**
3. Authorize the app
4. Should redirect back to dashboard

**Expected Result:** ✅ Successfully signed in

---

## Common Issues and Solutions

### Issue 1: "redirect_uri_mismatch" Still Appears

**Possible Causes:**
1. Redirect URI not saved correctly
2. Using wrong port (3000 vs 3001)
3. Using http vs https
4. Typo in redirect URI

**Solution:**
- Double-check the redirect URI is **exactly**:
  ```
  http://localhost:3000/api/auth/callback/google
  http://localhost:3000/api/auth/callback/github
  ```
- Make sure there are no trailing slashes
- Make sure the port matches your dev server
- Wait 2-3 minutes after saving changes

### Issue 2: "Client ID not found"

**Possible Causes:**
1. Wrong client ID in .env
2. OAuth app deleted or disabled

**Solution:**
- Copy the client ID from the OAuth provider console
- Paste it exactly into .env
- Restart dev server

### Issue 3: "Invalid client secret"

**Possible Causes:**
1. Wrong client secret in .env
2. Client secret regenerated

**Solution:**
- Copy the client secret from the OAuth provider console
- Paste it exactly into .env
- Restart dev server

### Issue 4: "NEXTAUTH_URL not set"

**Possible Causes:**
1. Missing NEXTAUTH_URL in .env
2. Wrong URL format

**Solution:**
- Add to .env:
  ```
  NEXTAUTH_URL="http://localhost:3000"
  ```
- Must include protocol (http://)
- Must match your dev server URL
- Restart dev server

---

## Alternative: Use Email/Password Only

If you want to skip OAuth for now:

### Option 1: Just Use Email/Password

1. Visit: http://localhost:3000/auth/signup
2. Create account with email and password
3. Sign in with email and password
4. No OAuth needed!

### Option 2: Disable OAuth Providers Temporarily

Edit `lib/auth/auth-options.ts`:

```typescript
providers: [
  // Comment out OAuth providers
  // GoogleProvider({ ... }),
  // GitHubProvider({ ... }),
  
  // Keep credentials provider
  CredentialsProvider({
    // ... existing code
  }),
],
```

Then restart the dev server.

---

## Creating New OAuth Apps (If Needed)

### Create Google OAuth App

1. **Go to Google Cloud Console**
   https://console.cloud.google.com/

2. **Create a New Project** (if needed)
   - Click project dropdown → "New Project"
   - Enter project name
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - Click "Create"
   - Copy Client ID and Client Secret to .env

### Create GitHub OAuth App

1. **Go to GitHub Settings**
   https://github.com/settings/developers

2. **Create New OAuth App**
   - Click "New OAuth App"
   - Fill in:
     - Application name: "AI UI Builder (Dev)"
     - Homepage URL: http://localhost:3000
     - Authorization callback URL: http://localhost:3000/api/auth/callback/github
   - Click "Register application"

3. **Generate Client Secret**
   - Click "Generate a new client secret"
   - Copy Client ID and Client Secret to .env

---

## Production Deployment

When deploying to production:

### Update .env for Production

```bash
# Production URL
NEXTAUTH_URL="https://yourdomain.com"

# Keep same OAuth credentials
GOOGLE_CLIENT_ID="same-as-dev"
GOOGLE_CLIENT_SECRET="same-as-dev"
GITHUB_CLIENT_ID="same-as-dev"
GITHUB_CLIENT_SECRET="same-as-dev"
```

### Add Production Redirect URIs

**Google:**
```
https://yourdomain.com/api/auth/callback/google
```

**GitHub:**
```
https://yourdomain.com/api/auth/callback/github
```

**Important:** Keep the development URIs too! You can have multiple redirect URIs.

---

## Verification Checklist

After setup:

- [ ] Google OAuth redirect URI added
- [ ] GitHub OAuth redirect URI added
- [ ] .env file has correct credentials
- [ ] NEXTAUTH_URL matches dev server
- [ ] Dev server restarted
- [ ] Browser cache cleared
- [ ] Google sign-in works
- [ ] GitHub sign-in works
- [ ] Email/password sign-in works
- [ ] No console errors

---

## Quick Test

```bash
# 1. Restart dev server
npm run dev

# 2. Visit sign-in page
# http://localhost:3000/auth/signin

# 3. Try each method:
# - Email/password (should work immediately)
# - Google OAuth (should work after redirect URI fix)
# - GitHub OAuth (should work after redirect URI fix)
```

---

## Support Resources

- **NextAuth.js Docs**: https://next-auth.js.org/
- **Google OAuth Setup**: https://next-auth.js.org/providers/google
- **GitHub OAuth Setup**: https://next-auth.js.org/providers/github
- **OAuth Troubleshooting**: https://next-auth.js.org/errors

---

## Summary

✅ **Fixed**: Detailed OAuth redirect URI configuration
✅ **Documented**: Step-by-step setup for Google and GitHub
✅ **Provided**: Troubleshooting guide
✅ **Included**: Alternative (email/password only)
✅ **Added**: Production deployment notes

**Status**: Ready to configure and test
