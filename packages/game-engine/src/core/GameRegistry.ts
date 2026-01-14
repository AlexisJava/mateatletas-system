/**
 * GameRegistry - Template Registration System
 *
 * Registro central de todos los templates de juego disponibles.
 * Permite registrar, obtener y listar escenas de juego.
 */

import type { SceneInitData, TemplateMetadata } from './types';
import type Phaser from 'phaser';

/**
 * Interfaz para escenas de juego que extienden Phaser.Scene.
 *
 * Define los métodos de lifecycle que BaseScene implementa.
 * Esto permite type-safety en el registry sin los problemas de varianza
 * del genérico TConfig de BaseScene.
 */
interface GameScene extends Phaser.Scene {
  /** Método de inicialización llamado por Phaser */
  init(data: SceneInitData): void;
}

/**
 * Tipo para el constructor de una escena.
 */
type SceneConstructor = new (sceneKey: string) => GameScene;

/**
 * Entry en el registro: clase + metadata
 */
interface RegistryEntry {
  SceneClass: SceneConstructor;
  metadata: TemplateMetadata;
}

/**
 * GameRegistry - Singleton para registro de templates
 *
 * @example
 * // Registrar un template
 * GameRegistry.register(CatcherScene, {
 *   id: 'catcher',
 *   name: 'Catcher',
 *   description: 'Atrapa objetos que caen',
 *   category: 'arcade',
 *   complexity: 'low',
 * });
 *
 * @example
 * // Obtener un template
 * const SceneClass = GameRegistry.get('catcher');
 * if (SceneClass) {
 *   const scene = new SceneClass('catcher-instance');
 * }
 */
class GameRegistryClass {
  private registry = new Map<string, RegistryEntry>();

  /**
   * Registra un template de juego
   *
   * @param SceneClass - Clase que extiende BaseScene
   * @param metadata - Información del template
   * @throws Error si el template ya está registrado
   */
  register(SceneClass: SceneConstructor, metadata: TemplateMetadata): void {
    if (this.registry.has(metadata.id)) {
      throw new Error(`Template "${metadata.id}" is already registered`);
    }

    this.registry.set(metadata.id, { SceneClass, metadata });
  }

  /**
   * Obtiene la clase de escena para un template
   *
   * @param templateId - ID del template
   * @returns La clase de escena o undefined si no existe
   */
  get(templateId: string): SceneConstructor | undefined {
    return this.registry.get(templateId)?.SceneClass;
  }

  /**
   * Obtiene la metadata de un template
   *
   * @param templateId - ID del template
   * @returns Metadata o undefined si no existe
   */
  getMetadata(templateId: string): TemplateMetadata | undefined {
    return this.registry.get(templateId)?.metadata;
  }

  /**
   * Verifica si un template está registrado
   *
   * @param templateId - ID del template
   */
  has(templateId: string): boolean {
    return this.registry.has(templateId);
  }

  /**
   * Lista todos los templates registrados
   *
   * @returns Array de IDs de templates
   */
  list(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Lista todos los templates con su metadata
   *
   * @returns Array de metadata de todos los templates
   */
  listWithMetadata(): TemplateMetadata[] {
    return Array.from(this.registry.values()).map((entry) => entry.metadata);
  }

  /**
   * Filtra templates por categoría
   *
   * @param category - Categoría a filtrar
   * @returns Array de metadata de templates en esa categoría
   */
  listByCategory(category: TemplateMetadata['category']): TemplateMetadata[] {
    return this.listWithMetadata().filter((m) => m.category === category);
  }

  /**
   * Limpia el registro (útil para testing)
   */
  clear(): void {
    this.registry.clear();
  }

  /**
   * Obtiene el número de templates registrados
   */
  get size(): number {
    return this.registry.size;
  }
}

/**
 * Instancia singleton del GameRegistry
 */
export const GameRegistry = new GameRegistryClass();
