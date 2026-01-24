'use client';

interface AuditFiltersProps {
  searchEmail: string;
  onSearchEmailChange: (value: string) => void;
  actionFilter: string;
  onActionFilterChange: (value: string) => void;
  onRefresh: () => Promise<void>;
}

/**
 * AuditFilters - Filtros de búsqueda para audit logs
 */
export function AuditFilters({
  searchEmail,
  onSearchEmailChange,
  actionFilter,
  onActionFilterChange,
  onRefresh,
}: AuditFiltersProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        {/* Search by email */}
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Buscar por email..."
            value={searchEmail}
            onChange={(e) => onSearchEmailChange(e.target.value)}
            className="
              w-full px-4 py-2.5 pl-10
              bg-white/[0.03] border border-white/[0.08] rounded-xl
              text-[var(--admin-text)] placeholder-[var(--admin-text-muted)]
              focus:outline-none focus:border-[var(--admin-accent)]/50
              transition-colors
            "
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Filter by action */}
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Filtrar por acción..."
            value={actionFilter}
            onChange={(e) => onActionFilterChange(e.target.value)}
            className="
              w-full px-4 py-2.5 pl-10
              bg-white/[0.03] border border-white/[0.08] rounded-xl
              text-[var(--admin-text)] placeholder-[var(--admin-text-muted)]
              focus:outline-none focus:border-[var(--admin-accent)]/50
              transition-colors
            "
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </div>
      </div>

      {/* Refresh button */}
      <button
        onClick={onRefresh}
        className="
          px-4 py-2.5 rounded-xl
          bg-white/[0.03] border border-white/[0.08]
          text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]
          hover:bg-white/[0.05] transition-colors
          flex items-center gap-2
        "
        title="Actualizar datos"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Actualizar
      </button>
    </div>
  );
}
