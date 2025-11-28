/**
 * Constantes centralizadas de precios para Mateatletas
 *
 * Este archivo centraliza todos los valores monetarios y porcentajes de descuento
 * usados en el sistema, facilitando el mantenimiento y garantizando consistencia.
 *
 * IMPORTANTE: Al modificar estos valores, asegúrate de actualizar también:
 * - Tests que usan valores hardcoded
 * - Documentación de precios
 * - Comunicaciones con usuarios
 *
 * @module domain/constants/pricing
 */

/**
 * Precios base de cursos y programas
 */
export const PRECIOS = {
  /**
   * Precio base por curso de Colonia de Verano 2026
   * Aplicado a cada curso seleccionado por estudiante
   */
  COLONIA_CURSO_BASE: 55000,

  /**
   * Tarifa de inscripción según tipo de programa 2026
   */
  INSCRIPCION_2026: {
    /**
     * Inscripción solo a Colonia de Verano
     */
    COLONIA: 25000,

    /**
     * Inscripción solo a Ciclo 2026 (Early Bird)
     */
    CICLO_2026: 50000,

    /**
     * Pack completo: Colonia + Ciclo 2026
     * Precio con descuento incluido ($25k + $50k = $75k, con descuento = $60k)
     */
    PACK_COMPLETO: 60000,
  },

  /**
   * Precio base mensual de Ciclo 2026 por estudiante
   */
  CICLO_2026_MENSUAL: 60000,

  /**
   * @deprecated Ya no se usa - el descuento se aplica sobre el total, no por curso
   * Mantenido para retrocompatibilidad con tests antiguos
   */
  COLONIA_SEGUNDO_CURSO: 48400,
} as const;

/**
 * Porcentajes de descuento aplicados
 */
export const DESCUENTOS = {
  /**
   * Descuentos para Colonia de Verano 2026
   */
  COLONIA: {
    /**
     * Descuento por tener 2 o más hermanos inscritos
     */
    DOS_HERMANOS: 12,

    /**
     * Descuento por tener 3 o más hermanos inscritos
     */
    TRES_O_MAS_HERMANOS: 20,

    /**
     * Descuento por inscribir a un estudiante en 2 o más cursos
     */
    DOS_CURSOS: 12,

    /**
     * Descuento combinado: 2+ hermanos Y 2+ cursos total
     * (Se aplica el mayor descuento)
     */
    HERMANOS_Y_CURSOS: 20,

    /**
     * Descuento aplicado al segundo curso del mismo estudiante
     */
    SEGUNDO_CURSO: 12,
  },

  /**
   * Descuentos para Inscripciones 2026
   */
  INSCRIPCION_2026: {
    /**
     * Descuento por inscribir exactamente 2 hermanos
     */
    DOS_HERMANOS: 12,

    /**
     * Descuento por inscribir 3 o más hermanos
     */
    TRES_O_MAS_HERMANOS: 24,
  },
} as const;

/**
 * Reglas de negocio relacionadas con pricing
 */
export const REGLAS_PRICING = {
  /**
   * Cantidad mínima de hermanos para aplicar descuento
   */
  MIN_HERMANOS_DESCUENTO: 2,

  /**
   * Cantidad mínima de cursos para aplicar descuento
   */
  MIN_CURSOS_DESCUENTO: 2,

  /**
   * Cantidad de hermanos para descuento máximo
   */
  HERMANOS_DESCUENTO_MAXIMO: 3,
} as const;

/**
 * Type-safe access a constantes de precios
 */
export type Precios = typeof PRECIOS;
export type Descuentos = typeof DESCUENTOS;
export type ReglasPricing = typeof REGLAS_PRICING;

/**
 * Helpers para cálculos comunes de pricing
 */
export const PricingHelpers = {
  /**
   * Calcula el precio con descuento aplicado
   * @param precioBase - Precio base sin descuento
   * @param descuentoPorcentaje - Porcentaje de descuento a aplicar (0-100)
   * @returns Precio final con descuento aplicado, redondeado
   */
  aplicarDescuento(precioBase: number, descuentoPorcentaje: number): number {
    if (descuentoPorcentaje < 0 || descuentoPorcentaje > 100) {
      throw new Error(
        `Descuento inválido: ${descuentoPorcentaje}%. Debe estar entre 0 y 100.`,
      );
    }
    const descuento = precioBase * (descuentoPorcentaje / 100);
    return Math.round(precioBase - descuento);
  },

  /**
   * Calcula el monto de descuento en pesos
   * @param precioBase - Precio base sin descuento
   * @param descuentoPorcentaje - Porcentaje de descuento (0-100)
   * @returns Monto del descuento en pesos, redondeado
   */
  calcularMontoDescuento(
    precioBase: number,
    descuentoPorcentaje: number,
  ): number {
    if (descuentoPorcentaje < 0 || descuentoPorcentaje > 100) {
      throw new Error(
        `Descuento inválido: ${descuentoPorcentaje}%. Debe estar entre 0 y 100.`,
      );
    }
    return Math.round(precioBase * (descuentoPorcentaje / 100));
  },

  /**
   * Determina el descuento de Colonia según cantidad de hermanos y cursos
   * @param cantidadEstudiantes - Número de hermanos inscritos
   * @param totalCursos - Total de cursos entre todos los hermanos
   * @returns Porcentaje de descuento a aplicar
   */
  calcularDescuentoColonia(
    cantidadEstudiantes: number,
    totalCursos: number,
  ): number {
    if (
      cantidadEstudiantes >= REGLAS_PRICING.MIN_HERMANOS_DESCUENTO &&
      totalCursos >= REGLAS_PRICING.MIN_CURSOS_DESCUENTO
    ) {
      return DESCUENTOS.COLONIA.HERMANOS_Y_CURSOS;
    } else if (cantidadEstudiantes >= REGLAS_PRICING.MIN_HERMANOS_DESCUENTO) {
      return DESCUENTOS.COLONIA.DOS_HERMANOS;
    } else if (totalCursos >= REGLAS_PRICING.MIN_CURSOS_DESCUENTO) {
      return DESCUENTOS.COLONIA.DOS_CURSOS;
    }
    return 0;
  },

  /**
   * Determina el descuento de Inscripciones 2026 según cantidad de hermanos
   * @param numEstudiantes - Número de hermanos a inscribir
   * @returns Porcentaje de descuento a aplicar
   */
  calcularDescuentoInscripcion2026(numEstudiantes: number): number {
    if (numEstudiantes >= REGLAS_PRICING.HERMANOS_DESCUENTO_MAXIMO) {
      return DESCUENTOS.INSCRIPCION_2026.TRES_O_MAS_HERMANOS;
    } else if (numEstudiantes === REGLAS_PRICING.MIN_HERMANOS_DESCUENTO) {
      return DESCUENTOS.INSCRIPCION_2026.DOS_HERMANOS;
    }
    return 0;
  },
};

/**
 * Valores por defecto para exportar individualmente (retrocompatibilidad)
 */
export const PRECIO_BASE_CURSO_COLONIA = PRECIOS.COLONIA_CURSO_BASE;
export const PRECIO_INSCRIPCION_COLONIA = PRECIOS.INSCRIPCION_2026.COLONIA;
export const PRECIO_INSCRIPCION_CICLO_2026 =
  PRECIOS.INSCRIPCION_2026.CICLO_2026;
export const PRECIO_PACK_COMPLETO = PRECIOS.INSCRIPCION_2026.PACK_COMPLETO;
