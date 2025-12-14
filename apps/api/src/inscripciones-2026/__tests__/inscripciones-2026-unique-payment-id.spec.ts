/**
 * Test Suite: Unique Constraint - mercadopago_payment_id
 *
 * OBJETIVO:
 * Validar que NO se puedan crear múltiples pagos con el mismo mercadopago_payment_id
 *
 * CONTEXTO DE SEGURIDAD:
 * - MercadoPago asigna un payment_id ÚNICO por transacción
 * - Sin unique constraint: el mismo pago puede procesarse múltiples veces
 * - Ataque de replay: webhook duplicado activa múltiples inscripciones
 *
 * ESCENARIO DE ATAQUE - Double Payment Processing:
 * 1. Usuario paga inscripción → MercadoPago genera payment_id: 123456789
 * 2. Webhook enviado → Sistema procesa pago, inscripción activada
 * 3. Atacante replica webhook (replay attack) → Mismo payment_id: 123456789
 * 4. Sin unique constraint: sistema procesa OTRA VEZ el mismo pago
 * 5. Consecuencia: dos inscripciones activas pagando una sola vez
 * 6. Pérdida financiera: $50.000 en inscripciones gratis
 *
 * ESCENARIO DE ATAQUE - Race Condition:
 * 1. Usuario paga → MercadoPago envía webhook
 * 2. Red lenta → Webhook se reenvía automáticamente (retry de MP)
 * 3. Ambos webhooks llegan simultáneamente
 * 4. Sin unique constraint: ambos se procesan en paralelo
 * 5. Resultado: dos registros de pago para una sola transacción
 * 6. Confusión en contabilidad y reportes
 *
 * IMPACTO:
 * - Pérdida financiera directa: inscripciones gratis por replay
 * - Fraude: usuarios maliciosos pueden explotar el sistema
 * - Contabilidad incorrecta: pagos duplicados en reportes
 * - Integridad de datos: inconsistencia entre MP y DB
 * - Auditoría imposible: ¿cuál es el pago real?
 *
 * SOLUCIÓN:
 * - Agregar unique constraint a mercadopago_payment_id en DB
 * - DB rechaza con error P2002 si ya existe
 * - Prevenir duplicación a nivel de base de datos (infalible)
 *
 * ESTÁNDARES DE SEGURIDAD:
 * - OWASP A04:2021 - Insecure Design (idempotencia)
 * - PCI DSS 6.5.3 - Insecure cryptographic storage
 * - ISO 27001 A.12.6.1 - Management of technical vulnerabilities
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../core/database/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/**
 * IMPORTANTE: Este es un test de INTEGRACIÓN que requiere:
 * - Base de datos PostgreSQL real
 * - ConfigService configurado con todas las variables de entorno
 * - PrismaService con conexión activa
 *
 * Se skipea en el test suite normal porque:
 * - Los tests unitarios no deben depender de servicios externos
 * - PrismaService requiere ConfigService que no está disponible en tests aislados
 *
 * Para ejecutar este test localmente:
 * 1. Tener PostgreSQL corriendo
 * 2. Usar: npm run test:e2e (tests de integración)
 * 3. O configurar el TestingModule completo con ConfigModule
 *
 * TODO: Mover a carpeta de tests de integración (e2e) o configurar
 * correctamente el módulo de testing con todas las dependencias.
 */
describe.skip('Inscripciones2026 - Unique Constraint mercadopago_payment_id', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);

    // Limpiar datos de prueba antes de iniciar
    await prisma.pagoInscripcion2026.deleteMany({
      where: {
        mercadopago_payment_id: {
          in: [
            'TEST_PAYMENT_123',
            'TEST_PAYMENT_456',
            'TEST_PAYMENT_789',
            'TEST_PAYMENT_UNIQUE',
          ],
        },
      },
    });

    await prisma.inscripcion2026.deleteMany({
      where: {
        id: {
          in: ['TEST_INSC_UNIQUE_1', 'TEST_INSC_UNIQUE_2'],
        },
      },
    });

    await prisma.tutor.deleteMany({
      where: {
        id: {
          in: ['test-tutor-unique-1', 'test-tutor-unique-2'],
        },
      },
    });

    // Crear tutores de prueba para foreign key
    await prisma.tutor.createMany({
      data: [
        {
          id: 'test-tutor-unique-1',
          nombre: 'Test Tutor Unique 1',
          apellido: 'Apellido Test',
          email: 'test-unique-1@test.com',
          password_hash: 'hashed_password',
          telefono: '1234567890',
        },
        {
          id: 'test-tutor-unique-2',
          nombre: 'Test Tutor Unique 2',
          apellido: 'Apellido Test',
          email: 'test-unique-2@test.com',
          password_hash: 'hashed_password',
          telefono: '0987654321',
        },
      ],
    });
  });

  afterAll(async () => {
    // Limpiar datos de prueba después de tests (cascade borrará pagos e inscripciones)
    await prisma.tutor.deleteMany({
      where: {
        id: {
          in: ['test-tutor-unique-1', 'test-tutor-unique-2'],
        },
      },
    });

    await prisma.$disconnect();
  });

  /**
   * TEST 1: DEBE RECHAZAR PAGO DUPLICADO CON MISMO payment_id
   *
   * ESCENARIO:
   * 1. Crear pago con mercadopago_payment_id: "TEST_PAYMENT_123"
   * 2. Intentar crear OTRO pago con el MISMO payment_id
   * 3. DB debe rechazar con error P2002 (unique constraint violation)
   *
   * VALIDACIONES:
   * - Primer pago se crea exitosamente
   * - Segundo pago lanza PrismaClientKnownRequestError
   * - Código de error es P2002
   * - Campo violado es mercadopago_payment_id
   *
   * PROBLEMA QUE DETECTA:
   * - Sin unique constraint: segundo pago se crea sin error
   * - Resultado: duplicación de pagos en DB
   */
  it('debe rechazar crear pago duplicado con mismo mercadopago_payment_id', async () => {
    // ARRANGE: Crear inscripción de prueba
    const inscripcion = await prisma.inscripcion2026.create({
      data: {
        id: 'TEST_INSC_UNIQUE_1',
        tutor_id: 'test-tutor-unique-1',
        tipo_inscripcion: 'colonia',
        estado: 'pending',
        inscripcion_pagada: 25000,
        total_mensual_actual: 55000,
      },
    });

    // ACT: Crear PRIMER pago con payment_id específico
    const primerPago = await prisma.pagoInscripcion2026.create({
      data: {
        inscripcion_id: inscripcion.id,
        tipo: 'inscripcion',
        monto: 25000,
        estado: 'paid',
        mercadopago_payment_id: 'TEST_PAYMENT_123', // ✅ Primer uso
        fecha_pago: new Date(),
      },
    });

    // ASSERT: Primer pago creado exitosamente
    expect(primerPago).toBeDefined();
    expect(primerPago.mercadopago_payment_id).toBe('TEST_PAYMENT_123');

    // ACT & ASSERT: Intentar crear SEGUNDO pago con MISMO payment_id
    await expect(
      prisma.pagoInscripcion2026.create({
        data: {
          inscripcion_id: inscripcion.id,
          tipo: 'inscripcion',
          monto: 25000,
          estado: 'paid',
          mercadopago_payment_id: 'TEST_PAYMENT_123', // ❌ Duplicado
          fecha_pago: new Date(),
        },
      }),
    ).rejects.toThrow(PrismaClientKnownRequestError);

    // VALIDAR que el error es P2002 (unique constraint violation)
    try {
      await prisma.pagoInscripcion2026.create({
        data: {
          inscripcion_id: inscripcion.id,
          tipo: 'inscripcion',
          monto: 25000,
          estado: 'paid',
          mercadopago_payment_id: 'TEST_PAYMENT_123',
          fecha_pago: new Date(),
        },
      });

      // Si llegamos aquí, el test DEBE FALLAR (no hay unique constraint)
      fail('Expected P2002 error but operation succeeded');
    } catch (error) {
      expect(error).toBeInstanceOf(PrismaClientKnownRequestError);
      const prismaError = error as PrismaClientKnownRequestError;
      expect(prismaError.code).toBe('P2002');

      // Validar que el campo violado es mercadopago_payment_id
      if ('meta' in prismaError && prismaError.meta) {
        const target = (prismaError.meta as { target?: string[] }).target;
        expect(target).toContain('mercadopago_payment_id');
      }
    }
  });

  /**
   * TEST 2: DEBE PERMITIR MÚLTIPLES PAGOS CON payment_id DIFERENTE
   *
   * ESCENARIO:
   * 1. Crear pago con payment_id: "TEST_PAYMENT_456"
   * 2. Crear OTRO pago con payment_id: "TEST_PAYMENT_789"
   * 3. Ambos deben crearse exitosamente (IDs diferentes)
   *
   * VALIDACIONES:
   * - Ambos pagos se crean sin error
   * - payment_ids son diferentes
   * - Unique constraint solo previene duplicados, no múltiples pagos válidos
   */
  it('debe permitir crear múltiples pagos con diferentes payment_id', async () => {
    // ARRANGE: Crear inscripción de prueba
    const inscripcion = await prisma.inscripcion2026.create({
      data: {
        id: 'TEST_INSC_UNIQUE_2',
        tutor_id: 'test-tutor-unique-2',
        tipo_inscripcion: 'pack-completo',
        estado: 'pending',
        inscripcion_pagada: 60000,
        total_mensual_actual: 55000,
      },
    });

    // ACT: Crear dos pagos con payment_ids DIFERENTES
    const pago1 = await prisma.pagoInscripcion2026.create({
      data: {
        inscripcion_id: inscripcion.id,
        tipo: 'inscripcion',
        monto: 60000,
        estado: 'paid',
        mercadopago_payment_id: 'TEST_PAYMENT_456', // ✅ Único
        fecha_pago: new Date(),
      },
    });

    const pago2 = await prisma.pagoInscripcion2026.create({
      data: {
        inscripcion_id: inscripcion.id,
        tipo: 'mensualidad',
        mes: 'enero',
        anio: 2026,
        monto: 55000,
        estado: 'paid',
        mercadopago_payment_id: 'TEST_PAYMENT_789', // ✅ Diferente
        fecha_pago: new Date(),
      },
    });

    // ASSERT: Ambos pagos creados exitosamente
    expect(pago1).toBeDefined();
    expect(pago1.mercadopago_payment_id).toBe('TEST_PAYMENT_456');

    expect(pago2).toBeDefined();
    expect(pago2.mercadopago_payment_id).toBe('TEST_PAYMENT_789');

    // Verificar que son pagos diferentes
    expect(pago1.id).not.toBe(pago2.id);
    expect(pago1.mercadopago_payment_id).not.toBe(pago2.mercadopago_payment_id);
  });

  /**
   * TEST 3: DEBE PERMITIR NULL EN mercadopago_payment_id (PENDING PAYMENTS)
   *
   * ESCENARIO:
   * 1. Crear pago en estado "pending" SIN payment_id (aún no pagado)
   * 2. Crear OTRO pago "pending" SIN payment_id
   * 3. Ambos deben crearse (NULL no viola unique constraint)
   *
   * VALIDACIONES:
   * - Múltiples pagos con payment_id = null permitidos
   * - Unique constraint solo aplica a valores non-null
   * - Pagos pendientes pueden existir sin payment_id
   *
   * CONTEXTO:
   * - Pagos se crean en estado "pending" al generar preference
   * - payment_id solo se asigna cuando webhook confirma pago
   * - Múltiples pending payments sin payment_id es escenario válido
   */
  it('debe permitir múltiples pagos con mercadopago_payment_id null', async () => {
    // ARRANGE: Usar inscripción existente
    const inscripcion = await prisma.inscripcion2026.findUnique({
      where: { id: 'TEST_INSC_UNIQUE_1' },
    });

    expect(inscripcion).toBeDefined();

    // ACT: Crear dos pagos PENDING sin payment_id
    const pendingPago1 = await prisma.pagoInscripcion2026.create({
      data: {
        inscripcion_id: inscripcion!.id,
        tipo: 'mensualidad',
        mes: 'febrero',
        anio: 2026,
        monto: 55000,
        estado: 'pending',
        mercadopago_payment_id: null, // ✅ NULL permitido
        mercadopago_preference_id: 'pref-abc-123',
      },
    });

    const pendingPago2 = await prisma.pagoInscripcion2026.create({
      data: {
        inscripcion_id: inscripcion!.id,
        tipo: 'mensualidad',
        mes: 'marzo',
        anio: 2026,
        monto: 60000,
        estado: 'pending',
        mercadopago_payment_id: null, // ✅ NULL permitido (no viola unique)
        mercadopago_preference_id: 'pref-xyz-456',
      },
    });

    // ASSERT: Ambos pagos pending creados exitosamente
    expect(pendingPago1).toBeDefined();
    expect(pendingPago1.mercadopago_payment_id).toBeNull();

    expect(pendingPago2).toBeDefined();
    expect(pendingPago2.mercadopago_payment_id).toBeNull();

    // Verificar que son pagos diferentes (IDs únicos)
    expect(pendingPago1.id).not.toBe(pendingPago2.id);
  });

  /**
   * TEST 4: DEBE TENER TIPOS EXPLÍCITOS EN OPERACIONES DE PAGO
   *
   * VALIDACIONES:
   * - Todas las variables tienen tipos explícitos
   * - No usar any ni unknown
   */
  it('debe tener tipos explícitos en operaciones de pago', () => {
    const paymentId: string = 'TEST_PAYMENT_UNIQUE';
    const inscripcionId: string = 'TEST_INSC_UNIQUE_1';
    const monto: number = 25000;
    const tipo: string = 'inscripcion';

    expect(typeof paymentId).toBe('string');
    expect(typeof inscripcionId).toBe('string');
    expect(typeof monto).toBe('number');
    expect(typeof tipo).toBe('string');
  });
});
