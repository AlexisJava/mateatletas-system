/**
 * InputSystem Tests
 *
 * Tests unitarios para el sistema de input.
 * Usa mocks de Phaser para evitar dependencias de browser.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InputSystem } from './InputSystem';
import { createMockScene, createMockPointer, type MockScene } from '../__mocks__/phaser';
import type Phaser from 'phaser';

describe('InputSystem', () => {
  let scene: MockScene;
  let inputSystem: InputSystem;

  beforeEach(() => {
    scene = createMockScene();
    // Cast para satisfacer tipos de Phaser
    inputSystem = new InputSystem(scene as unknown as Phaser.Scene);
  });

  // ==========================================================================
  // Constructor & Setup
  // ==========================================================================

  describe('constructor', () => {
    it('should create an InputSystem instance', () => {
      expect(inputSystem).toBeInstanceOf(InputSystem);
    });

    it('should accept custom swipe config', () => {
      const customInput = new InputSystem(scene as unknown as Phaser.Scene, {
        threshold: 100,
        maxTime: 500,
      });
      expect(customInput).toBeInstanceOf(InputSystem);
    });
  });

  // ==========================================================================
  // Swipe Detection
  // ==========================================================================

  describe('swipe detection', () => {
    it('should detect right swipe', () => {
      const callback = vi.fn();
      inputSystem.onSwipe(callback);

      // Simular swipe a la derecha (pointerdown -> pointermove -> pointerup)
      const startPointer = createMockPointer(100, 100);
      startPointer.downTime = 0;

      const endPointer = createMockPointer(200, 100); // +100 en X
      endPointer.upTime = 100; // 100ms después

      scene.input.emit('pointerdown', startPointer);
      scene.input.emit('pointerup', endPointer);

      expect(callback).toHaveBeenCalledWith('right');
    });

    it('should detect left swipe', () => {
      const callback = vi.fn();
      inputSystem.onSwipe(callback);

      const startPointer = createMockPointer(200, 100);
      startPointer.downTime = 0;

      const endPointer = createMockPointer(100, 100); // -100 en X
      endPointer.upTime = 100;

      scene.input.emit('pointerdown', startPointer);
      scene.input.emit('pointerup', endPointer);

      expect(callback).toHaveBeenCalledWith('left');
    });

    it('should detect up swipe', () => {
      const callback = vi.fn();
      inputSystem.onSwipe(callback);

      const startPointer = createMockPointer(100, 200);
      startPointer.downTime = 0;

      const endPointer = createMockPointer(100, 100); // -100 en Y
      endPointer.upTime = 100;

      scene.input.emit('pointerdown', startPointer);
      scene.input.emit('pointerup', endPointer);

      expect(callback).toHaveBeenCalledWith('up');
    });

    it('should detect down swipe', () => {
      const callback = vi.fn();
      inputSystem.onSwipe(callback);

      const startPointer = createMockPointer(100, 100);
      startPointer.downTime = 0;

      const endPointer = createMockPointer(100, 200); // +100 en Y
      endPointer.upTime = 100;

      scene.input.emit('pointerdown', startPointer);
      scene.input.emit('pointerup', endPointer);

      expect(callback).toHaveBeenCalledWith('down');
    });

    it('should not detect swipe if distance is too short', () => {
      const callback = vi.fn();
      inputSystem.onSwipe(callback);

      const startPointer = createMockPointer(100, 100);
      startPointer.downTime = 0;

      const endPointer = createMockPointer(120, 100); // Solo +20 en X (menor que threshold 50)
      endPointer.upTime = 100;

      scene.input.emit('pointerdown', startPointer);
      scene.input.emit('pointerup', endPointer);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should not detect swipe if time is too long', () => {
      const callback = vi.fn();
      inputSystem.onSwipe(callback);

      const startPointer = createMockPointer(100, 100);
      startPointer.downTime = 0;

      const endPointer = createMockPointer(200, 100);
      endPointer.upTime = 500; // 500ms (mayor que maxTime 300)

      scene.input.emit('pointerdown', startPointer);
      scene.input.emit('pointerup', endPointer);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Tap Detection
  // ==========================================================================

  describe('tap detection', () => {
    it('should detect tap', () => {
      const callback = vi.fn();
      inputSystem.onTap(callback);

      const startPointer = createMockPointer(100, 100);
      startPointer.downTime = 0;

      const endPointer = createMockPointer(102, 101); // Pequeño movimiento
      endPointer.upTime = 50; // 50ms (rápido)

      scene.input.emit('pointerdown', startPointer);
      scene.input.emit('pointerup', endPointer);

      expect(callback).toHaveBeenCalledWith(102, 101);
    });

    it('should not detect tap if movement is too large', () => {
      const callback = vi.fn();
      inputSystem.onTap(callback);

      const startPointer = createMockPointer(100, 100);
      startPointer.downTime = 0;

      const endPointer = createMockPointer(150, 100); // +50 en X
      endPointer.upTime = 50;

      scene.input.emit('pointerdown', startPointer);
      scene.input.emit('pointerup', endPointer);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Drag Detection
  // ==========================================================================

  describe('drag detection', () => {
    it('should emit drag events while pointer is down', () => {
      const callback = vi.fn();
      inputSystem.onDrag(callback);

      const startPointer = createMockPointer(100, 100);
      scene.input.emit('pointerdown', startPointer);

      const movePointer = createMockPointer(150, 120);
      scene.input.emit('pointermove', movePointer);

      expect(callback).toHaveBeenCalledWith(150, 120);
    });

    it('should not emit drag if pointer is not down', () => {
      const callback = vi.fn();
      inputSystem.onDrag(callback);

      const movePointer = createMockPointer(150, 120);
      scene.input.emit('pointermove', movePointer);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Keyboard Actions
  // ==========================================================================

  describe('keyboard actions', () => {
    it('should register action with keys', () => {
      const callback = vi.fn();
      inputSystem.registerAction('jump', ['SPACE'], callback);

      // Simular tecla presionada
      const spaceKey = scene.input.keyboard.getKey('SPACE');
      expect(spaceKey).toBeDefined();

      if (spaceKey) {
        spaceKey.press();
        inputSystem.update();
        expect(callback).toHaveBeenCalled();
      }
    });

    it('should only trigger once per keypress (JustDown behavior)', () => {
      const callback = vi.fn();
      inputSystem.registerAction('jump', ['SPACE'], callback);

      const spaceKey = scene.input.keyboard.getKey('SPACE');
      if (spaceKey) {
        spaceKey.press();

        // Primera llamada a update - debería disparar
        inputSystem.update();
        expect(callback).toHaveBeenCalledTimes(1);

        // Segunda llamada - tecla sigue presionada, no debería disparar
        inputSystem.update();
        expect(callback).toHaveBeenCalledTimes(1);

        // Soltar y presionar de nuevo
        spaceKey.release();
        inputSystem.update();
        spaceKey.press();
        inputSystem.update();
        expect(callback).toHaveBeenCalledTimes(2);
      }
    });

    it('should check if action is down', () => {
      inputSystem.registerAction('jump', ['SPACE'], vi.fn());

      expect(inputSystem.isActionDown('jump')).toBe(false);

      const spaceKey = scene.input.keyboard.getKey('SPACE');
      if (spaceKey) {
        spaceKey.press();
        expect(inputSystem.isActionDown('jump')).toBe(true);

        spaceKey.release();
        expect(inputSystem.isActionDown('jump')).toBe(false);
      }
    });

    it('should remove action', () => {
      const callback = vi.fn();
      inputSystem.registerAction('jump', ['SPACE'], callback);
      inputSystem.removeAction('jump');

      expect(inputSystem.isActionDown('jump')).toBe(false);
    });
  });

  // ==========================================================================
  // Method Chaining
  // ==========================================================================

  describe('method chaining', () => {
    it('should support method chaining', () => {
      const result = inputSystem
        .onSwipe(() => {})
        .onTap(() => {})
        .onDrag(() => {})
        .registerAction('test', ['A'], () => {});

      expect(result).toBe(inputSystem);
    });
  });

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  describe('destroy', () => {
    it('should clean up listeners on destroy', () => {
      const swipeCallback = vi.fn();
      inputSystem.onSwipe(swipeCallback);

      inputSystem.destroy();

      // Intentar emitir evento después de destroy
      const startPointer = createMockPointer(100, 100);
      startPointer.downTime = 0;
      const endPointer = createMockPointer(200, 100);
      endPointer.upTime = 100;

      scene.input.emit('pointerdown', startPointer);
      scene.input.emit('pointerup', endPointer);

      // El callback fue limpiado internamente, aunque el listener puede seguir
      // En un escenario real, scene.input.off() remueve el listener
      // Aquí verificamos que los callbacks internos fueron nullificados
      expect(swipeCallback).not.toHaveBeenCalled();
    });
  });
});
