'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tutoresApi, type ProgresoContenidoHijo, type HijoInfo } from '@/lib/api/tutores.api';
import { getErrorMessage } from '@/lib/utils/error-handler';
import {
  ArrowLeft,
  BookOpen,
  Trophy,
  Clock,
  RefreshCw,
  Loader2,
  CheckCircle,
  TrendingUp,
  Zap,
} from 'lucide-react';

export default function TutorHijoProgresoPage(): React.ReactNode {
  const params = useParams();
  const router = useRouter();
  const estudianteId = params.id as string;

  const [hijo, setHijo] = useState<HijoInfo | null>(null);
  const [progresos, setProgresos] = useState<ProgresoContenidoHijo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Cargar dashboard para obtener info del hijo
      const dashboard = await tutoresApi.getDashboardResumen();
      const foundHijo = dashboard.hijos.find((h) => h.id === estudianteId);

      if (!foundHijo) {
        setError('Hijo no encontrado');
        return;
      }

      setHijo(foundHijo);

      // Cargar progreso de contenidos
      const progresosData = await tutoresApi.getProgresoContenidosHijo(estudianteId);
      setProgresos(progresosData);
    } catch (err) {
      setError(getErrorMessage(err, 'Error al cargar datos'));
    } finally {
      setIsLoading(false);
    }
  }, [estudianteId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getMundoColor = (mundoTipo: string) => {
    switch (mundoTipo) {
      case 'MATEMATICA':
        return 'from-blue-500 to-cyan-500';
      case 'LOGICA':
        return 'from-purple-500 to-pink-500';
      case 'PROGRAMACION':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getMundoIcon = (mundoTipo: string) => {
    switch (mundoTipo) {
      case 'MATEMATICA':
        return <Zap className="w-5 h-5" />;
      case 'LOGICA':
        return <TrendingUp className="w-5 h-5" />;
      case 'PROGRAMACION':
        return <BookOpen className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !hijo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error ?? 'Hijo no encontrado'}</p>
          <button
            onClick={() => router.push('/tutor/dashboard')}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const contenidosCompletados = progresos.filter((p) => p.completado).length;
  const progresoPromedio =
    progresos.length > 0
      ? Math.round(progresos.reduce((sum, p) => sum + p.porcentaje, 0) / progresos.length)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/tutor/dashboard')}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">
            Progreso de {hijo.nombre} {hijo.apellido}
          </h1>
          <p className="text-gray-400 mt-1">
            {hijo.nivelEscolar ?? 'Sin nivel'} • {hijo.edad ?? '?'} años
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-gray-400">Puntos Totales</span>
          </div>
          <p className="text-2xl font-bold text-white">{hijo.puntosTotales.toLocaleString()}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-gray-400">Contenidos</span>
          </div>
          <p className="text-2xl font-bold text-white">{progresos.length}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-xs text-gray-400">Completados</span>
          </div>
          <p className="text-2xl font-bold text-white">{contenidosCompletados}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-gray-400">Progreso Promedio</span>
          </div>
          <p className="text-2xl font-bold text-white">{progresoPromedio}%</p>
        </div>
      </div>

      {/* Asistencia */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span className="text-gray-400">Asistencia Promedio</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-white/10 rounded-full h-3 w-48 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${hijo.asistenciaPromedio}%` }}
              />
            </div>
            <span className="text-white font-bold">{hijo.asistenciaPromedio.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Contenidos Progress */}
      <h2 className="text-xl font-semibold text-white mb-4">Contenidos en Progreso</h2>

      {progresos.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Sin contenidos</h3>
          <p className="text-gray-400">{hijo.nombre} aún no ha iniciado ningún contenido.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {progresos.map((progreso) => (
            <div
              key={progreso.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center gap-4">
                {/* Content Icon */}
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${getMundoColor(progreso.contenido.mundoTipo)}`}
                >
                  {getMundoIcon(progreso.contenido.mundoTipo)}
                </div>

                {/* Content Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium truncate">{progreso.contenido.titulo}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        progreso.completado
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {progreso.completado ? 'Completado' : `${progreso.porcentaje}%`}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-white/10 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${getMundoColor(progreso.contenido.mundoTipo)}`}
                      style={{ width: `${progreso.porcentaje}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {progreso.nodoActual ? `En: ${progreso.nodoActual.titulo}` : 'Sin iniciar'}
                    </span>
                    <span>
                      Última actividad:{' '}
                      {new Date(progreso.ultimaActividad).toLocaleDateString('es-AR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
