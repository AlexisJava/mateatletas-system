/**
 * Vista de Entrenamientos - Mes de la Ciencia (Noviembre 2025)
 * Muestra las 4 ciencias disponibles: Química, Astronomía, Física, Informática
 */

'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Target } from 'lucide-react';
import type { EntrenamientosViewProps } from './types/entrenamientos.types';
import { useEntrenamientos } from './hooks/useEntrenamientos';
import { CienciaCard } from './components/CienciaCard';
import { useOverlayStack } from '../contexts/OverlayStackProvider';
import type { PlanificacionTema } from '../types/overlay.types';

export function EntrenamientosView({ estudiante }: EntrenamientosViewProps) {
  const { push } = useOverlayStack();
  const { ciencias, estadisticas, isLoading, error } = useEntrenamientos(estudiante.id);

  // Manejar click en una ciencia - Push overlay de planificación
  const handleCienciaClick = (codigo: string) => {
    // Extraer tema del código (ej: "2025-11-mes-ciencia-astronomia" → "astronomia")
    const tema = codigo.split('-').pop() as PlanificacionTema;

    push({
      type: 'planificacion',
      codigo,
      tema,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-bold">Cargando entrenamientos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="bg-red-500/20 border-2 border-red-500 rounded-3xl p-8 max-w-md">
          <p className="text-white text-lg font-bold mb-2">Error al cargar entrenamientos</p>
          <p className="text-white/80 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-8 flex flex-col overflow-y-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-10 h-10 text-yellow-400" />
          <h1 className="text-5xl font-black text-white font-[family-name:var(--font-lilita)]">
            MES DE LA CIENCIA
          </h1>
        </div>
        <p className="text-white/80 text-xl font-bold">
          Noviembre 2025 • Explora 4 aventuras científicas increíbles
        </p>
      </motion.div>

      {/* Grid 2x2 con las 4 ciencias */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {ciencias.map((ciencia, index) => (
          <motion.div
            key={ciencia.metadatos.codigo}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <CienciaCard
              ciencia={ciencia}
              onClick={() => handleCienciaClick(ciencia.metadatos.codigo)}
              className="h-full"
            />
          </motion.div>
        ))}
      </div>

      {/* Stats globales del mes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border-2 border-white/20"
      >
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-8 h-8 text-white" />
          <h3 className="text-2xl font-black text-white">Tu Progreso en el Mes</h3>
        </div>

        {/* Barra de progreso global */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-bold">Progreso Global</span>
            <span className="text-white text-2xl font-black">
              {estadisticas.progresoGlobalPorcentaje}%
            </span>
          </div>
          <div className="h-4 bg-black/30 rounded-full overflow-hidden border-2 border-white/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${estadisticas.progresoGlobalPorcentaje}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
            />
          </div>
        </div>

        {/* Stats en grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Actividades completadas */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">✅</span>
              <span className="text-white/70 text-sm font-bold">Actividades</span>
            </div>
            <p className="text-white text-3xl font-black">
              {estadisticas.totalActividadesCompletadas}/{estadisticas.totalActividades}
            </p>
          </div>

          {/* Puntos ganados */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🏆</span>
              <span className="text-white/70 text-sm font-bold">Puntos Ganados</span>
            </div>
            <p className="text-yellow-400 text-3xl font-black">{estadisticas.totalPuntosGanados}</p>
          </div>

          {/* Tiempo invertido */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">⏱️</span>
              <span className="text-white/70 text-sm font-bold">Tiempo Total</span>
            </div>
            <p className="text-white text-3xl font-black">
              {Math.floor(estadisticas.totalTiempoInvertidoMinutos / 60)}h{' '}
              {estadisticas.totalTiempoInvertidoMinutos % 60}min
            </p>
          </div>

          {/* Estrellas ganadas */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">⭐</span>
              <span className="text-white/70 text-sm font-bold">Estrellas</span>
            </div>
            <p className="text-white text-3xl font-black">{estadisticas.estrellasGanadas}/16</p>
          </div>
        </div>

        {/* Mensaje motivacional */}
        <div className="mt-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-4 border border-purple-400/30">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-purple-300" />
            <p className="text-white text-sm font-bold">
              {estadisticas.cienciasCompletadas > 0
                ? `¡Increíble! Has completado ${estadisticas.cienciasCompletadas} ${
                    estadisticas.cienciasCompletadas === 1 ? 'ciencia' : 'ciencias'
                  }. Sigue así! 🚀`
                : '¡Comienza tu aventura científica ahora! 🔬'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
