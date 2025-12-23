'use client';

/**
 * Mateatletas Design System - Input Component
 */

import { forwardRef, useState } from 'react';
import type { InputProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-3 text-lg',
} as const;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      theme: themeProp,
      value,
      defaultValue,
      placeholder,
      type = 'text',
      variant = 'default',
      size = 'md',
      disabled = false,
      error,
      label,
      icon,
      onChange,
      onFocus,
      onBlur,
    },
    ref,
  ) => {
    const { theme: contextTheme } = useTheme();
    const theme = themeProp ?? contextTheme;
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    const handleFocus = () => {
      setIsFocused(true);
      onFocus?.();
    };

    const handleBlur = () => {
      setIsFocused(false);
      onBlur?.();
    };

    const sizeClass = sizeClasses[size];
    const errorBorderColor = error ? theme.colors.error : undefined;
    const focusBorderColor = isFocused ? theme.colors.primary : undefined;

    const getVariantStyles = () => {
      switch (variant) {
        case 'filled':
          return {
            backgroundColor: theme.colors.bgCard,
            border: 'none',
          };
        case 'outlined':
          return {
            backgroundColor: 'transparent',
            border: `2px solid ${errorBorderColor || focusBorderColor || theme.colors.border}`,
          };
        default:
          return {
            backgroundColor: theme.colors.codeBg,
            border: `1px solid ${errorBorderColor || focusBorderColor || theme.colors.border}`,
          };
      }
    };

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: theme.colors.textMain }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: theme.colors.textMuted }}
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            type={type}
            value={value}
            defaultValue={defaultValue}
            placeholder={placeholder}
            disabled={disabled}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`w-full transition-all duration-200 outline-none ${sizeClass} ${icon ? 'pl-10' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{
              ...getVariantStyles(),
              color: theme.colors.textMain,
              borderRadius: theme.borderRadius,
            }}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm" style={{ color: theme.colors.error }}>
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
