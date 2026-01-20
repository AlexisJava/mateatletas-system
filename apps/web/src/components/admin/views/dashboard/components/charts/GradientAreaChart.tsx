'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { GlassCard } from '../GlassCard';

interface DataPoint {
  [key: string]: string | number;
}

interface GradientAreaChartProps {
  data: DataPoint[];
  dataKey: string;
  xAxisKey: string;
  title: string;
  subtitle?: string;
  color: string;
  secondaryColor?: string;
  height?: number;
  formatValue?: (value: number) => string;
  formatTooltip?: (value: number) => string;
}

export function GradientAreaChart({
  data,
  dataKey,
  xAxisKey,
  title,
  subtitle,
  color,
  secondaryColor,
  height = 280,
  formatValue = (v) => v.toLocaleString('es-AR'),
  formatTooltip,
}: GradientAreaChartProps) {
  const gradientId = `gradient-${dataKey}-${color.replace('#', '')}`;
  const glowId = `glow-${dataKey}`;

  // If height is provided, use fixed height; otherwise use flex to fill container
  const useFlexLayout = height === undefined;

  return (
    <GlassCard className={`p-5 ${useFlexLayout ? 'h-full flex flex-col' : 'h-full'}`}>
      {title && (
        <div className="mb-3 flex-shrink-0">
          <h3 className="text-lg font-semibold text-[var(--admin-text)]">{title}</h3>
          {subtitle && <p className="text-sm text-[var(--admin-text-muted)]">{subtitle}</p>}
        </div>
      )}

      <div
        className={useFlexLayout ? 'flex-1 min-h-0' : ''}
        style={!useFlexLayout ? { height } : undefined}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {/* Main gradient fill */}
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="50%" stopColor={color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>

              {/* Glow filter for the line */}
              <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
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
              contentStyle={{
                background: 'rgba(15, 15, 20, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                boxShadow: `0 8px 32px ${color}30`,
                backdropFilter: 'blur(10px)',
              }}
              labelStyle={{ color: 'var(--admin-text-muted)', marginBottom: 4 }}
              itemStyle={{ color }}
              formatter={(value: number) => [
                formatTooltip ? formatTooltip(value) : formatValue(value),
                '',
              ]}
            />

            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              filter={`url(#${glowId})`}
              dot={false}
              activeDot={{
                r: 6,
                fill: color,
                stroke: '#fff',
                strokeWidth: 2,
                filter: `drop-shadow(0 0 8px ${color})`,
              }}
            />

            {secondaryColor && (
              <Area
                type="monotone"
                dataKey="secondary"
                stroke={secondaryColor}
                strokeWidth={2}
                fill="transparent"
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
