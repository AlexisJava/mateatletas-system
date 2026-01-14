/**
 * Core - Game Engine Foundation
 *
 * Componentes fundamentales del motor de juegos:
 * - EventBus: Comunicación React ↔ Phaser
 * - BaseScene: Clase base para escenas
 * - GameRegistry: Registro de templates
 * - PhaserGame: Wrapper React
 */

// Types
export type {
  BaseGameConfig,
  GameCallbacks,
  GameConfig,
  GameEventMap,
  GameEventType,
  GameProgress,
  GameResult,
  SceneInitData,
  TemplateMetadata,
} from './types';

// EventBus
export { EventBus, destroyEventBus } from './EventBus';

// BaseScene
export { BaseScene } from './BaseScene';

// GameRegistry
export { GameRegistry } from './GameRegistry';

// PhaserGame React Component
export { PhaserGame, useGameControls } from './PhaserGame';
export type { PhaserGameProps } from './PhaserGame';
