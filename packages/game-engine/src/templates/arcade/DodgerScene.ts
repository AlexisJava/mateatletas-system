/**
 * DodgerScene - Esquivar obstáculos
 *
 * Mecánica: El jugador controla un personaje que debe esquivar
 * obstáculos que caen/se mueven, mientras recolecta items correctos.
 *
 * Uso educativo: Evitar errores de código, respuestas incorrectas,
 * mientras se recolectan respuestas correctas.
 */

import Phaser from 'phaser';
import { BaseScene } from '../../core/BaseScene';
import { InputSystem } from '../../systems/InputSystem';
import { ParticleSystem } from '../../systems/ParticleSystem';
import type { DodgerConfig } from '@mateatletas/contracts';

// ============================================================================
// Types
// ============================================================================

/** Obstáculo que cae */
interface Obstacle {
  container: Phaser.GameObjects.Container;
  value: string;
  isCorrect: boolean;
  speed: number;
}

// ============================================================================
// DodgerScene
// ============================================================================

export class DodgerScene extends BaseScene<DodgerConfig> {
  // Systems
  private inputSystem!: InputSystem;
  private particles!: ParticleSystem;

  // Game objects
  private player!: Phaser.GameObjects.Container;
  private obstacles: Obstacle[] = [];
  private spawnTimer?: Phaser.Time.TimerEvent;

  // Keyboard
  private cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;

  // Dimensions
  private gameWidth = 0;
  private gameHeight = 0;

  // Player state
  private playerSpeed = 350;
  private playerSize = 40;

  // ============================================================================
  // Constructor
  // ============================================================================

  constructor() {
    super('dodger');
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
    this.createPlayer();
    this.createUI();
    this.setupInput();
    this.startSpawning();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    if (this.isGameOver || this.isPaused) return;

    this.updatePlayer(delta);
    this.updateObstacles(delta);
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
    // Fondo con gradiente tipo cielo nocturno
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a0a2e, 0x1a0a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, this.gameWidth, this.gameHeight);

    // Grid de fondo (efecto retro)
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x4a00e0, 0.1);

    // Líneas verticales
    for (let x = 0; x < this.gameWidth; x += 40) {
      grid.lineBetween(x, 0, x, this.gameHeight);
    }

    // Líneas horizontales
    for (let y = 0; y < this.gameHeight; y += 40) {
      grid.lineBetween(0, y, this.gameWidth, y);
    }

    // Zona segura visual (abajo)
    const safeZone = this.add.graphics();
    safeZone.fillStyle(0x00ff00, 0.05);
    safeZone.fillRect(0, this.gameHeight - 80, this.gameWidth, 80);
  }

  private createPlayer(): void {
    const startX = this.gameWidth / 2;
    const startY = this.gameHeight - 60;

    this.player = this.add.container(startX, startY);

    // Cuerpo del jugador (triángulo/nave)
    const body = this.add.graphics();

    // Glow
    body.fillStyle(0x00d4ff, 0.3);
    body.fillCircle(0, 0, this.playerSize + 10);

    // Cuerpo principal
    body.fillStyle(0x00d4ff, 1);
    body.beginPath();
    body.moveTo(0, -this.playerSize / 2);
    body.lineTo(-this.playerSize / 2, this.playerSize / 2);
    body.lineTo(this.playerSize / 2, this.playerSize / 2);
    body.closePath();
    body.fillPath();

    // Borde brillante
    body.lineStyle(2, 0xffffff, 0.8);
    body.beginPath();
    body.moveTo(0, -this.playerSize / 2);
    body.lineTo(-this.playerSize / 2, this.playerSize / 2);
    body.lineTo(this.playerSize / 2, this.playerSize / 2);
    body.closePath();
    body.strokePath();

    // Centro brillante
    body.fillStyle(0xffffff, 0.8);
    body.fillCircle(0, 5, 8);

    this.player.add(body);

    // Animación de flotación
    this.tweens.add({
      targets: this.player,
      y: startY - 5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
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
      color: '#00d4ff',
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
      .text(this.gameWidth / 2, this.gameHeight - 20, this.config.instruction, {
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
    // Touch/mouse drag para mover jugador
    this.inputSystem.onDrag((x: number) => {
      this.player.x = Phaser.Math.Clamp(x, this.playerSize, this.gameWidth - this.playerSize);
    });

    // Teclado
    if (this.input.keyboard) {
      this.cursorKeys = this.input.keyboard.createCursorKeys();
    }
  }

  // ============================================================================
  // Spawning
  // ============================================================================

  private startSpawning(): void {
    const config = this.config.templateConfig;
    const spawnInterval = config.spawnInterval ?? 800;

    this.spawnTimer = this.time.addEvent({
      delay: spawnInterval,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true,
    });

    // Spawn inicial
    this.time.delayedCall(500, () => this.spawnObstacle());
  }

  private spawnObstacle(): void {
    if (this.isGameOver || this.isPaused) return;

    const config = this.config.templateConfig;

    // Decidir si es correcto (30% correcto - queremos esquivar más que recolectar)
    const isCorrect = Math.random() < 0.3;
    const pool = isCorrect ? config.correct : config.wrong;

    if (!pool || pool.length === 0) return;

    const value: string = Phaser.Utils.Array.GetRandom(pool);
    const x = Phaser.Math.Between(50, this.gameWidth - 50);
    const baseSpeed = config.fallSpeed ?? 200;
    const speed = baseSpeed + Phaser.Math.Between(-50, 50);

    const obstacle = this.createObstacle(x, -40, value, isCorrect, speed);
    this.obstacles.push(obstacle);
  }

  private createObstacle(
    x: number,
    y: number,
    value: string,
    isCorrect: boolean,
    speed: number,
  ): Obstacle {
    const container = this.add.container(x, y);

    // Visual del obstáculo
    const body = this.add.graphics();

    if (isCorrect) {
      // Estrella/powerup (verde)
      body.fillStyle(0x22c55e, 0.3);
      body.fillCircle(0, 0, 30);
      body.fillStyle(0x22c55e, 1);
      this.drawStar(body, 0, 0, 5, 20, 10);
      body.lineStyle(2, 0xffffff, 0.5);
      this.drawStar(body, 0, 0, 5, 20, 10, true);
    } else {
      // Obstáculo peligroso (rojo)
      body.fillStyle(0xef4444, 0.3);
      body.fillCircle(0, 0, 30);
      body.fillStyle(0xef4444, 1);
      body.fillRect(-18, -18, 36, 36);
      body.lineStyle(2, 0xffffff, 0.5);
      body.strokeRect(-18, -18, 36, 36);

      // X en el centro
      body.lineStyle(3, 0xffffff, 0.8);
      body.lineBetween(-10, -10, 10, 10);
      body.lineBetween(-10, 10, 10, -10);
    }

    container.add(body);

    // Texto
    const text = this.add
      .text(0, isCorrect ? 0 : 0, value, {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    container.add(text);

    // Rotación para obstáculos peligrosos
    if (!isCorrect) {
      this.tweens.add({
        targets: container,
        angle: 360,
        duration: 2000,
        repeat: -1,
      });
    } else {
      // Pulso para correctos
      this.tweens.add({
        targets: container,
        scale: 1.2,
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    }

    return {
      container,
      value,
      isCorrect,
      speed,
    };
  }

  private drawStar(
    graphics: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number,
    stroke = false,
  ): void {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;

    graphics.beginPath();
    graphics.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      let x = cx + Math.cos(rot) * outerRadius;
      let y = cy + Math.sin(rot) * outerRadius;
      graphics.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      graphics.lineTo(x, y);
      rot += step;
    }

    graphics.lineTo(cx, cy - outerRadius);
    graphics.closePath();

    if (stroke) {
      graphics.strokePath();
    } else {
      graphics.fillPath();
    }
  }

  // ============================================================================
  // Game Logic
  // ============================================================================

  private updatePlayer(delta: number): void {
    if (!this.cursorKeys) return;

    const speed = this.playerSpeed * (delta / 1000);

    if (this.cursorKeys.left.isDown) {
      this.player.x = Math.max(this.playerSize, this.player.x - speed);
    }
    if (this.cursorKeys.right.isDown) {
      this.player.x = Math.min(this.gameWidth - this.playerSize, this.player.x + speed);
    }
  }

  private updateObstacles(delta: number): void {
    const dt = delta / 1000;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.container.y += obs.speed * dt;

      // Remover si sale de pantalla
      if (obs.container.y > this.gameHeight + 50) {
        obs.container.destroy();
        this.obstacles.splice(i, 1);

        // Si era correcto y lo esquivamos, perdemos oportunidad (sin penalización)
        if (obs.isCorrect) {
          // Podríamos restar combo aquí si quisiéramos
        }
      }
    }
  }

  private checkCollisions(): void {
    const playerBounds = {
      x: this.player.x - this.playerSize / 2,
      y: this.player.y - this.playerSize / 2,
      width: this.playerSize,
      height: this.playerSize,
    };

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      const obsBounds = {
        x: obs.container.x - 20,
        y: obs.container.y - 20,
        width: 40,
        height: 40,
      };

      if (this.boundsOverlap(playerBounds, obsBounds)) {
        this.onCollision(obs, i);
        break;
      }
    }
  }

  private boundsOverlap(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number },
  ): boolean {
    return (
      a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
    );
  }

  private onCollision(obstacle: Obstacle, index: number): void {
    const x = obstacle.container.x;
    const y = obstacle.container.y;

    if (obstacle.isCorrect) {
      // Recolectamos algo bueno
      this.particles.sparkle(x, y);
      this.onCorrectAnswer(25);
    } else {
      // Chocamos con obstáculo malo
      this.particles.burst(x, y);
      this.onWrongAnswer(0);
      this.loseLife();

      // Flash de daño
      const flash = this.add.graphics();
      flash.fillStyle(0xef4444, 0.3);
      flash.fillRect(0, 0, this.gameWidth, this.gameHeight);
      this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 200,
        onComplete: () => flash.destroy(),
      });

      // Shake del jugador
      this.tweens.add({
        targets: this.player,
        x: this.player.x + 10,
        duration: 50,
        yoyo: true,
        repeat: 3,
      });
    }

    // Remover obstáculo
    obstacle.container.destroy();
    this.obstacles.splice(index, 1);
  }

  // ============================================================================
  // State
  // ============================================================================

  protected override getTemplateState(): Record<string, unknown> {
    return {
      obstacles: this.obstacles.length,
      playerX: this.player.x,
    };
  }
}

// ============================================================================
// Register Template
// ============================================================================

import { GameRegistry } from '../../core/GameRegistry';

GameRegistry.register(DodgerScene, {
  id: 'dodger',
  name: 'Dodger',
  description: 'Esquiva obstáculos peligrosos y recolecta items correctos',
  category: 'arcade',
  complexity: 'medium',
});
