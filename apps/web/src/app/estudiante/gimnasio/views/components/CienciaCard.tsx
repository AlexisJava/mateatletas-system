/**
 * Card de una ciencia del Mes de la Ciencia
 * Muestra: título, descripción, progreso, estrellas, puntos
 */

'use client';

import { motion } from 'framer-motion';
import { Star, Clock, Trophy } from 'lucide-react';
import type { CienciaCardProps } from '../types/entrenamientos.types';
import { MAX_ESTRELLAS_POR_CIENCIA } from '../constants/ciencias.constants';

export function CienciaCard({ ciencia, onClick, className = '' }: CienciaCardProps) {
  const { metadatos, progreso } = ciencia;

  // Calcular estrellas vacías
  const estrellasVacias = MAX_ESTRELLAS_POR_CIENCIA - progreso.estrellas;

  // Formatear tiempo (minutos a horas si >60)
  const formatearTiempo = (minutos: number): string => {
    if (minutos < 60) return `${minutos}min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`
        relative
        bg-gradient-to-br ${metadatos.gradient}
        rounded-3xl p-6
        flex flex-col
        shadow-xl hover:shadow-2xl
        border-4 border-white/20
        transition-shadow duration-200
        text-left
        ${className}
      `}
    >
      {/* Badge de progreso (esquina superior derecha) */}
      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 border-2 border-white/30">
        <span className="text-white text-xs font-black">
          {progreso.progresoPorcentaje}%
        </span>
      </div>

      {/* Emoji grande */}
      <div className="text-6xl mb-4">
        {metadatos.emoji}
      </div>

      {/* Título */}
      <h3 className="text-2xl font-black text-white mb-2 uppercase">
        {metadatos.titulo}
      </h3>

      {/* Descripción */}
      <p className="text-white/90 text-sm font-medium mb-4 flex-1">
        {metadatos.descripcion}
      </p>

      {/* Barra de progreso */}
      <div className="mb-4">
        <div className="h-3 bg-black/30 rounded-full overflow-hidden border-2 border-white/20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progreso.progresoPorcentaje}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500"
          />
        </div>
        <p className="text-white/80 text-xs font-bold mt-1">
          {progreso.actividadesCompletadas} / {progreso.actividadesTotales} actividades
        </p>
      </div>

      {/* Estrellas */}
      <div className="flex items-center gap-1 mb-3">
        {/* Estrellas ganadas */}
        {Array.from({ length: progreso.estrellas }).map((_, i) => (
          <Star
            key={`filled-${i}`}
            className="w-5 h-5 fill-yellow-400 text-yellow-400"
          />
        ))}
        {/* Estrellas vacías */}
        {Array.from({ length: estrellasVacias }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className="w-5 h-5 text-white/30"
          />
        ))}
      </div>

      {/* Stats inferiores */}
      <div className="flex items-center justify-between text-white/80">
        {/* Tiempo invertido */}
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-bold">
            {formatearTiempo(progreso.tiempoInvertidoMinutos)}
          </span>
        </div>

        {/* Puntos ganados */}
        <div className="flex items-center gap-1">
          <Trophy className="w-4 h-4" />
          <span className="text-xs font-black text-yellow-300">
            {progreso.puntosGanados} pts
          </span>
        </div>
      </div>

      {/* Badge "COMPLETADA" si está al 100% */}
      {progreso.progresoPorcentaje === 100 && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full px-4 py-2 border-3 border-white shadow-xl">
          <span className="text-white text-xs font-black uppercase">
            ✓ Completada
          </span>
        </div>
      )}
    </motion.button>
  );
}
