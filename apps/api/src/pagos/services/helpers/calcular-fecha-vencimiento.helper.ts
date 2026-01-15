import { BadRequestException } from '@nestjs/common';

/**
 * Constantes de fechas de pago del Club
 */
export const FECHA_VENCIMIENTO_NORMAL = 9; // Hasta el día 9: pago normal
export const FECHA_VENCIMIENTO_CON_RECARGO = 12; // Del 10 al 12: pago con recargo
export const PORCENTAJE_RECARGO = 15; // 15% de recargo

/**
 * Estados posibles de una cuota según la fecha actual
 */
export type EstadoCuota = 'VIGENTE' | 'CON_RECARGO' | 'ANULABLE';

/**
 * Resultado del análisis de estado de pago
 */
export interface EstadoPagoInfo {
  estado: EstadoCuota;
  diasRestantes: number;
  porcentajeRecargo: number;
  montoRecargo: number;
  montoTotal: number;
}

/**
 * Parsea un periodo en formato YYYY-MM y retorna año y mes
 */
function parsearPeriodo(periodo: string): { anio: number; mes: number } {
  const [anioStr, mesStr] = periodo.split('-');
  const anio = Number(anioStr);
  const mes = Number(mesStr);

  if (
    !Number.isInteger(anio) ||
    !Number.isInteger(mes) ||
    mes < 1 ||
    mes > 12
  ) {
    throw new BadRequestException(`Período inválido recibido: "${periodo}"`);
  }

  return { anio, mes };
}

/**
 * Calcula la fecha de vencimiento SIN RECARGO de una inscripción mensual.
 * Día 9 del mes del periodo a las 23:59:59.999
 *
 * @param periodo - Periodo en formato YYYY-MM
 * @returns Fecha del día 9 del mes
 */
export function calcularFechaVencimiento(periodo: string): Date {
  const { anio, mes } = parsearPeriodo(periodo);
  return new Date(anio, mes - 1, FECHA_VENCIMIENTO_NORMAL, 23, 59, 59, 999);
}

/**
 * Calcula la fecha límite de pago CON RECARGO.
 * Día 12 del mes del periodo a las 23:59:59.999
 * Después de esta fecha, la inscripción se anula.
 *
 * @param periodo - Periodo en formato YYYY-MM
 * @returns Fecha del día 12 del mes
 */
export function calcularFechaLimiteRecargo(periodo: string): Date {
  const { anio, mes } = parsearPeriodo(periodo);
  return new Date(
    anio,
    mes - 1,
    FECHA_VENCIMIENTO_CON_RECARGO,
    23,
    59,
    59,
    999,
  );
}

/**
 * Determina el estado de pago de una cuota según la fecha actual.
 *
 * - VIGENTE: Hasta el día 9 - pago normal
 * - CON_RECARGO: Del 10 al 12 - pago con 15% recargo
 * - ANULABLE: Después del 12 - debe anularse
 *
 * @param periodo - Periodo en formato YYYY-MM
 * @param montoBase - Monto base de la cuota
 * @param fechaActual - Fecha actual (opcional, default: now)
 * @returns Información del estado de pago
 */
export function calcularEstadoPago(
  periodo: string,
  montoBase: number,
  fechaActual: Date = new Date(),
): EstadoPagoInfo {
  const fechaVencimiento = calcularFechaVencimiento(periodo);
  const fechaLimite = calcularFechaLimiteRecargo(periodo);

  // Normalizar a inicio del día para comparaciones justas
  const hoy = new Date(fechaActual);
  hoy.setHours(0, 0, 0, 0);

  const fechaVencimientoNorm = new Date(fechaVencimiento);
  fechaVencimientoNorm.setHours(0, 0, 0, 0);

  const fechaLimiteNorm = new Date(fechaLimite);
  fechaLimiteNorm.setHours(0, 0, 0, 0);

  const diffVencimiento = Math.ceil(
    (fechaVencimientoNorm.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (hoy <= fechaVencimientoNorm) {
    // Hasta el día 9: pago normal
    return {
      estado: 'VIGENTE',
      diasRestantes: diffVencimiento,
      porcentajeRecargo: 0,
      montoRecargo: 0,
      montoTotal: montoBase,
    };
  } else if (hoy <= fechaLimiteNorm) {
    // Del 10 al 12: con recargo
    const diffLimite = Math.ceil(
      (fechaLimiteNorm.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
    );
    const montoRecargo = Math.round(montoBase * (PORCENTAJE_RECARGO / 100));
    return {
      estado: 'CON_RECARGO',
      diasRestantes: diffLimite,
      porcentajeRecargo: PORCENTAJE_RECARGO,
      montoRecargo,
      montoTotal: montoBase + montoRecargo,
    };
  } else {
    // Después del 12: anulable
    return {
      estado: 'ANULABLE',
      diasRestantes: 0,
      porcentajeRecargo: 0,
      montoRecargo: 0,
      montoTotal: montoBase,
    };
  }
}

/**
 * Calcula el monto proporcional para inscripciones tardías.
 * Si alguien se inscribe después del día 12, paga proporcional por días restantes.
 *
 * @param montoMensual - Monto mensual completo
 * @param fechaInscripcion - Fecha de inscripción
 * @returns Monto proporcional a pagar
 */
export function calcularMontoProporcional(
  montoMensual: number,
  fechaInscripcion: Date,
): number {
  const dia = fechaInscripcion.getDate();

  // Si se inscribe antes o el día 12, paga el mes completo
  if (dia <= FECHA_VENCIMIENTO_CON_RECARGO) {
    return montoMensual;
  }

  // Calcular días restantes del mes
  const anio = fechaInscripcion.getFullYear();
  const mes = fechaInscripcion.getMonth();
  const ultimoDiaMes = new Date(anio, mes + 1, 0).getDate();
  const diasRestantes = ultimoDiaMes - dia + 1; // +1 para incluir el día actual

  // Proporcional
  const montoPorDia = montoMensual / ultimoDiaMes;
  return Math.round(montoPorDia * diasRestantes);
}

/**
 * Verifica si una fecha está en periodo de recargo (día 10-12)
 */
export function estaEnPeriodoRecargo(fecha: Date, periodo: string): boolean {
  const estado = calcularEstadoPago(periodo, 0, fecha);
  return estado.estado === 'CON_RECARGO';
}

/**
 * Verifica si una fecha ya pasó el límite de pago (después del 12)
 */
export function estaPasadoLimite(fecha: Date, periodo: string): boolean {
  const estado = calcularEstadoPago(periodo, 0, fecha);
  return estado.estado === 'ANULABLE';
}
