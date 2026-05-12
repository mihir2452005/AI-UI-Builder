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
    } catch (error: unknown) {
      // Enhanced error handling with detailed logging
      // Requirements: 29.1, 29.2, 29.5
      
      const err = error as { 
        status?: number; 
        message?: string;
        error?: {
          type?: string;
          message?: string;
        };
        code?: string;
      };
      
      // Log error details
      console.error('Anthropic API Error:', {
        timestamp: new Date().toISOString(),
        status: err.status,
        code: err.code,
        type: err.error?.type,
        message: err.message || err.error?.message,
        model: this.modelName,
      });
      
      // Provide specific, actionable error messages
      if (err.status === 401 || err.error?.type === 'authentication_error') {
        throw new Error(
          `Anthropic API error: Invalid API key. Please check your ANTHROPIC_API_KEY environment variable.`
        );
      }
      
      if (err.status === 429 || err.error?.type === 'rate_limit_error') {
        throw new Error(
          `Anthropic API error: Rate limit exceeded. Please try again later or upgrade your Anthropic plan.`
        );
      }
      
      if (err.status === 400 || err.error?.type === 'invalid_request_error') {
        throw new Error(
          `Anthropic API error: Invalid request. ${err.error?.message || 'Please check your prompt and try again.'}`
        );
      }
      
      if (err.status === 404) {
        throw new Error(
          `Anthropic API error: The model '${this.modelName}' does not exist or you do not have access to it. ` +
          `Try using 'claude-3-sonnet-20240229' or 'claude-3-haiku-20240307' instead.`
        );
      }
      
      if (err.status === 500 || err.status === 502 || err.status === 503 || err.error?.type === 'api_error') {
        throw new Error(
          `Anthropic API error: Service temporarily unavailable. Please try again in a moment.`
        );
      }
      
      if (err.status === 529 || err.error?.type === 'overloaded_error') {
        throw new Error(
          `Anthropic API error: Service is overloaded. Please try again in a moment.`
        );
      }
      
      if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        throw new Error(
          `Network error: Unable to connect to Anthropic API. Please check your internet connection.`
        );
      }
      
      if (err.code === 'ETIMEDOUT' || err.message?.includes('timeout')) {
        throw new Error(
          `Request timeout: Anthropic API took too long to respond. Please try again.`
        );
      }
      
      // Generic error with original message
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
