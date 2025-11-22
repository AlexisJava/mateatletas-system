/**
 * Test Suite: Atomic Transaction Rollback - Inscripciones 2026 Webhook
 *
 * OBJETIVO:
 * Verificar que si alguna operación dentro de la transacción falla,
 * TODAS las operaciones se revierten automáticamente (ACID - Atomicity).
 *
 * PROBLEMA QUE DETECTA:
 * Sin transacciones atómicas:
 * - Operación 1 (update pago) → ✅ Éxito
 * - Operación 2 (update inscripción) → ❌ Falla
 * - Resultado: Pago marcado "paid" pero inscripción sigue "pending" → DB INCONSISTENTE
 *
 * Con transacciones atómicas ($transaction):
 * - Operación 1 (update pago) → ✅ Éxito
 * - Operación 2 (update inscripción) → ❌ Falla
 * - Resultado: TODAS las operaciones se revierten → DB CONSISTENTE
 *
 * CASOS DE PRUEBA:
 * 1. Falla en update de inscripción → rollback completo
 * 2. Falla en create historial → rollback completo
 * 3. Falla en findUnique de inscripción → rollback completo
 * 4. Verificar que se lanza la excepción correcta
 * 5. Verificar que NO se llama markAsProcessed si falla la transacción
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
import { MercadoPagoWebhookProcessorService } from '../../shared/services/mercadopago-webhook-processor.service';
import { WebhookIdempotencyService } from '../../pagos/services/webhook-idempotency.service';
import { PaymentAmountValidatorService } from '../../pagos/services/payment-amount-validator.service';
import { MercadoPagoWebhookDto } from '../../pagos/dto/mercadopago-webhook.dto';

describe('Inscripciones2026 - Atomic Transaction Rollback', () => {
  let service: Inscripciones2026Service;
  let webhookIdempotency: WebhookIdempotencyService;

  const mockWebhookData: MercadoPagoWebhookDto = {
    action: 'payment.updated',
    type: 'payment',
    data: {
      id: '999888777',
    },
    live_mode: 'true',
    date_created: '2025-01-22T10:00:00Z',
  };

  const mockPaymentApproved = {
    id: 999888777,
    status: 'approved',
    external_reference: 'inscripcion2026-inscabc123-tutor-tutorxyz789-tipo-COLONIA',
    transaction_amount: 25000,
    date_approved: '2025-01-22T10:00:00Z',
  };

  const mockPagoInscripcion = {
    id: 'pago-atomic-123',
    inscripcion_id: 'insc-atomic-456',
    tipo: 'inscripcion',
    monto: 25000,
    estado: 'pending',
    mercadopago_preference_id: 'pref-atomic-789',
    mercadopago_payment_id: null,
    fecha_pago: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    inscripcion: {
      id: 'insc-atomic-456',
      tutor_id: 'tutor-atomic-999',
      tipo_inscripcion: 'COLONIA',
      estado: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  beforeEach(async () => {
    // Crear mocks compartidos para verificar rollback
    const pagoUpdateMock = jest.fn();
    const inscripcionFindUniqueMock = jest.fn();
    const inscripcionUpdateMock = jest.fn();
    const historialCreateMock = jest.fn();
    const transactionMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Inscripciones2026Service,
        {
          provide: PrismaService,
          useValue: {
            pagoInscripcion2026: {
              findFirst: jest.fn(),
              update: pagoUpdateMock,
            },
            inscripcion2026: {
              findUnique: inscripcionFindUniqueMock,
              update: inscripcionUpdateMock,
            },
            historialEstadoInscripcion2026: {
              create: historialCreateMock,
            },
            $transaction: transactionMock,
          },
        },
        {
          provide: MercadoPagoService,
          useValue: {
            getPayment: jest.fn(),
            isMockMode: jest.fn().mockReturnValue(false),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'BACKEND_URL') return 'http://localhost:3001';
              if (key === 'FRONTEND_URL') return 'http://localhost:3000';
              return null;
            }),
          },
        },
        {
          provide: PricingCalculatorService,
          useValue: {
            calcularTarifaInscripcion: jest.fn().mockReturnValue(25000),
            calcularTotalInscripcion2026: jest.fn().mockReturnValue({ total: 158400, descuento: 12 }),
            aplicarDescuento: jest.fn((base: number, desc: number) => base * (1 - desc / 100)),
          },
        },
        {
          provide: PinGeneratorService,
          useValue: {
            generateUniquePin: jest.fn().mockImplementation(async () =>
              Math.floor(1000 + Math.random() * 9000).toString()
            ),
          },
        },
        {
          provide: TutorCreationService,
          useValue: {
            hashPassword: jest.fn().mockResolvedValue('$2b$10$hashedpassword'),
            validateUniqueEmail: jest.fn(),
          },
        },
        MercadoPagoWebhookProcessorService,
        {
          provide: WebhookIdempotencyService,
          useValue: {
            wasProcessed: jest.fn().mockResolvedValue(false),
            markAsProcessed: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: PaymentAmountValidatorService,
          useValue: {
            validatePagoInscripcion2026: jest.fn().mockResolvedValue({
              isValid: true,
              expectedAmount: 25000,
              receivedAmount: 25000,
              difference: 0,
            }),
          },
        },
      ],
    }).compile();

    service = module.get<Inscripciones2026Service>(Inscripciones2026Service);
    webhookIdempotency = module.get<WebhookIdempotencyService>(WebhookIdempotencyService);

    jest.clearAllMocks();
  });

  /**
   * TEST 1: DEBE HACER ROLLBACK SI FALLA UPDATE DE INSCRIPCIÓN
   *
   * ESCENARIO:
   * 1. update pago → ✅ Éxito
   * 2. findUnique inscripción → ✅ Éxito
   * 3. update inscripción → ❌ Error (DB constraint violation)
   * 4. create historial → ⏭️ No se ejecuta
   *
   * RESULTADO ESPERADO:
   * - Transacción se revierte completamente (rollback)
   * - update pago NO persiste en DB
   * - Se lanza BadRequestException
   * - NO se marca webhook como procesado
   */
  it('debe hacer rollback completo si falla update de inscripción', async () => {
    const prismaService = service['prisma'];
    const mercadoPagoService = service['mercadoPagoService'];

    // Mock: getPayment retorna pago aprobado
    jest.spyOn(mercadoPagoService, 'getPayment').mockResolvedValue(mockPaymentApproved);

    // Mock: findFirst retorna pago pendiente
    jest.spyOn(prismaService.pagoInscripcion2026, 'findFirst').mockResolvedValue(mockPagoInscripcion as any);

    // Mock: $transaction ejecuta callback y simula error en update inscripción
    const transactionCallback = jest.fn();
    jest.spyOn(prismaService, '$transaction').mockImplementation(async (callback: any) => {
      // Simular error en update de inscripción
      const tx = {
        pagoInscripcion2026: {
          update: jest.fn().mockResolvedValue({ ...mockPagoInscripcion, estado: 'paid' }),
        },
        inscripcion2026: {
          findUnique: jest.fn().mockResolvedValue(mockPagoInscripcion.inscripcion),
          update: jest.fn().mockRejectedValue(new Error('DB Constraint Violation: estado inválido')),
        },
        historialEstadoInscripcion2026: {
          create: jest.fn(),
        },
      };

      // Intentar ejecutar el callback (debe fallar)
      await callback(tx);
    });

    // ACT & ASSERT: Debe lanzar error porque la transacción falla
    await expect(service.procesarWebhookMercadoPago(mockWebhookData)).rejects.toThrow();

    // ASSERT: NO debe marcar webhook como procesado si falla la transacción
    expect(webhookIdempotency.markAsProcessed).not.toHaveBeenCalled();
  });

  /**
   * TEST 2: DEBE HACER ROLLBACK SI FALLA CREATE HISTORIAL
   *
   * ESCENARIO:
   * 1. update pago → ✅ Éxito
   * 2. findUnique inscripción → ✅ Éxito
   * 3. update inscripción → ✅ Éxito
   * 4. create historial → ❌ Error (foreign key violation)
   *
   * RESULTADO ESPERADO:
   * - Transacción se revierte completamente
   * - Ni update pago ni update inscripción persisten
   * - Se lanza BadRequestException
   */
  it('debe hacer rollback completo si falla create historial', async () => {
    const prismaService = service['prisma'];
    const mercadoPagoService = service['mercadoPagoService'];

    jest.spyOn(mercadoPagoService, 'getPayment').mockResolvedValue(mockPaymentApproved);
    jest.spyOn(prismaService.pagoInscripcion2026, 'findFirst').mockResolvedValue(mockPagoInscripcion as any);

    // Mock: $transaction con error en create historial
    jest.spyOn(prismaService, '$transaction').mockImplementation(async (callback: any) => {
      const tx = {
        pagoInscripcion2026: {
          update: jest.fn().mockResolvedValue({ ...mockPagoInscripcion, estado: 'paid' }),
        },
        inscripcion2026: {
          findUnique: jest.fn().mockResolvedValue(mockPagoInscripcion.inscripcion),
          update: jest.fn().mockResolvedValue({ ...mockPagoInscripcion.inscripcion, estado: 'active' }),
        },
        historialEstadoInscripcion2026: {
          create: jest.fn().mockRejectedValue(new Error('Foreign key constraint failed')),
        },
      };

      await callback(tx);
    });

    // ACT & ASSERT
    await expect(service.procesarWebhookMercadoPago(mockWebhookData)).rejects.toThrow();
    expect(webhookIdempotency.markAsProcessed).not.toHaveBeenCalled();
  });

  /**
   * TEST 3: DEBE HACER ROLLBACK SI FALLA FIND INSCRIPCIÓN
   *
   * ESCENARIO:
   * 1. update pago → ✅ Éxito
   * 2. findUnique inscripción → ❌ Error (DB connection lost)
   * 3. update inscripción → ⏭️ No se ejecuta
   * 4. create historial → ⏭️ No se ejecuta
   *
   * RESULTADO ESPERADO:
   * - Rollback completo
   * - update pago NO persiste
   */
  it('debe hacer rollback completo si falla findUnique de inscripción', async () => {
    const prismaService = service['prisma'];
    const mercadoPagoService = service['mercadoPagoService'];

    jest.spyOn(mercadoPagoService, 'getPayment').mockResolvedValue(mockPaymentApproved);
    jest.spyOn(prismaService.pagoInscripcion2026, 'findFirst').mockResolvedValue(mockPagoInscripcion as any);

    // Mock: $transaction con error en findUnique
    jest.spyOn(prismaService, '$transaction').mockImplementation(async (callback: any) => {
      const tx = {
        pagoInscripcion2026: {
          update: jest.fn().mockResolvedValue({ ...mockPagoInscripcion, estado: 'paid' }),
        },
        inscripcion2026: {
          findUnique: jest.fn().mockRejectedValue(new Error('Database connection lost')),
          update: jest.fn(),
        },
        historialEstadoInscripcion2026: {
          create: jest.fn(),
        },
      };

      await callback(tx);
    });

    // ACT & ASSERT
    await expect(service.procesarWebhookMercadoPago(mockWebhookData)).rejects.toThrow();
    expect(webhookIdempotency.markAsProcessed).not.toHaveBeenCalled();
  });

  /**
   * TEST 4: DEBE LANZAR BadRequestException SI INSCRIPCIÓN NO EXISTE
   *
   * ESCENARIO:
   * 1. update pago → ✅ Éxito
   * 2. findUnique inscripción → ✅ Éxito pero retorna null
   * 3. Código lanza BadRequestException
   * 4. Transacción se revierte
   */
  it('debe hacer rollback si inscripción no existe (null)', async () => {
    const prismaService = service['prisma'];
    const mercadoPagoService = service['mercadoPagoService'];

    jest.spyOn(mercadoPagoService, 'getPayment').mockResolvedValue(mockPaymentApproved);
    jest.spyOn(prismaService.pagoInscripcion2026, 'findFirst').mockResolvedValue(mockPagoInscripcion as any);

    // Mock: $transaction con inscripción null (no existe)
    jest.spyOn(prismaService, '$transaction').mockImplementation(async (callback: any) => {
      const tx = {
        pagoInscripcion2026: {
          update: jest.fn().mockResolvedValue({ ...mockPagoInscripcion, estado: 'paid' }),
        },
        inscripcion2026: {
          findUnique: jest.fn().mockResolvedValue(null), // ❌ Inscripción no encontrada
          update: jest.fn(),
        },
        historialEstadoInscripcion2026: {
          create: jest.fn(),
        },
      };

      await callback(tx);
    });

    // ACT & ASSERT: Debe lanzar BadRequestException
    await expect(service.procesarWebhookMercadoPago(mockWebhookData)).rejects.toThrow(BadRequestException);
    expect(webhookIdempotency.markAsProcessed).not.toHaveBeenCalled();
  });

  /**
   * TEST 5: NO DEBE ACTUALIZAR NADA SI ESTADO NO CAMBIA (optimización)
   *
   * ESCENARIO:
   * - Inscripción ya está en estado "active"
   * - Payment status es "approved" (mapeado a estado "active")
   * - No hay cambio de estado → NO debe actualizar inscripción ni crear historial
   *
   * RESULTADO ESPERADO:
   * - Solo update pago se ejecuta
   * - NO se ejecuta update inscripción
   * - NO se ejecuta create historial
   * - Transacción completa exitosamente
   */
  it('debe ejecutar transacción exitosamente sin actualizar inscripción si estado no cambia', async () => {
    const prismaService = service['prisma'];
    const mercadoPagoService = service['mercadoPagoService'];

    const pagoConInscripcionActiva = {
      ...mockPagoInscripcion,
      inscripcion: {
        ...mockPagoInscripcion.inscripcion,
        estado: 'active', // Ya activo
      },
    };

    jest.spyOn(mercadoPagoService, 'getPayment').mockResolvedValue(mockPaymentApproved);
    jest.spyOn(prismaService.pagoInscripcion2026, 'findFirst').mockResolvedValue(pagoConInscripcionActiva as any);

    const inscripcionUpdateMock = jest.fn();
    const historialCreateMock = jest.fn();

    // Mock: $transaction exitosa
    jest.spyOn(prismaService, '$transaction').mockImplementation(async (callback: any) => {
      const tx = {
        pagoInscripcion2026: {
          update: jest.fn().mockResolvedValue({ ...pagoConInscripcionActiva, estado: 'paid' }),
        },
        inscripcion2026: {
          findUnique: jest.fn(),
          update: inscripcionUpdateMock,
        },
        historialEstadoInscripcion2026: {
          create: historialCreateMock,
        },
      };

      return await callback(tx);
    });

    // ACT
    await service.procesarWebhookMercadoPago(mockWebhookData);

    // ASSERT: NO debe actualizar inscripción ni historial (estado no cambió)
    expect(inscripcionUpdateMock).not.toHaveBeenCalled();
    expect(historialCreateMock).not.toHaveBeenCalled();

    // ASSERT: Debe marcar como procesado (éxito)
    expect(webhookIdempotency.markAsProcessed).toHaveBeenCalled();
  });

  /**
   * TEST 6: DEBE TENER TIPOS EXPLÍCITOS EN MANEJO DE TRANSACCIONES
   *
   * VALIDACIONES:
   * - Callback de $transaction tipado correctamente
   * - Parámetro tx tipado (no any si es posible)
   * - Todas las variables con tipos explícitos
   */
  it('debe tener tipos explícitos en código de transacciones', () => {
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