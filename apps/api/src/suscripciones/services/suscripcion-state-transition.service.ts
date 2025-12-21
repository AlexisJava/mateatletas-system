/**
 * SuscripcionStateTransitionService - Transiciones de estado de suscripción
 *
 * RESPONSABILIDADES:
 * - Transicionar a ACTIVA (authorized)
 * - Transicionar a CANCELADA (cancelled/paused)
 *
 * PATRÓN TRANSACCIONAL:
 * - Todas las operaciones DB se envuelven en $transaction
 * - Los eventos se preparan para emitir DESPUÉS del commit
 * - Usa Optimistic Locking para prevenir race conditions
 *
 * REGLA DE NEGOCIO:
 * - Las suscripciones NO SE PAUSAN
 * - Estado 'paused' de MP se trata como cancelación
 */
import { Injectable, Logger } from '@nestjs/common';
import { EstadoSuscripcion, Prisma } from '@prisma/client';

import { PrismaService } from '../../core/database/prisma.service';
import {
  OptimisticLockError,
  isOptimisticLockError,
} from '../errors/optimistic-lock.error';
import {
  PreApprovalDetail,
  ProcessWebhookResult,
} from '../types/preapproval.types';
import {
  SuscripcionActivadaEvent,
  SuscripcionCanceladaEvent,
} from '../events/suscripcion.events';

type PrismaTransactionClient = Prisma.TransactionClient;

/**
 * Datos mínimos de suscripción para transiciones
 */
interface SuscripcionTransitionData {
  id: string;
  estado: EstadoSuscripcion;
  tutor_id: string;
  version: number;
}

/**
 * Evento pendiente de emitir después del commit
 */
export interface PendingEvent {
  eventName: string;
  payload: SuscripcionActivadaEvent | SuscripcionCanceladaEvent;
}

/**
 * Resultado de una transición de estado
 */
export interface TransitionResult {
  result: ProcessWebhookResult;
  pendingEvent: PendingEvent | null;
}

@Injectable()
export class SuscripcionStateTransitionService {
  private readonly logger = new Logger(SuscripcionStateTransitionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Transiciona suscripción a ACTIVA
   * TRANSACCIONAL: update + historial con Optimistic Locking
   */
  async transicionarAActiva(
    suscripcion: SuscripcionTransitionData,
    detail: PreApprovalDetail,
  ): Promise<TransitionResult> {
    // Si ya está activa, no hacer nada
    if (suscripcion.estado === EstadoSuscripcion.ACTIVA) {
      this.logger.debug(`Suscripción ${suscripcion.id} ya está ACTIVA, skip`);
      return {
        result: {
          success: true,
          action: 'skipped',
          suscripcionId: suscripcion.id,
          message: 'Suscripción ya está activa',
        },
        pendingEvent: null,
      };
    }

    const estadoAnterior = suscripcion.estado;
    const currentVersion = suscripcion.version;

    // TRANSACCIÓN: update + historial con Optimistic Lock
    try {
      await this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
        // Actualizar a ACTIVA con Optimistic Lock
        await tx.suscripcion.update({
          where: {
            id: suscripcion.id,
            version: currentVersion, // Optimistic Lock check
          },
          data: {
            estado: EstadoSuscripcion.ACTIVA,
            mp_status: 'authorized',
            fecha_proximo_cobro: detail.next_payment_date
              ? new Date(detail.next_payment_date)
              : null,
            // Limpiar grace period si existía
            dias_gracia_usados: 0,
            fecha_inicio_gracia: null,
            version: { increment: 1 }, // Incrementar versión
          },
        });

        // Registrar historial
        await tx.historialEstadoSuscripcion.create({
          data: {
            suscripcion_id: suscripcion.id,
            estado_anterior: estadoAnterior,
            estado_nuevo: EstadoSuscripcion.ACTIVA,
            motivo: 'Pago autorizado por MercadoPago',
            realizado_por: 'mercadopago',
            metadata: {
              mp_preapproval_id: detail.id,
              next_payment_date: detail.next_payment_date,
            },
          },
        });
      });
    } catch (error) {
      if (isOptimisticLockError(error)) {
        throw new OptimisticLockError(suscripcion.id, currentVersion);
      }
      throw error;
    }

    this.logger.log(
      `✅ Suscripción ${suscripcion.id} activada (${estadoAnterior} → ACTIVA)`,
    );

    // Preparar evento para emitir DESPUÉS del commit
    return {
      result: {
        success: true,
        action: 'activated',
        suscripcionId: suscripcion.id,
        message: 'Suscripción activada exitosamente',
      },
      pendingEvent: {
        eventName: 'suscripcion.activada',
        payload: new SuscripcionActivadaEvent({
          suscripcionId: suscripcion.id,
          tutorId: suscripcion.tutor_id,
          mpPaymentId: detail.id,
        }),
      },
    };
  }

  /**
   * Transiciona suscripción a CANCELADA
   * TRANSACCIONAL: update + historial con Optimistic Locking
   */
  async transicionarACancelada(
    suscripcion: SuscripcionTransitionData,
    detail: PreApprovalDetail,
    motivo = 'Cancelada por MercadoPago',
  ): Promise<TransitionResult> {
    // Si ya está cancelada, no hacer nada
    if (suscripcion.estado === EstadoSuscripcion.CANCELADA) {
      return {
        result: {
          success: true,
          action: 'skipped',
          suscripcionId: suscripcion.id,
          message: 'Suscripción ya está cancelada',
        },
        pendingEvent: null,
      };
    }

    const estadoAnterior = suscripcion.estado;
    const currentVersion = suscripcion.version;

    // TRANSACCIÓN: update + historial con Optimistic Lock
    try {
      await this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
        // Actualizar a CANCELADA con Optimistic Lock
        await tx.suscripcion.update({
          where: {
            id: suscripcion.id,
            version: currentVersion,
          },
          data: {
            estado: EstadoSuscripcion.CANCELADA,
            mp_status: 'cancelled',
            fecha_cancelacion: new Date(),
            motivo_cancelacion: motivo,
            cancelado_por: 'mercadopago',
            version: { increment: 1 },
          },
        });

        // Registrar historial
        await tx.historialEstadoSuscripcion.create({
          data: {
            suscripcion_id: suscripcion.id,
            estado_anterior: estadoAnterior,
            estado_nuevo: EstadoSuscripcion.CANCELADA,
            motivo,
            realizado_por: 'mercadopago',
            metadata: { mp_preapproval_id: detail.id },
          },
        });
      });
    } catch (error) {
      if (isOptimisticLockError(error)) {
        throw new OptimisticLockError(suscripcion.id, currentVersion);
      }
      throw error;
    }

    this.logger.log(
      `🚫 Suscripción ${suscripcion.id} cancelada (${estadoAnterior} → CANCELADA)`,
    );

    // Preparar evento para emitir DESPUÉS del commit
    return {
      result: {
        success: true,
        action: 'cancelled',
        suscripcionId: suscripcion.id,
        message: 'Suscripción cancelada',
      },
      pendingEvent: {
        eventName: 'suscripcion.cancelada',
        payload: new SuscripcionCanceladaEvent({
          suscripcionId: suscripcion.id,
          tutorId: suscripcion.tutor_id,
          motivo,
          canceladoPor: 'system',
          estadoAnterior,
        }),
      },
    };
  }

  /**
   * Transiciona estado 'paused' de MP a CANCELADA
   * REGLA DE NEGOCIO: No pausamos, tratamos paused como cancelación
   */
  async transicionarPausadaACancelada(
    suscripcion: SuscripcionTransitionData,
    detail: PreApprovalDetail,
  ): Promise<TransitionResult> {
    this.logger.warn(
      `⚠️ MercadoPago envió estado 'paused' para ${suscripcion.id}. ` +
        `REGLA DE NEGOCIO: Tratando como cancelación.`,
    );

    return this.transicionarACancelada(
      suscripcion,
      detail,
      'MercadoPago reportó estado paused - tratado como cancelación (regla de negocio: no pausamos)',
    );
  }
}
