/**
 * WhackAMoleScene - Golpear targets que aparecen
 *
 * Mecánica: Targets aparecen en un grid de "agujeros". El jugador debe
 * hacer click/tap en los targets correctos antes de que desaparezcan.
 *
 * Uso educativo: Identificar respuestas correctas, números primos,
 * palabras en otro idioma, etc.
 */

import Phaser from 'phaser';
import { BaseScene } from '../../core/BaseScene';
import { ParticleSystem } from '../../systems/ParticleSystem';
import type { WhackAMoleConfig } from '@mateatletas/contracts';

// ============================================================================
// Types
// ============================================================================

/** Representa un agujero en el grid */
interface Hole {
  x: number;
  y: number;
  container: Phaser.GameObjects.Container;
  mole: Phaser.GameObjects.Container | null;
  isOccupied: boolean;
}

/** Mole activo (target que apareció) */
interface ActiveMole {
  hole: Hole;
  value: string;
  isCorrect: boolean;
  timer: Phaser.Time.TimerEvent;
}

// ============================================================================
// WhackAMoleScene
// ============================================================================

export class WhackAMoleScene extends BaseScene<WhackAMoleConfig> {
  // Systems
  private particles!: ParticleSystem;

  // Game state
  private holes: Hole[] = [];
  private activeMoles: ActiveMole[] = [];
  private spawnTimer?: Phaser.Time.TimerEvent;

  // Dimensions
  private gameWidth = 0;
  private gameHeight = 0;

  // ============================================================================
  // Constructor
  // ============================================================================

  constructor() {
    super('whackamole');
  }

  // ============================================================================
  // Phaser Lifecycle
  // ============================================================================

  create(): void {
    super.create();

    this.gameWidth = this.scale.width;
    this.gameHeight = this.scale.height;

    // Initialize systems
    this.particles = new ParticleSystem(this);

    // Setup game
    this.createBackground();
    this.createGrid();
    this.createUI();
    this.startSpawning();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
  }

  shutdown(): void {
    super.shutdown();
    this.particles.destroy();
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }
    for (const mole of this.activeMoles) {
      mole.timer.destroy();
    }
  }

  // ============================================================================
  // Setup Methods
  // ============================================================================

  private createBackground(): void {
    // Fondo con gradiente
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1e3a5f, 0x1e3a5f, 0x0f172a, 0x0f172a, 1);
    bg.fillRect(0, 0, this.gameWidth, this.gameHeight);

    // Patrón de césped/tierra
    const groundY = 100;
    const ground = this.add.graphics();
    ground.fillStyle(0x2d5a27, 1);
    ground.fillRect(0, groundY, this.gameWidth, this.gameHeight - groundY);

    // Textura sutil
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, this.gameWidth);
      const y = Phaser.Math.Between(groundY, this.gameHeight);
      ground.fillStyle(0x3d6a37, 0.5);
      ground.fillCircle(x, y, Phaser.Math.Between(2, 5));
    }
  }

  private createGrid(): void {
    const config = this.config.templateConfig;
    const cols = config.grid?.cols ?? 3;
    const rows = config.grid?.rows ?? 3;

    // Calcular dimensiones del grid
    const gridWidth = this.gameWidth * 0.8;
    const gridHeight = this.gameHeight * 0.6;
    const startX = (this.gameWidth - gridWidth) / 2;
    const startY = 120;

    const cellWidth = gridWidth / cols;
    const cellHeight = gridHeight / rows;
    const holeRadius = Math.min(cellWidth, cellHeight) * 0.35;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + cellWidth * (col + 0.5);
        const y = startY + cellHeight * (row + 0.5);

        const hole = this.createHole(x, y, holeRadius);
        this.holes.push(hole);
      }
    }
  }

  private createHole(x: number, y: number, radius: number): Hole {
    const container = this.add.container(x, y);

    // Sombra del agujero
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillEllipse(0, radius * 0.2, radius * 2.2, radius * 0.6);
    container.add(shadow);

    // Agujero oscuro
    const holeGraphics = this.add.graphics();
    holeGraphics.fillStyle(0x1a1a1a, 1);
    holeGraphics.fillEllipse(0, 0, radius * 2, radius * 0.8);
    container.add(holeGraphics);

    // Borde del agujero
    const rim = this.add.graphics();
    rim.lineStyle(3, 0x4a3728, 1);
    rim.strokeEllipse(0, 0, radius * 2, radius * 0.8);
    container.add(rim);

    return {
      x,
      y,
      container,
      mole: null,
      isOccupied: false,
    };
  }

  private createUI(): void {
    const panelHeight = 60;

    // Panel superior
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.6);
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

  // ============================================================================
  // Spawning
  // ============================================================================

  private startSpawning(): void {
    const timing = this.config.templateConfig.timing ?? {};
    const spawnInterval = timing.spawnInterval ?? 1000;

    this.spawnTimer = this.time.addEvent({
      delay: spawnInterval,
      callback: this.spawnMole,
      callbackScope: this,
      loop: true,
    });

    // Spawn inicial
    this.spawnMole();
  }

  private spawnMole(): void {
    if (this.isGameOver || this.isPaused) return;

    // Encontrar agujero libre
    const freeHoles = this.holes.filter((h) => !h.isOccupied);
    if (freeHoles.length === 0) return;

    const hole = Phaser.Utils.Array.GetRandom(freeHoles);
    const config = this.config.templateConfig;

    // Decidir si es correcto (60% correcto)
    const isCorrect = Math.random() < 0.6;
    const pool = isCorrect ? config.correct : config.wrong;

    if (!pool || pool.length === 0) return;

    const value: string = Phaser.Utils.Array.GetRandom(pool);
    const timing = config.timing ?? {};
    const showTime = timing.showTime ?? 1500;

    // Crear mole visual
    const mole = this.createMoleVisual(hole, value, isCorrect);
    hole.mole = mole;
    hole.isOccupied = true;

    // Timer para desaparecer
    const timer = this.time.delayedCall(showTime, () => {
      this.hideMole(hole, isCorrect);
    });

    this.activeMoles.push({
      hole,
      value,
      isCorrect,
      timer,
    });
  }

  private createMoleVisual(
    hole: Hole,
    value: string,
    isCorrect: boolean,
  ): Phaser.GameObjects.Container {
    const mole = this.add.container(hole.x, hole.y + 40);

    // Cuerpo del mole/target
    const body = this.add.graphics();
    const bodyColor = isCorrect ? 0x22c55e : 0xef4444;
    body.fillStyle(bodyColor, 1);
    body.fillRoundedRect(-40, -50, 80, 60, 10);

    // Borde
    body.lineStyle(2, 0xffffff, 0.3);
    body.strokeRoundedRect(-40, -50, 80, 60, 10);

    mole.add(body);

    // Texto
    const text = this.add
      .text(0, -25, value, {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    mole.add(text);

    // Hacer interactivo
    const hitArea = this.add.rectangle(0, -25, 80, 60, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.on('pointerdown', () => this.onMoleClick(hole));
    mole.add(hitArea);

    // Animación de aparición
    mole.setScale(0.5);
    mole.setAlpha(0);
    this.tweens.add({
      targets: mole,
      y: hole.y - 20,
      scale: 1,
      alpha: 1,
      duration: 200,
      ease: 'Back.easeOut',
    });

    return mole;
  }

  // ============================================================================
  // Game Events
  // ============================================================================

  private onMoleClick(hole: Hole): void {
    if (!hole.isOccupied || !hole.mole) return;

    const activeMole = this.activeMoles.find((m) => m.hole === hole);
    if (!activeMole) return;

    // Cancelar timer
    activeMole.timer.destroy();

    if (activeMole.isCorrect) {
      this.onCorrectHit(hole);
    } else {
      this.onWrongHit(hole);
    }

    // Remover mole
    this.removeMole(hole);
  }

  private onCorrectHit(hole: Hole): void {
    this.particles.sparkle(hole.x, hole.y - 20);
    this.onCorrectAnswer(15);

    // Flash visual
    const flash = this.add.graphics();
    flash.fillStyle(0x22c55e, 0.3);
    flash.fillCircle(hole.x, hole.y, 60);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy(),
    });
  }

  private onWrongHit(hole: Hole): void {
    this.particles.burst(hole.x, hole.y - 20);
    this.onWrongAnswer(5);
    this.loseLife();

    // Flash rojo
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

  private hideMole(hole: Hole, wasCorrect: boolean): void {
    if (!hole.isOccupied) return;

    // Si era correcto y no lo golpearon, perdemos combo
    if (wasCorrect) {
      this.combo = 0;
    }

    this.removeMole(hole);
  }

  private removeMole(hole: Hole): void {
    if (!hole.mole) return;

    const mole = hole.mole;

    // Animación de desaparición
    this.tweens.add({
      targets: mole,
      y: hole.y + 40,
      scale: 0.5,
      alpha: 0,
      duration: 150,
      onComplete: () => {
        mole.destroy();
      },
    });

    hole.mole = null;
    hole.isOccupied = false;

    // Remover de activos
    const index = this.activeMoles.findIndex((m) => m.hole === hole);
    if (index !== -1) {
      this.activeMoles.splice(index, 1);
    }
  }

  // ============================================================================
  // State
  // ============================================================================

  protected override getTemplateState(): Record<string, unknown> {
    return {
      activeMoles: this.activeMoles.length,
    };
  }
}

// ============================================================================
// Register Template
// ============================================================================

import { GameRegistry } from '../../core/GameRegistry';

GameRegistry.register(WhackAMoleScene, {
  id: 'whackamole',
  name: 'Whack-a-Mole',
  description: 'Golpea los targets correctos antes de que desaparezcan',
  category: 'arcade',
  complexity: 'low',
});
