import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { CrearPlanificacionDto } from './dto/crear-planificacion.dto';
import { CrearActividadDto } from './dto/crear-actividad.dto';
import { AsignarPlanificacionDto } from './dto/asignar-planificacion.dto';
import { ActualizarProgresoDto } from './dto/actualizar-progreso.dto';
import { Prisma } from '@prisma/client';

/**
 * Service for managing monthly planning system
 *
 * This service handles:
 * - Creating and managing monthly plannings
 * - Creating weekly activities within plannings
 * - Teacher assignments
 * - Student progress tracking
 */
@Injectable()
export class PlanificacionesService {
  constructor(private prisma: PrismaService) {}

  // ============================================================================
  // PLANIFICACIONES MENSUALES
  // ============================================================================

  /**
   * Create a new monthly planning
   */
  async crearPlanificacion(adminId: string, dto: CrearPlanificacionDto) {
    // Verificar si ya existe una planificación para este grupo/mes/año
    const existente = await this.prisma.planificacionMensual.findUnique({
      where: {
        codigo_grupo_mes_anio: {
          codigo_grupo: dto.codigo_grupo,
          mes: dto.mes,
          anio: dto.anio,
        },
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe una planificación para ${dto.codigo_grupo} en ${dto.mes}/${dto.anio}`,
      );
    }

    return this.prisma.planificacionMensual.create({
      data: {
        ...dto,
        created_by_admin_id: adminId,
      },
      include: {
        actividades: true,
      },
    });
  }

  /**
   * Get all plannings (with filters)
   */
  async obtenerPlanificaciones(filters?: {
    codigo_grupo?: string;
    mes?: number;
    anio?: number;
    estado?: any;
  }) {
    return this.prisma.planificacionMensual.findMany({
      where: filters as any,
      include: {
        actividades: {
          orderBy: { orden: 'asc' },
        },
        _count: {
          select: {
            asignaciones: true,
          },
        },
      },
      orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
    });
  }

  /**
   * Get a specific planning by ID
   */
  async obtenerPlanificacion(id: string) {
    const planificacion = await this.prisma.planificacionMensual.findUnique({
      where: { id },
      include: {
        actividades: {
          orderBy: { orden: 'asc' },
        },
        asignaciones: {
          include: {
            claseGrupo: true,
            docente: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
      },
    }) as (Prisma.PlanificacionMensualGetPayload<{
      include: {
        actividades: true;
        asignaciones: {
          include: {
            claseGrupo: true;
            docente: {
              select: {
                id: true;
                nombre: true;
                apellido: true;
              };
            };
          };
        };
      };
    }>) | null;

    if (!planificacion) {
      throw new NotFoundException(`Planificación con ID ${id} no encontrada`);
    }

    return planificacion;
  }

  /**
   * Publish a planning (make it available for teachers)
   */
  async publicarPlanificacion(id: string) {
    const planificacion = await this.obtenerPlanificacion(id);

    // Verificar que tenga al menos una actividad
    if (planificacion.actividades.length === 0) {
      throw new ConflictException('La planificación debe tener al menos una actividad antes de publicarse');
    }

    return this.prisma.planificacionMensual.update({
      where: { id },
      data: {
        estado: 'PUBLICADA',
        fecha_publicacion: new Date(),
      },
    });
  }

  // ============================================================================
  // ACTIVIDADES SEMANALES
  // ============================================================================

  /**
   * Create a weekly activity within a planning
   */
  async crearActividad(dto: CrearActividadDto) {
    // Verificar que la planificación existe
    await this.obtenerPlanificacion(dto.planificacion_id);

    return this.prisma.actividadSemanal.create({
      data: dto,
    });
  }

  /**
   * Get activities of a planning
   */
  async obtenerActividades(planificacionId: string) {
    return this.prisma.actividadSemanal.findMany({
      where: { planificacion_id: planificacionId },
      orderBy: { orden: 'asc' },
    });
  }

  // ============================================================================
  // ASIGNACIONES (DOCENTE → GRUPO)
  // ============================================================================

  /**
   * Teacher assigns a planning to their group
   */
  async asignarPlanificacion(dto: AsignarPlanificacionDto) {
    // Verificar que la planificación existe y está publicada
    const planificacion = await this.obtenerPlanificacion(dto.planificacion_id);

    if (planificacion.estado !== 'PUBLICADA') {
      throw new ConflictException('Solo se pueden asignar planificaciones publicadas');
    }

    // Verificar si ya existe una asignación
    const existente = await this.prisma.asignacionDocente.findUnique({
      where: {
        planificacion_id_clase_grupo_id: {
          planificacion_id: dto.planificacion_id,
          clase_grupo_id: dto.clase_grupo_id,
        },
      },
    });

    if (existente) {
      // Actualizar la asignación existente
      return this.prisma.asignacionDocente.update({
        where: { id: existente.id },
        data: {
          activo: dto.activo ?? true,
          mensaje_docente: dto.mensaje_docente,
          fecha_inicio_custom: dto.fecha_inicio_custom,
        },
      });
    }

    // Crear nueva asignación
    return this.prisma.asignacionDocente.create({
      data: dto,
      include: {
        planificacion: {
          include: {
            actividades: true,
          },
        },
      },
    });
  }

  /**
   * Get plannings assigned to a teacher
   */
  async obtenerPlanificacionesDocente(docenteId: string) {
    return this.prisma.asignacionDocente.findMany({
      where: {
        docente_id: docenteId,
        activo: true,
      },
      include: {
        planificacion: {
          include: {
            actividades: {
              orderBy: { orden: 'asc' },
            },
          },
        },
        claseGrupo: true,
      },
      orderBy: { fecha_asignacion: 'desc' },
    });
  }

  /**
   * Get plannings available for a student (through their groups)
   */
  async obtenerPlanificacionesEstudiante(estudianteId: string) {
    // Obtener los grupos del estudiante
    const inscripciones = await this.prisma.inscripcionClaseGrupo.findMany({
      where: {
        estudiante_id: estudianteId,
      },
      include: {
        claseGrupo: {
          include: {
            asignacionesPlanificaciones: {
              where: { activo: true },
              include: {
                planificacion: {
                  include: {
                    actividades: {
                      orderBy: { orden: 'asc' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Flatten y retornar planificaciones
    const planificaciones = inscripciones.flatMap(
      (insc: any) => insc.claseGrupo.asignacionesPlanificaciones.map((asig: any) => ({
        ...asig.planificacion,
        clase_grupo: {
          id: insc.claseGrupo.id,
          nombre: insc.claseGrupo.nombre,
        },
      })),
    );

    return planificaciones;
  }

  // ============================================================================
  // PROGRESO DEL ESTUDIANTE
  // ============================================================================

  /**
   * Update student progress on an activity
   */
  async actualizarProgreso(dto: ActualizarProgresoDto) {
    // Buscar o crear el registro de progreso
    const progreso = await this.prisma.progresoEstudianteActividad.upsert({
      where: {
        estudiante_id_actividad_id_asignacion_id: {
          estudiante_id: dto.estudiante_id,
          actividad_id: dto.actividad_id,
          asignacion_id: dto.asignacion_id,
        },
      },
      update: {
        iniciado: dto.iniciado ?? undefined,
        completado: dto.completado ?? undefined,
        puntos_obtenidos: dto.puntos_obtenidos ?? undefined,
        tiempo_total_minutos: dto.tiempo_total_minutos ?? undefined,
        intentos: dto.intentos !== undefined ? { increment: dto.intentos } : undefined,
        mejor_puntaje:
          dto.mejor_puntaje !== undefined
            ? { set: Math.max(dto.mejor_puntaje, 0) }
            : undefined,
        estado_juego: dto.estado_juego ?? undefined,
        respuestas_detalle: dto.respuestas_detalle ?? undefined,
        fecha_inicio: dto.iniciado ? new Date() : undefined,
        fecha_completado: dto.completado ? new Date() : undefined,
      },
      create: {
        estudiante_id: dto.estudiante_id,
        actividad_id: dto.actividad_id,
        asignacion_id: dto.asignacion_id,
        iniciado: dto.iniciado ?? false,
        completado: dto.completado ?? false,
        puntos_obtenidos: dto.puntos_obtenidos ?? 0,
        tiempo_total_minutos: dto.tiempo_total_minutos ?? 0,
        intentos: dto.intentos ?? 0,
        mejor_puntaje: dto.mejor_puntaje ?? 0,
        estado_juego: dto.estado_juego,
        respuestas_detalle: dto.respuestas_detalle,
        fecha_inicio: dto.iniciado ? new Date() : undefined,
        fecha_completado: dto.completado ? new Date() : undefined,
      },
    });

    return progreso;
  }

  /**
   * Get student progress for a specific planning
   */
  async obtenerProgresoEstudiante(estudianteId: string, planificacionId: string) {
    const planificacion = await this.obtenerPlanificacion(planificacionId);

    const actividadesIds = planificacion.actividades.map((act: any) => act.id);

    const progresos = await this.prisma.progresoEstudianteActividad.findMany({
      where: {
        estudiante_id: estudianteId,
        actividad_id: { in: actividadesIds },
      },
      include: {
        actividad: true,
      },
    });

    return {
      planificacion: {
        id: planificacion.id,
        titulo: planificacion.titulo,
        total_actividades: planificacion.actividades.length,
      },
      progresos,
      resumen: {
        actividades_completadas: progresos.filter((p) => p.completado).length,
        puntos_totales: progresos.reduce((sum, p) => sum + p.puntos_obtenidos, 0),
        tiempo_total_minutos: progresos.reduce((sum, p) => sum + p.tiempo_total_minutos, 0),
      },
    };
  }
}
