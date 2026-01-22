import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Servicio especializado para estadísticas y agregaciones de clases
 *
 * Responsabilidad: Queries de agregación y estadísticas
 * - Estadísticas de ocupación de clases
 * - Resúmenes mensuales para tutores
 * - Reportes de asistencia
 *
 * IMPORTANTE: No modifica estado, solo consultas de agregación
 */
@Injectable()
export class ClaseStatsService {
  private readonly logger = new Logger(ClaseStatsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Obtener estadísticas de ocupación de clases
   *
   * @param filtros - Filtros opcionales (fechas, docente, etc.)
   * @returns Estadísticas agregadas de ocupación
   */
  async obtenerEstadisticasOcupacion(filtros?: {
    fechaDesde?: Date;
    fechaHasta?: Date;
    docenteId?: string;
  }) {
    const where: Prisma.ClaseWhereInput = {};

    if (filtros?.fechaDesde || filtros?.fechaHasta) {
      where.fechaHoraInicio = {};
      if (filtros.fechaDesde) where.fechaHoraInicio.gte = filtros.fechaDesde;
      if (filtros.fechaHasta) where.fechaHoraInicio.lte = filtros.fechaHasta;
    }

    if (filtros?.docenteId) where.docenteId = filtros.docenteId;

    // Obtener todas las clases según filtros
    const clases = await this.prisma.clase.findMany({
      where,
      select: {
        id: true,
        estado: true,
        cuposMaximo: true,
        cuposOcupados: true,
      },
    });

    // Calcular estadísticas
    const totalClasesProgramadas = clases.filter(
      (c) => c.estado === 'Programada',
    ).length;
    const totalClasesCanceladas = clases.filter(
      (c) => c.estado === 'Cancelada',
    ).length;

    const clasesConCupos = clases.filter((c) => c.cuposMaximo > 0);
    const promedioOcupacion =
      clasesConCupos.length > 0
        ? clasesConCupos.reduce(
            (sum, c) => sum + (c.cuposOcupados / c.cuposMaximo) * 100,
            0,
          ) / clasesConCupos.length
        : 0;

    const clasesLlenas = clases.filter(
      (c) => c.cuposOcupados >= c.cuposMaximo && c.cuposMaximo > 0,
    ).length;
    const clasesDisponibles = clases.filter(
      (c) => c.cuposOcupados < c.cuposMaximo && c.cuposMaximo > 0,
    ).length;

    return {
      totalClasesProgramadas,
      totalClasesCanceladas,
      promedioOcupacion: Math.round(promedioOcupacion * 100) / 100, // 2 decimales
      clasesLlenas,
      clasesDisponibles,
    };
  }

  /**
   * Obtener resumen mensual de clases para un tutor
   *
   * @param tutorId - ID del tutor
   * @param mes - Mes (1-12)
   * @param año - Año
   * @returns Resumen estadístico del mes
   */
  async obtenerResumenMensual(tutorId: string, mes: number, año: number) {
    // 1. Validar que el tutor existe
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
      include: {
        estudiantes: {
          select: { id: true },
        },
      },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor no encontrado');
    }

    const estudiantesIds = tutor.estudiantes.map((e) => e.id);

    if (estudiantesIds.length === 0) {
      return {
        mes,
        año,
        totalClases: 0,
        totalHoras: 0,
        estudiantesUnicos: 0,
        clasesPorDia: {},
      };
    }

    // 2. Calcular rango de fechas
    const fechaInicio = new Date(año, mes - 1, 1);
    const fechaFin = new Date(año, mes, 0, 23, 59, 59);

    // 3. Obtener clases del mes
    const clases = await this.prisma.clase.findMany({
      where: {
        fechaHoraInicio: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        inscripciones: {
          some: {
            estudianteId: { in: estudiantesIds },
          },
        },
      },
      include: {
        inscripciones: {
          where: {
            estudianteId: { in: estudiantesIds },
          },
          select: {
            estudianteId: true,
          },
        },
      },
    });

    // 4. Calcular estadísticas
    const totalClases = clases.length;
    const totalHoras = clases.reduce(
      (sum, c) => sum + c.duracionMinutos / 60,
      0,
    );

    // Estudiantes únicos que participaron en al menos una clase
    const estudiantesUnicosSet = new Set<string>();
    clases.forEach((clase) => {
      clase.inscripciones.forEach((insc) => {
        estudiantesUnicosSet.add(insc.estudianteId);
      });
    });

    // Clases agrupadas por día
    const clasesPorDia: Record<number, number> = {};
    clases.forEach((clase) => {
      const dia = clase.fechaHoraInicio.getDate();
      clasesPorDia[dia] = (clasesPorDia[dia] || 0) + 1;
    });

    return {
      mes,
      año,
      totalClases,
      totalHoras: Math.round(totalHoras * 100) / 100, // 2 decimales
      estudiantesUnicos: estudiantesUnicosSet.size,
      clasesPorDia,
    };
  }

  /**
   * Obtener reporte de asistencia de una clase
   *
   * @param claseId - ID de la clase
   * @returns Reporte con porcentaje de asistencia y listas de estudiantes
   */
  async obtenerReporteAsistencia(claseId: string) {
    const clase = await this.prisma.clase.findUnique({
      where: { id: claseId },
      include: {
        inscripciones: {
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
        asistencias: {
          select: {
            id: true,
            estudianteId: true,
            estado: true,
          },
        },
      },
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${claseId} no encontrada`);
    }

    const totalInscripciones = clase.inscripciones.length;

    if (totalInscripciones === 0) {
      return {
        claseId,
        totalInscripciones: 0,
        asistenciasConfirmadas: 0,
        porcentajeAsistencia: 0,
        estudiantesPresentes: [],
        estudiantesAusentes: [],
      };
    }

    // Contar asistencias confirmadas (estado: 'Presente')
    const asistenciasConfirmadas = clase.asistencias.filter(
      (a) => a.estado === 'Presente',
    ).length;

    // IDs de estudiantes presentes
    const estudiantesPresentesIds = clase.asistencias
      .filter((a) => a.estado === 'Presente')
      .map((a) => a.estudianteId);

    // Separar estudiantes presentes y ausentes
    const estudiantesPresentes: string[] = [];
    const estudiantesAusentes: string[] = [];

    clase.inscripciones.forEach((inscripcion) => {
      const nombreCompleto = `${inscripcion.estudiante.nombre} ${inscripcion.estudiante.apellido}`;

      if (estudiantesPresentesIds.includes(inscripcion.estudiante.id)) {
        estudiantesPresentes.push(nombreCompleto);
      } else {
        estudiantesAusentes.push(nombreCompleto);
      }
    });

    const porcentajeAsistencia =
      (asistenciasConfirmadas / totalInscripciones) * 100;

    return {
      claseId,
      totalInscripciones,
      asistenciasConfirmadas,
      porcentajeAsistencia: Math.round(porcentajeAsistencia * 100) / 100, // 2 decimales
      estudiantesPresentes,
      estudiantesAusentes,
    };
  }
}
