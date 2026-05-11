/**
 * Validation Schemas Test
 * 
 * Verifies that Zod schemas correctly validate inputs
 */

import {
  GenerateUISchema,
  SaveProjectSchema,
  UpdateProjectSchema,
  ExportCodeSchema,
  RegisterSchema,
  UIDocumentSchema,
  validateRequest,
  safeValidateRequest,
  formatValidationErrors,
} from '@/lib/validation/schemas';

describe('Validation Schemas', () => {
  describe('GenerateUISchema', () => {
    it('should validate valid prompt', () => {
      const validData = {
        prompt: 'Create a hero section with a heading and button',
      };

      const result = validateRequest(GenerateUISchema, validData);
      expect(result.prompt).toBe(validData.prompt);
    });

    it('should reject empty prompt', () => {
      const invalidData = {
        prompt: '',
      };

      expect(() => validateRequest(GenerateUISchema, invalidData)).toThrow();
    });

    it('should reject prompt over 1000 characters', () => {
      const invalidData = {
        prompt: 'a'.repeat(1001),
      };

      expect(() => validateRequest(GenerateUISchema, invalidData)).toThrow();
    });

    it('should trim whitespace from prompt', () => {
      const data = {
        prompt: '  Create a button  ',
      };

      const result = validateRequest(GenerateUISchema, data);
      expect(result.prompt).toBe('Create a button');
    });

    it('should accept optional fields', () => {
      const data = {
        prompt: 'Create a button',
        projectId: 'proj-123',
        preserveManualEdits: true,
      };

      const result = validateRequest(GenerateUISchema, data);
      expect(result.projectId).toBe('proj-123');
      expect(result.preserveManualEdits).toBe(true);
    });
  });

  describe('SaveProjectSchema', () => {
    it('should validate valid project data', () => {
      const validData = {
        name: 'My Project',
        description: 'A test project',
      };

      const result = validateRequest(SaveProjectSchema, validData);
      expect(result.name).toBe('My Project');
      expect(result.description).toBe('A test project');
    });

    it('should reject empty name', () => {
      const invalidData = {
        name: '',
      };

      expect(() => validateRequest(SaveProjectSchema, invalidData)).toThrow();
    });

    it('should reject name over 100 characters', () => {
      const invalidData = {
        name: 'a'.repeat(101),
      };

      expect(() => validateRequest(SaveProjectSchema, invalidData)).toThrow();
    });

    it('should reject description over 500 characters', () => {
      const invalidData = {
        name: 'Valid Name',
        description: 'a'.repeat(501),
      };

      expect(() => validateRequest(SaveProjectSchema, invalidData)).toThrow();
    });

    it('should allow optional description', () => {
      const data = {
        name: 'My Project',
      };

      const result = validateRequest(SaveProjectSchema, data);
      expect(result.name).toBe('My Project');
      expect(result.description).toBeUndefined();
    });
  });

  describe('RegisterSchema', () => {
    it('should validate valid registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = validateRequest(RegisterSchema, validData);
      expect(result.email).toBe('john@example.com');
    });

    it('should reject invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
      };

      expect(() => validateRequest(RegisterSchema, invalidData)).toThrow();
    });

    it('should reject password under 8 characters', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'short',
      };

      expect(() => validateRequest(RegisterSchema, invalidData)).toThrow();
    });

    it('should lowercase email', () => {
      const data = {
        name: 'John Doe',
        email: 'JOHN@EXAMPLE.COM',
        password: 'password123',
      };

      const result = validateRequest(RegisterSchema, data);
      expect(result.email).toBe('john@example.com');
    });
  });

  describe('ExportCodeSchema', () => {
    it('should validate valid export request', () => {
      const validData = {
        format: 'react',
        options: {
          includeComments: true,
          minify: false,
          componentStyle: 'separate',
        },
      };

      const result = validateRequest(ExportCodeSchema, validData);
      expect(result.format).toBe('react');
    });

    it('should reject invalid format', () => {
      const invalidData = {
        format: 'invalid',
        options: {
          includeComments: true,
          minify: false,
          componentStyle: 'separate',
        },
      };

      expect(() => validateRequest(ExportCodeSchema, invalidData)).toThrow();
    });

    it('should apply default options', () => {
      const data = {
        format: 'html',
        options: {},
      };

      const result = validateRequest(ExportCodeSchema, data);
      expect(result.options.includeComments).toBe(true);
      expect(result.options.minify).toBe(false);
      expect(result.options.componentStyle).toBe('separate');
    });
  });

  describe('safeValidateRequest', () => {
    it('should return success for valid data', () => {
      const data = {
        prompt: 'Create a button',
      };

      const result = safeValidateRequest(GenerateUISchema, data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.prompt).toBe('Create a button');
      }
    });

    it('should return errors for invalid data', () => {
      const data = {
        prompt: '',
      };

      const result = safeValidateRequest(GenerateUISchema, data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('formatValidationErrors', () => {
    it('should format Zod errors', () => {
      const data = {
        prompt: '',
      };

      const result = safeValidateRequest(GenerateUISchema, data);
      if (!result.success) {
        const formatted = formatValidationErrors(result.errors);
        expect(formatted.length).toBeGreaterThan(0);
        expect(formatted[0]).toHaveProperty('field');
        expect(formatted[0]).toHaveProperty('message');
        expect(formatted[0]).toHaveProperty('code');
      }
    });
  });

  describe('UIDocumentSchema', () => {
    it('should validate complete UI document', () => {
      const validDocument = {
        root: {
          id: 'root',
          type: 'Container',
          props: {},
          styles: {
            mobile: {
              padding: '1rem',
            },
          },
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'ai',
            manuallyEdited: false,
          },
        },
        designTokens: {
          colors: {
            primary: '#3B82F6',
          },
          spacing: {
            md: '1rem',
          },
          typography: {
            body: {
              fontSize: '1rem',
              fontWeight: 400,
              lineHeight: 1.5,
            },
          },
          shadows: {
            sm: '0 1px 2px rgba(0,0,0,0.05)',
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

      const result = validateRequest(UIDocumentSchema, validDocument);
      expect(result.root.type).toBe('Container');
    });

    it('should validate nested components', () => {
      const documentWithChildren = {
        root: {
          id: 'root',
          type: 'Container',
          props: {},
          styles: {
            mobile: {},
          },
          children: [
            {
              id: 'child-1',
              type: 'Text',
              props: {
                text: 'Hello',
              },
              styles: {
                mobile: {},
              },
              metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'ai',
                manuallyEdited: false,
              },
            },
          ],
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'ai',
            manuallyEdited: false,
          },
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

      const result = validateRequest(UIDocumentSchema, documentWithChildren);
      expect(result.root.children).toHaveLength(1);
    });
  });
});
