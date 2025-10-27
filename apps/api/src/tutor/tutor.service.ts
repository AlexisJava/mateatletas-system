import { Injectable } from '@nestjs/common';
import { InscripcionMensualRepository } from '../pagos/infrastructure/repositories/inscripcion-mensual.repository';
import { EstadoPago } from '../pagos/domain/types/pagos.types';
import { InscripcionMensual } from '../pagos/domain/repositories/inscripcion-mensual.repository.interface';
import { EstadoPagoFilter } from './dto/get-mis-inscripciones.dto';
import { PrismaService } from '../core/database/prisma.service';
import {
  DashboardResumenResponse,
  ProximasClasesResponse,
  AlertasResponse,
  MetricasDashboard,
  AlertaDashboard,
  PagoPendiente,
  ClaseHoy,
  ClaseProxima,
  TipoAlerta,
  PrioridadAlerta,
} from './types/tutor-dashboard.types';

/**
 * Response type para getMisInscripciones
 */
export interface MisInscripcionesResponse {
  inscripciones: InscripcionMensual[];
  resumen: {
    totalPendiente: number;
    totalPagado: number;
    cantidadInscripciones: number;
    estudiantesUnicos: number;
  };
}

/**
 * TutorService
 *
 * Lógica de negocio específica para tutores
 * - Obtener inscripciones mensuales
 * - Calcular resúmenes financieros
 * - Gestionar perfil de tutor
 */
@Injectable()
export class TutorService {
  constructor(
    private readonly inscripcionRepo: InscripcionMensualRepository,
    private readonly prisma: PrismaService,
  ) {}

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
    estadoPago?: EstadoPagoFilter,
  ): Promise<MisInscripcionesResponse> {
    // Mapear EstadoPagoFilter a EstadoPago del dominio
    const estadoDominio: EstadoPago | undefined = estadoPago as
      | EstadoPago
      | undefined;

    // Obtener inscripciones del repositorio
    const inscripciones = await this.inscripcionRepo.obtenerPorTutor(
      tutorId,
      periodo,
      estadoDominio,
    );

    // Calcular resumen
    const resumen = this.calcularResumen(inscripciones);

    return {
      inscripciones,
      resumen,
    };
  }

  /**
   * Calcula el resumen financiero de las inscripciones
   *
   * @param inscripciones - Array de inscripciones
   * @returns Resumen con totales y conteos
   */
  private calcularResumen(inscripciones: InscripcionMensual[]): {
    totalPendiente: number;
    totalPagado: number;
    cantidadInscripciones: number;
    estudiantesUnicos: number;
  } {
    let totalPendiente = 0;
    let totalPagado = 0;
    const estudiantesSet = new Set<string>();

    for (const inscripcion of inscripciones) {
      // Sumar totales según estado
      if (
        inscripcion.estadoPago === 'Pendiente' ||
        inscripcion.estadoPago === 'Vencido'
      ) {
        totalPendiente += Number(inscripcion.precioFinal);
      } else if (inscripcion.estadoPago === 'Pagado') {
        totalPagado += Number(inscripcion.precioFinal);
      }

      // Contar estudiantes únicos
      estudiantesSet.add(inscripcion.estudianteId);
    }

    return {
      totalPendiente: Math.round(totalPendiente),
      totalPagado: Math.round(totalPagado),
      cantidadInscripciones: inscripciones.length,
      estudiantesUnicos: estudiantesSet.size,
    };
  }

  /**
   * Obtiene el resumen completo del dashboard del tutor
   *
   * @param tutorId - ID del tutor autenticado
   * @returns Dashboard con métricas, alertas, pagos pendientes y clases de hoy
   */
  async getDashboardResumen(
    tutorId: string,
  ): Promise<DashboardResumenResponse> {
    // Ejecutar queries en paralelo para optimizar performance
    const [metricas, pagosPendientes, clasesHoy, alertas] = await Promise.all([
      this.calcularMetricasDashboard(tutorId),
      this.obtenerPagosPendientes(tutorId),
      this.obtenerClasesHoy(tutorId),
      this.obtenerAlertas(tutorId),
    ]);

    return {
      metricas,
      alertas: alertas.alertas,
      pagosPendientes,
      clasesHoy,
    };
  }

  /**
   * Calcula las métricas principales del dashboard
   */
  private async calcularMetricasDashboard(
    tutorId: string,
  ): Promise<MetricasDashboard> {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const finMes = new Date(
      ahora.getFullYear(),
      ahora.getMonth() + 1,
      0,
      23,
      59,
      59,
    );
    const inicioAnio = new Date(ahora.getFullYear(), 0, 1);

    // 1. Total de hijos
    const totalHijos = await this.prisma.estudiante.count({
      where: { tutor_id: tutorId },
    });

    // 2. Clases del mes actual (de TODOS los hijos)
    const estudiantesIds = await this.prisma.estudiante.findMany({
      where: { tutor_id: tutorId },
      select: { id: true },
    });

    const estudiantesIdsArray = estudiantesIds.map((e) => e.id);

    const clasesDelMes = await this.prisma.inscripcionClase.count({
      where: {
        estudiante_id: { in: estudiantesIdsArray },
        clase: {
          fecha_hora_inicio: {
            gte: inicioMes,
            lte: finMes,
          },
          estado: 'Programada',
        },
      },
    });

    // 3. Total pagado este año (inscripciones mensuales pagadas)
    const inscripcionesPagadas = await this.prisma.inscripcionMensual.aggregate(
      {
        where: {
          tutor_id: tutorId,
          estado_pago: 'Pagado',
          createdAt: { gte: inicioAnio },
        },
        _sum: {
          precio_final: true,
        },
      },
    );

    const totalPagadoAnio = inscripcionesPagadas._sum.precio_final
      ? Math.round(Number(inscripcionesPagadas._sum.precio_final))
      : 0;

    // 4. Asistencia promedio (de todos los hijos)
    const asistencias = await this.prisma.asistencia.groupBy({
      by: ['estado'],
      where: {
        estudiante_id: { in: estudiantesIdsArray },
      },
      _count: {
        estado: true,
      },
    });

    let totalAsistencias = 0;
    let asistenciasPresente = 0;

    for (const grupo of asistencias) {
      totalAsistencias += grupo._count.estado;
      if (grupo.estado === 'Presente') {
        asistenciasPresente += grupo._count.estado;
      }
    }

    const asistenciaPromedio =
      totalAsistencias > 0
        ? Math.round((asistenciasPresente / totalAsistencias) * 100)
        : 0;

    return {
      totalHijos,
      clasesDelMes,
      totalPagadoAnio,
      asistenciaPromedio,
    };
  }

  /**
   * Obtiene los pagos pendientes ordenados por fecha de vencimiento
   */
  private async obtenerPagosPendientes(
    tutorId: string,
  ): Promise<PagoPendiente[]> {
    // Obtener inscripciones mensuales pendientes o vencidas
    const inscripcionesPendientes =
      await this.prisma.inscripcionMensual.findMany({
        where: {
          tutor_id: tutorId,
          estado_pago: { in: ['Pendiente', 'Vencido'] },
        },
        include: {
          estudiante: {
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
        orderBy: [{ periodo: 'asc' }],
      });

    return inscripcionesPendientes.map((inscripcion) => {
      // Calcular fecha de vencimiento (último día del mes del período)
      const [anio, mes] = inscripcion.periodo.split('-').map(Number);
      const fechaVencimiento = new Date(anio, mes, 0); // Último día del mes

      // Calcular días para vencer (negativo si ya venció)
      const ahora = new Date();
      ahora.setHours(0, 0, 0, 0);
      const diffTime = fechaVencimiento.getTime() - ahora.getTime();
      const diasParaVencer = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        id: inscripcion.id,
        monto: Math.round(Number(inscripcion.precio_final)),
        concepto: inscripcion.producto?.nombre || 'Inscripción mensual',
        fechaVencimiento,
        diasParaVencer,
        estudianteId: inscripcion.estudiante.id,
        estudianteNombre: `${inscripcion.estudiante.nombre} ${inscripcion.estudiante.apellido}`,
        estaVencido: inscripcion.estado_pago === 'Vencido',
      };
    });
  }

  /**
   * Obtiene las clases de HOY de todos los hijos del tutor
   */
  private async obtenerClasesHoy(tutorId: string): Promise<ClaseHoy[]> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    // Obtener estudiantes del tutor
    const estudiantesIds = await this.prisma.estudiante.findMany({
      where: { tutor_id: tutorId },
      select: { id: true },
    });

    const estudiantesIdsArray = estudiantesIds.map((e) => e.id);

    // Obtener clases de hoy
    const clasesHoy = await this.prisma.clase.findMany({
      where: {
        fecha_hora_inicio: {
          gte: hoy,
          lt: manana,
        },
        estado: 'Programada',
        inscripciones: {
          some: {
            estudiante_id: { in: estudiantesIdsArray },
          },
        },
      },
      include: {
        rutaCurricular: {
          select: {
            nombre: true,
            color: true,
          },
        },
        docente: {
          select: {
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
    });

    const ahora = new Date();

    return clasesHoy.map((clase) => {
      const inscripcion = clase.inscripciones[0];
      const fechaHoraInicio = new Date(clase.fecha_hora_inicio);

      // Puede unirse si faltan menos de 10 minutos
      const diffMinutos =
        (fechaHoraInicio.getTime() - ahora.getTime()) / (1000 * 60);
      const puedeUnirse =
        diffMinutos <= 10 && diffMinutos >= -clase.duracion_minutos;

      return {
        id: clase.id,
        hora: fechaHoraInicio.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        nombreRuta: clase.rutaCurricular?.nombre || 'Clase sin ruta',
        colorRuta: clase.rutaCurricular?.color || undefined,
        estudianteId: inscripcion.estudiante.id,
        estudianteNombre: `${inscripcion.estudiante.nombre} ${inscripcion.estudiante.apellido}`,
        docenteNombre: `${clase.docente.nombre} ${clase.docente.apellido}`,
        fechaHoraInicio,
        urlReunion: undefined, // TODO: agregar campo en BD si existe
        puedeUnirse,
      };
    });
  }

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
        rutaCurricular: {
          select: {
            id: true,
            nombre: true,
            color: true,
          },
        },
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
    const pasadoManana = new Date(manana);
    pasadoManana.setDate(pasadoManana.getDate() + 1);

    const clasesProximas: ClaseProxima[] = clases.map((clase) => {
      const inscripcion = clase.inscripciones[0];
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

      return {
        id: clase.id,
        fechaHoraInicio,
        fechaHoraFin,
        duracionMinutos: clase.duracion_minutos,
        rutaCurricular: {
          id: clase.rutaCurricular?.id || '',
          nombre: clase.rutaCurricular?.nombre || 'Clase sin ruta',
          color: clase.rutaCurricular?.color || undefined,
        },
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
      };
    });

    return {
      clases: clasesProximas,
      total: clasesProximas.length,
    };
  }

  /**
   * Obtiene todas las alertas activas del tutor
   *
   * @param tutorId - ID del tutor autenticado
   * @returns Lista de alertas ordenadas por prioridad
   */
  async obtenerAlertas(tutorId: string): Promise<AlertasResponse> {
    const alertas: AlertaDashboard[] = [];

    // 1. Alertas de pagos vencidos y por vencer
    const pagosPendientes = await this.obtenerPagosPendientes(tutorId);

    for (const pago of pagosPendientes) {
      if (pago.estaVencido) {
        alertas.push({
          id: `pago-vencido-${pago.id}`,
          tipo: 'pago_vencido',
          prioridad: 'alta',
          titulo: 'Pago Vencido',
          mensaje: `Tenés $${pago.monto.toLocaleString('es-AR')} vencido (${Math.abs(pago.diasParaVencer)} días de atraso)`,
          accion: {
            label: 'Pagar Ahora',
            url: `/dashboard?tab=pagos&inscripcion=${pago.id}`,
          },
          metadata: {
            estudianteId: pago.estudianteId,
            estudianteNombre: pago.estudianteNombre,
            monto: pago.monto,
            fechaVencimiento: pago.fechaVencimiento,
          },
        });
      } else if (pago.diasParaVencer <= 7) {
        alertas.push({
          id: `pago-por-vencer-${pago.id}`,
          tipo: 'pago_por_vencer',
          prioridad: pago.diasParaVencer <= 3 ? 'alta' : 'media',
          titulo: 'Pago Próximo a Vencer',
          mensaje: `Tenés $${pago.monto.toLocaleString('es-AR')} pendiente. Vence en ${pago.diasParaVencer} ${pago.diasParaVencer === 1 ? 'día' : 'días'}`,
          accion: {
            label: 'Ver Detalles',
            url: `/dashboard?tab=pagos&inscripcion=${pago.id}`,
          },
          metadata: {
            estudianteId: pago.estudianteId,
            estudianteNombre: pago.estudianteNombre,
            monto: pago.monto,
            fechaVencimiento: pago.fechaVencimiento,
          },
        });
      }
    }

    // 2. Alertas de clases hoy
    const clasesHoy = await this.obtenerClasesHoy(tutorId);

    if (clasesHoy.length > 0) {
      alertas.push({
        id: 'clases-hoy',
        tipo: 'clase_hoy',
        prioridad: 'media',
        titulo: `${clasesHoy.length} ${clasesHoy.length === 1 ? 'Clase' : 'Clases'} Hoy`,
        mensaje: `Tenés ${clasesHoy.length} ${clasesHoy.length === 1 ? 'clase programada' : 'clases programadas'} para hoy`,
        accion: {
          label: 'Ver Calendario',
          url: '/dashboard?tab=calendario',
        },
      });
    }

    // 3. Alertas de asistencia baja (< 70%)
    const estudiantesIds = await this.prisma.estudiante.findMany({
      where: { tutor_id: tutorId },
      select: { id: true, nombre: true, apellido: true },
    });

    for (const estudiante of estudiantesIds) {
      const asistencias = await this.prisma.asistencia.groupBy({
        by: ['estado'],
        where: {
          estudiante_id: estudiante.id,
        },
        _count: {
          estado: true,
        },
      });

      let totalAsistencias = 0;
      let asistenciasPresente = 0;

      for (const grupo of asistencias) {
        totalAsistencias += grupo._count.estado;
        if (grupo.estado === 'Presente') {
          asistenciasPresente += grupo._count.estado;
        }
      }

      if (totalAsistencias >= 5) {
        // Solo alertar si tiene al menos 5 clases
        const porcentajeAsistencia = Math.round(
          (asistenciasPresente / totalAsistencias) * 100,
        );

        if (porcentajeAsistencia < 70) {
          alertas.push({
            id: `asistencia-baja-${estudiante.id}`,
            tipo: 'asistencia_baja',
            prioridad: porcentajeAsistencia < 50 ? 'alta' : 'media',
            titulo: 'Asistencia Baja',
            mensaje: `${estudiante.nombre} ${estudiante.apellido} tiene ${porcentajeAsistencia}% de asistencia`,
            accion: {
              label: 'Ver Detalle',
              url: `/dashboard?tab=hijos&estudiante=${estudiante.id}`,
            },
            metadata: {
              estudianteId: estudiante.id,
              estudianteNombre: `${estudiante.nombre} ${estudiante.apellido}`,
              porcentajeAsistencia,
            },
          });
        }
      }
    }

    // Ordenar alertas por prioridad (alta -> media -> baja)
    const prioridadOrden: Record<PrioridadAlerta, number> = {
      alta: 1,
      media: 2,
      baja: 3,
    };

    alertas.sort(
      (a, b) => prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad],
    );

    return {
      alertas,
      total: alertas.length,
      hayAlertas: alertas.length > 0,
    };
  }
}
