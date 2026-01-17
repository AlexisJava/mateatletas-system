/**
 * SuscripcionFamiliarCommandService - Operaciones de escritura para suscripciones familiares
 *
 * Responsabilidades:
 * - Crear suscripciones familiares
 * - Agregar/quitar inscripciones de actividades
 * - Cancelar suscripciones
 * - Recalcular montos mensuales
 *
 * Patrón: CQRS (Command)
 * - Este servicio maneja solo operaciones de ESCRITURA
 * - Las operaciones de LECTURA están en SuscripcionFamiliarQueryService
 *
 * Reglas de negocio:
 * - Una suscripción por familia (tutor)
 * - Descuento 10% desde la 2da actividad
 * - Un solo PreApproval en MercadoPago
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  EstadoSuscripcionFamiliar,
  EstadoInscripcionActividad,
  TipoCambioInscripcion,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../../core/database/prisma.service';
import { CircuitBreaker } from '../../common/circuit-breaker/circuit-breaker';
import { MercadoPagoPreApprovalClientService } from './mercadopago-preapproval-client.service';
import {
  CrearSuscripcionFamiliarInput,
  CrearSuscripcionFamiliarResult,
  AgregarInscripcionesInput,
  AgregarInscripcionesResult,
  BajaInscripcionesInput,
  BajaInscripcionesResult,
  CancelarSuscripcionFamiliarInput,
  SuscripcionFamiliarError,
  SuscripcionFamiliarErrorCode,
} from '../types';
import {
  calcularMontoMensualTotal,
  obtenerPrecioTier,
} from '../domain/constants/suscripcion-familiar.constants';

type PrismaTransactionClient = Prisma.TransactionClient;

@Injectable()
export class SuscripcionFamiliarCommandService {
  private readonly logger = new Logger(SuscripcionFamiliarCommandService.name);
  private readonly frontendUrl: string;
  private readonly circuitBreaker: CircuitBreaker;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly mpClient: MercadoPagoPreApprovalClientService,
  ) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    this.circuitBreaker = new CircuitBreaker({
      name: 'MercadoPago-SuscripcionFamiliar',
      failureThreshold: 3,
      resetTimeout: 60000,
      fallback: () => {
        throw new SuscripcionFamiliarError(
          'MercadoPago API no disponible temporalmente',
          SuscripcionFamiliarErrorCode.CIRCUIT_OPEN,
        );
      },
    });
  }

  /**
   * Valida y obtiene precios de las inscripciones
   */
  private async validarInscripciones(
    inscripciones: CrearSuscripcionFamiliarInput['inscripciones'],
    estudianteIds: string[],
    tier: CrearSuscripcionFamiliarInput['tier'],
  ): Promise<number[]> {
    if (!inscripciones || inscripciones.length === 0) {
      return [obtenerPrecioTier(tier)];
    }

    // Validar estudiantes pertenecen al tutor
    for (const insc of inscripciones) {
      if (!estudianteIds.includes(insc.estudianteId)) {
        throw new SuscripcionFamiliarError(
          `Estudiante ${insc.estudianteId} no pertenece al tutor`,
          SuscripcionFamiliarErrorCode.ESTUDIANTE_NOT_FOUND,
        );
      }
    }

    // Obtener productos y validar
    const productoIds = [...new Set(inscripciones.map((i) => i.productoId))];
    const productos = await this.prisma.producto.findMany({
      where: { id: { in: productoIds }, activo: true },
      select: { id: true, precio: true },
    });

    const productosMap = new Map(productos.map((p) => [p.id, p]));
    const precios: number[] = [];

    for (const insc of inscripciones) {
      const producto = productosMap.get(insc.productoId);
      if (!producto) {
        throw new SuscripcionFamiliarError(
          `Producto ${insc.productoId} no encontrado o inactivo`,
          SuscripcionFamiliarErrorCode.PRODUCTO_NOT_FOUND,
        );
      }
      precios.push(producto.precio?.toNumber() ?? obtenerPrecioTier(tier));
    }

    return precios;
  }

  /**
   * Crea una nueva suscripción familiar
   */
  async crear(
    input: CrearSuscripcionFamiliarInput,
  ): Promise<CrearSuscripcionFamiliarResult> {
    const {
      tutorId,
      tier,
      tutorEmail,
      tutorNombre,
      inscripciones,
      cardTokenId,
      payerEmail,
    } = input;
    const usarBricks = !!(cardTokenId && payerEmail);

    // 1. Validar tutor
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
      include: {
        suscripcionFamiliar: true,
        estudiantes: { select: { id: true } },
      },
    });

    if (!tutor) {
      throw new SuscripcionFamiliarError(
        `Tutor ${tutorId} no encontrado`,
        SuscripcionFamiliarErrorCode.TUTOR_NOT_FOUND,
      );
    }

    if (tutor.suscripcionFamiliar) {
      throw new SuscripcionFamiliarError(
        'El tutor ya tiene una suscripción familiar activa',
        SuscripcionFamiliarErrorCode.ALREADY_EXISTS,
      );
    }

    // 2. Validar inscripciones y calcular precios
    const estudianteIds = tutor.estudiantes.map((e) => e.id);
    const preciosActividades = await this.validarInscripciones(
      inscripciones,
      estudianteIds,
      tier,
    );

    // 3. Calcular monto mensual
    const montoMensual =
      calcularMontoMensualTotal(preciosActividades).montoConDescuento;

    // 4. Crear en transacción
    const result = await this.prisma.$transaction(
      async (tx: PrismaTransactionClient) => {
        // 4.1 Crear suscripción en DB
        const estadoInicial = usarBricks
          ? EstadoSuscripcionFamiliar.AUTHORIZED
          : EstadoSuscripcionFamiliar.PENDING;

        const suscripcion = await tx.suscripcionFamiliar.create({
          data: {
            tutor_id: tutorId,
            tier,
            estado: estadoInicial,
            monto_mensual: montoMensual,
          },
        });

        // 4.2 Crear inscripciones si las hay
        if (inscripciones && inscripciones.length > 0) {
          const inscripcionesData = inscripciones.map((insc) => ({
            suscripcion_familiar_id: suscripcion.id,
            estudiante_id: insc.estudianteId,
            producto_id: insc.productoId,
            clase_grupo_id: insc.claseGrupoId ?? null,
            comision_id: insc.comisionId ?? null,
            estado: EstadoInscripcionActividad.ACTIVA,
          }));

          await tx.inscripcionActividad.createMany({
            data: inscripcionesData,
          });
        }

        // 4.3 Crear PreApproval en MercadoPago (o usar ID dummy en tests)
        let mpPreapprovalId: string;
        let checkoutUrl: string | null;

        if (this.mpClient.isConfigured()) {
          const mpBody: Record<string, string | number | boolean | object> = {
            payer_email: usarBricks ? payerEmail : tutorEmail,
            back_url: `${this.frontendUrl}/tutor/suscripcion/callback`,
            reason: `Suscripción Familiar Mateatletas - ${tier} (${tutorNombre})`,
            external_reference: `suscripcion_familiar:${suscripcion.id}`,
            auto_recurring: {
              frequency: 1,
              frequency_type: 'months',
              transaction_amount: montoMensual,
              currency_id: 'ARS',
            },
          };

          if (usarBricks && cardTokenId) {
            mpBody.card_token_id = cardTokenId;
            mpBody.status = 'authorized';
          }

          const mpResponse = await this.circuitBreaker.execute(async () => {
            return await this.mpClient.create(mpBody);
          });

          mpPreapprovalId = mpResponse.id;
          checkoutUrl = usarBricks ? null : mpResponse.init_point;
        } else {
          // Modo test: MercadoPago no configurado, usar ID dummy
          this.logger.warn(
            'MercadoPago no configurado - usando ID dummy para tests',
          );
          mpPreapprovalId = `TEST_PREAPPROVAL_${suscripcion.id}`;
          checkoutUrl = null;
        }

        // 4.4 Actualizar con ID de MercadoPago
        await tx.suscripcionFamiliar.update({
          where: { id: suscripcion.id },
          data: { preapproval_id: mpPreapprovalId },
        });

        return {
          suscripcionId: suscripcion.id,
          mpPreapprovalId,
          checkoutUrl,
          montoMensual,
          tier,
          cobradoInmediatamente: usarBricks,
        };
      },
    );

    this.logger.log(
      `Suscripción familiar creada: ${result.suscripcionId} - Monto: $${montoMensual}`,
    );

    return result;
  }

  /**
   * Agrega inscripciones a una suscripción existente
   */
  async agregarInscripciones(
    input: AgregarInscripcionesInput,
  ): Promise<AgregarInscripcionesResult> {
    const { suscripcionFamiliarId, tutorId, inscripciones } = input;

    // 1. Validar suscripción y ownership
    const suscripcion = await this.prisma.suscripcionFamiliar.findUnique({
      where: { id: suscripcionFamiliarId },
      include: {
        inscripciones: {
          where: { estado: EstadoInscripcionActividad.ACTIVA },
          include: { producto: { select: { precio: true } } },
        },
        tutor: { include: { estudiantes: { select: { id: true } } } },
      },
    });

    if (!suscripcion) {
      throw new SuscripcionFamiliarError(
        'Suscripción no encontrada',
        SuscripcionFamiliarErrorCode.NOT_FOUND,
      );
    }

    if (suscripcion.tutor_id !== tutorId) {
      throw new SuscripcionFamiliarError(
        'No autorizado',
        SuscripcionFamiliarErrorCode.UNAUTHORIZED,
      );
    }

    if (suscripcion.estado === EstadoSuscripcionFamiliar.CANCELLED) {
      throw new SuscripcionFamiliarError(
        'No se pueden agregar inscripciones a una suscripción cancelada',
        SuscripcionFamiliarErrorCode.INVALID_STATE,
      );
    }

    // 2. Validar estudiantes y productos
    const estudianteIds = suscripcion.tutor.estudiantes.map((e) => e.id);
    const productoIds = [...new Set(inscripciones.map((i) => i.productoId))];

    for (const insc of inscripciones) {
      if (!estudianteIds.includes(insc.estudianteId)) {
        throw new SuscripcionFamiliarError(
          `Estudiante ${insc.estudianteId} no pertenece al tutor`,
          SuscripcionFamiliarErrorCode.ESTUDIANTE_NOT_FOUND,
        );
      }
    }

    const productos = await this.prisma.producto.findMany({
      where: { id: { in: productoIds }, activo: true },
      select: { id: true, precio: true },
    });
    const productosMap = new Map(productos.map((p) => [p.id, p]));

    // 3. Calcular nuevo monto
    const preciosActuales = suscripcion.inscripciones.map(
      (i) =>
        i.producto.precio?.toNumber() ?? obtenerPrecioTier(suscripcion.tier),
    );

    const preciosNuevos: number[] = [];
    for (const insc of inscripciones) {
      const producto = productosMap.get(insc.productoId);
      if (!producto) {
        throw new SuscripcionFamiliarError(
          `Producto ${insc.productoId} no encontrado`,
          SuscripcionFamiliarErrorCode.PRODUCTO_NOT_FOUND,
        );
      }
      preciosNuevos.push(
        producto.precio?.toNumber() ?? obtenerPrecioTier(suscripcion.tier),
      );
    }

    const montoAnterior = suscripcion.monto_mensual;
    const calculoNuevo = calcularMontoMensualTotal([
      ...preciosActuales,
      ...preciosNuevos,
    ]);
    const nuevoMontoMensual = calculoNuevo.montoConDescuento;

    // 4. Crear inscripciones en transacción
    const inscripcionesCreadas = await this.prisma.$transaction(
      async (tx: PrismaTransactionClient) => {
        const creadas: string[] = [];

        for (const insc of inscripciones) {
          const nueva = await tx.inscripcionActividad.create({
            data: {
              suscripcion_familiar_id: suscripcionFamiliarId,
              estudiante_id: insc.estudianteId,
              producto_id: insc.productoId,
              clase_grupo_id: insc.claseGrupoId ?? null,
              comision_id: insc.comisionId ?? null,
              estado: EstadoInscripcionActividad.ACTIVA,
            },
          });
          creadas.push(nueva.id);

          // Registrar cambio
          await tx.cambioInscripcion.create({
            data: {
              suscripcion_familiar_id: suscripcionFamiliarId,
              tipo: TipoCambioInscripcion.ALTA,
              inscripcion_nueva_id: nueva.id,
              aplica_desde: new Date(),
              monto_anterior: montoAnterior,
              monto_nuevo: nuevoMontoMensual,
            },
          });
        }

        // Actualizar monto mensual
        await tx.suscripcionFamiliar.update({
          where: { id: suscripcionFamiliarId },
          data: { monto_mensual: nuevoMontoMensual },
        });

        return creadas;
      },
    );

    this.logger.log(
      `Agregadas ${inscripcionesCreadas.length} inscripciones a suscripción ${suscripcionFamiliarId}`,
    );

    return {
      inscripcionesCreadas,
      nuevoMontoMensual,
      montoAnterior,
      diferenciaMonto: nuevoMontoMensual - montoAnterior,
    };
  }

  /**
   * Da de baja inscripciones de una suscripción
   */
  async bajaInscripciones(
    input: BajaInscripcionesInput,
  ): Promise<BajaInscripcionesResult> {
    const { suscripcionFamiliarId, tutorId, inscripcionIds, motivo } = input;

    // 1. Validar suscripción y ownership
    const suscripcion = await this.prisma.suscripcionFamiliar.findUnique({
      where: { id: suscripcionFamiliarId },
      include: {
        inscripciones: {
          where: { estado: EstadoInscripcionActividad.ACTIVA },
          include: { producto: { select: { precio: true } } },
        },
      },
    });

    if (!suscripcion) {
      throw new SuscripcionFamiliarError(
        'Suscripción no encontrada',
        SuscripcionFamiliarErrorCode.NOT_FOUND,
      );
    }

    if (suscripcion.tutor_id !== tutorId) {
      throw new SuscripcionFamiliarError(
        'No autorizado',
        SuscripcionFamiliarErrorCode.UNAUTHORIZED,
      );
    }

    // 2. Calcular nuevo monto (sin las inscripciones a dar de baja)
    const inscripcionesRestantes = suscripcion.inscripciones.filter(
      (i) => !inscripcionIds.includes(i.id),
    );

    const preciosRestantes = inscripcionesRestantes.map(
      (i) =>
        i.producto.precio?.toNumber() ?? obtenerPrecioTier(suscripcion.tier),
    );

    const montoAnterior = suscripcion.monto_mensual;
    const calculoNuevo = calcularMontoMensualTotal(preciosRestantes);
    const nuevoMontoMensual = calculoNuevo.montoConDescuento;

    // 3. Dar de baja en transacción
    await this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
      for (const inscId of inscripcionIds) {
        await tx.inscripcionActividad.update({
          where: { id: inscId },
          data: {
            estado: EstadoInscripcionActividad.CANCELADA,
            fecha_fin: new Date(),
          },
        });

        // Registrar cambio
        await tx.cambioInscripcion.create({
          data: {
            suscripcion_familiar_id: suscripcionFamiliarId,
            tipo: TipoCambioInscripcion.BAJA,
            inscripcion_anterior_id: inscId,
            aplica_desde: new Date(),
            monto_anterior: montoAnterior,
            monto_nuevo: nuevoMontoMensual,
            detalle: { motivo },
          },
        });
      }

      // Actualizar monto mensual
      await tx.suscripcionFamiliar.update({
        where: { id: suscripcionFamiliarId },
        data: { monto_mensual: nuevoMontoMensual },
      });
    });

    this.logger.log(
      `Baja de ${inscripcionIds.length} inscripciones en suscripción ${suscripcionFamiliarId}`,
    );

    return {
      inscripcionesBaja: inscripcionIds,
      nuevoMontoMensual,
      montoAnterior,
    };
  }

  /**
   * Cancela una suscripción familiar
   */
  async cancelar(input: CancelarSuscripcionFamiliarInput): Promise<void> {
    const { suscripcionFamiliarId, tutorId, motivo, canceladoPor } = input;

    const suscripcion = await this.prisma.suscripcionFamiliar.findUnique({
      where: { id: suscripcionFamiliarId },
    });

    if (!suscripcion) {
      throw new SuscripcionFamiliarError(
        'Suscripción no encontrada',
        SuscripcionFamiliarErrorCode.NOT_FOUND,
      );
    }

    if (suscripcion.tutor_id !== tutorId && canceladoPor !== 'admin') {
      throw new SuscripcionFamiliarError(
        'No autorizado',
        SuscripcionFamiliarErrorCode.UNAUTHORIZED,
      );
    }

    if (suscripcion.estado === EstadoSuscripcionFamiliar.CANCELLED) {
      throw new SuscripcionFamiliarError(
        'La suscripción ya está cancelada',
        SuscripcionFamiliarErrorCode.INVALID_STATE,
      );
    }

    const montoAnterior = suscripcion.monto_mensual;

    await this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
      // Cancelar en MercadoPago si tiene preapproval y está configurado
      if (suscripcion.preapproval_id && this.mpClient.isConfigured()) {
        await this.circuitBreaker.execute(async () => {
          return await this.mpClient.cancel(
            suscripcion.preapproval_id as string,
          );
        });
      }

      // Actualizar estado
      await tx.suscripcionFamiliar.update({
        where: { id: suscripcionFamiliarId },
        data: {
          estado: EstadoSuscripcionFamiliar.CANCELLED,
          monto_mensual: 0,
        },
      });

      // Cancelar todas las inscripciones activas
      await tx.inscripcionActividad.updateMany({
        where: {
          suscripcion_familiar_id: suscripcionFamiliarId,
          estado: EstadoInscripcionActividad.ACTIVA,
        },
        data: {
          estado: EstadoInscripcionActividad.CANCELADA,
          fecha_fin: new Date(),
        },
      });

      // Registrar cambio
      await tx.cambioInscripcion.create({
        data: {
          suscripcion_familiar_id: suscripcionFamiliarId,
          tipo: TipoCambioInscripcion.BAJA,
          aplica_desde: new Date(),
          monto_anterior: montoAnterior,
          monto_nuevo: 0,
          detalle: { motivo, canceladoPor },
        },
      });
    });

    this.logger.log(`Suscripción familiar cancelada: ${suscripcionFamiliarId}`);
  }
}
