/**
 * Reglas de Cálculo de Precios - Core Business Logic
 *
 * Sistema de Tiers 2026:
 * - Arcade: $30.000/mes - 1 mundo async
 * - Arcade+: $60.000/mes - 3 mundos async
 * - Pro: $75.000/mes - 1 mundo async + 1 mundo sync con docente
 *
 * Descuentos familiares:
 * - 2do hermano: 12%
 * - 3er hermano en adelante: 20%
 *
 * Funciones PURAS sin efectos secundarios
 * Testeable al 100%
 * Sin dependencias externas
 */

import { Decimal } from '@prisma/client/runtime/library';
import {
  TipoDescuento,
  ConfiguracionPrecios,
  CalculoPrecioInput,
  CalculoPrecioOutput,
  TotalMensualOutput,
} from '../types/pagos.types';

// Re-exportar tipos para uso externo
export type {
  TipoDescuento,
  ConfiguracionPrecios,
  CalculoPrecioInput,
  CalculoPrecioOutput,
  TotalMensualOutput,
};

/**
 * Tipos de Tier disponibles
 */
export type TierTipo = 'ARCADE' | 'ARCADE_PLUS' | 'PRO';

/**
 * Input para cálculo de precio por Tier
 */
export interface CalculoPrecioTierInput {
  readonly tier: TierTipo;
  readonly posicionHermano: number; // 1 = primer hermano, 2 = segundo, 3+ = tercero o más
  readonly configuracion: ConfiguracionPrecios;
}

// ============================================================================
// FUNCIÓN PRINCIPAL: Calcular Precio por Tier
// ============================================================================

/**
 * Calcula el precio de un Tier según las reglas de negocio 2026
 *
 * Función PURA:
 * - No modifica el input
 * - Mismo input siempre produce mismo output
 * - Sin efectos secundarios
 *
 * @param input - Datos para el cálculo
 * @returns Resultado del cálculo con precio final y metadata
 */
export function calcularPrecioTier(
  input: CalculoPrecioTierInput,
): CalculoPrecioOutput {
  const { tier, posicionHermano, configuracion } = input;

  // Obtener precio base según Tier
  const precioBase = obtenerPrecioTier(tier, configuracion);

  // Aplicar descuento familiar si corresponde
  return aplicarDescuentoFamiliar({
    precioBase,
    posicionHermano,
    configuracion,
    tier,
  });
}

/**
 * Calcula el precio de una actividad según las reglas de negocio
 * LEGACY: Mantener para compatibilidad con código existente
 *
 * @param input - Datos para el cálculo
 * @returns Resultado del cálculo con precio final y metadata
 */
export function calcularPrecioActividad(
  input: CalculoPrecioInput,
): CalculoPrecioOutput {
  // Convertir input legacy a nuevo formato
  // Usar Arcade como default (precio más bajo)
  const precioBase = input.configuracion.precioArcade;

  // Calcular posición de hermano
  const posicionHermano = input.cantidadHermanos;

  return aplicarDescuentoFamiliar({
    precioBase,
    posicionHermano,
    configuracion: input.configuracion,
    tier: 'ARCADE',
  });
}

// ============================================================================
// FUNCIONES AUXILIARES: Lógica de Precios y Descuentos
// ============================================================================

/**
 * Obtiene el precio base según el Tier seleccionado
 */
function obtenerPrecioTier(
  tier: TierTipo,
  configuracion: ConfiguracionPrecios,
): Decimal {
  switch (tier) {
    case 'ARCADE':
      return configuracion.precioArcade;
    case 'ARCADE_PLUS':
      return configuracion.precioArcadePlus;
    case 'PRO':
      return configuracion.precioPro;
    default:
      return configuracion.precioArcade;
  }
}

/**
 * Aplica descuento familiar según posición del hermano
 *
 * Reglas:
 * - 1er hermano: Sin descuento
 * - 2do hermano: 12% descuento
 * - 3er hermano en adelante: 20% descuento
 */
function aplicarDescuentoFamiliar(params: {
  precioBase: Decimal;
  posicionHermano: number;
  configuracion: ConfiguracionPrecios;
  tier: TierTipo;
}): CalculoPrecioOutput {
  const { precioBase, posicionHermano, configuracion, tier } = params;

  // REGLA 1: Tercer hermano o más - Mayor descuento (20%)
  if (posicionHermano >= 3) {
    const porcentajeDescuento = configuracion.descuentoHermano3Mas;
    const descuento = precioBase.mul(porcentajeDescuento).div(100);
    const precioFinal = precioBase.sub(descuento);

    return crearResultado(
      precioBase,
      precioFinal,
      TipoDescuento.HERMANO_3_MAS,
      `Tier ${tier} - ${posicionHermano}° hermano (${porcentajeDescuento.toFixed(0)}% descuento)`,
    );
  }

  // REGLA 2: Segundo hermano - Descuento intermedio (12%)
  if (posicionHermano === 2) {
    const porcentajeDescuento = configuracion.descuentoHermano2;
    const descuento = precioBase.mul(porcentajeDescuento).div(100);
    const precioFinal = precioBase.sub(descuento);

    return crearResultado(
      precioBase,
      precioFinal,
      TipoDescuento.HERMANO_2,
      `Tier ${tier} - 2° hermano (${porcentajeDescuento.toFixed(0)}% descuento)`,
    );
  }

  // REGLA 3: Primer hermano o único - Sin descuento
  return crearResultado(
    precioBase,
    precioBase,
    TipoDescuento.NINGUNO,
    `Tier ${tier} - Precio base`,
  );
}

/**
 * Helper para crear resultado de cálculo
 * Encapsula la lógica de construcción del objeto resultado
 */
function crearResultado(
  precioBase: Decimal,
  precioFinal: Decimal,
  tipoDescuento: TipoDescuento,
  detalle: string,
): CalculoPrecioOutput {
  return {
    precioBase,
    precioFinal,
    descuentoAplicado: precioBase.sub(precioFinal),
    tipoDescuento,
    detalleCalculo: detalle,
  };
}

// ============================================================================
// FUNCIÓN: Calcular Total Mensual
// ============================================================================

/**
 * Calcula el total mensual sumando múltiples inscripciones
 *
 * @param inscripciones - Array de resultados de cálculo
 * @returns Total, subtotal y descuento total
 */
export function calcularTotalMensual(
  inscripciones: ReadonlyArray<CalculoPrecioOutput>,
): TotalMensualOutput {
  const resultado = inscripciones.reduce(
    (acc, inscripcion) => ({
      total: acc.total.add(inscripcion.precioFinal),
      subtotal: acc.subtotal.add(inscripcion.precioBase),
      descuentoTotal: acc.descuentoTotal.add(inscripcion.descuentoAplicado),
    }),
    {
      total: new Decimal(0),
      subtotal: new Decimal(0),
      descuentoTotal: new Decimal(0),
    },
  );

  return resultado;
}

// ============================================================================
// FUNCIONES AUXILIARES: Validación y Formato
// ============================================================================

/**
 * Convierte Decimal a número para respuestas API
 * Redondea a 2 decimales
 */
export function decimalToNumber(value: Decimal): number {
  return Number(value.toFixed(2));
}

/**
 * Convierte número a Decimal para cálculos
 * Mantiene precisión decimal
 */
export function numberToDecimal(value: number): Decimal {
  return new Decimal(value);
}

/**
 * Valida que un precio sea positivo
 */
export function validarPrecioPositivo(precio: Decimal): boolean {
  return precio.greaterThan(0);
}

/**
 * Valida que un porcentaje esté entre 0 y 100
 */
export function validarPorcentaje(porcentaje: Decimal): boolean {
  return (
    porcentaje.greaterThanOrEqualTo(0) && porcentaje.lessThanOrEqualTo(100)
  );
}

/**
 * Formatea un precio para mostrar (con separadores de miles)
 */
export function formatearPrecio(precio: Decimal): string {
  const numero = decimalToNumber(precio);
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numero);
}

// ============================================================================
// FUNCIONES: Cálculos de Métricas
// ============================================================================

/**
 * Calcula el porcentaje de descuento aplicado
 */
export function calcularPorcentajeDescuento(
  precioBase: Decimal,
  precioFinal: Decimal,
): Decimal {
  if (precioBase.isZero()) {
    return new Decimal(0);
  }

  const descuento = precioBase.sub(precioFinal);
  return descuento.div(precioBase).mul(100);
}

/**
 * Calcula el ahorro total en pesos
 */
export function calcularAhorroTotal(
  inscripciones: ReadonlyArray<CalculoPrecioOutput>,
): Decimal {
  return inscripciones.reduce(
    (acc, ins) => acc.add(ins.descuentoAplicado),
    new Decimal(0),
  );
}

/**
 * Calcula precio con descuento familiar para una familia
 *
 * @param tier - Tipo de tier seleccionado
 * @param cantidadHermanos - Número total de hermanos inscritos
 * @param configuracion - Configuración de precios
 * @returns Array con el precio de cada hermano
 */
export function calcularPreciosFamilia(
  tier: TierTipo,
  cantidadHermanos: number,
  configuracion: ConfiguracionPrecios,
): CalculoPrecioOutput[] {
  const resultados: CalculoPrecioOutput[] = [];

  for (let i = 1; i <= cantidadHermanos; i++) {
    resultados.push(
      calcularPrecioTier({
        tier,
        posicionHermano: i,
        configuracion,
      }),
    );
  }

  return resultados;
}
