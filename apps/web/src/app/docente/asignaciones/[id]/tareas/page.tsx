'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  planificacionesApi,
  type Asignacion,
  type TareaClaseInfo,
  type ProgresoTareaEstudiante,
} from '@/lib/api/docentes.api';
import { getErrorMessage } from '@/lib/utils/error-handler';
import {
  ClipboardList,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  BookOpen,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function DocenteTareasPage(): React.ReactNode {
  const params = useParams();
  const router = useRouter();
  const asignacionId = params.id as string;

  const [asignacion, setAsignacion] = useState<Asignacion | null>(null);
  const [tareasPorClase, setTareasPorClase] = useState<Map<string, TareaClaseInfo[]>>(new Map());
  const [progresosTareas, setProgresosTareas] = useState<ProgresoTareaEstudiante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTareas, setLoadingTareas] = useState<Set<string>>(new Set());
  const [expandedClases, setExpandedClases] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [showProgresos, setShowProgresos] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [asignacionesData, progresosData] = await Promise.all([
        planificacionesApi.getMisAsignaciones(),
        planificacionesApi.getProgresoTareas(asignacionId),
      ]);

      const found = asignacionesData.find((a) => a.id === asignacionId);
      if (!found) {
        setError('Asignación no encontrada');
        return;
      }

      setAsignacion(found);
      setProgresosTareas(progresosData.progresos);

      // Expandir primera clase por defecto
      if (found.clases.length > 0) {
        setExpandedClases(new Set([found.clases[0].id]));
      }

      // Cargar tareas de todas las clases
      const tareasMap = new Map<string, TareaClaseInfo[]>();
      await Promise.all(
        found.clases.map(async (clase) => {
          try {
            const result = await planificacionesApi.getTareasClase(asignacionId, clase.id);
            tareasMap.set(clase.id, result.tareas);
          } catch {
            tareasMap.set(clase.id, []);
          }
        }),
      );
      setTareasPorClase(tareasMap);
    } catch (err) {
      setError(getErrorMessage(err, 'Error al cargar datos'));
    } finally {
      setIsLoading(false);
    }
  }, [asignacionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleTarea = async (tareaClaseId: string, asignada: boolean) => {
    if (loadingTareas.has(tareaClaseId)) return;

    try {
      setLoadingTareas((prev) => new Set(prev).add(tareaClaseId));

      if (asignada) {
        await planificacionesApi.desasignarTarea(asignacionId, tareaClaseId);
      } else {
        await planificacionesApi.asignarTarea(asignacionId, tareaClaseId);
      }

      // Recargar tareas
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, 'Error al actualizar tarea'));
    } finally {
      setLoadingTareas((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tareaClaseId);
        return newSet;
      });
    }
  };

  const toggleClaseExpanded = (claseId: string) => {
    setExpandedClases((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(claseId)) {
        newSet.delete(claseId);
      } else {
        newSet.add(claseId);
      }
      return newSet;
    });
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

  const totalTareas = Array.from(tareasPorClase.values()).reduce(
    (sum, tareas) => sum + tareas.length,
    0,
  );
  const tareasAsignadas = Array.from(tareasPorClase.values()).reduce(
    (sum, tareas) => sum + tareas.filter((t) => t.asignada).length,
    0,
  );
  const tareasCompletadas = progresosTareas.filter((p) => p.completada).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push(`/docente/asignaciones/${asignacionId}`)}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Gestión de Tareas</h1>
          <p className="text-gray-400 mt-1">
            {asignacion.planificacion.titulo} - {asignacion.claseGrupo.nombre}
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Total tareas</span>
          </div>
          <p className="text-xl font-bold text-white">{totalTareas}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Asignadas</span>
          </div>
          <p className="text-xl font-bold text-white">{tareasAsignadas}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Completadas</span>
          </div>
          <p className="text-xl font-bold text-white">{tareasCompletadas}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Clases</span>
          </div>
          <p className="text-xl font-bold text-white">{asignacion.clases.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setShowProgresos(false)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            !showProgresos
              ? 'bg-purple-600 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <ClipboardList className="w-4 h-4 inline mr-2" />
          Tareas por Clase
        </button>
        <button
          onClick={() => setShowProgresos(true)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            showProgresos
              ? 'bg-purple-600 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Progreso Estudiantes
        </button>
      </div>

      {!showProgresos ? (
        /* Tareas por Clase */
        <div className="space-y-4">
          {asignacion.clases.map((clase) => {
            const tareas = tareasPorClase.get(clase.id) ?? [];
            const isExpanded = expandedClases.has(clase.id);
            const tareasAsignadasClase = tareas.filter((t) => t.asignada).length;

            return (
              <div
                key={clase.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggleClaseExpanded(clase.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">
                        Clase {clase.numero}: {clase.titulo}
                      </p>
                      <p className="text-sm text-gray-400">
                        {tareasAsignadasClase}/{tareas.length} tareas asignadas
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-white/10 p-4">
                    {tareas.length === 0 ? (
                      <p className="text-center text-gray-400 py-4">
                        No hay tareas disponibles para esta clase
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {tareas.map((tarea) => {
                          const isLoading = loadingTareas.has(tarea.id);

                          return (
                            <div
                              key={tarea.id}
                              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                                tarea.asignada
                                  ? 'bg-green-500/10 border-green-500/30'
                                  : 'bg-white/5 border-white/10'
                              }`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-white font-medium">{tarea.contenidoTitulo}</p>
                                  {tarea.obligatoria && (
                                    <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
                                      Obligatoria
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                                  <span>Orden: {tarea.orden}</span>
                                  {tarea.fechaLimite && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(tarea.fechaLimite).toLocaleDateString('es-AR')}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() => handleToggleTarea(tarea.id, tarea.asignada)}
                                disabled={isLoading}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                  tarea.asignada
                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                }`}
                              >
                                {isLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : tarea.asignada ? (
                                  <ToggleRight className="w-5 h-5" />
                                ) : (
                                  <ToggleLeft className="w-5 h-5" />
                                )}
                                {tarea.asignada ? 'Asignada' : 'Asignar'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Progreso de Estudiantes */
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Progreso de Tareas por Estudiante
          </h2>

          {progresosTareas.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No hay entregas registradas aún</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-sm text-gray-400 py-3 px-4">Estudiante</th>
                    <th className="text-left text-sm text-gray-400 py-3 px-4">Tarea</th>
                    <th className="text-center text-sm text-gray-400 py-3 px-4">Estado</th>
                    <th className="text-center text-sm text-gray-400 py-3 px-4">Fecha</th>
                    <th className="text-center text-sm text-gray-400 py-3 px-4">Calificación</th>
                  </tr>
                </thead>
                <tbody>
                  {progresosTareas.map((progreso, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-white">{progreso.estudianteNombre}</td>
                      <td className="py-3 px-4 text-gray-300">{progreso.tareaTitulo}</td>
                      <td className="py-3 px-4 text-center">
                        {progreso.completada ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                            <CheckCircle className="w-3 h-3" />
                            Completada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm">
                            <Clock className="w-3 h-3" />
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-400 text-sm">
                        {progreso.fechaCompletado
                          ? new Date(progreso.fechaCompletado).toLocaleDateString('es-AR')
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {progreso.calificacion !== null ? (
                          <span className="inline-flex items-center gap-1 text-yellow-400">
                            <Star className="w-3 h-3" />
                            {progreso.calificacion}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
