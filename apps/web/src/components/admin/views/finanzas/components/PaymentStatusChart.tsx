'use client';

import { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { getPaymentStatusDistribution } from '@/lib/api/admin.api';

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

type ChartData = Record<string, string | number>;

export function PaymentStatusChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const distribution = await getPaymentStatusDistribution();
      const chartData = distribution.map((item) => ({
        name: STATUS_LABELS[item.estado] ?? item.estado,
        value: item.porcentaje,
        color: STATUS_COLORS[item.estado] ?? 'var(--admin-text-muted)',
      }));
      setData(chartData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar estados de pago';
      setError(message);
      console.error('PaymentStatusChart: Error al cargar:', message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
      <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-[var(--admin-accent-secondary)]" />
        Estados de Pago
      </h3>

      {isLoading ? (
        <div className="h-72 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="h-72 flex flex-col items-center justify-center">
          <p className="text-[var(--status-danger)] text-sm mb-3">Error al cargar datos</p>
          <button
            onClick={fetchData}
            className="px-3 py-1.5 text-sm bg-[var(--admin-surface-2)] rounded-lg hover:bg-[var(--admin-surface-1)] border border-[var(--admin-border)] transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : data.length === 0 ? (
        <div className="h-72 flex items-center justify-center">
          <p className="text-[var(--admin-text-muted)] text-sm">Sin datos de pagos</p>
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
                  <Cell key={`cell-${index}`} fill={entry.color as string} />
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
