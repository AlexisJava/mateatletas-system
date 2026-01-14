/**
 * CatcherScene - Atrapar objetos que caen
 *
 * Mecánica: El jugador mueve un "catcher" horizontalmente para atrapar
 * objetos correctos (suman puntos) y evitar objetos incorrectos (restan vida).
 *
 * Uso educativo: Atrapar fracciones equivalentes, palabras correctas,
 * números primos, etc.
 */

import Phaser from 'phaser';
import { BaseScene } from '../../core/BaseScene';
import { InputSystem } from '../../systems/InputSystem';
import { ParticleSystem } from '../../systems/ParticleSystem';
import type { CatcherConfig } from '@mateatletas/contracts';

// ============================================================================
// Types
// ============================================================================

/** Objeto que cae desde arriba */
interface FallingObject {
  sprite: Phaser.GameObjects.Container;
  value: string;
  isCorrect: boolean;
  speed: number;
}

// ============================================================================
// CatcherScene
// ============================================================================

export class CatcherScene extends BaseScene<CatcherConfig> {
  // Systems
  private inputSystem!: InputSystem;
  private particles!: ParticleSystem;

  // Game objects
  private catcher!: Phaser.GameObjects.Container;
  private fallingObjects: FallingObject[] = [];

  // Spawn timer
  private spawnTimer?: Phaser.Time.TimerEvent;

  // Game bounds
  private gameWidth = 0;
  private gameHeight = 0;

  // ============================================================================
  // Constructor
  // ============================================================================

  constructor() {
    super('catcher');
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

    // Setup game elements
    this.createBackground();
    this.createCatcher();
    this.createUI();
    this.setupInput();
    this.startSpawning();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
    if (this.isGameOver || this.isPaused) return;

    // Update input system for keyboard actions
    this.inputSystem.update();

    // Update falling objects
    this.updateFallingObjects(delta);

    // Check collisions
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
    // Fondo con gradiente oscuro
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, this.gameWidth, this.gameHeight);

    // Línea de "suelo" donde está el catcher
    const groundY = this.gameHeight - 80;
    const ground = this.add.graphics();
    ground.lineStyle(2, 0x4a5568, 0.5);
    ground.lineBetween(0, groundY, this.gameWidth, groundY);
  }

  private createCatcher(): void {
    const catcherWidth = this.config.templateConfig.player?.width ?? 100;
    const catcherHeight = 30;
    const catcherY = this.gameHeight - 50;

    // Container para el catcher
    this.catcher = this.add.container(this.gameWidth / 2, catcherY);

    // Forma del catcher (balde/canasta)
    const catcherGraphics = this.add.graphics();

    // Base del balde
    catcherGraphics.fillStyle(0x4ecdc4, 1);
    catcherGraphics.fillRoundedRect(
      -catcherWidth / 2,
      -catcherHeight / 2,
      catcherWidth,
      catcherHeight,
      8,
    );

    // Borde superior más ancho (forma de balde)
    catcherGraphics.fillStyle(0x45b7aa, 1);
    catcherGraphics.fillRoundedRect(
      -catcherWidth / 2 - 5,
      -catcherHeight / 2 - 5,
      catcherWidth + 10,
      10,
      4,
    );

    this.catcher.add(catcherGraphics);

    // Indicador visual del área de captura
    const hitArea = this.add.graphics();
    hitArea.lineStyle(1, 0x4ecdc4, 0.3);
    hitArea.strokeRect(-catcherWidth / 2, -catcherHeight, catcherWidth, catcherHeight);
    this.catcher.add(hitArea);
  }

  private createUI(): void {
    // Panel superior con stats
    const panelHeight = 60;
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.5);
    panel.fillRect(0, 0, this.gameWidth, panelHeight);

    // Score
    this.add
      .text(20, 15, 'SCORE', {
        fontSize: '12px',
        color: '#9ca3af',
        fontFamily: 'sans-serif',
      })
      .setOrigin(0, 0);

    const scoreText = this.add
      .text(20, 32, '0', {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0);

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

    // Timer (si hay duración)
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
      .text(this.gameWidth / 2, panelHeight + 20, this.config.instruction, {
        fontSize: '16px',
        color: '#9ca3af',
        fontFamily: 'sans-serif',
      })
      .setOrigin(0.5, 0);

    // Update UI cada frame
    this.events.on('update', () => {
      scoreText.setText(this.score.toString());
      livesText.setText('❤️'.repeat(Math.max(0, this.lives)));

      if (timerText && this.config.duration) {
        const remaining = this.getRemainingTime();
        if (remaining !== null) {
          timerText.setText(Math.ceil(remaining).toString());
          // Cambiar color si queda poco tiempo
          if (remaining <= 10) {
            timerText.setColor('#ef4444');
          }
        }
      }
    });
  }

  private setupInput(): void {
    const playerSpeed = this.config.templateConfig.player?.speed ?? 400;

    // Keyboard: Flechas y A/D
    this.inputSystem.registerAction('moveLeft', ['LEFT', 'A'], () => {
      // Se maneja en update con isActionDown
    });

    this.inputSystem.registerAction('moveRight', ['RIGHT', 'D'], () => {
      // Se maneja en update con isActionDown
    });

    // Movimiento continuo con teclas
    this.events.on('update', (_time: number, delta: number) => {
      if (this.isGameOver || this.isPaused) return;

      const deltaSeconds = delta / 1000;
      const movement = playerSpeed * deltaSeconds;

      if (this.inputSystem.isActionDown('moveLeft')) {
        this.moveCatcher(-movement);
      }
      if (this.inputSystem.isActionDown('moveRight')) {
        this.moveCatcher(movement);
      }
    });

    // Touch/Mouse: Drag horizontal
    this.inputSystem.onDrag((x, _y) => {
      if (this.isGameOver || this.isPaused) return;
      this.catcher.x = Phaser.Math.Clamp(x, 60, this.gameWidth - 60);
    });
  }

  private moveCatcher(deltaX: number): void {
    const newX = this.catcher.x + deltaX;
    this.catcher.x = Phaser.Math.Clamp(newX, 60, this.gameWidth - 60);
  }

  // ============================================================================
  // Spawning
  // ============================================================================

  private startSpawning(): void {
    const spawnRate = this.config.templateConfig.targets?.spawnRate ?? 1500;

    this.spawnTimer = this.time.addEvent({
      delay: spawnRate,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true,
    });

    // Spawn inicial
    this.spawnObject();
  }

  private spawnObject(): void {
    if (this.isGameOver || this.isPaused) return;

    const targets = this.config.templateConfig.targets;
    if (!targets) return;

    // Decidir si es correcto o incorrecto (60% correcto para que sea alcanzable)
    const isCorrect = Math.random() < 0.6;
    const pool = isCorrect ? targets.correct : targets.wrong;

    if (!pool || pool.length === 0) return;

    // Elegir valor aleatorio del pool
    const value = pool[Math.floor(Math.random() * pool.length)];

    // Posición X aleatoria
    const x = Phaser.Math.Between(60, this.gameWidth - 60);

    // Velocidad aleatoria dentro del rango
    const fallSpeed = targets.fallSpeed ?? { min: 100, max: 200 };
    const speed = Phaser.Math.Between(fallSpeed.min, fallSpeed.max);

    // Crear el objeto
    const container = this.createFallingObjectVisual(x, -50, value, isCorrect);

    this.fallingObjects.push({
      sprite: container,
      value,
      isCorrect,
      speed,
    });
  }

  private createFallingObjectVisual(
    x: number,
    y: number,
    value: string,
    isCorrect: boolean,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Fondo del objeto
    const bg = this.add.graphics();
    const bgColor = isCorrect ? 0x22c55e : 0xef4444;
    const padding = 20;
    const textObj = this.add.text(0, 0, value, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
    });
    textObj.setOrigin(0.5);

    const width = Math.max(textObj.width + padding * 2, 60);
    const height = 40;

    bg.fillStyle(bgColor, 0.9);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);

    // Borde sutil
    bg.lineStyle(2, 0xffffff, 0.2);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);

    container.add(bg);
    container.add(textObj);

    // Animación de entrada
    container.setScale(0);
    this.tweens.add({
      targets: container,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut',
    });

    return container;
  }

  // ============================================================================
  // Update Logic
  // ============================================================================

  private updateFallingObjects(delta: number): void {
    const deltaSeconds = delta / 1000;

    for (let i = this.fallingObjects.length - 1; i >= 0; i--) {
      const obj = this.fallingObjects[i];
      obj.sprite.y += obj.speed * deltaSeconds;

      // Si pasó el fondo de la pantalla
      if (obj.sprite.y > this.gameHeight + 50) {
        // Si era correcto y no lo atrapamos, es un miss
        if (obj.isCorrect) {
          this.onMissedCorrect();
        }
        this.removeObject(i);
      }
    }
  }

  private checkCollisions(): void {
    const catcherWidth = this.config.templateConfig.player?.width ?? 100;
    const catcherBounds = new Phaser.Geom.Rectangle(
      this.catcher.x - catcherWidth / 2,
      this.catcher.y - 40,
      catcherWidth,
      50,
    );

    for (let i = this.fallingObjects.length - 1; i >= 0; i--) {
      const obj = this.fallingObjects[i];
      const objBounds = new Phaser.Geom.Rectangle(obj.sprite.x - 30, obj.sprite.y - 20, 60, 40);

      if (Phaser.Geom.Rectangle.Overlaps(catcherBounds, objBounds)) {
        this.onCatch(obj, i);
      }
    }
  }

  // ============================================================================
  // Game Events
  // ============================================================================

  private onCatch(obj: FallingObject, index: number): void {
    if (obj.isCorrect) {
      this.onCorrectCatch(obj);
    } else {
      this.onWrongCatch(obj);
    }
    this.removeObject(index);
  }

  private onCorrectCatch(obj: FallingObject): void {
    // Feedback visual
    this.particles.sparkle(obj.sprite.x, obj.sprite.y);

    // Flash verde en el catcher
    this.tweens.add({
      targets: this.catcher,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 100,
      yoyo: true,
    });

    // Actualizar score
    this.onCorrectAnswer(10);
  }

  private onWrongCatch(obj: FallingObject): void {
    // Feedback visual
    this.particles.burst(obj.sprite.x, obj.sprite.y);

    // Shake del catcher
    this.tweens.add({
      targets: this.catcher,
      x: this.catcher.x + 10,
      duration: 50,
      yoyo: true,
      repeat: 3,
    });

    // Perder vida
    this.onWrongAnswer(5);
    const gameOver = this.loseLife();

    if (!gameOver) {
      // Flash rojo en pantalla
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
  }

  private onMissedCorrect(): void {
    // Pequeña penalización por dejar pasar un correcto
    // No pierde vida, solo combo
    this.combo = 0;
  }

  private removeObject(index: number): void {
    const obj = this.fallingObjects[index];

    // Animación de desaparición
    this.tweens.add({
      targets: obj.sprite,
      alpha: 0,
      scale: 0.5,
      duration: 150,
      onComplete: () => {
        obj.sprite.destroy();
      },
    });

    this.fallingObjects.splice(index, 1);
  }

  // ============================================================================
  // State Serialization
  // ============================================================================

  protected override getTemplateState(): Record<string, unknown> {
    return {
      objectsOnScreen: this.fallingObjects.length,
    };
  }
}

// ============================================================================
// Register Template
// ============================================================================

import { GameRegistry } from '../../core/GameRegistry';

GameRegistry.register(CatcherScene, {
  id: 'catcher',
  name: 'Catcher',
  description: 'Atrapa objetos que caen - perfecto para fracciones, vocabulario, etc.',
  category: 'arcade',
  complexity: 'low',
});
