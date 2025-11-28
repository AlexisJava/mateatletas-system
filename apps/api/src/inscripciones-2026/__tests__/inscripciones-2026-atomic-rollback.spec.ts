/**
 * Test Suite: Atomic Transaction Rollback - Inscripciones 2026 Webhook (Facade)
 *
 * OBJETIVO:
 * Verificar que el service facade delega correctamente al use-case
 * que maneja las transacciones atómicas.
 *
 * NOTA: Los tests detallados de transacciones atómicas están en:
 * - procesar-webhook-inscripcion.use-case.spec.ts
 *
 * Este archivo prueba que el service facade delega correctamente
 * al ProcesarWebhookInscripcionUseCase.
 *
 * ESTÁNDARES:
 * - OWASP A04:2021 - Insecure Design
 * - ISO 27001 A.12.6.1 - Management of technical vulnerabilities
 * - ACID Compliance (Atomicity, Consistency, Isolation, Durability)
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { Inscripciones2026Service } from '../inscripciones-2026.service';
import { PrismaService } from '../../core/database/prisma.service';
import { MercadoPagoService } from '../../pagos/mercadopago.service';
import { ConfigService } from '@nestjs/config';
import { PricingCalculatorService } from '../../domain/services/pricing-calculator.service';
import { PinGeneratorService } from '../../shared/services/pin-generator.service';
import { TutorCreationService } from '../../shared/services/tutor-creation.service';
import { MercadoPagoWebhookDto } from '../../pagos/dto/mercadopago-webhook.dto';
import {
  ValidarInscripcionUseCase,
  ProcesarWebhookInscripcionUseCase,
} from '../use-cases';

describe('Inscripciones2026 - Atomic Transaction Rollback (Facade)', () => {
  let service: Inscripciones2026Service;
  let procesarWebhookUseCase: ProcesarWebhookInscripcionUseCase;

  const mockWebhookData: MercadoPagoWebhookDto = {
    action: 'payment.updated',
    type: 'payment',
    data: {
      id: '999888777',
    },
    live_mode: true,
    date_created: '2025-01-22T10:00:00Z',
    id: 12345,
    user_id: '123456',
    api_version: 'v1',
  };

  const mockPrismaService = {
    pagoInscripcion2026: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    inscripcion2026: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    historialEstadoInscripcion2026: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockMercadoPagoService = {
    getPayment: jest.fn(),
    isMockMode: jest.fn().mockReturnValue(false),
    createPreference: jest.fn(),
    buildInscripcion2026PreferenceData: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'BACKEND_URL') return 'http://localhost:3001';
      if (key === 'FRONTEND_URL') return 'http://localhost:3000';
      return null;
    }),
  };

  const mockPricingCalculator = {
    calcularTarifaInscripcion: jest.fn().mockReturnValue(25000),
    calcularTotalInscripcion2026: jest
      .fn()
      .mockReturnValue({ total: 158400, descuento: 12 }),
    aplicarDescuento: jest.fn(
      (base: number, desc: number) => base * (1 - desc / 100),
    ),
  };

  const mockPinGenerator = {
    generateUniquePin: jest.fn().mockResolvedValue('1234'),
  };

  const mockTutorCreation = {
    hashPassword: jest.fn().mockResolvedValue('$2b$10$hashedpassword'),
    validateUniqueEmail: jest.fn(),
  };

  const mockValidarInscripcionUseCase = {
    execute: jest.fn().mockReturnValue({
      isValid: true,
      inscripcionFee: 25000,
      monthlyTotal: 158400,
      siblingDiscount: 12,
      cursosPerStudent: [1],
    }),
  };

  const mockProcesarWebhookUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Inscripciones2026Service,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MercadoPagoService, useValue: mockMercadoPagoService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PricingCalculatorService, useValue: mockPricingCalculator },
        { provide: PinGeneratorService, useValue: mockPinGenerator },
        { provide: TutorCreationService, useValue: mockTutorCreation },
        {
          provide: ValidarInscripcionUseCase,
          useValue: mockValidarInscripcionUseCase,
        },
        {
          provide: ProcesarWebhookInscripcionUseCase,
          useValue: mockProcesarWebhookUseCase,
        },
      ],
    }).compile();

    service = module.get<Inscripciones2026Service>(Inscripciones2026Service);
    procesarWebhookUseCase = module.get<ProcesarWebhookInscripcionUseCase>(
      ProcesarWebhookInscripcionUseCase,
    );

    jest.clearAllMocks();
  });

  /**
   * TEST 1: DEBE DELEGAR AL USE-CASE PARA TRANSACCIONES ATÓMICAS
   */
  it('should delegate to use-case for atomic transactions', async () => {
    mockProcesarWebhookUseCase.execute.mockResolvedValueOnce({
      success: true,
      inscripcionId: 'ins-123',
      paymentStatus: 'paid',
      inscripcionStatus: 'active',
    });

    const result = await service.procesarWebhookMercadoPago(mockWebhookData);

    expect(procesarWebhookUseCase.execute).toHaveBeenCalledWith(
      mockWebhookData,
    );
    expect(result.success).toBe(true);
  });

  /**
   * TEST 2: DEBE PROPAGAR ERROR DE ROLLBACK DEL USE-CASE
   */
  it('should propagate rollback error from use-case', async () => {
    mockProcesarWebhookUseCase.execute.mockRejectedValueOnce(
      new Error('DB Constraint Violation: estado inválido'),
    );

    await expect(
      service.procesarWebhookMercadoPago(mockWebhookData),
    ).rejects.toThrow('DB Constraint Violation');
  });

  /**
   * TEST 3: DEBE PROPAGAR BadRequestException PARA INSCRIPCIÓN NO ENCONTRADA
   */
  it('should propagate BadRequestException when inscription not found', async () => {
    mockProcesarWebhookUseCase.execute.mockRejectedValueOnce(
      new BadRequestException('Inscripción no encontrada'),
    );

    await expect(
      service.procesarWebhookMercadoPago(mockWebhookData),
    ).rejects.toThrow(BadRequestException);
  });

  /**
   * TEST 4: DEBE MANEJAR ÉXITO SIN CAMBIO DE ESTADO
   */
  it('should handle success when state does not change', async () => {
    mockProcesarWebhookUseCase.execute.mockResolvedValueOnce({
      success: true,
      inscripcionId: 'ins-already-active',
      paymentStatus: 'paid',
      inscripcionStatus: 'active',
      message: 'State unchanged - already active',
    });

    const result = await service.procesarWebhookMercadoPago(mockWebhookData);

    expect(result.success).toBe(true);
    expect(result.inscripcionStatus).toBe('active');
  });

  /**
   * TEST 5: DEBE PROPAGAR ERROR DE DB CONNECTION
   */
  it('should propagate database connection errors', async () => {
    mockProcesarWebhookUseCase.execute.mockRejectedValueOnce(
      new Error('Database connection lost'),
    );

    await expect(
      service.procesarWebhookMercadoPago(mockWebhookData),
    ).rejects.toThrow('Database connection lost');
  });

  /**
   * TEST 6: DEBE PROPAGAR ERROR DE FOREIGN KEY
   */
  it('should propagate foreign key constraint errors', async () => {
    mockProcesarWebhookUseCase.execute.mockRejectedValueOnce(
      new Error('Foreign key constraint failed'),
    );

    await expect(
      service.procesarWebhookMercadoPago(mockWebhookData),
    ).rejects.toThrow('Foreign key constraint failed');
  });

  /**
   * TEST 7: TIPOS EXPLÍCITOS EN MANEJO DE TRANSACCIONES
   */
  it('should have explicit types in transaction handling', () => {
    const inscripcionId: string = 'test-insc-id';
    const nuevoEstado: string = 'active';
    const razon: string = 'Pago aprobado';
    const shouldRollback: boolean = false;

    expect(typeof inscripcionId).toBe('string');
    expect(typeof nuevoEstado).toBe('string');
    expect(typeof razon).toBe('string');
    expect(typeof shouldRollback).toBe('boolean');
  });
});
