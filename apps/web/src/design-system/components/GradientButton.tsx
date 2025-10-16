'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useCurrentTheme } from '../themes';

interface GradientButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: 'gradient' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

/**
 * 🎨 GradientButton - Botón con gradientes temáticos
 *
 * Uso:
 * <GradientButton onClick={handleClick}>Acción</GradientButton>
 * <GradientButton variant="outline" size="lg">Secundario</GradientButton>
 */
export function GradientButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'gradient',
  size = 'md',
  fullWidth = false,
  className = '',
}: GradientButtonProps) {
  const theme = useCurrentTheme();

  const variants = {
    gradient: `${theme.gradientButton} text-white hover:shadow-2xl`,
    outline: `border-2 border-${theme.primary} text-${theme.primary} hover:bg-${theme.primary} hover:text-white`,
    ghost: `text-${theme.primary} hover:bg-white/10`,
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const baseClasses = `
    rounded-xl font-semibold transition-all duration-300
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      {children}
    </motion.button>
  );
}
