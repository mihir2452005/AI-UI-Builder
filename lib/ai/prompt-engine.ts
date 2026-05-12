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
import type { UIDocument, PromptHistoryEntry } from '@/types/ui-schema';
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
      existingDocument: context?.existingDocument,
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
   */
  private async callAIWithRetry(
    systemPrompt: string,
    userPrompt: string,
    maxRetries: number = 3
  ) {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await this.aiModel.complete({
          system: systemPrompt,
          user: userPrompt,
          temperature: 0.7,
          maxTokens: 4000,
        });
        
        return response;
      } catch (error) {
        lastError = error as Error;
        
        // Log error for monitoring
        console.error(
          `AI request failed (attempt ${attempt + 1}/${maxRetries}):`,
          error
        );
        
        // If this is the last attempt, throw the error
        if (attempt === maxRetries - 1) {
          throw new Error(
            `AI service failed after ${maxRetries} attempts: ${lastError.message}`
          );
        }
        
        // Exponential backoff
        const delay = calculateBackoff(attempt);
        console.log(`Retrying in ${delay}ms...`);
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
   */
  private parseAIResponse(response: string, originalPrompt: string): UIDocument {
    try {
      // Extract JSON from markdown code blocks if present
      const jsonString = extractJSONFromMarkdown(response);
      
      // Parse JSON
      const parsed = JSON.parse(jsonString);
      
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
      const validated = UIDocumentSchema.parse(fixed);
      
      return validated as UIDocument;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Response:', response.substring(0, 500));
      
      if (error instanceof Error) {
        throw new Error(`Failed to parse AI response: ${error.message}`);
      }
      throw error;
    }
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
    const manuallyEditedIds = findManuallyEditedComponents(existingDocument.root);
    
    if (manuallyEditedIds.length === 0) {
      return;
    }
    
    console.log('Preserving manually edited components:', manuallyEditedIds);
    
    // Build a map of manually edited components
    const manuallyEditedMap = new Map<string, Record<string, unknown>>();
    
    function collectManuallyEdited(node: Record<string, unknown>) {
      const metadata = node.metadata as { manuallyEdited?: boolean } | undefined;
      const nodeId = node.id as string;
      
      if (metadata?.manuallyEdited) {
        manuallyEditedMap.set(nodeId, node);
      }
      
      const children = node.children as Record<string, unknown>[] | undefined;
      if (children && Array.isArray(children)) {
        children.forEach(collectManuallyEdited);
      }
    }
    
    collectManuallyEdited(existingDocument.root as Record<string, unknown>);
    
    // Replace components in new document with manually edited versions
    function replaceManuallyEdited(node: Record<string, unknown>): Record<string, unknown> {
      const nodeId = node.id as string;
      
      // If this component was manually edited, use the old version
      if (manuallyEditedMap.has(nodeId)) {
        return manuallyEditedMap.get(nodeId)!;
      }
      
      // Otherwise, recursively process children
      const children = node.children as Record<string, unknown>[] | undefined;
      if (children && Array.isArray(children)) {
        node.children = children.map(replaceManuallyEdited);
      }
      
      return node;
    }
    
    newDocument.root = replaceManuallyEdited(newDocument.root);
  }
  
  /**
   * Log AI usage for cost tracking and analytics
   * 
   * Requirements:
   * - 25.8: Log AI usage per user
   */
  private logAIUsage(data: {
    userId?: string;
    prompt: string;
    tokensUsed: number;
    model: string;
    provider: string;
    generationTime: number;
  }): void {
    // In production, this should write to a database or analytics service
    console.log('AI Usage:', {
      timestamp: new Date().toISOString(),
      userId: data.userId || 'anonymous',
      promptLength: data.prompt.length,
      tokensUsed: data.tokensUsed,
      model: data.model,
      provider: data.provider,
      generationTime: data.generationTime,
    });
  }
}
