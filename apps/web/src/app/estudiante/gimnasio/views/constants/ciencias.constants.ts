/**
 * Constantes para las 4 ciencias del Mes de la Ciencia - Noviembre 2025
 */

import type { MetadatosCiencia, CodigoCiencia } from '../types/entrenamientos.types';

/**
 * Metadatos de las 4 ciencias del mes
 * Orden: Química (1) → Astronomía (2) → Física (3) → Informática (4)
 */
export const METADATOS_CIENCIAS: Readonly<Record<CodigoCiencia, MetadatosCiencia>> = {
  '2025-11-mes-ciencia-quimica': {
    codigo: '2025-11-mes-ciencia-quimica',
    titulo: 'Laboratorio Mágico',
    descripcion: 'Balancea ecuaciones y mezcla reactivos en experimentos químicos',
    emoji: '⚗️',
    gradient: 'from-green-500 to-emerald-600',
    orden: 1,
  },
  '2025-11-mes-ciencia-astronomia': {
    codigo: '2025-11-mes-ciencia-astronomia',
    titulo: 'Observatorio Galáctico',
    descripcion: 'Calcula órbitas planetarias y velocidades de asteroides',
    emoji: '🔭',
    gradient: 'from-indigo-600 to-purple-700',
    orden: 2,
  },
  '2025-11-mes-ciencia-fisica': {
    codigo: '2025-11-mes-ciencia-fisica',
    titulo: 'Parque de Diversiones',
    descripcion: 'Diseña montañas rusas con física aplicada',
    emoji: '🎢',
    gradient: 'from-orange-500 to-red-600',
    orden: 3,
  },
  '2025-11-mes-ciencia-informatica': {
    codigo: '2025-11-mes-ciencia-informatica',
    titulo: 'Academia de Programadores',
    descripcion: 'Crea algoritmos y resuelve laberintos con código',
    emoji: '💻',
    gradient: 'from-cyan-500 to-blue-600',
    orden: 4,
  },
} as const;

/**
 * Array ordenado de las ciencias para renderizado
 */
export const CIENCIAS_ORDENADAS: readonly CodigoCiencia[] = [
  '2025-11-mes-ciencia-quimica',
  '2025-11-mes-ciencia-astronomia',
  '2025-11-mes-ciencia-fisica',
  '2025-11-mes-ciencia-informatica',
] as const;

/**
 * Total de actividades por ciencia (4 semanas cada una)
 */
export const ACTIVIDADES_POR_CIENCIA = 4 as const;

/**
 * Total de ciencias en el mes
 */
export const TOTAL_CIENCIAS = 4 as const;

/**
 * Máximo de estrellas por ciencia
 */
export const MAX_ESTRELLAS_POR_CIENCIA = 4 as const;

/**
 * Total de actividades en el mes completo
 */
export const TOTAL_ACTIVIDADES_MES = TOTAL_CIENCIAS * ACTIVIDADES_POR_CIENCIA; // 16
