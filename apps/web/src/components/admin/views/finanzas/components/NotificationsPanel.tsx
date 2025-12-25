'use client';

import { Bell, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * NotificationsPanel - Panel de notificaciones del sistema
 *
 * Muestra alertas y estados del sistema.
 */

export function NotificationsPanel() {
  return (
    <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
      <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4 flex items-center gap-2">
        <Bell className="w-5 h-5 text-[var(--status-warning)]" />
        Notificaciones
      </h3>
      <div className="space-y-3">
        <NotificationItem
          type="warning"
          title="Pagos por vencer"
          description="12 inscripciones pendientes"
        />
        <NotificationItem
          type="success"
          title="Sistema activo"
          description="Servicios funcionando correctamente"
        />
      </div>
    </div>
  );
}

interface NotificationItemProps {
  type: 'warning' | 'success';
  title: string;
  description: string;
}

function NotificationItem({ type, title, description }: NotificationItemProps) {
  const config = {
    warning: {
      bgColor: 'bg-[var(--status-warning-muted)]',
      borderColor: 'border-[var(--status-warning)]',
      icon: AlertCircle,
      iconColor: 'text-[var(--status-warning)]',
    },
    success: {
      bgColor: 'bg-[var(--status-success-muted)]',
      borderColor: 'border-[var(--status-success)]',
      icon: CheckCircle,
      iconColor: 'text-[var(--status-success)]',
    },
  };

  const { bgColor, borderColor, icon: Icon, iconColor } = config[type];

  return (
    <div className={`p-4 ${bgColor} border-l-4 ${borderColor} rounded-lg`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${iconColor} mt-0.5`} />
        <div>
          <p className="font-semibold text-[var(--admin-text)] text-sm">{title}</p>
          <p className="text-sm text-[var(--admin-text-muted)]">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default NotificationsPanel;
