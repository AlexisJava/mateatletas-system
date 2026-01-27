'use client';

import type { ReactElement } from 'react';
import styles from './BackgroundGlows.module.css';

/**
 * BackgroundGlows - Ambient gradient ellipses for glassmorphism effect
 *
 * Creates two radial gradients:
 * - Violet glow: top-left corner
 * - Cyan glow: bottom-right corner
 *
 * Used as background layer in all sandbox screens.
 */
export function BackgroundGlows(): ReactElement {
  return (
    <div className={styles.container} aria-hidden="true">
      <div className={styles.glowViolet} />
      <div className={styles.glowCyan} />
    </div>
  );
}
