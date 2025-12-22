import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PaymentAmountValidatorService } from '../payment-amount-validator.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { RedisService } from '../../../core/redis/redis.service';

describe('PaymentAmountValidatorService - FRAUD PREVENTION', () => {
  let service: PaymentAmountValidatorService;
  let prisma: PrismaService;

  const mockPrismaService = {
    inscripcionMensual: {
      findUnique: jest.fn(),
    },
    coloniaPago: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentAmountValidatorService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue('OK'),
            del: jest.fn().mockResolvedValue(1),
            exists: jest.fn().mockResolvedValue(false),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentAmountValidatorService>(
      PaymentAmountValidatorService,
    );
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('validateInscripcionMensual', () => {
    it('should validate exact amount match', async () => {
      mockPrismaService.inscripcionMensual.findUnique.mockResolvedValue({
        id: 'inscripcion-1',
        precio_final: 5000.0,
      });

      const result = await service.validateInscripcionMensual(
        'inscripcion-1',
        5000.0,
      );

      expect(result.isValid).toBe(true);
      expect(result.expectedAmount).toBe(5000.0);
      expect(result.receivedAmount).toBe(5000.0);
      expect(result.reason).toBeUndefined();
    });

    it('should REJECT payment with incorrect amount', async () => {
      mockPrismaService.inscripcionMensual.findUnique.mockResolvedValue({
        id: 'inscripcion-1',
        precio_final: 5000.0,
      });

      const result = await service.validateInscripcionMensual(
        'inscripcion-1',
        50.0, // ← FRAUDE: Solo pagó $50 en vez de $5000
      );

      expect(result.isValid).toBe(false);
      expect(result.expectedAmount).toBe(5000.0);
      expect(result.receivedAmount).toBe(50.0);
      expect(result.difference).toBe(4950.0);
      expect(result.reason).toContain('Amount mismatch');
    });

    it('should ACCEPT small differences within 1% tolerance (rounding)', async () => {
      mockPrismaService.inscripcionMensual.findUnique.mockResolvedValue({
        id: 'inscripcion-1',
        precio_final: 10000.0,
      });

      // 1% de $10,000 = $100 de tolerancia
      const result = await service.validateInscripcionMensual(
        'inscripcion-1',
        9950.0, // Diferencia de $50 (< 1%)
      );

      expect(result.isValid).toBe(true);
    });

    it('should REJECT differences exceeding 1% tolerance', async () => {
      mockPrismaService.inscripcionMensual.findUnique.mockResolvedValue({
        id: 'inscripcion-1',
        precio_final: 10000.0,
      });

      // 1% de $10,000 = $100 de tolerancia
      const result = await service.validateInscripcionMensual(
        'inscripcion-1',
        9800.0, // Diferencia de $200 (> 1%)
      );

      expect(result.isValid).toBe(false);
    });

    it('should throw BadRequestException if inscripcion does not exist', async () => {
      mockPrismaService.inscripcionMensual.findUnique.mockResolvedValue(null);

      await expect(
        service.validateInscripcionMensual('inscripcion-999', 5000.0),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.validateInscripcionMensual('inscripcion-999', 5000.0),
      ).rejects.toThrow('Inscripción mensual inscripcion-999 no encontrada');
    });

    it('should log error when fraud is detected', async () => {
      const loggerErrorSpy = jest.spyOn(service['logger'], 'error');

      mockPrismaService.inscripcionMensual.findUnique.mockResolvedValue({
        precio_final: 5000.0,
      });

      await service.validateInscripcionMensual('inscripcion-1', 50.0);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('FRAUDE DETECTADO'),
      );
    });
  });

  // NOTA: Tests de validateMembresia, validateInscripcion2026 y validatePagoInscripcion2026
  // fueron eliminados porque esos métodos fueron removidos del servicio (sistema legacy eliminado)

  describe('validateColoniaPago', () => {
    it('should validate colonia pago amount', async () => {
      mockPrismaService.coloniaPago.findUnique.mockResolvedValue({
        id: 'colonia-pago-1',
        monto: 12000.0,
      });

      const result = await service.validateColoniaPago(
        'colonia-pago-1',
        12000.0,
      );

      expect(result.isValid).toBe(true);
    });

    it('should throw if colonia pago not found', async () => {
      mockPrismaService.coloniaPago.findUnique.mockResolvedValue(null);

      await expect(
        service.validateColoniaPago('colonia-999', 12000.0),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateByExternalReference', () => {
    it('should validate inscripcion mensual by external reference', async () => {
      const externalRef = 'inscripcion-123-estudiante-456-producto-789';

      mockPrismaService.inscripcionMensual.findUnique.mockResolvedValue({
        precio_final: 5000.0,
      });

      const result = await service.validateByExternalReference(
        externalRef,
        5000.0,
      );

      expect(result.isValid).toBe(true);
      expect(
        mockPrismaService.inscripcionMensual.findUnique,
      ).toHaveBeenCalledWith({
        where: { id: '123' },
        select: { precio_final: true },
      });
    });

    // Tests de membresia e inscripcion2026 eliminados (sistema legacy removido)

    it('should throw error for unknown external reference format', async () => {
      const externalRef = 'unknown-format-123';

      await expect(
        service.validateByExternalReference(externalRef, 5000.0),
      ).rejects.toThrow(
        'Cannot determine payment type from external reference',
      );
    });
  });

  describe('Edge cases and security scenarios', () => {
    it('should handle Decimal type conversion correctly', async () => {
      mockPrismaService.inscripcionMensual.findUnique.mockResolvedValue({
        precio_final: 5000.5, // Decimal con centavos
      });

      const result = await service.validateInscripcionMensual(
        'inscripcion-1',
        5000.5,
      );

      expect(result.isValid).toBe(true);
    });

    it('should prevent zero-amount fraud', async () => {
      mockPrismaService.inscripcionMensual.findUnique.mockResolvedValue({
        precio_final: 5000.0,
      });

      const result = await service.validateInscripcionMensual(
        'inscripcion-1',
        0.0, // ← Intento de pagar $0
      );

      expect(result.isValid).toBe(false);
      expect(result.difference).toBe(5000.0);
    });

    it('should prevent negative amount fraud', async () => {
      mockPrismaService.inscripcionMensual.findUnique.mockResolvedValue({
        precio_final: 5000.0,
      });

      const result = await service.validateInscripcionMensual(
        'inscripcion-1',
        -100.0, // ← Monto negativo
      );

      expect(result.isValid).toBe(false);
    });

    it('should handle very large amounts correctly', async () => {
      mockPrismaService.inscripcionMensual.findUnique.mockResolvedValue({
        precio_final: 1000000.0, // $1M
      });

      const result = await service.validateInscripcionMensual(
        'inscripcion-1',
        1000000.0,
      );

      expect(result.isValid).toBe(true);
    });
  });
});
