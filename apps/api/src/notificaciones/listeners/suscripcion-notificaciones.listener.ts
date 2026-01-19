import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificacionesService } from '../notificaciones.service';
import {
  SuscripcionCreadaEvent,
  SuscripcionActivadaEvent,
  SuscripcionCanceladaEvent,
  SuscripcionEnGraciaEvent,
  SuscripcionMorosaEvent,
  PagoSuscripcionRegistradoEvent,
} from '../../suscripciones/events/suscripcion.events';
import { TipoNotificacion, PrioridadNotificacion } from '@prisma/client';

/**
 * Listener de eventos de suscripción para crear notificaciones automáticas
 *
 * Escucha eventos del dominio de suscripciones y crea notificaciones
 * para tutores sobre cambios importantes en sus suscripciones.
 *
 * EVENTOS ESCUCHADOS:
 * - suscripcion.creada → Notifica creación exitosa
 * - suscripcion.activada → Notifica activación (primer pago)
 * - suscripcion.cancelada → Notifica cancelación con motivo
 * - suscripcion.en_gracia → Notifica período de gracia (ALTA prioridad)
 * - suscripcion.morosa → Notifica estado moroso (CRITICA prioridad)
 * - suscripcion.pago_registrado → Notifica pago exitoso
 */
@Injectable()
export class SuscripcionNotificacionesListener {
  private readonly logger = new Logger(SuscripcionNotificacionesListener.name);

  constructor(private readonly notificacionesService: NotificacionesService) {}

  /**
   * Suscripción creada - Notificar al tutor
   */
  @OnEvent(SuscripcionCreadaEvent.EVENT_NAME)
  async handleSuscripcionCreada(event: SuscripcionCreadaEvent): Promise<void> {
    this.logger.log(
      `Notificando suscripción creada: ${event.suscripcionId} para tutor ${event.tutorId}`,
    );

    await this.notificacionesService.createParaTutor(event.tutorId, {
      tipo: TipoNotificacion.TUTOR_SUSCRIPCION_RENOVADA,
      titulo: 'Suscripción creada',
      mensaje: `Tu suscripción fue creada exitosamente. Precio: $${event.precioFinal.toLocaleString('es-AR')}${event.descuentoPorcentaje > 0 ? ` (${event.descuentoPorcentaje}% de descuento)` : ''}`,
      metadata: {
        suscripcion_id: event.suscripcionId,
        precio_final: event.precioFinal,
      },
    });
  }

  /**
   * Suscripción activada (primer pago confirmado)
   */
  @OnEvent(SuscripcionActivadaEvent.EVENT_NAME)
  async handleSuscripcionActivada(
    event: SuscripcionActivadaEvent,
  ): Promise<void> {
    this.logger.log(
      `Notificando suscripción activada: ${event.suscripcionId} para tutor ${event.tutorId}`,
    );

    await this.notificacionesService.createParaTutor(event.tutorId, {
      tipo: TipoNotificacion.TUTOR_SUSCRIPCION_RENOVADA,
      titulo: 'Suscripción activada',
      mensaje:
        'Tu suscripción está activa. Ya podés acceder a todos los contenidos y clases.',
      metadata: {
        suscripcion_id: event.suscripcionId,
        mp_payment_id: event.mpPaymentId,
      },
    });
  }

  /**
   * Suscripción cancelada - Notificar con motivo
   */
  @OnEvent(SuscripcionCanceladaEvent.EVENT_NAME)
  async handleSuscripcionCancelada(
    event: SuscripcionCanceladaEvent,
  ): Promise<void> {
    this.logger.log(
      `Notificando suscripción cancelada: ${event.suscripcionId} para tutor ${event.tutorId}`,
    );

    const canceladoPorTexto =
      event.canceladoPor === 'tutor'
        ? 'a tu solicitud'
        : event.canceladoPor === 'admin'
          ? 'por el administrador'
          : 'automáticamente por el sistema';

    await this.notificacionesService.createParaTutor(event.tutorId, {
      tipo: TipoNotificacion.TUTOR_SUSCRIPCION_CANCELADA,
      titulo: 'Suscripción cancelada',
      mensaje: `Tu suscripción fue cancelada ${canceladoPorTexto}. Motivo: ${event.motivo}`,
      prioridad: PrioridadNotificacion.ALTA,
      metadata: {
        suscripcion_id: event.suscripcionId,
        motivo: event.motivo,
        cancelado_por: event.canceladoPor,
      },
    });
  }

  /**
   * Suscripción en período de gracia - ALTA prioridad
   */
  @OnEvent(SuscripcionEnGraciaEvent.EVENT_NAME)
  async handleSuscripcionEnGracia(
    event: SuscripcionEnGraciaEvent,
  ): Promise<void> {
    this.logger.log(
      `Notificando período de gracia: ${event.suscripcionId} para tutor ${event.tutorId}`,
    );

    await this.notificacionesService.createParaTutor(event.tutorId, {
      tipo: TipoNotificacion.TUTOR_SUSCRIPCION_PROXIMA_VENCER,
      titulo: 'Pago pendiente - Período de gracia',
      mensaje: `Tu pago no pudo procesarse. Tenés ${event.diasRestantes} días para regularizar tu situación antes de perder el acceso.`,
      prioridad: PrioridadNotificacion.ALTA,
      metadata: {
        suscripcion_id: event.suscripcionId,
        dias_restantes: event.diasRestantes,
        fecha_limite: event.fechaLimiteGracia,
      },
    });
  }

  /**
   * Suscripción morosa - CRITICA prioridad
   */
  @OnEvent(SuscripcionMorosaEvent.EVENT_NAME)
  async handleSuscripcionMorosa(event: SuscripcionMorosaEvent): Promise<void> {
    this.logger.log(
      `Notificando suscripción morosa: ${event.suscripcionId} para tutor ${event.tutorId}`,
    );

    await this.notificacionesService.createParaTutor(event.tutorId, {
      tipo: TipoNotificacion.TUTOR_SUSCRIPCION_CANCELADA,
      titulo: 'Acceso suspendido por falta de pago',
      mensaje: `Tu suscripción fue suspendida por falta de pago después de ${event.diasGraciaUsados} días de gracia. Contactanos para reactivar tu cuenta.`,
      prioridad: PrioridadNotificacion.CRITICA,
      metadata: {
        suscripcion_id: event.suscripcionId,
        dias_gracia_usados: event.diasGraciaUsados,
      },
    });
  }

  /**
   * Pago de suscripción registrado
   */
  @OnEvent(PagoSuscripcionRegistradoEvent.EVENT_NAME)
  async handlePagoRegistrado(
    event: PagoSuscripcionRegistradoEvent,
  ): Promise<void> {
    // Solo notificar pagos aprobados
    if (event.status !== 'approved') {
      return;
    }

    this.logger.log(
      `Notificando pago registrado: ${event.pagoId} para tutor ${event.tutorId}`,
    );

    await this.notificacionesService.notificarPagoExitoso(
      event.tutorId,
      event.monto,
      'Suscripción mensual',
    );
  }
}
