# Design Document: AI-Powered UI Builder SaaS (MVP)

## Overview

### Vision

The AI-Powered UI Builder SaaS is an **MVP-focused platform** designed to solve a critical problem: **students and beginner developers struggle to generate professional, responsive UIs and clean frontend code using existing AI tools**. This platform serves as an **AI Frontend Learning Operating System** that combines natural language UI generation, visual editing, and code export capabilities to accelerate learning and productivity.

### MVP Philosophy

**Launch Fast, Not Perfect**
- Focus on 12 core features that deliver immediate value
- Prioritize speed-to-market over feature completeness
- Build foundation for future expansion
- Validate product-market fit quickly

### Core Problem Statement

Students and beginners face three major challenges:
1. **AI tools generate inconsistent, non-responsive UI code**
2. **No visual editing layer to refine AI-generated outputs**
3. **Steep learning curve from AI output to production-ready code**

### Solution

An integrated platform that:
1. Generates professional UIs from natural language prompts
2. Provides visual drag-and-drop editing for refinement
3. Exports clean, production-ready code in multiple formats
4. Teaches frontend best practices through AI suggestions

### MVP Scope (12 Core Features)

1. **AI Prompt-to-UI Generation** - Natural language to UI conversion
2. **Editable Prompt Layer** - Iterative prompt refinement
3. **Drag-and-Drop Canvas** - Visual component manipulation
4. **Responsive Preview System** - Multi-device preview
5. **Grid & Spacing Controls** - Visual layout alignment
6. **Component Library** - ~20 pre-built components
7. **Tailwind + HTML + React Export** - Multi-format code generation
8. **Project Saving** - Persistent project storage
9. **Basic Authentication** - User accounts and sessions
10. **AI UI Suggestions** - Design improvement recommendations
11. **Design Token Basics** - Color and spacing consistency
12. **Mobile/Desktop Preview** - Two-breakpoint responsive system

---

## Architecture

### System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        UI[Next.js Frontend]
        Canvas[Canvas Engine]
        Preview[Preview Engine]
    end
    
    subgraph "API Layer"
        API[Next.js API Routes]
        Auth[Auth Middleware]
    end
    
    subgraph "Service Layer"
        PromptEngine[Prompt Engine]
        LayoutGen[Layout Generator]
        CodeExport[Code Exporter]
        AIService[AI Service]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL)]
        Cache[(Redis Cache)]
    end
    
    subgraph "External Services"
        AIProvider[AI Provider - OpenAI OR Anthropic]
        Storage[Asset Storage]
    end
    
    UI --> API
    Canvas --> API
    Preview --> API
    API --> Auth
    Auth --> PromptEngine
    Auth --> LayoutGen
    Auth --> CodeExport
    PromptEngine --> AIService
    AIService --> AIProvider
    LayoutGen --> DB
    CodeExport --> DB
    API --> DB
    API --> Cache
    API --> Storage
```

### Technology Stack

#### Frontend Stack
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS 3.4+
- **State Management**: Zustand 4.x
- **Animation**: Framer Motion 11.x
- **Drag & Drop**: @dnd-kit/core
- **Code Editor**: Monaco Editor (for code preview)
- **Icons**: Lucide React

#### Backend Stack
- **API**: Next.js API Routes (serverless)
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5.x
- **Authentication**: NextAuth.js 4.x
- **Caching**: Redis (Upstash)
- **File Storage**: Vercel Blob Storage

#### AI Services
- **Centralized Model**: Platform uses single API key (configured by owner)
- **Supported Providers**: OpenAI (GPT-4) or Anthropic (Claude)
- **Provider Selection**: Configurable via AI_PROVIDER environment variable
- **User Experience**: Users don't need their own API keys
- **Rate Limiting**: Upstash Rate Limit

#### Deployment & Infrastructure
- **Hosting**: Vercel
- **Database**: Supabase PostgreSQL
- **Auth**: NextAuth + Supabase Auth
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics

---

## Components and Interfaces

### Internal UI JSON Schema

The platform uses a custom JSON schema to represent UI structures internally. This schema is the single source of truth for all UI representations.

#### Core Schema Structure

```typescript
// types/ui-schema.ts

export interface UIDocument {
  id: string;
  version: string; // Schema version for migrations
  metadata: DocumentMetadata;
  designTokens: DesignTokens;
  breakpoints: Breakpoint[];
  tree: ComponentNode;
}

export interface DocumentMetadata {
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  originalPrompt?: string;
  promptHistory: PromptHistoryEntry[];
}

export interface PromptHistoryEntry {
  id: string;
  prompt: string;
  timestamp: string;
  resultingTreeSnapshot: string; // Serialized tree
}

export interface DesignTokens {
  colors: Record<string, ColorToken>;
  spacing: Record<string, SpacingToken>;
  typography: Record<string, TypographyToken>;
  shadows: Record<string, ShadowToken>;
}

export interface ColorToken {
  name: string;
  value: string; // hex, rgb, hsl
  category: 'primary' | 'secondary' | 'neutral' | 'semantic';
}

export interface SpacingToken {
  name: string;
  value: string; // rem, px
}

export interface TypographyToken {
  name: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing?: string;
}

export interface ShadowToken {
  name: string;
  value: string; // CSS shadow value
}

export interface Breakpoint {
  name: 'mobile' | 'desktop';
  minWidth: number; // pixels
  maxWidth?: number;
}

export interface ComponentNode {
  id: string;
  type: ComponentType;
  props: ComponentProps;
  styles: ResponsiveStyles;
  children: ComponentNode[];
  metadata: ComponentMetadata;
}

export type ComponentType =
  // Layout
  | 'Container'
  | 'Flex'
  | 'Grid'
  | 'Stack'
  // Content
  | 'Text'
  | 'Heading'
  | 'Image'
  | 'Icon'
  // Interactive
  | 'Button'
  | 'Input'
  | 'Textarea'
  | 'Select'
  | 'Checkbox'
  | 'Radio'
  // Navigation
  | 'Nav'
  | 'Link'
  // Composite
  | 'Card'
  | 'Hero'
  | 'Feature'
  | 'Footer';

export interface ComponentProps {
  // Common props
  id?: string;
  className?: string;
  
  // Text props
  text?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6; // For Heading
  
  // Image props
  src?: string;
  alt?: string;
  
  // Interactive props
  placeholder?: string;
  value?: string;
  href?: string;
  
  // Layout props
  direction?: 'row' | 'column';
  gap?: string;
  columns?: number;
  
  // Accessibility
  ariaLabel?: string;
  role?: string;
}

export interface ResponsiveStyles {
  base: StyleObject; // Mobile-first base styles
  desktop?: StyleObject; // Desktop overrides
}

export interface StyleObject {
  // Layout
  display?: string;
  position?: string;
  width?: string;
  height?: string;
  maxWidth?: string;
  minHeight?: string;
  
  // Flexbox/Grid
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  gridTemplateColumns?: string;
  
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
  
  // Typography
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  textAlign?: string;
  color?: string;
  
  // Background
  backgroundColor?: string;
  backgroundImage?: string;
  
  // Border
  border?: string;
  borderRadius?: string;
  
  // Effects
  boxShadow?: string;
  opacity?: string;
  
  // Design token references
  colorToken?: string;
  spacingToken?: string;
  typographyToken?: string;
  shadowToken?: string;
}

export interface ComponentMetadata {
  label?: string; // User-friendly name
  locked?: boolean;
  hidden?: boolean;
  aiGenerated?: boolean;
  manuallyEdited?: boolean;
}
```

#### Example UI Document

```json
{
  "id": "proj_abc123",
  "version": "1.0",
  "metadata": {
    "name": "Landing Page",
    "description": "Modern SaaS landing page",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T11:30:00Z",
    "originalPrompt": "Create a modern landing page with hero section, features, and CTA",
    "promptHistory": [
      {
        "id": "ph_1",
        "prompt": "Create a modern landing page with hero section, features, and CTA",
        "timestamp": "2024-01-15T10:00:00Z",
        "resultingTreeSnapshot": "{...}"
      }
    ]
  },
  "designTokens": {
    "colors": {
      "primary": {
        "name": "primary",
        "value": "#3B82F6",
        "category": "primary"
      },
      "text": {
        "name": "text",
        "value": "#1F2937",
        "category": "neutral"
      }
    },
    "spacing": {
      "sm": { "name": "sm", "value": "0.5rem" },
      "md": { "name": "md", "value": "1rem" },
      "lg": { "name": "lg", "value": "2rem" }
    },
    "typography": {
      "heading": {
        "name": "heading",
        "fontSize": "3rem",
        "fontWeight": "700",
        "lineHeight": "1.2"
      }
    },
    "shadows": {
      "card": {
        "name": "card",
        "value": "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }
    }
  },
  "breakpoints": [
    { "name": "mobile", "minWidth": 0, "maxWidth": 767 },
    { "name": "desktop", "minWidth": 768 }
  ],
  "tree": {
    "id": "root",
    "type": "Container",
    "props": {},
    "styles": {
      "base": {
        "maxWidth": "1200px",
        "margin": "0 auto",
        "padding": "1rem"
      },
      "desktop": {
        "padding": "2rem"
      }
    },
    "children": [
      {
        "id": "hero_1",
        "type": "Hero",
        "props": {},
        "styles": {
          "base": {
            "display": "flex",
            "flexDirection": "column",
            "alignItems": "center",
            "gap": "2rem",
            "paddingTop": "4rem",
            "paddingBottom": "4rem"
          },
          "desktop": {
            "flexDirection": "row",
            "gap": "4rem"
          }
        },
        "children": [
          {
            "id": "heading_1",
            "type": "Heading",
            "props": {
              "text": "Build UIs with AI",
              "level": 1
            },
            "styles": {
              "base": {
                "fontSize": "2.5rem",
                "fontWeight": "700",
                "colorToken": "text"
              },
              "desktop": {
                "fontSize": "3.5rem"
              }
            },
            "children": [],
            "metadata": {
              "aiGenerated": true
            }
          },
          {
            "id": "button_1",
            "type": "Button",
            "props": {
              "text": "Get Started"
            },
            "styles": {
              "base": {
                "backgroundColor": "#3B82F6",
                "color": "#FFFFFF",
                "padding": "0.75rem 1.5rem",
                "borderRadius": "0.5rem",
                "colorToken": "primary"
              }
            },
            "children": [],
            "metadata": {
              "aiGenerated": true
            }
          }
        ],
        "metadata": {
          "label": "Hero Section",
          "aiGenerated": true
        }
      }
    ],
    "metadata": {}
  }
}
```


### Data Models

#### Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  accounts      Account[]
  sessions      Session[]
  projects      Project[]
  
  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
  @@map("verification_tokens")
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  userId      String
  uiDocument  Json     // Stores UIDocument JSON
  thumbnail   String?  // URL to preview image
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([updatedAt])
  @@map("projects")
}
```

#### API Response Types

```typescript
// types/api.ts

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface GenerateUIRequest {
  prompt: string;
  projectId?: string; // If editing existing project
  preserveManualEdits?: boolean;
}

export interface GenerateUIResponse {
  uiDocument: UIDocument;
  tokensUsed: number;
  generationTime: number;
}

export interface SaveProjectRequest {
  projectId?: string; // Omit for new project
  name: string;
  description?: string;
  uiDocument: UIDocument;
}

export interface SaveProjectResponse {
  projectId: string;
  updatedAt: string;
}

export interface ExportCodeRequest {
  uiDocument: UIDocument;
  format: 'html' | 'react' | 'tailwind';
  options?: ExportOptions;
}

export interface ExportOptions {
  includeComments?: boolean;
  minify?: boolean;
  componentStyle?: 'functional' | 'class'; // For React
}

export interface ExportCodeResponse {
  code: string;
  files?: ExportFile[]; // For multi-file exports
  format: string;
}

export interface ExportFile {
  path: string;
  content: string;
}

export interface SuggestImprovementsRequest {
  uiDocument: UIDocument;
}

export interface SuggestImprovementsResponse {
  suggestions: Suggestion[];
}

export interface Suggestion {
  id: string;
  type: 'accessibility' | 'layout' | 'responsive' | 'design-token';
  severity: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  componentId?: string; // Target component
  autoFixAvailable: boolean;
  fix?: Partial<ComponentNode>; // Auto-fix data
}
```

---

## AI Prompt Pipeline

### Prompt Engineering Strategy

The AI Prompt Pipeline is the core of the platform's value proposition. It transforms natural language into structured UI specifications.

#### System Architecture

```typescript
// lib/ai/prompt-engine.ts

export class PromptEngine {
  private aiModel: AIModel;
  private cache: PromptCache;
  
  constructor() {
    // Use centralized AI provider based on environment variable
    const provider = process.env.AI_PROVIDER || 'openai';
    
    if (provider === 'anthropic') {
      this.aiModel = new ClaudeModel('claude-3-sonnet');
    } else {
      this.aiModel = new OpenAIModel('gpt-4');
    }
    
    this.cache = new PromptCache();
  }
  
  async generateUI(prompt: string, context?: GenerationContext): Promise<UIDocument> {
    // 1. Check cache
    const cacheKey = this.getCacheKey(prompt, context);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    
    // 2. Build system prompt
    const systemPrompt = this.buildSystemPrompt(context);
    
    // 3. Build user prompt
    const userPrompt = this.buildUserPrompt(prompt, context);
    
    // 4. Call AI with retry logic
    const response = await this.callAIWithRetry(systemPrompt, userPrompt);
    
    // 5. Parse and validate response
    const uiDocument = this.parseAIResponse(response);
    
    // 6. Cache result
    await this.cache.set(cacheKey, uiDocument);
    
    return uiDocument;
  }
  
  private buildSystemPrompt(context?: GenerationContext): string {
    return `You are an expert UI/UX designer and frontend developer. Your task is to generate structured UI specifications from natural language descriptions.

CRITICAL RULES:
1. Output ONLY valid JSON matching the UIDocument schema
2. Use mobile-first responsive design
3. Apply semantic HTML principles
4. Include accessibility attributes
5. Use Tailwind CSS naming conventions for styles
6. Generate clean, hierarchical component trees
7. Apply design tokens for consistency

COMPONENT LIBRARY:
Available components: ${this.getComponentList()}

DESIGN TOKENS:
- Colors: primary, secondary, neutral, semantic
- Spacing: sm (0.5rem), md (1rem), lg (2rem), xl (3rem)
- Typography: heading (3rem/700), subheading (1.5rem/600), body (1rem/400)

RESPONSIVE BREAKPOINTS:
- mobile: 0-767px (base styles)
- desktop: 768px+ (overrides)

${context?.existingDocument ? `EXISTING DOCUMENT:
You are modifying an existing UI. Preserve manually edited components unless the prompt explicitly requests changes to them.
${JSON.stringify(context.existingDocument, null, 2)}` : ''}`;
  }
  
  private buildUserPrompt(prompt: string, context?: GenerationContext): string {
    return `Generate a UI based on this description:

"${prompt}"

${context?.preserveManualEdits ? 'IMPORTANT: Preserve any components marked with manuallyEdited: true' : ''}

Output the complete UIDocument JSON.`;
  }
  
  private async callAIWithRetry(
    systemPrompt: string,
    userPrompt: string,
    maxRetries = 3
  ): Promise<string> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await this.aiModel.complete({
          system: systemPrompt,
          user: userPrompt,
          temperature: 0.7,
          maxTokens: 4000,
        });
        
        return response;
      } catch (error) {
        lastError = error as Error;
        
        // Log error for monitoring
        console.error(`AI request failed (attempt ${attempt + 1}/${maxRetries}):`, error);
        
        // If this is the last attempt, throw the error
        if (attempt === maxRetries - 1) {
          throw new Error(`AI service failed after ${maxRetries} attempts: ${lastError.message}`);
        }
        
        // Exponential backoff
        await this.sleep(Math.pow(2, attempt) * 1000);
      }
    }
    
    throw lastError!;
  }
  
  private parseAIResponse(response: string): UIDocument {
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : response;
      
      const parsed = JSON.parse(jsonString);
      
      // Validate against schema
      const validated = UIDocumentSchema.parse(parsed);
      
      return validated;
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }
  
  private getComponentList(): string {
    return Object.values(ComponentType).join(', ');
  }
  
  private getCacheKey(prompt: string, context?: GenerationContext): string {
    return `prompt:${hashString(prompt)}:${context?.projectId || 'new'}`;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

interface GenerationContext {
  projectId?: string;
  existingDocument?: UIDocument;
  preserveManualEdits?: boolean;
}
```

#### Prompt Templates

```typescript
// lib/ai/prompt-templates.ts

export const PROMPT_TEMPLATES = {
  // Base system prompt
  SYSTEM_BASE: `You are an expert UI/UX designer and frontend developer specializing in modern web interfaces.`,
  
  // Component generation
  GENERATE_COMPONENT: `Generate a {componentType} component with the following requirements:
{requirements}

Output as UIDocument JSON with proper styling and accessibility.`,
  
  // Layout refinement
  REFINE_LAYOUT: `Analyze this UI layout and suggest improvements:
{currentLayout}

Focus on: {focusAreas}

Output improved UIDocument JSON.`,
  
  // Responsive optimization
  OPTIMIZE_RESPONSIVE: `Optimize this UI for responsive design:
{currentLayout}

Ensure proper behavior at mobile (0-767px) and desktop (768px+) breakpoints.
Output optimized UIDocument JSON.`,
  
  // Accessibility enhancement
  ENHANCE_ACCESSIBILITY: `Enhance accessibility for this UI:
{currentLayout}

Add proper ARIA labels, semantic HTML, and ensure WCAG AA compliance.
Output enhanced UIDocument JSON.`,
};
```

### AI Suggestion Engine

```typescript
// lib/ai/suggestion-engine.ts

export class SuggestionEngine {
  private aiModel: AIModel;
  
  constructor() {
    // Use the same centralized AI provider as PromptEngine
    const provider = process.env.AI_PROVIDER || 'openai';
    
    if (provider === 'anthropic') {
      this.aiModel = new ClaudeModel('claude-3-sonnet');
    } else {
      this.aiModel = new OpenAIModel('gpt-4');
    }
  }
  
  async analyzeSuggestions(uiDocument: UIDocument): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    // Run parallel analysis
    const [
      accessibilitySuggestions,
      layoutSuggestions,
      responsiveSuggestions,
      tokenSuggestions,
    ] = await Promise.all([
      this.analyzeAccessibility(uiDocument),
      this.analyzeLayout(uiDocument),
      this.analyzeResponsive(uiDocument),
      this.analyzeDesignTokens(uiDocument),
    ]);
    
    return [
      ...accessibilitySuggestions,
      ...layoutSuggestions,
      ...responsiveSuggestions,
      ...tokenSuggestions,
    ];
  }
  
  private async analyzeAccessibility(doc: UIDocument): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    // Check for missing alt text
    this.traverseTree(doc.tree, (node) => {
      if (node.type === 'Image' && !node.props.alt) {
        suggestions.push({
          id: `a11y_alt_${node.id}`,
          type: 'accessibility',
          severity: 'error',
          title: 'Missing alt text',
          description: 'Images must have descriptive alt text for screen readers',
          componentId: node.id,
          autoFixAvailable: false,
        });
      }
      
      // Check for proper heading hierarchy
      if (node.type === 'Heading') {
        // Logic to validate heading levels
      }
      
      // Check color contrast
      if (node.styles.base.color && node.styles.base.backgroundColor) {
        const contrast = this.calculateContrast(
          node.styles.base.color,
          node.styles.base.backgroundColor
        );
        
        if (contrast < 4.5) {
          suggestions.push({
            id: `a11y_contrast_${node.id}`,
            type: 'accessibility',
            severity: 'warning',
            title: 'Low color contrast',
            description: `Contrast ratio ${contrast.toFixed(2)}:1 is below WCAG AA standard (4.5:1)`,
            componentId: node.id,
            autoFixAvailable: true,
            fix: {
              ...node,
              styles: {
                ...node.styles,
                base: {
                  ...node.styles.base,
                  color: this.suggestBetterColor(node.styles.base.color, node.styles.base.backgroundColor),
                },
              },
            },
          });
        }
      }
    });
    
    return suggestions;
  }
  
  private async analyzeLayout(doc: UIDocument): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    // Check for proper spacing
    this.traverseTree(doc.tree, (node) => {
      if (node.children.length > 0 && !node.styles.base.gap) {
        suggestions.push({
          id: `layout_gap_${node.id}`,
          type: 'layout',
          severity: 'info',
          title: 'Consider adding gap',
          description: 'Container with children should have gap for proper spacing',
          componentId: node.id,
          autoFixAvailable: true,
          fix: {
            ...node,
            styles: {
              ...node.styles,
              base: {
                ...node.styles.base,
                gap: '1rem',
              },
            },
          },
        });
      }
    });
    
    return suggestions;
  }
  
  private async analyzeResponsive(doc: UIDocument): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    // Check for desktop-specific styles
    this.traverseTree(doc.tree, (node) => {
      if (!node.styles.desktop && node.styles.base.flexDirection === 'row') {
        suggestions.push({
          id: `responsive_stack_${node.id}`,
          type: 'responsive',
          severity: 'warning',
          title: 'Consider mobile stacking',
          description: 'Horizontal layouts should stack vertically on mobile',
          componentId: node.id,
          autoFixAvailable: true,
          fix: {
            ...node,
            styles: {
              base: {
                ...node.styles.base,
                flexDirection: 'column',
              },
              desktop: {
                flexDirection: 'row',
              },
            },
          },
        });
      }
    });
    
    return suggestions;
  }
  
  private async analyzeDesignTokens(doc: UIDocument): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    // Find repeated color values that should be tokens
    const colorUsage = new Map<string, number>();
    
    this.traverseTree(doc.tree, (node) => {
      const color = node.styles.base.color;
      if (color && !node.styles.base.colorToken) {
        colorUsage.set(color, (colorUsage.get(color) || 0) + 1);
      }
    });
    
    colorUsage.forEach((count, color) => {
      if (count >= 3) {
        suggestions.push({
          id: `token_color_${color}`,
          type: 'design-token',
          severity: 'info',
          title: 'Create color token',
          description: `Color ${color} is used ${count} times. Consider creating a design token.`,
          autoFixAvailable: false,
        });
      }
    });
    
    return suggestions;
  }
  
  private traverseTree(node: ComponentNode, callback: (node: ComponentNode) => void): void {
    callback(node);
    node.children.forEach(child => this.traverseTree(child, callback));
  }
  
  private calculateContrast(color1: string, color2: string): number {
    // Simplified contrast calculation
    // In production, use a proper library like 'color-contrast-checker'
    return 4.5; // Placeholder
  }
  
  private suggestBetterColor(foreground: string, background: string): string {
    // Logic to suggest better color
    return '#000000'; // Placeholder
  }
}
```


---

## Component Rendering System

### Canvas Rendering Engine

The Canvas is the visual workspace where users see and manipulate their UI. It renders the UIDocument in real-time with full interactivity.

```typescript
// components/canvas/Canvas.tsx

'use client';

import { useCanvasStore } from '@/stores/canvas-store';
import { ComponentRenderer } from './ComponentRenderer';
import { SelectionOverlay } from './SelectionOverlay';
import { GridOverlay } from './GridOverlay';
import { DndContext, DragEndEvent } from '@dnd-kit/core';

export function Canvas() {
  const {
    uiDocument,
    selectedComponentId,
    gridEnabled,
    viewport,
    updateComponentPosition,
  } = useCanvasStore();
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over) {
      updateComponentPosition(active.id as string, over.id as string);
    }
  };
  
  return (
    <div className="canvas-container relative w-full h-full overflow-auto bg-gray-50">
      <DndContext onDragEnd={handleDragEnd}>
        {/* Grid overlay */}
        {gridEnabled && <GridOverlay />}
        
        {/* Viewport wrapper for responsive preview */}
        <div
          className="canvas-viewport mx-auto bg-white shadow-lg"
          style={{
            width: viewport === 'mobile' ? '375px' : '100%',
            maxWidth: viewport === 'desktop' ? '1200px' : undefined,
            minHeight: '100vh',
          }}
        >
          {/* Render component tree */}
          {uiDocument && (
            <ComponentRenderer
              node={uiDocument.tree}
              isRoot
            />
          )}
        </div>
        
        {/* Selection overlay */}
        {selectedComponentId && (
          <SelectionOverlay componentId={selectedComponentId} />
        )}
      </DndContext>
    </div>
  );
}
```

### Component Renderer

```typescript
// components/canvas/ComponentRenderer.tsx

import { ComponentNode } from '@/types/ui-schema';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useCanvasStore } from '@/stores/canvas-store';
import { cn } from '@/lib/utils';

interface ComponentRendererProps {
  node: ComponentNode;
  isRoot?: boolean;
}

export function ComponentRenderer({ node, isRoot = false }: ComponentRendererProps) {
  const { selectedComponentId, selectComponent, viewport } = useCanvasStore();
  
  const { attributes, listeners, setNodeRef: setDragRef } = useDraggable({
    id: node.id,
    disabled: isRoot || node.metadata.locked,
  });
  
  const { setNodeRef: setDropRef } = useDroppable({
    id: node.id,
  });
  
  // Merge refs
  const setRefs = (element: HTMLElement | null) => {
    setDragRef(element);
    setDropRef(element);
  };
  
  // Get responsive styles
  const styles = viewport === 'desktop' && node.styles.desktop
    ? { ...node.styles.base, ...node.styles.desktop }
    : node.styles.base;
  
  // Convert style object to CSS
  const cssStyles = convertToCSSStyles(styles);
  
  // Render based on component type
  const Component = getComponentByType(node.type);
  
  return (
    <div
      ref={setRefs}
      {...attributes}
      {...listeners}
      className={cn(
        'component-wrapper',
        selectedComponentId === node.id && 'ring-2 ring-blue-500',
        node.metadata.hidden && 'opacity-50'
      )}
      style={cssStyles}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(node.id);
      }}
      data-component-id={node.id}
      data-component-type={node.type}
    >
      <Component node={node}>
        {node.children.map((child) => (
          <ComponentRenderer key={child.id} node={child} />
        ))}
      </Component>
    </div>
  );
}

function convertToCSSStyles(styles: StyleObject): React.CSSProperties {
  // Convert our style object to React CSS properties
  return {
    display: styles.display,
    position: styles.position as any,
    width: styles.width,
    height: styles.height,
    maxWidth: styles.maxWidth,
    minHeight: styles.minHeight,
    flexDirection: styles.flexDirection as any,
    justifyContent: styles.justifyContent,
    alignItems: styles.alignItems,
    gap: styles.gap,
    gridTemplateColumns: styles.gridTemplateColumns,
    margin: styles.margin,
    marginTop: styles.marginTop,
    marginRight: styles.marginRight,
    marginBottom: styles.marginBottom,
    marginLeft: styles.marginLeft,
    padding: styles.padding,
    paddingTop: styles.paddingTop,
    paddingRight: styles.paddingRight,
    paddingBottom: styles.paddingBottom,
    paddingLeft: styles.paddingLeft,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    lineHeight: styles.lineHeight,
    textAlign: styles.textAlign as any,
    color: styles.color,
    backgroundColor: styles.backgroundColor,
    backgroundImage: styles.backgroundImage,
    border: styles.border,
    borderRadius: styles.borderRadius,
    boxShadow: styles.boxShadow,
    opacity: styles.opacity,
  };
}

function getComponentByType(type: ComponentType) {
  const components = {
    Container: ContainerComponent,
    Flex: FlexComponent,
    Grid: GridComponent,
    Stack: StackComponent,
    Text: TextComponent,
    Heading: HeadingComponent,
    Image: ImageComponent,
    Button: ButtonComponent,
    Input: InputComponent,
    Card: CardComponent,
    Hero: HeroComponent,
    // ... other components
  };
  
  return components[type] || ContainerComponent;
}
```

### Individual Component Implementations

```typescript
// components/canvas/components/TextComponent.tsx

export function TextComponent({ node, children }: ComponentProps) {
  return <span>{node.props.text || children}</span>;
}

// components/canvas/components/HeadingComponent.tsx

export function HeadingComponent({ node, children }: ComponentProps) {
  const Tag = `h${node.props.level || 1}` as keyof JSX.IntrinsicElements;
  return <Tag>{node.props.text || children}</Tag>;
}

// components/canvas/components/ButtonComponent.tsx

export function ButtonComponent({ node, children }: ComponentProps) {
  return (
    <button
      type="button"
      aria-label={node.props.ariaLabel}
    >
      {node.props.text || children}
    </button>
  );
}

// components/canvas/components/ImageComponent.tsx

export function ImageComponent({ node }: ComponentProps) {
  return (
    <img
      src={node.props.src || '/placeholder.svg'}
      alt={node.props.alt || ''}
      loading="lazy"
    />
  );
}

// components/canvas/components/FlexComponent.tsx

export function FlexComponent({ children }: ComponentProps) {
  return <div className="flex">{children}</div>;
}

// components/canvas/components/GridComponent.tsx

export function GridComponent({ children }: ComponentProps) {
  return <div className="grid">{children}</div>;
}

// components/canvas/components/CardComponent.tsx

export function CardComponent({ children }: ComponentProps) {
  return (
    <div className="card rounded-lg border bg-white p-6 shadow-sm">
      {children}
    </div>
  );
}
```

---

## Drag-and-Drop Architecture

### DnD Implementation with @dnd-kit

```typescript
// lib/dnd/dnd-utils.ts

import { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { ComponentNode } from '@/types/ui-schema';

export interface DndState {
  activeId: string | null;
  overId: string | null;
  dropIndicator: DropIndicator | null;
}

export interface DropIndicator {
  parentId: string;
  position: 'before' | 'after' | 'inside';
  index: number;
}

export function canDropComponent(
  draggedNode: ComponentNode,
  targetNode: ComponentNode
): boolean {
  // Prevent dropping on self
  if (draggedNode.id === targetNode.id) return false;
  
  // Prevent dropping parent into child
  if (isDescendant(targetNode, draggedNode.id)) return false;
  
  // Check if target accepts children
  if (!canHaveChildren(targetNode.type)) return false;
  
  return true;
}

export function isDescendant(node: ComponentNode, ancestorId: string): boolean {
  if (node.id === ancestorId) return true;
  return node.children.some(child => isDescendant(child, ancestorId));
}

export function canHaveChildren(type: ComponentType): boolean {
  const containerTypes: ComponentType[] = [
    'Container',
    'Flex',
    'Grid',
    'Stack',
    'Card',
    'Hero',
    'Nav',
  ];
  
  return containerTypes.includes(type);
}

export function insertComponent(
  tree: ComponentNode,
  componentToInsert: ComponentNode,
  targetId: string,
  position: 'before' | 'after' | 'inside'
): ComponentNode {
  // Clone tree to avoid mutation
  const newTree = JSON.parse(JSON.stringify(tree));
  
  // Find target node
  const targetNode = findNodeById(newTree, targetId);
  if (!targetNode) return tree;
  
  // Remove component from current position if moving
  removeNodeById(newTree, componentToInsert.id);
  
  // Insert at new position
  if (position === 'inside') {
    targetNode.children.push(componentToInsert);
  } else {
    const parent = findParentNode(newTree, targetId);
    if (!parent) return tree;
    
    const index = parent.children.findIndex(c => c.id === targetId);
    const insertIndex = position === 'before' ? index : index + 1;
    parent.children.splice(insertIndex, 0, componentToInsert);
  }
  
  return newTree;
}

export function findNodeById(node: ComponentNode, id: string): ComponentNode | null {
  if (node.id === id) return node;
  
  for (const child of node.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  
  return null;
}

export function findParentNode(tree: ComponentNode, childId: string): ComponentNode | null {
  for (const child of tree.children) {
    if (child.id === childId) return tree;
    
    const found = findParentNode(child, childId);
    if (found) return found;
  }
  
  return null;
}

export function removeNodeById(tree: ComponentNode, id: string): boolean {
  const index = tree.children.findIndex(c => c.id === id);
  
  if (index !== -1) {
    tree.children.splice(index, 1);
    return true;
  }
  
  for (const child of tree.children) {
    if (removeNodeById(child, id)) return true;
  }
  
  return false;
}
```

### Component Library Panel

```typescript
// components/sidebar/ComponentLibrary.tsx

'use client';

import { useDraggable } from '@dnd-kit/core';
import { ComponentType } from '@/types/ui-schema';
import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

interface ComponentLibraryItem {
  type: ComponentType;
  label: string;
  icon: LucideIcon;
  category: string;
}

const COMPONENT_LIBRARY: ComponentLibraryItem[] = [
  // Layout
  { type: 'Container', label: 'Container', icon: Icons.Box, category: 'Layout' },
  { type: 'Flex', label: 'Flex', icon: Icons.Columns, category: 'Layout' },
  { type: 'Grid', label: 'Grid', icon: Icons.Grid3x3, category: 'Layout' },
  { type: 'Stack', label: 'Stack', icon: Icons.Layers, category: 'Layout' },
  
  // Content
  { type: 'Text', label: 'Text', icon: Icons.Type, category: 'Content' },
  { type: 'Heading', label: 'Heading', icon: Icons.Heading, category: 'Content' },
  { type: 'Image', label: 'Image', icon: Icons.Image, category: 'Content' },
  
  // Interactive
  { type: 'Button', label: 'Button', icon: Icons.MousePointerClick, category: 'Interactive' },
  { type: 'Input', label: 'Input', icon: Icons.TextCursor, category: 'Interactive' },
  { type: 'Textarea', label: 'Textarea', icon: Icons.FileText, category: 'Interactive' },
  { type: 'Select', label: 'Select', icon: Icons.ChevronDown, category: 'Interactive' },
  { type: 'Checkbox', label: 'Checkbox', icon: Icons.CheckSquare, category: 'Interactive' },
  
  // Navigation
  { type: 'Nav', label: 'Navigation', icon: Icons.Menu, category: 'Navigation' },
  { type: 'Link', label: 'Link', icon: Icons.Link, category: 'Navigation' },
  
  // Composite
  { type: 'Card', label: 'Card', icon: Icons.Square, category: 'Composite' },
  { type: 'Hero', label: 'Hero', icon: Icons.Sparkles, category: 'Composite' },
  { type: 'Feature', label: 'Feature', icon: Icons.Star, category: 'Composite' },
  { type: 'Footer', label: 'Footer', icon: Icons.AlignBottom, category: 'Composite' },
];

export function ComponentLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const categories = ['All', ...new Set(COMPONENT_LIBRARY.map(c => c.category))];
  
  const filteredComponents = COMPONENT_LIBRARY.filter(component => {
    const matchesSearch = component.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="component-library p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Components</h3>
        <input
          type="text"
          placeholder="Search components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      <div className="flex gap-2 flex-wrap">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              'px-3 py-1 rounded-full text-sm',
              selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700'
            )}
          >
            {category}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {filteredComponents.map(component => (
          <DraggableComponent key={component.type} component={component} />
        ))}
      </div>
    </div>
  );
}

function DraggableComponent({ component }: { component: ComponentLibraryItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${component.type}`,
    data: {
      type: component.type,
      isNew: true,
    },
  });
  
  const Icon = component.icon;
  
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        'flex flex-col items-center gap-2 p-3 border rounded-lg cursor-move hover:bg-gray-50 transition-colors',
        isDragging && 'opacity-50'
      )}
    >
      <Icon className="w-6 h-6 text-gray-600" />
      <span className="text-sm text-center">{component.label}</span>
    </div>
  );
}
```


---

## Code Export Engine

### Export System Architecture

```typescript
// lib/export/code-exporter.ts

export class CodeExporter {
  async export(
    uiDocument: UIDocument,
    format: 'html' | 'react' | 'tailwind',
    options: ExportOptions = {}
  ): Promise<ExportCodeResponse> {
    switch (format) {
      case 'html':
        return this.exportHTML(uiDocument, options);
      case 'react':
        return this.exportReact(uiDocument, options);
      case 'tailwind':
        return this.exportTailwind(uiDocument, options);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
  
  private async exportHTML(doc: UIDocument, options: ExportOptions): Promise<ExportCodeResponse> {
    const html = this.generateHTML(doc.tree, doc.designTokens);
    const css = this.generateCSS(doc.tree, doc.designTokens);
    
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.metadata.name}</title>
  <style>
${css}
  </style>
</head>
<body>
${html}
</body>
</html>`;
    
    return {
      code: options.minify ? this.minifyHTML(fullHTML) : fullHTML,
      format: 'html',
    };
  }
  
  private async exportReact(doc: UIDocument, options: ExportOptions): Promise<ExportCodeResponse> {
    const files: ExportFile[] = [];
    
    // Generate main component
    const mainComponent = this.generateReactComponent(doc.tree, 'App', doc.designTokens);
    files.push({
      path: 'App.tsx',
      content: mainComponent,
    });
    
    // Generate child components
    const childComponents = this.extractChildComponents(doc.tree);
    childComponents.forEach(({ name, node }) => {
      const component = this.generateReactComponent(node, name, doc.designTokens);
      files.push({
        path: `components/${name}.tsx`,
        content: component,
      });
    });
    
    // Generate Tailwind config
    const tailwindConfig = this.generateTailwindConfig(doc.designTokens);
    files.push({
      path: 'tailwind.config.js',
      content: tailwindConfig,
    });
    
    // Generate package.json
    files.push({
      path: 'package.json',
      content: this.generatePackageJson(doc.metadata.name),
    });
    
    return {
      code: mainComponent,
      files,
      format: 'react',
    };
  }
  
  private async exportTailwind(doc: UIDocument, options: ExportOptions): Promise<ExportCodeResponse> {
    const html = this.generateHTMLWithTailwind(doc.tree);
    const config = this.generateTailwindConfig(doc.designTokens);
    
    return {
      code: html,
      files: [
        { path: 'index.html', content: html },
        { path: 'tailwind.config.js', content: config },
      ],
      format: 'tailwind',
    };
  }
  
  private generateHTML(node: ComponentNode, tokens: DesignTokens, indent = 0): string {
    const indentation = '  '.repeat(indent);
    const tag = this.getHTMLTag(node.type);
    const attributes = this.getHTMLAttributes(node);
    const styles = this.generateInlineStyles(node.styles.base, tokens);
    
    const openTag = `${indentation}<${tag}${attributes}${styles ? ` style="${styles}"` : ''}>`;
    
    let content = '';
    if (node.props.text) {
      content = node.props.text;
    } else if (node.children.length > 0) {
      content = '\n' + node.children
        .map(child => this.generateHTML(child, tokens, indent + 1))
        .join('\n') + '\n' + indentation;
    }
    
    const closeTag = `</${tag}>`;
    
    return `${openTag}${content}${closeTag}`;
  }
  
  private generateReactComponent(
    node: ComponentNode,
    componentName: string,
    tokens: DesignTokens
  ): string {
    const imports = this.collectReactImports(node);
    const jsx = this.generateJSX(node, tokens);
    
    return `${options.includeComments ? '// Generated by AI UI Builder\n' : ''}import React from 'react';
${imports.join('\n')}

export function ${componentName}() {
  return (
${jsx}
  );
}`;
  }
  
  private generateJSX(node: ComponentNode, tokens: DesignTokens, indent = 2): string {
    const indentation = '  '.repeat(indent);
    const component = this.getReactComponent(node.type);
    const props = this.getReactProps(node, tokens);
    
    const openTag = `${indentation}<${component}${props}>`;
    
    let content = '';
    if (node.props.text) {
      content = node.props.text;
    } else if (node.children.length > 0) {
      content = '\n' + node.children
        .map(child => this.generateJSX(child, tokens, indent + 1))
        .join('\n') + '\n' + indentation;
    }
    
    const closeTag = `</${component}>`;
    
    return `${openTag}${content}${closeTag}`;
  }
  
  private generateHTMLWithTailwind(node: ComponentNode, indent = 0): string {
    const indentation = '  '.repeat(indent);
    const tag = this.getHTMLTag(node.type);
    const attributes = this.getHTMLAttributes(node);
    const classes = this.generateTailwindClasses(node.styles);
    
    const openTag = `${indentation}<${tag}${attributes}${classes ? ` class="${classes}"` : ''}>`;
    
    let content = '';
    if (node.props.text) {
      content = node.props.text;
    } else if (node.children.length > 0) {
      content = '\n' + node.children
        .map(child => this.generateHTMLWithTailwind(child, indent + 1))
        .join('\n') + '\n' + indentation;
    }
    
    const closeTag = `</${tag}>`;
    
    return `${openTag}${content}${closeTag}`;
  }
  
  private generateTailwindClasses(styles: ResponsiveStyles): string {
    const classes: string[] = [];
    
    // Base (mobile) classes
    classes.push(...this.stylesToTailwind(styles.base));
    
    // Desktop classes with md: prefix
    if (styles.desktop) {
      const desktopClasses = this.stylesToTailwind(styles.desktop);
      classes.push(...desktopClasses.map(c => `md:${c}`));
    }
    
    return classes.join(' ');
  }
  
  private stylesToTailwind(styles: StyleObject): string[] {
    const classes: string[] = [];
    
    // Layout
    if (styles.display === 'flex') classes.push('flex');
    if (styles.display === 'grid') classes.push('grid');
    if (styles.flexDirection === 'column') classes.push('flex-col');
    if (styles.flexDirection === 'row') classes.push('flex-row');
    if (styles.justifyContent === 'center') classes.push('justify-center');
    if (styles.alignItems === 'center') classes.push('items-center');
    
    // Spacing
    if (styles.gap) classes.push(this.convertToTailwindSpacing('gap', styles.gap));
    if (styles.padding) classes.push(this.convertToTailwindSpacing('p', styles.padding));
    if (styles.margin) classes.push(this.convertToTailwindSpacing('m', styles.margin));
    
    // Typography
    if (styles.fontSize) classes.push(this.convertToTailwindFontSize(styles.fontSize));
    if (styles.fontWeight) classes.push(this.convertToTailwindFontWeight(styles.fontWeight));
    if (styles.textAlign) classes.push(`text-${styles.textAlign}`);
    
    // Colors
    if (styles.color) classes.push(this.convertToTailwindColor('text', styles.color));
    if (styles.backgroundColor) classes.push(this.convertToTailwindColor('bg', styles.backgroundColor));
    
    // Border
    if (styles.borderRadius) classes.push(this.convertToTailwindBorderRadius(styles.borderRadius));
    
    return classes;
  }
  
  private convertToTailwindSpacing(prefix: string, value: string): string {
    const map: Record<string, string> = {
      '0.25rem': '1',
      '0.5rem': '2',
      '0.75rem': '3',
      '1rem': '4',
      '1.5rem': '6',
      '2rem': '8',
      '3rem': '12',
      '4rem': '16',
    };
    
    return `${prefix}-${map[value] || '4'}`;
  }
  
  private convertToTailwindFontSize(value: string): string {
    const map: Record<string, string> = {
      '0.75rem': 'text-xs',
      '0.875rem': 'text-sm',
      '1rem': 'text-base',
      '1.125rem': 'text-lg',
      '1.25rem': 'text-xl',
      '1.5rem': 'text-2xl',
      '2rem': 'text-3xl',
      '2.5rem': 'text-4xl',
      '3rem': 'text-5xl',
    };
    
    return map[value] || 'text-base';
  }
  
  private convertToTailwindFontWeight(value: string): string {
    const map: Record<string, string> = {
      '300': 'font-light',
      '400': 'font-normal',
      '500': 'font-medium',
      '600': 'font-semibold',
      '700': 'font-bold',
      '800': 'font-extrabold',
    };
    
    return map[value] || 'font-normal';
  }
  
  private convertToTailwindColor(prefix: string, value: string): string {
    // Simplified - in production, use a color matching library
    if (value.startsWith('#')) {
      return `${prefix}-[${value}]`; // Arbitrary value
    }
    return `${prefix}-gray-900`;
  }
  
  private convertToTailwindBorderRadius(value: string): string {
    const map: Record<string, string> = {
      '0.25rem': 'rounded-sm',
      '0.375rem': 'rounded',
      '0.5rem': 'rounded-md',
      '0.75rem': 'rounded-lg',
      '1rem': 'rounded-xl',
      '9999px': 'rounded-full',
    };
    
    return map[value] || 'rounded';
  }
  
  private generateTailwindConfig(tokens: DesignTokens): string {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
${Object.entries(tokens.colors).map(([key, token]) => 
  `        ${key}: '${token.value}',`
).join('\n')}
      },
      spacing: {
${Object.entries(tokens.spacing).map(([key, token]) => 
  `        ${key}: '${token.value}',`
).join('\n')}
      },
    },
  },
  plugins: [],
}`;
  }
  
  private generatePackageJson(projectName: string): string {
    return JSON.stringify({
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
      },
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'next': '^14.0.0',
      },
      devDependencies: {
        '@types/node': '^20',
        '@types/react': '^18',
        '@types/react-dom': '^18',
        'typescript': '^5',
        'tailwindcss': '^3.4.0',
        'postcss': '^8',
        'autoprefixer': '^10',
      },
    }, null, 2);
  }
  
  private getHTMLTag(type: ComponentType): string {
    const tagMap: Record<ComponentType, string> = {
      Container: 'div',
      Flex: 'div',
      Grid: 'div',
      Stack: 'div',
      Text: 'span',
      Heading: 'h1',
      Image: 'img',
      Icon: 'i',
      Button: 'button',
      Input: 'input',
      Textarea: 'textarea',
      Select: 'select',
      Checkbox: 'input',
      Radio: 'input',
      Nav: 'nav',
      Link: 'a',
      Card: 'div',
      Hero: 'section',
      Feature: 'div',
      Footer: 'footer',
    };
    
    return tagMap[type] || 'div';
  }
  
  private getReactComponent(type: ComponentType): string {
    // For MVP, use HTML tags
    // In future, could map to custom components
    return this.getHTMLTag(type);
  }
  
  private getHTMLAttributes(node: ComponentNode): string {
    const attrs: string[] = [];
    
    if (node.props.id) attrs.push(`id="${node.props.id}"`);
    if (node.props.href) attrs.push(`href="${node.props.href}"`);
    if (node.props.src) attrs.push(`src="${node.props.src}"`);
    if (node.props.alt) attrs.push(`alt="${node.props.alt}"`);
    if (node.props.placeholder) attrs.push(`placeholder="${node.props.placeholder}"`);
    if (node.props.ariaLabel) attrs.push(`aria-label="${node.props.ariaLabel}"`);
    if (node.props.role) attrs.push(`role="${node.props.role}"`);
    
    if (node.type === 'Checkbox' || node.type === 'Radio') {
      attrs.push(`type="${node.type.toLowerCase()}"`);
    }
    
    return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
  }
  
  private getReactProps(node: ComponentNode, tokens: DesignTokens): string {
    const props: string[] = [];
    
    // Add className with Tailwind classes
    const classes = this.generateTailwindClasses(node.styles);
    if (classes) props.push(`className="${classes}"`);
    
    // Add other props
    if (node.props.id) props.push(`id="${node.props.id}"`);
    if (node.props.href) props.push(`href="${node.props.href}"`);
    if (node.props.src) props.push(`src="${node.props.src}"`);
    if (node.props.alt) props.push(`alt="${node.props.alt}"`);
    if (node.props.placeholder) props.push(`placeholder="${node.props.placeholder}"`);
    if (node.props.ariaLabel) props.push(`aria-label="${node.props.ariaLabel}"`);
    
    return props.length > 0 ? ' ' + props.join(' ') : '';
  }
  
  private generateInlineStyles(styles: StyleObject, tokens: DesignTokens): string {
    const cssProps: string[] = [];
    
    Object.entries(styles).forEach(([key, value]) => {
      if (value && !key.endsWith('Token')) {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        cssProps.push(`${cssKey}: ${value}`);
      }
    });
    
    return cssProps.join('; ');
  }
  
  private generateCSS(node: ComponentNode, tokens: DesignTokens): string {
    let css = '';
    
    // Generate CSS for this node
    const selector = `.component-${node.id}`;
    const baseStyles = this.generateInlineStyles(node.styles.base, tokens);
    
    if (baseStyles) {
      css += `${selector} {\n  ${baseStyles.replace(/; /g, ';\n  ')};\n}\n\n`;
    }
    
    // Desktop styles
    if (node.styles.desktop) {
      const desktopStyles = this.generateInlineStyles(node.styles.desktop, tokens);
      if (desktopStyles) {
        css += `@media (min-width: 768px) {\n  ${selector} {\n    ${desktopStyles.replace(/; /g, ';\n    ')};\n  }\n}\n\n`;
      }
    }
    
    // Recursively generate CSS for children
    node.children.forEach(child => {
      css += this.generateCSS(child, tokens);
    });
    
    return css;
  }
  
  private collectReactImports(node: ComponentNode): string[] {
    const imports = new Set<string>();
    
    // Add imports based on component types used
    this.traverseTree(node, (n) => {
      // Add custom component imports if needed
    });
    
    return Array.from(imports);
  }
  
  private extractChildComponents(node: ComponentNode): Array<{ name: string; node: ComponentNode }> {
    const components: Array<{ name: string; node: ComponentNode }> = [];
    
    // Extract reusable components (e.g., Cards, Features)
    if (['Card', 'Feature', 'Hero'].includes(node.type)) {
      components.push({
        name: `${node.type}Component`,
        node,
      });
    }
    
    node.children.forEach(child => {
      components.push(...this.extractChildComponents(child));
    });
    
    return components;
  }
  
  private traverseTree(node: ComponentNode, callback: (node: ComponentNode) => void): void {
    callback(node);
    node.children.forEach(child => this.traverseTree(child, callback));
  }
  
  private minifyHTML(html: string): string {
    return html
      .replace(/\n\s*/g, '')
      .replace(/>\s+</g, '><')
      .trim();
  }
}
```


---

## State Management

### Zustand Store Architecture

```typescript
// stores/canvas-store.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { UIDocument, ComponentNode } from '@/types/ui-schema';

interface CanvasState {
  // Document state
  uiDocument: UIDocument | null;
  originalPrompt: string;
  
  // UI state
  selectedComponentId: string | null;
  hoveredComponentId: string | null;
  viewport: 'mobile' | 'desktop';
  gridEnabled: boolean;
  snapToGrid: boolean;
  
  // History
  history: UIDocument[];
  historyIndex: number;
  
  // Actions
  setUIDocument: (doc: UIDocument) => void;
  updateComponent: (componentId: string, updates: Partial<ComponentNode>) => void;
  addComponent: (component: ComponentNode, parentId: string, index?: number) => void;
  removeComponent: (componentId: string) => void;
  moveComponent: (componentId: string, newParentId: string, index?: number) => void;
  selectComponent: (componentId: string | null) => void;
  setHoveredComponent: (componentId: string | null) => void;
  setViewport: (viewport: 'mobile' | 'desktop') => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  undo: () => void;
  redo: () => void;
  updateComponentPosition: (componentId: string, newParentId: string) => void;
}

export const useCanvasStore = create<CanvasState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        uiDocument: null,
        originalPrompt: '',
        selectedComponentId: null,
        hoveredComponentId: null,
        viewport: 'desktop',
        gridEnabled: false,
        snapToGrid: true,
        history: [],
        historyIndex: -1,
        
        // Actions
        setUIDocument: (doc) => {
          set((state) => ({
            uiDocument: doc,
            history: [...state.history.slice(0, state.historyIndex + 1), doc],
            historyIndex: state.historyIndex + 1,
          }));
        },
        
        updateComponent: (componentId, updates) => {
          const { uiDocument } = get();
          if (!uiDocument) return;
          
          const newDoc = updateComponentInTree(uiDocument, componentId, updates);
          get().setUIDocument(newDoc);
        },
        
        addComponent: (component, parentId, index) => {
          const { uiDocument } = get();
          if (!uiDocument) return;
          
          const newDoc = addComponentToTree(uiDocument, component, parentId, index);
          get().setUIDocument(newDoc);
        },
        
        removeComponent: (componentId) => {
          const { uiDocument } = get();
          if (!uiDocument) return;
          
          const newDoc = removeComponentFromTree(uiDocument, componentId);
          get().setUIDocument(newDoc);
        },
        
        moveComponent: (componentId, newParentId, index) => {
          const { uiDocument } = get();
          if (!uiDocument) return;
          
          const newDoc = moveComponentInTree(uiDocument, componentId, newParentId, index);
          get().setUIDocument(newDoc);
        },
        
        selectComponent: (componentId) => {
          set({ selectedComponentId: componentId });
        },
        
        setHoveredComponent: (componentId) => {
          set({ hoveredComponentId: componentId });
        },
        
        setViewport: (viewport) => {
          set({ viewport });
        },
        
        toggleGrid: () => {
          set((state) => ({ gridEnabled: !state.gridEnabled }));
        },
        
        toggleSnapToGrid: () => {
          set((state) => ({ snapToGrid: !state.snapToGrid }));
        },
        
        undo: () => {
          const { history, historyIndex } = get();
          if (historyIndex > 0) {
            set({
              uiDocument: history[historyIndex - 1],
              historyIndex: historyIndex - 1,
            });
          }
        },
        
        redo: () => {
          const { history, historyIndex } = get();
          if (historyIndex < history.length - 1) {
            set({
              uiDocument: history[historyIndex + 1],
              historyIndex: historyIndex + 1,
            });
          }
        },
        
        updateComponentPosition: (componentId, newParentId) => {
          get().moveComponent(componentId, newParentId);
        },
      }),
      {
        name: 'canvas-storage',
        partialize: (state) => ({
          viewport: state.viewport,
          gridEnabled: state.gridEnabled,
          snapToGrid: state.snapToGrid,
        }),
      }
    )
  )
);

// Helper functions
function updateComponentInTree(
  doc: UIDocument,
  componentId: string,
  updates: Partial<ComponentNode>
): UIDocument {
  const newTree = JSON.parse(JSON.stringify(doc.tree));
  const component = findNodeById(newTree, componentId);
  
  if (component) {
    Object.assign(component, updates);
    component.metadata.manuallyEdited = true;
  }
  
  return { ...doc, tree: newTree, metadata: { ...doc.metadata, updatedAt: new Date().toISOString() } };
}

function addComponentToTree(
  doc: UIDocument,
  component: ComponentNode,
  parentId: string,
  index?: number
): UIDocument {
  const newTree = JSON.parse(JSON.stringify(doc.tree));
  const parent = findNodeById(newTree, parentId);
  
  if (parent) {
    if (index !== undefined) {
      parent.children.splice(index, 0, component);
    } else {
      parent.children.push(component);
    }
  }
  
  return { ...doc, tree: newTree, metadata: { ...doc.metadata, updatedAt: new Date().toISOString() } };
}

function removeComponentFromTree(doc: UIDocument, componentId: string): UIDocument {
  const newTree = JSON.parse(JSON.stringify(doc.tree));
  removeNodeById(newTree, componentId);
  
  return { ...doc, tree: newTree, metadata: { ...doc.metadata, updatedAt: new Date().toISOString() } };
}

function moveComponentInTree(
  doc: UIDocument,
  componentId: string,
  newParentId: string,
  index?: number
): UIDocument {
  const newTree = JSON.parse(JSON.stringify(doc.tree));
  
  // Find and remove component
  const component = findNodeById(newTree, componentId);
  if (!component) return doc;
  
  const componentCopy = JSON.parse(JSON.stringify(component));
  removeNodeById(newTree, componentId);
  
  // Add to new parent
  const newParent = findNodeById(newTree, newParentId);
  if (newParent) {
    if (index !== undefined) {
      newParent.children.splice(index, 0, componentCopy);
    } else {
      newParent.children.push(componentCopy);
    }
  }
  
  return { ...doc, tree: newTree, metadata: { ...doc.metadata, updatedAt: new Date().toISOString() } };
}
```

```typescript
// stores/project-store.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  updatedAt: string;
}

interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<string>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (id: string | null) => void;
}

export const useProjectStore = create<ProjectState>()(
  devtools((set, get) => ({
    projects: [],
    currentProjectId: null,
    isLoading: false,
    error: null,
    
    fetchProjects: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        
        if (data.success) {
          set({ projects: data.data, isLoading: false });
        } else {
          set({ error: data.error.message, isLoading: false });
        }
      } catch (error) {
        set({ error: 'Failed to fetch projects', isLoading: false });
      }
    },
    
    createProject: async (name, description) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          await get().fetchProjects();
          set({ isLoading: false });
          return data.data.projectId;
        } else {
          set({ error: data.error.message, isLoading: false });
          throw new Error(data.error.message);
        }
      } catch (error) {
        set({ error: 'Failed to create project', isLoading: false });
        throw error;
      }
    },
    
    updateProject: async (id, updates) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await fetch(`/api/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        
        const data = await response.json();
        
        if (data.success) {
          await get().fetchProjects();
          set({ isLoading: false });
        } else {
          set({ error: data.error.message, isLoading: false });
        }
      } catch (error) {
        set({ error: 'Failed to update project', isLoading: false });
      }
    },
    
    deleteProject: async (id) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await fetch(`/api/projects/${id}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (data.success) {
          await get().fetchProjects();
          set({ isLoading: false });
        } else {
          set({ error: data.error.message, isLoading: false });
        }
      } catch (error) {
        set({ error: 'Failed to delete project', isLoading: false });
      }
    },
    
    setCurrentProject: (id) => {
      set({ currentProjectId: id });
    },
  }))
);
```

```typescript
// stores/ui-store.ts

import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  rightPanelOpen: boolean;
  activeTab: 'components' | 'properties' | 'code';
  showPromptEditor: boolean;
  showExportModal: boolean;
  showSuggestionsPanel: boolean;
  
  // Actions
  toggleSidebar: () => void;
  toggleRightPanel: () => void;
  setActiveTab: (tab: 'components' | 'properties' | 'code') => void;
  setShowPromptEditor: (show: boolean) => void;
  setShowExportModal: (show: boolean) => void;
  setShowSuggestionsPanel: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  rightPanelOpen: true,
  activeTab: 'components',
  showPromptEditor: false,
  showExportModal: false,
  showSuggestionsPanel: false,
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setShowPromptEditor: (show) => set({ showPromptEditor: show }),
  setShowExportModal: (show) => set({ showExportModal: show }),
  setShowSuggestionsPanel: (show) => set({ showSuggestionsPanel: show }),
}));
```

---

## API Architecture

### API Routes Structure

```
app/api/
├── auth/
│   └── [...nextauth]/
│       └── route.ts          # NextAuth configuration
├── ai/
│   ├── generate/
│   │   └── route.ts          # POST /api/ai/generate - Generate UI from prompt
│   └── suggest/
│       └── route.ts          # POST /api/ai/suggest - Get improvement suggestions
├── projects/
│   ├── route.ts              # GET /api/projects - List projects
│   │                         # POST /api/projects - Create project
│   └── [id]/
│       ├── route.ts          # GET /api/projects/[id] - Get project
│       │                     # PATCH /api/projects/[id] - Update project
│       │                     # DELETE /api/projects/[id] - Delete project
│       └── export/
│           └── route.ts      # POST /api/projects/[id]/export - Export code
└── user/
    └── route.ts              # GET /api/user - Get current user
```

### API Route Implementations

```typescript
// app/api/ai/generate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PromptEngine } from '@/lib/ai/prompt-engine';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    
    // Rate limiting
    const rateLimitResult = await rateLimit(session.user.id, 'ai-generate');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
        { status: 429 }
      );
    }
    
    // Parse request
    const body = await req.json();
    const { prompt, projectId, preserveManualEdits } = body as GenerateUIRequest;
    
    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Prompt is required' } },
        { status: 400 }
      );
    }
    
    // Get existing document if editing
    let existingDocument;
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId, userId: session.user.id },
      });
      
      if (project) {
        existingDocument = project.uiDocument as UIDocument;
      }
    }
    
    // Generate UI
    const startTime = Date.now();
    const promptEngine = new PromptEngine();
    const uiDocument = await promptEngine.generateUI(prompt, {
      projectId,
      existingDocument,
      preserveManualEdits,
    });
    const generationTime = Date.now() - startTime;
    
    // Return response
    return NextResponse.json({
      success: true,
      data: {
        uiDocument,
        tokensUsed: 0, // Track from AI service
        generationTime,
      },
    });
  } catch (error) {
    console.error('AI generation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GENERATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to generate UI',
        },
      },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/projects/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    
    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    
    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('Fetch projects error:', error);
    
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch projects' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { name, description, uiDocument } = body as SaveProjectRequest;
    
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Project name is required' } },
        { status: 400 }
      );
    }
    
    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId: session.user.id,
        uiDocument: uiDocument || getEmptyUIDocument(),
      },
    });
    
    return NextResponse.json({
      success: true,
      data: {
        projectId: project.id,
        updatedAt: project.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Create project error:', error);
    
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_FAILED', message: 'Failed to create project' } },
      { status: 500 }
    );
  }
}

function getEmptyUIDocument(): UIDocument {
  return {
    id: '',
    version: '1.0',
    metadata: {
      name: 'New Project',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      promptHistory: [],
    },
    designTokens: {
      colors: {},
      spacing: {},
      typography: {},
      shadows: {},
    },
    breakpoints: [
      { name: 'mobile', minWidth: 0, maxWidth: 767 },
      { name: 'desktop', minWidth: 768 },
    ],
    tree: {
      id: 'root',
      type: 'Container',
      props: {},
      styles: {
        base: {
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem',
        },
      },
      children: [],
      metadata: {},
    },
  };
}
```

```typescript
// app/api/projects/[id]/export/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CodeExporter } from '@/lib/export/code-exporter';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    
    const project = await prisma.project.findUnique({
      where: { id: params.id, userId: session.user.id },
    });
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } },
        { status: 404 }
      );
    }
    
    const body = await req.json();
    const { format, options } = body as ExportCodeRequest;
    
    const exporter = new CodeExporter();
    const result = await exporter.export(
      project.uiDocument as UIDocument,
      format,
      options
    );
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Export error:', error);
    
    return NextResponse.json(
      { success: false, error: { code: 'EXPORT_FAILED', message: 'Failed to export code' } },
      { status: 500 }
    );
  }
}
```


---

## Authentication Flow

### NextAuth Configuration

```typescript
// lib/auth.ts

import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        
        if (!user || !user.hashedPassword) {
          throw new Error('Invalid credentials');
        }
        
        const isPasswordValid = await compare(credentials.password, user.hashedPassword);
        
        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Send welcome email
      console.log('New user created:', user.email);
    },
  },
};
```

### Authentication Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant NextAuth
    participant Database
    participant OAuth Provider
    
    User->>Frontend: Click "Sign In"
    Frontend->>NextAuth: Redirect to /api/auth/signin
    
    alt OAuth (Google/GitHub)
        NextAuth->>OAuth Provider: Redirect to OAuth
        OAuth Provider->>User: Show consent screen
        User->>OAuth Provider: Approve
        OAuth Provider->>NextAuth: Return with code
        NextAuth->>OAuth Provider: Exchange code for token
        OAuth Provider->>NextAuth: Return user info
        NextAuth->>Database: Create/update user
    else Credentials
        User->>Frontend: Enter email/password
        Frontend->>NextAuth: POST credentials
        NextAuth->>Database: Verify credentials
        Database->>NextAuth: Return user
    end
    
    NextAuth->>Frontend: Set session cookie
    Frontend->>User: Redirect to dashboard
```

### Protected Route Middleware

```typescript
// middleware.ts

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Allow request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect /dashboard and /editor routes
        if (req.nextUrl.pathname.startsWith('/dashboard') || 
            req.nextUrl.pathname.startsWith('/editor')) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/editor/:path*'],
};
```

---

## File and Folder Structure

```
ai-ui-builder/
├── app/
│   ├── (auth)/
│   │   ├── signin/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── editor/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── ai/
│   │   │   ├── generate/
│   │   │   │   └── route.ts
│   │   │   └── suggest/
│   │   │       └── route.ts
│   │   ├── projects/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── export/
│   │   │           └── route.ts
│   │   └── user/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── canvas/
│   │   ├── Canvas.tsx
│   │   ├── ComponentRenderer.tsx
│   │   ├── SelectionOverlay.tsx
│   │   ├── GridOverlay.tsx
│   │   └── components/
│   │       ├── TextComponent.tsx
│   │       ├── HeadingComponent.tsx
│   │       ├── ButtonComponent.tsx
│   │       ├── ImageComponent.tsx
│   │       ├── FlexComponent.tsx
│   │       ├── GridComponent.tsx
│   │       └── CardComponent.tsx
│   ├── sidebar/
│   │   ├── Sidebar.tsx
│   │   ├── ComponentLibrary.tsx
│   │   └── PropertiesPanel.tsx
│   ├── editor/
│   │   ├── EditorLayout.tsx
│   │   ├── Toolbar.tsx
│   │   ├── PromptEditor.tsx
│   │   └── ViewportSelector.tsx
│   ├── modals/
│   │   ├── ExportModal.tsx
│   │   ├── SaveProjectModal.tsx
│   │   └── SuggestionsModal.tsx
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   └── toast.tsx
│   └── providers/
│       ├── SessionProvider.tsx
│       └── ThemeProvider.tsx
├── lib/
│   ├── ai/
│   │   ├── prompt-engine.ts
│   │   ├── suggestion-engine.ts
│   │   ├── prompt-templates.ts
│   │   └── models/
│   │       ├── openai-model.ts
│   │       └── claude-model.ts
│   ├── export/
│   │   └── code-exporter.ts
│   ├── dnd/
│   │   └── dnd-utils.ts
│   ├── auth.ts
│   ├── prisma.ts
│   ├── rate-limit.ts
│   └── utils.ts
├── stores/
│   ├── canvas-store.ts
│   ├── project-store.ts
│   └── ui-store.ts
├── types/
│   ├── ui-schema.ts
│   ├── api.ts
│   └── next-auth.d.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   ├── images/
│   └── icons/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Responsive Layout Engine

### Breakpoint System

```typescript
// lib/responsive/breakpoint-manager.ts

export const BREAKPOINTS = {
  mobile: {
    name: 'mobile' as const,
    minWidth: 0,
    maxWidth: 767,
    label: 'Mobile',
    icon: 'Smartphone',
    defaultWidth: 375,
  },
  desktop: {
    name: 'desktop' as const,
    minWidth: 768,
    maxWidth: undefined,
    label: 'Desktop',
    icon: 'Monitor',
    defaultWidth: 1200,
  },
} as const;

export type BreakpointName = keyof typeof BREAKPOINTS;

export class BreakpointManager {
  static getActiveBreakpoint(width: number): BreakpointName {
    if (width < BREAKPOINTS.desktop.minWidth) {
      return 'mobile';
    }
    return 'desktop';
  }
  
  static getBreakpointStyles(
    node: ComponentNode,
    breakpoint: BreakpointName
  ): StyleObject {
    if (breakpoint === 'mobile') {
      return node.styles.base;
    }
    
    // Merge base and desktop styles
    return {
      ...node.styles.base,
      ...node.styles.desktop,
    };
  }
  
  static generateMediaQuery(breakpoint: BreakpointName): string {
    const bp = BREAKPOINTS[breakpoint];
    
    if (breakpoint === 'mobile') {
      return `@media (max-width: ${bp.maxWidth}px)`;
    }
    
    return `@media (min-width: ${bp.minWidth}px)`;
  }
}
```

### Responsive Preview Component

```typescript
// components/editor/ResponsivePreview.tsx

'use client';

import { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { useCanvasStore } from '@/stores/canvas-store';
import { BREAKPOINTS, BreakpointName } from '@/lib/responsive/breakpoint-manager';

export function ResponsivePreview() {
  const { viewport, setViewport } = useCanvasStore();
  const [customWidth, setCustomWidth] = useState<number | null>(null);
  
  return (
    <div className="responsive-preview flex items-center gap-4 p-4 border-b">
      <div className="flex gap-2">
        <button
          onClick={() => setViewport('mobile')}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md transition-colors',
            viewport === 'mobile'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          <Smartphone className="w-4 h-4" />
          <span>Mobile</span>
          <span className="text-xs opacity-75">
            {BREAKPOINTS.mobile.defaultWidth}px
          </span>
        </button>
        
        <button
          onClick={() => setViewport('desktop')}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md transition-colors',
            viewport === 'desktop'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          <Monitor className="w-4 h-4" />
          <span>Desktop</span>
          <span className="text-xs opacity-75">
            {BREAKPOINTS.desktop.defaultWidth}px
          </span>
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Custom width:</span>
        <input
          type="number"
          value={customWidth || ''}
          onChange={(e) => setCustomWidth(Number(e.target.value) || null)}
          placeholder="e.g., 1024"
          className="w-24 px-2 py-1 border rounded text-sm"
        />
        <span className="text-sm text-gray-600">px</span>
      </div>
    </div>
  );
}
```

---

## Design Token System

### Token Management

```typescript
// lib/design-tokens/token-manager.ts

export class TokenManager {
  static createToken<T extends ColorToken | SpacingToken | TypographyToken | ShadowToken>(
    type: 'color' | 'spacing' | 'typography' | 'shadow',
    name: string,
    value: any
  ): T {
    const baseToken = {
      name,
      value,
    };
    
    switch (type) {
      case 'color':
        return {
          ...baseToken,
          category: 'neutral',
        } as T;
      case 'spacing':
      case 'typography':
      case 'shadow':
        return baseToken as T;
      default:
        throw new Error(`Unknown token type: ${type}`);
    }
  }
  
  static applyToken(
    node: ComponentNode,
    tokenType: 'color' | 'spacing' | 'typography' | 'shadow',
    tokenName: string,
    property: string
  ): ComponentNode {
    const updated = { ...node };
    
    // Set the token reference
    updated.styles = {
      ...updated.styles,
      base: {
        ...updated.styles.base,
        [`${property}Token`]: tokenName,
      },
    };
    
    return updated;
  }
  
  static resolveTokenValue(
    tokens: DesignTokens,
    tokenType: 'color' | 'spacing' | 'typography' | 'shadow',
    tokenName: string
  ): any {
    const tokenMap = tokens[`${tokenType}s` as keyof DesignTokens];
    const token = tokenMap[tokenName];
    
    return token?.value;
  }
  
  static generateDefaultTokens(): DesignTokens {
    return {
      colors: {
        primary: { name: 'primary', value: '#3B82F6', category: 'primary' },
        secondary: { name: 'secondary', value: '#8B5CF6', category: 'secondary' },
        success: { name: 'success', value: '#10B981', category: 'semantic' },
        warning: { name: 'warning', value: '#F59E0B', category: 'semantic' },
        error: { name: 'error', value: '#EF4444', category: 'semantic' },
        text: { name: 'text', value: '#1F2937', category: 'neutral' },
        textMuted: { name: 'textMuted', value: '#6B7280', category: 'neutral' },
        background: { name: 'background', value: '#FFFFFF', category: 'neutral' },
        border: { name: 'border', value: '#E5E7EB', category: 'neutral' },
      },
      spacing: {
        xs: { name: 'xs', value: '0.25rem' },
        sm: { name: 'sm', value: '0.5rem' },
        md: { name: 'md', value: '1rem' },
        lg: { name: 'lg', value: '2rem' },
        xl: { name: 'xl', value: '3rem' },
        '2xl': { name: '2xl', value: '4rem' },
      },
      typography: {
        heading: {
          name: 'heading',
          fontSize: '3rem',
          fontWeight: '700',
          lineHeight: '1.2',
        },
        subheading: {
          name: 'subheading',
          fontSize: '1.5rem',
          fontWeight: '600',
          lineHeight: '1.4',
        },
        body: {
          name: 'body',
          fontSize: '1rem',
          fontWeight: '400',
          lineHeight: '1.6',
        },
        small: {
          name: 'small',
          fontSize: '0.875rem',
          fontWeight: '400',
          lineHeight: '1.5',
        },
      },
      shadows: {
        sm: { name: 'sm', value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
        md: { name: 'md', value: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
        lg: { name: 'lg', value: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
        xl: { name: 'xl', value: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
      },
    };
  }
}
```


---

## Performance Optimization

### Frontend Performance

#### Code Splitting and Lazy Loading

```typescript
// app/editor/[id]/page.tsx

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load heavy components
const Canvas = dynamic(() => import('@/components/canvas/Canvas'), {
  loading: () => <CanvasLoader />,
  ssr: false,
});

const ComponentLibrary = dynamic(() => import('@/components/sidebar/ComponentLibrary'), {
  loading: () => <SidebarLoader />,
});

const CodeExporter = dynamic(() => import('@/lib/export/code-exporter'), {
  ssr: false,
});

export default function EditorPage({ params }: { params: { id: string } }) {
  return (
    <div className="editor-layout">
      <Suspense fallback={<EditorLoader />}>
        <EditorContent projectId={params.id} />
      </Suspense>
    </div>
  );
}
```

#### Memoization and Optimization

```typescript
// components/canvas/ComponentRenderer.tsx

import { memo, useMemo } from 'react';

export const ComponentRenderer = memo(function ComponentRenderer({ 
  node, 
  isRoot 
}: ComponentRendererProps) {
  // Memoize style calculations
  const styles = useMemo(() => {
    return viewport === 'desktop' && node.styles.desktop
      ? { ...node.styles.base, ...node.styles.desktop }
      : node.styles.base;
  }, [node.styles, viewport]);
  
  // Memoize CSS conversion
  const cssStyles = useMemo(() => {
    return convertToCSSStyles(styles);
  }, [styles]);
  
  // ... rest of component
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.node.id === nextProps.node.id &&
    prevProps.node.styles === nextProps.node.styles &&
    prevProps.node.children.length === nextProps.node.children.length
  );
});
```

#### Virtual Scrolling for Large Component Trees

```typescript
// components/sidebar/ComponentTree.tsx

import { useVirtualizer } from '@tanstack/react-virtual';

export function ComponentTree({ nodes }: { nodes: ComponentNode[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: nodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });
  
  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ComponentTreeItem node={nodes[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Backend Performance

#### Caching Strategy

```typescript
// lib/cache/redis-cache.ts

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export class PromptCache {
  private readonly TTL = 60 * 60 * 24; // 24 hours
  
  async get(key: string): Promise<UIDocument | null> {
    try {
      const cached = await redis.get(key);
      return cached as UIDocument | null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  async set(key: string, value: UIDocument): Promise<void> {
    try {
      await redis.setex(key, this.TTL, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }
}
```

#### Rate Limiting

```typescript
// lib/rate-limit.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different rate limits for different operations
const rateLimiters = {
  'ai-generate': new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests per hour
    analytics: true,
  }),
  'api-general': new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
    analytics: true,
  }),
  'export': new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'), // 20 exports per hour
    analytics: true,
  }),
};

export async function rateLimit(
  userId: string,
  operation: keyof typeof rateLimiters
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const limiter = rateLimiters[operation];
  const result = await limiter.limit(userId);
  
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
```

#### Database Query Optimization

```typescript
// lib/db/optimized-queries.ts

import { prisma } from '@/lib/prisma';

export async function getProjectsOptimized(userId: string) {
  // Use select to fetch only needed fields
  // Add pagination for large datasets
  return await prisma.project.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      description: true,
      thumbnail: true,
      updatedAt: true,
      // Don't fetch large uiDocument field
    },
    orderBy: { updatedAt: 'desc' },
    take: 50, // Limit results
  });
}

export async function getProjectWithDocument(projectId: string, userId: string) {
  // Fetch full document only when needed
  return await prisma.project.findUnique({
    where: {
      id: projectId,
      userId,
    },
  });
}
```

---

## Security Considerations

### Input Validation

```typescript
// lib/validation/schemas.ts

import { z } from 'zod';

export const GenerateUISchema = z.object({
  prompt: z.string().min(1).max(1000),
  projectId: z.string().optional(),
  preserveManualEdits: z.boolean().optional(),
});

export const SaveProjectSchema = z.object({
  projectId: z.string().optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  uiDocument: z.any(), // Validate against UIDocument schema
});

export const ExportCodeSchema = z.object({
  format: z.enum(['html', 'react', 'tailwind']),
  options: z.object({
    includeComments: z.boolean().optional(),
    minify: z.boolean().optional(),
    componentStyle: z.enum(['functional', 'class']).optional(),
  }).optional(),
});

// Validate requests
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}
```

### XSS Prevention

```typescript
// lib/security/sanitize.ts

import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'a', 'img'],
    ALLOWED_ATTR: ['class', 'id', 'href', 'src', 'alt', 'aria-label', 'role'],
  });
}

export function sanitizeUserInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}
```

### CSRF Protection

```typescript
// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // CSRF protection for state-changing operations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    if (origin && !origin.includes(host || '')) {
      return NextResponse.json(
        { error: 'CSRF validation failed' },
        { status: 403 }
      );
    }
  }
  
  return NextResponse.next();
}
```

### Environment Variables Security

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/aiuibuilder"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# AI Services (Platform Owner Only - Users don't need these)
# Choose ONE AI provider - the platform will use this for all users
AI_PROVIDER="openai"  # Options: "openai" or "anthropic"
OPENAI_API_KEY="sk-..."  # Required if AI_PROVIDER=openai
ANTHROPIC_API_KEY="sk-ant-..."  # Required if AI_PROVIDER=anthropic

# Redis/Upstash
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="..."
```

---

## MVP Implementation Roadmap

### Week 1-2: Foundation Setup

**Goals**: Project setup, authentication, database

**Tasks**:
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Configure Tailwind CSS and design system
- [ ] Set up PostgreSQL database with Prisma
- [ ] Implement NextAuth with Google/GitHub OAuth
- [ ] Create user authentication flow
- [ ] Set up basic project structure
- [ ] Configure environment variables
- [ ] Deploy initial version to Vercel

**Deliverables**:
- Working authentication system
- Database schema deployed
- Basic landing page
- User dashboard skeleton

### Week 3-4: AI Prompt Engine

**Goals**: Core AI generation functionality

**Tasks**:
- [ ] Integrate OpenAI API
- [ ] Design and implement UI JSON schema
- [ ] Build prompt engineering system
- [ ] Create prompt templates
- [ ] Implement AI response parsing
- [ ] Add error handling and retries
- [ ] Set up caching layer
- [ ] Test with various prompts

**Deliverables**:
- Working prompt-to-UI generation
- Validated JSON schema
- Cached AI responses
- 90%+ successful generation rate

### Week 5-6: Canvas and Visual Editor

**Goals**: Visual editing workspace

**Tasks**:
- [ ] Build canvas rendering engine
- [ ] Implement component renderer
- [ ] Create 20 basic components
- [ ] Add drag-and-drop with @dnd-kit
- [ ] Build component library panel
- [ ] Implement selection and hover states
- [ ] Add grid overlay system
- [ ] Create properties panel

**Deliverables**:
- Functional canvas editor
- 20 working components
- Drag-and-drop functionality
- Component property editing

### Week 7-8: Responsive System and Code Export

**Goals**: Multi-device preview and code generation

**Tasks**:
- [ ] Implement responsive breakpoint system
- [ ] Build mobile/desktop preview
- [ ] Create viewport selector
- [ ] Build HTML code exporter
- [ ] Build React code exporter
- [ ] Build Tailwind code exporter
- [ ] Add code syntax highlighting
- [ ] Implement copy-to-clipboard

**Deliverables**:
- Working responsive preview
- Three export formats
- Clean, production-ready code output
- Export modal UI

### Week 9-10: Project Management and Persistence

**Goals**: Save, load, and manage projects

**Tasks**:
- [ ] Implement project CRUD operations
- [ ] Build project dashboard
- [ ] Add auto-save functionality
- [ ] Create project thumbnails
- [ ] Implement project search
- [ ] Add project metadata editing
- [ ] Build project deletion with confirmation
- [ ] Add undo/redo functionality

**Deliverables**:
- Full project management system
- Auto-save every 30 seconds
- Project dashboard with thumbnails
- Undo/redo with 50-step history

### Week 11-12: AI Suggestions and Polish

**Goals**: AI improvement suggestions and MVP polish

**Tasks**:
- [ ] Build AI suggestion engine
- [ ] Implement accessibility checks
- [ ] Add layout improvement suggestions
- [ ] Create responsive design suggestions
- [ ] Build design token system
- [ ] Add suggestion application UI
- [ ] Implement onboarding flow
- [ ] Polish UI/UX across platform
- [ ] Add loading states and animations
- [ ] Comprehensive testing
- [ ] Bug fixes and optimization
- [ ] Documentation

**Deliverables**:
- Working AI suggestions
- Design token management
- Polished user experience
- Complete MVP ready for launch

### Week 13-14: Testing and Launch Preparation

**Goals**: Final testing, optimization, and launch

**Tasks**:
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Load testing
- [ ] Create demo projects
- [ ] Write user documentation
- [ ] Set up analytics
- [ ] Prepare marketing materials
- [ ] Soft launch to beta users
- [ ] Gather feedback
- [ ] Final bug fixes
- [ ] Public launch

**Deliverables**:
- Production-ready MVP
- User documentation
- Demo projects
- Public launch

---

## Technical Challenges and Solutions

### Challenge 1: AI Generation Consistency

**Problem**: AI models can generate inconsistent or invalid JSON structures.

**Solution**:
- Strict JSON schema validation with Zod
- Detailed system prompts with examples
- Retry logic with exponential backoff
- Fallback to Claude if OpenAI fails
- Prompt caching to reduce variability
- Post-processing to fix common issues

```typescript
// lib/ai/response-validator.ts

import { z } from 'zod';

const UIDocumentSchema = z.object({
  id: z.string(),
  version: z.string(),
  metadata: z.object({
    name: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    promptHistory: z.array(z.any()),
  }),
  designTokens: z.any(),
  breakpoints: z.array(z.any()),
  tree: z.any(),
});

export function validateAndFixAIResponse(response: any): UIDocument {
  try {
    return UIDocumentSchema.parse(response);
  } catch (error) {
    // Attempt to fix common issues
    const fixed = attemptAutoFix(response);
    return UIDocumentSchema.parse(fixed);
  }
}

function attemptAutoFix(response: any): any {
  // Add missing required fields
  if (!response.id) response.id = generateId();
  if (!response.version) response.version = '1.0';
  if (!response.metadata) response.metadata = getDefaultMetadata();
  
  // Fix malformed tree
  if (!response.tree || !response.tree.id) {
    response.tree = getDefaultTree();
  }
  
  return response;
}
```

### Challenge 2: Real-Time Canvas Performance

**Problem**: Rendering complex component trees can cause lag.

**Solution**:
- React memoization for component renderers
- Virtual scrolling for large trees
- Debounced updates for property changes
- Web Workers for heavy computations
- Incremental rendering
- Canvas viewport culling

```typescript
// lib/performance/debounce.ts

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Usage in property panel
const debouncedUpdate = debounce((componentId, updates) => {
  updateComponent(componentId, updates);
}, 300);
```

### Challenge 3: Code Export Quality

**Problem**: Generated code must be production-ready and follow best practices.

**Solution**:
- Template-based code generation
- Prettier integration for formatting
- ESLint validation
- Semantic HTML generation
- Accessibility attributes by default
- Comprehensive testing of exports

```typescript
// lib/export/code-formatter.ts

import prettier from 'prettier';

export async function formatCode(code: string, parser: 'html' | 'typescript'): Promise<string> {
  try {
    return await prettier.format(code, {
      parser,
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
    });
  } catch (error) {
    console.error('Code formatting error:', error);
    return code; // Return unformatted if formatting fails
  }
}
```

### Challenge 4: Responsive Design Complexity

**Problem**: Managing styles across multiple breakpoints is complex.

**Solution**:
- Mobile-first approach (base styles = mobile)
- Only two breakpoints for MVP (mobile, desktop)
- Clear visual indicators for breakpoint-specific styles
- Automatic responsive suggestions from AI
- Preview both breakpoints simultaneously

### Challenge 5: State Management Complexity

**Problem**: Managing canvas state, project state, and UI state can become unwieldy.

**Solution**:
- Separate Zustand stores for different concerns
- Immutable state updates
- History tracking for undo/redo
- Optimistic UI updates
- Clear separation of concerns

---

## Recommended Libraries

### Core Dependencies

```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    
    "zustand": "^4.5.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "framer-motion": "^11.0.0",
    
    "next-auth": "^4.24.0",
    "@prisma/client": "^5.9.0",
    "prisma": "^5.9.0",
    
    "openai": "^4.28.0",
    "@anthropic-ai/sdk": "^0.17.0",
    
    "@upstash/redis": "^1.28.0",
    "@upstash/ratelimit": "^1.0.0",
    
    "zod": "^3.22.0",
    "bcryptjs": "^2.4.3",
    "nanoid": "^5.0.0",
    
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.323.0",
    
    "@tanstack/react-virtual": "^3.0.0",
    "react-hot-toast": "^2.4.1",
    "sonner": "^1.4.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/bcryptjs": "^2.4.6",
    
    "eslint": "^8",
    "eslint-config-next": "14.1.0",
    "prettier": "^3.2.0",
    "prettier-plugin-tailwindcss": "^0.5.0"
  }
}
```

### Utility Libraries

- **clsx** / **cn**: Conditional className utilities
- **date-fns**: Date formatting and manipulation
- **react-hook-form**: Form state management
- **@vercel/analytics**: Analytics integration
- **@vercel/og**: Open Graph image generation

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I identified the following properties suitable for property-based testing. Here's the reflection to eliminate redundancy:

**Identified Properties:**
1. Prompt storage in history (1.6)
2. Prompt display (2.1)
3. Manual edit preservation (2.2)
4. Prompt history maintenance (2.3)
5. History restore round-trip (2.4)
6. Component highlighting (2.5)
7. Confirmation on conflicts (2.6)
8. Drop zone calculation (3.1)
9. Tree insertion (3.2)
10. Component repositioning (3.4)
11. Nested hierarchy preservation (3.5)
12. Multi-select (3.7)
13. Invalid drop prevention (3.8)
14. Multi-format export (7.1)
15. Semantic HTML generation (7.3)
16. Modular React generation (7.4)
17. Responsive CSS generation (7.5)
18. Code formatting consistency (7.6)
19. React component separation (7.7)
20. Comment generation (7.8)
21. Linting compliance (7.9)
22. Password validation (13.4)
23. Workspace loading (13.6)
24. Project display (14.1)
25. Project CRUD operations (14.3)
26. Metadata display (14.4)
27. Folder organization (14.5)
28. Project search (14.6)
29. Soft delete to trash (14.8)
30. Token definition (18.1)
31. Token application (18.2)
32. Token update propagation (18.3)
33. Token usage counting (18.4)
34. Token suggestion (18.5)
35. CSS variable generation (18.6)
36. Token import (18.7)
37. Token accessibility validation (18.8)
38. Referential integrity (23.6)
39. Soft delete with retention (23.8)

**Redundancy Analysis:**

- **Properties 1, 3, 4 (Prompt storage, preservation, history)** can be combined into a comprehensive "Prompt history management" property
- **Properties 8, 9, 10, 11 (Drop zones, insertion, repositioning, nesting)** can be combined into "Component tree manipulation" property
- **Properties 14, 15, 16, 17, 18, 19, 20, 21 (All code export properties)** can be grouped into fewer comprehensive properties about code generation quality
- **Properties 30, 31, 32 (Token definition, application, propagation)** can be combined into "Design token lifecycle" property
- **Properties 29, 39 (Soft delete)** are the same concept and can be combined

**Final Property Set (After Removing Redundancy):**

1. Prompt history round-trip (combines 1, 3, 4, 2.4)
2. Component tree manipulation (combines 8, 9, 10, 11)
3. Invalid operation prevention (combines 2.6, 3.8)
4. Code export format completeness (7.1, 7.3, 7.4, 7.5)
5. Code export quality (7.6, 7.8, 7.9)
6. React component structure (7.7, 7.4)
7. Password validation (13.4)
8. Project management operations (14.3, 14.8)
9. Project search and display (14.1, 14.4, 14.6)
10. Design token lifecycle (18.1, 18.2, 18.3, 18.6)
11. Design token analysis (18.4, 18.5, 18.8)
12. Data integrity (23.6, 23.8)

### Property 1: Prompt History Round-Trip Preservation

*For any* UI document with an original prompt, when the prompt is stored in history and later restored, the system SHALL return an equivalent UI state with the prompt correctly preserved in the prompt history array.

**Validates: Requirements 1.6, 2.3, 2.4**

### Property 2: Component Tree Manipulation Correctness

*For any* valid component and target position in the component tree, when a component is added, moved, or nested, the resulting tree SHALL maintain proper hierarchy, all component IDs SHALL remain unique, and parent-child relationships SHALL be correctly established.

**Validates: Requirements 3.1, 3.2, 3.4, 3.5**

### Property 3: Invalid Operation Prevention

*For any* operation that would violate system constraints (such as dropping a parent into its own child, or regenerating over manual edits without confirmation), the system SHALL prevent the operation and provide appropriate user feedback.

**Validates: Requirements 2.6, 3.8**

### Property 4: Multi-Format Code Export Completeness

*For any* valid UI document, the code exporter SHALL successfully generate valid, complete code in all three supported formats (HTML, React, Tailwind), and each export SHALL include all components from the UI document with proper responsive styles and accessibility attributes.

**Validates: Requirements 7.1, 7.3, 7.4, 7.5**

### Property 5: Code Export Quality Standards

*For any* UI document exported to code, the generated code SHALL be consistently formatted with proper indentation, SHALL include explanatory comments for key sections, and SHALL pass standard linting rules for the target format without errors.

**Validates: Requirements 7.6, 7.8, 7.9**

### Property 6: React Component Structure Separation

*For any* UI document exported to React format, the generated components SHALL properly separate concerns with component logic, styles, and markup in appropriate locations, and SHALL be modular with proper prop types defined.

**Validates: Requirements 7.4, 7.7**

### Property 7: Password Validation Enforcement

*For any* password string, the validation system SHALL correctly accept passwords meeting all requirements (minimum 8 characters) and SHALL reject passwords failing any requirement with appropriate error messages.

**Validates: Requirements 13.4**

### Property 8: Project Management Operation Integrity

*For any* project, the system SHALL correctly handle rename, duplicate, and delete operations, and when a project is deleted, it SHALL be moved to trash with 30-day retention rather than permanently deleted.

**Validates: Requirements 14.3, 14.8**

### Property 9: Project Search and Display Accuracy

*For any* set of user projects and search query, the system SHALL display all projects with correct metadata (name, last modified date, component count, thumbnail), and search results SHALL include only projects matching the query by name or tags.

**Validates: Requirements 14.1, 14.4, 14.6**

### Property 10: Design Token Lifecycle Consistency

*For any* design token (color, spacing, typography, shadow), when defined and applied to components, modifications to the token value SHALL propagate to all components using that token, and exported code SHALL reference the token using CSS variables.

**Validates: Requirements 18.1, 18.2, 18.3, 18.6**

### Property 11: Design Token Analysis Accuracy

*For any* UI document, the system SHALL accurately count token usage across all components, SHALL suggest token creation when values are repeated 3+ times, and SHALL validate token values for accessibility compliance (e.g., color contrast ratios).

**Validates: Requirements 18.4, 18.5, 18.8**

### Property 12: Data Integrity Preservation

*For any* database operation involving users, projects, and assets, the system SHALL maintain referential integrity (no orphaned records), and when records are deleted, they SHALL be soft-deleted with configurable retention periods rather than permanently removed.

**Validates: Requirements 23.6, 23.8**

---

## Error Handling

### Error Handling Strategy

```typescript
// lib/errors/error-handler.ts

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super('AUTHENTICATION_ERROR', message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super('AUTHORIZATION_ERROR', message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super('RATE_LIMIT_ERROR', message, 429);
    this.name = 'RateLimitError';
  }
}

export class AIServiceError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super('AI_SERVICE_ERROR', message, 500, details);
    this.name = 'AIServiceError';
  }
}

// Global error handler for API routes
export function handleAPIError(error: unknown): ApiResponse<never> {
  console.error('API Error:', error);
  
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }
  
  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: error.errors,
      },
    };
  }
  
  // Unknown error
  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  };
}
```

### Frontend Error Boundaries

```typescript
// components/ErrorBoundary.tsx

'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log to error tracking service
    // logErrorToService(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

---

## Testing Strategy

### Testing Approach

The MVP will use a **dual testing approach**:

1. **Unit Tests**: Specific examples, edge cases, and error conditions
2. **Property-Based Tests**: Universal properties across all inputs (for applicable features)
3. **Integration Tests**: End-to-end workflows and external service integration

### Property-Based Testing Configuration

For features where PBT is applicable (code export, tree manipulation, token management, etc.):

- **Library**: fast-check (JavaScript/TypeScript PBT library)
- **Minimum iterations**: 100 per property test
- **Test tagging**: Each property test references its design document property

```typescript
// __tests__/properties/code-export.test.ts

import fc from 'fast-check';
import { CodeExporter } from '@/lib/export/code-exporter';
import { generateRandomUIDocument } from './generators';

describe('Code Export Properties', () => {
  const exporter = new CodeExporter();
  
  /**
   * Feature: ai-ui-builder-saas, Property 4: Multi-Format Code Export Completeness
   * 
   * For any valid UI document, the code exporter SHALL successfully generate
   * valid, complete code in all three supported formats (HTML, React, Tailwind)
   */
  it('should export to all three formats successfully', async () => {
    await fc.assert(
      fc.asyncProperty(
        generateRandomUIDocument(),
        async (uiDocument) => {
          const htmlResult = await exporter.export(uiDocument, 'html');
          const reactResult = await exporter.export(uiDocument, 'react');
          const tailwindResult = await exporter.export(uiDocument, 'tailwind');
          
          expect(htmlResult.code).toBeTruthy();
          expect(reactResult.code).toBeTruthy();
          expect(tailwindResult.code).toBeTruthy();
          
          expect(htmlResult.format).toBe('html');
          expect(reactResult.format).toBe('react');
          expect(tailwindResult.format).toBe('tailwind');
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Feature: ai-ui-builder-saas, Property 5: Code Export Quality Standards
   * 
   * For any UI document exported to code, the generated code SHALL be
   * consistently formatted and pass linting rules
   */
  it('should generate consistently formatted code', async () => {
    await fc.assert(
      fc.asyncProperty(
        generateRandomUIDocument(),
        async (uiDocument) => {
          const result = await exporter.export(uiDocument, 'react');
          
          // Check for consistent indentation
          const lines = result.code.split('\n');
          const indentedLines = lines.filter(line => line.startsWith('  '));
          expect(indentedLines.length).toBeGreaterThan(0);
          
          // Check for comments
          expect(result.code).toMatch(/\/\//);
          
          // Verify it's valid JavaScript (can be parsed)
          expect(() => new Function(result.code)).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing Examples

```typescript
// __tests__/unit/component-tree.test.ts

import { insertComponent, canDropComponent } from '@/lib/dnd/dnd-utils';

describe('Component Tree Manipulation', () => {
  it('should insert component at correct position', () => {
    const tree = createMockTree();
    const newComponent = createMockComponent('Button');
    
    const result = insertComponent(tree, newComponent, 'parent-1', 'inside');
    
    const parent = findNodeById(result, 'parent-1');
    expect(parent?.children).toContainEqual(newComponent);
  });
  
  it('should prevent dropping parent into child', () => {
    const parent = createMockComponent('Container');
    const child = createMockComponent('Button');
    parent.children = [child];
    
    const canDrop = canDropComponent(parent, child);
    
    expect(canDrop).toBe(false);
  });
  
  it('should handle empty tree insertion', () => {
    const tree = createEmptyTree();
    const component = createMockComponent('Text');
    
    const result = insertComponent(tree, component, 'root', 'inside');
    
    expect(result.tree.children).toHaveLength(1);
    expect(result.tree.children[0]).toEqual(component);
  });
});
```

### Integration Testing

```typescript
// __tests__/integration/ai-generation.test.ts

import { POST } from '@/app/api/ai/generate/route';

describe('AI Generation Integration', () => {
  it('should generate UI from prompt', async () => {
    const request = new Request('http://localhost/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Create a landing page with hero section and CTA button',
      }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(data.success).toBe(true);
    expect(data.data.uiDocument).toBeDefined();
    expect(data.data.uiDocument.tree).toBeDefined();
    expect(data.data.generationTime).toBeLessThan(5000);
  });
});
```

---

## Conclusion

This design document provides a comprehensive technical blueprint for the AI-Powered UI Builder SaaS MVP. The architecture prioritizes:

1. **Rapid Development**: Next.js 14 with serverless API routes for fast iteration
2. **Scalability**: Stateless architecture with Redis caching and PostgreSQL
3. **AI Integration**: Robust prompt engineering with fallback strategies
4. **User Experience**: Real-time canvas editing with drag-and-drop
5. **Code Quality**: Multi-format export with production-ready output
6. **Security**: Authentication, rate limiting, and input validation
7. **Performance**: Memoization, lazy loading, and caching strategies

The 14-week implementation roadmap provides a clear path from foundation to launch, with each phase building on the previous one. The MVP focuses on the 12 core features that deliver immediate value to students and beginner developers learning frontend development.

**Next Steps**:
1. Review and approve this design document
2. Set up development environment
3. Begin Week 1-2 foundation tasks
4. Iterate based on feedback and testing

