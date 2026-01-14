/**
 * EventBus - Communication Bridge between React and Phaser
 *
 * EventEmitter completamente tipado para comunicación bidireccional
 * entre el mundo React y las escenas Phaser.
 *
 * Usa métodos específicos por evento para garantizar type-safety
 * completa sin usar `any`, `unknown`, o `as`.
 */

import type { GameProgress, GameResult } from './types';

// ============================================================================
// Callback Types
// ============================================================================

type GameReadyCallback = (data: { sceneKey: string }) => void;
type GameCompleteCallback = (data: GameResult) => void;
type GameProgressCallback = (data: GameProgress) => void;
type GameErrorCallback = (data: { error: Error; context?: string }) => void;
type GamePauseCallback = () => void;
type GameResumeCallback = () => void;

// ============================================================================
// Listener Entry
// ============================================================================

interface ListenerEntry<T> {
  callback: T;
  once: boolean;
}

// ============================================================================
// EventBus Class
// ============================================================================

/**
 * EventBus tipado para comunicación React ↔ Phaser
 *
 * Cada evento tiene métodos específicos para garantizar type-safety.
 *
 * @example
 * // Emitir desde Phaser
 * EventBus.emitGameComplete({ score: 100, xp: 50, ... });
 *
 * @example
 * // Escuchar desde React
 * EventBus.onGameComplete((result) => console.log(result));
 */
class TypedEventBus {
  private static instance: TypedEventBus | null = null;

  // Listeners por evento
  private readyListeners: ListenerEntry<GameReadyCallback>[] = [];
  private completeListeners: ListenerEntry<GameCompleteCallback>[] = [];
  private progressListeners: ListenerEntry<GameProgressCallback>[] = [];
  private errorListeners: ListenerEntry<GameErrorCallback>[] = [];
  private pauseListeners: ListenerEntry<GamePauseCallback>[] = [];
  private resumeListeners: ListenerEntry<GameResumeCallback>[] = [];

  private constructor() {}

  static getInstance(): TypedEventBus {
    if (!TypedEventBus.instance) {
      TypedEventBus.instance = new TypedEventBus();
    }
    return TypedEventBus.instance;
  }

  // ==========================================================================
  // game-ready
  // ==========================================================================

  emitGameReady(data: { sceneKey: string }): boolean {
    return this.emitToListeners(this.readyListeners, data);
  }

  onGameReady(callback: GameReadyCallback): this {
    this.readyListeners.push({ callback, once: false });
    return this;
  }

  onceGameReady(callback: GameReadyCallback): this {
    this.readyListeners.push({ callback, once: true });
    return this;
  }

  offGameReady(callback?: GameReadyCallback): this {
    this.readyListeners = this.removeCallback(this.readyListeners, callback);
    return this;
  }

  // ==========================================================================
  // game-complete
  // ==========================================================================

  emitGameComplete(data: GameResult): boolean {
    return this.emitToListeners(this.completeListeners, data);
  }

  onGameComplete(callback: GameCompleteCallback): this {
    this.completeListeners.push({ callback, once: false });
    return this;
  }

  onceGameComplete(callback: GameCompleteCallback): this {
    this.completeListeners.push({ callback, once: true });
    return this;
  }

  offGameComplete(callback?: GameCompleteCallback): this {
    this.completeListeners = this.removeCallback(this.completeListeners, callback);
    return this;
  }

  // ==========================================================================
  // game-progress
  // ==========================================================================

  emitGameProgress(data: GameProgress): boolean {
    return this.emitToListeners(this.progressListeners, data);
  }

  onGameProgress(callback: GameProgressCallback): this {
    this.progressListeners.push({ callback, once: false });
    return this;
  }

  onceGameProgress(callback: GameProgressCallback): this {
    this.progressListeners.push({ callback, once: true });
    return this;
  }

  offGameProgress(callback?: GameProgressCallback): this {
    this.progressListeners = this.removeCallback(this.progressListeners, callback);
    return this;
  }

  // ==========================================================================
  // game-error
  // ==========================================================================

  emitGameError(data: { error: Error; context?: string }): boolean {
    return this.emitToListeners(this.errorListeners, data);
  }

  onGameError(callback: GameErrorCallback): this {
    this.errorListeners.push({ callback, once: false });
    return this;
  }

  onceGameError(callback: GameErrorCallback): this {
    this.errorListeners.push({ callback, once: true });
    return this;
  }

  offGameError(callback?: GameErrorCallback): this {
    this.errorListeners = this.removeCallback(this.errorListeners, callback);
    return this;
  }

  // ==========================================================================
  // game-pause
  // ==========================================================================

  emitGamePause(): boolean {
    return this.emitToVoidListeners(this.pauseListeners);
  }

  onGamePause(callback: GamePauseCallback): this {
    this.pauseListeners.push({ callback, once: false });
    return this;
  }

  onceGamePause(callback: GamePauseCallback): this {
    this.pauseListeners.push({ callback, once: true });
    return this;
  }

  offGamePause(callback?: GamePauseCallback): this {
    this.pauseListeners = this.removeCallback(this.pauseListeners, callback);
    return this;
  }

  // ==========================================================================
  // game-resume
  // ==========================================================================

  emitGameResume(): boolean {
    return this.emitToVoidListeners(this.resumeListeners);
  }

  onGameResume(callback: GameResumeCallback): this {
    this.resumeListeners.push({ callback, once: false });
    return this;
  }

  onceGameResume(callback: GameResumeCallback): this {
    this.resumeListeners.push({ callback, once: true });
    return this;
  }

  offGameResume(callback?: GameResumeCallback): this {
    this.resumeListeners = this.removeCallback(this.resumeListeners, callback);
    return this;
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Limpia todos los listeners
   */
  removeAllGameListeners(): void {
    this.readyListeners = [];
    this.completeListeners = [];
    this.progressListeners = [];
    this.errorListeners = [];
    this.pauseListeners = [];
    this.resumeListeners = [];
  }

  /**
   * Destruye la instancia singleton
   */
  static destroy(): void {
    if (TypedEventBus.instance) {
      TypedEventBus.instance.removeAllGameListeners();
      TypedEventBus.instance = null;
    }
  }

  // ==========================================================================
  // Private Helpers
  // ==========================================================================

  /**
   * Emite a listeners que reciben data
   */
  private emitToListeners<T, D>(listeners: ListenerEntry<(data: D) => T>[], data: D): boolean {
    if (listeners.length === 0) return false;

    const toCall = [...listeners];
    const toRemove: ListenerEntry<(data: D) => T>[] = [];

    for (const entry of toCall) {
      entry.callback(data);
      if (entry.once) {
        toRemove.push(entry);
      }
    }

    // Remover los once listeners
    for (const entry of toRemove) {
      const idx = listeners.indexOf(entry);
      if (idx !== -1) {
        listeners.splice(idx, 1);
      }
    }

    return true;
  }

  /**
   * Emite a listeners sin argumentos
   */
  private emitToVoidListeners<T>(listeners: ListenerEntry<() => T>[]): boolean {
    if (listeners.length === 0) return false;

    const toCall = [...listeners];
    const toRemove: ListenerEntry<() => T>[] = [];

    for (const entry of toCall) {
      entry.callback();
      if (entry.once) {
        toRemove.push(entry);
      }
    }

    for (const entry of toRemove) {
      const idx = listeners.indexOf(entry);
      if (idx !== -1) {
        listeners.splice(idx, 1);
      }
    }

    return true;
  }

  /**
   * Remueve un callback de un array de listeners
   */
  private removeCallback<T>(listeners: ListenerEntry<T>[], callback?: T): ListenerEntry<T>[] {
    if (!callback) {
      return [];
    }
    return listeners.filter((entry) => entry.callback !== callback);
  }
}

// ============================================================================
// Exports
// ============================================================================

export const EventBus = TypedEventBus.getInstance();
export const destroyEventBus = TypedEventBus.destroy.bind(TypedEventBus);
