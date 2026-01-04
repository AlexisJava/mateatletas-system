'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'Lun', asistencia: 85 },
  { name: 'Mar', asistencia: 92 },
  { name: 'Mié', asistencia: 88 },
  { name: 'Jue', asistencia: 95 },
  { name: 'Vie', asistencia: 89 },
  { name: 'Sáb', asistencia: 98 },
  { name: 'Dom', asistencia: 90 },
];

export const AttendanceChart: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Actividad Semanal</h3>
        <select className="bg-slate-900 text-xs text-slate-400 border border-slate-700 rounded-lg px-2 py-1 outline-none">
          <option>Esta semana</option>
          <option>Semana pasada</option>
        </select>
      </div>

      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorAsistencia" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                color: '#fff',
              }}
              itemStyle={{ color: '#a78bfa' }}
            />
            <Area
              type="monotone"
              dataKey="asistencia"
              stroke="#8b5cf6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAsistencia)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
