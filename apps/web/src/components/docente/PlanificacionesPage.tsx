'use client';

import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Clock,
  ChevronRight,
  ArrowLeft,
  Layers,
  Eye,
  BookOpen,
  FlaskConical,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  ListTodo,
  Calendar,
} from 'lucide-react';
import {
  planificacionesApi,
  type Asignacion,
  type ProgresoEstudianteClase,
  type TareaClaseInfo,
} from '@/lib/api/docentes.api';
import { getErrorMessage } from '@/lib/utils/error-handler';

/**
 * PlanificacionesPage - Gestión de Planificaciones Docente
 * Usa la API real para mostrar y controlar las asignaciones
 */
export const PlanificacionesPage: React.FC = () => {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [selectedAsignacionId, setSelectedAsignacionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingToggles, setLoadingToggles] = useState<Set<string>>(new Set());
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progresos, setProgresos] = useState<ProgresoEstudianteClase[]>([]);

  // Estado para modal de tareas
  const [showTareasModal, setShowTareasModal] = useState(false);
  const [selectedClaseId, setSelectedClaseId] = useState<string | null>(null);
  const [tareas, setTareas] = useState<TareaClaseInfo[]>([]);
  const [loadingTareas, setLoadingTareas] = useState(false);
  const [loadingTareaToggle, setLoadingTareaToggle] = useState<string | null>(null);

  const selectedAsignacion = asignaciones.find((a) => a.id === selectedAsignacionId);
  const selectedClase = selectedAsignacion?.clases.find((c) => c.id === selectedClaseId);

  useEffect(() => {
    loadAsignaciones();
  }, []);

  const loadAsignaciones = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await planificacionesApi.getMisAsignaciones();
      setAsignaciones(data);
    } catch (err) {
      const errorMessage = getErrorMessage(err as Error, 'Error al cargar planificaciones');
      setError(errorMessage);
      console.error('Error loading asignaciones:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper para obtener el estado de una clase
  const getEstadoClase = (asignacion: Asignacion, claseId: string) => {
    const estado = asignacion.estados_clases.find((e) => e.clase.id === claseId);
    return {
      teoria_activa: estado?.teoria_activa ?? false,
      practica_activa: estado?.practica_activa ?? false,
      activa: (estado?.teoria_activa || estado?.practica_activa) ?? false,
      ambas_activas: (estado?.teoria_activa && estado?.practica_activa) ?? false,
    };
  };

  // Calcular progreso de asignación
  const getAsignacionProgress = (asignacion: Asignacion) => {
    const totalItems = asignacion.clases.length * 2; // teoría + práctica por clase
    let activos = 0;
    asignacion.clases.forEach((clase) => {
      const estado = getEstadoClase(asignacion, clase.id);
      if (estado.teoria_activa) activos++;
      if (estado.practica_activa) activos++;
    });
    return Math.round((activos / totalItems) * 100);
  };

  // Toggle individual para teoría
  const handleToggleTeoria = async (
    asignacionId: string,
    claseId: string,
    teoriaActiva: boolean,
  ) => {
    const toggleKey = `${asignacionId}-${claseId}-teoria`;
    if (loadingToggles.has(toggleKey)) return;

    try {
      setLoadingToggles((prev) => new Set(prev).add(toggleKey));
      if (teoriaActiva) {
        await planificacionesApi.desactivarTeoria(asignacionId, claseId);
      } else {
        await planificacionesApi.activarTeoria(asignacionId, claseId);
      }
      await loadAsignaciones();
    } catch (err) {
      const errorMessage = getErrorMessage(err as Error, 'Error al actualizar teoría');
      alert(errorMessage);
    } finally {
      setLoadingToggles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(toggleKey);
        return newSet;
      });
    }
  };

  // Toggle individual para práctica
  const handleTogglePractica = async (
    asignacionId: string,
    claseId: string,
    practicaActiva: boolean,
  ) => {
    const toggleKey = `${asignacionId}-${claseId}-practica`;
    if (loadingToggles.has(toggleKey)) return;

    try {
      setLoadingToggles((prev) => new Set(prev).add(toggleKey));
      if (practicaActiva) {
        await planificacionesApi.desactivarPractica(asignacionId, claseId);
      } else {
        await planificacionesApi.activarPractica(asignacionId, claseId);
      }
      await loadAsignaciones();
    } catch (err) {
      const errorMessage = getErrorMessage(err as Error, 'Error al actualizar práctica');
      alert(errorMessage);
    } finally {
      setLoadingToggles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(toggleKey);
        return newSet;
      });
    }
  };

  // Toggle completo de clase (ambos)
  const handleToggleClase = async (asignacionId: string, claseId: string, activa: boolean) => {
    const toggleKey = `${asignacionId}-${claseId}-clase`;
    if (loadingToggles.has(toggleKey)) return;

    try {
      setLoadingToggles((prev) => new Set(prev).add(toggleKey));
      if (activa) {
        await planificacionesApi.desactivarClase(asignacionId, claseId);
      } else {
        await planificacionesApi.activarClase(asignacionId, claseId);
      }
      await loadAsignaciones();
    } catch (err) {
      const errorMessage = getErrorMessage(err as Error, 'Error al actualizar clase');
      alert(errorMessage);
    } finally {
      setLoadingToggles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(toggleKey);
        return newSet;
      });
    }
  };

  const handleVerProgreso = async (asignacionId: string) => {
    try {
      const data = await planificacionesApi.getProgresoEstudiantes(asignacionId);
      setProgresos(data.progresos);
      setShowProgressModal(true);
    } catch (err) {
      const errorMessage = getErrorMessage(err as Error, 'Error al cargar progreso');
      alert(errorMessage);
    }
  };

  // Funciones para gestión de tareas
  const handleOpenTareas = async (asignacionId: string, claseId: string) => {
    setSelectedClaseId(claseId);
    setShowTareasModal(true);
    setLoadingTareas(true);
    try {
      const data = await planificacionesApi.getTareasClase(asignacionId, claseId);
      setTareas(data.tareas);
    } catch (err) {
      const errorMessage = getErrorMessage(err as Error, 'Error al cargar tareas');
      alert(errorMessage);
      setShowTareasModal(false);
    } finally {
      setLoadingTareas(false);
    }
  };

  const handleToggleTarea = async (tareaId: string, asignada: boolean) => {
    if (!selectedAsignacion) return;
    setLoadingTareaToggle(tareaId);
    try {
      if (asignada) {
        await planificacionesApi.desasignarTarea(selectedAsignacion.id, tareaId);
      } else {
        await planificacionesApi.asignarTarea(selectedAsignacion.id, tareaId);
      }
      // Recargar tareas
      if (selectedClaseId) {
        const data = await planificacionesApi.getTareasClase(
          selectedAsignacion.id,
          selectedClaseId,
        );
        setTareas(data.tareas);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err as Error, 'Error al actualizar tarea');
      alert(errorMessage);
    } finally {
      setLoadingTareaToggle(null);
    }
  };

  const closeTareasModal = () => {
    setShowTareasModal(false);
    setSelectedClaseId(null);
    setTareas([]);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-slate-900/30 border border-slate-800 rounded-3xl items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Cargando planificaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-slate-900/30 border border-slate-800 rounded-3xl items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-400 font-medium mb-4">{error}</p>
        <button
          onClick={loadAsignaciones}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden relative">
      {/* Header */}
      <div className="p-6 border-b border-slate-800/50 flex items-center justify-between bg-slate-950/20">
        <div className="flex items-center gap-4">
          {selectedAsignacion ? (
            <button
              onClick={() => setSelectedAsignacionId(null)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
          ) : null}
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <ClipboardList className="text-indigo-500" />
              {selectedAsignacion ? 'Detalle de Planificación' : 'Mis Planificaciones'}
            </h2>
            <p className="text-sm text-slate-400">
              {selectedAsignacion
                ? `Gestionando contenido para ${selectedAsignacion.claseGrupo.nombre}`
                : 'Gestiona el progreso y contenido de tus grupos'}
            </p>
          </div>
        </div>

        {selectedAsignacion && (
          <button
            onClick={() => handleVerProgreso(selectedAsignacion.id)}
            className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Ver Progreso
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
        {asignaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-white mb-2">No hay planificaciones asignadas</h3>
            <p className="text-slate-400 max-w-md">
              Cuando el administrador te asigne una planificación, aparecerá aquí para que puedas
              gestionar el contenido de tus clases.
            </p>
          </div>
        ) : !selectedAsignacion ? (
          // List View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {asignaciones.map((asignacion) => {
              const progress = getAsignacionProgress(asignacion);
              const clasesActivas = asignacion.clases.filter((c) => {
                const estado = getEstadoClase(asignacion, c.id);
                return estado.activa;
              }).length;

              return (
                <div
                  key={asignacion.id}
                  className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 hover:bg-slate-800/40 hover:border-slate-700 transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-lg">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
                        {asignacion.claseGrupo.nombre}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-lg text-slate-500 group-hover:text-white transition-colors">
                      <Layers size={18} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight mb-2 line-clamp-2 min-h-[3rem]">
                      {asignacion.planificacion.titulo}
                    </h3>
                    <p className="text-sm text-slate-400 flex items-center gap-2">
                      <Clock size={14} />
                      {clasesActivas} de {asignacion.clases.length} clases activas
                    </p>
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                      <span>Progreso</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <button
                      onClick={() => setSelectedAsignacionId(asignacion.id)}
                      className="w-full mt-6 py-3 bg-slate-800 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-indigo-600/20"
                    >
                      Ver Contenido
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Detail View
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-lg font-bold text-white">
                {selectedAsignacion.planificacion.titulo}
              </h3>
              <div className="text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                Progreso General: {getAsignacionProgress(selectedAsignacion)}%
              </div>
            </div>

            {selectedAsignacion.clases.map((clase) => {
              const estado = getEstadoClase(selectedAsignacion, clase.id);
              const isLoadingTeoria = loadingToggles.has(
                `${selectedAsignacion.id}-${clase.id}-teoria`,
              );
              const isLoadingPractica = loadingToggles.has(
                `${selectedAsignacion.id}-${clase.id}-practica`,
              );
              const isLoadingClase = loadingToggles.has(
                `${selectedAsignacion.id}-${clase.id}-clase`,
              );

              return (
                <div
                  key={clase.id}
                  className={`flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl border transition-all ${
                    estado.activa
                      ? 'bg-slate-900/60 border-slate-700'
                      : 'bg-slate-950/30 border-slate-800 opacity-70'
                  }`}
                >
                  {/* Clase Indicator */}
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                        estado.ambas_activas
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : estado.activa
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      <span className="font-bold text-lg">{clase.numero}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={`font-bold truncate ${estado.activa ? 'text-white' : 'text-slate-400'}`}
                        >
                          {clase.titulo}
                        </h4>
                        {estado.ambas_activas && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold uppercase">
                            Completa
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <BookOpen
                            size={12}
                            className={estado.teoria_activa ? 'text-blue-400' : ''}
                          />
                          Teoría: {estado.teoria_activa ? 'Activa' : 'Inactiva'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                        <span className="flex items-center gap-1">
                          <FlaskConical
                            size={12}
                            className={estado.practica_activa ? 'text-purple-400' : ''}
                          />
                          Práctica: {estado.practica_activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 md:border-l border-slate-800 md:pl-4 pt-2 md:pt-0 justify-end flex-wrap">
                    {/* Toggle Teoría */}
                    <button
                      onClick={() =>
                        handleToggleTeoria(selectedAsignacion.id, clase.id, estado.teoria_activa)
                      }
                      disabled={isLoadingTeoria}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border transition-all ${
                        isLoadingTeoria
                          ? 'opacity-50 cursor-not-allowed'
                          : estado.teoria_activa
                            ? 'bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30'
                            : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {isLoadingTeoria ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <BookOpen size={14} />
                      )}
                      Teoría
                      {estado.teoria_activa && !isLoadingTeoria && (
                        <CheckCircle size={12} className="ml-1" />
                      )}
                    </button>

                    {/* Toggle Práctica */}
                    <button
                      onClick={() =>
                        handleTogglePractica(
                          selectedAsignacion.id,
                          clase.id,
                          estado.practica_activa,
                        )
                      }
                      disabled={isLoadingPractica}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border transition-all ${
                        isLoadingPractica
                          ? 'opacity-50 cursor-not-allowed'
                          : estado.practica_activa
                            ? 'bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30'
                            : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {isLoadingPractica ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <FlaskConical size={14} />
                      )}
                      Práctica
                      {estado.practica_activa && !isLoadingPractica && (
                        <CheckCircle size={12} className="ml-1" />
                      )}
                    </button>

                    <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden md:block"></div>

                    {/* Toggle Todo */}
                    <button
                      onClick={() =>
                        handleToggleClase(selectedAsignacion.id, clase.id, estado.ambas_activas)
                      }
                      disabled={isLoadingClase}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border transition-all ${
                        isLoadingClase
                          ? 'opacity-50 cursor-not-allowed'
                          : estado.ambas_activas
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30'
                            : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {isLoadingClase ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : estado.ambas_activas ? (
                        <CheckCircle size={14} />
                      ) : (
                        <XCircle size={14} />
                      )}
                      {estado.ambas_activas ? 'Todo Activo' : 'Activar Todo'}
                    </button>

                    <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden md:block"></div>

                    {/* Botón Tareas */}
                    <button
                      onClick={() => handleOpenTareas(selectedAsignacion.id, clase.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border transition-all bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                    >
                      <ListTodo size={14} />
                      Tareas
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Progreso */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-2 border-emerald-400/50 p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-white">Progreso de Estudiantes</h3>
                {selectedAsignacion && (
                  <p className="text-sm text-slate-400 mt-1">
                    {selectedAsignacion.planificacion.titulo} -{' '}
                    {selectedAsignacion.claseGrupo.nombre}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowProgressModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition-all"
              >
                Cerrar
              </button>
            </div>

            {progresos.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">No hay estudiantes con progreso aún</p>
                <p className="text-sm text-slate-500 mt-1">
                  Los estudiantes aparecerán aquí cuando empiecen a avanzar
                </p>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1">
                <table className="w-full">
                  <thead className="sticky top-0 bg-slate-800">
                    <tr className="border-b-2 border-slate-600">
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-300 uppercase">
                        Estudiante
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-300 uppercase">
                        Clase
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-slate-300 uppercase">
                        <div className="flex items-center justify-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                          Teoría
                        </div>
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-slate-300 uppercase">
                        <div className="flex items-center justify-center gap-1">
                          <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
                          Práctica
                        </div>
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-slate-300 uppercase">
                        Tiempo
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
                        <td className="px-4 py-3">
                          <p className="text-white">
                            <span className="font-bold text-emerald-400">
                              {progreso.clase_numero}.
                            </span>{' '}
                            <span className="text-slate-300">{progreso.clase_titulo}</span>
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {progreso.teoria_completada ? (
                            <CheckCircle className="w-5 h-5 text-blue-400 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-500 mx-auto" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {progreso.practica_completada ? (
                            <CheckCircle className="w-5 h-5 text-purple-400 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-500 mx-auto" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-slate-300 text-sm font-mono">
                            {Math.round(
                              (progreso.tiempo_teoria_segundos +
                                progreso.tiempo_practica_segundos) /
                                60,
                            )}{' '}
                            min
                          </span>
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

      {/* Modal Tareas */}
      {showTareasModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-2 border-amber-400/50 p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <ListTodo className="text-amber-400" />
                  Tareas de la Clase
                </h3>
                {selectedClase && (
                  <p className="text-sm text-slate-400 mt-1">
                    Clase {selectedClase.numero}: {selectedClase.titulo}
                  </p>
                )}
              </div>
              <button
                onClick={closeTareasModal}
                className="px-4 py-2 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition-all"
              >
                Cerrar
              </button>
            </div>

            {loadingTareas ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              </div>
            ) : tareas.length === 0 ? (
              <div className="text-center py-12">
                <ListTodo className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">No hay tareas configuradas para esta clase</p>
                <p className="text-sm text-slate-500 mt-1">
                  Las tareas se definen en la planificación por el administrador
                </p>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 space-y-3">
                {tareas.map((tarea) => {
                  const isLoading = loadingTareaToggle === tarea.id;
                  return (
                    <div
                      key={tarea.id}
                      className={`p-4 rounded-xl border transition-all ${
                        tarea.asignada
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : 'bg-slate-800/50 border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-white">{tarea.contenido_titulo}</h4>
                            {tarea.obligatoria && (
                              <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30 font-bold uppercase">
                                Obligatoria
                              </span>
                            )}
                          </div>
                          {tarea.fecha_limite && (
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar size={12} />
                              Fecha límite:{' '}
                              {new Date(tarea.fecha_limite).toLocaleDateString('es-AR')}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleToggleTarea(tarea.id, tarea.asignada)}
                          disabled={isLoading}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border transition-all ${
                            isLoading
                              ? 'opacity-50 cursor-not-allowed'
                              : tarea.asignada
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {isLoading ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : tarea.asignada ? (
                            <CheckCircle size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}
                          {tarea.asignada ? 'Asignada' : 'Sin asignar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
