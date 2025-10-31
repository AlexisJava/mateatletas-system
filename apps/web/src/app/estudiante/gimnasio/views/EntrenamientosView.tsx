/**
 * Vista ENTRENAMIENTOS - Grid 3×4 de planificaciones mensuales 2025
 * Simetría perfecta: 4 columnas × 3 filas = 12 meses
 */

'use client';

import { motion } from 'framer-motion';
import { PlanificacionCardMensual } from '../components/overlays/PlanificacionCardMensual';
import { PLANIFICACIONES_2025 } from '../data/planificaciones';
import type { EntrenamientosViewProps } from './types/entrenamientos.types';

export function EntrenamientosView({ estudiante: _estudiante }: EntrenamientosViewProps) {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="relative h-20 flex items-center justify-center border-b border-white/10 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 flex-shrink-0">
        <h1 className="font-[family-name:var(--font-lilita)] text-4xl text-white tracking-wide drop-shadow-lg">
          🏋️ MIS ENTRENAMIENTOS 2025
        </h1>
      </div>

      {/* Grid Container - SIMETRÍA PERFECTA */}
      <div className="flex-1 p-8 overflow-y-auto">
        <motion.div
          className="grid grid-cols-4 gap-6 h-full"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.04, // 40ms entre cada card
              },
            },
          }}
        >
          {PLANIFICACIONES_2025.map((planificacion) => (
            <PlanificacionCardMensual key={planificacion.codigo} planificacion={planificacion} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
