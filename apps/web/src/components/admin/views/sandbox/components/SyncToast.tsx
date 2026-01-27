'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { Cloud, Check, AlertTriangle, X } from 'lucide-react';
import styles from './SyncToast.module.css';

export type SyncStatus = 'syncing' | 'success' | 'error';

export interface SyncToastProps {
  status: SyncStatus;
  title?: string;
  description?: string;
  autoHide?: boolean;
  autoHideDelay?: number;
  onClose?: () => void;
}

const defaultTitles: Record<SyncStatus, string> = {
  syncing: 'Sincronizando cambios',
  success: 'Cambios guardados',
  error: 'Error al guardar',
};

const defaultDescriptions: Record<SyncStatus, string> = {
  syncing: 'Tus cambios se guardarán automáticamente',
  success: 'Todos los cambios están sincronizados',
  error: 'No se pudieron guardar los cambios',
};

const statusIcons: Record<SyncStatus, React.ComponentType<{ className?: string }>> = {
  syncing: Cloud,
  success: Check,
  error: AlertTriangle,
};

export function SyncToast({
  status,
  title,
  description,
  autoHide = true,
  autoHideDelay = 3000,
  onClose,
}: SyncToastProps): ReactElement | null {
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHide && status !== 'syncing') {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setIsVisible(false);
          onClose?.();
        }, 200);
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, status, onClose]);

  // Reset visibility when status changes
  useEffect(() => {
    setIsVisible(true);
    setIsExiting(false);
  }, [status]);

  if (!isVisible) return null;

  const StatusIcon = statusIcons[status];
  const displayTitle = title ?? defaultTitles[status];
  const displayDescription = description ?? defaultDescriptions[status];

  const handleClose = (): void => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 200);
  };

  return (
    <div className={`${styles.toast} ${isExiting ? styles.exiting : ''}`}>
      <div className={`${styles.icon} ${styles[status]}`}>
        <StatusIcon />
      </div>
      <div className={styles.content}>
        <h4 className={styles.title}>{displayTitle}</h4>
        <p className={styles.description}>{displayDescription}</p>
      </div>
      {onClose && (
        <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="Cerrar">
          <X />
        </button>
      )}
    </div>
  );
}
