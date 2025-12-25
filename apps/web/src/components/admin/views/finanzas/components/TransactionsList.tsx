'use client';

import { Clock } from 'lucide-react';
import {
  MOCK_TRANSACTIONS,
  formatCurrency,
  getTransactionStatusColor,
  formatRelativeTime,
} from '@/lib/constants/admin-mock-data';

/**
 * TransactionsList - Lista de transacciones recientes
 *
 * Muestra las últimas transacciones con estado y monto.
 */

export function TransactionsList() {
  return (
    <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
      <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-[var(--status-warning)]" />
        Transacciones Recientes
      </h3>
      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
        {MOCK_TRANSACTIONS.map((tx) => (
          <TransactionItem key={tx.id} transaction={tx} />
        ))}
      </div>
    </div>
  );
}

interface TransactionItemProps {
  transaction: (typeof MOCK_TRANSACTIONS)[0];
}

function TransactionItem({ transaction: tx }: TransactionItemProps) {
  const statusLabels = {
    completed: 'Pagado',
    pending: 'Pendiente',
    failed: 'Fallido',
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
            className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getTransactionStatusColor(tx.status)}`}
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
