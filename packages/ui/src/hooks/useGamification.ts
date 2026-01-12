/**
 * Hook: useGamification
 *
 * Hook headless para manejar XP, niveles y logros.
 * Sistema de gamificación educativa.
 */

import { useState, useCallback, useMemo } from 'react';

export interface UseGamificationOptions {
  /** XP inicial */
  initialXp?: number;
  /** Nivel inicial */
  initialLevel?: number;
  /** XP requerido por nivel (default: 100) */
  xpPerLevel?: number;
  /** Callback al subir de nivel */
  onLevelUp?: (newLevel: number) => void;
  /** Callback al desbloquear logro */
  onAchievement?: (achievementId: string) => void;
}

export interface UseGamificationReturn {
  /** XP total acumulado */
  xp: number;
  /** Nivel actual */
  level: number;
  /** XP necesario para el siguiente nivel */
  xpToNextLevel: number;
  /** Progreso hacia el siguiente nivel (0-100) */
  xpProgress: number;
  /** Agregar XP */
  addXp: (amount: number) => void;
  /** Lista de logros desbloqueados */
  achievements: string[];
  /** Desbloquear un logro */
  unlockAchievement: (id: string) => void;
  /** Verificar si un logro está desbloqueado */
  hasAchievement: (id: string) => boolean;
}

export function useGamification(options: UseGamificationOptions = {}): UseGamificationReturn {
  const { initialXp = 0, initialLevel = 1, xpPerLevel = 100, onLevelUp, onAchievement } = options;

  const [xp, setXp] = useState(initialXp);
  const [level, setLevel] = useState(initialLevel);
  const [achievements, setAchievements] = useState<string[]>([]);

  // Calcular XP del nivel actual y progreso
  const { xpToNextLevel, xpProgress } = useMemo(() => {
    const xpForCurrentLevel = (level - 1) * xpPerLevel;
    const xpInCurrentLevel = xp - xpForCurrentLevel;
    const progress = Math.min(100, (xpInCurrentLevel / xpPerLevel) * 100);
    const toNext = xpPerLevel - xpInCurrentLevel;

    return {
      xpToNextLevel: Math.max(0, toNext),
      xpProgress: Math.max(0, progress),
    };
  }, [xp, level, xpPerLevel]);

  const addXp = useCallback(
    (amount: number) => {
      if (amount <= 0) return;

      setXp((prevXp) => {
        const newXp = prevXp + amount;
        const newLevel = Math.floor(newXp / xpPerLevel) + 1;

        if (newLevel > level) {
          setLevel(newLevel);
          onLevelUp?.(newLevel);
        }

        return newXp;
      });
    },
    [xpPerLevel, level, onLevelUp],
  );

  const unlockAchievement = useCallback(
    (id: string) => {
      setAchievements((prev) => {
        if (prev.includes(id)) return prev;
        onAchievement?.(id);
        return [...prev, id];
      });
    },
    [onAchievement],
  );

  const hasAchievement = useCallback((id: string) => achievements.includes(id), [achievements]);

  return {
    xp,
    level,
    xpToNextLevel,
    xpProgress,
    addXp,
    achievements,
    unlockAchievement,
    hasAchievement,
  } as const;
}
