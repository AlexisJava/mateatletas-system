import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Categorías de eventos de auditoría
 */
export enum AuditCategory {
  AUTH = 'auth',
  PAYMENT = 'payment',
  USER_MANAGEMENT = 'user_management',
  DATA_MODIFICATION = 'data_modification',
  SECURITY = 'security',
  SYSTEM = 'system',
}

/**
 * Severidad de eventos
 */
export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Tipos de acciones
 */
export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_CHANGE = 'password_change',
  MFA_ENABLED = 'mfaEnabled',
  MFA_DISABLED = 'mfa_disabled',
  PAYMENT_CREATED = 'payment_created',
  PAYMENT_APPROVED = 'payment_approved',
  PAYMENT_REJECTED = 'payment_rejected',
  WEBHOOK_RECEIVED = 'webhook_received',
  PERMISSION_CHANGE = 'permission_change',
  CONFIG_CHANGE = 'config_change',
  FRAUD_DETECTED = 'fraud_detected',
}

/**
 * Tipos de entidades del sistema
 */
export enum EntityType {
  TUTOR = 'Tutor',
  ADMIN = 'Admin',
  DOCENTE = 'Docente',
  ESTUDIANTE = 'Estudiante',
  PAGO = 'Pago',
  INSCRIPCION = 'Inscripcion',
  MEMBRESIA = 'Membresia',
  AUTH = 'Auth',
  WEBHOOK = 'Webhook',
  CONFIG = 'Config',
  MFA = 'MFA',
  SYSTEM = 'System',
}

/**
 * Interfaz para crear un log de auditoría
 */
export interface CreateAuditLogInput {
  /** ID del usuario que realizó la acción (null para sistema) */
  userId?: string;
  /** Tipo de usuario (tutor, admin, docente, estudiante, system) */
  userType?: string;
  /** Email del usuario (para facilitar búsquedas) */
  userEmail?: string;
  /** Acción realizada */
  action: AuditAction | string;
  /** Entidad afectada */
  entityType: EntityType | string;
  /** ID de la entidad afectada */
  entityId?: string;
  /** Descripción legible de la acción */
  description: string;
  /** Cambios realizados (before/after) - NO incluir passwords */
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  /** Metadata adicional (IP, user agent, etc.) */
  metadata?: Record<string, unknown>;
  /** Severidad del evento */
  severity?: AuditSeverity;
  /** Categoría del evento */
  category: AuditCategory;
  /** IP desde donde se realizó la acción */
  ipAddress?: string;
  /** User agent del cliente */
  userAgent?: string;
  /** Request ID (para correlación con logs) */
  requestId?: string;
}

/**
 * Servicio de Audit Logs
 *
 * PROPÓSITO:
 * - Registrar todas las acciones críticas del sistema para seguridad y compliance
 * - Detectar fraudes, accesos no autorizados y anomalías
 * - Facilitar auditorías y forense digital
 * - Cumplir con regulaciones (GDPR, etc.)
 *
 * QUÉ SE LOGUEA:
 * - ✅ Autenticación (login, logout, MFA, fallos)
 * - ✅ Cambios en usuarios (crear, modificar, eliminar)
 * - ✅ Operaciones de pago (creación, aprobación, rechazo)
 * - ✅ Webhooks de MercadoPago (recepción y procesamiento)
 * - ✅ Cambios de configuración del sistema
 * - ✅ Eventos de seguridad (fraude detectado, permisos)
 *
 * REGLAS:
 * - ❌ NO loguear passwords, tokens, secrets
 * - ✅ SÍ loguear cambios en precios, estados de pago
 * - ✅ SÍ loguear IPs y user agents
 * - ✅ Logs indefinidos (no se borran automáticamente)
 *
 * @injectable
 */
@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un registro de auditoría en la base de datos
   *
   * @param input - Datos del evento de auditoría
   * @returns El log creado
   */
  async log(input: CreateAuditLogInput) {
    try {
      const auditLog = await this.prisma.auditLog.create({
        data: {
          timestamp: new Date(),
          userId: input.userId ?? null,
          userType: input.userType ?? null,
          userEmail: input.userEmail ?? null,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId ?? null,
          description: input.description,
          changes: input.changes
            ? (input.changes as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          metadata: input.metadata
            ? (input.metadata as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          severity: input.severity ?? AuditSeverity.INFO,
          category: input.category,
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
          requestId: input.requestId ?? null,
        },
      });

      // Log crítico también va a consola para alertas inmediatas
      if (input.severity === AuditSeverity.CRITICAL) {
        this.logger.error(
          `🚨 AUDIT CRITICAL: ${input.description}`,
          JSON.stringify(
            {
              action: input.action,
              entityType: input.entityType,
              entityId: input.entityId,
              userId: input.userId,
              userEmail: input.userEmail,
            },
            null,
            2,
          ),
        );
      }

      return auditLog;
    } catch (error) {
      // Si falla el audit log, NO queremos que la operación principal falle
      // Solo logueamos el error y continuamos
      this.logger.error(
        `❌ Error al crear audit log: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        error instanceof Error ? error.stack : undefined,
      );
      return null;
    }
  }

  /**
   * Loguea un evento de autenticación exitosa
   */
  async logLogin(
    userId: string,
    userEmail: string,
    userType: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.log({
      userId,
      userType,
      userEmail,
      action: AuditAction.LOGIN,
      entityType: EntityType.AUTH,
      description: `Usuario ${userEmail} (${userType}) inició sesión exitosamente`,
      category: AuditCategory.AUTH,
      severity: AuditSeverity.INFO,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Loguea un intento de login fallido
   */
  async logLoginFailed(
    email: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.log({
      userEmail: email,
      action: AuditAction.LOGIN_FAILED,
      entityType: EntityType.AUTH,
      description: `Intento de login fallido para ${email}: ${reason}`,
      category: AuditCategory.SECURITY,
      severity: AuditSeverity.WARNING,
      ipAddress,
      userAgent,
      metadata: { reason },
    });
  }

  /**
   * Loguea un logout
   */
  async logLogout(
    userId: string,
    userEmail: string,
    userType: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.log({
      userId,
      userType,
      userEmail,
      action: AuditAction.LOGOUT,
      entityType: EntityType.AUTH,
      description: `Usuario ${userEmail} (${userType}) cerró sesión`,
      category: AuditCategory.AUTH,
      severity: AuditSeverity.INFO,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Loguea habilitación de MFA
   */
  async logMfaEnabled(userId: string, userEmail: string) {
    return this.log({
      userId,
      userType: 'admin',
      userEmail,
      action: AuditAction.MFA_ENABLED,
      entityType: EntityType.MFA,
      entityId: userId,
      description: `Admin ${userEmail} habilitó MFA (Multi-Factor Authentication)`,
      category: AuditCategory.SECURITY,
      severity: AuditSeverity.INFO,
    });
  }

  /**
   * Loguea deshabilitación de MFA
   */
  async logMfaDisabled(userId: string, userEmail: string) {
    return this.log({
      userId,
      userType: 'admin',
      userEmail,
      action: AuditAction.MFA_DISABLED,
      entityType: EntityType.MFA,
      entityId: userId,
      description: `Admin ${userEmail} deshabilitó MFA (Multi-Factor Authentication)`,
      category: AuditCategory.SECURITY,
      severity: AuditSeverity.WARNING,
    });
  }

  /**
   * Loguea creación de pago
   */
  async logPaymentCreated(
    paymentId: string,
    amount: number,
    type: string,
    userId?: string,
    userEmail?: string,
  ) {
    return this.log({
      userId,
      userEmail,
      userType: userId ? 'tutor' : 'system',
      action: AuditAction.PAYMENT_CREATED,
      entityType: EntityType.PAGO,
      entityId: paymentId,
      description: `Pago creado: $${amount.toFixed(2)} (${type})`,
      category: AuditCategory.PAYMENT,
      severity: AuditSeverity.INFO,
      metadata: { amount, type },
    });
  }

  /**
   * Loguea aprobación de pago
   */
  async logPaymentApproved(
    paymentId: string,
    amount: number,
    type: string,
    mercadopagoPaymentId?: string,
  ) {
    return this.log({
      userType: 'system',
      action: AuditAction.PAYMENT_APPROVED,
      entityType: EntityType.PAGO,
      entityId: paymentId,
      description: `Pago aprobado por MercadoPago: $${amount.toFixed(2)} (${type})`,
      category: AuditCategory.PAYMENT,
      severity: AuditSeverity.INFO,
      metadata: {
        amount,
        type,
        mercadopagoPaymentId: mercadopagoPaymentId,
      },
    });
  }

  /**
   * Loguea rechazo de pago
   */
  async logPaymentRejected(
    paymentId: string,
    amount: number,
    type: string,
    reason?: string,
  ) {
    return this.log({
      userType: 'system',
      action: AuditAction.PAYMENT_REJECTED,
      entityType: EntityType.PAGO,
      entityId: paymentId,
      description:
        `Pago rechazado: $${amount.toFixed(2)} (${type})` +
        (reason ? ` - ${reason}` : ''),
      category: AuditCategory.PAYMENT,
      severity: AuditSeverity.WARNING,
      metadata: { amount, type, reason },
    });
  }

  /**
   * Loguea fraude detectado (monto incorrecto, validación fallida, etc.)
   */
  async logFraudDetected(
    description: string,
    entityType: EntityType,
    entityId?: string,
    details?: Record<string, unknown>,
    ipAddress?: string,
  ) {
    return this.log({
      userType: 'system',
      action: AuditAction.FRAUD_DETECTED,
      entityType,
      entityId,
      description: `🚨 FRAUDE DETECTADO: ${description}`,
      category: AuditCategory.SECURITY,
      severity: AuditSeverity.CRITICAL,
      metadata: details,
      ipAddress,
    });
  }

  /**
   * Registra un evento de seguridad general (alertas, monitoreo)
   *
   * Usado por SecurityMonitoringService para alertas de:
   * - Spike de fraudes
   * - Rate limiting excesivo
   * - Patrones anómalos
   * - Health checks críticos
   *
   * @param description - Descripción del evento de seguridad
   * @param details - Detalles adicionales (metadata)
   */
  async logSecurityEvent(
    description: string,
    details?: Record<string, unknown>,
  ) {
    return this.log({
      userType: 'system',
      action: 'SECURITY_ALERT',
      entityType: EntityType.SYSTEM,
      description: `🔔 ALERTA DE SEGURIDAD: ${description}`,
      category: AuditCategory.SECURITY,
      severity: AuditSeverity.WARNING,
      metadata: details,
    });
  }

  /**
   * Loguea recepción de webhook
   */
  async logWebhookReceived(
    webhookType: string,
    paymentId: string,
    status: string,
    ipAddress?: string,
  ) {
    return this.log({
      userType: 'system',
      action: AuditAction.WEBHOOK_RECEIVED,
      entityType: EntityType.WEBHOOK,
      description: `Webhook recibido de MercadoPago: ${webhookType} (payment: ${paymentId}, status: ${status})`,
      category: AuditCategory.PAYMENT,
      severity: AuditSeverity.INFO,
      metadata: { webhookType, paymentId, status },
      ipAddress,
    });
  }

  /**
   * Loguea cambio de password
   */
  async logPasswordChange(
    userId: string,
    userEmail: string,
    userType: string,
    ipAddress?: string,
  ) {
    return this.log({
      userId,
      userType,
      userEmail,
      action: AuditAction.PASSWORD_CHANGE,
      entityType: EntityType.AUTH,
      entityId: userId,
      description: `Usuario ${userEmail} cambió su contraseña`,
      category: AuditCategory.SECURITY,
      severity: AuditSeverity.INFO,
      ipAddress,
    });
  }

  /**
   * Loguea creación de usuario
   */
  async logUserCreated(
    entityType: EntityType,
    entityId: string,
    email: string,
    createdBy?: { userId: string; userEmail: string; userType: string },
  ) {
    return this.log({
      userId: createdBy?.userId,
      userType: createdBy?.userType ?? 'system',
      userEmail: createdBy?.userEmail,
      action: AuditAction.CREATE,
      entityType,
      entityId,
      description:
        `Usuario creado: ${email} (${entityType})` +
        (createdBy ? ` por ${createdBy.userEmail}` : ''),
      category: AuditCategory.USER_MANAGEMENT,
      severity: AuditSeverity.INFO,
    });
  }

  /**
   * Loguea modificación de usuario
   */
  async logUserUpdated(
    entityType: EntityType,
    entityId: string,
    email: string,
    changes: {
      before?: Record<string, unknown>;
      after?: Record<string, unknown>;
    },
    updatedBy?: { userId: string; userEmail: string; userType: string },
  ) {
    // Filtrar campos sensibles de los cambios
    const sanitizedChanges = this.sanitizeChanges(changes);

    return this.log({
      userId: updatedBy?.userId,
      userType: updatedBy?.userType ?? 'system',
      userEmail: updatedBy?.userEmail,
      action: AuditAction.UPDATE,
      entityType,
      entityId,
      description:
        `Usuario modificado: ${email} (${entityType})` +
        (updatedBy ? ` por ${updatedBy.userEmail}` : ''),
      category: AuditCategory.USER_MANAGEMENT,
      severity: AuditSeverity.INFO,
      changes: sanitizedChanges,
    });
  }

  /**
   * Loguea eliminación de usuario
   */
  async logUserDeleted(
    entityType: EntityType,
    entityId: string,
    email: string,
    deletedBy?: { userId: string; userEmail: string; userType: string },
  ) {
    return this.log({
      userId: deletedBy?.userId,
      userType: deletedBy?.userType ?? 'system',
      userEmail: deletedBy?.userEmail,
      action: AuditAction.DELETE,
      entityType,
      entityId,
      description:
        `Usuario eliminado: ${email} (${entityType})` +
        (deletedBy ? ` por ${deletedBy.userEmail}` : ''),
      category: AuditCategory.USER_MANAGEMENT,
      severity: AuditSeverity.WARNING,
    });
  }

  /**
   * Loguea cambio en configuración del sistema
   */
  async logConfigChange(
    configKey: string,
    oldValue: unknown,
    newValue: unknown,
    changedBy: { userId: string; userEmail: string; userType: string },
  ) {
    return this.log({
      userId: changedBy.userId,
      userType: changedBy.userType,
      userEmail: changedBy.userEmail,
      action: AuditAction.CONFIG_CHANGE,
      entityType: EntityType.CONFIG,
      description: `Configuración modificada: ${configKey} por ${changedBy.userEmail}`,
      category: AuditCategory.SYSTEM,
      severity: AuditSeverity.WARNING,
      changes: {
        before: { [configKey]: oldValue },
        after: { [configKey]: newValue },
      },
    });
  }

  /**
   * Sanitiza cambios removiendo campos sensibles
   * @private
   */
  private sanitizeChanges(changes: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  }): { before?: Record<string, unknown>; after?: Record<string, unknown> } {
    const sensitiveFields = [
      'password',
      'passwordHash',
      'mfaSecret',
      'mfaBackupCodes',
      'token',
      'access_token',
      'refresh_token',
      'mercadopago_access_token',
      'secret',
      'api_key',
    ];

    const sanitize = (obj?: Record<string, unknown>) => {
      if (!obj) return obj;

      const sanitized = { ...obj };
      for (const field of sensitiveFields) {
        if (field in sanitized) {
          sanitized[field] = '***REDACTED***';
        }
      }
      return sanitized;
    };

    return {
      before: sanitize(changes.before),
      after: sanitize(changes.after),
    };
  }

  /**
   * Busca logs de auditoría con filtros
   *
   * @param filters - Filtros de búsqueda
   * @returns Array de logs que coinciden con los filtros
   */
  async findLogs(filters: {
    userId?: string;
    userEmail?: string;
    action?: string;
    entityType?: string;
    category?: string;
    severity?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    const where: Record<string, unknown> = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.userEmail) where.userEmail = { contains: filters.userEmail };
    if (filters.action) where.action = filters.action;
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.category) where.category = filters.category;
    if (filters.severity) where.severity = filters.severity;

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        (where.timestamp as Record<string, Date>).gte = filters.startDate;
      }
      if (filters.endDate) {
        (where.timestamp as Record<string, Date>).lte = filters.endDate;
      }
    }

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: filters.limit ?? 100,
    });
  }

  /**
   * Registra un cambio de estado genérico (para Sprint 2 - PASO 2.2)
   *
   * PROPÓSITO: API simplificada para loguear cambios de estado con contexto completo
   *
   * @param data - Datos del cambio de estado
   * @returns Audit log creado
   */
  async logStateChange(data: {
    entityType: string;
    entityId: string;
    action: string;
    performedBy: string;
    performedByType: 'USER' | 'SYSTEM';
    previousState?: Record<string, unknown> | null;
    newState?: Record<string, unknown> | null;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    performedBy: string;
    performedByType: string;
    previousState: Record<string, unknown> | null;
    newState: Record<string, unknown> | null;
    reason: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
  }> {
    // Validar campos requeridos
    if (
      !data.entityType ||
      !data.entityId ||
      !data.action ||
      !data.performedBy
    ) {
      throw new Error(
        'Campos requeridos faltantes: entityType, entityId, action, performedBy',
      );
    }

    // Crear descripción
    const actor =
      data.performedByType === 'USER'
        ? `Usuario ${data.performedBy}`
        : 'Sistema';
    const entity = `${data.entityType}/${data.entityId}`;
    const reason = data.reason ? ` - ${data.reason}` : '';
    const description = `${actor} realizó ${data.action} en ${entity}${reason}`;

    // Usar el método log() existente
    const auditLog = await this.log({
      userId: data.performedByType === 'USER' ? data.performedBy : undefined,
      userType: data.performedByType.toLowerCase(),
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      description,
      changes: {
        before: data.previousState || undefined,
        after: data.newState || undefined,
      },
      metadata: data.metadata,
      category: this.determineCategory(data.entityType),
      severity: this.determineSeverity(data.action),
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

    // Validar que el audit log fue creado correctamente
    if (!auditLog) {
      throw new Error(
        `Failed to create audit log for ${data.action} on ${data.entityType}/${data.entityId}`,
      );
    }

    // Retornar en formato esperado por los tests
    return {
      id: auditLog.id,
      entityType: data.entityType,
      entityId: data.entityId,
      action: data.action,
      performedBy: data.performedBy,
      performedByType: data.performedByType,
      previousState: data.previousState || null,
      newState: data.newState || null,
      reason: data.reason || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      metadata: data.metadata || null,
      createdAt: auditLog.timestamp,
    };
  }

  /**
   * Obtiene el historial de cambios de una entidad específica
   *
   * @param entityType - Tipo de entidad
   * @param entityId - ID de la entidad
   * @returns Lista de audit logs
   */
  async getEntityHistory(
    entityType: string,
    entityId: string,
  ): Promise<
    Array<{
      id: string;
      entityType: string;
      entityId: string;
      action: string;
      performedBy: string;
      performedByType: string;
      createdAt: Date;
    }>
  > {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        entityType: entityType,
        entityId: entityId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return logs.map((log) => ({
      id: log.id,
      entityType: log.entityType,
      entityId: log.entityId || '',
      action: log.action,
      performedBy: log.userId || 'system',
      performedByType:
        log.userType?.toUpperCase() === 'USER' ? 'USER' : 'SYSTEM',
      createdAt: log.timestamp,
    }));
  }

  /**
   * Obtiene todos los logs de un usuario específico
   *
   * @param userId - ID del usuario
   * @returns Lista de audit logs del usuario
   */
  async getUserLogs(userId: string): Promise<
    Array<{
      id: string;
      action: string;
      performedBy: string;
      entityId: string;
      createdAt: Date;
    }>
  > {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      performedBy: log.userId || 'system',
      entityId: log.entityId || '',
      createdAt: log.timestamp,
    }));
  }

  /**
   * Obtiene logs por rango de fechas
   *
   * @param startDate - Fecha de inicio
   * @param endDate - Fecha de fin
   * @returns Lista de audit logs en el rango
   */
  async getLogsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<
    Array<{
      id: string;
      createdAt: Date;
    }>
  > {
    const logs = await this.prisma.auditLog.findMany({
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

    return logs.map((log) => ({
      id: log.id,
      createdAt: log.timestamp,
    }));
  }

  /**
   * Cuenta logs por acción específica
   *
   * @param action - Acción a contar
   * @returns Número de logs con esa acción
   */
  async countLogsByAction(action: string): Promise<number> {
    const count = await this.prisma.auditLog.count({
      where: {
        action,
      },
    });

    return count;
  }

  /**
   * HELPER: Determinar severidad del evento
   *
   * @param action - Acción realizada
   * @returns Severidad (info, warning, error, critical)
   */
  private determineSeverity(action: string): AuditSeverity {
    const criticalActions = ['DELETE', 'FRAUD_DETECTED', 'UNAUTHORIZED_ACCESS'];
    const warningActions = ['UPDATE_ESTADO', 'PAYMENT_REJECTED'];

    if (criticalActions.some((a) => action.includes(a))) {
      return AuditSeverity.CRITICAL;
    }

    if (warningActions.some((a) => action.includes(a))) {
      return AuditSeverity.WARNING;
    }

    return AuditSeverity.INFO;
  }

  /**
   * HELPER: Determinar categoría del evento
   *
   * @param entityType - Tipo de entidad
   * @returns Categoría (payment, user_management, data_modification, security)
   */
  private determineCategory(entityType: string): AuditCategory {
    if (entityType.includes('pago') || entityType.includes('payment')) {
      return AuditCategory.PAYMENT;
    }

    if (entityType.includes('tutor') || entityType.includes('admin')) {
      return AuditCategory.USER_MANAGEMENT;
    }

    if (entityType.includes('inscripcion')) {
      return AuditCategory.DATA_MODIFICATION;
    }

    return AuditCategory.DATA_MODIFICATION;
  }
}
