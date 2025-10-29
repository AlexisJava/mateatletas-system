/**
 * MES DE LA CIENCIA - Estilo BRAWL STARS
 * Layout: 4 cards verticales en fila horizontal (como el shop de Brawl)
 * Cards altas con ilustraciones grandes, colores saturados, borders gruesos
 */

'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Sparkles } from 'lucide-react';
import { useOverlayStack } from '../../contexts/OverlayStackProvider';
import { SEMANAS_MES_CIENCIA } from '../../data/semanas-mes-ciencia';
import type { OverlayConfig } from '../../types/overlay.types';
import type { Semana } from '../../data/semanas-mes-ciencia';

export interface PlanificacionViewProps {
  config?: OverlayConfig;
  estudiante?: {
    nombre: string;
    id?: string;
  };
}

/**
 * Card vertical estilo Brawl Stars
 */
interface BrawlCardProps {
  semana: Semana;
  onClick: () => void;
  index: number;
}

function BrawlCard({ semana, onClick, index }: BrawlCardProps) {
  const esBloqueada = semana.estado === 'bloqueada';
  const esNueva = semana.estado === 'disponible' && semana.progreso === 0;

  // Colores SATURADOS estilo Brawl Stars
  const cardStyles = {
    quimica: {
      bg: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
      border: '#047857',
      shadow: 'rgba(16, 185, 129, 0.5)',
    },
    astronomia: {
      bg: 'linear-gradient(180deg, #a855f7 0%, #7e22ce 100%)',
      border: '#6b21a8',
      shadow: 'rgba(168, 85, 247, 0.5)',
    },
    fisica: {
      bg: 'linear-gradient(180deg, #f97316 0%, #ea580c 100%)',
      border: '#c2410c',
      shadow: 'rgba(249, 115, 22, 0.5)',
    },
    informatica: {
      bg: 'linear-gradient(180deg, #06b6d4 0%, #0891b2 100%)',
      border: '#0e7490',
      shadow: 'rgba(6, 182, 212, 0.5)',
    },
  };

  const style = cardStyles[semana.tema];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={!esBloqueada ? { y: -8, scale: 1.02 } : undefined}
      whileTap={!esBloqueada ? { scale: 0.98 } : undefined}
      onClick={!esBloqueada ? onClick : undefined}
      className={`
        relative
        w-72
        h-[480px]
        rounded-3xl
        overflow-hidden
        ${esBloqueada ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        transition-all duration-200
      `}
      style={{
        background: esBloqueada ? 'linear-gradient(180deg, #374151 0%, #1f2937 100%)' : style.bg,
        border: `4px solid ${esBloqueada ? '#4b5563' : style.border}`,
        boxShadow: esBloqueada ? 'none' : `0 12px 40px ${style.shadow}`,
      }}
    >
      {/* Badge NUEVA */}
      {esNueva && !esBloqueada && (
        <div className="absolute top-3 right-3 z-10">
          <motion.div
            className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-4 py-1.5 flex items-center gap-1.5 shadow-lg border-2 border-yellow-600"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-xs font-black text-white uppercase">¡Nueva!</span>
          </motion.div>
        </div>
      )}

      {/* Ilustración grande arriba (emoji gigante por ahora) */}
      <div
        className="relative h-64 flex items-center justify-center overflow-hidden"
        style={{
          background: esBloqueada
            ? 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.2) 100%)',
        }}
      >
        {/* Lock overlay para bloqueadas */}
        {esBloqueada && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
            <Lock className="w-20 h-20 text-white/50" strokeWidth={2} />
          </div>
        )}

        {/* Emoji con animación */}
        <motion.div
          className="text-9xl"
          animate={
            !esBloqueada
              ? {
                  y: [0, -15, 0],
                  rotate: [0, 5, -5, 0],
                }
              : undefined
          }
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            filter: esBloqueada ? 'grayscale(100%)' : 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))',
          }}
        >
          {semana.emoji}
        </motion.div>
      </div>

      {/* Contenido inferior */}
      <div className="relative h-[216px] bg-gradient-to-b from-black/20 to-black/40 p-6 flex flex-col">
        {/* Título */}
        <h3
          className="font-[family-name:var(--font-lilita)] text-3xl text-white text-center mb-4 leading-tight"
          style={{
            textShadow: '0 3px 8px rgba(0, 0, 0, 0.5)',
          }}
        >
          {semana.titulo}
        </h3>

        {/* Progress circular */}
        <div className="flex justify-center mb-4">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="6"
                fill="none"
              />
              <motion.circle
                cx="40"
                cy="40"
                r="35"
                stroke={esBloqueada ? 'rgba(255, 255, 255, 0.3)' : 'white'}
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 35}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 35 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 35 * (1 - semana.progreso / 100) }}
                transition={{ duration: 1.5, delay: 0.3 + index * 0.1 }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-white font-black text-xl"
                style={{
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                }}
              >
                {semana.progreso}%
              </span>
            </div>
          </div>
        </div>

        {/* Stats: Estrellas + Puntos */}
        <div className="flex items-center justify-center gap-6 mb-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl">⭐</span>
            <span
              className="text-white font-bold text-lg"
              style={{
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              }}
            >
              {semana.estrellas}/{semana.totalEstrellas}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl">🏆</span>
            <span
              className="text-white font-bold text-lg"
              style={{
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              }}
            >
              {semana.puntos}
            </span>
          </div>
        </div>

        {/* Badge de estado */}
        <div className="mt-auto">
          {esBloqueada && (
            <div className="w-full bg-red-600/80 backdrop-blur-sm rounded-2xl py-2.5 border-2 border-red-700 flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-white" />
              <span className="text-white font-black text-sm uppercase tracking-wide">Bloqueada</span>
            </div>
          )}
          {!esBloqueada && semana.estado === 'disponible' && (
            <div className="w-full bg-cyan-500/90 backdrop-blur-sm rounded-2xl py-2.5 border-2 border-cyan-600 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white font-black text-sm uppercase tracking-wide">¡Disponible!</span>
            </div>
          )}
          {semana.estado === 'en-progreso' && (
            <div className="w-full bg-yellow-500/90 backdrop-blur-sm rounded-2xl py-2.5 border-2 border-yellow-600">
              <span className="text-white font-black text-sm uppercase tracking-wide text-center block">
                En Progreso
              </span>
            </div>
          )}
          {semana.estado === 'completada' && (
            <div className="w-full bg-green-500/90 backdrop-blur-sm rounded-2xl py-2.5 border-2 border-green-600">
              <span className="text-white font-black text-sm uppercase tracking-wide text-center block">
                ✓ Completada
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function PlanificacionView({ config, estudiante }: PlanificacionViewProps) {
  const { pop, push } = useOverlayStack();

  const handleSemanaClick = (semanaId: string) => {
    const semana = SEMANAS_MES_CIENCIA.find((s) => s.id === semanaId);

    if (!semana || semana.estado === 'bloqueada') {
      return;
    }

    push({
      type: 'actividad',
      semanaId: semanaId,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 50%, #1e3a8a 100%)',
      }}
    >
      {/* Header estilo Brawl */}
      <header className="h-20 backdrop-blur-xl border-b border-white/10 px-8 flex items-center justify-between bg-black/20">
        <button
          onClick={pop}
          className="
            flex items-center gap-2
            bg-white/10
            hover:bg-white/20
            backdrop-blur-xl
            border-2 border-white/30
            rounded-2xl
            px-6 py-3
            transition-all duration-200
            hover:scale-105
            active:scale-95
          "
        >
          <ArrowLeft className="w-5 h-5 text-white" strokeWidth={3} />
          <span className="font-black text-white uppercase text-sm">Volver</span>
        </button>

        <div className="text-center">
          <h1
            className="font-[family-name:var(--font-lilita)] text-5xl text-white tracking-wide uppercase"
            style={{
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            }}
          >
            MES DE LA CIENCIA
          </h1>
          <p className="text-yellow-300 text-sm font-bold mt-1 uppercase tracking-wide">Noviembre 2025</p>
        </div>

        <div className="w-32" /> {/* Spacer */}
      </header>

      {/* Carrusel horizontal de 4 cards */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
        <div className="flex gap-6 items-center justify-center max-w-7xl">
          {SEMANAS_MES_CIENCIA.map((semana, index) => (
            <BrawlCard key={semana.id} semana={semana} onClick={() => handleSemanaClick(semana.id)} index={index} />
          ))}
        </div>
      </div>

      {/* Mensaje del Dr. Ciencia */}
      <motion.div
        className="pb-8 px-8 flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="bg-black/30 backdrop-blur-xl border-2 border-white/20 rounded-3xl px-8 py-4 flex items-center gap-4 max-w-2xl">
          <div className="text-6xl">👨‍🔬</div>
          <div>
            <p className="text-white font-bold text-lg mb-1">Dr. Ciencia</p>
            <p className="text-white/80 text-sm">¡Elige una sala para comenzar tu aventura científica! 🔬✨</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
