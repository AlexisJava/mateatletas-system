'use client';

/**
 * ChartTooltip - Estilos de tooltip consistentes para Recharts
 *
 * Usa CSS variables para theming.
 */

export const TOOLTIP_STYLE = {
  backgroundColor: 'var(--admin-surface-2)',
  border: '1px solid var(--admin-border)',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
} as const;

export const TOOLTIP_LABEL_STYLE = {
  color: 'var(--admin-text)',
  fontWeight: 600,
  marginBottom: '4px',
} as const;

export const TOOLTIP_ITEM_STYLE = {
  color: 'var(--admin-text-muted)',
  fontSize: '14px',
} as const;

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
  formatter?: (value: number, name: string) => string;
}

export function CustomTooltip({ active, payload, label, formatter }: TooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="p-3 rounded-lg shadow-lg"
      style={{
        backgroundColor: 'var(--admin-surface-2)',
        border: '1px solid var(--admin-border)',
      }}
    >
      {label && <p className="text-sm font-semibold text-[var(--admin-text)] mb-2">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[var(--admin-text-muted)]">{entry.name}:</span>
            <span className="font-medium text-[var(--admin-text)]">
              {formatter ? formatter(entry.value, entry.name) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomTooltip;
