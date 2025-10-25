'use client';

import { useState } from 'react';
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
    <div className="relative rounded-2xl overflow-hidden">
      {/* Fondo glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 via-slate-700/40 to-slate-800/40 backdrop-blur-xl" />
      <div className="absolute inset-0 border-2 border-white/10 rounded-2xl" />

      <div className="relative p-6">
        <div className="flex flex-col gap-4">
          {/* Title */}
          <h3 className="text-sm font-black uppercase tracking-wide bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
            Filtros de Búsqueda
          </h3>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Grupo */}
            <div>
              <label htmlFor="filter-grupo" className="block text-xs font-bold uppercase tracking-wide text-white/60 mb-2">
                Grupo
              </label>
              <select
                id="filter-grupo"
                value={filters.codigo_grupo || ''}
                onChange={(e) => handleFilterChange('codigo_grupo', e.target.value as CodigoGrupo)}
                disabled={isLoading}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:opacity-50 transition-all"
              >
                <option value="">Todos los grupos</option>
                {GRUPOS.map((grupo) => (
                  <option key={grupo} value={grupo}>
                    Grupo {grupo}
                  </option>
                ))}
              </select>
            </div>

            {/* Mes */}
            <div>
              <label htmlFor="filter-mes" className="block text-xs font-bold uppercase tracking-wide text-white/60 mb-2">
                Mes
              </label>
              <select
                id="filter-mes"
                value={filters.mes || ''}
                onChange={(e) => handleFilterChange('mes', e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={isLoading}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 transition-all"
              >
                <option value="">Todos los meses</option>
                {MESES.map((mes) => (
                  <option key={mes.value} value={mes.value}>
                    {mes.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Año */}
            <div>
              <label htmlFor="filter-anio" className="block text-xs font-bold uppercase tracking-wide text-white/60 mb-2">
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
                className="w-full px-3 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white font-medium placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 transition-all"
              />
            </div>

            {/* Estado */}
            <div>
              <label htmlFor="filter-estado" className="block text-xs font-bold uppercase tracking-wide text-white/60 mb-2">
                Estado
              </label>
              <select
                id="filter-estado"
                value={filters.estado || ''}
                onChange={(e) => handleFilterChange('estado', e.target.value as EstadoPlanificacion)}
                disabled={isLoading}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50 transition-all"
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

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleApplyFilters}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500/30 to-rose-500/30 border border-pink-400/50 text-white font-bold hover:shadow-lg hover:shadow-pink-500/50 disabled:opacity-50 transition-all duration-300"
            >
              {isLoading ? 'Aplicando...' : 'Aplicar Filtros'}
            </button>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white font-bold hover:bg-white/10 disabled:opacity-50 transition-all duration-300"
              >
                Limpiar Filtros
              </button>
            )}

            {/* Active Filters Indicators */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 ml-auto">
                <span className="text-xs text-white/40 font-bold uppercase">Activos:</span>
                {filters.codigo_grupo && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    {filters.codigo_grupo}
                  </span>
                )}
                {filters.mes && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-300 border border-green-400/30">
                    {MESES.find(m => m.value === filters.mes)?.label}
                  </span>
                )}
                {filters.anio && filters.anio !== currentYear && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    {filters.anio}
                  </span>
                )}
                {filters.estado && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-400/30">
                    {filters.estado}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
