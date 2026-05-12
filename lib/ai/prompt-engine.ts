/**
 * Prompt Engine
 * 
 * Core AI prompt processing engine that transforms natural language
 * into structured UI specifications
 * 
 * Requirements:
 * - 1.1: AI prompt-to-UI generation
 * - 1.2: UI specification generation
 * - 1.3: Parse and validate AI responses
 * - 2.2: Preserve manually edited components
 * - 2.5: Handle existing document context
 * - 2.6: Identify and preserve manual edits
 * - 25.1: Centralized AI provider
 * - 25.5: Retry logic with exponential backoff
 * - 25.6: Prompt caching
 * - 25.7: AI response validation
 * - 25.8: AI usage logging
 */

import { nanoid } from 'nanoid';
import type { UIDocument, PromptHistoryEntry, ComponentNode } from '@/types/ui-schema';
import { UIDocumentSchema } from '@/lib/validation/schemas';
import { createAIModel } from './models';
import type { AIModel } from './models';
import { buildSystemPrompt, buildUserPrompt } from './prompt-templates';
import {
  getCacheKey,
  extractJSONFromMarkdown,
  sleep,
  calculateBackoff,
  validateAndFixAIResponse,
  findManuallyEditedComponents,
} from './utils';

/**
 * Generation context for prompt processing
 */
export interface GenerationContext {
  projectId?: string;
  existingDocument?: UIDocument;
  preserveManualEdits?: boolean;
  userId?: string;
}

/**
 * Generation result with metadata
 */
export interface GenerationResult {
  uiDocument: UIDocument;
  tokensUsed: number;
  generationTime: number;
  cached: boolean;
}

/**
 * Simple in-memory cache for prompt results
 * In production, this should use Redis
 */
class PromptCache {
  private cache: Map<string, { data: UIDocument; timestamp: number }> = new Map();
  private readonly TTL = 1000 * 60 * 60; // 1 hour
  
  async get(key: string): Promise<UIDocument | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  async set(key: string, data: UIDocument): Promise<void> {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
  
  async clear(): Promise<void> {
    this.cache.clear();
  }
}

/**
 * Main Prompt Engine class
 */
export class PromptEngine {
  private aiModel: AIModel;
  private cache: PromptCache;
  
  constructor() {
    this.aiModel = createAIModel();
    this.cache = new PromptCache();
  }
  
  /**
   * Generate UI from natural language prompt
   * 
   * @param prompt - User's natural language description
   * @param context - Optional generation context
   * @returns Generated UIDocument with metadata
   */
  async generateUI(
    prompt: string,
    context?: GenerationContext
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    
    // 1. Check cache
    const cacheKey = getCacheKey(prompt, {
      projectId: context?.projectId,
      preserveManualEdits: context?.preserveManualEdits,
    });
    
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      console.log('Cache hit for prompt:', prompt.substring(0, 50));
      return {
        uiDocument: cached,
        tokensUsed: 0,
        generationTime: Date.now() - startTime,
        cached: true,
      };
    }
    
    // 2. Build prompts
    const systemPrompt = buildSystemPrompt({
      existingDocument: context?.existingDocument as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      preserveManualEdits: context?.preserveManualEdits,
    });
    
    const userPrompt = buildUserPrompt(prompt, {
      preserveManualEdits: context?.preserveManualEdits,
    });
    
    // 3. Call AI with retry logic
    const response = await this.callAIWithRetry(systemPrompt, userPrompt);
    
    // 4. Parse and validate response
    const uiDocument = this.parseAIResponse(response.content, prompt);
    
    // 5. Handle manual edits preservation
    if (context?.preserveManualEdits && context?.existingDocument) {
      this.preserveManualEdits(uiDocument, context.existingDocument);
    }
    
    // 6. Cache result
    await this.cache.set(cacheKey, uiDocument);
    
    // 7. Log AI usage
    this.logAIUsage({
      userId: context?.userId,
      prompt,
      tokensUsed: response.tokensUsed,
      model: this.aiModel.getModelName(),
      provider: this.aiModel.getProviderName(),
      generationTime: Date.now() - startTime,
    });
    
    return {
      uiDocument,
      tokensUsed: response.tokensUsed,
      generationTime: Date.now() - startTime,
      cached: false,
    };
  }
  
  /**
   * Call AI with retry logic and exponential backoff
   * 
   * Requirements:
   * - 25.5: Retry logic with exponential backoff (3 attempts)
   * - 29.1: User-friendly error messages
   * - 29.5: Log generation attempts and errors
   */
  private async callAIWithRetry(
    systemPrompt: string,
    userPrompt: string,
    maxRetries: number = 3
  ) {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Log attempt
        console.log('AI Generation Attempt:', {
          timestamp: new Date().toISOString(),
          attempt: attempt + 1,
          maxRetries,
          promptLength: userPrompt.length,
        });
        
        const response = await this.aiModel.complete({
          system: systemPrompt,
          user: userPrompt,
          temperature: 0.7,
          maxTokens: 4000,
        });
        
        // Log success
        console.log('AI Generation Attempt Success:', {
          timestamp: new Date().toISOString(),
          attempt: attempt + 1,
          tokensUsed: response.tokensUsed,
          model: response.model,
        });
        
        return response;
      } catch (error) {
        lastError = error as Error;
        
        // Log error with detailed information
        console.error('AI Generation Attempt Failed:', {
          timestamp: new Date().toISOString(),
          attempt: attempt + 1,
          maxRetries,
          error: {
            name: lastError.name,
            message: lastError.message,
            stack: process.env.NODE_ENV === 'development' ? lastError.stack : undefined,
          },
          willRetry: attempt < maxRetries - 1,
        });
        
        // If this is the last attempt, throw a user-friendly error
        if (attempt === maxRetries - 1) {
          // Enhance error message for better user experience
          const errorMsg = lastError.message;
          
          if (errorMsg.includes('rate limit')) {
            throw new Error(
              'AI service rate limit exceeded. Please try again in a few minutes.'
            );
          } else if (errorMsg.includes('timeout')) {
            throw new Error(
              'AI service request timed out. Please try a simpler prompt or try again later.'
            );
          } else if (errorMsg.includes('API key') || errorMsg.includes('unauthorized')) {
            throw new Error(
              'AI service authentication failed. Please contact support.'
            );
          } else if (errorMsg.includes('model')) {
            throw new Error(
              'AI model configuration error. Please contact support.'
            );
          } else {
            throw new Error(
              `AI service failed after ${maxRetries} attempts: ${lastError.message}`
            );
          }
        }
        
        // Exponential backoff
        const delay = calculateBackoff(attempt);
        console.log(`Retrying AI request in ${delay}ms...`);
        await sleep(delay);
      }
    }
    
    throw lastError!;
  }
  
  /**
   * Parse AI response and validate against schema
   * 
   * Requirements:
   * - 1.3: Parse and validate AI responses
   * - 25.7: Validation error logging
   * - 29.1: User-friendly error messages
   * - 29.5: Log errors with details
   */
  private parseAIResponse(response: string, originalPrompt: string): UIDocument {
    try {
      // Log parsing attempt
      console.log('Parsing AI Response:', {
        timestamp: new Date().toISOString(),
        responseLength: response.length,
        promptLength: originalPrompt.length,
      });
      
      // Extract JSON from markdown code blocks if present
      const jsonString = extractJSONFromMarkdown(response);
      
      // Parse JSON
      let parsed;
      try {
        parsed = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('JSON Parse Error:', {
          timestamp: new Date().toISOString(),
          error: parseError instanceof Error ? parseError.message : 'Unknown error',
          responsePreview: response.substring(0, 200),
        });
        throw new Error(
          'Failed to parse AI response as JSON. The AI may have generated invalid output. Please try rephrasing your prompt.'
        );
      }
      
      // Auto-fix common issues
      const fixed = validateAndFixAIResponse(parsed);
      
      // Add prompt to history
      const promptEntry: PromptHistoryEntry = {
        id: nanoid(),
        prompt: originalPrompt,
        timestamp: new Date().toISOString(),
        resultingTreeSnapshot: fixed.root,
      };
      
      fixed.metadata.promptHistory.push(promptEntry);
      fixed.metadata.currentPromptIndex = fixed.metadata.promptHistory.length - 1;
      
      // Validate against Zod schema
      let validated;
      try {
        validated = UIDocumentSchema.parse(fixed);
      } catch (validationError) {
        console.error('Schema Validation Error:', {
          timestamp: new Date().toISOString(),
          error: validationError,
          fixedDocument: JSON.stringify(fixed).substring(0, 500),
        });
        throw new Error(
          'AI generated an invalid UI structure. Please try rephrasing your prompt with more specific details.'
        );
      }
      
      // Log successful parsing
      console.log('AI Response Parsed Successfully:', {
        timestamp: new Date().toISOString(),
        rootId: (validated.root as ComponentNode)?.id,
        componentCount: this.countComponentsInTree(validated.root as ComponentNode),
      });
      
      return validated as UIDocument;
    } catch (error) {
      // Enhanced error logging
      console.error('Failed to parse AI response:', {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        } : error,
        responsePreview: response.substring(0, 500),
        promptPreview: originalPrompt.substring(0, 200),
      });
      
      // Re-throw with user-friendly message if not already enhanced
      if (error instanceof Error && !error.message.includes('Please try')) {
        throw new Error(
          `Failed to parse AI response: ${error.message}. Please try rephrasing your prompt.`
        );
      }
      throw error;
    }
  }
  
  /**
   * Helper to count components in a tree
   */
  private countComponentsInTree(node: ComponentNode): number {
    let count = 1; // Count this node
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child) => {
        count += this.countComponentsInTree(child as ComponentNode);
      });
    }
    return count;
  }
  
  /**
   * Preserve manually edited components from existing document
   * 
   * Requirements:
   * - 2.2: Preserve manually edited components
   * - 2.5: Handle existing document context
   * - 2.6: Identify and preserve manual edits
   */
  private preserveManualEdits(
    newDocument: UIDocument,
    existingDocument: UIDocument
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const manuallyEditedIds = findManuallyEditedComponents(existingDocument.root as any);
    
    if (manuallyEditedIds.length === 0) {
      return;
    }
    
    console.log('Preserving manually edited components:', manuallyEditedIds);
    
    // Build a map of manually edited components
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const manuallyEditedMap = new Map<string, any>();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function collectManuallyEdited(node: any) {
      if (node.metadata?.manuallyEdited) {
        manuallyEditedMap.set(node.id, node);
      }
      
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(collectManuallyEdited);
      }
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collectManuallyEdited(existingDocument.root as any);
    
    // Replace components in new document with manually edited versions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function replaceManuallyEdited(node: any): any {
      // If this component was manually edited, use the old version
      if (manuallyEditedMap.has(node.id)) {
        return manuallyEditedMap.get(node.id);
      }
      
      // Otherwise, recursively process children
      if (node.children && Array.isArray(node.children)) {
        node.children = node.children.map(replaceManuallyEdited);
      }
      
      return node;
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newDocument.root = replaceManuallyEdited(newDocument.root as any);
  }
  
  /**
   * Log AI usage for cost tracking and analytics
   * 
   * Requirements:
   * - 25.8: Log AI usage per user
   * - 29.5: Log generation attempts with details
   */
  private logAIUsage(data: {
    userId?: string;
    prompt: string;
    tokensUsed: number;
    model: string;
    provider: string;
    generationTime: number;
  }): void {
    // Enhanced logging with structured data
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: 'ai_usage',
      userId: data.userId || 'anonymous',
      promptLength: data.prompt.length,
      promptPreview: data.prompt.substring(0, 100), // First 100 chars for context
      tokensUsed: data.tokensUsed,
      model: data.model,
      provider: data.provider,
      generationTime: data.generationTime,
      // Cost estimation (approximate, adjust based on actual pricing)
      estimatedCost: this.estimateCost(data.tokensUsed, data.provider),
    };
    
    console.log('AI Usage Log:', logEntry);
    
    // In production, this should write to a database or analytics service
    // Examples:
    // - await db.aiUsageLogs.create({ data: logEntry })
    // - await analytics.track('ai_usage', logEntry)
    // - await metrics.recordAIUsage(logEntry)
  }
  
  /**
   * Estimate cost based on tokens and provider
   * This is approximate and should be updated with actual pricing
   */
  private estimateCost(tokens: number, provider: string): number {
    // Approximate costs per 1K tokens (as of 2024)
    const costPer1KTokens = {
      openai: 0.03, // GPT-4 approximate
      anthropic: 0.015, // Claude approximate
    };
    
    const rate = costPer1KTokens[provider as keyof typeof costPer1KTokens] || 0.03;
    return (tokens / 1000) * rate;
  }
}
