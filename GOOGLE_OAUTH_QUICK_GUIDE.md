# Google OAuth - Quick Visual Guide

## 🎯 Quick Setup (5 Minutes)

### 1️⃣ Create Project (1 min)
**URL:** https://console.cloud.google.com/

```
1. Click project dropdown (top left, next to "Google Cloud")
2. Click "NEW PROJECT"
3. Name: "AI UI Builder"
4. Click "CREATE"
5. Click "SELECT PROJECT"
```

---

### 2️⃣ Enable API (30 sec)
**Path:** APIs & Services → Library

```
1. Search: "Google+ API"
2. Click on it
3. Click "ENABLE"
```

---

### 3️⃣ OAuth Consent Screen (2 min)
**Path:** APIs & Services → OAuth consent screen

```
1. Choose "External"
2. Click "CREATE"

App Information:
  - App name: AI UI Builder
  - User support email: [your email]
  - Developer contact: [your email]

3. Click "SAVE AND CONTINUE" (3 times)
4. On "Test users" page:
   - Click "+ ADD USERS"
   - Enter your email
   - Click "ADD"
5. Click "SAVE AND CONTINUE"
6. Click "BACK TO DASHBOARD"
```

---

### 4️⃣ Create Credentials (2 min)
**Path:** APIs & Services → Credentials

```
1. Click "+ CREATE CREDENTIALS"
2. Select "OAuth client ID"
3. Application type: "Web application"
4. Name: "AI UI Builder Web Client"

Authorized JavaScript origins:
  - http://localhost:3000

Authorized redirect URIs:
  - http://localhost:3000/api/auth/callback/google

5. Click "CREATE"
```

---

### 5️⃣ Copy Credentials

**You'll see a popup with:**

```
Client ID:
123456789-abc...xyz.apps.googleusercontent.com

Client Secret:
GOCSPX-abc...xyz
```

**COPY BOTH!** You'll need them in the next step.

---

## 📋 What to Copy

### Client ID Example:
```
123456789012-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com
```
- Starts with numbers
- Ends with `.apps.googleusercontent.com`

### Client Secret Example:
```
GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz
```
- Starts with `GOCSPX-`
- Followed by random characters

---

## ✅ Ready to Update .env

Once you have both credentials, provide them to me and I'll update your `.env` file automatically!

**Format:**
```
Client ID: [paste here]
Client Secret: [paste here]
```

---

## 🧪 Test It

After updating `.env`:

```bash
npm run dev
```

Visit: http://localhost:3000/auth/signin

Click "Continue with Google" → Should work! ✅

---

## 🆘 Common Issues

**"redirect_uri_mismatch"**
→ Check redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`

**"Access blocked"**
→ Add your email as test user in OAuth consent screen

**"invalid_client"**
→ Double-check Client ID and Secret (no extra spaces)

---

**Time:** ~5 minutes  
**Difficulty:** Easy  
**Next:** GitHub OAuth (3 minutes)
