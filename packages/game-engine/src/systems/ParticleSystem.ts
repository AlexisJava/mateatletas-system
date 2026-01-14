/**
 * ParticleSystem - Visual Effects for Educational Games
 *
 * Provee efectos de partículas predefinidos para juegos educativos:
 * - Confetti (celebración de logros)
 * - Sparkles (feedback positivo)
 * - Stars (XP/puntos ganados)
 * - Burst (explosión de energía)
 *
 * Usa el ParticleEmitter de Phaser 3.60+ (no ParticleEmitterManager).
 */

import type Phaser from 'phaser';

// ============================================================================
// Types
// ============================================================================

/** Colores predefinidos para efectos */
const PARTICLE_COLORS: Record<string, number[]> = {
  confetti: [0xff6b6b, 0x4ecdc4, 0xffe66d, 0xa855f7, 0x3b82f6],
  sparkle: [0xffffff, 0xfef08a, 0xfde047],
  stars: [0xfbbf24, 0xfcd34d, 0xfef08a],
  burst: [0xf97316, 0xef4444, 0xfbbf24],
};

/** Configuración base para un efecto de partículas */
interface ParticleEffectConfig {
  /** Cantidad de partículas a emitir */
  count?: number;
  /** Duración de vida de las partículas en ms */
  lifespan?: number;
  /** Velocidad inicial de las partículas */
  speed?: number;
  /** Escala de las partículas (0-1) */
  scale?: number;
  /** Gravedad vertical */
  gravityY?: number;
}

/** Opciones de configuración del sistema */
interface ParticleSystemConfig {
  /** Tamaño de la textura de partícula generada */
  particleSize: number;
}

/** Registro interno de emitters activos */
interface ActiveEmitter {
  key: string;
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;
}

// ============================================================================
// ParticleSystem Class
// ============================================================================

/**
 * Sistema de partículas para efectos visuales en juegos educativos
 *
 * @example
 * class MyScene extends BaseScene {
 *   private particles!: ParticleSystem;
 *
 *   create() {
 *     this.particles = new ParticleSystem(this);
 *
 *     // Al acertar una respuesta
 *     this.particles.sparkle(button.x, button.y);
 *
 *     // Al completar un nivel
 *     this.particles.confetti(centerX, centerY, { count: 100 });
 *
 *     // Al ganar XP
 *     this.particles.stars(xpDisplay.x, xpDisplay.y);
 *   }
 * }
 */
export class ParticleSystem {
  private scene: Phaser.Scene;
  private config: ParticleSystemConfig;
  private activeEmitters: ActiveEmitter[] = [];
  private textureKeys: Map<string, string> = new Map();

  // ============================================================================
  // Constructor
  // ============================================================================

  constructor(scene: Phaser.Scene, config?: Partial<ParticleSystemConfig>) {
    this.scene = scene;
    this.config = {
      particleSize: config?.particleSize ?? 8,
    };

    this.createParticleTextures();
  }

  // ============================================================================
  // Texture Generation
  // ============================================================================

  /**
   * Crea texturas procedurales para las partículas
   * Evita necesitar assets externos
   */
  private createParticleTextures(): void {
    this.createCircleTexture('particle_circle');
    this.createStarTexture('particle_star');
    this.createSquareTexture('particle_square');
  }

  private createCircleTexture(key: string): void {
    if (this.scene.textures.exists(key)) {
      this.textureKeys.set('circle', key);
      return;
    }

    const size = this.config.particleSize;
    const graphics = this.scene.add.graphics();

    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(size / 2, size / 2, size / 2);
    graphics.generateTexture(key, size, size);
    graphics.destroy();

    this.textureKeys.set('circle', key);
  }

  private createStarTexture(key: string): void {
    if (this.scene.textures.exists(key)) {
      this.textureKeys.set('star', key);
      return;
    }

    const size = this.config.particleSize;
    const graphics = this.scene.add.graphics();

    // Dibujar estrella de 5 puntas
    graphics.fillStyle(0xffffff, 1);
    this.drawStar(graphics, size / 2, size / 2, 5, size / 2, size / 4);
    graphics.generateTexture(key, size, size);
    graphics.destroy();

    this.textureKeys.set('star', key);
  }

  private createSquareTexture(key: string): void {
    if (this.scene.textures.exists(key)) {
      this.textureKeys.set('square', key);
      return;
    }

    const size = this.config.particleSize;
    const graphics = this.scene.add.graphics();

    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, size, size);
    graphics.generateTexture(key, size, size);
    graphics.destroy();

    this.textureKeys.set('square', key);
  }

  /**
   * Dibuja una estrella en el graphics context
   */
  private drawStar(
    graphics: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number,
  ): void {
    const step = Math.PI / spikes;
    let rotation = (Math.PI / 2) * 3;

    graphics.beginPath();
    graphics.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      // Punto exterior
      let x = cx + Math.cos(rotation) * outerRadius;
      let y = cy + Math.sin(rotation) * outerRadius;
      graphics.lineTo(x, y);
      rotation += step;

      // Punto interior
      x = cx + Math.cos(rotation) * innerRadius;
      y = cy + Math.sin(rotation) * innerRadius;
      graphics.lineTo(x, y);
      rotation += step;
    }

    graphics.lineTo(cx, cy - outerRadius);
    graphics.closePath();
    graphics.fillPath();
  }

  // ============================================================================
  // Particle Effects
  // ============================================================================

  /**
   * Efecto de confetti - para celebraciones y logros
   */
  confetti(x: number, y: number, config?: ParticleEffectConfig): this {
    const textureKey = this.textureKeys.get('square');
    if (!textureKey) return this;

    const count = config?.count ?? 50;
    const lifespan = config?.lifespan ?? 2000;
    const speed = config?.speed ?? 300;
    const scale = config?.scale ?? 1;
    const gravityY = config?.gravityY ?? 200;

    const emitter = this.scene.add.particles(x, y, textureKey, {
      lifespan,
      speed: { min: speed * 0.5, max: speed },
      scale: { start: scale, end: scale * 0.5 },
      alpha: { start: 1, end: 0 },
      angle: { min: 0, max: 360 },
      rotate: { min: 0, max: 360 },
      gravityY,
      tint: PARTICLE_COLORS.confetti,
      emitting: false,
    });

    emitter.explode(count, x, y);

    this.trackEmitter('confetti', emitter, lifespan);
    return this;
  }

  /**
   * Efecto de sparkle - para feedback positivo/correcto
   */
  sparkle(x: number, y: number, config?: ParticleEffectConfig): this {
    const textureKey = this.textureKeys.get('circle');
    if (!textureKey) return this;

    const count = config?.count ?? 20;
    const lifespan = config?.lifespan ?? 600;
    const speed = config?.speed ?? 150;
    const scale = config?.scale ?? 0.8;

    const emitter = this.scene.add.particles(x, y, textureKey, {
      lifespan,
      speed: { min: speed * 0.3, max: speed },
      scale: { start: scale, end: 0 },
      alpha: { start: 1, end: 0 },
      angle: { min: 0, max: 360 },
      tint: PARTICLE_COLORS.sparkle,
      emitting: false,
    });

    emitter.explode(count, x, y);

    this.trackEmitter('sparkle', emitter, lifespan);
    return this;
  }

  /**
   * Efecto de estrellas - para XP y puntos ganados
   */
  stars(x: number, y: number, config?: ParticleEffectConfig): this {
    const textureKey = this.textureKeys.get('star');
    if (!textureKey) return this;

    const count = config?.count ?? 15;
    const lifespan = config?.lifespan ?? 1000;
    const speed = config?.speed ?? 100;
    const scale = config?.scale ?? 1.2;
    const gravityY = config?.gravityY ?? -50; // Flotan hacia arriba

    const emitter = this.scene.add.particles(x, y, textureKey, {
      lifespan,
      speed: { min: speed * 0.5, max: speed },
      scale: { start: scale, end: scale * 0.3 },
      alpha: { start: 1, end: 0 },
      angle: { min: 220, max: 320 }, // Mayormente hacia arriba
      rotate: { min: -30, max: 30 },
      gravityY,
      tint: PARTICLE_COLORS.stars,
      emitting: false,
    });

    emitter.explode(count, x, y);

    this.trackEmitter('stars', emitter, lifespan);
    return this;
  }

  /**
   * Efecto de burst - explosión de energía genérica
   */
  burst(x: number, y: number, config?: ParticleEffectConfig): this {
    const textureKey = this.textureKeys.get('circle');
    if (!textureKey) return this;

    const count = config?.count ?? 30;
    const lifespan = config?.lifespan ?? 400;
    const speed = config?.speed ?? 250;
    const scale = config?.scale ?? 1;

    const emitter = this.scene.add.particles(x, y, textureKey, {
      lifespan,
      speed: { min: speed * 0.8, max: speed },
      scale: { start: scale, end: 0 },
      alpha: { start: 1, end: 0 },
      angle: { min: 0, max: 360 },
      tint: PARTICLE_COLORS.burst,
      emitting: false,
    });

    emitter.explode(count, x, y);

    this.trackEmitter('burst', emitter, lifespan);
    return this;
  }

  // ============================================================================
  // Emitter Management
  // ============================================================================

  /**
   * Registra un emitter y programa su limpieza
   */
  private trackEmitter(
    key: string,
    emitter: Phaser.GameObjects.Particles.ParticleEmitter,
    lifespan: number,
  ): void {
    const entry: ActiveEmitter = { key, emitter };
    this.activeEmitters.push(entry);

    // Cleanup después de que terminen las partículas
    this.scene.time.delayedCall(lifespan + 100, () => {
      this.removeEmitter(entry);
    });
  }

  private removeEmitter(entry: ActiveEmitter): void {
    const index = this.activeEmitters.indexOf(entry);
    if (index !== -1) {
      entry.emitter.destroy();
      this.activeEmitters.splice(index, 1);
    }
  }

  /**
   * Obtiene el número de emitters activos
   */
  getActiveCount(): number {
    return this.activeEmitters.length;
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  /**
   * Detiene todos los efectos de partículas
   */
  stopAll(): this {
    for (const entry of this.activeEmitters) {
      entry.emitter.stop();
    }
    return this;
  }

  /**
   * Limpia todos los recursos del sistema
   */
  destroy(): void {
    for (const entry of this.activeEmitters) {
      entry.emitter.destroy();
    }
    this.activeEmitters = [];
    this.textureKeys.clear();
  }
}
