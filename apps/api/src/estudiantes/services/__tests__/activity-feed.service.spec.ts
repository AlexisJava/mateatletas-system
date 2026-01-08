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
        count: jest.fn(),
      },
      reaccionFeed: {
        upsert: jest.fn(),
        deleteMany: jest.fn(),
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
    const validEmojis = ['👏', '🎉', '🔥', '💪', '❤️', '⭐'];

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
      ).rejects.toThrow('Emoji no permitido: 😀');
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
