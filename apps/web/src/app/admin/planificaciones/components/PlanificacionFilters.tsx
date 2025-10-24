'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { PlanificacionFilters as Filters, CodigoGrupo, EstadoPlanificacion } from '@/types/planificacion.types';

interface PlanificacionFiltersProps {
  onFilterChange: (filters: Filters) => void;
  isLoading?: boolean;
}

const GRUPOS: CodigoGrupo[] = ['B1', 'B2', 'B3'];
const ESTADOS: EstadoPlanificacion[] = ['borrador', 'publicada', 'archivada'];
const MESES = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

export const PlanificacionFilters: React.FC<PlanificacionFiltersProps> = ({
  onFilterChange,
  isLoading = false,
}) => {
  const currentYear = new Date().getFullYear();

  const [filters, setFilters] = useState<Filters>({
    codigo_grupo: undefined,
    mes: undefined,
    anio: currentYear,
    estado: undefined,
  });

  const handleFilterChange = (key: keyof Filters, value: string | number | undefined) => {
    const newFilters = {
      ...filters,
      [key]: value === '' ? undefined : value,
    };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters: Filters = {
      codigo_grupo: undefined,
      mes: undefined,
      anio: currentYear,
      estado: undefined,
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters =
    filters.codigo_grupo !== undefined ||
    filters.mes !== undefined ||
    filters.estado !== undefined ||
    filters.anio !== currentYear;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-[#2a1a5e] mb-4">Filtros</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Filtro: Grupo */}
        <div>
          <label htmlFor="filter-grupo" className="block text-sm font-medium text-gray-700 mb-1">
            Grupo
          </label>
          <select
            id="filter-grupo"
            value={filters.codigo_grupo || ''}
            onChange={(e) => handleFilterChange('codigo_grupo', e.target.value as CodigoGrupo)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6b35] disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Todos los grupos</option>
            {GRUPOS.map((grupo) => (
              <option key={grupo} value={grupo}>
                Grupo {grupo}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro: Mes */}
        <div>
          <label htmlFor="filter-mes" className="block text-sm font-medium text-gray-700 mb-1">
            Mes
          </label>
          <select
            id="filter-mes"
            value={filters.mes || ''}
            onChange={(e) => handleFilterChange('mes', e.target.value ? parseInt(e.target.value) : undefined)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6b35] disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Todos los meses</option>
            {MESES.map((mes) => (
              <option key={mes.value} value={mes.value}>
                {mes.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro: Año */}
        <div>
          <label htmlFor="filter-anio" className="block text-sm font-medium text-gray-700 mb-1">
            Año
          </label>
          <input
            id="filter-anio"
            type="number"
            value={filters.anio || currentYear}
            onChange={(e) => handleFilterChange('anio', e.target.value ? parseInt(e.target.value) : currentYear)}
            disabled={isLoading}
            min={2020}
            max={2030}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6b35] disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Filtro: Estado */}
        <div>
          <label htmlFor="filter-estado" className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            id="filter-estado"
            value={filters.estado || ''}
            onChange={(e) => handleFilterChange('estado', e.target.value as EstadoPlanificacion)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6b35] disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={handleApplyFilters}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Aplicando...' : 'Aplicar Filtros'}
        </Button>

        <Button
          variant="secondary"
          onClick={handleClearFilters}
          disabled={isLoading || !hasActiveFilters}
          className="flex-1"
        >
          Limpiar Filtros
        </Button>
      </div>

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Filtros activos:</span>
          {filters.codigo_grupo && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              Grupo: {filters.codigo_grupo}
            </span>
          )}
          {filters.mes && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              Mes: {MESES.find(m => m.value === filters.mes)?.label}
            </span>
          )}
          {filters.anio && filters.anio !== currentYear && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
              Año: {filters.anio}
            </span>
          )}
          {filters.estado && (
            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
              Estado: {filters.estado.charAt(0).toUpperCase() + filters.estado.slice(1)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
