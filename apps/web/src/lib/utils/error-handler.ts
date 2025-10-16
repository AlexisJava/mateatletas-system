/**
 * 🛡️ Error Handling Utilities
 *
 * Type-safe error handling helpers for API errors
 */

import { AxiosError } from 'axios';

/**
 * API Error response structure
 */
export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  timestamp?: string;
  path?: string;
  error?: string;
}

/**
 * Check if error is an Axios error with response
 */
export function isAxiosError(error: unknown): error is AxiosError<ApiErrorResponse> {
  return error instanceof Error && 'isAxiosError' in error && error.isAxiosError === true;
}

/**
 * Extract error message from unknown error
 */
export function getErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  // Axios error with response
  if (isAxiosError(error) && error.response?.data?.message) {
    return error.response.data.message;
  }

  // Regular Error
  if (error instanceof Error) {
    return error.message;
  }

  // String error
  if (typeof error === 'string') {
    return error;
  }

  // Unknown error
  return fallback;
}

/**
 * Log error with context
 */
export function logError(context: string, error: unknown): void {
  const message = getErrorMessage(error);
  console.error(`[${context}]`, message, error);
}

/**
 * Handle store error consistently
 * Returns error message for state
 */
export function handleStoreError(context: string, error: unknown, fallback?: string): string {
  logError(context, error);
  return getErrorMessage(error, fallback);
}
