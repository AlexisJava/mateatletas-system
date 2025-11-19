import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * Datos de un webhook procesado
 */
export interface WebhookProcessedRecord {
  paymentId: string;
  webhookType: string;
  status: string;
  externalReference: string;
}

/**
 * Servicio de Idempotencia de Webhooks de MercadoPago
 *
 * PROBLEMA QUE RESUELVE:
 * MercadoPago puede enviar el mismo webhook múltiples veces por:
 * - Reintentos automáticos si no respondemos 200 OK rápido
 * - Timeouts de red
 * - Problemas en su infraestructura
 *
 * Sin idempotencia, un mismo pago puede procesarse 2+ veces causando:
 * - Doble cobro a clientes
 * - Múltiples eventos emitidos
 * - Corrupción de datos
 *
 * SOLUCIÓN:
 * - Guardar cada payment_id que procesamos en la tabla webhooks_processed
 * - Antes de procesar, verificar si ya existe
 * - Si existe, retornar 200 OK sin hacer nada
 *
 * GARANTÍA:
 * - UNIQUE constraint en payment_id previene doble procesamiento incluso en race conditions
 *
 * @injectable
 */
@Injectable()
export class WebhookIdempotencyService {
  private readonly logger = new Logger(WebhookIdempotencyService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verifica si un webhook ya fue procesado
   *
   * @param paymentId - ID del pago de MercadoPago
   * @returns true si ya fue procesado, false si es nuevo
   */
  async wasProcessed(paymentId: string): Promise<boolean> {
    const existing = await this.prisma.webhookProcessed.findUnique({
      where: { payment_id: paymentId },
    });

    if (existing) {
      this.logger.warn(
        `⏭️ Webhook duplicado detectado: payment_id=${paymentId}, procesado originalmente en ${existing.processed_at}`,
      );
      return true;
    }

    return false;
  }

  /**
   * Marca un webhook como procesado
   *
   * Maneja race conditions: Si otro proceso ya guardó el registro (unique constraint violation),
   * simplemente loguea el warning sin lanzar error.
   *
   * @param data - Datos del webhook procesado
   * @throws - Solo lanza error si falla por razones distintas a unique constraint
   */
  async markAsProcessed(data: WebhookProcessedRecord): Promise<void> {
    try {
      await this.prisma.webhookProcessed.create({
        data: {
          payment_id: data.paymentId,
          webhook_type: data.webhookType,
          status: data.status,
          external_reference: data.externalReference,
        },
      });

      this.logger.log(
        `✅ Webhook marcado como procesado: payment_id=${data.paymentId}, type=${data.webhookType}, status=${data.status}`,
      );
    } catch (error: unknown) {
      // Si falla por unique constraint, significa que otro proceso ya lo guardó (race condition)
      // Esto es OK, simplemente logueamos
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        this.logger.warn(
          `⚠️ Race condition detectada al marcar webhook: payment_id=${data.paymentId}. Otro proceso ya lo procesó.`,
        );
      } else {
        // Otros errores sí son problemáticos
        const message = error instanceof Error ? error.message : 'Unknown error';
        const stack = error instanceof Error ? error.stack : undefined;
        this.logger.error(
          `❌ Error al marcar webhook como procesado: ${message}`,
          stack,
        );
        throw error;
      }
    }
  }

  /**
   * Limpia webhooks procesados antiguos (mayor a 30 días)
   *
   * Útil para mantener la tabla con tamaño manejable.
   * Se debe ejecutar como cron job mensual.
   *
   * @returns Número de registros eliminados
   */
  async cleanOldRecords(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.prisma.webhookProcessed.deleteMany({
      where: {
        processed_at: {
          lt: thirtyDaysAgo,
        },
      },
    });

    this.logger.log(
      `🗑️ Limpiados ${result.count} registros de webhooks antiguos (> 30 días)`,
    );

    return result.count;
  }

  /**
   * Obtiene información de un webhook procesado (para debugging)
   *
   * @param paymentId - ID del pago de MercadoPago
   * @returns Información del webhook o null si no existe
   */
  async getProcessedInfo(paymentId: string) {
    return this.prisma.webhookProcessed.findUnique({
      where: { payment_id: paymentId },
    });
  }

  /**
   * Obtiene estadísticas de webhooks procesados
   *
   * Útil para monitoring y dashboards
   *
   * @returns Estadísticas agrupadas por tipo y estado
   */
  async getStats() {
    const [total, byType, byStatus, last24h] = await Promise.all([
      // Total de webhooks procesados
      this.prisma.webhookProcessed.count(),

      // Agrupados por tipo
      this.prisma.webhookProcessed.groupBy({
        by: ['webhook_type'],
        _count: true,
      }),

      // Agrupados por estado
      this.prisma.webhookProcessed.groupBy({
        by: ['status'],
        _count: true,
      }),

      // Procesados en las últimas 24 horas
      this.prisma.webhookProcessed.count({
        where: {
          processed_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      total,
      byType,
      byStatus,
      last24h,
    };
  }
}
