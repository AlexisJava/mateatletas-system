/**
 * Phaser Mock para testing
 *
 * Provee mocks mínimos de Phaser para testear sistemas sin
 * necesitar un entorno de browser real.
 */

import { vi } from 'vitest';

// ============================================================================
// Mock Key
// ============================================================================

export class MockKey {
  isDown = false;
  keyCode: string;

  constructor(keyCode: string) {
    this.keyCode = keyCode;
  }

  // Simula presionar la tecla
  press(): void {
    this.isDown = true;
  }

  // Simula soltar la tecla
  release(): void {
    this.isDown = false;
  }
}

// ============================================================================
// Mock Keyboard Plugin
// ============================================================================

export class MockKeyboardPlugin {
  private keys = new Map<string, MockKey>();

  addKey(keyCode: string): MockKey {
    const key = new MockKey(keyCode);
    this.keys.set(keyCode, key);
    return key;
  }

  removeKey(key: MockKey): void {
    this.keys.delete(key.keyCode);
  }

  getKey(keyCode: string): MockKey | undefined {
    return this.keys.get(keyCode);
  }
}

// ============================================================================
// Mock Pointer
// ============================================================================

export class MockPointer {
  x = 0;
  y = 0;
  downTime = 0;
  upTime = 0;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

// ============================================================================
// Mock Input Plugin
// ============================================================================

export class MockInputPlugin {
  keyboard: MockKeyboardPlugin;
  private listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  constructor() {
    this.keyboard = new MockKeyboardPlugin();
  }

  on(event: string, callback: (...args: unknown[]) => void, context?: unknown): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const boundCallback = context ? callback.bind(context) : callback;
    this.listeners.get(event)?.add(boundCallback);
    return this;
  }

  off(event: string, callback: (...args: unknown[]) => void, _context?: unknown): this {
    this.listeners.get(event)?.delete(callback);
    return this;
  }

  // Helper para simular eventos en tests
  emit(event: string, ...args: unknown[]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      for (const cb of callbacks) {
        cb(...args);
      }
    }
  }
}

// ============================================================================
// Mock Scene
// ============================================================================

export class MockScene {
  input: MockInputPlugin;

  constructor() {
    this.input = new MockInputPlugin();
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createMockScene(): MockScene {
  return new MockScene();
}

export function createMockPointer(x = 0, y = 0): MockPointer {
  return new MockPointer(x, y);
}

// ============================================================================
// Vitest Mock Setup
// ============================================================================

vi.mock('phaser', () => ({
  default: {
    Scene: MockScene,
    Input: {
      Keyboard: {
        Key: MockKey,
      },
      Pointer: MockPointer,
    },
  },
}));
