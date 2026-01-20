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
  suscripcion_familiar: { select: { tutor: true } },
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
    estudiante_id: string;
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
  estudiante_id: string;
  estudiante_nombre: string;
  tipo_accion: string;
  puntos: number;
  contexto: string | null;
  fecha_otorgado: Date;
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

    const [inscripcionesManuales, inscripcionesSuscripcion] = await Promise.all(
      [
        this.fetchInscripcionesManuales(comisionId),
        this.fetchInscripcionesSuscripcion(comisionId),
      ],
    );

    const estudiantesMap = new Map<string, EstudianteComisionResponse>();

    // Procesar inscripciones manuales (FUENTE 1)
    for (const inscripcion of inscripcionesManuales) {
      if (estudiantesMap.has(inscripcion.estudiante.id)) continue;
      const response = await this.mapEstudianteToResponse(
        inscripcion.estudiante,
        comisionId,
        inscripcion.estado,
        inscripcion.fecha_inscripcion,
        'MANUAL',
        inscripcion.estudiante.tutor,
      );
      estudiantesMap.set(inscripcion.estudiante.id, response);
    }

    // Procesar inscripciones via suscripción (FUENTE 2)
    for (const inscripcion of inscripcionesSuscripcion) {
      if (estudiantesMap.has(inscripcion.estudiante.id)) continue;
      const tutorData =
        inscripcion.estudiante.tutor ??
        inscripcion.suscripcion_familiar?.tutor ??
        null;
      const response = await this.mapEstudianteToResponse(
        inscripcion.estudiante,
        comisionId,
        inscripcion.estado,
        inscripcion.fecha_inicio,
        'SUSCRIPCION_2026',
        tutorData,
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
        docente_id: docenteId,
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
          comision_id: comisionId,
          estado: { not: 'Cancelada' },
        },
      }),
      // FUENTE 2: InscripcionActividad (suscripción 2026)
      this.prisma.inscripcionActividad.count({
        where: {
          comision_id: comisionId,
          estado: 'ACTIVA',
        },
      }),
    ]);
    const totalEstudiantes = estudiantesManuales + estudiantesSuscripcion;

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

    // Total XP de estudiantes en esta comisión (suma de xp_total de cada estudiante)
    const [xpManuales, xpSuscripcion] = await Promise.all([
      // FUENTE 1: XP de estudiantes con inscripción manual
      this.prisma.inscripcionComision.findMany({
        where: {
          comision_id: comisionId,
          estado: { not: 'Cancelada' },
        },
        select: {
          estudiante: {
            select: { recursos: { select: { xp_total: true } } },
          },
        },
      }),
      // FUENTE 2: XP de estudiantes con suscripción
      this.prisma.inscripcionActividad.findMany({
        where: {
          comision_id: comisionId,
          estado: 'ACTIVA',
        },
        select: {
          estudiante: {
            select: { recursos: { select: { xp_total: true } } },
          },
        },
      }),
    ]);

    // Sumar XP de ambas fuentes
    const totalXpManuales = xpManuales.reduce(
      (sum, insc) => sum + (insc.estudiante.recursos?.xp_total ?? 0),
      0,
    );
    const totalXpSuscripcion = xpSuscripcion.reduce(
      (sum, insc) => sum + (insc.estudiante.recursos?.xp_total ?? 0),
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
          where: { comision_id: comisionId, estado: { not: 'Cancelada' } },
          select: { estudiante_id: true },
        }),
        this.prisma.inscripcionActividad.findMany({
          where: { comision_id: comisionId, estado: 'ACTIVA' },
          select: { estudiante_id: true },
        }),
      ],
    );

    const estudianteIds = [
      ...new Set([
        ...inscripcionesManuales.map((i) => i.estudiante_id),
        ...inscripcionesSuscripcion.map((i) => i.estudiante_id),
      ]),
    ];

    if (estudianteIds.length === 0) {
      return { puntos: [], totalPuntos: 0, totalRegistros: 0 };
    }

    // Construir filtro de fechas
    const whereClause: {
      estudiante_id: { in: string[] };
      fecha_otorgado?: { gte?: Date; lte?: Date };
    } = {
      estudiante_id: { in: estudianteIds },
    };

    if (desde || hasta) {
      whereClause.fecha_otorgado = {};
      if (desde) whereClause.fecha_otorgado.gte = desde;
      if (hasta) whereClause.fecha_otorgado.lte = hasta;
    }

    // Obtener puntos otorgados
    const puntosOtorgados = await this.prisma.puntoObtenido.findMany({
      where: whereClause,
      include: {
        estudiante: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
      orderBy: { fecha_otorgado: 'desc' },
      take: 100, // Limitar a los últimos 100 registros
    });

    // Calcular total de puntos
    const totalPuntos = puntosOtorgados.reduce((sum, p) => sum + p.puntos, 0);

    return {
      puntos: puntosOtorgados.map((p) => ({
        id: p.id,
        estudiante_id: p.estudiante.id,
        estudiante_nombre: `${p.estudiante.nombre} ${p.estudiante.apellido}`,
        tipo_accion: p.tipo_accion,
        puntos: p.puntos,
        contexto: p.contexto,
        fecha_otorgado: p.fecha_otorgado,
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
      where: { id: comisionId, docente_id: docenteId },
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
      where: { comision_id: comisionId, estado: { not: 'Cancelada' } },
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
      where: { comision_id: comisionId, estado: 'ACTIVA' },
      include: inscripcionSuscripcionInclude,
    });
  }

  /**
   * Mapea un estudiante a la respuesta de la API
   */
  private async mapEstudianteToResponse(
    est: EstudianteFromInscripcion,
    comisionId: string,
    estadoInscripcion: string,
    fechaInscripcion: Date,
    fuente: 'MANUAL' | 'SUSCRIPCION_2026',
    tutorData: TutorFromEstudiante | null,
  ): Promise<EstudianteComisionResponse> {
    const [ultimaAsistencia, asistenciaPorcentaje] = await Promise.all([
      this.prisma.asistenciaComision.findFirst({
        where: { estudiante_id: est.id, comision_id: comisionId },
        orderBy: { fecha: 'desc' },
      }),
      this.calcularAsistenciaPorcentaje(est.id, comisionId),
    ]);

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
          ? { fecha: ultimaAsistencia.fecha, estado: ultimaAsistencia.estado }
          : null,
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
      estado_inscripcion: estadoInscripcion,
      inscripcion_fecha: fechaInscripcion,
      fuente,
    };
  }

  /**
   * Calcula el porcentaje de asistencia de un estudiante en una comisión
   */
  private async calcularAsistenciaPorcentaje(
    estudianteId: string,
    comisionId: string,
  ): Promise<number> {
    const totalAsistencias = await this.prisma.asistenciaComision.count({
      where: { estudiante_id: estudianteId, comision_id: comisionId },
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
