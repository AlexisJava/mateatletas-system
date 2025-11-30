/**
 * AppShell Types - Sistema de Tipos para el Shell de Aplicación
 *
 * Este archivo define todas las interfaces necesarias para el AppShell reutilizable.
 * Cada variante (admin, docente, tutor) tiene su propia configuración de tema.
 *
 * ARQUITECTURA:
 * - AppShellVariant: Define los 3 paneles con sus temas
 * - NavigationItem: Items del menú lateral
 * - AppShellUser: Datos del usuario logueado
 * - AppShellConfig: Configuración completa del shell
 */

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Variantes del AppShell - cada rol tiene su propio tema visual
 *
 * admin: Glassmorphism oscuro con gradientes vibrantes (violet, blue, emerald)
 * docente: Elegante con soporte light/dark (indigo, purple, pink)
 * tutor: Minimalista y limpio (gris, azul)
 */
export type AppShellVariant = 'admin' | 'docente' | 'tutor';

/**
 * Item de navegación para el sidebar
 */
export interface NavigationItem {
  /** Ruta del enlace */
  href: string;
  /** Texto a mostrar */
  label: string;
  /** Icono de Lucide */
  icon: LucideIcon;
  /** Gradiente de color (usado en variante admin) - ejemplo: 'from-violet-500 to-purple-500' */
  color?: string;
  /** Número de notificaciones/badge */
  badge?: number | string | null;
  /** Si el item está deshabilitado */
  disabled?: boolean;
}

/**
 * Datos del usuario para mostrar en el sidebar
 */
export interface AppShellUser {
  /** ID único del usuario */
  id: string | number;
  /** Nombre del usuario */
  nombre: string;
  /** Apellido del usuario */
  apellido?: string;
  /** Email del usuario */
  email?: string;
  /** Rol actual del usuario */
  role: string;
  /** URL del avatar (opcional) */
  avatarUrl?: string;
}

/**
 * Configuración del branding/logo
 */
export interface AppShellBranding {
  /** Título principal (ej: "Mateatletas OS") */
  title: string;
  /** Subtítulo (ej: "Admin Portal") */
  subtitle: string;
  /** Icono del logo (componente de Lucide o emoji) */
  icon?: LucideIcon | string;
}

/**
 * Notificación para el panel de notificaciones
 */
export interface AppShellNotification {
  id: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  iconColor?: string;
  timestamp: string;
  read?: boolean;
}

/**
 * Props del componente Sidebar
 */
export interface SidebarProps {
  /** Variante visual del sidebar */
  variant: AppShellVariant;
  /** Items de navegación */
  navigation: NavigationItem[];
  /** Datos del usuario */
  user: AppShellUser | null;
  /** Configuración de branding */
  branding: AppShellBranding;
  /** Ruta actual (para marcar item activo) */
  currentPath: string;
  /** Si el sidebar está colapsado */
  collapsed: boolean;
  /** Callback para cambiar estado colapsado */
  onCollapsedChange: (collapsed: boolean) => void;
  /** Callback para logout */
  onLogout: () => void;
  /** Si está en modo mobile */
  isMobile?: boolean;
  /** Callback para cerrar sidebar mobile */
  onMobileClose?: () => void;
}

/**
 * Props del componente Topbar
 */
export interface TopbarProps {
  /** Variante visual */
  variant: AppShellVariant;
  /** Título de la página actual */
  pageTitle: string;
  /** Icono de la página actual */
  pageIcon?: LucideIcon;
  /** Callback para abrir sidebar mobile */
  onMobileMenuClick: () => void;
  /** Contador de notificaciones */
  notificationCount?: number;
  /** Callback al hacer click en notificaciones */
  onNotificationsClick?: () => void;
  /** Si mostrar el toggle de tema (solo docente) */
  showThemeToggle?: boolean;
  /** Acciones adicionales a mostrar en el topbar */
  actions?: ReactNode;
}

/**
 * Props del componente NotificationPanel
 */
export interface NotificationPanelProps {
  /** Variante visual */
  variant: AppShellVariant;
  /** Lista de notificaciones */
  notifications: AppShellNotification[];
  /** Si el panel está abierto */
  isOpen: boolean;
  /** Callback para cerrar el panel */
  onClose: () => void;
  /** Callback para marcar todas como leídas */
  onMarkAllRead?: () => void;
  /** Callback para ver todas */
  onViewAll?: () => void;
}

/**
 * Props del componente LoadingScreen
 */
export interface LoadingScreenProps {
  /** Variante visual */
  variant: AppShellVariant;
  /** Mensaje de carga personalizado */
  message?: string;
  /** Subtítulo opcional */
  subtitle?: string;
}

/**
 * Props principales del AppShell
 */
export interface AppShellProps {
  /** Variante visual del shell */
  variant: AppShellVariant;
  /** Items de navegación */
  navigation: NavigationItem[];
  /** Datos del usuario */
  user: AppShellUser | null;
  /** Contenido de la página */
  children: ReactNode;
  /** Configuración de branding (opcional, usa defaults por variante) */
  branding?: Partial<AppShellBranding>;
  /** Si está cargando (muestra loading screen) */
  isLoading?: boolean;
  /** Mensaje de loading personalizado */
  loadingMessage?: string;
  /** Callback para logout */
  onLogout: () => void;
  /** Contador de notificaciones */
  notificationCount?: number;
  /** Notificaciones para el panel */
  notifications?: AppShellNotification[];
  /** Callback al hacer click en notificaciones */
  onNotificationsClick?: () => void;
  /** Si mostrar toggle de tema (auto en docente) */
  showThemeToggle?: boolean;
  /** Acciones adicionales para el topbar */
  topbarActions?: ReactNode;
  /** Sidebar colapsado por defecto */
  defaultCollapsed?: boolean;
  /** Provider de tema externo (para evitar duplicar ThemeProvider) */
  skipThemeProvider?: boolean;
}

/**
 * Configuración de tema por variante
 * Usado internamente para aplicar estilos consistentes
 */
export interface VariantTheme {
  /** Clase de fondo principal */
  background: string;
  /** Fondo del sidebar */
  sidebarBg: string;
  /** Borde del sidebar */
  sidebarBorder: string;
  /** Fondo del topbar */
  topbarBg: string;
  /** Color de texto primario */
  textPrimary: string;
  /** Color de texto secundario */
  textSecondary: string;
  /** Gradiente del logo */
  logoGradient: string;
  /** Gradiente del avatar */
  avatarGradient: string;
  /** Fondo de item activo */
  activeItemBg: string;
  /** Fondo de hover en items */
  hoverBg: string;
  /** Color de botón de logout */
  logoutHoverBg: string;
}

/**
 * Mapa de temas por variante
 */
export const VARIANT_THEMES: Record<AppShellVariant, VariantTheme> = {
  admin: {
    background: 'bg-gradient-to-br from-slate-950 via-slate-900 to-black',
    sidebarBg: 'backdrop-blur-2xl bg-white/5',
    sidebarBorder: 'border-white/10',
    topbarBg: 'backdrop-blur-2xl bg-white/5',
    textPrimary: 'text-white',
    textSecondary: 'text-white/50',
    logoGradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    avatarGradient: 'from-emerald-400 to-teal-500',
    activeItemBg: 'bg-white/10',
    hoverBg: 'hover:bg-white/5',
    logoutHoverBg: 'hover:bg-red-500/20',
  },
  docente: {
    background:
      'bg-gradient-to-br from-indigo-50 via-purple-50/60 to-pink-50/50 dark:from-[#0f0a1f] dark:via-indigo-950 dark:to-indigo-900',
    sidebarBg: 'backdrop-blur-xl bg-white/65 dark:bg-indigo-950/60',
    sidebarBorder: 'border-purple-200/30 dark:border-purple-700/30',
    topbarBg: 'backdrop-blur-xl bg-white/50 dark:bg-indigo-950/40',
    textPrimary: 'text-indigo-900 dark:text-white',
    textSecondary: 'text-purple-600 dark:text-purple-300',
    logoGradient: 'from-violet-500 to-purple-600',
    avatarGradient: 'from-violet-500 to-purple-600',
    activeItemBg:
      'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/40',
    hoverBg: 'hover:bg-purple-100/60 dark:hover:bg-purple-900/40',
    logoutHoverBg: 'hover:bg-red-50 dark:hover:bg-red-950/30',
  },
  tutor: {
    background: 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20',
    sidebarBg: 'backdrop-blur-xl bg-white/80',
    sidebarBorder: 'border-gray-200/50',
    topbarBg: 'backdrop-blur-xl bg-white/70',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-500',
    logoGradient: 'from-blue-500 to-indigo-600',
    avatarGradient: 'from-blue-500 to-indigo-600',
    activeItemBg: 'bg-blue-50 text-blue-700 border-l-4 border-blue-500',
    hoverBg: 'hover:bg-gray-100/60',
    logoutHoverBg: 'hover:bg-red-50',
  },
};

/**
 * Branding por defecto para cada variante
 */
export const DEFAULT_BRANDING: Record<AppShellVariant, AppShellBranding> = {
  admin: {
    title: 'Mateatletas OS',
    subtitle: 'Admin Portal',
  },
  docente: {
    title: 'Portal Docente',
    subtitle: 'Mateatletas',
  },
  tutor: {
    title: 'Portal Familia',
    subtitle: 'Mateatletas',
  },
};
