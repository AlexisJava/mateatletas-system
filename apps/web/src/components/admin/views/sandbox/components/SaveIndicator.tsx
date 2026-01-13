'use client';

import type { SaveStatus } from '../types/sandbox.types';
import styles from './SaveIndicator.module.css';

interface SaveIndicatorProps {
  status: SaveStatus;
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
  if (status === 'idle') return null;

  const statusConfig: Record<SaveStatus, { text: string; className: string }> = {
    idle: { text: '', className: '' },
    saving: { text: 'Guardando...', className: styles.saving },
    saved: { text: 'Guardado', className: styles.saved },
    error: { text: 'Error al guardar', className: styles.error },
  };

  const config = statusConfig[status];

  return <span className={`${styles.indicator} ${config.className}`}>{config.text}</span>;
}
