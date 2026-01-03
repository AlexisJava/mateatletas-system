'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Bell, LogOut, User, ChevronDown } from 'lucide-react';

/**
 * Header del Portal Docente
 *
 * Basado en el Header del admin, adaptado con colores purple.
 * Funcionalidades:
 * - Saludo dinámico (Buenos días/tardes/noches)
 * - Reloj en tiempo real
 * - Botón de notificaciones con badge
 * - Avatar con dropdown (perfil, logout)
 */

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

interface HeaderProps {
  /** Número de notificaciones pendientes */
  notificationCount?: number;
}

export function Header({ notificationCount = 0 }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Actualizar reloj cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = useCallback(() => {
    logout();
    router.push('/login');
  }, [logout, router]);

  const userName = user?.nombre ?? 'Docente';
  const greeting = getGreeting();

  return (
    <header className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
      {/* Lado izquierdo - Saludo y fecha */}
      <div className="animate-in slide-in-from-left-4 duration-500">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--docente-text)]">
          {greeting},{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--docente-accent)] to-purple-400">
            {userName}
          </span>
        </h1>
        <p className="text-[var(--docente-text-muted)] mt-1 capitalize">
          {formatDate(currentTime)}
        </p>
      </div>

      {/* Lado derecho - Reloj y acciones */}
      <div className="flex items-center gap-4 animate-in slide-in-from-right-4 duration-500">
        {/* Reloj */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--docente-surface)] border border-[var(--docente-border)]">
          <div className="w-2 h-2 rounded-full bg-[var(--docente-accent)] animate-pulse" />
          <span className="text-lg font-semibold text-[var(--docente-text)] tabular-nums">
            {formatTime(currentTime)}
          </span>
        </div>

        {/* Notificaciones */}
        <button
          type="button"
          className="relative p-3 rounded-xl bg-[var(--docente-surface)] border border-[var(--docente-border)] text-[var(--docente-text-muted)] hover:text-[var(--docente-text)] hover:bg-[var(--docente-surface-hover)] transition-colors"
          aria-label={`Notificaciones${notificationCount > 0 ? ` (${notificationCount} pendientes)` : ''}`}
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-[var(--status-danger)] text-white text-xs font-bold rounded-full flex items-center justify-center">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>

        {/* Avatar con dropdown */}
        <div className="relative" data-dropdown>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-2 rounded-xl bg-[var(--docente-surface)] border border-[var(--docente-border)] hover:bg-[var(--docente-surface-hover)] transition-colors"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--docente-accent)] to-purple-400 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user?.nombre?.charAt(0).toUpperCase() ?? 'D'}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-[var(--docente-text-muted)] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 py-2 bg-[var(--docente-surface)] border border-[var(--docente-border)] rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-[var(--docente-border)]">
                <p className="text-sm font-semibold text-[var(--docente-text)]">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="text-xs text-[var(--docente-text-muted)] truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push('/docente/perfil');
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-[var(--docente-text-muted)] hover:bg-[var(--docente-surface-hover)] hover:text-[var(--docente-text)] flex items-center gap-3 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Mi perfil
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-sm text-[var(--status-danger)] hover:bg-[var(--status-danger-muted)] flex items-center gap-3 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
