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
