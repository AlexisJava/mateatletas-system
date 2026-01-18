'use client';

import { useSuscripcionesFamiliares } from './hooks';
import {
  SuscripcionesStatsGrid,
  SuscripcionesFilters,
  SuscripcionesTable,
  SuscripcionDetailModal,
} from './components';

/**
 * SuscripcionesView - Vista de gestión de suscripciones familiares 2026
 *
 * Muestra todas las suscripciones familiares con:
 * - Estadísticas agregadas (total, por estado, ingreso estimado)
 * - Filtros por estado y búsqueda
 * - Tabla paginada con acciones
 * - Modal de detalle con inscripciones
 */
export function SuscripcionesView() {
  const {
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    estadoFilter,
    setEstadoFilter,
    page,
    setPage,
    totalPages,
    total,
    filteredSuscripciones,
    stats,
    selectedSuscripcion,
    setSelectedSuscripcion,
    refetch,
  } = useSuscripcionesFamiliares();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--admin-text-muted)]">Cargando suscripciones...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-[var(--status-danger)] mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-[var(--admin-surface-2)] rounded-lg hover:bg-[var(--admin-surface-1)] border border-[var(--admin-border)] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--admin-text)]">Suscripciones Familiares</h1>
      </div>

      {/* Stats Grid */}
      <SuscripcionesStatsGrid
        stats={stats}
        estadoFilter={estadoFilter}
        onEstadoFilterChange={setEstadoFilter}
      />

      {/* Filters */}
      <SuscripcionesFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Table */}
      <SuscripcionesTable
        suscripciones={filteredSuscripciones}
        onView={setSelectedSuscripcion}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Results count */}
      <div className="text-sm text-[var(--admin-text-muted)]">
        Mostrando {filteredSuscripciones.length} de {total} suscripciones
      </div>

      {/* Detail Modal */}
      <SuscripcionDetailModal
        suscripcion={selectedSuscripcion}
        onClose={() => setSelectedSuscripcion(null)}
      />
    </div>
  );
}

export default SuscripcionesView;
