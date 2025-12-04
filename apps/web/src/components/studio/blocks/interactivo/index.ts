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
export { TextInput } from './TextInput';
export { PieChart } from './PieChart';
export { BarGraph } from './BarGraph';
export { Hotspot } from './Hotspot';
export { Timeline } from './Timeline';
export { SortingBins } from './SortingBins';
export { ScaleBalance } from './ScaleBalance';
export { Quiz } from './Quiz';
export { ProgressTracker } from './ProgressTracker';
export { ImageGallery } from './ImageGallery';
export { AudioPlayer } from './AudioPlayer';

// Register components
import { registrarBloque } from '../registry';
import { DragAndDrop } from './DragAndDrop';
import { MatchingPairs } from './MatchingPairs';
import { OrderSequence } from './OrderSequence';
import { Slider } from './Slider';
import { ToggleSwitch } from './ToggleSwitch';
import { NumberInput } from './NumberInput';
import { TextInput } from './TextInput';
import { PieChart } from './PieChart';
import { BarGraph } from './BarGraph';
import { Hotspot } from './Hotspot';
import { Timeline } from './Timeline';
import { SortingBins } from './SortingBins';
import { ScaleBalance } from './ScaleBalance';
import { Quiz } from './Quiz';
import { ProgressTracker } from './ProgressTracker';
import { ImageGallery } from './ImageGallery';
import { AudioPlayer } from './AudioPlayer';
import type {
  DragAndDropConfig,
  MatchingPairsConfig,
  OrderSequenceConfig,
  SliderConfig,
  ToggleSwitchConfig,
  NumberInputConfig,
  TextInputConfig,
  PieChartConfig,
  BarGraphConfig,
  HotspotConfig,
  TimelineConfig,
  SortingBinsConfig,
  ScaleBalanceConfig,
  QuizConfig,
  ProgressTrackerConfig,
  ImageGalleryConfig,
  AudioPlayerConfig,
} from './types';

registrarBloque<DragAndDropConfig>('DragAndDrop', DragAndDrop);
registrarBloque<MatchingPairsConfig>('MatchingPairs', MatchingPairs);
registrarBloque<OrderSequenceConfig>('OrderSequence', OrderSequence);
registrarBloque<SliderConfig>('Slider', Slider);
registrarBloque<ToggleSwitchConfig>('ToggleSwitch', ToggleSwitch);
registrarBloque<NumberInputConfig>('NumberInput', NumberInput);
registrarBloque<TextInputConfig>('TextInput', TextInput);
registrarBloque<PieChartConfig>('PieChart', PieChart);
registrarBloque<BarGraphConfig>('BarGraph', BarGraph);
registrarBloque<HotspotConfig>('Hotspot', Hotspot);
registrarBloque<TimelineConfig>('Timeline', Timeline);
registrarBloque<SortingBinsConfig>('SortingBins', SortingBins);
registrarBloque<ScaleBalanceConfig>('ScaleBalance', ScaleBalance);
registrarBloque<QuizConfig>('Quiz', Quiz);
registrarBloque<ProgressTrackerConfig>('ProgressTracker', ProgressTracker);
registrarBloque<ImageGalleryConfig>('ImageGallery', ImageGallery);
registrarBloque<AudioPlayerConfig>('AudioPlayer', AudioPlayer);
