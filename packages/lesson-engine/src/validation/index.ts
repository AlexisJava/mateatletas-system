/**
 * Validation Module
 *
 * Provides Zod schemas and validators for intent JSON content.
 * Used by the Sandbox EditorPanel for real-time validation.
 */

// Types
export type {
  ValidationResult,
  ValidationSuccess,
  ValidationError,
  ValidationIssue,
} from './types';

// Validator functions
export {
  validateIntentJson,
  validateIntentData,
  isValidJson,
  getValidIntentIds,
} from './intent-validator';

// Schemas (for direct use)
export * from './schemas';
