'use client';

import { useEffect, useState } from 'react';
import { docentesApi } from '@/lib/api/docentes.api';
import { getErrorMessage } from '@/lib/utils/error-handler';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';

interface CargaHorariaData {
  day: string;
  classes: number;
}

interface TendenciaData {
  week: string;
  avg: number;
}

interface DistribucionData {
  name: string;
  value: number;
}

export default function DocenteReportesPage(): React.ReactNode {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cargaHoraria, setCargaHoraria] = useState<CargaHorariaData[]>([]);
  const [tendenciaAsistencia, setTendenciaAsistencia] = useState<TendenciaData[]>([]);
  const [distribucionEstudiantes, setDistribucionEstudiantes] = useState<DistribucionData[]>([]);
  const [totalEstudiantes, setTotalEstudiantes] = useState(0);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [cargaRes, tendenciaRes, distribucionRes] = await Promise.all([
        docentesApi.getCargaHorariaSemanal(),
        docentesApi.getTendenciaAsistencia(),
        docentesApi.getDistribucionEstudiantes(),
      ]);

      setCargaHoraria(cargaRes.data);
      setTendenciaAsistencia(tendenciaRes.data);
      setDistribucionEstudiantes(distribucionRes.data);
      setTotalEstudiantes(distribucionRes.total);
    } catch (err) {
      setError(getErrorMessage(err, 'Error al cargar reportes'));
    } finally {
      setIsLoading(false);
    }
  };

  const getTendenciaIcon = () => {
    if (tendenciaAsistencia.length < 2) return <Minus className="w-4 h-4 text-gray-400" />;
    const last = tendenciaAsistencia[tendenciaAsistencia.length - 1]?.avg ?? 0;
    const prev = tendenciaAsistencia[tendenciaAsistencia.length - 2]?.avg ?? 0;
    if (last > prev) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (last < prev) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const maxClasses = Math.max(...cargaHoraria.map((d) => d.classes), 1);
  const maxAsistencia = Math.max(...tendenciaAsistencia.map((d) => d.avg), 100);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadAllData}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Reportes y Estadísticas</h1>
          <p className="text-gray-400 mt-1">
            Visualiza tu carga horaria, asistencia y distribución
          </p>
        </div>
        <button
          onClick={loadAllData}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Grid de Reportes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carga Horaria Semanal */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Carga Horaria Semanal</h2>
              <p className="text-sm text-gray-400">Clases por día de la semana</p>
            </div>
          </div>

          <div className="space-y-3">
            {cargaHoraria.map((item) => (
              <div key={item.day} className="flex items-center gap-3">
                <span className="w-12 text-sm text-gray-400 shrink-0">{item.day.slice(0, 3)}</span>
                <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${(item.classes / maxClasses) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-sm text-white font-medium text-right">
                  {item.classes}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total semanal</span>
              <span className="text-white font-semibold">
                {cargaHoraria.reduce((sum, d) => sum + d.classes, 0)} clases
              </span>
            </div>
          </div>
        </div>

        {/* Tendencia de Asistencia */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">Tendencia de Asistencia</h2>
              <p className="text-sm text-gray-400">Últimas 5 semanas</p>
            </div>
            {getTendenciaIcon()}
          </div>

          <div className="flex items-end gap-2 h-40">
            {tendenciaAsistencia.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-white/5 rounded-t-lg relative" style={{ height: '100%' }}>
                  <div
                    className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(item.avg / maxAsistencia) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{item.week}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Promedio actual</span>
              <span className="text-white font-semibold">
                {tendenciaAsistencia[tendenciaAsistencia.length - 1]?.avg.toFixed(1) ?? 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Distribución de Estudiantes */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">Distribución de Estudiantes</h2>
              <p className="text-sm text-gray-400">Por comisión asignada</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{totalEstudiantes}</p>
              <p className="text-xs text-gray-400">Total</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {distribucionEstudiantes.map((item, idx) => {
              const colors = [
                'from-purple-500 to-pink-500',
                'from-blue-500 to-cyan-500',
                'from-green-500 to-emerald-500',
                'from-orange-500 to-yellow-500',
                'from-red-500 to-pink-500',
                'from-indigo-500 to-purple-500',
              ];
              const color = colors[idx % colors.length];
              const percentage = totalEstudiantes > 0 ? (item.value / totalEstudiantes) * 100 : 0;

              return (
                <div
                  key={item.name}
                  className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-white">{item.value}</span>
                    <span className="text-xs text-gray-400">{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full mb-2 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-300 truncate" title={item.name}>
                    {item.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resumen Rápido */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Clases/semana</span>
          </div>
          <p className="text-xl font-bold text-white">
            {cargaHoraria.reduce((sum, d) => sum + d.classes, 0)}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Asistencia prom.</span>
          </div>
          <p className="text-xl font-bold text-white">
            {tendenciaAsistencia[tendenciaAsistencia.length - 1]?.avg.toFixed(1) ?? 0}%
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Estudiantes</span>
          </div>
          <p className="text-xl font-bold text-white">{totalEstudiantes}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-gray-400">Comisiones</span>
          </div>
          <p className="text-xl font-bold text-white">{distribucionEstudiantes.length}</p>
        </div>
      </div>
    </div>
  );
}
