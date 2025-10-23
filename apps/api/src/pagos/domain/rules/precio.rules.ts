/**
 * Reglas de Cálculo de Precios - Core Business Logic
 *
 * Funciones PURAS sin efectos secundarios
 * Testeable al 100%
 * Sin dependencias externas
 *
 * Reglas de negocio Mateatletas:
 * 1. Hermanos con múltiples actividades: $38.000/act (mayor descuento)
 * 2. Hermanos con 1 actividad c/u: $44.000/act
 * 3. Un estudiante con múltiples actividades: $44.000/act
 * 4. AACREA: 20% descuento (solo 1 estudiante, 1 actividad)
 * 5. Precio base: $50.000 (Club Mat) / $55.000 (Cursos)
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

// ============================================================================
// FUNCIÓN PRINCIPAL: Calcular Precio de Actividad
// ============================================================================

/**
 * Calcula el precio de una actividad según las reglas de negocio
 *
 * Función PURA:
 * - No modifica el input
 * - Mismo input siempre produce mismo output
 * - Sin efectos secundarios
 *
 * @param input - Datos para el cálculo
 * @returns Resultado del cálculo con precio final y metadata
 */
export function calcularPrecioActividad(
  input: CalculoPrecioInput
): CalculoPrecioOutput {
  // Validar y normalizar inputs
  const cantidadHermanos = Math.max(1, input.cantidadHermanos);
  const actividadesPorEstudiante = Math.max(1, input.actividadesPorEstudiante);

  // Obtener precio base según tipo de producto
  const precioBase = obtenerPrecioBase(
    input.tipoProducto,
    input.configuracion
  );

  // Aplicar reglas de descuento en orden de prioridad
  const resultado = aplicarReglasDescuento({
    precioBase,
    cantidadHermanos,
    actividadesPorEstudiante,
    tieneAACREA: input.tieneAACREA,
    configuracion: input.configuracion,
  });

  return resultado;
}

// ============================================================================
// FUNCIONES AUXILIARES: Lógica de Descuentos
// ============================================================================

/**
 * Obtiene el precio base según el tipo de producto
 */
function obtenerPrecioBase(
  tipoProducto: 'CLUB_MATEMATICAS' | 'CURSO_ESPECIALIZADO',
  configuracion: ConfiguracionPrecios
): Decimal {
  return tipoProducto === 'CLUB_MATEMATICAS'
    ? configuracion.precioClubMatematicas
    : configuracion.precioCursosEspecializados;
}

/**
 * Aplica las reglas de descuento según prioridad establecida
 *
 * Prioridad (de mayor a menor):
 * 1. Hermanos con múltiples actividades
 * 2. Hermanos con 1 actividad
 * 3. Múltiples actividades (1 estudiante)
 * 4. AACREA (solo si aplica)
 * 5. Sin descuento
 */
function aplicarReglasDescuento(params: {
  precioBase: Decimal;
  cantidadHermanos: number;
  actividadesPorEstudiante: number;
  tieneAACREA: boolean;
  configuracion: ConfiguracionPrecios;
}): CalculoPrecioOutput {
  const {
    precioBase,
    cantidadHermanos,
    actividadesPorEstudiante,
    tieneAACREA,
    configuracion,
  } = params;

  // REGLA 1: Hermanos con múltiples actividades (mayor descuento)
  if (cantidadHermanos >= 2 && actividadesPorEstudiante >= 2) {
    return crearResultado(
      precioBase,
      configuracion.precioHermanosMultiple,
      TipoDescuento.HERMANOS_MULTIPLE,
      `${cantidadHermanos} hermanos, ${actividadesPorEstudiante} actividades c/u`
    );
  }

  // REGLA 2: Hermanos con 1 actividad cada uno
  if (cantidadHermanos >= 2 && actividadesPorEstudiante === 1) {
    return crearResultado(
      precioBase,
      configuracion.precioHermanosBasico,
      TipoDescuento.HERMANOS_BASICO,
      `${cantidadHermanos} hermanos, 1 actividad c/u`
    );
  }

  // REGLA 3: Un estudiante con múltiples actividades
  if (cantidadHermanos === 1 && actividadesPorEstudiante >= 2) {
    return crearResultado(
      precioBase,
      configuracion.precioMultipleActividades,
      TipoDescuento.MULTIPLE_ACTIVIDADES,
      `1 estudiante, ${actividadesPorEstudiante} actividades`
    );
  }

  // REGLA 4: AACREA (solo si 1 estudiante, 1 actividad, y descuento activo)
  if (
    tieneAACREA &&
    cantidadHermanos === 1 &&
    actividadesPorEstudiante === 1 &&
    configuracion.descuentoAacreaActivo
  ) {
    return aplicarDescuentoAacrea(
      precioBase,
      configuracion.descuentoAacreaPorcentaje
    );
  }

  // REGLA 5: Sin descuento (precio base)
  return crearResultado(
    precioBase,
    precioBase,
    TipoDescuento.NINGUNO,
    'Precio base sin descuentos'
  );
}

/**
 * Aplica descuento AACREA por porcentaje
 */
function aplicarDescuentoAacrea(
  precioBase: Decimal,
  porcentaje: Decimal
): CalculoPrecioOutput {
  const descuento = precioBase.mul(porcentaje).div(100);
  const precioFinal = precioBase.sub(descuento);

  return {
    precioBase,
    precioFinal,
    descuentoAplicado: descuento,
    tipoDescuento: TipoDescuento.AACREA,
    detalleCalculo: `Descuento AACREA ${porcentaje.toFixed(0)}%`,
  };
}

/**
 * Helper para crear resultado de cálculo
 * Encapsula la lógica de construcción del objeto resultado
 */
function crearResultado(
  precioBase: Decimal,
  precioFinal: Decimal,
  tipoDescuento: TipoDescuento,
  detalle: string
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
  inscripciones: ReadonlyArray<CalculoPrecioOutput>
): TotalMensualOutput {
  // Usar reduce para sumar todos los valores
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
    }
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
  return porcentaje.greaterThanOrEqualTo(0) && porcentaje.lessThanOrEqualTo(100);
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
  precioFinal: Decimal
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
  inscripciones: ReadonlyArray<CalculoPrecioOutput>
): Decimal {
  return inscripciones.reduce(
    (acc, ins) => acc.add(ins.descuentoAplicado),
    new Decimal(0)
  );
}
