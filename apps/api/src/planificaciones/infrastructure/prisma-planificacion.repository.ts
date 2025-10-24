import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import {
  IPlanificacionRepository,
  PlanificacionFilters,
  PaginationOptions,
  PaginatedResult,
  PlanificacionWithCounts,
  CreatePlanificacionData,
} from '../domain/planificacion.repository.interface';
import { PlanificacionEntity } from '../domain/planificacion.entity';
import { Prisma } from '@prisma/client';

/**
 * Prisma implementation of IPlanificacionRepository
 *
 * Infrastructure layer - depends on Prisma ORM.
 * Implements repository pattern for data access.
 */
@Injectable()
export class PrismaPlanificacionRepository implements IPlanificacionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PlanificacionEntity> {
    const planificacion = await this.prisma.planificacionMensual.findUnique({
      where: { id },
    });

    if (!planificacion) {
      throw new NotFoundException(`Planificación con ID ${id} no encontrada`);
    }

    return PlanificacionEntity.fromPersistence(planificacion);
  }

  async findByIdOptional(id: string): Promise<PlanificacionEntity | null> {
    const planificacion = await this.prisma.planificacionMensual.findUnique({
      where: { id },
    });

    if (!planificacion) {
      return null;
    }

    return PlanificacionEntity.fromPersistence(planificacion);
  }

  async findAll(
    filters: PlanificacionFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 },
  ): Promise<PaginatedResult<PlanificacionWithCounts>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PlanificacionMensualWhereInput = {};

    if (filters.codigoGrupo) {
      where.codigo_grupo = filters.codigoGrupo;
    }

    if (filters.mes !== undefined) {
      where.mes = filters.mes;
    }

    if (filters.anio !== undefined) {
      where.anio = filters.anio;
    }

    if (filters.estado) {
      where.estado = filters.estado;
    }

    // Execute queries in parallel
    const [planificaciones, total] = await Promise.all([
      this.prisma.planificacionMensual.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
        include: {
          _count: {
            select: {
              actividades: true,
              asignaciones: true,
            },
          },
        },
      }),
      this.prisma.planificacionMensual.count({ where }),
    ]);

    // Map to domain entities with counts
    const data = planificaciones.map((p) => {
      const entity = PlanificacionEntity.fromPersistence(p);
      return {
        ...entity,
        activityCount: p._count.actividades,
        assignmentCount: p._count.asignaciones,
      } as PlanificacionWithCounts;
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findByPeriod(
    codigoGrupo: string,
    mes: number,
    anio: number,
  ): Promise<PlanificacionEntity | null> {
    const planificacion = await this.prisma.planificacionMensual.findUnique({
      where: {
        codigo_grupo_mes_anio: {
          codigo_grupo: codigoGrupo,
          mes,
          anio,
        },
      },
    });

    if (!planificacion) {
      return null;
    }

    return PlanificacionEntity.fromPersistence(planificacion);
  }

  async create(data: CreatePlanificacionData): Promise<PlanificacionEntity> {
    const planificacion = await this.prisma.planificacionMensual.create({
      data: {
        codigo_grupo: data.codigoGrupo,
        mes: data.mes,
        anio: data.anio,
        titulo: data.titulo,
        descripcion: data.descripcion,
        tematica_principal: data.tematicaPrincipal,
        objetivos_aprendizaje: data.objetivosAprendizaje,
        estado: data.estado,
        created_by_admin_id: data.createdByAdminId,
        notas_docentes: data.notasDocentes,
      },
    });

    return PlanificacionEntity.fromPersistence(planificacion);
  }

  async update(id: string, data: Partial<PlanificacionEntity>): Promise<PlanificacionEntity> {
    // Build update data with only defined fields
    const updateData: Prisma.PlanificacionMensualUpdateInput = {};

    if (data.titulo !== undefined) {
      updateData.titulo = data.titulo;
    }

    if (data.descripcion !== undefined) {
      updateData.descripcion = data.descripcion;
    }

    if (data.tematicaPrincipal !== undefined) {
      updateData.tematica_principal = data.tematicaPrincipal;
    }

    if (data.objetivosAprendizaje !== undefined) {
      updateData.objetivos_aprendizaje = data.objetivosAprendizaje;
    }

    if (data.estado !== undefined) {
      updateData.estado = data.estado;
    }

    if (data.notasDocentes !== undefined) {
      updateData.notas_docentes = data.notasDocentes;
    }

    if (data.fechaPublicacion !== undefined) {
      updateData.fecha_publicacion = data.fechaPublicacion;
    }

    const planificacion = await this.prisma.planificacionMensual.update({
      where: { id },
      data: updateData,
    });

    return PlanificacionEntity.fromPersistence(planificacion);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.planificacionMensual.delete({
      where: { id },
    });
  }

  async count(filters: PlanificacionFilters = {}): Promise<number> {
    const where: Prisma.PlanificacionMensualWhereInput = {};

    if (filters.codigoGrupo) {
      where.codigo_grupo = filters.codigoGrupo;
    }

    if (filters.mes !== undefined) {
      where.mes = filters.mes;
    }

    if (filters.anio !== undefined) {
      where.anio = filters.anio;
    }

    if (filters.estado) {
      where.estado = filters.estado;
    }

    return this.prisma.planificacionMensual.count({ where });
  }

  async getActivityCount(planificacionId: string): Promise<number> {
    return this.prisma.actividadSemanal.count({
      where: { planificacion_id: planificacionId },
    });
  }
}
