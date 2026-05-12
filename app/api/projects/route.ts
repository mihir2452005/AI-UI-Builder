/**
 * Project Management API Routes
 * 
 * Handles project listing and creation
 * 
 * Requirements:
 * - 14.1: List user projects
 * - 14.2: Create new project
 * - 14.3: Project CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { SaveProjectSchema, validateRequest } from '@/lib/validation/schemas';
import { getEmptyUIDocument } from '@/lib/ai/helpers';
import type { ApiResponse, ProjectSummary, CreateProjectResponse } from '@/types/api';

/**
 * GET /api/projects
 * 
 * List all projects for the authenticated user
 * Returns lightweight project summaries (no full uiDocument)
 * 
 * Requirements:
 * - 14.1: List user projects
 * - 14.4: Display project metadata
 */
export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be signed in to access projects',
            statusCode: 401,
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse,
        { status: 401 }
      );
    }
    
    // Fetch user's projects (ordered by most recently updated)
    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail: true,
        updatedAt: true,
        userId: true,
        uiDocument: true, // Need to count components
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    
    // Transform to ProjectSummary format with component count
    const projectSummaries: ProjectSummary[] = projects.map((project) => {
      // Count components in the UI document
      let componentCount = 0;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const uiDoc = project.uiDocument as any;
        if (uiDoc && uiDoc.root) {
          componentCount = countComponents(uiDoc.root);
        }
      } catch (error) {
        console.error(`Failed to count components for project ${project.id}:`, error);
      }
      
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        thumbnail: project.thumbnail,
        updatedAt: project.updatedAt.toISOString(),
        componentCount,
        userId: project.userId,
      };
    });
    
    return NextResponse.json(
      {
        success: true,
        data: {
          projects: projectSummaries,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse<{ projects: ProjectSummary[] }>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch projects',
          statusCode: 500,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * 
 * Create a new project with empty UI document
 * 
 * Requirements:
 * - 14.2: Create new project
 * - 14.3: Project CRUD operations
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be signed in to create projects',
            statusCode: 401,
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse,
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    
    let validatedData;
    try {
      validatedData = validateRequest(SaveProjectSchema, body);
    } catch (error: unknown) {
      const err = error as { errors?: unknown[] };
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: {
              errors: err.errors || [],
            },
            statusCode: 400,
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse,
        { status: 400 }
      );
    }
    
    // Create empty UI document
    const emptyUIDocument = getEmptyUIDocument();
    
    // Create project in database
    const project = await prisma.project.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        userId: session.user.id,
        uiDocument: emptyUIDocument as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      },
    });
    
    // Count components (should be 1 for empty container)
    const componentCount = countComponents(emptyUIDocument.root);
    
    // Return created project
    return NextResponse.json(
      {
        success: true,
        data: {
          project: {
            id: project.id,
            name: project.name,
            description: project.description,
            thumbnail: project.thumbnail,
            updatedAt: project.updatedAt.toISOString(),
            componentCount,
            userId: project.userId,
            uiDocument: emptyUIDocument,
            createdAt: project.createdAt.toISOString(),
          },
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse<CreateProjectResponse>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create project:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create project',
          statusCode: 500,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * Helper function to count components in a component tree
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function countComponents(node: any): number {
  if (!node) return 0;
  
  let count = 1; // Count current node
  
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      count += countComponents(child);
    }
  }
  
  return count;
}
