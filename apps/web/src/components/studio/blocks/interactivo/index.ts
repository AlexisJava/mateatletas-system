/**
 * Componentes Interactivos para Studio
 *
 * 15 componentes de interacción directa con contenido educativo.
 */

export * from './types';
export { DragAndDrop } from './DragAndDrop';
export { MatchingPairs } from './MatchingPairs';
export { OrderSequence } from './OrderSequence';

// Register components
import { registrarBloque } from '../registry';
import { DragAndDrop } from './DragAndDrop';
import { MatchingPairs } from './MatchingPairs';
import { OrderSequence } from './OrderSequence';
import type { DragAndDropConfig, MatchingPairsConfig, OrderSequenceConfig } from './types';

registrarBloque<DragAndDropConfig>('DragAndDrop', DragAndDrop);
registrarBloque<MatchingPairsConfig>('MatchingPairs', MatchingPairs);
registrarBloque<OrderSequenceConfig>('OrderSequence', OrderSequence);
