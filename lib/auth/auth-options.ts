// lib/auth/auth-options.ts

import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';

/**
 * NextAuth.js Configuration
 * 
 * Configures authentication with multiple providers:
 * - Google OAuth
 * - GitHub OAuth
 * - Email/Password with bcrypt hashing
 * 
 * Uses JWT session strategy for scalability
 * 
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  // Use Prisma adapter for database sessions
  adapter: PrismaAdapter(prisma),
  
  // Configure authentication providers
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    
    // GitHub OAuth Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
    
    // Credentials Provider (Email/Password)
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'your@email.com',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        // Validate input
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }
        
        // Find user by email
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            accounts: true,
          },
        });
        
        // Check if user exists
        if (!user) {
          throw new Error('No user found with this email');
        }
        
        // Check if user has a password (not OAuth-only account)
        const passwordAccount = user.accounts.find(
          (account: { provider: string }) => account.provider === 'credentials'
        );
        
        if (!passwordAccount || !passwordAccount.providerAccountId) {
          throw new Error('Please sign in with your OAuth provider');
        }
        
        // Verify password using bcrypt
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          passwordAccount.providerAccountId // Password hash stored here
        );
        
        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }
        
        // Return user object
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  
  // Use JWT session strategy (recommended for serverless)
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days (Requirement 13.8)
  },
  
  // Configure JWT
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Custom pages
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  
  // Callbacks for JWT and session handling
  callbacks: {
    /**
     * JWT Callback
     * Called whenever a JWT is created or updated
     * Add custom claims to the token
     */
    async jwt({ token, user, account, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      
      // Add account provider info
      if (account) {
        token.provider = account.provider;
      }
      
      // Handle token updates (e.g., profile updates)
      if (trigger === 'update') {
        // Fetch fresh user data
        const updatedUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });
        
        if (updatedUser) {
          token.name = updatedUser.name;
          token.email = updatedUser.email;
          token.picture = updatedUser.image;
        }
      }
      
      return token;
    },
    
    /**
     * Session Callback
     * Called whenever a session is checked
     * Add custom claims to the session
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      
      return session;
    },
    
    /**
     * Sign In Callback
     * Control whether a user is allowed to sign in
     */
    async signIn() {
      // Allow all sign-ins for now
      // Can add email verification checks here later
      return true;
    },
  },
  
  // Events for logging and analytics
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`User signed in: ${user.email} via ${account?.provider}`);
      
      // Create user workspace on first sign-in (Requirement 13.3)
      if (isNewUser) {
        console.log(`New user registered: ${user.email}`);
        // Workspace is implicitly created via user record
        // Additional workspace setup can be added here
      }
    },
    async signOut({ token }) {
      console.log(`User signed out: ${token?.email}`);
    },
  },
  
  // Enable debug messages in development
  debug: process.env.NODE_ENV === 'development',
};
