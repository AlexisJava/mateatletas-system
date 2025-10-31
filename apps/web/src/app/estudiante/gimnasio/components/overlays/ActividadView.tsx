/**
 * Vista de Actividades de una Semana
 * FULLSCREEN (100vw × 100vh) con grid 2×2 de las 4 actividades
 * Estética Brawl Stars pura
 */

'use client';

import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useOverlayStack } from '../../contexts/OverlayStackProvider';
import { ActividadCard } from './ActividadCard';
import { getActividadesBySemana, getEstadisticasSemana } from '../../data/actividades-mes-ciencia';
import { TEMA_COLORS } from '../../data/semanas-mes-ciencia';
import type { OverlayConfig } from '../../types/overlay.types';
import type { TemaCiencia } from '../../data/semanas-mes-ciencia';

export interface ActividadViewProps {
  config?: OverlayConfig & { type: 'actividad'; semanaId: string };
  estudiante?: {
    nombre: string;
    id?: string;
  };
}

export function ActividadView({ config, estudiante: _estudiante }: ActividadViewProps) {
  const { pop, push } = useOverlayStack();

  if (!config || config.type !== 'actividad') {
    return null;
  }

  const semanaId = config.semanaId as TemaCiencia;
  const actividades = getActividadesBySemana(semanaId);
  const stats = getEstadisticasSemana(semanaId);
  const colors = TEMA_COLORS[semanaId];

  // Metadata de cada semana
  const SEMANA_METADATA: Record<TemaCiencia, { titulo: string; emoji: string }> = {
    quimica: { titulo: 'QUÍMICA', emoji: '🧪' },
    astronomia: { titulo: 'ASTRONOMÍA', emoji: '🌌' },
    fisica: { titulo: 'FÍSICA', emoji: '⚡' },
    informatica: { titulo: 'INFORMÁTICA', emoji: '💻' },
  };

  const metadata = SEMANA_METADATA[semanaId];

  const handleActividadClick = (actividadId: string) => {
    const actividad = actividades.find((a) => a.id === actividadId);

    if (!actividad) return;

    if (actividad.estado === 'bloqueada') {
      // TODO: Toast notification
      console.info('¡Completa la actividad anterior primero! 🔒');
      return;
    }

    push({
      type: 'ejecutar-actividad',
      actividadId,
      semanaId,
    });
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className={`
        fixed inset-0 z-50 flex flex-col overflow-hidden
        bg-gradient-to-br ${colors.gradient.replace('from-', 'from-').replace(' to-', '/90 to-')}/90
        backdrop-blur-sm
      `}
    >
      {/* Header FIJO (h-24) con Back Button + Stats */}
      <div
        className="relative h-24 flex-shrink-0 px-6 flex items-center border-b-4 border-black"
        style={{
          backgroundColor: `${colors.border}33`,
        }}
      >
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
            <span className="text-5xl drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]">{metadata.emoji}</span>
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
                {metadata.titulo}
              </h1>
              <p
                className="text-sm font-black uppercase text-cyan-300 mt-1"
                style={{
                  textShadow: '0 2px 0 rgba(0,0,0,0.4)',
                  WebkitTextStroke: '1px black',
                }}
              >
                4 ACTIVIDADES
              </p>
            </div>
          </div>

          {/* Stats Compactos */}
          <div className="flex items-center gap-4">
            {/* Progress Badge */}
            <div className="bg-black/40 border-4 border-black rounded-xl px-4 py-2 flex items-center gap-2">
              <span
                className="text-2xl font-black text-white"
                style={{
                  WebkitTextStroke: '2px black',
                }}
              >
                {stats.progreso}%
              </span>
            </div>

            {/* Actividades completadas */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span
                className="text-lg font-black text-white"
                style={{
                  textShadow: '0 2px 0 rgba(0,0,0,0.4)',
                  WebkitTextStroke: '2px black',
                }}
              >
                {stats.completadas}/{stats.total}
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
                {stats.puntosObtenidos}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2×2 de Actividades - h-[calc(100vh-6rem)] con SIMETRÍA PERFECTA */}
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
          {actividades.map((actividad) => (
            <ActividadCard
              key={actividad.id}
              actividad={actividad}
              onClick={() => handleActividadClick(actividad.id)}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
