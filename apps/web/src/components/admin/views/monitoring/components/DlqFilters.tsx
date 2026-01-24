'use client';

import { useState } from 'react';

interface DlqFiltersProps {
  searchPaymentId: string;
  onSearchChange: (value: string) => void;
  onCleanup: () => Promise<{ deletedCount: number }>;
  isCleaning: boolean;
  onRefresh: () => Promise<void>;
}

/**
 * DlqFilters - Filtros y acciones para la tabla de DLQ
 */
export function DlqFilters({
  searchPaymentId,
  onSearchChange,
  onCleanup,
  isCleaning,
  onRefresh,
}: DlqFiltersProps) {
  const [cleanupResult, setCleanupResult] = useState<string | null>(null);

  const handleCleanup = async () => {
    try {
      const result = await onCleanup();
      setCleanupResult(`Se eliminaron ${result.deletedCount} registros antiguos`);
      setTimeout(() => setCleanupResult(null), 5000);
    } catch {
      setCleanupResult('Error al limpiar registros');
      setTimeout(() => setCleanupResult(null), 5000);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        {/* Search by Payment ID */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por Payment ID..."
            value={searchPaymentId}
            onChange={(e) => onSearchChange(e.target.value)}
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

        {/* Cleanup result message */}
        {cleanupResult && (
          <span
            className={`text-sm px-3 py-1 rounded-full ${
              cleanupResult.includes('Error')
                ? 'bg-red-500/10 text-red-400'
                : 'bg-emerald-500/10 text-emerald-400'
            }`}
          >
            {cleanupResult}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
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

        {/* Cleanup button */}
        <button
          onClick={handleCleanup}
          disabled={isCleaning}
          className="
            px-4 py-2.5 rounded-xl
            bg-amber-500/10 border border-amber-500/30
            text-amber-400 hover:bg-amber-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors flex items-center gap-2
          "
          title="Eliminar registros resueltos/abandonados de más de 30 días"
        >
          {isCleaning ? (
            <>
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              Limpiando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Limpiar antiguos
            </>
          )}
        </button>
      </div>
    </div>
  );
}
