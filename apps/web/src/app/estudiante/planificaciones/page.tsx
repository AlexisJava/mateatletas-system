'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';
import { getErrorMessage } from '@/lib/utils/error-handler';
import { Play, Lock, CheckCircle } from 'lucide-react';

interface PlanificacionDisponible {
  codigo: string;
  titulo: string;
  grupo_codigo: string;
  semanas_total: number;
  semana_actual?: number;
  puntos_totales?: number;
}

export default function EstudiantePlanificacionesPage() {
  const router = useRouter();
  const [planificaciones, setPlanificaciones] = useState<PlanificacionDisponible[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlanificaciones();
  }, []);

  const loadPlanificaciones = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener planificaciones disponibles (esto debería ser un endpoint específico)
      // Por ahora simulamos con las asignaciones del grupo del estudiante
      const response = await apiClient.get('/planificaciones');
      setPlanificaciones(response.data || []);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Error al cargar planificaciones');
      setError(errorMessage);
      console.error('Error loading planificaciones:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJugar = (codigo: string) => {
    router.push(`/estudiante/planificaciones/${codigo}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-bold">Cargando planificaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-red-200 mb-6">{error}</p>
          <button
            onClick={loadPlanificaciones}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-2 border-purple-400/50 text-white font-bold hover:shadow-lg transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col relative pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-lg mb-1">
          Mis Planificaciones
        </h1>
        <p className="text-sm text-slate-300 font-medium">Juega y aprende</p>
      </div>

      {/* Planificaciones */}
      {planificaciones.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-2xl font-bold text-white mb-2">No hay planificaciones disponibles</h3>
          <p className="text-slate-400">
            Cuando tu profesor active una planificación, aparecerá aquí
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {planificaciones.map((planificacion) => (
            <div
              key={planificacion.codigo}
              className="rounded-2xl bg-gradient-to-br from-slate-800/50 via-slate-700/50 to-slate-800/50 backdrop-blur-xl border-2 border-slate-600/50 p-6 hover:border-purple-400/50 transition-all"
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-2">{planificacion.titulo}</h3>
                <p className="text-sm text-slate-400">Grupo: {planificacion.grupo_codigo}</p>
              </div>

              {planificacion.semana_actual ? (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-bold uppercase">Progreso</span>
                    <span className="text-xs text-purple-300 font-bold">
                      Semana {planificacion.semana_actual}/{planificacion.semanas_total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${((planificacion.semana_actual || 0) / planificacion.semanas_total) * 100}%`,
                      }}
                    />
                  </div>
                  {planificacion.puntos_totales !== undefined && (
                    <p className="text-xs text-slate-400 mt-2">
                      {planificacion.puntos_totales} puntos
                    </p>
                  )}
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-yellow-300">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-bold">No iniciada</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => handleJugar(planificacion.codigo)}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-2 border-purple-400/50 text-white font-bold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                {planificacion.semana_actual ? 'Continuar' : 'Comenzar'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
