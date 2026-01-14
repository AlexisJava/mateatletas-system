/**
 * ShooterScene - Disparar a targets móviles
 *
 * Mecánica: Targets se mueven por la pantalla. El jugador dispara
 * proyectiles para destruir los correctos y evitar los incorrectos.
 *
 * Uso educativo: Identificar números primos, verbos, elementos químicos, etc.
 */

import Phaser from 'phaser';
import { BaseScene } from '../../core/BaseScene';
import { InputSystem } from '../../systems/InputSystem';
import { ParticleSystem } from '../../systems/ParticleSystem';
import type { ShooterConfig } from '@mateatletas/contracts';

// ============================================================================
// Types
// ============================================================================

/** Target móvil */
interface Target {
  container: Phaser.GameObjects.Container;
  value: string;
  isCorrect: boolean;
  speed: number;
  direction: Phaser.Math.Vector2;
}

/** Proyectil disparado */
interface Projectile {
  graphics: Phaser.GameObjects.Graphics;
  direction: Phaser.Math.Vector2;
  speed: number;
}

// ============================================================================
// ShooterScene
// ============================================================================

export class ShooterScene extends BaseScene<ShooterConfig> {
  // Systems
  private inputSystem!: InputSystem;
  private particles!: ParticleSystem;

  // Game state
  private targets: Target[] = [];
  private projectiles: Projectile[] = [];
  private spawnTimer?: Phaser.Time.TimerEvent;
  private crosshair!: Phaser.GameObjects.Container;

  // Keyboard keys for direct polling
  private cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey?: Phaser.Input.Keyboard.Key;

  // Dimensions
  private gameWidth = 0;
  private gameHeight = 0;

  // ============================================================================
  // Constructor
  // ============================================================================

  constructor() {
    super('shooter');
  }

  // ============================================================================
  // Phaser Lifecycle
  // ============================================================================

  create(): void {
    super.create();

    this.gameWidth = this.scale.width;
    this.gameHeight = this.scale.height;

    // Initialize systems
    this.inputSystem = new InputSystem(this);
    this.particles = new ParticleSystem(this);

    // Setup game
    this.createBackground();
    this.createCrosshair();
    this.createUI();
    this.setupInput();
    this.startSpawning();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    if (this.isGameOver || this.isPaused) return;

    this.updateCrosshair(delta);
    this.updateProjectiles(delta);
    this.updateTargets(delta);
    this.checkCollisions();
  }

  shutdown(): void {
    super.shutdown();
    this.inputSystem.destroy();
    this.particles.destroy();
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }
  }

  // ============================================================================
  // Setup Methods
  // ============================================================================

  private createBackground(): void {
    // Fondo espacial
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1f, 0x0a0a1f, 0x1a1a3f, 0x1a1a3f, 1);
    bg.fillRect(0, 0, this.gameWidth, this.gameHeight);

    // Estrellas
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, this.gameWidth);
      const y = Phaser.Math.Between(0, this.gameHeight);
      const size = Phaser.Math.FloatBetween(0.5, 2);
      const alpha = Phaser.Math.FloatBetween(0.3, 1);

      const star = this.add.graphics();
      star.fillStyle(0xffffff, alpha);
      star.fillCircle(x, y, size);

      // Parpadeo de estrellas
      this.tweens.add({
        targets: star,
        alpha: alpha * 0.3,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private createCrosshair(): void {
    this.crosshair = this.add.container(this.gameWidth / 2, this.gameHeight / 2);

    const graphics = this.add.graphics();

    // Círculo exterior
    graphics.lineStyle(2, 0x00ff00, 0.8);
    graphics.strokeCircle(0, 0, 20);

    // Cruz
    graphics.lineStyle(1, 0x00ff00, 0.6);
    graphics.lineBetween(-30, 0, -10, 0);
    graphics.lineBetween(10, 0, 30, 0);
    graphics.lineBetween(0, -30, 0, -10);
    graphics.lineBetween(0, 10, 0, 30);

    // Punto central
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(0, 0, 2);

    this.crosshair.add(graphics);
    this.crosshair.setDepth(100);
  }

  private createUI(): void {
    const panelHeight = 60;

    // Panel superior
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.7);
    panel.fillRect(0, 0, this.gameWidth, panelHeight);

    // Score
    this.add.text(20, 15, 'SCORE', {
      fontSize: '12px',
      color: '#9ca3af',
      fontFamily: 'sans-serif',
    });

    const scoreText = this.add.text(20, 32, '0', {
      fontSize: '24px',
      color: '#00ff00',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
    });

    // Lives
    this.add
      .text(this.gameWidth - 20, 15, 'VIDAS', {
        fontSize: '12px',
        color: '#9ca3af',
        fontFamily: 'sans-serif',
      })
      .setOrigin(1, 0);

    const livesText = this.add
      .text(this.gameWidth - 20, 32, '❤️'.repeat(this.lives), {
        fontSize: '20px',
      })
      .setOrigin(1, 0);

    // Timer
    let timerText: Phaser.GameObjects.Text | null = null;
    if (this.config.duration) {
      this.add
        .text(this.gameWidth / 2, 15, 'TIEMPO', {
          fontSize: '12px',
          color: '#9ca3af',
          fontFamily: 'sans-serif',
        })
        .setOrigin(0.5, 0);

      timerText = this.add
        .text(this.gameWidth / 2, 32, this.config.duration.toString(), {
          fontSize: '24px',
          color: '#fbbf24',
          fontFamily: 'sans-serif',
          fontStyle: 'bold',
        })
        .setOrigin(0.5, 0);
    }

    // Instruction
    this.add
      .text(this.gameWidth / 2, this.gameHeight - 30, this.config.instruction, {
        fontSize: '14px',
        color: '#9ca3af',
        fontFamily: 'sans-serif',
      })
      .setOrigin(0.5, 0.5);

    // Update UI
    this.events.on('update', () => {
      scoreText.setText(this.score.toString());
      livesText.setText('❤️'.repeat(Math.max(0, this.lives)));

      if (timerText && this.config.duration) {
        const remaining = this.getRemainingTime();
        if (remaining !== null) {
          timerText.setText(Math.ceil(remaining).toString());
          if (remaining <= 10) {
            timerText.setColor('#ef4444');
          }
        }
      }
    });
  }

  private setupInput(): void {
    // Mouse/touch para crosshair y disparo
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.crosshair.setPosition(pointer.x, pointer.y);
    });

    this.input.on('pointerdown', () => {
      this.shoot();
    });

    // Teclado para movimiento y disparo
    if (this.input.keyboard) {
      this.cursorKeys = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
  }

  // ============================================================================
  // Spawning
  // ============================================================================

  private startSpawning(): void {
    const config = this.config.templateConfig;
    const spawnInterval = config.spawnInterval ?? 2000;

    this.spawnTimer = this.time.addEvent({
      delay: spawnInterval,
      callback: this.spawnTarget,
      callbackScope: this,
      loop: true,
    });

    // Spawn inicial
    this.spawnTarget();
    this.time.delayedCall(500, () => this.spawnTarget());
  }

  private spawnTarget(): void {
    if (this.isGameOver || this.isPaused) return;
    if (this.targets.length >= 6) return; // Máximo 6 targets

    const config = this.config.templateConfig;

    // Decidir si es correcto (50% correcto)
    const isCorrect = Math.random() < 0.5;
    const pool = isCorrect ? config.correct : config.wrong;

    if (!pool || pool.length === 0) return;

    const value: string = Phaser.Utils.Array.GetRandom(pool);

    // Posición de spawn (desde los bordes)
    const side = Phaser.Math.Between(0, 3);
    let x: number, y: number;

    switch (side) {
      case 0: // Top
        x = Phaser.Math.Between(50, this.gameWidth - 50);
        y = 80;
        break;
      case 1: // Right
        x = this.gameWidth - 50;
        y = Phaser.Math.Between(100, this.gameHeight - 100);
        break;
      case 2: // Bottom
        x = Phaser.Math.Between(50, this.gameWidth - 50);
        y = this.gameHeight - 50;
        break;
      default: // Left
        x = 50;
        y = Phaser.Math.Between(100, this.gameHeight - 100);
    }

    // Dirección hacia el centro con algo de variación
    const centerX = this.gameWidth / 2 + Phaser.Math.Between(-100, 100);
    const centerY = this.gameHeight / 2 + Phaser.Math.Between(-100, 100);
    const direction = new Phaser.Math.Vector2(centerX - x, centerY - y).normalize();

    const speed = config.targetSpeed ?? 80;
    const target = this.createTarget(x, y, value, isCorrect, speed, direction);
    this.targets.push(target);
  }

  private createTarget(
    x: number,
    y: number,
    value: string,
    isCorrect: boolean,
    speed: number,
    direction: Phaser.Math.Vector2,
  ): Target {
    const container = this.add.container(x, y);

    // Cuerpo del target
    const body = this.add.graphics();
    const color = isCorrect ? 0x22c55e : 0xef4444;
    const glowColor = isCorrect ? 0x00ff00 : 0xff0000;

    // Glow
    body.fillStyle(glowColor, 0.3);
    body.fillCircle(0, 0, 40);

    // Círculo principal
    body.fillStyle(color, 1);
    body.fillCircle(0, 0, 30);

    // Borde
    body.lineStyle(2, 0xffffff, 0.5);
    body.strokeCircle(0, 0, 30);

    container.add(body);

    // Texto
    const text = this.add
      .text(0, 0, value, {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    container.add(text);

    // Animación de flotación
    this.tweens.add({
      targets: container,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    return {
      container,
      value,
      isCorrect,
      speed,
      direction,
    };
  }

  // ============================================================================
  // Game Logic
  // ============================================================================

  private shoot(): void {
    if (this.isGameOver || this.isPaused) return;

    const x = this.crosshair.x;
    const y = this.crosshair.y;

    // Crear proyectil
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(0, 0, 5);
    graphics.setPosition(x, y);

    // Trail effect
    const trail = this.add.graphics();
    trail.fillStyle(0x00ff00, 0.3);
    trail.fillCircle(0, 0, 8);
    trail.setPosition(x, y);
    this.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 2,
      duration: 200,
      onComplete: () => trail.destroy(),
    });

    // Dirección hacia arriba
    const direction = new Phaser.Math.Vector2(0, -1);

    this.projectiles.push({
      graphics,
      direction,
      speed: 600,
    });

    // Efecto de retroceso en crosshair
    this.tweens.add({
      targets: this.crosshair,
      scale: 0.8,
      duration: 50,
      yoyo: true,
    });
  }

  private updateCrosshair(delta: number): void {
    if (!this.cursorKeys) return;

    const speed = 300 * (delta / 1000);

    if (this.cursorKeys.left.isDown) {
      this.crosshair.x = Math.max(0, this.crosshair.x - speed);
    }
    if (this.cursorKeys.right.isDown) {
      this.crosshair.x = Math.min(this.gameWidth, this.crosshair.x + speed);
    }
    if (this.cursorKeys.up.isDown) {
      this.crosshair.y = Math.max(60, this.crosshair.y - speed);
    }
    if (this.cursorKeys.down.isDown) {
      this.crosshair.y = Math.min(this.gameHeight - 40, this.crosshair.y + speed);
    }

    // Disparar con espacio
    if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.shoot();
    }
  }

  private updateProjectiles(delta: number): void {
    const dt = delta / 1000;

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      const moveX = proj.direction.x * proj.speed * dt;
      const moveY = proj.direction.y * proj.speed * dt;

      proj.graphics.x += moveX;
      proj.graphics.y += moveY;

      // Remover si sale de pantalla
      if (
        proj.graphics.y < 0 ||
        proj.graphics.y > this.gameHeight ||
        proj.graphics.x < 0 ||
        proj.graphics.x > this.gameWidth
      ) {
        proj.graphics.destroy();
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateTargets(delta: number): void {
    const dt = delta / 1000;

    for (const target of this.targets) {
      const moveX = target.direction.x * target.speed * dt;
      const moveY = target.direction.y * target.speed * dt;

      target.container.x += moveX;
      target.container.y += moveY;

      // Rebotar en bordes
      const margin = 30;
      if (target.container.x < margin || target.container.x > this.gameWidth - margin) {
        target.direction.x *= -1;
      }
      if (target.container.y < 80 || target.container.y > this.gameHeight - margin) {
        target.direction.y *= -1;
      }
    }
  }

  private checkCollisions(): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];

      for (let j = this.targets.length - 1; j >= 0; j--) {
        const target = this.targets[j];

        const dist = Phaser.Math.Distance.Between(
          proj.graphics.x,
          proj.graphics.y,
          target.container.x,
          target.container.y,
        );

        if (dist < 35) {
          // Hit!
          this.onHit(target, proj);
          return;
        }
      }
    }
  }

  private onHit(target: Target, projectile: Projectile): void {
    const x = target.container.x;
    const y = target.container.y;

    if (target.isCorrect) {
      this.particles.sparkle(x, y);
      this.onCorrectAnswer(20);
    } else {
      this.particles.burst(x, y);
      this.onWrongAnswer(10);
      this.loseLife();
    }

    // Remover target y proyectil
    this.removeTarget(target);
    this.removeProjectile(projectile);
  }

  private removeTarget(target: Target): void {
    // Animación de explosión
    this.tweens.add({
      targets: target.container,
      scale: 1.5,
      alpha: 0,
      duration: 150,
      onComplete: () => target.container.destroy(),
    });

    const index = this.targets.indexOf(target);
    if (index !== -1) {
      this.targets.splice(index, 1);
    }
  }

  private removeProjectile(projectile: Projectile): void {
    projectile.graphics.destroy();
    const index = this.projectiles.indexOf(projectile);
    if (index !== -1) {
      this.projectiles.splice(index, 1);
    }
  }

  // ============================================================================
  // State
  // ============================================================================

  protected override getTemplateState(): Record<string, unknown> {
    return {
      targets: this.targets.length,
      projectiles: this.projectiles.length,
    };
  }
}

// ============================================================================
// Register Template
// ============================================================================

import { GameRegistry } from '../../core/GameRegistry';

GameRegistry.register(ShooterScene, {
  id: 'shooter',
  name: 'Shooter',
  description: 'Dispara a los targets correctos que se mueven en pantalla',
  category: 'arcade',
  complexity: 'medium',
});
