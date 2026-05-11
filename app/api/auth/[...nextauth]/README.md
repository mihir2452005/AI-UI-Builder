# NextAuth.js API Route Handler

## Overview

This directory contains the catch-all API route handler for NextAuth.js authentication in the AI-Powered UI Builder SaaS platform.

## File Structure

```
app/api/auth/[...nextauth]/
└── route.ts          # NextAuth.js route handler
```

## Implementation Details

### Route Handler (`route.ts`)

The route handler exports GET and POST handlers that delegate all authentication logic to NextAuth.js using the configuration from `lib/auth/auth-options.ts`.

**Handled Routes:**
- `GET /api/auth/signin` - Sign in page
- `POST /api/auth/signin/:provider` - Sign in with provider
- `GET /api/auth/callback/:provider` - OAuth callback
- `GET /api/auth/signout` - Sign out page
- `POST /api/auth/signout` - Sign out action
- `GET /api/auth/session` - Get current session
- `GET /api/auth/csrf` - Get CSRF token
- `GET /api/auth/providers` - List available providers

## Requirements Satisfied

### ✅ Requirement 13.1: Email and Password Registration
- Credentials provider configured in `auth-options.ts`
- Password hashing with bcrypt
- User creation flow integrated with Prisma

### ✅ Requirement 13.2: OAuth with Google and GitHub
- Google OAuth provider configured
- GitHub OAuth provider configured
- OAuth callback handling

### ✅ Requirement 13.6: User Workspace Loading on Login
- JWT callback includes user ID in token
- Session callback includes user ID in session
- User workspace can be loaded using `session.user.id`

## Configuration

The authentication configuration is centralized in `lib/auth/auth-options.ts` and includes:

1. **Providers:**
   - Google OAuth
   - GitHub OAuth
   - Email/Password (Credentials)

2. **Session Strategy:**
   - JWT-based sessions
   - 30-day session duration
   - Automatic renewal

3. **Callbacks:**
   - JWT callback: Adds user ID and metadata to token
   - Session callback: Includes user ID in session object
   - Sign-in callback: Allows all authenticated users

4. **Events:**
   - Sign-in event: Logs user authentication
   - New user event: Creates user workspace
   - Sign-out event: Logs user logout

## Usage

### Client-Side

```typescript
import { signIn, signOut, useSession } from 'next-auth/react';

// Sign in with OAuth
await signIn('google');
await signIn('github');

// Sign in with credentials
await signIn('credentials', {
  email: 'user@example.com',
  password: 'password123',
});

// Sign out
await signOut();

// Get session
const { data: session, status } = useSession();
console.log(session?.user.id); // User ID available
```

### Server-Side

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

// In API routes or Server Components
const session = await getServerSession(authOptions);

if (!session) {
  return new Response('Unauthorized', { status: 401 });
}

// Access user ID
const userId = session.user.id;
```

## Security Features

1. **CSRF Protection:** Automatic CSRF token validation
2. **Secure Cookies:** HTTP-only, secure cookies in production
3. **Password Hashing:** bcrypt with salt rounds
4. **Session Expiry:** 30-day automatic expiration
5. **OAuth Security:** State parameter validation

## Testing

To test the authentication flow:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to:
   - Sign in: `http://localhost:3000/api/auth/signin`
   - Session: `http://localhost:3000/api/auth/session`

3. Test providers:
   - Google OAuth
   - GitHub OAuth
   - Email/Password

## Environment Variables Required

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

## Next Steps

After implementing this route handler, the following tasks remain:

1. **Task 3.3:** Build authentication UI pages (sign-in, sign-up)
2. **Task 3.4:** Implement protected route middleware
3. **Integration:** Connect authentication to project management features

## References

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
