# AI Generation API Route

## Endpoint

`POST /api/ai/generate`

## Description

Generates UI from natural language prompts using the centralized AI service (OpenAI or Anthropic).

## Requirements

- **1.1**: AI prompt-to-UI generation
- **1.2**: UI specification generation within 5 seconds
- **1.3**: Parse and validate AI responses
- **25.3**: Rate limiting per user (10 requests per hour)

## Authentication

Requires authentication via NextAuth session. Users must be signed in to use this endpoint.

## Rate Limiting

- **Limit**: 10 requests per hour per user
- **Headers**: Response includes rate limit information:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Timestamp when the limit resets

## Request

### Headers

```
Content-Type: application/json
Cookie: next-auth.session-token=<session-token>
```

### Body

```typescript
{
  prompt: string;              // Required, 1-1000 characters
  projectId?: string;          // Optional, existing project ID
  preserveManualEdits?: boolean; // Optional, default: false
  existingDocument?: UIDocument; // Optional, existing UI document
}
```

### Example

```json
{
  "prompt": "Create a modern landing page with a hero section, features grid, and call-to-action button",
  "preserveManualEdits": false
}
```

## Response

### Success (200)

```typescript
{
  success: true;
  data: {
    uiDocument: UIDocument;    // Generated UI document
    tokensUsed: number;        // AI tokens consumed
    generationTime: number;    // Generation time in milliseconds
    cached: boolean;           // Whether result was cached
  }
}
```

### Example

```json
{
  "success": true,
  "data": {
    "uiDocument": {
      "root": { ... },
      "designTokens": { ... },
      "metadata": { ... }
    },
    "tokensUsed": 1250,
    "generationTime": 2340,
    "cached": false
  }
}
```

## Error Responses

### Unauthorized (401)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You must be signed in to generate UI"
  }
}
```

### Validation Error (400)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "prompt",
        "message": "Prompt must be between 1 and 1000 characters"
      }
    ]
  }
}
```

### Rate Limit Exceeded (429)

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You have exceeded the rate limit for AI generation. Please try again later.",
    "rateLimit": {
      "limit": 10,
      "remaining": 0,
      "reset": "2024-01-15T12:00:00.000Z"
    }
  }
}
```

### Internal Error (500)

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to generate UI",
    "details": "Error stack trace (development only)"
  }
}
```

## Implementation Details

### Flow

1. **Authentication Check**: Verify user session using `getServerSession`
2. **Rate Limiting**: Check if user has exceeded 10 requests/hour limit
3. **Input Validation**: Validate request body using Zod schema
4. **UI Generation**: Call `PromptEngine.generateUI()` with validated input
5. **Response**: Return generated UI with metadata and rate limit headers

### Dependencies

- **NextAuth**: Session management and authentication
- **Upstash Redis**: Rate limiting storage
- **Zod**: Input validation
- **PromptEngine**: AI-powered UI generation

### Caching

The PromptEngine implements prompt caching to reduce redundant AI calls:
- Cache key: Hash of prompt + context (projectId, preserveManualEdits)
- TTL: 1 hour
- Cache hit returns `cached: true` in response

### Error Handling

- All errors are caught and returned with appropriate status codes
- Development mode includes stack traces for debugging
- Production mode returns user-friendly error messages only

## Testing

Run tests with:

```bash
npm test __tests__/api/ai-generate.test.ts
```

## Usage Example

```typescript
// Client-side usage
async function generateUI(prompt: string) {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}
```

## Related Files

- `lib/ai/prompt-engine.ts` - AI prompt processing engine
- `lib/rate-limit.ts` - Rate limiting utilities
- `lib/validation/schemas.ts` - Zod validation schemas
- `lib/auth/auth-options.ts` - NextAuth configuration
