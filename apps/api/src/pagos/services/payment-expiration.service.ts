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

      // 1. Expirar InscripcionMensual pendientes
      const inscripcionesMensualesExpired =
        await this.expireInscripcionesMensuales(cutoffDate);
      totalExpired += inscripcionesMensualesExpired;

      // 2. Expirar Inscripcion2026 pendientes (si aplica)
      const inscripciones2026Expired =
        await this.expireInscripciones2026(cutoffDate);
      totalExpired += inscripciones2026Expired;

      // 3. Expirar PagoInscripcion2026 pendientes
      const pagos2026Expired = await this.expirePagos2026(cutoffDate);
      totalExpired += pagos2026Expired;

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
   * Expira inscripciones 2026 pendientes
   *
   * Nota: Inscripcion2026 usa campo "estado" (string) no "estado_pago" (enum)
   *
   * @param cutoffDate - Fecha límite
   * @returns Número de registros actualizados
   */
  private async expireInscripciones2026(cutoffDate: Date): Promise<number> {
    const result = await this.prisma.inscripcion2026.updateMany({
      where: {
        estado: 'pending',
        createdAt: {
          lt: cutoffDate,
        },
      },
      data: {
        estado: 'cancelled', // Cancelada por timeout
      },
    });

    if (result.count > 0) {
      this.logger.log(`📋 Inscripciones2026 expiradas: ${result.count}`);

      // Registrar en historial de cambios de estado
      await this.registrarHistorialExpiracion(cutoffDate);
    }

    return result.count;
  }

  /**
   * Expira pagos de inscripción 2026 pendientes
   *
   * @param cutoffDate - Fecha límite
   * @returns Número de registros actualizados
   */
  private async expirePagos2026(cutoffDate: Date): Promise<number> {
    const result = await this.prisma.pagoInscripcion2026.updateMany({
      where: {
        estado: 'pending',
        createdAt: {
          lt: cutoffDate,
        },
      },
      data: {
        estado: 'expired',
      },
    });

    if (result.count > 0) {
      this.logger.log(`📋 PagosInscripcion2026 expirados: ${result.count}`);
    }

    return result.count;
  }

  /**
   * Registra en el historial los cambios de estado por expiración
   *
   * @param _cutoffDate - Fecha de corte usada para la expiración (para futura auditoría)
   */
  private async registrarHistorialExpiracion(_cutoffDate: Date): Promise<void> {
    // Buscar inscripciones que acaban de ser expiradas
    const inscripcionesExpiradas = await this.prisma.inscripcion2026.findMany({
      where: {
        estado: 'cancelled',
        updatedAt: {
          gte: new Date(Date.now() - 60000), // Actualizadas en el último minuto
        },
      },
      select: {
        id: true,
      },
    });

    // Crear registros de historial para cada una
    if (inscripcionesExpiradas.length > 0) {
      await this.prisma.historialEstadoInscripcion2026.createMany({
        data: inscripcionesExpiradas.map((insc) => ({
          inscripcion_id: insc.id,
          estado_anterior: 'pending',
          estado_nuevo: 'cancelled',
          razon: `Expiración automática: más de ${this.EXPIRATION_DAYS} días sin pago`,
          realizado_por: 'SYSTEM:PaymentExpirationService',
        })),
      });
    }
  }

  /**
   * Método para ejecución manual (útil para testing o triggers manuales)
   *
   * @returns Estadísticas del proceso
   */
  async runManually(): Promise<{
    inscripcionesMensuales: number;
    inscripciones2026: number;
    pagos2026: number;
    total: number;
  }> {
    this.logger.log('🔧 Ejecutando expiración manual...');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.EXPIRATION_DAYS);

    const inscripcionesMensuales =
      await this.expireInscripcionesMensuales(cutoffDate);
    const inscripciones2026 = await this.expireInscripciones2026(cutoffDate);
    const pagos2026 = await this.expirePagos2026(cutoffDate);

    return {
      inscripcionesMensuales,
      inscripciones2026,
      pagos2026,
      total: inscripcionesMensuales + inscripciones2026 + pagos2026,
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
