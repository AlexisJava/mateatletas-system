/**
 * GracePeriodService - Manejo de período de gracia y morosidad
 *
 * RESPONSABILIDADES:
 * - Transicionar suscripciones a EN_GRACIA cuando falla un pago
 * - Transicionar a MOROSA cuando expira el período de gracia
 * - Calcular días transcurridos en gracia
 *
 * REGLA DE NEGOCIO:
 * - Grace period = 3 días (GRACE_PERIOD_DIAS)
 * - Después de 3 días sin pago → MOROSA
 */
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EstadoSuscripcion, Prisma } from '@prisma/client';

import { PrismaService } from '../../core/database/prisma.service';
import { ProcessWebhookResult } from '../types/preapproval.types';
import {
  SuscripcionEnGraciaEvent,
  SuscripcionMorosaEvent,
} from '../events/suscripcion.events';
import { GRACE_PERIOD_DIAS } from '../domain/constants/suscripcion.constants';

type PrismaTransactionClient = Prisma.TransactionClient;

/**
 * Datos mínimos de suscripción para operaciones de gracia
 */
interface SuscripcionGraciaData {
  id: string;
  estado: EstadoSuscripcion;
  tutorId: string;
  fechaInicioGracia: Date | null;
}

@Injectable()
export class GracePeriodService {
  private readonly logger = new Logger(GracePeriodService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Maneja fallo de pago → EN_GRACIA o MOROSA
   *
   * @param suscripcionId - ID de la suscripción
   * @param paymentStatus - Estado del pago fallido (rejected, cancelled, etc)
   */
  async handlePaymentFailed(
    suscripcionId: string,
    paymentStatus: string,
  ): Promise<ProcessWebhookResult> {
    const suscripcion = await this.prisma.suscripcion.findUnique({
      where: { id: suscripcionId },
    });

    if (!suscripcion) {
      return {
        success: false,
        action: 'error',
        message: `Suscripción ${suscripcionId} no encontrada`,
      };
    }

    // Si ya está cancelada o morosa, no hacer nada
    if (
      suscripcion.estado === EstadoSuscripcion.CANCELADA ||
      suscripcion.estado === EstadoSuscripcion.MOROSA
    ) {
      return {
        success: true,
        action: 'skipped',
        suscripcionId,
        message: `Suscripción ya en estado ${suscripcion.estado}`,
      };
    }

    // Calcular días en gracia
    const diasEnGracia = this.calcularDiasEnGracia(
      suscripcion.fechaInicioGracia,
    );

    // Si ya pasó el grace period → MOROSA
    if (diasEnGracia >= GRACE_PERIOD_DIAS) {
      return this.transicionarAMorosa(suscripcion, paymentStatus);
    }

    // Si aún está dentro del grace period → EN_GRACIA
    return this.transicionarAEnGracia(suscripcion, paymentStatus, diasEnGracia);
  }

  /**
   * Calcula días transcurridos desde inicio de gracia
   */
  calcularDiasEnGracia(fechaInicioGracia: Date | null): number {
    if (!fechaInicioGracia) return 0;

    const ahora = new Date();
    const diff = ahora.getTime() - fechaInicioGracia.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Transiciona suscripción a EN_GRACIA
   * TRANSACCIONAL: update + historial en una transacción
   */
  async transicionarAEnGracia(
    suscripcion: SuscripcionGraciaData,
    paymentStatus: string,
    diasEnGracia: number,
  ): Promise<ProcessWebhookResult> {
    const estadoAnterior = suscripcion.estado;
    const fechaInicioGracia = suscripcion.fechaInicioGracia || new Date();

    // TRANSACCIÓN: update + historial
    await this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
      await tx.suscripcion.update({
        where: { id: suscripcion.id },
        data: {
          estado: EstadoSuscripcion.EN_GRACIA,
          fechaInicioGracia: fechaInicioGracia,
          diasGraciaUsados: diasEnGracia,
        },
      });

      // Registrar historial solo si cambió de estado
      if (estadoAnterior !== EstadoSuscripcion.EN_GRACIA) {
        await tx.historialEstadoSuscripcion.create({
          data: {
            suscripcionId: suscripcion.id,
            estadoAnterior: estadoAnterior,
            estadoNuevo: EstadoSuscripcion.EN_GRACIA,
            motivo: `Pago fallido: ${paymentStatus}`,
            realizadoPor: 'system',
            metadata: {
              payment_status: paymentStatus,
              diasGracia: diasEnGracia,
            },
          },
        });
      }
    });

    // DESPUÉS DEL COMMIT: Emitir evento
    const fechaLimiteGracia = new Date(fechaInicioGracia);
    fechaLimiteGracia.setDate(fechaLimiteGracia.getDate() + GRACE_PERIOD_DIAS);

    this.eventEmitter.emit(
      'suscripcion.en_gracia',
      new SuscripcionEnGraciaEvent({
        suscripcionId: suscripcion.id,
        tutorId: suscripcion.tutorId,
        fechaLimiteGracia,
        diasRestantes: GRACE_PERIOD_DIAS - diasEnGracia,
      }),
    );

    this.logger.warn(
      `⚠️ Suscripción ${suscripcion.id} en GRACIA (día ${diasEnGracia}/${GRACE_PERIOD_DIAS})`,
    );

    return {
      success: true,
      action: 'grace_period',
      suscripcionId: suscripcion.id,
      message: `Suscripción en período de gracia (${diasEnGracia}/${GRACE_PERIOD_DIAS} días)`,
    };
  }

  /**
   * Transiciona suscripción a MOROSA
   * TRANSACCIONAL: update + historial en una transacción
   */
  async transicionarAMorosa(
    suscripcion: { id: string; estado: EstadoSuscripcion; tutorId: string },
    paymentStatus: string,
  ): Promise<ProcessWebhookResult> {
    const estadoAnterior = suscripcion.estado;

    // TRANSACCIÓN: update + historial
    await this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
      await tx.suscripcion.update({
        where: { id: suscripcion.id },
        data: {
          estado: EstadoSuscripcion.MOROSA,
          diasGraciaUsados: GRACE_PERIOD_DIAS,
        },
      });

      await tx.historialEstadoSuscripcion.create({
        data: {
          suscripcionId: suscripcion.id,
          estadoAnterior: estadoAnterior,
          estadoNuevo: EstadoSuscripcion.MOROSA,
          motivo: `Grace period expirado. Último pago: ${paymentStatus}`,
          realizadoPor: 'system',
          metadata: { payment_status: paymentStatus },
        },
      });
    });

    // DESPUÉS DEL COMMIT: Emitir evento
    this.eventEmitter.emit(
      'suscripcion.morosa',
      new SuscripcionMorosaEvent({
        suscripcionId: suscripcion.id,
        tutorId: suscripcion.tutorId,
        diasGraciaUsados: GRACE_PERIOD_DIAS,
      }),
    );

    this.logger.error(
      `🚨 Suscripción ${suscripcion.id} MOROSA - acceso bloqueado`,
    );

    return {
      success: true,
      action: 'morosa',
      suscripcionId: suscripcion.id,
      message: 'Suscripción morosa - acceso bloqueado',
    };
  }
}
