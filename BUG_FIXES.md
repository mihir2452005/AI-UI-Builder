# Bug Fixes - OAuth and AI Model Issues

## Issues Found

1. ❌ **OpenAI Model Error**: `gpt-4` model not accessible
2. ❌ **OAuth redirect_uri_mismatch**: Google/GitHub OAuth configuration issue

---

## Fix 1: OpenAI Model Access

### Problem
```
OpenAI API error: 404 The model `gpt-4` does not exist or you do not have access to it.
```

### Root Cause
The OpenAI API key doesn't have access to the `gpt-4` model. This is common for:
- Free tier accounts
- New API keys
- Accounts without GPT-4 access

### Solution
Changed the default model from `gpt-4` to `gpt-4o-mini` which is:
- ✅ More widely accessible
- ✅ Faster response times
- ✅ Lower cost
- ✅ Still very capable for UI generation

### Files Modified
1. `lib/ai/models/openai-model.ts` - Changed default model
2. `lib/ai/models/index.ts` - Updated factory to use `gpt-4o-mini`

### Alternative Models (if gpt-4o-mini doesn't work)
If you still get errors, try these models in order:
1. `gpt-4o-mini` (recommended)
2. `gpt-3.5-turbo` (fallback)
3. `gpt-3.5-turbo-16k` (for longer prompts)

To change the model, edit `lib/ai/models/index.ts`:
```typescript
case 'openai':
  return new OpenAIModel('gpt-3.5-turbo'); // Change here
```

---

## Fix 2: OAuth redirect_uri_mismatch

### Problem
```
Error 400: redirect_uri_mismatch
You can't sign in because this app sent an invalid request.
```

### Root Cause
The OAuth providers (Google and GitHub) need to have the correct redirect URIs configured in their developer consoles. The redirect URI must match exactly what NextAuth.js sends.

### Solution

#### For Google OAuth:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Navigate to OAuth 2.0 Client IDs**
   - APIs & Services → Credentials
   - Click on your OAuth 2.0 Client ID

3. **Add Authorized Redirect URIs**
   Add these exact URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   http://127.0.0.1:3000/api/auth/callback/google
   ```

4. **Save Changes**

#### For GitHub OAuth:

1. **Go to GitHub Developer Settings**
   - Visit: https://github.com/settings/developers
   - Click on your OAuth App

2. **Update Authorization Callback URL**
   Set to:
   ```
   http://localhost:3000/api/auth/callback/github
   ```

3. **Save Changes**

### Important Notes

- ⚠️ The redirect URI must match **exactly** (including http/https, port, path)
- ⚠️ For production, you'll need to add your production domain
- ⚠️ Changes may take a few minutes to propagate

### Testing OAuth After Fix

1. **Clear browser cache and cookies**
2. **Restart the dev server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```
3. **Try signing in again**

---

## Fix 3: Disable OAuth Temporarily (Optional)

If you want to test without OAuth while fixing the configuration:

### Option A: Use Email/Password Only

Just use the sign-up page to create an account with email/password:
- Visit: http://localhost:3000/auth/signup
- Enter name, email, password
- Sign up and sign in

### Option B: Comment Out OAuth Providers

Edit `lib/auth/auth-options.ts`:

```typescript
providers: [
  // Temporarily disabled - uncomment after fixing OAuth
  // GoogleProvider({
  //   clientId: process.env.GOOGLE_CLIENT_ID || '',
  //   clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  // }),
  
  // GitHubProvider({
  //   clientId: process.env.GITHUB_CLIENT_ID || '',
  //   clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  // }),
  
  // Keep credentials provider
  CredentialsProvider({
    // ... existing code
  }),
],
```

---

## Verification Steps

### 1. Test AI Engine

Visit: http://localhost:3000/test-ai

**Test with gpt-4o-mini:**
```
Prompt: "Create a simple button component"
Expected: Should generate UI without errors
Time: 5-10 seconds
```

**If it works:**
✅ AI engine fixed!

**If you still get errors:**
Try changing to `gpt-3.5-turbo` in `lib/ai/models/index.ts`

### 2. Test Email/Password Auth

Visit: http://localhost:3000/auth/signup

**Steps:**
1. Enter name: "Test User"
2. Enter email: "test@example.com"
3. Enter password: "password123"
4. Click "Sign Up"

**Expected:**
✅ Account created
✅ Redirected to dashboard
✅ No errors

### 3. Test OAuth (After Fixing Redirect URIs)

Visit: http://localhost:3000/auth/signin

**Steps:**
1. Click "Sign in with Google" or "Sign in with GitHub"
2. Authorize the app
3. Should redirect back to app

**Expected:**
✅ Successfully signed in
✅ Redirected to dashboard
✅ No redirect_uri_mismatch error

---

## Additional Fixes Applied

### 3. Better Error Messages

Updated error handling to provide more helpful messages:

```typescript
// Before
throw new Error('OpenAI API error');

// After
throw new Error(`OpenAI API error: ${error.message}`);
```

### 4. Model Fallback Logic (Future Enhancement)

Consider adding automatic fallback:

```typescript
async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
  const models = ['gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'];
  
  for (const model of models) {
    try {
      return await this.tryComplete(model, request);
    } catch (error) {
      console.warn(`Model ${model} failed, trying next...`);
    }
  }
  
  throw new Error('All models failed');
}
```

---

## Environment Variable Checklist

Verify all required variables are set:

```bash
# Check AI provider
echo $AI_PROVIDER  # Should be "openai" or "anthropic"

# Check OpenAI key (if using OpenAI)
echo $OPENAI_API_KEY  # Should start with "sk-"

# Check NextAuth URL
echo $NEXTAUTH_URL  # Should be "http://localhost:3000"

# Check OAuth credentials
echo $GOOGLE_CLIENT_ID  # Should end with ".apps.googleusercontent.com"
echo $GITHUB_CLIENT_ID  # Should start with "Ov" or similar
```

---

## Testing Checklist

After applying fixes:

- [ ] AI Engine works at /test-ai
- [ ] Email/password sign up works
- [ ] Email/password sign in works
- [ ] Google OAuth works (after redirect URI fix)
- [ ] GitHub OAuth works (after redirect URI fix)
- [ ] Protected routes redirect correctly
- [ ] No console errors
- [ ] All tests pass (`npm test`)

---

## Quick Test Commands

```bash
# 1. Type check
npm run type-check

# 2. Run tests
npm test

# 3. Start dev server
npm run dev

# 4. Test AI engine
# Visit: http://localhost:3000/test-ai
# Enter prompt: "Create a button"
# Click "Test AI Engine"

# 5. Test auth
# Visit: http://localhost:3000/auth/signup
# Create account with email/password
```

---

## Production Deployment Notes

When deploying to production:

1. **Update NEXTAUTH_URL**
   ```
   NEXTAUTH_URL="https://yourdomain.com"
   ```

2. **Add Production Redirect URIs**
   
   **Google:**
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
   
   **GitHub:**
   ```
   https://yourdomain.com/api/auth/callback/github
   ```

3. **Use Production-Grade AI Model**
   Consider using `gpt-4` or `gpt-4-turbo` for better quality

4. **Secure Environment Variables**
   - Use Vercel environment variables
   - Never commit .env to git
   - Rotate secrets regularly

---

## Support

If issues persist:

1. **Check OpenAI API Status**
   - Visit: https://status.openai.com/

2. **Verify API Key**
   - Visit: https://platform.openai.com/api-keys
   - Check if key is active
   - Check usage limits

3. **Check OAuth Configuration**
   - Google: https://console.cloud.google.com/
   - GitHub: https://github.com/settings/developers

4. **Review Logs**
   - Check browser console
   - Check terminal output
   - Look for specific error messages

---

## Summary

✅ **Fixed**: OpenAI model changed to `gpt-4o-mini`
✅ **Documented**: OAuth redirect URI configuration steps
✅ **Added**: Better error messages
✅ **Provided**: Testing checklist
✅ **Included**: Troubleshooting guide

**Status**: Ready for testing
