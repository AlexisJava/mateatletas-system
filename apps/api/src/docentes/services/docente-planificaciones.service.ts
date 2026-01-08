import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * Interfaces para respuestas tipadas - Modelo v2 (Clases)
 */
export interface PlanificacionSimple {
  id: string;
  titulo: string;
  cantidad_clases: number;
}

export interface ClaseGrupoSimple {
  id: string;
  nombre: string;
}

export interface ClaseInfo {
  id: string;
  numero: number;
  titulo: string;
}

export interface EstadoClase {
  clase: ClaseInfo;
  teoria_activa: boolean;
  practica_activa: boolean;
}

export interface AsignacionResponse {
  id: string;
  planificacion: PlanificacionSimple;
  claseGrupo: ClaseGrupoSimple;
  clases: ClaseInfo[];
  estados_clases: EstadoClase[];
}

export interface ProgresoEstudianteClase {
  id: string;
  estudiante: { nombre: string; apellido: string } | null;
  clase_numero: number;
  clase_titulo: string;
  teoria_completada: boolean;
  practica_completada: boolean;
  tiempo_teoria_segundos: number;
  tiempo_practica_segundos: number;
}

/**
 * Servicio de Planificaciones para Docentes - v2 (Modelo de Clases)
 *
 * Responsabilidades:
 * - Obtener asignaciones de planificaciones del docente
 * - Activar/desactivar teoría y práctica por clase
 * - Consultar progreso de estudiantes en clases
 *
 * Modelo nuevo:
 * - Planificacion → ClasePlanificacion[] (cada clase tiene teoría y práctica)
 * - AsignacionPlanificacion → EstadoClaseGrupo[] (qué está activo por grupo)
 * - ProgresoClaseEstudiante (progreso individual por clase)
 */
@Injectable()
export class DocentePlanificacionesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene todas las asignaciones de planificaciones del docente autenticado
   * @param docenteId - ID del docente
   * @returns Lista de asignaciones con planificación, grupo, clases y estados
   */
  async getMisAsignaciones(docenteId: string): Promise<AsignacionResponse[]> {
    const asignaciones = await this.prisma.asignacionPlanificacion.findMany({
      where: { docente_id: docenteId },
      include: {
        planificacion: {
          include: {
            clases: {
              select: {
                id: true,
                numero: true,
                titulo: true,
              },
              orderBy: {
                numero: 'asc',
              },
            },
          },
        },
        claseGrupo: {
          select: {
            id: true,
            nombre: true,
          },
        },
        estadosClases: {
          include: {
            clase: {
              select: {
                id: true,
                numero: true,
                titulo: true,
              },
            },
          },
          orderBy: {
            clase: {
              numero: 'asc',
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return asignaciones.map((asig) => ({
      id: asig.id,
      planificacion: {
        id: asig.planificacion.id,
        titulo: asig.planificacion.titulo,
        cantidad_clases: asig.planificacion.cantidad_clases,
      },
      claseGrupo: {
        id: asig.claseGrupo.id,
        nombre: asig.claseGrupo.nombre,
      },
      clases: asig.planificacion.clases.map((c) => ({
        id: c.id,
        numero: c.numero,
        titulo: c.titulo,
      })),
      estados_clases: asig.estadosClases.map((e) => ({
        clase: {
          id: e.clase.id,
          numero: e.clase.numero,
          titulo: e.clase.titulo,
        },
        teoria_activa: e.teoria_activa,
        practica_activa: e.practica_activa,
      })),
    }));
  }

  /**
   * Activa teoría de una clase específica para un grupo
   * @param asignacionId - ID de la asignación
   * @param claseId - ID de la clase a activar
   * @param docenteId - ID del docente (para validar ownership)
   */
  async activarTeoria(
    asignacionId: string,
    claseId: string,
    docenteId: string,
  ): Promise<void> {
    await this.validarOwnership(asignacionId, docenteId);
    await this.validarClaseEnPlanificacion(asignacionId, claseId);

    await this.prisma.estadoClaseGrupo.upsert({
      where: {
        asignacion_id_clase_id: {
          asignacion_id: asignacionId,
          clase_id: claseId,
        },
      },
      update: {
        teoria_activa: true,
        activada_en: new Date(),
      },
      create: {
        asignacion_id: asignacionId,
        clase_id: claseId,
        teoria_activa: true,
        practica_activa: false,
        activada_en: new Date(),
      },
    });
  }

  /**
   * Desactiva teoría de una clase específica
   */
  async desactivarTeoria(
    asignacionId: string,
    claseId: string,
    docenteId: string,
  ): Promise<void> {
    await this.validarOwnership(asignacionId, docenteId);

    await this.prisma.estadoClaseGrupo.upsert({
      where: {
        asignacion_id_clase_id: {
          asignacion_id: asignacionId,
          clase_id: claseId,
        },
      },
      update: {
        teoria_activa: false,
      },
      create: {
        asignacion_id: asignacionId,
        clase_id: claseId,
        teoria_activa: false,
        practica_activa: false,
      },
    });
  }

  /**
   * Activa práctica de una clase específica para un grupo
   */
  async activarPractica(
    asignacionId: string,
    claseId: string,
    docenteId: string,
  ): Promise<void> {
    await this.validarOwnership(asignacionId, docenteId);
    await this.validarClaseEnPlanificacion(asignacionId, claseId);

    await this.prisma.estadoClaseGrupo.upsert({
      where: {
        asignacion_id_clase_id: {
          asignacion_id: asignacionId,
          clase_id: claseId,
        },
      },
      update: {
        practica_activa: true,
        activada_en: new Date(),
      },
      create: {
        asignacion_id: asignacionId,
        clase_id: claseId,
        teoria_activa: false,
        practica_activa: true,
        activada_en: new Date(),
      },
    });
  }

  /**
   * Desactiva práctica de una clase específica
   */
  async desactivarPractica(
    asignacionId: string,
    claseId: string,
    docenteId: string,
  ): Promise<void> {
    await this.validarOwnership(asignacionId, docenteId);

    await this.prisma.estadoClaseGrupo.upsert({
      where: {
        asignacion_id_clase_id: {
          asignacion_id: asignacionId,
          clase_id: claseId,
        },
      },
      update: {
        practica_activa: false,
      },
      create: {
        asignacion_id: asignacionId,
        clase_id: claseId,
        teoria_activa: false,
        practica_activa: false,
      },
    });
  }

  /**
   * Activa tanto teoría como práctica de una clase (toggle completo)
   */
  async activarClase(
    asignacionId: string,
    claseId: string,
    docenteId: string,
  ): Promise<void> {
    await this.validarOwnership(asignacionId, docenteId);
    await this.validarClaseEnPlanificacion(asignacionId, claseId);

    await this.prisma.estadoClaseGrupo.upsert({
      where: {
        asignacion_id_clase_id: {
          asignacion_id: asignacionId,
          clase_id: claseId,
        },
      },
      update: {
        teoria_activa: true,
        practica_activa: true,
        activada_en: new Date(),
      },
      create: {
        asignacion_id: asignacionId,
        clase_id: claseId,
        teoria_activa: true,
        practica_activa: true,
        activada_en: new Date(),
      },
    });
  }

  /**
   * Desactiva tanto teoría como práctica de una clase
   */
  async desactivarClase(
    asignacionId: string,
    claseId: string,
    docenteId: string,
  ): Promise<void> {
    await this.validarOwnership(asignacionId, docenteId);

    await this.prisma.estadoClaseGrupo.upsert({
      where: {
        asignacion_id_clase_id: {
          asignacion_id: asignacionId,
          clase_id: claseId,
        },
      },
      update: {
        teoria_activa: false,
        practica_activa: false,
      },
      create: {
        asignacion_id: asignacionId,
        clase_id: claseId,
        teoria_activa: false,
        practica_activa: false,
      },
    });
  }

  /**
   * Obtiene el progreso de todos los estudiantes en una asignación
   * @param asignacionId - ID de la asignación
   * @param docenteId - ID del docente (para validar ownership)
   * @returns Lista de progresos de estudiantes por clase
   */
  async getProgresoEstudiantes(
    asignacionId: string,
    docenteId: string,
  ): Promise<{ progresos: ProgresoEstudianteClase[] }> {
    await this.validarOwnership(asignacionId, docenteId);

    // Obtener la asignación para saber qué planificación es
    const asignacion = await this.prisma.asignacionPlanificacion.findUnique({
      where: { id: asignacionId },
      include: {
        planificacion: {
          include: {
            clases: {
              orderBy: { numero: 'asc' },
            },
          },
        },
        claseGrupo: {
          include: {
            inscripciones: {
              where: { fecha_baja: null },
              include: {
                estudiante: {
                  select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!asignacion) {
      throw new NotFoundException('Asignación no encontrada');
    }

    // Obtener todos los progresos de estudiantes del grupo en las clases de esta planificación
    const claseIds = asignacion.planificacion.clases.map((c) => c.id);

    const progresos = await this.prisma.progresoClaseEstudiante.findMany({
      where: {
        clase_id: { in: claseIds },
        estudiante_id: {
          in: asignacion.claseGrupo.inscripciones.map((i) => i.estudiante.id),
        },
      },
      include: {
        estudiante: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        clase: {
          select: {
            numero: true,
            titulo: true,
          },
        },
      },
      orderBy: [
        { clase: { numero: 'asc' } },
        { estudiante: { apellido: 'asc' } },
      ],
    });

    return {
      progresos: progresos.map((p) => ({
        id: p.id,
        estudiante: p.estudiante
          ? { nombre: p.estudiante.nombre, apellido: p.estudiante.apellido }
          : null,
        clase_numero: p.clase.numero,
        clase_titulo: p.clase.titulo,
        teoria_completada: p.teoria_completada,
        practica_completada: p.practica_completada,
        tiempo_teoria_segundos: p.tiempo_teoria_segundos,
        tiempo_practica_segundos: p.tiempo_practica_segundos,
      })),
    };
  }

  /**
   * Valida que el docente es dueño de la asignación
   */
  private async validarOwnership(
    asignacionId: string,
    docenteId: string,
  ): Promise<void> {
    const asignacion = await this.prisma.asignacionPlanificacion.findUnique({
      where: { id: asignacionId },
      select: { docente_id: true },
    });

    if (!asignacion) {
      throw new NotFoundException('Asignación no encontrada');
    }

    if (asignacion.docente_id !== docenteId) {
      throw new ForbiddenException(
        'No tienes permisos para modificar esta asignación',
      );
    }
  }

  /**
   * Valida que la clase pertenece a la planificación de la asignación
   */
  private async validarClaseEnPlanificacion(
    asignacionId: string,
    claseId: string,
  ): Promise<void> {
    const asignacion = await this.prisma.asignacionPlanificacion.findUnique({
      where: { id: asignacionId },
      include: {
        planificacion: {
          include: {
            clases: {
              where: { id: claseId },
            },
          },
        },
      },
    });

    if (!asignacion || asignacion.planificacion.clases.length === 0) {
      throw new NotFoundException('La clase no pertenece a esta planificación');
    }
  }

  // ============================================================================
  // TAREAS - Gestión de tareas asignadas a grupos
  // ============================================================================

  /**
   * Obtiene las tareas disponibles para una clase (pool de tareas)
   * @param asignacionId - ID de la asignación
   * @param claseId - ID de la clase
   * @param docenteId - ID del docente (para validar ownership)
   * @returns Lista de tareas de la clase con estado de asignación
   */
  async getTareasClase(
    asignacionId: string,
    claseId: string,
    docenteId: string,
  ): Promise<{
    tareas: Array<{
      id: string;
      contenido_id: string;
      contenido_titulo: string;
      orden: number;
      obligatoria: boolean;
      asignada: boolean;
      tarea_asignada_id: string | null;
      fecha_limite: Date | null;
    }>;
  }> {
    await this.validarOwnership(asignacionId, docenteId);
    await this.validarClaseEnPlanificacion(asignacionId, claseId);

    // Obtener todas las tareas de la clase
    const tareasClase = await this.prisma.tareaClase.findMany({
      where: { clase_id: claseId },
      include: {
        contenido: {
          select: { id: true, titulo: true },
        },
        asignaciones: {
          where: { asignacion_id: asignacionId },
          select: { id: true, fecha_limite: true, activa: true },
        },
      },
      orderBy: { orden: 'asc' },
    });

    return {
      tareas: tareasClase.map((t) => ({
        id: t.id,
        contenido_id: t.contenido_id,
        contenido_titulo: t.contenido.titulo,
        orden: t.orden,
        obligatoria: t.obligatoria,
        asignada:
          t.asignaciones.length > 0 && (t.asignaciones[0]?.activa ?? false),
        tarea_asignada_id:
          t.asignaciones.length > 0 ? t.asignaciones[0]!.id : null,
        fecha_limite:
          t.asignaciones.length > 0 ? t.asignaciones[0]!.fecha_limite : null,
      })),
    };
  }

  /**
   * Asigna una tarea a un grupo (la hace visible para los estudiantes)
   * @param asignacionId - ID de la asignación
   * @param tareaClaseId - ID de la tarea de clase
   * @param docenteId - ID del docente
   * @param fechaLimite - Fecha límite opcional
   */
  async asignarTarea(
    asignacionId: string,
    tareaClaseId: string,
    docenteId: string,
    fechaLimite?: Date,
  ): Promise<{ success: boolean; tarea_asignada_id: string }> {
    await this.validarOwnership(asignacionId, docenteId);

    // Verificar que la tarea existe
    const tareaClase = await this.prisma.tareaClase.findUnique({
      where: { id: tareaClaseId },
      include: { clase: true },
    });

    if (!tareaClase) {
      throw new NotFoundException('Tarea no encontrada');
    }

    // Verificar que la clase pertenece a la planificación de la asignación
    const asignacion = await this.prisma.asignacionPlanificacion.findUnique({
      where: { id: asignacionId },
      include: {
        planificacion: {
          include: {
            clases: { where: { id: tareaClase.clase_id } },
          },
        },
      },
    });

    if (!asignacion || asignacion.planificacion.clases.length === 0) {
      throw new NotFoundException('La tarea no pertenece a esta planificación');
    }

    // Crear o actualizar la asignación de tarea
    const tareaAsignada = await this.prisma.tareaAsignada.upsert({
      where: {
        asignacion_id_tarea_clase_id: {
          asignacion_id: asignacionId,
          tarea_clase_id: tareaClaseId,
        },
      },
      update: {
        activa: true,
        fecha_limite: fechaLimite ?? null,
        fecha_asignacion: new Date(),
      },
      create: {
        asignacion_id: asignacionId,
        tarea_clase_id: tareaClaseId,
        activa: true,
        fecha_limite: fechaLimite ?? null,
      },
    });

    return { success: true, tarea_asignada_id: tareaAsignada.id };
  }

  /**
   * Desasigna una tarea (la oculta de los estudiantes)
   * @param asignacionId - ID de la asignación
   * @param tareaClaseId - ID de la tarea de clase
   * @param docenteId - ID del docente
   */
  async desasignarTarea(
    asignacionId: string,
    tareaClaseId: string,
    docenteId: string,
  ): Promise<{ success: boolean }> {
    await this.validarOwnership(asignacionId, docenteId);

    // Desactivar la tarea asignada
    await this.prisma.tareaAsignada.updateMany({
      where: {
        asignacion_id: asignacionId,
        tarea_clase_id: tareaClaseId,
      },
      data: { activa: false },
    });

    return { success: true };
  }

  /**
   * Actualiza la fecha límite de una tarea asignada
   * @param asignacionId - ID de la asignación
   * @param tareaClaseId - ID de la tarea de clase
   * @param docenteId - ID del docente
   * @param fechaLimite - Nueva fecha límite (null para quitar)
   */
  async actualizarFechaLimiteTarea(
    asignacionId: string,
    tareaClaseId: string,
    docenteId: string,
    fechaLimite: Date | null,
  ): Promise<{ success: boolean }> {
    await this.validarOwnership(asignacionId, docenteId);

    await this.prisma.tareaAsignada.updateMany({
      where: {
        asignacion_id: asignacionId,
        tarea_clase_id: tareaClaseId,
      },
      data: { fecha_limite: fechaLimite },
    });

    return { success: true };
  }

  /**
   * Obtiene el progreso de tareas de los estudiantes
   * @param asignacionId - ID de la asignación
   * @param docenteId - ID del docente
   * @returns Progreso de tareas por estudiante
   */
  async getProgresoTareas(
    asignacionId: string,
    docenteId: string,
  ): Promise<{
    progresos: Array<{
      estudiante_id: string;
      estudiante_nombre: string;
      tarea_titulo: string;
      completada: boolean;
      fecha_completado: Date | null;
      calificacion: number | null;
    }>;
  }> {
    await this.validarOwnership(asignacionId, docenteId);

    // Obtener estudiantes del grupo
    const asignacion = await this.prisma.asignacionPlanificacion.findUnique({
      where: { id: asignacionId },
      include: {
        claseGrupo: {
          include: {
            inscripciones: {
              where: { fecha_baja: null },
              include: {
                estudiante: {
                  select: { id: true, nombre: true, apellido: true },
                },
              },
            },
          },
        },
      },
    });

    if (!asignacion) {
      throw new NotFoundException('Asignación no encontrada');
    }

    // Obtener progresos de tareas
    const progresos = await this.prisma.progresoTareaEstudiante.findMany({
      where: {
        tareaAsignada: {
          asignacion_id: asignacionId,
        },
        estudiante_id: {
          in: asignacion.claseGrupo.inscripciones.map((i) => i.estudiante.id),
        },
      },
      include: {
        estudiante: {
          select: { id: true, nombre: true, apellido: true },
        },
        tareaAsignada: {
          include: {
            tareaClase: {
              include: {
                contenido: {
                  select: { titulo: true },
                },
              },
            },
          },
        },
      },
    });

    return {
      progresos: progresos.map((p) => ({
        estudiante_id: p.estudiante_id,
        estudiante_nombre: `${p.estudiante.nombre} ${p.estudiante.apellido}`,
        tarea_titulo: p.tareaAsignada.tareaClase.contenido.titulo,
        completada: p.completada_en !== null,
        fecha_completado: p.completada_en,
        calificacion: p.calificacion,
      })),
    };
  }
}
