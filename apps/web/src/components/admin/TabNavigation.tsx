'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Users,
  Package,
  type LucideIcon,
} from 'lucide-react';
import { ADMIN_NAV_ITEMS, type AdminNavItem } from '@/types/admin-dashboard.types';

/**
 * TabNavigation - Navegación horizontal por tabs
 *
 * Basado en Sidebar.tsx del mockup de AI Studio, adaptado para Next.js App Router.
 * - Usa Link de next/link con prefetch
 * - Detecta ruta activa con usePathname
 * - CSS variables del sistema de diseño
 * - Responsive con scroll horizontal en mobile
 */

// Mapeo de nombres de iconos a componentes Lucide
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Users,
  Package,
};

function getIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? LayoutDashboard;
}

interface TabNavigationProps {
  /** Callback opcional para abrir settings */
  onOpenSettings?: () => void;
}

export function TabNavigation({ onOpenSettings }: TabNavigationProps) {
  const pathname = usePathname();

  // Determina si una ruta está activa
  const isActive = (href: string): boolean => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin' || pathname === '/admin/dashboard';
    }
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <nav className="shrink-0 mb-4 animate-in slide-in-from-top-4 duration-500">
      {/* Navigation Cards - Scroll horizontal en mobile */}
      <div className="overflow-x-auto custom-scrollbar pb-2">
        <div className="flex items-center justify-start md:justify-center gap-3 min-w-max px-1">
          {ADMIN_NAV_ITEMS.map((item: AdminNavItem) => {
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
                      ? 'bg-gradient-to-br from-[var(--status-info)] to-[var(--admin-accent-secondary)] text-white border-[var(--status-info)]/50 shadow-lg shadow-[var(--status-info)]/20 scale-105 z-10'
                      : 'bg-[var(--admin-surface-1)] text-[var(--admin-text-muted)] border-[var(--admin-border)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] hover:border-[var(--admin-border)] active:scale-95'
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    active
                      ? 'text-white'
                      : 'text-[var(--admin-text-muted)] group-hover:text-[var(--status-info)]'
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
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--status-info)]/75 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--status-info)] border-2 border-[var(--admin-bg)]" />
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
