'use client';

import { type ReactElement } from 'react';
import { XCircle, Wand2 } from 'lucide-react';
import styles from './JsonErrorPanel.module.css';

export interface JsonError {
  message: string;
  line?: number;
  column?: number;
}

export interface JsonErrorPanelProps {
  error: JsonError;
  onQuickFix?: () => void;
  inline?: boolean;
}

export function JsonErrorPanel({ error, onQuickFix, inline }: JsonErrorPanelProps): ReactElement {
  const locationText = error.line
    ? error.column
      ? `Line ${error.line}, Col ${error.column}`
      : `Line ${error.line}`
    : undefined;

  return (
    <div className={`${styles.panel} ${inline ? styles.inline : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <XCircle />
        </div>
        <div className={styles.headerContent}>
          <h4 className={styles.headerTitle}>Syntax Error</h4>
          {locationText && <span className={styles.headerSubtitle}>{locationText}</span>}
        </div>
      </div>

      {/* Description */}
      <p className={styles.description}>{error.message}</p>

      {/* Actions */}
      {onQuickFix && (
        <div className={styles.actions}>
          <button type="button" className={styles.fixBtn} onClick={onQuickFix}>
            <Wand2 />
            <span>Quick Fix</span>
          </button>
          <span className={styles.shortcut}>⌘ + .</span>
        </div>
      )}
    </div>
  );
}
