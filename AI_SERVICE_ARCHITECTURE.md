# AI Service Architecture - Centralized Model

## Overview

The AI UI Builder SaaS uses a **centralized AI service architecture** where the platform owner configures a single AI provider (OpenAI or Anthropic) that serves all users. Users do not need their own API keys.

## Key Benefits

### For Platform Owner
- **Cost Control**: Single API key means you control and monitor all AI costs
- **Usage Tracking**: Track AI usage per user for analytics and potential rate limiting
- **Quality Control**: Ensure consistent AI model and prompt engineering across all users
- **Flexibility**: Switch between providers without affecting users
- **Monetization**: Build subscription tiers based on AI usage limits

### For Users
- **Zero Setup**: No need to obtain or configure AI API keys
- **Immediate Access**: Start using AI features right away
- **Consistent Experience**: Same AI quality for all users
- **No Cost Barrier**: Users don't pay for AI API access separately

## Architecture

### Environment Configuration

The platform owner configures ONE AI provider via environment variables:

```bash
# Choose your AI provider
AI_PROVIDER="openai"  # Options: "openai" or "anthropic"

# Provide the corresponding API key
OPENAI_API_KEY="sk-..."  # Required if AI_PROVIDER=openai
ANTHROPIC_API_KEY="sk-ant-..."  # Required if AI_PROVIDER=anthropic
```

### Implementation

#### 1. AI Model Interface

Both OpenAI and Anthropic models implement a common interface:

```typescript
interface AIModel {
  complete(params: {
    system: string;
    user: string;
    temperature: number;
    maxTokens: number;
  }): Promise<string>;
}
```

#### 2. Provider Selection

The `PromptEngine` class automatically selects the configured provider:

```typescript
export class PromptEngine {
  private aiModel: AIModel;
  
  constructor() {
    const provider = process.env.AI_PROVIDER || 'openai';
    
    if (provider === 'anthropic') {
      this.aiModel = new ClaudeModel('claude-3-sonnet');
    } else {
      this.aiModel = new OpenAIModel('gpt-4');
    }
  }
}
```

#### 3. Usage Tracking

All AI requests are logged with user information for analytics:

```typescript
// Log AI usage per user
await logAIUsage({
  userId: session.user.id,
  provider: process.env.AI_PROVIDER,
  tokensUsed: response.tokensUsed,
  timestamp: new Date(),
});
```

## Cost Management

### Strategies

1. **Rate Limiting**: Limit AI requests per user per hour/day
2. **Caching**: Cache AI responses to reduce redundant API calls
3. **Subscription Tiers**: 
   - Free: 10 AI generations per day
   - Pro: 100 AI generations per day
   - Enterprise: Unlimited

### Monitoring

Track these metrics:
- Total AI API costs per day/month
- Cost per user
- Average tokens per request
- Cache hit rate
- Failed requests

## Switching Providers

To switch from OpenAI to Anthropic (or vice versa):

1. Update environment variable:
   ```bash
   AI_PROVIDER="anthropic"
   ANTHROPIC_API_KEY="sk-ant-..."
   ```

2. Restart the application

3. No code changes required!

## Security Considerations

### API Key Protection

- ✅ API keys stored in environment variables (never in code)
- ✅ API keys never exposed to client-side code
- ✅ API keys never sent to users
- ✅ All AI requests go through authenticated API routes

### User Privacy

- AI prompts and generated UIs are stored in your database
- Consider data retention policies
- Implement user data deletion on account closure
- Be transparent about AI usage in privacy policy

## Migration from Multi-Provider to Single Provider

### Before (Old Architecture)
```typescript
// Users could provide their own keys
// Platform had both OpenAI and Claude as fallback
this.primaryModel = new OpenAIModel('gpt-4');
this.fallbackModel = new ClaudeModel('claude-3-sonnet');
```

### After (New Architecture)
```typescript
// Platform owner configures ONE provider
// All users use the same provider
const provider = process.env.AI_PROVIDER || 'openai';
this.aiModel = provider === 'anthropic' 
  ? new ClaudeModel('claude-3-sonnet')
  : new OpenAIModel('gpt-4');
```

## Recommended Provider

### OpenAI (GPT-4)
- **Pros**: Better at structured JSON output, widely tested
- **Cons**: Higher cost per token
- **Best for**: Production with quality focus

### Anthropic (Claude 3 Sonnet)
- **Pros**: Lower cost, good performance
- **Cons**: Slightly less consistent JSON formatting
- **Best for**: Cost-conscious deployments

## Implementation Checklist

- [x] Update `.env.example` with AI_PROVIDER variable
- [x] Update `PromptEngine` class to use single provider
- [x] Update `SuggestionEngine` class to use single provider
- [x] Remove fallback logic from AI retry mechanism
- [x] Add AI usage logging per user
- [x] Update requirements document (Requirement 25)
- [x] Update design document (AI Services section)
- [x] Update tasks document (Task 6)
- [x] Update README.md
- [x] Update SETUP.md

## Next Steps

1. Implement AI usage tracking in database
2. Add rate limiting middleware
3. Create admin dashboard for AI cost monitoring
4. Implement subscription tier limits
5. Add cache layer for AI responses
6. Set up alerts for high AI costs

## Questions?

This architecture ensures:
- ✅ Users don't need AI API keys
- ✅ Platform owner controls costs
- ✅ Easy to switch providers
- ✅ Consistent user experience
- ✅ Scalable and maintainable
