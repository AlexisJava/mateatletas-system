'use client';

import { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, X, Calendar, AlertCircle, Award, Info } from 'lucide-react';

interface Notificacion {
  id: string;
  tipo: 'ClaseProxima' | 'AsistenciaPendiente' | 'EstudianteAlerta' | 'ClaseCancelada' | 'LogroEstudiante' | 'Recordatorio' | 'General';
  titulo: string;
  mensaje: string;
  leida: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

const tipoIcons = {
  ClaseProxima: Calendar,
  AsistenciaPendiente: AlertCircle,
  EstudianteAlerta: AlertCircle,
  ClaseCancelada: X,
  LogroEstudiante: Award,
  Recordatorio: Bell,
  General: Info,
};

const tipoColors = {
  ClaseProxima: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  AsistenciaPendiente: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
  EstudianteAlerta: 'text-red-500 bg-red-100 dark:bg-red-900/30',
  ClaseCancelada: 'text-gray-500 bg-gray-100 dark:bg-gray-900/30',
  LogroEstudiante: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  Recordatorio: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
  General: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
};

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/notificaciones', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotificaciones(data);
      }
    } catch (error: unknown) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/notificaciones/count', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error: unknown) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/notificaciones/${id}/leer`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Actualizar localmente
      setNotificaciones(notificaciones.map(n =>
        n.id === id ? { ...n, leida: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error: unknown) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3001/api/notificaciones/leer-todas', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Actualizar localmente
      setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));
      setUnreadCount(0);
    } catch (error: unknown) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/notificaciones/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Actualizar localmente
      const notif = notificaciones.find(n => n.id === id);
      setNotificaciones(notificaciones.filter(n => n.id !== id));
      if (notif && !notif.leida) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error: unknown) {
      console.error('Error deleting notification:', error);
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return 'Ahora';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`;
    return `Hace ${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-12 h-12 rounded-full flex items-center justify-center
                   bg-[var(--docente-bg-card)] border border-[var(--docente-border)]
                   hover:bg-[var(--docente-bg-hover)] transition-smooth
                   shadow-md hover:shadow-lg"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-[var(--docente-text)]" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs
                         rounded-full flex items-center justify-center font-bold
                         animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 z-50 animate-slide-in">
            <div className="glass-card rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-[var(--docente-border)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[var(--docente-text)]">
                    Notificaciones
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1
                               transition-smooth font-medium"
                    >
                      <CheckCheck className="w-4 h-4" />
                      Marcar todas
                    </button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-[var(--docente-text-muted)]">
                    Cargando...
                  </div>
                ) : notificaciones.length === 0 ? (
                  <div className="p-8 text-center text-[var(--docente-text-muted)]">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay notificaciones</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--docente-border)]">
                    {notificaciones.map((notif) => {
                      const IconComponent = tipoIcons[notif.tipo];
                      const colorClass = tipoColors[notif.tipo];

                      return (
                        <div
                          key={notif.id}
                          className={`p-4 hover:bg-[var(--docente-bg-hover)] transition-smooth
                                    ${!notif.leida ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                        >
                          <div className="flex gap-3">
                            {/* Icon */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                              <IconComponent className="w-5 h-5" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-[var(--docente-text)] text-sm">
                                  {notif.titulo}
                                </h4>
                                {!notif.leida && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-sm text-[var(--docente-text-muted)] mt-1 line-clamp-2">
                                {notif.mensaje}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-[var(--docente-text-muted)]">
                                  {getTimeAgo(notif.createdAt)}
                                </span>
                                <div className="flex items-center gap-2">
                                  {!notif.leida && (
                                    <button
                                      onClick={() => markAsRead(notif.id)}
                                      className="text-xs text-blue-500 hover:text-blue-600
                                               transition-smooth"
                                      title="Marcar como leída"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteNotification(notif.id)}
                                    className="text-xs text-red-500 hover:text-red-600
                                             transition-smooth"
                                    title="Eliminar"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
