'use client';

import { useTierDistribution } from '../hooks';

/**
 * TierDistributionCard - Distribución de estudiantes por tier/plan
 *
 * Muestra un mini gráfico de barras horizontales con la cantidad
 * de estudiantes en cada tier: Libros, Asincrónico, Sincrónico.
 */

// Colores y labels para cada tier
const TIER_CONFIG = {
  STEAM_SINCRONICO: {
    label: 'Sincrónico',
    color: '#10b981', // green-500
    bgColor: 'bg-emerald-500',
  },
  STEAM_ASINCRONICO: {
    label: 'Asincrónico',
    color: '#3b82f6', // blue-500
    bgColor: 'bg-blue-500',
  },
  STEAM_LIBROS: {
    label: 'Libros',
    color: '#8b5cf6', // violet-500
    bgColor: 'bg-violet-500',
  },
  SIN_PLAN: {
    label: 'Sin plan',
    color: '#6b7280', // gray-500
    bgColor: 'bg-gray-500',
  },
} as const;

export function TierDistributionCard() {
  const { distribution, isLoading, error } = useTierDistribution();

  if (isLoading) {
    return (
      <div className="p-4 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)] h-full">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-[var(--admin-surface-2)] rounded w-1/2" />
          <div className="space-y-2">
            <div className="h-6 bg-[var(--admin-surface-2)] rounded" />
            <div className="h-6 bg-[var(--admin-surface-2)] rounded" />
            <div className="h-6 bg-[var(--admin-surface-2)] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !distribution) {
    return (
      <div className="p-4 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)] h-full flex items-center justify-center">
        <p className="text-sm text-[var(--admin-text-muted)]">Error al cargar</p>
      </div>
    );
  }

  const total = distribution.total || 1; // Evitar división por 0
  const tiers: Array<{ key: keyof typeof TIER_CONFIG; value: number }> = [
    { key: 'STEAM_SINCRONICO', value: distribution.STEAM_SINCRONICO },
    { key: 'STEAM_ASINCRONICO', value: distribution.STEAM_ASINCRONICO },
    { key: 'STEAM_LIBROS', value: distribution.STEAM_LIBROS },
  ];

  // Solo mostrar SIN_PLAN si hay estudiantes sin plan
  if (distribution.SIN_PLAN > 0) {
    tiers.push({ key: 'SIN_PLAN', value: distribution.SIN_PLAN });
  }

  return (
    <div className="p-4 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)] h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-[var(--admin-text)]">Por Tier</h3>
        <span className="text-xs text-[var(--admin-text-muted)]">{distribution.total} total</span>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-2">
        {tiers.map(({ key, value }) => {
          const config = TIER_CONFIG[key];
          const percentage = Math.round((value / total) * 100);

          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--admin-text-muted)]">{config.label}</span>
                <span className="text-[var(--admin-text)] font-medium">
                  {value} <span className="text-[var(--admin-text-muted)]">({percentage}%)</span>
                </span>
              </div>
              <div className="h-2 bg-[var(--admin-surface-2)] rounded-full overflow-hidden">
                <div
                  className={`h-full ${config.bgColor} rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TierDistributionCard;
