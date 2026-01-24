'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Users,
  Package,
  BookOpen,
  Code2,
  Repeat,
  Activity,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { ADMIN_NAV_ITEMS, type AdminNavItem } from '@/types/admin-dashboard.types';

/**
 * AdminSidebar - Navegación vertical colapsable
 *
 * Reemplaza TabNavigation horizontal con un sidebar que:
 * - Se puede colapsar/expandir con toggle
 * - Persiste estado en localStorage
 * - Muestra solo iconos cuando está colapsado
 * - Animaciones suaves
 */

const STORAGE_KEY = 'admin-sidebar-collapsed';

// Mapeo de nombres de iconos a componentes Lucide
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Users,
  Package,
  BookOpen,
  Code2,
  Repeat,
  Activity,
  ScrollText,
  Settings,
};

function getIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? LayoutDashboard;
}

interface AdminSidebarProps {
  /** Callback cuando cambia el estado colapsado (para actualizar layout) */
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function AdminSidebar({ onCollapsedChange }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Cargar estado de localStorage al montar
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const collapsed = stored === 'true';
      setIsCollapsed(collapsed);
      onCollapsedChange?.(collapsed);
    }
    setMounted(true);
  }, [onCollapsedChange]);

  // Manejar toggle
  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem(STORAGE_KEY, String(newState));
    onCollapsedChange?.(newState);
  };

  // Determina si una ruta está activa
  const isActive = (href: string): boolean => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin' || pathname === '/admin/dashboard';
    }
    return pathname?.startsWith(href) ?? false;
  };

  // Evitar flash de contenido antes de leer localStorage
  if (!mounted) {
    return (
      <aside className="w-[72px] shrink-0 bg-[var(--admin-surface-1)] border-r border-[var(--admin-border)]" />
    );
  }

  return (
    <aside
      className={`
        shrink-0 flex flex-col h-full
        bg-[var(--admin-surface-1)] border-r border-[var(--admin-border)]
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-[72px]' : 'w-[240px]'}
      `}
    >
      {/* Toggle Button */}
      <div className="p-3 border-b border-[var(--admin-border)]">
        <button
          type="button"
          onClick={handleToggle}
          className={`
            flex items-center gap-3 w-full p-3 rounded-xl
            bg-[var(--admin-surface-2)] border border-[var(--admin-border)]
            text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]
            hover:bg-[var(--admin-surface-2)] transition-all duration-200
            ${isCollapsed ? 'justify-center' : 'justify-between'}
          `}
          aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {!isCollapsed && (
            <span className="font-semibold text-sm text-[var(--admin-text)]">Menú</span>
          )}
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto custom-scrollbar">
        {ADMIN_NAV_ITEMS.map((item: AdminNavItem) => {
          const Icon = getIcon(item.icon);
          const active = isActive(item.href);

          return (
            <Link
              key={item.view}
              href={item.href}
              prefetch={true}
              title={isCollapsed ? item.label : undefined}
              className={`
                relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group
                ${isCollapsed ? 'justify-center' : ''}
                ${
                  active
                    ? 'bg-gradient-to-br from-[var(--status-info)] to-[var(--admin-accent-secondary)] text-white border-[var(--status-info)]/50 shadow-lg shadow-[var(--status-info)]/20'
                    : 'bg-transparent text-[var(--admin-text-muted)] border-transparent hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] hover:border-[var(--admin-border)]'
                }
              `}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  active
                    ? 'text-white'
                    : 'text-[var(--admin-text-muted)] group-hover:text-[var(--status-info)]'
                }`}
              />

              {!isCollapsed && <span className="font-medium text-sm truncate">{item.label}</span>}

              {/* Badge de notificaciones */}
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`
                    min-w-[20px] h-5 px-1.5 bg-[var(--status-danger)] text-white text-xs font-bold rounded-full
                    flex items-center justify-center
                    ${isCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'}
                  `}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}

              {/* Active Indicator */}
              {active && (
                <span
                  className={`
                    absolute flex h-2 w-2
                    ${isCollapsed ? '-top-0.5 -right-0.5' : 'top-1/2 -translate-y-1/2 -left-1'}
                  `}
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/75 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer - Logo o branding */}
      <div className="p-3 border-t border-[var(--admin-border)]">
        <div
          className={`
            flex items-center gap-3 p-3 rounded-xl
            bg-[var(--admin-surface-2)]/50
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--admin-accent)] to-[var(--admin-accent-secondary)] flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-white">M</span>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--admin-text)] truncate">Mateatletas</p>
              <p className="text-[10px] text-[var(--admin-text-muted)]">Admin Panel</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
