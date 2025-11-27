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
    membresia: {
      findUnique: jest.fn(),
    },
    inscripcion2026: {
      findUnique: jest.fn(),
    },
    pagoInscripcion2026: {
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

  describe('validateMembresia', () => {
    it('should validate membresia amount correctly', async () => {
      mockPrismaService.membresia.findUnique.mockResolvedValue({
        id: 'membresia-1',
        producto: {
          precio: 15000.0,
        },
      });

      const result = await service.validateMembresia('membresia-1', 15000.0);

      expect(result.isValid).toBe(true);
      expect(result.expectedAmount).toBe(15000.0);
    });

    it('should REJECT membresia with wrong amount', async () => {
      mockPrismaService.membresia.findUnique.mockResolvedValue({
        id: 'membresia-1',
        producto: {
          precio: 15000.0,
        },
      });

      const result = await service.validateMembresia('membresia-1', 100.0);

      expect(result.isValid).toBe(false);
    });

    it('should throw BadRequestException if membresia does not exist', async () => {
      mockPrismaService.membresia.findUnique.mockResolvedValue(null);

      await expect(
        service.validateMembresia('membresia-999', 15000.0),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateInscripcion2026', () => {
    it('should validate inscripcion 2026 amount', async () => {
      mockPrismaService.inscripcion2026.findUnique.mockResolvedValue({
        id: 'insc2026-1',
        total_mensual_actual: 8000.0,
      });

      const result = await service.validateInscripcion2026(
        'insc2026-1',
        8000.0,
      );

      expect(result.isValid).toBe(true);
    });

    it('should throw if inscripcion 2026 not found', async () => {
      mockPrismaService.inscripcion2026.findUnique.mockResolvedValue(null);

      await expect(
        service.validateInscripcion2026('insc2026-999', 8000.0),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validatePagoInscripcion2026', () => {
    it('should validate pago inscripcion 2026 (mensualidad)', async () => {
      mockPrismaService.pagoInscripcion2026.findUnique.mockResolvedValue({
        id: 'pago-1',
        monto: 3000.0,
        tipo: 'mensualidad',
      });

      const result = await service.validatePagoInscripcion2026(
        'pago-1',
        3000.0,
      );

      expect(result.isValid).toBe(true);
    });

    it('should validate pago inscripcion 2026 (inscripcion)', async () => {
      mockPrismaService.pagoInscripcion2026.findUnique.mockResolvedValue({
        id: 'pago-2',
        monto: 5000.0,
        tipo: 'inscripcion',
      });

      const result = await service.validatePagoInscripcion2026(
        'pago-2',
        5000.0,
      );

      expect(result.isValid).toBe(true);
    });

    it('should throw if pago not found', async () => {
      mockPrismaService.pagoInscripcion2026.findUnique.mockResolvedValue(null);

      await expect(
        service.validatePagoInscripcion2026('pago-999', 3000.0),
      ).rejects.toThrow(BadRequestException);
    });
  });

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

    it('should validate membresia by external reference', async () => {
      const externalRef = 'membresia-abc-tutor-def-producto-ghi';

      mockPrismaService.membresia.findUnique.mockResolvedValue({
        producto: { precio: 10000.0 },
      });

      const result = await service.validateByExternalReference(
        externalRef,
        10000.0,
      );

      expect(result.isValid).toBe(true);
      expect(mockPrismaService.membresia.findUnique).toHaveBeenCalledWith({
        where: { id: 'abc' },
        include: { producto: true },
      });
    });

    it('should validate inscripcion2026 by external reference', async () => {
      const externalRef = 'inscripcion2026-xyz-tutor-123-tipo-COLONIA';

      mockPrismaService.inscripcion2026.findUnique.mockResolvedValue({
        total_mensual_actual: 8000.0,
      });

      const result = await service.validateByExternalReference(
        externalRef,
        8000.0,
      );

      expect(result.isValid).toBe(true);
    });

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
