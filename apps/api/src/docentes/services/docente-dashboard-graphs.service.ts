import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { DocenteBusinessValidator } from '../validators/docente-business.validator';
import {
  contarClasesPorDia,
  contarDiasPorSemana,
} from './helpers/docente-schedule-parser';

/**
 * Service for dashboard graphs and visualizations
 *
 * Handles:
 * - Carga horaria semanal (bar chart)
 * - Tendencia de asistencia (line chart)
 * - Distribución de estudiantes (pie chart)
 * - Progreso de comisión (progress bar)
 * - Puntos otorgados (stat card)
 */
@Injectable()
export class DocenteDashboardGraphsService {
  constructor(
    private prisma: PrismaService,
    private validator: DocenteBusinessValidator,
  ) {}

  /**
   * Obtiene la carga horaria semanal del docente
   * @param docenteId - ID del docente
   * @returns Data para gráfico de barras con clases por día
   */
  async getCargaHorariaSemanal(docenteId: string): Promise<{
    data: { day: string; classes: number }[];
  }> {
    await this.validator.validarDocenteExiste(docenteId);

    const comisiones = await this.prisma.comision.findMany({
      where: { docenteId: docenteId, activo: true },
      select: { horario: true },
    });

    const contadores: Record<string, number> = {
      lun: 0,
      mar: 0,
      mie: 0,
      jue: 0,
      vie: 0,
      sab: 0,
      dom: 0,
    };

    for (const comision of comisiones) {
      if (comision.horario) {
        contarClasesPorDia(comision.horario, contadores);
      }
    }

    return {
      data: [
        { day: 'Lun', classes: contadores['lun'] ?? 0 },
        { day: 'Mar', classes: contadores['mar'] ?? 0 },
        { day: 'Mié', classes: contadores['mie'] ?? 0 },
        { day: 'Jue', classes: contadores['jue'] ?? 0 },
        { day: 'Vie', classes: contadores['vie'] ?? 0 },
      ],
    };
  }

  /**
   * Obtiene la tendencia de asistencia de las últimas semanas
   * Promedio de asistencia por semana en todas las comisiones del docente
   * @param docenteId - ID del docente
   * @returns Data para gráfico de línea con promedio semanal
   */
  async getTendenciaAsistencia(docenteId: string): Promise<{
    data: { week: string; avg: number }[];
  }> {
    await this.validator.validarDocenteExiste(docenteId);

    const now = new Date();
    const semanasAtras = 5;
    const resultado: { week: string; avg: number }[] = [];

    // Obtener IDs de comisiones del docente
    const comisiones = await this.prisma.comision.findMany({
      where: { docenteId: docenteId },
      select: { id: true },
    });

    const comisionIds = comisiones.map((c) => c.id);

    if (comisionIds.length === 0) {
      // Sin comisiones, retornar semanas vacías
      for (let i = semanasAtras - 1; i >= 0; i--) {
        resultado.push({ week: `S${semanasAtras - i}`, avg: 0 });
      }
      return { data: resultado };
    }

    // Calcular asistencia por cada semana
    for (let i = semanasAtras - 1; i >= 0; i--) {
      const finSemana = new Date(now);
      finSemana.setDate(now.getDate() - i * 7);
      finSemana.setHours(23, 59, 59, 999);

      const inicioSemana = new Date(finSemana);
      inicioSemana.setDate(finSemana.getDate() - 6);
      inicioSemana.setHours(0, 0, 0, 0);

      // Contar asistencias en esa semana
      const asistencias = await this.prisma.asistenciaComision.groupBy({
        by: ['estado'],
        where: {
          comisionId: { in: comisionIds },
          fecha: {
            gte: inicioSemana,
            lte: finSemana,
          },
        },
        _count: { estado: true },
      });

      let presentes = 0;
      let total = 0;

      for (const a of asistencias) {
        total += a._count.estado;
        if (a.estado === 'Presente') {
          presentes += a._count.estado;
        }
      }

      const promedio = total > 0 ? Math.round((presentes / total) * 100) : 0;
      resultado.push({ week: `S${semanasAtras - i}`, avg: promedio });
    }

    return { data: resultado };
  }

  /**
   * Obtiene la distribución de estudiantes por comisión del docente
   * @param docenteId - ID del docente
   * @returns Data para gráfico de torta con estudiantes por comisión
   */
  async getDistribucionEstudiantes(docenteId: string): Promise<{
    data: { name: string; value: number }[];
    total: number;
  }> {
    await this.validator.validarDocenteExiste(docenteId);

    // Obtener comisiones con inscripciones activas (Pendiente o Confirmada)
    const comisiones = await this.prisma.comision.findMany({
      where: {
        docenteId: docenteId,
        activo: true,
      },
      select: {
        nombre: true,
        inscripciones: {
          where: {
            estado: { in: ['Pendiente', 'Confirmada'] },
          },
          select: {
            id: true,
          },
        },
      },
    });

    const data = comisiones
      .filter((c) => c.inscripciones.length > 0)
      .map((c) => ({
        name: c.nombre,
        value: c.inscripciones.length,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Máximo 6 para el gráfico

    const total = data.reduce((sum, c) => sum + c.value, 0);

    return { data, total };
  }

  /**
   * Obtiene el progreso de una comisión (sesiones completadas vs total)
   * @param comisionId - ID de la comisión
   * @param docenteId - ID del docente (para verificar ownership)
   * @returns Progreso con sesión actual, total y porcentaje
   */
  async getProgresoComision(
    comisionId: string,
    docenteId: string,
  ): Promise<{
    sesionActual: number;
    totalSesiones: number;
    porcentajeCompletado: number;
  }> {
    // Verificar que la comisión pertenece al docente
    const comision = await this.prisma.comision.findFirst({
      where: {
        id: comisionId,
        docenteId: docenteId,
      },
      select: {
        id: true,
        fechaInicio: true,
        fechaFin: true,
        horario: true,
      },
    });

    if (!comision) {
      throw new Error('Comisión no encontrada o no pertenece al docente');
    }

    // Contar sesiones distintas (fechas únicas de asistencia)
    const sesionesCompletadas = await this.prisma.asistenciaComision.groupBy({
      by: ['fecha'],
      where: {
        comisionId: comisionId,
      },
    });

    const sesionActual = sesionesCompletadas.length;

    // Estimar total de sesiones basado en horario (si tiene días por semana)
    // y duración de la comisión
    let totalSesiones = 24; // Default

    if (comision.fechaInicio && comision.fechaFin && comision.horario) {
      const diasPorSemana = contarDiasPorSemana(comision.horario);
      const duracionSemanas = Math.ceil(
        (comision.fechaFin.getTime() - comision.fechaInicio.getTime()) /
          (7 * 24 * 60 * 60 * 1000),
      );
      totalSesiones = diasPorSemana * duracionSemanas;
    }

    const porcentajeCompletado =
      totalSesiones > 0 ? Math.round((sesionActual / totalSesiones) * 100) : 0;

    return {
      sesionActual,
      totalSesiones,
      porcentajeCompletado,
    };
  }

  /**
   * Obtiene el total de puntos otorgados por el docente
   * @param docenteId - ID del docente
   * @returns Total de puntos otorgados
   */
  async getPuntosOtorgados(docenteId: string): Promise<number> {
    await this.validator.validarDocenteExiste(docenteId);

    const resultado = await this.prisma.puntoObtenido.aggregate({
      where: {
        docenteId: docenteId,
      },
      _sum: {
        puntos: true,
      },
    });

    return resultado._sum.puntos || 0;
  }
}
