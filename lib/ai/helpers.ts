/**
 * AI Helper Functions
 * 
 * Utility functions for working with UI documents
 */

import { nanoid } from 'nanoid';
import type { UIDocument, ComponentNode } from '@/types/ui-schema';

/**
 * Generate an empty UIDocument with default structure
 * 
 * @returns Empty UIDocument
 */
export function getEmptyUIDocument(): UIDocument {
  const now = new Date().toISOString();
  
  const root: ComponentNode = {
    id: nanoid(),
    type: 'Container',
    props: {
      maxWidth: '1200px',
    },
    styles: {
      mobile: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1rem',
      },
      desktop: {
        padding: '2rem',
      },
    },
    children: [],
    metadata: {
      createdAt: now,
      updatedAt: now,
      createdBy: 'user',
      manuallyEdited: false,
    },
  };
  
  return {
    root,
    designTokens: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        text: '#1F2937',
        textMuted: '#6B7280',
        background: '#FFFFFF',
        border: '#E5E7EB',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
      },
      typography: {
        heading: {
          fontSize: '3rem',
          fontWeight: '700',
          lineHeight: '1.2',
        },
        subheading: {
          fontSize: '1.5rem',
          fontWeight: '600',
          lineHeight: '1.4',
        },
        body: {
          fontSize: '1rem',
          fontWeight: '400',
          lineHeight: '1.6',
        },
        small: {
          fontSize: '0.875rem',
          fontWeight: '400',
          lineHeight: '1.5',
        },
      },
      shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
    },
    metadata: {
      createdAt: now,
      updatedAt: now,
      version: '1.0.0',
      promptHistory: [],
      currentPromptIndex: 0,
    },
  };
}

/**
 * Generate default design tokens
 * 
 * @returns Default design tokens object
 */
export function generateDefaultTokens() {
  return {
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      text: '#1F2937',
      textMuted: '#6B7280',
      background: '#FFFFFF',
      border: '#E5E7EB',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '2rem',
      xl: '3rem',
      '2xl': '4rem',
    },
    typography: {
      heading: {
        fontSize: '3rem',
        fontWeight: '700',
        lineHeight: '1.2',
      },
      subheading: {
        fontSize: '1.5rem',
        fontWeight: '600',
        lineHeight: '1.4',
      },
      body: {
        fontSize: '1rem',
        fontWeight: '400',
        lineHeight: '1.6',
      },
      small: {
        fontSize: '0.875rem',
        fontWeight: '400',
        lineHeight: '1.5',
      },
    },
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
  };
}
