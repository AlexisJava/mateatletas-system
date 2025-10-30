/**
 * Utilidades para calcular resultados de actividades
 * Sistema de estrellas dinámico según desempeño
 */

import type { Actividad } from '../types/actividad.types';

export interface RespuestaRegistrada {
  pregunta: number;
  esCorrecta: boolean;
  respuesta: string | boolean;
}

export interface ResultadoCalculado {
  puntajeObtenido: number;
  puntajeMaximo: number;
  porcentaje: number;
  estrellas: 0 | 1 | 2 | 3;
  preguntasCorrectas: number;
  preguntasTotales: number;
  tiempoEmpleado: number; // segundos
  xpGanado: number;
  monedasGanadas: number;
  mensaje: string;
  emoji: string;
}

/**
 * Calcular estrellas según porcentaje de aciertos
 *
 * Criterios:
 * - 0 estrellas: 0-39% (Reprobado)
 * - 1 estrella: 40-59% (Mínimo aceptable)
 * - 2 estrellas: 60-79% (Bien)
 * - 3 estrellas: 80-100% (Excelente)
 */
export function calcularEstrellas(porcentaje: number): 0 | 1 | 2 | 3 {
  if (porcentaje >= 80) return 3;
  if (porcentaje >= 60) return 2;
  if (porcentaje >= 40) return 1;
  return 0;
}

/**
 * Obtener mensaje motivacional según estrellas
 */
export function getMensajePorEstrellas(estrellas: 0 | 1 | 2 | 3): { mensaje: string; emoji: string } {
  const mensajes = {
    0: {
      mensaje: '¡Sigue intentando! La práctica hace al maestro.',
      emoji: '😓',
    },
    1: {
      mensaje: '¡Buen intento! Puedes mejorar tu puntaje.',
      emoji: '💪',
    },
    2: {
      mensaje: '¡Muy bien! Dominas el tema.',
      emoji: '🎉',
    },
    3: {
      mensaje: '¡PERFECTO! ¡Eres un campeón!',
      emoji: '🏆',
    },
  };

  return mensajes[estrellas];
}

/**
 * Calcular multiplicador de recompensas según estrellas
 *
 * - 0 estrellas: 25% de recompensas
 * - 1 estrella: 50% de recompensas
 * - 2 estrellas: 75% de recompensas
 * - 3 estrellas: 100% de recompensas
 */
export function getMultiplicadorRecompensas(estrellas: 0 | 1 | 2 | 3): number {
  const multiplicadores = {
    0: 0.25,
    1: 0.5,
    2: 0.75,
    3: 1.0,
  };

  return multiplicadores[estrellas];
}

/**
 * Calcular resultado completo de una actividad
 */
export function calcularResultado(
  actividad: Actividad,
  respuestas: RespuestaRegistrada[],
  tiempoEmpleadoSegundos: number
): ResultadoCalculado {
  const preguntasTotales = respuestas.length;
  const preguntasCorrectas = respuestas.filter((r) => r.esCorrecta).length;
  const porcentaje = preguntasTotales > 0 ? Math.round((preguntasCorrectas / preguntasTotales) * 100) : 0;

  const estrellas = calcularEstrellas(porcentaje);
  const multiplicador = getMultiplicadorRecompensas(estrellas);

  // Calcular puntaje
  const puntajeMaximo = actividad.puntosMaximos;
  const puntajeObtenido = Math.round(puntajeMaximo * (porcentaje / 100));

  // Calcular recompensas con multiplicador
  const xpGanado = Math.round(actividad.xpRecompensa * multiplicador);
  const monedasGanadas = Math.round(actividad.monedasRecompensa * multiplicador);

  const { mensaje, emoji } = getMensajePorEstrellas(estrellas);

  return {
    puntajeObtenido,
    puntajeMaximo,
    porcentaje,
    estrellas,
    preguntasCorrectas,
    preguntasTotales,
    tiempoEmpleado: tiempoEmpleadoSegundos,
    xpGanado,
    monedasGanadas,
    mensaje,
    emoji,
  };
}

/**
 * Formatear tiempo en formato legible
 */
export function formatearTiempo(segundos: number): string {
  if (segundos < 60) {
    return `${segundos}s`;
  }

  const minutos = Math.floor(segundos / 60);
  const segs = segundos % 60;

  if (segs === 0) {
    return `${minutos}m`;
  }

  return `${minutos}m ${segs}s`;
}

/**
 * Obtener color de fondo según estrellas para UI
 */
export function getColorPorEstrellas(estrellas: 0 | 1 | 2 | 3): {
  gradient: string;
  border: string;
  text: string;
} {
  const colores = {
    0: {
      gradient: 'from-gray-600 to-gray-800',
      border: 'border-gray-400',
      text: 'text-gray-300',
    },
    1: {
      gradient: 'from-yellow-600 to-orange-600',
      border: 'border-yellow-400',
      text: 'text-yellow-300',
    },
    2: {
      gradient: 'from-blue-600 to-indigo-600',
      border: 'border-blue-400',
      text: 'text-blue-300',
    },
    3: {
      gradient: 'from-purple-600 to-pink-600',
      border: 'border-purple-400',
      text: 'text-purple-300',
    },
  };

  return colores[estrellas];
}
