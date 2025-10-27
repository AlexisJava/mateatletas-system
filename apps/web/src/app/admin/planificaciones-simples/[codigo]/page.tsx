'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  obtenerDetallePlanificacion,
  asignarPlanificacion,
  type DetallePlanificacion,
} from '@/lib/api/planificaciones-simples.api';
import type { Docente } from '@/lib/api/docentes.api';
import { docentesApi } from '@/lib/api/docentes.api';
import { listarClaseGrupos, type ClaseGrupo } from '@/lib/api/clase-grupos.api';
import { getErrorMessage } from '@/lib/utils/error-handler';
import {
  ArrowLeft,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  Plus,
  User,
} from 'lucide-react';

export default function DetallePlanificacionPage() {
  const params = useParams();
  const router = useRouter();
  const codigo = params?.codigo as string;

  // State
  const [planificacion, setPlanificacion] = useState<DetallePlanificacion | null>(null);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [grupos, setGrupos] = useState<ClaseGrupo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal asignación
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState<string>('');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string>('');
  const [isAsignando, setIsAsignando] = useState(false);

  // Load data
  useEffect(() => {
    if (codigo) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [planificacionData, docentesData, gruposData] = await Promise.all([
        obtenerDetallePlanificacion(codigo),
        docentesApi.getAll(),
        listarClaseGrupos({}),
      ]);

      setPlanificacion(planificacionData);
      setDocentes(docentesData);
      setGrupos(gruposData.data);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Error al cargar datos');
      setError(errorMessage);
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAsignar = async () => {
    if (!docenteSeleccionado || !grupoSeleccionado) {
      alert('Debe seleccionar un docente y un grupo');
      return;
    }

    try {
      setIsAsignando(true);
      await asignarPlanificacion(codigo, docenteSeleccionado, grupoSeleccionado);

      // Reload data
      await loadData();

      // Reset form
      setDocenteSeleccionado('');
      setGrupoSeleccionado('');
      setShowAsignarModal(false);

      alert('Planificación asignada exitosamente');
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Error al asignar planificación');
      alert(errorMessage);
      console.error('Error assigning planificacion:', err);
    } finally {
      setIsAsignando(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-bold">Cargando planificación...</p>
        </div>
      </div>
    );
  }

  if (error || !planificacion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-red-200 mb-6">{error || 'Planificación no encontrada'}</p>
          <button
            onClick={() => router.push('/admin/planificaciones-simples')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-2 border-cyan-400/50 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
          >
            Volver al Listado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col relative pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/admin/planificaciones-simples')}
          className="p-2 rounded-xl bg-slate-800/50 border border-slate-600 hover:bg-slate-700/50 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="flex-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent drop-shadow-lg mb-1">
            {planificacion.titulo}
          </h1>
          <p className="text-sm text-slate-300 font-medium">
            <code className="text-cyan-300 bg-slate-900/50 px-2 py-1 rounded">
              {planificacion.codigo}
            </code>
          </p>
        </div>

        {/* Estado */}
        <div>
          {planificacion.estado === 'DETECTADA' && (
            <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-yellow-500/20 border-2 border-yellow-400/50 text-yellow-300 text-sm font-bold">
              ⚡ Detectada
            </span>
          )}
          {planificacion.estado === 'ASIGNADA' && (
            <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-green-500/20 border-2 border-green-400/50 text-green-300 text-sm font-bold">
              ✓ Asignada
            </span>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        {/* Grupo */}
        <div className="rounded-2xl bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 backdrop-blur-xl border-2 border-violet-400/50 p-5">
          <Users className="w-6 h-6 text-violet-300 mb-3" strokeWidth={2.5} />
          <p className="text-xs text-white/60 font-bold uppercase tracking-wide mb-1">Grupo</p>
          <p className="text-2xl font-black text-white">{planificacion.grupo_codigo}</p>
        </div>

        {/* Mes/Año */}
        <div className="rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 backdrop-blur-xl border-2 border-cyan-400/50 p-5">
          <Calendar className="w-6 h-6 text-cyan-300 mb-3" strokeWidth={2.5} />
          <p className="text-xs text-white/60 font-bold uppercase tracking-wide mb-1">Período</p>
          <p className="text-2xl font-black text-white">
            {planificacion.mes ? `${planificacion.mes}/` : ''}
            {planificacion.anio}
          </p>
        </div>

        {/* Semanas */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 backdrop-blur-xl border-2 border-amber-400/50 p-5">
          <Clock className="w-6 h-6 text-amber-300 mb-3" strokeWidth={2.5} />
          <p className="text-xs text-white/60 font-bold uppercase tracking-wide mb-1">Semanas</p>
          <p className="text-2xl font-black text-white">{planificacion.semanas_total}</p>
        </div>

        {/* Estudiantes */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 backdrop-blur-xl border-2 border-emerald-400/50 p-5">
          <CheckCircle className="w-6 h-6 text-emerald-300 mb-3" strokeWidth={2.5} />
          <p className="text-xs text-white/60 font-bold uppercase tracking-wide mb-1">
            Estudiantes
          </p>
          <p className="text-2xl font-black text-white">
            {planificacion.progresosEstudiantes?.length || 0}
          </p>
        </div>
      </div>

      {/* Asignaciones */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-800/50 via-slate-700/50 to-slate-800/50 backdrop-blur-xl border-2 border-slate-600/50 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Asignaciones a Docentes</h2>
          <button
            onClick={() => setShowAsignarModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-400/50 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Asignar a Docente
          </button>
        </div>

        {planificacion.asignaciones && planificacion.asignaciones.length > 0 ? (
          <div className="space-y-3">
            {planificacion.asignaciones.map((asignacion) => (
              <div
                key={asignacion.id}
                className="rounded-xl bg-slate-900/50 border border-slate-700 p-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold">
                        {asignacion.docente?.nombre} {asignacion.docente?.apellido}
                      </p>
                      <p className="text-sm text-slate-400">{asignacion.docente?.email}</p>
                      <p className="text-xs text-cyan-300 mt-1">
                        Grupo: {asignacion.claseGrupo?.nombre || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Semanas Activas</p>
                      <p className="text-lg font-bold text-white">
                        {asignacion.semanasActivas?.filter((s) => s.activa).length || 0} /{' '}
                        {planificacion.semanas_total}
                      </p>
                    </div>

                    {asignacion.activa ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-green-500/20 border border-green-400/50 text-green-300 text-xs font-bold">
                        ✓ Activa
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-500/20 border border-slate-400/50 text-slate-300 text-xs font-bold">
                        Inactiva
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">👨‍🏫</div>
            <p className="text-slate-400 mb-4">No hay asignaciones aún</p>
            <button
              onClick={() => setShowAsignarModal(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-2 border-cyan-400/50 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
            >
              Asignar Docente
            </button>
          </div>
        )}
      </div>

      {/* Progreso de Estudiantes */}
      {planificacion.progresosEstudiantes && planificacion.progresosEstudiantes.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-slate-800/50 via-slate-700/50 to-slate-800/50 backdrop-blur-xl border-2 border-slate-600/50 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Progreso de Estudiantes</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-600">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-300 uppercase">
                    Estudiante
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-300 uppercase">
                    Semana Actual
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-300 uppercase">
                    Tiempo (min)
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-300 uppercase">
                    Puntos
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-300 uppercase">
                    Última Actividad
                  </th>
                </tr>
              </thead>
              <tbody>
                {planificacion.progresosEstudiantes.map((progreso, index) => (
                  <tr
                    key={progreso.id}
                    className={`border-b border-slate-700/50 ${index % 2 === 0 ? 'bg-slate-800/20' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">
                        {progreso.estudiante?.nombre} {progreso.estudiante?.apellido}
                      </p>
                      <p className="text-xs text-slate-400">{progreso.estudiante?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-white font-bold">
                        {progreso.semana_actual} / {planificacion.semanas_total}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-white font-medium">
                        {progreso.tiempo_total_minutos}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-cyan-300 font-bold">{progreso.puntos_totales}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-slate-400 text-xs">
                        {new Date(progreso.ultima_actividad).toLocaleString('es-AR')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Asignar */}
      {showAsignarModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-2 border-cyan-400/50 p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-6">Asignar a Docente</h3>

            <div className="space-y-4 mb-6">
              {/* Docente */}
              <div>
                <label className="block text-sm text-slate-300 font-bold mb-2">Docente</label>
                <select
                  value={docenteSeleccionado}
                  onChange={(e) => setDocenteSeleccionado(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border-2 border-slate-700 text-white font-medium focus:border-cyan-400 focus:outline-none"
                  disabled={isAsignando}
                >
                  <option value="">Seleccionar docente...</option>
                  {docentes.map((docente) => (
                    <option key={docente.id} value={docente.id}>
                      {docente.nombre} {docente.apellido} ({docente.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Grupo */}
              <div>
                <label className="block text-sm text-slate-300 font-bold mb-2">Grupo/Comisión</label>
                <select
                  value={grupoSeleccionado}
                  onChange={(e) => setGrupoSeleccionado(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border-2 border-slate-700 text-white font-medium focus:border-cyan-400 focus:outline-none"
                  disabled={isAsignando}
                >
                  <option value="">Seleccionar grupo...</option>
                  {grupos.map((grupo) => (
                    <option key={grupo.id} value={grupo.id}>
                      {grupo.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAsignarModal(false);
                  setDocenteSeleccionado('');
                  setGrupoSeleccionado('');
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-700 border-2 border-slate-600 text-white font-bold hover:bg-slate-600 transition-all"
                disabled={isAsignando}
              >
                Cancelar
              </button>
              <button
                onClick={handleAsignar}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-2 border-cyan-400/50 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50"
                disabled={isAsignando || !docenteSeleccionado || !grupoSeleccionado}
              >
                {isAsignando ? 'Asignando...' : 'Asignar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
