'use client';

import { PlanificacionListItem, EstadoPlanificacion } from '@/types/planificacion.types';
import { Button } from '@/components/ui';

interface PlanificacionesTableProps {
  planificaciones: PlanificacionListItem[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDetails: (id: string) => void;
}

const ESTADO_COLORS: Record<EstadoPlanificacion, string> = {
  borrador: 'bg-yellow-100 text-yellow-800',
  publicada: 'bg-green-100 text-green-800',
  archivada: 'bg-gray-100 text-gray-800',
};

const ESTADO_ICONS: Record<EstadoPlanificacion, string> = {
  borrador: '📝',
  publicada: '✅',
  archivada: '📦',
};

const MESES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const PlanificacionesTable: React.FC<PlanificacionesTableProps> = ({
  planificaciones,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onViewDetails,
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-[#ff6b35]"></div>
        <p className="mt-4 text-gray-600">Cargando planificaciones...</p>
      </div>
    );
  }

  // Empty state
  if (!planificaciones || planificaciones.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="text-6xl mb-4">📅</div>
        <p className="text-gray-500 text-lg font-medium mb-2">
          No hay planificaciones
        </p>
        <p className="text-gray-400 text-sm">
          No se encontraron planificaciones con los filtros seleccionados.
        </p>
      </div>
    );
  }

  // Tabla (Desktop) / Cards (Mobile)
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grupo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Período
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actividades
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {planificaciones?.map((planificacion) => (
              <tr key={planificacion.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                      {planificacion.codigo_grupo}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">
                    {MESES[planificacion.mes]} {planificacion.anio}
                  </div>
                  <div className="text-xs text-gray-500">
                    {String(planificacion.mes).padStart(2, '0')}/{planificacion.anio}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 font-medium max-w-xs truncate">
                    {planificacion.titulo}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ESTADO_COLORS[planificacion.estado]}`}>
                    {ESTADO_ICONS[planificacion.estado]} {planificacion.estado.charAt(0).toUpperCase() + planificacion.estado.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-900 font-medium">
                      {planificacion.total_actividades}
                    </span>
                    <span className="ml-1 text-xs text-gray-500">
                      {planificacion.total_actividades === 1 ? 'actividad' : 'actividades'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onViewDetails(planificacion.id)}
                  >
                    Ver Detalles
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-200">
        {planificaciones?.map((planificacion) => (
          <div key={planificacion.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {planificacion.codigo_grupo}
              </span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${ESTADO_COLORS[planificacion.estado]}`}>
                {ESTADO_ICONS[planificacion.estado]} {planificacion.estado.charAt(0).toUpperCase() + planificacion.estado.slice(1)}
              </span>
            </div>

            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              {planificacion.titulo}
            </h3>

            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Período:</span>
                <span className="text-gray-900 font-medium">
                  {MESES[planificacion.mes]} {planificacion.anio}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Actividades:</span>
                <span className="text-gray-900 font-medium">
                  {planificacion.total_actividades}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => onViewDetails(planificacion.id)}
              className="w-full"
            >
              Ver Detalles
            </Button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Página <span className="font-medium">{currentPage}</span> de{' '}
              <span className="font-medium">{totalPages}</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Anterior
              </Button>

              {/* Page numbers */}
              <div className="hidden sm:flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === pageNum
                          ? 'bg-[#ff6b35] text-white font-medium'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente →
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
