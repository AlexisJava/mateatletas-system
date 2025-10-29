/**
 * Vista de Planificación Individual - Mes de la Ciencia
 * Grid 2×2 con las 4 semanas temáticas
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
    <div className="w-full h-full flex flex-col overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
      {/* Header con Back Button + Stats */}
      <div className="relative flex-shrink-0 p-6 border-b-4 border-black bg-gradient-to-r from-purple-900/50 to-indigo-900/50">
        {/* Back Button */}
        <button
          onClick={pop}
          className="
            absolute top-6 left-6
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
          "
          style={{ transition: 'none' }}
        >
          <ChevronLeft className="w-8 h-8 text-black" strokeWidth={4} />
        </button>

        {/* Título */}
        <div className="ml-20">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-6xl drop-shadow-[0_6px_0_rgba(0,0,0,0.3)]">🔬</span>
            <h1
              className="
                font-[family-name:var(--font-lilita)]
                text-5xl
                font-black
                uppercase
                text-white
              "
              style={{
                textShadow: '0 6px 0 rgba(0,0,0,0.4)',
                WebkitTextStroke: '4px black',
                paintOrder: 'stroke fill',
              }}
            >
              MES DE LA CIENCIA
            </h1>
          </div>

          <p
            className="
            text-xl
            font-black
            uppercase
            text-cyan-300
            mb-4
          "
            style={{
              textShadow: '0 3px 0 rgba(0,0,0,0.4)',
              WebkitTextStroke: '2px black',
            }}
          >
            NOVIEMBRE 2025
          </p>

          {/* Progress Bar Global */}
          <div
            className="
            w-full
            max-w-2xl
            h-10
            bg-black/40
            border-4 border-black
            rounded-2xl
            overflow-hidden
            relative
            mb-3
          "
          >
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${progresoGlobal}%` }}
              transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
            />
            <span
              className="
              absolute
              inset-0
              flex items-center justify-center
              text-2xl font-black text-white
            "
              style={{
                WebkitTextStroke: '3px black',
              }}
            >
              {progresoGlobal}%
            </span>
          </div>

          {/* Stats Globales */}
          <div className="flex items-center gap-6">
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
                {actividadesCompletadas}/{actividadesTotales} ACT
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
                {puntosGlobales} PTS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2×2 de Semanas - SIMETRÍA PERFECTA */}
      <div className="flex-1 p-8 overflow-y-auto">
        <motion.div
          className="grid grid-cols-2 gap-8 max-w-6xl mx-auto"
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
    </div>
  );
}
