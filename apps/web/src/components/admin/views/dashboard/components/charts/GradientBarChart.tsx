'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { GlassCard } from '../GlassCard';

interface DataPoint {
  [key: string]: string | number;
}

interface GradientBarChartProps {
  data: DataPoint[];
  dataKey: string;
  xAxisKey: string;
  title: string;
  subtitle?: string;
  color: string;
  height?: number;
  formatValue?: (value: number) => string;
  showGradient?: boolean;
}

export function GradientBarChart({
  data,
  dataKey,
  xAxisKey,
  title,
  subtitle,
  color,
  height = 280,
  formatValue = (v) => v.toLocaleString('es-AR'),
  showGradient = true,
}: GradientBarChartProps) {
  const gradientId = `bar-gradient-${dataKey}`;

  return (
    <GlassCard className="p-5 h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[var(--admin-text)]">{title}</h3>
        {subtitle && <p className="text-sm text-[var(--admin-text-muted)]">{subtitle}</p>}
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={1} />
                <stop offset="100%" stopColor={color} stopOpacity={0.4} />
              </linearGradient>

              <filter id="barGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
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
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              contentStyle={{
                background: 'rgba(15, 15, 20, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                boxShadow: `0 8px 32px ${color}30`,
                backdropFilter: 'blur(10px)',
              }}
              labelStyle={{ color: 'var(--admin-text-muted)', marginBottom: 4 }}
              formatter={(value: number) => [formatValue(value), '']}
            />

            <Bar
              dataKey={dataKey}
              fill={showGradient ? `url(#${gradientId})` : color}
              radius={[6, 6, 0, 0]}
              filter="url(#barGlow)"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  style={{
                    filter: `drop-shadow(0 0 6px ${color}60)`,
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
