/**
 * Vista de Planificación Individual - Mes de la Ciencia
 * ESTILO: GIMNASIO (glassmorphism) + ACENTOS Brawl (colores vibrantes sutiles)
 * FULLSCREEN (100vw × 100vh) con grid 2×2 de las 4 semanas temáticas
 */

'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useOverlayStack } from '../../contexts/OverlayStackProvider';
import { SemanaCard } from './SemanaCard';
import { SEMANAS_MES_CIENCIA } from '../../data/semanas-mes-ciencia';
import type { OverlayConfig } from '../../types/overlay.types';

export interface PlanificacionViewProps {
  config?: OverlayConfig;
  estudiante?: {
    nombre: string;
    id?: string;
  };
}

export function PlanificacionView({ config, estudiante }: PlanificacionViewProps) {
  const { pop, push } = useOverlayStack();

  // Calcular progreso global
  const progresoGlobal = Math.round(
    SEMANAS_MES_CIENCIA.reduce((acc, s) => acc + s.progreso, 0) / SEMANAS_MES_CIENCIA.length
  );
  const actividadesCompletadas = SEMANAS_MES_CIENCIA.reduce(
    (acc, s) => acc + (s.progreso === 100 ? 1 : 0),
    0
  );
  const actividadesTotales = SEMANAS_MES_CIENCIA.length * 4; // 4 actividades por semana
  const puntosGlobales = SEMANAS_MES_CIENCIA.reduce((acc, s) => acc + s.puntos, 0);

  const handleSemanaClick = (semanaId: string) => {
    const semana = SEMANAS_MES_CIENCIA.find((s) => s.id === semanaId);

    if (!semana) return;

    if (semana.estado === 'bloqueada') {
      console.info('¡Completa la semana anterior primero! 🔒');
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
        background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
      }}
    >
      {/* Header estilo GIMNASIO */}
      <header
        className="
          h-20
          backdrop-blur-xl
          border-b border-white/10
          px-8
          flex items-center justify-between
        "
        style={{
          background: 'linear-gradient(to right, rgba(6, 182, 212, 0.2), rgba(37, 99, 235, 0.2))',
        }}
      >
        {/* Botón volver - mismo estilo que gimnasio */}
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

        {/* Título central */}
        <div className="text-center">
          <h1
            className="font-[family-name:var(--font-lilita)] text-4xl text-white tracking-wide uppercase"
            style={{
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            🔬 MES DE LA CIENCIA
          </h1>
          <p className="text-white/70 text-sm mt-1">Noviembre 2025</p>
        </div>

        {/* Stats globales */}
        <div className="flex items-center gap-4">
          {/* Progress % */}
          <div
            className="
              bg-white/10
              backdrop-blur-xl
              border border-white/20
              rounded-xl
              px-4 py-2
            "
          >
            <span className="text-white font-bold text-lg">{progresoGlobal}%</span>
          </div>

          {/* Actividades completadas */}
          <div
            className="
              bg-white/10
              backdrop-blur-xl
              border border-white/20
              rounded-xl
              px-4 py-2
              flex items-center gap-2
            "
          >
            <span className="text-lg">✓</span>
            <span className="text-white font-bold">
              {actividadesCompletadas}/{actividadesTotales}
            </span>
          </div>

          {/* Puntos */}
          <div
            className="
              bg-white/10
              backdrop-blur-xl
              border border-white/20
              rounded-xl
              px-4 py-2
              flex items-center gap-2
            "
          >
            <span className="text-lg">🏆</span>
            <span className="text-white font-bold">{puntosGlobales}</span>
          </div>
        </div>
      </header>

      {/* Grid 2×2 de Semanas */}
      <div className="flex-1 h-[calc(100vh-5rem)] flex items-center justify-center p-12 overflow-hidden">
        <motion.div
          className="grid grid-cols-2 gap-8 max-w-6xl w-full"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {SEMANAS_MES_CIENCIA.map((semana) => (
            <SemanaCard key={semana.id} semana={semana} onClick={() => handleSemanaClick(semana.id)} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
