/**
 * MES DE LA CIENCIA - CALIDAD PS5
 * Brutal, simétrico, pulido. Iluminación realista, glassmorphism avanzado.
 * NO circo de animaciones, solo micro-interacciones premium.
 */

'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowLeft, Lock, Sparkles } from 'lucide-react';
import { useOverlayStack } from '../../contexts/OverlayStackProvider';
import { SEMANAS_MES_CIENCIA } from '../../data/semanas-mes-ciencia';
import type { OverlayConfig } from '../../types/overlay.types';
import type { Semana } from '../../data/semanas-mes-ciencia';
import { useState } from 'react';
import {
  ChemistryIllustration,
  AstronomyIllustration,
  PhysicsIllustration,
  InformaticsIllustration,
} from './IllustrationsScience';

export interface PlanificacionViewProps {
  config?: OverlayConfig;
  estudiante?: {
    nombre: string;
    id?: string;
  };
}

/**
 * Partículas de fondo temáticas sutiles
 */
function ParticleBackground({ tema }: { tema: 'quimica' | 'astronomia' | 'fisica' | 'informatica' }) {
  const particles = Array.from({ length: 20 });

  const config = {
    quimica: { emoji: '💧', color: '#10b981' },
    astronomia: { emoji: '✨', color: '#a855f7' },
    fisica: { emoji: '⚡', color: '#f97316' },
    informatica: { emoji: '💠', color: '#06b6d4' },
  };

  const { emoji, color } = config[tema];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          initial={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            opacity: 0.3,
          }}
          animate={{
            y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 2,
          }}
          style={{
            filter: `drop-shadow(0 0 8px ${color})`,
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Card PS5 con 3D hover effect sutil
 */
interface PS5CardProps {
  semana: Semana;
  onClick: () => void;
  index: number;
  onHoverChange: (theme: 'quimica' | 'astronomia' | 'fisica' | 'informatica' | null) => void;
}

function PS5Card({ semana, onClick, index, onHoverChange }: PS5CardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const esBloqueada = semana.estado === 'bloqueada';
  const esNueva = semana.estado === 'disponible' && semana.progreso === 0;

  // Rotación 3D sutil basada en mouse
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (esBloqueada) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
    onHoverChange(null);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!esBloqueada) {
      onHoverChange(semana.tema);
    }
  };

  // Colores premium con depth
  const cardStyles = {
    quimica: {
      bg: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
      accent: '#34d399',
      glow: 'rgba(16, 185, 129, 0.6)',
      rim: 'rgba(52, 211, 153, 0.8)',
    },
    astronomia: {
      bg: 'linear-gradient(145deg, #a855f7 0%, #7e22ce 100%)',
      accent: '#c084fc',
      glow: 'rgba(168, 85, 247, 0.6)',
      rim: 'rgba(192, 132, 252, 0.8)',
    },
    fisica: {
      bg: 'linear-gradient(145deg, #f97316 0%, #ea580c 100%)',
      accent: '#fb923c',
      glow: 'rgba(249, 115, 22, 0.6)',
      rim: 'rgba(251, 146, 60, 0.8)',
    },
    informatica: {
      bg: 'linear-gradient(145deg, #06b6d4 0%, #0891b2 100%)',
      accent: '#22d3ee',
      glow: 'rgba(6, 182, 212, 0.6)',
      rim: 'rgba(34, 211, 238, 0.8)',
    },
  };

  const style = cardStyles[semana.tema];

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.12,
        type: 'spring',
        stiffness: 200,
        damping: 20,
        opacity: { duration: 0.4 }
      }}
      style={{
        perspective: 1000,
      }}
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={!esBloqueada ? onClick : undefined}
        className={`
          relative
          w-72
          h-[500px]
          rounded-3xl
          overflow-hidden
          ${esBloqueada ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        style={{
          rotateX: !esBloqueada ? rotateX : 0,
          rotateY: !esBloqueada ? rotateY : 0,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
        }}
        whileHover={!esBloqueada ? { y: -12, scale: 1.03 } : undefined}
        whileTap={!esBloqueada ? { scale: 0.97 } : undefined}
      >
        {/* Contenedor principal con glassmorphism premium */}
        <div
          className="relative w-full h-full rounded-3xl overflow-hidden"
          style={{
            background: esBloqueada
              ? 'linear-gradient(145deg, #2d3748 0%, #1a202c 100%)'
              : style.bg,
            boxShadow: esBloqueada
              ? '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : `
                  0 25px 80px ${style.glow},
                  0 10px 40px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                `,
            border: `1px solid ${esBloqueada ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'}`,
          }}
        >
          {/* Rim light superior (luz ambiente PS5) */}
          {!esBloqueada && (
            <div
              className="absolute top-0 left-0 right-0 h-1 opacity-60"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${style.rim} 50%, transparent 100%)`,
                filter: 'blur(2px)',
              }}
            />
          )}

          {/* Glow pulsante sutil en card disponible */}
          {esNueva && !esBloqueada && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                background: `radial-gradient(circle at 50% 30%, ${style.glow} 0%, transparent 70%)`,
              }}
            />
          )}

          {/* Badge NUEVA - más sutil y premium */}
          {esNueva && !esBloqueada && (
            <div className="absolute top-4 right-4 z-20">
              <motion.div
                className="relative"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div
                  className="backdrop-blur-xl rounded-full px-4 py-1.5 flex items-center gap-2 border"
                  style={{
                    background: 'rgba(251, 191, 36, 0.15)',
                    borderColor: 'rgba(251, 191, 36, 0.4)',
                    boxShadow: '0 4px 20px rgba(251, 191, 36, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" strokeWidth={2.5} />
                  <span className="text-xs font-bold text-yellow-100 uppercase tracking-wider">Nueva</span>
                </div>
              </motion.div>
            </div>
          )}

          {/* Sección superior - Ilustración */}
          <div className="relative h-64 flex items-center justify-center overflow-hidden">
            {/* Gradient overlay superior */}
            <div
              className="absolute inset-0 z-10"
              style={{
                background: esBloqueada
                  ? 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.3) 100%)',
              }}
            />

            {/* Partículas de fondo */}
            {!esBloqueada && isHovered && <ParticleBackground tema={semana.tema} />}

            {/* Lock overlay para bloqueadas */}
            {esBloqueada && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-20">
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Lock className="w-24 h-24 text-white/30" strokeWidth={1.5} />
                  </motion.div>
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                      filter: 'blur(10px)',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Ilustración SVG animada */}
            <motion.div
              className="relative z-10"
              animate={
                !esBloqueada && isHovered
                  ? {
                      y: [0, -8, 0],
                      scale: [1, 1.05, 1],
                    }
                  : { y: 0, scale: 1 }
              }
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                filter: esBloqueada
                  ? 'grayscale(100%) brightness(0.5)'
                  : `drop-shadow(0 10px 25px ${style.glow}) drop-shadow(0 0 40px ${style.glow})`,
              }}
            >
              {semana.tema === 'quimica' && (
                <ChemistryIllustration
                  isActive={!esBloqueada}
                  primaryColor={style.accent}
                  accentColor={style.accent}
                />
              )}
              {semana.tema === 'astronomia' && (
                <AstronomyIllustration
                  isActive={!esBloqueada}
                  primaryColor={style.accent}
                  accentColor={style.accent}
                />
              )}
              {semana.tema === 'fisica' && (
                <PhysicsIllustration
                  isActive={!esBloqueada}
                  primaryColor={style.accent}
                  accentColor={style.accent}
                />
              )}
              {semana.tema === 'informatica' && (
                <InformaticsIllustration
                  isActive={!esBloqueada}
                  primaryColor={style.accent}
                  accentColor={style.accent}
                />
              )}
            </motion.div>

            {/* Rim light desde abajo del emoji */}
            {!esBloqueada && (
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20 opacity-40 blur-2xl"
                style={{
                  background: `radial-gradient(ellipse, ${style.accent} 0%, transparent 70%)`,
                }}
              />
            )}
          </div>

          {/* Separador sutil */}
          <div
            className="h-px"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${esBloqueada ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'} 50%, transparent 100%)`,
            }}
          />

          {/* Sección inferior - Info */}
          <div
            className="relative h-[236px] p-6 flex flex-col"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)',
            }}
          >
            {/* Título */}
            <h3
              className="font-[family-name:var(--font-lilita)] text-3xl text-white text-center mb-5 leading-tight"
              style={{
                textShadow: '0 4px 12px rgba(0, 0, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.4)',
                letterSpacing: '0.02em',
              }}
            >
              {semana.titulo}
            </h3>

            {/* Progress circular premium */}
            <div className="flex justify-center mb-5">
              <div className="relative w-24 h-24">
                {/* Shadow base */}
                <div
                  className="absolute inset-0 rounded-full blur-md"
                  style={{
                    background: esBloqueada ? 'rgba(0,0,0,0.3)' : `${style.glow}`,
                    opacity: 0.5,
                  }}
                />
                {/* SVG Progress */}
                <svg className="w-24 h-24 transform -rotate-90 relative z-10">
                  {/* Track */}
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Progress */}
                  <motion.circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke={esBloqueada ? 'rgba(255, 255, 255, 0.2)' : style.accent}
                    strokeWidth="5"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - semana.progreso / 100) }}
                    transition={{ duration: 1.8, delay: 0.4 + index * 0.1, ease: 'easeOut' }}
                    strokeLinecap="round"
                    style={{
                      filter: esBloqueada ? 'none' : `drop-shadow(0 0 8px ${style.glow})`,
                    }}
                  />
                </svg>
                {/* Percentage text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-white font-black text-2xl"
                    style={{
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
                    }}
                  >
                    {semana.progreso}%
                  </span>
                </div>
              </div>
            </div>

            {/* Stats eliminados - se tapaban con otras cards */}

            {/* Badge de estado premium */}
            <div className="mt-auto">
              {esBloqueada && (
                <div
                  className="w-full backdrop-blur-xl rounded-2xl py-3 flex items-center justify-center gap-2.5 border"
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Lock className="w-4 h-4 text-red-300" strokeWidth={2.5} />
                  <span className="text-red-200 font-bold text-sm uppercase tracking-widest">Bloqueada</span>
                </div>
              )}
              {!esBloqueada && semana.estado === 'disponible' && (
                <div
                  className="w-full backdrop-blur-xl rounded-2xl py-3 flex items-center justify-center gap-2.5 border"
                  style={{
                    background: `linear-gradient(135deg, ${style.accent}22 0%, ${style.accent}11 100%)`,
                    borderColor: `${style.accent}66`,
                    boxShadow: `0 4px 20px ${style.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
                  <span className="text-white font-bold text-sm uppercase tracking-widest">Disponible</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function PlanificacionView({ config, estudiante }: PlanificacionViewProps) {
  const { pop, push } = useOverlayStack();
  const [hoveredTheme, setHoveredTheme] = useState<'quimica' | 'astronomia' | 'fisica' | 'informatica' | null>(null);

  const handleSemanaClick = (semanaId: string) => {
    const semana = SEMANAS_MES_CIENCIA.find((s) => s.id === semanaId);

    if (!semana || semana.estado === 'bloqueada') {
      return;
    }

    // Si es Laboratorio Mágico (química), ir al ecosistema LearnDash
    if (semanaId === 'quimica') {
      push({
        type: 'laboratorio-ecosistema',
        semanaId: semanaId,
      });
    } else {
      // Para los demás, grid 2×2 de actividades
      push({
        type: 'actividad',
        semanaId: semanaId,
      });
    }
  };

  // Backgrounds dinámicos según el tema hovereado - MUY SUTILES
  const backgroundsByTheme = {
    quimica: 'linear-gradient(135deg, #0f172a 0%, #064e3b 25%, #065f46 50%, #064e3b 75%, #0f172a 100%)',
    astronomia: 'linear-gradient(135deg, #0f172a 0%, #581c87 25%, #6b21a8 50%, #581c87 75%, #0f172a 100%)',
    fisica: 'linear-gradient(135deg, #0f172a 0%, #7c2d12 25%, #9a3412 50%, #7c2d12 75%, #0f172a 100%)',
    informatica: 'linear-gradient(135deg, #0f172a 0%, #164e63 25%, #0e7490 50%, #164e63 75%, #0f172a 100%)',
    default: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
  };

  const currentBackground = hoveredTheme ? backgroundsByTheme[hoveredTheme] : backgroundsByTheme.default;

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      {/* Background animado que cambia con hover - TRANSICIÓN ULTRA SUAVE */}
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{
          background: backgroundsByTheme.default,
        }}
        animate={{
          background: currentBackground,
        }}
        transition={{
          duration: 1.2,
          ease: [0.25, 0.1, 0.25, 1.0]
        }}
      />

      {/* Capa de difusión radial para hacer el cambio más orgánico */}
      <motion.div
        className="absolute inset-0 -z-10 blur-3xl"
        initial={{ opacity: 0 }}
        animate={{
          opacity: hoveredTheme ? 0.3 : 0,
        }}
        transition={{
          duration: 1.5,
          ease: [0.25, 0.1, 0.25, 1.0]
        }}
        style={{
          background: hoveredTheme
            ? `radial-gradient(circle at 50% 50%, ${
                hoveredTheme === 'quimica' ? '#10b981' :
                hoveredTheme === 'astronomia' ? '#a855f7' :
                hoveredTheme === 'fisica' ? '#f97316' :
                '#06b6d4'
              } 0%, transparent 60%)`
            : 'transparent',
        }}
      />

      {/* Ambient lighting grid - SOLO GRID, SIN CÍRCULOS DE COLOR */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px, 80px 80px',
        }}
      />

      {/* Header premium */}
      <header
        className="relative h-24 backdrop-blur-2xl border-b px-10 flex items-center justify-between"
        style={{
          background: 'rgba(0, 0, 0, 0.2)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
        }}
      >
        <button
          onClick={pop}
          className="group flex items-center gap-3 backdrop-blur-xl rounded-2xl px-7 py-3.5 border transition-all duration-200"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          <ArrowLeft className="w-5 h-5 text-white transition-transform group-hover:-translate-x-1" strokeWidth={2.5} />
          <span className="font-bold text-white text-sm uppercase tracking-wider">Volver</span>
        </button>

        <div className="text-center">
          <h1
            className="font-[family-name:var(--font-lilita)] text-5xl text-white tracking-wide uppercase mb-1"
            style={{
              textShadow: '0 4px 20px rgba(255, 255, 255, 0.2), 0 2px 8px rgba(0, 0, 0, 0.6)',
              letterSpacing: '0.05em',
            }}
          >
            MES DE LA CIENCIA
          </h1>
          <p
            className="text-cyan-300 text-sm font-bold uppercase tracking-widest"
            style={{
              textShadow: '0 2px 8px rgba(6, 182, 212, 0.5)',
            }}
          >
            Noviembre 2025
          </p>
        </div>

        <div className="w-32" />
      </header>

      {/* Carrusel centrado */}
      <div className="flex-1 flex items-center justify-center px-8 py-10">
        <div className="flex gap-7 items-center justify-center max-w-[1400px]">
          {SEMANAS_MES_CIENCIA.map((semana, index) => (
            <PS5Card
              key={semana.id}
              semana={semana}
              onClick={() => handleSemanaClick(semana.id)}
              index={index}
              onHoverChange={setHoveredTheme}
            />
          ))}
        </div>
      </div>

      {/* Footer con Dr. Ciencia - OCULTO TEMPORALMENTE */}
      {/* <motion.div
        className="pb-10 px-10 flex justify-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div
          className="backdrop-blur-2xl rounded-3xl px-10 py-5 flex items-center gap-5 max-w-3xl border"
          style={{
            background: 'rgba(0, 0, 0, 0.2)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          <div
            className="text-7xl"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.4))',
            }}
          >
            👨‍🔬
          </div>
          <div>
            <p
              className="text-white font-bold text-xl mb-1"
              style={{
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
              }}
            >
              Dr. Ciencia
            </p>
            <p
              className="text-white/80 text-sm leading-relaxed"
              style={{
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)',
              }}
            >
              Elige una sala para comenzar tu aventura científica y descubrir nuevos experimentos.
            </p>
          </div>
        </div>
      </motion.div> */}
    </div>
  );
}
