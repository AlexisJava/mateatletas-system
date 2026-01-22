import { Test, TestingModule } from '@nestjs/testing';
import { EstadoSuscripcion } from '@prisma/client';
import { SuscripcionQueryService } from '../services/suscripcion-query.service';
import { PrismaService } from '../../core/database/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('SuscripcionQueryService', () => {
  let service: SuscripcionQueryService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    planSuscripcion: {
      findMany: jest.fn(),
    },
    suscripcion: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    pagoSuscripcion: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuscripcionQueryService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SuscripcionQueryService>(SuscripcionQueryService);
    prisma = module.get(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('getPlanes', () => {
    it('should_return_active_plans_with_prices', async () => {
      const mockPlanes = [
        {
          id: 'plan-1',
          nombre: 'STEAM_LIBROS',
          descripcion: 'Plan con libros',
          precioBase: { toNumber: () => 30000 },
          activo: true,
        },
        {
          id: 'plan-2',
          nombre: 'STEAM_SINCRONICO',
          descripcion: 'Plan con clases en vivo',
          precioBase: { toNumber: () => 75000 },
          activo: true,
        },
      ];

      mockPrisma.planSuscripcion.findMany.mockResolvedValue(mockPlanes);

      const result = await service.getPlanes();

      expect(result.planes).toHaveLength(2);
      expect(result.planes[0]).toEqual({
        id: 'plan-1',
        nombre: 'STEAM_LIBROS',
        descripcion: 'Plan con libros',
        precio: 30000,
        features: expect.any(Array),
      });
      expect(mockPrisma.planSuscripcion.findMany).toHaveBeenCalledWith({
        where: { activo: true },
        orderBy: { precioBase: 'asc' },
      });
    });

    it('should_return_empty_array_when_no_plans', async () => {
      mockPrisma.planSuscripcion.findMany.mockResolvedValue([]);

      const result = await service.getPlanes();

      expect(result.planes).toHaveLength(0);
    });
  });

  describe('getMisSuscripciones', () => {
    const tutorId = 'tutor-123';

    it('should_return_all_subscriptions_for_tutor', async () => {
      const mockSuscripciones = [
        {
          id: 'sus-1',
          tutorId: tutorId,
          estado: EstadoSuscripcion.ACTIVA,
          precioFinal: { toNumber: () => 30000 },
          descuentoPorcentaje: 10,
          fechaInicio: new Date('2025-01-01'),
          fechaProximoCobro: new Date('2025-02-01'),
          diasGraciaUsados: 0,
          plan: {
            id: 'plan-1',
            nombre: 'STEAM_LIBROS',
            descripcion: 'Plan básico',
            precioBase: { toNumber: () => 30000 },
          },
          // Nota: estudiantes vendrían de otra query en implementación real
        },
      ];

      mockPrisma.suscripcion.findMany.mockResolvedValue(mockSuscripciones);

      const result = await service.getMisSuscripciones(tutorId);

      expect(result.suscripciones).toHaveLength(1);
      expect(result.suscripciones[0].estado).toBe(EstadoSuscripcion.ACTIVA);
      expect(result.suscripciones[0].monto_final).toBe(30000);
      expect(mockPrisma.suscripcion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tutorId: tutorId },
        }),
      );
    });

    it('should_return_empty_array_when_tutor_has_no_subscriptions', async () => {
      mockPrisma.suscripcion.findMany.mockResolvedValue([]);

      const result = await service.getMisSuscripciones(tutorId);

      expect(result.suscripciones).toHaveLength(0);
    });

    it('should_include_alert_for_subscription_en_gracia', async () => {
      const fechaInicioGracia = new Date();
      fechaInicioGracia.setDate(fechaInicioGracia.getDate() - 1); // Ayer

      const mockSuscripciones = [
        {
          id: 'sus-1',
          tutorId: tutorId,
          estado: EstadoSuscripcion.EN_GRACIA,
          precioFinal: { toNumber: () => 30000 },
          descuentoPorcentaje: 0,
          fechaInicio: new Date('2025-01-01'),
          fechaProximoCobro: null,
          diasGraciaUsados: 1,
          fechaInicioGracia: fechaInicioGracia,
          plan: {
            id: 'plan-1',
            nombre: 'STEAM_LIBROS',
            descripcion: 'Plan básico',
            precioBase: { toNumber: () => 30000 },
          },
        },
      ];

      mockPrisma.suscripcion.findMany.mockResolvedValue(mockSuscripciones);

      const result = await service.getMisSuscripciones(tutorId);

      expect(result.suscripciones[0].alerta).toBeDefined();
      expect(result.suscripciones[0].alerta?.tipo).toBe('EN_GRACIA');
      expect(result.suscripciones[0].alerta?.dias_restantes).toBe(2); // 3 - 1 = 2
    });
  });

  describe('getSuscripcionDetalle', () => {
    const suscripcionId = 'sus-123';
    const tutorId = 'tutor-123';

    it('should_return_subscription_detail_with_payments', async () => {
      const mockSuscripcion = {
        id: suscripcionId,
        tutorId: tutorId,
        estado: EstadoSuscripcion.ACTIVA,
        precioFinal: { toNumber: () => 30000 },
        descuentoPorcentaje: 10,
        fechaInicio: new Date('2025-01-01'),
        fechaProximoCobro: new Date('2025-02-01'),
        diasGraciaUsados: 0,
        plan: {
          id: 'plan-1',
          nombre: 'STEAM_LIBROS',
          descripcion: 'Plan básico',
          precioBase: { toNumber: () => 30000 },
        },
        pagos: [
          {
            id: 'pago-1',
            fechaCobro: new Date('2025-01-01'),
            monto: { toNumber: () => 30000 },
            mpStatus: 'approved',
          },
        ],
        historial: [
          {
            createdAt: new Date('2025-01-01'),
            estadoAnterior: null,
            estadoNuevo: EstadoSuscripcion.ACTIVA,
            motivo: 'Pago inicial',
          },
        ],
      };

      mockPrisma.suscripcion.findUnique.mockResolvedValue(mockSuscripcion);

      const result = await service.getSuscripcionDetalle(
        suscripcionId,
        tutorId,
      );

      expect(result.id).toBe(suscripcionId);
      expect(result.pagos).toHaveLength(1);
      expect(result.historial_estados).toHaveLength(1);
    });

    it('should_throw_not_found_when_subscription_not_exists', async () => {
      mockPrisma.suscripcion.findUnique.mockResolvedValue(null);

      await expect(
        service.getSuscripcionDetalle(suscripcionId, tutorId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should_throw_forbidden_when_tutor_not_owner', async () => {
      const mockSuscripcion = {
        id: suscripcionId,
        tutorId: 'otro-tutor',
        estado: EstadoSuscripcion.ACTIVA,
        precioFinal: { toNumber: () => 30000 },
        descuentoPorcentaje: 0,
        fechaInicio: new Date(),
        fechaProximoCobro: new Date(),
        diasGraciaUsados: 0,
        plan: {
          id: 'plan-1',
          nombre: 'Test',
          precioBase: { toNumber: () => 30000 },
        },
        pagos: [],
        historial: [],
      };

      mockPrisma.suscripcion.findUnique.mockResolvedValue(mockSuscripcion);

      await expect(
        service.getSuscripcionDetalle(suscripcionId, tutorId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getHistorialPagos', () => {
    const suscripcionId = 'sus-123';
    const tutorId = 'tutor-123';

    it('should_return_payment_history', async () => {
      const mockSuscripcion = {
        id: suscripcionId,
        tutorId: tutorId,
      };

      const mockPagos = [
        {
          id: 'pago-1',
          fechaCobro: new Date('2025-01-01'),
          monto: { toNumber: () => 30000 },
          mpStatus: 'approved',
          mpStatus_detail: 'accredited',
        },
        {
          id: 'pago-2',
          fechaCobro: new Date('2024-12-01'),
          monto: { toNumber: () => 30000 },
          mpStatus: 'approved',
          mpStatus_detail: 'accredited',
        },
      ];

      mockPrisma.suscripcion.findUnique.mockResolvedValue(mockSuscripcion);
      mockPrisma.pagoSuscripcion.findMany.mockResolvedValue(mockPagos);

      const result = await service.getHistorialPagos(suscripcionId, tutorId);

      expect(result.pagos).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should_throw_forbidden_when_not_owner', async () => {
      const mockSuscripcion = {
        id: suscripcionId,
        tutorId: 'otro-tutor',
      };

      mockPrisma.suscripcion.findUnique.mockResolvedValue(mockSuscripcion);

      await expect(
        service.getHistorialPagos(suscripcionId, tutorId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('calcularAlerta', () => {
    it('should_return_en_gracia_alert_with_days_remaining', () => {
      const fechaInicioGracia = new Date();
      fechaInicioGracia.setDate(fechaInicioGracia.getDate() - 2);

      const suscripcion = {
        estado: EstadoSuscripcion.EN_GRACIA,
        diasGraciaUsados: 2,
        fechaInicioGracia: fechaInicioGracia,
        fechaProximoCobro: null,
      };

      const alerta = service.calcularAlerta(suscripcion as never);

      expect(alerta).not.toBeNull();
      expect(alerta?.tipo).toBe('EN_GRACIA');
      expect(alerta?.dias_restantes).toBe(1); // 3 días máx - 2 usados = 1
    });

    it('should_return_proximo_cobro_alert_when_due_soon', () => {
      const proximoCobro = new Date();
      proximoCobro.setDate(proximoCobro.getDate() + 2); // En 2 días

      const suscripcion = {
        estado: EstadoSuscripcion.ACTIVA,
        diasGraciaUsados: 0,
        fechaInicioGracia: null,
        fechaProximoCobro: proximoCobro,
      };

      const alerta = service.calcularAlerta(suscripcion as never);

      expect(alerta).not.toBeNull();
      expect(alerta?.tipo).toBe('PROXIMO_COBRO');
      expect(alerta?.dias_restantes).toBe(2);
    });

    it('should_return_null_when_no_alert_needed', () => {
      const proximoCobro = new Date();
      proximoCobro.setDate(proximoCobro.getDate() + 10); // En 10 días

      const suscripcion = {
        estado: EstadoSuscripcion.ACTIVA,
        diasGraciaUsados: 0,
        fechaInicioGracia: null,
        fechaProximoCobro: proximoCobro,
      };

      const alerta = service.calcularAlerta(suscripcion as never);

      expect(alerta).toBeNull();
    });
  });
});
