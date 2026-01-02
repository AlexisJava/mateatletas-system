'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getPagosRecientes,
  type TransaccionAdmin,
  type PaginatedResponse,
} from '@/lib/api/admin.api';
import {
  MOCK_TRANSACTIONS,
  formatCurrency,
  formatRelativeTime,
} from '@/lib/constants/admin-mock-data';

/**
 * TransactionsList - Lista de transacciones recientes
 *
 * Conectado al backend via GET /admin/pagos/recientes
 * Con paginación y fallback a mock data si hay error.
 */

// Mapeo de estados del backend a colores
function getStatusColor(estado: string): string {
  switch (estado) {
    case 'Pagado':
      return 'bg-[var(--status-success-muted)] text-[var(--status-success)]';
    case 'Pendiente':
      return 'bg-[var(--status-warning-muted)] text-[var(--status-warning)]';
    case 'Vencido':
      return 'bg-[var(--status-error-muted)] text-[var(--status-error)]';
    default:
      return 'bg-[var(--admin-surface-2)] text-[var(--admin-text-muted)]';
  }
}

export function TransactionsList() {
  const [data, setData] = useState<PaginatedResponse<TransaccionAdmin> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPagosRecientes(page, limit);
      setData(response);
    } catch (err) {
      console.warn('TransactionsList: Usando mock data por error:', err);
      setError('Error al cargar transacciones');
      // No hacemos setData aquí, usamos mock en el render
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
        <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[var(--status-warning)]" />
          Transacciones Recientes
        </h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--admin-accent)]" />
        </div>
      </div>
    );
  }

  // Error state - show mock data
  if (error || !data) {
    return (
      <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
        <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[var(--status-warning)]" />
          Transacciones Recientes
          <span className="text-xs font-normal text-[var(--admin-text-muted)]">(demo)</span>
        </h3>
        {error && (
          <div className="flex items-center gap-2 text-xs text-[var(--status-warning)] mb-3">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
          {MOCK_TRANSACTIONS.map((tx) => (
            <MockTransactionItem key={tx.id} transaction={tx} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (data.data.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
        <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[var(--status-warning)]" />
          Transacciones Recientes
        </h3>
        <div className="py-8 text-center text-[var(--admin-text-muted)]">
          No hay transacciones registradas
        </div>
      </div>
    );
  }

  // Success state with real data
  return (
    <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--admin-text)] flex items-center gap-2">
          <Clock className="w-5 h-5 text-[var(--status-warning)]" />
          Transacciones Recientes
        </h3>
        <span className="text-xs text-[var(--admin-text-muted)]">{data.meta.total} total</span>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
        {data.data.map((tx) => (
          <TransactionItem key={tx.id} transaction={tx} />
        ))}
      </div>

      {/* Paginación */}
      {data.meta.lastPage > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--admin-border)]">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--admin-surface-2)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <span className="text-xs text-[var(--admin-text-muted)]">
            Página {data.meta.currentPage} de {data.meta.lastPage}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.meta.lastPage, p + 1))}
            disabled={page === data.meta.lastPage}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--admin-surface-2)] transition-colors"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

interface TransactionItemProps {
  transaction: TransaccionAdmin;
}

function TransactionItem({ transaction: tx }: TransactionItemProps) {
  const estudianteNombre = tx.estudiante
    ? `${tx.estudiante.nombre} ${tx.estudiante.apellido}`
    : tx.tutor.nombre + ' ' + tx.tutor.apellido;

  return (
    <div className="p-3 bg-[var(--admin-surface-2)] rounded-lg hover:bg-[var(--admin-surface-1)] border border-transparent hover:border-[var(--admin-border)] transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-[var(--admin-text)]">{estudianteNombre}</p>
          <p className="text-xs text-[var(--admin-text-muted)]">{tx.concepto}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-[var(--admin-text)]">{formatCurrency(tx.monto)}</p>
          <span
            className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(tx.estado)}`}
          >
            {tx.estado}
          </span>
        </div>
      </div>
      <p className="text-xs text-[var(--admin-text-disabled)] mt-2">
        {formatRelativeTime(tx.fecha)}
      </p>
    </div>
  );
}

// Mock transaction item (para fallback)
interface MockTransactionItemProps {
  transaction: (typeof MOCK_TRANSACTIONS)[0];
}

function MockTransactionItem({ transaction: tx }: MockTransactionItemProps) {
  const statusLabels = {
    completed: 'Pagado',
    pending: 'Pendiente',
    failed: 'Fallido',
  };

  const statusColors = {
    completed: 'bg-[var(--status-success-muted)] text-[var(--status-success)]',
    pending: 'bg-[var(--status-warning-muted)] text-[var(--status-warning)]',
    failed: 'bg-[var(--status-error-muted)] text-[var(--status-error)]',
  };

  return (
    <div className="p-3 bg-[var(--admin-surface-2)] rounded-lg hover:bg-[var(--admin-surface-1)] border border-transparent hover:border-[var(--admin-border)] transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-[var(--admin-text)]">{tx.studentName}</p>
          <p className="text-xs text-[var(--admin-text-muted)]">{tx.tier}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-[var(--admin-text)]">{formatCurrency(tx.amount)}</p>
          <span
            className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[tx.status]}`}
          >
            {statusLabels[tx.status]}
          </span>
        </div>
      </div>
      <p className="text-xs text-[var(--admin-text-disabled)] mt-2">
        {formatRelativeTime(tx.date)}
      </p>
    </div>
  );
}

export default TransactionsList;
