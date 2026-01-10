'use client';

import { RefreshCw, AlertCircle, Wand2 } from 'lucide-react';
import { useGruposPedagogicos } from './hooks/useGruposPedagogicos';
import { GruposFilters } from './components/GruposFilters';
import { GruposStatsGrid } from './components/GruposStatsGrid';
import { GrupoCard } from './components/GrupoCard';
import { GrupoEditModal } from './components/GrupoEditModal';

/**
 * Vista de Grupos Pedagógicos
 * Sistema Casa/Mundo 2026 - FASE 2 Frontend
 */
export function GruposPedagogicosView() {
  const {
    isLoading,
    error,
    grupos,
    filtros,
    setFiltros,
    clearFiltros,
    stats,
    selectedGrupo,
    setSelectedGrupo,
    handleActualizarGrupo,
    handleMigrarLegacy,
    isMigrating,
    refetch,
  } = useGruposPedagogicos();

  const gruposSinAsignar = grupos.filter((g) => !g.casa_tipo || !g.mundo_tipo);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Grupos Pedagógicos</h1>
          <p className="text-slate-400 mt-1">Gestiona la asignación de Casa y Mundo a los grupos</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Botón migrar legacy */}
          {gruposSinAsignar.length > 0 && (
            <button
              onClick={handleMigrarLegacy}
              disabled={isMigrating}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg transition-colors disabled:opacity-50"
            >
              <Wand2 className={`w-4 h-4 ${isMigrating ? 'animate-spin' : ''}`} />
              {isMigrating ? 'Migrando...' : `Migrar ${gruposSinAsignar.length} grupos`}
            </button>
          )}
          <button
            onClick={refetch}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Stats */}
      <GruposStatsGrid stats={stats} isLoading={isLoading} />

      {/* Filters */}
      <GruposFilters filtros={filtros} onFiltrosChange={setFiltros} onClear={clearFiltros} />

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-400 font-medium">Error al cargar grupos</p>
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
      {!isLoading && !error && grupos.length === 0 && (
        <div className="bg-slate-800/50 rounded-xl p-8 text-center">
          <p className="text-slate-400">No se encontraron grupos con los filtros aplicados</p>
          <button
            onClick={clearFiltros}
            className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Grid de grupos */}
      {!isLoading && !error && grupos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grupos.map((grupo) => (
            <GrupoCard key={grupo.id} grupo={grupo} onSelect={() => setSelectedGrupo(grupo)} />
          ))}
        </div>
      )}

      {/* Modal de edición */}
      <GrupoEditModal
        grupo={selectedGrupo}
        isOpen={!!selectedGrupo}
        onClose={() => setSelectedGrupo(null)}
        onSave={handleActualizarGrupo}
      />
    </div>
  );
}
