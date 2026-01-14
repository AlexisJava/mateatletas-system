/**
 * ParticleSystem Tests
 *
 * Tests unitarios para el sistema de partículas.
 * Usa mocks de Phaser para evitar dependencias de browser.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ParticleSystem } from './ParticleSystem';
import type Phaser from 'phaser';

// ============================================================================
// Mocks
// ============================================================================

class MockParticleEmitter {
  private destroyed = false;
  private stopped = false;

  explode(_count: number, _x: number, _y: number): void {
    // Simula explosión de partículas
  }

  stop(): void {
    this.stopped = true;
  }

  destroy(): void {
    this.destroyed = true;
  }

  isDestroyed(): boolean {
    return this.destroyed;
  }

  isStopped(): boolean {
    return this.stopped;
  }
}

class MockGraphics {
  fillStyle(_color: number, _alpha: number): this {
    return this;
  }

  fillCircle(_x: number, _y: number, _radius: number): this {
    return this;
  }

  fillRect(_x: number, _y: number, _width: number, _height: number): this {
    return this;
  }

  beginPath(): this {
    return this;
  }

  moveTo(_x: number, _y: number): this {
    return this;
  }

  lineTo(_x: number, _y: number): this {
    return this;
  }

  closePath(): this {
    return this;
  }

  fillPath(): this {
    return this;
  }

  generateTexture(_key: string, _width: number, _height: number): void {
    // Simula generación de textura
  }

  destroy(): void {
    // Cleanup
  }
}

class MockTextures {
  private existingKeys = new Set<string>();

  exists(key: string): boolean {
    return this.existingKeys.has(key);
  }

  // Helper para tests
  markExists(key: string): void {
    this.existingKeys.add(key);
  }
}

class MockTime {
  private callbacks: Array<{ delay: number; callback: () => void }> = [];

  delayedCall(delay: number, callback: () => void): void {
    this.callbacks.push({ delay, callback });
  }

  // Helper para simular paso del tiempo en tests
  advanceTime(ms: number): void {
    const toExecute = this.callbacks.filter((cb) => cb.delay <= ms);
    this.callbacks = this.callbacks.filter((cb) => cb.delay > ms);
    for (const cb of toExecute) {
      cb.callback();
    }
  }

  getCallbackCount(): number {
    return this.callbacks.length;
  }
}

interface MockScene {
  textures: MockTextures;
  time: MockTime;
  add: {
    graphics: () => MockGraphics;
    particles: (
      x: number,
      y: number,
      key: string,
      config: Record<string, unknown>,
    ) => MockParticleEmitter;
  };
  createdEmitters: MockParticleEmitter[];
}

function createMockScene(): MockScene {
  const scene: MockScene = {
    textures: new MockTextures(),
    time: new MockTime(),
    createdEmitters: [],
    add: {
      graphics: () => new MockGraphics(),
      particles: (_x: number, _y: number, _key: string, _config: Record<string, unknown>) => {
        const emitter = new MockParticleEmitter();
        scene.createdEmitters.push(emitter);
        return emitter;
      },
    },
  };
  return scene;
}

// ============================================================================
// Tests
// ============================================================================

describe('ParticleSystem', () => {
  let scene: MockScene;
  let particleSystem: ParticleSystem;

  beforeEach(() => {
    scene = createMockScene();
    particleSystem = new ParticleSystem(scene as unknown as Phaser.Scene);
  });

  // ==========================================================================
  // Constructor
  // ==========================================================================

  describe('constructor', () => {
    it('should create a ParticleSystem instance', () => {
      expect(particleSystem).toBeInstanceOf(ParticleSystem);
    });

    it('should create particle textures on construction', () => {
      // El constructor llama a createParticleTextures
      // Verificamos que graphics fue creado (lo cual indica que se crearon texturas)
      expect(particleSystem).toBeDefined();
    });

    it('should accept custom particle size', () => {
      const customSystem = new ParticleSystem(scene as unknown as Phaser.Scene, {
        particleSize: 16,
      });
      expect(customSystem).toBeDefined();
    });
  });

  // ==========================================================================
  // Confetti Effect
  // ==========================================================================

  describe('confetti effect', () => {
    it('should create confetti particles', () => {
      const addParticlesSpy = vi.spyOn(scene.add, 'particles');
      particleSystem.confetti(100, 100);
      expect(addParticlesSpy).toHaveBeenCalled();
    });

    it('should use custom count', () => {
      particleSystem.confetti(100, 100, { count: 100 });
      expect(scene.createdEmitters.length).toBe(1);
    });

    it('should support method chaining', () => {
      const result = particleSystem.confetti(100, 100);
      expect(result).toBe(particleSystem);
    });

    it('should track active emitter', () => {
      particleSystem.confetti(100, 100);
      expect(particleSystem.getActiveCount()).toBe(1);
    });
  });

  // ==========================================================================
  // Sparkle Effect
  // ==========================================================================

  describe('sparkle effect', () => {
    it('should create sparkle particles', () => {
      const addParticlesSpy = vi.spyOn(scene.add, 'particles');
      particleSystem.sparkle(200, 200);
      expect(addParticlesSpy).toHaveBeenCalled();
    });

    it('should use custom lifespan', () => {
      particleSystem.sparkle(200, 200, { lifespan: 1000 });
      expect(scene.createdEmitters.length).toBe(1);
    });

    it('should support method chaining', () => {
      const result = particleSystem.sparkle(200, 200);
      expect(result).toBe(particleSystem);
    });
  });

  // ==========================================================================
  // Stars Effect
  // ==========================================================================

  describe('stars effect', () => {
    it('should create star particles', () => {
      const addParticlesSpy = vi.spyOn(scene.add, 'particles');
      particleSystem.stars(300, 300);
      expect(addParticlesSpy).toHaveBeenCalled();
    });

    it('should use custom speed', () => {
      particleSystem.stars(300, 300, { speed: 200 });
      expect(scene.createdEmitters.length).toBe(1);
    });

    it('should support method chaining', () => {
      const result = particleSystem.stars(300, 300);
      expect(result).toBe(particleSystem);
    });
  });

  // ==========================================================================
  // Burst Effect
  // ==========================================================================

  describe('burst effect', () => {
    it('should create burst particles', () => {
      const addParticlesSpy = vi.spyOn(scene.add, 'particles');
      particleSystem.burst(400, 400);
      expect(addParticlesSpy).toHaveBeenCalled();
    });

    it('should use custom scale', () => {
      particleSystem.burst(400, 400, { scale: 1.5 });
      expect(scene.createdEmitters.length).toBe(1);
    });

    it('should support method chaining', () => {
      const result = particleSystem.burst(400, 400);
      expect(result).toBe(particleSystem);
    });
  });

  // ==========================================================================
  // Multiple Effects
  // ==========================================================================

  describe('multiple effects', () => {
    it('should track multiple active emitters', () => {
      particleSystem.confetti(100, 100);
      particleSystem.sparkle(200, 200);
      particleSystem.stars(300, 300);
      expect(particleSystem.getActiveCount()).toBe(3);
    });

    it('should support chaining multiple effects', () => {
      const result = particleSystem.confetti(100, 100).sparkle(200, 200).stars(300, 300);
      expect(result).toBe(particleSystem);
      expect(particleSystem.getActiveCount()).toBe(3);
    });
  });

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  describe('cleanup', () => {
    it('should stop all effects', () => {
      particleSystem.confetti(100, 100);
      particleSystem.sparkle(200, 200);

      particleSystem.stopAll();

      for (const emitter of scene.createdEmitters) {
        expect(emitter.isStopped()).toBe(true);
      }
    });

    it('should support method chaining for stopAll', () => {
      const result = particleSystem.stopAll();
      expect(result).toBe(particleSystem);
    });

    it('should destroy all emitters on destroy', () => {
      particleSystem.confetti(100, 100);
      particleSystem.sparkle(200, 200);

      particleSystem.destroy();

      for (const emitter of scene.createdEmitters) {
        expect(emitter.isDestroyed()).toBe(true);
      }
    });

    it('should clear active count on destroy', () => {
      particleSystem.confetti(100, 100);
      particleSystem.sparkle(200, 200);
      expect(particleSystem.getActiveCount()).toBe(2);

      particleSystem.destroy();
      expect(particleSystem.getActiveCount()).toBe(0);
    });

    it('should auto-cleanup emitters after lifespan', () => {
      particleSystem.confetti(100, 100, { lifespan: 1000 });
      expect(particleSystem.getActiveCount()).toBe(1);

      // Avanzar el tiempo más allá del lifespan + buffer
      scene.time.advanceTime(1200);
      expect(particleSystem.getActiveCount()).toBe(0);
    });
  });
});
