'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { GlassCard } from '../GlassCard';

interface PieDataPoint {
  name: string;
  value: number;
  color: string;
}

interface GlowingPieChartProps {
  data: PieDataPoint[];
  title: string;
  subtitle?: string;
  centerLabel?: string;
  centerValue?: string | number;
  height?: number;
}

export function GlowingPieChart({
  data,
  title,
  subtitle,
  centerLabel,
  centerValue,
  height = 220,
}: GlowingPieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <GlassCard className="p-5 h-full">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-[var(--admin-text)]">{title}</h3>
        {subtitle && <p className="text-sm text-[var(--admin-text-muted)]">{subtitle}</p>}
      </div>

      <div className="relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {data.map((entry, index) => (
                <filter
                  key={`glow-${index}`}
                  id={`pie-glow-${index}`}
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>

            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  filter={`url(#pie-glow-${index})`}
                  style={{
                    filter: `drop-shadow(0 0 10px ${entry.color}80)`,
                  }}
                />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                background: 'rgba(15, 15, 20, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(10px)',
              }}
              formatter={(value: number, name: string) => [
                `${value.toLocaleString('es-AR')} (${((value / total) * 100).toFixed(1)}%)`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              {centerValue && (
                <p className="text-2xl font-bold text-[var(--admin-text)]">{centerValue}</p>
              )}
              {centerLabel && (
                <p className="text-xs text-[var(--admin-text-muted)]">{centerLabel}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: entry.color,
                boxShadow: `0 0 8px ${entry.color}80`,
              }}
            />
            <span className="text-xs text-[var(--admin-text-muted)]">
              {entry.name}: {entry.value.toLocaleString('es-AR')}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
