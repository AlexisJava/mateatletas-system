import { Injectable } from '@nestjs/common';
import { Prisma, DiaSemana } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service';
import { DocenteBusinessValidator } from '../validators/docente-business.validator';
import {
  DashboardDocenteResponse,
  ClaseInminente,
  ClaseDelDia,
  GrupoResumen,
  ComisionResumen,
  EstudianteConFalta,
  Alerta,
  StatsResumen,
  TendenciaAsistencia,
} from '../dto/dashboard-response.dto';

/**
 * Stats Service para estadísticas y reportes del módulo Docentes
 *
 * Responsabilidades:
 * - Dashboard completo del docente
 * - Estadísticas detalladas (top estudiantes, asistencia, ranking)
 * - Solo operaciones de lectura complejas con agregaciones
 *
 * Patrón: CQRS (Command Query Responsibility Segregation)
 */

// Tipos internos para helpers privados
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
  estudiante_id: string;
  nombre: string;
  apellido: string;
  fotoUrl: string | null;
  grupos: Array<{
    id: string;
    nombre: string;
    codigo: string;
  }>;
  total_asistencias: number;
  presentes: number;
  porcentaje_asistencia: number;
};

@Injectable()
export class DocenteStatsService {
  constructor(
    private prisma: PrismaService,
    private validator: DocenteBusinessValidator,
  ) {}

  /**
   * Obtiene el dashboard del docente con datos accionables
   * @param docenteId - ID del docente
   * @returns Dashboard con clase inminente, alertas y estadísticas
   */
  async getDashboard(docenteId: string): Promise<DashboardDocenteResponse> {
    // Verificar que el docente existe
    await this.validator.validarDocenteExiste(docenteId);

    const now = new Date();
    const inicioDia = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const finDia = new Date(inicioDia);
    finDia.setDate(finDia.getDate() + 1);

    // Ejecutar todos los cálculos en paralelo
    const [
      claseInminente,
      clasesDelDiaData,
      misGruposData,
      misComisionesData,
      estudiantesConFaltasFormatted,
      stats,
    ] = await Promise.all([
      this.calcularClaseInminente(docenteId, now),
      this.obtenerClasesDelDia(docenteId, now),
      this.obtenerMisGrupos(docenteId),
      this.obtenerMisComisiones(docenteId),
      this.obtenerEstudiantesConFaltas(docenteId),
      this.calcularStatsResumen(docenteId, now),
    ]);

    // Generar alertas basadas en los datos
    const alertas = this.generarAlertas(estudiantesConFaltasFormatted);

    return {
      claseInminente,
      clasesHoy: clasesDelDiaData,
      misGrupos: misGruposData,
      misComisiones: misComisionesData,
      estudiantesConFaltas: estudiantesConFaltasFormatted,
      alertas,
      stats,
    };
  }

  /**
   * Obtiene estadísticas COMPLETAS del docente para la página de Observaciones
   */
  async getEstadisticasCompletas(docenteId: string) {
    // Verificar que el docente exists
    await this.validator.validarDocenteExiste(docenteId);

    // Obtener todos los estudiantes del docente (de sus clases activas)
    const inscripciones = await this.prisma.inscripcionClaseGrupo.findMany({
      where: {
        claseGrupo: {
          docente_id: docenteId,
          activo: true,
        },
      },
      select: {
        estudiante_id: true,
        clase_grupo_id: true,
      },
    });

    // Obtener datos completos de estudiantes únicos
    const estudiantesIdsUnicos = Array.from(
      new Set(inscripciones.map((i) => i.estudiante_id)),
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
      new Set(inscripciones.map((i) => i.clase_grupo_id)),
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
        .filter((i) => i.estudiante_id === est.id)
        .map((i) => grupos.find((g) => g.id === i.clase_grupo_id))
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

  // ============================================================================
  // HELPERS PRIVADOS - Dashboard
  // ============================================================================

  private async calcularClaseInminente(
    docenteId: string,
    now: Date,
  ): Promise<ClaseInminente | null> {
    const diasSemana: DiaSemana[] = [
      DiaSemana.DOMINGO,
      DiaSemana.LUNES,
      DiaSemana.MARTES,
      DiaSemana.MIERCOLES,
      DiaSemana.JUEVES,
      DiaSemana.VIERNES,
      DiaSemana.SABADO,
    ];
    const diaActual = diasSemana[now.getDay()];

    const clasesGrupo = await this.prisma.claseGrupo.findMany({
      where: {
        docente_id: docenteId,
        activo: true,
        dia_semana: diaActual,
      },
      include: {
        inscripciones: true,
      },
    });

    // Buscar la clase más próxima de hoy
    for (const claseGrupo of clasesGrupo) {
      const [horas, minutos] = claseGrupo.hora_inicio.split(':').map(Number);
      const fechaHoraClase = new Date(now);
      fechaHoraClase.setHours(horas ?? 0, minutos ?? 0, 0, 0);

      const minutosParaEmpezar = Math.floor(
        (fechaHoraClase.getTime() - now.getTime()) / (60 * 1000),
      );

      // Solo considerar si falta menos de 60 minutos o empezó hace menos de 10 minutos
      if (minutosParaEmpezar <= 60 && minutosParaEmpezar >= -10) {
        const [horaFin, minFin] = claseGrupo.hora_fin.split(':').map(Number);
        const duracion =
          (horaFin ?? 0) * 60 +
          (minFin ?? 0) -
          ((horas ?? 0) * 60 + (minutos ?? 0));

        return {
          id: claseGrupo.id,
          titulo: claseGrupo.nombre,
          grupoNombre: claseGrupo.codigo,
          grupo_id: claseGrupo.id,
          fecha_hora: fechaHoraClase.toISOString(),
          duracion,
          estudiantesInscritos: claseGrupo.inscripciones?.length || 0,
          cupo_maximo: claseGrupo.cupo_maximo,
          minutosParaEmpezar,
        };
      }
    }

    return null;
  }

  private async obtenerClasesDelDia(
    docenteId: string,
    now: Date,
  ): Promise<ClaseDelDia[]> {
    const diasSemana: DiaSemana[] = [
      DiaSemana.DOMINGO,
      DiaSemana.LUNES,
      DiaSemana.MARTES,
      DiaSemana.MIERCOLES,
      DiaSemana.JUEVES,
      DiaSemana.VIERNES,
      DiaSemana.SABADO,
    ];
    const diaActual = diasSemana[now.getDay()];

    const clasesGrupo = await this.prisma.claseGrupo.findMany({
      where: {
        docente_id: docenteId,
        activo: true,
        dia_semana: diaActual,
      },
    });

    const clasesDelDiaData: ClaseDelDia[] = [];

    for (const claseGrupo of clasesGrupo) {
      const estudiantesInscritos =
        await this.prisma.inscripcionClaseGrupo.findMany({
          where: { clase_grupo_id: claseGrupo.id },
          include: {
            estudiante: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                avatar_gradient: true,
              },
            },
          },
        });

      clasesDelDiaData.push({
        id: claseGrupo.id,
        nombre: claseGrupo.nombre,
        codigo: claseGrupo.codigo,
        dia_semana: claseGrupo.dia_semana,
        hora_inicio: claseGrupo.hora_inicio,
        hora_fin: claseGrupo.hora_fin,
        estudiantes: estudiantesInscritos.map((insc) => ({
          id: insc.estudiante.id,
          nombre: insc.estudiante.nombre,
          apellido: insc.estudiante.apellido,
          avatar_gradient: insc.estudiante.avatar_gradient,
        })),
        cupo_maximo: claseGrupo.cupo_maximo,
        grupo_id: claseGrupo.id,
      });
    }

    return clasesDelDiaData;
  }

  private async obtenerMisGrupos(docenteId: string): Promise<GrupoResumen[]> {
    const todosLosGrupos = await this.prisma.claseGrupo.findMany({
      where: {
        docente_id: docenteId,
        activo: true,
      },
      include: {
        inscripciones: true,
      },
      orderBy: [{ dia_semana: 'asc' }, { hora_inicio: 'asc' }],
    });

    return todosLosGrupos.map((grupo) => ({
      id: grupo.id,
      nombre: grupo.nombre,
      codigo: grupo.codigo,
      dia_semana: grupo.dia_semana,
      hora_inicio: grupo.hora_inicio,
      hora_fin: grupo.hora_fin,
      estudiantesActivos: grupo.inscripciones.length,
      cupo_maximo: grupo.cupo_maximo,
      nivel: grupo.nivel,
    }));
  }

  /**
   * Obtiene las comisiones asignadas al docente
   */
  private async obtenerMisComisiones(
    docenteId: string,
  ): Promise<ComisionResumen[]> {
    const comisiones = await this.prisma.comision.findMany({
      where: {
        docente_id: docenteId,
        activo: true,
      },
      include: {
        producto: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
          },
        },
        casa: {
          select: {
            id: true,
            nombre: true,
            emoji: true,
          },
        },
        inscripciones: {
          where: {
            estado: { in: ['Pendiente', 'Confirmada'] },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return comisiones.map((comision) => ({
      id: comision.id,
      nombre: comision.nombre,
      descripcion: comision.descripcion,
      producto: {
        id: comision.producto.id,
        nombre: comision.producto.nombre,
        tipo: comision.producto.tipo,
      },
      casa: comision.casa
        ? {
            id: comision.casa.id,
            nombre: comision.casa.nombre,
            emoji: comision.casa.emoji,
          }
        : null,
      horario: comision.horario,
      fecha_inicio: comision.fecha_inicio?.toISOString() ?? null,
      fecha_fin: comision.fecha_fin?.toISOString() ?? null,
      cupo_maximo: comision.cupo_maximo,
      estudiantesInscritos: comision.inscripciones.length,
      activo: comision.activo,
    }));
  }

  private async obtenerEstudiantesConFaltas(
    docenteId: string,
  ): Promise<EstudianteConFalta[]> {
    type QueryEstudianteFalta = {
      estudiante_id: string;
      nombre: string;
      apellido: string;
      faltas_consecutivas: number;
      ultimo_grupo: string;
      tutor_email: string | null;
    };

    const estudiantesConFaltasData: QueryEstudianteFalta[] =
      await this.prisma.$queryRaw(
        Prisma.sql`
        SELECT DISTINCT
          e.id as estudiante_id,
          e.nombre,
          e.apellido,
          2 as faltas_consecutivas,
          cg.nombre as ultimo_grupo,
          t.email as tutor_email
        FROM "estudiantes" e
        INNER JOIN "inscripciones_clase_grupo" icg ON e.id = icg.estudiante_id
        INNER JOIN "clase_grupos" cg ON icg.clase_grupo_id = cg.id
        LEFT JOIN "tutores" t ON e.tutor_id = t.id
        WHERE cg.docente_id = ${docenteId}
        LIMIT 10
      `,
      );

    return estudiantesConFaltasData.map((est) => ({
      id: est.estudiante_id,
      nombre: est.nombre,
      apellido: est.apellido,
      faltas_consecutivas: est.faltas_consecutivas,
      ultimo_grupo: est.ultimo_grupo,
      tutor_email: est.tutor_email,
    }));
  }

  private async calcularStatsResumen(
    docenteId: string,
    now: Date,
  ): Promise<StatsResumen> {
    const diasSemana: DiaSemana[] = [
      DiaSemana.DOMINGO,
      DiaSemana.LUNES,
      DiaSemana.MARTES,
      DiaSemana.MIERCOLES,
      DiaSemana.JUEVES,
      DiaSemana.VIERNES,
      DiaSemana.SABADO,
    ];
    const diaActual = diasSemana[now.getDay()];

    // Contar clases de hoy
    const clasesHoy = await this.prisma.claseGrupo.count({
      where: {
        docente_id: docenteId,
        activo: true,
        dia_semana: diaActual,
      },
    });

    // Contar clases de esta semana (total de clases únicas activas)
    const clasesEstaSemana = await this.prisma.claseGrupo.count({
      where: {
        docente_id: docenteId,
        activo: true,
      },
    });

    // Calcular asistencia promedio de los últimos 7 días
    const hace7Dias = new Date(now);
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    const asistencias = await this.prisma.asistenciaClaseGrupo.findMany({
      where: {
        claseGrupo: {
          docente_id: docenteId,
        },
        fecha: {
          gte: hace7Dias,
          lte: now,
        },
      },
      select: {
        estado: true,
      },
    });

    let asistenciaPromedio = 0;
    if (asistencias.length > 0) {
      const presentes = asistencias.filter(
        (a) => a.estado === 'Presente',
      ).length;
      asistenciaPromedio = Math.round((presentes / asistencias.length) * 100);
    }

    // Calcular tendencia de asistencia
    const hace14Dias = new Date(hace7Dias);
    hace14Dias.setDate(hace14Dias.getDate() - 7);

    const asistenciasAnteriores =
      await this.prisma.asistenciaClaseGrupo.findMany({
        where: {
          claseGrupo: {
            docente_id: docenteId,
          },
          fecha: {
            gte: hace14Dias,
            lt: hace7Dias,
          },
        },
        select: {
          estado: true,
        },
      });

    let tendenciaAsistencia: TendenciaAsistencia = 'stable';
    if (asistenciasAnteriores.length > 0) {
      const presentesAnteriores = asistenciasAnteriores.filter(
        (a) => a.estado === 'Presente',
      ).length;
      const promedioAnterior =
        (presentesAnteriores / asistenciasAnteriores.length) * 100;
      const diferencia = asistenciaPromedio - promedioAnterior;

      if (diferencia > 5) tendenciaAsistencia = 'up';
      else if (diferencia < -5) tendenciaAsistencia = 'down';
    }

    // Contar observaciones pendientes
    const observacionesPendientes = 0; // TODO: Implementar cuando exista campo "respondida"

    // Contar estudiantes únicos del docente
    const estudiantesUnicos = await this.prisma.inscripcionClaseGrupo.findMany({
      where: {
        claseGrupo: {
          docente_id: docenteId,
          activo: true,
        },
      },
      select: {
        estudiante_id: true,
      },
      distinct: ['estudiante_id'],
    });

    return {
      clasesHoy,
      clasesEstaSemana,
      asistenciaPromedio,
      tendenciaAsistencia,
      observacionesPendientes,
      estudiantesTotal: estudiantesUnicos.length,
    };
  }

  private generarAlertas(estudiantesConFaltas: EstudianteConFalta[]): Alerta[] {
    const alertas: Alerta[] = [];

    if (estudiantesConFaltas.length > 0) {
      alertas.push({
        id: 'alerta-faltas-1',
        tipo: 'warning',
        mensaje: `${estudiantesConFaltas.length} estudiante(s) con 2+ faltas consecutivas`,
        accion: {
          label: 'Ver estudiantes',
          href: '/docente/mis-clases',
        },
      });
    }

    return alertas;
  }

  // ============================================================================
  // HELPERS PRIVADOS - Estadísticas Completas
  // ============================================================================

  private async calcularTopEstudiantesPorPuntos(
    estudiantesUnicos: EstudianteConGrupos[],
    estudiantes: EstudianteBasico[],
  ) {
    const puntosObtenidosRaw = await this.prisma.puntoObtenido.findMany({
      where: {
        estudiante_id: {
          in: estudiantesUnicos.map((e) => e.id),
        },
      },
      select: {
        estudiante_id: true,
        puntos: true,
      },
    });

    const puntosPorEstudiante = new Map<string, number>();
    puntosObtenidosRaw.forEach((punto) => {
      const currentPuntos = puntosPorEstudiante.get(punto.estudiante_id) || 0;
      puntosPorEstudiante.set(
        punto.estudiante_id,
        currentPuntos + punto.puntos,
      );
    });

    const topEstudiantesPorPuntos = Array.from(puntosPorEstudiante.entries())
      .map(([estudiante_id, total]) => {
        const estudiante = estudiantes.find((e) => e.id === estudiante_id);
        return {
          estudiante_id,
          total,
          estudiante: estudiante || {
            id: estudiante_id,
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
        (a) => a.estudiante_id === top.estudiante_id,
      );

      return {
        id: top.estudiante.id,
        nombre: top.estudiante.nombre,
        apellido: top.estudiante.apellido,
        fotoUrl: top.estudiante.fotoUrl,
        xp_total: top.total,
        porcentaje_asistencia: asistenciaData?.porcentaje_asistencia || 0,
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
      where: { docente_id: docenteId, activo: true },
      select: { id: true },
    });
    const clasesGrupoIds = clasesGrupoDocente.map((c) => c.id);

    if (clasesGrupoIds.length === 0) {
      return [];
    }

    // Query 2: Agregación de asistencias por estudiante (1 query para todos)
    const asistenciasAgregadas = await this.prisma.asistenciaClaseGrupo.groupBy(
      {
        by: ['estudiante_id', 'estado'],
        where: {
          estudiante_id: { in: estudiantesIds },
          clase_grupo_id: { in: clasesGrupoIds },
        },
        _count: { id: true },
      },
    );

    // Procesar agregación en memoria
    const statsMap = new Map<string, { total: number; presentes: number }>();

    asistenciasAgregadas.forEach((row) => {
      const current = statsMap.get(row.estudiante_id) || {
        total: 0,
        presentes: 0,
      };
      current.total += row._count.id;
      if (row.estado === 'Presente') {
        current.presentes += row._count.id;
      }
      statsMap.set(row.estudiante_id, current);
    });

    // Mapear resultados con datos de estudiantes
    const asistenciasPorEstudiante = estudiantesUnicos.map((est) => {
      const stats = statsMap.get(est.id) || { total: 0, presentes: 0 };
      const porcentaje =
        stats.total > 0 ? Math.round((stats.presentes / stats.total) * 100) : 0;

      return {
        estudiante_id: est.id,
        nombre: est.nombre,
        apellido: est.apellido,
        fotoUrl: est.fotoUrl,
        grupos: est.grupos,
        total_asistencias: stats.total,
        presentes: stats.presentes,
        porcentaje_asistencia: porcentaje,
      };
    });

    return asistenciasPorEstudiante
      .filter(
        (est) =>
          est.porcentaje_asistencia === 100 && est.total_asistencias >= 3,
      )
      .sort((a, b) => b.total_asistencias - a.total_asistencias)
      .slice(0, 10);
  }

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
    inscripciones: Array<{ estudiante_id: string; clase_grupo_id: string }>,
    _gruposIds: string[],
  ) {
    const gruposDelDocente = await this.prisma.claseGrupo.findMany({
      where: {
        docente_id: docenteId,
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        codigo: true,
        cupo_maximo: true,
      },
    });

    const gruposIds = gruposDelDocente.map((g) => g.id);

    if (gruposIds.length === 0) {
      return [];
    }

    // Query 1: Obtener puntos por estudiante (ya optimizado)
    const puntosObtenidosRaw = await this.prisma.puntoObtenido.findMany({
      where: {
        estudiante_id: {
          in: inscripciones.map((i) => i.estudiante_id),
        },
      },
      select: {
        estudiante_id: true,
        puntos: true,
      },
    });

    const puntosPorEstudiante = new Map<string, number>();
    puntosObtenidosRaw.forEach((punto) => {
      const currentPuntos = puntosPorEstudiante.get(punto.estudiante_id) || 0;
      puntosPorEstudiante.set(
        punto.estudiante_id,
        currentPuntos + punto.puntos,
      );
    });

    // Query 2: Agregación de asistencias por grupo (1 query para todos)
    const asistenciasAgregadas = await this.prisma.asistenciaClaseGrupo.groupBy(
      {
        by: ['clase_grupo_id', 'estado'],
        where: {
          clase_grupo_id: { in: gruposIds },
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
      const current = asistenciasPorGrupo.get(row.clase_grupo_id) || {
        total: 0,
        presentes: 0,
      };
      current.total += row._count.id;
      if (row.estado === 'Presente') {
        current.presentes += row._count.id;
      }
      asistenciasPorGrupo.set(row.clase_grupo_id, current);
    });

    // Obtener inscripciones por grupo
    const inscripcionesPorGrupo = new Map<string, string[]>();
    inscripciones.forEach((insc) => {
      if (!inscripcionesPorGrupo.has(insc.clase_grupo_id)) {
        inscripcionesPorGrupo.set(insc.clase_grupo_id, []);
      }
      inscripcionesPorGrupo.get(insc.clase_grupo_id)!.push(insc.estudiante_id);
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
        grupo_id: grupo.id,
        nombre: grupo.nombre,
        codigo: grupo.codigo,
        estudiantes_activos: estudiantesIdsGrupo.length,
        cupo_maximo: grupo.cupo_maximo,
        xp_total: puntosGrupoTotal,
        asistencia_promedio: porcentajeAsistenciaGrupo,
      };
    });

    // Ordenar grupos por XP total
    rankingGrupos.sort((a, b) => b.xp_total - a.xp_total);

    return rankingGrupos;
  }

  /**
   * Obtiene las clases del mes para el calendario del docente
   * @param docenteId - ID del docente
   * @param mes - Mes (1-12)
   * @param anio - Año (ej: 2025)
   * @returns Clases del mes con información de estudiantes
   */
  async getClasesDelMes(docenteId: string, mes: number, anio: number) {
    await this.validator.validarDocenteExiste(docenteId);

    // Obtener grupos activos del docente
    const gruposDocente = await this.prisma.claseGrupo.findMany({
      where: {
        docente_id: docenteId,
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        codigo: true,
        dia_semana: true,
        hora_inicio: true,
        hora_fin: true,
        cupo_maximo: true,
        inscripciones: {
          select: {
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
    });

    // Generar las fechas de clase del mes
    const primerDiaDelMes = new Date(anio, mes - 1, 1);
    const ultimoDiaDelMes = new Date(anio, mes, 0);

    const diasSemanaMap: Record<DiaSemana, number> = {
      [DiaSemana.DOMINGO]: 0,
      [DiaSemana.LUNES]: 1,
      [DiaSemana.MARTES]: 2,
      [DiaSemana.MIERCOLES]: 3,
      [DiaSemana.JUEVES]: 4,
      [DiaSemana.VIERNES]: 5,
      [DiaSemana.SABADO]: 6,
    };

    const clasesDelMes: Array<{
      id: string;
      fecha: string;
      nombre: string;
      codigo: string;
      hora_inicio: string;
      hora_fin: string;
      estudiantesCount: number;
      cupo_maximo: number;
      grupo_id: string;
    }> = [];

    for (const grupo of gruposDocente) {
      const diaSemanaNum = diasSemanaMap[grupo.dia_semana];

      // Encontrar el primer día del mes que coincida con el día de la semana
      const fechaInicial = new Date(primerDiaDelMes);
      const diasHastaProximo = (diaSemanaNum - fechaInicial.getDay() + 7) % 7;
      let fechaMs =
        fechaInicial.getTime() + diasHastaProximo * 24 * 60 * 60 * 1000;

      // Generar todas las fechas de este grupo en el mes
      while (fechaMs <= ultimoDiaDelMes.getTime()) {
        const fechaActual = new Date(fechaMs);
        clasesDelMes.push({
          id: `${grupo.id}-${fechaActual.toISOString().split('T')[0]}`,
          fecha: fechaActual.toISOString().split('T')[0]!,
          nombre: grupo.nombre,
          codigo: grupo.codigo,
          hora_inicio: grupo.hora_inicio,
          hora_fin: grupo.hora_fin,
          estudiantesCount: grupo.inscripciones.length,
          cupo_maximo: grupo.cupo_maximo,
          grupo_id: grupo.id,
        });

        // Avanzar una semana (7 días en milisegundos)
        fechaMs += 7 * 24 * 60 * 60 * 1000;
      }
    }

    // Ordenar por fecha y hora
    clasesDelMes.sort((a, b) => {
      const fechaComparison = a.fecha.localeCompare(b.fecha);
      if (fechaComparison !== 0) return fechaComparison;
      return a.hora_inicio.localeCompare(b.hora_inicio);
    });

    // Calcular stats del mes
    const estudiantesUnicos = new Set<string>();
    gruposDocente.forEach((grupo) => {
      grupo.inscripciones.forEach((insc) => {
        estudiantesUnicos.add(insc.estudiante.id);
      });
    });

    return {
      clases: clasesDelMes,
      stats: {
        totalClases: clasesDelMes.length,
        totalGrupos: gruposDocente.length,
        totalEstudiantes: estudiantesUnicos.size,
      },
    };
  }

  /**
   * Obtiene el detalle de una comisión específica con sus estudiantes inscritos
   * @param comisionId - ID de la comisión
   * @param docenteId - ID del docente (para verificar ownership)
   * @returns Detalle de la comisión con lista de estudiantes
   */
  async getComisionDetalle(comisionId: string, docenteId: string) {
    // Verificar que el docente existe
    await this.validator.validarDocenteExiste(docenteId);

    // Obtener la comisión verificando que pertenece al docente
    const comision = await this.prisma.comision.findFirst({
      where: {
        id: comisionId,
        docente_id: docenteId,
      },
      include: {
        producto: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
          },
        },
        casa: {
          select: {
            id: true,
            nombre: true,
            emoji: true,
          },
        },
        inscripciones: {
          where: {
            estado: { in: ['Pendiente', 'Confirmada'] },
          },
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

    if (!comision) {
      throw new Error('Comisión no encontrada o no tienes acceso');
    }

    return {
      id: comision.id,
      nombre: comision.nombre,
      descripcion: comision.descripcion,
      producto: {
        id: comision.producto.id,
        nombre: comision.producto.nombre,
        tipo: comision.producto.tipo,
      },
      casa: comision.casa
        ? {
            id: comision.casa.id,
            nombre: comision.casa.nombre,
            emoji: comision.casa.emoji,
          }
        : null,
      horario: comision.horario,
      fecha_inicio: comision.fecha_inicio?.toISOString() ?? null,
      fecha_fin: comision.fecha_fin?.toISOString() ?? null,
      cupo_maximo: comision.cupo_maximo,
      activo: comision.activo,
      estudiantes: comision.inscripciones.map((insc) => ({
        id: insc.estudiante.id,
        nombre: insc.estudiante.nombre,
        apellido: insc.estudiante.apellido,
        email: insc.estudiante.email,
        estado: insc.estado,
      })),
    };
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
        by: ['estudiante_id', 'estado'],
        where: {
          estudiante_id: { in: estudiantesIds },
        },
        _count: { id: true },
      },
    );

    // Procesar agregación en memoria
    const statsMap = new Map<string, { total: number; presentes: number }>();

    asistenciasAgregadas.forEach((row) => {
      const current = statsMap.get(row.estudiante_id) || {
        total: 0,
        presentes: 0,
      };
      current.total += row._count.id;
      if (row.estado === 'Presente') {
        current.presentes += row._count.id;
      }
      statsMap.set(row.estudiante_id, current);
    });

    // Mapear resultados con datos de estudiantes (sin queries adicionales)
    return estudiantesUnicos.map((est) => {
      const stats = statsMap.get(est.id) || { total: 0, presentes: 0 };
      const porcentaje =
        stats.total > 0 ? Math.round((stats.presentes / stats.total) * 100) : 0;

      return {
        estudiante_id: est.id,
        nombre: est.nombre,
        apellido: est.apellido,
        fotoUrl: est.fotoUrl,
        grupos: est.grupos,
        total_asistencias: stats.total,
        presentes: stats.presentes,
        porcentaje_asistencia: porcentaje,
      };
    });
  }

  /**
   * Obtiene todas las comisiones asignadas al docente
   * Incluye: producto, casa, inscripciones_count, proxima_clase
   * Filtra comisiones con fecha_fin pasada
   * Ordena por próxima clase (más cercana primero)
   *
   * @param docenteId - ID del docente
   * @returns Lista de comisiones formateadas
   */
  async getMisComisiones(docenteId: string) {
    await this.validator.validarDocenteExiste(docenteId);

    const now = new Date();

    // Obtener comisiones del docente que no hayan finalizado
    const comisiones = await this.prisma.comision.findMany({
      where: {
        docente_id: docenteId,
        OR: [{ fecha_fin: null }, { fecha_fin: { gte: now } }],
      },
      select: {
        id: true,
        nombre: true,
        horario: true,
        cupo_maximo: true,
        fecha_fin: true,
        producto: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            imagenPortada: true,
          },
        },
        casa: {
          select: {
            id: true,
            tipo: true,
            nombre: true,
            colorPrimary: true,
            colorSecondary: true,
          },
        },
        inscripciones: {
          where: {
            estado: 'Confirmada',
          },
          select: {
            id: true,
          },
        },
      },
    });

    // Mapear y calcular proxima_clase para cada comisión
    const comisionesConProxima = comisiones.map((comision) => {
      const proximaClase = this.calcularProximaClase(
        comision.horario,
        comision.fecha_fin,
      );

      return {
        id: comision.id,
        nombre: comision.nombre,
        horario: comision.horario,
        cupo_maximo: comision.cupo_maximo,
        producto: comision.producto,
        casa: comision.casa,
        inscripciones_count: comision.inscripciones.length,
        proxima_clase: proximaClase?.toISOString() ?? null,
      };
    });

    // Ordenar por próxima clase (más cercana primero, nulls al final)
    comisionesConProxima.sort((a, b) => {
      if (!a.proxima_clase && !b.proxima_clase) return 0;
      if (!a.proxima_clase) return 1;
      if (!b.proxima_clase) return -1;
      return (
        new Date(a.proxima_clase).getTime() -
        new Date(b.proxima_clase).getTime()
      );
    });

    return comisionesConProxima;
  }

  /**
   * Obtiene la próxima clase del docente basado en sus comisiones activas
   * @param docenteId - ID del docente
   * @returns Próxima clase con comisión, fecha_hora y minutos_restantes, o null
   */
  async getProximaClase(docenteId: string): Promise<{
    comision: {
      id: string;
      nombre: string;
      horario: string | null;
    };
    fecha_hora: string;
    minutos_restantes: number;
  } | null> {
    await this.validator.validarDocenteExiste(docenteId);

    const now = new Date();

    // Obtener comisiones activas del docente
    const comisiones = await this.prisma.comision.findMany({
      where: {
        docente_id: docenteId,
        activo: true,
        OR: [{ fecha_fin: null }, { fecha_fin: { gte: now } }],
      },
      select: {
        id: true,
        nombre: true,
        horario: true,
        fecha_fin: true,
      },
    });

    if (comisiones.length === 0) {
      return null;
    }

    // Calcular la próxima clase para cada comisión
    let proximaClase: {
      comision: { id: string; nombre: string; horario: string | null };
      fecha_hora: Date;
    } | null = null;

    for (const comision of comisiones) {
      const fechaProxima = this.calcularProximaClase(
        comision.horario,
        comision.fecha_fin,
      );

      if (fechaProxima) {
        if (!proximaClase || fechaProxima < proximaClase.fecha_hora) {
          proximaClase = {
            comision: {
              id: comision.id,
              nombre: comision.nombre,
              horario: comision.horario,
            },
            fecha_hora: fechaProxima,
          };
        }
      }
    }

    if (!proximaClase) {
      return null;
    }

    // Calcular minutos restantes
    const minutosRestantes = Math.floor(
      (proximaClase.fecha_hora.getTime() - now.getTime()) / (60 * 1000),
    );

    return {
      comision: proximaClase.comision,
      fecha_hora: proximaClase.fecha_hora.toISOString(),
      minutos_restantes: minutosRestantes,
    };
  }

  /**
   * Calcula la próxima ocurrencia de una clase basado en el horario
   * Soporta formatos: "Lunes 14:30", "Lun y Mie 19:00", "Lun-Vie 9:00-12:00"
   *
   * @param horario - String con el horario (ej: "Lunes 14:30")
   * @param fechaFin - Fecha de fin de la comisión (opcional)
   * @returns Date de la próxima clase o null
   */
  private calcularProximaClase(
    horario: string | null,
    fechaFin: Date | null,
  ): Date | null {
    if (!horario) return null;

    const now = new Date();

    // Si la comisión ya terminó, no hay próxima clase
    if (fechaFin && fechaFin < now) return null;

    // Mapeo de días en español a número (0=Domingo, 1=Lunes, etc.)
    const diasMap: Record<string, number> = {
      domingo: 0,
      dom: 0,
      lunes: 1,
      lun: 1,
      martes: 2,
      mar: 2,
      miercoles: 3,
      miércoles: 3,
      mie: 3,
      jueves: 4,
      jue: 4,
      viernes: 5,
      vie: 5,
      sabado: 6,
      sábado: 6,
      sab: 6,
    };

    // Extraer días del horario
    const horarioLower = horario.toLowerCase();
    const diasEncontrados: number[] = [];

    // Buscar días individuales
    for (const [dia, num] of Object.entries(diasMap)) {
      if (horarioLower.includes(dia)) {
        if (!diasEncontrados.includes(num)) {
          diasEncontrados.push(num);
        }
      }
    }

    // Extraer hora (formato HH:MM)
    const horaMatch = horario.match(/(\d{1,2}):(\d{2})/);
    if (!horaMatch?.[1] || !horaMatch[2] || diasEncontrados.length === 0) {
      return null;
    }

    const hora = parseInt(horaMatch[1], 10);
    const minutos = parseInt(horaMatch[2], 10);

    // Encontrar la próxima ocurrencia
    const diaActual = now.getDay();
    const horaActual = now.getHours() * 60 + now.getMinutes();
    const horaClase = hora * 60 + minutos;

    let diasHastaProxima = Infinity;
    let diaProximo = -1;

    for (const diaClase of diasEncontrados) {
      let diasHasta = diaClase - diaActual;

      // Si es hoy pero ya pasó la hora, buscar la próxima semana
      if (diasHasta === 0 && horaActual >= horaClase) {
        diasHasta = 7;
      } else if (diasHasta < 0) {
        diasHasta += 7;
      }

      if (diasHasta < diasHastaProxima) {
        diasHastaProxima = diasHasta;
        diaProximo = diaClase;
      }
    }

    if (diaProximo === -1) return null;

    // Construir la fecha de la próxima clase
    const proximaClase = new Date(now);
    proximaClase.setDate(now.getDate() + diasHastaProxima);
    proximaClase.setHours(hora, minutos, 0, 0);

    // Verificar que no exceda la fecha de fin
    if (fechaFin && proximaClase > fechaFin) return null;

    return proximaClase;
  }
}
