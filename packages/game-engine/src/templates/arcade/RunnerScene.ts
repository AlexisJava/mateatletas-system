/**
 * RunnerScene - Endless Runner
 *
 * Mecánica: El jugador corre automáticamente y debe saltar sobre
 * obstáculos o agacharse para evitarlos. Los obstáculos tienen valores
 * y el jugador debe decidir cuándo saltar basándose en la respuesta.
 *
 * Uso educativo: Saltar solo en múltiplos, evitar errores, etc.
 */

import Phaser from 'phaser';
import { BaseScene } from '../../core/BaseScene';
import { InputSystem } from '../../systems/InputSystem';
import { ParticleSystem } from '../../systems/ParticleSystem';
import type { RunnerConfig } from '@mateatletas/contracts';

// ============================================================================
// Types
// ============================================================================

/** Obstáculo en la pista */
interface RunnerObstacle {
  container: Phaser.GameObjects.Container;
  value: string;
  isCorrect: boolean;
  passed: boolean;
}

// ============================================================================
// RunnerScene
// ============================================================================

export class RunnerScene extends BaseScene<RunnerConfig> {
  // Systems
  private inputSystem!: InputSystem;
  private particles!: ParticleSystem;

  // Game objects
  private player!: Phaser.GameObjects.Container;
  private ground!: Phaser.GameObjects.TileSprite;
  private obstacles: RunnerObstacle[] = [];
  private spawnTimer?: Phaser.Time.TimerEvent;

  // Player state
  private isJumping = false;
  private playerY = 0;
  private velocityY = 0;
  private gravity = 2500;
  private jumpForce = -800;

  // Keyboard
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private upKey?: Phaser.Input.Keyboard.Key;

  // Game speed (increases over time)
  private gameSpeed = 300;
  private speedIncrement = 5;

  // Dimensions
  private gameWidth = 0;
  private gameHeight = 0;
  private groundY = 0;

  // ============================================================================
  // Constructor
  // ============================================================================

  constructor() {
    super('runner');
  }

  // ============================================================================
  // Phaser Lifecycle
  // ============================================================================

  create(): void {
    super.create();

    this.gameWidth = this.scale.width;
    this.gameHeight = this.scale.height;
    this.groundY = this.gameHeight - 100;
    this.playerY = this.groundY;

    // Initialize systems
    this.inputSystem = new InputSystem(this);
    this.particles = new ParticleSystem(this);

    // Setup game
    this.createBackground();
    this.createGround();
    this.createPlayer();
    this.createUI();
    this.setupInput();
    this.startSpawning();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    if (this.isGameOver || this.isPaused) return;

    const dt = delta / 1000;

    this.updatePlayer(dt);
    this.updateGround(dt);
    this.updateObstacles(dt);
    this.checkCollisions();

    // Incrementar velocidad gradualmente
    this.gameSpeed += this.speedIncrement * dt;
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
    // Cielo con gradiente
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xe0f7fa, 0xe0f7fa, 1);
    bg.fillRect(0, 0, this.gameWidth, this.gameHeight);

    // Nubes decorativas
    for (let i = 0; i < 5; i++) {
      const cloudX = Phaser.Math.Between(0, this.gameWidth);
      const cloudY = Phaser.Math.Between(50, 200);
      this.createCloud(cloudX, cloudY);
    }

    // Montañas de fondo
    const mountains = this.add.graphics();
    mountains.fillStyle(0x9ca3af, 0.3);

    // Montaña 1
    mountains.beginPath();
    mountains.moveTo(0, this.groundY);
    mountains.lineTo(200, this.groundY - 150);
    mountains.lineTo(400, this.groundY);
    mountains.closePath();
    mountains.fillPath();

    // Montaña 2
    mountains.beginPath();
    mountains.moveTo(300, this.groundY);
    mountains.lineTo(500, this.groundY - 200);
    mountains.lineTo(700, this.groundY);
    mountains.closePath();
    mountains.fillPath();

    // Montaña 3
    mountains.beginPath();
    mountains.moveTo(500, this.groundY);
    mountains.lineTo(650, this.groundY - 120);
    mountains.lineTo(800, this.groundY);
    mountains.closePath();
    mountains.fillPath();
  }

  private createCloud(x: number, y: number): void {
    const cloud = this.add.graphics();
    cloud.fillStyle(0xffffff, 0.8);

    // Grupo de círculos para formar nube
    cloud.fillCircle(x, y, 25);
    cloud.fillCircle(x + 30, y - 10, 30);
    cloud.fillCircle(x + 60, y, 25);
    cloud.fillCircle(x + 30, y + 10, 20);
  }

  private createGround(): void {
    // Crear textura procedural para el suelo
    const groundTexture = this.make.graphics({ x: 0, y: 0 });
    groundTexture.fillStyle(0x8b4513, 1);
    groundTexture.fillRect(0, 0, 64, 64);
    groundTexture.fillStyle(0x654321, 1);
    groundTexture.fillRect(0, 0, 64, 10);
    groundTexture.lineStyle(2, 0x556b2f, 1);
    groundTexture.lineBetween(0, 10, 64, 10);

    // Generar textura
    groundTexture.generateTexture('ground_tile', 64, 64);
    groundTexture.destroy();

    // Crear TileSprite para scrolling infinito
    this.ground = this.add.tileSprite(
      this.gameWidth / 2,
      this.groundY + 32,
      this.gameWidth,
      64,
      'ground_tile',
    );

    // Línea de piso
    const groundLine = this.add.graphics();
    groundLine.fillStyle(0x556b2f, 1);
    groundLine.fillRect(0, this.groundY, this.gameWidth, 5);
  }

  private createPlayer(): void {
    // El jugador se posiciona en el suelo
    this.playerY = this.groundY;
    this.player = this.add.container(100, this.playerY);

    const body = this.add.graphics();

    // Cuerpo principal (dibujado hacia arriba desde el punto de anclaje)
    const playerHeight = 50;
    const playerWidth = 40;

    // Cuerpo (rectángulo)
    body.fillStyle(0x3b82f6, 1);
    body.fillRoundedRect(-playerWidth / 2, -playerHeight, playerWidth, playerHeight, 8);

    // Ojos
    body.fillStyle(0xffffff, 1);
    body.fillCircle(-8, -playerHeight + 15, 6);
    body.fillCircle(8, -playerHeight + 15, 6);

    // Pupilas
    body.fillStyle(0x000000, 1);
    body.fillCircle(-6, -playerHeight + 15, 3);
    body.fillCircle(10, -playerHeight + 15, 3);

    // Piernas (simples)
    body.fillStyle(0x1e40af, 1);
    body.fillRect(-15, -5, 10, 5);
    body.fillRect(5, -5, 10, 5);

    this.player.add(body);

    // Animación de correr (solo cuando no salta)
    this.tweens.add({
      targets: this.player,
      scaleY: 0.95,
      duration: 150,
      yoyo: true,
      repeat: -1,
    });
  }

  private createUI(): void {
    const panelHeight = 60;

    // Panel superior
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.5);
    panel.fillRect(0, 0, this.gameWidth, panelHeight);

    // Score
    this.add.text(20, 15, 'SCORE', {
      fontSize: '12px',
      color: '#9ca3af',
      fontFamily: 'sans-serif',
    });

    const scoreText = this.add.text(20, 32, '0', {
      fontSize: '24px',
      color: '#ffffff',
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

    // Speed indicator
    this.add
      .text(this.gameWidth / 2, 15, 'VELOCIDAD', {
        fontSize: '12px',
        color: '#9ca3af',
        fontFamily: 'sans-serif',
      })
      .setOrigin(0.5, 0);

    const speedText = this.add
      .text(this.gameWidth / 2, 32, '1.0x', {
        fontSize: '20px',
        color: '#fbbf24',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0);

    // Instruction
    this.add
      .text(this.gameWidth / 2, this.gameHeight - 20, this.config.instruction, {
        fontSize: '14px',
        color: '#666666',
        fontFamily: 'sans-serif',
      })
      .setOrigin(0.5, 0.5);

    // Update UI
    this.events.on('update', () => {
      scoreText.setText(this.score.toString());
      livesText.setText('❤️'.repeat(Math.max(0, this.lives)));
      speedText.setText((this.gameSpeed / 300).toFixed(1) + 'x');
    });
  }

  private setupInput(): void {
    // Tap/click para saltar
    this.inputSystem.onTap(() => {
      this.jump();
    });

    // Swipe arriba para saltar
    this.inputSystem.onSwipe((dir) => {
      if (dir === 'up') {
        this.jump();
      }
    });

    // Teclado
    if (this.input.keyboard) {
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    }
  }

  // ============================================================================
  // Spawning
  // ============================================================================

  private startSpawning(): void {
    const config = this.config.templateConfig;
    const baseInterval = config.spawnInterval ?? 2000;

    this.spawnTimer = this.time.addEvent({
      delay: baseInterval,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true,
    });

    // Spawn inicial
    this.time.delayedCall(1000, () => this.spawnObstacle());
  }

  private spawnObstacle(): void {
    if (this.isGameOver || this.isPaused) return;

    const config = this.config.templateConfig;

    // Decidir si es correcto (debemos saltar sobre correctos)
    const isCorrect = Math.random() < 0.5;
    const pool = isCorrect ? config.correct : config.wrong;

    if (!pool || pool.length === 0) return;

    const value: string = Phaser.Utils.Array.GetRandom(pool);

    const obstacle = this.createObstacle(value, isCorrect);
    this.obstacles.push(obstacle);
  }

  private createObstacle(value: string, isCorrect: boolean): RunnerObstacle {
    const container = this.add.container(this.gameWidth + 50, this.groundY);

    const body = this.add.graphics();

    // Obstáculo tipo caja/barrera
    const height = 60;
    const width = 50;

    if (isCorrect) {
      // Verde - debemos saltar sobre esto
      body.fillStyle(0x22c55e, 1);
      body.fillRoundedRect(-width / 2, -height, width, height, 5);
      body.lineStyle(2, 0xffffff, 0.5);
      body.strokeRoundedRect(-width / 2, -height, width, height, 5);

      // Checkmark
      body.lineStyle(3, 0xffffff, 0.8);
      body.beginPath();
      body.moveTo(-10, -height / 2);
      body.lineTo(-2, -height / 2 + 10);
      body.lineTo(12, -height / 2 - 10);
      body.strokePath();
    } else {
      // Rojo - NO saltar (pasar por debajo o esquivar)
      body.fillStyle(0xef4444, 1);
      body.fillRoundedRect(-width / 2, -height, width, height, 5);
      body.lineStyle(2, 0xffffff, 0.5);
      body.strokeRoundedRect(-width / 2, -height, width, height, 5);

      // X mark
      body.lineStyle(3, 0xffffff, 0.8);
      body.lineBetween(-10, -height + 15, 10, -15);
      body.lineBetween(-10, -15, 10, -height + 15);
    }

    container.add(body);

    // Texto del valor
    const text = this.add
      .text(0, -height - 15, value, {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        backgroundColor: '#00000080',
        padding: { x: 5, y: 2 },
      })
      .setOrigin(0.5, 1);
    container.add(text);

    return {
      container,
      value,
      isCorrect,
      passed: false,
    };
  }

  // ============================================================================
  // Game Logic
  // ============================================================================

  private jump(): void {
    if (this.isJumping || this.isGameOver || this.isPaused) return;

    this.isJumping = true;
    this.velocityY = this.jumpForce;

    // Efecto visual
    this.tweens.add({
      targets: this.player,
      scaleX: 0.9,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
    });
  }

  private updatePlayer(dt: number): void {
    // Verificar input de teclado
    if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.jump();
    }
    if (this.upKey && Phaser.Input.Keyboard.JustDown(this.upKey)) {
      this.jump();
    }

    // Siempre aplicar física
    // Aplicar gravedad
    this.velocityY += this.gravity * dt;
    this.playerY += this.velocityY * dt;

    // Verificar si tocó el suelo
    if (this.playerY >= this.groundY) {
      this.playerY = this.groundY;
      this.velocityY = 0;

      if (this.isJumping) {
        this.isJumping = false;
        // Pequeño efecto de aterrizaje
        this.tweens.add({
          targets: this.player,
          scaleY: 0.9,
          duration: 50,
          yoyo: true,
        });
      }
    }

    // Actualizar posición visual
    this.player.y = this.playerY;
  }

  private updateGround(dt: number): void {
    // Scroll del suelo
    this.ground.tilePositionX += this.gameSpeed * dt;
  }

  private updateObstacles(dt: number): void {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.container.x -= this.gameSpeed * dt;

      // Verificar si el jugador pasó el obstáculo
      if (!obs.passed && obs.container.x < this.player.x - 30) {
        obs.passed = true;
        this.onObstaclePassed(obs);
      }

      // Remover si sale de pantalla
      if (obs.container.x < -100) {
        obs.container.destroy();
        this.obstacles.splice(i, 1);
      }
    }
  }

  private checkCollisions(): void {
    const playerBounds = {
      x: this.player.x - 15,
      y: this.player.y - 50,
      width: 30,
      height: 50,
    };

    for (const obs of this.obstacles) {
      if (obs.passed) continue;

      const obsBounds = {
        x: obs.container.x - 25,
        y: this.groundY - 60,
        width: 50,
        height: 60,
      };

      if (this.boundsOverlap(playerBounds, obsBounds)) {
        this.onCollision(obs);
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

  private onObstaclePassed(obstacle: RunnerObstacle): void {
    if (obstacle.isCorrect) {
      // No saltamos sobre algo que debíamos saltar
      // (la colisión lo maneja)
    } else {
      // Evitamos correctamente un obstáculo malo
      this.onCorrectAnswer(10);
      this.particles.sparkle(obstacle.container.x, obstacle.container.y - 30);
    }
  }

  private onCollision(obstacle: RunnerObstacle): void {
    if (obstacle.isCorrect) {
      // Chocamos con algo bueno - debimos saltarlo y recolectarlo
      // En este juego, saltar SOBRE el correcto = bien
      // Pero si chocamos de frente = mal
      this.particles.burst(this.player.x, this.player.y - 25);
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
    } else {
      // Chocamos con obstáculo malo
      this.particles.burst(this.player.x, this.player.y - 25);
      this.onWrongAnswer(0);
      this.loseLife();

      const flash = this.add.graphics();
      flash.fillStyle(0xef4444, 0.3);
      flash.fillRect(0, 0, this.gameWidth, this.gameHeight);
      this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 200,
        onComplete: () => flash.destroy(),
      });
    }

    // Marcar como pasado para no volver a colisionar
    obstacle.passed = true;
  }

  // ============================================================================
  // State
  // ============================================================================

  protected override getTemplateState(): Record<string, unknown> {
    return {
      obstacles: this.obstacles.length,
      gameSpeed: this.gameSpeed,
      isJumping: this.isJumping,
    };
  }
}

// ============================================================================
// Register Template
// ============================================================================

import { GameRegistry } from '../../core/GameRegistry';

GameRegistry.register(RunnerScene, {
  id: 'runner',
  name: 'Runner',
  description: 'Corre y salta sobre los obstáculos correctos',
  category: 'arcade',
  complexity: 'medium',
});
