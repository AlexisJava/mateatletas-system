'use client';

import { TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatCompactCurrency } from '@/lib/constants/admin-mock-data';
import { useRevenueData } from '../hooks/useRevenueData';

/**
 * RevenueEvolutionChart - Gráfico de evolución de ingresos
 *
 * Conectado al backend: GET /admin/pagos/historico-mensual
 * BarChart con ingresos y pendientes mensuales.
 */

export function RevenueEvolutionChart() {
  const { data, isLoading, error } = useRevenueData(6);

  return (
    <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
      <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-[var(--status-success)]" />
        Evolucion Mensual
        {error && (
          <span className="text-xs text-[var(--status-warning)] font-normal" title={error}>
            (mock)
          </span>
        )}
      </h3>
      <div className="h-72">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-[var(--admin-text-muted)]">
            Cargando...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
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
        )}
      </div>
    </div>
  );
}

export default RevenueEvolutionChart;
