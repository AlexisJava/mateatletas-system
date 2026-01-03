import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * Interfaces para respuestas tipadas
 */
export interface PlanificacionSimple {
  id: string;
  titulo: string;
  semanas_total: number;
}

export interface SemanaActiva {
  semana_numero: number;
  activa: boolean;
}

export interface ClaseGrupoSimple {
  id: string;
  nombre: string;
}

export interface AsignacionResponse {
  id: string;
  planificacion: PlanificacionSimple;
  claseGrupo: ClaseGrupoSimple;
  semanas_activas: SemanaActiva[];
}

export interface ProgresoEstudiante {
  id: string;
  estudiante: { nombre: string; apellido: string } | null;
  semana_actual: number;
  tiempo_total_minutos: number;
  puntos_totales: number;
}

/**
 * Servicio de Planificaciones para Docentes
 *
 * Responsabilidades:
 * - Obtener asignaciones de planificaciones del docente
 * - Activar/desactivar semanas de planificaciones
 * - Consultar progreso de estudiantes en planificaciones
 *
 * Patrón: CQRS (lectura y escritura en mismo servicio por simplicidad)
 */
@Injectable()
export class DocentePlanificacionesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene todas las asignaciones de planificaciones del docente autenticado
   * @param docenteId - ID del docente
   * @returns Lista de asignaciones con planificación, grupo y semanas activas
   */
  async getMisAsignaciones(docenteId: string): Promise<AsignacionResponse[]> {
    const asignaciones = await this.prisma.asignacionPlanificacion.findMany({
      where: { docente_id: docenteId },
      include: {
        planificacion: {
          select: {
            id: true,
            titulo: true,
            semanas_total: true,
          },
        },
        claseGrupo: {
          select: {
            id: true,
            nombre: true,
          },
        },
        semanasActivas: {
          select: {
            semana_numero: true,
            activa: true,
          },
          orderBy: {
            semana_numero: 'asc',
          },
        },
      },
      orderBy: {
        creado_en: 'desc',
      },
    });

    return asignaciones.map((asig) => ({
      id: asig.id,
      planificacion: {
        id: asig.planificacion.id,
        titulo: asig.planificacion.titulo,
        semanas_total: asig.planificacion.semanas_total,
      },
      claseGrupo: {
        id: asig.claseGrupo.id,
        nombre: asig.claseGrupo.nombre,
      },
      semanas_activas: asig.semanasActivas.map((s) => ({
        semana_numero: s.semana_numero,
        activa: s.activa,
      })),
    }));
  }

  /**
   * Activa una semana específica de una asignación
   * @param asignacionId - ID de la asignación
   * @param semanaNumero - Número de semana a activar
   * @param docenteId - ID del docente (para validar ownership)
   */
  async activarSemana(
    asignacionId: string,
    semanaNumero: number,
    docenteId: string,
  ): Promise<void> {
    await this.validarOwnership(asignacionId, docenteId);

    // Upsert: crear si no existe, actualizar si existe
    await this.prisma.semanaActivaPlanificacion.upsert({
      where: {
        asignacion_id_semana_numero: {
          asignacion_id: asignacionId,
          semana_numero: semanaNumero,
        },
      },
      update: {
        activa: true,
        activada_en: new Date(),
      },
      create: {
        asignacion_id: asignacionId,
        semana_numero: semanaNumero,
        activa: true,
        activada_en: new Date(),
      },
    });
  }

  /**
   * Desactiva una semana específica de una asignación
   * @param asignacionId - ID de la asignación
   * @param semanaNumero - Número de semana a desactivar
   * @param docenteId - ID del docente (para validar ownership)
   */
  async desactivarSemana(
    asignacionId: string,
    semanaNumero: number,
    docenteId: string,
  ): Promise<void> {
    await this.validarOwnership(asignacionId, docenteId);

    // Upsert: crear como desactivada si no existe, actualizar si existe
    await this.prisma.semanaActivaPlanificacion.upsert({
      where: {
        asignacion_id_semana_numero: {
          asignacion_id: asignacionId,
          semana_numero: semanaNumero,
        },
      },
      update: {
        activa: false,
      },
      create: {
        asignacion_id: asignacionId,
        semana_numero: semanaNumero,
        activa: false,
      },
    });
  }

  /**
   * Obtiene el progreso de todos los estudiantes en una asignación
   * @param asignacionId - ID de la asignación
   * @param docenteId - ID del docente (para validar ownership)
   * @returns Lista de progresos de estudiantes
   */
  async getProgresoEstudiantes(
    asignacionId: string,
    docenteId: string,
  ): Promise<{ progresos: ProgresoEstudiante[] }> {
    await this.validarOwnership(asignacionId, docenteId);

    const progresos = await this.prisma.progresoSemanalEstudiante.findMany({
      where: { asignacion_id: asignacionId },
      include: {
        estudiante: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: [{ semana_actual: 'desc' }, { puntos_totales: 'desc' }],
    });

    return {
      progresos: progresos.map((p) => ({
        id: p.id,
        estudiante: p.estudiante
          ? { nombre: p.estudiante.nombre, apellido: p.estudiante.apellido }
          : null,
        semana_actual: p.semana_actual,
        tiempo_total_minutos: p.tiempo_total_min,
        puntos_totales: p.puntos_totales,
      })),
    };
  }

  /**
   * Valida que el docente es dueño de la asignación
   * @param asignacionId - ID de la asignación
   * @param docenteId - ID del docente
   * @throws NotFoundException si la asignación no existe
   * @throws ForbiddenException si el docente no es dueño
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
}
