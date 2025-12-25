'use client';

import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { MOCK_CASA_DISTRIBUTION } from '@/lib/constants/admin-mock-data';

/**
 * CasaDistributionChart - Gráfico de distribución por casa
 *
 * Muestra un PieChart con la distribución de estudiantes por casa.
 */

export function CasaDistributionChart() {
  return (
    <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--admin-text)]">Distribución por Casa</h2>
        <Link
          href="/admin/analytics"
          className="text-xs text-[var(--admin-accent)] hover:underline"
        >
          Ver análisis
        </Link>
      </div>
      <div className="flex items-center gap-8">
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={MOCK_CASA_DISTRIBUTION}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={60}
                dataKey="value"
                strokeWidth={0}
              >
                {MOCK_CASA_DISTRIBUTION.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-3">
          {MOCK_CASA_DISTRIBUTION.map((casa) => (
            <div key={casa.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: casa.color }} />
                <span className="text-sm text-[var(--admin-text)]">{casa.name}</span>
              </div>
              <span className="text-sm font-semibold text-[var(--admin-text)]">{casa.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CasaDistributionChart;
