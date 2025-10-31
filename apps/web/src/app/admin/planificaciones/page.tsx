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
import {
  PlanificacionFilters,
  PlanificacionesTable,
  CreatePlanificacionModal,
} from './components';
import { Plus, Calendar, TrendingUp, Activity } from 'lucide-react';

export default function AdminPlanificacionesPage() {
  const router = useRouter();

  // State
  const [planificaciones, setPlanificaciones] = useState<PlanificacionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
    } catch (err) {
      const errorMessage = getErrorMessage(err as Error, 'Error al cargar planificaciones');
      setError(errorMessage);
      setPlanificaciones([]); // Ensure planificaciones is always an array
      setTotal(0);
      setTotalPages(1);
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
    setIsCreateModalOpen(true);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleModalSuccess = () => {
    loadPlanificaciones(); // Reload list after successful creation
  };

  return (
    <div className="flex flex-col relative">
      {/* Partículas flotantes de fondo - MATEATLETAS OS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-pink-400 rounded-full animate-ping opacity-20" />
        <div className="absolute top-40 right-40 w-2 h-2 bg-rose-400 rounded-full animate-ping opacity-20 animation-delay-2000" />
        <div className="absolute bottom-40 left-60 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-20 animation-delay-4000" />
      </div>

      {/* Header estilo MATEATLETAS OS */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-pink-200 to-rose-200 bg-clip-text text-transparent drop-shadow-lg mb-1">
            Planificaciones Mensuales
          </h1>
          <p className="text-sm text-slate-300 font-medium">
            Sistema de planificaciones inmersivas por grupo
          </p>
        </div>

        {/* Botón estilo OS */}
        <button
          onClick={handleCreatePlanificacion}
          className="group relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-purple-500/20 backdrop-blur-xl border border-pink-400/50 hover:border-pink-400 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/50"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-pink-300 group-hover:text-pink-200 transition-colors" strokeWidth={2.5} />
            <span className="text-sm font-bold text-white">Nueva Planificación</span>
          </div>
        </button>
      </div>

      {/* Stats Cards - Estilo MATEATLETAS OS */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 relative z-10">
          {/* Total Planificaciones */}
          <div className="group relative rounded-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-rose-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl" />
            <div className="absolute inset-0 rounded-2xl border-2 border-pink-400/50 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-pink-500/50" />
            <div className="relative p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-white/60 mb-2 font-bold uppercase tracking-wide">Total Planificaciones</p>
                  <p className="text-4xl font-black text-white mb-2 drop-shadow-lg leading-none">{total}</p>
                  <span className="text-xs text-white/40 font-medium">en el sistema</span>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/50">
                  <Calendar className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>

          {/* Mostrando */}
          <div className="group relative rounded-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-violet-500/20 to-fuchsia-500/20 backdrop-blur-xl rounded-2xl" />
            <div className="absolute inset-0 rounded-2xl border-2 border-purple-400/50 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-purple-500/50" />
            <div className="relative p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-white/60 mb-2 font-bold uppercase tracking-wide">En Esta Página</p>
                  <p className="text-4xl font-black text-white mb-2 drop-shadow-lg leading-none">{planificaciones?.length ?? 0}</p>
                  <span className="text-xs text-white/40 font-medium">de {total}</span>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <Activity className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>

          {/* Sistema Status */}
          <div className="group relative rounded-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 backdrop-blur-xl rounded-2xl" />
            <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400/50 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-emerald-500/50" />
            <div className="relative p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-white/60 mb-2 font-bold uppercase tracking-wide">Sistema</p>
                  <p className="text-2xl font-black text-white mb-2 drop-shadow-lg leading-none">Operativo</p>
                  <span className="text-xs text-emerald-300 font-bold">✓ SLICE 1 Activo</span>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                  <TrendingUp className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="relative z-10 mb-6">
        <PlanificacionFilters
          onFilterChange={handleFilterChange}
          isLoading={isLoading}
        />
      </div>

      {/* Error State - Estilo OS */}
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

      {/* Table */}
      <div className="relative z-10">
        <PlanificacionesTable
          planificaciones={planificaciones}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onViewDetails={handleViewDetails}
        />
      </div>

      {/* Create Modal */}
      <CreatePlanificacionModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
