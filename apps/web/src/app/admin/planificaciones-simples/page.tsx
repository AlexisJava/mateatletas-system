'use client';

import { useEffect, useState } from 'react';
import {
  listarPlanificaciones,
  type PlanificacionSimple,
  type FiltrosPlanificaciones,
} from '@/lib/api/planificaciones-simples.api';
import { getErrorMessage } from '@/lib/utils/error-handler';
import { Calendar, TrendingUp, Sparkles, Filter } from 'lucide-react';

export default function AdminPlanificacionesSimplesPage() {
  // State
  const [planificaciones, setPlanificaciones] = useState<PlanificacionSimple[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filtros, setFiltros] = useState<FiltrosPlanificaciones>({});
  const [estadoFiltro, setEstadoFiltro] = useState<string>('TODAS');
  const [grupoFiltro, setGrupoFiltro] = useState<string>('TODOS');
  const [anioFiltro, setAnioFiltro] = useState<string>('TODOS');

  // Load planificaciones
  useEffect(() => {
    loadPlanificaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros]);

  const loadPlanificaciones = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await listarPlanificaciones(filtros);
      setPlanificaciones(data);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Error al cargar planificaciones');
      setError(errorMessage);
      setPlanificaciones([]);
      console.error('Error loading planificaciones:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    const nuevosFiltros: FiltrosPlanificaciones = {};

    if (estadoFiltro !== 'TODAS') {
      nuevosFiltros.estado = estadoFiltro as 'DETECTADA' | 'ASIGNADA' | 'ARCHIVADA';
    }
    if (grupoFiltro !== 'TODOS') {
      nuevosFiltros.grupo_codigo = grupoFiltro;
    }
    if (anioFiltro !== 'TODOS') {
      nuevosFiltros.anio = parseInt(anioFiltro);
    }

    setFiltros(nuevosFiltros);
  };

  const limpiarFiltros = () => {
    setEstadoFiltro('TODAS');
    setGrupoFiltro('TODOS');
    setAnioFiltro('TODOS');
    setFiltros({});
  };

  // Stats
  const totalPlanificaciones = planificaciones.length;
  const detectadas = planificaciones.filter((p) => p.estado === 'DETECTADA').length;
  const asignadas = planificaciones.filter((p) => p.estado === 'ASIGNADA').length;

  // Grupos únicos
  const gruposUnicos = Array.from(
    new Set(planificaciones.map((p) => p.grupo_codigo).filter(Boolean)),
  ).sort();

  // Años únicos
  const aniosUnicos = Array.from(
    new Set(planificaciones.map((p) => p.anio).filter(Boolean)),
  ).sort((a, b) => b - a);

  return (
    <div className="flex flex-col relative">
      {/* Partículas flotantes de fondo - MATEATLETAS OS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-20" />
        <div className="absolute top-40 right-40 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-20 animation-delay-2000" />
        <div className="absolute bottom-40 left-60 w-2 h-2 bg-violet-400 rounded-full animate-ping opacity-20 animation-delay-4000" />
      </div>

      {/* Header estilo MATEATLETAS OS */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent drop-shadow-lg mb-1">
            Planificaciones Auto-Detectables
          </h1>
          <p className="text-sm text-slate-300 font-medium">
            Sistema de planificaciones con Convention over Configuration
          </p>
        </div>

        {/* Botón de refrescar */}
        <button
          onClick={loadPlanificaciones}
          disabled={isLoading}
          className="group relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-violet-500/20 backdrop-blur-xl border border-cyan-400/50 hover:border-cyan-400 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/50 disabled:opacity-50"
        >
          <div className="flex items-center gap-2">
            <Sparkles
              className={`w-5 h-5 text-cyan-300 group-hover:text-cyan-200 transition-colors ${isLoading ? 'animate-spin' : ''}`}
              strokeWidth={2.5}
            />
            <span className="text-sm font-bold text-white">
              {isLoading ? 'Detectando...' : 'Detectar Nuevas'}
            </span>
          </div>
        </button>
      </div>

      {/* Stats Cards - Estilo MATEATLETAS OS */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 relative z-10">
          {/* Total */}
          <div className="group relative rounded-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-violet-500/20 backdrop-blur-xl rounded-2xl" />
            <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/50 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-cyan-500/50" />
            <div className="relative p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-white/60 mb-2 font-bold uppercase tracking-wide">
                    Total Planificaciones
                  </p>
                  <p className="text-4xl font-black text-white mb-2 drop-shadow-lg leading-none">
                    {totalPlanificaciones}
                  </p>
                  <span className="text-xs text-white/40 font-medium">auto-detectadas</span>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <Calendar className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>

          {/* Detectadas */}
          <div className="group relative rounded-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-amber-500/20 backdrop-blur-xl rounded-2xl" />
            <div className="absolute inset-0 rounded-2xl border-2 border-yellow-400/50 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-yellow-500/50" />
            <div className="relative p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-white/60 mb-2 font-bold uppercase tracking-wide">
                    Detectadas
                  </p>
                  <p className="text-4xl font-black text-white mb-2 drop-shadow-lg leading-none">
                    {detectadas}
                  </p>
                  <span className="text-xs text-white/40 font-medium">sin asignar</span>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/50">
                  <Sparkles className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>

          {/* Asignadas */}
          <div className="group relative rounded-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 backdrop-blur-xl rounded-2xl" />
            <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400/50 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-emerald-500/50" />
            <div className="relative p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-white/60 mb-2 font-bold uppercase tracking-wide">
                    Asignadas
                  </p>
                  <p className="text-4xl font-black text-white mb-2 drop-shadow-lg leading-none">
                    {asignadas}
                  </p>
                  <span className="text-xs text-emerald-300 font-bold">✓ Activas</span>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                  <TrendingUp className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="relative z-10 mb-6">
        <div className="rounded-2xl bg-gradient-to-br from-slate-800/50 via-slate-700/50 to-slate-800/50 backdrop-blur-xl border-2 border-slate-600/50 p-5">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-slate-300" strokeWidth={2.5} />
            <h3 className="text-lg font-bold text-white">Filtros</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Estado */}
            <div>
              <label className="block text-xs text-slate-400 font-bold mb-2 uppercase tracking-wide">
                Estado
              </label>
              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border-2 border-slate-700 text-white font-medium focus:border-cyan-400 focus:outline-none transition-colors"
              >
                <option value="TODAS">Todas</option>
                <option value="DETECTADA">Detectadas</option>
                <option value="ASIGNADA">Asignadas</option>
                <option value="ARCHIVADA">Archivadas</option>
              </select>
            </div>

            {/* Grupo */}
            <div>
              <label className="block text-xs text-slate-400 font-bold mb-2 uppercase tracking-wide">
                Grupo
              </label>
              <select
                value={grupoFiltro}
                onChange={(e) => setGrupoFiltro(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border-2 border-slate-700 text-white font-medium focus:border-cyan-400 focus:outline-none transition-colors"
              >
                <option value="TODOS">Todos</option>
                {gruposUnicos.map((grupo, index) => (
                  <option key={`grupo-${grupo}-${index}`} value={grupo}>
                    {grupo}
                  </option>
                ))}
              </select>
            </div>

            {/* Año */}
            <div>
              <label className="block text-xs text-slate-400 font-bold mb-2 uppercase tracking-wide">
                Año
              </label>
              <select
                value={anioFiltro}
                onChange={(e) => setAnioFiltro(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border-2 border-slate-700 text-white font-medium focus:border-cyan-400 focus:outline-none transition-colors"
              >
                <option value="TODOS">Todos</option>
                {aniosUnicos.map((anio, index) => (
                  <option key={`anio-${anio}-${index}`} value={anio}>
                    {anio}
                  </option>
                ))}
              </select>
            </div>

            {/* Botones */}
            <div className="flex items-end gap-2">
              <button
                onClick={aplicarFiltros}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-2 border-cyan-400/50 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
              >
                Aplicar
              </button>
              <button
                onClick={limpiarFiltros}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-700/50 border-2 border-slate-600 text-slate-300 font-bold hover:bg-slate-600/50 transition-all duration-300"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="relative z-10 mb-6">
          <div className="rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-xl border-2 border-red-400/50 p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-white mb-2">Error de Sistema</h3>
                <p className="text-red-200 text-sm mb-4">{error}</p>
                <button
                  onClick={loadPlanificaciones}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500/30 to-orange-500/30 border border-red-400/50 text-white font-bold text-sm hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="relative z-10 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-bold">Cargando planificaciones...</p>
          </div>
        </div>
      )}

      {/* Tabla de Planificaciones */}
      {!isLoading && !error && planificaciones.length > 0 && (
        <div className="relative z-10">
          <div className="rounded-2xl bg-gradient-to-br from-slate-800/50 via-slate-700/50 to-slate-800/50 backdrop-blur-xl border-2 border-slate-600/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-600">
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wide">
                      Código
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wide">
                      Título
                    </th>
                    <th className="text-center px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wide">
                      Grupo
                    </th>
                    <th className="text-center px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wide">
                      Mes/Año
                    </th>
                    <th className="text-center px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wide">
                      Semanas
                    </th>
                    <th className="text-center px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wide">
                      Estado
                    </th>
                    <th className="text-center px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wide">
                      Estudiantes
                    </th>
                    <th className="text-center px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wide">
                      Asignaciones
                    </th>
                    <th className="text-center px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wide">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {planificaciones.map((planificacion, index) => (
                    <tr
                      key={planificacion.id}
                      className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${
                        index % 2 === 0 ? 'bg-slate-800/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <code className="text-xs text-cyan-300 font-mono bg-slate-900/50 px-2 py-1 rounded">
                          {planificacion.codigo}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-white">{planificacion.titulo}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-violet-500/20 border border-violet-400/50 text-violet-300 text-xs font-bold">
                          {planificacion.grupo_codigo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-300 font-medium">
                          {planificacion.mes ? `${planificacion.mes}/` : ''}
                          {planificacion.anio}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-300 font-bold">
                          {planificacion.semanas_total}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {planificacion.estado === 'DETECTADA' && (
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-yellow-500/20 border border-yellow-400/50 text-yellow-300 text-xs font-bold">
                            ⚡ Detectada
                          </span>
                        )}
                        {planificacion.estado === 'ASIGNADA' && (
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-green-500/20 border border-green-400/50 text-green-300 text-xs font-bold">
                            ✓ Asignada
                          </span>
                        )}
                        {planificacion.estado === 'ARCHIVADA' && (
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-slate-500/20 border border-slate-400/50 text-slate-300 text-xs font-bold">
                            📦 Archivada
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-300 font-bold">
                          {planificacion._count?.progresosEstudiantes || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-300 font-bold">
                          {planificacion.asignaciones?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() =>
                            (window.location.href = `/admin/planificaciones-simples/${planificacion.codigo}`)
                          }
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-400/50 text-white text-xs font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && planificaciones.length === 0 && (
        <div className="relative z-10 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              No hay planificaciones detectadas
            </h3>
            <p className="text-slate-400 mb-6">
              Crea archivos .tsx en /planificaciones/ y ejecuta la auto-detección
            </p>
            <button
              onClick={loadPlanificaciones}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-2 border-cyan-400/50 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
            >
              Ejecutar Auto-Detección
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
