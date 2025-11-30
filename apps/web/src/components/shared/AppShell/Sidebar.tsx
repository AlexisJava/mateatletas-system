'use client';

/**
 * Sidebar Component - Navegación lateral reutilizable
 *
 * RESPONSABILIDADES:
 * - Renderizar la navegación lateral con items configurables
 * - Soportar modo colapsado (solo iconos)
 * - Mostrar información del usuario logueado
 * - Manejar el logout
 * - Adaptar estilos según la variante (admin/docente/tutor)
 *
 * DECISIONES DE ARQUITECTURA:
 * - Cada variante tiene su propio tema visual pero comparte la estructura
 * - El sidebar admin tiene iconos con gradientes individuales
 * - El sidebar docente/tutor es más simple pero igualmente funcional
 * - Se usa composición para mantener el código limpio
 */

import { memo, useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Crown, LogOut, X, Zap } from 'lucide-react';
import type { SidebarProps, AppShellVariant, NavigationItem } from './types';
import { VARIANT_THEMES } from './types';

/**
 * Hook para determinar si una ruta está activa
 */
function useIsActiveRoute(
  currentPath: string,
  itemHref: string,
  variant: AppShellVariant,
): boolean {
  // Para dashboard, considerar tanto /variant como /variant/dashboard
  const basePath = `/${variant}`;
  const dashboardPath = `/${variant}/dashboard`;

  if (itemHref === dashboardPath || itemHref === basePath) {
    return currentPath === basePath || currentPath === dashboardPath;
  }

  return currentPath.startsWith(itemHref);
}

/**
 * Componente de Logo/Branding del Sidebar
 */
interface SidebarLogoProps {
  variant: AppShellVariant;
  title: string;
  subtitle: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

const SidebarLogo = memo(function SidebarLogo({
  variant,
  title,
  subtitle,
  collapsed,
  onToggleCollapse,
  isMobile,
  onMobileClose,
}: SidebarLogoProps) {
  const theme = VARIANT_THEMES[variant];

  // Icono según variante
  const logoContent = useMemo(() => {
    switch (variant) {
      case 'admin':
        return <Crown className="w-7 h-7 text-white" strokeWidth={2.5} />;
      case 'docente':
        return <span className="text-xl">📚</span>;
      case 'tutor':
        return <span className="text-xl">👨‍👩‍👧‍👦</span>;
      default:
        return null;
    }
  }, [variant]);

  if (collapsed && !isMobile) {
    return (
      <div className={`flex items-center justify-center px-4 py-5 border-b ${theme.sidebarBorder}`}>
        <button
          onClick={onToggleCollapse}
          className={`p-2 rounded-lg ${theme.hoverBg} transition-colors`}
          title="Expandir sidebar"
        >
          <ChevronRight className={`w-5 h-5 ${theme.textSecondary}`} strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between px-6 py-5 border-b ${theme.sidebarBorder}`}>
      <div className="flex items-center gap-3">
        {/* Logo con glow effect para admin */}
        <div className="relative">
          {variant === 'admin' && (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${theme.logoGradient} blur-lg opacity-50`}
            />
          )}
          <div
            className={`relative w-${variant === 'admin' ? '12' : '9'} h-${variant === 'admin' ? '12' : '9'} rounded-${variant === 'admin' ? '2xl' : 'xl'} bg-gradient-to-br ${theme.logoGradient} flex items-center justify-center shadow-lg ${variant === 'admin' ? 'shadow-violet-500/50' : `shadow-${variant === 'docente' ? 'purple' : 'blue'}-500/40`}`}
          >
            {logoContent}
          </div>
        </div>
        <div>
          <h1
            className={`text-${variant === 'admin' ? 'lg' : 'sm'} font-${variant === 'admin' ? 'black' : 'bold'} ${variant === 'admin' ? 'bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent' : theme.textPrimary}`}
          >
            {title}
          </h1>
          <p
            className={`text-${variant === 'admin' ? 'xs' : '[10px]'} ${theme.textSecondary} font-${variant === 'admin' ? 'bold' : 'medium'}`}
          >
            {subtitle}
          </p>
        </div>
      </div>

      {/* Botón de colapsar/cerrar */}
      {isMobile ? (
        <button onClick={onMobileClose} className={`p-2 rounded-xl ${theme.hoverBg}`}>
          <X className={`w-5 h-5 ${theme.textPrimary}`} />
        </button>
      ) : (
        <button
          onClick={onToggleCollapse}
          className={`p-2 rounded-lg ${theme.hoverBg} transition-colors`}
          title="Colapsar sidebar"
        >
          <ChevronLeft className={`w-5 h-5 ${theme.textSecondary}`} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
});

/**
 * Item de navegación individual
 */
interface NavItemProps {
  item: NavigationItem;
  variant: AppShellVariant;
  isActive: boolean;
  collapsed: boolean;
  onMobileClose?: () => void;
}

const NavItem = memo(function NavItem({
  item,
  variant,
  isActive,
  collapsed,
  onMobileClose,
}: NavItemProps) {
  const theme = VARIANT_THEMES[variant];
  const Icon = item.icon;

  // Estilos específicos por variante
  const getItemStyles = () => {
    if (variant === 'admin') {
      return {
        container: `
          group relative flex items-center rounded-xl
          transition-all duration-300
          ${collapsed ? 'justify-center px-2 py-3.5' : 'gap-4 px-4 py-3.5'}
          ${isActive ? 'bg-white/10 shadow-lg' : 'hover:bg-white/5'}
        `,
        iconWrapper: `relative w-10 h-10 rounded-lg ${isActive ? `bg-gradient-to-br ${item.color || 'from-violet-500 to-purple-500'}` : 'bg-white/5'} flex items-center justify-center transition-all duration-300 group-hover:scale-110`,
        label: `text-base font-bold ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'} transition-colors`,
      };
    }

    if (variant === 'docente') {
      return {
        container: `
          group flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold rounded-xl
          transition-all duration-200
          ${
            isActive
              ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/40'
              : 'text-indigo-900 dark:text-purple-100 hover:bg-purple-100/60 dark:hover:bg-purple-900/40'
          }
        `,
        iconWrapper: '',
        label: `${isActive ? '' : 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`,
      };
    }

    // tutor
    return {
      container: `
        group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg
        transition-all duration-200
        ${
          isActive
            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 pl-2'
            : 'text-gray-700 hover:bg-gray-100/60'
        }
      `,
      iconWrapper: '',
      label: '',
    };
  };

  const styles = getItemStyles();

  return (
    <Link href={item.href} onClick={onMobileClose} className={styles.container}>
      {/* Barra lateral de color cuando está activo - solo admin expandido */}
      {variant === 'admin' && isActive && !collapsed && (
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b ${item.color || 'from-violet-500 to-purple-500'} rounded-r-full`}
        />
      )}

      {/* Icono */}
      {variant === 'admin' ? (
        <div className="relative flex-shrink-0">
          {isActive && (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${item.color || 'from-violet-500 to-purple-500'} blur-md opacity-50`}
            />
          )}
          <div className={styles.iconWrapper}>
            <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
        </div>
      ) : (
        <Icon className={`w-[18px] h-[18px] ${styles.label}`} />
      )}

      {/* Label - solo visible cuando no está colapsado */}
      {!collapsed && (
        <>
          <span className={variant === 'admin' ? styles.label : ''}>{item.label}</span>

          {/* Badge */}
          {item.badge && (
            <div
              className={`ml-auto ${variant === 'admin' ? 'bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center' : 'bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full'}`}
            >
              {item.badge}
            </div>
          )}
        </>
      )}

      {/* Badge cuando está colapsado - solo un punto */}
      {collapsed && item.badge && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      )}
    </Link>
  );
});

/**
 * Sección de usuario del sidebar
 */
interface UserSectionProps {
  variant: AppShellVariant;
  user: SidebarProps['user'];
  collapsed: boolean;
  onLogout: () => void;
}

const UserSection = memo(function UserSection({
  variant,
  user,
  collapsed,
  onLogout,
}: UserSectionProps) {
  const theme = VARIANT_THEMES[variant];

  if (!user) return null;

  const initial = user.nombre?.charAt(0).toUpperCase() || 'U';
  const roleLabel =
    user.role === 'admin' ? 'Administrador' : user.role === 'docente' ? 'Docente' : 'Tutor';

  if (collapsed) {
    return (
      <div className={`border-t ${theme.sidebarBorder} p-4`}>
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="relative">
            {variant === 'admin' && (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${theme.avatarGradient} blur-md opacity-50`}
              />
            )}
            <div
              className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${theme.avatarGradient} flex items-center justify-center text-white font-black text-lg shadow-lg`}
            >
              {initial}
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className={`w-full flex items-center justify-center p-3 ${theme.textSecondary} ${theme.logoutHoverBg} rounded-xl transition-all duration-200 border ${theme.sidebarBorder} group`}
          title="Cerrar sesión"
        >
          <LogOut
            className="w-5 h-5 group-hover:text-red-400 transition-colors"
            strokeWidth={2.5}
          />
        </button>
      </div>
    );
  }

  return (
    <div className={`border-t ${theme.sidebarBorder} p-4`}>
      {/* User Info Card */}
      <div
        className={`flex items-center gap-3 mb-${variant === 'admin' ? '4' : '3'} p-${variant === 'admin' ? '3' : '2'} rounded-xl ${variant === 'admin' ? 'bg-white/5 backdrop-blur-sm' : variant === 'docente' ? 'bg-purple-100/50 dark:bg-purple-900/30' : 'bg-gray-100/50'}`}
      >
        <div className="relative">
          {variant === 'admin' && (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${theme.avatarGradient} blur-md opacity-50`}
            />
          )}
          <div
            className={`relative w-${variant === 'admin' ? '12' : '10'} h-${variant === 'admin' ? '12' : '10'} rounded-xl bg-gradient-to-br ${theme.avatarGradient} flex items-center justify-center text-white font-bold text-${variant === 'admin' ? 'lg' : 'sm'} shadow-lg`}
          >
            {initial}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-${variant === 'admin' ? 'sm' : '[13px]'} font-bold ${theme.textPrimary} truncate`}
          >
            {user.nombre} {user.apellido}
          </p>
          <p
            className={`text-${variant === 'admin' ? 'xs' : '[11px]'} ${theme.textSecondary} font-medium`}
          >
            {roleLabel}
          </p>
        </div>
        {variant === 'admin' && <Zap className="w-4 h-4 text-amber-400" />}
      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className={`w-full flex items-center justify-center gap-2 px-${variant === 'admin' ? '4' : '3'} py-${variant === 'admin' ? '3' : '2.5'} text-${variant === 'admin' ? 'sm' : '[13px]'} font-${variant === 'admin' ? 'bold' : 'semibold'} ${theme.textSecondary} ${theme.logoutHoverBg} hover:text-${variant === 'admin' ? 'white' : 'red-600 dark:hover:text-red-400'} rounded-xl transition-all duration-200 ${variant === 'admin' ? `border ${theme.sidebarBorder} hover:border-red-500/50` : ''} group`}
      >
        <LogOut
          className={`w-5 h-5 ${variant === 'admin' ? 'group-hover:text-red-400' : ''} transition-colors`}
          strokeWidth={2.5}
        />
        Cerrar sesión
      </button>
    </div>
  );
});

/**
 * Componente Sidebar principal
 */
export const Sidebar = memo(function Sidebar({
  variant,
  navigation,
  user,
  branding,
  currentPath,
  collapsed,
  onCollapsedChange,
  onLogout,
  isMobile = false,
  onMobileClose,
}: SidebarProps) {
  const theme = VARIANT_THEMES[variant];

  // Ancho del sidebar según estado
  const sidebarWidth = collapsed && !isMobile ? 'w-20' : variant === 'admin' ? 'w-72' : 'w-64';

  return (
    <div
      className={`flex flex-col ${sidebarWidth} ${theme.sidebarBg} border-r ${theme.sidebarBorder} shadow-2xl transition-all duration-300 h-full`}
    >
      {/* Logo/Branding */}
      <SidebarLogo
        variant={variant}
        title={branding.title}
        subtitle={branding.subtitle}
        collapsed={collapsed}
        onToggleCollapse={() => onCollapsedChange(!collapsed)}
        isMobile={isMobile}
        onMobileClose={onMobileClose}
      />

      {/* Navigation */}
      <nav
        className={`flex-1 px-${variant === 'admin' ? '4' : '3'} py-${variant === 'admin' ? '6' : '4'} space-y-${variant === 'admin' ? '2' : '1'} overflow-y-auto scrollbar-hide`}
      >
        {navigation.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            variant={variant}
            isActive={useIsActiveRoute(currentPath, item.href, variant)}
            collapsed={collapsed && !isMobile}
            onMobileClose={isMobile ? onMobileClose : undefined}
          />
        ))}
      </nav>

      {/* User Section */}
      <UserSection
        variant={variant}
        user={user}
        collapsed={collapsed && !isMobile}
        onLogout={onLogout}
      />
    </div>
  );
});

export default Sidebar;
