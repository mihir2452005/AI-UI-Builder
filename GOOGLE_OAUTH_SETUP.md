# Google OAuth Setup Guide

Follow these steps to set up Google OAuth for your AI UI Builder application.

---

## 📋 Prerequisites

- Google account
- Your application running at `http://localhost:3000`

---

## 🚀 Step-by-Step Setup

### Step 1: Go to Google Cloud Console

1. Open your browser and go to: **https://console.cloud.google.com/**
2. Sign in with your Google account

---

### Step 2: Create a New Project

1. Click on the **project dropdown** at the top (next to "Google Cloud")
2. Click **"NEW PROJECT"** button (top right)
3. Fill in the details:
   - **Project name:** `AI UI Builder` (or any name you prefer)
   - **Organization:** Leave as default (No organization)
   - **Location:** Leave as default
4. Click **"CREATE"**
5. Wait for the project to be created (takes ~10 seconds)
6. Click **"SELECT PROJECT"** when it appears

---

### Step 3: Enable Google+ API

1. In the left sidebar, click **"APIs & Services"** → **"Library"**
   - Or use the search bar at the top and search for "API Library"

2. In the API Library search box, type: **"Google+ API"**

3. Click on **"Google+ API"** from the results

4. Click the **"ENABLE"** button

5. Wait for it to enable (~5 seconds)

---

### Step 4: Configure OAuth Consent Screen

1. In the left sidebar, go to **"APIs & Services"** → **"OAuth consent screen"**

2. Choose user type:
   - Select **"External"** (for testing with any Google account)
   - Click **"CREATE"**

3. Fill in **App information**:
   - **App name:** `AI UI Builder`
   - **User support email:** Select your email from dropdown
   - **App logo:** (Optional - skip for now)

4. Fill in **Developer contact information**:
   - **Email addresses:** Enter your email

5. Click **"SAVE AND CONTINUE"**

6. **Scopes** page:
   - Click **"SAVE AND CONTINUE"** (no changes needed)

7. **Test users** page:
   - Click **"+ ADD USERS"**
   - Enter your email address (the one you'll use to test)
   - Click **"ADD"**
   - Click **"SAVE AND CONTINUE"**

8. **Summary** page:
   - Review your settings
   - Click **"BACK TO DASHBOARD"**

---

### Step 5: Create OAuth Credentials

1. In the left sidebar, go to **"APIs & Services"** → **"Credentials"**

2. Click **"+ CREATE CREDENTIALS"** at the top

3. Select **"OAuth client ID"**

4. If prompted to configure consent screen, you've already done it - continue

5. Fill in the form:
   - **Application type:** Select **"Web application"**
   - **Name:** `AI UI Builder Web Client`

6. **Authorized JavaScript origins:**
   - Click **"+ ADD URI"**
   - Enter: `http://localhost:3000`
   - Click **"+ ADD URI"** again
   - Enter: `http://localhost:3001` (backup port)

7. **Authorized redirect URIs:**
   - Click **"+ ADD URI"**
   - Enter: `http://localhost:3000/api/auth/callback/google`
   - Click **"+ ADD URI"** again
   - Enter: `http://localhost:3001/api/auth/callback/google` (backup)

8. Click **"CREATE"**

---

### Step 6: Copy Your Credentials

A popup will appear with your credentials:

1. **Copy the Client ID**
   - It looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
   - Keep this window open!

2. **Copy the Client Secret**
   - It looks like: `GOCSPX-abcdefghijklmnopqrstuvwxyz`

3. Click **"OK"** to close the popup

**IMPORTANT:** Don't close the browser yet! We'll use these in the next step.

---

### Step 7: Update Your .env File

Now I'll update your `.env` file with the credentials you just copied.

**Please provide:**
1. Your Google Client ID
2. Your Google Client Secret

---

## 📝 What Your Credentials Look Like

### Client ID Format:
```
123456789012-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com
```

### Client Secret Format:
```
GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz
```

---

## ✅ Verification

After updating your `.env` file, test it:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open: http://localhost:3000/auth/signin

3. Click the **"Continue with Google"** button

4. You should see the Google sign-in page

5. Sign in with your Google account

6. You should be redirected back to your app and signed in!

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem:** The redirect URI doesn't match what you configured

**Solution:**
1. Go back to Google Cloud Console → Credentials
2. Click on your OAuth client
3. Verify the redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`
4. Make sure there are no extra spaces or characters
5. Save and try again

### Error: "Access blocked: This app's request is invalid"

**Problem:** OAuth consent screen not properly configured

**Solution:**
1. Go to OAuth consent screen
2. Make sure your email is added as a test user
3. Make sure the app is in "Testing" mode (not "In production")

### Error: "invalid_client"

**Problem:** Wrong Client ID or Client Secret

**Solution:**
1. Double-check the credentials you copied
2. Make sure there are no extra spaces
3. Regenerate the client secret if needed

---

## 🔒 Security Notes

### For Development:
- ✅ Using `http://localhost:3000` is fine
- ✅ OAuth consent screen in "Testing" mode
- ✅ Only test users can sign in

### For Production:
When you deploy to production:

1. **Add production URLs:**
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://yourdomain.com/api/auth/callback/google`

2. **Publish OAuth consent screen:**
   - Go through Google's verification process
   - Submit for review if needed

3. **Update .env in production:**
   - Use production environment variables
   - Never commit credentials to Git

---

## 📚 Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## ✅ Checklist

- [ ] Created Google Cloud project
- [ ] Enabled Google+ API
- [ ] Configured OAuth consent screen
- [ ] Added test user (your email)
- [ ] Created OAuth credentials
- [ ] Copied Client ID
- [ ] Copied Client Secret
- [ ] Updated .env file
- [ ] Tested sign-in flow
- [ ] Successfully signed in with Google

---

**Ready to proceed?** Once you have your Client ID and Client Secret, let me know and I'll update your `.env` file!
