'use client';

import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MOCK_REVENUE_DATA, formatCompactCurrency } from '@/lib/constants/admin-mock-data';

/**
 * RevenueChart - Gráfico de evolución de ingresos
 *
 * Muestra un AreaChart con los ingresos mensuales.
 */

export function RevenueChart() {
  return (
    <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--admin-text)]">Evolución de Ingresos</h2>
        <Link href="/admin/finanzas" className="text-xs text-[var(--admin-accent)] hover:underline">
          Ver detalle
        </Link>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_REVENUE_DATA}>
            <defs>
              <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--status-success)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--status-success)" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              formatter={(value: number) => [formatCompactCurrency(value), 'Ingresos']}
            />
            <Area
              type="monotone"
              dataKey="ingresos"
              stroke="var(--status-success)"
              strokeWidth={2}
              fill="url(#colorIngresos)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RevenueChart;
