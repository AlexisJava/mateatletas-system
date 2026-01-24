'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Copy, Check } from 'lucide-react';
import { AdminModal, AdminButton, AdminBadge, AdminCard } from '@/components/admin/primitives';
import type { WebhookFailedItem, DlqStatus } from '@/lib/api/admin.api';
import { formatDate } from '@/lib/utils/format';
import type { EstadoVariant } from '@/components/admin/constants/colors.constants';

interface DLQDetailModalProps {
  webhook: WebhookFailedItem | null;
  onClose: () => void;
  onResolve: (id: string, notes?: string) => void;
  onAbandon: (id: string, notes?: string) => void;
  isResolving: boolean;
  isAbandoning: boolean;
}

const STATUS_CONFIG: Record<DlqStatus, { label: string; variant: EstadoVariant }> = {
  PENDING: { label: 'Pendiente', variant: 'warning' },
  PROCESSING: { label: 'Procesando', variant: 'info' },
  RESOLVED: { label: 'Resuelto', variant: 'success' },
  ABANDONED: { label: 'Abandonado', variant: 'danger' },
};

export function DLQDetailModal({
  webhook,
  onClose,
  onResolve,
  onAbandon,
  isResolving,
  isAbandoning,
}: DLQDetailModalProps) {
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);

  if (!webhook) return null;

  const statusConfig = STATUS_CONFIG[webhook.status];
  const isPending = webhook.status === 'PENDING';
  const payloadJson = JSON.stringify(webhook.payload, null, 2);

  const handleCopyPayload = async () => {
    await navigator.clipboard.writeText(payloadJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResolve = () => {
    onResolve(webhook.id, notes || undefined);
  };

  const handleAbandon = () => {
    onAbandon(webhook.id, notes || undefined);
  };

  const footer = isPending ? (
    <div className="flex gap-3 w-full">
      <AdminButton variant="secondary" onClick={onClose} disabled={isResolving || isAbandoning}>
        Cancelar
      </AdminButton>
      <AdminButton
        variant="danger"
        onClick={handleAbandon}
        loading={isAbandoning}
        disabled={isResolving}
        icon={<XCircle className="w-4 h-4" />}
      >
        Abandonar
      </AdminButton>
      <AdminButton
        variant="primary"
        onClick={handleResolve}
        loading={isResolving}
        disabled={isAbandoning}
        icon={<CheckCircle className="w-4 h-4" />}
      >
        Resolver
      </AdminButton>
    </div>
  ) : (
    <AdminButton variant="secondary" onClick={onClose}>
      Cerrar
    </AdminButton>
  );

  return (
    <AdminModal
      open={true}
      onClose={onClose}
      title="Detalle de Webhook"
      description={`Payment ID: ${webhook.paymentId}`}
      size="lg"
      footer={footer}
    >
      <div className="space-y-4">
        {/* Info básica */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[var(--admin-text-muted)] block mb-1">Estado</label>
            <AdminBadge variant={statusConfig.variant}>{statusConfig.label}</AdminBadge>
          </div>
          <div>
            <label className="text-xs text-[var(--admin-text-muted)] block mb-1">Tipo</label>
            <span className="text-sm text-[var(--admin-text)]">{webhook.webhookType}</span>
          </div>
          <div>
            <label className="text-xs text-[var(--admin-text-muted)] block mb-1">Reintentos</label>
            <span className="text-sm text-[var(--admin-text)]">{webhook.retries}</span>
          </div>
          <div>
            <label className="text-xs text-[var(--admin-text-muted)] block mb-1">Creado</label>
            <span className="text-sm text-[var(--admin-text)]">
              {formatDate(webhook.createdAt)}
            </span>
          </div>
          {webhook.lastRetryAt && (
            <div>
              <label className="text-xs text-[var(--admin-text-muted)] block mb-1">
                Último reintento
              </label>
              <span className="text-sm text-[var(--admin-text)]">
                {formatDate(webhook.lastRetryAt)}
              </span>
            </div>
          )}
          {webhook.resolvedAt && (
            <>
              <div>
                <label className="text-xs text-[var(--admin-text-muted)] block mb-1">
                  Resuelto
                </label>
                <span className="text-sm text-[var(--admin-text)]">
                  {formatDate(webhook.resolvedAt)}
                </span>
              </div>
              <div>
                <label className="text-xs text-[var(--admin-text-muted)] block mb-1">
                  Resuelto por
                </label>
                <span className="text-sm text-[var(--admin-text)]">{webhook.resolvedBy}</span>
              </div>
            </>
          )}
        </div>

        {/* Error */}
        <AdminCard padding="sm" animate={false}>
          <label className="text-xs text-[var(--admin-text-muted)] block mb-2">
            Mensaje de Error
          </label>
          <p className="text-sm text-[var(--status-danger)]">{webhook.errorMessage}</p>
          {webhook.errorStack && (
            <pre className="mt-2 text-xs text-[var(--admin-text-muted)] overflow-x-auto max-h-32 bg-black/20 p-2 rounded">
              {webhook.errorStack}
            </pre>
          )}
        </AdminCard>

        {/* Payload */}
        <AdminCard padding="sm" animate={false}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-[var(--admin-text-muted)]">Payload</label>
            <button
              type="button"
              onClick={handleCopyPayload}
              className="flex items-center gap-1 text-xs text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copiar
                </>
              )}
            </button>
          </div>
          <pre className="text-xs text-[var(--admin-text)] overflow-x-auto max-h-48 bg-black/20 p-3 rounded font-mono">
            {payloadJson}
          </pre>
        </AdminCard>

        {/* Notas de resolución */}
        {webhook.resolutionNotes && (
          <AdminCard padding="sm" animate={false}>
            <label className="text-xs text-[var(--admin-text-muted)] block mb-2">
              Notas de Resolución
            </label>
            <p className="text-sm text-[var(--admin-text)]">{webhook.resolutionNotes}</p>
          </AdminCard>
        )}

        {/* Input para notas (solo si está pendiente) */}
        {isPending && (
          <div>
            <label className="text-xs text-[var(--admin-text-muted)] block mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe las acciones tomadas..."
              className="w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-1)] border border-[var(--admin-border)] text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-text-disabled)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50 resize-none"
              rows={3}
            />
          </div>
        )}
      </div>
    </AdminModal>
  );
}
