'use client';

import { useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TOOLTIP_STYLE } from './ChartTooltip';
import { CHART_GRID_COLOR, CHART_TEXT_COLOR, CHART_COLOR_PALETTE } from './chart-colors';

/**
 * AdminBarChart - Grafico de barras reutilizable
 *
 * Soporta multiples barras con colores via CSS vars.
 */

interface BarConfig {
  dataKey: string;
  name: string;
  color?: string;
  stackId?: string;
}

interface AdminBarChartProps<T extends Record<string, unknown>> {
  data: T[];
  xKey: keyof T & string;
  bars: BarConfig[];
  height?: number;
  formatValue?: (value: number) => string;
  layout?: 'horizontal' | 'vertical';
  showLegend?: boolean;
  showGrid?: boolean;
}

export function AdminBarChart<T extends Record<string, unknown>>({
  data,
  xKey,
  bars,
  height = 300,
  formatValue,
  layout = 'horizontal',
  showLegend = false,
  showGrid = true,
}: AdminBarChartProps<T>) {
  const memoizedData = useMemo(() => data, [data]);

  const tickFormatter = useCallback(
    (value: number) => (formatValue ? formatValue(value) : String(value)),
    [formatValue],
  );

  const tooltipFormatter = useCallback(
    (value: number, name: string) => [formatValue ? formatValue(value) : value, name],
    [formatValue],
  );

  const isVertical = layout === 'vertical';

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={memoizedData} layout={layout}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />}
          {isVertical ? (
            <>
              <XAxis
                type="number"
                stroke={CHART_TEXT_COLOR}
                fontSize={12}
                tickFormatter={tickFormatter}
              />
              <YAxis
                dataKey={xKey}
                type="category"
                stroke={CHART_TEXT_COLOR}
                fontSize={12}
                width={100}
              />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} stroke={CHART_TEXT_COLOR} fontSize={12} />
              <YAxis stroke={CHART_TEXT_COLOR} fontSize={12} tickFormatter={tickFormatter} />
            </>
          )}
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: 'var(--admin-text)' }}
            formatter={tooltipFormatter}
          />
          {showLegend && (
            <Legend
              formatter={(value) => (
                <span className="text-[var(--admin-text-muted)] text-sm">{value}</span>
              )}
            />
          )}
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color || CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length]}
              radius={isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              stackId={bar.stackId}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AdminBarChart;
