'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useCurrentTheme } from '../themes';

interface GradientCardProps {
  children: ReactNode;
  variant?: 'default' | 'glass' | 'solid';
  className?: string;
  onClick?: () => void;
  animate?: boolean;
}

/**
 * 🎨 GradientCard - Componente universal de tarjeta con gradientes temáticos
 *
 * Uso:
 * <GradientCard variant="glass">Contenido</GradientCard>
 * <GradientCard variant="solid">Contenido destacado</GradientCard>
 */
export function GradientCard({
  children,
  variant = 'glass',
  className = '',
  onClick,
  animate = true,
}: GradientCardProps) {
  const theme = useCurrentTheme();

  const variants = {
    default: `${theme.glassBg} ${theme.glassBorder}`,
    glass: `${theme.glassBg} ${theme.glassBorder} ${theme.glassHover}`,
    solid: theme.gradientCard,
  };

  const baseClasses = `
    rounded-2xl p-6 shadow-xl transition-all duration-300
    ${variants[variant]}
    ${onClick ? 'cursor-pointer hover:scale-105' : ''}
    ${className}
  `;

  const Component = animate ? motion.div : 'div';

  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
        whileHover: onClick ? { scale: 1.05 } : undefined,
      }
    : {};

  return (
    <Component className={baseClasses} onClick={onClick} {...animationProps}>
      {children}
    </Component>
  );
}
