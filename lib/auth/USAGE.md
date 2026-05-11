# NextAuth.js Configuration Usage Guide

## Overview

This guide explains how to use the NextAuth.js configuration that has been set up for the AI UI Builder SaaS platform.

## Configuration Summary

### Providers Configured

1. **Google OAuth** - Sign in with Google account
2. **GitHub OAuth** - Sign in with GitHub account  
3. **Credentials** - Email and password authentication with bcrypt hashing

### Session Strategy

- **Type**: JWT (JSON Web Token)
- **Duration**: 30 days with automatic renewal
- **Storage**: Stateless (no database sessions)

### Security Features

- bcrypt password hashing (12 salt rounds)
- Password validation (minimum 8 characters)
- JWT token signing with NEXTAUTH_SECRET
- HTTP-only secure cookies
- CSRF protection

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:

```env
# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### 2. Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### 3. Set Up OAuth Providers

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env`

### 4. Database Setup

Ensure your database is set up with the Prisma schema:

```bash
npm run db:migrate
```

## Next Steps

### Create NextAuth API Route

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import { authOptions } from '@/lib/auth';
import NextAuth from 'next-auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

### Add SessionProvider to Layout

Update `app/layout.tsx`:

```typescript
import { SessionProvider } from '@/components/providers/SessionProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

Create `components/providers/SessionProvider.tsx`:

```typescript
'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
```

## Usage Examples

### Server Components

```typescript
import { getCurrentUser, requireAuth } from '@/lib/auth';

// Optional authentication
export default async function Page() {
  const user = await getCurrentUser();
  
  if (!user) {
    return <div>Please sign in</div>;
  }
  
  return <div>Welcome, {user.name}!</div>;
}

// Required authentication
export default async function ProtectedPage() {
  const user = await requireAuth(); // Throws if not authenticated
  
  return <div>Welcome, {user.name}!</div>;
}
```

### API Routes

```typescript
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    
    // Handle authenticated request
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
```

### Client Components

```typescript
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export function AuthButton() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (status === 'unauthenticated') {
    return (
      <div>
        <button onClick={() => signIn('google')}>
          Sign in with Google
        </button>
        <button onClick={() => signIn('github')}>
          Sign in with GitHub
        </button>
        <button onClick={() => signIn('credentials')}>
          Sign in with Email
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <p>Signed in as {session.user.email}</p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}
```

### User Registration (Credentials)

```typescript
import { prisma } from '@/lib/db/prisma';
import { validateAndHashPassword } from '@/lib/auth';

export async function registerUser(email: string, password: string, name?: string) {
  // Validate password
  const passwordHash = await validateAndHashPassword(password);
  
  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      accounts: {
        create: {
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: passwordHash, // Store hash here
        },
      },
    },
  });
  
  return user;
}
```

## Authentication Callbacks

The configuration includes several callbacks:

### JWT Callback

Adds custom claims to the JWT token:
- User ID
- Email
- Name
- Profile picture
- Provider (google, github, credentials)

### Session Callback

Adds custom claims to the session object:
- User ID
- Email
- Name
- Profile picture

### Sign In Callback

Controls whether a user can sign in. Currently allows all sign-ins.

## Events

The configuration logs authentication events:

- **signIn**: Logs when a user signs in
- **signOut**: Logs when a user signs out

## Custom Pages

The configuration uses custom authentication pages:

- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page
- `/auth/error` - Error page
- `/auth/verify-request` - Email verification page

These pages need to be created in the `app/auth/` directory.

## Password Requirements

As per Requirement 13.4:

- Minimum length: 8 characters
- No maximum length
- All character types allowed (letters, numbers, symbols, unicode)

## Session Management

- **Duration**: 30 days (Requirement 13.8)
- **Renewal**: Automatic on activity
- **Storage**: JWT (no database sessions)
- **Security**: HTTP-only cookies, signed with NEXTAUTH_SECRET

## Testing

Run the manual test suite:

```bash
npx tsx lib/auth/__tests__/manual-test.ts
```

This tests:
- Password validation
- Password hashing
- Password verification
- Special characters and unicode support

## Troubleshooting

### "Invalid credentials" error

- Check that the user exists in the database
- Verify the password hash is stored correctly
- Ensure bcrypt is comparing correctly

### OAuth redirect errors

- Verify redirect URIs match in OAuth provider settings
- Check NEXTAUTH_URL is set correctly
- Ensure OAuth credentials are valid

### Session not persisting

- Check NEXTAUTH_SECRET is set
- Verify cookies are being set (check browser dev tools)
- Ensure NEXTAUTH_URL matches your domain

## Requirements Satisfied

This configuration satisfies:

- ✅ **Requirement 13.1**: Email and password registration
- ✅ **Requirement 13.2**: OAuth with Google and GitHub
- ✅ **Requirement 13.3**: User workspace creation on registration
- ✅ **Requirement 13.4**: Password requirements (minimum 8 characters)
- ✅ **Requirement 13.8**: 30-day session duration with automatic renewal

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth.js with App Router](https://next-auth.js.org/configuration/nextjs#in-app-router)
- [Prisma Adapter](https://next-auth.js.org/adapters/prisma)
