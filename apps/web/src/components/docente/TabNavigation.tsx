'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Calendar, FileText, User, type LucideIcon } from 'lucide-react';
import { DOCENTE_NAV_ITEMS, type DocenteNavItem } from '@/types/docente-dashboard.types';

/**
 * TabNavigation - Navegación horizontal por tabs para el Portal Docente
 *
 * Basado en TabNavigation.tsx del admin, adaptado con colores purple.
 * - Usa Link de next/link con prefetch
 * - Detecta ruta activa con usePathname
 * - CSS variables del sistema de diseño docente
 * - Responsive con scroll horizontal en mobile
 */

// Mapeo de nombres de iconos a componentes Lucide
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileText,
  User,
};

function getIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? LayoutDashboard;
}

export function TabNavigation() {
  const pathname = usePathname();

  // Determina si una ruta está activa
  const isActive = (href: string): boolean => {
    if (href === '/docente/dashboard') {
      return pathname === '/docente' || pathname === '/docente/dashboard';
    }
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <nav className="shrink-0 mb-4 animate-in slide-in-from-top-4 duration-500">
      {/* Navigation Cards - Scroll horizontal en mobile */}
      <div className="overflow-x-auto custom-scrollbar pb-2">
        <div className="flex items-center justify-start md:justify-center gap-3 min-w-max px-1">
          {DOCENTE_NAV_ITEMS.map((item: DocenteNavItem) => {
            const Icon = getIcon(item.icon);
            const active = isActive(item.href);

            return (
              <Link
                key={item.view}
                href={item.href}
                prefetch={true}
                className={`
                  relative flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-300 whitespace-nowrap group
                  ${
                    active
                      ? 'bg-gradient-to-br from-[var(--docente-accent)] to-purple-500 text-white border-[var(--docente-accent)]/50 shadow-lg shadow-[var(--docente-accent)]/20 scale-105 z-10'
                      : 'bg-[var(--docente-surface)] text-[var(--docente-text-muted)] border-[var(--docente-border)] hover:text-[var(--docente-text)] hover:bg-[var(--docente-surface-hover)] hover:border-[var(--docente-border)] active:scale-95'
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    active
                      ? 'text-white'
                      : 'text-[var(--docente-text-muted)] group-hover:text-[var(--docente-accent)]'
                  }`}
                />
                <span className="font-medium text-sm">{item.label}</span>

                {/* Badge de notificaciones (si existe) */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 min-w-[20px] h-5 px-1.5 bg-[var(--status-danger)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}

                {/* Active Indicator Dot */}
                {active && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--docente-accent)]/75 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--docente-accent)] border-2 border-[var(--docente-bg)]" />
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default TabNavigation;
