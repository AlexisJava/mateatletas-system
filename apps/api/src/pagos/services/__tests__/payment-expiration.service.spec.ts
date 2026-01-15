import { Test, TestingModule } from '@nestjs/testing';
import { PaymentExpirationService } from '../payment-expiration.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { EstadoPago } from '@prisma/client';

/**
 * PaymentExpirationService Tests
 *
 * REGLA DE NEGOCIO (Club):
 * - Día 1-9: Pago normal (VIGENTE)
 * - Día 10-12: Pago con 15% recargo (CON_RECARGO)
 * - Día 13+: Se anula inscripción (ANULABLE -> Anulado)
 */
describe('PaymentExpirationService', () => {
  let service: PaymentExpirationService;

  const mockPrismaService = {
    inscripcionMensual: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('anularInscripcionesVencidas (cron job)', () => {
    it('no debe anular si estamos antes del día 13', async () => {
      // Simular día 10 del mes
      const dia10 = new Date(2025, 0, 10);
      jest.useFakeTimers().setSystemTime(dia10);

      await service.anularInscripcionesVencidas();

      // No debe buscar inscripciones porque aún no es día 13+
      expect(
        mockPrismaService.inscripcionMensual.findMany,
      ).not.toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('debe buscar y anular inscripciones vencidas después del día 12', async () => {
      // Simular día 13 del mes
      const dia13 = new Date(2025, 0, 13);
      jest.useFakeTimers().setSystemTime(dia13);

      const inscripcionesPendientes = [
        { id: 'ins-1', periodo: '2025-01', precio_final: 10000 },
        { id: 'ins-2', periodo: '2025-01', precio_final: 15000 },
      ];

      mockPrismaService.inscripcionMensual.findMany.mockResolvedValue(
        inscripcionesPendientes,
      );
      mockPrismaService.inscripcionMensual.updateMany.mockResolvedValue({
        count: 2,
      });

      await service.anularInscripcionesVencidas();

      // Debe buscar inscripciones pendientes
      expect(
        mockPrismaService.inscripcionMensual.findMany,
      ).toHaveBeenCalledWith({
        where: {
          estado_pago: {
            in: [EstadoPago.Pendiente, EstadoPago.Parcial],
          },
          periodo: {
            lte: '2025-01',
          },
        },
        select: {
          id: true,
          periodo: true,
          precio_final: true,
        },
      });

      // Debe actualizar a Anulado
      expect(
        mockPrismaService.inscripcionMensual.updateMany,
      ).toHaveBeenCalledWith({
        where: {
          id: { in: ['ins-1', 'ins-2'] },
        },
        data: {
          estado_pago: EstadoPago.Anulado,
        },
      });

      jest.useRealTimers();
    });

    it('no debe fallar si no hay inscripciones para anular', async () => {
      const dia15 = new Date(2025, 0, 15);
      jest.useFakeTimers().setSystemTime(dia15);

      mockPrismaService.inscripcionMensual.findMany.mockResolvedValue([]);

      await expect(
        service.anularInscripcionesVencidas(),
      ).resolves.not.toThrow();

      jest.useRealTimers();
    });
  });

  describe('runManually', () => {
    it('debe retornar estadísticas correctas por estado', async () => {
      const dia5 = new Date(2025, 0, 5);
      jest.useFakeTimers().setSystemTime(dia5);

      const inscripciones = [
        { id: 'ins-1', periodo: '2025-01', precio_final: 10000 }, // VIGENTE (día 5 < 9)
        { id: 'ins-2', periodo: '2025-01', precio_final: 15000 }, // VIGENTE
      ];

      mockPrismaService.inscripcionMensual.findMany.mockResolvedValue(
        inscripciones,
      );

      const result = await service.runManually();

      expect(result).toEqual({
        anuladas: 0,
        conRecargo: 0,
        vigentes: 2,
      });

      jest.useRealTimers();
    });

    it('debe identificar inscripciones con recargo en días 10-12', async () => {
      const dia11 = new Date(2025, 0, 11);
      jest.useFakeTimers().setSystemTime(dia11);

      const inscripciones = [
        { id: 'ins-1', periodo: '2025-01', precio_final: 10000 }, // CON_RECARGO
      ];

      mockPrismaService.inscripcionMensual.findMany.mockResolvedValue(
        inscripciones,
      );
      mockPrismaService.inscripcionMensual.updateMany.mockResolvedValue({
        count: 0,
      });

      const result = await service.runManually();

      expect(result).toEqual({
        anuladas: 0,
        conRecargo: 1,
        vigentes: 0,
      });

      jest.useRealTimers();
    });

    it('debe anular inscripciones después del día 12', async () => {
      const dia14 = new Date(2025, 0, 14);
      jest.useFakeTimers().setSystemTime(dia14);

      const inscripciones = [
        { id: 'ins-1', periodo: '2025-01', precio_final: 10000 }, // ANULABLE
      ];

      mockPrismaService.inscripcionMensual.findMany.mockResolvedValue(
        inscripciones,
      );
      mockPrismaService.inscripcionMensual.updateMany.mockResolvedValue({
        count: 1,
      });

      const result = await service.runManually();

      expect(result).toEqual({
        anuladas: 1,
        conRecargo: 0,
        vigentes: 0,
      });

      expect(
        mockPrismaService.inscripcionMensual.updateMany,
      ).toHaveBeenCalledWith({
        where: { id: { in: ['ins-1'] } },
        data: { estado_pago: EstadoPago.Anulado },
      });

      jest.useRealTimers();
    });
  });

  describe('getPendingStats', () => {
    it('debe retornar estadísticas de inscripciones por estado', async () => {
      const dia10 = new Date(2025, 0, 10);
      jest.useFakeTimers().setSystemTime(dia10);

      // getPendingStats solo consulta periodo actual, así que el mock solo retorna ese periodo
      const inscripciones = [
        { id: 'ins-1', periodo: '2025-01', precio_final: 10000 }, // CON_RECARGO (día 10)
        { id: 'ins-2', periodo: '2025-01', precio_final: 15000 }, // CON_RECARGO
      ];

      mockPrismaService.inscripcionMensual.findMany.mockResolvedValue(
        inscripciones,
      );

      const stats = await service.getPendingStats();

      expect(stats).toEqual({
        vigentes: 0,
        conRecargo: 2,
        anulables: 0,
        total: 2,
      });

      jest.useRealTimers();
    });

    it('debe retornar todos vigentes antes del día 9', async () => {
      const dia5 = new Date(2025, 0, 5);
      jest.useFakeTimers().setSystemTime(dia5);

      const inscripciones = [
        { id: 'ins-1', periodo: '2025-01', precio_final: 10000 },
        { id: 'ins-2', periodo: '2025-01', precio_final: 15000 },
      ];

      mockPrismaService.inscripcionMensual.findMany.mockResolvedValue(
        inscripciones,
      );

      const stats = await service.getPendingStats();

      expect(stats).toEqual({
        vigentes: 2,
        conRecargo: 0,
        anulables: 0,
        total: 2,
      });

      jest.useRealTimers();
    });
  });
});
