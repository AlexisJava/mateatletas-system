/**
 * Intent Validator
 *
 * Validates intent JSON against the appropriate schema.
 * Used by the Sandbox EditorPanel for real-time validation.
 */

import { z } from 'zod';
import type { ValidationResult, ValidationIssue } from './types';
import { intentSchema } from './schemas';
import { INTENT_CATALOG } from '../catalog';

// =============================================================================
// VALID INTENT IDS
// =============================================================================

const VALID_INTENT_IDS = new Set(INTENT_CATALOG.map((i) => i.id));

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function zodErrorToIssues(error: z.ZodError): ValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));
}

function extractIntentId(data: unknown): string | null {
  if (typeof data === 'object' && data !== null && 'intent' in data) {
    const intent = (data as Record<string, unknown>).intent;
    if (typeof intent === 'string') {
      return intent;
    }
  }
  return null;
}

// =============================================================================
// MAIN VALIDATOR
// =============================================================================

/**
 * Validates a JSON string as an intent.
 *
 * @param jsonString - The JSON string to validate (contenidoJson from DB)
 * @returns ValidationResult with success/failure and detailed errors
 *
 * @example
 * ```typescript
 * const result = validateIntentJson('{"intent":"presentation:hero","title":"Hello"}');
 * if (result.success) {
 *   console.log('Valid intent:', result.data);
 * } else {
 *   console.log('Validation errors:', result.errors);
 * }
 * ```
 */
export function validateIntentJson(jsonString: string): ValidationResult {
  // Step 1: Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    return {
      success: false,
      intentId: null,
      errors: [
        {
          path: '',
          message: e instanceof Error ? e.message : 'Invalid JSON',
          code: 'invalid_json',
        },
      ],
    };
  }

  // Step 2: Check if it has an intent field
  const intentId = extractIntentId(parsed);
  if (!intentId) {
    // Not an intent-based content, might be legacy ContentBlock format
    // We consider this valid but with no intent
    return {
      success: true,
      data: parsed as Record<string, unknown>,
      intentId: '',
    };
  }

  // Step 3: Check if intent ID is known
  if (!VALID_INTENT_IDS.has(intentId)) {
    return {
      success: false,
      intentId,
      errors: [
        {
          path: 'intent',
          message: `Unknown intent: "${intentId}". Valid intents are: ${Array.from(VALID_INTENT_IDS).slice(0, 5).join(', ')}...`,
          code: 'unknown_intent',
        },
      ],
    };
  }

  // Step 4: Validate against schema
  const result = intentSchema.safeParse(parsed);
  if (!result.success) {
    return {
      success: false,
      intentId,
      errors: zodErrorToIssues(result.error),
    };
  }

  return {
    success: true,
    data: result.data,
    intentId,
  };
}

/**
 * Validates parsed data directly (already parsed from JSON).
 *
 * @param data - The parsed object to validate
 * @returns ValidationResult
 */
export function validateIntentData(data: unknown): ValidationResult {
  const intentId = extractIntentId(data);

  if (!intentId) {
    // Legacy content, pass through
    return {
      success: true,
      data: data as Record<string, unknown>,
      intentId: '',
    };
  }

  if (!VALID_INTENT_IDS.has(intentId)) {
    return {
      success: false,
      intentId,
      errors: [
        {
          path: 'intent',
          message: `Unknown intent: "${intentId}"`,
          code: 'unknown_intent',
        },
      ],
    };
  }

  const result = intentSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      intentId,
      errors: zodErrorToIssues(result.error),
    };
  }

  return {
    success: true,
    data: result.data,
    intentId,
  };
}

/**
 * Checks if a JSON string is valid without full schema validation.
 * Useful for quick checks when typing.
 */
export function isValidJson(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the list of all valid intent IDs.
 */
export function getValidIntentIds(): string[] {
  return Array.from(VALID_INTENT_IDS);
}
