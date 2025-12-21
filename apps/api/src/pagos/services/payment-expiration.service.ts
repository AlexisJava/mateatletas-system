import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../core/database/prisma.service';
import { EstadoPago } from '@prisma/client';

/**
 * Servicio de Expiración de Pagos Pendientes
 *
 * PROPÓSITO:
 * Expirar automáticamente inscripciones que llevan más de 30 días
 * en estado PENDIENTE sin recibir pago.
 *
 * PROBLEMA QUE RESUELVE:
 * - Inscripciones "fantasma" que nunca se pagan pero ocupan cupo
 * - Usuarios que abandonan el checkout sin completar el pago
 * - Datos inconsistentes donde el estudiante aparece "inscrito" pero nunca pagó
 *
 * REGLA DE NEGOCIO:
 * - Inscripciones con estado_pago = PENDIENTE
 * - Creadas hace más de 30 días
 * - Se cambian a estado_pago = VENCIDO
 *
 * EJECUCIÓN:
 * - Cron job diario a las 3:00 AM (horario de baja actividad)
 */
@Injectable()
export class PaymentExpirationService {
  private readonly logger = new Logger(PaymentExpirationService.name);

  /**
   * Días después de los cuales una inscripción pendiente expira
   */
  private readonly EXPIRATION_DAYS = 30;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cron job que se ejecuta diariamente a las 3:00 AM
   * Busca y expira inscripciones pendientes antiguas
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async expirePendingPayments(): Promise<void> {
    this.logger.log(
      '🕐 Iniciando proceso de expiración de pagos pendientes...',
    );

    const startTime = Date.now();
    let totalExpired = 0;

    try {
      // Calcular fecha límite (30 días atrás)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.EXPIRATION_DAYS);

      // Expirar InscripcionMensual pendientes
      const inscripcionesMensualesExpired =
        await this.expireInscripcionesMensuales(cutoffDate);
      totalExpired += inscripcionesMensualesExpired;

      const duration = Date.now() - startTime;

      this.logger.log(
        `✅ Proceso de expiración completado en ${duration}ms. Total expirados: ${totalExpired}`,
      );

      // Log detallado si hubo expiraciones
      if (totalExpired > 0) {
        this.logger.warn(
          `⚠️ Se expiraron ${totalExpired} registros pendientes (>30 días sin pago)`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Error en proceso de expiración: ${message}`);
      throw error;
    }
  }

  /**
   * Expira inscripciones mensuales pendientes
   *
   * @param cutoffDate - Fecha límite (inscripciones creadas antes de esta fecha expiran)
   * @returns Número de registros actualizados
   */
  private async expireInscripcionesMensuales(
    cutoffDate: Date,
  ): Promise<number> {
    const result = await this.prisma.inscripcionMensual.updateMany({
      where: {
        estado_pago: EstadoPago.Pendiente,
        createdAt: {
          lt: cutoffDate,
        },
      },
      data: {
        estado_pago: EstadoPago.Vencido,
      },
    });

    if (result.count > 0) {
      this.logger.log(`📋 InscripcionesMensuales expiradas: ${result.count}`);
    }

    return result.count;
  }

  /**
   * Método para ejecución manual (útil para testing o triggers manuales)
   *
   * @returns Estadísticas del proceso
   */
  async runManually(): Promise<{
    inscripcionesMensuales: number;
    total: number;
  }> {
    this.logger.log('🔧 Ejecutando expiración manual...');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.EXPIRATION_DAYS);

    const inscripcionesMensuales =
      await this.expireInscripcionesMensuales(cutoffDate);

    return {
      inscripcionesMensuales,
      total: inscripcionesMensuales,
    };
  }

  /**
   * Obtiene estadísticas de inscripciones pendientes próximas a expirar
   *
   * Útil para dashboards de administración
   *
   * @returns Conteo de inscripciones por días restantes
   */
  async getPendingStats(): Promise<{
    expireIn7Days: number;
    expireIn14Days: number;
    expireIn30Days: number;
    alreadyExpirable: number;
  }> {
    const now = new Date();
    const cutoff30 = new Date(now);
    cutoff30.setDate(cutoff30.getDate() - this.EXPIRATION_DAYS);

    const cutoff23 = new Date(now);
    cutoff23.setDate(cutoff23.getDate() - (this.EXPIRATION_DAYS - 7));

    const cutoff16 = new Date(now);
    cutoff16.setDate(cutoff16.getDate() - (this.EXPIRATION_DAYS - 14));

    const [alreadyExpirable, expireIn7Days, expireIn14Days, total] =
      await Promise.all([
        // Ya expirables (>30 días)
        this.prisma.inscripcionMensual.count({
          where: {
            estado_pago: EstadoPago.Pendiente,
            createdAt: { lt: cutoff30 },
          },
        }),
        // Expiran en 7 días (23-30 días)
        this.prisma.inscripcionMensual.count({
          where: {
            estado_pago: EstadoPago.Pendiente,
            createdAt: { gte: cutoff30, lt: cutoff23 },
          },
        }),
        // Expiran en 14 días (16-23 días)
        this.prisma.inscripcionMensual.count({
          where: {
            estado_pago: EstadoPago.Pendiente,
            createdAt: { gte: cutoff23, lt: cutoff16 },
          },
        }),
        // Total pendientes
        this.prisma.inscripcionMensual.count({
          where: {
            estado_pago: EstadoPago.Pendiente,
          },
        }),
      ]);

    return {
      expireIn7Days,
      expireIn14Days,
      expireIn30Days: total - alreadyExpirable - expireIn7Days - expireIn14Days,
      alreadyExpirable,
    };
  }
}
