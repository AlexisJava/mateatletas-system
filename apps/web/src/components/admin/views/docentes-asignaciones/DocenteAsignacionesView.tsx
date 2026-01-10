'use client';

import { RefreshCw, AlertCircle } from 'lucide-react';
import { useDocenteAsignaciones } from './hooks/useDocenteAsignaciones';
import { AsignacionesFilters } from './components/AsignacionesFilters';
import { AsignacionesStatsGrid } from './components/AsignacionesStatsGrid';
import { DocenteAsignacionesCard } from './components/DocenteAsignacionesCard';
import { DocenteDetailModal } from './components/DocenteDetailModal';

/**
 * Vista de Asignaciones Casa/Mundo para Docentes
 * Sistema Casa/Mundo 2026 - FASE 2 Frontend
 */
export function DocenteAsignacionesView() {
  const {
    isLoading,
    error,
    docentes,
    filtros,
    setFiltros,
    clearFiltros,
    stats,
    selectedDocente,
    setSelectedDocente,
    handleAsignarCasa,
    handleRemoverCasa,
    handleAsignarMundo,
    handleRemoverMundo,
    handleActualizarTipoAsignacion,
    refetch,
  } = useDocenteAsignaciones();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Asignaciones Casa/Mundo</h1>
          <p className="text-slate-400 mt-1">
            Gestiona las asignaciones de docentes a Casas y Mundos
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <AsignacionesStatsGrid stats={stats} isLoading={isLoading} />

      {/* Filters */}
      <AsignacionesFilters filtros={filtros} onFiltrosChange={setFiltros} onClear={clearFiltros} />

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-400 font-medium">Error al cargar docentes</p>
            <p className="text-red-400/70 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-800/50 rounded-xl p-4 animate-pulse">
              <div className="h-32 bg-slate-700/50 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && docentes.length === 0 && (
        <div className="bg-slate-800/50 rounded-xl p-8 text-center">
          <p className="text-slate-400">No se encontraron docentes con los filtros aplicados</p>
          <button
            onClick={clearFiltros}
            className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Grid de docentes */}
      {!isLoading && !error && docentes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docentes.map((docente) => (
            <DocenteAsignacionesCard
              key={docente.id}
              docente={docente}
              onAsignarCasa={(casa) => handleAsignarCasa(docente.id, casa)}
              onRemoverCasa={(casa) => handleRemoverCasa(docente.id, casa)}
              onAsignarMundo={(mundo) => handleAsignarMundo(docente.id, mundo)}
              onRemoverMundo={(mundo) => handleRemoverMundo(docente.id, mundo)}
              onSelect={() => setSelectedDocente(docente)}
            />
          ))}
        </div>
      )}

      {/* Modal de detalle */}
      {selectedDocente && (
        <DocenteDetailModal
          docente={selectedDocente}
          isOpen={!!selectedDocente}
          onClose={() => setSelectedDocente(null)}
          onAsignarCasa={(casa) => handleAsignarCasa(selectedDocente.id, casa)}
          onRemoverCasa={(casa) => handleRemoverCasa(selectedDocente.id, casa)}
          onAsignarMundo={(mundo) => handleAsignarMundo(selectedDocente.id, mundo)}
          onRemoverMundo={(mundo) => handleRemoverMundo(selectedDocente.id, mundo)}
          onActualizarTipo={(tipo) => handleActualizarTipoAsignacion(selectedDocente.id, tipo)}
        />
      )}
    </div>
  );
}
