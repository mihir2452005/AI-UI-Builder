/**
 * AI Model Factory
 * 
 * Creates AI model instances based on environment configuration
 * 
 * Requirements:
 * - 25.2: Configurable AI provider selection via environment variable
 * - 25.10: Provider switching without code changes
 */

import type { AIModel } from './base';
import { OpenAIModel } from './openai-model';
import { ClaudeModel } from './claude-model';

export * from './base';
export { OpenAIModel } from './openai-model';
export { ClaudeModel } from './claude-model';

/**
 * Create an AI model instance based on environment configuration
 * 
 * @returns AIModel instance (OpenAI or Anthropic)
 * @throws Error if AI_PROVIDER is not set or invalid
 */
export function createAIModel(): AIModel {
  const provider = process.env.AI_PROVIDER?.toLowerCase();
  
  if (!provider) {
    throw new Error('AI_PROVIDER environment variable is not set. Set to "openai" or "anthropic"');
  }
  
  switch (provider) {
    case 'openai':
      return new OpenAIModel('gpt-4o-mini');
    
    case 'anthropic':
      return new ClaudeModel('claude-3-sonnet-20240229');
    
    default:
      throw new Error(`Invalid AI_PROVIDER: ${provider}. Must be "openai" or "anthropic"`);
  }
}
