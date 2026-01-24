'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WebhookFailedItem, DlqStatus } from '@/lib/api/admin.api';

interface DlqDetailModalProps {
  item: WebhookFailedItem | null;
  onClose: () => void;
  onResolve: (id: string, notes?: string) => Promise<void>;
  onAbandon: (id: string, notes?: string) => Promise<void>;
  isResolving: boolean;
  isAbandoning: boolean;
}

const statusConfig: Record<DlqStatus, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pendiente', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  PROCESSING: { label: 'Procesando', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  RESOLVED: { label: 'Resuelto', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ABANDONED: { label: 'Abandonado', color: 'text-red-400', bg: 'bg-red-500/10' },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * DlqDetailModal - Modal de detalle de webhook fallido
 */
export function DlqDetailModal({
  item,
  onClose,
  onResolve,
  onAbandon,
  isResolving,
  isAbandoning,
}: DlqDetailModalProps) {
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'payload' | 'error'>('info');

  if (!item) return null;

  const status = statusConfig[item.status];
  const canTakeAction = item.status === 'PENDING' || item.status === 'PROCESSING';

  const handleResolve = async () => {
    await onResolve(item.id, notes || undefined);
    setNotes('');
  };

  const handleAbandon = async () => {
    await onAbandon(item.id, notes || undefined);
    setNotes('');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[var(--admin-surface)] border border-white/[0.08] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-[var(--admin-text)]">Webhook Fallido</h2>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${status.bg} ${status.color}`}
              >
                {status.label}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <svg
                className="w-5 h-5 text-[var(--admin-text-muted)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="px-6 pt-4 border-b border-white/[0.08]">
            <div className="flex gap-4">
              {(['info', 'payload', 'error'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'text-[var(--admin-accent)] border-[var(--admin-accent)]'
                      : 'text-[var(--admin-text-muted)] border-transparent hover:text-[var(--admin-text)]'
                  }`}
                >
                  {tab === 'info' && 'Información'}
                  {tab === 'payload' && 'Payload'}
                  {tab === 'error' && 'Error'}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[400px]">
            {activeTab === 'info' && (
              <div className="space-y-4">
                <InfoRow label="ID" value={item.id} mono />
                <InfoRow label="Payment ID" value={item.paymentId} mono />
                <InfoRow label="Tipo de Webhook" value={item.webhookType} />
                <InfoRow label="Reintentos" value={String(item.retries)} />
                <InfoRow label="Creado" value={formatDate(item.createdAt)} />
                <InfoRow label="Último reintento" value={formatDate(item.lastRetryAt)} />
                {item.resolvedAt && (
                  <>
                    <InfoRow label="Resuelto" value={formatDate(item.resolvedAt)} />
                    <InfoRow label="Resuelto por" value={item.resolvedBy ?? '-'} />
                  </>
                )}
                {item.resolutionNotes && <InfoRow label="Notas" value={item.resolutionNotes} />}
              </div>
            )}

            {activeTab === 'payload' && (
              <pre className="bg-black/30 rounded-lg p-4 text-sm text-[var(--admin-text)] overflow-x-auto">
                {JSON.stringify(item.payload, null, 2)}
              </pre>
            )}

            {activeTab === 'error' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[var(--admin-text-muted)] uppercase tracking-wider">
                    Mensaje de Error
                  </label>
                  <p className="mt-1 text-red-400">{item.errorMessage}</p>
                </div>
                {item.errorStack && (
                  <div>
                    <label className="text-xs text-[var(--admin-text-muted)] uppercase tracking-wider">
                      Stack Trace
                    </label>
                    <pre className="mt-1 bg-black/30 rounded-lg p-4 text-xs text-red-300 overflow-x-auto whitespace-pre-wrap">
                      {item.errorStack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {canTakeAction && (
            <div className="px-6 py-4 border-t border-white/[0.08] space-y-4">
              <div>
                <label className="text-xs text-[var(--admin-text-muted)] uppercase tracking-wider">
                  Notas de resolución (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Agregar notas sobre la resolución..."
                  className="mt-2 w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--admin-accent)]/50 resize-none"
                  rows={2}
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleAbandon}
                  disabled={isAbandoning || isResolving}
                  className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isAbandoning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      Abandonando...
                    </>
                  ) : (
                    'Abandonar'
                  )}
                </button>
                <button
                  onClick={handleResolve}
                  disabled={isResolving || isAbandoning}
                  className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isResolving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      Resolviendo...
                    </>
                  ) : (
                    'Marcar resuelto'
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  mono?: boolean;
}

function InfoRow({ label, value, mono }: InfoRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-[var(--admin-text-muted)]">{label}</span>
      <span
        className={`text-sm text-[var(--admin-text)] text-right ${mono ? 'font-mono bg-white/[0.03] px-2 py-0.5 rounded' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}
