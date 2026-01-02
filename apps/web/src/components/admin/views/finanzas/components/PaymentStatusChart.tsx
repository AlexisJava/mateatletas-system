'use client';

import { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { getPaymentStatusDistribution, type PaymentStatusDistribution } from '@/lib/api/admin.api';

/**
 * PaymentStatusChart - Gráfico de estados de pago
 *
 * PieChart con distribución de pagados/pendientes/vencidos.
 * Conectado al backend: GET /pagos/dashboard/metricas
 */

// Mapeo de estados a colores
const STATUS_COLORS: Record<string, string> = {
  PAGADO: 'var(--status-success)',
  PENDIENTE: 'var(--status-warning)',
  VENCIDO: 'var(--status-danger)',
  CANCELADO: 'var(--admin-text-muted)',
};

// Mapeo de estados a nombres legibles
const STATUS_LABELS: Record<string, string> = {
  PAGADO: 'Pagados',
  PENDIENTE: 'Pendientes',
  VENCIDO: 'Vencidos',
  CANCELADO: 'Cancelados',
};

// Mock data para fallback
const MOCK_DATA = [
  { name: 'Pagados', value: 65, color: 'var(--status-success)' },
  { name: 'Pendientes', value: 25, color: 'var(--status-warning)' },
  { name: 'Vencidos', value: 10, color: 'var(--status-danger)' },
];

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export function PaymentStatusChart() {
  const [data, setData] = useState<ChartData[]>(MOCK_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const distribution = await getPaymentStatusDistribution();
        const chartData = distribution.map((item) => ({
          name: STATUS_LABELS[item.estado] ?? item.estado,
          value: item.porcentaje,
          color: STATUS_COLORS[item.estado] ?? 'var(--admin-text-muted)',
        }));
        setData(chartData.length > 0 ? chartData : MOCK_DATA);
        setError(null);
      } catch (err) {
        console.warn('PaymentStatusChart: Usando datos mock por error:', err);
        setError('Usando datos de ejemplo');
        setData(MOCK_DATA);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
      <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-[var(--admin-accent-secondary)]" />
        Estados de Pago
      </h3>

      {error && <div className="mb-2 text-xs text-yellow-400">{error}</div>}

      {isLoading ? (
        <div className="h-72 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                strokeWidth={0}
                label={({ value }) => `${value}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
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
      )}
    </div>
  );
}

export default PaymentStatusChart;
