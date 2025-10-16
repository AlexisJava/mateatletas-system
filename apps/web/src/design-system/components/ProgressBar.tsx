'use client';

import { motion } from 'framer-motion';
import { useCurrentTheme } from '../themes';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  height?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

/**
 * 🎨 ProgressBar - Barra de progreso con gradiente temático
 *
 * Uso:
 * <ProgressBar value={75} label="Nivel 5" showPercentage />
 */
export function ProgressBar({
  value,
  label,
  showPercentage = false,
  height = 'md',
  animated = true,
}: ProgressBarProps) {
  const theme = useCurrentTheme();

  const heights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-white/80">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-semibold text-white">{clampedValue}%</span>
          )}
        </div>
      )}

      <div className={`w-full ${heights[height]} bg-white/10 rounded-full overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: animated ? `${clampedValue}%` : `${clampedValue}%` }}
          transition={{ duration: animated ? 1.5 : 0, ease: 'easeOut' }}
          className={`${heights[height]} ${theme.gradientCard} rounded-full`}
        />
      </div>
    </div>
  );
}
