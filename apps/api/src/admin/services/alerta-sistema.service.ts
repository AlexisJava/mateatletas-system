import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../core/database/prisma.service';
import { TipoAlertaAdmin, PrioridadNotificacion, Prisma } from '@prisma/client';

/**
 * DTO para crear una alerta del sistema
 */
export interface CrearAlertaSistemaDto {
  tipo: TipoAlertaAdmin;
  titulo: string;
  mensaje: string;
  prioridad?: PrioridadNotificacion;
  metadata?: Record<string, unknown>;
}

/**
 * Servicio para gestionar alertas del sistema para administradores
 *
 * Diferente de AdminAlertasService que maneja alertas pedagógicas.
 * Este servicio maneja alertas de:
 * - Suscripciones (nuevas, canceladas, grace period)
 * - Pagos (fallidos, fraudulentos)
 * - Sistema (webhooks, errores)
 * - Estudiantes (inactividad)
 */
@Injectable()
export class AlertaSistemaService {
  private readonly logger = new Logger(AlertaSistemaService.name);

  constructor(private prisma: PrismaService) {}

  // ============================================================================
  // CRUD DE ALERTAS
  // ============================================================================

  /**
   * Crear una nueva alerta del sistema
   */
  async crear(dto: CrearAlertaSistemaDto) {
    const alerta = await this.prisma.alertaAdmin.create({
      data: {
        tipo: dto.tipo,
        titulo: dto.titulo,
        mensaje: dto.mensaje,
        prioridad: dto.prioridad ?? PrioridadNotificacion.MEDIA,
        metadata: dto.metadata as Prisma.JsonObject | undefined,
      },
    });

    this.logger.log(
      `Alerta creada: ${alerta.id} (${alerta.tipo}) - ${alerta.titulo}`,
    );

    return alerta;
  }

  /**
   * Listar alertas con filtros y paginación
   */
  async listar(options?: {
    soloNoResueltas?: boolean;
    tipo?: TipoAlertaAdmin;
    prioridad?: PrioridadNotificacion;
    page?: number;
    limit?: number;
  }) {
    const {
      soloNoResueltas = true,
      tipo,
      prioridad,
      page = 1,
      limit = 20,
    } = options ?? {};

    const where: Prisma.AlertaAdminWhereInput = {
      ...(soloNoResueltas && { resuelta: false }),
      ...(tipo && { tipo }),
      ...(prioridad && { prioridad }),
    };

    const [alertas, total] = await Promise.all([
      this.prisma.alertaAdmin.findMany({
        where,
        orderBy: [{ prioridad: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.alertaAdmin.count({ where }),
    ]);

    return {
      data: alertas,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener conteo de alertas no resueltas (para badge)
   */
  async contarNoResueltas(): Promise<{
    total: number;
    porPrioridad: Record<string, number>;
  }> {
    const [total, criticas, altas, medias, bajas] = await Promise.all([
      this.prisma.alertaAdmin.count({ where: { resuelta: false } }),
      this.prisma.alertaAdmin.count({
        where: { resuelta: false, prioridad: PrioridadNotificacion.CRITICA },
      }),
      this.prisma.alertaAdmin.count({
        where: { resuelta: false, prioridad: PrioridadNotificacion.ALTA },
      }),
      this.prisma.alertaAdmin.count({
        where: { resuelta: false, prioridad: PrioridadNotificacion.MEDIA },
      }),
      this.prisma.alertaAdmin.count({
        where: { resuelta: false, prioridad: PrioridadNotificacion.BAJA },
      }),
    ]);

    return {
      total,
      porPrioridad: {
        CRITICA: criticas,
        ALTA: altas,
        MEDIA: medias,
        BAJA: bajas,
      },
    };
  }

  /**
   * Marcar una alerta como resuelta
   */
  async resolver(alertaId: string, adminId: string) {
    const alerta = await this.prisma.alertaAdmin.findUnique({
      where: { id: alertaId },
    });

    if (!alerta) {
      throw new NotFoundException(`Alerta con ID ${alertaId} no encontrada`);
    }

    const alertaResuelta = await this.prisma.alertaAdmin.update({
      where: { id: alertaId },
      data: {
        resuelta: true,
        resueltaPorId: adminId,
        fechaResolucion: new Date(),
      },
    });

    this.logger.log(`Alerta ${alertaId} resuelta por admin ${adminId}`);

    return alertaResuelta;
  }

  /**
   * Resolver múltiples alertas a la vez
   */
  async resolverMultiples(alertaIds: string[], adminId: string) {
    const resultado = await this.prisma.alertaAdmin.updateMany({
      where: { id: { in: alertaIds } },
      data: {
        resuelta: true,
        resueltaPorId: adminId,
        fechaResolucion: new Date(),
      },
    });

    this.logger.log(
      `${resultado.count} alertas resueltas por admin ${adminId}`,
    );

    return {
      message: `${resultado.count} alerta(s) resuelta(s)`,
      count: resultado.count,
    };
  }

  // ============================================================================
  // MÉTODOS DE CREACIÓN ESPECÍFICOS (para usar desde otros servicios)
  // ============================================================================

  /**
   * Alerta: Nueva suscripción creada
   */
  async alertarNuevaSuscripcion(
    tutorId: string,
    tutorNombre: string,
    planNombre: string,
    monto: number,
  ) {
    return this.crear({
      tipo: TipoAlertaAdmin.NUEVA_SUSCRIPCION,
      titulo: 'Nueva suscripción',
      mensaje: `${tutorNombre} creó una suscripción "${planNombre}" por $${monto.toLocaleString('es-AR')}/mes`,
      prioridad: PrioridadNotificacion.BAJA,
      metadata: { tutorId, tutorNombre, planNombre, monto },
    });
  }

  /**
   * Alerta: Suscripción cancelada
   */
  async alertarSuscripcionCancelada(
    tutorId: string,
    tutorNombre: string,
    planNombre: string,
    motivo?: string,
  ) {
    return this.crear({
      tipo: TipoAlertaAdmin.SUSCRIPCION_CANCELADA,
      titulo: 'Suscripción cancelada',
      mensaje: `${tutorNombre} canceló su suscripción "${planNombre}"${motivo ? `. Motivo: ${motivo}` : ''}`,
      prioridad: PrioridadNotificacion.MEDIA,
      metadata: { tutorId, tutorNombre, planNombre, ...(motivo && { motivo }) },
    });
  }

  /**
   * Alerta: Pago fallido
   */
  async alertarPagoFallido(
    tutorId: string,
    tutorNombre: string,
    monto: number,
    razon: string,
    intentos?: number,
  ) {
    const prioridad =
      intentos && intentos >= 3
        ? PrioridadNotificacion.ALTA
        : PrioridadNotificacion.MEDIA;

    return this.crear({
      tipo: TipoAlertaAdmin.PAGO_FALLIDO,
      titulo: 'Pago fallido',
      mensaje: `Pago de ${tutorNombre} por $${monto.toLocaleString('es-AR')} fue rechazado: ${razon}`,
      prioridad,
      metadata: { tutorId, tutorNombre, monto, razon, intentos },
    });
  }

  /**
   * Alerta: Estudiante inactivo
   */
  async alertarEstudianteInactivo(
    estudianteId: string,
    estudianteNombre: string,
    tutorNombre: string,
    diasInactivo: number,
  ) {
    return this.crear({
      tipo: TipoAlertaAdmin.ESTUDIANTE_INACTIVO,
      titulo: 'Estudiante inactivo',
      mensaje: `${estudianteNombre} no ha ingresado en ${diasInactivo} días. Tutor: ${tutorNombre}`,
      prioridad:
        diasInactivo >= 14
          ? PrioridadNotificacion.ALTA
          : PrioridadNotificacion.MEDIA,
      metadata: { estudianteId, estudianteNombre, tutorNombre, diasInactivo },
    });
  }

  /**
   * Alerta: Webhook fallido
   */
  async alertarWebhookFallido(
    origen: string,
    error: string,
    payload?: unknown,
  ) {
    return this.crear({
      tipo: TipoAlertaAdmin.WEBHOOK_FALLIDO,
      titulo: `Webhook fallido: ${origen}`,
      mensaje: `Error procesando webhook de ${origen}: ${error}`,
      prioridad: PrioridadNotificacion.ALTA,
      metadata: {
        origen,
        error,
        ...(payload !== undefined
          ? { payloadPreview: JSON.stringify(payload).slice(0, 500) }
          : {}),
      },
    });
  }

  /**
   * Alerta: Suscripción en grace period
   */
  async alertarGracePeriod(
    tutorId: string,
    tutorNombre: string,
    diasRestantes: number,
  ) {
    return this.crear({
      tipo: TipoAlertaAdmin.SUSCRIPCION_GRACE_PERIOD,
      titulo: 'Suscripción en grace period',
      mensaje: `${tutorNombre} tiene ${diasRestantes} días restantes de grace period`,
      prioridad:
        diasRestantes <= 3
          ? PrioridadNotificacion.ALTA
          : PrioridadNotificacion.MEDIA,
      metadata: { tutorId, tutorNombre, diasRestantes },
    });
  }

  /**
   * Alerta: Posible fraude
   */
  async alertarFraudeDetectado(
    descripcion: string,
    metadata: Record<string, unknown>,
  ) {
    return this.crear({
      tipo: TipoAlertaAdmin.FRAUDE_DETECTADO,
      titulo: '⚠️ Posible fraude detectado',
      mensaje: descripcion,
      prioridad: PrioridadNotificacion.CRITICA,
      metadata,
    });
  }

  /**
   * Alerta: Error del sistema
   */
  async alertarErrorSistema(
    titulo: string,
    descripcion: string,
    metadata?: Record<string, unknown>,
  ) {
    return this.crear({
      tipo: TipoAlertaAdmin.SISTEMA,
      titulo,
      mensaje: descripcion,
      prioridad: PrioridadNotificacion.ALTA,
      metadata,
    });
  }

  // ============================================================================
  // EVENT LISTENERS (para integración con EventEmitter)
  // ============================================================================

  /**
   * Escuchar evento de suscripción creada
   */
  @OnEvent('suscripcion.creada')
  async handleSuscripcionCreada(payload: {
    tutorId: string;
    tutorNombre: string;
    planNombre: string;
    monto: number;
  }) {
    try {
      await this.alertarNuevaSuscripcion(
        payload.tutorId,
        payload.tutorNombre,
        payload.planNombre,
        payload.monto,
      );
    } catch (error) {
      this.logger.error(
        `Error creando alerta para suscripcion.creada: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Escuchar evento de suscripción cancelada
   */
  @OnEvent('suscripcion.cancelada')
  async handleSuscripcionCancelada(payload: {
    tutorId: string;
    tutorNombre: string;
    planNombre: string;
    motivo?: string;
  }) {
    try {
      await this.alertarSuscripcionCancelada(
        payload.tutorId,
        payload.tutorNombre,
        payload.planNombre,
        payload.motivo,
      );
    } catch (error) {
      this.logger.error(
        `Error creando alerta para suscripcion.cancelada: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Escuchar evento de pago fallido
   */
  @OnEvent('pago.fallido')
  async handlePagoFallido(payload: {
    tutorId: string;
    tutorNombre: string;
    monto: number;
    razon: string;
    intentos?: number;
  }) {
    try {
      await this.alertarPagoFallido(
        payload.tutorId,
        payload.tutorNombre,
        payload.monto,
        payload.razon,
        payload.intentos,
      );
    } catch (error) {
      this.logger.error(
        `Error creando alerta para pago.fallido: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Escuchar evento de webhook fallido
   */
  @OnEvent('webhook.error')
  async handleWebhookError(payload: {
    origen: string;
    error: string;
    payload?: unknown;
  }) {
    try {
      await this.alertarWebhookFallido(
        payload.origen,
        payload.error,
        payload.payload,
      );
    } catch (error) {
      this.logger.error(
        `Error creando alerta para webhook.error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
