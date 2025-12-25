'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TOOLTIP_STYLE } from './ChartTooltip';
import { CHART_COLOR_PALETTE } from './chart-colors';

/**
 * AdminPieChart - Grafico circular reutilizable
 *
 * Soporta pie y doughnut (innerRadius > 0).
 */

interface PieDataItem {
  name: string;
  value: number;
  color?: string;
}

interface AdminPieChartProps {
  data: PieDataItem[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  showLabels?: boolean;
  formatValue?: (value: number) => string;
}

export function AdminPieChart({
  data,
  height = 300,
  innerRadius = 0,
  outerRadius = 80,
  showLegend = true,
  showLabels = false,
  formatValue,
}: AdminPieChartProps) {
  const memoizedData = useMemo(() => data, [data]);

  const colors = useMemo(
    () =>
      data.map(
        (item, index) => item.color || CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      ),
    [data],
  );

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={memoizedData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            nameKey="name"
            strokeWidth={0}
            label={showLabels}
            labelLine={showLabels}
          >
            {memoizedData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value: number, name: string) => [
              formatValue ? formatValue(value) : value,
              name,
            ]}
          />
          {showLegend && (
            <Legend
              formatter={(value) => (
                <span className="text-[var(--admin-text-muted)] text-sm">{value}</span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AdminPieChart;
