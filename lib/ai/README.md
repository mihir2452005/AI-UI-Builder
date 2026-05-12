# AI Prompt Engine

The AI Prompt Engine is the core module responsible for transforming natural language descriptions into structured UI specifications using AI models (OpenAI GPT-4 or Anthropic Claude).

## Features

- **Multi-Provider Support**: Supports both OpenAI (GPT-4) and Anthropic (Claude 3 Sonnet)
- **Centralized Configuration**: Platform owner configures a single API key via environment variables
- **Automatic Retry Logic**: Exponential backoff with 3 retry attempts for failed requests
- **Prompt Caching**: In-memory caching to reduce redundant AI calls
- **Response Validation**: Automatic validation and fixing of AI-generated responses
- **Manual Edit Preservation**: Preserves user-edited components during regeneration
- **Usage Tracking**: Logs AI usage for cost tracking and analytics

## Architecture

```
lib/ai/
├── models/
│   ├── base.ts           # AIModel interface
│   ├── openai-model.ts   # OpenAI implementation
│   ├── claude-model.ts   # Anthropic implementation
│   └── index.ts          # Model factory
├── prompt-engine.ts      # Main PromptEngine class
├── prompt-templates.ts   # System and user prompt templates
├── utils.ts              # Utility functions
├── helpers.ts            # Helper functions
└── index.ts              # Module exports
```

## Configuration

### Environment Variables

```bash
# Choose ONE AI provider
AI_PROVIDER="openai"  # Options: "openai" or "anthropic"

# OpenAI Configuration (if AI_PROVIDER=openai)
OPENAI_API_KEY="sk-..."

# Anthropic Configuration (if AI_PROVIDER=anthropic)
ANTHROPIC_API_KEY="sk-ant-..."
```

## Usage

### Basic Usage

```typescript
import { PromptEngine } from '@/lib/ai';

const engine = new PromptEngine();

const result = await engine.generateUI(
  'Create a modern landing page with hero section and features',
  {
    userId: 'user-123',
  }
);

console.log('Generated UI:', result.uiDocument);
console.log('Tokens used:', result.tokensUsed);
console.log('Generation time:', result.generationTime, 'ms');
```

### With Existing Document (Editing)

```typescript
const result = await engine.generateUI(
  'Add a contact form to the page',
  {
    userId: 'user-123',
    projectId: 'project-456',
    existingDocument: currentUIDocument,
    preserveManualEdits: true,
  }
);
```

### Creating Empty Documents

```typescript
import { getEmptyUIDocument } from '@/lib/ai';

const emptyDoc = getEmptyUIDocument();
// Returns a UIDocument with empty Container and default design tokens
```

## Components

### PromptEngine

Main class for AI-powered UI generation.

**Methods:**
- `generateUI(prompt: string, context?: GenerationContext): Promise<GenerationResult>`

**Features:**
- Prompt caching with automatic cache key generation
- Retry logic with exponential backoff (3 attempts)
- Response validation and auto-fixing
- Manual edit preservation
- Usage logging

### AI Models

#### OpenAIModel

Implements the AIModel interface using OpenAI's GPT-4 API.

```typescript
import { OpenAIModel } from '@/lib/ai';

const model = new OpenAIModel('gpt-4');
const response = await model.complete({
  system: 'You are a UI designer...',
  user: 'Create a landing page',
  temperature: 0.7,
  maxTokens: 4000,
});
```

#### ClaudeModel

Implements the AIModel interface using Anthropic's Claude API.

```typescript
import { ClaudeModel } from '@/lib/ai';

const model = new ClaudeModel('claude-3-sonnet-20240229');
const response = await model.complete({
  system: 'You are a UI designer...',
  user: 'Create a landing page',
  temperature: 0.7,
  maxTokens: 4000,
});
```

### Prompt Templates

Pre-defined prompt templates for consistent AI interactions.

**Available Templates:**
- `SYSTEM_BASE`: Base system prompt with expert persona
- `COMPONENT_LIBRARY_INSTRUCTIONS`: List of 20 available components
- `DESIGN_TOKEN_INSTRUCTIONS`: Design token guidelines
- `RESPONSIVE_INSTRUCTIONS`: Mobile-first responsive design rules
- `JSON_OUTPUT_INSTRUCTIONS`: JSON output format requirements

**Functions:**
- `buildSystemPrompt(options?)`: Builds complete system prompt
- `buildUserPrompt(prompt, options?)`: Builds user prompt

### Utilities

**Cache Key Generation:**
```typescript
import { getCacheKey } from '@/lib/ai';

const key = getCacheKey('Create a landing page', { projectId: '123' });
// Returns: "prompt:abc123..." (SHA-256 hash)
```

**JSON Extraction:**
```typescript
import { extractJSONFromMarkdown } from '@/lib/ai';

const json = extractJSONFromMarkdown('```json\n{"test": "value"}\n```');
// Returns: '{"test": "value"}'
```

**Response Validation:**
```typescript
import { validateAndFixAIResponse } from '@/lib/ai';

const fixed = validateAndFixAIResponse(aiGeneratedDocument);
// Auto-fixes:
// - Missing IDs (generates with nanoid)
// - Missing metadata
// - Missing design tokens
// - Malformed tree structures
```

**Manual Edit Detection:**
```typescript
import { findManuallyEditedComponents } from '@/lib/ai';

const editedIds = findManuallyEditedComponents(uiDocument.root);
// Returns: ['component-id-1', 'component-id-2', ...]
```

## Design Tokens

The AI engine generates UIs with consistent design tokens:

### Colors
- `primary`: #3B82F6 (blue)
- `secondary`: #10B981 (green)
- `success`: #22C55E
- `warning`: #F59E0B
- `error`: #EF4444
- `text`: #1F2937
- `textMuted`: #6B7280
- `background`: #FFFFFF
- `border`: #E5E7EB

### Spacing
- `xs`: 0.25rem (4px)
- `sm`: 0.5rem (8px)
- `md`: 1rem (16px)
- `lg`: 2rem (32px)
- `xl`: 3rem (48px)
- `2xl`: 4rem (64px)

### Typography
- `heading`: 3rem / 700 / 1.2
- `subheading`: 1.5rem / 600 / 1.4
- `body`: 1rem / 400 / 1.6
- `small`: 0.875rem / 400 / 1.5

### Shadows
- `sm`: 0 1px 2px rgba(0, 0, 0, 0.05)
- `md`: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
- `lg`: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
- `xl`: 0 20px 25px -5px rgba(0, 0, 0, 0.1)

## Component Library

The AI engine can generate 20 component types:

### Layout Components
- `Container`: Main wrapper with max-width
- `Flex`: Flexible box layout
- `Grid`: Grid layout
- `Stack`: Vertical/horizontal stack

### Content Components
- `Text`: Body text
- `Heading`: Heading (h1-h6)
- `Image`: Image with alt text
- `Icon`: Lucide React icon

### Interactive Components
- `Button`: Button with variants
- `Input`: Text input
- `Textarea`: Multi-line input
- `Select`: Dropdown select
- `Checkbox`: Checkbox input
- `Radio`: Radio button

### Navigation Components
- `Nav`: Navigation bar
- `Link`: Hyperlink

### Composite Components
- `Card`: Content card
- `Hero`: Hero section
- `Feature`: Feature section
- `Footer`: Footer section

## Responsive Design

The AI engine generates mobile-first responsive designs with two breakpoints:

- **Mobile**: 0-767px (base styles in `styles.mobile`)
- **Desktop**: 768px+ (overrides in `styles.desktop`)

### Guidelines
1. Always define base mobile styles
2. Add desktop overrides only when needed
3. Stack layouts vertically on mobile
4. Use horizontal layouts on desktop
5. Reduce font sizes on mobile
6. Reduce spacing on mobile

## Error Handling

The AI engine includes comprehensive error handling:

### Retry Logic
- 3 retry attempts with exponential backoff
- Base delay: 1000ms
- Backoff formula: 2^attempt * baseDelay

### Validation
- Automatic JSON extraction from markdown
- Schema validation using Zod
- Auto-fixing of common issues
- Detailed error logging

### Common Errors
- `AI_PROVIDER not set`: Set environment variable
- `API key not set`: Configure OPENAI_API_KEY or ANTHROPIC_API_KEY
- `Invalid AI_PROVIDER`: Must be "openai" or "anthropic"
- `Failed to parse AI response`: AI returned invalid JSON

## Performance

### Caching
- In-memory cache with 1-hour TTL
- Cache key based on prompt + context hash
- Reduces redundant AI calls
- Significant cost savings

### Optimization Tips
1. Use caching for repeated prompts
2. Preserve manual edits to avoid regeneration
3. Use specific prompts for better results
4. Monitor token usage for cost control

## Requirements Mapping

This module implements the following requirements:

- **1.1**: AI prompt-to-UI generation
- **1.2**: UI specification generation with custom JSON schema
- **1.3**: Parse and validate AI responses
- **1.4**: Design token instructions
- **1.7**: Responsive breakpoint instructions
- **2.2**: Preserve manually edited components
- **2.5**: Handle existing document context
- **2.6**: Identify and preserve manual edits
- **4.1**: Mobile-first responsive design
- **25.1**: Centralized AI API key
- **25.2**: Configurable AI provider selection
- **25.3**: Error handling and retry logic
- **25.5**: Retry logic with exponential backoff
- **25.6**: Prompt caching
- **25.7**: AI response validation and logging
- **25.8**: AI usage logging per user
- **25.10**: Provider switching without code changes

## Future Enhancements

- Redis-based caching for production
- Database logging for AI usage analytics
- Support for additional AI providers
- Advanced prompt optimization
- Cost estimation before generation
- Streaming responses for real-time updates
