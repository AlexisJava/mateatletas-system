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
  CambiarHorarioInput,
  CambiarHorarioResult,
  CambiarProductoInput,
  CambiarProductoResult,
  // eslint-disable-next-line sonarjs/deprecation -- Backward compatibility
  CambiarTierInput,
  // eslint-disable-next-line sonarjs/deprecation -- Backward compatibility
  CambiarTierResult,
  CambiarTierInscripcionInput,
  CambiarTierInscripcionResult,
  SuscripcionFamiliarError,
  SuscripcionFamiliarErrorCode,
} from '../types';
import {
  calcularMontoMensualTotal,
  calcularMontoMensualConTiers,
  obtenerPrecioTier,
  type InscripcionConTier,
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
    // CRIT-04: Fail fast si FRONTEND_URL no está configurado
    this.frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

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

        // 4.2 Crear inscripciones si las hay (MODELO 2026: tier por inscripción)
        if (inscripciones && inscripciones.length > 0) {
          const inscripcionesData = inscripciones.map((insc) => ({
            suscripcion_familiar_id: suscripcion.id,
            estudiante_id: insc.estudianteId,
            producto_id: insc.productoId,
            clase_grupo_id: insc.claseGrupoId ?? null,
            comision_id: insc.comisionId ?? null,
            estado: EstadoInscripcionActividad.ACTIVA,
            // MODELO 2026: Guardar tier específico de cada inscripción
            // Si no se especifica, usa el tier de la suscripción como fallback
            tier: insc.tier ?? tier,
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
          select: {
            id: true,
            tier: true,
            producto: { select: { precio: true } },
          },
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

    // 3. Calcular nuevo monto - MODELO 2026: usar tiers de inscripciones
    // Las inscripciones existentes ya tienen tier asignado
    const inscripcionesActualesConTier: InscripcionConTier[] =
      suscripcion.inscripciones.map((i) => ({
        id: i.id,
        tier: i.tier ?? suscripcion.tier,
      }));

    // Validar productos y construir inscripciones nuevas con tier
    const inscripcionesNuevasConTier: InscripcionConTier[] = [];
    for (const insc of inscripciones) {
      const producto = productosMap.get(insc.productoId);
      if (!producto) {
        throw new SuscripcionFamiliarError(
          `Producto ${insc.productoId} no encontrado`,
          SuscripcionFamiliarErrorCode.PRODUCTO_NOT_FOUND,
        );
      }
      inscripcionesNuevasConTier.push({
        tier: insc.tier ?? suscripcion.tier,
      });
    }

    const montoAnterior = suscripcion.monto_mensual;
    const calculoNuevo = calcularMontoMensualConTiers([
      ...inscripcionesActualesConTier,
      ...inscripcionesNuevasConTier,
    ]);
    const nuevoMontoMensual = calculoNuevo.montoConDescuento;

    // 4. Crear inscripciones en transacción (MODELO 2026: tier por inscripción)
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
              // MODELO 2026: tier específico por inscripción
              tier: insc.tier ?? suscripcion.tier,
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

  /**
   * Cambia el horario (ClaseGrupo) de una inscripción
   *
   * No modifica el monto - solo el grupo/horario de la actividad
   */
  async cambiarHorario(
    input: CambiarHorarioInput,
  ): Promise<CambiarHorarioResult> {
    const { suscripcionFamiliarId, tutorId, inscripcionId, nuevoClaseGrupoId } =
      input;

    // 1. Validar suscripción y ownership
    const suscripcion = await this.prisma.suscripcionFamiliar.findUnique({
      where: { id: suscripcionFamiliarId },
      include: {
        inscripciones: {
          where: { id: inscripcionId },
          include: { producto: { select: { id: true } } },
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

    const inscripcion = suscripcion.inscripciones[0];
    if (!inscripcion) {
      throw new SuscripcionFamiliarError(
        'Inscripción no encontrada',
        SuscripcionFamiliarErrorCode.NOT_FOUND,
      );
    }

    // 2. Validar que el nuevo ClaseGrupo pertenece al mismo producto
    const nuevoClaseGrupo = await this.prisma.claseGrupo.findUnique({
      where: { id: nuevoClaseGrupoId },
      select: { id: true, nombre: true, producto_id: true },
    });

    if (!nuevoClaseGrupo) {
      throw new SuscripcionFamiliarError(
        'Grupo de clase no encontrado',
        SuscripcionFamiliarErrorCode.NOT_FOUND,
      );
    }

    if (nuevoClaseGrupo.producto_id !== inscripcion.producto.id) {
      throw new SuscripcionFamiliarError(
        'El nuevo horario debe pertenecer al mismo producto',
        SuscripcionFamiliarErrorCode.INVALID_STATE,
      );
    }

    const claseGrupoAnteriorId = inscripcion.clase_grupo_id ?? '';

    // 3. Actualizar inscripción
    await this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
      await tx.inscripcionActividad.update({
        where: { id: inscripcionId },
        data: { clase_grupo_id: nuevoClaseGrupoId },
      });

      // Registrar cambio
      await tx.cambioInscripcion.create({
        data: {
          suscripcion_familiar_id: suscripcionFamiliarId,
          tipo: TipoCambioInscripcion.CAMBIO_HORARIO,
          inscripcion_anterior_id: inscripcionId,
          aplica_desde: new Date(),
          monto_anterior: suscripcion.monto_mensual,
          monto_nuevo: suscripcion.monto_mensual,
          detalle: {
            claseGrupoAnteriorId,
            nuevoClaseGrupoId,
          },
        },
      });
    });

    this.logger.log(
      `Cambio de horario: inscripción ${inscripcionId} → grupo ${nuevoClaseGrupoId}`,
    );

    return {
      inscripcionId,
      claseGrupoAnteriorId,
      nuevoClaseGrupoId,
      nuevoHorarioNombre: nuevoClaseGrupo.nombre,
    };
  }

  /**
   * Cambia el producto de una inscripción
   *
   * Puede modificar el monto si el nuevo producto tiene precio diferente
   */
  async cambiarProducto(
    input: CambiarProductoInput,
  ): Promise<CambiarProductoResult> {
    const {
      suscripcionFamiliarId,
      tutorId,
      inscripcionId,
      nuevoProductoId,
      nuevoClaseGrupoId,
      nuevaComisionId,
    } = input;

    // 1. Validar suscripción y ownership
    const suscripcion = await this.prisma.suscripcionFamiliar.findUnique({
      where: { id: suscripcionFamiliarId },
      include: {
        inscripciones: {
          where: { estado: EstadoInscripcionActividad.ACTIVA },
          include: { producto: { select: { id: true, precio: true } } },
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

    const inscripcionActual = suscripcion.inscripciones.find(
      (i) => i.id === inscripcionId,
    );
    if (!inscripcionActual) {
      throw new SuscripcionFamiliarError(
        'Inscripción no encontrada o no activa',
        SuscripcionFamiliarErrorCode.NOT_FOUND,
      );
    }

    // 2. Validar nuevo producto
    const nuevoProducto = await this.prisma.producto.findUnique({
      where: { id: nuevoProductoId, activo: true },
      select: { id: true, nombre: true, precio: true },
    });

    if (!nuevoProducto) {
      throw new SuscripcionFamiliarError(
        'Producto no encontrado o inactivo',
        SuscripcionFamiliarErrorCode.PRODUCTO_NOT_FOUND,
      );
    }

    // 3. Calcular nuevo monto
    const montoAnterior = suscripcion.monto_mensual;
    const preciosActuales = suscripcion.inscripciones.map((i) =>
      i.id === inscripcionId
        ? (nuevoProducto.precio?.toNumber() ??
          obtenerPrecioTier(suscripcion.tier))
        : (i.producto.precio?.toNumber() ??
          obtenerPrecioTier(suscripcion.tier)),
    );

    const calculoNuevo = calcularMontoMensualTotal(preciosActuales);
    const nuevoMontoMensual = calculoNuevo.montoConDescuento;

    // 4. Actualizar en transacción
    await this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
      await tx.inscripcionActividad.update({
        where: { id: inscripcionId },
        data: {
          producto_id: nuevoProductoId,
          clase_grupo_id: nuevoClaseGrupoId ?? null,
          comision_id: nuevaComisionId ?? null,
        },
      });

      // Actualizar monto de suscripción
      await tx.suscripcionFamiliar.update({
        where: { id: suscripcionFamiliarId },
        data: { monto_mensual: nuevoMontoMensual },
      });

      // Registrar cambio
      await tx.cambioInscripcion.create({
        data: {
          suscripcion_familiar_id: suscripcionFamiliarId,
          tipo: TipoCambioInscripcion.CAMBIO_PRODUCTO,
          inscripcion_anterior_id: inscripcionId,
          aplica_desde: new Date(),
          monto_anterior: montoAnterior,
          monto_nuevo: nuevoMontoMensual,
          detalle: {
            productoAnteriorId: inscripcionActual.producto.id,
            nuevoProductoId,
          },
        },
      });
    });

    // 5. Actualizar monto en MercadoPago si cambió
    if (
      montoAnterior !== nuevoMontoMensual &&
      suscripcion.preapproval_id &&
      this.mpClient.isConfigured()
    ) {
      await this.actualizarMontoEnMercadoPago(
        suscripcion.preapproval_id,
        nuevoMontoMensual,
      );
    }

    this.logger.log(
      `Cambio de producto: inscripción ${inscripcionId} → producto ${nuevoProductoId}`,
    );

    return {
      inscripcionId,
      productoAnteriorId: inscripcionActual.producto.id,
      nuevoProductoId,
      nuevoProductoNombre: nuevoProducto.nombre,
      nuevoMontoMensual,
      montoAnterior,
    };
  }

  /**
   * Cambia el tier de la suscripción familiar
   *
   * Esto NO recalcula los precios de las inscripciones existentes.
   * Solo afecta el tier base para nuevas inscripciones sin precio específico.
   *
   * @deprecated Usar cambiarTierInscripcion para cambiar tier de inscripciones individuales
   */
  // eslint-disable-next-line sonarjs/deprecation -- Backward compatibility
  async cambiarTier(input: CambiarTierInput): Promise<CambiarTierResult> {
    const { suscripcionFamiliarId, tutorId, nuevoTier } = input;

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

    if (suscripcion.estado === EstadoSuscripcionFamiliar.CANCELLED) {
      throw new SuscripcionFamiliarError(
        'No se puede cambiar tier de una suscripción cancelada',
        SuscripcionFamiliarErrorCode.INVALID_STATE,
      );
    }

    const tierAnterior = suscripcion.tier;
    const montoAnterior = suscripcion.monto_mensual;

    // 2. Recalcular monto con nuevo tier (para inscripciones sin precio específico)
    const precios = suscripcion.inscripciones.map(
      (i) => i.producto.precio?.toNumber() ?? obtenerPrecioTier(nuevoTier),
    );

    const calculoNuevo = calcularMontoMensualTotal(precios);
    const nuevoMontoMensual = calculoNuevo.montoConDescuento;

    // 3. Actualizar en transacción
    await this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
      await tx.suscripcionFamiliar.update({
        where: { id: suscripcionFamiliarId },
        data: {
          tier: nuevoTier,
          monto_mensual: nuevoMontoMensual,
        },
      });

      // Registrar cambio
      await tx.cambioInscripcion.create({
        data: {
          suscripcion_familiar_id: suscripcionFamiliarId,
          tipo: TipoCambioInscripcion.CAMBIO_TIER,
          aplica_desde: new Date(),
          monto_anterior: montoAnterior,
          monto_nuevo: nuevoMontoMensual,
          detalle: {
            tierAnterior,
            nuevoTier,
          },
        },
      });
    });

    // 4. Actualizar monto en MercadoPago si cambió
    if (
      montoAnterior !== nuevoMontoMensual &&
      suscripcion.preapproval_id &&
      this.mpClient.isConfigured()
    ) {
      await this.actualizarMontoEnMercadoPago(
        suscripcion.preapproval_id,
        nuevoMontoMensual,
      );
    }

    this.logger.log(
      `Cambio de tier: suscripción ${suscripcionFamiliarId} de ${tierAnterior} a ${nuevoTier}`,
    );

    return {
      tierAnterior,
      nuevoTier,
      montoAnterior,
      nuevoMontoMensual,
      diferenciaMonto: nuevoMontoMensual - montoAnterior,
    };
  }

  /**
   * Cambia el tier de una inscripción específica (MODELO 2026)
   *
   * Permite cambiar el tier de una inscripción individual sin afectar
   * las demás inscripciones de la familia. Recalcula el monto total
   * aplicando el descuento del 10% al producto de MENOR valor.
   */
  async cambiarTierInscripcion(
    input: CambiarTierInscripcionInput,
  ): Promise<CambiarTierInscripcionResult> {
    const { inscripcionId, tutorId, nuevoTier } = input;

    // 1. Obtener inscripción con su suscripción
    const inscripcion = await this.prisma.inscripcionActividad.findUnique({
      where: { id: inscripcionId },
      include: {
        suscripcion_familiar: {
          include: {
            inscripciones: {
              where: { estado: EstadoInscripcionActividad.ACTIVA },
            },
          },
        },
        estudiante: { select: { nombre: true, apellido: true } },
        producto: { select: { nombre: true } },
      },
    });

    if (!inscripcion) {
      throw new SuscripcionFamiliarError(
        'Inscripción no encontrada',
        SuscripcionFamiliarErrorCode.NOT_FOUND,
      );
    }

    // 2. Validar ownership
    if (inscripcion.suscripcion_familiar.tutor_id !== tutorId) {
      throw new SuscripcionFamiliarError(
        'No autorizado',
        SuscripcionFamiliarErrorCode.UNAUTHORIZED,
      );
    }

    // 3. Validar estado de inscripción
    if (inscripcion.estado !== EstadoInscripcionActividad.ACTIVA) {
      throw new SuscripcionFamiliarError(
        'Solo se puede cambiar el tier de inscripciones activas',
        SuscripcionFamiliarErrorCode.INVALID_STATE,
      );
    }

    // 4. Validar estado de suscripción
    if (
      inscripcion.suscripcion_familiar.estado ===
      EstadoSuscripcionFamiliar.CANCELLED
    ) {
      throw new SuscripcionFamiliarError(
        'No se puede modificar una suscripción cancelada',
        SuscripcionFamiliarErrorCode.INVALID_STATE,
      );
    }

    const tierAnterior = inscripcion.tier;
    const montoAnterior = inscripcion.suscripcion_familiar.monto_mensual;
    const suscripcionId = inscripcion.suscripcion_familiar_id;

    // 5. Calcular nuevo monto con la nueva lógica (tier por inscripción)
    // Crear array de inscripciones con sus tiers, actualizando el tier de la inscripción actual
    const inscripcionesParaCalculo: InscripcionConTier[] =
      inscripcion.suscripcion_familiar.inscripciones.map((insc) => ({
        id: insc.id,
        tier:
          insc.id === inscripcionId
            ? nuevoTier
            : (insc.tier ?? inscripcion.suscripcion_familiar.tier),
      }));

    const calculoNuevo = calcularMontoMensualConTiers(inscripcionesParaCalculo);
    const nuevoMontoMensual = calculoNuevo.montoConDescuento;

    // 6. Actualizar en transacción
    await this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
      // Actualizar tier de la inscripción
      await tx.inscripcionActividad.update({
        where: { id: inscripcionId },
        data: { tier: nuevoTier },
      });

      // Actualizar monto de la suscripción
      await tx.suscripcionFamiliar.update({
        where: { id: suscripcionId },
        data: { monto_mensual: nuevoMontoMensual },
      });

      // Registrar cambio
      await tx.cambioInscripcion.create({
        data: {
          suscripcion_familiar_id: suscripcionId,
          tipo: TipoCambioInscripcion.CAMBIO_TIER,
          inscripcion_anterior_id: inscripcionId,
          aplica_desde: new Date(),
          monto_anterior: montoAnterior,
          monto_nuevo: nuevoMontoMensual,
          detalle: {
            tierAnterior,
            nuevoTier,
            inscripcionId,
          },
        },
      });
    });

    // 7. Actualizar monto en MercadoPago si cambió
    if (
      montoAnterior !== nuevoMontoMensual &&
      inscripcion.suscripcion_familiar.preapproval_id &&
      this.mpClient.isConfigured()
    ) {
      await this.actualizarMontoEnMercadoPago(
        inscripcion.suscripcion_familiar.preapproval_id,
        nuevoMontoMensual,
      );
    }

    const estudianteNombre = `${inscripcion.estudiante.nombre} ${inscripcion.estudiante.apellido}`;

    this.logger.log(
      `Cambio de tier inscripción: ${inscripcionId} (${estudianteNombre}) de ${tierAnterior} a ${nuevoTier}`,
    );

    return {
      inscripcionId,
      tierAnterior,
      nuevoTier,
      montoAnterior,
      nuevoMontoMensual,
      diferenciaMonto: nuevoMontoMensual - montoAnterior,
      productoNombre: inscripcion.producto.nombre,
      estudianteNombre,
    };
  }

  /**
   * Actualiza el monto mensual del PreApproval en MercadoPago
   *
   * Se llama automáticamente cuando hay cambios que afectan el monto
   */
  private async actualizarMontoEnMercadoPago(
    preapprovalId: string,
    nuevoMonto: number,
  ): Promise<void> {
    try {
      await this.circuitBreaker.execute(async () => {
        return await this.mpClient.updateAmount(preapprovalId, nuevoMonto);
      });

      this.logger.log(
        `Monto actualizado en MercadoPago: ${preapprovalId} → $${nuevoMonto}`,
      );
    } catch (error) {
      this.logger.error(
        `Error actualizando monto en MercadoPago: ${error instanceof Error ? error.message : String(error)}`,
      );
      // No lanzamos el error - la transacción local ya se completó
      // El monto se sincronizará en el próximo webhook o manualmente
    }
  }
}
