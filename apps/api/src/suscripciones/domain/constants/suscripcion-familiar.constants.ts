/**
 * Constantes y funciones para el cálculo de precios de Suscripciones Familiares 2026
 *
 * Modelo de negocio 2026 (ACTUALIZADO):
 * - Una suscripción por familia, pero TIER POR INSCRIPCIÓN
 * - Cada inscripción puede tener un tier diferente (LIBROS, ASINCRONICO, SINCRONICO)
 * - Precio según tier: STEAM_LIBROS ($40k), STEAM_ASINCRONICO ($65k), STEAM_SINCRONICO ($95k)
 * - Descuento 10% se aplica al producto de MENOR VALOR (no al segundo agregado cronológicamente)
 *
 * REGLA DE DESCUENTO FAMILIAR:
 * - Se ordenan las inscripciones por precio DESCENDENTE
 * - La más cara paga precio completo
 * - Las demás tienen 10% de descuento
 *
 * Ejemplo: Juan tiene SINCRÓNICO ($95k) + ASINCRÓNICO ($65k)
 * - SINCRÓNICO: $95,000 (sin descuento - es el más caro)
 * - ASINCRÓNICO: $65,000 - 10% = $58,500 (con descuento)
 * - TOTAL: $153,500/mes
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

// ============================================================================
// NUEVAS FUNCIONES PARA TIER POR INSCRIPCIÓN (2026)
// ============================================================================

/**
 * Representa una inscripción con su tier para cálculo de precios
 */
export interface InscripcionConTier {
  /** Tier de la inscripción (puede ser null si aún no se asignó) */
  readonly tier: TierNombre | null;
  /** ID opcional para identificar la inscripción en el resultado */
  readonly id?: string;
}

/**
 * Resultado detallado del cálculo de precio por inscripción
 */
export interface ResultadoPrecioInscripcion {
  /** ID de la inscripción (si se proporcionó) */
  readonly id?: string;
  /** Tier de la inscripción */
  readonly tier: TierNombre;
  /** Precio base según el tier */
  readonly precioBase: number;
  /** Porcentaje de descuento aplicado (0 o 10) */
  readonly descuentoPorcentaje: number;
  /** Monto del descuento en pesos */
  readonly descuentoMonto: number;
  /** Precio final después del descuento */
  readonly precioFinal: number;
  /** Indica si es la inscripción más cara (sin descuento) */
  readonly esMasCara: boolean;
}

/**
 * Resultado completo del cálculo mensual con tiers por inscripción
 */
export interface ResultadoMontoMensualConTiers extends ResultadoMontoMensual {
  /** Detalle de cada inscripción con su cálculo */
  readonly detalleInscripciones: ResultadoPrecioInscripcion[];
}

/**
 * Obtiene el precio de una inscripción según su tier
 *
 * Prioridad:
 * 1. Tier de la inscripción
 * 2. Tier de fallback (si se proporciona)
 * 3. STEAM_LIBROS como default
 *
 * @param inscripcion - Objeto con tier y opcionalmente precio del producto
 * @param tierFallback - Tier a usar si la inscripción no tiene tier
 * @returns Precio en pesos argentinos
 */
export function obtenerPrecioInscripcion(
  inscripcion: {
    tier?: TierNombre | null;
    producto?: { precio?: number | null };
  },
  tierFallback?: TierNombre,
): number {
  // Prioridad 1: tier de la inscripción
  if (inscripcion.tier) {
    return obtenerPrecioTier(inscripcion.tier);
  }

  // Prioridad 2: precio del producto (si existe)
  if (inscripcion.producto?.precio) {
    return inscripcion.producto.precio;
  }

  // Prioridad 3: tier de fallback o LIBROS por defecto
  return obtenerPrecioTier(tierFallback ?? 'STEAM_LIBROS');
}

/**
 * Calcula el monto mensual total ordenando por precio DESCENDENTE
 *
 * REGLA DE NEGOCIO 2026:
 * - Se ordenan las inscripciones por precio DESCENDENTE (mayor primero)
 * - La inscripción MÁS CARA paga precio completo
 * - Las demás inscripciones tienen 10% de descuento
 *
 * Esto significa que el descuento se aplica a los productos de MENOR VALOR,
 * no al segundo agregado cronológicamente.
 *
 * @param inscripciones - Array de inscripciones con su tier
 * @returns Resultado con monto total, ahorro y detalle por inscripción
 *
 * @example
 * // Juan: SINCRÓNICO ($95k) + ASINCRÓNICO ($65k)
 * calcularMontoMensualConTiers([
 *   { tier: 'STEAM_SINCRONICO' },
 *   { tier: 'STEAM_ASINCRONICO' }
 * ])
 * // Resultado:
 * // - SINCRÓNICO: $95,000 (sin descuento - es el más caro)
 * // - ASINCRÓNICO: $58,500 (con 10% descuento)
 * // - TOTAL: $153,500/mes
 */
export function calcularMontoMensualConTiers(
  inscripciones: InscripcionConTier[],
): ResultadoMontoMensualConTiers {
  if (inscripciones.length === 0) {
    return {
      montoSinDescuento: 0,
      montoConDescuento: 0,
      ahorroTotal: 0,
      actividadesConDescuento: 0,
      totalActividades: 0,
      detalleInscripciones: [],
    };
  }

  // Paso 1: Calcular precio base de cada inscripción según su tier
  const inscripcionesConPrecio = inscripciones.map((insc) => {
    const tier = insc.tier ?? 'STEAM_LIBROS';
    const precioBase = obtenerPrecioTier(tier);
    return {
      id: insc.id,
      tier,
      precioBase,
    };
  });

  // Paso 2: Ordenar por precio DESCENDENTE (mayor primero)
  // El más caro queda primero y no tiene descuento
  const ordenadas = [...inscripcionesConPrecio].sort(
    (a, b) => b.precioBase - a.precioBase,
  );

  // Paso 3: Calcular precios con descuento
  // - Primera (más cara): sin descuento
  // - Resto: 10% de descuento
  const detalleInscripciones: ResultadoPrecioInscripcion[] = ordenadas.map(
    (insc, index) => {
      const esMasCara = index === 0;
      const descuentoPorcentaje = esMasCara ? 0 : DESCUENTO_ACTIVIDAD_ADICIONAL;
      const descuentoMonto = esMasCara
        ? 0
        : Math.round((insc.precioBase * DESCUENTO_ACTIVIDAD_ADICIONAL) / 100);
      const precioFinal = insc.precioBase - descuentoMonto;

      return {
        id: insc.id,
        tier: insc.tier,
        precioBase: insc.precioBase,
        descuentoPorcentaje,
        descuentoMonto,
        precioFinal,
        esMasCara,
      };
    },
  );

  // Paso 4: Calcular totales
  const montoSinDescuento = detalleInscripciones.reduce(
    (sum, d) => sum + d.precioBase,
    0,
  );
  const montoConDescuento = detalleInscripciones.reduce(
    (sum, d) => sum + d.precioFinal,
    0,
  );
  const ahorroTotal = montoSinDescuento - montoConDescuento;
  const actividadesConDescuento = detalleInscripciones.filter(
    (d) => d.descuentoPorcentaje > 0,
  ).length;

  return {
    montoSinDescuento,
    montoConDescuento,
    ahorroTotal,
    actividadesConDescuento,
    totalActividades: inscripciones.length,
    detalleInscripciones,
  };
}

/**
 * Simula agregar nuevas inscripciones con tiers específicos
 *
 * Útil para preview en frontend antes de confirmar nuevas inscripciones.
 * Recalcula el orden por precio para aplicar descuentos correctamente.
 *
 * @param inscripcionesActuales - Inscripciones ya existentes
 * @param inscripcionesNuevas - Nuevas inscripciones a agregar
 * @returns Comparación entre monto actual y nuevo
 */
export function simularAgregarInscripcionesConTiers(
  inscripcionesActuales: InscripcionConTier[],
  inscripcionesNuevas: InscripcionConTier[],
): {
  readonly montoActual: number;
  readonly montoNuevo: number;
  readonly diferencia: number;
  readonly ahorroAdicional: number;
  readonly detalleNuevo: ResultadoPrecioInscripcion[];
} {
  const resultadoActual = calcularMontoMensualConTiers(inscripcionesActuales);
  const resultadoNuevo = calcularMontoMensualConTiers([
    ...inscripcionesActuales,
    ...inscripcionesNuevas,
  ]);

  return {
    montoActual: resultadoActual.montoConDescuento,
    montoNuevo: resultadoNuevo.montoConDescuento,
    diferencia:
      resultadoNuevo.montoConDescuento - resultadoActual.montoConDescuento,
    ahorroAdicional: resultadoNuevo.ahorroTotal - resultadoActual.ahorroTotal,
    detalleNuevo: resultadoNuevo.detalleInscripciones,
  };
}
