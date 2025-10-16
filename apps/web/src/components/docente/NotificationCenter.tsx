'use client';

import { useState } from 'react';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { useNotificationCenter } from '@/lib/hooks/useNotificaciones';
import {
  getNotificacionIcon,
  getNotificacionColor,
  formatearTiempoRelativo,
} from '@/lib/api/notificaciones.api';

/**
 * NotificationCenter - Migrado a React Query
 *
 * Beneficios vs Zustand:
 * - ✅ Cache automático con invalidación inteligente
 * - ✅ Background refetching cada 30s (sin setInterval manual)
 * - ✅ Optimistic updates para UX instantáneo
 * - ✅ Loading/error states automáticos
 * - ✅ Menos boilerplate (~50% menos código)
 * - ✅ DevTools para debugging
 */
export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);

  // Un solo hook reemplaza todo el store + useEffect
  const {
    notificaciones,
    count: countNoLeidas,
    isLoading,
    error,
    marcarLeida,
    marcarTodas,
    eliminar,
    isMarking,
    isDeleting,
  } = useNotificationCenter();

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-12 h-12 rounded-full flex items-center justify-center
                   bg-[var(--docente-bg-card)] border border-[var(--docente-border)]
                   hover:bg-[var(--docente-bg-hover)] transition-smooth
                   shadow-md hover:shadow-lg"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5 text-[var(--docente-text)]" />

        {/* Unread Badge */}
        {countNoLeidas > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs
                         rounded-full flex items-center justify-center font-bold
                         animate-pulse">
            {countNoLeidas > 9 ? '9+' : countNoLeidas}
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
                  {countNoLeidas > 0 && (
                    <button
                      onClick={() => marcarTodas()}
                      disabled={isMarking}
                      className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1
                               transition-smooth font-medium disabled:opacity-50"
                    >
                      <CheckCheck className="w-4 h-4" />
                      {isMarking ? 'Marcando...' : 'Marcar todas'}
                    </button>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border-b border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center text-[var(--docente-text-muted)]">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p>Cargando notificaciones...</p>
                  </div>
                ) : notificaciones.length === 0 ? (
                  <div className="p-8 text-center text-[var(--docente-text-muted)]">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No hay notificaciones</p>
                    <p className="text-sm mt-1">Te avisaremos cuando haya novedades</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--docente-border)]">
                    {notificaciones.map((notif) => {
                      const icon = getNotificacionIcon(notif.tipo);
                      const colorClass = getNotificacionColor(notif.tipo);

                      return (
                        <div
                          key={notif.id}
                          className={`p-4 hover:bg-[var(--docente-bg-hover)] transition-smooth
                                    ${!notif.leida ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                        >
                          <div className="flex gap-3">
                            {/* Icon */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${colorClass}`}>
                              <span className="text-xl">{icon}</span>
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
                                  {formatearTiempoRelativo(notif.createdAt)}
                                </span>
                                <div className="flex items-center gap-2">
                                  {!notif.leida && (
                                    <button
                                      onClick={() => marcarLeida(notif.id)}
                                      disabled={isMarking}
                                      className="text-xs text-blue-500 hover:text-blue-600
                                               transition-smooth p-1 hover:bg-blue-50 rounded
                                               disabled:opacity-50"
                                      title="Marcar como leída"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => eliminar(notif.id)}
                                    disabled={isDeleting}
                                    className="text-xs text-red-500 hover:text-red-600
                                             transition-smooth p-1 hover:bg-red-50 rounded
                                             disabled:opacity-50"
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

              {/* Footer */}
              {notificaciones.length > 0 && (
                <div className="p-3 border-t border-[var(--docente-border)] bg-gray-50 dark:bg-gray-900/20">
                  <p className="text-xs text-center text-[var(--docente-text-muted)]">
                    {notificaciones.length} notificación{notificaciones.length !== 1 ? 'es' : ''} total{notificaciones.length !== 1 ? 'es' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
