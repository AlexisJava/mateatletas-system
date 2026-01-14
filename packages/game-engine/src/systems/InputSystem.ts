/**
 * InputSystem - Unified Input Handler for Game Scenes
 *
 * Provee una API simplificada para manejar input en juegos educativos:
 * - Detección de swipes (touch/mouse drag)
 * - Bindings de teclado por acción
 * - Callbacks tipados para eventos
 *
 * Usa el sistema unificado de Phaser (Pointer = mouse + touch).
 */

import type Phaser from 'phaser';

// ============================================================================
// Types
// ============================================================================

/** Direcciones cardinales para swipes y movimiento */
export type Direction = 'up' | 'down' | 'left' | 'right';

/** Callback sin argumentos */
type VoidCallback = () => void;

/** Callback con dirección */
type DirectionCallback = (direction: Direction) => void;

/** Callback con posición */
type PositionCallback = (x: number, y: number) => void;

/** Configuración para detección de swipe */
interface SwipeConfig {
  /** Distancia mínima en pixels para considerar swipe (default: 50) */
  threshold: number;
  /** Tiempo máximo en ms para completar el swipe (default: 300) */
  maxTime: number;
}

/** Estado interno del pointer para tracking */
interface PointerState {
  startX: number;
  startY: number;
  startTime: number;
  isDown: boolean;
}

/** Registro de una acción con sus bindings */
interface ActionEntry {
  keys: Phaser.Input.Keyboard.Key[];
  callback: VoidCallback;
  /** Track para JustDown manual */
  wasDown: boolean[];
}

// ============================================================================
// InputSystem Class
// ============================================================================

/**
 * Sistema de input para escenas de juego
 *
 * @example
 * // En una escena
 * class MyScene extends BaseScene {
 *   private input!: InputSystem;
 *
 *   create() {
 *     super.create();
 *     this.inputSystem = new InputSystem(this);
 *
 *     // Detectar swipes
 *     this.inputSystem.onSwipe((dir) => console.log('Swipe:', dir));
 *
 *     // Registrar acción con teclas
 *     this.inputSystem.registerAction('jump', ['SPACE', 'UP'], () => this.jump());
 *   }
 *
 *   update() {
 *     this.inputSystem.update();
 *   }
 * }
 */
export class InputSystem {
  private scene: Phaser.Scene;
  private swipeConfig: SwipeConfig;
  private pointerState: PointerState;

  // Callbacks
  private swipeCallback: DirectionCallback | null = null;
  private tapCallback: PositionCallback | null = null;
  private dragCallback: PositionCallback | null = null;

  // Actions registry
  private actions = new Map<string, ActionEntry>();

  // ============================================================================
  // Constructor
  // ============================================================================

  constructor(scene: Phaser.Scene, swipeConfig?: Partial<SwipeConfig>) {
    this.scene = scene;
    this.swipeConfig = {
      threshold: swipeConfig?.threshold ?? 50,
      maxTime: swipeConfig?.maxTime ?? 300,
    };
    this.pointerState = {
      startX: 0,
      startY: 0,
      startTime: 0,
      isDown: false,
    };

    this.setupPointerListeners();
  }

  // ============================================================================
  // Setup
  // ============================================================================

  private setupPointerListeners(): void {
    const input = this.scene.input;

    input.on('pointerdown', this.handlePointerDown, this);
    input.on('pointerup', this.handlePointerUp, this);
    input.on('pointermove', this.handlePointerMove, this);
  }

  // ============================================================================
  // Pointer Handlers
  // ============================================================================

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    this.pointerState = {
      startX: pointer.x,
      startY: pointer.y,
      startTime: pointer.downTime,
      isDown: true,
    };
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (!this.pointerState.isDown) return;

    const deltaX = pointer.x - this.pointerState.startX;
    const deltaY = pointer.y - this.pointerState.startY;
    const deltaTime = pointer.upTime - this.pointerState.startTime;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Check for swipe
    if (
      this.swipeCallback &&
      distance >= this.swipeConfig.threshold &&
      deltaTime <= this.swipeConfig.maxTime
    ) {
      const direction = this.getSwipeDirection(deltaX, deltaY);
      this.swipeCallback(direction);
    }
    // Check for tap (short distance, short time)
    else if (this.tapCallback && distance < 10 && deltaTime < 200) {
      this.tapCallback(pointer.x, pointer.y);
    }

    this.pointerState.isDown = false;
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.pointerState.isDown || !this.dragCallback) return;

    this.dragCallback(pointer.x, pointer.y);
  }

  private getSwipeDirection(deltaX: number, deltaY: number): Direction {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > absY) {
      return deltaX > 0 ? 'right' : 'left';
    }
    return deltaY > 0 ? 'down' : 'up';
  }

  // ============================================================================
  // Public API - Pointer Events
  // ============================================================================

  /**
   * Registra callback para swipes
   */
  onSwipe(callback: DirectionCallback): this {
    this.swipeCallback = callback;
    return this;
  }

  /**
   * Registra callback para taps (click/touch corto)
   */
  onTap(callback: PositionCallback): this {
    this.tapCallback = callback;
    return this;
  }

  /**
   * Registra callback para drag (mientras se mantiene presionado)
   */
  onDrag(callback: PositionCallback): this {
    this.dragCallback = callback;
    return this;
  }

  // ============================================================================
  // Public API - Keyboard Actions
  // ============================================================================

  /**
   * Registra una acción con teclas asociadas
   *
   * @param actionName - Nombre único de la acción
   * @param keys - Array de códigos de tecla (ej: ['SPACE', 'UP', 'W'])
   * @param callback - Función a ejecutar cuando se presiona la tecla
   */
  registerAction(actionName: string, keys: string[], callback: VoidCallback): this {
    const keyboard = this.scene.input.keyboard;
    if (!keyboard) return this;

    const keyObjects = keys
      .map((keyCode) => keyboard.addKey(keyCode))
      .filter((key): key is Phaser.Input.Keyboard.Key => key !== null);

    this.actions.set(actionName, {
      keys: keyObjects,
      callback,
      wasDown: keyObjects.map(() => false),
    });

    return this;
  }

  /**
   * Elimina una acción registrada
   */
  removeAction(actionName: string): this {
    const entry = this.actions.get(actionName);
    if (entry) {
      const keyboard = this.scene.input.keyboard;
      if (keyboard) {
        for (const key of entry.keys) {
          keyboard.removeKey(key);
        }
      }
      this.actions.delete(actionName);
    }
    return this;
  }

  /**
   * Verifica si una acción está siendo presionada (held down)
   */
  isActionDown(actionName: string): boolean {
    const entry = this.actions.get(actionName);
    if (!entry) return false;

    return entry.keys.some((key) => key.isDown);
  }

  // ============================================================================
  // Update Loop
  // ============================================================================

  /**
   * Debe llamarse en el update() de la escena para procesar acciones
   */
  update(): void {
    for (const [, entry] of this.actions) {
      for (let i = 0; i < entry.keys.length; i++) {
        const key = entry.keys[i];
        const isDown = key.isDown;
        const wasDown = entry.wasDown[i];

        // JustDown: está presionada ahora pero no estaba antes
        if (isDown && !wasDown) {
          entry.callback();
          entry.wasDown[i] = true;
          break; // Solo disparar una vez por frame
        }

        // Actualizar estado previo
        entry.wasDown[i] = isDown;
      }
    }
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  /**
   * Limpia todos los listeners y acciones
   */
  destroy(): void {
    const input = this.scene.input;

    input.off('pointerdown', this.handlePointerDown, this);
    input.off('pointerup', this.handlePointerUp, this);
    input.off('pointermove', this.handlePointerMove, this);

    // Limpiar acciones
    for (const [actionName] of this.actions) {
      this.removeAction(actionName);
    }

    this.swipeCallback = null;
    this.tapCallback = null;
    this.dragCallback = null;
  }
}
