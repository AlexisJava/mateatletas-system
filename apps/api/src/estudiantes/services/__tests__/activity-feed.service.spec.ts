/**
 * ============================================================================
 * UNIT TESTS - ActivityFeedService
 * ============================================================================
 *
 * Tests unitarios para el servicio de Activity Feed.
 * Se mockea PrismaService para simular operaciones de DB.
 *
 * Métodos testeados:
 * - create() - Crear entrada en el feed
 * - getFeed() - Obtener feed con filtros y paginación
 * - addReaction() - Agregar reacción con emoji
 * - removeReaction() - Eliminar reacción
 * - getFeedByCasa() - Feed filtrado por casa
 * - getFeedByEstudiante() - Feed filtrado por estudiante
 * - agruparReacciones() - Método privado testeado indirectamente
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  ActivityFeedService,
  CreateActividadFeedDto,
} from '../activity-feed.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { TipoActividadFeed } from '@prisma/client';

describe('ActivityFeedService', () => {
  let service: ActivityFeedService;
  let prisma: jest.Mocked<PrismaService>;

  // ============================================================================
  // Mock Data
  // ============================================================================
  const mockEstudianteId = 'est-123';
  const mockCasaId = 'casa-456';
  const mockActividadId = 'act-789';

  const mockEstudiante = {
    id: mockEstudianteId,
    nombre: 'Juan',
    apellido: 'Pérez',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  const mockActividadFeed = {
    id: mockActividadId,
    estudiante_id: mockEstudianteId,
    tipo: TipoActividadFeed.TAREA_COMPLETADA,
    mensaje: 'completó una tarea',
    xp_ganado: 50,
    metadata: { tareaId: 'tarea-1' },
    creado_en: new Date('2026-01-08T10:00:00Z'),
    casa_id: mockCasaId,
    estudiante: mockEstudiante,
    reacciones: [],
    _count: { reacciones: 0 },
  };

  const mockActividadConReacciones = {
    ...mockActividadFeed,
    reacciones: [
      { emoji: '👏', estudiante_id: 'est-1' },
      { emoji: '👏', estudiante_id: 'est-2' },
      { emoji: '🔥', estudiante_id: 'est-1' },
      { emoji: '❤️', estudiante_id: 'est-3' },
    ],
    _count: { reacciones: 4 },
  };

  // ============================================================================
  // Setup
  // ============================================================================
  beforeEach(async () => {
    const mockPrismaService = {
      actividadFeed: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      },
      reaccionFeed: {
        upsert: jest.fn(),
        deleteMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityFeedService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ActivityFeedService>(ActivityFeedService);
    prisma = module.get(PrismaService);
  });

  // ============================================================================
  // TESTS: create()
  // ============================================================================
  describe('create', () => {
    const createDto: CreateActividadFeedDto = {
      estudianteId: mockEstudianteId,
      tipo: TipoActividadFeed.TAREA_COMPLETADA,
      mensaje: 'completó la tarea "Ejercicios de suma"',
      xpGanado: 50,
      metadata: { tareaId: 'tarea-1' },
      casaId: mockCasaId,
    };

    it('should_create_actividad_feed_with_all_fields', async () => {
      // Arrange
      (prisma.actividadFeed.create as jest.Mock).mockResolvedValue({
        ...mockActividadFeed,
        estudiante: mockEstudiante,
      });

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(prisma.actividadFeed.create).toHaveBeenCalledWith({
        data: {
          estudiante_id: mockEstudianteId,
          tipo: TipoActividadFeed.TAREA_COMPLETADA,
          mensaje: 'completó la tarea "Ejercicios de suma"',
          xp_ganado: 50,
          metadata: { tareaId: 'tarea-1' },
          casa_id: mockCasaId,
        },
        include: {
          estudiante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              avatarUrl: true,
            },
          },
        },
      });
      expect(result).toBeDefined();
    });

    it('should_create_actividad_with_default_xp_when_not_provided', async () => {
      // Arrange
      const dtoSinXp: CreateActividadFeedDto = {
        estudianteId: mockEstudianteId,
        tipo: TipoActividadFeed.LOGRO_DESBLOQUEADO,
        mensaje: 'desbloqueó un logro',
      };
      (prisma.actividadFeed.create as jest.Mock).mockResolvedValue(
        mockActividadFeed,
      );

      // Act
      await service.create(dtoSinXp);

      // Assert
      expect(prisma.actividadFeed.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            xp_ganado: 0,
            metadata: {},
          }),
        }),
      );
    });

    it('should_create_actividad_without_casa_id_when_not_provided', async () => {
      // Arrange
      const dtoSinCasa: CreateActividadFeedDto = {
        estudianteId: mockEstudianteId,
        tipo: TipoActividadFeed.NIVEL_SUBIDO,
        mensaje: 'subió de nivel',
      };
      (prisma.actividadFeed.create as jest.Mock).mockResolvedValue(
        mockActividadFeed,
      );

      // Act
      await service.create(dtoSinCasa);

      // Assert
      expect(prisma.actividadFeed.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            casa_id: undefined,
          }),
        }),
      );
    });
  });

  // ============================================================================
  // TESTS: getFeed()
  // ============================================================================
  describe('getFeed', () => {
    beforeEach(() => {
      (prisma.actividadFeed.findMany as jest.Mock).mockResolvedValue([
        mockActividadFeed,
      ]);
      (prisma.actividadFeed.count as jest.Mock).mockResolvedValue(1);
    });

    it('should_return_feed_with_default_pagination', async () => {
      // Act
      const result = await service.getFeed();

      // Assert
      expect(prisma.actividadFeed.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          orderBy: { creado_en: 'desc' },
        }),
      );
      expect(result.meta).toMatchObject({
        page: 1,
        limit: 20,
      });
    });

    it('should_filter_by_casaId_when_provided', async () => {
      // Act
      await service.getFeed({ casaId: mockCasaId });

      // Assert
      expect(prisma.actividadFeed.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            casa_id: mockCasaId,
          }),
        }),
      );
    });

    it('should_filter_by_tipo_when_provided', async () => {
      // Act
      await service.getFeed({ tipo: TipoActividadFeed.TAREA_PERFECTA });

      // Assert
      expect(prisma.actividadFeed.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tipo: TipoActividadFeed.TAREA_PERFECTA,
          }),
        }),
      );
    });

    it('should_filter_by_estudianteId_when_provided', async () => {
      // Act
      await service.getFeed({ estudianteId: mockEstudianteId });

      // Assert
      expect(prisma.actividadFeed.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            estudiante_id: mockEstudianteId,
          }),
        }),
      );
    });

    it('should_paginate_correctly', async () => {
      // Arrange
      (prisma.actividadFeed.count as jest.Mock).mockResolvedValue(50);

      // Act
      const result = await service.getFeed({ page: 2, limit: 10 });

      // Assert
      expect(prisma.actividadFeed.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
      expect(result.meta).toMatchObject({
        page: 2,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasMore: true,
      });
    });

    it('should_limit_max_items_to_50', async () => {
      // Act
      await service.getFeed({ limit: 100 });

      // Assert
      expect(prisma.actividadFeed.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50, // Max 50
        }),
      );
    });

    it('should_group_reactions_by_emoji', async () => {
      // Arrange
      (prisma.actividadFeed.findMany as jest.Mock).mockResolvedValue([
        mockActividadConReacciones,
      ]);

      // Act
      const result = await service.getFeed();

      // Assert
      expect(result.data[0].reacciones).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ emoji: '👏', count: 2 }),
          expect.objectContaining({ emoji: '🔥', count: 1 }),
          expect.objectContaining({ emoji: '❤️', count: 1 }),
        ]),
      );
    });

    it('should_include_estudiantesIds_in_grouped_reactions', async () => {
      // Arrange
      (prisma.actividadFeed.findMany as jest.Mock).mockResolvedValue([
        mockActividadConReacciones,
      ]);

      // Act
      const result = await service.getFeed();

      // Assert
      const aplausoReaction = result.data[0].reacciones.find(
        (r) => r.emoji === '👏',
      );
      expect(aplausoReaction?.estudiantesIds).toContain('est-1');
      expect(aplausoReaction?.estudiantesIds).toContain('est-2');
    });

    it('should_return_hasMore_false_when_no_more_pages', async () => {
      // Arrange
      (prisma.actividadFeed.count as jest.Mock).mockResolvedValue(5);

      // Act
      const result = await service.getFeed({ limit: 10 });

      // Assert
      expect(result.meta.hasMore).toBe(false);
    });

    it('should_transform_response_fields_correctly', async () => {
      // Act
      const result = await service.getFeed();

      // Assert
      expect(result.data[0]).toMatchObject({
        id: mockActividadId,
        tipo: TipoActividadFeed.TAREA_COMPLETADA,
        mensaje: 'completó una tarea',
        xpGanado: 50,
        creadoEn: expect.any(Date),
        estudiante: mockEstudiante,
        totalReacciones: 0,
      });
    });
  });

  // ============================================================================
  // TESTS: addReaction()
  // ============================================================================
  describe('addReaction', () => {
    // Emojis permitidos actualizados
    const validEmojis = ['👏', '🔥', '💪', '🚀'];
    const otroEstudianteId = 'est-otro-999';

    beforeEach(() => {
      // Por defecto: actividad pertenece a OTRO estudiante (no al que reacciona)
      (prisma.actividadFeed.findUnique as jest.Mock).mockResolvedValue({
        estudiante_id: otroEstudianteId,
      });
      // Por defecto: 0 reacciones hoy
      (prisma.reaccionFeed.count as jest.Mock).mockResolvedValue(0);
    });

    it('should_add_reaction_with_valid_emoji', async () => {
      // Arrange
      (prisma.reaccionFeed.upsert as jest.Mock).mockResolvedValue({
        id: 'reaccion-1',
        actividad_id: mockActividadId,
        estudiante_id: mockEstudianteId,
        emoji: '👏',
      });

      // Act
      const result = await service.addReaction(
        mockActividadId,
        mockEstudianteId,
        '👏',
      );

      // Assert
      expect(prisma.reaccionFeed.upsert).toHaveBeenCalledWith({
        where: {
          actividad_id_estudiante_id_emoji: {
            actividad_id: mockActividadId,
            estudiante_id: mockEstudianteId,
            emoji: '👏',
          },
        },
        create: {
          actividad_id: mockActividadId,
          estudiante_id: mockEstudianteId,
          emoji: '👏',
        },
        update: {},
      });
      expect(result).toBeDefined();
    });

    it.each(validEmojis)('should_accept_valid_emoji_%s', async (emoji) => {
      // Arrange
      (prisma.reaccionFeed.upsert as jest.Mock).mockResolvedValue({});

      // Act & Assert
      await expect(
        service.addReaction(mockActividadId, mockEstudianteId, emoji),
      ).resolves.not.toThrow();
    });

    it('should_throw_error_for_invalid_emoji', async () => {
      // Act & Assert
      await expect(
        service.addReaction(mockActividadId, mockEstudianteId, '😀'),
      ).rejects.toThrow(/Emoji no permitido/);
    });

    it('should_throw_error_for_old_emojis_no_longer_allowed', async () => {
      // Los emojis antiguos ya no son válidos
      await expect(
        service.addReaction(mockActividadId, mockEstudianteId, '🎉'),
      ).rejects.toThrow(/Emoji no permitido/);

      await expect(
        service.addReaction(mockActividadId, mockEstudianteId, '❤️'),
      ).rejects.toThrow(/Emoji no permitido/);

      await expect(
        service.addReaction(mockActividadId, mockEstudianteId, '⭐'),
      ).rejects.toThrow(/Emoji no permitido/);
    });

    it('should_throw_error_for_text_emoji', async () => {
      // Act & Assert
      await expect(
        service.addReaction(mockActividadId, mockEstudianteId, ':thumbsup:'),
      ).rejects.toThrow('Emoji no permitido');
    });

    it('should_use_upsert_to_avoid_duplicates', async () => {
      // Arrange
      (prisma.reaccionFeed.upsert as jest.Mock).mockResolvedValue({});

      // Act
      await service.addReaction(mockActividadId, mockEstudianteId, '👏');

      // Assert - upsert should be called, not create
      expect(prisma.reaccionFeed.upsert).toHaveBeenCalled();
    });

    // ========== TESTS DE LÍMITE DIARIO ==========

    it('should_throw_429_when_daily_limit_reached', async () => {
      // Arrange - Ya tiene 5 reacciones hoy
      (prisma.reaccionFeed.count as jest.Mock).mockResolvedValue(5);

      // Act & Assert
      await expect(
        service.addReaction(mockActividadId, mockEstudianteId, '👏'),
      ).rejects.toThrow('Límite de felicitaciones diarias alcanzado');
    });

    it('should_allow_reaction_when_under_daily_limit', async () => {
      // Arrange - Tiene 4 reacciones, puede hacer 1 más
      (prisma.reaccionFeed.count as jest.Mock).mockResolvedValue(4);
      (prisma.reaccionFeed.upsert as jest.Mock).mockResolvedValue({});

      // Act & Assert
      await expect(
        service.addReaction(mockActividadId, mockEstudianteId, '👏'),
      ).resolves.not.toThrow();
    });

    it('should_count_only_todays_reactions_for_limit', async () => {
      // Arrange
      (prisma.reaccionFeed.upsert as jest.Mock).mockResolvedValue({});

      // Act
      await service.addReaction(mockActividadId, mockEstudianteId, '👏');

      // Assert - debe filtrar por fecha >= hoy
      expect(prisma.reaccionFeed.count).toHaveBeenCalledWith({
        where: {
          estudiante_id: mockEstudianteId,
          creado_en: {
            gte: expect.any(Date),
          },
        },
      });
    });

    // ========== TESTS DE NO REACCIONAR A PROPIAS ACTIVIDADES ==========

    it('should_throw_error_when_reacting_to_own_activity', async () => {
      // Arrange - La actividad pertenece al mismo estudiante que quiere reaccionar
      (prisma.actividadFeed.findUnique as jest.Mock).mockResolvedValue({
        estudiante_id: mockEstudianteId, // mismo estudiante
      });

      // Act & Assert
      await expect(
        service.addReaction(mockActividadId, mockEstudianteId, '👏'),
      ).rejects.toThrow('No puedes reaccionar a tus propias actividades');
    });

    it('should_allow_reaction_to_other_students_activity', async () => {
      // Arrange - La actividad pertenece a otro estudiante
      (prisma.actividadFeed.findUnique as jest.Mock).mockResolvedValue({
        estudiante_id: 'otro-estudiante-id',
      });
      (prisma.reaccionFeed.upsert as jest.Mock).mockResolvedValue({});

      // Act & Assert
      await expect(
        service.addReaction(mockActividadId, mockEstudianteId, '👏'),
      ).resolves.not.toThrow();
    });

    it('should_throw_error_when_activity_not_found', async () => {
      // Arrange
      (prisma.actividadFeed.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.addReaction(mockActividadId, mockEstudianteId, '👏'),
      ).rejects.toThrow('Actividad no encontrada');
    });
  });

  // ============================================================================
  // TESTS: getReaccionesHoy()
  // ============================================================================
  describe('getReaccionesHoy', () => {
    it('should_return_zero_reactions_when_none_today', async () => {
      // Arrange
      (prisma.reaccionFeed.count as jest.Mock).mockResolvedValue(0);

      // Act
      const result = await service.getReaccionesHoy(mockEstudianteId);

      // Assert
      expect(result).toEqual({
        usadas: 0,
        limite: 5,
        restantes: 5,
      });
    });

    it('should_return_correct_count_when_some_reactions_used', async () => {
      // Arrange
      (prisma.reaccionFeed.count as jest.Mock).mockResolvedValue(3);

      // Act
      const result = await service.getReaccionesHoy(mockEstudianteId);

      // Assert
      expect(result).toEqual({
        usadas: 3,
        limite: 5,
        restantes: 2,
      });
    });

    it('should_return_zero_remaining_when_limit_reached', async () => {
      // Arrange
      (prisma.reaccionFeed.count as jest.Mock).mockResolvedValue(5);

      // Act
      const result = await service.getReaccionesHoy(mockEstudianteId);

      // Assert
      expect(result).toEqual({
        usadas: 5,
        limite: 5,
        restantes: 0,
      });
    });

    it('should_not_return_negative_remaining_if_over_limit', async () => {
      // Arrange - Edge case: si por alguna razón hay más de 5
      (prisma.reaccionFeed.count as jest.Mock).mockResolvedValue(7);

      // Act
      const result = await service.getReaccionesHoy(mockEstudianteId);

      // Assert
      expect(result.restantes).toBe(0); // No negativo
    });

    it('should_filter_by_today_date', async () => {
      // Arrange
      (prisma.reaccionFeed.count as jest.Mock).mockResolvedValue(0);

      // Act
      await service.getReaccionesHoy(mockEstudianteId);

      // Assert
      expect(prisma.reaccionFeed.count).toHaveBeenCalledWith({
        where: {
          estudiante_id: mockEstudianteId,
          creado_en: {
            gte: expect.any(Date),
          },
        },
      });

      // Verificar que la fecha es de hoy a las 00:00:00
      const callArg = (prisma.reaccionFeed.count as jest.Mock).mock.calls[0][0];
      const fechaFiltro = callArg.where.creado_en.gte as Date;
      expect(fechaFiltro.getHours()).toBe(0);
      expect(fechaFiltro.getMinutes()).toBe(0);
      expect(fechaFiltro.getSeconds()).toBe(0);
    });
  });

  // ============================================================================
  // TESTS: removeReaction()
  // ============================================================================
  describe('removeReaction', () => {
    it('should_remove_reaction_for_specific_emoji', async () => {
      // Arrange
      (prisma.reaccionFeed.deleteMany as jest.Mock).mockResolvedValue({
        count: 1,
      });

      // Act
      const result = await service.removeReaction(
        mockActividadId,
        mockEstudianteId,
        '👏',
      );

      // Assert
      expect(prisma.reaccionFeed.deleteMany).toHaveBeenCalledWith({
        where: {
          actividad_id: mockActividadId,
          estudiante_id: mockEstudianteId,
          emoji: '👏',
        },
      });
      expect(result).toEqual({ count: 1 });
    });

    it('should_return_count_0_when_reaction_not_found', async () => {
      // Arrange
      (prisma.reaccionFeed.deleteMany as jest.Mock).mockResolvedValue({
        count: 0,
      });

      // Act
      const result = await service.removeReaction(
        mockActividadId,
        mockEstudianteId,
        '🔥',
      );

      // Assert
      expect(result).toEqual({ count: 0 });
    });
  });

  // ============================================================================
  // TESTS: getFeedByCasa()
  // ============================================================================
  describe('getFeedByCasa', () => {
    beforeEach(() => {
      (prisma.actividadFeed.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.actividadFeed.count as jest.Mock).mockResolvedValue(0);
    });

    it('should_call_getFeed_with_casaId', async () => {
      // Arrange
      const spy = jest.spyOn(service, 'getFeed');

      // Act
      await service.getFeedByCasa(mockCasaId, 15);

      // Assert
      expect(spy).toHaveBeenCalledWith({ casaId: mockCasaId, limit: 15 });
    });

    it('should_use_default_limit_10', async () => {
      // Arrange
      const spy = jest.spyOn(service, 'getFeed');

      // Act
      await service.getFeedByCasa(mockCasaId);

      // Assert
      expect(spy).toHaveBeenCalledWith({ casaId: mockCasaId, limit: 10 });
    });
  });

  // ============================================================================
  // TESTS: getFeedByEstudiante()
  // ============================================================================
  describe('getFeedByEstudiante', () => {
    beforeEach(() => {
      (prisma.actividadFeed.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.actividadFeed.count as jest.Mock).mockResolvedValue(0);
    });

    it('should_call_getFeed_with_estudianteId', async () => {
      // Arrange
      const spy = jest.spyOn(service, 'getFeed');

      // Act
      await service.getFeedByEstudiante(mockEstudianteId, 20);

      // Assert
      expect(spy).toHaveBeenCalledWith({
        estudianteId: mockEstudianteId,
        limit: 20,
      });
    });

    it('should_use_default_limit_10', async () => {
      // Arrange
      const spy = jest.spyOn(service, 'getFeed');

      // Act
      await service.getFeedByEstudiante(mockEstudianteId);

      // Assert
      expect(spy).toHaveBeenCalledWith({
        estudianteId: mockEstudianteId,
        limit: 10,
      });
    });
  });

  // ============================================================================
  // TESTS: getFeedByEstudiantes()
  // ============================================================================
  describe('getFeedByEstudiantes', () => {
    const mockEstudianteIds = ['est-1', 'est-2', 'est-3'];

    beforeEach(() => {
      (prisma.actividadFeed.findMany as jest.Mock).mockResolvedValue([
        mockActividadFeed,
      ]);
      (prisma.actividadFeed.count as jest.Mock).mockResolvedValue(1);
    });

    it('should_return_empty_feed_when_no_estudiante_ids_provided', async () => {
      // Act
      const result = await service.getFeedByEstudiantes([]);

      // Assert
      expect(result.data).toEqual([]);
      expect(result.meta).toMatchObject({
        total: 0,
        page: 1,
        totalPages: 0,
        hasMore: false,
      });
      expect(prisma.actividadFeed.findMany).not.toHaveBeenCalled();
    });

    it('should_filter_by_estudiante_ids_using_in_clause', async () => {
      // Act
      await service.getFeedByEstudiantes(mockEstudianteIds);

      // Assert
      expect(prisma.actividadFeed.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            estudiante_id: { in: mockEstudianteIds },
          },
        }),
      );
    });

    it('should_use_default_limit_10', async () => {
      // Act
      await service.getFeedByEstudiantes(mockEstudianteIds);

      // Assert
      expect(prisma.actividadFeed.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        }),
      );
    });

    it('should_respect_custom_limit', async () => {
      // Act
      await service.getFeedByEstudiantes(mockEstudianteIds, 25);

      // Assert
      expect(prisma.actividadFeed.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 25,
        }),
      );
    });

    it('should_limit_max_items_to_50', async () => {
      // Act
      await service.getFeedByEstudiantes(mockEstudianteIds, 100);

      // Assert
      expect(prisma.actividadFeed.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        }),
      );
    });

    it('should_paginate_correctly', async () => {
      // Arrange
      (prisma.actividadFeed.count as jest.Mock).mockResolvedValue(30);

      // Act
      const result = await service.getFeedByEstudiantes(
        mockEstudianteIds,
        10,
        2,
      );

      // Assert
      expect(prisma.actividadFeed.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
      expect(result.meta).toMatchObject({
        page: 2,
        limit: 10,
        total: 30,
        totalPages: 3,
        hasMore: true,
      });
    });

    it('should_order_by_creado_en_desc', async () => {
      // Act
      await service.getFeedByEstudiantes(mockEstudianteIds);

      // Assert
      expect(prisma.actividadFeed.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { creado_en: 'desc' },
        }),
      );
    });

    it('should_include_estudiante_and_reacciones', async () => {
      // Act
      await service.getFeedByEstudiantes(mockEstudianteIds);

      // Assert
      expect(prisma.actividadFeed.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            estudiante: expect.any(Object),
            reacciones: expect.any(Object),
            _count: expect.any(Object),
          }),
        }),
      );
    });

    it('should_transform_response_fields_correctly', async () => {
      // Act
      const result = await service.getFeedByEstudiantes(mockEstudianteIds);

      // Assert
      expect(result.data[0]).toMatchObject({
        id: mockActividadId,
        tipo: TipoActividadFeed.TAREA_COMPLETADA,
        mensaje: 'completó una tarea',
        xpGanado: 50,
        creadoEn: expect.any(Date),
        estudiante: mockEstudiante,
      });
    });

    it('should_group_reactions_by_emoji', async () => {
      // Arrange
      (prisma.actividadFeed.findMany as jest.Mock).mockResolvedValue([
        mockActividadConReacciones,
      ]);

      // Act
      const result = await service.getFeedByEstudiantes(mockEstudianteIds);

      // Assert
      expect(result.data[0].reacciones).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ emoji: '👏', count: 2 }),
        ]),
      );
    });
  });

  // ============================================================================
  // TESTS: agruparReacciones (método privado, testeado vía getFeed)
  // ============================================================================
  describe('agruparReacciones', () => {
    it('should_return_empty_array_when_no_reactions', async () => {
      // Arrange
      (prisma.actividadFeed.findMany as jest.Mock).mockResolvedValue([
        { ...mockActividadFeed, reacciones: [] },
      ]);
      (prisma.actividadFeed.count as jest.Mock).mockResolvedValue(1);

      // Act
      const result = await service.getFeed();

      // Assert
      expect(result.data[0].reacciones).toEqual([]);
    });

    it('should_count_multiple_reactions_of_same_emoji', async () => {
      // Arrange
      const actividadMuchasReacciones = {
        ...mockActividadFeed,
        reacciones: [
          { emoji: '👏', estudiante_id: 'est-1' },
          { emoji: '👏', estudiante_id: 'est-2' },
          { emoji: '👏', estudiante_id: 'est-3' },
          { emoji: '👏', estudiante_id: 'est-4' },
          { emoji: '👏', estudiante_id: 'est-5' },
        ],
        _count: { reacciones: 5 },
      };
      (prisma.actividadFeed.findMany as jest.Mock).mockResolvedValue([
        actividadMuchasReacciones,
      ]);
      (prisma.actividadFeed.count as jest.Mock).mockResolvedValue(1);

      // Act
      const result = await service.getFeed();

      // Assert
      const aplausoReaction = result.data[0].reacciones.find(
        (r) => r.emoji === '👏',
      );
      expect(aplausoReaction?.count).toBe(5);
      expect(aplausoReaction?.estudiantesIds).toHaveLength(5);
    });
  });
});
