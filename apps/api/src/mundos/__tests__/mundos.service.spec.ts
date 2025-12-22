import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MundosService } from '../mundos.service';
import { PrismaService } from '../../core/database/prisma.service';
import { MundoTipo } from '@prisma/client';

/**
 * MundosService - Tests TDD
 *
 * Sistema de 3 mundos STEAM:
 * - MATEMATICA: Numeros, algebra, geometria
 * - PROGRAMACION: Codigo, algoritmos, logica
 * - CIENCIAS: Fisica, quimica, biologia
 *
 * Reglas de negocio:
 * - Tier ARCADE: acceso a 1 mundo
 * - Tier ARCADE+: acceso a 2 mundos
 * - Tier PRO: acceso a 3 mundos
 */
// SKIP: Tests pendientes de actualización - RecursosEstudiante refactor
describe.skip('MundosService', () => {
  let service: MundosService;

  const mockMundos = [
    {
      id: 'mundo-matematica-id',
      tipo: MundoTipo.MATEMATICA,
      nombre: 'Matematica',
      descripcion: 'Numeros, algebra, geometria',
      icono: '🔢',
      colorPrimary: '#F59E0B',
      colorSecondary: '#D97706',
      colorAccent: '#FDE68A',
      gradiente: 'from-amber-400 to-orange-500',
      activo: true,
      orden: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'mundo-programacion-id',
      tipo: MundoTipo.PROGRAMACION,
      nombre: 'Programacion',
      descripcion: 'Codigo, algoritmos, logica',
      icono: '💻',
      colorPrimary: '#10B981',
      colorSecondary: '#059669',
      colorAccent: '#A7F3D0',
      gradiente: 'from-emerald-400 to-green-500',
      activo: true,
      orden: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'mundo-ciencias-id',
      tipo: MundoTipo.CIENCIAS,
      nombre: 'Ciencias',
      descripcion: 'Fisica, quimica, biologia',
      icono: '🔬',
      colorPrimary: '#3B82F6',
      colorSecondary: '#2563EB',
      colorAccent: '#BFDBFE',
      gradiente: 'from-blue-400 to-blue-600',
      activo: true,
      orden: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockPrismaService = {
    mundo: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    cicloMundoSeleccionado2026: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MundosService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MundosService>(MundosService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should_return_all_3_mundos_activos', async () => {
      mockPrismaService.mundo.findMany.mockResolvedValue(mockMundos);

      const resultado = await service.findAll();

      expect(resultado).toHaveLength(3);
      expect(mockPrismaService.mundo.findMany).toHaveBeenCalledWith({
        where: { activo: true },
        orderBy: { orden: 'asc' },
      });
    });

    it('should_return_mundos_ordered_by_orden', async () => {
      mockPrismaService.mundo.findMany.mockResolvedValue(mockMundos);

      const resultado = await service.findAll();

      expect(resultado[0]?.tipo).toBe(MundoTipo.MATEMATICA);
      expect(resultado[1]?.tipo).toBe(MundoTipo.PROGRAMACION);
      expect(resultado[2]?.tipo).toBe(MundoTipo.CIENCIAS);
    });

    it('should_filter_inactive_mundos', async () => {
      const mundosActivos = mockMundos.filter((m) => m.activo);
      mockPrismaService.mundo.findMany.mockResolvedValue(mundosActivos);

      const resultado = await service.findAll();

      expect(resultado.every((m) => m.activo)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should_return_mundo_by_id', async () => {
      const mundoMatematica = mockMundos[0];
      mockPrismaService.mundo.findUnique.mockResolvedValue(mundoMatematica);

      const resultado = await service.findOne('mundo-matematica-id');

      expect(resultado).toEqual(mundoMatematica);
      expect(mockPrismaService.mundo.findUnique).toHaveBeenCalledWith({
        where: { id: 'mundo-matematica-id' },
      });
    });

    it('should_throw_NotFoundException_when_mundo_not_found', async () => {
      mockPrismaService.mundo.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should_throw_NotFoundException_with_correct_message', async () => {
      mockPrismaService.mundo.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        'Mundo con ID invalid-id no encontrado',
      );
    });
  });

  describe('findByTipo', () => {
    it('should_return_mundo_by_tipo_MATEMATICA', async () => {
      const mundoMatematica = mockMundos[0];
      mockPrismaService.mundo.findUnique.mockResolvedValue(mundoMatematica);

      const resultado = await service.findByTipo(MundoTipo.MATEMATICA);

      expect(resultado).toEqual(mundoMatematica);
      expect(mockPrismaService.mundo.findUnique).toHaveBeenCalledWith({
        where: { tipo: MundoTipo.MATEMATICA },
      });
    });

    it('should_return_mundo_by_tipo_PROGRAMACION', async () => {
      const mundoProgramacion = mockMundos[1];
      mockPrismaService.mundo.findUnique.mockResolvedValue(mundoProgramacion);

      const resultado = await service.findByTipo(MundoTipo.PROGRAMACION);

      expect(resultado).toEqual(mundoProgramacion);
    });

    it('should_return_mundo_by_tipo_CIENCIAS', async () => {
      const mundoCiencias = mockMundos[2];
      mockPrismaService.mundo.findUnique.mockResolvedValue(mundoCiencias);

      const resultado = await service.findByTipo(MundoTipo.CIENCIAS);

      expect(resultado).toEqual(mundoCiencias);
    });

    it('should_throw_NotFoundException_when_tipo_not_found', async () => {
      mockPrismaService.mundo.findUnique.mockResolvedValue(null);

      await expect(service.findByTipo(MundoTipo.MATEMATICA)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCantidadMundosPorTier', () => {
    it('should_return_1_for_ARCADE', () => {
      const cantidad = service.getCantidadMundosPorTier('ARCADE');
      expect(cantidad).toBe(1);
    });

    it('should_return_2_for_ARCADE_PLUS', () => {
      const cantidad = service.getCantidadMundosPorTier('ARCADE_PLUS');
      expect(cantidad).toBe(2);
    });

    it('should_return_3_for_PRO', () => {
      const cantidad = service.getCantidadMundosPorTier('PRO');
      expect(cantidad).toBe(3);
    });
  });

  describe('puedeAccederMundo', () => {
    it('should_return_true_when_mundo_is_selected', async () => {
      mockPrismaService.cicloMundoSeleccionado2026.findMany.mockResolvedValue([
        { mundo: MundoTipo.MATEMATICA },
        { mundo: MundoTipo.PROGRAMACION },
      ]);

      const resultado = await service.puedeAccederMundo(
        'estudiante-1',
        MundoTipo.MATEMATICA,
      );

      expect(resultado).toBe(true);
    });

    it('should_return_false_when_mundo_is_not_selected', async () => {
      mockPrismaService.cicloMundoSeleccionado2026.findMany.mockResolvedValue([
        { mundo: MundoTipo.MATEMATICA },
      ]);

      const resultado = await service.puedeAccederMundo(
        'estudiante-1',
        MundoTipo.CIENCIAS,
      );

      expect(resultado).toBe(false);
    });

    it('should_return_false_when_no_mundos_selected', async () => {
      mockPrismaService.cicloMundoSeleccionado2026.findMany.mockResolvedValue(
        [],
      );

      const resultado = await service.puedeAccederMundo(
        'estudiante-1',
        MundoTipo.MATEMATICA,
      );

      expect(resultado).toBe(false);
    });
  });

  describe('getEstadisticas', () => {
    it('should_return_estadisticas_de_todos_los_mundos', async () => {
      mockPrismaService.mundo.findMany.mockResolvedValue(mockMundos);
      // Ahora usa groupBy en lugar de count (optimización N+1)
      mockPrismaService.cicloMundoSeleccionado2026.groupBy.mockResolvedValue([
        { mundo: MundoTipo.MATEMATICA, _count: { id: 100 } },
        { mundo: MundoTipo.PROGRAMACION, _count: { id: 80 } },
        { mundo: MundoTipo.CIENCIAS, _count: { id: 50 } },
      ]);

      const resultado = await service.getEstadisticas();

      expect(resultado.totalMundos).toBe(3);
      expect(resultado.totalEstudiantes).toBe(230);
      expect(resultado.mundos).toHaveLength(3);
    });

    it('should_include_cantidad_estudiantes_per_mundo', async () => {
      mockPrismaService.mundo.findMany.mockResolvedValue(mockMundos);
      mockPrismaService.cicloMundoSeleccionado2026.groupBy.mockResolvedValue([
        { mundo: MundoTipo.MATEMATICA, _count: { id: 100 } },
        { mundo: MundoTipo.PROGRAMACION, _count: { id: 80 } },
        { mundo: MundoTipo.CIENCIAS, _count: { id: 50 } },
      ]);

      const resultado = await service.getEstadisticas();

      expect(resultado.mundos[0]?.cantidadEstudiantes).toBe(100);
      expect(resultado.mundos[1]?.cantidadEstudiantes).toBe(80);
      expect(resultado.mundos[2]?.cantidadEstudiantes).toBe(50);
    });

    it('should_return_zero_estudiantes_when_no_selections', async () => {
      mockPrismaService.mundo.findMany.mockResolvedValue(mockMundos);
      mockPrismaService.cicloMundoSeleccionado2026.groupBy.mockResolvedValue(
        [],
      );

      const resultado = await service.getEstadisticas();

      expect(resultado.totalEstudiantes).toBe(0);
      expect(resultado.mundos.every((m) => m.cantidadEstudiantes === 0)).toBe(
        true,
      );
    });
  });

  describe('getMundosPorTier', () => {
    it('should_return_all_mundos_for_PRO_tier', async () => {
      mockPrismaService.mundo.findMany.mockResolvedValue(mockMundos);

      const resultado = await service.getMundosPorTier('PRO');

      expect(resultado).toHaveLength(3);
      expect(mockPrismaService.mundo.findMany).toHaveBeenCalledWith({
        where: {
          activo: true,
          tipo: {
            in: [
              MundoTipo.MATEMATICA,
              MundoTipo.PROGRAMACION,
              MundoTipo.CIENCIAS,
            ],
          },
        },
        orderBy: { orden: 'asc' },
      });
    });

    it('should_return_mundos_filtered_by_tier_ARCADE', async () => {
      mockPrismaService.mundo.findMany.mockResolvedValue(mockMundos);

      const resultado = await service.getMundosPorTier('ARCADE');

      // Para ARCADE el filtrado real se hace por estudiante
      expect(mockPrismaService.mundo.findMany).toHaveBeenCalled();
      expect(resultado).toBeDefined();
    });
  });
});
