/**
 * Card individual para planificación mensual
 * Diseño simétrico con progreso y estados visuales
 */

'use client';

import { motion } from 'framer-motion';
import { useOverlayStack } from '../../contexts/OverlayStackProvider';
import type {
  PlanificacionCardMensualProps,
  EstadoConfig,
  EstadoPlanificacion,
} from '../../types/planificaciones.types';

/**
 * Configuración visual por estado
 */
const ESTADO_CONFIG: Record<EstadoPlanificacion, EstadoConfig> = {
  disponible: {
    border: 'border-cyan-400',
    bg: 'from-cyan-600/20 to-blue-600/20',
    badge: '🎯',
    badgeBg: 'bg-cyan-500',
  },
  'en-progreso': {
    border: 'border-yellow-400',
    bg: 'from-yellow-600/20 to-orange-600/20',
    badge: '⏸️',
    badgeBg: 'bg-yellow-500',
  },
  completada: {
    border: 'border-green-400',
    bg: 'from-green-600/20 to-emerald-600/20',
    badge: '✅',
    badgeBg: 'bg-green-500',
  },
  bloqueada: {
    border: 'border-gray-600',
    bg: 'from-gray-800/20 to-gray-700/20',
    badge: '🔒',
    badgeBg: 'bg-gray-600',
  },
};

/**
 * Extrae el tema de una planificación basándose en su código
 * Códigos esperados: '2025-11-mes-ciencia', '2025-12-nivel-1', etc.
 */
function extraerTema(
  codigo: string,
): 'astronomia' | 'fisica' | 'quimica' | 'informatica' | 'nivel-1' | 'nivel-2' | 'nivel-3' {
  const codigoLower = codigo.toLowerCase();

  // Mapear códigos conocidos a temas
  if (codigoLower.includes('mes-ciencia') || codigoLower.includes('astronomia')) {
    return 'astronomia';
  }
  if (codigoLower.includes('fisica')) {
    return 'fisica';
  }
  if (codigoLower.includes('quimica')) {
    return 'quimica';
  }
  if (codigoLower.includes('informatica')) {
    return 'informatica';
  }
  if (codigoLower.includes('nivel-1')) {
    return 'nivel-1';
  }
  if (codigoLower.includes('nivel-2')) {
    return 'nivel-2';
  }
  if (codigoLower.includes('nivel-3')) {
    return 'nivel-3';
  }

  // Default: astronomía (Mes de la Ciencia)
  return 'astronomia';
}

export function PlanificacionCardMensual({ planificacion }: PlanificacionCardMensualProps) {
  const { push } = useOverlayStack();
  const config = ESTADO_CONFIG[planificacion.estado] ?? ESTADO_CONFIG.disponible;
  const esBloqueada = planificacion.estado === 'bloqueada';

  const handleClick = () => {
    if (esBloqueada) {
      // TODO: Integrar sistema de toasts
      console.info('¡Esta planificación se desbloqueará pronto! 🔒');
      return;
    }

    push({
      type: 'planificacion',
      codigo: planificacion.codigo,
      tema: extraerTema(planificacion.codigo),
    });
  };

  return (
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0, scale: 0.9 },
        visible: {
          y: 0,
          opacity: 1,
          scale: 1,
          transition: {
            type: 'spring',
            damping: 20,
            stiffness: 300,
          },
        },
      }}
      whileHover={
        !esBloqueada
          ? {
              scale: 1.05,
              filter: 'brightness(1.2)',
              transition: { duration: 0.2 },
            }
          : undefined
      }
      whileTap={
        !esBloqueada
          ? {
              scale: 0.95,
              transition: { duration: 0.1 },
            }
          : undefined
      }
      onClick={handleClick}
      className={`
        relative h-full rounded-3xl border-3 ${config.border}
        bg-gradient-to-br ${config.bg}
        backdrop-blur-xl shadow-xl
        flex flex-col p-6
        transition-all duration-300
        ${esBloqueada ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Header: Emoji + Badge Progreso */}
      <div className="flex items-start justify-between mb-4">
        <span className="text-5xl drop-shadow-lg">{planificacion.emoji}</span>

        <div
          className={`
          ${config.badgeBg}
          px-3 py-1 rounded-full
          flex items-center gap-1
          text-white text-sm font-bold
          shadow-lg
        `}
        >
          <span>{config.badge}</span>
          {planificacion.progreso > 0 && <span>{planificacion.progreso}%</span>}
        </div>
      </div>

      {/* Título */}
      <div className="flex-1 flex flex-col justify-center mb-4">
        <h3 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-1 text-center">
          {planificacion.mes}
        </h3>
        <h2 className="text-white font-[family-name:var(--font-lilita)] text-xl leading-tight text-center line-clamp-2">
          {planificacion.titulo}
        </h2>
      </div>

      {/* Footer: Progress Bar + Info */}
      <div className="space-y-2">
        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${planificacion.progreso}%` }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Info */}
        <div className="flex items-center justify-between text-white/60 text-xs">
          <span>
            {planificacion.semanasCompletadas}/{planificacion.totalSemanas} semanas
          </span>
          <span className="font-bold text-white/80">{planificacion.progreso}%</span>
        </div>
      </div>
    </motion.div>
  );
}
