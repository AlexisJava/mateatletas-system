/**
 * Studio Canvas - Barrel Export
 *
 * Editor visual de contenido educativo con drag & drop
 */

// Types
export * from './types/canvas.types';

// Store
export { useCanvasStore } from './stores/canvas.store';

// Components
export { StudioEditor } from './components/StudioEditor';
export { StudioCanvas } from './components/StudioCanvas';
export { CanvasElement } from './components/CanvasElement';
export { Toolbar } from './components/Toolbar';
export { ComponentPanel } from './components/panels/ComponentPanel';
export { PropertiesPanel } from './components/panels/PropertiesPanel';

// Hooks
export { useCanvasKeyboard } from './hooks/useCanvasKeyboard';

// Utils
export * from './utils/snap.utils';
