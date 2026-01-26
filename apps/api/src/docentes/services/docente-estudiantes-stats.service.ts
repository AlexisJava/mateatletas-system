import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { DocenteBusinessValidator } from '../validators/docente-business.validator';

/**
 * Internal types for statistics calculations
 */
type EstudianteBasico = {
  id: string;
  nombre: string;
  apellido: string;
  fotoUrl: string | null;
};

type EstudianteConGrupos = EstudianteBasico & {
  grupos: Array<{
    id: string;
    nombre: string;
    codigo: string;
  }>;
};

type AsistenciaEstudiante = {
  estudianteId: string;
  nombre: string;
  apellido: string;
  fotoUrl: string | null;
  grupos: Array<{
    id: string;
    nombre: string;
    codigo: string;
  }>;
  totalAsistencias: number;
  presentes: number;
  porcentajeAsistencia: number;
};

/**
 * Service for student statistics and rankings
 *
 * Handles:
 * - Estadísticas completas
 * - Top estudiantes por puntos
 * - Estudiantes con asistencia perfecta
 * - Estudiantes sin tareas
 * - Ranking de grupos
 * - Asistencia por estudiante
 */
@Injectable()
export class DocenteEstudiantesStatsService {
  constructor(
    private prisma: PrismaService,
    private validator: DocenteBusinessValidator,
  ) {}

  /**
   * Obtiene estadísticas COMPLETAS del docente para la página de Observaciones
   * @param docenteId - ID del docente
   * @returns Estadísticas completas con rankings y métricas
   */
  async getEstadisticasCompletas(docenteId: string) {
    // Verificar que el docente exists
    await this.validator.validarDocenteExiste(docenteId);

    // Obtener todos los estudiantes del docente (de sus clases activas)
    // Usa vista unificada para incluir inscripciones manuales y via suscripción
    const inscripciones = await this.prisma.inscripcionUnificada.findMany({
      where: {
        claseGrupo: {
          docenteId: docenteId,
          activo: true,
        },
        estado: 'ACTIVA',
      },
      select: {
        estudianteId: true,
        claseGrupoId: true,
      },
    });

    // Obtener datos completos de estudiantes únicos
    const estudiantesIdsUnicos = Array.from(
      new Set(inscripciones.map((i) => i.estudianteId)),
    );

    const estudiantes = await this.prisma.estudiante.findMany({
      where: {
        id: {
          in: estudiantesIdsUnicos,
        },
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        fotoUrl: true,
      },
    });

    // Obtener datos completos de grupos
    const gruposIds = Array.from(
      new Set(inscripciones.map((i) => i.claseGrupoId)),
    );

    const grupos = await this.prisma.claseGrupo.findMany({
      where: {
        id: {
          in: gruposIds,
        },
      },
      select: {
        id: true,
        nombre: true,
        codigo: true,
      },
    });

    // Construir mapa de estudiantes con sus grupos
    const estudiantesUnicosMap = new Map<string, EstudianteConGrupos>();
    estudiantes.forEach((est) => {
      const gruposDelEstudiante = inscripciones
        .filter((i) => i.estudianteId === est.id)
        .map((i) => grupos.find((g) => g.id === i.claseGrupoId))
        .filter(
          (g): g is { id: string; nombre: string; codigo: string } =>
            g !== undefined,
        );

      estudiantesUnicosMap.set(est.id, {
        ...est,
        grupos: gruposDelEstudiante,
      });
    });

    const estudiantesUnicos: EstudianteConGrupos[] = Array.from(
      estudiantesUnicosMap.values(),
    );

    // Ejecutar cálculos en paralelo
    const [
      topEstudiantesCompleto,
      estudiantesAsistenciaPerfecta,
      rankingGrupos,
    ] = await Promise.all([
      this.calcularTopEstudiantesPorPuntos(estudiantesUnicos, estudiantes),
      this.calcularAsistenciaPerfecta(estudiantesUnicos, docenteId),
      this.calcularRankingGrupos(docenteId, inscripciones, gruposIds),
    ]);

    // Sistema de tareas no implementado - cálculo síncrono
    const estudiantesSinTareas = this.calcularEstudiantesSinTareas(
      estudiantesUnicos,
      estudiantesIdsUnicos,
    );

    return {
      topEstudiantesPorPuntos: topEstudiantesCompleto,
      estudiantesAsistenciaPerfecta,
      estudiantesSinTareas,
      rankingGruposPorPuntos: rankingGrupos,
    };
  }

  /**
   * Calcula top estudiantes por puntos con asistencia
   */
  private async calcularTopEstudiantesPorPuntos(
    estudiantesUnicos: EstudianteConGrupos[],
    estudiantes: EstudianteBasico[],
  ) {
    const puntosObtenidosRaw = await this.prisma.puntoObtenido.findMany({
      where: {
        estudianteId: {
          in: estudiantesUnicos.map((e) => e.id),
        },
      },
      select: {
        estudianteId: true,
        puntos: true,
      },
    });

    const puntosPorEstudiante = new Map<string, number>();
    puntosObtenidosRaw.forEach((punto) => {
      const currentPuntos = puntosPorEstudiante.get(punto.estudianteId) || 0;
      puntosPorEstudiante.set(punto.estudianteId, currentPuntos + punto.puntos);
    });

    const topEstudiantesPorPuntos = Array.from(puntosPorEstudiante.entries())
      .map(([estudianteId, total]) => {
        const estudiante = estudiantes.find((e) => e.id === estudianteId);
        return {
          estudianteId,
          total,
          estudiante: estudiante || {
            id: estudianteId,
            nombre: '',
            apellido: '',
            fotoUrl: null,
          },
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Combinar con asistencia
    const asistenciasPorEstudiante = await this.calcularAsistenciaPorEstudiante(
      estudiantesUnicos,
      estudiantes.map((e) => e.id),
    );

    return topEstudiantesPorPuntos.map((top) => {
      const asistenciaData = asistenciasPorEstudiante.find(
        (a) => a.estudianteId === top.estudianteId,
      );

      return {
        id: top.estudiante.id,
        nombre: top.estudiante.nombre,
        apellido: top.estudiante.apellido,
        fotoUrl: top.estudiante.fotoUrl,
        xpTotal: top.total,
        porcentajeAsistencia: asistenciaData?.porcentajeAsistencia || 0,
      };
    });
  }

  /**
   * Calcula estudiantes con asistencia perfecta (100%) y >= 3 asistencias
   *
   * OPTIMIZACIÓN N+1:
   * - ANTES: N queries (1 por estudiante)
   * - AHORA: 1 query con groupBy + agregación
   */
  private async calcularAsistenciaPerfecta(
    estudiantesUnicos: EstudianteConGrupos[],
    docenteId: string,
  ) {
    const estudiantesIds = estudiantesUnicos.map((e) => e.id);

    if (estudiantesIds.length === 0) {
      return [];
    }

    // Query 1: Obtener IDs de claseGrupo del docente
    const clasesGrupoDocente = await this.prisma.claseGrupo.findMany({
      where: { docenteId: docenteId, activo: true },
      select: { id: true },
    });
    const clasesGrupoIds = clasesGrupoDocente.map((c) => c.id);

    if (clasesGrupoIds.length === 0) {
      return [];
    }

    // Query 2: Agregación de asistencias por estudiante (1 query para todos)
    const asistenciasAgregadas = await this.prisma.asistenciaClaseGrupo.groupBy(
      {
        by: ['estudianteId', 'estado'],
        where: {
          estudianteId: { in: estudiantesIds },
          claseGrupoId: { in: clasesGrupoIds },
        },
        _count: { id: true },
      },
    );

    // Procesar agregación en memoria
    const statsMap = new Map<string, { total: number; presentes: number }>();

    asistenciasAgregadas.forEach((row) => {
      const current = statsMap.get(row.estudianteId) || {
        total: 0,
        presentes: 0,
      };
      current.total += row._count.id;
      if (row.estado === 'Presente') {
        current.presentes += row._count.id;
      }
      statsMap.set(row.estudianteId, current);
    });

    // Mapear resultados con datos de estudiantes
    const asistenciasPorEstudiante = estudiantesUnicos.map((est) => {
      const stats = statsMap.get(est.id) || { total: 0, presentes: 0 };
      const porcentaje =
        stats.total > 0 ? Math.round((stats.presentes / stats.total) * 100) : 0;

      return {
        estudianteId: est.id,
        nombre: est.nombre,
        apellido: est.apellido,
        fotoUrl: est.fotoUrl,
        grupos: est.grupos,
        totalAsistencias: stats.total,
        presentes: stats.presentes,
        porcentajeAsistencia: porcentaje,
      };
    });

    return asistenciasPorEstudiante
      .filter(
        (est) => est.porcentajeAsistencia === 100 && est.totalAsistencias >= 3,
      )
      .sort((a, b) => b.totalAsistencias - a.totalAsistencias)
      .slice(0, 10);
  }

  /**
   * Calcula estudiantes sin tareas (placeholder - sistema de tareas no implementado)
   */
  private calcularEstudiantesSinTareas(
    _estudiantesUnicos: EstudianteConGrupos[],
    _estudiantesIdsUnicos: string[],
  ): EstudianteConGrupos[] {
    // Sistema de tareas (Planificaciones) no implementado
    // Retorna array vacío hasta que se implemente el nuevo sistema
    return [];
  }

  /**
   * Calcula ranking de grupos por puntos y asistencia
   *
   * OPTIMIZACIÓN N+1:
   * - ANTES: N queries (1 por grupo para asistencias)
   * - AHORA: 1 query con groupBy para todas las asistencias
   */
  private async calcularRankingGrupos(
    docenteId: string,
    inscripciones: Array<{ estudianteId: string; claseGrupoId: string }>,
    _gruposIds: string[],
  ) {
    const gruposDelDocente = await this.prisma.claseGrupo.findMany({
      where: {
        docenteId: docenteId,
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        codigo: true,
        cupoMaximo: true,
      },
    });

    const gruposIds = gruposDelDocente.map((g) => g.id);

    if (gruposIds.length === 0) {
      return [];
    }

    // Query 1: Obtener puntos por estudiante (ya optimizado)
    const puntosObtenidosRaw = await this.prisma.puntoObtenido.findMany({
      where: {
        estudianteId: {
          in: inscripciones.map((i) => i.estudianteId),
        },
      },
      select: {
        estudianteId: true,
        puntos: true,
      },
    });

    const puntosPorEstudiante = new Map<string, number>();
    puntosObtenidosRaw.forEach((punto) => {
      const currentPuntos = puntosPorEstudiante.get(punto.estudianteId) || 0;
      puntosPorEstudiante.set(punto.estudianteId, currentPuntos + punto.puntos);
    });

    // Query 2: Agregación de asistencias por grupo (1 query para todos)
    const asistenciasAgregadas = await this.prisma.asistenciaClaseGrupo.groupBy(
      {
        by: ['claseGrupoId', 'estado'],
        where: {
          claseGrupoId: { in: gruposIds },
        },
        _count: { id: true },
      },
    );

    // Procesar agregación en memoria
    const asistenciasPorGrupo = new Map<
      string,
      { total: number; presentes: number }
    >();

    asistenciasAgregadas.forEach((row) => {
      const current = asistenciasPorGrupo.get(row.claseGrupoId) || {
        total: 0,
        presentes: 0,
      };
      current.total += row._count.id;
      if (row.estado === 'Presente') {
        current.presentes += row._count.id;
      }
      asistenciasPorGrupo.set(row.claseGrupoId, current);
    });

    // Obtener inscripciones por grupo
    const inscripcionesPorGrupo = new Map<string, string[]>();
    inscripciones.forEach((insc) => {
      if (!inscripcionesPorGrupo.has(insc.claseGrupoId)) {
        inscripcionesPorGrupo.set(insc.claseGrupoId, []);
      }
      inscripcionesPorGrupo.get(insc.claseGrupoId)!.push(insc.estudianteId);
    });

    // Mapear resultados (sin queries adicionales)
    const rankingGrupos = gruposDelDocente.map((grupo) => {
      const estudiantesIdsGrupo = inscripcionesPorGrupo.get(grupo.id) || [];

      // Sumar puntos totales del grupo (en memoria)
      let puntosGrupoTotal = 0;
      estudiantesIdsGrupo.forEach((estId) => {
        puntosGrupoTotal += puntosPorEstudiante.get(estId) || 0;
      });

      // Obtener asistencia del grupo (desde agregación)
      const asistenciasGrupo = asistenciasPorGrupo.get(grupo.id) || {
        total: 0,
        presentes: 0,
      };
      const porcentajeAsistenciaGrupo =
        asistenciasGrupo.total > 0
          ? Math.round(
              (asistenciasGrupo.presentes / asistenciasGrupo.total) * 100,
            )
          : 0;

      return {
        grupoId: grupo.id,
        nombre: grupo.nombre,
        codigo: grupo.codigo,
        estudiantesActivos: estudiantesIdsGrupo.length,
        cupoMaximo: grupo.cupoMaximo,
        xpTotal: puntosGrupoTotal,
        asistenciaPromedio: porcentajeAsistenciaGrupo,
      };
    });

    // Ordenar grupos por XP total
    rankingGrupos.sort((a, b) => b.xpTotal - a.xpTotal);

    return rankingGrupos;
  }

  /**
   * Calcula asistencia por estudiante
   *
   * OPTIMIZACIÓN N+1:
   * - ANTES: N queries (1 por estudiante)
   * - AHORA: 1 query con groupBy para todas las asistencias
   */
  private async calcularAsistenciaPorEstudiante(
    estudiantesUnicos: EstudianteConGrupos[],
    _estudiantesIds: string[],
  ): Promise<AsistenciaEstudiante[]> {
    const estudiantesIds = estudiantesUnicos.map((e) => e.id);

    if (estudiantesIds.length === 0) {
      return [];
    }

    // Query 1: Agregación de asistencias por estudiante (1 query para todos)
    const asistenciasAgregadas = await this.prisma.asistenciaClaseGrupo.groupBy(
      {
        by: ['estudianteId', 'estado'],
        where: {
          estudianteId: { in: estudiantesIds },
        },
        _count: { id: true },
      },
    );

    // Procesar agregación en memoria
    const statsMap = new Map<string, { total: number; presentes: number }>();

    asistenciasAgregadas.forEach((row) => {
      const current = statsMap.get(row.estudianteId) || {
        total: 0,
        presentes: 0,
      };
      current.total += row._count.id;
      if (row.estado === 'Presente') {
        current.presentes += row._count.id;
      }
      statsMap.set(row.estudianteId, current);
    });

    // Mapear resultados con datos de estudiantes (sin queries adicionales)
    return estudiantesUnicos.map((est) => {
      const stats = statsMap.get(est.id) || { total: 0, presentes: 0 };
      const porcentaje =
        stats.total > 0 ? Math.round((stats.presentes / stats.total) * 100) : 0;

      return {
        estudianteId: est.id,
        nombre: est.nombre,
        apellido: est.apellido,
        fotoUrl: est.fotoUrl,
        grupos: est.grupos,
        totalAsistencias: stats.total,
        presentes: stats.presentes,
        porcentajeAsistencia: porcentaje,
      };
    });
  }
}
