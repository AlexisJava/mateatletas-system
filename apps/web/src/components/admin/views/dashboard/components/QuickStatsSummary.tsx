'use client';

/**
 * QuickStatsSummary - Resumen rápido de estadísticas
 *
 * Muestra métricas clave en formato compacto.
 */

interface QuickStatsSummaryProps {
  tasaCobro: number;
  estudiantesActivos: number;
  crecimientoMensual: number;
}

export function QuickStatsSummary({
  tasaCobro,
  estudiantesActivos,
  crecimientoMensual,
}: QuickStatsSummaryProps) {
  return (
    <div className="p-4 rounded-xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
      <h3 className="text-sm font-semibold text-[var(--admin-text)] mb-3">Resumen rápido</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--admin-text-muted)]">Tasa de cobro</span>
          <span className="text-sm font-medium text-[var(--status-success)]">{tasaCobro}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--admin-text-muted)]">Estudiantes activos</span>
          <span className="text-sm font-medium text-[var(--admin-text)]">{estudiantesActivos}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--admin-text-muted)]">Crecimiento mensual</span>
          <span className="text-sm font-medium text-[var(--status-success)]">
            +{crecimientoMensual}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default QuickStatsSummary;
