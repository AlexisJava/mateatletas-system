'use client';

import { Home, Trophy, Users } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import type { CasaDistribution } from '../hooks';

/**
 * CasasTab - Tab de distribución por casa
 *
 * Muestra:
 * - Distribución de estudiantes por casa (pie chart)
 * - Ranking de puntos por casa (bar chart)
 * - Cards detalladas por casa
 */

interface CasasTabProps {
  casaDistribution: CasaDistribution[];
}

export function CasasTab({ casaDistribution }: CasasTabProps) {
  const data = casaDistribution;
  const total = data.reduce((acc, c) => acc + c.value, 0);
  const totalPuntos = data.reduce((acc, c) => acc + c.puntosTotales, 0);

  // Ordenar por puntos para el ranking
  const sortedByPuntos = [...data].sort((a, b) => b.puntosTotales - a.puntosTotales);

  return (
    <div className="h-full overflow-auto p-4 space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-[var(--admin-text-muted)]">Total Estudiantes</p>
              <p className="text-2xl font-bold text-[var(--admin-text)]">{total}</p>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-[var(--admin-text-muted)]">Total Puntos</p>
              <p className="text-2xl font-bold text-[var(--admin-text)]">
                {totalPuntos.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Home className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-[var(--admin-text-muted)]">Casas Activas</p>
              <p className="text-2xl font-bold text-[var(--admin-text)]">{data.length}</p>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${sortedByPuntos[0]?.color}20` }}
            >
              <Trophy className="w-5 h-5" style={{ color: sortedByPuntos[0]?.color }} />
            </div>
            <div>
              <p className="text-sm text-[var(--admin-text-muted)]">Casa Líder</p>
              <p className="text-xl font-bold" style={{ color: sortedByPuntos[0]?.color }}>
                {sortedByPuntos[0]?.name ?? 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Distribución de Estudiantes */}
        <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]">
          <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
            Distribución de Estudiantes
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  nameKey="name"
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 15, 25, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => [`${value} estudiantes`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Ranking de Puntos */}
        <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]">
          <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
            Ranking por Puntos
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedByPuntos} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  type="number"
                  stroke="var(--admin-text-muted)"
                  fontSize={12}
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="var(--admin-text-muted)"
                  fontSize={12}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 15, 25, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} puntos`, '']}
                />
                <Bar dataKey="puntosTotales" radius={[0, 4, 4, 0]}>
                  {sortedByPuntos.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Casa Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedByPuntos.map((casa, index) => {
          const percentage = total > 0 ? ((casa.value / total) * 100).toFixed(1) : '0';

          return (
            <div
              key={casa.name}
              className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border transition-all hover:scale-[1.02] hover:border-white/20"
              style={{ borderColor: `${casa.color}30` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${casa.color}20` }}
                  >
                    {index === 0 ? (
                      <Trophy className="w-6 h-6" style={{ color: casa.color }} />
                    ) : (
                      <Home className="w-6 h-6" style={{ color: casa.color }} />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--admin-text)]">{casa.name}</h4>
                    <p className="text-xs text-[var(--admin-text-muted)]">
                      {index === 0 ? 'Líder' : `#${index + 1}`} del ranking
                    </p>
                  </div>
                </div>
                {index === 0 && (
                  <div className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                    1er
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-[var(--admin-text-muted)]">Estudiantes</p>
                  <p className="text-xl font-bold text-[var(--admin-text)]">{casa.value}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--admin-text-muted)]">Puntos</p>
                  <p className="text-xl font-bold" style={{ color: casa.color }}>
                    {casa.puntosTotales.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%`, backgroundColor: casa.color }}
                />
              </div>
              <p className="text-xs text-[var(--admin-text-muted)] mt-2 text-center">
                {percentage}% de estudiantes
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CasasTab;
