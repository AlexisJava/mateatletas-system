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

// Registrar previews de componentes implementados
registerPreview('MultipleChoice', MultipleChoicePreview);
registerPreview('FillBlanks', FillBlanksPreview);
registerPreview('VideoPlayer', VideoPlayerPreview);
registerPreview('DragAndDrop', DragAndDropPreview);

// Log para desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log(
    '[Studio] Previews registrados: MultipleChoice, FillBlanks, VideoPlayer, DragAndDrop',
  );
}
