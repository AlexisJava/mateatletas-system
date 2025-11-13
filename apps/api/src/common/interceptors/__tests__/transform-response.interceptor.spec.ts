/**
 * Tests para TransformResponseInterceptor
 *
 * Verifica que el interceptor:
 * 1. Envuelve respuestas simples en formato ApiResponse
 * 2. No re-envuelve respuestas que ya tienen formato correcto
 * 3. Agrega timestamp en metadata
 * 4. Maneja null, undefined, primitivos y arrays correctamente
 */

import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { TransformResponseInterceptor } from '../transform-response.interceptor';
import { ApiResponse } from '../../interfaces/api-response.interface';

describe('TransformResponseInterceptor', () => {
  let interceptor: TransformResponseInterceptor<any>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new TransformResponseInterceptor();
    mockExecutionContext = {} as ExecutionContext;
  });

  describe('Envoltura de respuestas simples', () => {
    it('debe envolver objeto simple en formato ApiResponse', (done) => {
      const testData = { id: '123', nombre: 'Juan' };
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result: ApiResponse<any>) => {
          expect(result).toHaveProperty('data');
          expect(result.data).toEqual(testData);
          expect(result).toHaveProperty('metadata');
          expect(result.metadata).toHaveProperty('timestamp');
          expect(typeof result.metadata?.timestamp).toBe('string');
          done();
        },
      });
    });

    it('debe envolver array en formato ApiResponse', (done) => {
      const testData = [
        { id: '1', nombre: 'Item 1' },
        { id: '2', nombre: 'Item 2' },
      ];
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result: ApiResponse<any>) => {
          expect(result).toHaveProperty('data');
          expect(result.data).toEqual(testData);
          expect(Array.isArray(result.data)).toBe(true);
          expect(result.data.length).toBe(2);
          expect(result).toHaveProperty('metadata');
          done();
        },
      });
    });

    it('debe envolver número primitivo en formato ApiResponse', (done) => {
      const testData = 42;
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result: ApiResponse<any>) => {
          expect(result).toHaveProperty('data');
          expect(result.data).toBe(42);
          expect(result).toHaveProperty('metadata');
          done();
        },
      });
    });

    it('debe envolver string primitivo en formato ApiResponse', (done) => {
      const testData = 'test-string';
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result: ApiResponse<any>) => {
          expect(result).toHaveProperty('data');
          expect(result.data).toBe('test-string');
          expect(result).toHaveProperty('metadata');
          done();
        },
      });
    });

    it('debe envolver boolean primitivo en formato ApiResponse', (done) => {
      const testData = true;
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result: ApiResponse<any>) => {
          expect(result).toHaveProperty('data');
          expect(result.data).toBe(true);
          expect(result).toHaveProperty('metadata');
          done();
        },
      });
    });
  });

  describe('Respuestas con formato correcto', () => {
    it('NO debe re-envolver respuesta que ya tiene formato ApiResponse', (done) => {
      const testData: ApiResponse<any> = {
        data: { id: '123' },
        metadata: {
          timestamp: '2025-11-12T10:30:00.000Z',
        },
      };
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result: ApiResponse<any>) => {
          expect(result).toEqual(testData);
          expect(result.data).toEqual({ id: '123' });
          expect(result.metadata?.timestamp).toBe('2025-11-12T10:30:00.000Z');
          done();
        },
      });
    });

    it('debe agregar timestamp si falta en metadata', (done) => {
      const testData = {
        data: { id: '123' },
        metadata: {
          customField: 'custom-value',
          // timestamp faltante
        },
      };
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result: ApiResponse<any>) => {
          expect(result).toHaveProperty('metadata');
          expect(result.metadata).toHaveProperty('timestamp');
          expect(result.metadata).toHaveProperty('customField');
          expect(result.metadata?.customField).toBe('custom-value');
          done();
        },
      });
    });

    it('debe agregar metadata completa si falta', (done) => {
      const testData = {
        data: { id: '123' },
        // metadata faltante
      };
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result: ApiResponse<any>) => {
          expect(result).toHaveProperty('metadata');
          expect(result.metadata).toHaveProperty('timestamp');
          expect(typeof result.metadata?.timestamp).toBe('string');
          done();
        },
      });
    });
  });

  describe('Casos especiales: null y undefined', () => {
    it('debe envolver null en formato ApiResponse', (done) => {
      const testData = null;
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result: ApiResponse<any>) => {
          expect(result).toHaveProperty('data');
          expect(result.data).toBeNull();
          expect(result).toHaveProperty('metadata');
          done();
        },
      });
    });

    it('debe envolver undefined en formato ApiResponse', (done) => {
      const testData = undefined;
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result: ApiResponse<any>) => {
          expect(result).toHaveProperty('data');
          expect(result.data).toBeUndefined();
          expect(result).toHaveProperty('metadata');
          done();
        },
      });
    });
  });

  describe('Metadata y timestamp', () => {
    it('debe agregar timestamp en formato ISO 8601', (done) => {
      const testData = { id: '123' };
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result: ApiResponse<any>) => {
          expect(result.metadata?.timestamp).toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
          );
          done();
        },
      });
    });

    it('debe preservar metadata adicional existente', (done) => {
      const testData = {
        data: { id: '123' },
        metadata: {
          total: 100,
          page: 1,
          timestamp: '2025-11-12T10:30:00.000Z',
        },
      };
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result: ApiResponse<any>) => {
          expect(result.metadata?.total).toBe(100);
          expect(result.metadata?.page).toBe(1);
          expect(result.metadata?.timestamp).toBe('2025-11-12T10:30:00.000Z');
          done();
        },
      });
    });
  });

  describe('Respuestas paginadas', () => {
    it('debe manejar correctamente respuestas paginadas', (done) => {
      const testData = {
        data: [{ id: '1' }, { id: '2' }],
        metadata: {
          total: 50,
          page: 1,
          limit: 10,
          totalPages: 5,
          timestamp: '2025-11-12T10:30:00.000Z',
        },
      };
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result: ApiResponse<any>) => {
          expect(result.data).toEqual([{ id: '1' }, { id: '2' }]);
          expect(result.metadata?.total).toBe(50);
          expect(result.metadata?.page).toBe(1);
          expect(result.metadata?.limit).toBe(10);
          expect(result.metadata?.totalPages).toBe(5);
          done();
        },
      });
    });
  });

  describe('Respuestas con message opcional', () => {
    it('debe preservar message si existe', (done) => {
      const testData = {
        data: { id: '123' },
        metadata: {
          timestamp: '2025-11-12T10:30:00.000Z',
        },
        message: 'Operación exitosa',
      };
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result: ApiResponse<any>) => {
          expect(result.message).toBe('Operación exitosa');
          done();
        },
      });
    });
  });

  describe('Edge cases', () => {
    it('debe manejar objeto vacío', (done) => {
      const testData = {};
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result: ApiResponse<any>) => {
          expect(result).toHaveProperty('data');
          expect(result.data).toEqual({});
          expect(result).toHaveProperty('metadata');
          done();
        },
      });
    });

    it('debe manejar array vacío', (done) => {
      const testData: any[] = [];
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result: ApiResponse<any>) => {
          expect(result).toHaveProperty('data');
          expect(result.data).toEqual([]);
          expect(Array.isArray(result.data)).toBe(true);
          done();
        },
      });
    });

    it('debe manejar objetos anidados complejos', (done) => {
      const testData = {
        user: {
          id: '123',
          profile: {
            nombre: 'Juan',
            edad: 30,
            direcciones: [
              { calle: 'Principal', numero: 123 },
              { calle: 'Secundaria', numero: 456 },
            ],
          },
        },
      };
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result: ApiResponse<any>) => {
          expect(result.data).toEqual(testData);
          expect(result.data.user.profile.direcciones).toHaveLength(2);
          done();
        },
      });
    });
  });
});
