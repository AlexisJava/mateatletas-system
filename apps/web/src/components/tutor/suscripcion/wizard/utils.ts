/**
 * Utilidades del Wizard de Nueva Suscripción
 *
 * Funciones puras para cálculos de edad, casa y mapeo de datos.
 */

import type { ClubConClaseGrupos } from '@/lib/api/catalogo.api';
import type {
  CasaTipo,
  CalcularCasaResult,
  ProductoConCasa,
  CasaConfig,
  MundoConfig,
  MundoTipo,
} from './types';

/** Configuración de casas por rango de edad */
export const CASAS: Record<CasaTipo, CasaConfig> = {
  QUANTUM: { nombre: 'Quantum', edadMin: 6, edadMax: 9, color: 'cyan' },
  VERTEX: { nombre: 'Vertex', edadMin: 10, edadMax: 12, color: 'violet' },
  PULSAR: { nombre: 'Pulsar', edadMin: 13, edadMax: 17, color: 'amber' },
} as const;

/** Configuración de mundos STEAM */
export const MUNDOS: Record<MundoTipo, MundoConfig> = {
  MATEMATICA: { nombre: 'Matemática', emoji: '🔢', color: 'orange' },
  PROGRAMACION: { nombre: 'Programación', emoji: '💻', color: 'green' },
  CIENCIAS: { nombre: 'Ciencias', emoji: '🔬', color: 'blue' },
} as const;

/** Mapeo de días de la semana del backend a español */
export const DIAS_SEMANA: Record<string, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
} as const;

/**
 * Calcula la edad en años desde una fecha de nacimiento
 *
 * @param fechaNacimiento - Fecha en formato ISO o Date object
 * @returns Edad en años o null si la fecha es inválida
 */
export function calcularEdad(fechaNacimiento: string | Date | null): number | null {
  if (!fechaNacimiento) return null;

  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);

  if (isNaN(nacimiento.getTime())) return null;

  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mesActual = hoy.getMonth();
  const mesNacimiento = nacimiento.getMonth();

  if (
    mesActual < mesNacimiento ||
    (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())
  ) {
    edad--;
  }

  return edad;
}

/**
 * Calcula la casa según la edad del estudiante
 *
 * REGLA DE NEGOCIO:
 * - QUANTUM: 6-9 años (Exploradores)
 * - VERTEX: 10-12 años (Constructores)
 * - PULSAR: 13-17 años (Dominadores)
 *
 * @param fechaNacimiento - Fecha de nacimiento del estudiante
 * @returns Objeto con la casa calculada y posible error si está fuera de rango
 */
export function calcularCasa(fechaNacimiento: string | Date | null): CalcularCasaResult {
  if (!fechaNacimiento) {
    return { casa: null, error: null };
  }

  const edad = calcularEdad(fechaNacimiento);

  if (edad === null) {
    return { casa: null, error: 'Fecha de nacimiento inválida' };
  }

  if (edad < 6) {
    return {
      casa: null,
      error: 'El estudiante debe tener al menos 6 años para Mateatletas',
    };
  }

  if (edad > 17) {
    return {
      casa: null,
      error: 'Mateatletas es para estudiantes de hasta 17 años',
    };
  }

  if (edad >= 6 && edad <= 9) {
    return { casa: 'QUANTUM', error: null };
  }

  if (edad >= 10 && edad <= 12) {
    return { casa: 'VERTEX', error: null };
  }

  return { casa: 'PULSAR', error: null };
}

/**
 * Convierte un Club del backend al formato esperado por el wizard
 *
 * @param club - Club con clase grupos del catálogo API
 * @returns Producto formateado para el wizard
 */
export function mapClubToProducto(club: ClubConClaseGrupos): ProductoConCasa {
  return {
    id: club.id,
    nombre: club.nombre,
    descripcion: club.descripcion ?? '',
    tipo: 'Club',
    casa: club.casa as CasaTipo | null,
    mundo: club.mundo as MundoTipo | null,
    activo: club.activo,
    claseGrupos: club.claseGrupos.map((cg) => ({
      id: cg.id,
      nombre: cg.nombre,
      diaSemana: DIAS_SEMANA[cg.diaSemana] ?? cg.diaSemana,
      horaInicio: cg.horaInicio,
      horaFin: cg.horaFin,
      docente: cg.docente ?? undefined,
      cupoDisponible: cg.cupoMaximo,
    })),
  };
}

/**
 * Obtiene el nombre completo de un hijo (existente o nuevo)
 */
export function obtenerNombreCompleto(
  hijo: { nombre: string; apellido: string } | null,
  nuevoHijo: { nombre: string; apellido: string } | null,
): string {
  if (hijo) {
    return `${hijo.nombre} ${hijo.apellido}`;
  }
  if (nuevoHijo) {
    return `${nuevoHijo.nombre} ${nuevoHijo.apellido}`;
  }
  return 'Sin nombre';
}

/**
 * Obtiene las iniciales de un nombre completo
 */
export function obtenerIniciales(nombreCompleto: string): string {
  return nombreCompleto
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
