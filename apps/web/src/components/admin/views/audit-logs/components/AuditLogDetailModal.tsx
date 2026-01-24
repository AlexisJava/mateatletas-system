'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AuditLogItem, AuditSeverity } from '@/lib/api/admin.api';

interface AuditLogDetailModalProps {
  log: AuditLogItem | null;
  onClose: () => void;
}

const severityConfig: Record<AuditSeverity, { label: string; color: string; bg: string }> = {
  info: { label: 'Info', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  warning: { label: 'Warning', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  error: { label: 'Error', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  critical: { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10' },
};

const categoryLabels: Record<string, string> = {
  auth: 'Autenticación',
  payment: 'Pagos',
  user_management: 'Gestión de Usuarios',
  data_modification: 'Modificación de Datos',
  security: 'Seguridad',
  system: 'Sistema',
};

function formatDate(dateStr: string): string {
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
 * AuditLogDetailModal - Modal de detalle de audit log
 */
export function AuditLogDetailModal({ log, onClose }: AuditLogDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'changes' | 'metadata'>('info');

  if (!log) return null;

  const severity = severityConfig[log.severity as AuditSeverity] ?? severityConfig.info;

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
              <h2 className="text-lg font-semibold text-[var(--admin-text)]">Audit Log</h2>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${severity.bg} ${severity.color}`}
              >
                {severity.label}
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
              {(['info', 'changes', 'metadata'] as const).map((tab) => (
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
                  {tab === 'changes' && 'Cambios'}
                  {tab === 'metadata' && 'Metadata'}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[400px]">
            {activeTab === 'info' && (
              <div className="space-y-4">
                <InfoRow label="ID" value={log.id} mono />
                <InfoRow label="Fecha" value={formatDate(log.timestamp)} />
                <InfoRow label="Acción" value={log.action} mono />
                <InfoRow label="Descripción" value={log.description} />
                <InfoRow label="Categoría" value={categoryLabels[log.category] ?? log.category} />
                <InfoRow label="Entidad" value={log.entityType} />
                {log.entityId && <InfoRow label="ID Entidad" value={log.entityId} mono />}
                <div className="pt-4 border-t border-white/[0.05]">
                  <h4 className="text-xs text-[var(--admin-text-muted)] uppercase tracking-wider mb-3">
                    Usuario
                  </h4>
                  <InfoRow label="Email" value={log.userEmail ?? 'Sistema'} />
                  <InfoRow label="Tipo" value={log.userType ?? '-'} />
                  <InfoRow label="ID Usuario" value={log.userId ?? '-'} mono />
                </div>
                <div className="pt-4 border-t border-white/[0.05]">
                  <h4 className="text-xs text-[var(--admin-text-muted)] uppercase tracking-wider mb-3">
                    Request
                  </h4>
                  <InfoRow label="IP" value={log.ipAddress ?? '-'} mono />
                  {log.userAgent && (
                    <div className="mt-2">
                      <label className="text-xs text-[var(--admin-text-muted)] uppercase tracking-wider">
                        User Agent
                      </label>
                      <p className="mt-1 text-xs text-[var(--admin-text)] bg-black/20 p-2 rounded break-all">
                        {log.userAgent}
                      </p>
                    </div>
                  )}
                  {log.requestId && <InfoRow label="Request ID" value={log.requestId} mono />}
                </div>
              </div>
            )}

            {activeTab === 'changes' && (
              <div>
                {log.changes ? (
                  <pre className="bg-black/30 rounded-lg p-4 text-sm text-[var(--admin-text)] overflow-x-auto">
                    {JSON.stringify(log.changes, null, 2)}
                  </pre>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[var(--admin-text-muted)]">
                      No hay cambios registrados para este evento
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'metadata' && (
              <div>
                {log.metadata ? (
                  <pre className="bg-black/30 rounded-lg p-4 text-sm text-[var(--admin-text)] overflow-x-auto">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[var(--admin-text-muted)]">
                      No hay metadata adicional para este evento
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
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
