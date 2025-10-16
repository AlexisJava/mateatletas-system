'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * Activity Card Component
 *
 * Componente base para cards de actividades en el dashboard del estudiante.
 * Diseño "chunky" con animaciones smooth.
 *
 * Props:
 * - title: string - Título de la card
 * - gradient: string - Gradiente CSS para fondo
 * - icon: ReactNode - Icono o emoji de la actividad
 * - delay: number - Delay de animación de entrada
 * - children: ReactNode - Contenido de la card
 * - action?: { label: string, onClick: () => void, color: string } - Botón opcional
 */

interface ActivityCardProps {
  title: string;
  gradient: string;
  icon?: ReactNode;
  delay?: number;
  children: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    color: string;
  };
  className?: string;
}

export function ActivityCard({
  title,
  gradient,
  icon,
  delay = 0,
  children,
  action,
  className = '',
}: ActivityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={`relative overflow-hidden ${className}`}
      style={{
        background: gradient,
        borderRadius: '16px',
        border: '5px solid #000',
        boxShadow: '8px 8px 0 0 rgba(0, 0, 0, 1)',
      }}
    >
      <div className="p-6 h-full flex flex-col relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent" />

        {/* Header con icono */}
        <div className="relative z-10 flex items-center gap-3 mb-4">
          {icon && <div className="text-3xl">{icon}</div>}
          <h2
            className="text-2xl font-bold text-white flex-1"
            style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000' }}
          >
            {title}
          </h2>
        </div>

        {/* Contenido */}
        <div className="flex-1 relative z-10 flex flex-col">{children}</div>

        {/* Action button */}
        {action && (
          <motion.button
            onClick={action.onClick}
            whileHover={{
              x: -2,
              y: -2,
              transition: { duration: 0.2, ease: 'easeOut' },
            }}
            whileTap={{
              x: 0,
              y: 0,
              transition: { duration: 0.1 },
            }}
            className="w-full py-3 px-6 mt-4 text-xl font-bold text-white rounded-xl relative z-10"
            style={{
              background: action.color,
              border: '4px solid #000',
              boxShadow: '6px 6px 0 0 rgba(0, 0, 0, 1)',
              textShadow: '2px 2px 0 #000',
            }}
          >
            {action.label}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
