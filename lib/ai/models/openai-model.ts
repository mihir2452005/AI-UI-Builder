/**
 * OpenAI Model Implementation
 * 
 * Implements AI model interface using OpenAI's GPT-4 API
 * 
 * Requirements:
 * - 25.1: Centralized AI API key
 * - 25.2: OpenAI provider support
 * - 25.3: Error handling and retry logic
 */

import OpenAI from 'openai';
import type { AIModel, AICompletionRequest, AICompletionResponse } from './base';

export class OpenAIModel implements AIModel {
  private client: OpenAI;
  private modelName: string;
  
  constructor(modelName: string = 'gpt-4o-mini') {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    
    this.client = new OpenAI({
      apiKey,
    });
    
    this.modelName = modelName;
  }
  
  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.modelName,
        messages: [
          {
            role: 'system',
            content: request.system,
          },
          {
            role: 'user',
            content: request.user,
          },
        ],
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4000,
      });
      
      const choice = completion.choices[0];
      
      if (!choice || !choice.message || !choice.message.content) {
        throw new Error('Invalid response from OpenAI API');
      }
      
      return {
        content: choice.message.content,
        tokensUsed: completion.usage?.total_tokens ?? 0,
        model: completion.model,
        finishReason: choice.finish_reason ?? 'unknown',
      };
    } catch (error: any) {
      // Provide helpful error messages
      if (error.status === 404) {
        throw new Error(
          `OpenAI API error: The model '${this.modelName}' does not exist or you do not have access to it. ` +
          `Try using 'gpt-4o-mini' or 'gpt-3.5-turbo' instead. ` +
          `You can change the model in lib/ai/models/index.ts`
        );
      }
      
      if (error.status === 401) {
        throw new Error(
          `OpenAI API error: Invalid API key. Please check your OPENAI_API_KEY environment variable.`
        );
      }
      
      if (error.status === 429) {
        throw new Error(
          `OpenAI API error: Rate limit exceeded. Please try again later or upgrade your OpenAI plan.`
        );
      }
      
      if (error instanceof Error) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw error;
    }
  }
  
  getModelName(): string {
    return this.modelName;
  }
  
  getProviderName(): string {
    return 'openai';
  }
}
