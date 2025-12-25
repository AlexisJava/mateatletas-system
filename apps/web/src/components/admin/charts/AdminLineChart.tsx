'use client';

import { useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
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
 * AdminLineChart - Grafico de lineas reutilizable
 *
 * Soporta multiples lineas con colores via CSS vars.
 */

interface LineConfig {
  dataKey: string;
  name: string;
  color?: string;
  strokeWidth?: number;
  dot?: boolean;
}

interface AdminLineChartProps<T extends Record<string, unknown>> {
  data: T[];
  xKey: keyof T & string;
  lines: LineConfig[];
  height?: number;
  formatValue?: (value: number) => string;
  showLegend?: boolean;
  showGrid?: boolean;
}

export function AdminLineChart<T extends Record<string, unknown>>({
  data,
  xKey,
  lines,
  height = 300,
  formatValue,
  showLegend = true,
  showGrid = true,
}: AdminLineChartProps<T>) {
  const memoizedData = useMemo(() => data, [data]);

  const tickFormatter = useCallback(
    (value: number) => (formatValue ? formatValue(value) : String(value)),
    [formatValue],
  );

  const tooltipFormatter = useCallback(
    (value: number, name: string) => [formatValue ? formatValue(value) : value, name],
    [formatValue],
  );

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={memoizedData}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />}
          <XAxis dataKey={xKey} stroke={CHART_TEXT_COLOR} fontSize={12} />
          <YAxis stroke={CHART_TEXT_COLOR} fontSize={12} tickFormatter={tickFormatter} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: 'var(--admin-text)' }}
            formatter={tooltipFormatter}
          />
          {showLegend && <Legend />}
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color || CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length]}
              strokeWidth={line.strokeWidth || 2}
              dot={
                line.dot !== false
                  ? {
                      fill: line.color || CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
                      strokeWidth: 0,
                    }
                  : false
              }
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AdminLineChart;
