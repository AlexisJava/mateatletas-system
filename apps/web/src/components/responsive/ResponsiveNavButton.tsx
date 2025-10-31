/**
 * 🎮 Botón de navegación adaptativo
 *
 * Cambia su apariencia según el tipo de dispositivo:
 * - Desktop: Botón lateral grande con tooltip
 * - Tablet: Botón compacto en dock bar inferior
 * - Mobile: Item de lista en modal de menú
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useDeviceType } from '@/hooks/useDeviceType';

export interface NavButtonProps {
  /** Icono del botón (Lucide Icon component) */
  icon: React.ReactNode;

  /** Texto del botón */
  label: string;

  /** Descripción para tooltip/subtítulo */
  description?: string;

  /** Badge numérico (notificaciones) */
  badge?: number;

  /** Si el botón está activo */
  isActive?: boolean;

  /** Gradiente de fondo (clases Tailwind) */
  gradient: string;

  /** Color de resplandor (nombre de color) */
  glowColor: string;

  /** Callback al hacer click */
  onClick: () => void;

  /** Variante forzada (opcional, sobreescribe detección automática) */
  variant?: 'sidebar' | 'dock' | 'menu';

  /** Lado de la pantalla (para sidebar desktop) */
  side?: 'left' | 'right';
}

export function ResponsiveNavButton({
  icon,
  label,
  description,
  badge = 0,
  isActive = false,
  gradient,
  glowColor,
  onClick,
  variant: forcedVariant,
  side = 'left',
}: NavButtonProps) {
  const { deviceType } = useDeviceType();
  const [isHovered, setIsHovered] = useState(false);

  // Determinar variante según dispositivo (si no está forzada)
  const variant =
    forcedVariant ||
    (deviceType === 'desktop' ? 'sidebar' : deviceType === 'tablet' ? 'dock' : 'menu');

  // ==================== VARIANTE SIDEBAR (Desktop) ====================
  if (variant === 'sidebar') {
    return (
      <div className="relative">
        {/* Glow pulsante cuando hay notificaciones */}
        {badge > 0 && (
          <motion.div
            className={`absolute inset-0 bg-${glowColor}-500/50 rounded-2xl blur-xl`}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        )}

        {/* Botón principal */}
        <motion.button
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          onClick={onClick}
          whileHover={{ scale: 1.15, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className={`
            relative w-20 h-20 rounded-3xl
            bg-gradient-to-br ${gradient}
            shadow-2xl
            border-4 border-white/30
            flex items-center justify-center
            transition-all duration-300
            ${isActive ? 'ring-4 ring-white ring-offset-4 ring-offset-transparent' : ''}
          `}
        >
          {/* Icono */}
          <motion.div
            animate={
              isActive
                ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }
                : {}
            }
            transition={{ duration: 0.5 }}
          >
            <div className="text-white drop-shadow-lg">{icon}</div>
          </motion.div>

          {/* Badge de notificaciones */}
          {badge > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2
                         w-8 h-8 rounded-full
                         bg-gradient-to-br from-red-500 to-pink-600
                         border-4 border-white
                         flex items-center justify-center
                         shadow-xl"
            >
              <span className="text-white text-xs font-black">{badge > 99 ? '99+' : badge}</span>
            </motion.div>
          )}

          {/* Brillo animado en hover */}
          {isHovered && (
            <motion.div
              className="absolute inset-0 bg-white/30 rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 0.6 }}
            />
          )}
        </motion.button>

        {/* Tooltip expandido */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: side === 'left' ? -10 : 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: side === 'left' ? -10 : 10, scale: 0.9 }}
              className={`absolute ${side === 'left' ? 'left-24' : 'right-24'} top-1/2 -translate-y-1/2 z-50`}
            >
              <div
                className="bg-gradient-to-br from-slate-900 to-slate-800
                             backdrop-blur-xl
                             rounded-2xl p-4
                             border-2 border-white/20
                             shadow-2xl
                             min-w-[200px]"
              >
                {/* Label principal */}
                <div className="text-white text-lg font-black uppercase tracking-wide">{label}</div>

                {/* Descripción */}
                {description && (
                  <div className="text-white/70 text-sm font-medium mt-1">{description}</div>
                )}

                {/* Badge info */}
                {badge > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-400 text-xs font-bold">
                      {badge} {badge === 1 ? 'nuevo' : 'nuevos'}
                    </span>
                  </div>
                )}

                {/* Flecha hacia el botón */}
                <div
                  className={`absolute ${side === 'left' ? 'right-full mr-[-8px]' : 'left-full ml-[-8px]'} top-1/2 -translate-y-1/2`}
                >
                  <div
                    className={`w-4 h-4 bg-slate-900 border-2 border-white/20 rotate-45 ${
                      side === 'left' ? 'border-r-0 border-t-0' : 'border-l-0 border-b-0'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicador de activo (barra lateral) */}
        {isActive && (
          <motion.div
            layoutId={`active-indicator-${side}`}
            className={`absolute ${side === 'left' ? '-right-3' : '-left-3'} top-1/2 -translate-y-1/2
                       w-2 h-12 rounded-full
                       bg-white shadow-lg`}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
      </div>
    );
  }

  // ==================== VARIANTE DOCK (Tablet) ====================
  if (variant === 'dock') {
    return (
      <motion.button
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        className="relative flex flex-col items-center gap-1 px-4 py-2"
      >
        {/* Badge de notificaciones */}
        {badge > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg z-10"
          >
            <span className="text-white text-[9px] font-black">{badge > 99 ? '99' : badge}</span>
          </motion.div>
        )}

        {/* Icono */}
        <div
          className={`
          w-14 h-14 rounded-2xl
          bg-gradient-to-br ${gradient}
          flex items-center justify-center
          border-2 ${isActive ? 'border-white' : 'border-white/20'}
          shadow-lg
          transition-all
        `}
        >
          <div className="text-white">{icon}</div>
        </div>

        {/* Label */}
        <span
          className={`
          text-xs font-bold uppercase tracking-wide
          ${isActive ? 'text-white' : 'text-white/70'}
          transition-colors
        `}
        >
          {label}
        </span>

        {/* Indicador activo (dot inferior) */}
        {isActive && (
          <motion.div
            layoutId="dock-active-indicator"
            className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-white shadow-lg"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
      </motion.button>
    );
  }

  // ==================== VARIANTE MENU (Mobile) ====================
  if (variant === 'menu') {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`
          w-full flex items-center gap-4 p-4 rounded-2xl
          bg-gradient-to-r ${gradient}
          hover:scale-[1.02] transition-transform
          ${isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}
        `}
      >
        {/* Icono */}
        <div className="relative w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          <div className="text-white">{icon}</div>

          {/* Badge de notificaciones */}
          {badge > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
              <span className="text-white text-[9px] font-black">{badge > 99 ? '99' : badge}</span>
            </div>
          )}
        </div>

        {/* Texto */}
        <div className="flex-1 text-left">
          <div className="text-lg font-black text-white uppercase tracking-wide">{label}</div>
          {description && <div className="text-sm text-white/70 font-medium">{description}</div>}
        </div>

        {/* Flecha */}
        <svg
          className="w-6 h-6 text-white/50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>
    );
  }

  return null;
}

/**
 * Ejemplo de uso:
 *
 * <ResponsiveNavButton
 *   icon={<Home className="w-7 h-7" />}
 *   label="HUB"
 *   description="Tu espacio personal"
 *   badge={3}
 *   isActive={activeView === 'hub'}
 *   gradient="from-blue-500 to-cyan-500"
 *   glowColor="cyan"
 *   onClick={() => navigate('hub')}
 *   side="left"
 * />
 */
