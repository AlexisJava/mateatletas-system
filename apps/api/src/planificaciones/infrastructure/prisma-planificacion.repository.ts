import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import {
  IPlanificacionRepository,
  PlanificacionFilters,
  PaginationOptions,
  PaginatedResult,
  PlanificacionWithCounts,
  PlanificacionDetail,
  CreatePlanificacionData,
  UpdatePlanificacionData,
  CreateActividadData,
  UpdateActividadData,
} from '../domain/planificacion.repository.interface';
import { PlanificacionEntity } from '../domain/planificacion.entity';
import { ActividadEntity } from '../domain/actividad.entity';
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

  async findDetailById(id: string): Promise<PlanificacionDetail> {
    const planificacion = await this.prisma.planificacionMensual.findUnique({
      where: { id },
      include: {
        grupo: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          },
        },
        actividades: {
          orderBy: [
            { semana_numero: 'asc' },
            { orden: 'asc' },
            { created_at: 'asc' },
          ],
        },
        _count: {
          select: {
            actividades: true,
            asignaciones: true,
          },
        },
      },
    });

    if (!planificacion) {
      throw new NotFoundException(`Planificación con ID ${id} no encontrada`);
    }

    const entity = PlanificacionEntity.fromPersistence(planificacion);
    const actividades = planificacion.actividades.map((actividad) =>
      ActividadEntity.fromPersistence({
        ...actividad,
        componente_props:
          (actividad.componente_props as Record<string, unknown>) ?? {},
        recursos_url: actividad.recursos_url
          ? (actividad.recursos_url as Record<string, unknown>)
          : null,
      }),
    );

    return {
      ...entity,
      codigoGrupo:
        (planificacion as any).codigo_grupo ??
        planificacion.grupo?.codigo ??
        undefined,
      grupo: planificacion.grupo ?? undefined,
      actividades,
      activityCount: planificacion._count.actividades,
      assignmentCount: planificacion._count.asignaciones,
    } as PlanificacionDetail;
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

    if (filters.grupoId) {
      where.grupo_id = filters.grupoId;
    }

    if (filters.codigoGrupo) {
      where.grupo = {
        codigo: filters.codigoGrupo,
      } as Prisma.GrupoWhereInput;
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
          grupo: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
            },
          },
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
        codigoGrupo: (p as any).codigo_grupo ?? p.grupo?.codigo ?? undefined,
        grupo: p.grupo, // Include grupo info
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
    grupoId: string,
    mes: number,
    anio: number,
  ): Promise<PlanificacionEntity | null> {
    const planificacion = await this.prisma.planificacionMensual.findUnique({
      where: {
        grupo_id_mes_anio: {
          grupo_id: grupoId,
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
        grupo_id: data.grupoId,
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

  async update(
    id: string,
    data: UpdatePlanificacionData,
  ): Promise<PlanificacionEntity> {
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

  async findActividades(planificacionId: string): Promise<ActividadEntity[]> {
    const actividades = await this.prisma.actividadSemanal.findMany({
      where: { planificacion_id: planificacionId },
      orderBy: [
        { semana_numero: 'asc' },
        { orden: 'asc' },
        { created_at: 'asc' },
      ],
    });

    return actividades.map((actividad) =>
      ActividadEntity.fromPersistence({
        ...actividad,
        componente_props:
          (actividad.componente_props as Record<string, unknown>) ?? {},
        recursos_url: actividad.recursos_url
          ? (actividad.recursos_url as Record<string, unknown>)
          : null,
      }),
    );
  }

  async findActividadById(id: string): Promise<ActividadEntity> {
    const actividad = await this.prisma.actividadSemanal.findUnique({
      where: { id },
    });

    if (!actividad) {
      throw new NotFoundException(`Actividad con ID ${id} no encontrada`);
    }

    return ActividadEntity.fromPersistence({
      ...actividad,
      componente_props:
        (actividad.componente_props as Record<string, unknown>) ?? {},
      recursos_url: actividad.recursos_url
        ? (actividad.recursos_url as Record<string, unknown>)
        : null,
    });
  }

  async createActividad(data: CreateActividadData): Promise<ActividadEntity> {
    const actividad = await this.prisma.actividadSemanal.create({
      data: {
        planificacion_id: data.planificacionId,
        semana_numero: data.semanaNumero,
        titulo: data.titulo,
        descripcion: data.descripcion,
        componente_nombre: data.componenteNombre,
        componente_props: data.componenteProps as any,
        nivel_dificultad: data.nivelDificultad,
        tiempo_estimado_minutos: data.tiempoEstimadoMinutos,
        puntos_gamificacion: data.puntosGamificacion,
        instrucciones_docente: data.instruccionesDocente,
        instrucciones_estudiante: data.instruccionesEstudiante,
        recursos_url: data.recursosUrl ? (data.recursosUrl as any) : null,
        orden: data.orden,
      },
    });

    return ActividadEntity.fromPersistence({
      ...actividad,
      componente_props:
        (actividad.componente_props as Record<string, unknown>) ?? {},
      recursos_url: actividad.recursos_url
        ? (actividad.recursos_url as Record<string, unknown>)
        : null,
    });
  }

  async updateActividad(
    id: string,
    data: UpdateActividadData,
  ): Promise<ActividadEntity> {
    const updateData: Prisma.ActividadSemanalUpdateInput = {};

    if (data.semanaNumero !== undefined) {
      updateData.semana_numero = data.semanaNumero;
    }

    if (data.titulo !== undefined) {
      updateData.titulo = data.titulo;
    }

    if (data.descripcion !== undefined) {
      updateData.descripcion = data.descripcion;
    }

    if (data.componenteNombre !== undefined) {
      updateData.componente_nombre = data.componenteNombre;
    }

    if (data.componenteProps !== undefined) {
      updateData.componente_props = data.componenteProps as any;
    }

    if (data.nivelDificultad !== undefined) {
      updateData.nivel_dificultad = data.nivelDificultad;
    }

    if (data.tiempoEstimadoMinutos !== undefined) {
      updateData.tiempo_estimado_minutos = data.tiempoEstimadoMinutos;
    }

    if (data.puntosGamificacion !== undefined) {
      updateData.puntos_gamificacion = data.puntosGamificacion;
    }

    if (data.instruccionesDocente !== undefined) {
      updateData.instrucciones_docente = data.instruccionesDocente;
    }

    if (data.instruccionesEstudiante !== undefined) {
      updateData.instrucciones_estudiante = data.instruccionesEstudiante;
    }

    if (data.recursosUrl !== undefined) {
      updateData.recursos_url = data.recursosUrl
        ? (data.recursosUrl as any)
        : null;
    }

    if (data.orden !== undefined) {
      updateData.orden = data.orden;
    }

    const actividad = await this.prisma.actividadSemanal.update({
      where: { id },
      data: updateData,
    });

    return ActividadEntity.fromPersistence({
      ...actividad,
      componente_props:
        (actividad.componente_props as Record<string, unknown>) ?? {},
      recursos_url: actividad.recursos_url
        ? (actividad.recursos_url as Record<string, unknown>)
        : null,
    });
  }

  async deleteActividad(id: string): Promise<void> {
    await this.prisma.actividadSemanal.delete({
      where: { id },
    });
  }

  async count(filters: PlanificacionFilters = {}): Promise<number> {
    const where: Prisma.PlanificacionMensualWhereInput = {};

    if (filters.grupoId) {
      where.grupo_id = filters.grupoId;
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
