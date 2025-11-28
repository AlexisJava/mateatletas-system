/**
 * Card individual de semana temática
 * Estética GYMNASIUM: glassmorphism, clean, professional + subtle Brawl accents
 */

'use client';

import { motion } from 'framer-motion';
import type { Semana } from '../../data/semanas-mes-ciencia';
import { TEMA_COLORS } from '../../data/semanas-mes-ciencia';

export interface SemanaCardProps {
  semana: Semana;
  onClick: () => void;
}

/**
 * Badge de estado (esquina superior izquierda) - GYMNASIUM STYLE
 */
const ESTADO_BADGE = {
  completada: {
    emoji: '✅',
    label: 'Completada',
    bgColor: 'rgba(74, 222, 128, 0.2)', // green-400/20
    borderColor: 'rgba(74, 222, 128, 0.4)', // green-400/40
    textColor: 'text-green-300',
  },
  'en-progreso': {
    emoji: '⏸️',
    label: 'En progreso',
    bgColor: 'rgba(251, 191, 36, 0.2)', // yellow-400/20
    borderColor: 'rgba(251, 191, 36, 0.4)', // yellow-400/40
    textColor: 'text-yellow-300',
  },
  disponible: {
    emoji: '🎯',
    label: 'Disponible',
    bgColor: 'rgba(56, 189, 248, 0.2)', // cyan-400/20
    borderColor: 'rgba(56, 189, 248, 0.4)', // cyan-400/40
    textColor: 'text-cyan-300',
  },
  bloqueada: {
    emoji: '🔒',
    label: 'Bloqueada',
    bgColor: 'rgba(156, 163, 175, 0.2)', // gray-400/20
    borderColor: 'rgba(156, 163, 175, 0.4)', // gray-400/40
    textColor: 'text-gray-300',
  },
};

/**
 * Texto del botón según estado
 */
const BOTON_TEXTO = {
  completada: 'Ver récord',
  'en-progreso': 'Continuar →',
  disponible: 'Comenzar 🚀',
  bloqueada: 'Bloqueada 🔒',
};

export function SemanaCard({ semana, onClick }: SemanaCardProps) {
  const colors = TEMA_COLORS[semana.tema];
  const badge = ESTADO_BADGE[semana.estado];
  const botonTexto = BOTON_TEXTO[semana.estado];
  const esBloqueada = semana.estado === 'bloqueada';

  // Estrellas vacías
  const estrellasVacias = semana.totalEstrellas - semana.estrellas;

  return (
    <motion.div
      variants={{
        hidden: { scale: 0.95, opacity: 0 },
        visible: {
          scale: 1,
          opacity: 1,
          transition: { type: 'spring', stiffness: 300, damping: 30 },
        },
      }}
      whileHover={
        !esBloqueada
          ? {
              scale: 1.02,
              transition: { duration: 0.2 },
            }
          : undefined
      }
      whileTap={
        !esBloqueada
          ? {
              scale: 0.98,
              transition: { duration: 0.1 },
            }
          : undefined
      }
      onClick={!esBloqueada ? onClick : undefined}
      className={`
        relative
        rounded-3xl
        p-6
        flex flex-col
        ${esBloqueada ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      style={{
        background: esBloqueada
          ? 'rgba(255, 255, 255, 0.05)'
          : `linear-gradient(135deg, ${colors.primary}1A 0%, ${colors.secondary}1A 100%)`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `2px solid ${esBloqueada ? 'rgba(255, 255, 255, 0.1)' : colors.border}33`,
        boxShadow: esBloqueada ? '0 8px 32px rgba(0, 0, 0, 0.1)' : '0 8px 32px rgba(0, 0, 0, 0.2)',
        transition: 'all 200ms ease-out',
      }}
    >
      {/* Badge Estado (esquina superior izquierda) - GYMNASIUM STYLE */}
      <div
        className={`
          absolute -top-3 -left-3
          rounded-2xl
          px-3 py-1.5
          backdrop-blur-xl
          flex items-center gap-2
          ${badge.textColor}
        `}
        style={{
          background: badge.bgColor,
          border: `1px solid ${badge.borderColor}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <span className="text-lg">{badge.emoji}</span>
        <span className="font-semibold text-xs tracking-wide">{badge.label}</span>
      </div>

      {/* Emoji - GYMNASIUM SIZE (text-5xl) */}
      <div className="flex justify-center mt-8 mb-4">
        <span className="text-5xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }}>
          {semana.emoji}
        </span>
      </div>

      {/* Título - GYMNASIUM STYLE */}
      <h2
        className="
          font-[family-name:var(--font-lilita)]
          text-2xl
          text-white
          text-center
          mb-6
          leading-tight
        "
        style={{
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        }}
      >
        {semana.titulo}
      </h2>

      {/* Progress Bar - GYMNASIUM STYLE */}
      <div className="mb-4">
        <div
          className="w-full h-6 rounded-xl overflow-hidden relative"
          style={{
            background: 'rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <motion.div
            className="h-full"
            style={{
              background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${semana.progreso}%` }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          />
          <span
            className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white"
            style={{
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
            }}
          >
            {semana.progreso}%
          </span>
        </div>
      </div>

      {/* Estrellas - GYMNASIUM STYLE */}
      <div className="flex items-center justify-center gap-1 mb-4">
        {Array.from({ length: semana.estrellas }).map((_, i) => (
          <span
            key={`filled-${i}`}
            className="text-2xl"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }}
          >
            ⭐
          </span>
        ))}
        {Array.from({ length: estrellasVacias }).map((_, i) => (
          <span key={`empty-${i}`} className="text-2xl opacity-30">
            ☆
          </span>
        ))}
        <span
          className="ml-2 text-base font-semibold text-white"
          style={{
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}
        >
          {semana.estrellas}/{semana.totalEstrellas}
        </span>
      </div>

      {/* Stats: Puntos + Tiempo - GYMNASIUM STYLE */}
      <div className="flex items-center justify-around mb-6 gap-4">
        {/* Puntos */}
        <div className="flex items-center gap-2">
          <span
            className="text-2xl"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }}
          >
            🏆
          </span>
          <span
            className="text-lg font-semibold text-yellow-300"
            style={{
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
            }}
          >
            {semana.puntos}
          </span>
        </div>

        {/* Tiempo */}
        <div className="flex items-center gap-2">
          <span
            className="text-2xl"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }}
          >
            🕐
          </span>
          <span
            className="text-lg font-semibold text-white"
            style={{
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
            }}
          >
            {semana.tiempoInvertido}
          </span>
        </div>
      </div>

      {/* Botón CTA - GYMNASIUM STYLE */}
      <button
        className={`
          w-full
          rounded-2xl
          py-3 px-6
          font-semibold
          text-base
          text-white
          transition-all duration-200
          ${!esBloqueada && 'hover:scale-[1.02]'}
          ${!esBloqueada && 'active:scale-[0.98]'}
        `}
        style={{
          background: esBloqueada
            ? 'rgba(156, 163, 175, 0.3)'
            : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          border: esBloqueada
            ? '1px solid rgba(156, 163, 175, 0.4)'
            : `1px solid ${colors.border}66`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        }}
        disabled={esBloqueada}
      >
        {botonTexto}
      </button>
    </motion.div>
  );
}
