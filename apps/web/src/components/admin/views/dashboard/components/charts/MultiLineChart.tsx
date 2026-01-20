'use client';

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
import { GlassCard } from '../GlassCard';

interface DataPoint {
  [key: string]: string | number;
}

interface LineConfig {
  key: string;
  color: string;
  name: string;
  dashed?: boolean;
}

interface MultiLineChartProps {
  data: DataPoint[];
  lines: LineConfig[];
  xAxisKey: string;
  title: string;
  subtitle?: string;
  height?: number;
  formatValue?: (value: number) => string;
}

export function MultiLineChart({
  data,
  lines,
  xAxisKey,
  title,
  subtitle,
  height = 280,
  formatValue = (v) => v.toLocaleString('es-AR'),
}: MultiLineChartProps) {
  return (
    <GlassCard className="p-5 h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[var(--admin-text)]">{title}</h3>
        {subtitle && <p className="text-sm text-[var(--admin-text-muted)]">{subtitle}</p>}
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {lines.map((line) => (
                <filter
                  key={`glow-${line.key}`}
                  id={`line-glow-${line.key}`}
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />

            <XAxis
              dataKey={xAxisKey}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--admin-text-muted)', fontSize: 11 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--admin-text-muted)', fontSize: 11 }}
              tickFormatter={(value) => formatValue(value)}
              dx={-5}
            />

            <Tooltip
              contentStyle={{
                background: 'rgba(15, 15, 20, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(10px)',
              }}
              labelStyle={{ color: 'var(--admin-text-muted)', marginBottom: 8 }}
              formatter={(value: number, name: string) => [formatValue(value), name]}
            />

            <Legend
              wrapperStyle={{
                paddingTop: '16px',
              }}
              formatter={(value) => (
                <span style={{ color: 'var(--admin-text-muted)', fontSize: 12 }}>{value}</span>
              )}
            />

            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={2.5}
                strokeDasharray={line.dashed ? '5 5' : undefined}
                dot={false}
                filter={`url(#line-glow-${line.key})`}
                activeDot={{
                  r: 5,
                  fill: line.color,
                  stroke: '#fff',
                  strokeWidth: 2,
                  filter: `drop-shadow(0 0 8px ${line.color})`,
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
