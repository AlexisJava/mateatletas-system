import { Injectable } from '@nestjs/common';
import { EstadoSuscripcion } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service';
import {
  AdminSuscripcionesResponseDto,
  AdminSuscripcionItemDto,
  MorosasResponseDto,
  MetricasSuscripcionesDto,
} from '../presentation/dtos';

/**
 * Filtros para listar suscripciones
 */
interface FiltrosSuscripcion {
  estado?: EstadoSuscripcion;
  planId?: string;
}

/**
 * Opciones de paginación
 */
interface PaginacionOpts {
  page: number;
  limit: number;
}

/**
 * Service de administración de suscripciones
 *
 * Responsabilidades:
 * - Listar todas las suscripciones con filtros
 * - Listar suscripciones morosas
 * - Obtener métricas del dashboard
 */
@Injectable()
export class SuscripcionAdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista todas las suscripciones con filtros y paginación
   */
  async listarTodas(
    filtros: FiltrosSuscripcion,
    paginacion: PaginacionOpts,
  ): Promise<AdminSuscripcionesResponseDto> {
    const { page, limit } = paginacion;
    const skip = (page - 1) * limit;

    // Construir where dinámicamente
    const where: Record<string, unknown> = {};
    if (filtros.estado) {
      where.estado = filtros.estado;
    }
    if (filtros.planId) {
      where.planId = filtros.planId;
    }

    const [suscripciones, total] = await Promise.all([
      this.prisma.suscripcion.findMany({
        where,
        include: {
          tutor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
            },
          },
          plan: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.suscripcion.count({ where }),
    ]);

    return {
      data: suscripciones.map((sus) => this.mapToAdminItem(sus)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lista suscripciones morosas y en gracia
   */
  async listarMorosas(): Promise<MorosasResponseDto> {
    const suscripciones = await this.prisma.suscripcion.findMany({
      where: {
        estado: {
          in: [EstadoSuscripcion.MOROSA, EstadoSuscripcion.EN_GRACIA],
        },
      },
      include: {
        tutor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        plan: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: [{ estado: 'asc' }, { diasGraciaUsados: 'desc' }],
    });

    return {
      suscripciones: suscripciones.map((sus) => this.mapToAdminItem(sus)),
      total: suscripciones.length,
    };
  }

  /**
   * Obtiene métricas del dashboard de suscripciones
   */
  async getMetricas(): Promise<MetricasSuscripcionesDto> {
    // Obtener conteos por estado
    const countsByEstado = await this.prisma.suscripcion.groupBy({
      by: ['estado'],
      _count: { id: true },
    });

    // Mapear a objeto
    const estadoCounts = countsByEstado.reduce(
      (acc, item) => {
        acc[item.estado] = item._count.id;
        return acc;
      },
      {} as Record<EstadoSuscripcion, number>,
    );

    const totalActivas = estadoCounts[EstadoSuscripcion.ACTIVA] || 0;
    const totalMorosas = estadoCounts[EstadoSuscripcion.MOROSA] || 0;
    const totalEnGracia = estadoCounts[EstadoSuscripcion.EN_GRACIA] || 0;

    // Canceladas este mes
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const canceladasMes = await this.prisma.suscripcion.count({
      where: {
        estado: EstadoSuscripcion.CANCELADA,
        fechaCancelacion: { gte: inicioMes },
      },
    });

    // Ingresos del mes
    const ingresosMes = await this.prisma.pagoSuscripcion.aggregate({
      where: {
        mpStatus: 'approved',
        createdAt: { gte: inicioMes },
      },
      _sum: { monto: true },
    });

    // Tasa de cancelación
    const totalActivasYMorosas = totalActivas + totalMorosas + totalEnGracia;
    const tasaCancelacion =
      totalActivasYMorosas > 0
        ? (canceladasMes / (totalActivasYMorosas + canceladasMes)) * 100
        : 0;

    return {
      totalActivas: totalActivas,
      totalMorosas: totalMorosas,
      totalEnGracia: totalEnGracia,
      totalCanceladasMes: canceladasMes,
      ingresosMes: ingresosMes._sum.monto?.toNumber() || 0,
      tasaCancelacion: Math.round(tasaCancelacion * 100) / 100,
    };
  }

  /**
   * Mapea suscripción a item de admin
   */
  private mapToAdminItem(sus: {
    id: string;
    estado: EstadoSuscripcion;
    precioFinal: { toNumber(): number };
    fechaInicio: Date | null;
    fechaProximoCobro: Date | null;
    diasGraciaUsados: number;
    tutor: {
      id: string;
      nombre: string;
      apellido: string;
      email: string | null;
    };
    plan: {
      id: string;
      nombre: string;
    };
    _count?: { estudiantes: number };
  }): AdminSuscripcionItemDto {
    return {
      id: sus.id,
      estado: sus.estado,
      tutor: sus.tutor,
      plan: sus.plan,
      montoFinal: sus.precioFinal.toNumber(),
      fechaInicio: sus.fechaInicio,
      fechaProximoCobro: sus.fechaProximoCobro,
      diasGraciaUsados: sus.diasGraciaUsados,
      estudiantesCount: sus._count?.estudiantes || 0,
    };
  }
}
