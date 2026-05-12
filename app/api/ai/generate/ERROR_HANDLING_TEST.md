# AI Generation Error Handling Test Guide

## Overview
This guide provides manual test scenarios to verify the enhanced error handling and logging for the AI Generation API.

## Prerequisites
- Server running locally (`npm run dev`)
- Valid authentication session
- Access to console logs

## Test Scenarios

### 1. Successful Generation (Baseline)

**Request:**
```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "prompt": "Create a simple hero section with a heading and button"
  }'
```

**Expected Response:**
- Status: 200
- Success: true
- Data contains: uiDocument, tokensUsed, generationTime, cached

**Expected Logs:**
```
AI Generation Attempt: { timestamp, attempt: 1, maxRetries: 3, promptLength }
AI Generation Attempt Success: { timestamp, attempt: 1, tokensUsed, model }
Parsing AI Response: { timestamp, responseLength, promptLength }
AI Response Parsed Successfully: { timestamp, documentId, componentCount }
AI Usage Log: { timestamp, event: 'ai_usage', userId, tokensUsed, estimatedCost }
AI Generation Success: { timestamp, userId, event: 'ai_generation_success', componentCount }
```

---

### 2. Validation Error (Invalid Prompt)

**Request:**
```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "prompt": ""
  }'
```

**Expected Response:**
- Status: 400
- Success: false
- Error code: VALIDATION_ERROR
- Error message: "Invalid request data"
- Details: Array of validation errors

**Expected Logs:**
```
(No AI generation logs - validation fails before AI call)
```

---

### 3. Authentication Error (No Session)

**Request:**
```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a hero section"
  }'
```

**Expected Response:**
- Status: 401
- Success: false
- Error code: UNAUTHORIZED
- Error message: "You must be signed in to generate UI"

**Expected Logs:**
```
(No logs - authentication fails before processing)
```

---

### 4. Rate Limit Error

**Test Steps:**
1. Make 11 requests in quick succession (rate limit is 10/hour)

**Expected Response (11th request):**
- Status: 429
- Success: false
- Error code: RATE_LIMIT_EXCEEDED
- Error message: "You have exceeded the rate limit for AI generation. Please try again later."
- Rate limit info: limit, remaining, reset

**Expected Logs:**
```
(Rate limit check happens before AI generation)
```

---

### 5. AI Service Error Simulation

To test AI service errors, you can temporarily modify the code or use invalid API keys.

#### 5a. Invalid API Key

**Setup:**
1. Temporarily set invalid OPENAI_API_KEY in .env
2. Restart server

**Request:**
```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "prompt": "Create a hero section"
  }'
```

**Expected Response:**
- Status: 500
- Success: false
- Error code: AI_SERVICE_AUTH_ERROR
- Error message: "AI service authentication failed. Please contact support."
- Suggestions: ["This is a platform configuration issue", ...]

**Expected Logs:**
```
AI Generation Attempt: { ... }
AI Generation Attempt Failed: { timestamp, attempt: 1, error: { name, message }, willRetry: true }
OpenAI API Error: { timestamp, status: 401, message: "Invalid API key" }
(Retry attempts...)
AI generation error: { timestamp, userId, error: { name, message, stack } }
```

---

### 6. Parse Error Simulation

To test parse errors, you would need to mock the AI response to return invalid JSON.

**Expected Response:**
- Status: 500
- Success: false
- Error code: AI_RESPONSE_PARSE_ERROR
- Error message: "Failed to process AI response. Please try rephrasing your prompt."
- Suggestions: ["Try rephrasing your prompt more clearly", ...]

**Expected Logs:**
```
AI Generation Attempt: { ... }
AI Generation Attempt Success: { ... }
Parsing AI Response: { ... }
JSON Parse Error: { timestamp, error, responsePreview }
Failed to parse AI response: { timestamp, error, responsePreview, promptPreview }
AI generation error: { timestamp, userId, error }
```

---

### 7. Network Error Simulation

To test network errors, you can temporarily disconnect from the internet or use a network proxy.

**Expected Response:**
- Status: 503
- Success: false
- Error code: NETWORK_ERROR
- Error message: "Network error while connecting to AI service"
- Suggestions: ["Check your internet connection", ...]

**Expected Logs:**
```
AI Generation Attempt: { ... }
AI Generation Attempt Failed: { timestamp, attempt: 1, error: { code: 'ECONNREFUSED' } }
OpenAI API Error: { timestamp, code: 'ECONNREFUSED' }
(Retry attempts...)
AI generation error: { timestamp, userId, error }
```

---

## Log Verification Checklist

For each test, verify the logs contain:

- [ ] Timestamp in ISO format
- [ ] User ID (when authenticated)
- [ ] Event type clearly identified
- [ ] Error details (name, message)
- [ ] Stack traces only in development mode
- [ ] No sensitive data (API keys, full prompts)
- [ ] Structured format (JSON-like)
- [ ] Appropriate log level (console.log vs console.error)

## Error Response Verification Checklist

For each error response, verify:

- [ ] Correct HTTP status code
- [ ] Success: false
- [ ] Error code is descriptive
- [ ] Error message is user-friendly (no technical jargon)
- [ ] Suggestions are actionable
- [ ] No sensitive data exposed
- [ ] Stack traces only in development mode

## Success Response Verification Checklist

For successful responses, verify:

- [ ] Status: 200
- [ ] Success: true
- [ ] UIDocument is valid
- [ ] Tokens used is a number
- [ ] Generation time is reasonable
- [ ] Cached flag is boolean

## Performance Verification

Monitor the following:

- [ ] Generation time < 5 seconds (Requirement 1.2)
- [ ] Retry delays use exponential backoff
- [ ] Logs don't impact performance significantly
- [ ] Error responses are fast (< 100ms)

## Cost Tracking Verification

Check AI Usage logs for:

- [ ] Tokens used per request
- [ ] Estimated cost calculation
- [ ] User ID for tracking
- [ ] Model and provider information

## Notes

- All tests should be run in both development and production modes
- Verify that stack traces are hidden in production
- Check that rate limit headers are present in responses
- Monitor console for any unexpected errors or warnings
- Test with both OpenAI and Anthropic providers (if configured)

## Automated Testing (Future)

Consider creating automated tests for:
- Unit tests for error message generation
- Integration tests for API error handling
- Mock tests for AI service failures
- Load tests for rate limiting
- Cost tracking accuracy tests
