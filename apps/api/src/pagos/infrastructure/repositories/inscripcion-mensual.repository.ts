import { Injectable } from '@nestjs/common';
import { Prisma, EstadoPago as PrismaEstadoPago } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { Decimal } from 'decimal.js';
import {
  IInscripcionMensualRepository,
  CrearInscripcionMensualDTO,
  ActualizarPagoDTO,
  InscripcionMensual,
  TotalMensual,
  MetricasPeriodo,
  InscripcionMensualConRelaciones,
  EstudianteConDescuento,
} from '../../domain/repositories/inscripcion-mensual.repository.interface';
import {
  TipoDescuento,
  EstadoPago as DomainEstadoPago,
} from '../../domain/types/pagos.types';

/**
 * Implementación del repositorio de Inscripciones Mensuales
 * Infrastructure Layer - Implementa interface del Domain Layer
 *
 * Responsabilidades:
 * - Convertir entre tipos de Prisma y tipos del Domain
 * - Manejar persistencia de inscripciones mensuales
 * - Consultas por estudiante, tutor, período, estado
 * - Cálculo de totales mensuales
 * - Garantizar consistencia de Decimals
 */
@Injectable()
export class InscripcionMensualRepository
  implements IInscripcionMensualRepository
{
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una nueva inscripción mensual
   */
  async crear(datos: CrearInscripcionMensualDTO): Promise<InscripcionMensual> {
    const inscripcion = await this.prisma.inscripcionMensual.create({
      data: {
        estudianteId: datos.estudianteId,
        productoId: datos.productoId,
        tutorId: datos.tutorId,
        anio: datos.anio,
        mes: datos.mes,
        periodo: datos.periodo,
        precioBase: datos.precioBase,
        descuentoAplicado: datos.descuentoAplicado,
        precioFinal: datos.precioFinal,
        tipoDescuento: datos.tipoDescuento,
        detalleCalculo: datos.detalleCalculo,
      },
    });

    return this.mapearPrismaADomain(inscripcion);
  }

  /**
   * Busca inscripciones por estudiante y período
   */
  async buscarPorEstudianteYPeriodo(
    estudianteId: string,
    periodo: string,
  ): Promise<InscripcionMensual[]> {
    const inscripciones = await this.prisma.inscripcionMensual.findMany({
      where: {
        estudianteId: estudianteId,
        periodo,
      },
      orderBy: { createdAt: 'desc' },
    });

    return inscripciones.map((i) => this.mapearPrismaADomain(i));
  }

  /**
   * Busca inscripciones por tutor y período
   */
  async buscarPorTutorYPeriodo(
    tutorId: string,
    periodo: string,
  ): Promise<InscripcionMensual[]> {
    const inscripciones = await this.prisma.inscripcionMensual.findMany({
      where: {
        tutorId: tutorId,
        periodo,
      },
      orderBy: { createdAt: 'desc' },
    });

    return inscripciones.map((i) => this.mapearPrismaADomain(i));
  }

  /**
   * Obtiene inscripciones por estado de pago
   */
  async buscarPorEstadoPago(
    estado: DomainEstadoPago,
    periodo?: string,
  ): Promise<InscripcionMensual[]> {
    const where: Prisma.InscripcionMensualWhereInput = {
      estadoPago: estado as PrismaEstadoPago,
    };

    if (periodo) {
      where.periodo = periodo;
    }

    const inscripciones = await this.prisma.inscripcionMensual.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return inscripciones.map((i) => this.mapearPrismaADomain(i));
  }

  /**
   * Actualiza el estado de pago de una inscripción
   */
  async actualizarEstadoPago(
    inscripcionId: string,
    datos: ActualizarPagoDTO,
  ): Promise<InscripcionMensual> {
    const inscripcion = await this.prisma.inscripcionMensual.update({
      where: { id: inscripcionId },
      data: {
        estadoPago: datos.estadoPago,
        fechaPago: datos.fechaPago || null,
        metodoPago: datos.metodoPago || null,
        comprobanteUrl: datos.comprobanteUrl || null,
        observaciones: datos.observaciones || null,
      },
    });

    return this.mapearPrismaADomain(inscripcion);
  }

  /**
   * Calcula el total mensual de un tutor
   */
  async calcularTotalMensualTutor(
    tutorId: string,
    periodo: string,
  ): Promise<TotalMensual> {
    const inscripciones = await this.prisma.inscripcionMensual.findMany({
      where: {
        tutorId: tutorId,
        periodo,
      },
    });

    // Calcular totales
    let totalPendiente = new Decimal(0);
    let totalPagado = new Decimal(0);

    for (const inscripcion of inscripciones) {
      const precioFinal = new Decimal(inscripcion.precioFinal.toString());

      if (inscripcion.estadoPago === PrismaEstadoPago.Pagado) {
        totalPagado = totalPagado.plus(precioFinal);
      } else if (inscripcion.estadoPago === PrismaEstadoPago.Pendiente) {
        totalPendiente = totalPendiente.plus(precioFinal);
      }
    }

    const totalGeneral = totalPendiente.plus(totalPagado);

    return {
      tutorId,
      periodo,
      totalPendiente,
      totalPagado,
      totalGeneral,
      cantidadInscripciones: inscripciones.length,
    };
  }

  /**
   * Verifica si existe una inscripción
   */
  async existe(
    estudianteId: string,
    productoId: string,
    periodo: string,
  ): Promise<boolean> {
    const count = await this.prisma.inscripcionMensual.count({
      where: {
        estudianteId: estudianteId,
        productoId: productoId,
        periodo,
      },
    });

    return count > 0;
  }

  /**
   * Obtiene métricas agregadas para el dashboard
   */
  async obtenerMetricasPorPeriodo(
    periodo: string,
    tutorId?: string,
  ): Promise<MetricasPeriodo> {
    const where: Prisma.InscripcionMensualWhereInput = { periodo };
    if (tutorId) {
      where.tutorId = tutorId;
    }

    const inscripciones = await this.prisma.inscripcionMensual.findMany({
      where,
    });

    // Calcular métricas
    let totalIngresos = new Decimal(0);
    let totalPendientes = new Decimal(0);
    let totalVencidos = new Decimal(0);
    let cantidadPagadas = 0;
    let cantidadPendientes = 0;
    let cantidadVencidas = 0;

    for (const inscripcion of inscripciones) {
      const precioFinal = new Decimal(inscripcion.precioFinal.toString());

      if (inscripcion.estadoPago === PrismaEstadoPago.Pagado) {
        totalIngresos = totalIngresos.plus(precioFinal);
        cantidadPagadas++;
      } else if (inscripcion.estadoPago === PrismaEstadoPago.Pendiente) {
        totalPendientes = totalPendientes.plus(precioFinal);
        cantidadPendientes++;
      } else if (inscripcion.estadoPago === PrismaEstadoPago.Vencido) {
        totalVencidos = totalVencidos.plus(precioFinal);
        cantidadVencidas++;
      }
    }

    return {
      periodo,
      totalIngresos,
      totalPendientes,
      totalVencidos,
      cantidadInscripciones: inscripciones.length,
      cantidadPagadas,
      cantidadPendientes,
      cantidadVencidas,
    };
  }

  /**
   * Obtiene todas las inscripciones de un período con relaciones
   */
  async obtenerInscripcionesPorPeriodo(
    periodo: string,
    tutorId?: string,
  ): Promise<InscripcionMensualConRelaciones[]> {
    const where: Prisma.InscripcionMensualWhereInput = { periodo };
    if (tutorId) {
      where.tutorId = tutorId;
    }

    const inscripciones = await this.prisma.inscripcionMensual.findMany({
      where,
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        producto: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return inscripciones.map((i) => ({
      ...this.mapearPrismaADomain(i),
      estudiante: {
        id: i.estudiante.id,
        nombre: i.estudiante.nombre,
        apellido: i.estudiante.apellido,
      },
      producto: {
        id: i.producto.id,
        nombre: i.producto.nombre,
      },
    }));
  }

  /**
   * Obtiene estudiantes con descuentos aplicados
   */
  async obtenerEstudiantesConDescuentos(
    periodo: string,
    tutorId?: string,
  ): Promise<EstudianteConDescuento[]> {
    const where: Prisma.InscripcionMensualWhereInput = { periodo };
    if (tutorId) {
      where.tutorId = tutorId;
    }

    const inscripciones = await this.prisma.inscripcionMensual.findMany({
      where: {
        ...where,
        tipoDescuento: {
          not: 'NINGUNO',
        },
      },
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    // Agrupar por estudiante
    const estudiantesMap = new Map<string, EstudianteConDescuento>();

    for (const inscripcion of inscripciones) {
      const estudianteId = inscripcion.estudianteId;
      const precioBase = new Decimal(inscripcion.precioBase.toString());
      const descuento = new Decimal(inscripcion.descuentoAplicado.toString());
      const precioFinal = new Decimal(inscripcion.precioFinal.toString());

      if (estudiantesMap.has(estudianteId)) {
        const existing = estudiantesMap.get(estudianteId)!;
        estudiantesMap.set(estudianteId, {
          ...existing,
          totalDescuento: existing.totalDescuento.plus(descuento),
          cantidadInscripciones: existing.cantidadInscripciones + 1,
          precioOriginal: existing.precioOriginal.plus(precioBase),
          precioFinal: existing.precioFinal.plus(precioFinal),
        });
      } else {
        estudiantesMap.set(estudianteId, {
          estudianteId,
          estudianteNombre: `${inscripcion.estudiante.nombre} ${inscripcion.estudiante.apellido}`,
          tutorId: inscripcion.tutorId,
          tipoDescuento: this.mapearTipoDescuento(inscripcion.tipoDescuento),
          totalDescuento: descuento,
          cantidadInscripciones: 1,
          precioOriginal: precioBase,
          precioFinal,
        });
      }
    }

    return Array.from(estudiantesMap.values());
  }

  // ============================================================================
  // MÉTODOS PRIVADOS - MAPEO Y CONVERSIÓN
  // ============================================================================

  /**
   * Mapea el enum TipoDescuento de Prisma al enum del Domain
   * Valida que el valor sea correcto
   */
  private mapearTipoDescuento(tipoDescuento: string): TipoDescuento {
    // Validar que el valor sea uno de los valores válidos
    const valoresValidos: string[] = Object.values(TipoDescuento);
    if (!valoresValidos.includes(tipoDescuento)) {
      throw new Error(`Tipo de descuento inválido: ${tipoDescuento}`);
    }
    return tipoDescuento as TipoDescuento;
  }

  /**
   * Mapea el enum EstadoPago de Prisma al enum del Domain
   * Valida que el valor sea correcto
   */
  private mapearEstadoPago(estadoPago: string): DomainEstadoPago {
    // Validar que el valor sea uno de los valores válidos
    const valoresValidos: string[] = Object.values(DomainEstadoPago);
    if (!valoresValidos.includes(estadoPago)) {
      throw new Error(`Estado de pago inválido: ${estadoPago}`);
    }
    return estadoPago as DomainEstadoPago;
  }

  /**
   * Convierte de tipos de Prisma a tipos del Domain
   * IMPORTANTE: Convierte Prisma.Decimal a Decimal de decimal.js
   */
  private mapearPrismaADomain(
    inscripcion: Prisma.InscripcionMensualGetPayload<object>,
  ): InscripcionMensual {
    return {
      id: inscripcion.id,
      estudianteId: inscripcion.estudianteId,
      productoId: inscripcion.productoId,
      tutorId: inscripcion.tutorId,
      anio: inscripcion.anio,
      mes: inscripcion.mes,
      periodo: inscripcion.periodo,
      precioBase: new Decimal(inscripcion.precioBase.toString()),
      descuentoAplicado: new Decimal(inscripcion.descuentoAplicado.toString()),
      precioFinal: new Decimal(inscripcion.precioFinal.toString()),
      tipoDescuento: this.mapearTipoDescuento(inscripcion.tipoDescuento),
      detalleCalculo: inscripcion.detalleCalculo,
      estadoPago: this.mapearEstadoPago(inscripcion.estadoPago),
      fechaPago: inscripcion.fechaPago,
      metodoPago: inscripcion.metodoPago,
      comprobanteUrl: inscripcion.comprobanteUrl,
      observaciones: inscripcion.observaciones,
      createdAt: inscripcion.createdAt,
      updatedAt: inscripcion.updatedAt,
    };
  }

  /**
   * Obtiene todas las inscripciones de un tutor con filtros opcionales
   * Método flexible para el dashboard de tutores
   */
  async obtenerPorTutor(
    tutorId: string,
    periodo?: string,
    estadoPago?: DomainEstadoPago,
  ): Promise<InscripcionMensual[]> {
    // Construir filtros dinámicamente
    const where: Prisma.InscripcionMensualWhereInput = {
      tutorId: tutorId,
    };

    if (periodo) {
      where.periodo = periodo;
    }

    if (estadoPago) {
      where.estadoPago = estadoPago as PrismaEstadoPago;
    }

    // Ejecutar query con filtros
    const inscripciones = await this.prisma.inscripcionMensual.findMany({
      where,
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        producto: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: [
        { periodo: 'desc' }, // Más recientes primero
        { createdAt: 'desc' },
      ],
    });

    // Mapear a domain objects
    return inscripciones.map((inscripcion) =>
      this.mapearPrismaADomain(inscripcion),
    );
  }
}
