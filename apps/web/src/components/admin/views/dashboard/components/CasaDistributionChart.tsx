'use client';

import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

/**
 * CasaDistributionChart - Gráfico de distribución por casa
 *
 * Conectado al backend: recibe datos de useDashboardStats
 * Muestra un PieChart con la distribución de estudiantes por casa.
 */

interface CasaDistributionChartProps {
  distribucion: {
    Quantum: number;
    Vertex: number;
    Pulsar: number;
  };
}

// Colores oficiales de cada casa
const CASA_COLORS: Record<string, string> = {
  Quantum: '#00D4FF',
  Vertex: '#FF6B6B',
  Pulsar: '#FFD93D',
};

export function CasaDistributionChart({ distribucion }: CasaDistributionChartProps) {
  // Convertir objeto a array para el gráfico
  const chartData = [
    { name: 'Quantum', value: distribucion.Quantum, color: CASA_COLORS.Quantum },
    { name: 'Vertex', value: distribucion.Vertex, color: CASA_COLORS.Vertex },
    { name: 'Pulsar', value: distribucion.Pulsar, color: CASA_COLORS.Pulsar },
  ];

  const total = chartData.reduce((sum, casa) => sum + casa.value, 0);

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
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={60}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-3">
          {chartData.map((casa) => (
            <div key={casa.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: casa.color }} />
                <span className="text-sm text-[var(--admin-text)]">{casa.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--admin-text)]">{casa.value}</span>
                {total > 0 && (
                  <span className="text-xs text-[var(--admin-text-muted)]">
                    ({Math.round((casa.value / total) * 100)}%)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CasaDistributionChart;
