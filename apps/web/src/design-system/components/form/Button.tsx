'use client';

/**
 * Mateatletas Design System - Button Component
 */

import { forwardRef } from 'react';
import type { ButtonProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
} as const;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      theme: themeProp,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      onClick,
      type = 'button',
    },
    ref,
  ) => {
    const { theme: contextTheme } = useTheme();
    const theme = themeProp ?? contextTheme;

    const getVariantStyles = () => {
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: theme.colors.primary,
            color: theme.colors.bgMain,
            border: 'none',
          };
        case 'secondary':
          return {
            backgroundColor: 'transparent',
            color: theme.colors.primary,
            border: `2px solid ${theme.colors.primary}`,
          };
        case 'ghost':
          return {
            backgroundColor: 'transparent',
            color: theme.colors.textMain,
            border: 'none',
          };
        case 'danger':
          return {
            backgroundColor: theme.colors.error,
            color: '#ffffff',
            border: 'none',
          };
        case 'success':
          return {
            backgroundColor: theme.colors.success,
            color: '#ffffff',
            border: 'none',
          };
        default:
          return {};
      }
    };

    const sizeClass = sizeClasses[size];
    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';

    const combinedClasses = [
      'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
      sizeClass,
      widthClass,
      disabledClass,
      theme.classes.button,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        className={combinedClasses}
        style={{
          ...getVariantStyles(),
          borderRadius: theme.borderRadius,
        }}
        disabled={disabled || loading}
        onClick={onClick}
      >
        {loading && (
          <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
        )}
        {!loading && icon && iconPosition === 'left' && <span>{icon}</span>}
        {children}
        {!loading && icon && iconPosition === 'right' && <span>{icon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
