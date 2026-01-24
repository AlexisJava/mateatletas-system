'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDlqStats,
  getDlqList,
  getDlqById,
  resolveDlqWebhook,
  abandonDlqWebhook,
  cleanupDlq,
  type DlqFilters,
} from '@/lib/api/admin.api';

const QUERY_KEYS = {
  stats: ['dlq', 'stats'],
  list: (filters?: DlqFilters) => ['dlq', 'list', filters],
  detail: (id: string) => ['dlq', 'detail', id],
};

/**
 * Hook para obtener estadísticas de DLQ
 */
export function useDlqStats() {
  return useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: getDlqStats,
    refetchInterval: 30000, // Refetch cada 30 segundos
    staleTime: 10000,
  });
}

/**
 * Hook para listar webhooks en DLQ con filtros
 */
export function useDlqList(filters?: DlqFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.list(filters),
    queryFn: () => getDlqList(filters),
    staleTime: 10000,
  });
}

/**
 * Hook para obtener detalle de un webhook
 */
export function useDlqDetail(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id ?? ''),
    queryFn: () => getDlqById(id!),
    enabled: !!id,
  });
}

/**
 * Hook para resolver un webhook
 */
export function useResolveDlq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => resolveDlqWebhook(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dlq'] });
    },
  });
}

/**
 * Hook para abandonar un webhook
 */
export function useAbandonDlq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => abandonDlqWebhook(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dlq'] });
    },
  });
}

/**
 * Hook para limpiar webhooks antiguos
 */
export function useCleanupDlq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cleanupDlq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dlq'] });
    },
  });
}
