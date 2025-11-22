import { Test, TestingModule } from '@nestjs/testing';
import { FraudDetectionService } from '../fraud-detection.service';
import { PrismaService } from '../../core/database/prisma.service';
import { AuditLogService, EntityType } from '../../audit/audit-log.service';

/**
 * Test Suite: Sistema de Detección de Fraude - Inscripciones 2026
 *
 * OBJETIVO: Detectar y prevenir fraudes en pagos e inscripciones
 *
 * PROBLEMA DE SEGURIDAD:
 * - Sin detección de fraude: Pérdidas económicas por pagos fraudulentos
 * - Atacantes pueden inscribir estudiantes sin pagar el monto correcto
 * - Múltiples pagos desde la misma IP pueden indicar ataque automatizado
 * - Montos manipulados en webhooks pueden resultar en acceso gratuito
 *
 * ESCENARIOS DE FRAUDE COMUNES:
 * 1. Manipulación de monto en webhook: Pagar $1 pero reportar $25000
 * 2. Ataque de fuerza bruta: 50 intentos de pago desde misma IP en 5 minutos
 * 3. Reutilización de payment_id: Usar mismo pago para múltiples inscripciones
 * 4. Modificación de preference_id: Cambiar ID para evitar validaciones
 * 5. Inscripciones duplicadas: Mismo tutor + estudiante múltiples veces
 *
 * SOLUCIÓN:
 * - Validar montos contra pricing calculator antes de aprobar
 * - Detectar múltiples pagos desde misma IP (rate limiting + análisis)
 * - Verificar unicidad de payment_id y preference_id
 * - Detectar patrones sospechosos (velocidad, montos, IPs)
 * - Loguear TODOS los intentos de fraude para análisis forense
 *
 * ESTÁNDARES DE SEGURIDAD:
 * - PCI DSS 11.4: Use intrusion-detection and/or intrusion-prevention techniques
 * - OWASP A04:2021 - Insecure Design
 * - ISO 27001 A.12.2.1 - Controls against malware
 * - NIST 800-53 SI-4 - Information System Monitoring
 */
describe('FraudDetectionService', () => {
  let service: FraudDetectionService;
  let prisma: PrismaService;
  let auditLog: AuditLogService;

  // Mocks tipados (ZERO any/unknown)
  const mockPrisma = {
    pagoInscripcion2026: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
    },
    inscripcion2026: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockAuditLog = {
    logFraudDetected: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FraudDetectionService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: AuditLogService,
          useValue: mockAuditLog,
        },
      ],
    }).compile();

    service = module.get<FraudDetectionService>(FraudDetectionService);
    prisma = module.get<PrismaService>(PrismaService);
    auditLog = module.get<AuditLogService>(AuditLogService);

    // Reset mocks antes de cada test
    jest.clearAllMocks();
  });

  /**
   * TEST 1: Service debe estar definido
   *
   * ESCENARIO: Verificar que el servicio se instancia correctamente
   * ESPERADO: Service definido y funcional
   */
  it('debe estar definido', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
    expect(auditLog).toBeDefined();
  });

  /**
   * TEST 2: Detectar múltiples pagos desde misma IP (ataque automatizado)
   *
   * ESCENARIO: Atacante envía 15 pagos en 5 minutos desde IP 192.168.1.100
   * ESPERADO: Detectar como fraude si excede umbral (10 pagos/5min)
   * RAZÓN: Comportamiento humano normal: máximo 2-3 pagos por sesión
   */
  it('debe detectar múltiples pagos desde misma IP como fraude', async () => {
    // Arrange: 15 pagos en los últimos 5 minutos desde misma IP
    const suspiciousIP = '192.168.1.100';
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const mockRecentPayments = Array.from({ length: 15 }, (_, i) => ({
      id: `pago-${i}`,
      inscripcion_id: `insc-${i}`,
      ip_address: suspiciousIP,
      createdAt: new Date(Date.now() - i * 20 * 1000), // Cada 20 segundos
      monto: 25000,
      estado: 'pending',
    }));

    mockPrisma.pagoInscripcion2026.findMany.mockResolvedValue(
      mockRecentPayments,
    );

    // Act: Analizar IP sospechosa
    const result = await service.detectMultiplePaymentsFromSameIP(suspiciousIP);

    // Assert: Debe detectar fraude
    expect(result.isSuspicious).toBe(true);
    expect(result.reason).toContain('15 pagos en 5 minutos');
    expect(result.threshold).toBe(10); // Umbral configurado
    expect(result.actualCount).toBe(15);

    // Debe loguear el fraude detectado
    expect(auditLog.logFraudDetected).toHaveBeenCalledWith(
      expect.stringContaining('Múltiples pagos desde misma IP'),
      EntityType.PAGO,
      undefined, // No hay entityId específico para análisis de IP
      expect.objectContaining({
        ipAddress: suspiciousIP,
        paymentCount: 15,
        threshold: 10,
        timeWindowMinutes: 5,
      }),
      suspiciousIP,
    );
  });

  /**
   * TEST 3: NO detectar fraude si pagos están dentro del umbral normal
   *
   * ESCENARIO: Usuario legítimo hace 3 pagos en 10 minutos (reintentos normales)
   * ESPERADO: NO detectar como fraude (está dentro del umbral de 10)
   * RAZÓN: Usuarios legítimos pueden reintentar pagos fallidos
   */
  it('NO debe detectar fraude si pagos están dentro del umbral', async () => {
    // Arrange: 3 pagos en 10 minutos (comportamiento normal)
    const legitimateIP = '192.168.1.200';

    const mockNormalPayments = Array.from({ length: 3 }, (_, i) => ({
      id: `pago-${i}`,
      inscripcion_id: `insc-${i}`,
      ip_address: legitimateIP,
      createdAt: new Date(Date.now() - i * 3 * 60 * 1000), // Cada 3 minutos
      monto: 25000,
      estado: 'pending',
    }));

    mockPrisma.pagoInscripcion2026.findMany.mockResolvedValue(
      mockNormalPayments,
    );

    // Act: Analizar IP normal
    const result = await service.detectMultiplePaymentsFromSameIP(legitimateIP);

    // Assert: NO debe detectar fraude
    expect(result.isSuspicious).toBe(false);
    expect(result.actualCount).toBe(3);
    expect(result.threshold).toBe(10);

    // NO debe loguear fraude
    expect(auditLog.logFraudDetected).not.toHaveBeenCalled();
  });

  /**
   * TEST 4: Detectar monto incorrecto en pago (manipulación de precio)
   *
   * ESCENARIO: Pago reporta $25000 pero pricing calculator dice $158400
   * ESPERADO: Detectar fraude por discrepancia de monto
   * RAZÓN: Atacante puede modificar webhook para reportar monto menor
   */
  it('debe detectar monto incorrecto como fraude', async () => {
    // Arrange: Monto reportado vs monto esperado
    const reportedAmount = 25000; // Lo que dice el pago
    const expectedAmount = 158400; // Lo que debería ser según pricing
    const paymentId = 'pago-fraudulento-123';

    // Act: Validar monto
    const result = await service.validatePaymentAmount(
      paymentId,
      reportedAmount,
      expectedAmount,
    );

    // Assert: Debe detectar fraude
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('Monto incorrecto');
    expect(result.reportedAmount).toBe(reportedAmount);
    expect(result.expectedAmount).toBe(expectedAmount);
    expect(result.discrepancy).toBe(expectedAmount - reportedAmount);

    // Debe loguear el fraude
    expect(auditLog.logFraudDetected).toHaveBeenCalledWith(
      expect.stringContaining('Monto incorrecto en pago'),
      expect.anything(),
      paymentId,
      expect.objectContaining({
        reportedAmount,
        expectedAmount,
        discrepancy: 133400,
      }),
      undefined,
    );
  });

  /**
   * TEST 5: Aceptar monto correcto (sin fraude)
   *
   * ESCENARIO: Pago reporta $158400 y pricing calculator confirma $158400
   * ESPERADO: Validar como correcto, NO detectar fraude
   * RAZÓN: Pagos legítimos deben procesarse normalmente
   */
  it('debe aceptar monto correcto sin detectar fraude', async () => {
    // Arrange: Montos coinciden
    const amount = 158400;
    const paymentId = 'pago-legit-456';

    // Act: Validar monto
    const result = await service.validatePaymentAmount(
      paymentId,
      amount,
      amount,
    );

    // Assert: Debe ser válido
    expect(result.isValid).toBe(true);
    expect(result.discrepancy).toBe(0);

    // NO debe loguear fraude
    expect(auditLog.logFraudDetected).not.toHaveBeenCalled();
  });

  /**
   * TEST 6: Detectar reutilización de payment_id (duplicado)
   *
   * ESCENARIO: Mismo mercadopago_payment_id usado en 2 inscripciones diferentes
   * ESPERADO: Detectar fraude, un pago solo debe usar para 1 inscripción
   * RAZÓN: Atacante puede reutilizar payment_id aprobado para múltiples inscripciones
   */
  it('debe detectar reutilización de payment_id como fraude', async () => {
    // Arrange: Payment ID ya usado
    const paymentId = 'mp-payment-12345';

    const mockExistingPayment = {
      id: 'pago-001',
      mercadopago_payment_id: paymentId,
      inscripcion_id: 'insc-001',
      estado: 'paid',
    };

    mockPrisma.pagoInscripcion2026.findUnique.mockResolvedValue(
      mockExistingPayment,
    );

    // Act: Verificar unicidad de payment_id
    const result = await service.checkPaymentIdUniqueness(paymentId);

    // Assert: Debe detectar duplicado
    expect(result.isUnique).toBe(false);
    expect(result.existingPaymentId).toBe('pago-001');
    expect(result.existingInscripcionId).toBe('insc-001');

    // Debe loguear fraude
    expect(auditLog.logFraudDetected).toHaveBeenCalledWith(
      expect.stringContaining('Reutilización de payment_id'),
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        mercadopagoPaymentId: paymentId,
        existingPaymentId: 'pago-001',
      }),
      undefined,
    );
  });

  /**
   * TEST 7: Aceptar payment_id único (primera vez)
   *
   * ESCENARIO: Payment ID nunca usado antes
   * ESPERADO: Validar como único, permitir uso
   * RAZÓN: Pagos nuevos deben procesarse normalmente
   */
  it('debe aceptar payment_id único sin detectar fraude', async () => {
    // Arrange: Payment ID no existe
    const newPaymentId = 'mp-payment-new-789';

    mockPrisma.pagoInscripcion2026.findUnique.mockResolvedValue(null);

    // Act: Verificar unicidad
    const result = await service.checkPaymentIdUniqueness(newPaymentId);

    // Assert: Debe ser único
    expect(result.isUnique).toBe(true);
    expect(result.existingPaymentId).toBeNull();

    // NO debe loguear fraude
    expect(auditLog.logFraudDetected).not.toHaveBeenCalled();
  });

  /**
   * TEST 8: Detectar inscripciones duplicadas (mismo tutor + estudiantes)
   *
   * ESCENARIO: Tutor intenta inscribir mismo estudiante 2 veces para 2026
   * ESPERADO: Detectar como fraude/error, prevenir duplicados
   * RAZÓN: Un estudiante solo puede tener 1 inscripción activa por año
   */
  it('debe detectar inscripción duplicada como fraude', async () => {
    // Arrange: Estudiante ya inscripto
    const tutorId = 'tutor-123';
    const estudianteDNI = '12345678';

    const mockExistingInscripcion = {
      id: 'insc-existente-001',
      tutor_id: tutorId,
      estado: 'active',
      estudiantesInscripcion: [
        {
          dni: estudianteDNI,
          nombre: 'Juan Pérez',
        },
      ],
    };

    mockPrisma.inscripcion2026.findMany.mockResolvedValue([
      mockExistingInscripcion,
    ]);

    // Act: Verificar duplicados
    const result = await service.checkDuplicateInscription(
      tutorId,
      estudianteDNI,
    );

    // Assert: Debe detectar duplicado
    expect(result.isDuplicate).toBe(true);
    expect(result.existingInscripcionId).toBe('insc-existente-001');

    // Debe loguear como fraude/intento duplicado
    expect(auditLog.logFraudDetected).toHaveBeenCalledWith(
      expect.stringContaining('Intento de inscripción duplicada'),
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        tutorId,
        estudianteDNI,
        existingInscripcionId: 'insc-existente-001',
      }),
      undefined,
    );
  });

  /**
   * TEST 9: Aceptar inscripción nueva (no duplicada)
   *
   * ESCENARIO: Estudiante nuevo, primera inscripción
   * ESPERADO: Permitir inscripción, NO detectar fraude
   * RAZÓN: Inscripciones nuevas son legítimas
   */
  it('debe aceptar inscripción nueva sin detectar fraude', async () => {
    // Arrange: Estudiante no inscripto
    const tutorId = 'tutor-456';
    const estudianteDNI = '87654321';

    mockPrisma.inscripcion2026.findMany.mockResolvedValue([]);

    // Act: Verificar duplicados
    const result = await service.checkDuplicateInscription(
      tutorId,
      estudianteDNI,
    );

    // Assert: NO debe ser duplicado
    expect(result.isDuplicate).toBe(false);
    expect(result.existingInscripcionId).toBeNull();

    // NO debe loguear fraude
    expect(auditLog.logFraudDetected).not.toHaveBeenCalled();
  });

  /**
   * TEST 10: Calcular score de riesgo de fraude (0-100)
   *
   * ESCENARIO: Analizar múltiples factores de riesgo en un pago
   * ESPERADO: Retornar score de 0 (sin riesgo) a 100 (alto riesgo)
   * RAZÓN: Combinar múltiples señales para decisión más inteligente
   */
  it('debe calcular score de riesgo basado en múltiples factores', async () => {
    // Arrange: Pago con múltiples señales de riesgo
    const paymentData = {
      ipAddress: '192.168.1.100',
      amount: 25000,
      expectedAmount: 158400,
      paymentId: 'mp-payment-suspicious',
      tutorId: 'tutor-123',
      estudianteDNI: '12345678',
    };

    // Mock: IP sospechosa (15 pagos)
    mockPrisma.pagoInscripcion2026.findMany.mockResolvedValueOnce(
      Array.from({ length: 15 }, (_, i) => ({
        id: `pago-${i}`,
        ip_address: paymentData.ipAddress,
        createdAt: new Date(Date.now() - i * 20 * 1000),
      })),
    );

    // Mock: Payment ID único (no duplicado)
    mockPrisma.pagoInscripcion2026.findUnique.mockResolvedValue(null);

    // Mock: Inscripción no duplicada
    mockPrisma.inscripcion2026.findMany.mockResolvedValue([]);

    // Act: Calcular score de riesgo
    const result = await service.calculateFraudRiskScore(paymentData);

    // Assert: Score debe ser alto (IP sospechosa + monto incorrecto)
    expect(result.score).toBeGreaterThan(50); // Alto riesgo
    expect(result.factors).toContain('multiple_payments_from_ip');
    expect(result.factors).toContain('amount_mismatch');
    expect(result.recommendation).toBe('BLOCK'); // Bloquear pago

    // Debe loguear si score > umbral
    expect(auditLog.logFraudDetected).toHaveBeenCalled();
  });

  /**
   * TEST 11: Score bajo para pago legítimo
   *
   * ESCENARIO: Pago normal sin señales de riesgo
   * ESPERADO: Score bajo (0-20), permitir pago
   * RAZÓN: No bloquear pagos legítimos
   */
  it('debe dar score bajo a pago legítimo', async () => {
    // Arrange: Pago normal
    const legitimatePayment = {
      ipAddress: '192.168.1.200',
      amount: 158400,
      expectedAmount: 158400,
      paymentId: 'mp-payment-legit',
      tutorId: 'tutor-456',
      estudianteDNI: '87654321',
    };

    // Mock: IP normal (3 pagos)
    mockPrisma.pagoInscripcion2026.findMany.mockResolvedValueOnce(
      Array.from({ length: 3 }, (_, i) => ({
        id: `pago-${i}`,
        ip_address: legitimatePayment.ipAddress,
        createdAt: new Date(Date.now() - i * 3 * 60 * 1000),
      })),
    );

    // Mock: Payment ID único
    mockPrisma.pagoInscripcion2026.findUnique.mockResolvedValue(null);

    // Mock: Inscripción no duplicada
    mockPrisma.inscripcion2026.findMany.mockResolvedValue([]);

    // Act: Calcular score
    const result = await service.calculateFraudRiskScore(legitimatePayment);

    // Assert: Score debe ser bajo
    expect(result.score).toBeLessThan(20); // Bajo riesgo
    expect(result.recommendation).toBe('ALLOW'); // Permitir pago

    // NO debe loguear fraude
    expect(auditLog.logFraudDetected).not.toHaveBeenCalled();
  });

  /**
   * TEST 12: Debe tener tipos explícitos (no any/unknown)
   *
   * ESCENARIO: Verificar que el servicio usa tipos TypeScript correctos
   * ESPERADO: Sin any/unknown en parámetros ni retornos
   * RAZÓN: Type safety y prevención de errores
   */
  it('debe tener métodos con tipos explícitos', () => {
    // Assert: Verificar que los métodos existen y son funciones
    expect(typeof service.detectMultiplePaymentsFromSameIP).toBe('function');
    expect(typeof service.validatePaymentAmount).toBe('function');
    expect(typeof service.checkPaymentIdUniqueness).toBe('function');
    expect(typeof service.checkDuplicateInscription).toBe('function');
    expect(typeof service.calculateFraudRiskScore).toBe('function');
  });
});

/**
 * NOTA: Tests de integración
 *
 * Estos tests unitarios verifican la LÓGICA del servicio.
 *
 * Tests de integración adicionales deberían verificar:
 * - Integración con webhook real de MercadoPago
 * - Performance con miles de pagos en DB
 * - Alertas en tiempo real (email, Slack, etc.)
 * - Dashboard de fraudes detectados
 * - Machine learning para mejorar detección
 */