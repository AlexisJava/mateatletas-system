'use client';

import Link from 'next/link';
import { AlertCircle, Activity, CheckCircle, ArrowRight } from 'lucide-react';
import type { AlertItemProps } from '../types/dashboard.types';

/**
 * AlertItem - Ítem de alerta del sistema
 *
 * Muestra una alerta con icono, título, descripción y acción opcional.
 */

const ALERT_ICONS = {
  warning: AlertCircle,
  info: Activity,
  success: CheckCircle,
} as const;

const ALERT_COLORS = {
  warning: 'text-[var(--status-warning)] bg-[var(--status-warning-muted)]',
  info: 'text-[var(--status-info)] bg-[var(--status-info-muted)]',
  success: 'text-[var(--status-success)] bg-[var(--status-success-muted)]',
} as const;

const ALERT_BORDER_COLORS = {
  warning: 'border-l-[var(--status-warning)]',
  info: 'border-l-[var(--status-info)]',
  success: 'border-l-[var(--status-success)]',
} as const;

export function AlertItem({ type, title, description, action, href }: AlertItemProps) {
  const Icon = ALERT_ICONS[type];

  const content = (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] border-l-4 ${ALERT_BORDER_COLORS[type]} hover:border-[var(--admin-border-accent)] transition-colors`}
    >
      <div
        className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${ALERT_COLORS[type]}`}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--admin-text)] truncate">{title}</p>
        <p className="text-xs text-[var(--admin-text-muted)] truncate">{description}</p>
      </div>
      {action && <ArrowRight className="w-4 h-4 text-[var(--admin-accent)] flex-shrink-0" />}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export default AlertItem;
