'use client';

import Link from 'next/link';
import { AlertCircle, Activity, CheckCircle, ArrowRight } from 'lucide-react';
import type { AlertItemProps, AlertType } from '../types/dashboard.types';

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
      className={`flex items-start gap-3 p-4 rounded-lg bg-[var(--admin-surface-1)] border border-[var(--admin-border)] border-l-4 ${ALERT_BORDER_COLORS[type]} hover:border-[var(--admin-border-accent)] transition-colors`}
    >
      <div
        className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${ALERT_COLORS[type]}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--admin-text)]">{title}</p>
        <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">{description}</p>
        {action && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--admin-accent)] mt-2">
            {action}
            <ArrowRight className="w-3 h-3" />
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export default AlertItem;
