import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, EstadoAsistencia } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { FiltrarAsistenciaDto } from './dto/filtrar-asistencia.dto';

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
        where: { claseId: claseId },
      }),
      this.prisma.asistencia.findMany({
        where: { claseId: claseId },
      }),
    ]);

    // Create map of attendance by student_id
    const asistenciaMap = new Map<string, (typeof asistencias)[number]>(
      asistencias.map((asistencia) => [asistencia.estudianteId, asistencia]),
    );

    let presentes = 0;
    let ausentes = 0;
    let justificados = 0;
    let pendientes = 0;

    inscripciones.forEach((insc) => {
      const asistencia = asistenciaMap.get(insc.estudianteId);
      if (!asistencia) {
        pendientes++;
      } else {
        if (asistencia.estado === EstadoAsistencia.Presente) presentes++;
        if (asistencia.estado === EstadoAsistencia.Ausente) ausentes++;
        if (asistencia.estado === EstadoAsistencia.Justificado) justificados++;
      }
    });

    const total = inscripciones.length;
    const porcentajeAsistencia =
      total > 0 ? ((presentes / total) * 100).toFixed(2) : '0.00';

    return {
      claseId: claseId,
      totalInscritos: total,
      presentes,
      ausentes,
      justificados,
      pendientes,
      porcentajeAsistencia: parseFloat(porcentajeAsistencia),
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
      estudianteId: estudianteId,
    };

    if (filtros.claseId) {
      whereInscripcion.claseId = filtros.claseId;
    }

    // Optimized: Execute queries in parallel
    const whereAsistencia: Prisma.AsistenciaWhereInput = {
      estudianteId: estudianteId,
    };

    if (filtros.claseId) {
      whereAsistencia.claseId = filtros.claseId;
    }

    const [inscripciones, asistencias] = await Promise.all([
      this.prisma.inscripcionClase.findMany({
        where: whereInscripcion,
        include: {
          clase: {
            select: {
              id: true,
              fechaHoraInicio: true,
              duracionMinutos: true,
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
    const asistenciaMapPorClase = new Map<string, (typeof asistencias)[number]>(
      asistencias.map((asistencia) => [asistencia.claseId, asistencia]),
    );

    const historial = inscripciones.map((insc) => {
      const asistencia = asistenciaMapPorClase.get(insc.claseId);

      return {
        claseId: insc.clase.id,
        fechaClase: insc.clase.fechaHoraInicio,
        duracionMinutos: insc.clase.duracionMinutos,
        estadoClase: insc.clase.estado,
        estadoAsistencia: asistencia?.estado || 'Pendiente',
        observaciones: asistencia?.observaciones || null,
        puntosOtorgados: asistencia?.puntosOtorgados || 0,
        fechaRegistro: asistencia?.createdAt || null,
      };
    });

    // Calculate statistics
    const presentes = historial.filter(
      (h) => h.estadoAsistencia === EstadoAsistencia.Presente,
    ).length;
    const ausentes = historial.filter(
      (h) => h.estadoAsistencia === EstadoAsistencia.Ausente,
    ).length;
    const justificados = historial.filter(
      (h) => h.estadoAsistencia === EstadoAsistencia.Justificado,
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
        totalClases: total,
        presentes,
        ausentes,
        justificados,
        porcentajeAsistencia: parseFloat(porcentajeAsistencia),
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
      where: { docenteId: docenteId },
      include: {
        inscripciones: true,
        asistencias: true, // Include attendance directly in the query
      },
      orderBy: {
        fechaHoraInicio: 'desc',
      },
    });

    // Create flat array of attendance from classes
    const asistencias = clases.flatMap((clase) => clase.asistencias);

    // Create map of attendance by class_id and student_id
    const asistenciaMap = new Map<
      string,
      Map<string, (typeof asistencias)[number]>
    >();
    asistencias.forEach((asistencia) => {
      if (!asistenciaMap.has(asistencia.claseId)) {
        asistenciaMap.set(asistencia.claseId, new Map());
      }
      asistenciaMap
        .get(asistencia.claseId)
        ?.set(asistencia.estudianteId, asistencia);
    });

    const resumen = clases.map((clase) => {
      let presentes = 0;
      let ausentes = 0;
      let justificados = 0;
      let pendientes = 0;

      const claseAsistencias = asistenciaMap.get(clase.id);

      clase.inscripciones.forEach((insc) => {
        const asistencia = claseAsistencias?.get(insc.estudianteId);
        if (!asistencia) {
          pendientes++;
        } else {
          if (asistencia.estado === EstadoAsistencia.Presente) presentes++;
          if (asistencia.estado === EstadoAsistencia.Ausente) ausentes++;
          if (asistencia.estado === EstadoAsistencia.Justificado)
            justificados++;
        }
      });

      const total = clase.inscripciones.length;
      const porcentaje =
        total > 0 ? ((presentes / total) * 100).toFixed(2) : '0.00';

      return {
        claseId: clase.id,
        fechaHoraInicio: clase.fechaHoraInicio,
        duracionMinutos: clase.duracionMinutos,
        estado: clase.estado,
        totalInscritos: total,
        presentes,
        ausentes,
        justificados,
        pendientes,
        porcentajeAsistencia: parseFloat(porcentaje),
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
      (sum, r) => sum + r.totalInscritos,
      0,
    );
    const porcentajeGlobal =
      totalInscritos > 0
        ? ((totalPresentes / totalInscritos) * 100).toFixed(2)
        : '0.00';

    return {
      docenteId: docenteId,
      totalClases: clases.length,
      estadisticasGlobales: {
        totalEstudiantes: totalInscritos,
        totalPresentes: totalPresentes,
        totalAusentes: totalAusentes,
        totalJustificados: totalJustificados,
        porcentajeAsistenciaGlobal: parseFloat(porcentajeGlobal),
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
        docenteId: docenteId, // Filter by teacher through class relationship
      },
      observaciones: { not: null }, // Only records with observations
    };

    // Filter by student if specified
    if (filtros.estudianteId) {
      where.estudianteId = filtros.estudianteId;
    }

    // Filter by date range
    if (filtros.fechaDesde || filtros.fechaHasta) {
      const createdAtFilter: Prisma.DateTimeFilter = {};
      if (filtros.fechaDesde) {
        createdAtFilter.gte = new Date(filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        createdAtFilter.lte = new Date(filtros.fechaHasta);
      }
      if (Object.keys(createdAtFilter).length > 0) {
        where.createdAt = createdAtFilter;
      }
    }

    const observaciones = await this.prisma.asistencia.findMany({
      where,
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            fotoUrl: true,
          },
        },
        clase: {
          select: {
            id: true,
            nombre: true,
            fechaHoraInicio: true,
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
    const todasAsistencias = await this.prisma.asistencia.findMany({
      where: {
        clase: {
          docenteId: docenteId, // Filter by teacher through class relationship
        },
      },
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            fotoUrl: true,
          },
        },
        clase: {
          select: {
            nombre: true,
            fechaHoraInicio: true,
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
      { nombre: string; fotoUrl: string | null; asistencias: number }
    > = {};

    todasAsistencias.forEach((asistencia) => {
      if (asistencia.estado === EstadoAsistencia.Presente) {
        const key = asistencia.estudianteId;
        if (!porEstudiante[key]) {
          porEstudiante[key] = {
            nombre: `${asistencia.estudiante.nombre} ${asistencia.estudiante.apellido}`,
            fotoUrl: asistencia.estudiante.fotoUrl || null,
            asistencias: 0,
          };
        }
        porEstudiante[key].asistencias++;
      }
    });

    const topEstudiantes = Object.values(porEstudiante)
      .sort((a, b) => b.asistencias - a.asistencias)
      .slice(0, 10);

    // 4. Attendance by class name
    const porClase: Record<string, { presentes: number; total: number }> = {};

    todasAsistencias.forEach((a) => {
      const claseNombre = a.clase.nombre || 'Sin nombre';
      if (!porClase[claseNombre]) {
        porClase[claseNombre] = {
          presentes: 0,
          total: 0,
        };
      }

      porClase[claseNombre].total++;
      if (a.estado === EstadoAsistencia.Presente) {
        porClase[claseNombre].presentes++;
      }
    });

    const porClaseArray = Object.entries(porClase).map(([nombre, data]) => ({
      clase: nombre,
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
      estadisticasGlobales: {
        totalRegistros: todasAsistencias.length,
        totalPresentes: totalPresentes,
        totalAusentes: totalAusentes,
        totalJustificados: totalJustificados,
        porcentajeAsistencia: parseFloat(porcentajeGlobal),
      },
      asistenciaSemanal: porSemana,
      topEstudiantes: topEstudiantes,
      porClase: porClaseArray,
    };
  }
}
