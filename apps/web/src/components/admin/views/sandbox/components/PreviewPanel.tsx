'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { LessonRenderer } from '@/components/lesson-renderer';
import styles from './PreviewPanel.module.css';

interface PreviewPanelProps {
  content: string;
  nodoId: string | null;
  isLeafNode: boolean;
}

export function PreviewPanel({ content, nodoId, isLeafNode }: PreviewPanelProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Cerrar con Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsFullscreen(false);
  }, []);

  useEffect(() => {
    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFullscreen, handleKeyDown]);

  if (!nodoId) {
    return (
      <div className={styles.empty}>
        <span>Selecciona un nodo para previsualizar</span>
      </div>
    );
  }

  // Si es contenedor (tiene hijos), mostrar mensaje
  if (!isLeafNode && !content) {
    return (
      <div className={styles.empty}>
        <span>Este nodo es un contenedor. Selecciona un nodo hijo.</span>
      </div>
    );
  }

  // Si es hoja sin contenido, mostrar mensaje de edición
  if (!content) {
    return (
      <div className={styles.empty}>
        <span>Edita el JSON en el editor para ver la preview</span>
      </div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <button
          type="button"
          className={styles.fullscreenBtn}
          onClick={() => setIsFullscreen(true)}
          title="Ver en pantalla completa (Esc para cerrar)"
        >
          ⛶
        </button>
        <LessonRenderer contenidoJson={content} />
      </div>

      {isFullscreen &&
        createPortal(
          <div className={styles.fullscreenOverlay}>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setIsFullscreen(false)}
              title="Cerrar (Esc)"
            >
              ✕
            </button>
            <div className={styles.fullscreenContent}>
              <LessonRenderer contenidoJson={content} />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
