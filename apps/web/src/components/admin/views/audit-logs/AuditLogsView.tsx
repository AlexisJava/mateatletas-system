'use client';

import { useAuditLogs } from './hooks';
import { AuditStatsGrid, AuditFilters, AuditLogsTable, AuditLogDetailModal } from './components';

/**
 * AuditLogsView - Vista de audit logs del sistema
 *
 * Muestra:
 * - Estadísticas por severidad y categoría
 * - Filtros por email, acción, severidad, categoría
 * - Tabla paginada de logs
 * - Modal de detalle con cambios y metadata
 */
export function AuditLogsView() {
  const {
    isLoading,
    error,
    stats,
    statsLoading,
    logs,
    total,
    hasMore,
    severityFilter,
    setSeverityFilter,
    categoryFilter,
    setCategoryFilter,
    searchEmail,
    setSearchEmail,
    actionFilter,
    setActionFilter,
    page,
    setPage,
    pageSize,
    selectedLog,
    setSelectedLog,
    refetchAll,
  } = useAuditLogs();

  // Loading state
  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--admin-text-muted)]">Cargando audit logs...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !stats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-[var(--status-danger)] mb-4">{error}</p>
          <button
            onClick={refetchAll}
            className="px-4 py-2 bg-[var(--admin-surface-2)] rounded-lg hover:bg-[var(--admin-surface-1)] border border-[var(--admin-border)] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--admin-text)]">Audit Logs</h1>
          <p className="text-sm text-[var(--admin-text-muted)] mt-1">
            Registro de actividad del sistema
          </p>
        </div>
        {stats?.mostRecent && (
          <div className="text-right">
            <p className="text-xs text-[var(--admin-text-muted)]">Último evento</p>
            <p className="text-sm text-[var(--admin-text)]">
              {new Date(stats.mostRecent.timestamp).toLocaleString('es-AR')}
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid with filters */}
      <AuditStatsGrid
        stats={stats}
        severityFilter={severityFilter}
        onSeverityFilterChange={setSeverityFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
      />

      {/* Search Filters */}
      <AuditFilters
        searchEmail={searchEmail}
        onSearchEmailChange={setSearchEmail}
        actionFilter={actionFilter}
        onActionFilterChange={setActionFilter}
        onRefresh={refetchAll}
      />

      {/* Logs Table */}
      <AuditLogsTable
        logs={logs}
        onView={setSelectedLog}
        page={page}
        pageSize={pageSize}
        total={total}
        hasMore={hasMore}
        onPageChange={setPage}
      />

      {/* Results count */}
      <div className="text-sm text-[var(--admin-text-muted)]">
        Mostrando {logs.length} de {total} logs de auditoría
      </div>

      {/* Detail Modal */}
      <AuditLogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}

export default AuditLogsView;
