'use client';

import { motion } from 'framer-motion';
import type { AuditLogItem, AuditSeverity } from '@/lib/api/admin.api';

interface AuditLogsTableProps {
  logs: AuditLogItem[];
  onView: (log: AuditLogItem) => void;
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
}

const severityConfig: Record<AuditSeverity, { label: string; color: string; bg: string }> = {
  info: { label: 'Info', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  warning: { label: 'Warning', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  error: { label: 'Error', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  critical: { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10' },
};

const categoryIcons: Record<string, string> = {
  auth: '🔐',
  payment: '💳',
  user_management: '👥',
  data_modification: '📝',
  security: '🛡️',
  system: '⚙️',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateText(text: string, maxLength = 50): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * AuditLogsTable - Tabla de audit logs
 */
export function AuditLogsTable({
  logs,
  onView,
  page,
  pageSize,
  total,
  hasMore,
  onPageChange,
}: AuditLogsTableProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (logs.length === 0) {
    return (
      <div className="bg-white/[0.02] rounded-xl border border-white/[0.08] p-12 text-center">
        <div className="text-4xl mb-4">📋</div>
        <p className="text-[var(--admin-text-muted)]">No hay logs de auditoría con estos filtros</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] rounded-xl border border-white/[0.08] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.08]">
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-muted)] uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-muted)] uppercase tracking-wider">
              Usuario
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-muted)] uppercase tracking-wider">
              Acción
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-muted)] uppercase tracking-wider">
              Descripción
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-muted)] uppercase tracking-wider">
              Categoría
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-muted)] uppercase tracking-wider">
              Severidad
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-[var(--admin-text-muted)] uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => {
            const severity = severityConfig[log.severity as AuditSeverity] ?? severityConfig.info;
            const categoryIcon = categoryIcons[log.category] ?? '📁';

            return (
              <motion.tr
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-3 text-sm text-[var(--admin-text-muted)]">
                  {formatDate(log.timestamp)}
                </td>
                <td className="px-4 py-3">
                  {log.userEmail ? (
                    <span className="text-sm text-[var(--admin-text)]">{log.userEmail}</span>
                  ) : (
                    <span className="text-sm text-[var(--admin-text-muted)] italic">Sistema</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <code className="text-sm text-[var(--admin-accent)] bg-[var(--admin-accent)]/10 px-2 py-0.5 rounded">
                    {log.action}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[var(--admin-text)]" title={log.description}>
                    {truncateText(log.description)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm" title={log.category}>
                    {categoryIcon}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${severity.bg} ${severity.color}`}
                  >
                    {severity.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onView(log)}
                    className="text-[var(--admin-accent)] hover:text-[var(--admin-accent)]/80 text-sm font-medium transition-colors"
                  >
                    Ver detalle
                  </button>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-white/[0.08] flex items-center justify-between">
          <span className="text-sm text-[var(--admin-text-muted)]">
            Mostrando {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} de {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-[var(--admin-text)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/[0.05] transition-colors"
            >
              Anterior
            </button>
            <span className="text-sm text-[var(--admin-text)]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={!hasMore}
              className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-[var(--admin-text)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/[0.05] transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
