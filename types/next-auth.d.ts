// types/next-auth.d.ts

import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

/**
 * NextAuth Type Extensions
 * 
 * Extends default NextAuth types to include custom user properties
 */

declare module 'next-auth' {
  /**
   * Extended Session interface
   * Adds custom user properties to the session
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
    } & DefaultSession['user'];
  }

  /**
   * Extended User interface
   * Adds custom properties to the user object
   */
  interface User extends DefaultUser {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extended JWT interface
   * Adds custom claims to the JWT token
   */
  interface JWT extends DefaultJWT {
    id: string;
    email: string;
    name: string | null;
    picture: string | null;
    provider?: string;
  }
}
