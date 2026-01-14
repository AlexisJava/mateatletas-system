/**
 * Core Types for Game Engine
 *
 * Tipos compartidos para el sistema de juegos.
 * Todos los templates y sistemas usan estos tipos.
 */

import type { Area, House } from '@mateatletas/contracts';

// ============================================================================
// Game Result & Callbacks
// ============================================================================

/**
 * Resultado final de un juego completado
 */
export interface GameResult {
  /** Puntuación final obtenida */
  score: number;
  /** XP calculado basado en performance */
  xp: number;
  /** Tiempo total jugado en segundos */
  timeElapsed: number;
  /** Vidas restantes al finalizar */
  livesRemaining: number;
  /** Máximo combo alcanzado */
  maxCombo: number;
  /** Respuestas correctas / intentos totales */
  accuracy: number;
  /** Si el jugador completó con éxito (no perdió todas las vidas) */
  success: boolean;
}

/**
 * Estado parcial para guardar progreso
 */
export interface GameProgress {
  /** Puntuación actual */
  score: number;
  /** Vidas restantes */
  lives: number;
  /** Tiempo transcurrido en segundos */
  timeElapsed: number;
  /** Datos específicos del template (serializable) */
  templateState: Record<string, unknown>;
}

/**
 * Callbacks que React pasa al juego
 */
export interface GameCallbacks {
  /** Llamado cuando el juego termina (victoria o derrota) */
  onComplete: (result: GameResult) => void;
  /** Llamado periódicamente para guardar progreso (opcional) */
  onProgress?: (progress: GameProgress) => void;
  /** Llamado cuando ocurre un error en el juego */
  onError?: (error: Error) => void;
}

// ============================================================================
// Game Configuration
// ============================================================================

/**
 * Configuración base que todos los templates reciben
 */
export interface BaseGameConfig {
  /** Título del juego mostrado en UI */
  title: string;
  /** Instrucción breve para el jugador */
  instruction: string;
  /** Duración máxima en segundos (undefined = sin límite) */
  duration?: number;
  /** Vidas iniciales */
  lives: number;
  /** Dificultad del juego */
  difficulty: 'easy' | 'medium' | 'hard';
  /** Área educativa (para theming) */
  area: Area;
  /** Casa del estudiante (para theming) */
  house: House;
}

/**
 * Configuración extendida con datos específicos del template
 */
export interface GameConfig<T = Record<string, unknown>> extends BaseGameConfig {
  /** Configuración específica del template */
  templateConfig: T;
}

// ============================================================================
// Scene Configuration
// ============================================================================

/**
 * Datos que BaseScene recibe en su constructor
 */
export interface SceneInitData<T = Record<string, unknown>> {
  /** Configuración del juego */
  config: GameConfig<T>;
  /** Callbacks para comunicación con React */
  callbacks: GameCallbacks;
  /** Estado previo para restaurar (si existe) */
  previousState?: GameProgress;
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * Eventos emitidos por el EventBus
 */
export type GameEventType =
  | 'game-ready'
  | 'game-complete'
  | 'game-progress'
  | 'game-error'
  | 'game-pause'
  | 'game-resume';

/**
 * Mapa de eventos a sus payloads
 */
export interface GameEventMap {
  'game-ready': { sceneKey: string };
  'game-complete': GameResult;
  'game-progress': GameProgress;
  'game-error': { error: Error; context?: string };
  'game-pause': undefined;
  'game-resume': undefined;
}

// ============================================================================
// Registry Types
// ============================================================================

/**
 * Metadata de un template registrado
 */
export interface TemplateMetadata {
  /** ID único del template */
  id: string;
  /** Nombre para mostrar */
  name: string;
  /** Descripción breve */
  description: string;
  /** Categoría del template */
  category: 'arcade' | 'puzzle' | 'quiz' | 'creative' | 'strategy' | 'exploration';
  /** Complejidad de implementación */
  complexity: 'low' | 'medium' | 'high';
}
