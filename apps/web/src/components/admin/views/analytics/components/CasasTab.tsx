'use client';

import { Home } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_CASA_DISTRIBUTION } from '@/lib/constants/admin-mock-data';
import { SectionHeader } from './SectionHeader';

/**
 * CasasTab - Tab de distribución por casa
 */

export function CasasTab() {
  const total = MOCK_CASA_DISTRIBUTION.reduce((acc, c) => acc + c.value, 0);

  return (
    <div className="space-y-6">
      <SectionHeader icon={Home} title="Distribucion por Casa" iconColor="#6366f1" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
          <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
            Distribucion General
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_CASA_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {MOCK_CASA_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => (
                    <span className="text-[var(--admin-text-muted)] text-sm">{value}</span>
                  )}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--admin-surface-2)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Casa Cards */}
        <div className="space-y-4">
          {MOCK_CASA_DISTRIBUTION.map((casa) => {
            const percentage = ((casa.value / total) * 100).toFixed(1);

            return (
              <div
                key={casa.name}
                className="p-4 rounded-xl border transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: `${casa.color}08`,
                  borderColor: `${casa.color}30`,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${casa.color}20` }}
                    >
                      <Home className="w-5 h-5" style={{ color: casa.color }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--admin-text)]">{casa.name}</h4>
                      <p className="text-xs text-[var(--admin-text-muted)]">
                        {percentage}% del total
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold" style={{ color: casa.color }}>
                    {casa.value}
                  </span>
                </div>
                <div className="h-2 bg-[var(--admin-surface-2)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%`, backgroundColor: casa.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CasasTab;
