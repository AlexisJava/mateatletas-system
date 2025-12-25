'use client';

import { useMemo, useCallback } from 'react';
import {
  AreaChart,
  Area,
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
 * AdminAreaChart - Grafico de areas reutilizable
 *
 * Soporta areas apiladas con gradientes.
 */

interface AreaConfig {
  dataKey: string;
  name: string;
  color?: string;
  stackId?: string;
  fillOpacity?: number;
}

interface AdminAreaChartProps<T extends Record<string, unknown>> {
  data: T[];
  xKey: keyof T & string;
  areas: AreaConfig[];
  height?: number;
  formatValue?: (value: number) => string;
  showLegend?: boolean;
  showGrid?: boolean;
}

export function AdminAreaChart<T extends Record<string, unknown>>({
  data,
  xKey,
  areas,
  height = 300,
  formatValue,
  showLegend = false,
  showGrid = true,
}: AdminAreaChartProps<T>) {
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
        <AreaChart data={memoizedData}>
          <defs>
            {areas.map((area, index) => {
              const color = area.color || CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length];
              return (
                <linearGradient
                  key={`gradient-${area.dataKey}`}
                  id={`gradient-${area.dataKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />}
          <XAxis dataKey={xKey} stroke={CHART_TEXT_COLOR} fontSize={12} />
          <YAxis stroke={CHART_TEXT_COLOR} fontSize={12} tickFormatter={tickFormatter} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: 'var(--admin-text)' }}
            formatter={tooltipFormatter}
          />
          {showLegend && <Legend />}
          {areas.map((area, index) => {
            const color = area.color || CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length];
            return (
              <Area
                key={area.dataKey}
                type="monotone"
                dataKey={area.dataKey}
                name={area.name}
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${area.dataKey})`}
                stackId={area.stackId}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AdminAreaChart;
