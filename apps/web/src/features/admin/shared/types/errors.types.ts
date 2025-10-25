/**
 * Sistema de errores type-safe para el admin portal
 */

import { z } from 'zod';

/**
 * Códigos de error estandarizados
 */
export enum ErrorCode {
  // Errores de red
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // Errores de autenticación
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Errores de validación
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Errores de negocio
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',

  // Errores de servidor
  SERVER_ERROR = 'SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',

  // Errores desconocidos
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Interfaz base para errores
 */
export interface AppError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Error de validación con detalles de campos
 */
export interface ValidationError extends AppError {
  code: ErrorCode.VALIDATION_ERROR;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Error de red con información de conectividad
 */
export interface NetworkError extends AppError {
  code: ErrorCode.NETWORK_ERROR | ErrorCode.TIMEOUT;
  url?: string;
  statusCode?: number;
}

/**
 * Error de autenticación/autorización
 */
export interface AuthError extends AppError {
  code: ErrorCode.UNAUTHORIZED | ErrorCode.FORBIDDEN;
  requiredPermissions?: string[];
}

/**
 * Error de negocio
 */
export interface BusinessError extends AppError {
  code: ErrorCode.NOT_FOUND | ErrorCode.ALREADY_EXISTS | ErrorCode.CONFLICT;
  resource?: string;
  resourceId?: string;
}

/**
 * Schema Zod para validar errores de API
 */
export const ApiErrorSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  error: z.string().optional(),
  errorMessage: z.string().optional(),
  details: z.record(z.unknown()).optional(),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorSchema>;

/**
 * Factory para crear errores type-safe
 */
export class ErrorFactory {
  static network(message: string, url?: string, statusCode?: number): NetworkError {
    return {
      code: ErrorCode.NETWORK_ERROR,
      message,
      url,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  static validation(message: string, fieldErrors?: Record<string, string[]>): ValidationError {
    return {
      code: ErrorCode.VALIDATION_ERROR,
      message,
      fieldErrors,
      timestamp: new Date().toISOString(),
    };
  }

  static auth(message: string, code: ErrorCode.UNAUTHORIZED | ErrorCode.FORBIDDEN): AuthError {
    return {
      code,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  static business(
    message: string,
    code: ErrorCode.NOT_FOUND | ErrorCode.ALREADY_EXISTS | ErrorCode.CONFLICT,
    resource?: string,
    resourceId?: string
  ): BusinessError {
    return {
      code,
      message,
      resource,
      resourceId,
      timestamp: new Date().toISOString(),
    };
  }

  static server(message: string): AppError {
    return {
      code: ErrorCode.SERVER_ERROR,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  static unknown(message: string): AppError {
    return {
      code: ErrorCode.UNKNOWN_ERROR,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Convierte un error de Axios en AppError
   */
  static fromAxiosError(error: unknown): AppError {
    if (!error || typeof error !== 'object') {
      return this.unknown('Error desconocido');
    }

    const axiosError = error as {
      response?: {
        status?: number;
        data?: unknown;
      };
      message?: string;
      code?: string;
    };

    // Timeout
    if (axiosError.code === 'ECONNABORTED') {
      return this.network('Tiempo de espera agotado', undefined, 408);
    }

    // Error de red sin respuesta
    if (!axiosError.response) {
      return this.network(
        axiosError.message || 'Error de conexión',
        undefined,
        0
      );
    }

    const status = axiosError.response.status || 500;
    const data = axiosError.response.data;

    // Parsear respuesta de error de la API
    const apiError = ApiErrorSchema.safeParse(data);
    const errorMessage = apiError.success
      ? apiError.data.errorMessage || apiError.data.message
      : 'Error del servidor';

    // Mapear código HTTP a ErrorCode
    if (status === 401) {
      return this.auth(errorMessage, ErrorCode.UNAUTHORIZED);
    }

    if (status === 403) {
      return this.auth(errorMessage, ErrorCode.FORBIDDEN);
    }

    if (status === 404) {
      return this.business(errorMessage, ErrorCode.NOT_FOUND);
    }

    if (status === 409) {
      return this.business(errorMessage, ErrorCode.CONFLICT);
    }

    if (status === 422) {
      return this.validation(errorMessage);
    }

    if (status >= 500) {
      return this.server(errorMessage);
    }

    return this.unknown(errorMessage);
  }

  /**
   * Convierte un error de Zod en ValidationError
   */
  static fromZodError(error: z.ZodError): ValidationError {
    const fieldErrors: Record<string, string[]> = {};

    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(err.message);
    });

    return this.validation('Error de validación de datos', fieldErrors);
  }
}

/**
 * Type guard para verificar si es un AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'timestamp' in error
  );
}

/**
 * Type guard para ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return isAppError(error) && error.code === ErrorCode.VALIDATION_ERROR;
}

/**
 * Type guard para NetworkError
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return (
    isAppError(error) &&
    (error.code === ErrorCode.NETWORK_ERROR || error.code === ErrorCode.TIMEOUT)
  );
}

/**
 * Type guard para AuthError
 */
export function isAuthError(error: unknown): error is AuthError {
  return (
    isAppError(error) &&
    (error.code === ErrorCode.UNAUTHORIZED || error.code === ErrorCode.FORBIDDEN)
  );
}
