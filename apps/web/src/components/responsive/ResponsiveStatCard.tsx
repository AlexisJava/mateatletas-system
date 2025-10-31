/**
 * 📊 Tarjeta de estadísticas adaptativa
 *
 * Cambia su tamaño y espaciado según el dispositivo:
 * - Mobile: Compacta (sm)
 * - Tablet: Media (md)
 * - Desktop: Grande (lg)
 */

'use client';

import { motion } from 'framer-motion';
import { useDeviceType } from '@/hooks/useDeviceType';

export interface StatCardProps {
  /** Icono de la estadística */
  icon: React.ReactNode;

  /** Valor principal (número, texto, porcentaje) */
  value: string | number;

  /** Label descriptivo */
  label: string;

  /** Subtítulo opcional */
  subtitle?: string;

  /** Gradiente de fondo (clases Tailwind) */
  gradient: string;

  /** Color de resplandor (nombre de color) */
  glowColor: string;

  /** Callback al hacer click (opcional) */
  onClick?: () => void;

  /** Tamaño forzado (opcional, sobreescribe detección automática) */
  size?: 'sm' | 'md' | 'lg';

  /** Animación de entrada (delay en segundos) */
  delay?: number;
}

export function ResponsiveStatCard({
  icon,
  value,
  label,
  subtitle,
  gradient,
  glowColor,
  onClick,
  size: forcedSize,
  delay = 0,
}: StatCardProps) {
  const { deviceType } = useDeviceType();

  // Determinar tamaño según dispositivo (si no está forzado)
  const size =
    forcedSize || (deviceType === 'mobile' ? 'sm' : deviceType === 'tablet' ? 'md' : 'lg');

  // Configuración de estilos por tamaño
  const sizeConfig = {
    sm: {
      container: 'p-3 rounded-xl gap-2',
      iconSize: 'w-5 h-5',
      valueSize: 'text-lg',
      labelSize: 'text-[10px]',
      subtitleSize: 'text-[9px]',
      borderWidth: 'border-2',
      shadowSize: 'shadow-[0_4px_0_rgba(0,0,0,0.3)]',
      hoverShadow: 'hover:shadow-[0_3px_0_rgba(0,0,0,0.3)]',
      activeShadow: 'active:shadow-[0_1px_0_rgba(0,0,0,0.3)]',
    },
    md: {
      container: 'p-4 rounded-2xl gap-2',
      iconSize: 'w-6 h-6',
      valueSize: 'text-2xl',
      labelSize: 'text-xs',
      subtitleSize: 'text-[10px]',
      borderWidth: 'border-3',
      shadowSize: 'shadow-[0_6px_0_rgba(0,0,0,0.3)]',
      hoverShadow: 'hover:shadow-[0_5px_0_rgba(0,0,0,0.3)]',
      activeShadow: 'active:shadow-[0_2px_0_rgba(0,0,0,0.3)]',
    },
    lg: {
      container: 'p-6 rounded-3xl gap-3',
      iconSize: 'w-8 h-8',
      valueSize: 'text-4xl',
      labelSize: 'text-sm',
      subtitleSize: 'text-xs',
      borderWidth: 'border-4',
      shadowSize: 'shadow-[0_8px_0_rgba(0,0,0,0.3)]',
      hoverShadow: 'hover:shadow-[0_6px_0_rgba(0,0,0,0.3)]',
      activeShadow: 'active:shadow-[0_2px_0_rgba(0,0,0,0.3)]',
    },
  };

  const config = sizeConfig[size];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      whileHover={onClick ? { scale: 1.05, y: -3 } : {}}
      whileTap={onClick ? { scale: 0.95, y: 0 } : {}}
      onClick={onClick}
      className={`
        relative bg-gradient-to-br ${gradient}
        ${config.container}
        ${config.shadowSize}
        ${onClick ? config.hoverShadow : ''}
        ${onClick ? config.activeShadow : ''}
        ${config.borderWidth} border-white/20
        ${onClick ? 'cursor-pointer' : ''}
        transition-all
        overflow-hidden
      `}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Glow effect pulsante */}
      <div
        className={`absolute -inset-1 bg-${glowColor}-500/30 blur-xl -z-10 rounded-2xl`}
        style={{
          animation: 'pulse 3s ease-in-out infinite',
        }}
      />

      {/* Contenido */}
      <div className="relative z-10 text-center flex flex-col items-center">
        {/* Icono */}
        <motion.div
          className={`flex items-center justify-center mb-2 text-white ${config.iconSize}`}
          whileHover={onClick ? { rotate: [0, -10, 10, 0], scale: 1.1 } : {}}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.div>

        {/* Valor principal */}
        <div className={`text-white ${config.valueSize} font-black leading-none`}>{value}</div>

        {/* Label */}
        <div className={`text-white/90 ${config.labelSize} font-bold uppercase tracking-wider mt-1`}>
          {label}
        </div>

        {/* Subtítulo opcional */}
        {subtitle && (
          <div className={`text-white/70 ${config.subtitleSize} font-medium mt-1`}>{subtitle}</div>
        )}
      </div>

      {/* Brillo superior (efecto 3D) */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
    </motion.div>
  );
}

/**
 * Grid de stats responsivo (3 columnas adaptativas)
 */
export function StatGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`
        grid grid-cols-3
        gap-2 mobile-l:gap-2
        tablet-l:gap-4
        lg:gap-6
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * Ejemplo de uso:
 *
 * <StatGrid>
 *   <ResponsiveStatCard
 *     icon={<Zap className="w-6 h-6" />}
 *     value="7 días"
 *     label="RACHA"
 *     subtitle="¡Sigue así!"
 *     gradient="from-orange-500 to-red-600"
 *     glowColor="orange"
 *     onClick={() => console.log('Ver racha')}
 *     delay={0.1}
 *   />
 *   <ResponsiveStatCard
 *     icon={<Trophy />}
 *     value="12/50"
 *     label="LOGROS"
 *     gradient="from-yellow-500 to-amber-600"
 *     glowColor="yellow"
 *     delay={0.2}
 *   />
 *   <ResponsiveStatCard
 *     icon={<Target />}
 *     value="85%"
 *     label="ÁLGEBRA"
 *     subtitle="¡Casi maestro!"
 *     gradient="from-purple-500 to-pink-600"
 *     glowColor="purple"
 *     delay={0.3}
 *   />
 * </StatGrid>
 */
