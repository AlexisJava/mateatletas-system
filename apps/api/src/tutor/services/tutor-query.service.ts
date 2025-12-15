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
   * Ejecuta 4 queries en paralelo para optimizar performance:
   * 1. Métricas principales
   * 2. Pagos pendientes
   * 3. Clases de hoy
   * 4. Alertas
   *
   * @param tutorId - ID del tutor autenticado
   * @returns Dashboard con métricas, alertas, pagos pendientes y clases de hoy
   */
  async getDashboardResumen(
    tutorId: string,
  ): Promise<DashboardResumenResponse> {
    // Ejecutar queries en paralelo para optimizar performance
    const [metricas, pagosPendientes, clasesHoy] = await Promise.all([
      this.statsService.calcularMetricasDashboard(tutorId),
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
      alertas,
      pagosPendientes,
      clasesHoy,
    };
  }

  // ============================================================================
  // PRÓXIMAS CLASES
  // ============================================================================

  /**
   * Obtiene las próximas N clases de todos los hijos del tutor
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
      where: { tutor_id: tutorId },
      select: { id: true },
    });

    const estudiantesIdsArray = estudiantesIds.map((e) => e.id);

    // Obtener próximas clases
    const clases = await this.prisma.clase.findMany({
      where: {
        fecha_hora_inicio: { gte: ahora },
        estado: 'Programada',
        inscripciones: {
          some: {
            estudiante_id: { in: estudiantesIdsArray },
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
            estudiante_id: { in: estudiantesIdsArray },
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
        fecha_hora_inicio: 'asc',
      },
      take: limit,
    });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    // Usar flatMap para filtrar y mapear en un paso (narrowing correcto)
    const clasesProximas: ClaseProxima[] = clases.flatMap((clase) => {
      const inscripcion = clase.inscripciones[0];
      // Skip clases sin inscripciones
      if (!inscripcion) {
        return [];
      }
      const fechaHoraInicio = new Date(clase.fecha_hora_inicio);
      const fechaHoraFin = new Date(
        fechaHoraInicio.getTime() + clase.duracion_minutos * 60 * 1000,
      );

      // Determinar si es hoy, mañana, o mostrar fecha
      const fechaClase = new Date(fechaHoraInicio);
      fechaClase.setHours(0, 0, 0, 0);

      const esHoy = fechaClase.getTime() === hoy.getTime();
      const esManana = fechaClase.getTime() === manana.getTime();

      let labelFecha: string;
      if (esHoy) {
        labelFecha = 'HOY';
      } else if (esManana) {
        labelFecha = 'MAÑANA';
      } else {
        labelFecha = fechaHoraInicio
          .toLocaleDateString('es-AR', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
          })
          .toUpperCase();
      }

      // Puede unirse si faltan menos de 10 minutos
      const diffMinutos =
        (fechaHoraInicio.getTime() - ahora.getTime()) / (1000 * 60);
      const puedeUnirse =
        diffMinutos <= 10 && diffMinutos >= -clase.duracion_minutos;

      return [
        {
          id: clase.id,
          fechaHoraInicio,
          fechaHoraFin,
          duracionMinutos: clase.duracion_minutos,
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
          urlReunion: undefined, // TODO: agregar campo en BD si existe
          puedeUnirse,
          esHoy,
          esManana,
          labelFecha,
        },
      ];
    });

    return {
      clases: clasesProximas,
      total: clasesProximas.length,
    };
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
