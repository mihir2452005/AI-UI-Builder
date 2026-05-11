# Authentication UI Pages

This directory contains all authentication-related UI pages for the AI UI Builder SaaS platform.

## Pages

### Sign In (`/auth/signin`)
- **File**: `app/auth/signin/page.tsx`
- **Features**:
  - Email/password authentication
  - Google OAuth sign-in
  - GitHub OAuth sign-in
  - Client-side form validation
  - Error handling and display
  - Loading states
  - Redirect to callback URL after sign-in
- **Requirements**: 13.1, 13.2, 13.5

### Sign Up (`/auth/signup`)
- **File**: `app/auth/signup/page.tsx`
- **Features**:
  - Email/password registration
  - Google OAuth sign-up
  - GitHub OAuth sign-up
  - Password strength validation (min 8 characters)
  - Password confirmation
  - Client-side form validation
  - Error handling and display
  - Automatic sign-in after registration
- **Requirements**: 13.1, 13.2, 13.4, 13.5

### Error (`/auth/error`)
- **File**: `app/auth/error/page.tsx`
- **Features**:
  - User-friendly error messages
  - Error code mapping
  - Action buttons to retry
  - Support contact link
- **Requirements**: 13.5

### Verify Request (`/auth/verify-request`)
- **File**: `app/auth/verify-request/page.tsx`
- **Features**:
  - Email verification instructions
  - Troubleshooting tips
  - Support contact link
- **Requirements**: 13.5

## API Routes

### Registration (`/api/auth/register`)
- **File**: `app/api/auth/register/route.ts`
- **Method**: POST
- **Features**:
  - Input validation using Zod
  - Password hashing with bcrypt
  - Duplicate email detection
  - User workspace creation
- **Requirements**: 13.1, 13.3, 13.4

## Form Validation

### Email Validation
- Format: Standard email regex pattern
- Required field

### Password Validation
- Minimum length: 8 characters (Requirement 13.4)
- Required field
- Must match confirmation on sign-up

### Name Validation (Sign-up only)
- Required field
- Maximum length: 100 characters

## Error Handling

### Client-Side Errors
- Empty fields
- Invalid email format
- Password too short
- Passwords don't match
- Network errors

### Server-Side Errors
- User already exists
- Invalid credentials
- OAuth provider errors
- Database errors

## User Flow

### Sign Up Flow
1. User fills out registration form or clicks OAuth button
2. Client validates input
3. POST request to `/api/auth/register` (for email/password)
4. User account created in database
5. Automatic sign-in with NextAuth
6. Redirect to dashboard

### Sign In Flow
1. User fills out sign-in form or clicks OAuth button
2. Client validates input
3. NextAuth handles authentication
4. Session created
5. Redirect to callback URL (default: `/dashboard`)

### OAuth Flow
1. User clicks OAuth button (Google or GitHub)
2. Redirect to OAuth provider
3. User authorizes application
4. Callback to `/api/auth/callback/[provider]`
5. Account created or linked
6. Session created
7. Redirect to callback URL

## Styling

All pages use:
- Tailwind CSS for styling
- Gradient backgrounds (blue-50 to indigo-100)
- White cards with shadow-xl
- Consistent button styles
- Responsive design (mobile-first)
- Loading spinners for async operations
- Error message styling (red-50 background)

## Security Features

- Password hashing with bcrypt (10 rounds)
- CSRF protection via NextAuth
- Session management with JWT
- Secure OAuth flows
- Input validation and sanitization
- Error messages don't leak sensitive information

## Testing

### Manual Testing Checklist

#### Sign In Page
- [ ] Email/password sign-in works
- [ ] Google OAuth sign-in works
- [ ] GitHub OAuth sign-in works
- [ ] Validation errors display correctly
- [ ] Loading states show during authentication
- [ ] Redirects to dashboard after successful sign-in
- [ ] Error messages are user-friendly
- [ ] Link to sign-up page works

#### Sign Up Page
- [ ] Email/password registration works
- [ ] Google OAuth sign-up works
- [ ] GitHub OAuth sign-up works
- [ ] Password validation enforces 8 character minimum
- [ ] Password confirmation validation works
- [ ] Duplicate email detection works
- [ ] User workspace is created
- [ ] Automatic sign-in after registration works
- [ ] Link to sign-in page works

#### Error Page
- [ ] Displays correct error messages for different error codes
- [ ] Action buttons work correctly
- [ ] Support link is accessible

#### Registration API
- [ ] Validates input correctly
- [ ] Rejects duplicate emails
- [ ] Hashes passwords securely
- [ ] Creates user and account records
- [ ] Returns appropriate error codes

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
DATABASE_URL=your-database-url
```

## Next Steps

After implementing authentication UI (Task 3.3), the following tasks remain:

1. **Task 3.4**: Implement protected route middleware
   - Create `middleware.ts` to protect `/dashboard` and `/editor` routes
   - Add session verification logic

2. **Integration**: Connect authentication to project management
   - Load user projects on dashboard
   - Associate projects with authenticated users

## Dependencies

- `next-auth`: Authentication framework
- `@next-auth/prisma-adapter`: Prisma adapter for NextAuth
- `bcryptjs`: Password hashing
- `zod`: Input validation
- `@prisma/client`: Database access

## Related Files

- `lib/auth/auth-options.ts`: NextAuth configuration
- `app/api/auth/[...nextauth]/route.ts`: NextAuth API handler
- `prisma/schema.prisma`: Database schema
- `.env`: Environment variables
