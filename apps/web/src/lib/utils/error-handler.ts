/**
 * 🛡️ Error Handling Utilities
 *
 * Type-safe error handling helpers for API errors
 */

import { AxiosError } from 'axios';

import type { ErrorLike } from '@/types/common';

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
 * Extract error message from unknown error value
 * Convierte automáticamente a ErrorLike internamente
 */
export function getErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  const errorLike = toErrorLike(error);

  // Axios error with response
  if (isAxiosError(errorLike) && errorLike.response?.data?.message) {
    return errorLike.response.data.message;
  }

  // Regular Error
  if (errorLike instanceof Error) {
    return errorLike.message;
  }

  // String error
  if (typeof errorLike === 'string') {
    return errorLike;
  }

  if (typeof errorLike === 'number' || typeof errorLike === 'boolean') {
    return String(errorLike);
  }

  if (
    typeof errorLike === 'object' &&
    errorLike !== null &&
    'message' in errorLike &&
    typeof (errorLike as { message?: string }).message === 'string'
  ) {
    return (errorLike as { message?: string }).message ?? fallback;
  }

  // Unknown error
  return fallback;
}

/**
 * Log error with context
 * Acepta unknown y convierte automáticamente
 */
export function logError(context: string, error: unknown): void {
  const message = getErrorMessage(error);
  console.error(`[${context}]`, message, error);
}

/**
 * Normaliza un error desconocido a un ErrorLike
 */
export function toErrorLike(error: unknown): ErrorLike {
  if (
    error === null ||
    typeof error === 'undefined' ||
    typeof error === 'string' ||
    typeof error === 'number' ||
    typeof error === 'boolean'
  ) {
    return error;
  }

  if (error instanceof Error) {
    return error;
  }

  if (
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message?: string }).message === 'string'
  ) {
    return error as { message?: string };
  }

  return { message: 'Error desconocido' };
}

/**
 * Handle store error consistently
 * Returns error message for state
 */
export function handleStoreError(context: string, error: unknown, fallback?: string): string {
  const normalized = toErrorLike(error);
  logError(context, normalized);
  return getErrorMessage(normalized, fallback);
}
