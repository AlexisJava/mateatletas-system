/**
 * PreapprovalService - Gestión de suscripciones recurrentes con MercadoPago
 *
 * Responsabilidades:
 * - Crear suscripciones (PreApproval) en MercadoPago
 * - Cancelar suscripciones
 * - Calcular descuentos familiares
 * - Emitir eventos de dominio
 *
 * REGLA DE NEGOCIO: Las suscripciones NO SE PAUSAN.
 * Si el tutor no paga, se cancela. Si quiere volver, crea una nueva.
 *
 * Patrón Circuit Breaker:
 * - Protege contra fallos repetidos de la API de MercadoPago
 * - 3 fallos consecutivos → circuito abre (rechaza requests por 60s)
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EstadoSuscripcion, IntervaloSuscripcion } from '@prisma/client';
import { PreApproval } from 'mercadopago';

import { PrismaService } from '../../core/database/prisma.service';
import { CircuitBreaker } from '../../common/circuit-breaker/circuit-breaker';
import {
  CrearSuscripcionInput,
  CrearSuscripcionResult,
  CancelarSuscripcionInput,
  PreApprovalError,
  PreApprovalErrorCode,
} from '../types';
import { SuscripcionCreadaEvent, SuscripcionCanceladaEvent } from '../events';
import {
  calcularPrecioConDescuento,
  ResultadoDescuento,
} from '../domain/constants/descuento-familiar.constants';

/**
 * Interfaz para el cliente de PreApproval de MercadoPago
 * Permite inyectar mocks para testing
 */
interface MpPreApprovalClient {
  create: (data: { body: Record<string, unknown> }) => Promise<{
    id: string;
    init_point: string;
    status: string;
  }>;
  update: (data: {
    id: string;
    body: Record<string, unknown>;
  }) => Promise<{ status: string }>;
  get: (data: { id: string }) => Promise<{ status: string }>;
}

/**
 * Tipo de frecuencia para MercadoPago
 */
type MpFrequencyType = 'days' | 'months';

@Injectable()
export class PreapprovalService {
  private readonly logger = new Logger(PreapprovalService.name);
  private mpPreApprovalClient: MpPreApprovalClient | null = null;

  private readonly circuitBreaker: CircuitBreaker;

  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    // Inicializar Circuit Breaker
    this.circuitBreaker = new CircuitBreaker({
      name: 'MercadoPago-PreApproval',
      failureThreshold: 3,
      resetTimeout: 60000,
      fallback: () => {
        throw new PreApprovalError(
          'MercadoPago API no disponible temporalmente',
          PreApprovalErrorCode.CIRCUIT_OPEN,
        );
      },
    });
  }

  /**
   * Setter para inyectar cliente de MercadoPago (para testing)
   */
  setMpPreApprovalClient(client: MpPreApprovalClient | PreApproval): void {
    this.mpPreApprovalClient = client as MpPreApprovalClient;
  }

  /**
   * Crea una nueva suscripción
   *
   * Flujo:
   * 1. Validar tutor y plan
   * 2. Calcular descuento familiar
   * 3. Crear registro en DB (estado PENDIENTE)
   * 4. Crear PreApproval en MercadoPago
   * 5. Actualizar registro con ID de MP
   * 6. Emitir evento
   */
  async crear(input: CrearSuscripcionInput): Promise<CrearSuscripcionResult> {
    const { tutorId, planId, tutorEmail, tutorNombre, numeroHijo } = input;

    // 1. Validar tutor
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
    });

    if (!tutor) {
      throw new PreApprovalError(
        `Tutor ${tutorId} no encontrado`,
        PreApprovalErrorCode.TUTOR_NOT_FOUND,
      );
    }

    // 2. Validar plan
    const plan = await this.prisma.planSuscripcion.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.activo) {
      throw new PreApprovalError(
        `Plan ${planId} no encontrado o inactivo`,
        PreApprovalErrorCode.PLAN_NOT_FOUND,
      );
    }

    // 3. Calcular descuento
    const precioBase = plan.precio_base.toNumber();
    const { precioFinal, descuentoPorcentaje } = calcularPrecioConDescuento(
      precioBase,
      numeroHijo,
    );

    // 4. Crear registro en DB (transacción)
    const suscripcion = await this.prisma.suscripcion.create({
      data: {
        tutor_id: tutorId,
        plan_id: planId,
        estado: EstadoSuscripcion.PENDIENTE,
        precio_final: precioFinal,
        descuento_porcentaje: descuentoPorcentaje,
      },
    });

    // 5. Crear PreApproval en MercadoPago con Circuit Breaker
    const frequencyType = this.mapIntervaloToFrequencyType(plan.intervalo);
    const mpResponse = await this.circuitBreaker.execute(async () => {
      if (!this.mpPreApprovalClient) {
        throw new PreApprovalError(
          'Cliente MercadoPago no configurado',
          PreApprovalErrorCode.MP_API_ERROR,
        );
      }

      return await this.mpPreApprovalClient.create({
        body: {
          payer_email: tutorEmail,
          back_url: `${this.frontendUrl}/suscripcion/callback`,
          reason: `Suscripción Mateatletas - ${plan.nombre} (${tutorNombre})`,
          external_reference: `suscripcion:${suscripcion.id}`,
          auto_recurring: {
            frequency: plan.intervalo_cantidad,
            frequency_type: frequencyType,
            transaction_amount: precioFinal,
            currency_id: 'ARS',
          },
        },
      });
    });

    // 6. Actualizar suscripción con ID de MercadoPago
    await this.prisma.suscripcion.update({
      where: { id: suscripcion.id },
      data: {
        mp_preapproval_id: mpResponse.id,
      },
    });

    // 7. Emitir evento
    this.eventEmitter.emit(
      SuscripcionCreadaEvent.EVENT_NAME,
      new SuscripcionCreadaEvent({
        suscripcionId: suscripcion.id,
        tutorId,
        planId,
        mpPreapprovalId: mpResponse.id,
        precioFinal,
        descuentoPorcentaje,
      }),
    );

    this.logger.log(
      `Suscripción creada: ${suscripcion.id} - MP: ${mpResponse.id}`,
    );

    return {
      suscripcionId: suscripcion.id,
      mpPreapprovalId: mpResponse.id,
      checkoutUrl: mpResponse.init_point,
      precioFinal,
      descuentoPorcentaje,
    };
  }

  /**
   * Cancela una suscripción
   *
   * REGLA DE NEGOCIO: No hay pausa. Si no paga, se cancela.
   * Si quiere volver, crea una nueva suscripción.
   *
   * Validaciones:
   * - Suscripción existe
   * - Tutor es dueño
   * - Estado permite cancelación (no ya cancelada)
   */
  async cancelar(input: CancelarSuscripcionInput): Promise<void> {
    const { suscripcionId, tutorId, motivo, canceladoPor } = input;

    // 1. Buscar suscripción
    const suscripcion = await this.prisma.suscripcion.findUnique({
      where: { id: suscripcionId },
      include: { plan: true },
    });

    if (!suscripcion) {
      throw new PreApprovalError(
        `Suscripción ${suscripcionId} no encontrada`,
        PreApprovalErrorCode.NOT_FOUND,
      );
    }

    // 2. Validar ownership
    if (suscripcion.tutor_id !== tutorId) {
      throw new PreApprovalError(
        'No autorizado para cancelar esta suscripción',
        PreApprovalErrorCode.UNAUTHORIZED,
      );
    }

    // 3. Validar estado
    if (suscripcion.estado === EstadoSuscripcion.CANCELADA) {
      throw new PreApprovalError(
        'La suscripción ya está cancelada',
        PreApprovalErrorCode.INVALID_STATE,
      );
    }

    const estadoAnterior = suscripcion.estado;

    // 4. Cancelar en MercadoPago
    if (suscripcion.mp_preapproval_id) {
      await this.circuitBreaker.execute(async () => {
        if (!this.mpPreApprovalClient) {
          throw new PreApprovalError(
            'Cliente MercadoPago no configurado',
            PreApprovalErrorCode.MP_API_ERROR,
          );
        }

        return await this.mpPreApprovalClient.update({
          id: suscripcion.mp_preapproval_id!,
          body: { status: 'cancelled' },
        });
      });
    }

    // 5. Actualizar en DB
    await this.prisma.suscripcion.update({
      where: { id: suscripcionId },
      data: {
        estado: EstadoSuscripcion.CANCELADA,
        motivo_cancelacion: motivo,
        cancelado_por: canceladoPor,
        fecha_cancelacion: new Date(),
      },
    });

    // 6. Registrar en historial
    await this.prisma.historialEstadoSuscripcion.create({
      data: {
        suscripcion_id: suscripcionId,
        estado_anterior: estadoAnterior,
        estado_nuevo: EstadoSuscripcion.CANCELADA,
        motivo,
        realizado_por: canceladoPor,
      },
    });

    // 7. Emitir evento
    this.eventEmitter.emit(
      SuscripcionCanceladaEvent.EVENT_NAME,
      new SuscripcionCanceladaEvent({
        suscripcionId,
        tutorId,
        motivo,
        canceladoPor,
        estadoAnterior,
      }),
    );

    this.logger.log(`Suscripción cancelada: ${suscripcionId}`);
  }

  /**
   * Calcula el precio con descuento familiar
   *
   * Reglas:
   * - Primer hijo: 0% descuento
   * - Segundo hijo: 10% descuento
   * - Tercer hijo: 20% descuento
   * - Máximo: 50% descuento
   */
  calcularPrecioConDescuento(
    precioBase: number,
    numeroHijo: number,
  ): ResultadoDescuento {
    return calcularPrecioConDescuento(precioBase, numeroHijo);
  }

  /**
   * Obtiene métricas del circuit breaker
   */
  getCircuitBreakerMetrics() {
    return this.circuitBreaker.getMetrics();
  }

  /**
   * Mapea intervalo de Prisma a frecuencia de MercadoPago
   */
  private mapIntervaloToFrequencyType(
    intervalo: IntervaloSuscripcion,
  ): MpFrequencyType {
    switch (intervalo) {
      case IntervaloSuscripcion.DIARIO:
        return 'days';
      case IntervaloSuscripcion.SEMANAL:
        return 'days'; // 7 días
      case IntervaloSuscripcion.MENSUAL:
        return 'months';
      case IntervaloSuscripcion.ANUAL:
        return 'months'; // 12 meses
      default:
        return 'months';
    }
  }
}
