/**
 * Pantalla de Resultados de Actividad
 * Muestra estrellas, puntaje, stats y recompensas
 * Estética Brawl Stars pura
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Target, ChevronRight, RotateCcw, X } from 'lucide-react';
import type { ResultadoCalculado } from '../../utils/results-calculator';
import { getColorPorEstrellas, formatearTiempo } from '../../utils/results-calculator';

export interface ResultsViewProps {
  resultado: ResultadoCalculado;
  onVolver: () => void;
  onReintentar?: () => void;
  onSiguiente?: () => void;
}

export function ResultsView({ resultado, onVolver, onReintentar, onSiguiente }: ResultsViewProps) {
  const [mostrarEstrellas, setMostrarEstrellas] = useState(false);
  const [mostrarStats, setMostrarStats] = useState(false);
  const [mostrarRecompensas, setMostrarRecompensas] = useState(false);

  const colors = getColorPorEstrellas(resultado.estrellas);

  // Animación secuencial
  useEffect(() => {
    const timer1 = setTimeout(() => setMostrarEstrellas(true), 300);
    const timer2 = setTimeout(() => setMostrarStats(true), 1000);
    const timer3 = setTimeout(() => setMostrarRecompensas(true), 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-8"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative w-full max-w-3xl"
      >
        {/* Card principal */}
        <div
          className={`
            bg-gradient-to-br ${colors.gradient}
            border-[8px] border-black
            rounded-[40px]
            shadow-[0_16px_0_rgba(0,0,0,0.6)]
            p-8
            relative
          `}
        >
          {/* Botón cerrar */}
          <button
            onClick={onVolver}
            className="
              absolute -top-4 -right-4
              bg-red-500 hover:bg-red-600
              border-[5px] border-black
              rounded-full
              w-16 h-16
              flex items-center justify-center
              shadow-[0_6px_0_rgba(0,0,0,0.6)]
              hover:shadow-[0_8px_0_rgba(0,0,0,0.6)]
              z-10
            "
            style={{ transition: 'none' }}
          >
            <X className="w-8 h-8 text-white" strokeWidth={4} />
          </button>

          {/* Emoji grande */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', damping: 15 }}
            className="text-center mb-6"
          >
            <span className="text-9xl drop-shadow-[0_8px_0_rgba(0,0,0,0.4)]">
              {resultado.emoji}
            </span>
          </motion.div>

          {/* Mensaje */}
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="
              font-[family-name:var(--font-lilita)]
              text-5xl
              font-black
              uppercase
              text-white
              text-center
              mb-8
            "
            style={{
              textShadow: '0 6px 0 rgba(0,0,0,0.4)',
              WebkitTextStroke: '3px black',
              paintOrder: 'stroke fill',
            }}
          >
            {resultado.mensaje}
          </motion.h2>

          {/* Estrellas */}
          <AnimatePresence>
            {mostrarEstrellas && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-4 mb-8"
              >
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: index * 0.2,
                      type: 'spring',
                      damping: 10,
                      stiffness: 200,
                    }}
                  >
                    <div
                      className={`
                        ${index < resultado.estrellas ? 'bg-yellow-400' : 'bg-gray-700'}
                        border-[6px] border-black
                        rounded-full
                        w-24 h-24
                        flex items-center justify-center
                        shadow-[0_8px_0_rgba(0,0,0,0.6)]
                      `}
                    >
                      <span className="text-6xl">
                        {index < resultado.estrellas ? '⭐' : '☆'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats */}
          <AnimatePresence>
            {mostrarStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-4 mb-8"
              >
                {/* Puntaje */}
                <StatsCard
                  icon={<Trophy className="w-8 h-8 text-white" strokeWidth={3} />}
                  label="PUNTAJE"
                  value={`${resultado.puntajeObtenido}/${resultado.puntajeMaximo}`}
                  delay={0}
                />

                {/* Precisión */}
                <StatsCard
                  icon={<Target className="w-8 h-8 text-white" strokeWidth={3} />}
                  label="PRECISIÓN"
                  value={`${resultado.porcentaje}%`}
                  delay={0.1}
                />

                {/* Tiempo */}
                <StatsCard
                  icon={<Clock className="w-8 h-8 text-white" strokeWidth={3} />}
                  label="TIEMPO"
                  value={formatearTiempo(resultado.tiempoEmpleado)}
                  delay={0.2}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Preguntas correctas */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center mb-8"
          >
            <span
              className="text-2xl font-black text-white"
              style={{
                textShadow: '0 3px 0 rgba(0,0,0,0.4)',
                WebkitTextStroke: '2px black',
              }}
            >
              ✓ {resultado.preguntasCorrectas} de {resultado.preguntasTotales} correctas
            </span>
          </motion.div>

          {/* Recompensas */}
          <AnimatePresence>
            {mostrarRecompensas && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="
                  bg-black/40
                  border-4 border-white/30
                  rounded-3xl
                  p-6
                  mb-8
                "
              >
                <h3
                  className="text-2xl font-black text-cyan-300 text-center mb-4"
                  style={{
                    textShadow: '0 3px 0 rgba(0,0,0,0.4)',
                    WebkitTextStroke: '2px black',
                  }}
                >
                  🎁 RECOMPENSAS GANADAS
                </h3>

                <div className="flex items-center justify-center gap-8">
                  {/* XP */}
                  <RewardBadge
                    emoji="⭐"
                    label="XP"
                    value={`+${resultado.xpGanado}`}
                    color="from-cyan-500 to-blue-600"
                    delay={0}
                  />

                  {/* Monedas */}
                  <RewardBadge
                    emoji="🪙"
                    label="MONEDAS"
                    value={`+${resultado.monedasGanadas}`}
                    color="from-yellow-500 to-orange-600"
                    delay={0.1}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botones de acción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            className="flex items-center gap-4"
          >
            {/* Reintentar */}
            {onReintentar && resultado.estrellas < 3 && (
              <button
                onClick={onReintentar}
                className="
                  flex-1
                  bg-gradient-to-b from-orange-500 to-red-600
                  border-[6px] border-black
                  rounded-2xl
                  py-4
                  font-[family-name:var(--font-lilita)]
                  text-xl
                  font-black
                  uppercase
                  text-white
                  shadow-[0_8px_0_rgba(0,0,0,0.4)]
                  hover:translate-y-[-4px]
                  hover:shadow-[0_12px_0_rgba(0,0,0,0.4)]
                  active:translate-y-[2px]
                  active:shadow-[0_2px_0_rgba(0,0,0,0.4)]
                  flex items-center justify-center gap-2
                "
                style={{
                  transition: 'none',
                  textShadow: '0 3px 0 rgba(0,0,0,0.4)',
                  WebkitTextStroke: '2px black',
                  paintOrder: 'stroke fill',
                }}
              >
                <RotateCcw className="w-6 h-6" strokeWidth={3} />
                REINTENTAR
              </button>
            )}

            {/* Volver */}
            <button
              onClick={onVolver}
              className="
                flex-1
                bg-gradient-to-b from-cyan-500 to-blue-600
                border-[6px] border-black
                rounded-2xl
                py-4
                font-[family-name:var(--font-lilita)]
                text-xl
                font-black
                uppercase
                text-white
                shadow-[0_8px_0_rgba(0,0,0,0.4)]
                hover:translate-y-[-4px]
                hover:shadow-[0_12px_0_rgba(0,0,0,0.4)]
                active:translate-y-[2px]
                active:shadow-[0_2px_0_rgba(0,0,0,0.4)]
              "
              style={{
                transition: 'none',
                textShadow: '0 3px 0 rgba(0,0,0,0.4)',
                WebkitTextStroke: '2px black',
                paintOrder: 'stroke fill',
              }}
            >
              VOLVER
            </button>

            {/* Siguiente */}
            {onSiguiente && (
              <button
                onClick={onSiguiente}
                className="
                  flex-1
                  bg-gradient-to-b from-green-500 to-emerald-600
                  border-[6px] border-black
                  rounded-2xl
                  py-4
                  font-[family-name:var(--font-lilita)]
                  text-xl
                  font-black
                  uppercase
                  text-white
                  shadow-[0_8px_0_rgba(0,0,0,0.4)]
                  hover:translate-y-[-4px]
                  hover:shadow-[0_12px_0_rgba(0,0,0,0.4)]
                  active:translate-y-[2px]
                  active:shadow-[0_2px_0_rgba(0,0,0,0.4)]
                  flex items-center justify-center gap-2
                "
                style={{
                  transition: 'none',
                  textShadow: '0 3px 0 rgba(0,0,0,0.4)',
                  WebkitTextStroke: '2px black',
                  paintOrder: 'stroke fill',
                }}
              >
                SIGUIENTE
                <ChevronRight className="w-6 h-6" strokeWidth={3} />
              </button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Card de estadística individual
 */
interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay: number;
}

function StatsCard({ icon, label, value, delay }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', damping: 15 }}
      className="
        bg-black/40
        border-4 border-white/30
        rounded-2xl
        p-4
        text-center
      "
    >
      <div className="flex justify-center mb-2">{icon}</div>
      <p
        className="text-sm font-black text-white/80 mb-1"
        style={{
          textShadow: '0 2px 0 rgba(0,0,0,0.4)',
        }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-black text-white"
        style={{
          textShadow: '0 3px 0 rgba(0,0,0,0.4)',
          WebkitTextStroke: '1px black',
        }}
      >
        {value}
      </p>
    </motion.div>
  );
}

/**
 * Badge de recompensa
 */
interface RewardBadgeProps {
  emoji: string;
  label: string;
  value: string;
  color: string;
  delay: number;
}

function RewardBadge({ emoji, label, value, color, delay }: RewardBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`
        bg-gradient-to-b ${color}
        border-[5px] border-black
        rounded-2xl
        px-6 py-4
        shadow-[0_6px_0_rgba(0,0,0,0.4)]
        min-w-[140px]
      `}
    >
      <div className="text-center">
        <span className="text-5xl block mb-2">{emoji}</span>
        <p
          className="text-xs font-black text-white/80 mb-1"
          style={{
            textShadow: '0 2px 0 rgba(0,0,0,0.4)',
          }}
        >
          {label}
        </p>
        <p
          className="text-3xl font-black text-white"
          style={{
            textShadow: '0 3px 0 rgba(0,0,0,0.4)',
            WebkitTextStroke: '2px black',
            paintOrder: 'stroke fill',
          }}
        >
          {value}
        </p>
      </div>
    </motion.div>
  );
}
