'use client';

import styles from '../SandboxView.module.css';

/**
 * SandboxLoading - Loading state for Sandbox view
 * Shows a spinner and loading message
 */
export function SandboxLoading(): React.ReactElement {
  return (
    <div className={styles.loading}>
      <div className={styles.loadingSpinner} />
      <p>Cargando Sandbox...</p>
    </div>
  );
}
