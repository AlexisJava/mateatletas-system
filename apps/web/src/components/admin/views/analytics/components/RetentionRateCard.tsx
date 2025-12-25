'use client';

/**
 * RetentionRateCard - Card con gráfico circular de tasa de retención
 */

export function RetentionRateCard() {
  return (
    <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
      <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
        Tasa de Retencion Mensual
      </h3>
      <div className="flex items-center justify-center py-8">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="var(--admin-surface-2)"
              strokeWidth="12"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="var(--status-success)"
              strokeWidth="12"
              strokeDasharray={`${94.2 * 4.4} ${100 * 4.4}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-[var(--status-success)]">94.2%</span>
          </div>
        </div>
      </div>
      <p className="text-center text-sm text-[var(--admin-text-muted)]">
        Objetivo: 95% | Actual: 94.2%
      </p>
    </div>
  );
}

export default RetentionRateCard;
