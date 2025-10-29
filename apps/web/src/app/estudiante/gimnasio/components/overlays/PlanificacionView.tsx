/**
 * Vista de Planificación Individual - Mes de la Ciencia
 * FULLSCREEN (100vw × 100vh) con grid 2×2 de las 4 semanas temáticas
 * Estética Brawl Stars pura
 */

'use client';

import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
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
      // TODO: Toast notification
      console.info('¡Completa la semana anterior primero! 🔒');
      return;
    }

    push({
      type: 'actividad',
      actividadId: semanaId,
      planificacionCodigo: 'mes-ciencia-nov-2025',
    });
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950"
    >
      {/* Header FIJO (h-24) con Back Button + Stats */}
      <div className="relative h-24 flex-shrink-0 px-6 flex items-center border-b-4 border-black bg-gradient-to-r from-purple-900/50 to-indigo-900/50">
        {/* Back Button */}
        <button
          onClick={pop}
          className="
            bg-gradient-to-b from-cyan-400 to-blue-500
            border-[5px] border-black
            rounded-2xl
            w-14 h-14
            flex items-center justify-center
            shadow-[0_6px_0_rgba(0,0,0,0.4)]
            hover:translate-y-[-4px]
            hover:shadow-[0_10px_0_rgba(0,0,0,0.4)]
            active:translate-y-[2px]
            active:shadow-[0_2px_0_rgba(0,0,0,0.4)]
            flex-shrink-0
          "
          style={{ transition: 'none' }}
        >
          <ChevronLeft className="w-8 h-8 text-black" strokeWidth={4} />
        </button>

        {/* Título + Stats Horizontales */}
        <div className="flex-1 ml-6 flex items-center justify-between">
          {/* Título + Emoji */}
          <div className="flex items-center gap-3">
            <span className="text-5xl drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]">🔬</span>
            <div>
              <h1
                className="
                  font-[family-name:var(--font-lilita)]
                  text-3xl
                  font-black
                  uppercase
                  text-white
                  leading-none
                "
                style={{
                  textShadow: '0 4px 0 rgba(0,0,0,0.4)',
                  WebkitTextStroke: '3px black',
                  paintOrder: 'stroke fill',
                }}
              >
                MES DE LA CIENCIA
              </h1>
              <p
                className="text-sm font-black uppercase text-cyan-300 mt-1"
                style={{
                  textShadow: '0 2px 0 rgba(0,0,0,0.4)',
                  WebkitTextStroke: '1px black',
                }}
              >
                NOVIEMBRE 2025
              </p>
            </div>
          </div>

          {/* Stats Globales Compactos */}
          <div className="flex items-center gap-4">
            {/* Progress Badge */}
            <div className="bg-black/40 border-4 border-black rounded-xl px-4 py-2 flex items-center gap-2">
              <span
                className="text-2xl font-black text-white"
                style={{
                  WebkitTextStroke: '2px black',
                }}
              >
                {progresoGlobal}%
              </span>
            </div>

            {/* Actividades */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span
                className="text-lg font-black text-white"
                style={{
                  textShadow: '0 2px 0 rgba(0,0,0,0.4)',
                  WebkitTextStroke: '2px black',
                }}
              >
                {actividadesCompletadas}/{actividadesTotales}
              </span>
            </div>

            {/* Puntos */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <span
                className="text-lg font-black text-yellow-300"
                style={{
                  textShadow: '0 2px 0 rgba(0,0,0,0.4)',
                  WebkitTextStroke: '2px black',
                }}
              >
                {puntosGlobales}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2×2 de Semanas - h-[calc(100vh-6rem)] con SIMETRÍA PERFECTA */}
      <div className="flex-1 h-[calc(100vh-6rem)] flex items-center justify-center p-8 overflow-hidden">
        <motion.div
          className="grid grid-cols-2 gap-8 max-w-[1400px] w-full h-full"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          {SEMANAS_MES_CIENCIA.map((semana) => (
            <SemanaCard
              key={semana.id}
              semana={semana}
              onClick={() => handleSemanaClick(semana.id)}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
