/**
 * Componentes Interactivos para Studio
 *
 * 15 componentes de interacción directa con contenido educativo.
 */

export * from './types';
export { DragAndDrop } from './DragAndDrop';
export { MatchingPairs } from './MatchingPairs';
export { OrderSequence } from './OrderSequence';
export { Slider } from './Slider';
export { ToggleSwitch } from './ToggleSwitch';
export { NumberInput } from './NumberInput';

// Register components
import { registrarBloque } from '../registry';
import { DragAndDrop } from './DragAndDrop';
import { MatchingPairs } from './MatchingPairs';
import { OrderSequence } from './OrderSequence';
import { Slider } from './Slider';
import { ToggleSwitch } from './ToggleSwitch';
import { NumberInput } from './NumberInput';
import type {
  DragAndDropConfig,
  MatchingPairsConfig,
  OrderSequenceConfig,
  SliderConfig,
  ToggleSwitchConfig,
  NumberInputConfig,
} from './types';

registrarBloque<DragAndDropConfig>('DragAndDrop', DragAndDrop);
registrarBloque<MatchingPairsConfig>('MatchingPairs', MatchingPairs);
registrarBloque<OrderSequenceConfig>('OrderSequence', OrderSequence);
registrarBloque<SliderConfig>('Slider', Slider);
registrarBloque<ToggleSwitchConfig>('ToggleSwitch', ToggleSwitch);
registrarBloque<NumberInputConfig>('NumberInput', NumberInput);
