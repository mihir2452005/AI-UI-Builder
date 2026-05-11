/**
 * Zod Validation Schemas
 * 
 * Defines validation schemas for all API requests and data structures
 * 
 * Requirements:
 * - 1.2: UI document validation
 * - 1.5: Prompt validation
 * - 29.1: Input validation
 */

import { z } from 'zod';

// ============================================================================
// UI Schema Validation
// ============================================================================

/**
 * Component Type Schema
 */
export const ComponentTypeSchema = z.enum([
  'Container',
  'Flex',
  'Grid',
  'Stack',
  'Text',
  'Heading',
  'Image',
  'Icon',
  'Button',
  'Input',
  'Textarea',
  'Select',
  'Checkbox',
  'Radio',
  'Nav',
  'Link',
  'Card',
  'Hero',
  'Feature',
  'Footer',
]);

/**
 * Style Object Schema
 */
export const StyleObjectSchema = z.object({
  // Layout
  display: z.enum(['block', 'inline', 'flex', 'grid', 'inline-block', 'none']).optional(),
  flexDirection: z.enum(['row', 'column', 'row-reverse', 'column-reverse']).optional(),
  justifyContent: z.enum(['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly']).optional(),
  alignItems: z.enum(['flex-start', 'flex-end', 'center', 'stretch', 'baseline']).optional(),
  gap: z.string().optional(),
  
  // Grid
  gridTemplateColumns: z.string().optional(),
  gridTemplateRows: z.string().optional(),
  gridGap: z.string().optional(),
  
  // Spacing
  margin: z.string().optional(),
  marginTop: z.string().optional(),
  marginRight: z.string().optional(),
  marginBottom: z.string().optional(),
  marginLeft: z.string().optional(),
  padding: z.string().optional(),
  paddingTop: z.string().optional(),
  paddingRight: z.string().optional(),
  paddingBottom: z.string().optional(),
  paddingLeft: z.string().optional(),
  
  // Sizing
  width: z.string().optional(),
  height: z.string().optional(),
  minWidth: z.string().optional(),
  minHeight: z.string().optional(),
  maxWidth: z.string().optional(),
  maxHeight: z.string().optional(),
  
  // Typography
  fontSize: z.string().optional(),
  fontWeight: z.union([z.string(), z.number()]).optional(),
  fontFamily: z.string().optional(),
  lineHeight: z.union([z.string(), z.number()]).optional(),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).optional(),
  textDecoration: z.enum(['none', 'underline', 'line-through']).optional(),
  textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).optional(),
  
  // Colors
  color: z.string().optional(),
  backgroundColor: z.string().optional(),
  borderColor: z.string().optional(),
  
  // Border
  border: z.string().optional(),
  borderWidth: z.string().optional(),
  borderStyle: z.enum(['solid', 'dashed', 'dotted', 'none']).optional(),
  borderRadius: z.string().optional(),
  
  // Shadow
  boxShadow: z.string().optional(),
  
  // Position
  position: z.enum(['static', 'relative', 'absolute', 'fixed', 'sticky']).optional(),
  top: z.string().optional(),
  right: z.string().optional(),
  bottom: z.string().optional(),
  left: z.string().optional(),
  zIndex: z.number().optional(),
  
  // Other
  opacity: z.number().min(0).max(1).optional(),
  cursor: z.enum(['pointer', 'default', 'text', 'move', 'not-allowed']).optional(),
  overflow: z.enum(['visible', 'hidden', 'scroll', 'auto']).optional(),
  
  // Design Token References
  colorToken: z.string().optional(),
  spacingToken: z.string().optional(),
  typographyToken: z.string().optional(),
  shadowToken: z.string().optional(),
});

/**
 * Responsive Styles Schema
 */
export const ResponsiveStylesSchema = z.object({
  mobile: StyleObjectSchema,
  desktop: StyleObjectSchema.optional(),
});

/**
 * Component Props Schema
 */
export const ComponentPropsSchema = z.object({
  // Text & Heading
  text: z.string().optional(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]).optional(),
  
  // Image
  src: z.string().url().optional(),
  alt: z.string().optional(),
  
  // Icon
  icon: z.string().optional(),
  
  // Button & Link
  label: z.string().optional(),
  href: z.string().optional(),
  target: z.enum(['_self', '_blank']).optional(),
  variant: z.enum(['primary', 'secondary', 'outline', 'ghost']).optional(),
  
  // Input, Textarea, Select
  placeholder: z.string().optional(),
  type: z.enum(['text', 'email', 'password', 'number', 'tel', 'url']).optional(),
  name: z.string().optional(),
  value: z.string().optional(),
  required: z.boolean().optional(),
  disabled: z.boolean().optional(),
  
  // Select
  options: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).optional(),
  
  // Checkbox & Radio
  checked: z.boolean().optional(),
  
  // Grid
  columns: z.number().min(1).max(12).optional(),
  
  // Container
  maxWidth: z.string().optional(),
});

/**
 * Component Metadata Schema
 */
export const ComponentMetadataSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.enum(['ai', 'user']),
  manuallyEdited: z.boolean(),
  promptId: z.string().optional(),
});

/**
 * Component Node Schema (recursive)
 * 
 * Note: Uses z.lazy() for recursive type definition
 */
export const ComponentNodeSchema: z.ZodType = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    type: ComponentTypeSchema,
    props: ComponentPropsSchema,
    styles: ResponsiveStylesSchema,
    children: z.array(ComponentNodeSchema).optional(),
    metadata: ComponentMetadataSchema,
  })
);

/**
 * Design Tokens Schema
 */
export const DesignTokensSchema = z.object({
  colors: z.record(z.string()),
  spacing: z.record(z.string()),
  typography: z.record(z.object({
    fontSize: z.string(),
    fontWeight: z.union([z.string(), z.number()]),
    lineHeight: z.union([z.string(), z.number()]),
  })),
  shadows: z.record(z.string()),
});

/**
 * Prompt History Entry Schema
 */
export const PromptHistoryEntrySchema = z.object({
  id: z.string(),
  prompt: z.string().min(1).max(1000),
  timestamp: z.string().datetime(),
  resultingTreeSnapshot: ComponentNodeSchema,
});

/**
 * UI Document Metadata Schema
 */
export const UIDocumentMetadataSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.string(),
  promptHistory: z.array(PromptHistoryEntrySchema),
  currentPromptIndex: z.number().min(0),
});

/**
 * UI Document Schema
 * 
 * Complete validation for the UI document structure
 * 
 * Requirements:
 * - 1.2: UI document validation
 * - 29.1: Input validation
 */
export const UIDocumentSchema = z.object({
  root: ComponentNodeSchema,
  designTokens: DesignTokensSchema,
  metadata: UIDocumentMetadataSchema,
});

// ============================================================================
// API Request Validation
// ============================================================================

/**
 * Generate UI Request Schema
 * 
 * Requirements:
 * - 1.1: AI generation
 * - 1.5: Prompt validation (1-1000 chars)
 */
export const GenerateUISchema = z.object({
  prompt: z.string()
    .min(1, 'Prompt cannot be empty')
    .max(1000, 'Prompt must be 1000 characters or less')
    .trim(),
  projectId: z.string().optional(),
  preserveManualEdits: z.boolean().optional().default(false),
  existingDocument: UIDocumentSchema.optional(),
});

/**
 * Create Project Request Schema
 * 
 * Requirements:
 * - 14.2: Create project
 * - 29.1: Input validation
 */
export const SaveProjectSchema = z.object({
  name: z.string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be 100 characters or less')
    .trim(),
  description: z.string()
    .max(500, 'Description must be 500 characters or less')
    .trim()
    .optional(),
});

/**
 * Update Project Request Schema
 */
export const UpdateProjectSchema = z.object({
  name: z.string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be 100 characters or less')
    .trim()
    .optional(),
  description: z.string()
    .max(500, 'Description must be 500 characters or less')
    .trim()
    .optional()
    .nullable(),
  uiDocument: UIDocumentSchema.optional(),
  thumbnail: z.string().url().optional().nullable(),
});

/**
 * Export Code Request Schema
 * 
 * Requirements:
 * - 7.1: Code export
 * - 29.1: Input validation
 */
export const ExportCodeSchema = z.object({
  format: z.enum(['html', 'react', 'tailwind']),
  options: z.object({
    includeComments: z.boolean().default(true),
    minify: z.boolean().default(false),
    componentStyle: z.enum(['inline', 'separate']).default('separate'),
  }),
});

/**
 * Suggest Improvements Request Schema
 */
export const SuggestImprovementsSchema = z.object({
  uiDocument: UIDocumentSchema,
  focusAreas: z.array(z.enum([
    'accessibility',
    'layout',
    'responsive',
    'design-token',
    'performance',
  ])).optional(),
});

/**
 * Register Request Schema
 * 
 * Requirements:
 * - 13.1: Email and password registration
 * - 13.4: Password requirements (min 8 chars)
 */
export const RegisterSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .trim(),
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be 100 characters or less'),
});

/**
 * Pagination Schema
 */
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(50),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Search Schema
 */
export const SearchSchema = PaginationSchema.extend({
  query: z.string().trim().optional(),
  filters: z.record(z.unknown()).optional(),
});

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validate Request
 * 
 * Generic validation helper that returns typed data or throws validation error
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated and typed data
 * @throws ZodError if validation fails
 * 
 * Requirements:
 * - 29.1: Input validation
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  return schema.parse(data);
}

/**
 * Safe Validate Request
 * 
 * Validation helper that returns success/error result instead of throwing
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Success result with data or error result with issues
 */
export function safeValidateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodIssue[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error.issues };
  }
}

/**
 * Format Validation Errors
 * 
 * Converts Zod errors to user-friendly format
 * 
 * @param errors - Zod validation errors
 * @returns Formatted error messages
 */
export function formatValidationErrors(errors: z.ZodIssue[]): Array<{
  field: string;
  message: string;
  code: string;
}> {
  return errors.map((error) => ({
    field: error.path.join('.'),
    message: error.message,
    code: error.code,
  }));
}

/**
 * Validate Partial Update
 * 
 * Validates partial updates where all fields are optional
 * 
 * @param schema - Base schema
 * @param data - Partial data to validate
 * @returns Validated partial data
 */
export function validatePartialUpdate<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  data: unknown
): Partial<z.infer<z.ZodObject<T>>> {
  const partialSchema = schema.partial();
  return partialSchema.parse(data);
}

// ============================================================================
// Type Exports
// ============================================================================

/**
 * Infer TypeScript types from Zod schemas
 */
export type GenerateUIInput = z.infer<typeof GenerateUISchema>;
export type SaveProjectInput = z.infer<typeof SaveProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type ExportCodeInput = z.infer<typeof ExportCodeSchema>;
export type SuggestImprovementsInput = z.infer<typeof SuggestImprovementsSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
export type SearchInput = z.infer<typeof SearchSchema>;
