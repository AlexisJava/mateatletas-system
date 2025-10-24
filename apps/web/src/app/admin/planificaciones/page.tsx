'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPlanificaciones } from '@/lib/api/planificaciones.api';
import { getErrorMessage } from '@/lib/utils/error-handler';
import {
  PlanificacionListItem,
  PlanificacionFilters as Filters,
  PaginationOptions,
} from '@/types/planificacion.types';
import { PlanificacionFilters, PlanificacionesTable } from './components';
import { Button } from '@/components/ui';
import { Plus } from 'lucide-react';

export default function AdminPlanificacionesPage() {
  const router = useRouter();

  // State
  const [planificaciones, setPlanificaciones] = useState<PlanificacionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [filters, setFilters] = useState<Filters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Load planificaciones on mount and when filters/page change
  useEffect(() => {
    loadPlanificaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage]);

  const loadPlanificaciones = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const pagination: PaginationOptions = {
        page: currentPage,
        limit,
      };

      const response = await getPlanificaciones(filters, pagination);

      setPlanificaciones(response.data);
      setTotal(response.total);
      setTotalPages(response.total_pages);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Error al cargar planificaciones');
      setError(errorMessage);
      console.error('Error loading planificaciones:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (id: string) => {
    router.push(`/admin/planificaciones/${id}`);
  };

  const handleCreatePlanificacion = () => {
    // TODO: Implementar en SLICE 2
    alert('Funcionalidad "Crear Planificación" será implementada en SLICE 2');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#2a1a5e]">
                Planificaciones Mensuales
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona las planificaciones inmersivas para cada grupo
              </p>
            </div>

            <Button
              variant="primary"
              onClick={handleCreatePlanificacion}
              className="flex items-center gap-2"
              title="Disponible en SLICE 2"
            >
              <Plus size={20} />
              Nueva Planificación
            </Button>
          </div>

          {/* Stats */}
          {!isLoading && !error && (
            <div className="mt-4 bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-gray-600">Total:</span>
                  <span className="ml-2 font-semibold text-[#2a1a5e]">{total}</span>
                  <span className="ml-1 text-gray-500">
                    {total === 1 ? 'planificación' : 'planificaciones'}
                  </span>
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <div>
                  <span className="text-gray-600">Mostrando:</span>
                  <span className="ml-2 font-semibold text-[#2a1a5e]">
                    {planificaciones.length}
                  </span>
                  <span className="ml-1 text-gray-500">
                    en esta página
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <PlanificacionFilters
          onFilterChange={handleFilterChange}
          isLoading={isLoading}
        />

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-red-600 text-xl">⚠️</div>
              <div>
                <h3 className="text-red-800 font-semibold">Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={loadPlanificaciones}
                  className="mt-3"
                >
                  Reintentar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <PlanificacionesTable
          planificaciones={planificaciones}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onViewDetails={handleViewDetails}
        />

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            SLICE 1: Ver Planificaciones - ✅ Implementado
          </p>
          <p className="text-xs mt-1">
            Próximo: SLICE 2 - Crear Planificación
          </p>
        </div>
      </div>
    </div>
  );
}
