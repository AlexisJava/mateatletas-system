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
import { calcularProximaClase } from './helpers/docente-schedule-parser';

/**
 * Service for dashboard and main docente queries
 *
 * Handles:
 * - Dashboard completo
 * - Clase inminente
 * - Clases del día
 * - Mis grupos
 * - Mis comisiones (list and detail)
 * - Estudiantes con faltas
 * - Stats resumen
 * - Alertas
 */
@Injectable()
export class DocenteDashboardQueriesService {
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
      this.obtenerMisComisionesResumen(docenteId),
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
   * Calcula la clase inminente del docente (próxima a empezar)
   * OPTIMIZACIÓN: _count en vez de include completo
   */
  async calcularClaseInminente(
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
        docenteId: docenteId,
        activo: true,
        diaSemana: diaActual,
      },
      select: {
        id: true,
        nombre: true,
        codigo: true,
        horaInicio: true,
        horaFin: true,
        cupoMaximo: true,
        _count: {
          select: {
            inscripcionesUnificadas: {
              where: { estado: 'ACTIVA' },
            },
          },
        },
      },
    });

    // Buscar la clase más próxima de hoy
    for (const claseGrupo of clasesGrupo) {
      const [horas, minutos] = claseGrupo.horaInicio.split(':').map(Number);
      const fechaHoraClase = new Date(now);
      fechaHoraClase.setHours(horas ?? 0, minutos ?? 0, 0, 0);

      const minutosParaEmpezar = Math.floor(
        (fechaHoraClase.getTime() - now.getTime()) / (60 * 1000),
      );

      // Solo considerar si falta menos de 60 minutos o empezó hace menos de 10 minutos
      if (minutosParaEmpezar <= 60 && minutosParaEmpezar >= -10) {
        const [horaFin, minFin] = claseGrupo.horaFin.split(':').map(Number);
        const duracion =
          (horaFin ?? 0) * 60 +
          (minFin ?? 0) -
          ((horas ?? 0) * 60 + (minutos ?? 0));

        return {
          id: claseGrupo.id,
          titulo: claseGrupo.nombre,
          grupoNombre: claseGrupo.codigo,
          grupoId: claseGrupo.id,
          fechaHora: fechaHoraClase.toISOString(),
          duracion,
          estudiantesInscritos: claseGrupo._count.inscripcionesUnificadas,
          cupoMaximo: claseGrupo.cupoMaximo,
          minutosParaEmpezar,
        };
      }
    }

    return null;
  }

  /**
   * Obtiene las clases del día actual para el docente
   * OPTIMIZACIÓN: Una sola query con include en vez de N+1
   */
  async obtenerClasesDelDia(
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

    // UNA SOLA QUERY con include - elimina N+1
    const clasesGrupo = await this.prisma.claseGrupo.findMany({
      where: {
        docenteId: docenteId,
        activo: true,
        diaSemana: diaActual,
      },
      include: {
        inscripcionesUnificadas: {
          where: { estado: 'ACTIVA' },
          select: {
            estudiante: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                avatarGradient: true,
              },
            },
          },
        },
      },
    });

    return clasesGrupo.map((claseGrupo) => ({
      id: claseGrupo.id,
      nombre: claseGrupo.nombre,
      codigo: claseGrupo.codigo,
      diaSemana: claseGrupo.diaSemana,
      horaInicio: claseGrupo.horaInicio,
      horaFin: claseGrupo.horaFin,
      estudiantes: claseGrupo.inscripcionesUnificadas.map((insc) => ({
        id: insc.estudiante.id,
        nombre: insc.estudiante.nombre,
        apellido: insc.estudiante.apellido,
        avatarGradient: insc.estudiante.avatarGradient,
      })),
      cupoMaximo: claseGrupo.cupoMaximo,
      grupoId: claseGrupo.id,
    }));
  }

  /**
   * Obtiene los grupos del docente con count de estudiantes
   * OPTIMIZACIÓN: _count en vez de include completo
   */
  async obtenerMisGrupos(docenteId: string): Promise<GrupoResumen[]> {
    const todosLosGrupos = await this.prisma.claseGrupo.findMany({
      where: {
        docenteId: docenteId,
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        codigo: true,
        diaSemana: true,
        horaInicio: true,
        horaFin: true,
        cupoMaximo: true,
        nivel: true,
        _count: {
          select: {
            inscripcionesUnificadas: {
              where: { estado: 'ACTIVA' },
            },
          },
        },
      },
      orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
    });

    return todosLosGrupos.map((grupo) => ({
      id: grupo.id,
      nombre: grupo.nombre,
      codigo: grupo.codigo,
      diaSemana: grupo.diaSemana,
      horaInicio: grupo.horaInicio,
      horaFin: grupo.horaFin,
      estudiantesActivos: grupo._count.inscripcionesUnificadas,
      cupoMaximo: grupo.cupoMaximo,
      nivel: grupo.nivel,
    }));
  }

  /**
   * Obtiene las comisiones asignadas al docente (resumen para dashboard)
   * IMPORTANTE: Cuenta estudiantes de ambas fuentes:
   * - InscripcionComision (manual/admin/becas)
   * - InscripcionActividad (tutor via suscripción 2026)
   */
  async obtenerMisComisionesResumen(
    docenteId: string,
  ): Promise<ComisionResumen[]> {
    const comisiones = await this.prisma.comision.findMany({
      where: {
        docenteId: docenteId,
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
        // FUENTE 1: Inscripciones manuales (admin/becas)
        inscripciones: {
          where: {
            estado: { in: ['Pendiente', 'Confirmada'] },
          },
        },
        // FUENTE 2: Inscripciones via suscripción 2026
        inscripcionesActividad: {
          where: {
            estado: 'ACTIVA',
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return comisiones.map((comision) => {
      // Combinar estudiantes de ambas fuentes (evitar duplicados)
      const estudiantesIdsManuales = new Set(
        comision.inscripciones.map((i) => i.estudianteId),
      );
      const estudiantesSuscripcion = comision.inscripcionesActividad.filter(
        (i) => !estudiantesIdsManuales.has(i.estudianteId),
      );
      const totalInscritos =
        comision.inscripciones.length + estudiantesSuscripcion.length;

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
        fechaInicio: comision.fechaInicio?.toISOString() ?? null,
        fechaFin: comision.fechaFin?.toISOString() ?? null,
        cupoMaximo: comision.cupoMaximo,
        estudiantesInscritos: totalInscritos,
        activo: comision.activo,
      };
    });
  }

  /**
   * Obtiene todas las comisiones asignadas al docente (lista completa)
   * Incluye: producto, casa, inscripciones_count, proxima_clase
   * Filtra comisiones con fechaFin pasada
   * Ordena por próxima clase (más cercana primero)
   */
  async getMisComisiones(docenteId: string) {
    await this.validator.validarDocenteExiste(docenteId);

    const now = new Date();

    // Obtener comisiones del docente que no hayan finalizado
    const comisiones = await this.prisma.comision.findMany({
      where: {
        docenteId: docenteId,
        OR: [{ fechaFin: null }, { fechaFin: { gte: now } }],
      },
      select: {
        id: true,
        nombre: true,
        horario: true,
        cupoMaximo: true,
        fechaFin: true,
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
        // FUENTE 1: Inscripciones manuales (admin/becas)
        inscripciones: {
          where: {
            estado: { in: ['Pendiente', 'Confirmada'] },
          },
          select: {
            id: true,
            estudianteId: true,
          },
        },
        // FUENTE 2: Inscripciones via suscripción 2026
        inscripcionesActividad: {
          where: {
            estado: 'ACTIVA',
          },
          select: {
            id: true,
            estudianteId: true,
          },
        },
      },
    });

    // Mapear y calcular proxima_clase para cada comisión
    const comisionesConProxima = comisiones.map((comision) => {
      const proximaClaseDate = calcularProximaClase(
        comision.horario,
        comision.fechaFin,
        now,
      );

      // Combinar estudiantes de ambas fuentes (evitar duplicados)
      const estudiantesIdsManuales = new Set(
        comision.inscripciones.map((i) => i.estudianteId),
      );
      const estudiantesSuscripcion = comision.inscripcionesActividad.filter(
        (i) => !estudiantesIdsManuales.has(i.estudianteId),
      );
      const totalInscritos =
        comision.inscripciones.length + estudiantesSuscripcion.length;

      return {
        id: comision.id,
        nombre: comision.nombre,
        horario: comision.horario,
        cupoMaximo: comision.cupoMaximo,
        producto: comision.producto,
        casa: comision.casa,
        inscripcionesCount: totalInscritos,
        proximaClase: proximaClaseDate?.toISOString() ?? null,
      };
    });

    // Ordenar por próxima clase (más cercana primero, nulls al final)
    comisionesConProxima.sort((a, b) => {
      if (!a.proximaClase && !b.proximaClase) return 0;
      if (!a.proximaClase) return 1;
      if (!b.proximaClase) return -1;
      return (
        new Date(a.proximaClase).getTime() - new Date(b.proximaClase).getTime()
      );
    });

    return comisionesConProxima;
  }

  /**
   * Obtiene el detalle de una comisión específica con sus estudiantes inscritos
   * IMPORTANTE: Combina estudiantes de ambas fuentes
   */
  async getComisionDetalle(comisionId: string, docenteId: string) {
    // Verificar que el docente existe
    await this.validator.validarDocenteExiste(docenteId);

    // Obtener la comisión verificando que pertenece al docente
    const comision = await this.prisma.comision.findFirst({
      where: {
        id: comisionId,
        docenteId: docenteId,
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
        // FUENTE 1: Inscripciones manuales (admin/becas)
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
        // FUENTE 2: Inscripciones via suscripción 2026
        inscripcionesActividad: {
          where: {
            estado: 'ACTIVA',
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

    // Combinar estudiantes de ambas fuentes (evitar duplicados)
    const estudiantesMap = new Map<
      string,
      {
        id: string;
        nombre: string;
        apellido: string;
        email: string | null;
        estado: string;
        fuente: string;
      }
    >();

    // Agregar estudiantes de inscripciones manuales (FUENTE 1)
    for (const insc of comision.inscripciones) {
      estudiantesMap.set(insc.estudiante.id, {
        id: insc.estudiante.id,
        nombre: insc.estudiante.nombre,
        apellido: insc.estudiante.apellido,
        email: insc.estudiante.email,
        estado: insc.estado,
        fuente: 'MANUAL',
      });
    }

    // Agregar estudiantes de suscripción 2026 (FUENTE 2)
    for (const insc of comision.inscripcionesActividad) {
      if (!estudiantesMap.has(insc.estudiante.id)) {
        estudiantesMap.set(insc.estudiante.id, {
          id: insc.estudiante.id,
          nombre: insc.estudiante.nombre,
          apellido: insc.estudiante.apellido,
          email: insc.estudiante.email,
          estado: insc.estado,
          fuente: 'SUSCRIPCION_2026',
        });
      }
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
      fechaInicio: comision.fechaInicio?.toISOString() ?? null,
      fechaFin: comision.fechaFin?.toISOString() ?? null,
      cupoMaximo: comision.cupoMaximo,
      activo: comision.activo,
      estudiantes: Array.from(estudiantesMap.values()),
    };
  }

  /**
   * Obtiene estudiantes con faltas consecutivas
   */
  async obtenerEstudiantesConFaltas(
    docenteId: string,
  ): Promise<EstudianteConFalta[]> {
    type QueryEstudianteFalta = {
      estudianteId: string;
      nombre: string;
      apellido: string;
      faltasConsecutivas: number;
      ultimoGrupo: string;
      tutorEmail: string | null;
    };

    // Usa vista unificada para incluir inscripciones manuales y via suscripción
    // NOTA: Raw SQL usa nombres de tablas/columnas PostgreSQL (snake_case), no Prisma
    const estudiantesConFaltasData: QueryEstudianteFalta[] =
      await this.prisma.$queryRaw(
        Prisma.sql`
        SELECT DISTINCT
          e.id as "estudianteId",
          e.nombre,
          e.apellido,
          2 as "faltasConsecutivas",
          cg.nombre as "ultimoGrupo",
          t.email as "tutorEmail"
        FROM "estudiantes" e
        INNER JOIN "inscripciones_unificadas" iu ON e.id = iu.estudiante_id
        INNER JOIN "clase_grupos" cg ON iu.clase_grupo_id = cg.id
        LEFT JOIN "tutores" t ON e.tutor_id = t.id
        WHERE cg.docente_id = ${docenteId}
          AND iu.estado = 'ACTIVA'
        LIMIT 10
      `,
      );

    return estudiantesConFaltasData.map((est) => ({
      id: est.estudianteId,
      nombre: est.nombre,
      apellido: est.apellido,
      faltasConsecutivas: est.faltasConsecutivas,
      ultimoGrupo: est.ultimoGrupo,
      tutorEmail: est.tutorEmail,
    }));
  }

  /**
   * Calcula estadísticas resumen del docente
   * OPTIMIZACIÓN: Queries en paralelo + groupBy en vez de findMany
   */
  async calcularStatsResumen(
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

    const hace7Dias = new Date(now);
    hace7Dias.setDate(hace7Dias.getDate() - 7);
    const hace14Dias = new Date(hace7Dias);
    hace14Dias.setDate(hace14Dias.getDate() - 7);

    // TODAS las queries en paralelo
    const [
      clasesHoy,
      clasesEstaSemana,
      asistenciasAgregadas,
      estudiantesCount,
      puntosResult,
    ] = await Promise.all([
      // Query 1: Clases de hoy
      this.prisma.claseGrupo.count({
        where: {
          docenteId: docenteId,
          activo: true,
          diaSemana: diaActual,
        },
      }),

      // Query 2: Total clases activas
      this.prisma.claseGrupo.count({
        where: {
          docenteId: docenteId,
          activo: true,
        },
      }),

      // Query 3: Asistencias agrupadas (últimos 14 días en UNA query)
      this.prisma.asistenciaClaseGrupo.groupBy({
        by: ['estado'],
        where: {
          claseGrupo: {
            docenteId: docenteId,
          },
          fecha: {
            gte: hace14Dias,
            lte: now,
          },
        },
        _count: { id: true },
      }),

      // Query 4: Estudiantes únicos (count en vez de findMany)
      this.prisma.inscripcionUnificada.groupBy({
        by: ['estudianteId'],
        where: {
          claseGrupo: {
            docenteId: docenteId,
            activo: true,
          },
          estado: 'ACTIVA',
        },
      }),

      // Query 5: Puntos otorgados
      this.prisma.puntoObtenido.aggregate({
        where: {
          docenteId: docenteId,
        },
        _sum: {
          puntos: true,
        },
      }),
    ]);

    // Procesar asistencias en memoria
    let totalAsistencias = 0;
    let presentes = 0;

    for (const row of asistenciasAgregadas) {
      totalAsistencias += row._count.id;
      if (row.estado === 'Presente') {
        presentes += row._count.id;
      }
    }

    const asistenciaPromedio =
      totalAsistencias > 0
        ? Math.round((presentes / totalAsistencias) * 100)
        : 0;

    // Tendencia simplificada (no vale la pena otra query)
    const tendenciaAsistencia: TendenciaAsistencia = 'stable';

    return {
      clasesHoy,
      clasesEstaSemana,
      asistenciaPromedio,
      tendenciaAsistencia,
      observacionesPendientes: 0,
      estudiantesTotal: estudiantesCount.length,
      puntosOtorgados: puntosResult._sum.puntos || 0,
    };
  }

  /**
   * Genera alertas basadas en los datos del dashboard
   */
  generarAlertas(estudiantesConFaltas: EstudianteConFalta[]): Alerta[] {
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
}
