import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * Severidad de alertas de pago
 */
export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

/**
 * Tipos de alertas de pago
 */
export enum PaymentAlertType {
  // Alertas de fraude
  AMOUNT_MISMATCH = 'AMOUNT_MISMATCH', // Monto pagado != monto esperado
  DUPLICATE_PAYMENT = 'DUPLICATE_PAYMENT', // Pago duplicado detectado
  SUSPICIOUS_IP = 'SUSPICIOUS_IP', // Webhook desde IP no autorizada

  // Alertas de reembolsos
  REFUND_PROCESSED = 'REFUND_PROCESSED', // Reembolso procesado
  CHARGEBACK_RECEIVED = 'CHARGEBACK_RECEIVED', // Chargeback recibido

  // Alertas operacionales
  WEBHOOK_PROCESSING_ERROR = 'WEBHOOK_PROCESSING_ERROR', // Error procesando webhook
  PAYMENT_TIMEOUT = 'PAYMENT_TIMEOUT', // Pago expirado por timeout
  HIGH_FAILURE_RATE = 'HIGH_FAILURE_RATE', // Alta tasa de pagos rechazados
}

/**
 * Datos de una alerta de pago
 */
export interface PaymentAlertData {
  type: PaymentAlertType;
  severity: AlertSeverity;
  message: string;
  details: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Evento emitido cuando se genera una alerta
 */
export const PAYMENT_ALERT_EVENT = 'payment.alert';

/**
 * Servicio de Alertas de Pagos
 *
 * PROPÓSITO:
 * Centralizar la generación de alertas para eventos críticos del sistema
 * de pagos que requieren atención de administradores.
 *
 * PROBLEMA QUE RESUELVE:
 * - Chargebacks y reembolsos que pasan desapercibidos
 * - Fraudes que no se detectan a tiempo
 * - Errores de webhook que afectan pagos legítimos
 * - Falta de visibilidad sobre problemas operacionales
 *
 * CANALES DE ALERTA:
 * 1. Audit Log (siempre) - Para compliance y debugging
 * 2. Event Emitter - Para listeners que envíen a Slack/Email/etc
 * 3. Logger CRITICAL - Para monitoreo en Railway/Datadog
 *
 * INTEGRACIÓN FUTURA:
 * Los listeners pueden conectarse al evento 'payment.alert' para:
 * - Enviar notificaciones a Slack
 * - Enviar emails a administradores
 * - Crear tickets en sistema de soporte
 * - Activar alarmas en dashboard
 */
@Injectable()
export class PaymentAlertService {
  private readonly logger = new Logger(PaymentAlertService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Genera una alerta por discrepancia de monto
   *
   * Se activa cuando el monto pagado no coincide con el esperado
   * (más allá de la tolerancia del 1%)
   */
  async alertAmountMismatch(data: {
    paymentId: string;
    expectedAmount: number;
    actualAmount: number;
    difference: number;
    percentageDiff: number;
    externalReference: string;
  }): Promise<void> {
    const alert: PaymentAlertData = {
      type: PaymentAlertType.AMOUNT_MISMATCH,
      severity: AlertSeverity.CRITICAL,
      message: `Discrepancia de monto detectada: esperado ${data.expectedAmount}, recibido ${data.actualAmount} (${data.percentageDiff.toFixed(2)}% diferencia)`,
      details: data,
      timestamp: new Date(),
    };

    await this.processAlert(alert);
  }

  /**
   * Genera una alerta por reembolso procesado
   *
   * Se activa cuando MercadoPago notifica un refund
   */
  async alertRefundProcessed(data: {
    paymentId: string;
    originalAmount: number;
    refundedAmount: number;
    entityType: 'membresia' | 'inscripcion';
    entityId: string;
    reason?: string;
  }): Promise<void> {
    const alert: PaymentAlertData = {
      type: PaymentAlertType.REFUND_PROCESSED,
      severity: AlertSeverity.WARNING,
      message: `Reembolso procesado: ${data.refundedAmount} para ${data.entityType} ${data.entityId}`,
      details: data,
      timestamp: new Date(),
    };

    await this.processAlert(alert);
  }

  /**
   * Genera una alerta por chargeback recibido
   *
   * CRÍTICO: Los chargebacks pueden indicar fraude o problemas serios
   */
  async alertChargebackReceived(data: {
    paymentId: string;
    amount: number;
    entityType: 'membresia' | 'inscripcion';
    entityId: string;
    tutorId?: string;
  }): Promise<void> {
    const alert: PaymentAlertData = {
      type: PaymentAlertType.CHARGEBACK_RECEIVED,
      severity: AlertSeverity.CRITICAL,
      message: `⚠️ CHARGEBACK recibido: ${data.amount} para ${data.entityType} ${data.entityId}`,
      details: data,
      timestamp: new Date(),
    };

    await this.processAlert(alert);
  }

  /**
   * Genera una alerta por webhook desde IP sospechosa
   */
  async alertSuspiciousIP(data: {
    ip: string;
    paymentId?: string;
    webhookType: string;
  }): Promise<void> {
    const alert: PaymentAlertData = {
      type: PaymentAlertType.SUSPICIOUS_IP,
      severity: AlertSeverity.CRITICAL,
      message: `Webhook desde IP no autorizada: ${data.ip}`,
      details: data,
      timestamp: new Date(),
    };

    await this.processAlert(alert);
  }

  /**
   * Genera una alerta por error procesando webhook
   */
  async alertWebhookError(data: {
    paymentId: string;
    error: string;
    webhookData: Record<string, unknown>;
  }): Promise<void> {
    const alert: PaymentAlertData = {
      type: PaymentAlertType.WEBHOOK_PROCESSING_ERROR,
      severity: AlertSeverity.WARNING,
      message: `Error procesando webhook: ${data.error}`,
      details: data,
      timestamp: new Date(),
    };

    await this.processAlert(alert);
  }

  /**
   * Genera una alerta por pago duplicado detectado
   */
  async alertDuplicatePayment(data: {
    paymentId: string;
    previousPaymentId: string;
    amount: number;
    externalReference: string;
  }): Promise<void> {
    const alert: PaymentAlertData = {
      type: PaymentAlertType.DUPLICATE_PAYMENT,
      severity: AlertSeverity.WARNING,
      message: `Pago duplicado detectado: ${data.paymentId} (previo: ${data.previousPaymentId})`,
      details: data,
      timestamp: new Date(),
    };

    await this.processAlert(alert);
  }

  /**
   * Genera una alerta por alta tasa de fallos
   *
   * Útil para detectar problemas con MercadoPago o patrones de fraude
   */
  async alertHighFailureRate(data: {
    period: string;
    totalPayments: number;
    failedPayments: number;
    failureRate: number;
    threshold: number;
  }): Promise<void> {
    const alert: PaymentAlertData = {
      type: PaymentAlertType.HIGH_FAILURE_RATE,
      severity: AlertSeverity.WARNING,
      message: `Alta tasa de fallos: ${data.failureRate.toFixed(1)}% (umbral: ${data.threshold}%)`,
      details: data,
      timestamp: new Date(),
    };

    await this.processAlert(alert);
  }

  /**
   * Procesa una alerta: log, audit, emit
   */
  private async processAlert(alert: PaymentAlertData): Promise<void> {
    // 1. Log según severidad
    switch (alert.severity) {
      case AlertSeverity.CRITICAL:
        this.logger.error(`🚨 ${alert.message}`, {
          type: alert.type,
          details: alert.details,
        });
        break;
      case AlertSeverity.WARNING:
        this.logger.warn(`⚠️ ${alert.message}`, {
          type: alert.type,
          details: alert.details,
        });
        break;
      default:
        this.logger.log(`ℹ️ ${alert.message}`, {
          type: alert.type,
          details: alert.details,
        });
    }

    // 2. Guardar en audit log para compliance
    await this.saveToAuditLog(alert);

    // 3. Emitir evento para listeners externos (Slack, Email, etc)
    this.eventEmitter.emit(PAYMENT_ALERT_EVENT, alert);
  }

  /**
   * Guarda la alerta en audit log para compliance y debugging
   */
  private async saveToAuditLog(alert: PaymentAlertData): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: `PAYMENT_ALERT:${alert.type}`,
          entity_type: 'Payment',
          entity_id: (alert.details.paymentId as string) || 'N/A',
          user_id: null, // Sistema
          user_type: 'system',
          user_email: 'system@mateatletas.com',
          category: 'SECURITY',
          severity:
            alert.severity === AlertSeverity.CRITICAL ? 'CRITICAL' : 'WARNING',
          timestamp: alert.timestamp,
          ip_address: (alert.details.ip as string) || null,
          description: alert.message,
          metadata: alert.details as object,
        },
      });
    } catch (error) {
      // No fallar si no se puede guardar en audit log
      this.logger.error('Error guardando alerta en audit log', { error });
    }
  }

  /**
   * Obtiene alertas recientes para dashboard de administración
   */
  async getRecentAlerts(options?: {
    severity?: AlertSeverity;
    type?: PaymentAlertType;
    limit?: number;
    since?: Date;
  }): Promise<
    Array<{
      id: string;
      type: string;
      severity: string;
      message: string;
      timestamp: Date;
      details: unknown;
    }>
  > {
    const where: Record<string, unknown> = {
      action: { startsWith: 'PAYMENT_ALERT:' },
    };

    if (options?.severity) {
      where.severity = options.severity;
    }

    if (options?.type) {
      where.action = `PAYMENT_ALERT:${options.type}`;
    }

    if (options?.since) {
      where.timestamp = { gte: options.since };
    }

    const alerts = await this.prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: options?.limit ?? 50,
      select: {
        id: true,
        action: true,
        severity: true,
        description: true,
        timestamp: true,
        metadata: true,
      },
    });

    return alerts.map((a) => ({
      id: a.id,
      type: a.action.replace('PAYMENT_ALERT:', ''),
      severity: a.severity || 'INFO',
      message: a.description || '',
      timestamp: a.timestamp,
      details: a.metadata,
    }));
  }
}
