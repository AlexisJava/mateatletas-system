'use client';

import { type ReactElement } from 'react';
import { Sparkles, Layers, Timer } from 'lucide-react';
import styles from './IntentTooltip.module.css';

export interface IntentTooltipProps {
  name: string;
  description: string;
  complexity?: 'basic' | 'intermediate' | 'advanced';
  estimatedTime?: string;
  position?: { x: number; y: number };
}

const complexityLabels: Record<string, string> = {
  basic: 'Básico',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

export function IntentTooltip({
  name,
  description,
  complexity = 'basic',
  estimatedTime = '~2 min',
  position,
}: IntentTooltipProps): ReactElement {
  const style = position ? { left: position.x, top: position.y } : undefined;

  return (
    <div className={styles.tooltip} style={style}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <Sparkles />
        </div>
        <h4 className={styles.headerTitle}>{name}</h4>
      </div>

      {/* Description */}
      <p className={styles.description}>{description}</p>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Meta */}
      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <Layers />
          <span>{complexityLabels[complexity]}</span>
        </div>
        <div className={styles.metaItem}>
          <Timer />
          <span>{estimatedTime}</span>
        </div>
      </div>

      {/* Shortcut */}
      <div className={styles.shortcut}>
        <span className={styles.shortcutLabel}>Insertar</span>
        <span className={styles.shortcutKey}>⏎ Enter</span>
      </div>
    </div>
  );
}
