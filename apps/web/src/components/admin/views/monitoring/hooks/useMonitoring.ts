'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDlqStats,
  getDlqList,
  resolveDlqWebhook,
  abandonDlqWebhook,
  cleanupDlq,
  getQueueStats,
  type DlqStats,
  type DlqListResponse,
  type WebhookFailedItem,
  type DlqFilters,
  type DlqStatus,
  type QueueStats,
} from '@/lib/api/admin.api';

/** Query keys para invalidación */
export const MONITORING_KEYS = {
  dlqStats: ['admin', 'dlq', 'stats'] as const,
  dlqList: ['admin', 'dlq', 'list'] as const,
  queueStats: ['admin', 'queue', 'stats'] as const,
};

/** Filtro de estado para la UI */
export type StatusFilter = DlqStatus | 'all';

interface UseMonitoringReturn {
  // Estado de carga
  isLoading: boolean;
  error: string | null;

  // Datos de colas
  queueStats: QueueStats | null;
  queueStatsLoading: boolean;

  // Datos de DLQ
  dlqStats: DlqStats | null;
  dlqItems: WebhookFailedItem[];
  dlqTotal: number;
  dlqHasMore: boolean;

  // Filtros
  statusFilter: StatusFilter;
  setStatusFilter: (status: StatusFilter) => void;
  searchPaymentId: string;
  setSearchPaymentId: (id: string) => void;

  // Paginación
  page: number;
  setPage: (page: number) => void;
  pageSize: number;

  // Selección
  selectedItem: WebhookFailedItem | null;
  setSelectedItem: (item: WebhookFailedItem | null) => void;

  // Acciones
  resolveWebhook: (id: string, notes?: string) => Promise<void>;
  abandonWebhook: (id: string, notes?: string) => Promise<void>;
  cleanupOldRecords: () => Promise<{ deletedCount: number }>;
  isResolving: boolean;
  isAbandoning: boolean;
  isCleaning: boolean;

  // Refetch
  refetchAll: () => Promise<void>;
}

/**
 * Hook para gestionar monitoring de webhooks/DLQ desde admin
 */
export function useMonitoring(): UseMonitoringReturn {
  const queryClient = useQueryClient();
  const pageSize = 20;

  // Estado local de filtros
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchPaymentId, setSearchPaymentId] = useState('');
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<WebhookFailedItem | null>(null);

  // Construir filtros para la API
  const buildFilters = useCallback((): DlqFilters => {
    const filters: DlqFilters = {
      limit: pageSize,
      offset: (page - 1) * pageSize,
    };
    if (statusFilter !== 'all') {
      filters.status = statusFilter;
    }
    if (searchPaymentId.trim()) {
      filters.paymentId = searchPaymentId.trim();
    }
    return filters;
  }, [statusFilter, searchPaymentId, page, pageSize]);

  // Query: Estadísticas de cola BullMQ
  const {
    data: queueStats,
    isLoading: queueStatsLoading,
    error: queueError,
  } = useQuery({
    queryKey: MONITORING_KEYS.queueStats,
    queryFn: getQueueStats,
    staleTime: 10_000, // 10 segundos
    refetchInterval: 30_000, // Refetch cada 30s
  });

  // Query: Estadísticas de DLQ
  const {
    data: dlqStats,
    isLoading: dlqStatsLoading,
    error: dlqStatsError,
  } = useQuery({
    queryKey: MONITORING_KEYS.dlqStats,
    queryFn: getDlqStats,
    staleTime: 30_000,
  });

  // Query: Lista de items DLQ
  const {
    data: dlqData,
    isLoading: dlqListLoading,
    error: dlqListError,
  } = useQuery({
    queryKey: [...MONITORING_KEYS.dlqList, buildFilters()],
    queryFn: () => getDlqList(buildFilters()),
    staleTime: 30_000,
  });

  // Mutation: Resolver webhook
  const resolveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => resolveDlqWebhook(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MONITORING_KEYS.dlqStats });
      queryClient.invalidateQueries({ queryKey: MONITORING_KEYS.dlqList });
    },
  });

  // Mutation: Abandonar webhook
  const abandonMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => abandonDlqWebhook(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MONITORING_KEYS.dlqStats });
      queryClient.invalidateQueries({ queryKey: MONITORING_KEYS.dlqList });
    },
  });

  // Mutation: Cleanup
  const cleanupMutation = useMutation({
    mutationFn: cleanupDlq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MONITORING_KEYS.dlqStats });
      queryClient.invalidateQueries({ queryKey: MONITORING_KEYS.dlqList });
    },
  });

  // Acciones wrapper
  const resolveWebhook = async (id: string, notes?: string) => {
    await resolveMutation.mutateAsync({ id, notes });
    setSelectedItem(null);
  };

  const abandonWebhook = async (id: string, notes?: string) => {
    await abandonMutation.mutateAsync({ id, notes });
    setSelectedItem(null);
  };

  const cleanupOldRecords = async () => {
    const result = await cleanupMutation.mutateAsync();
    return result;
  };

  // Refetch all
  const refetchAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: MONITORING_KEYS.queueStats }),
      queryClient.invalidateQueries({ queryKey: MONITORING_KEYS.dlqStats }),
      queryClient.invalidateQueries({ queryKey: MONITORING_KEYS.dlqList }),
    ]);
  };

  // Estado general de carga y error
  const isLoading = dlqStatsLoading || dlqListLoading;
  const error =
    queueError || dlqStatsError || dlqListError ? 'Error al cargar datos de monitoring' : null;

  return {
    isLoading,
    error,
    queueStats: queueStats ?? null,
    queueStatsLoading,
    dlqStats: dlqStats ?? null,
    dlqItems: dlqData?.items ?? [],
    dlqTotal: dlqData?.total ?? 0,
    dlqHasMore: dlqData?.hasMore ?? false,
    statusFilter,
    setStatusFilter: (status) => {
      setStatusFilter(status);
      setPage(1); // Reset page on filter change
    },
    searchPaymentId,
    setSearchPaymentId: (id) => {
      setSearchPaymentId(id);
      setPage(1);
    },
    page,
    setPage,
    pageSize,
    selectedItem,
    setSelectedItem,
    resolveWebhook,
    abandonWebhook,
    cleanupOldRecords,
    isResolving: resolveMutation.isPending,
    isAbandoning: abandonMutation.isPending,
    isCleaning: cleanupMutation.isPending,
    refetchAll,
  };
}
