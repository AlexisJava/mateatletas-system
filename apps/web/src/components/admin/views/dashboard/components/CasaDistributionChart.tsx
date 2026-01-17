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
  const total = distribucion.Quantum + distribucion.Vertex + distribucion.Pulsar;

  // Si no hay datos, mostrar distribución equitativa para que se vea el gráfico
  const chartData =
    total === 0
      ? [
          { name: 'Quantum', value: 1, color: CASA_COLORS.Quantum },
          { name: 'Vertex', value: 1, color: CASA_COLORS.Vertex },
          { name: 'Pulsar', value: 1, color: CASA_COLORS.Pulsar },
        ]
      : [
          { name: 'Quantum', value: distribucion.Quantum, color: CASA_COLORS.Quantum },
          { name: 'Vertex', value: distribucion.Vertex, color: CASA_COLORS.Vertex },
          { name: 'Pulsar', value: distribucion.Pulsar, color: CASA_COLORS.Pulsar },
        ];

  return (
    <div className="h-[300px] p-3 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)] flex flex-col">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h2 className="text-base font-semibold text-[var(--admin-text)]">Distribución por Casa</h2>
        <Link
          href="/admin/analytics"
          className="text-xs text-[var(--admin-accent)] hover:underline"
        >
          Ver análisis
        </Link>
      </div>
      <div className="flex-1 flex items-center gap-3 min-h-0 overflow-hidden">
        <div className="aspect-square h-full max-h-20 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={40}
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
        <div className="flex-1 flex flex-col justify-center gap-1 min-h-0 overflow-hidden">
          {[
            { name: 'Quantum', value: distribucion.Quantum, color: CASA_COLORS.Quantum },
            { name: 'Vertex', value: distribucion.Vertex, color: CASA_COLORS.Vertex },
            { name: 'Pulsar', value: distribucion.Pulsar, color: CASA_COLORS.Pulsar },
          ].map((casa) => (
            <div key={casa.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: casa.color }}
                />
                <span className="text-sm text-[var(--admin-text)]">{casa.name}</span>
              </div>
              <div className="flex items-center gap-1">
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
