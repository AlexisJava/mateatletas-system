import { BadRequestException } from '@nestjs/common';

/**
 * Calcula la fecha de vencimiento real de una inscripción mensual
 * a partir del período en formato YYYY-MM.
 *
 * El vencimiento se establece en el último día del mes (hora 23:59:59.999)
 * para evitar falsos positivos en comparaciones con fechas actuales.
 */
export function calcularFechaVencimiento(periodo: string): Date {
  const [anioStr, mesStr] = periodo.split('-');
  const anio = Number(anioStr);
  const mes = Number(mesStr);

  if (!Number.isInteger(anio) || !Number.isInteger(mes) || mes < 1 || mes > 12) {
    throw new BadRequestException(
      `Período inválido recibido para calcular fecha de vencimiento: "${periodo}"`,
    );
  }

  const fechaVencimiento = new Date(anio, mes, 0, 23, 59, 59, 999);
  return fechaVencimiento;
}
