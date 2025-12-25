'use client';

import { AlertItem } from './AlertItem';
import { formatCompactCurrency } from '@/lib/constants/admin-mock-data';

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
    <div>
      <h2 className="text-lg font-semibold text-[var(--admin-text)] mb-4">Alertas del sistema</h2>
      <div className="space-y-3">
        {ingresosPendientes > 0 && (
          <AlertItem
            type="warning"
            title={`${formatCompactCurrency(ingresosPendientes)} en pagos pendientes`}
            description="Revisar inscripciones sin confirmar pago"
            action="Ver finanzas"
            href="/admin/finanzas"
          />
        )}
        <AlertItem
          type="info"
          title="Colonia 2026 activa"
          description="Las inscripciones están abiertas"
          action="Ver productos"
          href="/admin/productos"
        />
        <AlertItem
          type="success"
          title="Sistema funcionando correctamente"
          description="Todos los servicios operativos"
        />
      </div>
    </div>
  );
}

export default AlertsPanel;
