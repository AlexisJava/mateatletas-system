/**
 * SuscripcionFamiliarQueryService - Operaciones de lectura para suscripciones familiares
 *
 * Patrón: CQRS (Query)
 * - Este servicio maneja solo operaciones de LECTURA
 * - Las operaciones de ESCRITURA están en SuscripcionFamiliarCommandService
 */
import { Injectable } from '@nestjs/common';
import { EstadoInscripcionActividad } from '@prisma/client';

import { PrismaService } from '../../core/database/prisma.service';
import {
  SuscripcionFamiliarDetalle,
  InscripcionActividadDetalle,
  CalculoMontoMensualResult,
  SuscripcionFamiliarError,
  SuscripcionFamiliarErrorCode,
} from '../types';
import {
  calcularMontoMensualConTiers,
  calcularPrecioActividad,
  obtenerPrecioTier,
  obtenerPrecioInscripcion,
  type InscripcionConTier,
} from '../domain/constants/suscripcion-familiar.constants';

@Injectable()
export class SuscripcionFamiliarQueryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene la suscripción familiar de un tutor
   */
  async obtenerPorTutorId(
    tutorId: string,
  ): Promise<SuscripcionFamiliarDetalle | null> {
    const suscripcion = await this.prisma.suscripcionFamiliar.findUnique({
      where: { tutorId: tutorId },
      include: {
        tutor: {
          select: { nombre: true, apellido: true },
        },
        inscripciones: {
          where: { estado: EstadoInscripcionActividad.ACTIVA },
          select: {
            id: true,
            estudianteId: true,
            productoId: true,
            claseGrupoId: true,
            comisionId: true,
            estado: true,
            tier: true, // MODELO 2026: tier por inscripción
            fechaInicio: true,
            fechaFin: true,
            estudiante: { select: { id: true, nombre: true, apellido: true } },
            producto: { select: { id: true, nombre: true, precio: true } },
            claseGrupo: { select: { id: true, nombre: true } },
            comision: { select: { id: true, nombre: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!suscripcion) {
      return null;
    }

    return this.mapToDetalle(suscripcion);
  }

  /**
   * Obtiene una suscripción por ID
   */
  async obtenerPorId(
    suscripcionId: string,
    tutorId?: string,
  ): Promise<SuscripcionFamiliarDetalle> {
    const suscripcion = await this.prisma.suscripcionFamiliar.findUnique({
      where: { id: suscripcionId },
      include: {
        tutor: {
          select: { id: true, nombre: true, apellido: true },
        },
        inscripciones: {
          where: { estado: EstadoInscripcionActividad.ACTIVA },
          select: {
            id: true,
            estudianteId: true,
            productoId: true,
            claseGrupoId: true,
            comisionId: true,
            estado: true,
            tier: true, // MODELO 2026: tier por inscripción
            fechaInicio: true,
            fechaFin: true,
            estudiante: { select: { id: true, nombre: true, apellido: true } },
            producto: { select: { id: true, nombre: true, precio: true } },
            claseGrupo: { select: { id: true, nombre: true } },
            comision: { select: { id: true, nombre: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!suscripcion) {
      throw new SuscripcionFamiliarError(
        'Suscripción no encontrada',
        SuscripcionFamiliarErrorCode.NOT_FOUND,
      );
    }

    // Verificar ownership si se proporciona tutorId
    if (tutorId && suscripcion.tutorId !== tutorId) {
      throw new SuscripcionFamiliarError(
        'No autorizado',
        SuscripcionFamiliarErrorCode.UNAUTHORIZED,
      );
    }

    return this.mapToDetalle(suscripcion);
  }

  /**
   * Simula el cálculo de monto mensual con nuevas inscripciones
   * Útil para preview antes de confirmar
   */
  async simularMonto(
    tutorId: string,
    productoIds: string[],
  ): Promise<CalculoMontoMensualResult> {
    // Obtener suscripción actual si existe
    const suscripcion = await this.prisma.suscripcionFamiliar.findUnique({
      where: { tutorId: tutorId },
      include: {
        inscripciones: {
          where: { estado: EstadoInscripcionActividad.ACTIVA },
          include: { producto: { select: { precio: true, nombre: true } } },
        },
      },
    });

    // Obtener productos nuevos
    const productosNuevos = await this.prisma.producto.findMany({
      where: { id: { in: productoIds }, activo: true },
      select: { id: true, precio: true, nombre: true },
    });

    // Precios actuales
    const preciosActuales =
      suscripcion?.inscripciones.map((i) => ({
        id: i.id,
        nombre: i.producto.nombre,
        precio: i.producto.precio?.toNumber() ?? 0,
      })) ?? [];

    // Precios nuevos
    const tier = suscripcion?.tier ?? 'STEAM_LIBROS';
    const preciosNuevos = productosNuevos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio?.toNumber() ?? obtenerPrecioTier(tier),
    }));

    // Calcular con descuentos
    const todosPrecios = [...preciosActuales, ...preciosNuevos];
    let montoSinDescuento = 0;
    let montoConDescuento = 0;

    const detalleInscripciones = todosPrecios.map((item, index) => {
      const resultado = calcularPrecioActividad(item.precio, index + 1);
      montoSinDescuento += item.precio;
      montoConDescuento += resultado.precioFinal;

      return {
        inscripcionId: item.id,
        productoNombre: item.nombre,
        precioBase: item.precio,
        descuentoPorcentaje: resultado.descuentoPorcentaje,
        precioFinal: resultado.precioFinal,
      };
    });

    return {
      montoSinDescuento,
      montoConDescuento,
      ahorroTotal: montoSinDescuento - montoConDescuento,
      detalleInscripciones,
    };
  }

  /**
   * Lista todas las suscripciones (para admin)
   */
  async listarTodas(filtros: {
    estado?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: SuscripcionFamiliarDetalle[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filtros.page ?? 1;
    const limit = filtros.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, string> = {};
    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    const [suscripciones, total] = await Promise.all([
      this.prisma.suscripcionFamiliar.findMany({
        where,
        include: {
          tutor: { select: { nombre: true, apellido: true } },
          inscripciones: {
            where: { estado: EstadoInscripcionActividad.ACTIVA },
            select: {
              id: true,
              estudianteId: true,
              productoId: true,
              claseGrupoId: true,
              comisionId: true,
              estado: true,
              tier: true, // MODELO 2026: tier por inscripción
              fechaInicio: true,
              fechaFin: true,
              estudiante: {
                select: { id: true, nombre: true, apellido: true },
              },
              producto: { select: { id: true, nombre: true, precio: true } },
              claseGrupo: { select: { id: true, nombre: true } },
              comision: { select: { id: true, nombre: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.suscripcionFamiliar.count({ where }),
    ]);

    return {
      data: suscripciones.map((s) => this.mapToDetalle(s)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Mapea el resultado de Prisma al tipo de detalle
   *
   * MODELO 2026: Usa calcularMontoMensualConTiers que ordena por precio
   * descendente para aplicar descuento a los productos de MENOR valor.
   */
  private mapToDetalle(suscripcion: {
    id: string;
    tutorId: string;
    tutor: { nombre: string; apellido: string };
    estado: string;
    tier: string;
    montoMensual: number;
    fechaProximoCobro: Date | null;
    fechaGracia: Date | null;
    createdAt: Date;
    updatedAt: Date;
    inscripciones: Array<{
      id: string;
      estudianteId: string;
      estudiante: { id: string; nombre: string; apellido: string };
      productoId: string;
      producto: {
        id: string;
        nombre: string;
        precio: { toNumber: () => number } | null;
      };
      claseGrupoId: string | null;
      claseGrupo: { id: string; nombre: string } | null;
      comisionId: string | null;
      comision: { id: string; nombre: string } | null;
      estado: string;
      /** Tier específico de esta inscripción (MODELO 2026) */
      tier: string | null;
      fechaInicio: Date;
      fechaFin: Date | null;
    }>;
  }): SuscripcionFamiliarDetalle {
    const tierSuscripcion =
      suscripcion.tier as SuscripcionFamiliarDetalle['tier'];

    // MODELO 2026: Preparar inscripciones con sus tiers para cálculo
    // Incluimos el ID para poder matchear después del ordenamiento
    // IMPORTANTE: Si tier es null, usar STEAM_ASINCRONICO como fallback
    // (consistente con vista inscripciones_unificadas donde null != SINCRONICO → ASINCRONICO)
    const inscripcionesParaCalculo: InscripcionConTier[] =
      suscripcion.inscripciones.map((insc) => ({
        id: insc.id,
        tier: (insc.tier as InscripcionConTier['tier']) ?? 'STEAM_ASINCRONICO',
      }));

    // Calcular precios con la nueva lógica que ordena por precio DESCENDENTE
    // El descuento se aplica a los productos de MENOR valor
    const resultado = calcularMontoMensualConTiers(inscripcionesParaCalculo);

    // Crear mapa de resultados por ID para acceso rápido
    // El ID viene del detalle porque se preserva en el cálculo
    const resultadosPorId = new Map(
      resultado.detalleInscripciones.map((r) => [r.id, r]),
    );

    // Mapear inscripciones manteniendo orden original pero con precios calculados
    const inscripcionesDetalle: InscripcionActividadDetalle[] =
      suscripcion.inscripciones.map((insc, index) => {
        // Buscar resultado para esta inscripción
        // IMPORTANTE: Si tier es null, usar STEAM_ASINCRONICO (consistente con vista SQL)
        const tierInsc =
          (insc.tier as InscripcionActividadDetalle['tier']) ??
          'STEAM_ASINCRONICO';
        // Convertir Decimal a number para compatibilidad
        const precioProducto = insc.producto.precio?.toNumber() ?? null;
        const precioBase = obtenerPrecioInscripcion(
          { tier: tierInsc, producto: { precio: precioProducto } },
          tierSuscripcion,
        );

        // Obtener datos del cálculo ordenado por precio
        const resultadoCalculo = resultadosPorId.get(insc.id);
        const esMasCara = resultadoCalculo?.esMasCara ?? false;
        const precioConDescuento = resultadoCalculo?.precioFinal ?? precioBase;
        const descuentoAplicado =
          resultadoCalculo?.descuentoPorcentaje ?? (esMasCara ? 0 : 10);

        return {
          id: insc.id,
          estudianteId: insc.estudianteId,
          estudianteNombre: `${insc.estudiante.nombre} ${insc.estudiante.apellido}`,
          productoId: insc.productoId,
          productoNombre: insc.producto.nombre,
          claseGrupoId: insc.claseGrupoId,
          claseGrupoNombre: insc.claseGrupo?.nombre ?? null,
          comisionId: insc.comisionId,
          comisionNombre: insc.comision?.nombre ?? null,
          estado: insc.estado,
          tier: tierInsc,
          precioBase,
          precioConDescuento,
          descuentoAplicado,
          esMasCara,
          ordenInscripcion: index + 1,
          fechaInicio: insc.fechaInicio,
          fechaFin: insc.fechaFin,
        };
      });

    // Contar estudiantes únicos
    const estudiantesUnicos = new Set(
      suscripcion.inscripciones.map((i) => i.estudianteId),
    );

    // MODELO 2026: El monto mensual se calcula dinámicamente basado en
    // los tiers de las inscripciones activas, no del campo en DB (puede estar desactualizado)
    const montoMensualCalculado = resultado.montoConDescuento;

    return {
      id: suscripcion.id,
      tutorId: suscripcion.tutorId,
      tutorNombre: `${suscripcion.tutor.nombre} ${suscripcion.tutor.apellido}`,
      estado: suscripcion.estado as SuscripcionFamiliarDetalle['estado'],
      tier: tierSuscripcion,
      montoMensual: montoMensualCalculado,
      fechaProximoCobro: suscripcion.fechaProximoCobro,
      fechaGracia: suscripcion.fechaGracia,
      inscripciones: inscripcionesDetalle,
      cantidadEstudiantes: estudiantesUnicos.size,
      cantidadActividades: suscripcion.inscripciones.length,
      createdAt: suscripcion.createdAt,
      updatedAt: suscripcion.updatedAt,
    };
  }
}
