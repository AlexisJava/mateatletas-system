'use client';

import { FileCode2, Layers } from 'lucide-react';
import { PomodoroClock } from './PomodoroClock';
import { SaveIndicator } from './SaveIndicator';
import type { SaveStatus } from '../context/SandboxContext';
import styles from '../SandboxView.module.css';

type ContentType = 'microleccion' | 'planificacion';

interface CompactHeaderProps {
  title: string;
  contentType: ContentType;
  saveStatus: SaveStatus;
}

/**
 * CompactHeader - Displays content info, save status, and pomodoro timer
 * Replaces the greeting with actionable info about current work
 */
export function CompactHeader({
  title,
  contentType,
  saveStatus,
}: CompactHeaderProps): React.ReactElement {
  const isPlanificacion = contentType === 'planificacion';
  const IconComponent = isPlanificacion ? Layers : FileCode2;
  const badgeText = isPlanificacion ? 'Planificación' : 'Microlección';

  return (
    <header className={styles.compactHeader}>
      <div className={styles.headerLeft}>
        <div className={styles.contentBadge}>
          <IconComponent size={14} />
          <span>{badgeText}</span>
        </div>
        <h1 className={styles.contentTitle}>{title}</h1>
        <SaveIndicator status={saveStatus} />
      </div>
      <div className={styles.headerRight}>
        <PomodoroClock />
      </div>
    </header>
  );
}
