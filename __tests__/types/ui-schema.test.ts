/**
 * UI Schema Types Test
 * 
 * Verifies that all UI schema types are correctly defined and usable
 */

import type {
  ComponentType,
  ComponentNode,
  UIDocument,
  StyleObject,
  ResponsiveStyles,
  DesignTokens,
  PromptHistoryEntry,
} from '@/types/ui-schema';

describe('UI Schema Types', () => {
  describe('ComponentType', () => {
    it('should accept all 20 component types', () => {
      const types: ComponentType[] = [
        // Layout
        'Container',
        'Flex',
        'Grid',
        'Stack',
        // Content
        'Text',
        'Heading',
        'Image',
        'Icon',
        // Interactive
        'Button',
        'Input',
        'Textarea',
        'Select',
        'Checkbox',
        'Radio',
        // Navigation
        'Nav',
        'Link',
        // Composite
        'Card',
        'Hero',
        'Feature',
        'Footer',
      ];

      expect(types).toHaveLength(20);
    });
  });

  describe('StyleObject', () => {
    it('should allow valid CSS properties', () => {
      const styles: StyleObject = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        padding: '2rem',
        backgroundColor: '#3B82F6',
        color: '#FFFFFF',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      };

      expect(styles.display).toBe('flex');
      expect(styles.gap).toBe('1rem');
    });

    it('should allow design token references', () => {
      const styles: StyleObject = {
        colorToken: 'primary',
        spacingToken: 'md',
        typographyToken: 'heading',
        shadowToken: 'lg',
      };

      expect(styles.colorToken).toBe('primary');
    });
  });

  describe('ResponsiveStyles', () => {
    it('should require mobile styles and allow optional desktop styles', () => {
      const responsiveStyles: ResponsiveStyles = {
        mobile: {
          flexDirection: 'column',
          padding: '1rem',
        },
        desktop: {
          flexDirection: 'row',
          padding: '2rem',
        },
      };

      expect(responsiveStyles.mobile.flexDirection).toBe('column');
      expect(responsiveStyles.desktop?.flexDirection).toBe('row');
    });
  });

  describe('ComponentNode', () => {
    it('should create a valid component node', () => {
      const node: ComponentNode = {
        id: 'comp-123',
        type: 'Button',
        props: {
          label: 'Click me',
          variant: 'primary',
        },
        styles: {
          mobile: {
            padding: '0.5rem 1rem',
            backgroundColor: '#3B82F6',
            color: '#FFFFFF',
          },
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'ai',
          manuallyEdited: false,
        },
      };

      expect(node.type).toBe('Button');
      expect(node.props.label).toBe('Click me');
    });

    it('should support nested children', () => {
      const parent: ComponentNode = {
        id: 'container-1',
        type: 'Container',
        props: {},
        styles: {
          mobile: {
            padding: '2rem',
          },
        },
        children: [
          {
            id: 'text-1',
            type: 'Text',
            props: {
              text: 'Hello World',
            },
            styles: {
              mobile: {
                fontSize: '1rem',
              },
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
      };

      expect(parent.children).toHaveLength(1);
      expect(parent.children?.[0].type).toBe('Text');
    });
  });

  describe('DesignTokens', () => {
    it('should define all token categories', () => {
      const tokens: DesignTokens = {
        colors: {
          primary: '#3B82F6',
          secondary: '#10B981',
          error: '#EF4444',
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '2rem',
        },
        typography: {
          heading: {
            fontSize: '2rem',
            fontWeight: 700,
            lineHeight: 1.2,
          },
          body: {
            fontSize: '1rem',
            fontWeight: 400,
            lineHeight: 1.5,
          },
        },
        shadows: {
          sm: '0 1px 2px rgba(0,0,0,0.05)',
          md: '0 4px 6px rgba(0,0,0,0.1)',
        },
      };

      expect(tokens.colors.primary).toBe('#3B82F6');
      expect(tokens.spacing.md).toBe('1rem');
      expect(tokens.typography.heading.fontSize).toBe('2rem');
    });
  });

  describe('UIDocument', () => {
    it('should create a complete UI document', () => {
      const document: UIDocument = {
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

      expect(document.root.type).toBe('Container');
      expect(document.metadata.version).toBe('1.0.0');
    });
  });

  describe('PromptHistoryEntry', () => {
    it('should track prompt history', () => {
      const entry: PromptHistoryEntry = {
        id: 'prompt-1',
        prompt: 'Create a hero section with a heading and button',
        timestamp: new Date().toISOString(),
        resultingTreeSnapshot: {
          id: 'hero-1',
          type: 'Hero',
          props: {},
          styles: {
            mobile: {},
          },
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'ai',
            manuallyEdited: false,
            promptId: 'prompt-1',
          },
        },
      };

      expect(entry.prompt).toContain('hero section');
      expect(entry.resultingTreeSnapshot.type).toBe('Hero');
    });
  });
});
