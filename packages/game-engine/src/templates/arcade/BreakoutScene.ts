/**
 * BreakoutScene - Romper bloques con pelota
 *
 * Mecánica: Clásico breakout donde el jugador controla una paleta
 * para rebotar una pelota y destruir bloques. Los bloques tienen
 * valores y destruir los correctos suma puntos.
 *
 * Uso educativo: Destruir respuestas correctas, tablas de multiplicar, etc.
 */

import Phaser from 'phaser';
import { BaseScene } from '../../core/BaseScene';
import { InputSystem } from '../../systems/InputSystem';
import { ParticleSystem } from '../../systems/ParticleSystem';
import type { BreakoutConfig } from '@mateatletas/contracts';

// ============================================================================
// Types
// ============================================================================

/** Bloque destruible */
interface Block {
  graphics: Phaser.GameObjects.Container;
  value: string;
  isCorrect: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  destroyed: boolean;
}

/** Estado de la pelota */
interface Ball {
  graphics: Phaser.GameObjects.Container;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
}

// ============================================================================
// BreakoutScene
// ============================================================================

export class BreakoutScene extends BaseScene<BreakoutConfig> {
  // Systems
  private inputSystem!: InputSystem;
  private particles!: ParticleSystem;

  // Game objects
  private paddle!: Phaser.GameObjects.Container;
  private ball!: Ball;
  private blocks: Block[] = [];

  // Paddle state
  private paddleX = 0;
  private paddleWidth = 100;
  private paddleHeight = 15;
  private paddleY = 0;

  // Keyboard
  private cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;

  // Dimensions
  private gameWidth = 0;
  private gameHeight = 0;

  // Game state
  private ballLaunched = false;

  // ============================================================================
  // Constructor
  // ============================================================================

  constructor() {
    super('breakout');
  }

  // ============================================================================
  // Phaser Lifecycle
  // ============================================================================

  create(): void {
    super.create();

    this.gameWidth = this.scale.width;
    this.gameHeight = this.scale.height;
    this.paddleY = this.gameHeight - 50;
    this.paddleX = this.gameWidth / 2;

    // Initialize systems
    this.inputSystem = new InputSystem(this);
    this.particles = new ParticleSystem(this);

    // Setup game
    this.createBackground();
    this.createBlocks();
    this.createPaddle();
    this.createBall();
    this.createUI();
    this.setupInput();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    if (this.isGameOver || this.isPaused) return;

    const dt = delta / 1000;

    this.updatePaddle(dt);
    this.updateBall(dt);
    this.checkCollisions();
    this.checkWinCondition();
  }

  shutdown(): void {
    super.shutdown();
    this.inputSystem.destroy();
    this.particles.destroy();
  }

  // ============================================================================
  // Setup Methods
  // ============================================================================

  private createBackground(): void {
    // Fondo oscuro con gradiente
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0f0f23, 0x0f0f23, 0x1a1a3e, 0x1a1a3e, 1);
    bg.fillRect(0, 0, this.gameWidth, this.gameHeight);

    // Grid sutil
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x333366, 0.2);

    for (let x = 0; x < this.gameWidth; x += 30) {
      grid.lineBetween(x, 0, x, this.gameHeight);
    }
    for (let y = 0; y < this.gameHeight; y += 30) {
      grid.lineBetween(0, y, this.gameWidth, y);
    }

    // Bordes del área de juego
    const borders = this.add.graphics();
    borders.lineStyle(3, 0x6366f1, 0.8);
    borders.strokeRect(5, 5, this.gameWidth - 10, this.gameHeight - 10);
  }

  private createBlocks(): void {
    const config = this.config.templateConfig;
    const cols = config.cols ?? 8;
    const rows = config.rows ?? 4;

    const blockWidth = (this.gameWidth - 60) / cols;
    const blockHeight = 30;
    const startX = 30;
    const startY = 80;
    const padding = 4;

    // Crear pool de valores
    const allValues: Array<{ value: string; isCorrect: boolean }> = [];

    // Agregar valores correctos
    for (const val of config.correct ?? []) {
      allValues.push({ value: val, isCorrect: true });
    }

    // Agregar valores incorrectos
    for (const val of config.wrong ?? []) {
      allValues.push({ value: val, isCorrect: false });
    }

    // Mezclar
    Phaser.Utils.Array.Shuffle(allValues);

    let valueIndex = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * blockWidth + blockWidth / 2;
        const y = startY + row * (blockHeight + padding) + blockHeight / 2;

        // Obtener valor (ciclar si no hay suficientes)
        const { value, isCorrect } = allValues[valueIndex % allValues.length];
        valueIndex++;

        const block = this.createBlock(x, y, blockWidth - padding, blockHeight, value, isCorrect);
        this.blocks.push(block);
      }
    }
  }

  private createBlock(
    x: number,
    y: number,
    width: number,
    height: number,
    value: string,
    isCorrect: boolean,
  ): Block {
    const container = this.add.container(x, y);

    const body = this.add.graphics();

    // Color basado en si es correcto
    const color = isCorrect ? 0x22c55e : 0xef4444;
    const glowColor = isCorrect ? 0x00ff00 : 0xff0000;

    // Glow sutil
    body.fillStyle(glowColor, 0.2);
    body.fillRoundedRect(-width / 2 - 2, -height / 2 - 2, width + 4, height + 4, 4);

    // Bloque principal
    body.fillStyle(color, 1);
    body.fillRoundedRect(-width / 2, -height / 2, width, height, 3);

    // Borde brillante
    body.lineStyle(1, 0xffffff, 0.3);
    body.strokeRoundedRect(-width / 2, -height / 2, width, height, 3);

    // Reflejo
    body.fillStyle(0xffffff, 0.2);
    body.fillRoundedRect(-width / 2 + 2, -height / 2 + 2, width - 4, height / 3, 2);

    container.add(body);

    // Texto
    const text = this.add
      .text(0, 0, value, {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    container.add(text);

    return {
      graphics: container,
      value,
      isCorrect,
      x,
      y,
      width,
      height,
      destroyed: false,
    };
  }

  private createPaddle(): void {
    this.paddle = this.add.container(this.paddleX, this.paddleY);

    const body = this.add.graphics();

    // Glow
    body.fillStyle(0x00d4ff, 0.3);
    body.fillRoundedRect(
      -this.paddleWidth / 2 - 5,
      -this.paddleHeight / 2 - 3,
      this.paddleWidth + 10,
      this.paddleHeight + 6,
      8,
    );

    // Paleta principal
    body.fillStyle(0x00d4ff, 1);
    body.fillRoundedRect(
      -this.paddleWidth / 2,
      -this.paddleHeight / 2,
      this.paddleWidth,
      this.paddleHeight,
      5,
    );

    // Reflejo
    body.fillStyle(0xffffff, 0.4);
    body.fillRoundedRect(
      -this.paddleWidth / 2 + 5,
      -this.paddleHeight / 2 + 2,
      this.paddleWidth - 10,
      this.paddleHeight / 3,
      3,
    );

    this.paddle.add(body);
  }

  private createBall(): void {
    const ballRadius = 8;
    const container = this.add.container(
      this.paddleX,
      this.paddleY - this.paddleHeight / 2 - ballRadius - 5,
    );

    const body = this.add.graphics();

    // Glow
    body.fillStyle(0xffffff, 0.3);
    body.fillCircle(0, 0, ballRadius + 4);

    // Pelota
    body.fillStyle(0xffffff, 1);
    body.fillCircle(0, 0, ballRadius);

    // Reflejo
    body.fillStyle(0xffffff, 0.5);
    body.fillCircle(-2, -2, ballRadius / 3);

    container.add(body);

    this.ball = {
      graphics: container,
      x: container.x,
      y: container.y,
      vx: 0,
      vy: 0,
      radius: ballRadius,
      speed: 400,
    };
  }

  private createUI(): void {
    const panelHeight = 50;

    // Panel superior transparente
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.5);
    panel.fillRect(10, 10, this.gameWidth - 20, panelHeight);

    // Score
    this.add.text(25, 20, 'SCORE', {
      fontSize: '10px',
      color: '#9ca3af',
      fontFamily: 'sans-serif',
    });

    const scoreText = this.add.text(25, 32, '0', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
    });

    // Lives
    this.add
      .text(this.gameWidth - 25, 20, 'VIDAS', {
        fontSize: '10px',
        color: '#9ca3af',
        fontFamily: 'sans-serif',
      })
      .setOrigin(1, 0);

    const livesText = this.add
      .text(this.gameWidth - 25, 32, '❤️'.repeat(this.lives), {
        fontSize: '16px',
      })
      .setOrigin(1, 0);

    // Blocks remaining
    this.add
      .text(this.gameWidth / 2, 20, 'BLOQUES', {
        fontSize: '10px',
        color: '#9ca3af',
        fontFamily: 'sans-serif',
      })
      .setOrigin(0.5, 0);

    const blocksText = this.add
      .text(this.gameWidth / 2, 32, this.blocks.length.toString(), {
        fontSize: '18px',
        color: '#fbbf24',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0);

    // Launch instruction
    const launchText = this.add
      .text(this.gameWidth / 2, this.gameHeight - 100, 'Click o Espacio para lanzar', {
        fontSize: '14px',
        color: '#9ca3af',
        fontFamily: 'sans-serif',
      })
      .setOrigin(0.5);

    // Update UI
    this.events.on('update', () => {
      scoreText.setText(this.score.toString());
      livesText.setText('❤️'.repeat(Math.max(0, this.lives)));

      const remaining = this.blocks.filter((b) => !b.destroyed).length;
      blocksText.setText(remaining.toString());

      launchText.setVisible(!this.ballLaunched);
    });
  }

  private setupInput(): void {
    // Mouse/touch para mover paleta
    this.inputSystem.onDrag((x: number) => {
      this.paddleX = Phaser.Math.Clamp(
        x,
        this.paddleWidth / 2 + 10,
        this.gameWidth - this.paddleWidth / 2 - 10,
      );
    });

    // Tap/click para lanzar
    this.inputSystem.onTap(() => {
      if (!this.ballLaunched) {
        this.launchBall();
      }
    });

    // Teclado
    if (this.input.keyboard) {
      this.cursorKeys = this.input.keyboard.createCursorKeys();

      const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      spaceKey.on('down', () => {
        if (!this.ballLaunched) {
          this.launchBall();
        }
      });
    }
  }

  // ============================================================================
  // Game Logic
  // ============================================================================

  private launchBall(): void {
    this.ballLaunched = true;

    // Ángulo aleatorio hacia arriba
    const angle = Phaser.Math.DegToRad(Phaser.Math.Between(-60, -120));
    this.ball.vx = Math.cos(angle) * this.ball.speed;
    this.ball.vy = Math.sin(angle) * this.ball.speed;
  }

  private updatePaddle(dt: number): void {
    if (this.cursorKeys) {
      const speed = 500 * dt;

      if (this.cursorKeys.left.isDown) {
        this.paddleX = Math.max(this.paddleWidth / 2 + 10, this.paddleX - speed);
      }
      if (this.cursorKeys.right.isDown) {
        this.paddleX = Math.min(this.gameWidth - this.paddleWidth / 2 - 10, this.paddleX + speed);
      }
    }

    this.paddle.x = this.paddleX;

    // Si la pelota no se ha lanzado, seguir a la paleta
    if (!this.ballLaunched) {
      this.ball.x = this.paddleX;
      this.ball.graphics.x = this.ball.x;
    }
  }

  private updateBall(dt: number): void {
    if (!this.ballLaunched) return;

    // Mover pelota
    this.ball.x += this.ball.vx * dt;
    this.ball.y += this.ball.vy * dt;

    // Colisión con paredes laterales
    if (this.ball.x - this.ball.radius <= 10) {
      this.ball.x = 10 + this.ball.radius;
      this.ball.vx = Math.abs(this.ball.vx);
    }
    if (this.ball.x + this.ball.radius >= this.gameWidth - 10) {
      this.ball.x = this.gameWidth - 10 - this.ball.radius;
      this.ball.vx = -Math.abs(this.ball.vx);
    }

    // Colisión con techo
    if (this.ball.y - this.ball.radius <= 10) {
      this.ball.y = 10 + this.ball.radius;
      this.ball.vy = Math.abs(this.ball.vy);
    }

    // Pelota cayó (perdió vida)
    if (this.ball.y > this.gameHeight + 50) {
      this.onBallLost();
    }

    // Actualizar gráfico
    this.ball.graphics.x = this.ball.x;
    this.ball.graphics.y = this.ball.y;
  }

  private checkCollisions(): void {
    if (!this.ballLaunched) return;

    // Colisión con paleta
    this.checkPaddleCollision();

    // Colisión con bloques
    this.checkBlockCollisions();
  }

  private checkPaddleCollision(): void {
    const paddleBounds = {
      x: this.paddleX - this.paddleWidth / 2,
      y: this.paddleY - this.paddleHeight / 2,
      width: this.paddleWidth,
      height: this.paddleHeight,
    };

    const ballBounds = {
      x: this.ball.x - this.ball.radius,
      y: this.ball.y - this.ball.radius,
      width: this.ball.radius * 2,
      height: this.ball.radius * 2,
    };

    if (this.boundsOverlap(ballBounds, paddleBounds) && this.ball.vy > 0) {
      // Calcular rebote basado en donde golpeó la paleta
      const hitPoint = (this.ball.x - this.paddleX) / (this.paddleWidth / 2);
      const angle = Phaser.Math.DegToRad(-90 + hitPoint * 60);

      this.ball.vx = Math.cos(angle) * this.ball.speed;
      this.ball.vy = Math.sin(angle) * this.ball.speed;

      // Asegurar que vaya hacia arriba
      if (this.ball.vy > 0) {
        this.ball.vy = -this.ball.vy;
      }

      this.ball.y = this.paddleY - this.paddleHeight / 2 - this.ball.radius - 1;

      // Efecto visual
      this.particles.sparkle(this.ball.x, this.ball.y);
    }
  }

  private checkBlockCollisions(): void {
    for (const block of this.blocks) {
      if (block.destroyed) continue;

      const blockBounds = {
        x: block.x - block.width / 2,
        y: block.y - block.height / 2,
        width: block.width,
        height: block.height,
      };

      const ballBounds = {
        x: this.ball.x - this.ball.radius,
        y: this.ball.y - this.ball.radius,
        width: this.ball.radius * 2,
        height: this.ball.radius * 2,
      };

      if (this.boundsOverlap(ballBounds, blockBounds)) {
        this.destroyBlock(block);

        // Determinar dirección del rebote
        const fromLeft = this.ball.x < block.x - block.width / 2;
        const fromRight = this.ball.x > block.x + block.width / 2;
        const fromTop = this.ball.y < block.y - block.height / 2;
        const fromBottom = this.ball.y > block.y + block.height / 2;

        if (fromLeft || fromRight) {
          this.ball.vx = -this.ball.vx;
        }
        if (fromTop || fromBottom) {
          this.ball.vy = -this.ball.vy;
        }

        // Solo destruir un bloque por frame
        break;
      }
    }
  }

  private destroyBlock(block: Block): void {
    block.destroyed = true;

    if (block.isCorrect) {
      this.particles.sparkle(block.x, block.y);
      this.onCorrectAnswer(15);
    } else {
      this.particles.burst(block.x, block.y);
      this.onWrongAnswer(5);
    }

    // Animación de destrucción
    this.tweens.add({
      targets: block.graphics,
      scale: 1.3,
      alpha: 0,
      duration: 150,
      onComplete: () => block.graphics.destroy(),
    });
  }

  private onBallLost(): void {
    this.loseLife();
    this.ballLaunched = false;

    // Resetear pelota
    this.ball.x = this.paddleX;
    this.ball.y = this.paddleY - this.paddleHeight / 2 - this.ball.radius - 5;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.graphics.x = this.ball.x;
    this.ball.graphics.y = this.ball.y;

    // Flash de daño
    const flash = this.add.graphics();
    flash.fillStyle(0xef4444, 0.3);
    flash.fillRect(0, 0, this.gameWidth, this.gameHeight);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy(),
    });
  }

  private checkWinCondition(): void {
    const remaining = this.blocks.filter((b) => !b.destroyed).length;
    if (remaining === 0) {
      this.endGame(true);
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

  // ============================================================================
  // State
  // ============================================================================

  protected override getTemplateState(): Record<string, unknown> {
    return {
      blocksRemaining: this.blocks.filter((b) => !b.destroyed).length,
      ballLaunched: this.ballLaunched,
    };
  }
}

// ============================================================================
// Register Template
// ============================================================================

import { GameRegistry } from '../../core/GameRegistry';

GameRegistry.register(BreakoutScene, {
  id: 'breakout',
  name: 'Breakout',
  description: 'Rompe los bloques correctos con la pelota',
  category: 'arcade',
  complexity: 'medium',
});
