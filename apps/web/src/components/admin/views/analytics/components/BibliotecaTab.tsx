'use client';

import { BookOpen } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { MOCK_TIER_DISTRIBUTION } from '@/lib/constants/admin-mock-data';
import { SectionHeader } from './SectionHeader';

/**
 * BibliotecaTab - Tab de analytics de biblioteca
 */

const LIBRARY_DATA = [
  { month: 'Jul', lecturas: 1250, completados: 890, promedio: 4.2 },
  { month: 'Ago', lecturas: 1480, completados: 1050, promedio: 4.5 },
  { month: 'Sep', lecturas: 1320, completados: 920, promedio: 4.1 },
  { month: 'Oct', lecturas: 1680, completados: 1280, promedio: 4.8 },
  { month: 'Nov', lecturas: 1820, completados: 1420, promedio: 4.6 },
  { month: 'Dic', lecturas: 2100, completados: 1680, promedio: 4.9 },
];

const TOP_BOOKS = [
  { title: 'Matematica Divertida Vol. 1', reads: 342, rating: 4.8 },
  { title: 'Programacion para Ninos', reads: 298, rating: 4.7 },
  { title: 'Ciencia en Casa', reads: 256, rating: 4.5 },
  { title: 'Logica y Puzzles', reads: 234, rating: 4.6 },
  { title: 'Aventuras STEAM', reads: 189, rating: 4.4 },
];

export function BibliotecaTab() {
  return (
    <div className="space-y-6">
      <SectionHeader icon={BookOpen} title="Analytics de Biblioteca" iconColor="#f59e0b" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reading Trends */}
        <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
          <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
            Tendencias de Lectura
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={LIBRARY_DATA}>
                <defs>
                  <linearGradient id="colorLecturas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                <XAxis dataKey="month" stroke="var(--admin-text-muted)" fontSize={12} />
                <YAxis stroke="var(--admin-text-muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--admin-surface-2)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="lecturas"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#colorLecturas)"
                />
                <Area
                  type="monotone"
                  dataKey="completados"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Books */}
        <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
          <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4">Libros Mas Leidos</h3>
          <div className="space-y-3">
            {TOP_BOOKS.map((book, index) => (
              <div
                key={book.title}
                className="flex items-center gap-3 p-3 bg-[var(--admin-surface-2)] rounded-lg"
              >
                <span className="w-6 h-6 rounded-full bg-[var(--status-warning-muted)] text-[var(--status-warning)] flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--admin-text)] truncate">{book.title}</p>
                  <p className="text-xs text-[var(--admin-text-muted)]">{book.reads} lecturas</p>
                </div>
                <div className="flex items-center gap-1 text-[var(--status-warning)]">
                  <span className="text-sm font-semibold">{book.rating}</span>
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tier Distribution */}
      <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
        <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
          Distribucion por Tier
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_TIER_DISTRIBUTION} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
              <XAxis type="number" stroke="var(--admin-text-muted)" fontSize={12} />
              <YAxis
                dataKey="name"
                type="category"
                stroke="var(--admin-text-muted)"
                fontSize={12}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--admin-surface-2)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {MOCK_TIER_DISTRIBUTION.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default BibliotecaTab;
