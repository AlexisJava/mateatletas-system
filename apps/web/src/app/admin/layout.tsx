'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { ProtectedLayout } from '@/components/shared/ProtectedLayout';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  BarChart3,
  LogOut,
  Bell,
  Menu,
  X,
  Key,
  Sparkles,
  ChevronRight,
  Settings,
  Search,
  ClipboardList,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

/**
 * Admin Layout v2.0 - Mission Control Design
 * Clean, professional, functional
 */

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number | null;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      {
        href: '/admin/inscripciones-2026',
        label: 'Inscripciones 2026',
        icon: ClipboardList,
        badge: null,
      },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
      { href: '/admin/estudiantes', label: 'Estudiantes', icon: GraduationCap },
      { href: '/admin/credenciales', label: 'Credenciales', icon: Key },
    ],
  },
  {
    title: 'Finanzas',
    items: [
      { href: '/admin/pagos', label: 'Pagos', icon: CreditCard },
      { href: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
    ],
  },
  {
    title: 'Contenido',
    items: [{ href: '/admin/studio', label: 'Studio', icon: Sparkles }],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout allowedRoles={['ADMIN']} loadingComponent={<LoadingScreen variant="admin" />}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ProtectedLayout>
  );
}

const SIDEBAR_COLLAPSED_KEY = 'admin-sidebar-collapsed';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Cargar preferencia de sidebar desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (saved === 'true') {
      setSidebarCollapsed(true);
    }
  }, []);

  // Guardar preferencia cuando cambia
  const toggleSidebarCollapse = () => {
    const newValue = !sidebarCollapsed;
    setSidebarCollapsed(newValue);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue));
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActiveRoute = (route: string) => {
    if (route === '/admin/dashboard') {
      return pathname === '/admin' || pathname === '/admin/dashboard';
    }
    return pathname?.startsWith(route);
  };

  // Get current page info
  const currentItem = navSections.flatMap((s) => s.items).find((item) => isActiveRoute(item.href));

  return (
    <div className="h-screen bg-[var(--admin-bg)] flex overflow-hidden" data-admin="true">
      {/* Sidebar - Desktop */}
      <aside
        className={`
          hidden lg:flex lg:flex-col bg-[var(--admin-surface-0)] border-r border-[var(--admin-border)]
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'w-16' : 'w-64'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-[var(--admin-border)]">
          <Link
            href="/admin"
            className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : 'px-5'}`}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span className="text-[15px] font-bold text-[var(--admin-text)]">Mateatletas</span>
                <span className="block text-[11px] text-[var(--admin-text-muted)] -mt-0.5">
                  Admin Panel
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav
          className={`flex-1 overflow-y-auto py-4 space-y-6 scrollbar-thin ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
        >
          {navSections.map((section) => (
            <div key={section.title}>
              {!sidebarCollapsed && (
                <h3 className="px-3 mb-2 text-[11px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`
                        group flex items-center rounded-lg text-[14px] font-medium transition-all duration-150
                        ${sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'}
                        ${
                          isActive
                            ? 'bg-[var(--admin-accent-muted)] text-[var(--admin-accent)]'
                            : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)]'
                        }
                      `}
                    >
                      <Icon
                        className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-[var(--admin-accent)]' : ''}`}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          {item.badge !== undefined && item.badge !== null && (
                            <span className="px-2 py-0.5 text-[11px] font-semibold bg-[var(--status-danger)] text-white rounded-full">
                              {item.badge}
                            </span>
                          )}
                          {isActive && (
                            <ChevronRight className="w-4 h-4 text-[var(--admin-accent)] opacity-60" />
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Toggle button + User section */}
        <div className="border-t border-[var(--admin-border)]">
          {/* Toggle sidebar button */}
          <button
            onClick={toggleSidebarCollapse}
            className={`
              w-full flex items-center gap-2 p-3 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] transition-colors
              ${sidebarCollapsed ? 'justify-center' : ''}
            `}
            title={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="w-5 h-5" />
            ) : (
              <>
                <PanelLeftClose className="w-5 h-5" />
                <span className="text-sm">Ocultar sidebar</span>
              </>
            )}
          </button>

          {/* User section */}
          <div className={`p-2 ${sidebarCollapsed ? '' : 'px-3 pb-3'}`}>
            {sidebarCollapsed ? (
              <button
                onClick={handleLogout}
                className="w-full p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                title="Cerrar sesion"
              >
                {user?.nombre?.charAt(0).toUpperCase() || 'A'}
              </button>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--admin-surface-1)]">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.nombre?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--admin-text)] truncate">
                    {user?.nombre} {user?.apellido}
                  </p>
                  <p className="text-[11px] text-[var(--admin-text-muted)]">Administrador</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--status-danger)] hover:bg-[var(--status-danger-muted)] transition-colors"
                  title="Cerrar sesion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-[var(--admin-surface-0)] border-b border-[var(--admin-border)]">
          {/* Left: Mobile menu + breadcrumb */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-[var(--admin-text-muted)]">Admin</span>
              <ChevronRight className="w-4 h-4 text-[var(--admin-text-disabled)]" />
              <span className="font-medium text-[var(--admin-text)]">
                {currentItem?.label || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--status-danger)] rounded-full" />
            </button>

            {/* Settings */}
            <button className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] transition-colors">
              <Settings className="w-5 h-5" />
            </button>

            {/* Mobile user avatar */}
            <div className="lg:hidden w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-xs">
              {user?.nombre?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[var(--admin-bg)]">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-[var(--admin-surface-0)] border-r border-[var(--admin-border)] z-50 lg:hidden flex flex-col animate-slide-up">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--admin-border)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-[15px] font-bold text-[var(--admin-text)]">Mateatletas</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
              {navSections.map((section) => (
                <div key={section.title}>
                  <h3 className="px-3 mb-2 text-[11px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = isActiveRoute(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all
                            ${
                              isActive
                                ? 'bg-[var(--admin-accent-muted)] text-[var(--admin-accent)]'
                                : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)]'
                            }
                          `}
                        >
                          <Icon
                            className={`w-[18px] h-[18px] ${isActive ? 'text-[var(--admin-accent)]' : ''}`}
                          />
                          <span className="flex-1">{item.label}</span>
                          {item.badge !== undefined && item.badge !== null && (
                            <span className="px-2 py-0.5 text-[11px] font-semibold bg-[var(--status-danger)] text-white rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* User */}
            <div className="p-3 border-t border-[var(--admin-border)]">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--admin-surface-1)]">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.nombre?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--admin-text)] truncate">
                    {user?.nombre} {user?.apellido}
                  </p>
                  <p className="text-[11px] text-[var(--admin-text-muted)]">Administrador</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--status-danger)] hover:bg-[var(--status-danger-muted)] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
