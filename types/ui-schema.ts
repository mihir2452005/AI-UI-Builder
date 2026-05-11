/**
 * UI Schema TypeScript Types
 * 
 * Defines the complete type system for the UI JSON schema that serves as the
 * single source of truth for all UI representations in the application.
 * 
 * Requirements:
 * - 1.2: Custom UI JSON schema
 * - 1.6: Prompt history tracking
 * - 2.3: Component tree structure
 * - 4.1: Responsive design system
 * - 18.1: Design token system
 */

/**
 * Component Types
 * 
 * All 20 component types supported in the MVP
 */
export type ComponentType =
  // Layout Components
  | 'Container'
  | 'Flex'
  | 'Grid'
  | 'Stack'
  // Content Components
  | 'Text'
  | 'Heading'
  | 'Image'
  | 'Icon'
  // Interactive Components
  | 'Button'
  | 'Input'
  | 'Textarea'
  | 'Select'
  | 'Checkbox'
  | 'Radio'
  // Navigation Components
  | 'Nav'
  | 'Link'
  // Composite Components
  | 'Card'
  | 'Hero'
  | 'Feature'
  | 'Footer';

/**
 * Style Object
 * 
 * CSS-like styling properties for components
 * Supports both direct values and design token references
 */
export interface StyleObject {
  // Layout
  display?: 'block' | 'inline' | 'flex' | 'grid' | 'inline-block' | 'none';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  gap?: string; // e.g., '1rem', '16px'
  
  // Grid
  gridTemplateColumns?: string; // e.g., 'repeat(3, 1fr)', '200px 1fr'
  gridTemplateRows?: string;
  gridGap?: string;
  
  // Spacing
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  
  // Sizing
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  
  // Typography
  fontSize?: string; // e.g., '16px', '1rem'
  fontWeight?: string | number; // e.g., 'bold', 700
  fontFamily?: string;
  lineHeight?: string | number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  
  // Colors
  color?: string; // Text color
  backgroundColor?: string;
  borderColor?: string;
  
  // Border
  border?: string;
  borderWidth?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderRadius?: string;
  
  // Shadow
  boxShadow?: string;
  
  // Position
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
  
  // Other
  opacity?: number;
  cursor?: 'pointer' | 'default' | 'text' | 'move' | 'not-allowed';
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  
  // Design Token References (optional)
  colorToken?: string; // Reference to design token
  spacingToken?: string;
  typographyToken?: string;
  shadowToken?: string;
}

/**
 * Responsive Styles
 * 
 * Mobile-first responsive design with two breakpoints:
 * - mobile: 0-767px (base styles)
 * - desktop: 768px+ (overrides)
 */
export interface ResponsiveStyles {
  mobile: StyleObject; // Base styles (0-767px)
  desktop?: StyleObject; // Desktop overrides (768px+)
}

/**
 * Component Props
 * 
 * Type-specific properties for different component types
 */
export interface ComponentProps {
  // Text & Heading
  text?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6; // For Heading component
  
  // Image
  src?: string;
  alt?: string;
  
  // Icon
  icon?: string; // Icon name from Lucide React
  
  // Button & Link
  label?: string;
  href?: string;
  target?: '_self' | '_blank';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  
  // Input, Textarea, Select
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  name?: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  
  // Select
  options?: Array<{ label: string; value: string }>;
  
  // Checkbox & Radio
  checked?: boolean;
  
  // Grid
  columns?: number; // Number of columns
  
  // Container
  maxWidth?: string; // Max width for container
}

/**
 * Component Metadata
 * 
 * Tracking information for component history and editing
 */
export interface ComponentMetadata {
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  createdBy: 'ai' | 'user'; // How component was created
  manuallyEdited: boolean; // Has user manually edited this component?
  promptId?: string; // ID of prompt that created this component
}

/**
 * Component Node
 * 
 * Represents a single component in the UI tree
 * Supports recursive nesting for layout components
 */
export interface ComponentNode {
  id: string; // Unique identifier (nanoid)
  type: ComponentType;
  props: ComponentProps;
  styles: ResponsiveStyles;
  children?: ComponentNode[]; // Nested components (for Container, Flex, Grid, etc.)
  metadata: ComponentMetadata;
}

/**
 * Design Tokens
 * 
 * Centralized design system tokens for consistent styling
 */
export interface DesignTokens {
  colors: {
    [key: string]: string; // e.g., { primary: '#3B82F6', secondary: '#10B981' }
  };
  spacing: {
    [key: string]: string; // e.g., { xs: '0.25rem', sm: '0.5rem', md: '1rem' }
  };
  typography: {
    [key: string]: {
      fontSize: string;
      fontWeight: string | number;
      lineHeight: string | number;
    };
  };
  shadows: {
    [key: string]: string; // e.g., { sm: '0 1px 2px rgba(0,0,0,0.05)' }
  };
}

/**
 * Prompt History Entry
 * 
 * Tracks each prompt and its resulting UI state for undo/redo
 * 
 * Requirements:
 * - 1.6: Prompt history tracking
 * - 2.3: Component tree snapshots
 * - 2.4: Restore previous prompts
 */
export interface PromptHistoryEntry {
  id: string; // Unique identifier
  prompt: string; // User's prompt text
  timestamp: string; // ISO 8601 timestamp
  resultingTreeSnapshot: ComponentNode; // Snapshot of root component after this prompt
}

/**
 * UI Document Metadata
 * 
 * Document-level metadata and settings
 */
export interface UIDocumentMetadata {
  createdAt: string;
  updatedAt: string;
  version: string; // Schema version (e.g., '1.0.0')
  promptHistory: PromptHistoryEntry[]; // History of all prompts
  currentPromptIndex: number; // Index in prompt history (for undo/redo)
}

/**
 * UI Document
 * 
 * The complete UI representation - single source of truth
 * 
 * This is the core data structure that:
 * - Stores the entire component tree
 * - Tracks design tokens
 * - Maintains prompt history
 * - Serves as input/output for AI generation
 * - Gets saved to database
 * - Gets exported to code
 * 
 * Requirements:
 * - 1.2: Custom UI JSON schema
 * - 1.6: Prompt history
 * - 2.3: Component tree structure
 * - 4.1: Responsive design
 * - 18.1: Design tokens
 */
export interface UIDocument {
  root: ComponentNode; // Root component (usually a Container)
  designTokens: DesignTokens;
  metadata: UIDocumentMetadata;
}

/**
 * Helper type for component tree traversal
 */
export type ComponentVisitor = (node: ComponentNode, parent?: ComponentNode) => void;

/**
 * Helper type for component tree transformation
 */
export type ComponentTransformer = (node: ComponentNode, parent?: ComponentNode) => ComponentNode;

/**
 * Viewport Type
 * 
 * Two breakpoints for responsive preview
 */
export type Viewport = 'mobile' | 'desktop';

/**
 * Component Category
 * 
 * For organizing components in the library
 */
export type ComponentCategory = 
  | 'All'
  | 'Layout'
  | 'Content'
  | 'Interactive'
  | 'Navigation'
  | 'Composite';

/**
 * Component Library Item
 * 
 * Metadata for components in the component library panel
 */
export interface ComponentLibraryItem {
  type: ComponentType;
  label: string;
  description: string;
  category: ComponentCategory;
  icon: string; // Lucide icon name
  defaultProps: ComponentProps;
  defaultStyles: ResponsiveStyles;
  canHaveChildren: boolean;
}

/**
 * Drop Position
 * 
 * Where to insert a component relative to another
 */
export type DropPosition = 'before' | 'after' | 'inside';

/**
 * Drag Data
 * 
 * Data payload for drag-and-drop operations
 */
export interface DragData {
  componentId?: string; // ID of existing component being moved
  componentType?: ComponentType; // Type of new component being added
  isNew: boolean; // Is this a new component or existing one?
}

/**
 * Selection State
 * 
 * Tracks which component is selected and hovered
 */
export interface SelectionState {
  selectedComponentId: string | null;
  hoveredComponentId: string | null;
}

/**
 * Canvas State
 * 
 * Complete state of the canvas workspace
 */
export interface CanvasState {
  uiDocument: UIDocument;
  selection: SelectionState;
  viewport: Viewport;
  gridEnabled: boolean;
  snapToGrid: boolean;
  history: UIDocument[]; // Undo/redo history
  historyIndex: number;
}

/**
 * Export Format
 * 
 * Supported code export formats
 */
export type ExportFormat = 'html' | 'react' | 'tailwind';

/**
 * Export Options
 * 
 * Configuration for code export
 */
export interface ExportOptions {
  format: ExportFormat;
  includeComments: boolean;
  minify: boolean;
  componentStyle: 'inline' | 'separate'; // For React: inline styles or separate CSS
}
