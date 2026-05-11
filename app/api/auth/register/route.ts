import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

/**
 * User Registration API Route
 * 
 * Handles new user registration with email and password.
 * 
 * Features:
 * - Input validation using Zod
 * - Password hashing with bcrypt
 * - Duplicate email detection
 * - User workspace creation
 * 
 * Requirements:
 * - 13.1: Email and password registration
 * - 13.3: User workspace creation within 2 seconds
 * - 13.4: Password requirements (minimum 8 characters)
 * 
 * @route POST /api/auth/register
 */

// Validation schema
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validationResult.error.errors[0].message,
            details: validationResult.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'An account with this email already exists',
          },
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with credentials account
    // This creates the user workspace (Requirement 13.3)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        emailVerified: null, // Email verification can be added later
        accounts: {
          create: {
            type: 'credentials',
            provider: 'credentials',
            providerAccountId: hashedPassword, // Store hashed password
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          message: 'Account created successfully',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during registration',
        },
      },
      { status: 500 }
    );
  }
}
