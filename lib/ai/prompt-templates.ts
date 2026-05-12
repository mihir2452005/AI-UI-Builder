/**
 * AI Prompt Templates
 * 
 * Defines prompt templates for UI generation tasks
 * 
 * Requirements:
 * - 1.2: Component library list
 * - 1.4: Design token instructions
 * - 1.7: Responsive breakpoint instructions
 * - 4.1: Mobile-first responsive design
 */

/**
 * List of all 20 component types available in the platform
 */
export const COMPONENT_TYPES = [
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

/**
 * Base system prompt with expert persona
 */
export const SYSTEM_BASE = `You are an expert UI/UX designer and frontend developer specializing in modern web interfaces. Your task is to generate structured UI specifications from natural language descriptions.`;

/**
 * Component library instructions
 */
export const COMPONENT_LIBRARY_INSTRUCTIONS = `
COMPONENT LIBRARY:
Available components: ${COMPONENT_TYPES.join(', ')}

Component Guidelines:
- Container: Main wrapper with max-width and centering
- Flex: Flexible box layout with direction and alignment
- Grid: Grid layout with configurable columns
- Stack: Vertical or horizontal stack with consistent spacing
- Text: Body text content
- Heading: Heading with level 1-6
- Image: Image with src and alt text
- Icon: Icon from Lucide React library
- Button: Interactive button with variants (primary, secondary, outline, ghost)
- Input, Textarea, Select: Form inputs with labels and placeholders
- Checkbox, Radio: Form controls
- Nav: Navigation bar
- Link: Hyperlink
- Card: Content card with padding and shadow
- Hero: Hero section with large heading and CTA
- Feature: Feature section with icon, heading, and description
- Footer: Footer section
`;

/**
 * Design token instructions
 */
export const DESIGN_TOKEN_INSTRUCTIONS = `
DESIGN TOKENS:
Use these design tokens for consistent styling:

Colors:
- primary: Main brand color (e.g., #3B82F6)
- secondary: Secondary brand color (e.g., #10B981)
- success: Success state (e.g., #22C55E)
- warning: Warning state (e.g., #F59E0B)
- error: Error state (e.g., #EF4444)
- text: Primary text color (e.g., #1F2937)
- textMuted: Muted text color (e.g., #6B7280)
- background: Background color (e.g., #FFFFFF)
- border: Border color (e.g., #E5E7EB)

Spacing (use these values for margin, padding, gap):
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 2rem (32px)
- xl: 3rem (48px)
- 2xl: 4rem (64px)

Typography:
- heading: { fontSize: '3rem', fontWeight: '700', lineHeight: '1.2' }
- subheading: { fontSize: '1.5rem', fontWeight: '600', lineHeight: '1.4' }
- body: { fontSize: '1rem', fontWeight: '400', lineHeight: '1.6' }
- small: { fontSize: '0.875rem', fontWeight: '400', lineHeight: '1.5' }

Shadows:
- sm: '0 1px 2px rgba(0, 0, 0, 0.05)'
- md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
- lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
- xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
`;

/**
 * Responsive design instructions
 */
export const RESPONSIVE_INSTRUCTIONS = `
RESPONSIVE BREAKPOINTS:
Use mobile-first responsive design with two breakpoints:

- mobile: 0-767px (base styles in styles.mobile)
- desktop: 768px+ (overrides in styles.desktop)

Responsive Guidelines:
1. Always define base mobile styles in styles.mobile
2. Add desktop overrides in styles.desktop only when needed
3. Stack layouts vertically on mobile (flexDirection: 'column')
4. Use horizontal layouts on desktop (flexDirection: 'row')
5. Reduce font sizes on mobile (e.g., 2rem mobile, 3rem desktop)
6. Reduce spacing on mobile (e.g., 1rem mobile, 2rem desktop)
7. Use full width on mobile (width: '100%')
8. Use max-width on desktop (maxWidth: '1200px')
`;

/**
 * JSON output instructions
 */
export const JSON_OUTPUT_INSTRUCTIONS = `
OUTPUT FORMAT:
Generate a valid UIDocument JSON object with this structure:

{
  "root": {
    "id": "unique-id",
    "type": "Container",
    "props": {},
    "styles": {
      "mobile": { /* base mobile styles */ },
      "desktop": { /* desktop overrides */ }
    },
    "children": [ /* nested components */ ],
    "metadata": {
      "createdAt": "ISO-8601-timestamp",
      "updatedAt": "ISO-8601-timestamp",
      "createdBy": "ai",
      "manuallyEdited": false
    }
  },
  "designTokens": {
    "colors": { "primary": "#3B82F6", ... },
    "spacing": { "sm": "0.5rem", ... },
    "typography": { "heading": { "fontSize": "3rem", ... }, ... },
    "shadows": { "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)", ... }
  },
  "metadata": {
    "createdAt": "ISO-8601-timestamp",
    "updatedAt": "ISO-8601-timestamp",
    "version": "1.0.0",
    "promptHistory": [],
    "currentPromptIndex": 0
  }
}

CRITICAL RULES:
1. Output ONLY valid JSON - no markdown, no explanations
2. Use proper component types from the component library
3. Apply design tokens for consistency
4. Use mobile-first responsive design
5. Include proper accessibility attributes (alt text, ARIA labels)
6. Generate unique IDs for all components
7. Set proper metadata (createdAt, updatedAt, createdBy: "ai", manuallyEdited: false)
8. Use semantic HTML principles
`;

/**
 * Build complete system prompt
 */
export function buildSystemPrompt(options?: {
  existingDocument?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  preserveManualEdits?: boolean;
}): string {
  let prompt = SYSTEM_BASE;
  prompt += '\n\n' + COMPONENT_LIBRARY_INSTRUCTIONS;
  prompt += '\n\n' + DESIGN_TOKEN_INSTRUCTIONS;
  prompt += '\n\n' + RESPONSIVE_INSTRUCTIONS;
  prompt += '\n\n' + JSON_OUTPUT_INSTRUCTIONS;
  
  // Add context for editing existing documents
  if (options?.existingDocument) {
    prompt += `\n\nEXISTING DOCUMENT CONTEXT:
You are modifying an existing UI. Here is the current state:

${JSON.stringify(options.existingDocument, null, 2)}

${options.preserveManualEdits ? 'IMPORTANT: Preserve any components marked with "manuallyEdited": true unless the prompt explicitly requests changes to them.' : ''}
`;
  }
  
  return prompt;
}

/**
 * Build user prompt
 */
export function buildUserPrompt(
  prompt: string,
  options?: {
    preserveManualEdits?: boolean;
  }
): string {
  let userPrompt = `Generate a UI based on this description:\n\n"${prompt}"\n\n`;
  
  if (options?.preserveManualEdits) {
    userPrompt += 'IMPORTANT: Preserve any components marked with "manuallyEdited": true\n\n';
  }
  
  userPrompt += 'Output the complete UIDocument JSON.';
  
  return userPrompt;
}

/**
 * Template for component generation
 */
export const GENERATE_COMPONENT_TEMPLATE = (componentType: string, requirements: string) => `
Generate a ${componentType} component with the following requirements:
${requirements}

Output as UIDocument JSON with proper styling and accessibility.
`;

/**
 * Template for layout refinement
 */
export const REFINE_LAYOUT_TEMPLATE = (currentLayout: string, focusAreas: string) => `
Analyze this UI layout and suggest improvements:
${currentLayout}

Focus on: ${focusAreas}

Output improved UIDocument JSON.
`;

/**
 * Template for responsive optimization
 */
export const OPTIMIZE_RESPONSIVE_TEMPLATE = (currentLayout: string) => `
Optimize this UI for responsive design:
${currentLayout}

Ensure proper behavior at mobile (0-767px) and desktop (768px+) breakpoints.
Output optimized UIDocument JSON.
`;
