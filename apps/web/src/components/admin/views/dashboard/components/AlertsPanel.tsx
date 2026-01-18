'use client';

import { AlertItem } from './AlertItem';
import { formatCompactCurrency } from '@/lib/utils/format';

/**
 * AlertsPanel - Panel de alertas del sistema
 *
 * Muestra alertas de pagos pendientes, estado del sistema, etc.
 */

interface AlertsPanelProps {
  ingresosPendientes: number;
}

export function AlertsPanel({ ingresosPendientes }: AlertsPanelProps) {
  return (
    <div className="h-full p-3 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)] flex flex-col overflow-hidden">
      <h2 className="text-base font-semibold text-[var(--admin-text)] mb-2 flex-shrink-0">
        Alertas del sistema
      </h2>
      <div className="flex-1 space-y-2 overflow-y-auto min-h-0">
        {ingresosPendientes > 0 ? (
          <AlertItem
            type="warning"
            title={`${formatCompactCurrency(ingresosPendientes)} en pagos pendientes`}
            description="Revisar inscripciones sin confirmar pago"
            action="Ver finanzas"
            href="/admin/finanzas"
          />
        ) : (
          <AlertItem
            type="success"
            title="Sin pagos pendientes"
            description="Todos los pagos están al día"
          />
        )}
      </div>
    </div>
  );
}
