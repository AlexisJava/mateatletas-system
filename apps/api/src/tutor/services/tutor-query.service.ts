import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { InscripcionMensualRepository } from '../../pagos/infrastructure/repositories/inscripcion-mensual.repository';
import { EstadoPago } from '../../pagos/domain/types/pagos.types';
import { TutorStatsService } from './tutor-stats.service';
import { MisInscripcionesResponse } from '../tutor.service';
import {
  ProximasClasesResponse,
  ClaseProxima,
  DashboardResumenResponse,
  AlertasResponse,
} from '../types/tutor-dashboard.types';
import { DiaSemana } from '@prisma/client';

/**
 * TutorQueryService
 *
 * Servicio especializado en consultas de lectura (QUERIES)
 * para el módulo Tutor.
 *
 * Responsabilidades:
 * - Obtener inscripciones mensuales con filtros
 * - Obtener dashboard resumen (orquesta operaciones paralelas)
 * - Obtener próximas clases
 * - Obtener alertas
 *
 * Patrón: Query Service (parte de CQRS)
 * Delegación: Delega cálculos complejos a TutorStatsService
 */
@Injectable()
export class TutorQueryService {
  constructor(
    private readonly inscripcionRepo: InscripcionMensualRepository,
    private readonly prisma: PrismaService,
    private readonly statsService: TutorStatsService,
  ) {}

  // ============================================================================
  // INSCRIPCIONES MENSUALES
  // ============================================================================

  /**
   * Obtiene las inscripciones mensuales de un tutor con resumen
   *
   * @param tutorId - ID del tutor autenticado (viene del JWT)
   * @param periodo - Filtro opcional por período (YYYY-MM)
   * @param estadoPago - Filtro opcional por estado
   * @returns Inscripciones y resumen financiero
   */
  async getMisInscripciones(
    tutorId: string,
    periodo?: string,
    estadoPago?: EstadoPago,
  ): Promise<MisInscripcionesResponse> {
    // Obtener inscripciones del repositorio
    const inscripciones = await this.inscripcionRepo.obtenerPorTutor(
      tutorId,
      periodo,
      estadoPago,
    );

    // Calcular resumen (delegar a StatsService)
    const resumen = this.statsService.calcularResumen(inscripciones);

    return {
      inscripciones,
      resumen,
    };
  }

  // ============================================================================
  // DASHBOARD RESUMEN
  // ============================================================================

  /**
   * Obtiene el resumen completo del dashboard del tutor
   *
   * Ejecuta 5 queries en paralelo para optimizar performance:
   * 1. Métricas principales
   * 2. Hijos con puntos y asistencia
   * 3. Pagos pendientes
   * 4. Clases de hoy
   * 5. Alertas (depende de pagosPendientes y clasesHoy)
   *
   * @param tutorId - ID del tutor autenticado
   * @returns Dashboard con métricas, hijos, alertas, pagos pendientes y clases de hoy
   */
  async getDashboardResumen(
    tutorId: string,
  ): Promise<DashboardResumenResponse> {
    // Ejecutar queries en paralelo para optimizar performance
    const [metricas, hijos, pagosPendientes, clasesHoy] = await Promise.all([
      this.statsService.calcularMetricasDashboard(tutorId),
      this.statsService.obtenerHijos(tutorId),
      this.statsService.obtenerPagosPendientes(tutorId),
      this.statsService.obtenerClasesHoy(tutorId),
    ]);

    // Construir alertas (requiere pagosPendientes y clasesHoy)
    const alertas = await this.statsService.construirAlertas(
      tutorId,
      pagosPendientes,
      clasesHoy,
    );

    return {
      metricas,
      hijos,
      alertas,
      pagosPendientes,
      clasesHoy,
    };
  }

  // ============================================================================
  // PRÓXIMAS CLASES
  // ============================================================================

  /**
   * Mapea DiaSemana enum a número de día de la semana (0=Domingo, 1=Lunes, etc.)
   */
  private diaSemanaToNumber(dia: DiaSemana): number {
    const mapping: Record<DiaSemana, number> = {
      DOMINGO: 0,
      LUNES: 1,
      MARTES: 2,
      MIERCOLES: 3,
      JUEVES: 4,
      VIERNES: 5,
      SABADO: 6,
    };
    return mapping[dia];
  }

  /**
   * Calcula la próxima ocurrencia de un ClaseGrupo basado en su día de semana y hora
   */
  private calcularProximaFecha(
    diaSemana: DiaSemana,
    horaInicio: string,
    ahora: Date,
  ): Date {
    const diaObjetivo = this.diaSemanaToNumber(diaSemana);
    const diaActual = ahora.getDay();

    // Parsear hora (formato HH:MM)
    const partesHora = horaInicio.split(':');
    const hora = Number(partesHora[0]) || 0;
    const minutos = Number(partesHora[1]) || 0;

    // Calcular días hasta la próxima ocurrencia
    let diasHastaProxima = diaObjetivo - diaActual;

    // Si es el mismo día, verificar si ya pasó la hora
    if (diasHastaProxima === 0) {
      const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
      const horaClase = hora * 60 + minutos;
      if (horaActual > horaClase) {
        // Ya pasó, ir a la próxima semana
        diasHastaProxima = 7;
      }
    } else if (diasHastaProxima < 0) {
      // El día ya pasó esta semana, ir a la próxima
      diasHastaProxima += 7;
    }

    const proximaFecha = new Date(ahora);
    proximaFecha.setDate(proximaFecha.getDate() + diasHastaProxima);
    proximaFecha.setHours(hora, minutos, 0, 0);

    return proximaFecha;
  }

  /**
   * Obtiene las próximas N clases de todos los hijos del tutor
   * Incluye tanto el sistema antiguo (Clase) como el nuevo (ClaseGrupo/InscripcionActividad)
   *
   * @param tutorId - ID del tutor autenticado
   * @param limit - Cantidad máxima de clases a retornar (default: 5)
   * @returns Lista de próximas clases ordenadas por fecha
   */
  async getProximasClases(
    tutorId: string,
    limit: number = 5,
  ): Promise<ProximasClasesResponse> {
    const ahora = new Date();

    // Obtener estudiantes del tutor
    const estudiantesIds = await this.prisma.estudiante.findMany({
      where: { tutorId: tutorId },
      select: { id: true },
    });

    const estudiantesIdsArray = estudiantesIds.map((e) => e.id);

    // ============================================================================
    // SISTEMA ANTIGUO: Clase + InscripcionClase
    // ============================================================================
    const clasesAntiguas = await this.prisma.clase.findMany({
      where: {
        fechaHoraInicio: { gte: ahora },
        estado: 'Programada',
        inscripciones: {
          some: {
            estudianteId: { in: estudiantesIdsArray },
          },
        },
      },
      include: {
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        inscripciones: {
          where: {
            estudianteId: { in: estudiantesIdsArray },
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
        },
      },
      orderBy: {
        fechaHoraInicio: 'asc',
      },
      take: limit,
    });

    // ============================================================================
    // SISTEMA 2026: ClaseGrupo + InscripcionActividad
    // ============================================================================
    const inscripcionesActividad =
      await this.prisma.inscripcionActividad.findMany({
        where: {
          estudianteId: { in: estudiantesIdsArray },
          estado: 'ACTIVA',
          claseGrupoId: { not: null },
          suscripcionFamiliar: {
            estado: 'AUTHORIZED', // EstadoSuscripcionFamiliar.AUTHORIZED
          },
        },
        select: {
          id: true,
          estado: true,
          estudiante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
          claseGrupo: {
            select: {
              id: true,
              nombre: true,
              diaSemana: true,
              horaInicio: true,
              horaFin: true,
              fechaInicio: true,
              fechaFin: true,
              activo: true,
              estadoClase: true,
              docente: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                },
              },
              producto: {
                select: {
                  nombre: true,
                },
              },
            },
          },
        },
      });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    // Procesar clases del sistema antiguo
    const clasesProximasAntiguas: ClaseProxima[] = clasesAntiguas.flatMap(
      (clase) => {
        const inscripcion = clase.inscripciones[0];
        if (!inscripcion) return [];

        const fechaHoraInicio = new Date(clase.fechaHoraInicio);
        const fechaHoraFin = new Date(
          fechaHoraInicio.getTime() + clase.duracionMinutos * 60 * 1000,
        );

        const fechaClase = new Date(fechaHoraInicio);
        fechaClase.setHours(0, 0, 0, 0);

        const esHoy = fechaClase.getTime() === hoy.getTime();
        const esManana = fechaClase.getTime() === manana.getTime();

        const labelFecha = this.generarLabelFecha(
          fechaHoraInicio,
          esHoy,
          esManana,
        );

        const diffMinutos =
          (fechaHoraInicio.getTime() - ahora.getTime()) / (1000 * 60);
        const puedeUnirse =
          diffMinutos <= 10 && diffMinutos >= -clase.duracionMinutos;

        return [
          {
            id: clase.id,
            fechaHoraInicio,
            fechaHoraFin,
            duracionMinutos: clase.duracionMinutos,
            nombre: clase.nombre,
            docente: {
              id: clase.docente.id,
              nombre: clase.docente.nombre,
              apellido: clase.docente.apellido,
            },
            estudiante: {
              id: inscripcion.estudiante.id,
              nombre: inscripcion.estudiante.nombre,
              apellido: inscripcion.estudiante.apellido,
            },
            estado: clase.estado,
            urlReunion: undefined,
            puedeUnirse,
            esHoy,
            esManana,
            labelFecha,
          },
        ];
      },
    );

    // Procesar clases del sistema 2026 (ClaseGrupo recurrentes)
    const clasesProximasNuevas: ClaseProxima[] = inscripcionesActividad.flatMap(
      (inscripcion) => {
        const claseGrupo = inscripcion.claseGrupo;
        if (!claseGrupo || !claseGrupo.activo) return [];

        // Verificar que el ClaseGrupo está dentro de su rango de vigencia
        const fechaFin = new Date(claseGrupo.fechaFin);
        if (fechaFin < ahora) return [];

        // Calcular próxima fecha de la clase recurrente
        const fechaHoraInicio = this.calcularProximaFecha(
          claseGrupo.diaSemana,
          claseGrupo.horaInicio,
          ahora,
        );

        // Verificar que no excede la fecha de fin del grupo
        if (fechaHoraInicio > fechaFin) return [];

        // Calcular duración desde horaInicio y horaFin
        const partesInicio = claseGrupo.horaInicio.split(':');
        const partesFin = claseGrupo.horaFin.split(':');
        const minutosInicio =
          (Number(partesInicio[0]) || 0) * 60 + (Number(partesInicio[1]) || 0);
        const minutosFin =
          (Number(partesFin[0]) || 0) * 60 + (Number(partesFin[1]) || 0);
        const duracionMinutos = minutosFin - minutosInicio;

        const fechaHoraFin = new Date(
          fechaHoraInicio.getTime() + duracionMinutos * 60 * 1000,
        );

        const fechaClase = new Date(fechaHoraInicio);
        fechaClase.setHours(0, 0, 0, 0);

        const esHoy = fechaClase.getTime() === hoy.getTime();
        const esManana = fechaClase.getTime() === manana.getTime();

        const labelFecha = this.generarLabelFecha(
          fechaHoraInicio,
          esHoy,
          esManana,
        );

        const diffMinutos =
          (fechaHoraInicio.getTime() - ahora.getTime()) / (1000 * 60);
        const puedeUnirse =
          diffMinutos <= 10 && diffMinutos >= -duracionMinutos;

        // Nombre: usar producto.nombre o el nombre del grupo
        const nombreClase =
          claseGrupo.producto?.nombre || claseGrupo.nombre || 'Clase';

        return [
          {
            id: `${claseGrupo.id}-${inscripcion.estudiante.id}-${fechaHoraInicio.toISOString().slice(0, 10)}`,
            fechaHoraInicio,
            fechaHoraFin,
            duracionMinutos,
            nombre: nombreClase,
            docente: {
              id: claseGrupo.docente.id,
              nombre: claseGrupo.docente.nombre,
              apellido: claseGrupo.docente.apellido,
            },
            estudiante: {
              id: inscripcion.estudiante.id,
              nombre: inscripcion.estudiante.nombre,
              apellido: inscripcion.estudiante.apellido,
            },
            estado: claseGrupo.estadoClase,
            urlReunion: undefined,
            puedeUnirse,
            esHoy,
            esManana,
            labelFecha,
          },
        ];
      },
    );

    // Combinar y ordenar todas las clases por fecha
    const todasLasClases = [...clasesProximasAntiguas, ...clasesProximasNuevas]
      .sort((a, b) => a.fechaHoraInicio.getTime() - b.fechaHoraInicio.getTime())
      .slice(0, limit);

    return {
      clases: todasLasClases,
      total: todasLasClases.length,
    };
  }

  /**
   * Genera el label de fecha para mostrar (HOY, MAÑANA, o fecha corta)
   */
  private generarLabelFecha(
    fecha: Date,
    esHoy: boolean,
    esManana: boolean,
  ): string {
    if (esHoy) return 'HOY';
    if (esManana) return 'MAÑANA';
    return fecha
      .toLocaleDateString('es-AR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      })
      .toUpperCase();
  }

  // ============================================================================
  // ALERTAS
  // ============================================================================

  /**
   * Obtiene todas las alertas activas del tutor
   *
   * @param tutorId - ID del tutor autenticado
   * @returns Lista de alertas ordenadas por prioridad
   */
  async obtenerAlertas(tutorId: string): Promise<AlertasResponse> {
    // Obtener datos necesarios para construir alertas
    const [pagosPendientes, clasesHoy] = await Promise.all([
      this.statsService.obtenerPagosPendientes(tutorId),
      this.statsService.obtenerClasesHoy(tutorId),
    ]);

    // Construir alertas (delegar a StatsService)
    const alertas = await this.statsService.construirAlertas(
      tutorId,
      pagosPendientes,
      clasesHoy,
    );

    return {
      alertas,
      total: alertas.length,
      hayAlertas: alertas.length > 0,
    };
  }
}
