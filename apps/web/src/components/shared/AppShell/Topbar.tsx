'use client';

/**
 * Topbar Component - Barra superior reutilizable
 *
 * RESPONSABILIDADES:
 * - Mostrar título de página actual con icono
 * - Botón de menú mobile
 * - Notificaciones con badge
 * - Toggle de tema (solo para variantes que lo soporten)
 * - Acciones adicionales configurables
 *
 * DECISIONES DE ARQUITECTURA:
 * - Cada variante tiene su propio estilo visual
 * - El tema toggle solo se muestra en docente por defecto
 * - Las notificaciones son opcionales
 */

import { memo } from 'react';
import { Menu, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme/ThemeContext';
import type { TopbarProps } from './types';
import { VARIANT_THEMES } from './types';

/**
 * Botón de notificaciones
 */
interface NotificationButtonProps {
  variant: TopbarProps['variant'];
  count: number;
  onClick?: () => void;
}

const NotificationButton = memo(function NotificationButton({
  variant,
  count,
  onClick,
}: NotificationButtonProps) {
  const theme = VARIANT_THEMES[variant];

  if (variant === 'admin') {
    return (
      <button
        onClick={onClick}
        className="relative p-3 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-200 group"
      >
        <Bell
          className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300"
          strokeWidth={2.5}
        />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-red-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
            {count}
          </span>
        )}
      </button>
    );
  }

  // docente / tutor
  return (
    <button
      onClick={onClick}
      className={`relative p-2.5 rounded-xl ${
        variant === 'docente'
          ? 'bg-purple-100/60 dark:bg-purple-900/40 hover:bg-purple-200/70 dark:hover:bg-purple-800/50 border border-purple-300/40 dark:border-purple-600/40'
          : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
      } backdrop-blur-sm shadow-sm transition-all duration-200`}
    >
      <Bell
        className={`w-[18px] h-[18px] ${
          variant === 'docente' ? 'text-indigo-900 dark:text-purple-200' : 'text-gray-700'
        }`}
      />
      {count > 0 && (
        <span
          className={`absolute -top-1 -right-1 w-5 h-5 ${
            variant === 'docente' ? 'bg-gradient-to-br from-pink-500 to-rose-600' : 'bg-red-500'
          } text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg`}
        >
          {count}
        </span>
      )}
    </button>
  );
});

/**
 * Toggle de tema (light/dark)
 */
interface ThemeToggleProps {
  variant: TopbarProps['variant'];
}

const ThemeToggle = memo(function ThemeToggle({ variant }: ThemeToggleProps) {
  // Solo intentamos usar el hook si estamos en una variante que lo soporta
  // En otros casos, simplemente no renderizamos nada
  try {
    const { theme, toggleTheme } = useTheme();

    if (variant === 'admin') {
      // Admin no tiene tema toggle por defecto (siempre oscuro)
      return null;
    }

    return (
      <button
        onClick={toggleTheme}
        className={`p-2.5 rounded-xl ${
          variant === 'docente'
            ? 'bg-purple-100/60 dark:bg-purple-900/40 hover:bg-purple-200/70 dark:hover:bg-purple-800/50 border border-purple-300/40 dark:border-purple-600/40'
            : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
        } backdrop-blur-sm shadow-sm transition-all duration-200`}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-[18px] h-[18px] text-amber-400" />
        ) : (
          <Moon
            className={`w-[18px] h-[18px] ${
              variant === 'docente' ? 'text-purple-700' : 'text-gray-700'
            }`}
          />
        )}
      </button>
    );
  } catch {
    // Si no hay ThemeProvider, no mostramos el toggle
    return null;
  }
});

/**
 * Componente Topbar principal
 */
export const Topbar = memo(function Topbar({
  variant,
  pageTitle,
  pageIcon: PageIcon,
  onMobileMenuClick,
  notificationCount = 0,
  onNotificationsClick,
  showThemeToggle = variant === 'docente',
  actions,
}: TopbarProps) {
  const theme = VARIANT_THEMES[variant];

  return (
    <header
      className={`h-16 ${theme.topbarBg} border-b ${theme.sidebarBorder} shadow-${variant === 'admin' ? 'lg' : 'sm'}`}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          onClick={onMobileMenuClick}
          className={`md:hidden p-2 rounded-xl ${theme.hoverBg} transition-colors`}
        >
          <Menu className={`w-5 h-5 ${theme.textPrimary}`} />
        </button>

        {/* Page Title with Icon */}
        <div className="hidden md:flex items-center gap-3">
          {variant === 'admin' && PageIcon && (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <PageIcon className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          )}
          <h2
            className={`text-${variant === 'admin' ? 'lg font-black' : 'base font-bold'} ${theme.textPrimary}`}
          >
            {pageTitle}
          </h2>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Acciones personalizadas */}
          {actions}

          {/* Theme Toggle */}
          {showThemeToggle && <ThemeToggle variant={variant} />}

          {/* Notifications */}
          <NotificationButton
            variant={variant}
            count={notificationCount}
            onClick={onNotificationsClick}
          />
        </div>
      </div>
    </header>
  );
});

export default Topbar;
