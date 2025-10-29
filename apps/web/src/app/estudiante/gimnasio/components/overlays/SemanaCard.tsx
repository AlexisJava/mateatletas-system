/**
 * Card individual de semana temática
 * Estética Brawl Stars: outlines negros gruesos, sombras duras, gradientes saturados
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
 * Badge de estado (esquina superior izquierda)
 */
const ESTADO_BADGE = {
  completada: {
    emoji: '✅',
    label: 'COMPLETADA',
    gradient: 'from-green-400 to-green-600',
  },
  'en-progreso': {
    emoji: '⏸️',
    label: 'EN PROGRESO',
    gradient: 'from-yellow-400 to-orange-500',
  },
  disponible: {
    emoji: '🎯',
    label: 'DISPONIBLE',
    gradient: 'from-cyan-400 to-blue-500',
  },
  bloqueada: {
    emoji: '🔒',
    label: 'BLOQUEADA',
    gradient: 'from-gray-500 to-gray-700',
  },
};

/**
 * Texto del botón según estado
 */
const BOTON_TEXTO = {
  completada: 'VER RÉCORD',
  'en-progreso': 'CONTINUAR →',
  disponible: 'COMENZAR 🚀',
  bloqueada: 'BLOQUEADA 🔒',
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
        hidden: { scale: 0.8, opacity: 0 },
        visible: {
          scale: 1,
          opacity: 1,
          transition: { type: 'spring', stiffness: 300, damping: 24 },
        },
      }}
      whileHover={
        !esBloqueada
          ? {
              y: -8,
              transition: { duration: 0.2, ease: 'easeOut' },
            }
          : undefined
      }
      whileTap={
        !esBloqueada
          ? {
              y: 2,
              transition: { duration: 0.1 },
            }
          : undefined
      }
      onClick={!esBloqueada ? onClick : undefined}
      className={`
        relative
        bg-gradient-to-b ${colors.gradient}
        border-[6px] border-black
        rounded-[32px]
        shadow-[0_8px_0_rgba(0,0,0,0.4)]
        p-6
        flex flex-col
        ${esBloqueada ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}
        ${!esBloqueada && 'hover:shadow-[0_16px_0_rgba(0,0,0,0.4)]'}
      `}
      style={{
        transition: 'none', // Brawl Stars = sin transitions suaves
      }}
    >
      {/* Badge Estado (esquina superior izquierda) */}
      <div
        className={`
        absolute -top-3 -left-3
        bg-gradient-to-b ${badge.gradient}
        border-4 border-black
        rounded-full
        px-4 py-2
        shadow-[0_4px_0_rgba(0,0,0,0.4)]
        flex items-center gap-2
      `}
      >
        <span className="text-2xl">{badge.emoji}</span>
        <span className="font-black text-white text-sm uppercase tracking-wide">{badge.label}</span>
      </div>

      {/* Emoji gigante */}
      <div className="flex justify-center mt-8 mb-4">
        <span className="text-8xl drop-shadow-[0_8px_0_rgba(0,0,0,0.3)]">{semana.emoji}</span>
      </div>

      {/* Título con text-stroke negro */}
      <h2
        className="
        font-[family-name:var(--font-lilita)]
        text-3xl
        font-black
        uppercase
        text-white
        text-center
        mb-6
        leading-tight
      "
        style={{
          textShadow: '0 4px 0 rgba(0,0,0,0.4)',
          WebkitTextStroke: '4px black',
          paintOrder: 'stroke fill',
        }}
      >
        {semana.titulo}
      </h2>

      {/* Progress Bar con outline */}
      <div className="mb-4">
        <div
          className="
          w-full
          h-8
          bg-black/30
          border-4 border-black
          rounded-2xl
          overflow-hidden
          relative
        "
        >
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${semana.progreso}%` }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          />
          <span
            className="
            absolute
            inset-0
            flex items-center justify-center
            text-xl font-black text-white
          "
            style={{
              WebkitTextStroke: '3px black',
            }}
          >
            {semana.progreso}%
          </span>
        </div>
      </div>

      {/* Estrellas */}
      <div className="flex items-center justify-center gap-1 mb-4">
        {Array.from({ length: semana.estrellas }).map((_, i) => (
          <span key={`filled-${i}`} className="text-3xl drop-shadow-[0_3px_0_rgba(0,0,0,0.3)]">
            ⭐
          </span>
        ))}
        {Array.from({ length: estrellasVacias }).map((_, i) => (
          <span key={`empty-${i}`} className="text-3xl opacity-30">
            ☆
          </span>
        ))}
        <span
          className="ml-2 text-xl font-black text-white"
          style={{
            WebkitTextStroke: '2px black',
          }}
        >
          {semana.estrellas}/{semana.totalEstrellas}
        </span>
      </div>

      {/* Stats: Puntos + Tiempo */}
      <div className="flex items-center justify-around mb-6 gap-4">
        {/* Puntos */}
        <div className="flex items-center gap-2">
          <span className="text-3xl drop-shadow-[0_3px_0_rgba(0,0,0,0.3)]">🏆</span>
          <span
            className="text-2xl font-black text-yellow-300"
            style={{
              textShadow: '0 3px 0 rgba(0,0,0,0.4)',
              WebkitTextStroke: '2px black',
            }}
          >
            {semana.puntos}
          </span>
        </div>

        {/* Tiempo */}
        <div className="flex items-center gap-2">
          <span className="text-3xl drop-shadow-[0_3px_0_rgba(0,0,0,0.3)]">🕐</span>
          <span
            className="text-2xl font-black text-white"
            style={{
              textShadow: '0 3px 0 rgba(0,0,0,0.4)',
              WebkitTextStroke: '2px black',
            }}
          >
            {semana.tiempoInvertido}
          </span>
        </div>
      </div>

      {/* Botón CTA con sombra dura */}
      <button
        className={`
        w-full
        bg-gradient-to-b from-yellow-400 to-orange-500
        border-[5px] border-black
        rounded-2xl
        py-3 px-6
        shadow-[0_6px_0_rgba(0,0,0,0.4)]
        font-[family-name:var(--font-lilita)]
        text-2xl
        font-black
        uppercase
        text-black
        ${
          !esBloqueada &&
          'hover:translate-y-[-4px] hover:shadow-[0_10px_0_rgba(0,0,0,0.4)] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(0,0,0,0.4)]'
        }
        ${esBloqueada && 'bg-gradient-to-b from-gray-400 to-gray-600'}
      `}
        style={{
          transition: 'none', // Sin transitions
        }}
        disabled={esBloqueada}
      >
        {botonTexto}
      </button>
    </motion.div>
  );
}
