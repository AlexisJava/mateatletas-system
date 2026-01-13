'use client';

import { useState, useEffect } from 'react';
import styles from '../SandboxView.module.css';

const POMODORO_DURATION_MINUTES = 25;
const UPDATE_INTERVAL_MS = 1000;

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * PomodoroClock - Displays current time with break indicator
 * Shows visual feedback when 25 minutes have passed since session start
 */
export function PomodoroClock(): React.ReactElement {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const [sessionStart] = useState<Date>(() => new Date());
  const [needsBreak, setNeedsBreak] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const minutesWorked = Math.floor(
        (now.getTime() - sessionStart.getTime()) / (UPDATE_INTERVAL_MS * 60),
      );
      setNeedsBreak(minutesWorked >= POMODORO_DURATION_MINUTES);
    }, UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [sessionStart]);

  const clockClasses = [styles.pomodoroClock, needsBreak ? styles.pomodoroClockNeedsBreak : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={clockClasses}>
      <div className={styles.clockIndicator} />
      <span className={styles.clockTime}>{formatTime(currentTime)}</span>
      {needsBreak && <span className={styles.breakHint}>Descanso</span>}
    </div>
  );
}
