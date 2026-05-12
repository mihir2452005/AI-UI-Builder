/**
 * Anthropic Claude Model Implementation
 * 
 * Implements AI model interface using Anthropic's Claude API
 * 
 * Requirements:
 * - 25.1: Centralized AI API key
 * - 25.2: Anthropic provider support
 * - 25.3: Error handling and retry logic
 */

import Anthropic from '@anthropic-ai/sdk';
import type { AIModel, AICompletionRequest, AICompletionResponse } from './base';

export class ClaudeModel implements AIModel {
  private client: Anthropic;
  private modelName: string;
  
  constructor(modelName: string = 'claude-3-sonnet-20240229') {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    
    this.client = new Anthropic({
      apiKey,
    });
    
    this.modelName = modelName;
  }
  
  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    try {
      const message = await this.client.messages.create({
        model: this.modelName,
        max_tokens: request.maxTokens ?? 4000,
        temperature: request.temperature ?? 0.7,
        system: request.system,
        messages: [
          {
            role: 'user',
            content: request.user,
          },
        ],
      });
      
      // Extract text content from the response
      const textContent = message.content.find((block) => block.type === 'text');
      
      if (!textContent || textContent.type !== 'text') {
        throw new Error('Invalid response from Anthropic API');
      }
      
      return {
        content: textContent.text,
        tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
        model: message.model,
        finishReason: message.stop_reason ?? 'unknown',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Anthropic API error: ${error.message}`);
      }
      throw error;
    }
  }
  
  getModelName(): string {
    return this.modelName;
  }
  
  getProviderName(): string {
    return 'anthropic';
  }
}
