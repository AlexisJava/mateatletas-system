import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { DocenteBusinessValidator } from '../validators/docente-business.validator';

/**
 * Service para queries relacionadas a comisiones del docente
 *
 * Responsabilidades:
 * - Listar estudiantes de una comisión con stats
 * - Métricas de comisión
 * - Historial de asistencia
 *
 * Patrón: CQRS (Query Service)
 */

// ============================================================================
// TIPOS DE RESPUESTA
// ============================================================================

export interface EstudianteComisionResponse {
  id: string;
  nombre: string;
  apellido: string;
  avatar_url: string | null;
  edad: number;
  casa: {
    id: string;
    tipo: string;
    nombre: string;
    colorPrimario: string;
  } | null;
  stats: {
    xp_total: number;
    nivel: number;
    racha_actual: number;
    asistencia_porcentaje: number;
    ultima_asistencia: {
      fecha: Date;
      estado: string;
    } | null;
  };
  tutor: {
    id: string;
    nombre: string;
    apellido: string;
    email: string | null;
    telefono: string | null;
  } | null;
  estado_inscripcion: string;
  inscripcion_fecha: Date;
}

export interface MetricasComisionResponse {
  asistencia_promedio: number;
  total_estudiantes: number;
  total_clases_dadas: number;
  total_puntos_otorgados: number;
}

export interface AsistenciaFechaResponse {
  fecha: Date;
  asistencias: Array<{
    estudiante_id: string;
    nombre: string;
    estado: 'Presente' | 'Ausente' | 'Justificado';
    observacion: string | null;
  }>;
}

export interface HistorialAsistenciaResponse {
  fechas: AsistenciaFechaResponse[];
}

@Injectable()
export class DocenteComisionQueriesService {
  constructor(
    private prisma: PrismaService,
    private validator: DocenteBusinessValidator,
  ) {}

  /**
   * Obtiene la lista de estudiantes de una comisión con sus stats
   * @param comisionId - ID de la comisión
   * @param docenteId - ID del docente (para verificar ownership)
   * @returns Lista de estudiantes con stats
   */
  async getEstudiantesComision(
    comisionId: string,
    docenteId: string,
  ): Promise<{ estudiantes: EstudianteComisionResponse[] }> {
    // Verificar que el docente existe
    await this.validator.validarDocenteExiste(docenteId);

    // Buscar comisión verificando ownership
    const comision = await this.prisma.comision.findFirst({
      where: {
        id: comisionId,
        docente_id: docenteId,
      },
      include: {
        inscripciones: {
          where: {
            estado: { not: 'Cancelada' },
          },
          include: {
            estudiante: {
              include: {
                tutor: true,
                casa: true,
                recursos: true,
                racha: true,
              },
            },
          },
        },
      },
    });

    if (!comision) {
      throw new Error('Comisión no encontrada o no tienes acceso');
    }

    // Mapear estudiantes con sus stats
    const estudiantes: EstudianteComisionResponse[] = await Promise.all(
      comision.inscripciones.map(async (inscripcion) => {
        const est = inscripcion.estudiante;

        // Obtener última asistencia del estudiante en esta comisión
        const ultimaAsistencia = await this.prisma.asistenciaComision.findFirst(
          {
            where: {
              estudiante_id: est.id,
              comision_id: comisionId,
            },
            orderBy: { fecha: 'desc' },
          },
        );

        // Calcular porcentaje de asistencia
        const asistenciaPorcentaje = await this.calcularAsistenciaPorcentaje(
          est.id,
          comisionId,
        );

        return {
          id: est.id,
          nombre: est.nombre,
          apellido: est.apellido,
          avatar_url: est.fotoUrl,
          edad: est.edad ?? 0,
          casa: est.casa
            ? {
                id: est.casa.id,
                tipo: est.casa.tipo,
                nombre: est.casa.nombre,
                colorPrimario: est.casa.colorPrimary,
              }
            : null,
          stats: {
            xp_total: est.recursos?.xp_total ?? 0,
            nivel: est.nivel_actual ?? 1,
            racha_actual: est.racha?.racha_actual ?? 0,
            asistencia_porcentaje: asistenciaPorcentaje,
            ultima_asistencia: ultimaAsistencia
              ? {
                  fecha: ultimaAsistencia.fecha,
                  estado: ultimaAsistencia.estado,
                }
              : null,
          },
          tutor: est.tutor
            ? {
                id: est.tutor.id,
                nombre: est.tutor.nombre,
                apellido: est.tutor.apellido,
                email: est.tutor.email,
                telefono: est.tutor.telefono,
              }
            : null,
          estado_inscripcion: inscripcion.estado,
          inscripcion_fecha: inscripcion.fecha_inscripcion,
        };
      }),
    );

    return { estudiantes };
  }

  /**
   * Obtiene métricas de una comisión
   * @param comisionId - ID de la comisión
   * @param docenteId - ID del docente (para verificar ownership)
   * @returns Métricas de la comisión
   */
  async getMetricasComision(
    comisionId: string,
    docenteId: string,
  ): Promise<MetricasComisionResponse> {
    // Verificar que el docente existe
    await this.validator.validarDocenteExiste(docenteId);

    // Verificar ownership
    const comision = await this.prisma.comision.findFirst({
      where: {
        id: comisionId,
        docente_id: docenteId,
      },
    });

    if (!comision) {
      throw new Error('Comisión no encontrada o no tienes acceso');
    }

    // Total de estudiantes activos (no cancelados)
    const totalEstudiantes = await this.prisma.inscripcionComision.count({
      where: {
        comision_id: comisionId,
        estado: { not: 'Cancelada' },
      },
    });

    // Total de clases (fechas únicas con asistencias registradas)
    const clasesDistintas = await this.prisma.asistenciaComision.groupBy({
      by: ['fecha'],
      where: { comision_id: comisionId },
    });
    const totalClasesDadas = clasesDistintas.length;

    // Calcular asistencia promedio
    let asistenciaPromedio = 0;
    if (totalClasesDadas > 0) {
      const totalAsistencias = await this.prisma.asistenciaComision.count({
        where: { comision_id: comisionId },
      });
      const presentes = await this.prisma.asistenciaComision.count({
        where: {
          comision_id: comisionId,
          estado: 'Presente',
        },
      });
      asistenciaPromedio =
        totalAsistencias > 0
          ? Math.round((presentes / totalAsistencias) * 100)
          : 0;
    }

    // Total puntos otorgados (sumar XP de estudiantes en esta comisión)
    // Por ahora retornamos 0 ya que no hay tabla de puntos por comisión
    const totalPuntosOtorgados = 0;

    return {
      asistencia_promedio: asistenciaPromedio,
      total_estudiantes: totalEstudiantes,
      total_clases_dadas: totalClasesDadas,
      total_puntos_otorgados: totalPuntosOtorgados,
    };
  }

  /**
   * Obtiene historial de asistencia de una comisión
   * @param comisionId - ID de la comisión
   * @param docenteId - ID del docente (para verificar ownership)
   * @param desde - Fecha desde (opcional)
   * @param hasta - Fecha hasta (opcional)
   * @returns Historial de asistencia agrupado por fecha
   */
  async getHistorialAsistencia(
    comisionId: string,
    docenteId: string,
    desde?: Date,
    hasta?: Date,
  ): Promise<HistorialAsistenciaResponse> {
    // Verificar que el docente existe
    await this.validator.validarDocenteExiste(docenteId);

    // Verificar ownership
    const comision = await this.prisma.comision.findFirst({
      where: {
        id: comisionId,
        docente_id: docenteId,
      },
    });

    if (!comision) {
      throw new Error('Comisión no encontrada o no tienes acceso');
    }

    // Construir filtro de fechas
    const whereClause: {
      comision_id: string;
      fecha?: { gte?: Date; lte?: Date };
    } = {
      comision_id: comisionId,
    };

    if (desde || hasta) {
      whereClause.fecha = {};
      if (desde) whereClause.fecha.gte = desde;
      if (hasta) whereClause.fecha.lte = hasta;
    }

    // Obtener asistencias con estudiantes
    const asistencias = await this.prisma.asistenciaComision.findMany({
      where: whereClause,
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });

    // Agrupar por fecha
    const fechasMap = new Map<string, AsistenciaFechaResponse>();

    for (const asistencia of asistencias) {
      const fechaKey = asistencia.fecha.toISOString().split('T')[0] as string;

      if (!fechasMap.has(fechaKey)) {
        fechasMap.set(fechaKey, {
          fecha: asistencia.fecha,
          asistencias: [],
        });
      }

      const fechaEntry = fechasMap.get(fechaKey);
      if (fechaEntry) {
        fechaEntry.asistencias.push({
          estudiante_id: asistencia.estudiante.id,
          nombre: `${asistencia.estudiante.nombre} ${asistencia.estudiante.apellido}`,
          estado: asistencia.estado as 'Presente' | 'Ausente' | 'Justificado',
          observacion: asistencia.observacion,
        });
      }
    }

    return {
      fechas: Array.from(fechasMap.values()),
    };
  }

  // ============================================================================
  // HELPERS PRIVADOS
  // ============================================================================

  /**
   * Calcula el porcentaje de asistencia de un estudiante en una comisión
   */
  private async calcularAsistenciaPorcentaje(
    estudianteId: string,
    comisionId: string,
  ): Promise<number> {
    // Calcular porcentaje de asistencia en esta comisión
    const totalAsistencias = await this.prisma.asistenciaComision.count({
      where: {
        estudiante_id: estudianteId,
        comision_id: comisionId,
      },
    });

    if (totalAsistencias === 0) {
      return 100; // Sin registros = 100% por defecto
    }

    const presentes = await this.prisma.asistenciaComision.count({
      where: {
        estudiante_id: estudianteId,
        comision_id: comisionId,
        estado: 'Presente',
      },
    });

    return Math.round((presentes / totalAsistencias) * 100);
  }
}
