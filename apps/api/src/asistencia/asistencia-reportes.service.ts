import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, EstadoAsistencia } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { FiltrarAsistenciaDto } from './dto/filtrar-asistencia.dto';

type AsistenciaConDetalle = Prisma.AsistenciaGetPayload<{
  include: {
    estudiante: {
      select: {
        id: true;
        nombre: true;
        apellido: true;
        foto_url: true;
      };
    };
    clase: {
      select: {
        fecha_hora_inicio: true;
        rutaCurricular: { select: { nombre: true; color: true } };
      };
    };
  };
}>;

/**
 * Service responsible for attendance reports, statistics, and analytics
 * Handles all read-only operations related to attendance data visualization
 */
@Injectable()
export class AsistenciaReportesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get attendance statistics for a specific class
   * Calculates total enrolled, present, absent, justified, pending, and attendance percentage
   */
  async obtenerEstadisticasClase(claseId: string) {
    const clase = await this.prisma.clase.findUnique({
      where: { id: claseId },
    });

    if (!clase) {
      throw new NotFoundException('Clase no encontrada');
    }

    // Optimized: Execute queries in parallel
    const [inscripciones, asistencias] = await Promise.all([
      this.prisma.inscripcionClase.findMany({
        where: { clase_id: claseId },
      }),
      this.prisma.asistencia.findMany({
        where: { clase_id: claseId },
      }),
    ]);

    // Create map of attendance by student_id
    const asistenciaMap = new Map(
      asistencias.map((a) => [a.estudiante_id, a]),
    );

    let presentes = 0;
    let ausentes = 0;
    let justificados = 0;
    let pendientes = 0;

    inscripciones.forEach((insc) => {
      const asistencia = asistenciaMap.get(insc.estudiante_id);
      if (!asistencia) {
        pendientes++;
      } else {
        if (asistencia.estado === 'Presente') presentes++;
        if (asistencia.estado === 'Ausente') ausentes++;
        if (asistencia.estado === 'Justificado') justificados++;
      }
    });

    const total = inscripciones.length;
    const porcentajeAsistencia =
      total > 0 ? ((presentes / total) * 100).toFixed(2) : '0.00';

    return {
      clase_id: claseId,
      total_inscritos: total,
      presentes,
      ausentes,
      justificados,
      pendientes,
      porcentaje_asistencia: parseFloat(porcentajeAsistencia),
    };
  }

  /**
   * Get attendance history for a specific student
   * Returns historical attendance records with statistics
   */
  async obtenerHistorialEstudiante(
    estudianteId: string,
    filtros: FiltrarAsistenciaDto,
  ) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Build filters for inscriptions
    const whereInscripcion: Prisma.InscripcionClaseWhereInput = {
      estudiante_id: estudianteId,
    };

    if (filtros.clase_id) {
      whereInscripcion.clase_id = filtros.clase_id;
    }

    // Optimized: Execute queries in parallel
    const whereAsistencia: Prisma.AsistenciaWhereInput = {
      estudiante_id: estudianteId,
    };

    if (filtros.clase_id) {
      whereAsistencia.clase_id = filtros.clase_id;
    }

    const [inscripciones, asistencias] = await Promise.all([
      this.prisma.inscripcionClase.findMany({
        where: whereInscripcion,
        include: {
          clase: {
            select: {
              id: true,
              fecha_hora_inicio: true,
              duracion_minutos: true,
              estado: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.asistencia.findMany({
        where: whereAsistencia,
      }),
    ]);

    // Create map of attendance by class_id
    const asistenciaMap = new Map(asistencias.map((a) => [a.clase_id, a]));

    const historial = inscripciones.map((insc) => {
      const asistencia = asistenciaMap.get(insc.clase_id);

      return {
        clase_id: insc.clase.id,
        fecha_clase: insc.clase.fecha_hora_inicio,
        duracion_minutos: insc.clase.duracion_minutos,
        estado_clase: insc.clase.estado,
        estado_asistencia: asistencia?.estado || 'Pendiente',
        observaciones: asistencia?.observaciones || null,
        puntos_otorgados: asistencia?.puntos_otorgados || 0,
        fecha_registro: asistencia?.createdAt || null,
      };
    });

    // Calculate statistics
    const presentes = historial.filter(
      (h) => h.estado_asistencia === 'Presente',
    ).length;
    const ausentes = historial.filter(
      (h) => h.estado_asistencia === 'Ausente',
    ).length;
    const justificados = historial.filter(
      (h) => h.estado_asistencia === 'Justificado',
    ).length;
    const total = historial.length;
    const porcentajeAsistencia =
      total > 0 ? ((presentes / total) * 100).toFixed(2) : '0.00';

    return {
      estudiante: {
        id: estudiante.id,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
      },
      estadisticas: {
        total_clases: total,
        presentes,
        ausentes,
        justificados,
        porcentaje_asistencia: parseFloat(porcentajeAsistencia),
      },
      historial,
    };
  }

  /**
   * Get attendance summary for teacher
   * Returns attendance statistics for all teacher's classes
   */
  async obtenerResumenDocente(docenteId: string) {
    // Optimized: Get teacher's classes first, then attendance in parallel
    const clases = await this.prisma.clase.findMany({
      where: { docente_id: docenteId },
      include: {
        inscripciones: true,
        asistencias: true, // Include attendance directly in the query
      },
      orderBy: {
        fecha_hora_inicio: 'desc',
      },
    });

    // Create flat array of attendance from classes
    const asistencias = clases.flatMap((clase) => clase.asistencias);

    // Create map of attendance by class_id and student_id
    const asistenciaMap = new Map<string, Map<string, any>>();
    asistencias.forEach((a) => {
      if (!asistenciaMap.has(a.clase_id)) {
        asistenciaMap.set(a.clase_id, new Map());
      }
      asistenciaMap.get(a.clase_id)?.set(a.estudiante_id, a);
    });

    const resumen = clases.map((clase) => {
      let presentes = 0;
      let ausentes = 0;
      let justificados = 0;
      let pendientes = 0;

      const claseAsistencias = asistenciaMap.get(clase.id);

      clase.inscripciones.forEach((insc) => {
        const asistencia = claseAsistencias?.get(insc.estudiante_id);
        if (!asistencia) {
          pendientes++;
        } else {
          if (asistencia.estado === 'Presente') presentes++;
          if (asistencia.estado === 'Ausente') ausentes++;
          if (asistencia.estado === 'Justificado') justificados++;
        }
      });

      const total = clase.inscripciones.length;
      const porcentaje =
        total > 0 ? ((presentes / total) * 100).toFixed(2) : '0.00';

      return {
        clase_id: clase.id,
        fecha_hora_inicio: clase.fecha_hora_inicio,
        duracion_minutos: clase.duracion_minutos,
        estado: clase.estado,
        total_inscritos: total,
        presentes,
        ausentes,
        justificados,
        pendientes,
        porcentaje_asistencia: parseFloat(porcentaje),
      };
    });

    // Global statistics
    const totalPresentes = resumen.reduce((sum, r) => sum + r.presentes, 0);
    const totalAusentes = resumen.reduce((sum, r) => sum + r.ausentes, 0);
    const totalJustificados = resumen.reduce(
      (sum, r) => sum + r.justificados,
      0,
    );
    const totalInscritos = resumen.reduce(
      (sum, r) => sum + r.total_inscritos,
      0,
    );
    const porcentajeGlobal =
      totalInscritos > 0
        ? ((totalPresentes / totalInscritos) * 100).toFixed(2)
        : '0.00';

    return {
      docente_id: docenteId,
      total_clases: clases.length,
      estadisticas_globales: {
        total_estudiantes: totalInscritos,
        total_presentes: totalPresentes,
        total_ausentes: totalAusentes,
        total_justificados: totalJustificados,
        porcentaje_asistencia_global: parseFloat(porcentajeGlobal),
      },
      clases: resumen,
    };
  }

  /**
   * Get all teacher's observations with filters
   * Returns attendance records that have observations
   */
  async obtenerObservacionesDocente(
    docenteId: string,
    filtros: {
      estudianteId?: string;
      fechaDesde?: string;
      fechaHasta?: string;
      limit?: number;
    },
  ) {
    const where: Prisma.AsistenciaWhereInput = {
      clase: {
        docente_id: docenteId, // Filter by teacher through class relationship
      },
      observaciones: { not: null }, // Only records with observations
    };

    // Filter by student if specified
    if (filtros.estudianteId) {
      where.estudiante_id = filtros.estudianteId;
    }

    // Filter by date range
    if (filtros.fechaDesde || filtros.fechaHasta) {
      where.createdAt = {
        ...(filtros.fechaDesde
          ? { gte: new Date(filtros.fechaDesde) }
          : {}),
        ...(filtros.fechaHasta
          ? { lte: new Date(filtros.fechaHasta) }
          : {}),
      };
    }

    const observaciones = await this.prisma.asistencia.findMany({
      where,
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            foto_url: true,
          },
        },
        clase: {
          select: {
            id: true,
            fecha_hora_inicio: true,
            rutaCurricular: {
              select: {
                nombre: true,
                color: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filtros.limit || 20,
    });

    return observaciones;
  }

  /**
   * Get detailed reports for teacher (charts and statistics)
   * Returns comprehensive attendance analytics including weekly trends,
   * top students, and attendance by curriculum path
   */
  async obtenerReportesDocente(docenteId: string) {
    // 1. Get all teacher's attendance records
    const todasAsistencias: AsistenciaConDetalle[] =
      await this.prisma.asistencia.findMany({
        where: {
          clase: {
            docente_id: docenteId, // Filter by teacher through class relationship
          },
        },
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            foto_url: true,
          },
        },
        clase: {
          select: {
            fecha_hora_inicio: true,
            rutaCurricular: {
              select: { nombre: true, color: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      });

    // 2. Weekly attendance (last 8 weeks)
    const hoy = new Date();
    const hace8Semanas = new Date(hoy.getTime() - 8 * 7 * 24 * 60 * 60 * 1000);

    const asistenciasSemana = todasAsistencias.filter(
      (a) => new Date(a.createdAt) >= hace8Semanas,
    );

    // Group by week
    const porSemana: Record<
      string,
      { presentes: number; ausentes: number; total: number }
    > = {};

    asistenciasSemana.forEach((a) => {
      const fecha = new Date(a.createdAt);
      const semana = `Sem ${Math.floor((hoy.getTime() - fecha.getTime()) / (7 * 24 * 60 * 60 * 1000))}`;

      if (!porSemana[semana]) {
        porSemana[semana] = { presentes: 0, ausentes: 0, total: 0 };
      }

      porSemana[semana].total++;
      if (a.estado === EstadoAsistencia.Presente) {
        porSemana[semana].presentes++;
      } else if (a.estado === EstadoAsistencia.Ausente) {
        porSemana[semana].ausentes++;
      }
    });

    // 3. Top 10 most frequent students
    const porEstudiante: Record<
      string,
      { nombre: string; foto_url: string | null; asistencias: number }
    > = {};

    todasAsistencias.forEach((a) => {
      if (a.estado === EstadoAsistencia.Presente) {
        const key = a.estudiante_id;
        if (!porEstudiante[key]) {
          porEstudiante[key] = {
            nombre: `${a.estudiante.nombre} ${a.estudiante.apellido}`,
            foto_url: a.estudiante.foto_url || null,
            asistencias: 0,
          };
        }
        porEstudiante[key].asistencias++;
      }
    });

    const topEstudiantes = Object.values(porEstudiante)
      .sort((a, b) => b.asistencias - a.asistencias)
      .slice(0, 10);

    // 4. Attendance by curriculum path
    const porRuta: Record<
      string,
      { presentes: number; total: number; color: string }
    > = {};

    todasAsistencias.forEach((a) => {
      const rutaNombre = a.clase.rutaCurricular?.nombre ?? 'Sin ruta';
      if (!porRuta[rutaNombre]) {
        porRuta[rutaNombre] = {
          presentes: 0,
          total: 0,
          color: a.clase.rutaCurricular?.color || '#6B7280', // Default color if null
        };
      }

      porRuta[rutaNombre].total++;
      if (a.estado === EstadoAsistencia.Presente) {
        porRuta[rutaNombre].presentes++;
      }
    });

    const porRutaArray = Object.entries(porRuta).map(([nombre, data]) => ({
      ruta: nombre,
      color: data.color,
      presentes: data.presentes,
      total: data.total,
      porcentaje:
        data.total > 0 ? ((data.presentes / data.total) * 100).toFixed(1) : '0',
    }));

    // 5. General statistics
    const totalPresentes = todasAsistencias.filter(
      (a) => a.estado === EstadoAsistencia.Presente,
    ).length;
    const totalAusentes = todasAsistencias.filter(
      (a) => a.estado === EstadoAsistencia.Ausente,
    ).length;
    const totalJustificados = todasAsistencias.filter(
      (a) => a.estado === EstadoAsistencia.Justificado,
    ).length;

    const porcentajeGlobal =
      todasAsistencias.length > 0
        ? ((totalPresentes / todasAsistencias.length) * 100).toFixed(1)
        : '0';

    return {
      estadisticas_globales: {
        total_registros: todasAsistencias.length,
        total_presentes: totalPresentes,
        total_ausentes: totalAusentes,
        total_justificados: totalJustificados,
        porcentaje_asistencia: parseFloat(porcentajeGlobal),
      },
      asistencia_semanal: porSemana,
      top_estudiantes: topEstudiantes,
      por_ruta_curricular: porRutaArray,
    };
  }
}
