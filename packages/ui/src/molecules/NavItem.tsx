import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronRight } from 'lucide-react';
import { Badge } from '../primitives/Badge';

export interface NavItemProps {
  /** Icon to display */
  icon?: ReactNode;
  /** Navigation label */
  label: string;
  /** Whether this item is currently active */
  active?: boolean;
  /** Badge content (e.g., notification count) */
  badge?: string | number;
  /** Show chevron indicator */
  showChevron?: boolean;
  /** Collapsed mode (icon only) */
  collapsed?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Click handler (alternative to href) */
  onClick?: () => void;
  /** Link href (makes it an anchor) */
  href?: string;
}

/**
 * NavItem - Molecule for sidebar/navigation items
 *
 * Combines icon, label, badge, and active state styling.
 * Supports collapsed mode for minimized sidebars.
 *
 * @example
 * ```tsx
 * <NavItem
 *   icon={<Home />}
 *   label="Dashboard"
 *   active
 *   href="/dashboard"
 * />
 *
 * <NavItem
 *   icon={<Bell />}
 *   label="Notificaciones"
 *   badge={5}
 *   onClick={openNotifications}
 * />
 * ```
 */
export function NavItem({
  icon,
  label,
  active = false,
  badge,
  showChevron = false,
  collapsed = false,
  disabled = false,
  className,
  onClick,
  href,
}: NavItemProps) {
  const content = (
    <>
      {/* Icon */}
      {icon && (
        <span
          className={clsx(
            'flex-shrink-0 w-5 h-5',
            active ? 'text-[var(--house-primary)]' : 'text-slate-400 group-hover:text-white',
          )}
        >
          {icon}
        </span>
      )}

      {/* Label */}
      {!collapsed && (
        <span
          className={clsx(
            'flex-1 text-left truncate',
            active ? 'text-white font-medium' : 'text-slate-300 group-hover:text-white',
          )}
        >
          {label}
        </span>
      )}

      {/* Badge */}
      {!collapsed && badge !== undefined && (
        <Badge variant="status" size="sm">
          {badge}
        </Badge>
      )}

      {/* Chevron */}
      {!collapsed && showChevron && (
        <ChevronRight
          className={clsx(
            'w-4 h-4 transition-transform',
            active ? 'text-[var(--house-primary)]' : 'text-slate-500',
          )}
        />
      )}

      {/* Active indicator line */}
      {active && (
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
          style={{ background: 'var(--house-primary)' }}
          layoutId="nav-active-indicator"
        />
      )}
    </>
  );

  const baseStyles: React.CSSProperties = active
    ? {
        background: 'var(--house-primary-alpha)',
        borderColor: 'var(--house-primary)',
      }
    : {};

  const sharedClassName = clsx(
    'group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl',
    'transition-colors duration-200',
    'border border-transparent',
    active && 'border-[var(--house-primary)]/30',
    !active && !disabled && 'hover:bg-white/5',
    disabled && 'opacity-50 cursor-not-allowed',
    collapsed && 'justify-center px-2',
    className,
  );

  return (
    <motion.div whileHover={!disabled ? { x: 4 } : {}} transition={{ duration: 0.2 }}>
      {href ? (
        <a
          href={href}
          className={sharedClassName}
          style={baseStyles}
          title={collapsed ? label : undefined}
        >
          {content}
        </a>
      ) : (
        <button
          type="button"
          onClick={disabled ? undefined : onClick}
          disabled={disabled}
          className={sharedClassName}
          style={baseStyles}
          title={collapsed ? label : undefined}
        >
          {content}
        </button>
      )}
    </motion.div>
  );
}

NavItem.displayName = 'NavItem';

/**
 * NavSection - Group navigation items with optional header
 */
export function NavSection({
  title,
  children,
  collapsed = false,
  className,
}: {
  title?: string;
  children: ReactNode;
  collapsed?: boolean;
  className?: string;
}) {
  return (
    <div className={clsx('space-y-1', className)}>
      {title && !collapsed && (
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

NavSection.displayName = 'NavSection';
