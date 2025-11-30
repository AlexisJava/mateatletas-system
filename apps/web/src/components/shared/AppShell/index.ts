/**
 * AppShell - Exports públicos
 *
 * Uso principal:
 * ```tsx
 * import { AppShell } from '@/components/shared/AppShell';
 *
 * // En un layout
 * <AppShell
 *   variant="admin"
 *   navigation={navItems}
 *   user={user}
 *   onLogout={handleLogout}
 * >
 *   {children}
 * </AppShell>
 * ```
 *
 * Para uso avanzado (componentes individuales):
 * ```tsx
 * import { Sidebar, Topbar, AppShellVariant } from '@/components/shared/AppShell';
 * ```
 */

// Componente principal
export { AppShell, default } from './AppShell';

// Componentes individuales (para uso avanzado)
export { Sidebar } from './Sidebar';
export { Topbar } from './Topbar';

// Tipos
export type {
  AppShellProps,
  AppShellVariant,
  AppShellUser,
  AppShellBranding,
  AppShellNotification,
  NavigationItem,
  SidebarProps,
  TopbarProps,
  LoadingScreenProps,
  NotificationPanelProps,
  VariantTheme,
} from './types';

// Constantes de configuración
export { VARIANT_THEMES, DEFAULT_BRANDING } from './types';
