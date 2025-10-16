'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useCurrentTheme } from '../themes';
import CountUp from 'react-countup';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: LucideIcon;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  animateValue?: boolean;
  delay?: number;
}

/**
 * 🎨 StatCard - Tarjeta de estadística con animación
 *
 * Uso:
 * <StatCard
 *   title="Puntos"
 *   value={1250}
 *   icon={Trophy}
 *   animateValue
 * />
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  animateValue = false,
  delay = 0,
}: StatCardProps) {
  const theme = useCurrentTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className={`
        ${theme.glassBg} ${theme.glassBorder}
        rounded-2xl p-6 shadow-xl
        ${theme.glassHover}
        transition-all duration-300
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white/70 text-sm font-medium mb-1">{title}</p>
          <div className="text-3xl font-bold">
            {animateValue && typeof value === 'number' ? (
              <CountUp end={value} duration={2} delay={delay} />
            ) : (
              value
            )}
          </div>
          {subtitle && <p className="text-white/60 text-xs mt-1">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${theme.gradientCard}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-1">
          <span
            className={`text-sm font-semibold ${
              trend.isPositive ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-white/60 text-xs">vs. semana pasada</span>
        </div>
      )}
    </motion.div>
  );
}
