/**
 * Data de las 4 semanas temáticas del Mes de la Ciencia (Noviembre 2025)
 * Grid 2×2 con temáticas de ciencia
 */

export type TemaCiencia = 'quimica' | 'astronomia' | 'fisica' | 'informatica';
export type EstadoSemana = 'completada' | 'en-progreso' | 'disponible' | 'bloqueada';

export interface Semana {
  id: string;
  numero: 1 | 2 | 3 | 4;
  emoji: string;
  titulo: string;
  tema: TemaCiencia;
  progreso: number; // 0-100
  estado: EstadoSemana;
  estrellas: number; // 0-4
  totalEstrellas: 4;
  puntos: number;
  tiempoInvertido: string; // "1h 25m"
}

export interface TemaColors {
  gradient: string;
  border: string;
  glow: string;
}

/**
 * Colores por tema - Estética Brawl Stars (saturados, vibrantes)
 */
export const TEMA_COLORS: Record<TemaCiencia, TemaColors> = {
  quimica: {
    gradient: 'from-emerald-500 to-emerald-700',
    border: '#10b981',
    glow: 'rgba(16, 185, 129, 0.6)',
  },
  astronomia: {
    gradient: 'from-purple-600 to-indigo-800',
    border: '#9333ea',
    glow: 'rgba(147, 51, 234, 0.6)',
  },
  fisica: {
    gradient: 'from-orange-500 to-red-600',
    border: '#f97316',
    glow: 'rgba(249, 115, 22, 0.6)',
  },
  informatica: {
    gradient: 'from-cyan-500 to-blue-600',
    border: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.6)',
  },
};

/**
 * Las 4 semanas del Mes de la Ciencia
 */
export const SEMANAS_MES_CIENCIA: readonly Semana[] = [
  {
    id: 'quimica',
    numero: 1,
    emoji: '🧪',
    titulo: 'Laboratorio Mágico',
    tema: 'quimica',
    progreso: 0,
    estado: 'disponible',
    estrellas: 0,
    totalEstrellas: 4,
    puntos: 0,
    tiempoInvertido: '0m',
  },
  {
    id: 'astronomia',
    numero: 2,
    emoji: '🔭',
    titulo: 'Observatorio Galáctico',
    tema: 'astronomia',
    progreso: 0,
    estado: 'disponible',
    estrellas: 0,
    totalEstrellas: 4,
    puntos: 0,
    tiempoInvertido: '0m',
  },
  {
    id: 'fisica',
    numero: 3,
    emoji: '🎢',
    titulo: 'Parque de Diversiones',
    tema: 'fisica',
    progreso: 0,
    estado: 'disponible',
    estrellas: 0,
    totalEstrellas: 4,
    puntos: 0,
    tiempoInvertido: '0m',
  },
  {
    id: 'informatica',
    numero: 4,
    emoji: '💻',
    titulo: 'Academia de Programadores',
    tema: 'informatica',
    progreso: 0,
    estado: 'disponible',
    estrellas: 0,
    totalEstrellas: 4,
    puntos: 0,
    tiempoInvertido: '0m',
  },
] as const;
