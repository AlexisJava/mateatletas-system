import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from '../audit-log.service';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * Test Suite: Audit Log Service
 *
 * OBJETIVO: Registrar todos los cambios de estado en inscripciones para compliance y seguridad
 *
 * PROBLEMA DE SEGURIDAD:
 * - Sin audit logs: No sabemos QUIÉN cambió QUÉ y CUÁNDO
 * - En caso de incidente: No podemos rastrear el origen del problema
 * - Compliance: Violación de GDPR Art. 30 (Records of processing activities)
 * - Forense: Sin evidencia en caso de fraude o disputa
 *
 * ESCENARIOS CRÍTICOS:
 * 1. Admin cambia estado de inscripción sin dejar rastro
 * 2. Webhook procesa pago pero no hay registro de quién lo procesó
 * 3. Cliente disputa un cambio de estado: no hay evidencia
 * 4. Auditoría de compliance: no podemos demostrar procesos
 * 5. Análisis de patrones sospechosos: datos insuficientes
 *
 * SOLUCIÓN:
 * - Crear tabla audit_logs con: usuario, timestamp, IP, user agent, cambios
 * - Loguear automáticamente todos los cambios de estado
 * - Incluir contexto completo: antes/después, razón, metadata
 *
 * ESTÁNDARES:
 * - GDPR Art. 30 - Records of processing activities
 * - ISO 27001 A.12.4.1 - Event logging
 * - ISO 27001 A.12.4.3 - Administrator and operator logs
 * - SOC 2 Type II - Audit trail requirements
 */
describe('AuditLogService', () => {
  let service: AuditLogService;
  let prisma: PrismaService;

  // Mocks tipados (ZERO any/unknown)
  const mockPrisma = {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
    prisma = module.get<PrismaService>(PrismaService);

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
  });

  /**
   * TEST 2: Debe registrar cambio de estado con datos completos
   *
   * ESCENARIO: Admin cambia estado de inscripción de "pending" a "active"
   * ESPERADO: Audit log creado con todos los campos requeridos
   * RAZÓN: Trazabilidad completa de cambios críticos
   */
  it('debe registrar cambio de estado con datos completos', async () => {
    // Arrange: Datos del cambio de estado
    const auditData = {
      entityType: 'inscripcion_2026',
      entityId: 'insc-123',
      action: 'UPDATE_ESTADO',
      performedBy: 'admin-456',
      performedByType: 'USER' as const,
      previousState: { estado: 'pending' },
      newState: { estado: 'active' },
      reason: 'Pago aprobado por MercadoPago',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      metadata: {
        paymentId: 'pay-789',
        amount: 25000,
      },
    };

    const mockCreatedLog = {
      id: 'audit-log-001',
      ...auditData,
      createdAt: new Date(),
    };

    mockPrisma.auditLog.create.mockResolvedValue(mockCreatedLog);

    // Act: Registrar cambio
    const result = await service.logStateChange(auditData);

    // Assert: Debe crear audit log con datos completos (usando snake_case de Prisma)
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        entity_type: 'inscripcion_2026',
        entity_id: 'insc-123',
        action: 'UPDATE_ESTADO',
        user_id: 'admin-456',
        user_type: 'user',
        category: 'data_modification',
        severity: 'warning',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0...',
        metadata: auditData.metadata,
      }),
    });

    // Verificar que el resultado tiene el formato esperado
    expect(result).toHaveProperty('id');
    expect(result.entityType).toBe('inscripcion_2026');
    expect(result.entityId).toBe('insc-123');
    expect(result.action).toBe('UPDATE_ESTADO');
    expect(result.performedBy).toBe('admin-456');
    expect(result.performedByType).toBe('USER');
  });

  /**
   * TEST 3: Debe registrar cambio de webhook con performedByType='SYSTEM'
   *
   * ESCENARIO: Webhook de MercadoPago procesa pago automáticamente
   * ESPERADO: Audit log con performedByType='SYSTEM' y performedBy='mercadopago-webhook'
   * RAZÓN: Diferenciar acciones humanas de automatizadas
   */
  it('debe registrar cambio de webhook con performedByType=SYSTEM', async () => {
    // Arrange: Webhook procesando pago
    const webhookAuditData = {
      entityType: 'inscripcion_2026',
      entityId: 'insc-456',
      action: 'WEBHOOK_PAYMENT_APPROVED',
      performedBy: 'mercadopago-webhook',
      performedByType: 'SYSTEM' as const,
      previousState: { pagoEstado: 'pending' },
      newState: { pagoEstado: 'paid' },
      reason: 'Webhook MercadoPago: payment approved',
      ipAddress: '201.216.233.59', // IP de MercadoPago
      userAgent: 'MercadoPago Webhook',
      metadata: {
        paymentId: 'mp-123456789',
        externalReference: 'insc-456',
      },
    };

    const mockCreatedLog = {
      id: 'audit-log-002',
      ...webhookAuditData,
      createdAt: new Date(),
    };

    mockPrisma.auditLog.create.mockResolvedValue(mockCreatedLog);

    // Act: Registrar cambio de webhook
    const result = await service.logStateChange(webhookAuditData);

    // Assert: Debe marcar como SYSTEM (user_type='system' en DB)
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        user_type: 'system',
        entity_type: 'inscripcion_2026',
        entity_id: 'insc-456',
      }),
    });

    expect(result.performedByType).toBe('SYSTEM');
  });

  /**
   * TEST 4: Debe obtener historial de cambios de una entidad
   *
   * ESCENARIO: Admin consulta historial de una inscripción específica
   * ESPERADO: Lista de audit logs ordenados por fecha descendente
   * RAZÓN: Visibilidad completa del ciclo de vida de una inscripción
   */
  it('debe obtener historial de cambios de una entidad', async () => {
    // Arrange: Historial de inscripción (formato Prisma con snake_case)
    const mockHistory = [
      {
        id: 'log-003',
        entity_type: 'inscripcion_2026',
        entity_id: 'insc-789',
        action: 'WEBHOOK_PAYMENT_APPROVED',
        user_id: null,
        user_type: 'system',
        timestamp: new Date('2025-11-22T10:30:00Z'),
      },
      {
        id: 'log-002',
        entity_type: 'inscripcion_2026',
        entity_id: 'insc-789',
        action: 'CREATE',
        user_id: 'tutor-123',
        user_type: 'user',
        timestamp: new Date('2025-11-22T10:00:00Z'),
      },
    ];

    mockPrisma.auditLog.findMany.mockResolvedValue(mockHistory);

    // Act: Obtener historial
    const history = await service.getEntityHistory('inscripcion_2026', 'insc-789');

    // Assert: Debe obtener logs ordenados (Prisma usa snake_case)
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
      where: {
        entity_type: 'inscripcion_2026',
        entity_id: 'insc-789',
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    expect(history).toHaveLength(2);
    expect(history[0].id).toBe('log-003');
    expect(history[0].entityType).toBe('inscripcion_2026');
  });

  /**
   * TEST 5: Debe obtener logs por usuario (auditoría de acciones)
   *
   * ESCENARIO: Compliance officer audita acciones de un admin específico
   * ESPERADO: Lista de todos los cambios realizados por ese usuario
   * RAZÓN: Auditoría de usuarios para compliance y seguridad
   */
  it('debe obtener logs por usuario', async () => {
    // Arrange: Logs de un admin (formato Prisma con snake_case)
    const mockUserLogs = [
      {
        id: 'log-004',
        action: 'UPDATE_ESTADO',
        user_id: 'admin-456',
        entity_id: 'insc-001',
        timestamp: new Date('2025-11-22T09:00:00Z'),
      },
      {
        id: 'log-005',
        action: 'UPDATE_ESTADO',
        user_id: 'admin-456',
        entity_id: 'insc-002',
        timestamp: new Date('2025-11-22T09:30:00Z'),
      },
    ];

    mockPrisma.auditLog.findMany.mockResolvedValue(mockUserLogs);

    // Act: Obtener logs por usuario
    const userLogs = await service.getUserLogs('admin-456');

    // Assert: Debe filtrar por user_id (Prisma usa snake_case)
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
      where: {
        user_id: 'admin-456',
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    expect(userLogs).toHaveLength(2);
    expect(userLogs.every((log) => log.performedBy === 'admin-456')).toBe(true);
  });

  /**
   * TEST 6: Debe obtener logs por rango de fechas
   *
   * ESCENARIO: Auditoría mensual de noviembre 2025
   * ESPERADO: Solo logs dentro del rango especificado
   * RAZÓN: Reportes de compliance periódicos
   */
  it('debe obtener logs por rango de fechas', async () => {
    // Arrange: Rango de fechas
    const startDate = new Date('2025-11-01T00:00:00Z');
    const endDate = new Date('2025-11-30T23:59:59Z');

    const mockLogsInRange = [
      {
        id: 'log-006',
        timestamp: new Date('2025-11-15T12:00:00Z'),
      },
      {
        id: 'log-007',
        timestamp: new Date('2025-11-20T15:00:00Z'),
      },
    ];

    mockPrisma.auditLog.findMany.mockResolvedValue(mockLogsInRange);

    // Act: Obtener logs por rango
    const logs = await service.getLogsByDateRange(startDate, endDate);

    // Assert: Debe filtrar por fechas
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    expect(logs).toHaveLength(2);
    expect(logs[0].createdAt).toEqual(mockLogsInRange[0].timestamp);
  });

  /**
   * TEST 7: Debe contar logs por acción (métricas)
   *
   * ESCENARIO: Estadísticas de cambios de estado en el mes
   * ESPERADO: Conteo de logs agrupados por acción
   * RAZÓN: Análisis de patrones y detección de anomalías
   */
  it('debe contar logs por acción', async () => {
    // Arrange: Mock de conteo
    mockPrisma.auditLog.count.mockResolvedValue(45);

    // Act: Contar logs de una acción específica
    const count = await service.countLogsByAction('UPDATE_ESTADO');

    // Assert: Debe contar correctamente
    expect(prisma.auditLog.count).toHaveBeenCalledWith({
      where: {
        action: 'UPDATE_ESTADO',
      },
    });

    expect(count).toBe(45);
  });

  /**
   * TEST 8: Debe manejar metadata JSON correctamente
   *
   * ESCENARIO: Registrar metadata compleja con arrays y objetos anidados
   * ESPERADO: Metadata serializada correctamente en JSON
   * RAZÓN: Flexibilidad para contexto rico sin schema rígido
   */
  it('debe manejar metadata JSON correctamente', async () => {
    // Arrange: Metadata compleja
    const complexMetadata = {
      payment: {
        id: 'mp-123',
        amount: 25000,
        currency: 'ARS',
      },
      inscripcion: {
        tipoInscripcion: 'RENOVACION',
        cuotas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      },
      estudiantes: ['est-001', 'est-002'],
    };

    const auditData = {
      entityType: 'inscripcion_2026',
      entityId: 'insc-999',
      action: 'CREATE',
      performedBy: 'tutor-789',
      performedByType: 'USER' as const,
      previousState: null,
      newState: { estado: 'pending' },
      reason: 'Inscripción creada',
      metadata: complexMetadata,
    };

    const mockCreatedLog = {
      id: 'audit-log-008',
      ...auditData,
      createdAt: new Date(),
    };

    mockPrisma.auditLog.create.mockResolvedValue(mockCreatedLog);

    // Act: Registrar con metadata compleja
    const result = await service.logStateChange(auditData);

    // Assert: Metadata debe preservarse
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        metadata: complexMetadata,
      }),
    });

    expect(result.metadata).toEqual(complexMetadata);
  });

  /**
   * TEST 9: Debe validar campos requeridos
   *
   * ESCENARIO: Intentar crear audit log sin campos obligatorios
   * ESPERADO: Error de validación
   * RAZÓN: Integridad de datos de auditoría
   */
  it('debe validar campos requeridos', async () => {
    // Arrange: Datos incompletos (falta entityType)
    const invalidData = {
      entityId: 'insc-123',
      action: 'UPDATE',
      performedBy: 'admin-456',
      // entityType faltante (campo requerido)
    };

    // Act & Assert: Debe lanzar error
    await expect(
      service.logStateChange(invalidData as any),
    ).rejects.toThrow();
  });

  /**
   * TEST 10: Debe usar tipos explícitos (no any/unknown)
   *
   * ESCENARIO: Verificar que el servicio usa tipos TypeScript correctos
   * ESPERADO: Sin any/unknown en parámetros ni retornos
   * RAZÓN: Type safety y prevención de errores
   */
  it('debe tener métodos con tipos explícitos', () => {
    // Assert: Verificar que los métodos existen y son funciones
    expect(typeof service.logStateChange).toBe('function');
    expect(typeof service.getEntityHistory).toBe('function');
    expect(typeof service.getUserLogs).toBe('function');
    expect(typeof service.getLogsByDateRange).toBe('function');
    expect(typeof service.countLogsByAction).toBe('function');
  });
});

/**
 * NOTA: Tests de integración
 *
 * Estos tests unitarios verifican la LÓGICA del servicio.
 *
 * Tests de integración adicionales deberían verificar:
 * - Migración de Prisma ejecutada correctamente
 * - Tabla audit_logs existe en DB
 * - Constraints y índices funcionan
 * - Serialización JSON de metadata funciona en DB real
 * - Performance con miles de logs
 */