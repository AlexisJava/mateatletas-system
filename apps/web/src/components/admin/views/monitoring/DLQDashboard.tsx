'use client';

import { useState, useCallback } from 'react';
import { RefreshCw, Trash2, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { AdminButton, AdminCard, AdminSelect } from '@/components/admin/primitives';
import { DLQStats } from './components/DLQStats';
import { DlqTable } from './components/DlqTable';
import { DlqDetailModal } from './components/DlqDetailModal';
import {
  useDlqStats,
  useDlqList,
  useResolveDlq,
  useAbandonDlq,
  useCleanupDlq,
} from './hooks/useDLQ';
import type { WebhookFailedItem, DlqStatus, DlqFilters } from '@/lib/api/admin.api';

const LIMIT = 20;

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'PROCESSING', label: 'Procesando' },
  { value: 'RESOLVED', label: 'Resueltos' },
  { value: 'ABANDONED', label: 'Abandonados' },
];

/**
 * Dashboard para monitorear y gestionar la Dead Letter Queue (DLQ)
 *
 * Muestra webhooks de Mercado Pago que fallaron después de múltiples reintentos,
 * permitiendo resolverlos manualmente o marcarlos como abandonados.
 */
export function DLQDashboard() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<DlqStatus | ''>('');
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookFailedItem | null>(null);

  const filters: DlqFilters = {
    status: statusFilter || undefined,
    limit: LIMIT,
    offset: (page - 1) * LIMIT,
  };

  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useDlqStats();
  const { data: listData, isLoading: loadingList, refetch: refetchList } = useDlqList(filters);
  const resolveMutation = useResolveDlq();
  const abandonMutation = useAbandonDlq();
  const cleanupMutation = useCleanupDlq();

  const handleRefresh = useCallback(() => {
    refetchStats();
    refetchList();
    toast.success('Datos actualizados');
  }, [refetchStats, refetchList]);

  const handleCleanup = useCallback(async () => {
    try {
      const result = await cleanupMutation.mutateAsync();
      toast.success(result.message);
    } catch {
      toast.error('Error al limpiar registros antiguos');
    }
  }, [cleanupMutation]);

  const handleResolve = useCallback(
    async (id: string, notes?: string) => {
      try {
        await resolveMutation.mutateAsync({ id, notes });
        toast.success('Webhook marcado como resuelto');
        setSelectedWebhook(null);
      } catch {
        toast.error('Error al resolver webhook');
      }
    },
    [resolveMutation],
  );

  const handleAbandon = useCallback(
    async (id: string, notes?: string) => {
      try {
        await abandonMutation.mutateAsync({ id, notes });
        toast.success('Webhook marcado como abandonado');
        setSelectedWebhook(null);
      } catch {
        toast.error('Error al abandonar webhook');
      }
    },
    [abandonMutation],
  );

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as DlqStatus | '');
    setPage(1); // Reset to first page when filter changes
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--admin-text)]">Dead Letter Queue</h1>
          <p className="text-sm text-[var(--admin-text-muted)] mt-1">
            Webhooks de Mercado Pago que fallaron tras múltiples reintentos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AdminButton
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Actualizar
          </AdminButton>
          <AdminButton
            variant="ghost"
            size="sm"
            onClick={handleCleanup}
            loading={cleanupMutation.isPending}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Limpiar antiguos
          </AdminButton>
        </div>
      </div>

      {/* Stats KPIs */}
      <DLQStats stats={stats} isLoading={loadingStats} />

      {/* Filters */}
      <AdminCard padding="sm" animate={false}>
        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-[var(--admin-text-muted)]" />
          <AdminSelect
            value={statusFilter}
            onChange={handleStatusChange}
            options={STATUS_OPTIONS}
            className="w-48"
          />
        </div>
      </AdminCard>

      {/* Table */}
      <DlqTable
        items={listData?.items ?? []}
        total={listData?.total ?? 0}
        page={page}
        pageSize={LIMIT}
        hasMore={listData?.hasMore ?? false}
        onPageChange={setPage}
        onView={setSelectedWebhook}
      />

      {/* Detail Modal */}
      <DlqDetailModal
        item={selectedWebhook}
        onClose={() => setSelectedWebhook(null)}
        onResolve={handleResolve}
        onAbandon={handleAbandon}
        isResolving={resolveMutation.isPending}
        isAbandoning={abandonMutation.isPending}
      />
    </div>
  );
}
