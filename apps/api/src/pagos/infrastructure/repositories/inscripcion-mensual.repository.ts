import { Injectable } from '@nestjs/common';
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
import { EstadoPago, TipoDescuento } from '../../domain/types/pagos.types';

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
export class InscripcionMensualRepository implements IInscripcionMensualRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una nueva inscripción mensual
   */
  async crear(datos: CrearInscripcionMensualDTO): Promise<InscripcionMensual> {
    const inscripcion = await this.prisma.inscripcionMensual.create({
      data: {
        estudiante_id: datos.estudianteId,
        producto_id: datos.productoId,
        tutor_id: datos.tutorId,
        anio: datos.anio,
        mes: datos.mes,
        periodo: datos.periodo,
        precio_base: datos.precioBase,
        descuento_aplicado: datos.descuentoAplicado,
        precio_final: datos.precioFinal,
        tipo_descuento: datos.tipoDescuento,
        detalle_calculo: datos.detalleCalculo,
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
        estudiante_id: estudianteId,
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
        tutor_id: tutorId,
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
    estado: EstadoPago,
    periodo?: string,
  ): Promise<InscripcionMensual[]> {
    const where: any = { estado_pago: estado };

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
        estado_pago: datos.estadoPago,
        fecha_pago: datos.fechaPago || null,
        metodo_pago: datos.metodoPago || null,
        comprobante_url: datos.comprobanteUrl || null,
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
        tutor_id: tutorId,
        periodo,
      },
    });

    // Calcular totales
    let totalPendiente = new Decimal(0);
    let totalPagado = new Decimal(0);

    for (const inscripcion of inscripciones) {
      const precioFinal = new Decimal(inscripcion.precio_final.toString());

      if (inscripcion.estado_pago === EstadoPago.Pagado) {
        totalPagado = totalPagado.plus(precioFinal);
      } else if (inscripcion.estado_pago === EstadoPago.Pendiente) {
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
        estudiante_id: estudianteId,
        producto_id: productoId,
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
    const where: any = { periodo };
    if (tutorId) {
      where.tutor_id = tutorId;
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
      const precioFinal = new Decimal(inscripcion.precio_final.toString());

      if (inscripcion.estado_pago === EstadoPago.Pagado) {
        totalIngresos = totalIngresos.plus(precioFinal);
        cantidadPagadas++;
      } else if (inscripcion.estado_pago === EstadoPago.Pendiente) {
        totalPendientes = totalPendientes.plus(precioFinal);
        cantidadPendientes++;
      } else if (inscripcion.estado_pago === EstadoPago.Vencido) {
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
    const where: any = { periodo };
    if (tutorId) {
      where.tutor_id = tutorId;
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
    const where: any = { periodo };
    if (tutorId) {
      where.tutor_id = tutorId;
    }

    const inscripciones = await this.prisma.inscripcionMensual.findMany({
      where: {
        ...where,
        tipo_descuento: {
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
      const estudianteId = inscripcion.estudiante_id;
      const precioBase = new Decimal(inscripcion.precio_base.toString());
      const descuento = new Decimal(inscripcion.descuento_aplicado.toString());
      const precioFinal = new Decimal(inscripcion.precio_final.toString());

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
          tutorId: inscripcion.tutor_id,
          tipoDescuento: this.mapearTipoDescuento(inscripcion.tipo_descuento),
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
   * Convierte de tipos de Prisma a tipos del Domain
   * IMPORTANTE: Convierte Prisma.Decimal a Decimal de decimal.js
   */
  private mapearPrismaADomain(inscripcion: any): InscripcionMensual {
    return {
      id: inscripcion.id,
      estudianteId: inscripcion.estudiante_id,
      productoId: inscripcion.producto_id,
      tutorId: inscripcion.tutor_id,
      anio: inscripcion.anio,
      mes: inscripcion.mes,
      periodo: inscripcion.periodo,
      precioBase: new Decimal(inscripcion.precio_base.toString()),
      descuentoAplicado: new Decimal(inscripcion.descuento_aplicado.toString()),
      precioFinal: new Decimal(inscripcion.precio_final.toString()),
      tipoDescuento: inscripcion.tipo_descuento,
      detalleCalculo: inscripcion.detalle_calculo,
      estadoPago: inscripcion.estado_pago,
      fechaPago: inscripcion.fecha_pago,
      metodoPago: inscripcion.metodo_pago,
      comprobanteUrl: inscripcion.comprobante_url,
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
    estadoPago?: EstadoPago,
  ): Promise<InscripcionMensual[]> {
    // Construir filtros dinámicamente
    const where: any = {
      tutor_id: tutorId,
    };

    if (periodo) {
      where.periodo = periodo;
    }

    if (estadoPago) {
      where.estado_pago = estadoPago;
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
    return inscripciones.map((inscripcion) => this.mapearPrismaADomain(inscripcion));
  }
}
