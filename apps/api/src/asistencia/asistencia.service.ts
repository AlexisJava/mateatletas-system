import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { MarcarAsistenciaDto } from './dto/marcar-asistencia.dto';
import { FiltrarAsistenciaDto } from './dto/filtrar-asistencia.dto';
import { EstadoAsistencia } from '@prisma/client';

@Injectable()
export class AsistenciaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Marcar o actualizar asistencia de un estudiante
   */
  async marcarAsistencia(
    claseId: string,
    estudianteId: string,
    dto: MarcarAsistenciaDto,
    docenteId: string | null,
  ) {
    // 1. Verificar que la clase existe y el docente es el titular (si aplica)
    const clase = await this.prisma.clase.findUnique({
      where: { id: claseId },
    });

    if (!clase) {
      throw new NotFoundException('Clase no encontrada');
    }

    // Solo validar docente si docenteId está presente (no para auto-registro)
    if (docenteId !== null && clase.docente_id !== docenteId) {
      throw new ForbiddenException(
        'Solo el docente titular puede marcar asistencia',
      );
    }

    // 2. Verificar que el estudiante está inscrito en la clase
    const inscripcion = await this.prisma.inscripcionClase.findFirst({
      where: {
        clase_id: claseId,
        estudiante_id: estudianteId,
      },
    });

    if (!inscripcion) {
      throw new BadRequestException(
        'El estudiante no está inscrito en esta clase',
      );
    }

    // 3. Buscar si ya existe un registro de asistencia
    const asistenciaExistente = await this.prisma.asistencia.findFirst({
      where: {
        clase_id: claseId,
        estudiante_id: estudianteId,
      },
    });

    // 4. Crear o actualizar el registro de asistencia
    let asistencia;
    if (asistenciaExistente) {
      asistencia = await this.prisma.asistencia.update({
        where: { id: asistenciaExistente.id },
        data: {
          estado: dto.estado,
          observaciones: dto.observaciones,
          puntos_otorgados: dto.puntos_otorgados || 0,
        },
        include: {
          estudiante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
        },
      });
    } else {
      asistencia = await this.prisma.asistencia.create({
        data: {
          clase_id: claseId,
          estudiante_id: estudianteId,
          estado: dto.estado,
          observaciones: dto.observaciones,
          puntos_otorgados: dto.puntos_otorgados || 0,
        },
        include: {
          estudiante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
        },
      });
    }

    return {
      id: asistencia.id,
      estudiante: asistencia.estudiante,
      estado: asistencia.estado,
      observaciones: asistencia.observaciones,
      puntos_otorgados: asistencia.puntos_otorgados,
      fecha_registro: asistencia.createdAt,
    };
  }

  /**
   * Obtener lista de asistencia de una clase
   */
  async obtenerAsistenciaClase(claseId: string, docenteId?: string) {
    // Si es docente, verificar que es el titular
    if (docenteId) {
      const clase = await this.prisma.clase.findUnique({
        where: { id: claseId },
      });

      if (!clase) {
        throw new NotFoundException('Clase no encontrada');
      }

      if (clase.docente_id !== docenteId) {
        throw new ForbiddenException(
          'Solo el docente titular puede ver la asistencia',
        );
      }
    }

    // Obtener todas las inscripciones de la clase
    const inscripciones = await this.prisma.inscripcionClase.findMany({
      where: { clase_id: claseId },
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            nivel_escolar: true,
          },
        },
      },
    });

    // Obtener todas las asistencias de la clase
    const asistencias = await this.prisma.asistencia.findMany({
      where: { clase_id: claseId },
    });

    // Crear un mapa de asistencias por estudiante_id
    const asistenciaMap = new Map(
      asistencias.map((a) => [a.estudiante_id, a]),
    );

    // Contar estados
    let totalPresentes = 0;
    let totalAusentes = 0;
    let totalJustificados = 0;

    const lista = inscripciones.map((insc) => {
      const asistencia = asistenciaMap.get(insc.estudiante_id);

      if (asistencia) {
        if (asistencia.estado === 'Presente') totalPresentes++;
        if (asistencia.estado === 'Ausente') totalAusentes++;
        if (asistencia.estado === 'Justificado') totalJustificados++;
      }

      return {
        inscripcion_id: insc.id,
        estudiante: insc.estudiante,
        estado_asistencia: asistencia?.estado || 'Pendiente',
        observaciones: asistencia?.observaciones || null,
        puntos_otorgados: asistencia?.puntos_otorgados || 0,
        asistencia_id: asistencia?.id || null,
      };
    });

    return {
      clase: {
        id: claseId,
      },
      total_inscritos: inscripciones.length,
      total_presentes: totalPresentes,
      total_ausentes: totalAusentes,
      total_justificados: totalJustificados,
      lista,
    };
  }

  /**
   * Obtener estadísticas de asistencia de una clase
   */
  async obtenerEstadisticasClase(claseId: string) {
    const clase = await this.prisma.clase.findUnique({
      where: { id: claseId },
    });

    if (!clase) {
      throw new NotFoundException('Clase no encontrada');
    }

    const inscripciones = await this.prisma.inscripcionClase.findMany({
      where: { clase_id: claseId },
    });

    const asistencias = await this.prisma.asistencia.findMany({
      where: { clase_id: claseId },
    });

    // Crear mapa de asistencias por estudiante_id
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
   * Obtener historial de asistencia de un estudiante
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

    // Construir filtros para inscripciones
    const whereInscripcion: any = {
      estudiante_id: estudianteId,
    };

    if (filtros.clase_id) {
      whereInscripcion.clase_id = filtros.clase_id;
    }

    // Obtener inscripciones del estudiante
    const inscripciones = await this.prisma.inscripcionClase.findMany({
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
    });

    // Obtener asistencias del estudiante
    const whereAsistencia: any = {
      estudiante_id: estudianteId,
    };

    if (filtros.clase_id) {
      whereAsistencia.clase_id = filtros.clase_id;
    }

    const asistencias = await this.prisma.asistencia.findMany({
      where: whereAsistencia,
    });

    // Crear mapa de asistencias por clase_id
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

    // Calcular estadísticas
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
   * Obtener resumen de asistencia del docente
   */
  async obtenerResumenDocente(docenteId: string) {
    // Obtener todas las clases del docente
    const clases = await this.prisma.clase.findMany({
      where: { docente_id: docenteId },
      include: {
        inscripciones: true,
      },
      orderBy: {
        fecha_hora_inicio: 'desc',
      },
    });

    // Obtener todas las asistencias de las clases del docente
    const claseIds = clases.map((c) => c.id);
    const asistencias = await this.prisma.asistencia.findMany({
      where: {
        clase_id: { in: claseIds },
      },
    });

    // Crear mapa de asistencias por clase_id y estudiante_id
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

    // Estadísticas globales
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
   * Obtener todas las observaciones del docente con filtros
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
    const where: any = {
      clase: {
        docente_id: docenteId, // Filtrar por docente a través de la relación con clase
      },
      observaciones: { not: null }, // Solo registros con observaciones
    };

    // Filtrar por estudiante si se especifica
    if (filtros.estudianteId) {
      where.estudiante_id = filtros.estudianteId;
    }

    // Filtrar por rango de fechas
    if (filtros.fechaDesde || filtros.fechaHasta) {
      where.createdAt = {};
      if (filtros.fechaDesde) {
        where.createdAt.gte = new Date(filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        where.createdAt.lte = new Date(filtros.fechaHasta);
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
   * Obtener reportes detallados para el docente (gráficos y estadísticas)
   */
  async obtenerReportesDocente(docenteId: string) {
    // 1. Obtener todas las asistencias del docente
    const todasAsistencias = await this.prisma.asistencia.findMany({
      where: {
        clase: {
          docente_id: docenteId, // Filtrar por docente a través de la relación con clase
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

    // 2. Asistencia semanal (últimas 8 semanas)
    const hoy = new Date();
    const hace8Semanas = new Date(hoy.getTime() - 8 * 7 * 24 * 60 * 60 * 1000);

    const asistenciasSemana = todasAsistencias.filter(
      (a) => new Date(a.createdAt) >= hace8Semanas,
    );

    // Agrupar por semana
    const porSemana: Record<string, { presentes: number; ausentes: number; total: number }> = {};

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

    // 3. Top 10 estudiantes más frecuentes
    const porEstudiante: Record<string, { nombre: string; foto_url: string | null; asistencias: number }> = {};

    todasAsistencias.forEach((a: any) => {
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

    // 4. Asistencia por ruta curricular
    const porRuta: Record<string, { presentes: number; total: number; color: string }> = {};

    todasAsistencias.forEach((a: any) => {
      const rutaNombre = a.clase.rutaCurricular.nombre;
      if (!porRuta[rutaNombre]) {
        porRuta[rutaNombre] = {
          presentes: 0,
          total: 0,
          color: a.clase.rutaCurricular.color || '#6B7280', // Default color if null
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
      porcentaje: data.total > 0 ? ((data.presentes / data.total) * 100).toFixed(1) : '0',
    }));

    // 5. Estadísticas generales
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
