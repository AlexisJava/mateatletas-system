'use client';

import { useEffect, useState } from 'react';
import {
  planificacionesApi,
  type Asignacion,
  type ProgresoEstudianteClase,
} from '@/lib/api/docentes.api';
import { getErrorMessage } from '@/lib/utils/error-handler';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  BookOpen,
  FlaskConical,
  Users,
  Clock,
  ChevronRight,
} from 'lucide-react';

export default function DocentePlanificacionesPage() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedAsignacionId, setSelectedAsignacionId] = useState<string | null>(null);
  const [progresos, setProgresos] = useState<ProgresoEstudianteClase[]>([]);
  const [expandedAsignaciones, setExpandedAsignaciones] = useState<Set<string>>(new Set());
  const [loadingToggles, setLoadingToggles] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAsignaciones();
  }, []);

  const loadAsignaciones = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await planificacionesApi.getMisAsignaciones();
      setAsignaciones(data);
      // Expandir la primera asignación por defecto
      const firstAsignacion = data[0];
      if (firstAsignacion) {
        setExpandedAsignaciones(new Set([firstAsignacion.id]));
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Error al cargar planificaciones');
      setError(errorMessage);
      console.error('Error loading asignaciones:', err);
    } finally {
      setIsLoading(false);
    }
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
      const errorMessage = getErrorMessage(err, 'Error al actualizar teoría');
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
      const errorMessage = getErrorMessage(err, 'Error al actualizar práctica');
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
      const errorMessage = getErrorMessage(err, 'Error al actualizar clase');
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
      setSelectedAsignacionId(asignacionId);
      setShowProgressModal(true);
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Error al cargar progreso');
      alert(errorMessage);
    }
  };

  const toggleExpanded = (asignacionId: string) => {
    setExpandedAsignaciones((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(asignacionId)) {
        newSet.delete(asignacionId);
      } else {
        newSet.add(asignacionId);
      }
      return newSet;
    });
  };

  // Helper para obtener el estado de una clase
  const getEstadoClase = (asignacion: Asignacion, claseId: string) => {
    const estado = asignacion.estadosClases.find((e) => e.clase.id === claseId);
    return {
      teoriaActiva: estado?.teoriaActiva ?? false,
      practicaActiva: estado?.practicaActiva ?? false,
      activa: (estado?.teoriaActiva || estado?.practicaActiva) ?? false,
      ambasActivas: (estado?.teoriaActiva && estado?.practicaActiva) ?? false,
    };
  };

  // Calcular estadísticas de una asignación
  const getAsignacionStats = (asignacion: Asignacion) => {
    let clasesActivas = 0;
    let teoriaActivas = 0;
    let practicaActivas = 0;

    asignacion.clases.forEach((clase) => {
      const estado = getEstadoClase(asignacion, clase.id);
      if (estado.teoriaActiva || estado.practicaActiva) clasesActivas++;
      if (estado.teoriaActiva) teoriaActivas++;
      if (estado.practicaActiva) practicaActivas++;
    });

    return { clasesActivas, teoriaActivas, practicaActivas };
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
        <p className="text-sm text-slate-300 font-medium">
          Gestiona las clases activas para tus grupos
        </p>
      </div>

      {/* Stats Globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 backdrop-blur-xl border-2 border-emerald-400/50 p-4">
          <Calendar className="w-5 h-5 text-emerald-300 mb-2" strokeWidth={2.5} />
          <p className="text-[10px] text-white/60 font-bold uppercase tracking-wide mb-1">
            Asignaciones
          </p>
          <p className="text-3xl font-black text-white">{asignaciones.length}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-violet-500/20 backdrop-blur-xl border-2 border-blue-400/50 p-4">
          <BookOpen className="w-5 h-5 text-blue-300 mb-2" strokeWidth={2.5} />
          <p className="text-[10px] text-white/60 font-bold uppercase tracking-wide mb-1">
            Clases Totales
          </p>
          <p className="text-3xl font-black text-white">
            {asignaciones.reduce((acc, a) => acc + a.clases.length, 0)}
          </p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-purple-500/20 via-fuchsia-500/20 to-pink-500/20 backdrop-blur-xl border-2 border-purple-400/50 p-4">
          <FlaskConical className="w-5 h-5 text-purple-300 mb-2" strokeWidth={2.5} />
          <p className="text-[10px] text-white/60 font-bold uppercase tracking-wide mb-1">
            Contenido Activo
          </p>
          <p className="text-3xl font-black text-white">
            {asignaciones.reduce((acc, a) => {
              const stats = getAsignacionStats(a);
              return acc + stats.teoriaActivas + stats.practicaActivas;
            }, 0)}
          </p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 backdrop-blur-xl border-2 border-amber-400/50 p-4">
          <Users className="w-5 h-5 text-amber-300 mb-2" strokeWidth={2.5} />
          <p className="text-[10px] text-white/60 font-bold uppercase tracking-wide mb-1">Grupos</p>
          <p className="text-3xl font-black text-white">{asignaciones.length}</p>
        </div>
      </div>

      {/* Asignaciones */}
      {asignaciones.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-slate-800/30 border-2 border-dashed border-slate-600">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-2xl font-bold text-white mb-2">No hay planificaciones asignadas</h3>
          <p className="text-slate-400">
            Cuando el admin te asigne una planificación, aparecerá aquí
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {asignaciones.map((asignacion) => {
            const stats = getAsignacionStats(asignacion);
            const isExpanded = expandedAsignaciones.has(asignacion.id);

            return (
              <div
                key={asignacion.id}
                className="rounded-2xl bg-gradient-to-br from-slate-800/80 via-slate-700/60 to-slate-800/80 backdrop-blur-xl border border-slate-600/50 overflow-hidden"
              >
                {/* Header de Asignación - Clickeable */}
                <div
                  onClick={() => toggleExpanded(asignacion.id)}
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-xl transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                    >
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-0.5">
                        {asignacion.planificacion.titulo}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {asignacion.claseGrupo.nombre}
                        </span>
                        <span>•</span>
                        <span>{asignacion.clases.length} clases</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Mini Stats */}
                    <div className="hidden md:flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30">
                        <BookOpen className="w-3.5 h-3.5 text-blue-300" />
                        <span className="text-sm font-bold text-blue-300">
                          {stats.teoriaActivas}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30">
                        <FlaskConical className="w-3.5 h-3.5 text-purple-300" />
                        <span className="text-sm font-bold text-purple-300">
                          {stats.practicaActivas}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVerProgreso(asignacion.id);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Progreso</span>
                    </button>
                  </div>
                </div>

                {/* Contenido Expandible - Clases */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 border-t border-slate-700/50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
                      {asignacion.clases.map((clase) => {
                        const estado = getEstadoClase(asignacion, clase.id);
                        const isLoadingTeoria = loadingToggles.has(
                          `${asignacion.id}-${clase.id}-teoria`,
                        );
                        const isLoadingPractica = loadingToggles.has(
                          `${asignacion.id}-${clase.id}-practica`,
                        );
                        const isLoadingClase = loadingToggles.has(
                          `${asignacion.id}-${clase.id}-clase`,
                        );

                        return (
                          <div
                            key={clase.id}
                            className={`p-4 rounded-xl border transition-all ${
                              estado.activa
                                ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/40'
                                : 'bg-slate-800/50 border-slate-700/50'
                            }`}
                          >
                            {/* Encabezado de Clase */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                                    estado.ambasActivas
                                      ? 'bg-emerald-500 text-white'
                                      : estado.activa
                                        ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                                        : 'bg-slate-700 text-slate-400'
                                  }`}
                                >
                                  {clase.numero}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white">{clase.titulo}</p>
                                  <p className="text-xs text-slate-500">Clase {clase.numero}</p>
                                </div>
                              </div>

                              {/* Toggle Todo */}
                              <button
                                onClick={() =>
                                  handleToggleClase(asignacion.id, clase.id, estado.activa)
                                }
                                disabled={isLoadingClase}
                                className={`p-1.5 rounded-lg transition-all ${
                                  isLoadingClase
                                    ? 'opacity-50 cursor-not-allowed'
                                    : estado.ambasActivas
                                      ? 'bg-emerald-500/30 text-emerald-300 hover:bg-emerald-500/40'
                                      : 'bg-slate-700/50 text-slate-500 hover:bg-slate-700'
                                }`}
                                title={estado.ambasActivas ? 'Desactivar todo' : 'Activar todo'}
                              >
                                {isLoadingClase ? (
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : estado.ambasActivas ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                              </button>
                            </div>

                            {/* Toggles Individuales */}
                            <div className="flex gap-2">
                              {/* Toggle Teoría */}
                              <button
                                onClick={() =>
                                  handleToggleTeoria(asignacion.id, clase.id, estado.teoriaActiva)
                                }
                                disabled={isLoadingTeoria}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                  isLoadingTeoria
                                    ? 'opacity-50 cursor-not-allowed'
                                    : estado.teoriaActiva
                                      ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50 hover:bg-blue-500/40'
                                      : 'bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700 hover:text-slate-300'
                                }`}
                              >
                                {isLoadingTeoria ? (
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <BookOpen className="w-4 h-4" />
                                )}
                                <span>Teoría</span>
                                {estado.teoriaActiva && !isLoadingTeoria && (
                                  <CheckCircle className="w-3.5 h-3.5 ml-auto" />
                                )}
                              </button>

                              {/* Toggle Práctica */}
                              <button
                                onClick={() =>
                                  handleTogglePractica(
                                    asignacion.id,
                                    clase.id,
                                    estado.practicaActiva,
                                  )
                                }
                                disabled={isLoadingPractica}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                  isLoadingPractica
                                    ? 'opacity-50 cursor-not-allowed'
                                    : estado.practicaActiva
                                      ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50 hover:bg-purple-500/40'
                                      : 'bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700 hover:text-slate-300'
                                }`}
                              >
                                {isLoadingPractica ? (
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <FlaskConical className="w-4 h-4" />
                                )}
                                <span>Práctica</span>
                                {estado.practicaActiva && !isLoadingPractica && (
                                  <CheckCircle className="w-3.5 h-3.5 ml-auto" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Progreso */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-2 border-emerald-400/50 p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-white">Progreso de Estudiantes</h3>
                {selectedAsignacionId && (
                  <p className="text-sm text-slate-400 mt-1">
                    {asignaciones.find((a) => a.id === selectedAsignacionId)?.planificacion.titulo}
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
                <Clock className="w-12 h-12 text-slate-500 mx-auto mb-3" />
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
                              {progreso.claseNumero}.
                            </span>{' '}
                            <span className="text-slate-300">{progreso.claseTitulo}</span>
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {progreso.teoriaCompletada ? (
                            <CheckCircle className="w-5 h-5 text-blue-400 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-500 mx-auto" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {progreso.practicaCompletada ? (
                            <CheckCircle className="w-5 h-5 text-purple-400 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-500 mx-auto" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-slate-300 text-sm font-mono">
                            {Math.round(
                              (progreso.tiempoTeoriaSegundos + progreso.tiempoPracticaSegundos) /
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
    </div>
  );
}
