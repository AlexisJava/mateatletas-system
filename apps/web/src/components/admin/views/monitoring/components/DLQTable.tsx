'use client';

import { useState } from 'react';
import { Eye, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminBadge, AdminButton } from '@/components/admin/primitives';
import type { WebhookFailedItem, DlqStatus } from '@/lib/api/admin.api';
import { formatDate } from '@/lib/utils/format';
import type { EstadoVariant } from '@/components/admin/constants/colors.constants';

interface DLQTableProps {
  items: WebhookFailedItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onView: (item: WebhookFailedItem) => void;
  onResolve: (item: WebhookFailedItem) => void;
  onAbandon: (item: WebhookFailedItem) => void;
}

const STATUS_CONFIG: Record<DlqStatus, { label: string; variant: EstadoVariant }> = {
  PENDING: { label: 'Pendiente', variant: 'warning' },
  PROCESSING: { label: 'Procesando', variant: 'info' },
  RESOLVED: { label: 'Resuelto', variant: 'success' },
  ABANDONED: { label: 'Abandonado', variant: 'danger' },
};

function StatusBadge({ status }: { status: DlqStatus }) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: 'neutral' as EstadoVariant };
  return <AdminBadge variant={config.variant}>{config.label}</AdminBadge>;
}

export function DLQTable({
  items,
  total,
  page,
  limit,
  hasMore,
  isLoading,
  onPageChange,
  onView,
  onResolve,
  onAbandon,
}: DLQTableProps) {
  const totalPages = Math.ceil(total / limit);

  if (!isLoading && items.length === 0) {
    return (
      <div className="text-center py-12 bg-[var(--admin-surface-1)] rounded-xl border border-[var(--admin-border)]">
        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-[var(--status-success)]" />
        <p className="text-[var(--admin-text)]">No hay webhooks en la cola de fallos</p>
        <p className="text-sm text-[var(--admin-text-muted)] mt-1">
          Todos los webhooks se procesaron correctamente
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--admin-border)]">
        <table className="w-full">
          <thead className="bg-[var(--admin-surface-2)]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                Payment ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                Reintentos
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                Error
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                Creado
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--admin-border)] bg-[var(--admin-surface-1)]">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-[var(--admin-surface-2)] transition-colors">
                <td className="px-4 py-4">
                  <span className="font-mono text-sm text-[var(--admin-text)]">
                    {item.paymentId}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-[var(--admin-text-muted)]">{item.webhookType}</span>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-[var(--admin-text)]">{item.retries}</span>
                </td>
                <td className="px-4 py-4 max-w-xs">
                  <p
                    className="text-sm text-[var(--status-danger)] truncate"
                    title={item.errorMessage}
                  >
                    {item.errorMessage}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-[var(--admin-text-muted)]">
                    {formatDate(item.createdAt)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onView(item)}
                      className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors"
                      title="Ver detalle"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {item.status === 'PENDING' && (
                      <>
                        <button
                          type="button"
                          onClick={() => onResolve(item)}
                          className="p-2 rounded-lg hover:bg-[var(--status-success-muted)] text-[var(--admin-text-muted)] hover:text-[var(--status-success)] transition-colors"
                          title="Marcar como resuelto"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onAbandon(item)}
                          className="p-2 rounded-lg hover:bg-[var(--status-danger-muted)] text-[var(--admin-text-muted)] hover:text-[var(--status-danger)] transition-colors"
                          title="Marcar como abandonado"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--admin-text-muted)]">
            Mostrando {items.length} de {total} registros
          </span>
          <div className="flex items-center gap-2">
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || isLoading}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Anterior
            </AdminButton>
            <span className="text-sm text-[var(--admin-text-muted)]">
              Página {page} de {totalPages}
            </span>
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={!hasMore || isLoading}
              icon={<ChevronRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Siguiente
            </AdminButton>
          </div>
        </div>
      )}
    </div>
  );
}
