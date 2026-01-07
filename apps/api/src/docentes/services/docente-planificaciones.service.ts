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
}
