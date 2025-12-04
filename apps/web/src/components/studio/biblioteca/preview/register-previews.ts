/**
 * Archivo de inicialización de previews
 *
 * Importar este archivo registra automáticamente todos los previews
 * de componentes implementados en el registry.
 *
 * Uso: import '@/components/studio/biblioteca/preview/register-previews';
 */

import { registerPreview } from './preview-registry';
import { MultipleChoicePreview } from './previews/MultipleChoicePreview';
import { FillBlanksPreview } from './previews/FillBlanksPreview';
import { VideoPlayerPreview } from './previews/VideoPlayerPreview';
import { DragAndDropPreview } from './previews/DragAndDropPreview';
import { MatchingPairsPreview } from './previews/MatchingPairsPreview';
import { OrderSequencePreview } from './previews/OrderSequencePreview';
import { SliderPreview } from './previews/SliderPreview';
import { ToggleSwitchPreview } from './previews/ToggleSwitchPreview';
import { NumberInputPreview } from './previews/NumberInputPreview';
import { TextInputPreview } from './previews/TextInputPreview';
import { HotspotPreview } from './previews/HotspotPreview';
import { TimelinePreview } from './previews/TimelinePreview';
import { SortingBinsPreview } from './previews/SortingBinsPreview';
import { ScaleBalancePreview } from './previews/ScaleBalancePreview';
import { PieChartPreview } from './previews/PieChartPreview';
import { BarGraphPreview } from './previews/BarGraphPreview';
import { AudioPlayerPreview } from './previews/AudioPlayerPreview';
import { ImageGalleryPreview } from './previews/ImageGalleryPreview';
import { QuizPreview } from './previews/QuizPreview';
import { ProgressTrackerPreview } from './previews/ProgressTrackerPreview';
import { DocumentViewerPreview } from './previews/DocumentViewerPreview';
import { RubricPreview } from './previews/RubricPreview';
import { BadgeDisplayPreview } from './previews/BadgeDisplayPreview';
import { CheckpointPreview } from './previews/CheckpointPreview';
import { StepAnimationPreview } from './previews/StepAnimationPreview';
import { TracePathPreview } from './previews/TracePathPreview';
import { DrawShapePreview } from './previews/DrawShapePreview';
import { FunctionGrapherPreview } from './previews/FunctionGrapherPreview';
import { CodeEditorPreview } from './previews/CodeEditorPreview';
import { CodePlaygroundPreview } from './previews/CodePlaygroundPreview';
import { CodeComparisonPreview } from './previews/CodeComparisonPreview';
import { SyntaxHighlightPreview } from './previews/SyntaxHighlightPreview';

// Registrar previews de componentes implementados
registerPreview('MultipleChoice', MultipleChoicePreview);
registerPreview('FillBlanks', FillBlanksPreview);
registerPreview('VideoPlayer', VideoPlayerPreview);
registerPreview('DragAndDrop', DragAndDropPreview);
registerPreview('MatchingPairs', MatchingPairsPreview);
registerPreview('OrderSequence', OrderSequencePreview);
registerPreview('Slider', SliderPreview);
registerPreview('ToggleSwitch', ToggleSwitchPreview);
registerPreview('NumberInput', NumberInputPreview);
registerPreview('TextInput', TextInputPreview);
registerPreview('Hotspot', HotspotPreview);
registerPreview('Timeline', TimelinePreview);
registerPreview('SortingBins', SortingBinsPreview);
registerPreview('ScaleBalance', ScaleBalancePreview);
registerPreview('PieChart', PieChartPreview);
registerPreview('BarGraph', BarGraphPreview);
registerPreview('AudioPlayer', AudioPlayerPreview);
registerPreview('ImageGallery', ImageGalleryPreview);
registerPreview('Quiz', QuizPreview);
registerPreview('ProgressTracker', ProgressTrackerPreview);
registerPreview('DocumentViewer', DocumentViewerPreview);
registerPreview('Rubric', RubricPreview);
registerPreview('BadgeDisplay', BadgeDisplayPreview);
registerPreview('Checkpoint', CheckpointPreview);
registerPreview('StepAnimation', StepAnimationPreview);
registerPreview('TracePath', TracePathPreview);
registerPreview('DrawShape', DrawShapePreview);
registerPreview('FunctionGrapher', FunctionGrapherPreview);
registerPreview('CodeEditor', CodeEditorPreview);
registerPreview('CodePlayground', CodePlaygroundPreview);
registerPreview('CodeComparison', CodeComparisonPreview);
registerPreview('SyntaxHighlight', SyntaxHighlightPreview);

// Log para desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log(
    '[Studio] Previews registrados: MultipleChoice, FillBlanks, VideoPlayer, DragAndDrop, MatchingPairs, OrderSequence, Slider, ToggleSwitch, NumberInput, TextInput, Hotspot, Timeline, SortingBins, ScaleBalance, PieChart, BarGraph, AudioPlayer, ImageGallery, Quiz, ProgressTracker, DocumentViewer, Rubric, BadgeDisplay, Checkpoint, StepAnimation, TracePath, DrawShape, FunctionGrapher, CodeEditor, CodePlayground, CodeComparison, SyntaxHighlight',
  );
}
