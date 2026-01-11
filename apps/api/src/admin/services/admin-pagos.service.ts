import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { EstadoPago } from '@prisma/client';

export interface RegistrarPagoManualDto {
  inscripcionId: string;
  monto: number;
  metodoPago: string;
  observaciones?: string;
  comprobante?: string;
}

export interface PagoManualResult {
  success: boolean;
  inscripcion: {
    id: string;
    periodo: string;
    estudiante: string;
    montoOriginal: number;
    montoPagado: number;
    estadoAnterior: EstadoPago;
    estadoNuevo: EstadoPago;
  };
}

/**
 * Servicio especializado para gestión de pagos manuales
 * Permite registrar pagos en efectivo/transferencia desde el panel admin
 */
@Injectable()
export class AdminPagosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Registrar un pago manual para una inscripción mensual
   */
  async registrarPagoManual(
    dto: RegistrarPagoManualDto,
  ): Promise<PagoManualResult> {
    const inscripcion = await this.prisma.inscripcionMensual.findUnique({
      where: { id: dto.inscripcionId },
      include: {
        estudiante: { select: { id: true, nombre: true, apellido: true } },
      },
    });

    if (!inscripcion) {
      throw new NotFoundException(
        `Inscripción ${dto.inscripcionId} no encontrada`,
      );
    }

    if (inscripcion.estado_pago === 'Pagado') {
      throw new BadRequestException(
        'Esta inscripción ya está marcada como pagada',
      );
    }

    // Validaciones de entrada
    if (!dto.metodoPago || dto.metodoPago.trim() === '') {
      throw new BadRequestException('El método de pago es requerido');
    }

    if (dto.monto <= 0) {
      throw new BadRequestException('El monto debe ser mayor a 0');
    }

    const precioFinal = Number(inscripcion.precio_final);
    const montoYaPagado = Number(inscripcion.monto_pagado ?? 0);
    const montoAcumulado = montoYaPagado + dto.monto;

    // Determinar el nuevo estado según el monto ACUMULADO (no solo el pago actual)
    let nuevoEstado: EstadoPago;
    if (montoAcumulado >= precioFinal) {
      nuevoEstado = 'Pagado';
    } else {
      nuevoEstado = 'Parcial';
    }

    const estadoAnterior = inscripcion.estado_pago;

    // Actualizar la inscripción con el pago acumulado
    await this.prisma.inscripcionMensual.update({
      where: { id: dto.inscripcionId },
      data: {
        estado_pago: nuevoEstado,
        monto_pagado: montoAcumulado,
        fecha_pago: new Date(),
        metodo_pago: dto.metodoPago,
        comprobante_url: dto.comprobante || null,
        observaciones: dto.observaciones || null,
      },
    });

    return {
      success: true,
      inscripcion: {
        id: inscripcion.id,
        periodo: inscripcion.periodo,
        estudiante: `${inscripcion.estudiante.nombre} ${inscripcion.estudiante.apellido}`,
        montoOriginal: precioFinal,
        montoPagado: montoAcumulado,
        estadoAnterior,
        estadoNuevo: nuevoEstado,
      },
    };
  }

  /**
   * Obtener inscripciones pendientes de pago para el modal de pago manual
   */
  async listarInscripcionesPendientes(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where = {
      estado_pago: { in: ['Pendiente', 'Vencido', 'Parcial'] as EstadoPago[] },
      ...(options?.search && {
        OR: [
          {
            estudiante: {
              nombre: {
                contains: options.search,
                mode: 'insensitive' as const,
              },
            },
          },
          {
            estudiante: {
              apellido: {
                contains: options.search,
                mode: 'insensitive' as const,
              },
            },
          },
          {
            tutor: {
              nombre: {
                contains: options.search,
                mode: 'insensitive' as const,
              },
            },
          },
        ],
      }),
    };

    const [inscripciones, total] = await Promise.all([
      this.prisma.inscripcionMensual.findMany({
        where,
        include: {
          estudiante: { select: { id: true, nombre: true, apellido: true } },
          tutor: {
            select: { id: true, nombre: true, apellido: true, email: true },
          },
          producto: { select: { id: true, nombre: true } },
        },
        orderBy: [{ periodo: 'desc' }, { fecha_vencimiento: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.inscripcionMensual.count({ where }),
    ]);

    return {
      data: inscripciones.map((i) => ({
        id: i.id,
        periodo: i.periodo,
        estudiante: {
          id: i.estudiante.id,
          nombre: `${i.estudiante.nombre} ${i.estudiante.apellido}`,
        },
        tutor: {
          id: i.tutor.id,
          nombre: `${i.tutor.nombre} ${i.tutor.apellido}`,
          email: i.tutor.email,
        },
        producto: i.producto.nombre,
        precioFinal: Number(i.precio_final),
        estadoPago: i.estado_pago,
        fechaVencimiento: i.fecha_vencimiento,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
