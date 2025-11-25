/**
 * 📅 Tarjeta de Próxima Clase responsiva
 *
 * Variantes:
 * - Mobile: Compacta horizontal con info mínima
 * - Tablet/Desktop: Expandida con todos los detalles
 */

'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, Users } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDeviceType } from '@/hooks/useDeviceType';

export interface ProximaClaseCardProps {
  /** Datos de la clase */
  clase: {
    titulo?: string;
    fecha_hora_inicio: string;
    duracion_minutos?: number;
    grupo?: {
      nombre?: string;
    };
  };

  /** Variante forzada (opcional) */
  variant?: 'compact' | 'expanded';

  /** Delay de animación */
  delay?: number;

  /** Callback al hacer click */
  onClick?: () => void;
}

export function ResponsiveProximaClaseCard({
  clase,
  variant: forcedVariant,
  delay = 0,
  onClick,
}: ProximaClaseCardProps) {
  const { deviceType } = useDeviceType();

  // Determinar variante según dispositivo
  const variant = forcedVariant || (deviceType === 'mobile' ? 'compact' : 'expanded');

  // Parsear fecha
  const fecha = new Date(clase.fecha_hora_inicio);
  const esHoy = isToday(fecha);

  // ==================== VARIANTE COMPACT (Mobile) ====================
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay, type: 'spring', stiffness: 200 }}
        onClick={onClick}
        className={`
          bg-gradient-to-r from-green-500 to-emerald-600
          rounded-2xl p-3
          border-2 border-green-400/50
          shadow-lg
          ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}
          transition-all
        `}
      >
        <div className="flex items-center gap-3">
          {/* Icono */}
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-white" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-black uppercase tracking-wide truncate">
              {clase.titulo || 'Próxima Clase'}
            </div>
            <div className="text-white/90 text-xs font-bold">
              {esHoy ? '🔴 HOY' : format(fecha, 'dd/MM', { locale: es })} •{' '}
              {format(fecha, 'HH:mm')} hs
            </div>
          </div>

          {/* Badge EN VIVO */}
          {esHoy && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-red-500 shadow-lg shrink-0"
            />
          )}
        </div>
      </motion.div>
    );
  }

  // ==================== VARIANTE EXPANDED (Tablet/Desktop) ====================
  return (
    <motion.div
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      onClick={onClick}
      className={`
        bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500
        rounded-3xl p-6
        border-4 border-white/20
        shadow-2xl
        ${onClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(16,185,129,0.4)] active:scale-[0.98]' : ''}
        transition-all
        overflow-hidden
        relative
      `}
    >
      {/* Brillo superior */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

      {/* Contenido */}
      <div className="relative z-10 flex items-start gap-4">
        {/* Icono grande */}
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0"
        >
          <Calendar className="w-8 h-8 text-white" />
        </motion.div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          {/* Etiqueta superior */}
          <div className="text-white/80 text-xs font-bold uppercase tracking-wide mb-1">
            Próxima Clase
          </div>

          {/* Título */}
          <div className="text-white text-2xl font-black mb-2 leading-tight">
            {clase.titulo || 'Clase de Matemáticas'}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Fecha */}
            <div className="flex items-center gap-2 text-white/90 text-sm font-bold">
              <Clock className="w-4 h-4" />
              {esHoy
                ? '🔴 HOY'
                : format(fecha, "EEEE d 'de' MMMM", { locale: es }).toUpperCase()}
            </div>

            {/* Hora */}
            <div className="flex items-center gap-2 text-white/90 text-sm font-bold">
              <Users className="w-4 h-4" />
              {format(fecha, 'HH:mm')} hs
              {clase.duracion_minutos && ` • ${clase.duracion_minutos} min`}
            </div>

            {/* Grupo */}
            {clase.grupo?.nombre && (
              <div className="px-3 py-1 rounded-xl bg-white/20 text-white text-xs font-bold uppercase">
                {clase.grupo.nombre}
              </div>
            )}
          </div>
        </div>

        {/* Badge EN VIVO (si es hoy) */}
        {esHoy && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500 border-2 border-white/30 shadow-lg"
          >
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-white"
            />
            <span className="text-white text-xs font-black uppercase tracking-wider">EN VIVO</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Ejemplo de uso:
 *
 * <ResponsiveProximaClaseCard
 *   clase={{
 *     titulo: 'Álgebra Lineal',
 *     fecha_hora_inicio: '2025-10-31T14:00:00',
 *     duracion_minutos: 60,
 *     grupo: { nombre: 'Grupo Quantum' }
 *   }}
 *   onClick={() => navigate('/clase')}
 *   delay={0.4}
 * />
 */
