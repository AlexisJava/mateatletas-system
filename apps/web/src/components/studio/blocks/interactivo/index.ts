/**
 * Componentes Interactivos para Studio
 *
 * 15 componentes de interacción directa con contenido educativo.
 */

export * from './types';
export { DragAndDrop } from './DragAndDrop';

// Register components
import { registrarBloque } from '../registry';
import { DragAndDrop } from './DragAndDrop';
import type { DragAndDropConfig } from './types';

registrarBloque<DragAndDropConfig>('DragAndDrop', DragAndDrop);
