/**
 * PreapprovalService - Gestión de suscripciones recurrentes con MercadoPago
 *
 * Responsabilidades:
 * - Crear suscripciones (PreApproval) en MercadoPago
 * - Cancelar suscripciones
 * - Calcular descuentos familiares
 * - Emitir eventos de dominio (DESPUÉS del commit)
 *
 * REGLA DE NEGOCIO: Las suscripciones NO SE PAUSAN.
 * Si el tutor no paga, se cancela. Si quiere volver, crea una nueva.
 *
 * PATRÓN TRANSACCIONAL:
 * - Todas las operaciones DB se envuelven en $transaction
 * - Los eventos se emiten DESPUÉS del commit exitoso
 * - Si falla, se hace rollback automático
 *
 * Patrón Circuit Breaker:
 * - Protege contra fallos repetidos de la API de MercadoPago
 * - 3 fallos consecutivos → circuito abre (rechaza requests por 60s)
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  EstadoSuscripcion,
  IntervaloSuscripcion,
  Prisma,
} from '@prisma/client';
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
import {
  OptimisticLockError,
  isOptimisticLockError,
} from '../errors/optimistic-lock.error';

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

/**
 * Tipo para el cliente de transacción de Prisma
 */
type PrismaTransactionClient = Prisma.TransactionClient;

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
   * Flujo TRANSACCIONAL:
   * 1. Validar tutor y plan (fuera de transacción - read-only)
   * 2. Calcular descuento familiar
   * 3. TRANSACCIÓN: Crear registro en DB + Llamar MP API + Actualizar con MP ID
   * 4. DESPUÉS DEL COMMIT: Emitir evento
   *
   * Si MP falla, la transacción hace rollback automáticamente.
   *
   * FLUJOS SOPORTADOS:
   * - Sin cardTokenId → Redirect a checkout de MercadoPago (estado: pending)
   * - Con cardTokenId + payerEmail → Cobro inmediato con Bricks (estado: authorized)
   */
  async crear(input: CrearSuscripcionInput): Promise<CrearSuscripcionResult> {
    const {
      tutorId,
      planId,
      tutorEmail,
      tutorNombre,
      numeroHijo,
      cardTokenId,
      payerEmail,
    } = input;

    // Determinar flujo: Bricks (cobro inmediato) o Redirect
    const usarBricks = !!(cardTokenId && payerEmail);

    // 1. Validar tutor (read-only, fuera de transacción)
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
    });

    if (!tutor) {
      throw new PreApprovalError(
        `Tutor ${tutorId} no encontrado`,
        PreApprovalErrorCode.TUTOR_NOT_FOUND,
      );
    }

    // 2. Validar plan (read-only, fuera de transacción)
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

    // 4. TRANSACCIÓN: Crear en DB + MP API + Actualizar
    const result = await this.prisma.$transaction(
      async (tx: PrismaTransactionClient) => {
        // 4.1 Crear registro en DB (estado según flujo)
        const estadoInicial = usarBricks
          ? EstadoSuscripcion.ACTIVA // Bricks: cobro inmediato → activa
          : EstadoSuscripcion.PENDIENTE; // Redirect: espera pago

        const suscripcion = await tx.suscripcion.create({
          data: {
            tutor_id: tutorId,
            plan_id: planId,
            estado: estadoInicial,
            precio_final: precioFinal,
            descuento_porcentaje: descuentoPorcentaje,
            // Si es Bricks, establecer fecha_inicio inmediatamente
            ...(usarBricks && { fecha_inicio: new Date() }),
          },
        });

        // 4.2 Crear PreApproval en MercadoPago con Circuit Breaker
        const frequencyType = this.mapIntervaloToFrequencyType(plan.intervalo);
        const mpResponse = await this.circuitBreaker.execute(async () => {
          if (!this.mpPreApprovalClient) {
            throw new PreApprovalError(
              'Cliente MercadoPago no configurado',
              PreApprovalErrorCode.MP_API_ERROR,
            );
          }

          // Construir body base
          const mpBody: Record<string, unknown> = {
            payer_email: usarBricks ? payerEmail : tutorEmail,
            back_url: `${this.frontendUrl}/suscripcion/callback`,
            reason: `Suscripción Mateatletas - ${plan.nombre} (${tutorNombre})`,
            external_reference: `suscripcion:${suscripcion.id}`,
            auto_recurring: {
              frequency: plan.intervalo_cantidad,
              frequency_type: frequencyType,
              transaction_amount: precioFinal,
              currency_id: 'ARS',
            },
          };

          // Si usamos Bricks: agregar card_token_id y status authorized
          if (usarBricks) {
            mpBody.card_token_id = cardTokenId;
            mpBody.status = 'authorized'; // Cobra inmediatamente

            // SEGURIDAD: Solo loguear últimos 4 caracteres del token
            this.logger.log(
              `Creando suscripción con Bricks para ${payerEmail}, ` +
                `token: ...${cardTokenId.slice(-4)}`,
            );
          } else {
            this.logger.log(
              `Creando suscripción con redirect para plan ${plan.nombre}`,
            );
          }

          return await this.mpPreApprovalClient.create({ body: mpBody });
        });

        // 4.3 Actualizar suscripción con ID de MercadoPago
        await tx.suscripcion.update({
          where: { id: suscripcion.id },
          data: {
            mp_preapproval_id: mpResponse.id,
          },
        });

        return {
          suscripcionId: suscripcion.id,
          mpPreapprovalId: mpResponse.id,
          // Si es Bricks, no hay checkout URL (ya se cobró)
          checkoutUrl: usarBricks ? null : mpResponse.init_point,
          precioFinal,
          descuentoPorcentaje,
          cobradoInmediatamente: usarBricks,
        };
      },
    );

    // 5. DESPUÉS DEL COMMIT: Emitir evento
    // CRÍTICO: Solo llegamos aquí si la transacción fue exitosa
    this.eventEmitter.emit(
      SuscripcionCreadaEvent.EVENT_NAME,
      new SuscripcionCreadaEvent({
        suscripcionId: result.suscripcionId,
        tutorId,
        planId,
        mpPreapprovalId: result.mpPreapprovalId,
        precioFinal: result.precioFinal,
        descuentoPorcentaje: result.descuentoPorcentaje,
      }),
    );

    const flujo = usarBricks ? 'Bricks (cobro inmediato)' : 'Redirect';
    this.logger.log(
      `Suscripción creada: ${result.suscripcionId} - MP: ${result.mpPreapprovalId} - Flujo: ${flujo}`,
    );

    return result;
  }

  /**
   * Cancela una suscripción
   *
   * REGLA DE NEGOCIO: No hay pausa. Si no paga, se cancela.
   * Si quiere volver, crea una nueva suscripción.
   *
   * Flujo TRANSACCIONAL:
   * 1. Validaciones (fuera de transacción - read-only)
   * 2. TRANSACCIÓN: Cancelar en MP + Actualizar DB + Registrar historial
   * 3. DESPUÉS DEL COMMIT: Emitir evento
   */
  async cancelar(input: CancelarSuscripcionInput): Promise<void> {
    const { suscripcionId, tutorId, motivo, canceladoPor } = input;

    // 1. Buscar suscripción (read-only, fuera de transacción)
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
    const currentVersion = suscripcion.version;

    // Extraer mp_preapproval_id antes de la transacción para evitar narrowing issues
    const mpPreapprovalId = suscripcion.mp_preapproval_id;

    // 4. TRANSACCIÓN: MP API + DB updates con Optimistic Locking
    try {
      await this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
        // 4.1 Cancelar en MercadoPago
        if (mpPreapprovalId) {
          await this.circuitBreaker.execute(async () => {
            if (!this.mpPreApprovalClient) {
              throw new PreApprovalError(
                'Cliente MercadoPago no configurado',
                PreApprovalErrorCode.MP_API_ERROR,
              );
            }

            return await this.mpPreApprovalClient.update({
              id: mpPreapprovalId,
              body: { status: 'cancelled' },
            });
          });
        }

        // 4.2 Actualizar en DB con Optimistic Locking
        await tx.suscripcion.update({
          where: {
            id: suscripcionId,
            version: currentVersion, // Optimistic Lock check
          },
          data: {
            estado: EstadoSuscripcion.CANCELADA,
            motivo_cancelacion: motivo,
            cancelado_por: canceladoPor,
            fecha_cancelacion: new Date(),
            version: { increment: 1 }, // Incrementar versión
          },
        });

        // 4.3 Registrar en historial
        await tx.historialEstadoSuscripcion.create({
          data: {
            suscripcion_id: suscripcionId,
            estado_anterior: estadoAnterior,
            estado_nuevo: EstadoSuscripcion.CANCELADA,
            motivo,
            realizado_por: canceladoPor,
          },
        });
      });
    } catch (error) {
      // Convertir error de Prisma P2025 a OptimisticLockError
      if (isOptimisticLockError(error)) {
        throw new OptimisticLockError(suscripcionId, currentVersion);
      }
      throw error;
    }

    // 5. DESPUÉS DEL COMMIT: Emitir evento
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
