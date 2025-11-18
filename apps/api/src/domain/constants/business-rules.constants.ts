/**
 * Reglas de negocio centralizadas del sistema
 *
 * Extraídas de validaciones duplicadas en:
 * - admin-estudiantes.service.ts
 * - estudiantes.service.ts
 */

export const BUSINESS_RULES = {
  ESTUDIANTE: {
    EDAD_MINIMA: 3,
    EDAD_MAXIMA: 99,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 20,
    NOMBRE_MIN_LENGTH: 2,
    NOMBRE_MAX_LENGTH: 50,
  },
  CLASE: {
    DURACION_MINIMA_MINUTOS: 30,
    DURACION_MAXIMA_MINUTOS: 180,
    CUPOS_MINIMOS: 1,
    CUPOS_MAXIMOS: 30,
  },
  CURSO: {
    DURACION_MINIMA_MESES: 1,
    DURACION_MAXIMA_MESES: 24,
    PRECIO_MINIMO: 0,
    PRECIO_MAXIMO: 999999,
  },
  DOCENTE: {
    EXPERIENCIA_MINIMA_ANOS: 0,
    EXPERIENCIA_MAXIMA_ANOS: 50,
  },
  PAGOS: {
    /**
     * Día del mes en que vencen los pagos mensuales
     * Por ejemplo: 5 = el 5 de cada mes
     */
    DIA_VENCIMIENTO: 5,
  },
} as const;

export type BusinessRules = typeof BUSINESS_RULES;

/**
 * Validador de edad de estudiante
 * @param edad - Edad a validar
 * @returns true si es válida
 */
export function esEdadValida(edad: number): boolean {
  return (
    edad >= BUSINESS_RULES.ESTUDIANTE.EDAD_MINIMA &&
    edad <= BUSINESS_RULES.ESTUDIANTE.EDAD_MAXIMA
  );
}

/**
 * Mensaje de error para edad inválida
 */
export function getMensajeErrorEdad(): string {
  return `La edad debe estar entre ${BUSINESS_RULES.ESTUDIANTE.EDAD_MINIMA} y ${BUSINESS_RULES.ESTUDIANTE.EDAD_MAXIMA} años`;
}

/**
 * Calcula la fecha de vencimiento para un pago mensual
 *
 * @param mes - Mes del pago (ej: 'Enero', 'Febrero')
 * @param anio - Año del pago
 * @returns Fecha de vencimiento (día 5 del mes siguiente)
 *
 * @example
 * calcularFechaVencimiento('Enero', 2026) // 2026-02-05
 * calcularFechaVencimiento('Diciembre', 2025) // 2026-01-05
 */
export function calcularFechaVencimiento(mes: string, anio: number): Date {
  const mesesMap: Record<string, number> = {
    Enero: 0,
    Febrero: 1,
    Marzo: 2,
    Abril: 3,
    Mayo: 4,
    Junio: 5,
    Julio: 6,
    Agosto: 7,
    Septiembre: 8,
    Octubre: 9,
    Noviembre: 10,
    Diciembre: 11,
  };

  const mesNumero = mesesMap[mes];
  if (mesNumero === undefined) {
    throw new Error(`Mes inválido: ${mes}`);
  }

  // Vencimiento es el día 5 del mes siguiente
  const fechaVencimiento = new Date(anio, mesNumero + 1, BUSINESS_RULES.PAGOS.DIA_VENCIMIENTO);

  return fechaVencimiento;
}
