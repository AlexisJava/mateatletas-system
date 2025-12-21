import { Test, TestingModule } from '@nestjs/testing';
import { EstadoSuscripcion } from '@prisma/client';
import { SuscripcionAdminService } from '../services/suscripcion-admin.service';
import { PrismaService } from '../../core/database/prisma.service';

describe('SuscripcionAdminService', () => {
  let service: SuscripcionAdminService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    suscripcion: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    pagoSuscripcion: {
      aggregate: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuscripcionAdminService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SuscripcionAdminService>(SuscripcionAdminService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('listarTodas', () => {
    it('should_return_paginated_subscriptions', async () => {
      const mockSuscripciones = [
        {
          id: 'sus-1',
          estado: EstadoSuscripcion.ACTIVA,
          precio_final: { toNumber: () => 30000 },
          fecha_inicio: new Date('2025-01-01'),
          fecha_proximo_cobro: new Date('2025-02-01'),
          dias_gracia_usados: 0,
          tutor: {
            id: 'tutor-1',
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan@test.com',
          },
          plan: {
            id: 'plan-1',
            nombre: 'STEAM_LIBROS',
          },
          _count: { estudiantes: 2 },
        },
      ];

      mockPrisma.suscripcion.findMany.mockResolvedValue(mockSuscripciones);
      mockPrisma.suscripcion.count.mockResolvedValue(1);

      const result = await service.listarTodas({}, { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
    });

    it('should_filter_by_estado', async () => {
      mockPrisma.suscripcion.findMany.mockResolvedValue([]);
      mockPrisma.suscripcion.count.mockResolvedValue(0);

      await service.listarTodas(
        { estado: EstadoSuscripcion.ACTIVA },
        { page: 1, limit: 20 },
      );

      expect(mockPrisma.suscripcion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { estado: EstadoSuscripcion.ACTIVA },
        }),
      );
    });

    it('should_filter_by_plan_id', async () => {
      mockPrisma.suscripcion.findMany.mockResolvedValue([]);
      mockPrisma.suscripcion.count.mockResolvedValue(0);

      await service.listarTodas(
        { plan_id: 'plan-123' },
        { page: 1, limit: 20 },
      );

      expect(mockPrisma.suscripcion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { plan_id: 'plan-123' },
        }),
      );
    });

    it('should_paginate_correctly', async () => {
      mockPrisma.suscripcion.findMany.mockResolvedValue([]);
      mockPrisma.suscripcion.count.mockResolvedValue(45);

      const result = await service.listarTodas({}, { page: 2, limit: 20 });

      expect(mockPrisma.suscripcion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 20,
        }),
      );
      expect(result.totalPages).toBe(3);
    });
  });

  describe('listarMorosas', () => {
    it('should_return_only_morosas_and_en_gracia', async () => {
      const mockMorosas = [
        {
          id: 'sus-1',
          estado: EstadoSuscripcion.MOROSA,
          precio_final: { toNumber: () => 30000 },
          fecha_inicio: new Date(),
          fecha_proximo_cobro: null,
          dias_gracia_usados: 3,
          tutor: {
            id: 'tutor-1',
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan@test.com',
          },
          plan: { id: 'plan-1', nombre: 'STEAM_LIBROS' },
        },
        {
          id: 'sus-2',
          estado: EstadoSuscripcion.EN_GRACIA,
          precio_final: { toNumber: () => 30000 },
          fecha_inicio: new Date(),
          fecha_proximo_cobro: null,
          dias_gracia_usados: 1,
          tutor: {
            id: 'tutor-2',
            nombre: 'María',
            apellido: 'García',
            email: 'maria@test.com',
          },
          plan: { id: 'plan-1', nombre: 'STEAM_LIBROS' },
        },
      ];

      mockPrisma.suscripcion.findMany.mockResolvedValue(mockMorosas);

      const result = await service.listarMorosas();

      expect(result.suscripciones).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockPrisma.suscripcion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            estado: {
              in: [EstadoSuscripcion.MOROSA, EstadoSuscripcion.EN_GRACIA],
            },
          },
        }),
      );
    });
  });

  describe('getMetricas', () => {
    it('should_return_dashboard_metrics', async () => {
      // Mock count by estado
      mockPrisma.suscripcion.groupBy.mockResolvedValue([
        { estado: EstadoSuscripcion.ACTIVA, _count: { id: 50 } },
        { estado: EstadoSuscripcion.MOROSA, _count: { id: 5 } },
        { estado: EstadoSuscripcion.EN_GRACIA, _count: { id: 3 } },
        { estado: EstadoSuscripcion.CANCELADA, _count: { id: 10 } },
      ]);

      // Mock canceladas este mes
      mockPrisma.suscripcion.count.mockResolvedValue(2);

      // Mock ingresos del mes
      mockPrisma.pagoSuscripcion.aggregate.mockResolvedValue({
        _sum: { monto: { toNumber: () => 1500000 } },
      });

      const result = await service.getMetricas();

      expect(result.total_activas).toBe(50);
      expect(result.total_morosas).toBe(5);
      expect(result.total_en_gracia).toBe(3);
      expect(result.total_canceladas_mes).toBe(2);
      expect(result.ingresos_mes).toBe(1500000);
      expect(result.tasa_cancelacion).toBeCloseTo(3.33, 1); // 2/(50+5+3+2) * 100
    });

    it('should_handle_zero_subscriptions', async () => {
      mockPrisma.suscripcion.groupBy.mockResolvedValue([]);
      mockPrisma.suscripcion.count.mockResolvedValue(0);
      mockPrisma.pagoSuscripcion.aggregate.mockResolvedValue({
        _sum: { monto: null },
      });

      const result = await service.getMetricas();

      expect(result.total_activas).toBe(0);
      expect(result.total_morosas).toBe(0);
      expect(result.ingresos_mes).toBe(0);
      expect(result.tasa_cancelacion).toBe(0);
    });
  });
});
