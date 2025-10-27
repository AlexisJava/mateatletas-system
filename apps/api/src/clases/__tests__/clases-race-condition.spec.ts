import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ClasesReservasService } from '../services/clases-reservas.service';
import { PrismaService } from '../../core/database/prisma.service';

describe('ClasesReservasService - Race Condition Prevention', () => {
  let service: ClasesReservasService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClasesReservasService,
        {
          provide: PrismaService,
          useValue: {
            clase: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            estudiante: {
              findUnique: jest.fn(),
            },
            inscripcionClase: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClasesReservasService>(ClasesReservasService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('SECURITY: Prevent Overbooking with Concurrent Requests', () => {
    it('should prevent overbooking when 2 tutors reserve the last cupo simultaneously', async () => {
      // ✅ TEST QUE FALLARÁ con código actual
      // Simula el escenario:
      // - Clase tiene 10 cupos máximo, 9 ocupados (1 disponible)
      // - Tutor A y Tutor B intentan reservar simultáneamente

      const mockClase = {
        id: 'clase-123',
        nombre: 'Matemáticas Avanzadas',
        cupos_maximo: 10,
        cupos_ocupados: 9, // Solo 1 cupo disponible
        estado: 'Programada',
        fecha_hora_inicio: new Date(
          Date.now() + 24 * 60 * 60 * 1000,
        ).toISOString(), // Mañana
        producto_id: null,
        producto: null,
      };

      const mockEstudiante1 = {
        id: 'est-1',
        nombre: 'Juan',
        apellido: 'Perez',
        tutor_id: 'tutor-1',
        inscripciones_curso: [],
      };

      const mockEstudiante2 = {
        id: 'est-2',
        nombre: 'Maria',
        apellido: 'Garcia',
        tutor_id: 'tutor-2',
        inscripciones_curso: [],
      };

      // Mock: Primera lectura (fuera de transacción) - ambos ven 9 cupos ocupados
      let readCount = 0;
      (prisma.clase.findUnique as jest.Mock).mockImplementation(() => {
        readCount++;
        return Promise.resolve(mockClase as any);
      });

      // Mock: Estudiantes existen
      (prisma.estudiante.findUnique as jest.Mock)
        .mockImplementationOnce(() => Promise.resolve(mockEstudiante1 as any))
        .mockImplementationOnce(() => Promise.resolve(mockEstudiante2 as any));

      // Mock: No están inscritos previamente
      (prisma.inscripcionClase.findUnique as jest.Mock).mockResolvedValue(null);

      // Mock: Transacción simula ejecución secuencial
      let transactionCount = 0;
      (prisma.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
          transactionCount++;
          const txMock = {
            clase: {
              findUnique: jest.fn().mockResolvedValue({
                ...mockClase,
                cupos_ocupados: transactionCount === 1 ? 9 : 10, // Segunda transacción ve 10
              }),
              update: jest.fn().mockResolvedValue({
                ...mockClase,
                cupos_ocupados: transactionCount === 1 ? 10 : 11,
              }),
            },
            inscripcionClase: {
              findUnique: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue({
                id: `inscripcion-${transactionCount}`,
                clase_id: 'clase-123',
                estudiante_id: transactionCount === 1 ? 'est-1' : 'est-2',
                tutor_id: transactionCount === 1 ? 'tutor-1' : 'tutor-2',
              }),
            },
          };

          return callback(txMock as any);
        },
      );

      // Act: Simular 2 requests simultáneos
      const reserva1Promise = service.reservarClase('clase-123', 'tutor-1', {
        estudianteId: 'est-1',
      });

      const reserva2Promise = service.reservarClase('clase-123', 'tutor-2', {
        estudianteId: 'est-2',
      });

      const results = await Promise.allSettled([
        reserva1Promise,
        reserva2Promise,
      ]);

      // Assert: UNO debe tener éxito, el OTRO debe fallar
      const successes = results.filter((r) => r.status === 'fulfilled');
      const failures = results.filter((r) => r.status === 'rejected');

      // ✅ CON EL FIX: Exactamente 1 éxito, 1 fallo
      expect(successes.length).toBe(1);
      expect(failures.length).toBe(1);

      // El que falló debe ser por "clase llena"
      const failedResult = failures[0];
      expect(failedResult.reason).toBeInstanceOf(BadRequestException);
      expect(failedResult.reason.message).toContain('llena');
    });

    it('should handle 10 concurrent reservations with only 5 cupos available', async () => {
      // ✅ TEST: Estrés con múltiples requests
      const mockClase = {
        id: 'clase-456',
        nombre: 'Programación',
        cupos_maximo: 10,
        cupos_ocupados: 5, // 5 cupos disponibles
        estado: 'Programada',
        fecha_hora_inicio: new Date(
          Date.now() + 24 * 60 * 60 * 1000,
        ).toISOString(),
        producto_id: null,
        producto: null,
      };

      let currentCupos = 5;

      // Mock: Todos los estudiantes existen
      // ✅ El tutor_id debe coincidir con el tutor que hace la reserva
      // Estudiante est-0 pertenece a tutor-0, est-1 a tutor-1, etc.
      (prisma.estudiante.findUnique as jest.Mock).mockImplementation((args) => {
        const estudianteId = args.where.id;
        // Extraer el índice del estudiante (est-0 → 0, est-1 → 1, etc.)
        const index = estudianteId.split('-')[1];
        return Promise.resolve({
          id: estudianteId,
          nombre: 'Estudiante',
          apellido: `Test-${index}`,
          tutor_id: `tutor-${index}`, // ✅ Cada estudiante pertenece a su tutor correspondiente
          inscripciones_curso: [],
        } as any);
      });

      // Mock: Transacción con serialización (simula comportamiento de PostgreSQL)
      // ✅ PostgreSQL serializa transacciones para evitar race conditions
      // Usamos una cola de promesas para simular este comportamiento
      let transactionQueue = Promise.resolve();

      (prisma.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
          // ✅ Serializar transacciones: cada una espera a que la anterior termine
          return (transactionQueue = transactionQueue.then(async () => {
            // Leer cupos AL MOMENTO de ejecutar esta transacción (después de esperar)
            const cuposAtTransactionStart = currentCupos;

            const txMock = {
              clase: {
                // ✅ findUnique retorna el estado MÁS RECIENTE (después de esperar en la cola)
                findUnique: jest.fn().mockResolvedValue({
                  ...mockClase,
                  cupos_ocupados: cuposAtTransactionStart,
                }),
                update: jest.fn().mockImplementation(() => {
                  // Solo se llama si la validación pasó
                  currentCupos++;
                  return Promise.resolve({
                    ...mockClase,
                    cupos_ocupados: currentCupos,
                  });
                }),
              },
              inscripcionClase: {
                findUnique: jest.fn().mockResolvedValue(null),
                create: jest.fn().mockImplementation((data) => {
                  return Promise.resolve({
                    id: `inscripcion-${data.data.estudiante_id}`,
                    clase_id: 'clase-456',
                    estudiante_id: data.data.estudiante_id,
                    tutor_id: data.data.tutor_id,
                    estudiante: { nombre: 'Test', apellido: 'Student' },
                    clase: {
                      ...mockClase,
                      rutaCurricular: { nombre: 'Programación' },
                    },
                  });
                }),
              },
            };

            return callback(txMock as any);
          }));
        },
      );

      // Act: 10 reservas simultáneas (solo 5 deben tener éxito)
      const reservations = Array.from({ length: 10 }, (_, i) =>
        service.reservarClase('clase-456', `tutor-${i}`, {
          estudianteId: `est-${i}`,
        }),
      );

      const results = await Promise.allSettled(reservations);

      const successes = results.filter((r) => r.status === 'fulfilled');
      const failures = results.filter((r) => r.status === 'rejected');

      // Debug: Ver qué pasó
      if (successes.length !== 5 || failures.length !== 5) {
        console.log('DEBUG: successes =', successes.length);
        console.log('DEBUG: failures =', failures.length);
        console.log('DEBUG: currentCupos final =', currentCupos);
        failures.forEach((f, idx) => {
          if (f.status === 'rejected') {
            console.log(`Failure ${idx}:`, f.reason.message);
          }
        });
      }

      // ✅ Exactamente 5 éxitos (los 5 cupos disponibles)
      expect(successes.length).toBe(5);
      expect(failures.length).toBe(5);
    });
  });

  describe('REGRESSION: Existing Functionality Must Not Break', () => {
    it('should still create reservation successfully for valid requests', async () => {
      // ✅ Test de regresión: funcionalidad normal debe seguir funcionando
      const mockClase = {
        id: 'clase-789',
        nombre: 'Física',
        cupos_maximo: 20,
        cupos_ocupados: 5,
        estado: 'Programada',
        fecha_hora_inicio: new Date(Date.now() + 24 * 60 * 60 * 1000),
        producto_id: null,
        producto: null,
      };

      const mockEstudiante = {
        id: 'est-123',
        nombre: 'Pedro',
        apellido: 'Lopez',
        tutor_id: 'tutor-123',
        inscripciones_curso: [],
      };

      (prisma.clase.findUnique as jest.Mock).mockResolvedValue(
        mockClase as any,
      );
      (prisma.estudiante.findUnique as jest.Mock).mockResolvedValue(
        mockEstudiante as any,
      );
      (prisma.inscripcionClase.findUnique as jest.Mock).mockResolvedValue(null);

      (prisma.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
          const txMock = {
            clase: {
              findUnique: jest.fn().mockResolvedValue(mockClase),
              update: jest.fn().mockResolvedValue({
                ...mockClase,
                cupos_ocupados: 6,
              }),
            },
            inscripcionClase: {
              findUnique: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue({
                id: 'inscripcion-123',
                clase_id: 'clase-789',
                estudiante_id: 'est-123',
                tutor_id: 'tutor-123',
                estudiante: mockEstudiante,
                clase: {
                  ...mockClase,
                  rutaCurricular: { nombre: 'Ciencias' },
                },
              }),
            },
          };

          return callback(txMock);
        },
      );

      // Act
      const result = await service.reservarClase('clase-789', 'tutor-123', {
        estudianteId: 'est-123',
      });

      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('clase_id', 'clase-789');
      expect(result).toHaveProperty('estudiante_id', 'est-123');
    });
  });
});
