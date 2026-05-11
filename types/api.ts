/**
 * API Response Types
 * 
 * Defines type-safe API request/response structures for all endpoints
 * 
 * Requirements:
 * - 1.1: AI generation API
 * - 1.3: AI service integration
 * - 7.2: Code export API
 * - 9.1: AI suggestions API
 * - 14.2: Project management API
 */

import type { UIDocument, ExportFormat, ExportOptions } from './ui-schema';

/**
 * Generic API Response
 * 
 * Standard response structure for all API endpoints
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string; // ISO 8601 timestamp
}

/**
 * API Error
 * 
 * Standardized error structure with code and details
 */
export interface ApiError {
  code: string; // Error code (e.g., 'VALIDATION_ERROR', 'UNAUTHORIZED')
  message: string; // Human-readable error message
  details?: Record<string, unknown>; // Additional error context
  statusCode: number; // HTTP status code
}

// ============================================================================
// AI Generation API Types
// ============================================================================

/**
 * Generate UI Request
 * 
 * Request payload for POST /api/ai/generate
 * 
 * Requirements:
 * - 1.1: AI prompt-to-UI generation
 * - 2.2: Context-aware generation
 * - 2.5: Preserve manual edits
 */
export interface GenerateUIRequest {
  prompt: string; // User's natural language prompt (1-1000 chars)
  projectId?: string; // Optional: existing project to update
  preserveManualEdits?: boolean; // Preserve components with manuallyEdited: true
  existingDocument?: UIDocument; // Optional: current UI state for context
}

/**
 * Generate UI Response
 * 
 * Response from POST /api/ai/generate
 */
export interface GenerateUIResponse {
  uiDocument: UIDocument; // Generated or updated UI document
  tokensUsed: number; // AI tokens consumed
  generationTime: number; // Time taken in milliseconds
  model: string; // AI model used (e.g., 'gpt-4', 'claude-3-sonnet')
  cached: boolean; // Was response served from cache?
}

// ============================================================================
// Project Management API Types
// ============================================================================

/**
 * Project Summary
 * 
 * Lightweight project metadata for list views
 * 
 * Requirements:
 * - 14.1: List user projects
 * - 14.4: Display project metadata
 */
export interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  thumbnail: string | null; // URL to thumbnail image
  updatedAt: string; // ISO 8601 timestamp
  componentCount: number; // Number of components in project
  userId: string;
}

/**
 * Project Detail
 * 
 * Complete project data including UI document
 * 
 * Requirements:
 * - 14.3: Fetch single project
 */
export interface ProjectDetail extends ProjectSummary {
  uiDocument: UIDocument; // Full UI document
  createdAt: string; // ISO 8601 timestamp
}

/**
 * Create Project Request
 * 
 * Request payload for POST /api/projects
 * 
 * Requirements:
 * - 14.2: Create new project
 */
export interface CreateProjectRequest {
  name: string; // Project name (1-100 chars)
  description?: string; // Optional description (max 500 chars)
}

/**
 * Create Project Response
 * 
 * Response from POST /api/projects
 */
export interface CreateProjectResponse {
  project: ProjectDetail;
}

/**
 * Update Project Request
 * 
 * Request payload for PATCH /api/projects/[id]
 * 
 * Requirements:
 * - 14.3: Update project
 * - 14.7: Auto-save functionality
 */
export interface UpdateProjectRequest {
  name?: string; // Optional: update name
  description?: string; // Optional: update description
  uiDocument?: UIDocument; // Optional: update UI document
  thumbnail?: string; // Optional: update thumbnail URL
}

/**
 * Update Project Response
 * 
 * Response from PATCH /api/projects/[id]
 */
export interface UpdateProjectResponse {
  project: ProjectDetail;
}

/**
 * Delete Project Response
 * 
 * Response from DELETE /api/projects/[id]
 * 
 * Requirements:
 * - 14.8: Soft delete with 30-day retention
 */
export interface DeleteProjectResponse {
  success: boolean;
  message: string;
  deletedAt: string; // ISO 8601 timestamp
  permanentDeletionDate: string; // Date when project will be permanently deleted
}

/**
 * List Projects Response
 * 
 * Response from GET /api/projects
 * 
 * Requirements:
 * - 14.1: List user projects
 * - 14.6: Search and filter
 */
export interface ListProjectsResponse {
  projects: ProjectSummary[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================================================
// Code Export API Types
// ============================================================================

/**
 * Export Code Request
 * 
 * Request payload for POST /api/projects/[id]/export
 * 
 * Requirements:
 * - 7.1: Multi-format code export
 * - 7.2: Export options
 */
export interface ExportCodeRequest {
  format: ExportFormat; // 'html', 'react', or 'tailwind'
  options: ExportOptions; // Export configuration
}

/**
 * Exported File
 * 
 * Represents a single file in multi-file exports
 */
export interface ExportedFile {
  path: string; // File path (e.g., 'components/Button.tsx')
  content: string; // File content
  language: string; // Language for syntax highlighting (e.g., 'typescript', 'html')
}

/**
 * Export Code Response
 * 
 * Response from POST /api/projects/[id]/export
 * 
 * Requirements:
 * - 7.3: HTML export
 * - 7.4: React export
 * - 7.5: Tailwind export
 */
export interface ExportCodeResponse {
  code: string; // Single-file export (for HTML)
  files?: ExportedFile[]; // Multi-file export (for React)
  format: ExportFormat;
  generatedAt: string; // ISO 8601 timestamp
}

// ============================================================================
// AI Suggestions API Types
// ============================================================================

/**
 * Suggestion Type
 * 
 * Categories of AI suggestions
 */
export type SuggestionType = 
  | 'accessibility'
  | 'layout'
  | 'responsive'
  | 'design-token'
  | 'performance';

/**
 * Suggestion Severity
 * 
 * Importance level of suggestions
 */
export type SuggestionSeverity = 'error' | 'warning' | 'info';

/**
 * Suggestion
 * 
 * A single AI-generated improvement suggestion
 * 
 * Requirements:
 * - 9.1: AI suggestions
 * - 9.2: Accessibility analysis
 * - 9.3: Layout analysis
 * - 9.4: Responsive analysis
 * - 9.5: Design token analysis
 */
export interface Suggestion {
  id: string;
  type: SuggestionType;
  severity: SuggestionSeverity;
  title: string; // Short title (e.g., 'Missing alt text')
  description: string; // Detailed explanation
  componentId?: string; // ID of affected component (if applicable)
  autoFixAvailable: boolean; // Can this be auto-fixed?
  fix?: Partial<UIDocument>; // Auto-fix patch (if available)
  learnMoreUrl?: string; // Link to documentation
}

/**
 * Suggest Improvements Request
 * 
 * Request payload for POST /api/ai/suggest
 * 
 * Requirements:
 * - 9.1: Analyze UI for improvements
 */
export interface SuggestImprovementsRequest {
  uiDocument: UIDocument; // UI document to analyze
  focusAreas?: SuggestionType[]; // Optional: specific areas to analyze
}

/**
 * Suggest Improvements Response
 * 
 * Response from POST /api/ai/suggest
 * 
 * Requirements:
 * - 9.6: Display suggestions
 * - 9.7: Educational explanations
 * - 9.8: One-click fixes
 */
export interface SuggestImprovementsResponse {
  suggestions: Suggestion[];
  analyzedAt: string; // ISO 8601 timestamp
  totalIssues: {
    error: number;
    warning: number;
    info: number;
  };
}

// ============================================================================
// Authentication API Types
// ============================================================================

/**
 * Register Request
 * 
 * Request payload for POST /api/auth/register
 * 
 * Requirements:
 * - 13.1: Email and password registration
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string; // Min 8 characters
}

/**
 * Register Response
 * 
 * Response from POST /api/auth/register
 */
export interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
}

// ============================================================================
// Rate Limiting Types
// ============================================================================

/**
 * Rate Limit Info
 * 
 * Information about rate limiting status
 * 
 * Requirements:
 * - 25.3: Rate limiting
 */
export interface RateLimitInfo {
  limit: number; // Max requests allowed
  remaining: number; // Requests remaining
  reset: string; // ISO 8601 timestamp when limit resets
  retryAfter?: number; // Seconds to wait before retry (if rate limited)
}

/**
 * Rate Limit Error Response
 * 
 * Response when rate limit is exceeded
 */
export interface RateLimitErrorResponse extends ApiResponse<never> {
  success: false;
  error: ApiError & {
    code: 'RATE_LIMIT_EXCEEDED';
    rateLimit: RateLimitInfo;
  };
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Validation Error Detail
 * 
 * Detailed validation error for a specific field
 */
export interface ValidationErrorDetail {
  field: string; // Field name (e.g., 'prompt', 'email')
  message: string; // Error message
  code: string; // Error code (e.g., 'too_short', 'invalid_email')
}

/**
 * Validation Error Response
 * 
 * Response when request validation fails
 */
export interface ValidationErrorResponse extends ApiResponse<never> {
  success: false;
  error: ApiError & {
    code: 'VALIDATION_ERROR';
    details: {
      errors: ValidationErrorDetail[];
    };
  };
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Paginated Request
 * 
 * Common pagination parameters
 */
export interface PaginatedRequest {
  page?: number; // Page number (1-indexed)
  pageSize?: number; // Items per page (default: 50, max: 100)
  sortBy?: string; // Field to sort by
  sortOrder?: 'asc' | 'desc'; // Sort direction
}

/**
 * Search Request
 * 
 * Common search parameters
 */
export interface SearchRequest extends PaginatedRequest {
  query?: string; // Search query
  filters?: Record<string, unknown>; // Additional filters
}

/**
 * Batch Operation Request
 * 
 * Request for batch operations
 */
export interface BatchOperationRequest<T> {
  operations: T[];
}

/**
 * Batch Operation Response
 * 
 * Response for batch operations
 */
export interface BatchOperationResponse<T> {
  results: Array<{
    success: boolean;
    data?: T;
    error?: ApiError;
  }>;
  successCount: number;
  failureCount: number;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { success: true; data: T } {
  return response.success === true && response.data !== undefined;
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse(
  response: ApiResponse<unknown>
): response is ApiResponse<never> & { success: false; error: ApiError } {
  return response.success === false && response.error !== undefined;
}

/**
 * Type guard to check if error is a validation error
 */
export function isValidationError(
  response: ApiResponse<unknown>
): response is ValidationErrorResponse {
  return (
    isErrorResponse(response) &&
    response.error.code === 'VALIDATION_ERROR'
  );
}

/**
 * Type guard to check if error is a rate limit error
 */
export function isRateLimitError(
  response: ApiResponse<unknown>
): response is RateLimitErrorResponse {
  return (
    isErrorResponse(response) &&
    response.error.code === 'RATE_LIMIT_EXCEEDED'
  );
}
