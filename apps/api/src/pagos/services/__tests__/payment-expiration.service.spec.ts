import { Test, TestingModule } from '@nestjs/testing';
import { PaymentExpirationService } from '../payment-expiration.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { EstadoPago } from '@prisma/client';

/**
 * PaymentExpirationService Tests
 *
 * NOTA: El servicio ahora solo maneja InscripcionMensual.
 * Los sistemas de inscripciones2026 y pagos2026 fueron eliminados.
 */
describe('PaymentExpirationService', () => {
  let service: PaymentExpirationService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    inscripcionMensual: {
      updateMany: jest.fn(),
      count: jest.fn(),
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

    it('no debe fallar si no hay inscripciones pendientes', async () => {
      mockPrismaService.inscripcionMensual.updateMany.mockResolvedValue({
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

      const result = await service.runManually();

      expect(result).toEqual({
        inscripcionesMensuales: 5,
        total: 5,
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
