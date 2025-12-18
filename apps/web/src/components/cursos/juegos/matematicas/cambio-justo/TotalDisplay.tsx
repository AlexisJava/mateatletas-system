import { formatCurrency, getFeedbackType, getDifference } from '@/lib/utils/currency-helpers';

interface TotalDisplayProps {
  current: number;
  target: number;
}

export default function TotalDisplay({ current, target }: TotalDisplayProps) {
  const feedback = getFeedbackType(current, target);
  const diff = getDifference(current, target);

  const getStyles = () => {
    if (feedback === 'exact') return 'bg-emerald-900/40 border-emerald-500 text-emerald-100';
    if (feedback === 'over') return 'bg-red-900/40 border-red-500 text-red-100';
    return 'bg-yellow-900/40 border-yellow-500 text-yellow-100';
  };

  const getMessage = () => {
    if (feedback === 'exact') return '¡Perfecto! Monto exacto';
    if (feedback === 'over') return `Te pasaste ${formatCurrency(diff)}`;
    return `Te falta ${formatCurrency(diff)}`;
  };

  return (
    <div className={`rounded-xl p-4 border-2 ${getStyles()} transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold mb-1">Total</div>
          <div className="text-3xl font-bold tabular-nums">{formatCurrency(current)}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold mb-1">Objetivo</div>
          <div className="text-2xl font-bold tabular-nums">{formatCurrency(target)}</div>
        </div>
      </div>
      <div className="text-center mt-2 font-semibold">{getMessage()}</div>
    </div>
  );
}
