import { NextRequest, NextResponse } from 'next/server';
import { PromptEngine } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (prompt.length < 1 || prompt.length > 1000) {
      return NextResponse.json(
        { error: 'Prompt must be between 1 and 1000 characters' },
        { status: 400 }
      );
    }

    // Initialize the prompt engine
    const engine = new PromptEngine();

    // Generate UI
    const result = await engine.generateUI(prompt, {
      userId: 'test-user',
    });

    return NextResponse.json({
      success: true,
      uiDocument: result.uiDocument,
      tokensUsed: result.tokensUsed,
      generationTime: result.generationTime,
      cached: result.cached,
    });
  } catch (error: any) {
    console.error('AI generation error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate UI',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
