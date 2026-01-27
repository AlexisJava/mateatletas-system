/**
 * @mateatletas/lesson-engine
 *
 * Motor de renderizado de lecciones basado en intents.
 * Transforma JSON de lección en slides interactivos.
 *
 * @packageDocumentation
 */

// Player - Main entry point for playing lessons
export * from './player';

// Context - Estado global de la lección
export * from './context';

// Renderer - Sistema de renderizado
export * from './renderer';

// Intents - Componentes de slide
export * from './intents';

// Catalog - Metadata centralizada de intents
export * from './catalog';

// Validation - Zod schemas and validators
export * from './validation';

// Hooks - Custom hooks for lesson functionality
export * from './hooks';

// Components - Reusable UI components
export * from './components';
