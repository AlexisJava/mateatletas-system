/**
 * Utility functions for error handling
 */

import type { ErrorLike } from '@/types/common';

/**
 * Safely extract error message from error-like value
 */
export function getErrorMessage(error: ErrorLike, fallback = 'Error desconocido'): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'number' || typeof error === 'boolean') {
    return String(error);
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: string }).message === 'string'
  ) {
    return (error as { message?: string }).message ?? fallback;
  }

  return fallback;
}

/**
 * Type guard to check if value is an Error
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}
