# Authentication Module

This module provides authentication functionality using NextAuth.js with multiple providers.

## Features

- **Multiple Authentication Providers**
  - Google OAuth
  - GitHub OAuth
  - Email/Password with bcrypt hashing

- **JWT Session Strategy**
  - Scalable serverless-friendly sessions
  - 30-day session duration with automatic renewal

- **Password Security**
  - bcrypt hashing with 12 salt rounds
  - Password validation (minimum 8 characters)

- **TypeScript Support**
  - Full type safety with extended NextAuth types
  - Custom session and JWT interfaces

## Configuration

### Environment Variables

Required environment variables (see `.env.example`):

```env
# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Usage

### Server Components

```typescript
import { getCurrentUser, requireAuth } from '@/lib/auth';

// Get current user (returns null if not authenticated)
const user = await getCurrentUser();

// Require authentication (throws error if not authenticated)
const user = await requireAuth();
```

### API Routes

```typescript
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Handle authenticated request
}
```

### Client Components

```typescript
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (status === 'unauthenticated') {
    return <button onClick={() => signIn()}>Sign In</button>;
  }
  
  return (
    <div>
      <p>Welcome, {session.user.name}!</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### Password Utilities

```typescript
import { validatePassword, hashPassword, verifyPassword } from '@/lib/auth';

// Validate password
const validation = validatePassword('mypassword');
if (!validation.isValid) {
  console.error(validation.errors);
}

// Hash password
const hash = await hashPassword('mypassword');

// Verify password
const isValid = await verifyPassword('mypassword', hash);
```

## Authentication Flow

### OAuth Flow (Google/GitHub)

1. User clicks "Sign in with Google/GitHub"
2. User is redirected to OAuth provider
3. User authorizes the application
4. OAuth provider redirects back with authorization code
5. NextAuth exchanges code for access token
6. User account is created/updated in database
7. JWT session is created
8. User is redirected to application

### Credentials Flow (Email/Password)

1. User enters email and password
2. NextAuth calls `authorize` function
3. User is looked up in database
4. Password is verified using bcrypt
5. JWT session is created
6. User is authenticated

## Database Schema

The authentication system uses the following Prisma models:

- `User` - User accounts
- `Account` - OAuth provider accounts
- `Session` - Database sessions (not used with JWT strategy)
- `VerificationToken` - Email verification tokens

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Signing**: Secure JWT tokens with NEXTAUTH_SECRET
- **Session Expiry**: 30-day automatic expiration
- **CSRF Protection**: Built-in CSRF token validation
- **Secure Cookies**: HTTP-only, secure cookies in production

## Requirements Validation

This module satisfies the following requirements:

- **13.1**: Email and password registration ✓
- **13.2**: OAuth with Google and GitHub ✓
- **13.3**: User workspace creation on registration ✓
- **13.4**: Password requirements (minimum 8 characters) ✓

## Next Steps

1. Create NextAuth API route handler (`app/api/auth/[...nextauth]/route.ts`)
2. Create authentication UI pages (sign in, sign up)
3. Add SessionProvider to root layout
4. Implement protected route middleware
