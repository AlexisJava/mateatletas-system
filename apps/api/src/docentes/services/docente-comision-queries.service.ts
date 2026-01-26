import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
// PRISMA INCLUDES - Definidos con satisfies para type-safety
// ============================================================================

const estudianteInclude = {
  tutor: true,
  casa: true,
  recursos: true,
  racha: true,
} satisfies Prisma.EstudianteInclude;

const inscripcionManualInclude = {
  estudiante: { include: estudianteInclude },
} satisfies Prisma.InscripcionComisionInclude;

const inscripcionSuscripcionInclude = {
  estudiante: { include: estudianteInclude },
  suscripcionFamiliar: { select: { tutor: true } },
} satisfies Prisma.InscripcionActividadInclude;

// ============================================================================
// TIPOS DERIVADOS DE PRISMA (GetPayload)
// ============================================================================

type InscripcionManualWithEstudiante = Prisma.InscripcionComisionGetPayload<{
  include: typeof inscripcionManualInclude;
}>;

type InscripcionSuscripcionWithEstudiante =
  Prisma.InscripcionActividadGetPayload<{
    include: typeof inscripcionSuscripcionInclude;
  }>;

type EstudianteFromInscripcion = InscripcionManualWithEstudiante['estudiante'];

type TutorFromEstudiante = NonNullable<EstudianteFromInscripcion['tutor']>;

export interface EstudianteComisionResponse {
  id: string;
  nombre: string;
  apellido: string;
  avatarUrl: string | null;
  edad: number;
  casa: {
    id: string;
    tipo: string;
    nombre: string;
    colorPrimary: string;
  } | null;
  stats: {
    xpTotal: number;
    nivel: number;
    rachaActual: number;
    asistenciaPorcentaje: number;
    ultimaAsistencia: {
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
  estadoInscripcion: string;
  inscripcionFecha: Date;
  /** Fuente de la inscripción: 'MANUAL' (admin) o 'SUSCRIPCION_2026' (tutor via suscripción) */
  fuente: 'MANUAL' | 'SUSCRIPCION_2026';
}

export interface MetricasComisionResponse {
  asistenciaPromedio: number;
  totalEstudiantes: number;
  totalClases: number;
  totalPuntos: number;
}

export interface AsistenciaFechaResponse {
  fecha: Date;
  asistencias: Array<{
    estudianteId: string;
    nombre: string;
    estado: 'Presente' | 'Ausente' | 'Justificado';
    observacion: string | null;
  }>;
}

export interface HistorialAsistenciaResponse {
  fechas: AsistenciaFechaResponse[];
}

export interface PuntoOtorgadoResponse {
  id: string;
  estudianteId: string;
  estudianteNombre: string;
  tipoAccion: string;
  puntos: number;
  contexto: string | null;
  fechaOtorgado: Date;
}

export interface HistorialPuntosComisionResponse {
  puntos: PuntoOtorgadoResponse[];
  totalPuntos: number;
  totalRegistros: number;
}

@Injectable()
export class DocenteComisionQueriesService {
  constructor(
    private prisma: PrismaService,
    private validator: DocenteBusinessValidator,
  ) {}

  /**
   * Obtiene la lista de estudiantes de una comisión con sus stats
   * IMPORTANTE: Combina inscripciones de ambas fuentes:
   * - InscripcionComision (manual/admin/becas)
   * - InscripcionActividad (tutor via suscripción 2026)
   *
   * OPTIMIZACIÓN N+1:
   * - ANTES: 3N + 2 queries (N = número de estudiantes)
   * - AHORA: 3 queries fijas (batch + lookups O(1))
   *
   * @param comisionId - ID de la comisión
   * @param docenteId - ID del docente (para verificar ownership)
   * @returns Lista de estudiantes con stats y fuente de inscripción
   */
  async getEstudiantesComision(
    comisionId: string,
    docenteId: string,
  ): Promise<{ estudiantes: EstudianteComisionResponse[] }> {
    await this.validator.validarDocenteExiste(docenteId);
    await this.verificarOwnershipComision(comisionId, docenteId);

    // Query 1 & 2: Fetch inscripciones de ambas fuentes
    const [inscripcionesManuales, inscripcionesSuscripcion] = await Promise.all(
      [
        this.fetchInscripcionesManuales(comisionId),
        this.fetchInscripcionesSuscripcion(comisionId),
      ],
    );

    // Query 3: Batch fetch ALL asistencias de la comisión (elimina N+1)
    const allAsistencias = await this.prisma.asistenciaComision.findMany({
      where: { comisionId },
      select: { estudianteId: true, fecha: true, estado: true },
      orderBy: { fecha: 'desc' },
    });

    // Build lookup maps in memory (O(1) access)
    const asistenciasLookup = this.buildAsistenciasLookup(allAsistencias);

    const estudiantesMap = new Map<string, EstudianteComisionResponse>();

    // Procesar inscripciones manuales (FUENTE 1) - now sync, no queries
    for (const inscripcion of inscripcionesManuales) {
      if (estudiantesMap.has(inscripcion.estudiante.id)) continue;
      const response = this.mapEstudianteToResponseSync(
        inscripcion.estudiante,
        inscripcion.estado,
        inscripcion.fechaInscripcion,
        'MANUAL',
        inscripcion.estudiante.tutor,
        asistenciasLookup,
      );
      estudiantesMap.set(inscripcion.estudiante.id, response);
    }

    // Procesar inscripciones via suscripción (FUENTE 2) - now sync, no queries
    for (const inscripcion of inscripcionesSuscripcion) {
      if (estudiantesMap.has(inscripcion.estudiante.id)) continue;
      const tutorData =
        inscripcion.estudiante.tutor ??
        inscripcion.suscripcionFamiliar?.tutor ??
        null;
      const response = this.mapEstudianteToResponseSync(
        inscripcion.estudiante,
        inscripcion.estado,
        inscripcion.fechaInicio,
        'SUSCRIPCION_2026',
        tutorData,
        asistenciasLookup,
      );
      estudiantesMap.set(inscripcion.estudiante.id, response);
    }

    return { estudiantes: Array.from(estudiantesMap.values()) };
  }

  /**
   * Obtiene métricas de una comisión
   * IMPORTANTE: Cuenta estudiantes de ambas fuentes:
   * - InscripcionComision (manual/admin/becas)
   * - InscripcionActividad (tutor via suscripción 2026)
   *
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
        docenteId: docenteId,
      },
    });

    if (!comision) {
      throw new Error('Comisión no encontrada o no tienes acceso');
    }

    // Total de estudiantes activos - combinar ambas fuentes
    const [estudiantesManuales, estudiantesSuscripcion] = await Promise.all([
      // FUENTE 1: InscripcionComision (manual/admin/becas)
      this.prisma.inscripcionComision.count({
        where: {
          comisionId: comisionId,
          estado: { not: 'Cancelada' },
        },
      }),
      // FUENTE 2: InscripcionActividad (suscripción 2026)
      this.prisma.inscripcionActividad.count({
        where: {
          comisionId: comisionId,
          estado: 'ACTIVA',
        },
      }),
    ]);
    const totalEstudiantes = estudiantesManuales + estudiantesSuscripcion;

    // Total de clases (fechas únicas con asistencias registradas)
    const clasesDistintas = await this.prisma.asistenciaComision.groupBy({
      by: ['fecha'],
      where: { comisionId: comisionId },
    });
    const totalClasesDadas = clasesDistintas.length;

    // Calcular asistencia promedio
    let asistenciaPromedio = 0;
    if (totalClasesDadas > 0) {
      const totalAsistencias = await this.prisma.asistenciaComision.count({
        where: { comisionId: comisionId },
      });
      const presentes = await this.prisma.asistenciaComision.count({
        where: {
          comisionId: comisionId,
          estado: 'Presente',
        },
      });
      asistenciaPromedio =
        totalAsistencias > 0
          ? Math.round((presentes / totalAsistencias) * 100)
          : 0;
    }

    // Total XP de estudiantes en esta comisión (suma de xpTotal de cada estudiante)
    const [xpManuales, xpSuscripcion] = await Promise.all([
      // FUENTE 1: XP de estudiantes con inscripción manual
      this.prisma.inscripcionComision.findMany({
        where: {
          comisionId: comisionId,
          estado: { not: 'Cancelada' },
        },
        select: {
          estudiante: {
            select: { recursos: { select: { xpTotal: true } } },
          },
        },
      }),
      // FUENTE 2: XP de estudiantes con suscripción
      this.prisma.inscripcionActividad.findMany({
        where: {
          comisionId: comisionId,
          estado: 'ACTIVA',
        },
        select: {
          estudiante: {
            select: { recursos: { select: { xpTotal: true } } },
          },
        },
      }),
    ]);

    // Sumar XP de ambas fuentes
    const totalXpManuales = xpManuales.reduce(
      (sum, insc) => sum + (insc.estudiante.recursos?.xpTotal ?? 0),
      0,
    );
    const totalXpSuscripcion = xpSuscripcion.reduce(
      (sum, insc) => sum + (insc.estudiante.recursos?.xpTotal ?? 0),
      0,
    );
    const totalPuntosOtorgados = totalXpManuales + totalXpSuscripcion;

    return {
      asistenciaPromedio,
      totalEstudiantes,
      totalClases: totalClasesDadas,
      totalPuntos: totalPuntosOtorgados,
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
        docenteId: docenteId,
      },
    });

    if (!comision) {
      throw new Error('Comisión no encontrada o no tienes acceso');
    }

    // Construir filtro de fechas
    const whereClause: {
      comisionId: string;
      fecha?: { gte?: Date; lte?: Date };
    } = {
      comisionId: comisionId,
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
          estudianteId: asistencia.estudiante.id,
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

  /**
   * Obtiene historial de puntos otorgados en una comisión
   * @param comisionId - ID de la comisión
   * @param docenteId - ID del docente (para verificar ownership)
   * @param desde - Fecha desde (opcional)
   * @param hasta - Fecha hasta (opcional)
   * @returns Historial de puntos con total
   */
  async getHistorialPuntosComision(
    comisionId: string,
    docenteId: string,
    desde?: Date,
    hasta?: Date,
  ): Promise<HistorialPuntosComisionResponse> {
    // Verificar que el docente existe
    await this.validator.validarDocenteExiste(docenteId);

    // Verificar ownership
    await this.verificarOwnershipComision(comisionId, docenteId);

    // Obtener IDs de estudiantes de esta comisión (de ambas fuentes)
    const [inscripcionesManuales, inscripcionesSuscripcion] = await Promise.all(
      [
        this.prisma.inscripcionComision.findMany({
          where: { comisionId: comisionId, estado: { not: 'Cancelada' } },
          select: { estudianteId: true },
        }),
        this.prisma.inscripcionActividad.findMany({
          where: { comisionId: comisionId, estado: 'ACTIVA' },
          select: { estudianteId: true },
        }),
      ],
    );

    const estudianteIds = [
      ...new Set([
        ...inscripcionesManuales.map((i) => i.estudianteId),
        ...inscripcionesSuscripcion.map((i) => i.estudianteId),
      ]),
    ];

    if (estudianteIds.length === 0) {
      return { puntos: [], totalPuntos: 0, totalRegistros: 0 };
    }

    // Construir filtro de fechas
    const whereClause: {
      estudianteId: { in: string[] };
      fechaOtorgado?: { gte?: Date; lte?: Date };
    } = {
      estudianteId: { in: estudianteIds },
    };

    if (desde || hasta) {
      whereClause.fechaOtorgado = {};
      if (desde) whereClause.fechaOtorgado.gte = desde;
      if (hasta) whereClause.fechaOtorgado.lte = hasta;
    }

    // Obtener puntos otorgados
    const puntosOtorgados = await this.prisma.puntoObtenido.findMany({
      where: whereClause,
      include: {
        estudiante: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
      orderBy: { fechaOtorgado: 'desc' },
      take: 100, // Limitar a los últimos 100 registros
    });

    // Calcular total de puntos
    const totalPuntos = puntosOtorgados.reduce((sum, p) => sum + p.puntos, 0);

    return {
      puntos: puntosOtorgados.map((p) => ({
        id: p.id,
        estudianteId: p.estudiante.id,
        estudianteNombre: `${p.estudiante.nombre} ${p.estudiante.apellido}`,
        tipoAccion: p.tipoAccion,
        puntos: p.puntos,
        contexto: p.contexto,
        fechaOtorgado: p.fechaOtorgado,
      })),
      totalPuntos,
      totalRegistros: puntosOtorgados.length,
    };
  }

  // ============================================================================
  // HELPERS PRIVADOS
  // ============================================================================

  /**
   * Verifica que el docente tenga ownership de la comisión
   */
  private async verificarOwnershipComision(
    comisionId: string,
    docenteId: string,
  ): Promise<void> {
    const comision = await this.prisma.comision.findFirst({
      where: { id: comisionId, docenteId: docenteId },
    });
    if (!comision) {
      throw new Error('Comisión no encontrada o no tienes acceso');
    }
  }

  /**
   * Obtiene inscripciones manuales (admin/becas) de una comisión
   */
  private async fetchInscripcionesManuales(
    comisionId: string,
  ): Promise<InscripcionManualWithEstudiante[]> {
    return this.prisma.inscripcionComision.findMany({
      where: { comisionId: comisionId, estado: { not: 'Cancelada' } },
      include: inscripcionManualInclude,
    });
  }

  /**
   * Obtiene inscripciones via suscripción 2026 de una comisión
   */
  private async fetchInscripcionesSuscripcion(
    comisionId: string,
  ): Promise<InscripcionSuscripcionWithEstudiante[]> {
    return this.prisma.inscripcionActividad.findMany({
      where: { comisionId: comisionId, estado: 'ACTIVA' },
      include: inscripcionSuscripcionInclude,
    });
  }

  // ============================================================================
  // OPTIMIZED HELPERS - Batch queries + in-memory lookups (O(1))
  // ============================================================================

  /**
   * Type for pre-computed asistencias lookup
   */
  private asistenciasLookupType!: {
    ultimaAsistencia: Map<string, { fecha: Date; estado: string }>;
    totalAsistencias: Map<string, number>;
    presentes: Map<string, number>;
  };

  /**
   * Builds lookup maps from batch-fetched asistencias
   * Complexity: O(n) where n = number of asistencias
   */
  private buildAsistenciasLookup(
    asistencias: Array<{ estudianteId: string; fecha: Date; estado: string }>,
  ): typeof this.asistenciasLookupType {
    const ultimaAsistencia = new Map<string, { fecha: Date; estado: string }>();
    const totalAsistencias = new Map<string, number>();
    const presentes = new Map<string, number>();

    for (const a of asistencias) {
      // Track ultima asistencia (first occurrence since sorted desc)
      if (!ultimaAsistencia.has(a.estudianteId)) {
        ultimaAsistencia.set(a.estudianteId, {
          fecha: a.fecha,
          estado: a.estado,
        });
      }

      // Count total
      totalAsistencias.set(
        a.estudianteId,
        (totalAsistencias.get(a.estudianteId) ?? 0) + 1,
      );

      // Count presentes
      if (a.estado === 'Presente') {
        presentes.set(a.estudianteId, (presentes.get(a.estudianteId) ?? 0) + 1);
      }
    }

    return { ultimaAsistencia, totalAsistencias, presentes };
  }

  /**
   * Mapea un estudiante a la respuesta de la API (sync version)
   * Uses pre-computed lookups instead of database queries
   * Complexity: O(1)
   */
  private mapEstudianteToResponseSync(
    est: EstudianteFromInscripcion,
    estadoInscripcion: string,
    fechaInscripcion: Date,
    fuente: 'MANUAL' | 'SUSCRIPCION_2026',
    tutorData: TutorFromEstudiante | null,
    lookup: typeof this.asistenciasLookupType,
  ): EstudianteComisionResponse {
    const ultimaAsistencia = lookup.ultimaAsistencia.get(est.id) ?? null;
    const total = lookup.totalAsistencias.get(est.id) ?? 0;
    const presentesCount = lookup.presentes.get(est.id) ?? 0;

    // Calculate percentage (100% if no records)
    const asistenciaPorcentaje =
      total === 0 ? 100 : Math.round((presentesCount / total) * 100);

    return {
      id: est.id,
      nombre: est.nombre,
      apellido: est.apellido,
      avatarUrl: est.fotoUrl,
      edad: est.edad ?? 0,
      casa: est.casa
        ? {
            id: est.casa.id,
            tipo: est.casa.tipo,
            nombre: est.casa.nombre,
            colorPrimary: est.casa.colorPrimary,
          }
        : null,
      stats: {
        xpTotal: est.recursos?.xpTotal ?? 0,
        nivel: est.nivelActual ?? 1,
        rachaActual: est.racha?.rachaActual ?? 0,
        asistenciaPorcentaje,
        ultimaAsistencia,
      },
      tutor: tutorData
        ? {
            id: tutorData.id,
            nombre: tutorData.nombre,
            apellido: tutorData.apellido,
            email: tutorData.email,
            telefono: tutorData.telefono,
          }
        : null,
      estadoInscripcion,
      inscripcionFecha: fechaInscripcion,
      fuente,
    };
  }
}
