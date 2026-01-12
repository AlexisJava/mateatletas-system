'use client';

import { LessonRenderer } from '@/components/lesson-renderer';
import styles from './PreviewPanel.module.css';

interface PreviewPanelProps {
  content: string;
  nodoId: string | null;
}

export function PreviewPanel({ content, nodoId }: PreviewPanelProps) {
  if (!nodoId) {
    return (
      <div className={styles.empty}>
        <span>Selecciona un nodo para previsualizar</span>
      </div>
    );
  }

  if (!content) {
    return (
      <div className={styles.empty}>
        <span>Este nodo es un contenedor (sin contenidoJson)</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <LessonRenderer contenidoJson={content} />
    </div>
  );
}
