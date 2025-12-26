'use client';

import { Search, Plus } from 'lucide-react';
import type { TipoFilter, StatusFilter } from '../types/productos.types';

/**
 * ProductsFilters - Filtros y búsqueda de productos de pago único
 */

interface ProductsFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  tierFilter: TipoFilter;
  onTierChange: (tier: TipoFilter) => void;
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
}

export function ProductsFilters({
  searchQuery,
  onSearchChange,
  tierFilter,
  onTierChange,
  statusFilter,
  onStatusChange,
}: ProductsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--admin-text-muted)]" />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] placeholder:text-[var(--admin-text-disabled)] focus:outline-none focus:border-[var(--admin-accent)]"
        />
      </div>
      <div className="flex gap-2">
        <select
          value={tierFilter}
          onChange={(e) => onTierChange(e.target.value as TipoFilter)}
          className="px-4 py-2.5 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)]"
        >
          <option value="all">Todos los tipos</option>
          <option value="Curso">Cursos</option>
          <option value="RecursoDigital">Recursos Digitales</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
          className="px-4 py-2.5 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)]"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--admin-accent)] text-black rounded-xl font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Agregar</span>
        </button>
      </div>
    </div>
  );
}

export default ProductsFilters;
