// Main modal component
export { ComponentePreviewModal } from './ComponentePreviewModal';

// Registry functions
export {
  registerPreview,
  getPreview,
  hasPreview,
  listPreviews,
  clearPreviewRegistry,
  getPreviewCount,
} from './preview-registry';

// Hook
export { usePreviewModal } from './hooks/usePreviewModal';

// Types
export type {
  PreviewComponentProps,
  PreviewDefinition,
  PropDocumentation,
  PropType,
  PreviewModalState,
  ComponentePreviewModalProps,
  UsePreviewModalResult,
} from './types';

// Constants
export { CATEGORY_COLORS, getCategoryColors, CATEGORY_LABELS, CATEGORY_EMOJIS } from './constants';

// Sub-components (for testing/extension)
export {
  PreviewModalHeader,
  PreviewModalFooter,
  PreviewContainer,
  NotImplementedPlaceholder,
  PropsDocumentationPanel,
} from './components';
