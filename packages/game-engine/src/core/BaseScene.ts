/**
 * BaseScene - Base class for all game templates
 *
 * Todas las escenas de juego deben extender esta clase.
 * Provee funcionalidad común: scoring, timing, callbacks, state management.
 */

import Phaser from 'phaser';
import { EventBus } from './EventBus';
import type { GameCallbacks, GameConfig, GameProgress, GameResult, SceneInitData } from './types';

/**
 * Clase base abstracta para todas las escenas de juego
 *
 * @example
 * class CatcherScene extends BaseScene<CatcherConfig> {
 *   create() {
 *     super.create();
 *     // Setup específico del catcher...
 *   }
 *
 *   update(time: number, delta: number) {
 *     super.update(time, delta);
 *     // Lógica del juego...
 *   }
 * }
 */
export abstract class BaseScene<TConfig = Record<string, unknown>> extends Phaser.Scene {
  // ============================================================================
  // Protected Properties (accesibles por subclases)
  // ============================================================================

  /** Configuración del juego */
  protected config!: GameConfig<TConfig>;

  /** Callbacks para comunicación con React */
  protected callbacks!: GameCallbacks;

  /** Puntuación actual */
  protected score = 0;

  /** Vidas restantes */
  protected lives = 3;

  /** Combo actual (respuestas correctas consecutivas) */
  protected combo = 0;

  /** Máximo combo alcanzado */
  protected maxCombo = 0;

  /** Total de respuestas correctas */
  protected correctAnswers = 0;

  /** Total de intentos */
  protected totalAttempts = 0;

  /** Tiempo de inicio del juego (ms) */
  protected startTime = 0;

  /** Si el juego está pausado */
  protected isPaused = false;

  /** Si el juego ya terminó */
  protected isGameOver = false;

  /** Intervalo para auto-save de progreso (ms) */
  protected progressSaveInterval = 5000;

  /** Timer para auto-save */
  private progressTimer?: Phaser.Time.TimerEvent;

  // ============================================================================
  // Constructor
  // ============================================================================

  constructor(sceneKey: string) {
    super({ key: sceneKey });
  }

  // ============================================================================
  // Phaser Lifecycle Methods
  // ============================================================================

  /**
   * Inicializa la escena con datos pasados desde PhaserGame
   */
  init(data: SceneInitData<TConfig>): void {
    this.config = data.config;
    this.callbacks = data.callbacks;

    // Inicializar estado desde config
    this.lives = this.config.lives;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.correctAnswers = 0;
    this.totalAttempts = 0;
    this.isGameOver = false;
    this.isPaused = false;

    // Restaurar estado previo si existe
    if (data.previousState) {
      this.restoreState(data.previousState);
    }
  }

  /**
   * Setup inicial de la escena
   * Las subclases deben llamar super.create()
   */
  create(): void {
    this.startTime = this.time.now;

    // Setup auto-save de progreso
    if (this.callbacks.onProgress) {
      this.progressTimer = this.time.addEvent({
        delay: this.progressSaveInterval,
        callback: this.saveProgress,
        callbackScope: this,
        loop: true,
      });
    }

    // Escuchar eventos de pausa/resume
    EventBus.onGamePause(this.handlePause);
    EventBus.onGameResume(this.handleResume);

    // Notificar que la escena está lista
    EventBus.emitGameReady({ sceneKey: this.scene.key });
  }

  /**
   * Loop principal del juego
   * Las subclases deben llamar super.update()
   */
  update(_time: number, _delta: number): void {
    if (this.isPaused || this.isGameOver) return;

    // Verificar tiempo límite
    if (this.config.duration) {
      const elapsed = this.getElapsedTime();
      if (elapsed >= this.config.duration) {
        this.endGame(true);
      }
    }
  }

  /**
   * Cleanup cuando la escena se destruye
   */
  shutdown(): void {
    // Remover listeners del EventBus
    EventBus.offGamePause(this.handlePause);
    EventBus.offGameResume(this.handleResume);

    // Cancelar timer de progreso
    if (this.progressTimer) {
      this.progressTimer.destroy();
    }
  }

  // ============================================================================
  // Game Logic Methods (para usar en subclases)
  // ============================================================================

  /**
   * Registra una respuesta correcta
   */
  protected onCorrectAnswer(points = 10): void {
    this.correctAnswers++;
    this.totalAttempts++;
    this.combo++;

    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    // Bonus por combo
    const comboMultiplier = Math.min(this.combo, 5);
    const finalPoints = points * comboMultiplier;
    this.score += finalPoints;
  }

  /**
   * Registra una respuesta incorrecta
   */
  protected onWrongAnswer(penalty = 0): void {
    this.totalAttempts++;
    this.combo = 0;
    this.score = Math.max(0, this.score - penalty);
  }

  /**
   * Resta una vida y verifica game over
   */
  protected loseLife(): boolean {
    this.lives--;
    this.combo = 0;

    if (this.lives <= 0) {
      this.endGame(false);
      return true;
    }
    return false;
  }

  /**
   * Obtiene el tiempo transcurrido en segundos
   */
  protected getElapsedTime(): number {
    return (this.time.now - this.startTime) / 1000;
  }

  /**
   * Obtiene el tiempo restante en segundos (si hay límite)
   */
  protected getRemainingTime(): number | null {
    if (!this.config.duration) return null;
    return Math.max(0, this.config.duration - this.getElapsedTime());
  }

  /**
   * Calcula la precisión (0-1)
   */
  protected getAccuracy(): number {
    if (this.totalAttempts === 0) return 1;
    return this.correctAnswers / this.totalAttempts;
  }

  // ============================================================================
  // Game State Methods
  // ============================================================================

  /**
   * Termina el juego (victoria o derrota)
   */
  protected endGame(success: boolean): void {
    if (this.isGameOver) return;
    this.isGameOver = true;

    // Cancelar timer de progreso
    if (this.progressTimer) {
      this.progressTimer.destroy();
    }

    const result = this.buildGameResult(success);

    // Emitir evento y llamar callback
    EventBus.emitGameComplete(result);
    this.callbacks.onComplete(result);
  }

  /**
   * Construye el resultado final del juego
   */
  protected buildGameResult(success: boolean): GameResult {
    const timeElapsed = this.getElapsedTime();
    const accuracy = this.getAccuracy();

    // Calcular XP basado en performance
    const baseXP = success ? 50 : 10;
    const accuracyBonus = Math.floor(accuracy * 30);
    const comboBonus = Math.floor(this.maxCombo * 2);
    const xp = baseXP + accuracyBonus + comboBonus;

    return {
      score: this.score,
      xp,
      timeElapsed,
      livesRemaining: this.lives,
      maxCombo: this.maxCombo,
      accuracy,
      success,
    };
  }

  /**
   * Guarda el progreso actual
   */
  protected saveProgress = (): void => {
    if (!this.callbacks.onProgress || this.isGameOver) return;

    const progress: GameProgress = {
      score: this.score,
      lives: this.lives,
      timeElapsed: this.getElapsedTime(),
      templateState: this.getTemplateState(),
    };

    EventBus.emitGameProgress(progress);
    this.callbacks.onProgress(progress);
  };

  /**
   * Obtiene estado específico del template para serializar
   * Las subclases pueden override este método
   */
  protected getTemplateState(): Record<string, unknown> {
    return {};
  }

  /**
   * Restaura estado desde un save previo
   */
  protected restoreState(state: GameProgress): void {
    this.score = state.score;
    this.lives = state.lives;
    // timeElapsed se recalcula desde startTime
    // templateState debe ser manejado por la subclase
  }

  // ============================================================================
  // Pause/Resume Handlers
  // ============================================================================

  private handlePause = (): void => {
    if (this.isGameOver) return;
    this.isPaused = true;
    this.scene.pause();
  };

  private handleResume = (): void => {
    if (this.isGameOver) return;
    this.isPaused = false;
    this.scene.resume();
  };
}
