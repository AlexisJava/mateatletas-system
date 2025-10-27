import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';

/**
 * Servicio para gestionar planificaciones simples
 *
 * Responsabilidades:
 * - Obtener progreso de estudiante
 * - Guardar estado del juego
 * - Avanzar semanas
 * - Completar semanas con puntos
 * - Registrar tiempo jugado
 */
@Injectable()
export class PlanificacionesSimplesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtener progreso de un estudiante en una planificación
   */
  async obtenerProgreso(estudianteId: string, codigoPlanificacion: string) {
    // 1. Buscar la planificación
    const planificacion = await this.prisma.planificacionSimple.findUnique({
      where: { codigo: codigoPlanificacion },
    });

    if (!planificacion) {
      throw new NotFoundException(
        `Planificación ${codigoPlanificacion} no encontrada`,
      );
    }

    // 2. Buscar o crear progreso del estudiante
    let progreso = await this.prisma.progresoEstudiantePlanificacion.findUnique(
      {
        where: {
          estudiante_id_planificacion_id: {
            estudiante_id: estudianteId,
            planificacion_id: planificacion.id,
          },
        },
      },
    );

    if (!progreso) {
      // Crear progreso inicial
      progreso = await this.prisma.progresoEstudiantePlanificacion.create({
        data: {
          estudiante_id: estudianteId,
          planificacion_id: planificacion.id,
          semana_actual: 1,
          tiempo_total_minutos: 0,
          puntos_totales: 0,
        },
      });
    }

    // 3. Obtener semanas activas para este estudiante
    // Buscar asignación de planificación al grupo del estudiante
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      include: {
        inscripciones_clase_grupo: {
          include: {
            claseGrupo: {
              include: {
                asignacionesPlanificacionesSimples: {
                  where: {
                    planificacion_id: planificacion.id,
                    activa: true,
                  },
                  include: {
                    semanas_activas: {
                      where: { activa: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Extraer semanas activas
    const semanasActivas: number[] = [];
    if (estudiante?.inscripciones_clase_grupo) {
      for (const inscripcion of estudiante.inscripciones_clase_grupo) {
        const asignaciones =
          inscripcion.claseGrupo.asignacionesPlanificacionesSimples;
        for (const asignacion of asignaciones) {
          semanasActivas.push(
            ...asignacion.semanas_activas.map((s: any) => s.numero_semana),
          );
        }
      }
    }

    // Remover duplicados y ordenar
    const semanasUnicas = [...new Set(semanasActivas)].sort((a, b) => a - b);

    return {
      semana_actual: progreso.semana_actual,
      ultima_actividad: progreso.ultima_actividad,
      estado_guardado: progreso.estado_guardado,
      tiempo_total_minutos: progreso.tiempo_total_minutos,
      puntos_totales: progreso.puntos_totales,
      semanas_activas: semanasUnicas.length > 0 ? semanasUnicas : [1], // Por defecto semana 1
    };
  }

  /**
   * Guardar estado del juego
   */
  async guardarEstado(
    estudianteId: string,
    codigoPlanificacion: string,
    estadoGuardado: any,
  ) {
    const planificacion = await this.prisma.planificacionSimple.findUnique({
      where: { codigo: codigoPlanificacion },
    });

    if (!planificacion) {
      throw new NotFoundException(
        `Planificación ${codigoPlanificacion} no encontrada`,
      );
    }

    const progreso = await this.prisma.progresoEstudiantePlanificacion.upsert({
      where: {
        estudiante_id_planificacion_id: {
          estudiante_id: estudianteId,
          planificacion_id: planificacion.id,
        },
      },
      update: {
        estado_guardado: estadoGuardado,
        ultima_actividad: new Date(),
      },
      create: {
        estudiante_id: estudianteId,
        planificacion_id: planificacion.id,
        semana_actual: 1,
        estado_guardado: estadoGuardado,
      },
    });

    return { success: true, progreso };
  }

  /**
   * Avanzar a la siguiente semana
   */
  async avanzarSemana(estudianteId: string, codigoPlanificacion: string) {
    const planificacion = await this.prisma.planificacionSimple.findUnique({
      where: { codigo: codigoPlanificacion },
    });

    if (!planificacion) {
      throw new NotFoundException(
        `Planificación ${codigoPlanificacion} no encontrada`,
      );
    }

    const progreso =
      await this.prisma.progresoEstudiantePlanificacion.findUnique({
        where: {
          estudiante_id_planificacion_id: {
            estudiante_id: estudianteId,
            planificacion_id: planificacion.id,
          },
        },
      });

    if (!progreso) {
      throw new NotFoundException('Progreso no encontrado');
    }

    // Validar que no exceda el total de semanas
    if (progreso.semana_actual >= planificacion.semanas_total) {
      throw new ForbiddenException('Ya estás en la última semana');
    }

    const nuevoProgreso =
      await this.prisma.progresoEstudiantePlanificacion.update({
        where: {
          estudiante_id_planificacion_id: {
            estudiante_id: estudianteId,
            planificacion_id: planificacion.id,
          },
        },
        data: {
          semana_actual: progreso.semana_actual + 1,
          ultima_actividad: new Date(),
        },
      });

    return { success: true, semana_actual: nuevoProgreso.semana_actual };
  }

  /**
   * Completar semana y asignar puntos
   */
  async completarSemana(
    estudianteId: string,
    codigoPlanificacion: string,
    semana: number,
    puntos: number,
  ) {
    const planificacion = await this.prisma.planificacionSimple.findUnique({
      where: { codigo: codigoPlanificacion },
    });

    if (!planificacion) {
      throw new NotFoundException(
        `Planificación ${codigoPlanificacion} no encontrada`,
      );
    }

    const progreso =
      await this.prisma.progresoEstudiantePlanificacion.findUnique({
        where: {
          estudiante_id_planificacion_id: {
            estudiante_id: estudianteId,
            planificacion_id: planificacion.id,
          },
        },
      });

    if (!progreso) {
      throw new NotFoundException('Progreso no encontrado');
    }

    // Actualizar puntos
    const nuevoProgreso =
      await this.prisma.progresoEstudiantePlanificacion.update({
        where: {
          estudiante_id_planificacion_id: {
            estudiante_id: estudianteId,
            planificacion_id: planificacion.id,
          },
        },
        data: {
          puntos_totales: { increment: puntos },
          ultima_actividad: new Date(),
        },
      });

    // Actualizar también los puntos totales del estudiante en su perfil
    await this.prisma.estudiante.update({
      where: { id: estudianteId },
      data: {
        puntos_totales: { increment: puntos },
      },
    });

    return {
      success: true,
      puntos_totales: nuevoProgreso.puntos_totales,
    };
  }

  /**
   * Registrar tiempo jugado
   */
  async registrarTiempo(
    estudianteId: string,
    codigoPlanificacion: string,
    minutos: number,
  ) {
    const planificacion = await this.prisma.planificacionSimple.findUnique({
      where: { codigo: codigoPlanificacion },
    });

    if (!planificacion) {
      throw new NotFoundException(
        `Planificación ${codigoPlanificacion} no encontrada`,
      );
    }

    const progreso = await this.prisma.progresoEstudiantePlanificacion.upsert({
      where: {
        estudiante_id_planificacion_id: {
          estudiante_id: estudianteId,
          planificacion_id: planificacion.id,
        },
      },
      update: {
        tiempo_total_minutos: { increment: minutos },
        ultima_actividad: new Date(),
      },
      create: {
        estudiante_id: estudianteId,
        planificacion_id: planificacion.id,
        semana_actual: 1,
        tiempo_total_minutos: minutos,
      },
    });

    return { success: true, tiempo_total: progreso.tiempo_total_minutos };
  }

  // ============================================================================
  // MÉTODOS ADMIN
  // ============================================================================

  /**
   * Obtener todas las planificaciones detectadas (Admin)
   */
  async listarPlanificaciones(filtros?: {
    estado?: string;
    grupo_codigo?: string;
    mes?: number;
    anio?: number;
  }) {
    const where: any = {};

    if (filtros?.estado) {
      where.estado = filtros.estado;
    }
    if (filtros?.grupo_codigo) {
      where.grupo_codigo = filtros.grupo_codigo;
    }
    if (filtros?.mes) {
      where.mes = filtros.mes;
    }
    if (filtros?.anio) {
      where.anio = filtros.anio;
    }

    const planificaciones = await this.prisma.planificacionSimple.findMany({
      where,
      include: {
        asignaciones: {
          include: {
            docente: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
              },
            },
            claseGrupo: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
        _count: {
          select: {
            progresosEstudiantes: true,
          },
        },
      },
      orderBy: [{ anio: 'desc' }, { mes: 'desc' }, { grupo_codigo: 'asc' }],
    });

    return planificaciones;
  }

  /**
   * Asignar planificación a docente y grupo (Admin)
   */
  async asignarPlanificacion(
    codigoPlanificacion: string,
    docenteId: string,
    claseGrupoId: string,
  ) {
    // 1. Verificar que existe la planificación
    const planificacion = await this.prisma.planificacionSimple.findUnique({
      where: { codigo: codigoPlanificacion },
    });

    if (!planificacion) {
      throw new NotFoundException(
        `Planificación ${codigoPlanificacion} no encontrada`,
      );
    }

    // 2. Verificar que existe el docente
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
    });

    if (!docente) {
      throw new NotFoundException(`Docente ${docenteId} no encontrado`);
    }

    // 3. Verificar que existe el claseGrupo
    const claseGrupo = await this.prisma.claseGrupo.findUnique({
      where: { id: claseGrupoId },
    });

    if (!claseGrupo) {
      throw new NotFoundException(`Clase grupo ${claseGrupoId} no encontrado`);
    }

    // 4. Crear asignación
    const asignacion = await this.prisma.asignacionPlanificacion.create({
      data: {
        planificacion_id: planificacion.id,
        docente_id: docenteId,
        clase_grupo_id: claseGrupoId,
        activa: true,
      },
      include: {
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        claseGrupo: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    // 5. Actualizar estado de la planificación a ASIGNADA
    await this.prisma.planificacionSimple.update({
      where: { id: planificacion.id },
      data: { estado: 'ASIGNADA' },
    });

    return asignacion;
  }

  /**
   * Obtener detalles de una planificación (Admin)
   */
  async obtenerDetallePlanificacion(codigoPlanificacion: string) {
    const planificacion = await this.prisma.planificacionSimple.findUnique({
      where: { codigo: codigoPlanificacion },
      include: {
        asignaciones: {
          include: {
            docente: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
              },
            },
            claseGrupo: {
              select: {
                id: true,
                nombre: true,
              },
            },
            semanas_activas: true,
          },
        },
        progresosEstudiantes: {
          include: {
            estudiante: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!planificacion) {
      throw new NotFoundException(
        `Planificación ${codigoPlanificacion} no encontrada`,
      );
    }

    return planificacion;
  }

  // ============================================================================
  // MÉTODOS DOCENTE
  // ============================================================================

  /**
   * Listar asignaciones del docente autenticado
   */
  async listarAsignacionesDocente(docenteId: string) {
    const asignaciones = await this.prisma.asignacionPlanificacion.findMany({
      where: {
        docente_id: docenteId,
        activa: true,
      },
      include: {
        planificacion: true,
        claseGrupo: {
          select: {
            id: true,
            nombre: true,
          },
        },
        semanas_activas: {
          orderBy: {
            numero_semana: 'asc',
          },
        },
      },
      orderBy: {
        fecha_asignacion: 'desc',
      },
    });

    return asignaciones;
  }

  /**
   * Activar una semana específica (Docente)
   */
  async activarSemana(
    asignacionId: string,
    docenteId: string,
    semanaNumero: number,
  ) {
    // Verificar que la asignación pertenece al docente
    const asignacion = await this.prisma.asignacionPlanificacion.findUnique({
      where: { id: asignacionId },
      include: {
        planificacion: true,
      },
    });

    if (!asignacion) {
      throw new NotFoundException('Asignación no encontrada');
    }

    if (asignacion.docente_id !== docenteId) {
      throw new ForbiddenException(
        'No tienes permiso para modificar esta asignación',
      );
    }

    // Validar que el número de semana es válido
    if (
      semanaNumero < 1 ||
      semanaNumero > asignacion.planificacion.semanas_total
    ) {
      throw new ForbiddenException(
        `Semana ${semanaNumero} inválida. La planificación tiene ${asignacion.planificacion.semanas_total} semanas`,
      );
    }

    // Verificar si ya existe
    const existente = await this.prisma.semanaActiva.findUnique({
      where: {
        asignacion_id_numero_semana: {
          asignacion_id: asignacionId,
          numero_semana: semanaNumero,
        },
      },
    });

    if (existente) {
      // Activar si estaba inactiva
      return await this.prisma.semanaActiva.update({
        where: { id: existente.id },
        data: { activa: true },
      });
    }

    // Crear nueva
    return await this.prisma.semanaActiva.create({
      data: {
        asignacion_id: asignacionId,
        numero_semana: semanaNumero,
        activa: true,
      },
    });
  }

  /**
   * Desactivar una semana específica (Docente)
   */
  async desactivarSemana(
    asignacionId: string,
    docenteId: string,
    semanaNumero: number,
  ) {
    // Verificar que la asignación pertenece al docente
    const asignacion = await this.prisma.asignacionPlanificacion.findUnique({
      where: { id: asignacionId },
    });

    if (!asignacion) {
      throw new NotFoundException('Asignación no encontrada');
    }

    if (asignacion.docente_id !== docenteId) {
      throw new ForbiddenException(
        'No tienes permiso para modificar esta asignación',
      );
    }

    // Buscar la semana activa
    const semanaActiva = await this.prisma.semanaActiva.findUnique({
      where: {
        asignacion_id_numero_semana: {
          asignacion_id: asignacionId,
          numero_semana: semanaNumero,
        },
      },
    });

    if (!semanaActiva) {
      return { success: true, message: 'Semana ya estaba inactiva' };
    }

    // Desactivar
    await this.prisma.semanaActiva.update({
      where: { id: semanaActiva.id },
      data: { activa: false },
    });

    return { success: true, message: 'Semana desactivada' };
  }

  /**
   * Ver progreso de estudiantes en una asignación (Docente)
   */
  async verProgresoEstudiantes(asignacionId: string, docenteId: string) {
    // Verificar que la asignación pertenece al docente
    const asignacion = await this.prisma.asignacionPlanificacion.findUnique({
      where: { id: asignacionId },
      include: {
        planificacion: {
          include: {
            progresosEstudiantes: {
              include: {
                estudiante: {
                  select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    email: true,
                  },
                },
              },
              orderBy: {
                ultima_actividad: 'desc',
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
      },
    });

    if (!asignacion) {
      throw new NotFoundException('Asignación no encontrada');
    }

    if (asignacion.docente_id !== docenteId) {
      throw new ForbiddenException(
        'No tienes permiso para ver esta información',
      );
    }

    return {
      asignacion: {
        id: asignacion.id,
        grupo: asignacion.claseGrupo,
      },
      planificacion: {
        codigo: asignacion.planificacion.codigo,
        titulo: asignacion.planificacion.titulo,
        semanas_total: asignacion.planificacion.semanas_total,
      },
      progresos: asignacion.planificacion.progresosEstudiantes,
    };
  }

  /**
   * Obtener todas las planificaciones del estudiante con su progreso
   */
  async obtenerPlanificacionesEstudiante(estudianteId: string) {
    // Obtener todos los progresos del estudiante
    const progresos = await this.prisma.progresoEstudiantePlanificacion.findMany({
      where: { estudiante_id: estudianteId },
      include: {
        planificacion: true,
      },
      orderBy: {
        ultima_actividad: 'desc',
      },
    });

    return progresos.map((progreso: any) => ({
      codigo: progreso.planificacion.codigo,
      titulo: progreso.planificacion.titulo,
      grupo_codigo: progreso.planificacion.grupo_codigo,
      mes: progreso.planificacion.mes,
      anio: progreso.planificacion.anio,
      semanas_total: progreso.planificacion.semanas_total,
      progreso: {
        semana_actual: progreso.semana_actual,
        puntos_totales: progreso.puntos_totales,
        tiempo_total_minutos: progreso.tiempo_total_minutos,
        ultima_actividad: progreso.ultima_actividad,
      },
    }));
  }
}
