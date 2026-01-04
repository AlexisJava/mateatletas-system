'use client';

import React from 'react';
import { X, Calendar, Users, TrendingUp, Trophy, ArrowRight } from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface DashboardModalProps {
  type: string | null;
  onClose: () => void;
}

// Mock Data for Charts
const weeklyClassesData = [
  { day: 'Lun', classes: 2 },
  { day: 'Mar', classes: 1 },
  { day: 'Mié', classes: 3 },
  { day: 'Jue', classes: 2 },
  { day: 'Vie', classes: 1 },
];

const attendanceTrendData = [
  { week: 'S1', avg: 85 },
  { week: 'S2', avg: 88 },
  { week: 'S3', avg: 82 },
  { week: 'S4', avg: 92 },
  { week: 'S5', avg: 94 },
];

const studentsDistributionData = [
  { name: 'Full Stack', value: 20 },
  { name: 'Unity 3D', value: 15 },
  { name: 'Data Science', value: 20 },
  { name: 'UX/UI', value: 12 },
];
const COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#ec4899'];

const topStudentsData = [
  { name: 'Sofía López', points: 200, avatar: 'https://picsum.photos/seed/sofia/50/50' },
  { name: 'David Kim', points: 180, avatar: 'https://picsum.photos/seed/david/50/50' },
  { name: 'Valentina Roa', points: 150, avatar: 'https://picsum.photos/seed/valentina/50/50' },
  { name: 'María Gonzalez', points: 140, avatar: 'https://picsum.photos/seed/maria/50/50' },
  { name: 'Ana García', points: 120, avatar: 'https://picsum.photos/seed/ana/50/50' },
];

export const DashboardModal: React.FC<DashboardModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const renderContent = () => {
    switch (type) {
      case 'classes':
        return (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Carga Horaria Semanal</h3>
                <p className="text-sm text-slate-400">Distribución de clases por día</p>
              </div>
            </div>
            <div className="h-[250px] w-full bg-slate-950/50 rounded-2xl p-4 border border-slate-800">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyClassesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#334155', opacity: 0.2 }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: 'white',
                    }}
                  />
                  <Bar dataKey="classes" fill="#06b6d4" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-500 uppercase">Día más cargado</span>
                <p className="text-lg font-bold text-white mt-1">Miércoles (3)</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-500 uppercase">Total Horas</span>
                <p className="text-lg font-bold text-white mt-1">16 Horas</p>
              </div>
            </div>
          </>
        );

      case 'students':
        return (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Distribución de Alumnos</h3>
                <p className="text-sm text-slate-400">Inscritos por comisión activa</p>
              </div>
            </div>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={studentsDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {studentsDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: 'white',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-center text-xs text-slate-500">
              Total activo: 67 Estudiantes
            </div>
          </>
        );

      case 'attendance':
        return (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Tendencia de Asistencia</h3>
                <p className="text-sm text-slate-400">Evolución en las últimas 5 semanas</p>
              </div>
            </div>
            <div className="h-[250px] w-full bg-slate-950/50 rounded-2xl p-4 border border-slate-800">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrendData}>
                  <defs>
                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="week"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: 'white',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="avg"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAvg)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <span className="text-sm font-bold text-emerald-200">Mejor asistencia: S5</span>
              <span className="text-xl font-black text-emerald-400">94%</span>
            </div>
          </>
        );

      case 'points':
        return (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                <Trophy size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Top Estudiantes</h3>
                <p className="text-sm text-slate-400">Ranking por puntos acumulados</p>
              </div>
            </div>
            <div className="space-y-3">
              {topStudentsData.map((student, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-3 bg-slate-800/30 border border-slate-800 rounded-xl hover:bg-slate-800/60 transition-colors"
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm ${
                      idx === 0
                        ? 'bg-amber-500 text-slate-900'
                        : idx === 1
                          ? 'bg-slate-400 text-slate-900'
                          : idx === 2
                            ? 'bg-orange-700 text-slate-200'
                            : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-10 h-10 rounded-full border border-slate-700"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{student.name}</p>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${(student.points / 200) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-400">{student.points}</p>
                    <p className="text-[10px] text-slate-500">PTS</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors">
              Ver Ranking Completo <ArrowRight size={14} />
            </button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animation-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative animation-scale-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-6 md:p-8">{renderContent()}</div>
      </div>
    </div>
  );
};
