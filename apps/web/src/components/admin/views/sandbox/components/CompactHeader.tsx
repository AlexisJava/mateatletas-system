'use client';

import { type ReactElement } from 'react';
import { Pencil, Check, Loader2, AlertTriangle } from 'lucide-react';
import type { SaveStatus } from '../context/SandboxContext';
import styles from './CompactHeader.module.css';

interface CompactHeaderProps {
  title: string;
  saveStatus: SaveStatus;
  onEditTitle?: () => void;
}

export function CompactHeader({
  title,
  saveStatus,
  onEditTitle,
}: CompactHeaderProps): ReactElement {
  const renderSaveStatus = (): ReactElement | null => {
    switch (saveStatus) {
      case 'saved':
        return (
          <div className={`${styles.saveStatus} ${styles.saveStatusSaved}`}>
            <Check />
            <span>Saved</span>
          </div>
        );
      case 'saving':
        return (
          <div className={`${styles.saveStatus} ${styles.saveStatusSaving}`}>
            <Loader2 />
            <span>Saving...</span>
          </div>
        );
      case 'error':
        return (
          <div className={`${styles.saveStatus} ${styles.saveStatusError}`}>
            <AlertTriangle />
            <span>Error</span>
          </div>
        );
      case 'idle':
      default:
        return null;
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.logo}>S</div>

        <div className={styles.titleGroup}>
          <h1 className={styles.title}>{title}</h1>
          {onEditTitle && (
            <button
              type="button"
              className={styles.editBtn}
              onClick={onEditTitle}
              aria-label="Editar título"
            >
              <Pencil />
            </button>
          )}
        </div>
      </div>

      <div className={styles.headerRight}>{renderSaveStatus()}</div>
    </header>
  );
}
