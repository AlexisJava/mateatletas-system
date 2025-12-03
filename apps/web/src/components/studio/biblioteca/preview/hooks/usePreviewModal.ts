import { useState, useCallback } from 'react';
import { BloqueMetadata } from '../../../blocks/types';
import { PreviewModalState, UsePreviewModalResult } from '../types';

/**
 * Hook para manejar el estado del modal de preview
 */
export function usePreviewModal(): UsePreviewModalResult {
  const [state, setState] = useState<PreviewModalState>({
    isOpen: false,
    componente: null,
  });

  const openModal = useCallback((componente: BloqueMetadata): void => {
    setState({
      isOpen: true,
      componente,
    });
  }, []);

  const closeModal = useCallback((): void => {
    setState({
      isOpen: false,
      componente: null,
    });
  }, []);

  return {
    state,
    openModal,
    closeModal,
  };
}
