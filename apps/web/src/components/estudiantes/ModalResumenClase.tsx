'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { Trophy, Star, Target, TrendingUp, Clock, CheckCircle, Award, Zap, X } from 'lucide-react';

/**
 * T030 - Modal Resumen Post-Clase (Vista Estudiante)
 *
 * Features:
 * - Muestra resumen después de salir de clase
 * - Puntos ganados, insignias desbloqueadas
 * - Estadísticas de participación
 * - Animación de celebración
 */

export interface ResumenClase {
  claseNombre: string;
  duracionMinutos: number;
  puntosGanados: number;
  insigniasDesbloqueadas: {
    id: string;
    nombre: string;
    icono: string;
    descripcion: string;
  }[];
  estadisticas: {
    participacion: number; // porcentaje
    preguntasRespondidas: number;
    preguntasCorrectas: number;
    tiempoActivo: number; // minutos
  };
  mensajeDocente?: string;
  siguienteNivel?: {
    nivelActual: number;
    puntosParaSiguiente: number;
  };
}

interface ModalResumenClaseProps {
  resumen: ResumenClase;
  onClose: () => void;
}

export function ModalResumenClase({ resumen, onClose }: ModalResumenClaseProps) {
  const showConfetti = resumen.puntosGanados > 50;

  const participacionColor =
    resumen.estadisticas.participacion >= 80
      ? 'text-green-400'
      : resumen.estadisticas.participacion >= 50
        ? 'text-yellow-400'
        : 'text-orange-400';

  const tasaAcierto =
    resumen.estadisticas.preguntasRespondidas > 0
      ? (resumen.estadisticas.preguntasCorrectas / resumen.estadisticas.preguntasRespondidas) * 100
      : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}

        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl border-2 border-purple-500/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-t-3xl p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-black/20 hover:bg-black/40 transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                className="text-7xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                ¡Clase Completada!
              </h2>
              <p className="text-white/90 text-lg font-semibold">{resumen.claseNombre}</p>
              <div className="flex items-center justify-center gap-2 mt-2 text-white/80">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-semibold">{resumen.duracionMinutos} minutos</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Puntos Ganados */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border-2 border-yellow-500/50 text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <Star className="w-8 h-8 text-yellow-400" />
                <h3 className="text-2xl font-black text-white">+{resumen.puntosGanados} Puntos</h3>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
              <p className="text-yellow-400 text-sm font-semibold">
                ¡Excelente trabajo en la clase!
              </p>
            </motion.div>

            {/* Insignias Desbloqueadas */}
            {resumen.insigniasDesbloqueadas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">Insignias Desbloqueadas</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {resumen.insigniasDesbloqueadas.map((insignia, index) => (
                    <motion.div
                      key={insignia.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border-2 border-purple-500/50 flex items-center gap-3"
                    >
                      <div className="text-4xl">{insignia.icono}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-white truncate">
                          {insignia.nombre}
                        </h4>
                        <p className="text-xs text-gray-400 line-clamp-2">{insignia.descripcion}</p>
                      </div>
                      <Award className="w-6 h-6 text-pink-400 flex-shrink-0" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Estadísticas de Participación */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Estadísticas de la Clase</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Participación */}
                <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm font-semibold">Participación</span>
                    <Target className={`w-5 h-5 ${participacionColor}`} />
                  </div>
                  <div className="text-3xl font-black text-white mb-1">
                    {resumen.estadisticas.participacion}%
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${resumen.estadisticas.participacion}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full bg-gradient-to-r ${
                        resumen.estadisticas.participacion >= 80
                          ? 'from-green-500 to-emerald-500'
                          : resumen.estadisticas.participacion >= 50
                            ? 'from-yellow-500 to-orange-500'
                            : 'from-orange-500 to-red-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Tiempo Activo */}
                <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm font-semibold">Tiempo Activo</span>
                    <Clock className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="text-3xl font-black text-white">
                    {resumen.estadisticas.tiempoActivo} min
                  </div>
                  <p className="text-xs text-cyan-400 font-semibold">
                    de {resumen.duracionMinutos} min totales
                  </p>
                </div>

                {/* Preguntas Respondidas */}
                <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm font-semibold">Preguntas</span>
                    <CheckCircle className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-3xl font-black text-white mb-1">
                    {resumen.estadisticas.preguntasCorrectas}/
                    {resumen.estadisticas.preguntasRespondidas}
                  </div>
                  <p className="text-xs text-purple-400 font-semibold">
                    {tasaAcierto.toFixed(0)}% de aciertos
                  </p>
                </div>

                {/* Energía (Puntos/min) */}
                <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm font-semibold">Energía</span>
                    <Zap className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-3xl font-black text-white">
                    {resumen.estadisticas.tiempoActivo > 0
                      ? (resumen.puntosGanados / resumen.estadisticas.tiempoActivo).toFixed(1)
                      : 0}
                  </div>
                  <p className="text-xs text-yellow-400 font-semibold">puntos/minuto</p>
                </div>
              </div>
            </motion.div>

            {/* Mensaje del Docente */}
            {resumen.mensajeDocente && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-blue-500/20 rounded-2xl p-4 border-2 border-blue-500/50"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    👩‍🏫
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-400 mb-1">
                      Mensaje de tu profesor/a
                    </p>
                    <p className="text-white text-sm">{resumen.mensajeDocente}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Progreso Siguiente Nivel */}
            {resumen.siguienteNivel && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-4 border-2 border-purple-500/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold text-sm">
                    Progreso hacia Nivel {resumen.siguienteNivel.nivelActual + 1}
                  </span>
                  <span className="text-purple-400 text-sm font-semibold">
                    {resumen.siguienteNivel.puntosParaSiguiente} pts restantes
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(100, (resumen.puntosGanados / resumen.siguienteNivel.puntosParaSiguiente) * 100)}%`,
                    }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                </div>
              </motion.div>
            )}

            {/* Botón Cerrar */}
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all text-lg"
            >
              ¡Genial! Volver al Dashboard
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
