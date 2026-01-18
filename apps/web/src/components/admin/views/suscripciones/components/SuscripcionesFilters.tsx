'use client';

import { Search } from 'lucide-react';

interface SuscripcionesFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

/**
 * Filtros y búsqueda para suscripciones
 */
export function SuscripcionesFilters({ searchQuery, onSearchChange }: SuscripcionesFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--admin-text-muted)]" />
        <input
          type="text"
          placeholder="Buscar por tutor, estudiante o producto..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)] text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--admin-accent)] transition-colors"
        />
      </div>
    </div>
  );
}

export default SuscripcionesFilters;
