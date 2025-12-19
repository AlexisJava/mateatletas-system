/**
 * Constantes y funciones para el cálculo de descuentos familiares
 *
 * Regla de negocio:
 * - Primer hijo: 0% descuento (precio base)
 * - Segundo hijo: 10% descuento
 * - Tercer hijo: 20% descuento
 * - Cuarto hijo: 30% descuento
 * - Máximo: 50% descuento
 */

/**
 * Porcentaje de descuento por cada hijo adicional
 * Ejemplo: 2do hijo = 10%, 3er hijo = 20%, etc.
 */
export const DESCUENTO_POR_HIJO_ADICIONAL = 10;

/**
 * Porcentaje máximo de descuento permitido
 * Protege contra descuentos excesivos
 */
export const DESCUENTO_MAXIMO = 50;

/**
 * Resultado del cálculo de precio con descuento
 */
export interface ResultadoDescuento {
  /** Precio base antes de descuento */
  precioBase: number;
  /** Porcentaje de descuento aplicado (0, 10, 20, etc.) */
  descuentoPorcentaje: number;
  /** Monto del descuento en pesos */
  descuentoMonto: number;
  /** Precio final después del descuento */
  precioFinal: number;
}

/**
 * Calcula el porcentaje de descuento según el número de hijo
 *
 * @param numeroHijo - Posición del hijo (1 = primero, 2 = segundo, etc.)
 * @returns Porcentaje de descuento (0, 10, 20, etc.)
 *
 * @example
 * calcularDescuentoFamiliar(1) // 0 (primer hijo, sin descuento)
 * calcularDescuentoFamiliar(2) // 10 (segundo hijo, 10% off)
 * calcularDescuentoFamiliar(3) // 20 (tercer hijo, 20% off)
 */
export function calcularDescuentoFamiliar(numeroHijo: number): number {
  // Validación: número de hijo debe ser positivo
  if (numeroHijo <= 0) {
    return 0;
  }

  // Primer hijo no tiene descuento
  if (numeroHijo === 1) {
    return 0;
  }

  // Calcular descuento: (numeroHijo - 1) * 10%
  const descuento = (numeroHijo - 1) * DESCUENTO_POR_HIJO_ADICIONAL;

  // Aplicar máximo
  return Math.min(descuento, DESCUENTO_MAXIMO);
}

/**
 * Calcula el precio final con descuento familiar aplicado
 *
 * @param precioBase - Precio base del plan en pesos
 * @param numeroHijo - Posición del hijo (1 = primero, 2 = segundo, etc.)
 * @returns Objeto con desglose del cálculo
 *
 * @example
 * calcularPrecioConDescuento(40000, 1)
 * // { precioBase: 40000, descuentoPorcentaje: 0, descuentoMonto: 0, precioFinal: 40000 }
 *
 * calcularPrecioConDescuento(40000, 2)
 * // { precioBase: 40000, descuentoPorcentaje: 10, descuentoMonto: 4000, precioFinal: 36000 }
 */
export function calcularPrecioConDescuento(
  precioBase: number,
  numeroHijo: number,
): ResultadoDescuento {
  const descuentoPorcentaje = calcularDescuentoFamiliar(numeroHijo);
  const descuentoMonto = Math.round((precioBase * descuentoPorcentaje) / 100);
  const precioFinal = precioBase - descuentoMonto;

  return {
    precioBase,
    descuentoPorcentaje,
    descuentoMonto,
    precioFinal,
  };
}

/**
 * Calcula el total para una familia con múltiples hijos
 *
 * @param precioBase - Precio base del plan
 * @param cantidadHijos - Cantidad total de hijos a inscribir
 * @returns Total a pagar y ahorro
 *
 * @example
 * calcularTotalFamilia(40000, 3)
 * // { totalSinDescuento: 120000, totalConDescuento: 108000, ahorroTotal: 12000 }
 */
export function calcularTotalFamilia(
  precioBase: number,
  cantidadHijos: number,
): {
  totalSinDescuento: number;
  totalConDescuento: number;
  ahorroTotal: number;
} {
  let totalConDescuento = 0;

  for (let hijo = 1; hijo <= cantidadHijos; hijo++) {
    const resultado = calcularPrecioConDescuento(precioBase, hijo);
    totalConDescuento += resultado.precioFinal;
  }

  const totalSinDescuento = precioBase * cantidadHijos;
  const ahorroTotal = totalSinDescuento - totalConDescuento;

  return {
    totalSinDescuento,
    totalConDescuento,
    ahorroTotal,
  };
}
