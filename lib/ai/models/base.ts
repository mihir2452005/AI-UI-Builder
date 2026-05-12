/**
 * Base AI Model Interface
 * 
 * Provides a consistent API across different AI providers (OpenAI, Anthropic)
 * 
 * Requirements:
 * - 25.1: Centralized AI API key
 * - 25.2: Configurable AI provider selection
 * - 25.10: Provider switching without code changes
 */

export interface AIModelConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface AICompletionRequest {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AICompletionResponse {
  content: string;
  tokensUsed: number;
  model: string;
  finishReason: string;
}

/**
 * Base interface for AI model implementations
 */
export interface AIModel {
  /**
   * Generate a completion from the AI model
   */
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;
  
  /**
   * Get the model name
   */
  getModelName(): string;
  
  /**
   * Get the provider name
   */
  getProviderName(): string;
}
