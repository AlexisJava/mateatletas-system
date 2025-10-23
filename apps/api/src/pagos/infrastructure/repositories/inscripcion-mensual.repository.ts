import { PrismaClient } from '@prisma/client';
import { Decimal } from 'decimal.js';
import {
  IInscripcionMensualRepository,
  CrearInscripcionMensualDTO,
  ActualizarPagoDTO,
  InscripcionMensual,
  TotalMensual,
} from '../../domain/repositories/inscripcion-mensual.repository.interface';
import { EstadoPago } from '../../domain/types/pagos.types';

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
export class InscripcionMensualRepository implements IInscripcionMensualRepository {
  constructor(private readonly prisma: PrismaClient) {}

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

  // ============================================================================
  // MÉTODOS PRIVADOS - MAPEO Y CONVERSIÓN
  // ============================================================================

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
}
