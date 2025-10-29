/**
 * MUSEO DE LA CIENCIA - Noviembre 2025
 * ESTILO MATIFIC: Inmersivo, narrativo, interactivo
 * El niño explora un museo con 4 salas temáticas (no cards aburridos)
 */

'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
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
 * Componente de Puerta Interactiva de Sala
 */
interface DoorProps {
  semana: Semana;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onClick: () => void;
}

function MuseumDoor({ semana, position, onClick }: DoorProps) {
  const esBloqueada = semana.estado === 'bloqueada';
  const esNueva = semana.estado === 'disponible' && semana.progreso === 0;

  // Colores según tema
  const doorColors = {
    quimica: { primary: '#a855f7', secondary: '#ec4899', glow: 'rgba(168, 85, 247, 0.4)' },
    fisica: { primary: '#3b82f6', secondary: '#06b6d4', glow: 'rgba(59, 130, 246, 0.4)' },
    biologia: { primary: '#10b981', secondary: '#84cc16', glow: 'rgba(16, 185, 129, 0.4)' },
    astronomia: { primary: '#8b5cf6', secondary: '#f59e0b', glow: 'rgba(139, 92, 246, 0.4)' },
  };

  const colors = doorColors[semana.tema];

  // Posiciones isométricas
  const positions = {
    'top-left': 'top-[15%] left-[15%]',
    'top-right': 'top-[15%] right-[15%]',
    'bottom-left': 'bottom-[15%] left-[15%]',
    'bottom-right': 'bottom-[15%] right-[15%]',
  };

  return (
    <motion.div
      className={`absolute ${positions[position]} cursor-pointer group`}
      whileHover={!esBloqueada ? { scale: 1.05, y: -5 } : undefined}
      whileTap={!esBloqueada ? { scale: 0.95 } : undefined}
      onClick={!esBloqueada ? onClick : undefined}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 + (position === 'top-left' ? 0 : position === 'top-right' ? 0.1 : position === 'bottom-left' ? 0.2 : 0.3) }}
    >
      {/* Puerta con glassmorphism */}
      <div
        className={`
          relative
          w-64 h-80
          rounded-3xl
          backdrop-blur-xl
          border-2
          transition-all duration-300
          ${esBloqueada ? 'opacity-40 grayscale' : 'group-hover:shadow-2xl'}
        `}
        style={{
          background: esBloqueada
            ? 'rgba(255, 255, 255, 0.05)'
            : `linear-gradient(135deg, ${colors.primary}33 0%, ${colors.secondary}33 100%)`,
          borderColor: esBloqueada ? 'rgba(255, 255, 255, 0.1)' : `${colors.primary}66`,
          boxShadow: esBloqueada ? 'none' : `0 8px 32px ${colors.glow}`,
        }}
      >
        {/* Badge "NUEVA" o estado */}
        {esNueva && !esBloqueada && (
          <div
            className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-4 py-1.5 flex items-center gap-1 shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white">¡NUEVA!</span>
          </div>
        )}

        {/* Lock icon para bloqueadas */}
        {esBloqueada && (
          <div className="absolute top-4 right-4 text-4xl opacity-50">🔒</div>
        )}

        {/* Contenido de la puerta */}
        <div className="flex flex-col items-center justify-center h-full p-6">
          {/* Emoji gigante */}
          <motion.div
            className="text-7xl mb-4"
            animate={!esBloqueada ? {
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0],
            } : undefined}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {semana.emoji}
          </motion.div>

          {/* Título de la sala */}
          <h3
            className="font-[family-name:var(--font-lilita)] text-2xl text-white text-center mb-3 leading-tight"
            style={{
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
            }}
          >
            {semana.titulo}
          </h3>

          {/* Progress bar circular minimalista */}
          <div className="relative w-16 h-16 mb-3">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="4"
                fill="none"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                stroke={esBloqueada ? 'rgba(255, 255, 255, 0.1)' : colors.primary}
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 28}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - semana.progreso / 100) }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{semana.progreso}%</span>
            </div>
          </div>

          {/* Stats compactos */}
          <div className="flex items-center gap-3 text-white/80 text-sm">
            <div className="flex items-center gap-1">
              <span>⭐</span>
              <span className="font-semibold">{semana.estrellas}/{semana.totalEstrellas}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🏆</span>
              <span className="font-semibold">{semana.puntos}</span>
            </div>
          </div>

          {/* Badge de estado */}
          <div className="mt-4">
            {semana.estado === 'completada' && (
              <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full border border-green-500/40 font-semibold">
                ✓ Completada
              </span>
            )}
            {semana.estado === 'en-progreso' && (
              <span className="text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full border border-yellow-500/40 font-semibold">
                ⏸ En progreso
              </span>
            )}
            {semana.estado === 'disponible' && (
              <span className="text-xs bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/40 font-semibold">
                🎯 Disponible
              </span>
            )}
            {semana.estado === 'bloqueada' && (
              <span className="text-xs bg-gray-500/20 text-gray-400 px-3 py-1 rounded-full border border-gray-500/40 font-semibold">
                🔒 Bloqueada
              </span>
            )}
          </div>
        </div>

        {/* Efecto de brillo hover */}
        {!esBloqueada && (
          <div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${colors.primary}22 0%, transparent 70%)`,
            }}
          />
        )}
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
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      }}
    >
      {/* Header minimalista */}
      <header
        className="h-20 backdrop-blur-xl border-b border-white/10 px-8 flex items-center justify-between"
        style={{
          background: 'rgba(15, 23, 42, 0.8)',
        }}
      >
        <button
          onClick={pop}
          className="
            flex items-center gap-2
            bg-white/10
            hover:bg-white/20
            backdrop-blur-xl
            border border-white/20
            rounded-2xl
            px-6 py-3
            transition-all duration-200
            hover:scale-105
            active:scale-95
          "
        >
          <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
          <span className="font-semibold text-white">Volver</span>
        </button>

        <div className="text-center">
          <h1
            className="font-[family-name:var(--font-lilita)] text-4xl text-white tracking-wide"
            style={{
              textShadow: '0 2px 12px rgba(255, 255, 255, 0.3)',
            }}
          >
            🏛️ MUSEO DE LA CIENCIA
          </h1>
          <p className="text-white/60 text-sm mt-1">Noviembre 2025 • Explora las 4 salas</p>
        </div>

        <div className="w-32" /> {/* Spacer para centrar título */}
      </header>

      {/* Museo central con 4 puertas */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background con efecto de museo */}
        <div className="absolute inset-0">
          {/* Grid sutil de piso */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />

          {/* Luz central */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, transparent 70%)',
            }}
          />
        </div>

        {/* Las 4 puertas del museo */}
        <div className="relative w-full h-full">
          <MuseumDoor
            semana={SEMANAS_MES_CIENCIA[0]}
            position="top-left"
            onClick={() => handleSemanaClick(SEMANAS_MES_CIENCIA[0].id)}
          />
          <MuseumDoor
            semana={SEMANAS_MES_CIENCIA[1]}
            position="top-right"
            onClick={() => handleSemanaClick(SEMANAS_MES_CIENCIA[1].id)}
          />
          <MuseumDoor
            semana={SEMANAS_MES_CIENCIA[2]}
            position="bottom-left"
            onClick={() => handleSemanaClick(SEMANAS_MES_CIENCIA[2].id)}
          />
          <MuseumDoor
            semana={SEMANAS_MES_CIENCIA[3]}
            position="bottom-right"
            onClick={() => handleSemanaClick(SEMANAS_MES_CIENCIA[3].id)}
          />
        </div>

        {/* Mensaje central del Dr. Ciencia */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div
            className="backdrop-blur-xl border border-white/20 rounded-3xl px-8 py-4 flex items-center gap-4"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="text-6xl">👨‍🔬</div>
            <div>
              <p className="text-white font-semibold text-lg mb-1">Dr. Ciencia te da la bienvenida</p>
              <p className="text-white/70 text-sm">
                ¡Explora las 4 salas del museo y descubre los secretos de la ciencia! 🔬✨
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
