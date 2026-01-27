'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, TrendingUp, Trophy, ArrowRight, Loader2 } from 'lucide-react';
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
import { docentesApi } from '@/lib/api/docentes.api';

interface DashboardModalProps {
  type: string | null;
  onClose: () => void;
}

// Tipo para estudiantes del ranking
interface TopEstudiante {
  id: string;
  nombre: string;
  apellido: string;
  avatarUrl: string | null;
  xpTotal: number;
  porcentajeAsistencia: number;
}

const COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#ec4899', '#f43f5e', '#84cc16'];

export const DashboardModal: React.FC<DashboardModalProps> = ({ type, onClose }) => {
  // Estados para cada tipo de datos
  const [topStudents, setTopStudents] = useState<TopEstudiante[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  const [weeklyData, setWeeklyData] = useState<{ day: string; classes: number }[]>([]);
  const [isLoadingWeekly, setIsLoadingWeekly] = useState(false);

  const [attendanceData, setAttendanceData] = useState<{ week: string; avg: number }[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

  const [distributionData, setDistributionData] = useState<{ name: string; value: number }[]>([]);
  const [distributionTotal, setDistributionTotal] = useState(0);
  const [isLoadingDistribution, setIsLoadingDistribution] = useState(false);

  // Cargar datos según el tipo de modal abierto
  useEffect(() => {
    if (type === 'points') {
      fetchTopStudents();
    } else if (type === 'classes') {
      fetchWeeklyData();
    } else if (type === 'attendance') {
      fetchAttendanceData();
    } else if (type === 'students') {
      fetchDistributionData();
    }
  }, [type]);

  const fetchTopStudents = async () => {
    try {
      setIsLoadingStudents(true);
      const response = await docentesApi.getEstadisticasCompletas();
      const mapped: TopEstudiante[] = response.topEstudiantesPorPuntos.map((e) => ({
        id: e.id,
        nombre: e.nombre,
        apellido: e.apellido,
        avatarUrl: e.avatarUrl,
        xpTotal: e.xpTotal,
        porcentajeAsistencia: e.porcentajeAsistencia,
      }));
      setTopStudents(mapped);
    } catch (error) {
      console.error('Error al cargar top estudiantes:', error);
      setTopStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const fetchWeeklyData = async () => {
    try {
      setIsLoadingWeekly(true);
      const response = await docentesApi.getCargaHorariaSemanal();
      setWeeklyData(response.data);
    } catch (error) {
      console.error('Error al cargar carga horaria:', error);
      setWeeklyData([]);
    } finally {
      setIsLoadingWeekly(false);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setIsLoadingAttendance(true);
      const response = await docentesApi.getTendenciaAsistencia();
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error al cargar tendencia asistencia:', error);
      setAttendanceData([]);
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  const fetchDistributionData = async () => {
    try {
      setIsLoadingDistribution(true);
      const response = await docentesApi.getDistribucionEstudiantes();
      setDistributionData(response.data);
      setDistributionTotal(response.total);
    } catch (error) {
      console.error('Error al cargar distribución estudiantes:', error);
      setDistributionData([]);
      setDistributionTotal(0);
    } finally {
      setIsLoadingDistribution(false);
    }
  };

  if (!type) return null;

  const renderContent = () => {
    switch (type) {
      case 'classes': {
        // Calcular día más cargado y total solo si hay datos
        const safeWeeklyData = weeklyData || [];
        const maxDay =
          safeWeeklyData.length > 0
            ? safeWeeklyData.reduce((max, d) => (d.classes > max.classes ? d : max), {
                day: '-',
                classes: 0,
              })
            : { day: '-', classes: 0 };
        const totalClasses = safeWeeklyData.reduce((sum, d) => sum + d.classes, 0);

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

            {isLoadingWeekly ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              </div>
            ) : safeWeeklyData.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                <p>No hay clases programadas</p>
              </div>
            ) : (
              <>
                <div className="h-[250px] w-full bg-slate-950/50 rounded-2xl p-4 border border-slate-800">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={safeWeeklyData}>
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
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      Día más cargado
                    </span>
                    <p className="text-lg font-bold text-white mt-1">
                      {maxDay.day} ({maxDay.classes})
                    </p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-slate-500 uppercase">Total Clases</span>
                    <p className="text-lg font-bold text-white mt-1">{totalClasses} Clases</p>
                  </div>
                </div>
              </>
            )}
          </>
        );
      }

      case 'students': {
        const safeDistributionData = distributionData || [];

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

            {isLoadingDistribution ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              </div>
            ) : safeDistributionData.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Users size={48} className="mx-auto mb-4 opacity-20" />
                <p>No hay estudiantes inscritos</p>
              </div>
            ) : (
              <>
                <div className="h-[300px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={safeDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {safeDistributionData.map((_, index) => (
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
                  Total activo: {distributionTotal} Estudiantes
                </div>
              </>
            )}
          </>
        );
      }

      case 'attendance': {
        // Calcular mejor semana de asistencia solo si hay datos
        const safeAttendanceData = attendanceData || [];
        const bestWeek =
          safeAttendanceData.length > 0
            ? safeAttendanceData.reduce((best, w) => (w.avg > best.avg ? w : best), {
                week: '-',
                avg: 0,
              })
            : { week: '-', avg: 0 };

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

            {isLoadingAttendance ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              </div>
            ) : safeAttendanceData.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <TrendingUp size={48} className="mx-auto mb-4 opacity-20" />
                <p>No hay datos de asistencia</p>
              </div>
            ) : (
              <>
                <div className="h-[250px] w-full bg-slate-950/50 rounded-2xl p-4 border border-slate-800">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={safeAttendanceData}>
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
                  <span className="text-sm font-bold text-emerald-200">
                    Mejor asistencia: {bestWeek.week}
                  </span>
                  <span className="text-xl font-black text-emerald-400">
                    {Math.round(bestWeek.avg)}%
                  </span>
                </div>
              </>
            )}
          </>
        );
      }

      case 'points': {
        // Calcular max puntos para la barra de progreso
        const maxPoints =
          topStudents.length > 0 ? Math.max(...topStudents.map((s) => s.xpTotal)) : 100;

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

            {isLoadingStudents ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              </div>
            ) : topStudents.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Trophy size={48} className="mx-auto mb-4 opacity-20" />
                <p>No hay estudiantes con puntos registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topStudents.slice(0, 5).map((student, idx) => (
                  <div
                    key={student.id}
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
                    {student.avatarUrl ? (
                      <img
                        src={student.avatarUrl}
                        alt={`${student.nombre} ${student.apellido}`}
                        className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full border border-slate-700 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {student.nombre.charAt(0)}
                        {student.apellido.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">
                        {student.nombre} {student.apellido}
                      </p>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${(student.xpTotal / maxPoints) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-amber-400">{student.xpTotal}</p>
                      <p className="text-[10px] text-slate-500">XP</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="w-full mt-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors">
              Ver Ranking Completo <ArrowRight size={14} />
            </button>
          </>
        );
      }

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
