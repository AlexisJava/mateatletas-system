import { Test, TestingModule } from '@nestjs/testing';
import { PaymentExpirationService } from '../payment-expiration.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { EstadoPago } from '@prisma/client';

describe('PaymentExpirationService', () => {
  let service: PaymentExpirationService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    inscripcionMensual: {
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    inscripcion2026: {
      updateMany: jest.fn(),
      findMany: jest.fn(),
    },
    pagoInscripcion2026: {
      updateMany: jest.fn(),
    },
    historialEstadoInscripcion2026: {
      createMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentExpirationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PaymentExpirationService>(PaymentExpirationService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('expirePendingPayments (cron job)', () => {
    it('debe expirar inscripciones mensuales pendientes mayores a 30 días', async () => {
      mockPrismaService.inscripcionMensual.updateMany.mockResolvedValue({
        count: 5,
      });
      mockPrismaService.inscripcion2026.updateMany.mockResolvedValue({
        count: 0,
      });
      mockPrismaService.inscripcion2026.findMany.mockResolvedValue([]);
      mockPrismaService.pagoInscripcion2026.updateMany.mockResolvedValue({
        count: 0,
      });

      await service.expirePendingPayments();

      expect(
        mockPrismaService.inscripcionMensual.updateMany,
      ).toHaveBeenCalledWith({
        where: {
          estado_pago: EstadoPago.Pendiente,
          createdAt: {
            lt: expect.any(Date),
          },
        },
        data: {
          estado_pago: EstadoPago.Vencido,
        },
      });
    });

    it('debe expirar inscripciones 2026 pendientes mayores a 30 días', async () => {
      mockPrismaService.inscripcionMensual.updateMany.mockResolvedValue({
        count: 0,
      });
      mockPrismaService.inscripcion2026.updateMany.mockResolvedValue({
        count: 3,
      });
      mockPrismaService.inscripcion2026.findMany.mockResolvedValue([
        { id: 'insc-1' },
        { id: 'insc-2' },
        { id: 'insc-3' },
      ]);
      mockPrismaService.pagoInscripcion2026.updateMany.mockResolvedValue({
        count: 0,
      });
      mockPrismaService.historialEstadoInscripcion2026.createMany.mockResolvedValue(
        {
          count: 3,
        },
      );

      await service.expirePendingPayments();

      expect(mockPrismaService.inscripcion2026.updateMany).toHaveBeenCalledWith(
        {
          where: {
            estado: 'pending',
            createdAt: {
              lt: expect.any(Date),
            },
          },
          data: {
            estado: 'cancelled',
          },
        },
      );

      // Debe registrar historial de cambios
      expect(
        mockPrismaService.historialEstadoInscripcion2026.createMany,
      ).toHaveBeenCalled();
    });

    it('debe expirar pagos 2026 pendientes mayores a 30 días', async () => {
      mockPrismaService.inscripcionMensual.updateMany.mockResolvedValue({
        count: 0,
      });
      mockPrismaService.inscripcion2026.updateMany.mockResolvedValue({
        count: 0,
      });
      mockPrismaService.pagoInscripcion2026.updateMany.mockResolvedValue({
        count: 2,
      });

      await service.expirePendingPayments();

      expect(
        mockPrismaService.pagoInscripcion2026.updateMany,
      ).toHaveBeenCalledWith({
        where: {
          estado: 'pending',
          createdAt: {
            lt: expect.any(Date),
          },
        },
        data: {
          estado: 'expired',
        },
      });
    });

    it('no debe fallar si no hay inscripciones pendientes', async () => {
      mockPrismaService.inscripcionMensual.updateMany.mockResolvedValue({
        count: 0,
      });
      mockPrismaService.inscripcion2026.updateMany.mockResolvedValue({
        count: 0,
      });
      mockPrismaService.pagoInscripcion2026.updateMany.mockResolvedValue({
        count: 0,
      });

      await expect(service.expirePendingPayments()).resolves.not.toThrow();
    });
  });

  describe('runManually', () => {
    it('debe retornar estadísticas de expiraciones', async () => {
      mockPrismaService.inscripcionMensual.updateMany.mockResolvedValue({
        count: 5,
      });
      mockPrismaService.inscripcion2026.updateMany.mockResolvedValue({
        count: 3,
      });
      mockPrismaService.inscripcion2026.findMany.mockResolvedValue([]);
      mockPrismaService.pagoInscripcion2026.updateMany.mockResolvedValue({
        count: 2,
      });

      const result = await service.runManually();

      expect(result).toEqual({
        inscripcionesMensuales: 5,
        inscripciones2026: 3,
        pagos2026: 2,
        total: 10,
      });
    });
  });

  describe('getPendingStats', () => {
    it('debe retornar estadísticas de inscripciones próximas a expirar', async () => {
      mockPrismaService.inscripcionMensual.count
        .mockResolvedValueOnce(2) // alreadyExpirable
        .mockResolvedValueOnce(3) // expireIn7Days
        .mockResolvedValueOnce(5) // expireIn14Days
        .mockResolvedValueOnce(15); // total

      const stats = await service.getPendingStats();

      expect(stats).toEqual({
        alreadyExpirable: 2,
        expireIn7Days: 3,
        expireIn14Days: 5,
        expireIn30Days: 5, // 15 - 2 - 3 - 5
      });
    });
  });

  describe('fecha de corte', () => {
    it('debe usar 30 días como período de expiración', async () => {
      mockPrismaService.inscripcionMensual.updateMany.mockResolvedValue({
        count: 0,
      });
      mockPrismaService.inscripcion2026.updateMany.mockResolvedValue({
        count: 0,
      });
      mockPrismaService.pagoInscripcion2026.updateMany.mockResolvedValue({
        count: 0,
      });

      const now = new Date();
      await service.expirePendingPayments();

      const call =
        mockPrismaService.inscripcionMensual.updateMany.mock.calls[0][0];
      const cutoffDate = call.where.createdAt.lt as Date;

      // La fecha de corte debe ser aproximadamente 30 días antes
      const expectedCutoff = new Date(now);
      expectedCutoff.setDate(expectedCutoff.getDate() - 30);

      // Tolerancia de 1 segundo para evitar flaky tests
      const diff = Math.abs(cutoffDate.getTime() - expectedCutoff.getTime());
      expect(diff).toBeLessThan(1000);
    });
  });
});
