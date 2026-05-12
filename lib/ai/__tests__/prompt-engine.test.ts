/**
 * Prompt Engine Tests
 * 
 * Basic tests for the AI prompt engine
 */

// Mock nanoid before imports
jest.mock('nanoid', () => ({
  nanoid: () => 'test-id-123',
}));

import { describe, it, expect } from '@jest/globals';
import { getEmptyUIDocument } from '../helpers';
import { getCacheKey, extractJSONFromMarkdown, validateAndFixAIResponse } from '../utils';

describe('PromptEngine Utilities', () => {
  describe('getCacheKey', () => {
    it('should generate consistent cache keys for same input', () => {
      const prompt = 'Create a landing page';
      const context = { projectId: '123' };
      
      const key1 = getCacheKey(prompt, context);
      const key2 = getCacheKey(prompt, context);
      
      expect(key1).toBe(key2);
    });
    
    it('should generate different keys for different inputs', () => {
      const key1 = getCacheKey('Create a landing page', { projectId: '123' });
      const key2 = getCacheKey('Create a dashboard', { projectId: '123' });
      
      expect(key1).not.toBe(key2);
    });
  });
  
  describe('extractJSONFromMarkdown', () => {
    it('should extract JSON from markdown code blocks', () => {
      const markdown = '```json\n{"test": "value"}\n```';
      const result = extractJSONFromMarkdown(markdown);
      
      expect(result).toBe('{"test": "value"}');
    });
    
    it('should handle plain JSON without code blocks', () => {
      const json = '{"test": "value"}';
      const result = extractJSONFromMarkdown(json);
      
      expect(result).toBe('{"test": "value"}');
    });
    
    it('should handle code blocks without json language tag', () => {
      const markdown = '```\n{"test": "value"}\n```';
      const result = extractJSONFromMarkdown(markdown);
      
      expect(result).toBe('{"test": "value"}');
    });
  });
  
  describe('validateAndFixAIResponse', () => {
    it('should generate missing IDs', () => {
      const doc = {
        root: {
          type: 'Container',
          props: {},
          styles: { mobile: {} },
          children: [],
        },
        designTokens: {
          colors: {},
          spacing: {},
          typography: {},
          shadows: {},
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          promptHistory: [],
          currentPromptIndex: 0,
        },
      };
      
      const fixed = validateAndFixAIResponse(doc);
      
      expect(fixed.root.id).toBeDefined();
      expect(typeof fixed.root.id).toBe('string');
    });
    
    it('should add missing metadata', () => {
      const doc = {
        root: {
          id: 'test-id',
          type: 'Container',
          props: {},
          styles: { mobile: {} },
          children: [],
        },
        designTokens: {
          colors: {},
          spacing: {},
          typography: {},
          shadows: {},
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          promptHistory: [],
          currentPromptIndex: 0,
        },
      };
      
      const fixed = validateAndFixAIResponse(doc);
      
      expect(fixed.root.metadata).toBeDefined();
      expect(fixed.root.metadata.createdBy).toBe('ai');
      expect(fixed.root.metadata.manuallyEdited).toBe(false);
    });
    
    it('should add default design tokens if missing', () => {
      const doc = {
        root: {
          id: 'test-id',
          type: 'Container',
          props: {},
          styles: { mobile: {} },
          children: [],
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'ai',
            manuallyEdited: false,
          },
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          promptHistory: [],
          currentPromptIndex: 0,
        },
      };
      
      const fixed = validateAndFixAIResponse(doc);
      
      expect(fixed.designTokens).toBeDefined();
      expect(fixed.designTokens.colors).toBeDefined();
      expect(fixed.designTokens.spacing).toBeDefined();
      expect(fixed.designTokens.typography).toBeDefined();
      expect(fixed.designTokens.shadows).toBeDefined();
    });
  });
});

describe('Helper Functions', () => {
  describe('getEmptyUIDocument', () => {
    it('should generate a valid empty UIDocument', () => {
      const doc = getEmptyUIDocument();
      
      expect(doc.root).toBeDefined();
      expect(doc.root.type).toBe('Container');
      expect(doc.root.id).toBeDefined();
      expect(doc.designTokens).toBeDefined();
      expect(doc.metadata).toBeDefined();
      expect(doc.metadata.version).toBe('1.0.0');
    });
    
    it('should include default design tokens', () => {
      const doc = getEmptyUIDocument();
      
      expect(doc.designTokens.colors.primary).toBeDefined();
      expect(doc.designTokens.spacing.md).toBeDefined();
      expect(doc.designTokens.typography.heading).toBeDefined();
      expect(doc.designTokens.shadows.md).toBeDefined();
    });
  });
});
