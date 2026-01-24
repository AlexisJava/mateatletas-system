'use client';

import { motion } from 'framer-motion';
import type { WebhookFailedItem, DlqStatus } from '@/lib/api/admin.api';

interface DlqTableProps {
  items: WebhookFailedItem[];
  onView: (item: WebhookFailedItem) => void;
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
}

const statusConfig: Record<DlqStatus, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pendiente', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  PROCESSING: { label: 'Procesando', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  RESOLVED: { label: 'Resuelto', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ABANDONED: { label: 'Abandonado', color: 'text-red-400', bg: 'bg-red-500/10' },
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

function truncateError(error: string, maxLength = 60): string {
  if (error.length <= maxLength) return error;
  return error.substring(0, maxLength) + '...';
}

/**
 * DlqTable - Tabla de webhooks fallidos
 */
export function DlqTable({
  items,
  onView,
  page,
  pageSize,
  total,
  hasMore,
  onPageChange,
}: DlqTableProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (items.length === 0) {
    return (
      <div className="bg-white/[0.02] rounded-xl border border-white/[0.08] p-12 text-center">
        <div className="text-4xl mb-4">✨</div>
        <p className="text-[var(--admin-text-muted)]">No hay webhooks en la cola de errores</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] rounded-xl border border-white/[0.08] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.08]">
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-muted)] uppercase tracking-wider">
              Payment ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-muted)] uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-muted)] uppercase tracking-wider">
              Error
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-muted)] uppercase tracking-wider">
              Reintentos
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-muted)] uppercase tracking-wider">
              Estado
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-muted)] uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-[var(--admin-text-muted)] uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const status = statusConfig[item.status];
            return (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-3">
                  <code className="text-sm text-[var(--admin-accent)] bg-[var(--admin-accent)]/10 px-2 py-0.5 rounded">
                    {item.paymentId}
                  </code>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--admin-text)]">{item.webhookType}</td>
                <td className="px-4 py-3">
                  <span className="text-sm text-red-400" title={item.errorMessage}>
                    {truncateError(item.errorMessage)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[var(--admin-text)]">{item.retries}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${status.bg} ${status.color}`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--admin-text-muted)]">
                  {formatDate(item.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onView(item)}
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
