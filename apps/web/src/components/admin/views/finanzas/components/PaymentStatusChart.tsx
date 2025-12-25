'use client';

import { CreditCard } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

/**
 * PaymentStatusChart - Gráfico de estados de pago
 *
 * PieChart con distribución de pagados/pendientes/vencidos.
 */

const PAYMENT_STATUS_DATA = [
  { name: 'Pagados', value: 65, color: 'var(--status-success)' },
  { name: 'Pendientes', value: 25, color: 'var(--status-warning)' },
  { name: 'Vencidos', value: 10, color: 'var(--status-danger)' },
];

export function PaymentStatusChart() {
  return (
    <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
      <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-[var(--admin-accent-secondary)]" />
        Estados de Pago
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={PAYMENT_STATUS_DATA}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              dataKey="value"
              strokeWidth={0}
              label
              labelLine={false}
            >
              {PAYMENT_STATUS_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend
              formatter={(value) => (
                <span className="text-[var(--admin-text-muted)] text-sm">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PaymentStatusChart;
