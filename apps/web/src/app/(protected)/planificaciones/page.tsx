'use client';

import { useEffect, useState } from 'react';
import { usePlanificaciones } from '@/hooks/usePlanificaciones';
import { PlanificacionFilters as FiltersType } from '@/types/planificacion.types';
import { PlanificacionFilters } from '@/app/admin/planificaciones/components/PlanificacionFilters';
import {
  PlanificacionesList,
  PlanificacionDetailPanel,
} from './components';

export default function PlanificacionesPage() {
  const {
    planificaciones,
    isLoadingList,
    totalPages,
    page,
    fetchPlanificaciones,
    setFilters,
    setPage,
    error,
    success,
    clearMessages,
  } = usePlanificaciones({ autoFetch: false });

  const [selectedPlanificacion, setSelectedPlanificacion] = useState<string | null>(null);

  useEffect(() => {
    fetchPlanificaciones();
  }, [fetchPlanificaciones]);

  const handleFilterChange = (filters: FiltersType) => {
    setFilters(filters);
    setSelectedPlanificacion(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-8 pb-16">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
          Planificaciones
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Gestión de planificaciones mensuales
        </h1>
        <p className="max-w-2xl text-sm text-white/60">
          Revisa, actualiza y gestiona las planificaciones disponibles para los distintos grupos.
          Puedes filtrar por periodo, estado y grupo para encontrar rápidamente la planificación que necesitas.
        </p>
      </header>

      {(success || error) && (
        <div className="space-y-2">
          {success && (
            <div className="flex items-start justify-between rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-emerald-100">
              <span>{success}</span>
              <button
                onClick={clearMessages}
                className="text-xs font-semibold uppercase tracking-wide text-emerald-200"
              >
                Cerrar
              </button>
            </div>
          )}
          {error && (
            <div className="flex items-start justify-between rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-3 text-red-100">
              <span>{error}</span>
              <button
                onClick={clearMessages}
                className="text-xs font-semibold uppercase tracking-wide text-red-200"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      )}

      <section className="space-y-4">
        <PlanificacionFilters onFilterChange={handleFilterChange} isLoading={isLoadingList} />
        <PlanificacionesList
          planificaciones={planificaciones}
          isLoading={isLoadingList}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onViewPlanificacion={setSelectedPlanificacion}
        />
      </section>

      <PlanificacionDetailPanel
        planificacionId={selectedPlanificacion}
        onClose={() => setSelectedPlanificacion(null)}
      />
    </div>
  );
}
