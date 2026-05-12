/**
 * AI Generation API Route
 * 
 * POST /api/ai/generate
 * 
 * Generates UI from natural language prompts using the centralized AI service
 * 
 * Requirements:
 * - 1.1: AI prompt-to-UI generation
 * - 1.2: UI specification generation within 5 seconds
 * - 1.3: Parse and validate AI responses
 * - 25.3: Rate limiting per user (10 requests per hour)
 * 
 * Features:
 * - Authentication check using NextAuth
 * - Rate limiting per user (10 requests/hour)
 * - Input validation using Zod schemas
 * - AI-powered UI generation via PromptEngine
 * - Returns generated UI with metadata (tokens used, generation time)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { PromptEngine } from '@/lib/ai';
import { GenerateUISchema } from '@/lib/validation/schemas';
import { aiGenerationRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { ZodError } from 'zod';
import type { UIDocument, ComponentNode } from '@/types/ui-schema';

/**
 * Helper function to count total components in a UI document
 */
function countComponents(uiDocument: UIDocument): number {
  let count = 0;
  
  function traverse(node: ComponentNode) {
    count++;
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(traverse);
    }
  }
  
  if (uiDocument.root) {
    traverse(uiDocument.root as ComponentNode);
  }
  
  return count;
}

/**
 * POST /api/ai/generate
 * 
 * Generate UI from natural language prompt
 * 
 * Request Body:
 * - prompt: string (1-1000 chars, required)
 * - projectId: string (optional)
 * - preserveManualEdits: boolean (optional, default: false)
 * - existingDocument: UIDocument (optional)
 * 
 * Response:
 * - success: boolean
 * - data: { uiDocument, tokensUsed, generationTime, cached }
 * - error: { code, message } (if error)
 * 
 * Status Codes:
 * - 200: Success
 * - 400: Invalid request (validation error)
 * - 401: Unauthorized (not authenticated)
 * - 429: Too many requests (rate limit exceeded)
 * - 500: Internal server error
 */
export async function POST(request: NextRequest) {
  let userId: string | undefined;
  let body: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be signed in to generate UI',
          },
        },
        { status: 401 }
      );
    }
    
    userId = session.user.id;
    
    // 2. Check rate limit (10 requests per hour per user)
    const rateLimitResult = await aiGenerationRateLimit.limit(userId);
    
    // Add rate limit headers to response
    const rateLimitHeaders = getRateLimitHeaders({
      limit: rateLimitResult.limit,
      remaining: rateLimitResult.remaining,
      reset: rateLimitResult.reset,
    });
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'You have exceeded the rate limit for AI generation. Please try again later.',
            rateLimit: {
              limit: rateLimitResult.limit,
              remaining: rateLimitResult.remaining,
              reset: new Date(rateLimitResult.reset).toISOString(),
            },
          },
        },
        {
          status: 429,
          headers: rateLimitHeaders,
        }
      );
    }
    
    // 3. Parse and validate request body
    body = await request.json();
    
    let validatedInput;
    try {
      validatedInput = GenerateUISchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid request data',
              details: error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
              })),
            },
          },
          {
            status: 400,
            headers: rateLimitHeaders,
          }
        );
      }
      throw error;
    }
    
    // 4. Initialize PromptEngine
    const engine = new PromptEngine();
    
    // 5. Generate UI from prompt
    const startTime = Date.now();
    
    const result = await engine.generateUI(validatedInput.prompt, {
      projectId: validatedInput.projectId,
      existingDocument: validatedInput.existingDocument as UIDocument | undefined,
      preserveManualEdits: validatedInput.preserveManualEdits,
      userId,
    });
    
    const generationTime = Date.now() - startTime;
    
    // 6. Log generation for analytics and monitoring
    // Requirements: 29.5 - Log generation attempts
    const logData = {
      timestamp: new Date().toISOString(),
      userId,
      event: 'ai_generation_success',
      promptLength: validatedInput.prompt.length,
      tokensUsed: result.tokensUsed,
      generationTime,
      cached: result.cached,
      projectId: validatedInput.projectId,
      preserveManualEdits: validatedInput.preserveManualEdits,
      componentCount: countComponents(result.uiDocument),
    };
    
    // eslint-disable-next-line no-console
    console.log('AI Generation Success:', logData);
    
    // In production, send to analytics service
    // await analytics.track('ai_generation_success', logData);
    
    // 7. Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          uiDocument: result.uiDocument,
          tokensUsed: result.tokensUsed,
          generationTime: result.generationTime,
          cached: result.cached,
        },
      },
      {
        status: 200,
        headers: rateLimitHeaders,
      }
    );
  } catch (error) {
    // Enhanced error handling with specific error types and user-friendly messages
    // Requirements: 29.1, 29.2, 29.5
    
    // Log detailed error information for debugging
    console.error('AI generation error:', {
      timestamp: new Date().toISOString(),
      userId: userId,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      prompt: body?.prompt?.substring(0, 100), // Log first 100 chars of prompt
    });
    
    // Determine error type and provide user-friendly messages
    let errorCode = 'INTERNAL_ERROR';
    let errorMessage = 'An unexpected error occurred while generating your UI';
    let statusCode = 500;
    let suggestions: string[] = [];
    
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      
      // AI Service failures
      if (errorMsg.includes('api key') || errorMsg.includes('unauthorized')) {
        errorCode = 'AI_SERVICE_AUTH_ERROR';
        errorMessage = 'AI service authentication failed. Please contact support.';
        suggestions = [
          'This is a platform configuration issue',
          'Please try again in a few moments',
          'Contact support if the issue persists',
        ];
      } else if (errorMsg.includes('rate limit')) {
        errorCode = 'AI_SERVICE_RATE_LIMIT';
        errorMessage = 'AI service is temporarily unavailable due to high demand';
        statusCode = 503;
        suggestions = [
          'Please wait a few minutes and try again',
          'Consider simplifying your prompt',
          'Try again during off-peak hours',
        ];
      } else if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
        errorCode = 'AI_SERVICE_TIMEOUT';
        errorMessage = 'AI generation took too long and timed out';
        statusCode = 504;
        suggestions = [
          'Try a simpler or shorter prompt',
          'Break complex UIs into smaller parts',
          'Try again in a moment',
        ];
      } else if (errorMsg.includes('model') && errorMsg.includes('not')) {
        errorCode = 'AI_MODEL_ERROR';
        errorMessage = 'AI model configuration error. Please contact support.';
        suggestions = [
          'This is a platform configuration issue',
          'Please try again later',
          'Contact support for assistance',
        ];
      } else if (errorMsg.includes('parse') || errorMsg.includes('json')) {
        errorCode = 'AI_RESPONSE_PARSE_ERROR';
        errorMessage = 'Failed to process AI response. Please try rephrasing your prompt.';
        suggestions = [
          'Try rephrasing your prompt more clearly',
          'Be more specific about what you want',
          'Try a simpler UI description first',
        ];
      } else if (errorMsg.includes('validation') || errorMsg.includes('schema')) {
        errorCode = 'AI_RESPONSE_VALIDATION_ERROR';
        errorMessage = 'AI generated an invalid UI structure. Please try again.';
        suggestions = [
          'Try rephrasing your prompt',
          'Be more specific about component types',
          'Try a different approach to describing your UI',
        ];
      } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        errorCode = 'NETWORK_ERROR';
        errorMessage = 'Network error while connecting to AI service';
        statusCode = 503;
        suggestions = [
          'Check your internet connection',
          'Try again in a moment',
          'Contact support if the issue persists',
        ];
      } else {
        // Generic error with the actual error message
        errorMessage = `Failed to generate UI: ${error.message}`;
        suggestions = [
          'Try rephrasing your prompt',
          'Ensure your prompt is clear and specific',
          'Try again in a moment',
        ];
      }
    }
    
    // Include stack trace in development mode only
    const errorDetails = process.env.NODE_ENV === 'development' && error instanceof Error
      ? { stack: error.stack }
      : undefined;
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
          suggestions,
          details: errorDetails,
        },
      },
      { status: statusCode }
    );
  }
}
