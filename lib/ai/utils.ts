/**
 * AI Utility Functions
 * 
 * Helper functions for AI prompt processing
 * 
 * Requirements:
 * - 25.5: Prompt caching
 * - 25.7: Prompt caching using cache keys
 */

import { createHash } from 'crypto';
import { nanoid } from 'nanoid';
import type { UIDocument } from '@/types/ui-schema';

/**
 * Generate a cache key from prompt and context
 * 
 * @param prompt - User prompt
 * @param context - Optional context (projectId, etc.)
 * @returns Cache key string
 */
export function getCacheKey(prompt: string, context?: Record<string, unknown>): string {
  const data = JSON.stringify({ prompt, context });
  const hash = createHash('sha256').update(data).digest('hex');
  return `prompt:${hash}`;
}

/**
 * Extract JSON from markdown code blocks
 * 
 * AI models often wrap JSON in markdown code blocks like:
 * ```json
 * { ... }
 * ```
 * 
 * This function extracts the JSON content
 * 
 * @param response - AI response text
 * @returns Extracted JSON string
 */
export function extractJSONFromMarkdown(response: string): string {
  // Try to extract from markdown code block
  const jsonMatch = response.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  
  if (jsonMatch && jsonMatch[1]) {
    return jsonMatch[1].trim();
  }
  
  // If no code block, return as-is (might be plain JSON)
  return response.trim();
}

/**
 * Sleep utility for retry logic
 * 
 * @param ms - Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Exponential backoff calculator
 * 
 * @param attempt - Current attempt number (0-indexed)
 * @param baseDelay - Base delay in milliseconds (default: 1000)
 * @returns Delay in milliseconds
 */
export function calculateBackoff(attempt: number, baseDelay: number = 1000): number {
  return Math.pow(2, attempt) * baseDelay;
}

/**
 * Validate and fix AI response
 * 
 * Auto-fixes common issues in AI-generated UIDocuments:
 * - Missing IDs
 * - Missing metadata
 * - Missing version
 * - Malformed tree structures
 * 
 * Requirements:
 * - 1.2: UI document validation
 * - 1.4: Auto-fix malformed structures
 * - 25.7: Validation error logging
 * 
 * @param uiDocument - UIDocument to validate and fix
 * @returns Fixed UIDocument
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateAndFixAIResponse(uiDocument: any): UIDocument {
  const now = new Date().toISOString();
  
  // Fix root component
  if (!uiDocument.root) {
    throw new Error('UIDocument must have a root component');
  }
  
  // Recursively fix component nodes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function fixComponentNode(node: any): any {
    // Generate ID if missing
    if (!node.id) {
      node.id = nanoid();
      console.warn('Generated missing component ID:', node.id);
    }
    
    // Ensure type exists
    if (!node.type) {
      throw new Error(`Component ${node.id} is missing type`);
    }
    
    // Ensure props exists
    if (!node.props) {
      node.props = {};
    }
    
    // Ensure styles exists with mobile base
    if (!node.styles) {
      node.styles = { mobile: {} };
    } else if (!node.styles.mobile) {
      node.styles.mobile = {};
    }
    
    // Ensure metadata exists
    if (!node.metadata) {
      node.metadata = {
        createdAt: now,
        updatedAt: now,
        createdBy: 'ai',
        manuallyEdited: false,
      };
    } else {
      // Fill in missing metadata fields
      if (!node.metadata.createdAt) node.metadata.createdAt = now;
      if (!node.metadata.updatedAt) node.metadata.updatedAt = now;
      if (!node.metadata.createdBy) node.metadata.createdBy = 'ai';
      if (node.metadata.manuallyEdited === undefined) node.metadata.manuallyEdited = false;
    }
    
    // Fix children recursively
    if (node.children && Array.isArray(node.children)) {
      node.children = node.children.map(fixComponentNode);
    } else {
      node.children = [];
    }
    
    return node;
  }
  
  uiDocument.root = fixComponentNode(uiDocument.root);
  
  // Ensure designTokens exists
  if (!uiDocument.designTokens) {
    uiDocument.designTokens = {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        text: '#1F2937',
        background: '#FFFFFF',
      },
      spacing: {
        sm: '0.5rem',
        md: '1rem',
        lg: '2rem',
      },
      typography: {
        heading: { fontSize: '3rem', fontWeight: '700', lineHeight: '1.2' },
        body: { fontSize: '1rem', fontWeight: '400', lineHeight: '1.6' },
      },
      shadows: {
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
    };
    console.warn('Generated default design tokens');
  }
  
  // Ensure metadata exists
  if (!uiDocument.metadata) {
    uiDocument.metadata = {
      createdAt: now,
      updatedAt: now,
      version: '1.0.0',
      promptHistory: [],
      currentPromptIndex: 0,
    };
  } else {
    // Fill in missing metadata fields
    if (!uiDocument.metadata.createdAt) uiDocument.metadata.createdAt = now;
    if (!uiDocument.metadata.updatedAt) uiDocument.metadata.updatedAt = now;
    if (!uiDocument.metadata.version) uiDocument.metadata.version = '1.0.0';
    if (!uiDocument.metadata.promptHistory) uiDocument.metadata.promptHistory = [];
    if (uiDocument.metadata.currentPromptIndex === undefined) uiDocument.metadata.currentPromptIndex = 0;
  }
  
  return uiDocument as UIDocument;
}

/**
 * Identify manually edited components in a tree
 * 
 * @param root - Root component node
 * @returns Array of component IDs that are manually edited
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function findManuallyEditedComponents(root: any): string[] {
  const manuallyEdited: string[] = [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function traverse(node: any) {
    if (node.metadata?.manuallyEdited) {
      manuallyEdited.push(node.id);
    }
    
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(traverse);
    }
  }
  
  traverse(root);
  
  return manuallyEdited;
}
