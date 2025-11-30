'use client';

/**
 * AppShell - Componente Principal del Shell de Aplicación
 *
 * Este es el componente orquestador que combina:
 * - Sidebar (navegación lateral)
 * - Topbar (barra superior)
 * - LoadingScreen (pantalla de carga)
 * - NotificationPanel (panel de notificaciones)
 * - Fondos animados según variante
 *
 * DECISIONES DE ARQUITECTURA:
 *
 * 1. COMPOSICIÓN SOBRE HERENCIA
 *    En lugar de crear 3 layouts diferentes, usamos un solo componente
 *    que se configura vía props. Esto elimina ~600 líneas duplicadas.
 *
 * 2. VARIANTES CON TEMAS
 *    Cada variante (admin/docente/tutor) tiene su propio tema visual
 *    definido en types.ts. El AppShell aplica estos temas automáticamente.
 *
 * 3. RESPONSABILIDAD ÚNICA
 *    - AppShell: orquesta layout y estado
 *    - Sidebar: navegación y usuario
 *    - Topbar: título, notificaciones, acciones
 *    - Los fondos animados son específicos por variante
 *
 * 4. FLEXIBILIDAD
 *    - Todas las props son opcionales excepto variant y navigation
 *    - Soporta acciones personalizadas en topbar
 *    - El loading screen es configurable
 *
 * USO:
 * ```tsx
 * <AppShell
 *   variant="admin"
 *   navigation={adminNavItems}
 *   user={currentUser}
 *   onLogout={handleLogout}
 * >
 *   <DashboardContent />
 * </AppShell>
 * ```
 */

import { useState, useCallback, useMemo, memo } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import type { AppShellProps, AppShellNotification, NavigationItem } from './types';
import { VARIANT_THEMES, DEFAULT_BRANDING } from './types';

/**
 * LoadingScreen - Pantalla de carga con estilo por variante
 */
interface LoadingScreenProps {
  variant: AppShellProps['variant'];
  message?: string;
  subtitle?: string;
}

const LoadingScreen = memo(function LoadingScreen({
  variant,
  message,
  subtitle,
}: LoadingScreenProps) {
  const theme = VARIANT_THEMES[variant];

  // Mensajes por defecto según variante
  const defaultMessage = {
    admin: 'Cargando Mateatletas OS...',
    docente: 'Cargando Portal Docente...',
    tutor: 'Cargando Portal Familia...',
  };

  const defaultSubtitle = {
    admin: 'Preparando tu centro de comando',
    docente: '',
    tutor: '',
  };

  if (variant === 'admin') {
    return (
      <div className="h-screen flex items-center justify-center relative overflow-hidden">
        <div className={`fixed inset-0 ${theme.background}`} />
        <div className="fixed top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />

        <div className="relative text-center backdrop-blur-xl bg-white/5 p-12 rounded-3xl shadow-2xl border border-white/10">
          <div className="w-20 h-20 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-lg font-bold text-white">{message || defaultMessage.admin}</p>
          {(subtitle || defaultSubtitle.admin) && (
            <p className="text-sm text-white/50 mt-2">{subtitle || defaultSubtitle.admin}</p>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'docente') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.background}`}>
        <div className="text-center backdrop-blur-xl bg-white/65 dark:bg-indigo-950/60 p-12 rounded-3xl shadow-2xl shadow-purple-200/20 dark:shadow-purple-900/30 border border-purple-200/30 dark:border-purple-700/30">
          <div className="w-16 h-16 border-4 border-purple-100 dark:border-purple-900/50 border-t-purple-600 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-sm font-semibold text-indigo-900 dark:text-purple-100">
            {message || defaultMessage.docente}
          </p>
        </div>
      </div>
    );
  }

  // tutor
  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.background}`}>
      <div className="text-center bg-white/90 backdrop-blur-xl p-12 rounded-2xl shadow-xl border border-gray-200/50">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-6" />
        <p className="text-sm font-semibold text-gray-700">{message || defaultMessage.tutor}</p>
      </div>
    </div>
  );
});

/**
 * Fondos animados según variante
 */
interface AnimatedBackgroundProps {
  variant: AppShellProps['variant'];
}

const AnimatedBackground = memo(function AnimatedBackground({ variant }: AnimatedBackgroundProps) {
  if (variant === 'admin') {
    return (
      <>
        {/* Gradiente base oscuro elegante */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black" />

        {/* Gradientes de colores dinámicos */}
        <div className="fixed inset-0 bg-gradient-to-tr from-violet-900/20 via-transparent to-blue-900/20" />
        <div className="fixed inset-0 bg-gradient-to-bl from-emerald-900/10 via-transparent to-transparent" />

        {/* Grid sutil de fondo */}
        <div
          className="fixed inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Orbes de luz flotantes */}
        <div className="fixed top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse animation-delay-4000" />
      </>
    );
  }

  if (variant === 'docente') {
    return (
      <>
        {/* Blobs animados de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
            style={{ animation: 'blob 20s infinite ease-in-out' }}
          />
          <div
            className="absolute top-40 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl"
            style={{ animation: 'blob 25s infinite ease-in-out 5s' }}
          />
          <div
            className="absolute bottom-20 left-1/3 w-[400px] h-[400px] bg-pink-500/15 rounded-full blur-3xl"
            style={{ animation: 'blob 18s infinite ease-in-out 2s' }}
          />
          <div
            className="absolute -bottom-40 -right-20 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl"
            style={{ animation: 'blob 22s infinite ease-in-out 7s' }}
          />
        </div>
      </>
    );
  }

  // tutor - fondo más simple
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20" />
  );
});

/**
 * Panel de notificaciones
 */
interface NotificationPanelProps {
  variant: AppShellProps['variant'];
  notifications: AppShellNotification[];
  isOpen: boolean;
  onClose: () => void;
  count: number;
}

const NotificationPanel = memo(function NotificationPanel({
  variant,
  notifications,
  isOpen,
  onClose,
  count,
}: NotificationPanelProps) {
  if (!isOpen) return null;

  const theme = VARIANT_THEMES[variant];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div
        className={`fixed top-20 right-6 w-96 ${theme.sidebarBg} border ${theme.sidebarBorder} rounded-2xl shadow-2xl z-50 overflow-hidden`}
      >
        <div className={`p-5 border-b ${theme.sidebarBorder}`}>
          <h3 className={`text-lg font-black ${theme.textPrimary}`}>Notificaciones</h3>
          <p className={`text-xs ${theme.textSecondary} mt-1`}>
            Tienes {count} notificación{count !== 1 ? 'es' : ''} nueva{count !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <p className={`text-sm ${theme.textSecondary}`}>No hay notificaciones</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`p-4 border-b ${theme.sidebarBorder} ${theme.hoverBg} transition-colors cursor-pointer`}
                >
                  <div className="flex items-start gap-3">
                    {Icon && (
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${notification.iconColor || 'from-blue-500 to-cyan-500'} flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${theme.textPrimary} mb-1`}>
                        {notification.title}
                      </p>
                      <p className={`text-xs ${theme.textSecondary}`}>{notification.description}</p>
                      <p className={`text-xs ${theme.textSecondary} opacity-60 mt-1`}>
                        {notification.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className={`p-3 border-t ${theme.sidebarBorder}`}>
          <button
            className={`w-full px-4 py-2 text-sm font-bold ${theme.textPrimary} ${variant === 'admin' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg transition-colors`}
          >
            Ver todas las notificaciones
          </button>
        </div>
      </div>
    </>
  );
});

/**
 * Mobile Sidebar Overlay
 */
interface MobileSidebarProps {
  variant: AppShellProps['variant'];
  isOpen: boolean;
  onClose: () => void;
  navigation: NavigationItem[];
  user: AppShellProps['user'];
  branding: AppShellProps['branding'];
  currentPath: string;
  onLogout: () => void;
}

const MobileSidebar = memo(function MobileSidebar({
  variant,
  isOpen,
  onClose,
  navigation,
  user,
  branding,
  currentPath,
  onLogout,
}: MobileSidebarProps) {
  const theme = VARIANT_THEMES[variant];
  const finalBranding = { ...DEFAULT_BRANDING[variant], ...branding };

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`fixed inset-0 ${variant === 'admin' ? 'bg-black/80' : variant === 'docente' ? 'bg-indigo-950/40' : 'bg-gray-900/30'} backdrop-blur-sm z-40 md:hidden transition-opacity`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-y-0 left-0 z-50 md:hidden ${theme.sidebarBg} border-r ${theme.sidebarBorder} shadow-2xl`}
      >
        <Sidebar
          variant={variant}
          navigation={navigation}
          user={user}
          branding={finalBranding}
          currentPath={currentPath}
          collapsed={false}
          onCollapsedChange={() => {}}
          onLogout={onLogout}
          isMobile={true}
          onMobileClose={onClose}
        />
      </div>
    </>
  );
});

/**
 * Componente AppShell principal
 */
export const AppShell = memo(function AppShell({
  variant,
  navigation,
  user,
  children,
  branding,
  isLoading = false,
  loadingMessage,
  onLogout,
  notificationCount = 0,
  notifications = [],
  onNotificationsClick,
  showThemeToggle,
  topbarActions,
  defaultCollapsed = false,
  skipThemeProvider = false,
}: AppShellProps) {
  const pathname = usePathname();
  const theme = VARIANT_THEMES[variant];
  const finalBranding = useMemo(
    () => ({ ...DEFAULT_BRANDING[variant], ...branding }),
    [variant, branding],
  );

  // Estado local
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultCollapsed);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Encontrar el item activo para mostrar en topbar
  const activeItem = useMemo(() => {
    return navigation.find((item) => {
      const basePath = `/${variant}`;
      const dashboardPath = `/${variant}/dashboard`;

      if (item.href === dashboardPath || item.href === basePath) {
        return pathname === basePath || pathname === dashboardPath;
      }

      return pathname?.startsWith(item.href);
    });
  }, [navigation, pathname, variant]);

  // Handlers
  const handleNotificationsClick = useCallback(() => {
    if (onNotificationsClick) {
      onNotificationsClick();
    } else {
      setNotificationsOpen((prev) => !prev);
    }
  }, [onNotificationsClick]);

  const handleMobileMenuToggle = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Contenido principal
  const content = (
    <div
      className={`h-screen relative overflow-hidden ${variant !== 'admin' ? theme.background : ''}`}
    >
      {/* Fondo animado */}
      <AnimatedBackground variant={variant} />

      <div className="relative z-10 h-full">
        {isLoading ? (
          <LoadingScreen variant={variant} message={loadingMessage} />
        ) : (
          <div className="flex h-full overflow-hidden">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex md:flex-shrink-0">
              <Sidebar
                variant={variant}
                navigation={navigation}
                user={user}
                branding={finalBranding}
                currentPath={pathname || ''}
                collapsed={sidebarCollapsed}
                onCollapsedChange={setSidebarCollapsed}
                onLogout={onLogout}
              />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Topbar */}
              <Topbar
                variant={variant}
                pageTitle={activeItem?.label || 'Dashboard'}
                pageIcon={activeItem?.icon}
                onMobileMenuClick={handleMobileMenuToggle}
                notificationCount={notificationCount}
                onNotificationsClick={handleNotificationsClick}
                showThemeToggle={showThemeToggle ?? variant === 'docente'}
                actions={topbarActions}
              />

              {/* Page Content */}
              <main className="flex-1 overflow-y-auto relative">
                {/* Blobs animados solo para docente (se muestran encima del contenido) */}
                {variant === 'docente' && <AnimatedBackground variant="docente" />}

                <div
                  className={`${variant === 'docente' ? 'h-full w-full px-8 py-6 relative z-10' : 'min-h-full w-full p-6'}`}
                >
                  {children}
                </div>

                {/* Panel de Notificaciones */}
                <NotificationPanel
                  variant={variant}
                  notifications={notifications}
                  isOpen={notificationsOpen}
                  onClose={() => setNotificationsOpen(false)}
                  count={notificationCount}
                />
              </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            <MobileSidebar
              variant={variant}
              isOpen={mobileMenuOpen}
              onClose={handleMobileMenuClose}
              navigation={navigation}
              user={user}
              branding={finalBranding}
              currentPath={pathname || ''}
              onLogout={onLogout}
            />
          </div>
        )}
      </div>
    </div>
  );

  // Para docente, envolvemos con ThemeProvider si no se omite
  if (variant === 'docente' && !skipThemeProvider) {
    return (
      <ThemeProvider>
        <ToastProvider />
        {content}
      </ThemeProvider>
    );
  }

  return content;
});

export default AppShell;
