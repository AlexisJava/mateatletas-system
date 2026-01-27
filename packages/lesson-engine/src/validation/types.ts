/**
 * Validation Types
 */

import type { z } from 'zod';

export interface ValidationSuccess {
  success: true;
  data: Record<string, unknown>;
  intentId: string;
}

export interface ValidationError {
  success: false;
  errors: ValidationIssue[];
  intentId: string | null;
}

export interface ValidationIssue {
  path: string;
  message: string;
  code: z.ZodIssueCode | 'unknown_intent' | 'invalid_json' | 'missing_intent';
}

export type ValidationResult = ValidationSuccess | ValidationError;
