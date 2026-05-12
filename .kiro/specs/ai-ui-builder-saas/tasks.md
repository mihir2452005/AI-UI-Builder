# Implementation Plan: AI-Powered UI Builder SaaS (MVP)

## Overview

This implementation plan breaks down the AI-Powered UI Builder SaaS MVP into discrete, actionable coding tasks. The platform enables students and beginner developers to create professional UIs through natural language prompts, visual editing, and code export capabilities.

**Tech Stack:**
- **Frontend:** Next.js 14+ (App Router), React 18+, Tailwind CSS 3.4+
- **State Management:** Zustand 4.x
- **Drag & Drop:** @dnd-kit/core
- **Animation:** Framer Motion 11.x
- **Code Editor:** Monaco Editor
- **Database:** PostgreSQL 15+ with Prisma 5.x ORM
- **Authentication:** NextAuth.js 4.x
- **Caching:** Redis (Upstash)
- **AI Services:** Centralized AI provider (OpenAI OR Anthropic) configured by platform owner
- **Deployment:** Vercel

**Implementation Language:** TypeScript

**MVP Scope (12 Core Features):**
1. AI Prompt-to-UI Generation
2. Editable Prompt Layer
3. Drag-and-Drop Canvas
4. Responsive Preview System (Mobile/Desktop)
5. Grid & Spacing Controls
6. Component Library (~20 components)
7. Code Export (HTML, React, Tailwind)
8. Project Saving & Management
9. Authentication (Email, Google, GitHub)
10. AI UI Suggestions
11. Design Token System
12. Properties Panel for Visual Editing

**Key Architecture Decisions:**
- Mobile-first responsive design with two breakpoints (mobile: 0-767px, desktop: 768px+)
- Custom UI JSON schema as single source of truth for all UI representations
- Component tree structure with recursive rendering
- Design tokens for consistent styling across components
- Property-based testing for critical features (code export, tree manipulation, token management)

## Tasks

- [x] 1. Project Setup and Infrastructure
  - Initialize Next.js 14 project with TypeScript and App Router
  - Configure Tailwind CSS 3.4+ with custom design tokens
  - Set up ESLint, Prettier, and TypeScript strict mode
  - Create folder structure following the design document
  - Configure environment variables (.env.example)
  - _Requirements: Foundation for all features_

- [x] 2. Database Schema and Prisma Setup
  - [x] 2.1 Create Prisma schema with User, Account, Session, VerificationToken, and Project models
    - Define all fields, relations, and indexes as specified in design document
    - Configure PostgreSQL connection
    - _Requirements: 13.1, 13.2, 23.1, 23.2_
  
  - [x] 2.2 Set up Prisma client and database utilities
    - Create singleton Prisma client instance
    - Add database connection helpers
    - _Requirements: 23.1, 23.6_
  
  - [x] 2.3 Create initial database migration
    - Generate and run Prisma migration
    - Verify schema creation
    - _Requirements: 23.1, 23.2_

- [x] 3. Authentication System
  - [x] 3.1 Configure NextAuth.js with multiple providers
    - Set up Google OAuth provider
    - Set up GitHub OAuth provider
    - Set up Credentials provider with bcrypt password hashing
    - Configure JWT session strategy
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [x] 3.2 Create authentication API routes
    - Implement /api/auth/[...nextauth]/route.ts
    - Configure callbacks for JWT and session
    - _Requirements: 13.1, 13.2, 13.6_
  
  - [x] 3.3 Build authentication UI pages
    - Create sign-in page with email/password and OAuth buttons
    - Create sign-up page with email/password registration
    - Add form validation and error handling
    - _Requirements: 13.1, 13.2, 13.5_
  
  - [x] 3.4 Implement protected route middleware
    - Create middleware.ts to protect /dashboard and /editor routes
    - Add session verification logic
    - _Requirements: 13.6, 13.8_

- [x] 4. Core Type Definitions and Schema
  - [x] 4.1 Create UI Schema TypeScript types
    - Define UIDocument, ComponentNode, DesignTokens, ResponsiveStyles interfaces
    - Define ComponentType enum with all 20 component types (Container, Flex, Grid, Stack, Text, Heading, Image, Icon, Button, Input, Textarea, Select, Checkbox, Radio, Nav, Link, Card, Hero, Feature, Footer)
    - Define ComponentProps, StyleObject, and metadata interfaces
    - Define PromptHistoryEntry interface for tracking prompt iterations
    - _Requirements: 1.2, 1.6, 2.3, 4.1, 18.1_
  
  - [x] 4.2 Create API response types
    - Define ApiResponse<T> generic type with success/error structure
    - Define ApiError with code, message, and details fields
    - Define GenerateUIRequest with prompt, projectId, and preserveManualEdits fields
    - Define GenerateUIResponse with uiDocument, tokensUsed, and generationTime
    - Define SaveProjectRequest, SaveProjectResponse types
    - Define ExportCodeRequest with format and options, ExportCodeResponse with code and files
    - Define SuggestImprovementsRequest and SuggestImprovementsResponse types
    - _Requirements: 1.1, 1.3, 7.2, 9.1, 14.2_
  
  - [x] 4.3 Create validation schemas using Zod
    - Define UIDocumentSchema with full validation for all nested structures
    - Define GenerateUISchema validating prompt (1-1000 chars), projectId, preserveManualEdits
    - Define SaveProjectSchema validating name (1-100 chars), description (max 500 chars)
    - Define ExportCodeSchema validating format enum and options
    - Create validateRequest helper function for schema validation
    - _Requirements: 1.2, 1.5, 29.1_

- [x] 5. Zustand State Management Stores
  - [x] 5.1 Create canvas store
    - Implement state for uiDocument, selectedComponentId, hoveredComponentId, viewport ('mobile' | 'desktop'), gridEnabled, snapToGrid
    - Add actions: setUIDocument, updateComponent, addComponent, removeComponent, moveComponent
    - Implement undo/redo with history array (max 50 steps) and historyIndex
    - Add selectComponent, setHoveredComponent, setViewport, toggleGrid, toggleSnapToGrid actions
    - Add persistence for viewport and grid preferences using Zustand persist middleware
    - Implement updateComponentPosition for drag-and-drop integration
    - _Requirements: 3.2, 3.3, 3.6, 4.2, 5.1, 5.2, 6.2, 16.1_
  
  - [x] 5.2 Create project store
    - Implement state for projects array, currentProjectId, loading, error
    - Add actions: fetchProjects, createProject, updateProject, deleteProject, setCurrentProject
    - Integrate with API routes (/api/projects)
    - Add error handling and loading states
    - Implement optimistic updates for better UX
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.7_
  
  - [x] 5.3 Create UI store
    - Implement state for sidebar visibility, properties panel visibility, modals (export, save, suggestions)
    - Add actions: toggleSidebar, togglePropertiesPanel, openModal, closeModal
    - Track active modal type and modal data
    - _Requirements: 3.1, 7.10, 9.6_

- [x] 6. AI Prompt Engine
  - [x] 6.1 Create AI model integration with provider selection
    - Implement AIModel interface for consistent API across providers
    - Implement OpenAIModel class with GPT-4 API calls using openai npm package
    - Implement ClaudeModel class with Claude 3 Sonnet API calls using @anthropic-ai/sdk
    - Add provider selection based on AI_PROVIDER environment variable (openai or anthropic)
    - Add error handling and retry logic with exponential backoff (3 attempts)
    - Configure temperature (0.7), max tokens (4000), and other parameters
    - _Requirements: 1.1, 1.2, 25.1, 25.2, 25.3, 25.10_
  
  - [x] 6.2 Build PromptEngine class
    - Implement generateUI method with system and user prompt construction
    - Add prompt caching using cache keys (hash of prompt + context)
    - Use single centralized AI provider based on environment configuration
    - Parse and validate AI responses against UIDocument schema using Zod
    - Handle JSON extraction from markdown code blocks
    - Implement getCacheKey method using hash function
    - Log AI usage per user for cost tracking and analytics
    - _Requirements: 1.1, 1.2, 1.3, 25.1, 25.5, 25.6, 25.7, 25.8_
  
  - [x] 6.3 Create prompt templates
    - Define SYSTEM_BASE prompt with expert UI/UX designer persona
    - Create system prompt with component library list (all 20 component types)
    - Include design token instructions (colors, spacing, typography, shadows)
    - Add responsive breakpoint instructions (mobile-first, 0-767px mobile, 768px+ desktop)
    - Create templates for component generation, layout refinement, responsive optimization
    - _Requirements: 1.2, 1.4, 1.7, 4.1_
  
  - [x] 6.4 Implement context-aware prompt generation
    - Add support for preserving manually edited components (check manuallyEdited metadata flag)
    - Handle existing document context in prompt construction
    - Include existing UIDocument in system prompt when editing
    - Add logic to identify and preserve components marked as manually edited
    - _Requirements: 2.2, 2.5, 2.6_
  
  - [x] 6.5 Add AI response validation and auto-fix
    - Implement validateAndFixAIResponse function
    - Add auto-fix for missing required fields (id, version, metadata)
    - Fix malformed tree structures with default values
    - Generate unique IDs using nanoid when missing
    - Log validation errors for quality analysis
    - _Requirements: 1.2, 1.4, 25.7_

- [x] 7. AI Generation API Route
  - [x] 7.1 Create /api/ai/generate route
    - Implement POST handler with authentication check
    - Add rate limiting per user
    - Validate prompt input
    - Call PromptEngine to generate UIDocument
    - Return generated UI with metadata
    - _Requirements: 1.1, 1.2, 1.3, 25.3_
  
  - [x] 7.2 Add error handling and logging
    - Handle AI service failures gracefully
    - Log generation attempts and errors
    - Return user-friendly error messages
    - _Requirements: 29.1, 29.2, 29.5_

- [x] 8. Project Management API Routes
  - [x] 8.1 Create /api/projects route
    - Implement GET handler to list user projects (select id, name, description, thumbnail, updatedAt only)
    - Implement POST handler to create new project with getEmptyUIDocument helper
    - Add authentication check using getServerSession
    - Add input validation using Zod schemas
    - Return projects ordered by updatedAt desc
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [x] 8.2 Create /api/projects/[id] route
    - Implement GET handler to fetch single project with full uiDocument
    - Implement PATCH handler to update project (name, description, uiDocument)
    - Implement DELETE handler with soft delete (move to trash, not permanent deletion)
    - Verify user ownership before all operations (userId must match session.user.id)
    - Add 404 response when project not found
    - _Requirements: 14.3, 14.4, 14.8, 23.8_
  
  - [x] 8.3 Add auto-save functionality
    - Implement debounced save on canvas changes (300ms delay)
    - Update project updatedAt timestamp on save
    - Show "Saving..." and "Saved" indicators in UI
    - Queue saves when offline and retry when connection restored
    - _Requirements: 14.7, 29.3_
  
  - [x] 8.4 Write property tests for project operations
    - **Property 8: Project Management Operation Integrity**
    - **Validates: Requirements 14.3, 14.8**
    - Test rename, duplicate, delete operations
    - Verify soft delete moves to trash with 30-day retention
    - Check that deleted projects are not permanently removed

- [ ] 9. Component Rendering System
  - [ ] 9.1 Create base component renderer
    - Implement ComponentRenderer with recursive tree rendering
    - Add drag-and-drop integration using @dnd-kit
    - Handle responsive style merging based on viewport
    - Convert StyleObject to React CSS properties
    - _Requirements: 3.1, 3.2, 4.2, 4.3_
  
  - [ ] 9.2 Implement individual component types
    - Create TextComponent, HeadingComponent, ButtonComponent, ImageComponent
    - Create FlexComponent, GridComponent, StackComponent, ContainerComponent
    - Create CardComponent, HeroComponent, NavComponent, FooterComponent
    - Create InputComponent, TextareaComponent, SelectComponent, CheckboxComponent
    - Add proper HTML semantics and accessibility attributes
    - _Requirements: 10.1, 10.6, 19.1, 19.2_
  
  - [ ] 9.3 Add selection and hover overlays
    - Create SelectionOverlay component with visual indicators
    - Add hover effects and component boundaries
    - Display component metadata on selection
    - _Requirements: 3.6_

- [ ] 10. Canvas Workspace
  - [ ] 10.1 Create Canvas component
    - Implement DndContext for drag-and-drop
    - Add viewport wrapper for responsive preview
    - Integrate ComponentRenderer for tree rendering
    - Add grid overlay toggle
    - _Requirements: 3.1, 3.2, 3.3, 5.1, 6.1_
  
  - [ ] 10.2 Implement grid system
    - Create GridOverlay component with configurable columns
    - Add snap-to-grid functionality
    - Display spacing guides between components
    - _Requirements: 5.1, 5.2, 5.8_
  
  - [ ] 10.3 Add viewport controls
    - Create ViewportSelector with mobile/desktop toggle
    - Implement viewport width adjustment
    - Display current breakpoint indicator
    - _Requirements: 4.2, 6.2, 6.7_

- [ ] 11. Drag-and-Drop System
  - [ ] 11.1 Create DnD utility functions
    - Implement canDropComponent validation (prevent self-drop, parent-into-child, non-container targets)
    - Add isDescendant check to prevent invalid drops
    - Create insertComponent helper (handles 'before', 'after', 'inside' positions)
    - Implement removeComponent, moveComponent helpers
    - Implement findNodeById and findParentNode tree traversal functions
    - Add canHaveChildren function checking component type (Container, Flex, Grid, Stack, Card, Hero, Nav)
    - _Requirements: 3.2, 3.4, 3.8_
  
  - [ ] 11.2 Build Component Library panel
    - Create draggable component items for all 20 component types
    - Add search input with filtering by component label
    - Add category filtering (All, Layout, Content, Interactive, Navigation, Composite)
    - Display component icons using Lucide React
    - Implement DraggableComponent with useDraggable hook
    - Add data payload with type and isNew flag for new components
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  
  - [ ] 11.3 Implement drop zones and indicators
    - Add visual drop zone highlights using useDroppable hook
    - Show insertion position indicators (before, after, inside)
    - Handle invalid drop feedback with error styling
    - Add drop indicator component showing where component will be placed
    - _Requirements: 3.1, 3.8_
  
  - [ ] 11.4 Write property tests for tree manipulation
    - **Property 2: Component Tree Manipulation Correctness**
    - **Validates: Requirements 3.1, 3.2, 3.4, 3.5**
    - Test that insertComponent maintains proper hierarchy
    - Verify all component IDs remain unique after operations
    - Check parent-child relationships are correctly established
  
  - [ ] 11.5 Write property tests for invalid operations
    - **Property 3: Invalid Operation Prevention**
    - **Validates: Requirements 2.6, 3.8**
    - Test that dropping parent into child is prevented
    - Verify dropping into non-container components is blocked
    - Check that appropriate error feedback is provided

- [ ] 12. Properties Panel
  - [ ] 12.1 Create PropertiesPanel component
    - Display selected component properties
    - Show component type and metadata
    - _Requirements: 3.6, 5.3_
  
  - [ ] 12.2 Add style editing controls
    - Create inputs for spacing (margin, padding, gap)
    - Add color pickers for text and background colors
    - Implement typography controls (fontSize, fontWeight, textAlign)
    - Add layout controls (flexDirection, justifyContent, alignItems)
    - _Requirements: 5.3, 5.4, 5.5_
  
  - [ ] 12.3 Add responsive style overrides
    - Allow editing desktop-specific styles
    - Show which styles are overridden per breakpoint
    - _Requirements: 4.3, 4.6_
  
  - [ ] 12.4 Implement design token integration
    - Display available design tokens
    - Allow linking component styles to tokens
    - Show token usage indicators
    - _Requirements: 18.1, 18.2, 18.3_

- [ ] 13. Prompt Editor Interface
  - [ ] 13.1 Create PromptEditor component
    - Build editable textarea for prompt input with auto-resize
    - Add submit button with loading state (spinner during AI generation)
    - Display character count (0/1000) and validation
    - Show error messages for invalid prompts
    - Disable submit when prompt is empty or exceeds 1000 characters
    - _Requirements: 1.1, 1.5, 2.1_
  
  - [ ] 13.2 Implement prompt history
    - Display list of previous prompts with timestamps (format: "2 hours ago")
    - Allow selecting and restoring previous prompts
    - Show which components were affected by each prompt (component count)
    - Store prompt history in UIDocument metadata.promptHistory array
    - Add PromptHistoryEntry with id, prompt, timestamp, resultingTreeSnapshot
    - _Requirements: 1.6, 2.3, 2.4_
  
  - [ ] 13.3 Add regeneration confirmation
    - Warn when regeneration will overwrite manual edits
    - Highlight affected components (those with manuallyEdited: true)
    - Provide option to preserve manual changes (preserveManualEdits checkbox)
    - Show dialog with "Regenerate" and "Cancel" buttons
    - Count and display number of manually edited components that will be affected
    - _Requirements: 2.5, 2.6_
  
  - [ ] 13.4 Write property tests for prompt history
    - **Property 1: Prompt History Round-Trip Preservation**
    - **Validates: Requirements 1.6, 2.3, 2.4**
    - Test that prompts are correctly stored in history
    - Verify restored prompts return equivalent UI state
    - Check prompt history array maintains correct order

- [ ] 14. Code Export System
  - [ ] 14.1 Create CodeExporter class
    - Implement export method with format selection (HTML, React, Tailwind)
    - Add ExportOptions interface with includeComments, minify, componentStyle fields
    - Create private methods: exportHTML, exportReact, exportTailwind
    - _Requirements: 7.1, 7.2, 7.6_
  
  - [ ] 14.2 Implement HTML export
    - Generate semantic HTML from component tree using recursive traversal
    - Create inline CSS or separate stylesheet based on options
    - Include responsive media queries (@media min-width: 768px for desktop)
    - Use proper HTML tags (nav, section, footer, etc.) based on component types
    - Add DOCTYPE, meta viewport, and proper HTML structure
    - _Requirements: 7.3, 7.5, 7.8_
  
  - [ ] 14.3 Implement React export
    - Generate functional React components with TypeScript
    - Create separate component files for reusable elements (Card, Hero, Feature)
    - Generate package.json with dependencies (react, react-dom, next, tailwindcss)
    - Add Tailwind config with design tokens
    - Use proper React conventions (PascalCase, functional components, props)
    - _Requirements: 7.4, 7.7, 7.9_
  
  - [ ] 14.4 Implement Tailwind export
    - Convert styles to Tailwind utility classes (flex, grid, p-4, text-lg, etc.)
    - Generate responsive class variants (md: prefix for desktop breakpoint)
    - Create Tailwind config with custom tokens (colors, spacing)
    - Map StyleObject properties to Tailwind classes using conversion functions
    - Handle arbitrary values for custom colors ([#3B82F6])
    - _Requirements: 7.5, 7.9_
  
  - [ ] 14.5 Implement style conversion utilities
    - Create convertToCSSStyles function for React inline styles
    - Create stylesToTailwind function for Tailwind class generation
    - Create conversion helpers: convertToTailwindSpacing, convertToTailwindFontSize, convertToTailwindFontWeight, convertToTailwindColor, convertToTailwindBorderRadius
    - Map common values to Tailwind classes (1rem → p-4, 700 → font-bold)
    - _Requirements: 7.5_
  
  - [ ] 14.6 Implement code formatting
    - Integrate Prettier for code formatting
    - Create formatCode function supporting html and typescript parsers
    - Configure Prettier options (semi: true, singleQuote: true, tabWidth: 2)
    - Handle formatting errors gracefully (return unformatted code on error)
    - _Requirements: 7.6_
  
  - [ ] 14.7 Create export API route
    - Implement POST /api/projects/[id]/export handler
    - Validate user ownership before export
    - Call CodeExporter with requested format
    - Return generated code and files array for multi-file exports
    - Add error handling for export failures
    - _Requirements: 7.1, 7.2, 7.10_
  
  - [ ] 14.8 Build ExportModal UI
    - Create modal with format selection (HTML, React, Tailwind radio buttons)
    - Add code preview with syntax highlighting using Monaco Editor
    - Implement copy-to-clipboard functionality with success toast
    - Add download as ZIP option for multi-file exports (React format)
    - Show file tree for multi-file exports
    - _Requirements: 7.10_
  
  - [ ] 14.9 Write property tests for code export
    - **Property 4: Multi-Format Code Export Completeness**
    - **Validates: Requirements 7.1, 7.3, 7.4, 7.5**
    - Test that all three formats generate valid, complete code
    - Verify all components from UIDocument are included in export
    - Check that responsive styles are present in all formats
  
  - [ ] 14.10 Write property tests for code quality
    - **Property 5: Code Export Quality Standards**
    - **Validates: Requirements 7.6, 7.8, 7.9**
    - Test consistent formatting (indentation, line breaks)
    - Verify comments are included when requested
    - Check that generated code is valid (can be parsed)
  
  - [ ] 14.11 Write property tests for React structure
    - **Property 6: React Component Structure Separation**
    - **Validates: Requirements 7.4, 7.7**
    - Test proper component separation (separate files for reusable components)
    - Verify prop types are defined
    - Check functional component structure

- [ ] 15. AI Suggestion Engine
  - [ ] 15.1 Create SuggestionEngine class
    - Implement analyzeSuggestions method with parallel analysis using Promise.all
    - Return array of Suggestion objects with id, type, severity, title, description, componentId, autoFixAvailable, fix
    - _Requirements: 9.1, 9.9_
  
  - [ ] 15.2 Implement accessibility analysis
    - Check for missing alt text on Image components
    - Validate heading hierarchy (h1 → h2 → h3, no skipping levels)
    - Calculate color contrast ratios against WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
    - Generate auto-fix suggestions for contrast issues (suggest darker/lighter colors)
    - Check for missing ARIA labels on interactive components
    - _Requirements: 9.2, 19.3, 19.4_
  
  - [ ] 15.3 Implement layout analysis
    - Check for proper spacing and gap usage (containers with children should have gap)
    - Identify alignment issues (misaligned flex/grid items)
    - Suggest layout improvements (use Grid for equal-width columns, use Flex for single-direction layouts)
    - _Requirements: 9.3_
  
  - [ ] 15.4 Implement responsive analysis
    - Check for mobile-first responsive patterns (base styles for mobile, desktop overrides)
    - Identify layouts that need stacking on mobile (horizontal Flex should become vertical)
    - Suggest breakpoint-specific overrides (flexDirection: 'column' for mobile, 'row' for desktop)
    - Check for fixed widths that should be responsive (maxWidth instead of width)
    - _Requirements: 9.4_
  
  - [ ] 15.5 Implement design token analysis
    - Find repeated color values that should be tokens (3+ occurrences)
    - Find repeated spacing values that should be tokens
    - Suggest token creation for consistency
    - _Requirements: 9.5, 18.5_
  
  - [ ] 15.6 Create /api/ai/suggest route
    - Implement POST handler with authentication check
    - Call SuggestionEngine with UIDocument from request body
    - Return suggestions array with severity levels (error, warning, info)
    - Add error handling for suggestion generation failures
    - _Requirements: 9.1, 9.6_
  
  - [ ] 15.7 Build SuggestionsPanel UI
    - Display suggestions grouped by type (accessibility, layout, responsive, design-token)
    - Show severity badges (red for error, yellow for warning, blue for info)
    - Show educational explanations for each suggestion
    - Add one-click "Apply Fix" button for auto-fixable suggestions
    - Show before/after preview for fixes
    - _Requirements: 9.6, 9.7, 9.8_

- [ ] 16. Design Token System
  - [ ] 16.1 Create TokenManager class
    - Implement createToken method for colors, spacing, typography, shadows
    - Add applyToken method to link component properties to tokens
    - Add resolveTokenValue method to get token value from token name
    - Track token usage across component tree with traversal
    - Implement generateDefaultTokens with MVP token set (primary, secondary, success, warning, error, text, textMuted, background, border colors; xs, sm, md, lg, xl, 2xl spacing; heading, subheading, body, small typography; sm, md, lg, xl shadows)
    - _Requirements: 18.1, 18.2, 18.4_
  
  - [ ] 16.2 Build design token UI
    - Create token editor panel for colors, spacing, typography, shadows
    - Add color picker for color tokens with hex input
    - Add value inputs for spacing (rem/px), typography (fontSize, fontWeight, lineHeight), shadows (CSS shadow value)
    - Display token usage counts (how many components use each token)
    - Add create, update, delete token actions
    - _Requirements: 18.1, 18.3, 18.4_
  
  - [ ] 16.3 Implement token linking
    - Allow components to reference tokens instead of hardcoded values
    - Add token selector dropdown in properties panel
    - Update all linked components when token value changes (propagate through tree)
    - Store token references in StyleObject (colorToken, spacingToken, typographyToken, shadowToken)
    - _Requirements: 18.2, 18.3_
  
  - [ ] 16.4 Add token export to code
    - Generate CSS variables for HTML export (:root { --primary: #3B82F6; })
    - Generate Tailwind config extensions for React/Tailwind export (theme.extend.colors)
    - Include token definitions in all code exports
    - _Requirements: 18.6_
  
  - [ ] 16.5 Implement token suggestion
    - Analyze UIDocument for repeated color values (3+ occurrences)
    - Suggest token creation for consistency
    - Display suggestions in token panel
    - _Requirements: 18.5_
  
  - [ ] 16.6 Add token accessibility validation
    - Validate color contrast ratios against WCAG AA standards (4.5:1 for normal text)
    - Calculate contrast between text and background colors
    - Show warnings for insufficient contrast
    - Suggest better color values when contrast is too low
    - _Requirements: 18.8, 19.3_
  
  - [ ] 16.7 Write property tests for token lifecycle
    - **Property 10: Design Token Lifecycle Consistency**
    - **Validates: Requirements 18.1, 18.2, 18.3, 18.6**
    - Test token definition, application, and propagation
    - Verify token updates propagate to all linked components
    - Check CSS variable generation in exports
  
  - [ ] 16.8 Write property tests for token analysis
    - **Property 11: Design Token Analysis Accuracy**
    - **Validates: Requirements 18.4, 18.5, 18.8**
    - Test accurate token usage counting
    - Verify suggestions for repeated values (3+ occurrences)
    - Check accessibility validation for color tokens

- [ ] 17. Responsive Preview System
  - [ ] 17.1 Create ResponsivePreview component
    - Implement side-by-side mobile and desktop preview
    - Add preset device dimensions
    - Allow custom viewport dimensions
    - _Requirements: 6.1, 6.2, 6.3, 6.5_
  
  - [ ] 17.2 Add real-time preview updates
    - Sync preview with canvas changes within 300ms
    - Update all active viewports simultaneously
    - _Requirements: 6.1, 6.4_
  
  - [ ] 17.3 Implement interactive preview
    - Enable functional behavior for buttons and inputs in preview
    - Display current breakpoint and dimensions
    - _Requirements: 6.6, 6.7_

- [ ] 18. Dashboard and Project Management UI
  - [ ] 18.1 Create Dashboard page
    - Display project grid/list view with thumbnails
    - Show project metadata (name, last modified date formatted as "2 hours ago", component count)
    - Add search input with filtering by name
    - Add filter by tags when implemented
    - Show empty state when no projects exist
    - _Requirements: 14.1, 14.4, 14.6_
  
  - [ ] 18.2 Implement project actions
    - Add "Create New Project" button opening modal
    - Implement rename action with inline editing or modal
    - Implement duplicate action creating copy with " (Copy)" suffix
    - Implement delete action with confirmation dialog
    - Add project folders for organization (optional for MVP)
    - Show action menu (three dots) on project card hover
    - _Requirements: 14.2, 14.3, 14.5_
  
  - [ ] 18.3 Create project thumbnails
    - Generate preview images of canvas using html-to-image or similar
    - Store thumbnail URLs in database (thumbnail field)
    - Update thumbnails on project save
    - Show placeholder image when thumbnail not available
    - _Requirements: 14.4_
  
  - [ ] 18.4 Write property tests for project display
    - **Property 9: Project Search and Display Accuracy**
    - **Validates: Requirements 14.1, 14.4, 14.6**
    - Test that all projects display with correct metadata
    - Verify search results match query by name
    - Check that component counts are accurate

- [ ] 19. Editor Layout and Toolbar
  - [ ] 19.1 Create EditorLayout component
    - Build three-panel layout (sidebar, canvas, properties)
    - Add resizable panels
    - Implement panel collapse/expand
    - _Requirements: 3.1, 5.1_
  
  - [ ] 19.2 Build Toolbar component
    - Add undo/redo buttons
    - Add viewport selector
    - Add grid toggle
    - Add export button
    - Add AI suggestions button
    - _Requirements: 3.3, 5.1, 6.2, 7.10, 9.1_
  
  - [ ] 19.3 Implement keyboard shortcuts
    - Add Ctrl+Z/Cmd+Z for undo
    - Add Ctrl+Shift+Z/Cmd+Shift+Z for redo
    - Add Delete key for component removal
    - Add Ctrl+S/Cmd+S for manual save
    - _Requirements: 3.3_

- [ ] 20. Rate Limiting and Caching
  - [ ] 20.1 Implement rate limiting
    - Create rate limit middleware using @upstash/ratelimit
    - Apply limits to AI generation endpoint (10 requests per hour per user)
    - Apply limits to general API endpoints (100 requests per minute per user)
    - Apply limits to export endpoint (20 exports per hour per user)
    - Return 429 status with retry-after header when limit exceeded
    - Track rate limit analytics
    - _Requirements: 25.3_
  
  - [ ] 20.2 Implement prompt caching
    - Create PromptCache class using @upstash/redis
    - Generate cache keys from prompt hash and context (projectId)
    - Set TTL to 24 hours for cached responses
    - Implement get, set, and invalidate methods
    - Cache AI-generated UIDocuments to reduce API calls
    - _Requirements: 25.5_
  
  - [ ] 20.3 Add cache invalidation
    - Invalidate cache when user manually edits components
    - Invalidate project-specific cache on project updates
    - Implement cache key patterns for bulk invalidation
    - _Requirements: 25.5_

- [ ] 21. Error Handling and Validation
  - [ ] 21.1 Create error handling utilities
    - Implement AppError base class with code, message, statusCode, details
    - Create specific error classes: ValidationError (400), AuthenticationError (401), AuthorizationError (403), NotFoundError (404), RateLimitError (429), AIServiceError (500)
    - Create handleAPIError function for consistent API error responses
    - Add error logging with console.error
    - _Requirements: 29.1, 29.5_
  
  - [ ] 21.2 Add input validation
    - Validate all API request payloads using Zod schemas
    - Return 400 status with validation errors in details field
    - Create validateRequest helper function
    - Add validation for prompt length (1-1000 chars), project name (1-100 chars), description (max 500 chars)
    - _Requirements: 29.1_
  
  - [ ] 21.3 Create ErrorBoundary component
    - Catch React errors in component tree using componentDidCatch
    - Display user-friendly error UI with error message
    - Provide "Try again" button to reset error state
    - Log errors to console (and error tracking service in production)
    - _Requirements: 29.3, 29.7_
  
  - [ ] 21.4 Implement network error handling
    - Queue changes when offline using local storage or IndexedDB
    - Retry failed requests with exponential backoff
    - Show connection status indicator (online/offline)
    - Display toast notifications for network errors
    - _Requirements: 29.3, 29.4_
  
  - [ ] 21.5 Write property tests for password validation
    - **Property 7: Password Validation Enforcement**
    - **Validates: Requirements 13.4**
    - Test that passwords meeting requirements are accepted
    - Verify passwords failing requirements are rejected
    - Check appropriate error messages are returned

- [ ] 22. UI Components Library
  - [ ] 22.1 Create reusable UI components
    - Build Button, Input, Select, Textarea components
    - Create Dialog, Tabs, Toast components
    - Add proper TypeScript types and props
    - Style with Tailwind CSS
    - _Requirements: Foundation for all UI features_
  
  - [ ] 22.2 Add loading states
    - Create Spinner component
    - Add skeleton loaders for project list
    - Show loading indicators during AI generation
    - _Requirements: 1.3, 14.1_

- [ ] 23. Onboarding Experience
  - [ ] 23.1 Create onboarding tour
    - Build interactive tour component with steps
    - Highlight key features (prompt editor, canvas, export)
    - Allow skip and pause functionality
    - _Requirements: 30.1, 30.3, 30.4_
  
  - [ ] 23.2 Add first project creation flow
    - Guide user through first prompt submission
    - Show example prompts
    - Celebrate first UI generation
    - _Requirements: 30.2, 30.5_
  
  - [ ] 23.3 Track onboarding progress
    - Store completion status in database
    - Offer to resume incomplete tours
    - _Requirements: 30.6_

- [ ] 24. Performance Optimization
  - [ ] 24.1 Implement code splitting
    - Lazy load editor components using dynamic imports
    - Split Monaco Editor into separate chunk
    - Use dynamic imports for heavy components (Canvas, CodeExporter)
    - Add loading fallbacks for lazy-loaded components
    - _Requirements: 20.1_
  
  - [ ] 24.2 Add memoization
    - Memoize ComponentRenderer with React.memo and custom comparison function
    - Use useMemo for expensive computations (style calculations, tree traversal)
    - Use useCallback for event handlers to prevent re-renders
    - Memoize style conversion functions (convertToCSSStyles, stylesToTailwind)
    - _Requirements: 20.1_
  
  - [ ] 24.3 Optimize database queries
    - Add indexes for frequently queried fields (userId, updatedAt)
    - Use select to fetch only needed fields (avoid fetching large uiDocument when listing projects)
    - Implement pagination for project lists (take: 50, skip: offset)
    - Use database connection pooling
    - _Requirements: 23.7_
  
  - [ ] 24.4 Implement virtual scrolling
    - Use @tanstack/react-virtual for large component trees
    - Implement virtual scrolling in component library panel
    - Optimize rendering of long lists (project list, prompt history)
    - _Requirements: 20.1_

- [ ] 25. Testing Setup
  - [ ] 25.1 Configure testing framework
    - Set up Jest with @testing-library/react and @testing-library/jest-dom
    - Configure test environment for Next.js (next.config.js, jest.config.js)
    - Add test scripts to package.json (test, test:watch, test:coverage)
    - Set up fast-check for property-based testing
    - Configure test file patterns (__tests__/**/*.test.ts, **/*.test.tsx)
    - _Requirements: Quality assurance_
  
  - [ ] 25.2 Write unit tests for core utilities
    - Test DnD utility functions (canDropComponent, insertComponent, removeComponent, moveComponent)
    - Test tree traversal functions (findNodeById, findParentNode, isDescendant)
    - Test style conversion functions (convertToCSSStyles, stylesToTailwind)
    - Test specific examples and edge cases (empty tree, single node, deeply nested)
    - _Requirements: 3.2, 3.4, 7.5_
  
  - [ ] 25.3 Write integration tests for API routes
    - Test POST /api/ai/generate with mock OpenAI responses
    - Test GET /api/projects and POST /api/projects CRUD operations
    - Test authentication flows (sign in, sign up, OAuth)
    - Mock external services (OpenAI, database)
    - Test error cases (401, 404, 429, 500)
    - _Requirements: 1.1, 14.2, 13.1_
  
  - [ ] 25.4 Write property-based tests
    - Implement all property tests marked with * in previous tasks
    - Use fast-check generators for UIDocument, ComponentNode, DesignTokens
    - Run 100 iterations per property test
    - Tag each test with property number and validated requirements
    - Test Properties 1-12 from design document
    - _Requirements: All correctness properties_

- [ ] 26. Deployment Configuration
  - [ ] 26.1 Configure Vercel deployment
    - Set up vercel.json with build configuration
    - Configure environment variables in Vercel dashboard
    - Set up PostgreSQL database on Supabase
    - _Requirements: Deployment infrastructure_
  
  - [ ] 26.2 Set up production environment
    - Configure production API keys (OpenAI, OAuth providers)
    - Set up Redis cache on Upstash
    - Configure domain and SSL
    - _Requirements: Deployment infrastructure_
  
  - [ ] 26.3 Add monitoring and analytics
    - Set up Vercel Analytics
    - Add error tracking
    - Configure performance monitoring
    - _Requirements: 26.6_

- [ ] 27. Documentation
  - [ ] 27.1 Create README.md
    - Document project setup instructions (npm install, database setup, environment variables)
    - List all required environment variables with descriptions
    - Add development commands (npm run dev, npm run build, npm run test)
    - Add deployment commands and Vercel configuration
    - Include architecture overview and tech stack
    - _Requirements: Developer onboarding_
  
  - [ ] 27.2 Add code comments
    - Document complex algorithms (tree traversal, style conversion, AI prompt construction)
    - Add JSDoc comments for public APIs and exported functions
    - Include examples in JSDoc comments
    - Document all correctness properties in test files
    - _Requirements: 7.8, Code maintainability_
  
  - [ ] 27.3 Create user documentation
    - Write getting started guide (sign up, create first project, generate UI)
    - Document key features with screenshots (prompt editor, canvas, export)
    - Add FAQ section (common questions about AI generation, code export, pricing)
    - Create video tutorial or GIF demonstrations
    - _Requirements: 30.8_
  
  - [ ] 27.4 Document correctness properties
    - Create PROPERTIES.md documenting all 12 correctness properties
    - Link each property to its requirements and test implementation
    - Explain property-based testing approach
    - Include examples of property violations and how they're prevented
    - _Requirements: Design document correctness properties_

- [ ] 28. Final Integration and Testing
  - [ ] 28.1 End-to-end workflow testing
    - Test complete flow: sign up → create project → generate UI from prompt → drag-and-drop edit → apply AI suggestions → export code → save project
    - Verify all 12 MVP features work together seamlessly
    - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
    - Test on multiple devices (desktop, tablet, mobile)
    - Test responsive behavior at both breakpoints (mobile 375px, desktop 1200px)
    - _Requirements: All requirements_
  
  - [ ] 28.2 Bug fixes and polish
    - Fix any issues discovered during testing
    - Improve error messages and user feedback (toast notifications, loading states)
    - Optimize performance bottlenecks (slow renders, API latency)
    - Polish animations and transitions (smooth drag-and-drop, modal animations)
    - _Requirements: 29.1, 29.2_
  
  - [ ] 28.3 Accessibility audit
    - Test with screen readers (NVDA, JAWS, VoiceOver)
    - Verify keyboard navigation (Tab, Enter, Escape, Arrow keys)
    - Check color contrast ratios (use axe DevTools or similar)
    - Test focus management (focus trap in modals, focus indicators)
    - Verify ARIA labels and roles
    - _Requirements: 19.1, 19.2, 19.3, 19.7_
  
  - [ ] 28.4 Property-based test validation
    - Run all 12 property-based tests with 100+ iterations
    - Verify no property violations found
    - Document any edge cases discovered
    - Add regression tests for any bugs found
    - _Requirements: All correctness properties_

- [ ] 29. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- The implementation follows a bottom-up approach: infrastructure → core features → UI → integration
- Authentication and database setup are prioritized to enable early feature development
- AI generation and code export are central features and receive dedicated focus
- The design uses TypeScript throughout, as specified in the design document
- All code should follow Next.js 14 App Router conventions and React 18 best practices
- Tailwind CSS should be used for all styling with mobile-first responsive design
- Focus on the 12 core MVP features: AI Prompt-to-UI, Editable Prompt Layer, Drag-and-Drop Canvas, Responsive Preview, Grid Controls, Component Library, Code Export, Project Saving, Authentication, AI Suggestions, Design Tokens, and Mobile/Desktop Preview
- Property-based tests validate 12 correctness properties from the design document
- The UI JSON schema is the single source of truth for all UI representations
- Two breakpoints only for MVP: mobile (0-767px) and desktop (768px+)
- Component tree uses recursive rendering with parent-child relationships
- Design tokens enable consistent styling and are exported as CSS variables or Tailwind config

## Implementation Strategy

1. **Phase 1 (Tasks 1-5):** Set up project infrastructure, database, authentication, and core types
2. **Phase 2 (Tasks 6-8):** Implement AI generation engine and project management APIs
3. **Phase 3 (Tasks 9-13):** Build canvas rendering, drag-and-drop, and prompt editor
4. **Phase 4 (Tasks 14-17):** Add code export, AI suggestions, design tokens, and responsive preview
5. **Phase 5 (Tasks 18-24):** Complete dashboard, editor UI, and performance optimizations
6. **Phase 6 (Tasks 25-29):** Testing, deployment, documentation, and final integration

## Correctness Properties Summary

The following 12 properties are validated through property-based testing:

1. **Prompt History Round-Trip Preservation** - Prompts stored and restored correctly (Req 1.6, 2.3, 2.4)
2. **Component Tree Manipulation Correctness** - Tree operations maintain hierarchy and uniqueness (Req 3.1, 3.2, 3.4, 3.5)
3. **Invalid Operation Prevention** - System prevents constraint violations (Req 2.6, 3.8)
4. **Multi-Format Code Export Completeness** - All formats generate valid, complete code (Req 7.1, 7.3, 7.4, 7.5)
5. **Code Export Quality Standards** - Generated code is formatted and lints correctly (Req 7.6, 7.8, 7.9)
6. **React Component Structure Separation** - React exports properly separate concerns (Req 7.4, 7.7)
7. **Password Validation Enforcement** - Password requirements correctly enforced (Req 13.4)
8. **Project Management Operation Integrity** - CRUD operations work correctly with soft delete (Req 14.3, 14.8)
9. **Project Search and Display Accuracy** - Projects display with correct metadata and search (Req 14.1, 14.4, 14.6)
10. **Design Token Lifecycle Consistency** - Tokens propagate changes to all linked components (Req 18.1, 18.2, 18.3, 18.6)
11. **Design Token Analysis Accuracy** - Token usage counting and suggestions work correctly (Req 18.4, 18.5, 18.8)
12. **Data Integrity Preservation** - Database maintains referential integrity and soft deletes (Req 23.6, 23.8)

Each property is tested with 100+ iterations using fast-check to ensure correctness across all valid inputs.
