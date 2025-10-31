'use client';

import { useEffect, useState } from 'react';
import {
  misAsignaciones,
  activarSemana,
  desactivarSemana,
  verProgresoEstudiantes,
  type PlanificacionSimple,
  type SemanaActiva,
  type ProgresoEstudiante,
} from '@/lib/api/planificaciones-simples.api';
import { getErrorMessage } from '@/lib/utils/error-handler';
import { Calendar, CheckCircle, XCircle, Eye } from 'lucide-react';

interface Asignacion {
  id: string;
  planificacion: PlanificacionSimple;
  claseGrupo: { id: string; nombre: string };
  semanas_activas: SemanaActiva[];
}

export default function DocentePlanificacionesPage() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [, setSelectedAsignacion] = useState<string | null>(null);
  const [progresos, setProgresos] = useState<ProgresoEstudiante[]>([]);

  useEffect(() => {
    loadAsignaciones();
  }, []);

  const loadAsignaciones = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await misAsignaciones();
      setAsignaciones(data);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Error al cargar planificaciones');
      setError(errorMessage);
      console.error('Error loading asignaciones:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSemana = async (asignacionId: string, semanaNumero: number, activa: boolean) => {
    try {
      if (activa) {
        await desactivarSemana(asignacionId, semanaNumero);
      } else {
        await activarSemana(asignacionId, semanaNumero);
      }
      await loadAsignaciones();
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Error al actualizar semana');
      alert(errorMessage);
    }
  };

  const handleVerProgreso = async (asignacionId: string) => {
    try {
      const data = await verProgresoEstudiantes(asignacionId);
      setProgresos(data.progresos);
      setSelectedAsignacion(asignacionId);
      setShowProgressModal(true);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Error al cargar progreso');
      alert(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4" />
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
            onClick={loadAsignaciones}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500/30 to-green-500/30 border-2 border-emerald-400/50 text-white font-bold hover:shadow-lg transition-all"
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
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-emerald-200 to-green-200 bg-clip-text text-transparent drop-shadow-lg mb-1">
          Mis Planificaciones
        </h1>
        <p className="text-sm text-slate-300 font-medium">Gestionar semanas activas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 backdrop-blur-xl border-2 border-emerald-400/50 p-5">
          <Calendar className="w-6 h-6 text-emerald-300 mb-3" strokeWidth={2.5} />
          <p className="text-xs text-white/60 font-bold uppercase tracking-wide mb-1">
            Asignaciones
          </p>
          <p className="text-4xl font-black text-white">{asignaciones.length}</p>
        </div>
      </div>

      {/* Asignaciones */}
      {asignaciones.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-2xl font-bold text-white mb-2">No hay planificaciones asignadas</h3>
          <p className="text-slate-400">
            Cuando el admin te asigne una planificación, aparecerá aquí
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {asignaciones.map((asignacion) => {
            const semanasActivasNums = asignacion.semanas_activas
              .filter((s) => s.activa)
              .map((s) => s.semana_numero);

            return (
              <div
                key={asignacion.id}
                className="rounded-2xl bg-gradient-to-br from-slate-800/50 via-slate-700/50 to-slate-800/50 backdrop-blur-xl border-2 border-slate-600/50 p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {asignacion.planificacion.titulo}
                    </h3>
                    <p className="text-sm text-slate-400">
                      Grupo: {asignacion.claseGrupo.nombre} •{' '}
                      {asignacion.planificacion.semanas_total} semanas
                    </p>
                  </div>
                  <button
                    onClick={() => handleVerProgreso(asignacion.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Progreso
                  </button>
                </div>

                {/* Semanas */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Array.from({ length: asignacion.planificacion.semanas_total }, (_, i) => i + 1).map(
                    (semana) => {
                      const activa = semanasActivasNums.includes(semana);
                      return (
                        <button
                          key={semana}
                          onClick={() => handleToggleSemana(asignacion.id, semana, activa)}
                          className={`p-4 rounded-xl border-2 font-bold transition-all ${
                            activa
                              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/30'
                              : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:bg-slate-600/30'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2 mb-1">
                            {activa ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            <span className="text-xs">Semana</span>
                          </div>
                          <p className="text-2xl">{semana}</p>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Progreso */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-2 border-emerald-400/50 p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Progreso de Estudiantes</h3>
              <button
                onClick={() => setShowProgressModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition-all"
              >
                Cerrar
              </button>
            </div>

            {progresos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400">No hay estudiantes con progreso aún</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-600">
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-300 uppercase">
                        Estudiante
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-slate-300 uppercase">
                        Semana
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-slate-300 uppercase">
                        Tiempo (min)
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-slate-300 uppercase">
                        Puntos
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {progresos.map((progreso, index) => (
                      <tr
                        key={progreso.id}
                        className={`border-b border-slate-700/50 ${index % 2 === 0 ? 'bg-slate-800/20' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <p className="text-white font-medium">
                            {progreso.estudiante?.nombre} {progreso.estudiante?.apellido}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center text-white font-bold">
                          {progreso.semana_actual}
                        </td>
                        <td className="px-4 py-3 text-center text-white">
                          {progreso.tiempo_total_minutos}
                        </td>
                        <td className="px-4 py-3 text-center text-emerald-300 font-bold">
                          {progreso.puntos_totales}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
