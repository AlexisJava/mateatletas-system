/**
 * Card de Actividad Individual
 * Muestra una actividad dentro del grid 2×2
 * Estética Brawl Stars pura
 */

'use client';

import { motion } from 'framer-motion';
import { Lock, Play, CheckCircle2, Clock } from 'lucide-react';
import type { Actividad } from '../../types/actividad.types';
import { TIPO_ACTIVIDAD_COLORS, DIFICULTAD_COLORS } from '../../types/actividad.types';

export interface ActividadCardProps {
  actividad: Actividad;
  onClick: () => void;
}

export function ActividadCard({ actividad, onClick }: ActividadCardProps) {
  const esBloqueada = actividad.estado === 'bloqueada';
  const esCompletada = actividad.estado === 'completada';
  const tipoColors = TIPO_ACTIVIDAD_COLORS[actividad.tipo];
  const dificultadColors = DIFICULTAD_COLORS[actividad.dificultad];

  // Configuración por estado
  const ESTADO_CONFIG = {
    bloqueada: {
      opacidad: 'opacity-60',
      cursor: 'cursor-not-allowed',
      filtro: 'grayscale(70%)',
      icono: <Lock className="w-20 h-20 text-white/50" strokeWidth={3} />,
      botonTexto: 'BLOQUEADA',
      botonColor: 'from-gray-500 to-gray-700',
    },
    disponible: {
      opacidad: 'opacity-100',
      cursor: 'cursor-pointer',
      filtro: 'grayscale(0%)',
      icono: <Play className="w-20 h-20 text-white" strokeWidth={3} fill="white" />,
      botonTexto: 'EMPEZAR',
      botonColor: 'from-green-500 to-emerald-600',
    },
    'en-progreso': {
      opacidad: 'opacity-100',
      cursor: 'cursor-pointer',
      filtro: 'grayscale(0%)',
      icono: <Play className="w-20 h-20 text-yellow-300" strokeWidth={3} fill="yellow" />,
      botonTexto: 'CONTINUAR',
      botonColor: 'from-yellow-500 to-orange-500',
    },
    completada: {
      opacidad: 'opacity-100',
      cursor: 'cursor-pointer',
      filtro: 'grayscale(0%)',
      icono: <CheckCircle2 className="w-20 h-20 text-green-400" strokeWidth={3} fill="#4ade80" />,
      botonTexto: 'REPASAR',
      botonColor: 'from-blue-500 to-indigo-600',
    },
  };

  const config = ESTADO_CONFIG[actividad.estado];

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={!esBloqueada ? { scale: 1.02, y: -8 } : undefined}
      whileTap={!esBloqueada ? { scale: 0.98 } : undefined}
      onClick={!esBloqueada ? onClick : undefined}
      className={`
        relative
        bg-gradient-to-b ${tipoColors.gradient}
        border-[6px] border-black
        rounded-[32px]
        shadow-[0_8px_0_rgba(0,0,0,0.4)]
        hover:shadow-[0_12px_0_rgba(0,0,0,0.4)]
        p-6
        flex flex-col
        ${config.opacidad}
        ${config.cursor}
      `}
      style={{
        filter: esBloqueada ? config.filtro : 'none',
        transition: 'none',
      }}
    >
      {/* Badge de Dificultad - Esquina superior izquierda */}
      <div
        className={`
          absolute -top-3 -left-3
          bg-gradient-to-b ${dificultadColors.gradient}
          border-4 border-black
          rounded-2xl
          px-4 py-2
          flex items-center gap-1
          shadow-[0_4px_0_rgba(0,0,0,0.4)]
        `}
      >
        <span className="text-lg">{dificultadColors.emoji}</span>
      </div>

      {/* Badge de Número - Esquina superior derecha */}
      <div
        className="
          absolute -top-3 -right-3
          bg-black
          border-4 border-white
          rounded-full
          w-14 h-14
          flex items-center justify-center
          shadow-[0_4px_0_rgba(0,0,0,0.6)]
        "
      >
        <span
          className="text-2xl font-black text-white"
          style={{
            WebkitTextStroke: '2px black',
            paintOrder: 'stroke fill',
          }}
        >
          {actividad.numero}
        </span>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 mt-4">
        {/* Emoji Grande */}
        <div className="relative">
          <span className="text-8xl drop-shadow-[0_6px_0_rgba(0,0,0,0.3)]">{actividad.emoji}</span>
          {esCompletada && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2"
            >
              <CheckCircle2 className="w-12 h-12 text-green-400" strokeWidth={3} fill="#4ade80" />
            </motion.div>
          )}
        </div>

        {/* Título */}
        <h3
          className="
            font-[family-name:var(--font-lilita)]
            text-2xl
            font-black
            uppercase
            text-white
            text-center
            leading-tight
            px-2
          "
          style={{
            textShadow: '0 4px 0 rgba(0,0,0,0.4)',
            WebkitTextStroke: '2px black',
            paintOrder: 'stroke fill',
          }}
        >
          {actividad.titulo}
        </h3>

        {/* Descripción */}
        <p
          className="text-sm font-bold text-white/90 text-center px-4"
          style={{
            textShadow: '0 2px 0 rgba(0,0,0,0.3)',
          }}
        >
          {actividad.descripcion}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-2">
          {/* Duración */}
          <div className="flex items-center gap-1">
            <Clock className="w-5 h-5 text-white" strokeWidth={3} />
            <span
              className="text-sm font-black text-white"
              style={{
                textShadow: '0 2px 0 rgba(0,0,0,0.4)',
                WebkitTextStroke: '1px black',
              }}
            >
              {actividad.duracionEstimada} min
            </span>
          </div>

          {/* Puntos */}
          <div className="flex items-center gap-1">
            <span className="text-lg">🏆</span>
            <span
              className="text-sm font-black text-yellow-300"
              style={{
                textShadow: '0 2px 0 rgba(0,0,0,0.4)',
                WebkitTextStroke: '1px black',
              }}
            >
              {actividad.puntosMaximos} pts
            </span>
          </div>

          {/* XP */}
          <div className="flex items-center gap-1">
            <span className="text-lg">⭐</span>
            <span
              className="text-sm font-black text-cyan-300"
              style={{
                textShadow: '0 2px 0 rgba(0,0,0,0.4)',
                WebkitTextStroke: '1px black',
              }}
            >
              +{actividad.xpRecompensa} XP
            </span>
          </div>
        </div>

        {/* Progress Bar (solo si está en progreso o completada) */}
        {(actividad.estado === 'en-progreso' || actividad.estado === 'completada') && (
          <div className="w-full mt-4">
            <div
              className="
                w-full
                h-8
                bg-black/40
                border-4 border-black
                rounded-xl
                overflow-hidden
                relative
              "
            >
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${actividad.progreso}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
              <span
                className="
                  absolute
                  inset-0
                  flex items-center justify-center
                  text-lg font-black text-white
                "
                style={{
                  WebkitTextStroke: '2px black',
                }}
              >
                {actividad.progreso}%
              </span>
            </div>
          </div>
        )}

        {/* Estrellas (solo si está completada) */}
        {esCompletada && actividad.estrellas > 0 && (
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <span key={i} className="text-3xl">
                {i < actividad.estrellas ? '⭐' : '☆'}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Botón de Acción */}
      <button
        onClick={!esBloqueada ? onClick : undefined}
        disabled={esBloqueada}
        className={`
          w-full
          bg-gradient-to-b ${config.botonColor}
          border-[5px] border-black
          rounded-2xl
          py-4
          font-[family-name:var(--font-lilita)]
          text-xl
          font-black
          uppercase
          text-white
          shadow-[0_6px_0_rgba(0,0,0,0.4)]
          ${!esBloqueada ? 'hover:translate-y-[-4px] hover:shadow-[0_10px_0_rgba(0,0,0,0.4)]' : ''}
          ${!esBloqueada ? 'active:translate-y-[2px] active:shadow-[0_2px_0_rgba(0,0,0,0.4)]' : ''}
          flex items-center justify-center gap-2
          mt-4
        `}
        style={{
          transition: 'none',
          textShadow: '0 3px 0 rgba(0,0,0,0.4)',
          WebkitTextStroke: '2px black',
          paintOrder: 'stroke fill',
        }}
      >
        {config.icono}
        {config.botonTexto}
      </button>
    </motion.div>
  );
}
