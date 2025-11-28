import { Injectable } from '@nestjs/common';
import {
  PRECIOS,
  DESCUENTOS,
  REGLAS_PRICING,
  PricingHelpers,
} from '../constants';

/**
 * Servicio centralizado para cálculos de pricing y descuentos
 *
 * Este servicio elimina la duplicación de lógica de pricing entre módulos,
 * aplicando el principio DRY (Don't Repeat Yourself) y facilitando el mantenimiento.
 *
 * @module domain/services/pricing-calculator
 */
@Injectable()
export class PricingCalculatorService {
  /**
   * Calcula el descuento aplicable para Colonia de Verano 2026
   *
   * Reglas de negocio:
   * - 2+ hermanos Y 2+ cursos total = 20% de descuento
   * - 2+ hermanos O 2+ cursos total = 12% de descuento
   * - Caso contrario = 0% de descuento
   *
   * @param cantidadEstudiantes - Número de hermanos inscritos
   * @param totalCursos - Total de cursos entre todos los hermanos
   * @returns Porcentaje de descuento a aplicar (0-20)
   *
   * @example
   * ```typescript
   * // 3 hermanos, 5 cursos totales
   * const descuento = this.pricingCalculator.calcularDescuentoColonia(3, 5);
   * // descuento = 20
   * ```
   */
  calcularDescuentoColonia(
    cantidadEstudiantes: number,
    totalCursos: number,
  ): number {
    return PricingHelpers.calcularDescuentoColonia(
      cantidadEstudiantes,
      totalCursos,
    );
  }

  /**
   * Calcula el descuento por hermanos para Inscripciones 2026
   *
   * Reglas de negocio:
   * - 2 hermanos = 12% de descuento
   * - 3+ hermanos = 24% de descuento
   * - 1 hermano = 0% de descuento
   *
   * @param numEstudiantes - Número de hermanos a inscribir
   * @returns Porcentaje de descuento a aplicar (0-24)
   *
   * @example
   * ```typescript
   * const descuento = this.pricingCalculator.calcularDescuentoInscripcion2026(3);
   * // descuento = 24
   * ```
   */
  calcularDescuentoInscripcion2026(numEstudiantes: number): number {
    return PricingHelpers.calcularDescuentoInscripcion2026(numEstudiantes);
  }

  /**
   * Calcula el precio total de cursos de Colonia con descuentos aplicados
   *
   * Toma en cuenta:
   * - Precio base por curso
   * - Descuento al segundo curso del mismo estudiante
   * - Descuento general por cantidad de hermanos/cursos
   *
   * @param estudiantes - Array con la cantidad de cursos por estudiante
   * @param descuentoGeneral - Descuento general a aplicar (0-100)
   * @returns Precio total con descuentos aplicados
   *
   * @example
   * ```typescript
   * // 2 estudiantes: uno con 2 cursos, otro con 1 curso
   * const total = this.pricingCalculator.calcularTotalColonia([2, 1], 12);
   * // total = precio de 3 cursos con descuentos
   * ```
   */
  calcularTotalColonia(
    cursosPerStudent: number[],
    descuentoGeneral: number = 0,
  ): number {
    let subtotal = 0;

    // Calcular subtotal SIN descuentos intermedios
    // El descuento se aplica solo una vez al final sobre el total
    cursosPerStudent.forEach((numCursos) => {
      // Todos los cursos a precio base
      subtotal += PRECIOS.COLONIA_CURSO_BASE * numCursos;
    });

    // Aplicar descuento general sobre el subtotal (UNA SOLA VEZ)
    if (descuentoGeneral > 0) {
      return PricingHelpers.aplicarDescuento(subtotal, descuentoGeneral);
    }

    return subtotal;
  }

  /**
   * Calcula el total mensual para Inscripciones 2026 según tipo
   *
   * @param tipo - Tipo de inscripción ('COLONIA' | 'CICLO_2026' | 'PACK_COMPLETO')
   * @param numEstudiantes - Número de estudiantes
   * @param cursosPerStudent - Array con cantidad de cursos por estudiante (solo para Colonia)
   * @returns Objeto con total y descuento aplicado
   *
   * @example
   * ```typescript
   * const result = this.pricingCalculator.calcularTotalInscripcion2026(
   *   'PACK_COMPLETO',
   *   2,
   *   [2, 1]
   * );
   * // result = { total: 158400, descuento: 12 }
   * ```
   */
  calcularTotalInscripcion2026(
    tipo: 'COLONIA' | 'CICLO_2026' | 'PACK_COMPLETO',
    numEstudiantes: number,
    cursosPerStudent: number[] = [],
  ): { total: number; descuento: number } {
    const descuentoHermanos =
      this.calcularDescuentoInscripcion2026(numEstudiantes);
    let subtotal = 0;

    switch (tipo) {
      case 'COLONIA':
        // Solo cursos de colonia
        subtotal = this.calcularTotalColonia(cursosPerStudent, 0);
        break;

      case 'CICLO_2026':
        // Solo ciclo 2026
        subtotal = numEstudiantes * PRECIOS.CICLO_2026_MENSUAL;
        break;

      case 'PACK_COMPLETO':
        // Colonia + Ciclo 2026
        const totalColonia = this.calcularTotalColonia(cursosPerStudent, 0);
        const totalCiclo = numEstudiantes * PRECIOS.CICLO_2026_MENSUAL;
        subtotal = totalColonia + totalCiclo;
        break;
    }

    // Aplicar descuento por hermanos
    const total = PricingHelpers.aplicarDescuento(subtotal, descuentoHermanos);

    return {
      total,
      descuento: descuentoHermanos,
    };
  }

  /**
   * Calcula la tarifa de inscripción según el tipo
   *
   * @param tipo - Tipo de inscripción
   * @returns Monto de la tarifa de inscripción
   *
   * @example
   * ```typescript
   * const fee = this.pricingCalculator.calcularTarifaInscripcion('PACK_COMPLETO');
   * // fee = 60000
   * ```
   */
  calcularTarifaInscripcion(
    tipo: 'COLONIA' | 'CICLO_2026' | 'PACK_COMPLETO',
  ): number {
    switch (tipo) {
      case 'COLONIA':
        return PRECIOS.INSCRIPCION_2026.COLONIA;
      case 'CICLO_2026':
        return PRECIOS.INSCRIPCION_2026.CICLO_2026;
      case 'PACK_COMPLETO':
        return PRECIOS.INSCRIPCION_2026.PACK_COMPLETO;
    }
  }

  /**
   * Aplica un descuento sobre un precio base
   *
   * @param precioBase - Precio antes del descuento
   * @param descuentoPorcentaje - Porcentaje de descuento (0-100)
   * @returns Precio con descuento aplicado, redondeado
   *
   * @example
   * ```typescript
   * const precioFinal = this.pricingCalculator.aplicarDescuento(100000, 12);
   * // precioFinal = 88000
   * ```
   */
  aplicarDescuento(precioBase: number, descuentoPorcentaje: number): number {
    return PricingHelpers.aplicarDescuento(precioBase, descuentoPorcentaje);
  }

  /**
   * Calcula el monto del descuento en pesos
   *
   * @param precioBase - Precio antes del descuento
   * @param descuentoPorcentaje - Porcentaje de descuento (0-100)
   * @returns Monto del descuento en pesos, redondeado
   *
   * @example
   * ```typescript
   * const descuento = this.pricingCalculator.calcularMontoDescuento(100000, 12);
   * // descuento = 12000
   * ```
   */
  calcularMontoDescuento(
    precioBase: number,
    descuentoPorcentaje: number,
  ): number {
    return PricingHelpers.calcularMontoDescuento(
      precioBase,
      descuentoPorcentaje,
    );
  }

  /**
   * Obtiene información de precios configurados
   *
   * @returns Objeto con todos los precios del sistema
   *
   * @example
   * ```typescript
   * const precios = this.pricingCalculator.obtenerPrecios();
   * // precios.COLONIA_CURSO_BASE = 55000
   * ```
   */
  obtenerPrecios() {
    return {
      ...PRECIOS,
    };
  }

  /**
   * Obtiene información de descuentos configurados
   *
   * @returns Objeto con todos los descuentos del sistema
   *
   * @example
   * ```typescript
   * const descuentos = this.pricingCalculator.obtenerDescuentos();
   * // descuentos.COLONIA.DOS_HERMANOS = 12
   * ```
   */
  obtenerDescuentos() {
    return {
      ...DESCUENTOS,
    };
  }

  /**
   * Obtiene las reglas de pricing configuradas
   *
   * @returns Objeto con todas las reglas de pricing
   *
   * @example
   * ```typescript
   * const reglas = this.pricingCalculator.obtenerReglas();
   * // reglas.MIN_HERMANOS_DESCUENTO = 2
   * ```
   */
  obtenerReglas() {
    return {
      ...REGLAS_PRICING,
    };
  }
}
