import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { IInscripcionMensualRepository, MetricasPeriodo } from '../../domain/repositories/inscripcion-mensual.repository.interface';
import {
  ObtenerMetricasDashboardInputDTO,
  ObtenerMetricasDashboardOutputDTO,
  MetricasGeneralesDTO,
  EvolucionMensualDTO,
  DistribucionEstadoPagoDTO,
} from '../dtos/obtener-metricas-dashboard.dto';

/**
 * Use Case: Obtener Métricas del Dashboard
 *
 * Responsabilidades (Application Layer):
 * 1. Obtener métricas del mes actual
 * 2. Comparar con el mes anterior
 * 3. Obtener evolución de últimos 6 meses
 * 4. Calcular distribución por estados de pago
 * 5. Calcular tasas y porcentajes
 *
 * Flujo:
 * 1. Determinar período actual (año-mes)
 * 2. Obtener métricas del período actual
 * 3. Obtener métricas del período anterior
 * 4. Calcular comparaciones y porcentajes
 * 5. Obtener evolución mensual (últimos 6 meses)
 * 6. Calcular distribución por estados
 * 7. Retornar DTO completo
 */
@Injectable()
export class ObtenerMetricasDashboardUseCase {
  constructor(
    private readonly inscripcionRepo: IInscripcionMensualRepository,
  ) {}

  async execute(
    input: ObtenerMetricasDashboardInputDTO,
  ): Promise<ObtenerMetricasDashboardOutputDTO> {
    // 1. Determinar período actual
    const { anio, mes } = this.obtenerPeriodoActual(input);
    const periodoActual = this.generarPeriodo(anio, mes);

    // 2. Obtener métricas del período actual
    const metricasActuales =
      await this.inscripcionRepo.obtenerMetricasPorPeriodo(
        periodoActual,
        input.tutorId,
      );

    // 3. Obtener métricas del período anterior
    const { anio: anioAnterior, mes: mesAnterior } = this.obtenerMesAnterior(
      anio,
      mes,
    );
    const periodoAnterior = this.generarPeriodo(anioAnterior, mesAnterior);
    const metricasAnteriores =
      await this.inscripcionRepo.obtenerMetricasPorPeriodo(
        periodoAnterior,
        input.tutorId,
      );

    // 4. Calcular métricas generales con comparaciones
    const metricas = this.calcularMetricasGenerales(
      metricasActuales,
      metricasAnteriores,
    );

    // 5. Obtener evolución mensual (últimos 6 meses)
    const evolucionMensual = await this.obtenerEvolucionMensual(
      anio,
      mes,
      input.tutorId,
    );

    // 6. Calcular distribución por estados
    const distribucionEstados =
      this.calcularDistribucionEstados(metricasActuales);

    return {
      periodo: periodoActual,
      metricas,
      evolucionMensual,
      distribucionEstados,
    };
  }

  /**
   * Obtiene el período actual (año-mes)
   */
  private obtenerPeriodoActual(input: ObtenerMetricasDashboardInputDTO): {
    anio: number;
    mes: number;
  } {
    const now = new Date();
    return {
      anio: input.anio || now.getFullYear(),
      mes: input.mes || now.getMonth() + 1, // getMonth() retorna 0-11
    };
  }

  /**
   * Genera período en formato "YYYY-MM"
   */
  private generarPeriodo(anio: number, mes: number): string {
    const mesStr = mes.toString().padStart(2, '0');
    return `${anio}-${mesStr}`;
  }

  /**
   * Obtiene el mes anterior
   */
  private obtenerMesAnterior(
    anio: number,
    mes: number,
  ): { anio: number; mes: number } {
    if (mes === 1) {
      return { anio: anio - 1, mes: 12 };
    }
    return { anio, mes: mes - 1 };
  }

  /**
   * Calcula métricas generales con comparaciones
   */
  private calcularMetricasGenerales(
    metricasActuales: MetricasPeriodo,
    metricasAnteriores: MetricasPeriodo,
  ): MetricasGeneralesDTO {
    // Calcular tasa de cobro actual
    const totalEsperado = metricasActuales.totalIngresos
      .plus(metricasActuales.totalPendientes)
      .plus(metricasActuales.totalVencidos);

    const tasaCobroActual = totalEsperado.isZero()
      ? new Decimal(0)
      : metricasActuales.totalIngresos.dividedBy(totalEsperado).times(100);

    // Calcular tasa de cobro anterior
    const totalEsperadoAnterior = metricasAnteriores.totalIngresos
      .plus(metricasAnteriores.totalPendientes)
      .plus(metricasAnteriores.totalVencidos);

    const tasaCobroAnterior = totalEsperadoAnterior.isZero()
      ? new Decimal(0)
      : metricasAnteriores.totalIngresos
          .dividedBy(totalEsperadoAnterior)
          .times(100);

    // Calcular cambios porcentuales
    const ingresosCambio = this.calcularCambioPorcentual(
      metricasActuales.totalIngresos,
      metricasAnteriores.totalIngresos,
    );

    const pendientesCambio = this.calcularCambioPorcentual(
      metricasActuales.totalPendientes,
      metricasAnteriores.totalPendientes,
    );

    const inscripcionesCambio =
      metricasActuales.cantidadInscripciones -
      metricasAnteriores.cantidadInscripciones;

    const tasaCobroCambio = tasaCobroActual.minus(tasaCobroAnterior);

    return {
      ingresosMesActual: metricasActuales.totalIngresos,
      pagosPendientes: metricasActuales.totalPendientes,
      inscripcionesActivas: metricasActuales.cantidadInscripciones,
      tasaCobroActual,
      comparacionMesAnterior: {
        ingresosCambio,
        pendientesCambio,
        inscripcionesCambio,
        tasaCobroCambio,
      },
    };
  }

  /**
   * Calcula cambio porcentual entre dos valores
   */
  private calcularCambioPorcentual(
    actual: Decimal,
    anterior: Decimal,
  ): Decimal {
    if (anterior.isZero()) {
      return actual.isZero() ? new Decimal(0) : new Decimal(100);
    }

    return actual.minus(anterior).dividedBy(anterior).times(100);
  }

  /**
   * Obtiene evolución mensual de últimos 6 meses
   */
  private async obtenerEvolucionMensual(
    anioActual: number,
    mesActual: number,
    tutorId?: string,
  ): Promise<EvolucionMensualDTO[]> {
    const evolucion: EvolucionMensualDTO[] = [];

    // Generar últimos 6 períodos (incluyendo el actual)
    let anio = anioActual;
    let mes = mesActual;

    for (let i = 0; i < 6; i++) {
      const periodo = this.generarPeriodo(anio, mes);
      const metricas = await this.inscripcionRepo.obtenerMetricasPorPeriodo(
        periodo,
        tutorId,
      );

      const totalEsperado = metricas.totalIngresos
        .plus(metricas.totalPendientes)
        .plus(metricas.totalVencidos);

      evolucion.unshift({
        periodo,
        ingresos: metricas.totalIngresos,
        pendientes: metricas.totalPendientes,
        totalEsperado,
      });

      // Retroceder un mes
      const mesAnterior = this.obtenerMesAnterior(anio, mes);
      anio = mesAnterior.anio;
      mes = mesAnterior.mes;
    }

    return evolucion;
  }

  /**
   * Calcula distribución por estados de pago
   */
  private calcularDistribucionEstados(
    metricas: any,
  ): DistribucionEstadoPagoDTO[] {
    const total = metricas.totalIngresos
      .plus(metricas.totalPendientes)
      .plus(metricas.totalVencidos);

    const calcularPorcentaje = (monto: Decimal): Decimal => {
      return total.isZero()
        ? new Decimal(0)
        : monto.dividedBy(total).times(100);
    };

    return [
      {
        estado: 'Pagado',
        cantidad: metricas.cantidadPagadas,
        monto: metricas.totalIngresos,
        porcentaje: calcularPorcentaje(metricas.totalIngresos),
      },
      {
        estado: 'Pendiente',
        cantidad: metricas.cantidadPendientes,
        monto: metricas.totalPendientes,
        porcentaje: calcularPorcentaje(metricas.totalPendientes),
      },
      {
        estado: 'Vencido',
        cantidad: metricas.cantidadVencidas,
        monto: metricas.totalVencidos,
        porcentaje: calcularPorcentaje(metricas.totalVencidos),
      },
    ];
  }
}
