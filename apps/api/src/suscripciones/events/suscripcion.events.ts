/**
 * Eventos de dominio para el módulo de suscripciones
 *
 * Estos eventos se emiten cuando ocurren cambios de estado importantes
 * y permiten que otros módulos reaccionen (notificaciones, logs, etc.)
 *
 * Convención: Nombre en pasado (algo ya ocurrió)
 */
import { EstadoSuscripcion } from '@prisma/client';

/**
 * Base para todos los eventos de suscripción
 */
interface SuscripcionEventBase {
  /** ID de la suscripción */
  readonly suscripcionId: string;
  /** ID del tutor dueño */
  readonly tutorId: string;
  /** Timestamp del evento (ISO 8601) */
  readonly timestamp: string;
}

/**
 * Evento: Se creó una nueva suscripción
 */
export class SuscripcionCreadaEvent implements SuscripcionEventBase {
  static readonly EVENT_NAME = 'suscripcion.creada';

  readonly suscripcionId: string;
  readonly tutorId: string;
  readonly timestamp: string;
  readonly planId: string;
  readonly mpPreapprovalId: string;
  readonly precioFinal: number;
  readonly descuentoPorcentaje: number;

  constructor(data: {
    suscripcionId: string;
    tutorId: string;
    planId: string;
    mpPreapprovalId: string;
    precioFinal: number;
    descuentoPorcentaje: number;
  }) {
    this.suscripcionId = data.suscripcionId;
    this.tutorId = data.tutorId;
    this.planId = data.planId;
    this.mpPreapprovalId = data.mpPreapprovalId;
    this.precioFinal = data.precioFinal;
    this.descuentoPorcentaje = data.descuentoPorcentaje;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Evento: Se activó una suscripción (primer pago confirmado)
 */
export class SuscripcionActivadaEvent implements SuscripcionEventBase {
  static readonly EVENT_NAME = 'suscripcion.activada';

  readonly suscripcionId: string;
  readonly tutorId: string;
  readonly timestamp: string;
  readonly mpPaymentId: string;

  constructor(data: {
    suscripcionId: string;
    tutorId: string;
    mpPaymentId: string;
  }) {
    this.suscripcionId = data.suscripcionId;
    this.tutorId = data.tutorId;
    this.mpPaymentId = data.mpPaymentId;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Evento: Se canceló una suscripción
 *
 * REGLA DE NEGOCIO: No hay pausa. Si no paga, se cancela.
 * Si quiere volver, crea una nueva suscripción.
 */
export class SuscripcionCanceladaEvent implements SuscripcionEventBase {
  static readonly EVENT_NAME = 'suscripcion.cancelada';

  readonly suscripcionId: string;
  readonly tutorId: string;
  readonly timestamp: string;
  readonly motivo: string;
  readonly canceladoPor: 'tutor' | 'admin' | 'system';
  readonly estadoAnterior: EstadoSuscripcion;

  constructor(data: {
    suscripcionId: string;
    tutorId: string;
    motivo: string;
    canceladoPor: 'tutor' | 'admin' | 'system';
    estadoAnterior: EstadoSuscripcion;
  }) {
    this.suscripcionId = data.suscripcionId;
    this.tutorId = data.tutorId;
    this.motivo = data.motivo;
    this.canceladoPor = data.canceladoPor;
    this.estadoAnterior = data.estadoAnterior;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Evento: Cambió el estado de una suscripción (genérico)
 */
export class SuscripcionEstadoCambiadoEvent implements SuscripcionEventBase {
  static readonly EVENT_NAME = 'suscripcion.estado_cambiado';

  readonly suscripcionId: string;
  readonly tutorId: string;
  readonly timestamp: string;
  readonly estadoAnterior: EstadoSuscripcion | null;
  readonly estadoNuevo: EstadoSuscripcion;
  readonly motivo: string | null;
  readonly realizadoPor: string;

  constructor(data: {
    suscripcionId: string;
    tutorId: string;
    estadoAnterior: EstadoSuscripcion | null;
    estadoNuevo: EstadoSuscripcion;
    motivo?: string;
    realizadoPor: string;
  }) {
    this.suscripcionId = data.suscripcionId;
    this.tutorId = data.tutorId;
    this.estadoAnterior = data.estadoAnterior;
    this.estadoNuevo = data.estadoNuevo;
    this.motivo = data.motivo ?? null;
    this.realizadoPor = data.realizadoPor;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Evento: Suscripción entró en período de gracia (pago fallido)
 */
export class SuscripcionEnGraciaEvent implements SuscripcionEventBase {
  static readonly EVENT_NAME = 'suscripcion.en_gracia';

  readonly suscripcionId: string;
  readonly tutorId: string;
  readonly timestamp: string;
  readonly fechaLimiteGracia: string;
  readonly diasRestantes: number;

  constructor(data: {
    suscripcionId: string;
    tutorId: string;
    fechaLimiteGracia: Date;
    diasRestantes: number;
  }) {
    this.suscripcionId = data.suscripcionId;
    this.tutorId = data.tutorId;
    this.fechaLimiteGracia = data.fechaLimiteGracia.toISOString();
    this.diasRestantes = data.diasRestantes;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Evento: Suscripción pasó a morosa (grace period expirado sin pago)
 */
export class SuscripcionMorosaEvent implements SuscripcionEventBase {
  static readonly EVENT_NAME = 'suscripcion.morosa';

  readonly suscripcionId: string;
  readonly tutorId: string;
  readonly timestamp: string;
  readonly diasGraciaUsados: number;

  constructor(data: {
    suscripcionId: string;
    tutorId: string;
    diasGraciaUsados: number;
  }) {
    this.suscripcionId = data.suscripcionId;
    this.tutorId = data.tutorId;
    this.diasGraciaUsados = data.diasGraciaUsados;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Evento: Se registró un pago de suscripción
 */
export class PagoSuscripcionRegistradoEvent {
  static readonly EVENT_NAME = 'suscripcion.pago_registrado';

  readonly pagoId: string;
  readonly suscripcionId: string;
  readonly tutorId: string;
  readonly mpPaymentId: string;
  readonly monto: number;
  readonly status: string;
  readonly timestamp: string;

  constructor(data: {
    pagoId: string;
    suscripcionId: string;
    tutorId: string;
    mpPaymentId: string;
    monto: number;
    status: string;
  }) {
    this.pagoId = data.pagoId;
    this.suscripcionId = data.suscripcionId;
    this.tutorId = data.tutorId;
    this.mpPaymentId = data.mpPaymentId;
    this.monto = data.monto;
    this.status = data.status;
    this.timestamp = new Date().toISOString();
  }
}
