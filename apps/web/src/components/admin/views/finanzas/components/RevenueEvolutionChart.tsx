'use client';

import { TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  MOCK_REVENUE_DATA,
  formatCurrency,
  formatCompactCurrency,
} from '@/lib/constants/admin-mock-data';

/**
 * RevenueEvolutionChart - Gráfico de evolución de ingresos
 *
 * BarChart con ingresos y pendientes mensuales.
 */

export function RevenueEvolutionChart() {
  return (
    <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
      <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-[var(--status-success)]" />
        Evolucion Mensual
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MOCK_REVENUE_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
            <XAxis dataKey="month" stroke="var(--admin-text-muted)" fontSize={12} />
            <YAxis
              stroke="var(--admin-text-muted)"
              fontSize={12}
              tickFormatter={(value) => formatCompactCurrency(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--admin-surface-2)',
                border: '1px solid var(--admin-border)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'var(--admin-text)' }}
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === 'ingresos' ? 'Ingresos' : 'Pendientes',
              ]}
            />
            <Bar dataKey="ingresos" fill="var(--status-success)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pendientes" fill="var(--status-warning)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RevenueEvolutionChart;
