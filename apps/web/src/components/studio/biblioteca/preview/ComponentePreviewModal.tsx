'use client';

import React, { ReactElement, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ComponentePreviewModalProps } from './types';
import { getCategoryColors } from './constants';
import { PreviewModalHeader, PreviewModalFooter, PreviewContainer } from './components';

/**
 * Modal de preview para componentes de la biblioteca
 *
 * Muestra:
 * - Header con nombre, icono, categoría y estado
 * - Preview interactivo del componente (si está implementado)
 * - Documentación de props
 * - Toggle para habilitar/deshabilitar
 */
export function ComponentePreviewModal({
  isOpen,
  onClose,
  componente,
  onToggle,
  isToggling = false,
}: ComponentePreviewModalProps): ReactElement | null {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  // Handle click outside
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>): void => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  // Focus trap and escape key listener
  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Focus the modal
    if (modalRef.current) {
      modalRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Don't render if closed or no component
  if (!isOpen || !componente) {
    return null;
  }

  const colors = getCategoryColors(componente.categoria);

  const modalContent = (
    <div
      data-testid="modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-modal-title"
        data-testid="modal-content"
        tabIndex={-1}
        className={`
          relative w-full max-w-3xl max-h-[90vh] overflow-hidden
          bg-slate-900 rounded-2xl border ${colors.border}
          shadow-2xl shadow-black/50 animate-scale-in
          flex flex-col
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient accent bar */}
        <div className={`h-1 bg-gradient-to-r ${colors.gradient}`} />

        {/* Header */}
        <PreviewModalHeader componente={componente} onClose={onClose} />

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto">
          <PreviewContainer
            tipo={componente.tipo}
            implementado={componente.implementado}
            nombre={componente.nombre}
            componente={componente}
          />
        </div>

        {/* Footer */}
        <PreviewModalFooter componente={componente} onToggle={onToggle} isToggling={isToggling} />
      </div>
    </div>
  );

  // Portal to body
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}
