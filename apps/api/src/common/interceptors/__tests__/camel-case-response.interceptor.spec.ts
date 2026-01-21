/**
 * Tests para CamelCaseResponseInterceptor
 *
 * Verifica que el interceptor:
 * 1. Transforma snake_case → camelCase en objetos simples
 * 2. Transforma recursivamente objetos anidados
 * 3. Transforma arrays de objetos
 * 4. Preserva null y undefined sin modificar
 * 5. Preserva primitivos (string, number, boolean)
 * 6. No rompe objetos que ya están en camelCase
 */

import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { CamelCaseResponseInterceptor } from '../camel-case-response.interceptor';

describe('CamelCaseResponseInterceptor', () => {
  let interceptor: CamelCaseResponseInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new CamelCaseResponseInterceptor();
    mockExecutionContext = {} as ExecutionContext;
  });

  describe('Transformación snake_case → camelCase', () => {
    it('debe transformar objeto simple snake_case a camelCase', (done) => {
      const testData = {
        id: '123',
        nivel_escolar: 'PRIMARIA',
        foto_url: 'https://example.com/photo.jpg',
        created_at: '2025-01-01T00:00:00Z',
      };
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          const transformed = result as Record<string, unknown>;
          expect(transformed).toHaveProperty('id', '123');
          expect(transformed).toHaveProperty('nivelEscolar', 'PRIMARIA');
          expect(transformed).toHaveProperty(
            'fotoUrl',
            'https://example.com/photo.jpg',
          );
          expect(transformed).toHaveProperty(
            'createdAt',
            '2025-01-01T00:00:00Z',
          );
          // Verificar que NO tiene las keys originales snake_case
          expect(transformed).not.toHaveProperty('nivel_escolar');
          expect(transformed).not.toHaveProperty('foto_url');
          expect(transformed).not.toHaveProperty('created_at');
          done();
        },
      });
    });

    it('debe transformar objetos anidados recursivamente', (done) => {
      const testData = {
        estudiante: {
          id: '123',
          nombre_completo: 'Juan Pérez',
          tutor: {
            id: '456',
            correo_electronico: 'tutor@example.com',
            numero_telefono: '+54911234567',
          },
        },
      };
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          const transformed = result as Record<string, Record<string, unknown>>;
          expect(transformed.estudiante).toHaveProperty(
            'nombreCompleto',
            'Juan Pérez',
          );
          const tutor = transformed.estudiante.tutor as Record<string, unknown>;
          expect(tutor).toHaveProperty(
            'correoElectronico',
            'tutor@example.com',
          );
          expect(tutor).toHaveProperty('numeroTelefono', '+54911234567');
          done();
        },
      });
    });

    it('debe transformar arrays de objetos', (done) => {
      const testData = [
        {
          id: '1',
          nombre_completo: 'Usuario 1',
          fecha_nacimiento: '2010-01-01',
        },
        {
          id: '2',
          nombre_completo: 'Usuario 2',
          fecha_nacimiento: '2011-02-02',
        },
        {
          id: '3',
          nombre_completo: 'Usuario 3',
          fecha_nacimiento: '2012-03-03',
        },
      ];
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          const transformed = result as Array<Record<string, unknown>>;
          expect(Array.isArray(transformed)).toBe(true);
          expect(transformed).toHaveLength(3);
          transformed.forEach((item, index) => {
            expect(item).toHaveProperty(
              'nombreCompleto',
              `Usuario ${index + 1}`,
            );
            expect(item).toHaveProperty('fechaNacimiento');
            expect(item).not.toHaveProperty('nombre_completo');
            expect(item).not.toHaveProperty('fecha_nacimiento');
          });
          done();
        },
      });
    });

    it('debe transformar objetos con arrays anidados', (done) => {
      const testData = {
        clase_grupo: {
          id: 'cg1',
          nombre_publico: 'Matemáticas Avanzadas',
          estudiantes_inscritos: [
            { id: 'e1', nivel_escolar: 'SECUNDARIA' },
            { id: 'e2', nivel_escolar: 'PRIMARIA' },
          ],
        },
      };
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          const transformed = result as Record<string, Record<string, unknown>>;
          expect(transformed).toHaveProperty('claseGrupo');
          expect(transformed.claseGrupo).toHaveProperty(
            'nombrePublico',
            'Matemáticas Avanzadas',
          );
          expect(transformed.claseGrupo).toHaveProperty('estudiantesInscritos');
          const estudiantes = transformed.claseGrupo
            .estudiantesInscritos as Array<Record<string, unknown>>;
          expect(estudiantes[0]).toHaveProperty('nivelEscolar', 'SECUNDARIA');
          expect(estudiantes[1]).toHaveProperty('nivelEscolar', 'PRIMARIA');
          done();
        },
      });
    });
  });

  describe('Preservación de null y undefined', () => {
    it('debe preservar null sin modificar', (done) => {
      mockCallHandler = {
        handle: () => of(null),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toBeNull();
          done();
        },
      });
    });

    it('debe preservar undefined sin modificar', (done) => {
      mockCallHandler = {
        handle: () => of(undefined),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toBeUndefined();
          done();
        },
      });
    });

    it('debe preservar campos null dentro de objetos', (done) => {
      const testData = {
        id: '123',
        foto_url: null,
        biografia_corta: null,
      };
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          const transformed = result as Record<string, unknown>;
          expect(transformed).toHaveProperty('fotoUrl', null);
          expect(transformed).toHaveProperty('biografiaCorta', null);
          done();
        },
      });
    });
  });

  describe('Preservación de primitivos', () => {
    it('debe preservar strings sin modificar', (done) => {
      const testData = 'test_string_value';
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toBe('test_string_value');
          done();
        },
      });
    });

    it('debe preservar numbers sin modificar', (done) => {
      const testData = 42;
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toBe(42);
          done();
        },
      });
    });

    it('debe preservar booleans sin modificar', (done) => {
      const testData = true;
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toBe(true);
          done();
        },
      });
    });
  });

  describe('Compatibilidad con camelCase existente', () => {
    it('no debe romper objetos que ya están en camelCase', (done) => {
      const testData = {
        id: '123',
        nombreCompleto: 'Juan Pérez',
        correoElectronico: 'juan@example.com',
        esActivo: true,
      };
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          const transformed = result as Record<string, unknown>;
          expect(transformed).toHaveProperty('id', '123');
          expect(transformed).toHaveProperty('nombreCompleto', 'Juan Pérez');
          expect(transformed).toHaveProperty(
            'correoElectronico',
            'juan@example.com',
          );
          expect(transformed).toHaveProperty('esActivo', true);
          done();
        },
      });
    });

    it('debe manejar mezcla de snake_case y camelCase', (done) => {
      const testData = {
        id: '123',
        nombreCompleto: 'Juan Pérez', // camelCase
        fecha_nacimiento: '2010-01-01', // snake_case
        esActivo: true, // camelCase
        nivel_escolar: 'PRIMARIA', // snake_case
      };
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          const transformed = result as Record<string, unknown>;
          expect(transformed).toHaveProperty('nombreCompleto', 'Juan Pérez');
          expect(transformed).toHaveProperty('fechaNacimiento', '2010-01-01');
          expect(transformed).toHaveProperty('esActivo', true);
          expect(transformed).toHaveProperty('nivelEscolar', 'PRIMARIA');
          // No debe tener snake_case
          expect(transformed).not.toHaveProperty('fecha_nacimiento');
          expect(transformed).not.toHaveProperty('nivel_escolar');
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
        next: (result) => {
          expect(result).toEqual({});
          done();
        },
      });
    });

    it('debe manejar array vacío', (done) => {
      const testData: unknown[] = [];
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toEqual([]);
          expect(Array.isArray(result)).toBe(true);
          done();
        },
      });
    });

    it('debe manejar keys con doble underscore', (done) => {
      const testData = {
        id: '123',
        __v: 0, // MongoDB version key
        _id: 'mongo_id',
        created_at_utc: '2025-01-01T00:00:00Z',
      };
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          const transformed = result as Record<string, unknown>;
          expect(transformed).toHaveProperty('createdAtUtc');
          done();
        },
      });
    });

    it('debe preservar valores de Date objects', (done) => {
      const dateValue = new Date('2025-01-01T00:00:00Z');
      const testData = {
        id: '123',
        created_at: dateValue,
      };
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          const transformed = result as Record<string, unknown>;
          expect(transformed).toHaveProperty('createdAt');
          // El valor debe ser preservado (camelcase-keys preserva tipos)
          expect(transformed.createdAt).toEqual(dateValue);
          done();
        },
      });
    });

    it('debe manejar estructura de respuesta paginada de Prisma', (done) => {
      const testData = {
        items: [
          { id: '1', nivel_escolar: 'PRIMARIA', casa_id: 'quantum' },
          { id: '2', nivel_escolar: 'SECUNDARIA', casa_id: 'vertex' },
        ],
        total_count: 100,
        has_next_page: true,
        next_cursor: 'cursor_abc',
      };
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          const transformed = result as Record<string, unknown>;
          expect(transformed).toHaveProperty('totalCount', 100);
          expect(transformed).toHaveProperty('hasNextPage', true);
          expect(transformed).toHaveProperty('nextCursor', 'cursor_abc');
          const items = transformed.items as Array<Record<string, unknown>>;
          expect(items[0]).toHaveProperty('nivelEscolar', 'PRIMARIA');
          expect(items[0]).toHaveProperty('casaId', 'quantum');
          done();
        },
      });
    });
  });

  describe('Integración con estructura de estudiantes', () => {
    it('debe transformar respuesta típica de GET /estudiantes', (done) => {
      // Simula lo que Prisma devuelve
      const testData = {
        id: 'est123',
        nombre_completo: 'María García',
        nivel_escolar: 'PRIMARIA',
        grado_escolar: '5to',
        foto_url: 'https://storage.com/photos/maria.jpg',
        fecha_nacimiento: '2014-05-15',
        es_activo: true,
        puntos_xp: 1500,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-15T00:00:00Z',
        tutor: {
          id: 'tut456',
          nombre_completo: 'Roberto García',
          correo_electronico: 'roberto@example.com',
          numero_telefono: '+54911234567',
        },
        casa: {
          id: 'quantum',
          nombre: 'Quantum',
          color_primario: '#00d4ff',
        },
      };
      mockCallHandler = {
        handle: () => of(testData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          const transformed = result as Record<string, unknown>;

          // Verificar campos principales
          expect(transformed).toHaveProperty('nombreCompleto', 'María García');
          expect(transformed).toHaveProperty('nivelEscolar', 'PRIMARIA');
          expect(transformed).toHaveProperty('gradoEscolar', '5to');
          expect(transformed).toHaveProperty('fotoUrl');
          expect(transformed).toHaveProperty('fechaNacimiento');
          expect(transformed).toHaveProperty('esActivo', true);
          expect(transformed).toHaveProperty('puntosXp', 1500);
          expect(transformed).toHaveProperty('createdAt');
          expect(transformed).toHaveProperty('updatedAt');

          // Verificar tutor anidado
          const tutor = transformed.tutor as Record<string, unknown>;
          expect(tutor).toHaveProperty('nombreCompleto', 'Roberto García');
          expect(tutor).toHaveProperty(
            'correoElectronico',
            'roberto@example.com',
          );
          expect(tutor).toHaveProperty('numeroTelefono', '+54911234567');

          // Verificar casa anidada
          const casa = transformed.casa as Record<string, unknown>;
          expect(casa).toHaveProperty('colorPrimario', '#00d4ff');

          // Verificar que NO tiene snake_case
          expect(transformed).not.toHaveProperty('nombre_completo');
          expect(transformed).not.toHaveProperty('nivel_escolar');
          expect(transformed).not.toHaveProperty('created_at');

          done();
        },
      });
    });
  });
});
