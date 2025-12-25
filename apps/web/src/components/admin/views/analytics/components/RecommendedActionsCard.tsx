'use client';

/**
 * RecommendedActionsCard - Card con acciones recomendadas
 */

const ACTIONS = [
  {
    type: 'warning' as const,
    title: 'Contactar estudiantes inactivos',
    desc: '12 estudiantes sin actividad hace 2+ semanas',
    bgClass: 'bg-[var(--status-warning-muted)]',
    borderClass: 'border-[var(--status-warning)]',
  },
  {
    type: 'info' as const,
    title: 'Enviar encuesta de satisfaccion',
    desc: 'Programada para fin de mes',
    bgClass: 'bg-[var(--status-info-muted)]',
    borderClass: 'border-[var(--status-info)]',
  },
  {
    type: 'success' as const,
    title: 'Celebrar aniversarios',
    desc: '8 estudiantes cumplen 1 ano este mes',
    bgClass: 'bg-[var(--status-success-muted)]',
    borderClass: 'border-[var(--status-success)]',
  },
];

export function RecommendedActionsCard() {
  return (
    <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
      <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4">Acciones Recomendadas</h3>
      <div className="space-y-3">
        {ACTIONS.map((action) => (
          <div
            key={action.title}
            className={`p-3 ${action.bgClass} rounded-lg border-l-4 ${action.borderClass}`}
          >
            <p className="text-sm font-medium text-[var(--admin-text)]">{action.title}</p>
            <p className="text-xs text-[var(--admin-text-muted)] mt-1">{action.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecommendedActionsCard;
