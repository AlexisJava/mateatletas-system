/**
 * ============================================================================
 * UNIT TESTS - AulaEventsListener
 * ============================================================================
 *
 * Tests unitarios para el listener de eventos del Aula Virtual.
 * Se mockean todas las dependencias (PrismaService, RecursosService, etc.)
 *
 * Eventos testeados:
 * - leccion.completada
 * - tarea.completada
 * - tarea.perfecta
 * - clase.completada
 * - planificacion.completada
 *
 * Métodos privados testeados indirectamente:
 * - verificarClaseCompletada
 * - verificarPlanificacionCompletada
 * - verificarLogros*
 * - crearEntradaFeed
 */

import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AulaEventsListener } from '../aula-events.listener';
import { RecursosService } from '../../services/recursos.service';
import { LogrosService } from '../../services/logros.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { TipoActividadFeed } from '@prisma/client';

describe('AulaEventsListener', () => {
  let listener: AulaEventsListener;
  let recursosService: jest.Mocked<RecursosService>;
  let logrosService: jest.Mocked<LogrosService>;
  let prisma: jest.Mocked<PrismaService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  // ============================================================================
  // Mock Data
  // ============================================================================
  const mockEstudianteId = 'est-123';
  const mockClaseId = 'clase-456';
  const mockPlanificacionId = 'plan-789';
  const mockAsignacionId = 'asig-101';
  const mockTareaAsignadaId = 'tarea-202';

  const mockLeccionCompletadaEvent = {
    estudianteId: mockEstudianteId,
    tipo: 'teoria' as const,
    claseId: mockClaseId,
    claseTitulo: 'Clase de Álgebra',
    claseNumero: 1,
    planificacionId: mockPlanificacionId,
    planificacionTitulo: 'Matemáticas Básicas',
    asignacionId: mockAsignacionId,
    tiempoSegundos: 600,
    xpBase: 50,
    xpBonus: 10,
    xpTotal: 60,
  };

  const mockTareaCompletadaEvent = {
    estudianteId: mockEstudianteId,
    tareaAsignadaId: mockTareaAsignadaId,
    tareaTitulo: 'Ejercicios de suma',
    claseTitulo: 'Clase de Álgebra',
    planificacionTitulo: 'Matemáticas Básicas',
    obligatoria: true,
    tiempoSegundos: 300,
    calificacion: 85,
    entregadoATiempo: true,
    xpBase: 30,
    xpBonusCalificacion: 10,
    xpBonusTiempo: 5,
    xpTotal: 45,
  };

  const mockClaseCompletadaEvent = {
    estudianteId: mockEstudianteId,
    claseId: mockClaseId,
    claseTitulo: 'Clase de Álgebra',
    claseNumero: 1,
    planificacionId: mockPlanificacionId,
    planificacionTitulo: 'Matemáticas Básicas',
    asignacionId: mockAsignacionId,
    tiempoTotalSegundos: 1200,
    xpBonus: 50,
  };

  const mockPlanificacionCompletadaEvent = {
    estudianteId: mockEstudianteId,
    planificacionId: mockPlanificacionId,
    planificacionTitulo: 'Matemáticas Básicas',
    asignacionId: mockAsignacionId,
    totalClases: 4,
    tiempoTotalSegundos: 4800,
    xpTotal: 200,
  };

  // ============================================================================
  // Setup
  // ============================================================================
  beforeEach(async () => {
    // Create mocks
    const mockRecursosService = {
      agregarXP: jest.fn().mockResolvedValue(undefined),
    };

    const mockLogrosService = {
      desbloquearLogro: jest.fn().mockResolvedValue(undefined),
    };

    const mockPrismaService = {
      progresoClaseEstudiante: {
        findUnique: jest.fn(),
        count: jest.fn(),
      },
      progresoTareaEstudiante: {
        count: jest.fn(),
      },
      clasePlanificacion: {
        findUnique: jest.fn(),
      },
      planificacion: {
        findUnique: jest.fn(),
      },
      asignacionPlanificacion: {
        findFirst: jest.fn(),
      },
      actividadFeed: {
        create: jest.fn(),
      },
      estudiante: {
        findUnique: jest.fn(),
      },
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AulaEventsListener,
        { provide: RecursosService, useValue: mockRecursosService },
        { provide: LogrosService, useValue: mockLogrosService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    listener = module.get<AulaEventsListener>(AulaEventsListener);
    recursosService = module.get(RecursosService);
    logrosService = module.get(LogrosService);
    prisma = module.get(PrismaService);
    eventEmitter = module.get(EventEmitter2);
  });

  // ============================================================================
  // TESTS: handleLeccionCompletada
  // ============================================================================
  describe('handleLeccionCompletada', () => {
    beforeEach(() => {
      // Default: clase no completada aún
      (
        prisma.progresoClaseEstudiante.findUnique as jest.Mock
      ).mockResolvedValue({
        teoria_completada: true,
        practica_completada: false,
        tiempo_teoria_segundos: 600,
        tiempo_practica_segundos: 0,
      });
      (prisma.progresoClaseEstudiante.count as jest.Mock).mockResolvedValue(1);
    });

    it('should_agregar_xp_when_leccion_completada', async () => {
      // Act
      await listener.handleLeccionCompletada(mockLeccionCompletadaEvent);

      // Assert
      expect(recursosService.agregarXP).toHaveBeenCalledWith(
        mockEstudianteId,
        60, // xpTotal
        expect.stringContaining('Teoría completada'),
        expect.objectContaining({
          tipo: 'teoria',
          claseId: mockClaseId,
        }),
      );
    });

    it('should_verificar_logros_teoria_when_tipo_teoria', async () => {
      // Act
      await listener.handleLeccionCompletada(mockLeccionCompletadaEvent);

      // Assert
      expect(logrosService.desbloquearLogro).toHaveBeenCalledWith(
        mockEstudianteId,
        'PRIMERA_LECCION_TEORIA',
      );
    });

    it('should_verificar_logros_practica_when_tipo_practica', async () => {
      // Arrange
      const eventPractica = {
        ...mockLeccionCompletadaEvent,
        tipo: 'practica' as const,
      };

      // Act
      await listener.handleLeccionCompletada(eventPractica);

      // Assert
      expect(logrosService.desbloquearLogro).toHaveBeenCalledWith(
        mockEstudianteId,
        'PRIMERA_LECCION_PRACTICA',
      );
    });

    it('should_emit_clase_completada_when_both_teoria_and_practica_done', async () => {
      // Arrange - Clase completamente terminada
      (
        prisma.progresoClaseEstudiante.findUnique as jest.Mock
      ).mockResolvedValue({
        teoria_completada: true,
        practica_completada: true,
        tiempo_teoria_segundos: 600,
        tiempo_practica_segundos: 400,
      });
      (prisma.clasePlanificacion.findUnique as jest.Mock).mockResolvedValue({
        id: mockClaseId,
        titulo: 'Clase de Álgebra',
        numero: 1,
        planificacion: {
          id: mockPlanificacionId,
          titulo: 'Matemáticas Básicas',
        },
      });
      (prisma.asignacionPlanificacion.findFirst as jest.Mock).mockResolvedValue(
        {
          id: mockAsignacionId,
        },
      );

      // Act
      await listener.handleLeccionCompletada(mockLeccionCompletadaEvent);

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'clase.completada',
        expect.objectContaining({
          estudianteId: mockEstudianteId,
          claseId: mockClaseId,
          xpBonus: 50,
        }),
      );
    });

    it('should_not_emit_clase_completada_when_only_teoria_done', async () => {
      // Arrange - Solo teoría completada
      (
        prisma.progresoClaseEstudiante.findUnique as jest.Mock
      ).mockResolvedValue({
        teoria_completada: true,
        practica_completada: false,
      });

      // Act
      await listener.handleLeccionCompletada(mockLeccionCompletadaEvent);

      // Assert
      expect(eventEmitter.emit).not.toHaveBeenCalledWith(
        'clase.completada',
        expect.anything(),
      );
    });

    it('should_desbloquear_logro_diez_lecciones_when_count_gte_10', async () => {
      // Arrange
      (prisma.progresoClaseEstudiante.count as jest.Mock).mockResolvedValue(10);

      // Act
      await listener.handleLeccionCompletada(mockLeccionCompletadaEvent);

      // Assert
      expect(logrosService.desbloquearLogro).toHaveBeenCalledWith(
        mockEstudianteId,
        'DIEZ_LECCIONES',
      );
    });

    it('should_handle_error_gracefully_without_throwing', async () => {
      // Arrange
      (recursosService.agregarXP as jest.Mock).mockRejectedValue(
        new Error('DB Error'),
      );

      // Act & Assert - No debe lanzar error
      await expect(
        listener.handleLeccionCompletada(mockLeccionCompletadaEvent),
      ).resolves.not.toThrow();
    });
  });

  // ============================================================================
  // TESTS: handleTareaCompletada
  // ============================================================================
  describe('handleTareaCompletada', () => {
    beforeEach(() => {
      (prisma.progresoTareaEstudiante.count as jest.Mock).mockResolvedValue(1);
      (prisma.estudiante.findUnique as jest.Mock).mockResolvedValue({
        casaId: 'casa-123',
        nombre: 'Juan',
        apellido: 'Pérez',
      });
      (prisma.actividadFeed.create as jest.Mock).mockResolvedValue({});
    });

    it('should_agregar_xp_when_tarea_completada', async () => {
      // Act
      await listener.handleTareaCompletada(mockTareaCompletadaEvent);

      // Assert
      expect(recursosService.agregarXP).toHaveBeenCalledWith(
        mockEstudianteId,
        45, // xpTotal
        expect.stringContaining('Tarea completada'),
        expect.objectContaining({
          tareaAsignadaId: mockTareaAsignadaId,
          calificacion: 85,
        }),
      );
    });

    it('should_desbloquear_primera_tarea_completada', async () => {
      // Act
      await listener.handleTareaCompletada(mockTareaCompletadaEvent);

      // Assert
      expect(logrosService.desbloquearLogro).toHaveBeenCalledWith(
        mockEstudianteId,
        'PRIMERA_TAREA_COMPLETADA',
      );
    });

    it('should_desbloquear_tarea_a_tiempo_when_entregada_a_tiempo', async () => {
      // Act
      await listener.handleTareaCompletada(mockTareaCompletadaEvent);

      // Assert
      expect(logrosService.desbloquearLogro).toHaveBeenCalledWith(
        mockEstudianteId,
        'TAREA_A_TIEMPO',
      );
    });

    it('should_desbloquear_tarea_obligatoria_when_obligatoria', async () => {
      // Act
      await listener.handleTareaCompletada(mockTareaCompletadaEvent);

      // Assert
      expect(logrosService.desbloquearLogro).toHaveBeenCalledWith(
        mockEstudianteId,
        'TAREA_OBLIGATORIA_COMPLETADA',
      );
    });

    it('should_crear_entrada_feed_with_correct_tipo', async () => {
      // Act
      await listener.handleTareaCompletada(mockTareaCompletadaEvent);

      // Assert
      expect(prisma.actividadFeed.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            estudiante_id: mockEstudianteId,
            tipo: TipoActividadFeed.TAREA_COMPLETADA,
            xp_ganado: 45,
          }),
        }),
      );
    });

    it('should_emit_tarea_perfecta_when_calificacion_100', async () => {
      // Arrange
      const eventPerfecta = { ...mockTareaCompletadaEvent, calificacion: 100 };

      // Act
      await listener.handleTareaCompletada(eventPerfecta);

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'tarea.perfecta',
        expect.objectContaining({
          estudianteId: mockEstudianteId,
          xpBonus: 20,
        }),
      );
    });

    it('should_not_emit_tarea_perfecta_when_calificacion_below_100', async () => {
      // Act
      await listener.handleTareaCompletada(mockTareaCompletadaEvent); // calificacion: 85

      // Assert
      expect(eventEmitter.emit).not.toHaveBeenCalledWith(
        'tarea.perfecta',
        expect.anything(),
      );
    });

    it('should_desbloquear_diez_tareas_when_count_gte_10', async () => {
      // Arrange
      (prisma.progresoTareaEstudiante.count as jest.Mock).mockResolvedValue(10);

      // Act
      await listener.handleTareaCompletada(mockTareaCompletadaEvent);

      // Assert
      expect(logrosService.desbloquearLogro).toHaveBeenCalledWith(
        mockEstudianteId,
        'DIEZ_TAREAS',
      );
    });
  });

  // ============================================================================
  // TESTS: handleTareaPerfecta
  // ============================================================================
  describe('handleTareaPerfecta', () => {
    const mockTareaPerfectaEvent = {
      estudianteId: mockEstudianteId,
      tareaAsignadaId: mockTareaAsignadaId,
      tareaTitulo: 'Ejercicios de suma',
      claseTitulo: 'Clase de Álgebra',
      planificacionTitulo: 'Matemáticas Básicas',
      xpBonus: 20,
    };

    beforeEach(() => {
      (prisma.progresoTareaEstudiante.count as jest.Mock).mockResolvedValue(1);
      (prisma.estudiante.findUnique as jest.Mock).mockResolvedValue({
        casaId: 'casa-123',
      });
      (prisma.actividadFeed.create as jest.Mock).mockResolvedValue({});
    });

    it('should_agregar_xp_bonus_for_tarea_perfecta', async () => {
      // Act
      await listener.handleTareaPerfecta(mockTareaPerfectaEvent);

      // Assert
      expect(recursosService.agregarXP).toHaveBeenCalledWith(
        mockEstudianteId,
        20,
        expect.stringContaining('Bonus tarea perfecta'),
        expect.objectContaining({
          tipo: 'tarea_perfecta',
        }),
      );
    });

    it('should_crear_entrada_feed_tarea_perfecta', async () => {
      // Act
      await listener.handleTareaPerfecta(mockTareaPerfectaEvent);

      // Assert
      expect(prisma.actividadFeed.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tipo: TipoActividadFeed.TAREA_PERFECTA,
          }),
        }),
      );
    });

    it('should_desbloquear_tres_tareas_perfectas_when_count_gte_3', async () => {
      // Arrange
      (prisma.progresoTareaEstudiante.count as jest.Mock).mockResolvedValue(3);

      // Act
      await listener.handleTareaPerfecta(mockTareaPerfectaEvent);

      // Assert
      expect(logrosService.desbloquearLogro).toHaveBeenCalledWith(
        mockEstudianteId,
        'TRES_TAREAS_PERFECTAS',
      );
    });

    it('should_desbloquear_diez_tareas_perfectas_when_count_gte_10', async () => {
      // Arrange
      (prisma.progresoTareaEstudiante.count as jest.Mock).mockResolvedValue(10);

      // Act
      await listener.handleTareaPerfecta(mockTareaPerfectaEvent);

      // Assert
      expect(logrosService.desbloquearLogro).toHaveBeenCalledWith(
        mockEstudianteId,
        'DIEZ_TAREAS_PERFECTAS',
      );
    });
  });

  // ============================================================================
  // TESTS: handleClaseCompletada
  // ============================================================================
  describe('handleClaseCompletada', () => {
    beforeEach(() => {
      (prisma.progresoClaseEstudiante.count as jest.Mock).mockResolvedValue(1);
      (prisma.progresoClaseEstudiante.findMany as jest.Mock) = jest
        .fn()
        .mockResolvedValue([]);
      (prisma.planificacion.findUnique as jest.Mock).mockResolvedValue({
        id: mockPlanificacionId,
        clases: [{ id: mockClaseId }],
      });
      (prisma.estudiante.findUnique as jest.Mock).mockResolvedValue({
        casaId: 'casa-123',
      });
      (prisma.actividadFeed.create as jest.Mock).mockResolvedValue({});
    });

    it('should_agregar_xp_bonus_for_clase_completada', async () => {
      // Act
      await listener.handleClaseCompletada(mockClaseCompletadaEvent);

      // Assert
      expect(recursosService.agregarXP).toHaveBeenCalledWith(
        mockEstudianteId,
        50,
        expect.stringContaining('Clase completada'),
        expect.objectContaining({
          tipo: 'clase_completada',
          claseId: mockClaseId,
        }),
      );
    });

    it('should_crear_entrada_feed_clase_completada', async () => {
      // Act
      await listener.handleClaseCompletada(mockClaseCompletadaEvent);

      // Assert
      expect(prisma.actividadFeed.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tipo: TipoActividadFeed.CLASE_COMPLETADA,
          }),
        }),
      );
    });

    it('should_desbloquear_primera_clase_completada', async () => {
      // Act
      await listener.handleClaseCompletada(mockClaseCompletadaEvent);

      // Assert
      expect(logrosService.desbloquearLogro).toHaveBeenCalledWith(
        mockEstudianteId,
        'PRIMERA_CLASE_COMPLETADA',
      );
    });

    it('should_desbloquear_cinco_clases_when_count_gte_5', async () => {
      // Arrange
      (prisma.progresoClaseEstudiante.count as jest.Mock).mockResolvedValue(5);

      // Act
      await listener.handleClaseCompletada(mockClaseCompletadaEvent);

      // Assert
      expect(logrosService.desbloquearLogro).toHaveBeenCalledWith(
        mockEstudianteId,
        'CINCO_CLASES_COMPLETADAS',
      );
    });

    it('should_emit_planificacion_completada_when_all_clases_done', async () => {
      // Arrange - Todas las clases completadas
      (prisma.planificacion.findUnique as jest.Mock).mockResolvedValue({
        id: mockPlanificacionId,
        clases: [{ id: 'clase-1' }, { id: 'clase-2' }],
      });
      (prisma.progresoClaseEstudiante.findMany as jest.Mock) = jest
        .fn()
        .mockResolvedValue([
          {
            clase_id: 'clase-1',
            teoria_completada: true,
            practica_completada: true,
            tiempo_teoria_segundos: 300,
            tiempo_practica_segundos: 300,
          },
          {
            clase_id: 'clase-2',
            teoria_completada: true,
            practica_completada: true,
            tiempo_teoria_segundos: 300,
            tiempo_practica_segundos: 300,
          },
        ]);

      // Act
      await listener.handleClaseCompletada(mockClaseCompletadaEvent);

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'planificacion.completada',
        expect.objectContaining({
          estudianteId: mockEstudianteId,
          planificacionId: mockPlanificacionId,
          xpTotal: 200,
        }),
      );
    });

    it('should_not_emit_planificacion_completada_when_clases_pending', async () => {
      // Arrange - No todas las clases completadas
      (prisma.planificacion.findUnique as jest.Mock).mockResolvedValue({
        id: mockPlanificacionId,
        clases: [{ id: 'clase-1' }, { id: 'clase-2' }],
      });
      (prisma.progresoClaseEstudiante.findMany as jest.Mock) = jest
        .fn()
        .mockResolvedValue([
          {
            clase_id: 'clase-1',
            teoria_completada: true,
            practica_completada: true,
          },
          // clase-2 no tiene progreso
        ]);

      // Act
      await listener.handleClaseCompletada(mockClaseCompletadaEvent);

      // Assert
      expect(eventEmitter.emit).not.toHaveBeenCalledWith(
        'planificacion.completada',
        expect.anything(),
      );
    });
  });

  // ============================================================================
  // TESTS: handlePlanificacionCompletada
  // ============================================================================
  describe('handlePlanificacionCompletada', () => {
    beforeEach(() => {
      (prisma.estudiante.findUnique as jest.Mock).mockResolvedValue({
        casaId: 'casa-123',
      });
      (prisma.actividadFeed.create as jest.Mock).mockResolvedValue({});
    });

    it('should_agregar_xp_grande_for_planificacion_completada', async () => {
      // Act
      await listener.handlePlanificacionCompletada(
        mockPlanificacionCompletadaEvent,
      );

      // Assert
      expect(recursosService.agregarXP).toHaveBeenCalledWith(
        mockEstudianteId,
        200,
        expect.stringContaining('Planificación completada'),
        expect.objectContaining({
          tipo: 'planificacion_completada',
          planificacionId: mockPlanificacionId,
        }),
      );
    });

    it('should_crear_entrada_feed_planificacion_completada', async () => {
      // Act
      await listener.handlePlanificacionCompletada(
        mockPlanificacionCompletadaEvent,
      );

      // Assert
      expect(prisma.actividadFeed.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tipo: TipoActividadFeed.PLANIFICACION_COMPLETADA,
            xp_ganado: 200,
          }),
        }),
      );
    });

    it('should_desbloquear_primera_planificacion_completada', async () => {
      // Act
      await listener.handlePlanificacionCompletada(
        mockPlanificacionCompletadaEvent,
      );

      // Assert
      expect(logrosService.desbloquearLogro).toHaveBeenCalledWith(
        mockEstudianteId,
        'PRIMERA_PLANIFICACION_COMPLETADA',
      );
    });

    it('should_try_to_desbloquear_badge_especifico_then_generico', async () => {
      // Arrange - El badge específico falla
      (logrosService.desbloquearLogro as jest.Mock)
        .mockResolvedValueOnce(undefined) // PRIMERA_PLANIFICACION_COMPLETADA OK
        .mockRejectedValueOnce(new Error('Badge no existe')) // MAESTRO_* falla
        .mockResolvedValueOnce(undefined); // PLANIFICACION_COMPLETADA OK

      // Act
      await listener.handlePlanificacionCompletada(
        mockPlanificacionCompletadaEvent,
      );

      // Assert - Debe intentar el genérico como fallback
      expect(logrosService.desbloquearLogro).toHaveBeenCalledWith(
        mockEstudianteId,
        'PLANIFICACION_COMPLETADA',
      );
    });
  });

  // ============================================================================
  // TESTS: crearEntradaFeed (método privado, testeado indirectamente)
  // ============================================================================
  describe('crearEntradaFeed', () => {
    it('should_include_casa_id_from_estudiante', async () => {
      // Arrange
      (prisma.estudiante.findUnique as jest.Mock).mockResolvedValue({
        casaId: 'casa-especifica-123',
        nombre: 'Ana',
        apellido: 'García',
      });

      // Act
      await listener.handleTareaCompletada(mockTareaCompletadaEvent);

      // Assert
      expect(prisma.actividadFeed.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            casa_id: 'casa-especifica-123',
          }),
        }),
      );
    });

    it('should_handle_estudiante_without_casa', async () => {
      // Arrange
      (prisma.estudiante.findUnique as jest.Mock).mockResolvedValue({
        casaId: null,
        nombre: 'Sin',
        apellido: 'Casa',
      });

      // Act
      await listener.handleTareaCompletada(mockTareaCompletadaEvent);

      // Assert
      expect(prisma.actividadFeed.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            casa_id: null,
          }),
        }),
      );
    });
  });

  // ============================================================================
  // TESTS: Error Handling
  // ============================================================================
  describe('Error Handling', () => {
    it('should_not_throw_when_agregarXP_fails', async () => {
      // Arrange
      (recursosService.agregarXP as jest.Mock).mockRejectedValue(
        new Error('XP Error'),
      );

      // Act & Assert
      await expect(
        listener.handleLeccionCompletada(mockLeccionCompletadaEvent),
      ).resolves.not.toThrow();
    });

    it('should_not_throw_when_desbloquearLogro_fails', async () => {
      // Arrange
      (logrosService.desbloquearLogro as jest.Mock).mockRejectedValue(
        new Error('Logro no existe'),
      );

      // Act & Assert
      await expect(
        listener.handleTareaCompletada(mockTareaCompletadaEvent),
      ).resolves.not.toThrow();
    });

    it('should_not_throw_when_prisma_query_fails', async () => {
      // Arrange
      (
        prisma.progresoClaseEstudiante.findUnique as jest.Mock
      ).mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(
        listener.handleLeccionCompletada(mockLeccionCompletadaEvent),
      ).resolves.not.toThrow();
    });

    it('should_not_throw_when_actividadFeed_create_fails', async () => {
      // Arrange
      (prisma.actividadFeed.create as jest.Mock).mockRejectedValue(
        new Error('Feed Error'),
      );

      // Act & Assert
      await expect(
        listener.handleTareaCompletada(mockTareaCompletadaEvent),
      ).resolves.not.toThrow();
    });
  });
});
