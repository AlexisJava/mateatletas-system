'use client';

import { useMonitoring } from './hooks';
import { QueueHealthCard, DlqStatsGrid, DlqFilters, DlqTable, DlqDetailModal } from './components';

/**
 * MonitoringView - Vista de monitoring de webhooks y DLQ
 *
 * Muestra:
 * - Estado de salud de la cola BullMQ
 * - Estadísticas de webhooks en DLQ
 * - Tabla de webhooks fallidos con filtros
 * - Acciones: Resolver, Abandonar, Limpiar antiguos
 */
export function MonitoringView() {
  const {
    isLoading,
    error,
    queueStats,
    queueStatsLoading,
    dlqStats,
    dlqItems,
    dlqTotal,
    dlqHasMore,
    statusFilter,
    setStatusFilter,
    searchPaymentId,
    setSearchPaymentId,
    page,
    setPage,
    pageSize,
    selectedItem,
    setSelectedItem,
    resolveWebhook,
    abandonWebhook,
    cleanupOldRecords,
    isResolving,
    isAbandoning,
    isCleaning,
    refetchAll,
  } = useMonitoring();

  // Loading state
  if (isLoading && !dlqStats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--admin-text-muted)]">Cargando monitoring...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !dlqStats) {
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
          <h1 className="text-2xl font-bold text-[var(--admin-text)]">Monitoring</h1>
          <p className="text-sm text-[var(--admin-text-muted)] mt-1">
            Estado de colas y webhooks fallidos
          </p>
        </div>
      </div>

      {/* Queue Health */}
      <QueueHealthCard stats={queueStats} isLoading={queueStatsLoading} />

      {/* DLQ Stats Grid */}
      <DlqStatsGrid
        stats={dlqStats}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Filters */}
      <DlqFilters
        searchPaymentId={searchPaymentId}
        onSearchChange={setSearchPaymentId}
        onCleanup={cleanupOldRecords}
        isCleaning={isCleaning}
        onRefresh={refetchAll}
      />

      {/* DLQ Table */}
      <DlqTable
        items={dlqItems}
        onView={setSelectedItem}
        page={page}
        pageSize={pageSize}
        total={dlqTotal}
        hasMore={dlqHasMore}
        onPageChange={setPage}
      />

      {/* Results count */}
      <div className="text-sm text-[var(--admin-text-muted)]">
        Mostrando {dlqItems.length} de {dlqTotal} webhooks fallidos
      </div>

      {/* Detail Modal */}
      <DlqDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onResolve={resolveWebhook}
        onAbandon={abandonWebhook}
        isResolving={isResolving}
        isAbandoning={isAbandoning}
      />
    </div>
  );
}

export default MonitoringView;
