'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getAuditLogsStats,
  getAuditLogsList,
  getAuditLogById,
  type AuditLogsStats,
  type AuditLogsListResponse,
  type AuditLogItem,
  type AuditLogsFilters,
  type AuditSeverity,
  type AuditCategory,
} from '@/lib/api/admin.api';

/** Query keys para invalidación */
export const AUDIT_LOGS_KEYS = {
  stats: ['admin', 'audit-logs', 'stats'] as const,
  list: ['admin', 'audit-logs', 'list'] as const,
  detail: ['admin', 'audit-logs', 'detail'] as const,
};

/** Filtro de severidad para la UI */
export type SeverityFilter = AuditSeverity | 'all';

/** Filtro de categoría para la UI */
export type CategoryFilter = AuditCategory | 'all';

interface UseAuditLogsReturn {
  // Estado de carga
  isLoading: boolean;
  error: string | null;

  // Datos de estadísticas
  stats: AuditLogsStats | null;
  statsLoading: boolean;

  // Datos de lista
  logs: AuditLogItem[];
  total: number;
  hasMore: boolean;

  // Filtros
  severityFilter: SeverityFilter;
  setSeverityFilter: (severity: SeverityFilter) => void;
  categoryFilter: CategoryFilter;
  setCategoryFilter: (category: CategoryFilter) => void;
  searchEmail: string;
  setSearchEmail: (email: string) => void;
  actionFilter: string;
  setActionFilter: (action: string) => void;

  // Paginación
  page: number;
  setPage: (page: number) => void;
  pageSize: number;

  // Selección
  selectedLog: AuditLogItem | null;
  setSelectedLog: (log: AuditLogItem | null) => void;
  selectLogById: (id: string) => Promise<void>;

  // Refetch
  refetchAll: () => Promise<void>;
}

/**
 * Hook para gestionar audit logs desde admin
 */
export function useAuditLogs(): UseAuditLogsReturn {
  const pageSize = 30;

  // Estado local de filtros
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchEmail, setSearchEmail] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  // Construir filtros para la API
  const buildFilters = useCallback((): AuditLogsFilters => {
    const filters: AuditLogsFilters = {
      limit: pageSize,
      offset: (page - 1) * pageSize,
    };
    if (severityFilter !== 'all') {
      filters.severity = severityFilter;
    }
    if (categoryFilter !== 'all') {
      filters.category = categoryFilter;
    }
    if (searchEmail.trim()) {
      filters.userEmail = searchEmail.trim();
    }
    if (actionFilter.trim()) {
      filters.action = actionFilter.trim();
    }
    return filters;
  }, [severityFilter, categoryFilter, searchEmail, actionFilter, page, pageSize]);

  // Query: Estadísticas
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: AUDIT_LOGS_KEYS.stats,
    queryFn: getAuditLogsStats,
    staleTime: 60_000, // 1 minuto
  });

  // Query: Lista de logs
  const {
    data: logsData,
    isLoading: logsLoading,
    error: logsError,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: [...AUDIT_LOGS_KEYS.list, buildFilters()],
    queryFn: () => getAuditLogsList(buildFilters()),
    staleTime: 30_000,
  });

  // Seleccionar log por ID (para ver detalle)
  const selectLogById = async (id: string) => {
    try {
      const log = await getAuditLogById(id);
      setSelectedLog(log);
    } catch {
      console.error('Error al cargar detalle de log');
    }
  };

  // Refetch all
  const refetchAll = async () => {
    await Promise.all([refetchStats(), refetchLogs()]);
  };

  // Estado general de carga y error
  const isLoading = statsLoading || logsLoading;
  const error = statsError || logsError ? 'Error al cargar audit logs' : null;

  return {
    isLoading,
    error,
    stats: stats ?? null,
    statsLoading,
    logs: logsData?.items ?? [],
    total: logsData?.total ?? 0,
    hasMore: logsData?.hasMore ?? false,
    severityFilter,
    setSeverityFilter: (severity) => {
      setSeverityFilter(severity);
      setPage(1);
    },
    categoryFilter,
    setCategoryFilter: (category) => {
      setCategoryFilter(category);
      setPage(1);
    },
    searchEmail,
    setSearchEmail: (email) => {
      setSearchEmail(email);
      setPage(1);
    },
    actionFilter,
    setActionFilter: (action) => {
      setActionFilter(action);
      setPage(1);
    },
    page,
    setPage,
    pageSize,
    selectedLog,
    setSelectedLog,
    selectLogById,
    refetchAll,
  };
}
