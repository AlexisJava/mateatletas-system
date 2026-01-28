'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  planificacionesApi,
  type Asignacion,
  type ProgresoEstudianteClase,
} from '@/lib/api/docentes.api';
import { getErrorMessage } from '@/lib/utils/error-handler';
import {
  BookOpen,
  Users,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RefreshCw,
  FlaskConical,
  Clock,
  User,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react';

export default function DocenteAsignacionDetallePage(): React.ReactNode {
  const params = useParams();
  const router = useRouter();
  const asignacionId = params.id as string;

  const [asignacion, setAsignacion] = useState<Asignacion | null>(null);
  const [progresos, setProgresos] = useState<ProgresoEstudianteClase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingToggles, setLoadingToggles] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [asignacionesData, progresosData] = await Promise.all([
        planificacionesApi.getMisAsignaciones(),
        planificacionesApi.getProgresoEstudiantes(asignacionId),
      ]);

      const found = asignacionesData.find((a) => a.id === asignacionId);
      if (!found) {
        setError('Asignación no encontrada');
        return;
      }

      setAsignacion(found);
      setProgresos(progresosData.progresos);
    } catch (err) {
      setError(getErrorMessage(err, 'Error al cargar datos'));
    } finally {
      setIsLoading(false);
    }
  }, [asignacionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleTeoria = async (claseId: string, teoriaActiva: boolean) => {
    const toggleKey = `${claseId}-teoria`;
    if (loadingToggles.has(toggleKey)) return;

    try {
      setLoadingToggles((prev) => new Set(prev).add(toggleKey));
      if (teoriaActiva) {
        await planificacionesApi.desactivarTeoria(asignacionId, claseId);
      } else {
        await planificacionesApi.activarTeoria(asignacionId, claseId);
      }
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, 'Error al actualizar teoría'));
    } finally {
      setLoadingToggles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(toggleKey);
        return newSet;
      });
    }
  };

  const handleTogglePractica = async (claseId: string, practicaActiva: boolean) => {
    const toggleKey = `${claseId}-practica`;
    if (loadingToggles.has(toggleKey)) return;

    try {
      setLoadingToggles((prev) => new Set(prev).add(toggleKey));
      if (practicaActiva) {
        await planificacionesApi.desactivarPractica(asignacionId, claseId);
      } else {
        await planificacionesApi.activarPractica(asignacionId, claseId);
      }
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, 'Error al actualizar práctica'));
    } finally {
      setLoadingToggles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(toggleKey);
        return newSet;
      });
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
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

  if (error || !asignacion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error ?? 'Asignación no encontrada'}</p>
          <button
            onClick={() => router.push('/docente/asignaciones')}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
          >
            Volver a Asignaciones
          </button>
        </div>
      </div>
    );
  }

  const clasesActivas = asignacion.estadosClases.filter(
    (e) => e.teoriaActiva || e.practicaActiva,
  ).length;
  const progresoPorcentaje =
    asignacion.clases.length > 0 ? (clasesActivas / asignacion.clases.length) * 100 : 0;

  // Agrupar progresos por estudiante
  const estudiantesUnicos = [
    ...new Set(progresos.map((p) => p.estudiante?.nombre ?? 'Desconocido')),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/docente/asignaciones')}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{asignacion.planificacion.titulo}</h1>
          <p className="text-gray-400 mt-1">Grupo: {asignacion.claseGrupo.nombre}</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Total clases</span>
          </div>
          <p className="text-xl font-bold text-white">{asignacion.clases.length}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Clases activas</span>
          </div>
          <p className="text-xl font-bold text-white">{clasesActivas}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Estudiantes</span>
          </div>
          <p className="text-xl font-bold text-white">{estudiantesUnicos.length}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FlaskConical className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-gray-400">Progreso</span>
          </div>
          <p className="text-xl font-bold text-white">{progresoPorcentaje.toFixed(0)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Control de Clases */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Control de Clases</h2>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {asignacion.estadosClases.map((estado) => {
              const isTeoriaLoading = loadingToggles.has(`${estado.clase.id}-teoria`);
              const isPracticaLoading = loadingToggles.has(`${estado.clase.id}-practica`);

              return (
                <div
                  key={estado.clase.id}
                  className="bg-white/5 rounded-xl p-4 border border-white/5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-medium">Clase {estado.clase.numero}</p>
                      <p className="text-sm text-gray-400">{estado.clase.titulo}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Toggle Teoría */}
                    <button
                      onClick={() => handleToggleTeoria(estado.clase.id, estado.teoriaActiva)}
                      disabled={isTeoriaLoading}
                      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                        estado.teoriaActiva
                          ? 'bg-green-500/20 border border-green-500/30'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen
                          className={`w-4 h-4 ${estado.teoriaActiva ? 'text-green-400' : 'text-gray-400'}`}
                        />
                        <span
                          className={`text-sm ${estado.teoriaActiva ? 'text-green-400' : 'text-gray-400'}`}
                        >
                          Teoría
                        </span>
                      </div>
                      {isTeoriaLoading ? (
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                      ) : estado.teoriaActiva ? (
                        <ToggleRight className="w-5 h-5 text-green-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {/* Toggle Práctica */}
                    <button
                      onClick={() => handleTogglePractica(estado.clase.id, estado.practicaActiva)}
                      disabled={isPracticaLoading}
                      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                        estado.practicaActiva
                          ? 'bg-blue-500/20 border border-blue-500/30'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FlaskConical
                          className={`w-4 h-4 ${estado.practicaActiva ? 'text-blue-400' : 'text-gray-400'}`}
                        />
                        <span
                          className={`text-sm ${estado.practicaActiva ? 'text-blue-400' : 'text-gray-400'}`}
                        >
                          Práctica
                        </span>
                      </div>
                      {isPracticaLoading ? (
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                      ) : estado.practicaActiva ? (
                        <ToggleRight className="w-5 h-5 text-blue-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progreso de Estudiantes */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Progreso de Estudiantes</h2>

          {progresos.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No hay progreso registrado aún</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {progresos.map((progreso) => (
                <div key={progreso.id} className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <User className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {progreso.estudiante
                          ? `${progreso.estudiante.nombre} ${progreso.estudiante.apellido}`
                          : 'Estudiante'}
                      </p>
                      <p className="text-sm text-gray-400">
                        Clase {progreso.claseNumero}: {progreso.claseTitulo}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        progreso.teoriaCompletada
                          ? 'bg-green-500/20 border border-green-500/30'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {progreso.teoriaCompletada ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-500" />
                        )}
                        <span
                          className={`text-sm ${progreso.teoriaCompletada ? 'text-green-400' : 'text-gray-400'}`}
                        >
                          Teoría
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {formatTime(progreso.tiempoTeoriaSegundos)}
                      </div>
                    </div>

                    <div
                      className={`p-2 rounded-lg ${
                        progreso.practicaCompletada
                          ? 'bg-blue-500/20 border border-blue-500/30'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {progreso.practicaCompletada ? (
                          <CheckCircle className="w-4 h-4 text-blue-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-500" />
                        )}
                        <span
                          className={`text-sm ${progreso.practicaCompletada ? 'text-blue-400' : 'text-gray-400'}`}
                        >
                          Práctica
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {formatTime(progreso.tiempoPracticaSegundos)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
