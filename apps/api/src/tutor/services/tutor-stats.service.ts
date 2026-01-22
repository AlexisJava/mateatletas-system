import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { InscripcionMensual } from '../../pagos/domain/repositories/inscripcion-mensual.repository.interface';
import {
  MetricasDashboard,
  AlertaDashboard,
  PagoPendiente,
  ClaseHoy,
  PrioridadAlerta,
  HijoInfo,
} from '../types/tutor-dashboard.types';

// ============================================================================
// TIPOS INTERNOS (sin any ni unknown)
// ============================================================================

type _InscripcionFinanciera = {
  estadoPago: string;
  precioFinal: number;
  estudianteId: string;
};

type _EstudianteBasico = {
  id: string;
  nombre: string;
  apellido: string;
};

type _PagosPendientesResult = {
  id: string;
  periodo: string;
  precioFinal: number;
  estadoPago: string;
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
  };
  producto: {
    nombre: string;
  } | null;
};

type _ClaseConInscripcion = {
  id: string;
  fechaHoraInicio: Date;
  duracionMinutos: number;
  estado: string;
  docente: {
    nombre: string;
    apellido: string;
  };
  inscripciones: Array<{
    estudiante: {
      id: string;
      nombre: string;
      apellido: string;
    };
  }>;
};

type _AsistenciaGroupBy = {
  estado: string;
  _count: {
    estado: number;
  };
};

/**
 * TutorStatsService
 *
 * Servicio especializado en cálculos, agregaciones y estadísticas
 * para el módulo Tutor.
 *
 * Responsabilidades:
 * - Calcular resúmenes financieros
 * - Obtener métricas del dashboard
 * - Construir alertas con lógica de prioridades
 * - Calcular asistencias y pagos pendientes
 *
 * Patrón: Service especializado en estadísticas (parte de CQRS)
 */
@Injectable()
export class TutorStatsService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // CÁLCULOS FINANCIEROS
  // ============================================================================

  /**
   * Calcula el resumen financiero de las inscripciones
   *
   * @param inscripciones - Array de inscripciones mensuales
   * @returns Resumen con totales y conteos
   */
  calcularResumen(inscripciones: InscripcionMensual[]): {
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
      const estado = inscripcion.estadoPago as string;
      if (estado === 'Pendiente' || estado === 'Vencido') {
        totalPendiente += Number(inscripcion.precioFinal);
      } else if (estado === 'Pagado') {
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

  // ============================================================================
  // MÉTRICAS DASHBOARD
  // ============================================================================

  /**
   * Calcula las métricas principales del dashboard del tutor
   *
   * @param tutorId - ID del tutor
   * @returns Métricas: totalHijos, clasesDelMes, totalPagadoAnio, asistenciaPromedio
   */
  async calcularMetricasDashboard(tutorId: string): Promise<MetricasDashboard> {
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
      where: { tutorId: tutorId },
    });

    // 2. Clases del mes actual (de TODOS los hijos)
    const estudiantesIds = await this.prisma.estudiante.findMany({
      where: { tutorId: tutorId },
      select: { id: true },
    });

    const estudiantesIdsArray = estudiantesIds.map((e) => e.id);

    const clasesDelMes = await this.prisma.inscripcionClase.count({
      where: {
        estudianteId: { in: estudiantesIdsArray },
        clase: {
          fechaHoraInicio: {
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
          tutorId: tutorId,
          estadoPago: 'Pagado',
          createdAt: { gte: inicioAnio },
        },
        _sum: {
          precioFinal: true,
        },
      },
    );

    const totalPagadoAnio = inscripcionesPagadas._sum.precioFinal
      ? Math.round(Number(inscripcionesPagadas._sum.precioFinal))
      : 0;

    // 4. Asistencia promedio (de todos los hijos)
    const asistencias = await this.prisma.asistencia.groupBy({
      by: ['estado'],
      where: {
        estudianteId: { in: estudiantesIdsArray },
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

  // ============================================================================
  // PAGOS PENDIENTES
  // ============================================================================

  /**
   * Obtiene los pagos pendientes del tutor ordenados por fecha de vencimiento
   *
   * @param tutorId - ID del tutor
   * @returns Lista de pagos pendientes con cálculo de días para vencer
   */
  async obtenerPagosPendientes(tutorId: string): Promise<PagoPendiente[]> {
    // Obtener inscripciones mensuales pendientes o vencidas
    const inscripcionesPendientes =
      await this.prisma.inscripcionMensual.findMany({
        where: {
          tutorId: tutorId,
          estadoPago: { in: ['Pendiente', 'Vencido'] },
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
      const periodoParts = inscripcion.periodo.split('-');
      const anioStr = periodoParts[0];
      const mesStr = periodoParts[1];
      if (!anioStr || !mesStr) {
        throw new Error(
          `Periodo inválido: "${inscripcion.periodo}" - formato esperado: YYYY-MM`,
        );
      }
      const anio = Number(anioStr);
      const mes = Number(mesStr);
      const fechaVencimiento = new Date(anio, mes, 0); // Último día del mes

      // Calcular días para vencer (negativo si ya venció)
      const ahora = new Date();
      ahora.setHours(0, 0, 0, 0);
      const diffTime = fechaVencimiento.getTime() - ahora.getTime();
      const diasParaVencer = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        id: inscripcion.id,
        monto: Math.round(Number(inscripcion.precioFinal)),
        concepto: inscripcion.producto?.nombre || 'Inscripción mensual',
        fechaVencimiento,
        diasParaVencer,
        estudianteId: inscripcion.estudiante.id,
        estudianteNombre: `${inscripcion.estudiante.nombre} ${inscripcion.estudiante.apellido}`,
        estaVencido: inscripcion.estadoPago === 'Vencido',
      };
    });
  }

  // ============================================================================
  // CLASES HOY
  // ============================================================================

  /**
   * Obtiene las clases de HOY de todos los hijos del tutor
   *
   * @param tutorId - ID del tutor
   * @returns Lista de clases de hoy con flags de disponibilidad
   */
  async obtenerClasesHoy(tutorId: string): Promise<ClaseHoy[]> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    // Obtener estudiantes del tutor
    const estudiantesIds = await this.prisma.estudiante.findMany({
      where: { tutorId: tutorId },
      select: { id: true },
    });

    const estudiantesIdsArray = estudiantesIds.map((e) => e.id);

    // Obtener clases de hoy
    const clasesHoy = await this.prisma.clase.findMany({
      where: {
        fechaHoraInicio: {
          gte: hoy,
          lt: manana,
        },
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
    });

    const ahora = new Date();

    // Usar flatMap para filtrar y mapear (narrowing correcto)
    return clasesHoy.flatMap((clase) => {
      const inscripcion = clase.inscripciones[0];
      // Skip clases sin inscripciones
      if (!inscripcion) {
        return [];
      }
      const fechaHoraInicio = new Date(clase.fechaHoraInicio);

      // Puede unirse si faltan menos de 10 minutos
      const diffMinutos =
        (fechaHoraInicio.getTime() - ahora.getTime()) / (1000 * 60);
      const puedeUnirse =
        diffMinutos <= 10 && diffMinutos >= -clase.duracionMinutos;

      return [
        {
          id: clase.id,
          hora: fechaHoraInicio.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
          nombreClase: clase.nombre,
          estudianteId: inscripcion.estudiante.id,
          estudianteNombre: `${inscripcion.estudiante.nombre} ${inscripcion.estudiante.apellido}`,
          docenteNombre: `${clase.docente.nombre} ${clase.docente.apellido}`,
          fechaHoraInicio,
          urlReunion: undefined,
          puedeUnirse,
        },
      ];
    });
  }

  // ============================================================================
  // ALERTAS
  // ============================================================================

  /**
   * Construye todas las alertas activas del tutor
   *
   * @param tutorId - ID del tutor
   * @param pagosPendientes - Pagos pendientes previamente calculados
   * @param clasesHoy - Clases de hoy previamente calculadas
   * @returns Lista de alertas ordenadas por prioridad
   */
  async construirAlertas(
    tutorId: string,
    pagosPendientes: PagoPendiente[],
    clasesHoy: ClaseHoy[],
  ): Promise<AlertaDashboard[]> {
    const alertas: AlertaDashboard[] = [];

    // 1. Alertas de pagos
    this.agregarAlertasPagos(alertas, pagosPendientes);

    // 2. Alertas de clases hoy
    this.agregarAlertaClasesHoy(alertas, clasesHoy);

    // 3. Alertas de asistencia baja
    await this.agregarAlertasAsistenciaBaja(alertas, tutorId);

    // Ordenar por prioridad
    return this.ordenarAlertasPorPrioridad(alertas);
  }

  /**
   * Agrega alertas de pagos vencidos y por vencer
   */
  private agregarAlertasPagos(
    alertas: AlertaDashboard[],
    pagosPendientes: PagoPendiente[],
  ): void {
    for (const pago of pagosPendientes) {
      const alerta = this.crearAlertaPago(pago);
      if (alerta) {
        alertas.push(alerta);
      }
    }
  }

  /**
   * Crea una alerta de pago según su estado
   */
  private crearAlertaPago(pago: PagoPendiente): AlertaDashboard | null {
    const metadata = {
      estudianteId: pago.estudianteId,
      estudianteNombre: pago.estudianteNombre,
      monto: pago.monto,
      fechaVencimiento: pago.fechaVencimiento,
    };

    if (pago.estaVencido) {
      return {
        id: `pago-vencido-${pago.id}`,
        tipo: 'pagoVencido',
        prioridad: 'alta',
        titulo: 'Pago Vencido',
        mensaje: `Tenés $${pago.monto.toLocaleString('es-AR')} vencido (${Math.abs(pago.diasParaVencer)} días de atraso)`,
        accion: {
          label: 'Pagar Ahora',
          url: `/dashboard?tab=pagos&inscripcion=${pago.id}`,
        },
        metadata,
      };
    }

    if (pago.diasParaVencer <= 7) {
      const diasLabel = pago.diasParaVencer === 1 ? 'día' : 'días';
      return {
        id: `pago-por-vencer-${pago.id}`,
        tipo: 'pagoPorVencer',
        prioridad: pago.diasParaVencer <= 3 ? 'alta' : 'media',
        titulo: 'Pago Próximo a Vencer',
        mensaje: `Tenés $${pago.monto.toLocaleString('es-AR')} pendiente. Vence en ${pago.diasParaVencer} ${diasLabel}`,
        accion: {
          label: 'Ver Detalles',
          url: `/dashboard?tab=pagos&inscripcion=${pago.id}`,
        },
        metadata,
      };
    }

    return null;
  }

  /**
   * Agrega alerta de clases de hoy si existen
   */
  private agregarAlertaClasesHoy(
    alertas: AlertaDashboard[],
    clasesHoy: ClaseHoy[],
  ): void {
    if (clasesHoy.length === 0) return;

    const claseLabel = clasesHoy.length === 1 ? 'Clase' : 'Clases';
    const programadaLabel =
      clasesHoy.length === 1 ? 'clase programada' : 'clases programadas';

    alertas.push({
      id: 'clases-hoy',
      tipo: 'claseHoy',
      prioridad: 'media',
      titulo: `${clasesHoy.length} ${claseLabel} Hoy`,
      mensaje: `Tenés ${clasesHoy.length} ${programadaLabel} para hoy`,
      accion: { label: 'Ver Calendario', url: '/dashboard?tab=calendario' },
    });
  }

  /**
   * Agrega alertas de asistencia baja para estudiantes con menos del 70%
   */
  private async agregarAlertasAsistenciaBaja(
    alertas: AlertaDashboard[],
    tutorId: string,
  ): Promise<void> {
    const estudiantes = await this.prisma.estudiante.findMany({
      where: { tutorId: tutorId },
      select: { id: true, nombre: true, apellido: true },
    });

    for (const estudiante of estudiantes) {
      const porcentaje = await this.calcularPorcentajeAsistencia(estudiante.id);
      if (porcentaje !== null && porcentaje < 70) {
        alertas.push({
          id: `asistencia-baja-${estudiante.id}`,
          tipo: 'asistenciaBaja',
          prioridad: porcentaje < 50 ? 'alta' : 'media',
          titulo: 'Asistencia Baja',
          mensaje: `${estudiante.nombre} ${estudiante.apellido} tiene ${porcentaje}% de asistencia`,
          accion: {
            label: 'Ver Detalle',
            url: `/dashboard?tab=hijos&estudiante=${estudiante.id}`,
          },
          metadata: {
            estudianteId: estudiante.id,
            estudianteNombre: `${estudiante.nombre} ${estudiante.apellido}`,
            porcentajeAsistencia: porcentaje,
          },
        });
      }
    }
  }

  /**
   * Calcula el porcentaje de asistencia de un estudiante
   * @returns null si tiene menos de 5 clases (no hay suficiente data)
   */
  private async calcularPorcentajeAsistencia(
    estudianteId: string,
  ): Promise<number | null> {
    const asistencias = await this.prisma.asistencia.groupBy({
      by: ['estado'],
      where: { estudianteId: estudianteId },
      _count: { estado: true },
    });

    let total = 0;
    let presentes = 0;

    for (const grupo of asistencias) {
      total += grupo._count.estado;
      if (grupo.estado === 'Presente') {
        presentes += grupo._count.estado;
      }
    }

    // Solo alertar si tiene al menos 5 clases
    if (total < 5) return null;

    return Math.round((presentes / total) * 100);
  }

  /**
   * Ordena alertas por prioridad (alta -> media -> baja)
   */
  private ordenarAlertasPorPrioridad(
    alertas: AlertaDashboard[],
  ): AlertaDashboard[] {
    const orden: Record<PrioridadAlerta, number> = {
      alta: 1,
      media: 2,
      baja: 3,
    };
    return alertas.sort((a, b) => orden[a.prioridad] - orden[b.prioridad]);
  }

  // ============================================================================
  // HIJOS
  // ============================================================================

  /**
   * Obtiene la información de los hijos del tutor con métricas
   *
   * @param tutorId - ID del tutor
   * @returns Lista de hijos con puntos y asistencia
   */
  async obtenerHijos(tutorId: string): Promise<HijoInfo[]> {
    const estudiantes = await this.prisma.estudiante.findMany({
      where: { tutorId: tutorId },
      include: {
        casa: {
          select: { nombre: true },
        },
        recursos: {
          select: { xpTotal: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    // Calcular asistencia para cada estudiante
    const hijosConAsistencia: HijoInfo[] = [];

    for (const estudiante of estudiantes) {
      // Obtener asistencias del estudiante
      const asistencias = await this.prisma.asistencia.groupBy({
        by: ['estado'],
        where: { estudianteId: estudiante.id },
        _count: { estado: true },
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

      hijosConAsistencia.push({
        id: estudiante.id,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        edad: estudiante.edad,
        nivelEscolar: estudiante.nivelEscolar,
        casa: estudiante.casa?.nombre ?? null,
        puntosTotales: estudiante.recursos?.xpTotal ?? 0,
        asistenciaPromedio,
        avatarUrl: null,
      });
    }

    return hijosConAsistencia;
  }
}
