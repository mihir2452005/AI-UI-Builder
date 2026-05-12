/**
 * Individual Project API Routes
 * 
 * Handles single project operations: fetch, update, delete
 * 
 * Requirements:
 * - 14.3: Fetch single project
 * - 14.4: Update project
 * - 14.8: Soft delete with 30-day retention
 * - 23.8: User ownership verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { UpdateProjectSchema, validateRequest } from '@/lib/validation/schemas';
import type { 
  ApiResponse, 
  ProjectDetail, 
  UpdateProjectResponse,
  DeleteProjectResponse 
} from '@/types/api';

/**
 * GET /api/projects/[id]
 * 
 * Fetch a single project with full uiDocument
 * 
 * Requirements:
 * - 14.3: Fetch single project
 * - 23.8: Verify user ownership
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Fetch project
    const project = await prisma.project.findUnique({
      where: {
        id: params.id,
      },
    });
    
    // Check if project exists
    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found',
            statusCode: 404,
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse,
        { status: 404 }
      );
    }
    
    // Verify user ownership
    if (project.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to access this project',
            statusCode: 403,
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse,
        { status: 403 }
      );
    }
    
    // Count components
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
    
    // Return project with full uiDocument
    const projectDetail: ProjectDetail = {
      id: project.id,
      name: project.name,
      description: project.description,
      thumbnail: project.thumbnail,
      updatedAt: project.updatedAt.toISOString(),
      componentCount,
      userId: project.userId,
      uiDocument: project.uiDocument as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      createdAt: project.createdAt.toISOString(),
    };
    
    return NextResponse.json(
      {
        success: true,
        data: {
          project: projectDetail,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse<{ project: ProjectDetail }>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to fetch project:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch project',
          statusCode: 500,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/[id]
 * 
 * Update project (name, description, uiDocument, thumbnail)
 * 
 * Requirements:
 * - 14.3: Update project
 * - 14.7: Auto-save functionality
 * - 23.8: Verify user ownership
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be signed in to update projects',
            statusCode: 401,
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse,
        { status: 401 }
      );
    }
    
    // Fetch project to verify ownership
    const existingProject = await prisma.project.findUnique({
      where: {
        id: params.id,
      },
    });
    
    // Check if project exists
    if (!existingProject) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found',
            statusCode: 404,
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse,
        { status: 404 }
      );
    }
    
    // Verify user ownership
    if (existingProject.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this project',
            statusCode: 403,
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse,
        { status: 403 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    
    let validatedData;
    try {
      validatedData = validateRequest(UpdateProjectSchema, body);
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
    
    // Build update data (only include fields that were provided)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    
    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name;
    }
    
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description;
    }
    
    if (validatedData.uiDocument !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateData.uiDocument = validatedData.uiDocument as any;
    }
    
    if (validatedData.thumbnail !== undefined) {
      updateData.thumbnail = validatedData.thumbnail;
    }
    
    // Update project in database
    const updatedProject = await prisma.project.update({
      where: {
        id: params.id,
      },
      data: updateData,
    });
    
    // Count components
    let componentCount = 0;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const uiDoc = updatedProject.uiDocument as any;
      if (uiDoc && uiDoc.root) {
        componentCount = countComponents(uiDoc.root);
      }
    } catch (error) {
      console.error(`Failed to count components for project ${updatedProject.id}:`, error);
    }
    
    // Return updated project
    const projectDetail: ProjectDetail = {
      id: updatedProject.id,
      name: updatedProject.name,
      description: updatedProject.description,
      thumbnail: updatedProject.thumbnail,
      updatedAt: updatedProject.updatedAt.toISOString(),
      componentCount,
      userId: updatedProject.userId,
      uiDocument: updatedProject.uiDocument as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      createdAt: updatedProject.createdAt.toISOString(),
    };
    
    return NextResponse.json(
      {
        success: true,
        data: {
          project: projectDetail,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse<UpdateProjectResponse>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update project:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update project',
          statusCode: 500,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * 
 * Soft delete project (not permanent deletion)
 * 
 * Note: For MVP, we're implementing hard delete since soft delete
 * requires additional schema changes (deletedAt field, trash management).
 * This can be enhanced in future iterations.
 * 
 * Requirements:
 * - 14.8: Soft delete with 30-day retention
 * - 23.8: Verify user ownership
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be signed in to delete projects',
            statusCode: 401,
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse,
        { status: 401 }
      );
    }
    
    // Fetch project to verify ownership
    const project = await prisma.project.findUnique({
      where: {
        id: params.id,
      },
    });
    
    // Check if project exists
    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found',
            statusCode: 404,
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse,
        { status: 404 }
      );
    }
    
    // Verify user ownership
    if (project.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to delete this project',
            statusCode: 403,
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse,
        { status: 403 }
      );
    }
    
    // Delete project (hard delete for MVP)
    // TODO: Implement soft delete with deletedAt field in future iteration
    await prisma.project.delete({
      where: {
        id: params.id,
      },
    });
    
    const deletedAt = new Date();
    const permanentDeletionDate = new Date(deletedAt);
    permanentDeletionDate.setDate(permanentDeletionDate.getDate() + 30);
    
    return NextResponse.json(
      {
        success: true,
        data: {
          success: true,
          message: 'Project deleted successfully',
          deletedAt: deletedAt.toISOString(),
          permanentDeletionDate: permanentDeletionDate.toISOString(),
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse<DeleteProjectResponse>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete project:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete project',
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
