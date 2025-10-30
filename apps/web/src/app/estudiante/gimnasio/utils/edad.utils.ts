/**
 * Utilidades para calcular edad y grupo etario del estudiante
 */

export type GrupoEtario = '6-7' | '8-9' | '10-12';

/**
 * Calcula la edad a partir de una fecha de nacimiento
 */
export function calcularEdad(fechaNacimiento: string | Date): number {
  const hoy = new Date();
  const nacimiento = typeof fechaNacimiento === 'string' ? new Date(fechaNacimiento) : fechaNacimiento;

  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  // Si aún no cumplió años este año, restar 1
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad;
}

/**
 * Determina el grupo etario según la edad
 * Según PDF: Grupo 1 (6-7), Grupo 2 (8-9), Grupo 3 (10-12)
 */
export function determinarGrupoEtario(edad: number): GrupoEtario {
  if (edad <= 7) return '6-7';
  if (edad <= 9) return '8-9';
  return '10-12';
}

/**
 * Obtiene el grupo etario directamente desde fecha de nacimiento
 */
export function obtenerGrupoEtario(fechaNacimiento: string | Date): GrupoEtario {
  const edad = calcularEdad(fechaNacimiento);
  return determinarGrupoEtario(edad);
}

/**
 * Metadata de cada grupo etario
 */
export const METADATA_GRUPOS: Record<
  GrupoEtario,
  {
    nombre: string;
    descripcion: string;
    rango: string;
    conceptos: string[];
  }
> = {
  '6-7': {
    nombre: 'Exploradores',
    descripcion: 'Primeros pasos en matemáticas y ciencia',
    rango: '6 a 7 años',
    conceptos: ['Sumas/restas hasta 1,000', 'Multiplicación básica', 'Proporciones simples (2:3)'],
  },
  '8-9': {
    nombre: 'Investigadores',
    descripcion: 'Conceptos intermedios y aplicación práctica',
    rango: '8 a 9 años',
    conceptos: [
      'Operaciones hasta 10,000',
      'Proporciones complejas',
      'Fracciones básicas',
      'Regla de 3 simple',
    ],
  },
  '10-12': {
    nombre: 'Científicos',
    descripcion: 'Pensamiento abstracto y resolución avanzada',
    rango: '10 a 12 años',
    conceptos: ['Ecuaciones simples', 'Porcentajes', 'Balanceo de ecuaciones', 'Optimización'],
  },
};
