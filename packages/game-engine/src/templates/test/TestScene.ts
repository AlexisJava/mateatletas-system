/**
 * TestScene - Template de prueba para verificar el core
 *
 * Este template solo se usa para desarrollo y testing.
 * Muestra un rectángulo y texto, y completa el juego al hacer click.
 */

import { BaseScene } from '../../core/BaseScene';
import { GameRegistry } from '../../core/GameRegistry';

/**
 * Configuración específica del TestScene
 */
interface TestConfig extends Record<string, unknown> {
  /** Color del fondo (hex) */
  backgroundColor: number;
  /** Mensaje a mostrar */
  message: string;
}

/**
 * Escena de prueba que verifica el funcionamiento del core
 */
export class TestScene extends BaseScene<TestConfig> {
  private messageText?: Phaser.GameObjects.Text;

  create(): void {
    super.create();

    const { width, height } = this.scale;
    const { templateConfig } = this.config;

    // Fondo con el color configurado
    this.add.rectangle(width / 2, height / 2, width, height, templateConfig.backgroundColor);

    // Texto con el mensaje
    this.messageText = this.add.text(width / 2, height / 2 - 50, templateConfig.message, {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
    });
    this.messageText.setOrigin(0.5);

    // Instrucción
    const instruction = this.add.text(width / 2, height / 2 + 50, 'Click para completar', {
      fontSize: '20px',
      color: '#aaaaaa',
      fontFamily: 'Arial',
    });
    instruction.setOrigin(0.5);

    // Score
    const scoreText = this.add.text(20, 20, `Score: ${this.score}`, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
    });

    // Hacer clickable
    this.input.on('pointerdown', () => {
      this.onCorrectAnswer(100);
      scoreText.setText(`Score: ${this.score}`);

      // Completar después de 3 clicks
      if (this.correctAnswers >= 3) {
        this.endGame(true);
      }
    });
  }
}

// Registrar el template
GameRegistry.register(TestScene, {
  id: 'test',
  name: 'Test Scene',
  description: 'Template de prueba para verificar el core del game-engine',
  category: 'arcade',
  complexity: 'low',
});
