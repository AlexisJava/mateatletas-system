import type { HTMLAttributes, ReactNode } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

/**
 * Badge Component - Crash Bandicoot Style
 * Badge con borde chunky y colores vibrantes
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...rest
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-200 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  const composedClasses = [
    'inline-flex items-center font-bold rounded-full border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]',
    variants[variant],
    sizes[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={composedClasses} {...rest}>
      {children}
    </span>
  );
}
