import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  ErrorFactory,
  ErrorCode,
  isAppError,
  isNetworkError,
  isValidationError,
  isAuthError,
} from '../errors.types';

describe('ErrorFactory', () => {
  describe('network errors', () => {
    it('debe crear NetworkError correctamente', () => {
      const error = ErrorFactory.network('Connection failed', '/api/users', 500);

      expect(error.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(error.message).toBe('Connection failed');
      expect(error.url).toBe('/api/users');
      expect(error.statusCode).toBe(500);
      expect(error.timestamp).toBeDefined();
    });
  });

  describe('validation errors', () => {
    it('debe crear ValidationError con fieldErrors', () => {
      const fieldErrors = {
        email: ['Email inválido', 'Email requerido'],
        password: ['Password muy corto'],
      };

      const error = ErrorFactory.validation('Datos inválidos', fieldErrors);

      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.message).toBe('Datos inválidos');
      expect(error.fieldErrors).toEqual(fieldErrors);
    });
  });

  describe('auth errors', () => {
    it('debe crear AuthError 401', () => {
      const error = ErrorFactory.auth('No autenticado', ErrorCode.UNAUTHORIZED);

      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(error.message).toBe('No autenticado');
    });

    it('debe crear AuthError 403', () => {
      const error = ErrorFactory.auth('Sin permisos', ErrorCode.FORBIDDEN);

      expect(error.code).toBe(ErrorCode.FORBIDDEN);
      expect(error.message).toBe('Sin permisos');
    });
  });

  describe('business errors', () => {
    it('debe crear BusinessError NOT_FOUND', () => {
      const error = ErrorFactory.business(
        'Usuario no encontrado',
        ErrorCode.NOT_FOUND,
        'User',
        '123',
      );

      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.message).toBe('Usuario no encontrado');
      expect(error.resource).toBe('User');
      expect(error.resourceId).toBe('123');
    });

    it('debe crear BusinessError CONFLICT', () => {
      const error = ErrorFactory.business('Email ya existe', ErrorCode.CONFLICT, 'User');

      expect(error.code).toBe(ErrorCode.CONFLICT);
      expect(error.message).toBe('Email ya existe');
    });
  });

  describe('server errors', () => {
    it('debe crear ServerError', () => {
      const error = ErrorFactory.server('Error interno del servidor');

      expect(error.code).toBe(ErrorCode.SERVER_ERROR);
      expect(error.message).toBe('Error interno del servidor');
    });
  });

  describe('unknown errors', () => {
    it('debe crear UnknownError', () => {
      const error = ErrorFactory.unknown('Error desconocido');

      expect(error.code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(error.message).toBe('Error desconocido');
    });
  });

  describe('fromAxiosError', () => {
    it('debe convertir error 401', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 401,
          data: {
            statusCode: 401,
            message: 'No autorizado',
          },
        },
      };

      const error = ErrorFactory.fromAxiosError(axiosError);

      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(error.message).toBe('No autorizado');
    });

    it('debe convertir error 404', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 404,
          data: {
            statusCode: 404,
            message: 'Recurso no encontrado',
          },
        },
      };

      const error = ErrorFactory.fromAxiosError(axiosError);

      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.message).toBe('Recurso no encontrado');
    });

    it('debe convertir error 500', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 500,
          data: {
            statusCode: 500,
            message: 'Error del servidor',
          },
        },
      };

      const error = ErrorFactory.fromAxiosError(axiosError);

      expect(error.code).toBe(ErrorCode.SERVER_ERROR);
      expect(error.message).toBe('Error del servidor');
    });

    it('debe manejar timeout', () => {
      const axiosError = {
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'Timeout',
      };

      const error = ErrorFactory.fromAxiosError(axiosError);

      expect(error.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(error.message).toBe('Tiempo de espera agotado');
    });

    it('debe manejar error sin respuesta', () => {
      const axiosError = {
        isAxiosError: true,
        message: 'Network Error',
      };

      const error = ErrorFactory.fromAxiosError(axiosError);

      expect(error.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(error.message).toBe('Network Error');
    });
  });

  describe('fromZodError', () => {
    it('debe convertir ZodError a ValidationError', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().positive(),
      });

      try {
        schema.parse({ email: 'invalid', age: -5 });
      } catch (err) {
        if (err instanceof z.ZodError) {
          const error = ErrorFactory.fromZodError(err);

          expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
          expect(error.message).toBe('Error de validación de datos');
          expect(error.fieldErrors).toBeDefined();
        }
      }
    });
  });
});

describe('Type Guards', () => {
  describe('isAppError', () => {
    it('debe identificar AppError correctamente', () => {
      const error = ErrorFactory.network('Test');

      expect(isAppError(error)).toBe(true);
    });

    it('debe rechazar objetos que no son AppError', () => {
      const notAnError = { foo: 'bar' };

      expect(isAppError(notAnError)).toBe(false);
    });
  });

  describe('isNetworkError', () => {
    it('debe identificar NetworkError', () => {
      const error = ErrorFactory.network('Test');

      expect(isNetworkError(error)).toBe(true);
    });

    it('debe rechazar otros tipos de error', () => {
      const error = ErrorFactory.validation('Test');

      expect(isNetworkError(error)).toBe(false);
    });
  });

  describe('isValidationError', () => {
    it('debe identificar ValidationError', () => {
      const error = ErrorFactory.validation('Test');

      expect(isValidationError(error)).toBe(true);
    });

    it('debe rechazar otros tipos de error', () => {
      const error = ErrorFactory.network('Test');

      expect(isValidationError(error)).toBe(false);
    });
  });

  describe('isAuthError', () => {
    it('debe identificar AuthError 401', () => {
      const error = ErrorFactory.auth('Test', ErrorCode.UNAUTHORIZED);

      expect(isAuthError(error)).toBe(true);
    });

    it('debe identificar AuthError 403', () => {
      const error = ErrorFactory.auth('Test', ErrorCode.FORBIDDEN);

      expect(isAuthError(error)).toBe(true);
    });

    it('debe rechazar otros tipos de error', () => {
      const error = ErrorFactory.network('Test');

      expect(isAuthError(error)).toBe(false);
    });
  });
});
