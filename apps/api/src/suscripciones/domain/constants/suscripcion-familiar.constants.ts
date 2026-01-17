/**
 * Constantes y funciones para el cálculo de precios de Suscripciones Familiares 2026
 *
 * Modelo de negocio:
 * - Una suscripción por familia
 * - Precio base según tier: STEAM_LIBROS ($40k), STEAM_ASINCRONICO ($65k), STEAM_SINCRONICO ($95k)
 * - Descuento 10% FIJO desde la 2da actividad (no incremental como el modelo anterior)
 * - Clubs adicionales tienen precio por producto
 *
 * DIFERENCIA vs modelo 2025:
 * - Antes: Descuento por hijo (10%, 20%, 30%... hasta 50%)
 * - Ahora: Descuento FIJO 10% desde la 2da actividad, sin límite
 */

import { TierNombre } from '@prisma/client';
import {
  TIERS_STEAM,
  DESCUENTO_FAMILIAR_STEAM,
} from '../../../domain/constants/pricing.constants';

/**
 * Porcentaje de descuento aplicado desde la 2da actividad
 * 10% FIJO para todas las actividades después de la primera
 */
export const DESCUENTO_ACTIVIDAD_ADICIONAL = DESCUENTO_FAMILIAR_STEAM;

/**
 * Obtiene el precio base de un tier
 *
 * @param tier - Tier de la suscripción
 * @returns Precio en pesos argentinos
 */
export function obtenerPrecioTier(tier: TierNombre): number {
  switch (tier) {
    case 'STEAM_LIBROS':
      return TIERS_STEAM.STEAM_LIBROS;
    case 'STEAM_ASINCRONICO':
      return TIERS_STEAM.STEAM_ASINCRONICO;
    case 'STEAM_SINCRONICO':
      return TIERS_STEAM.STEAM_SINCRONICO;
    default:
      return TIERS_STEAM.STEAM_LIBROS;
  }
}

/**
 * Resultado del cálculo de precio por actividad
 */
export interface ResultadoPrecioActividad {
  /** Precio base del producto */
  readonly precioBase: number;
  /** Porcentaje de descuento aplicado (0 o 10) */
  readonly descuentoPorcentaje: number;
  /** Monto del descuento en pesos */
  readonly descuentoMonto: number;
  /** Precio final después del descuento */
  readonly precioFinal: number;
  /** Posición de la actividad (1 = primera) */
  readonly ordenActividad: number;
}

/**
 * Calcula el precio de una actividad según su posición
 *
 * Regla de negocio 2026:
 * - Primera actividad: precio completo
 * - Segunda actividad en adelante: 10% de descuento
 *
 * @param precioBase - Precio base del producto
 * @param ordenActividad - Posición de la actividad (1 = primera, 2 = segunda, etc.)
 * @returns Resultado con desglose del cálculo
 *
 * @example
 * calcularPrecioActividad(40000, 1) // { precioFinal: 40000, descuentoPorcentaje: 0 }
 * calcularPrecioActividad(40000, 2) // { precioFinal: 36000, descuentoPorcentaje: 10 }
 */
export function calcularPrecioActividad(
  precioBase: number,
  ordenActividad: number,
): ResultadoPrecioActividad {
  if (precioBase < 0) {
    throw new Error(`Precio base inválido: ${precioBase}`);
  }

  if (ordenActividad < 1) {
    throw new Error(`Orden de actividad inválido: ${ordenActividad}`);
  }

  // Primera actividad: sin descuento
  if (ordenActividad === 1) {
    return {
      precioBase,
      descuentoPorcentaje: 0,
      descuentoMonto: 0,
      precioFinal: precioBase,
      ordenActividad,
    };
  }

  // Segunda actividad en adelante: 10% de descuento
  const descuentoMonto = Math.round(
    (precioBase * DESCUENTO_ACTIVIDAD_ADICIONAL) / 100,
  );
  const precioFinal = precioBase - descuentoMonto;

  return {
    precioBase,
    descuentoPorcentaje: DESCUENTO_ACTIVIDAD_ADICIONAL,
    descuentoMonto,
    precioFinal,
    ordenActividad,
  };
}

/**
 * Resultado del cálculo de monto mensual total
 */
export interface ResultadoMontoMensual {
  /** Monto total sin descuentos */
  readonly montoSinDescuento: number;
  /** Monto total con descuentos aplicados */
  readonly montoConDescuento: number;
  /** Ahorro total */
  readonly ahorroTotal: number;
  /** Cantidad de actividades con descuento */
  readonly actividadesConDescuento: number;
  /** Cantidad total de actividades */
  readonly totalActividades: number;
}

/**
 * Calcula el monto mensual total de una suscripción familiar
 *
 * @param preciosActividades - Array de precios base de cada actividad
 * @returns Resultado con monto total y ahorro
 *
 * @example
 * calcularMontoMensualTotal([40000, 40000, 40000])
 * // 3 actividades: primera sin descuento, 2da y 3ra con 10%
 * // = 40000 + 36000 + 36000 = 112000
 */
export function calcularMontoMensualTotal(
  preciosActividades: number[],
): ResultadoMontoMensual {
  if (preciosActividades.length === 0) {
    return {
      montoSinDescuento: 0,
      montoConDescuento: 0,
      ahorroTotal: 0,
      actividadesConDescuento: 0,
      totalActividades: 0,
    };
  }

  let montoConDescuento = 0;
  let actividadesConDescuento = 0;

  preciosActividades.forEach((precioBase, index) => {
    const ordenActividad = index + 1;
    const resultado = calcularPrecioActividad(precioBase, ordenActividad);

    montoConDescuento += resultado.precioFinal;

    if (resultado.descuentoPorcentaje > 0) {
      actividadesConDescuento++;
    }
  });

  const montoSinDescuento = preciosActividades.reduce(
    (sum, precio) => sum + precio,
    0,
  );
  const ahorroTotal = montoSinDescuento - montoConDescuento;

  return {
    montoSinDescuento,
    montoConDescuento,
    ahorroTotal,
    actividadesConDescuento,
    totalActividades: preciosActividades.length,
  };
}

/**
 * Simula el cálculo de monto mensual con actividades adicionales
 *
 * Útil para preview en frontend antes de confirmar inscripciones
 *
 * @param preciosActuales - Precios de actividades ya inscritas
 * @param preciosNuevos - Precios de nuevas actividades a agregar
 * @returns Comparación entre monto actual y nuevo
 */
export function simularAgregarActividades(
  preciosActuales: number[],
  preciosNuevos: number[],
): {
  readonly montoActual: number;
  readonly montoNuevo: number;
  readonly diferencia: number;
  readonly ahorroAdicional: number;
} {
  const resultadoActual = calcularMontoMensualTotal(preciosActuales);
  const resultadoNuevo = calcularMontoMensualTotal([
    ...preciosActuales,
    ...preciosNuevos,
  ]);

  return {
    montoActual: resultadoActual.montoConDescuento,
    montoNuevo: resultadoNuevo.montoConDescuento,
    diferencia:
      resultadoNuevo.montoConDescuento - resultadoActual.montoConDescuento,
    ahorroAdicional: resultadoNuevo.ahorroTotal - resultadoActual.ahorroTotal,
  };
}
