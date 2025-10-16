'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Trophy, CheckCircle, Users } from 'lucide-react';
import apiClient from '@/lib/axios';

/**
 * T044 - Asignación Rápida de Insignias Durante Clase
 *
 * Features:
 * - Modal flotante durante clase en vivo
 * - Selección rápida de estudiante
 * - Galería de insignias predefinidas
 * - Asignación instantánea
 * - Feedback visual inmediato
 */

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  avatar_url: string;
}

interface Insignia {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  puntos: number;
  color: string;
}

const INSIGNIAS_PREDEFINIDAS: Insignia[] = [
  {
    id: 'participacion',
    nombre: 'Participación Activa',
    icono: '🎤',
    descripcion: 'Por participar activamente en clase',
    puntos: 20,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'respuesta-correcta',
    nombre: 'Respuesta Brillante',
    icono: '💡',
    descripcion: 'Por dar una respuesta correcta',
    puntos: 15,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'ayuda-companero',
    nombre: 'Compañero Solidario',
    icono: '🤝',
    descripcion: 'Por ayudar a un compañero',
    puntos: 25,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'creatividad',
    nombre: 'Mente Creativa',
    icono: '🎨',
    descripcion: 'Por una solución creativa',
    puntos: 30,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'perseverancia',
    nombre: 'Perseverante',
    icono: '💪',
    descripcion: 'Por no rendirse ante un problema difícil',
    puntos: 25,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'trabajo-equipo',
    nombre: 'Equipo Estrella',
    icono: '⭐',
    descripcion: 'Por excelente trabajo en equipo',
    puntos: 35,
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'pregunta-inteligente',
    nombre: 'Pregunta Inteligente',
    icono: '❓',
    descripcion: 'Por hacer una pregunta muy acertada',
    puntos: 15,
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'mejora',
    nombre: 'Súper Mejora',
    icono: '📈',
    descripcion: 'Por mostrar gran mejora',
    puntos: 40,
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'esfuerzo',
    nombre: 'Gran Esfuerzo',
    icono: '🌟',
    descripcion: 'Por el esfuerzo demostrado',
    puntos: 20,
    color: 'from-amber-500 to-yellow-500'
  }
];

interface ModalAsignarInsigniaProps {
  estudiantes: Estudiante[];
  claseId: string;
  onClose: () => void;
  onInsigniaAsignada?: () => void;
}

export function ModalAsignarInsignia({
  estudiantes,
  claseId,
  onClose,
  onInsigniaAsignada
}: ModalAsignarInsigniaProps) {
  const [paso, setPaso] = useState<'seleccionar-estudiante' | 'seleccionar-insignia'>('seleccionar-estudiante');
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<Estudiante | null>(null);
  const [insigniaSeleccionada, setInsigniaSeleccionada] = useState<Insignia | null>(null);
  const [asignando, setAsignando] = useState(false);
  const [exitoMostrado, setExitoMostrado] = useState(false);

  const handleSeleccionarEstudiante = (estudiante: Estudiante) => {
    setEstudianteSeleccionado(estudiante);
    setPaso('seleccionar-insignia');
  };

  const handleSeleccionarInsignia = async (insignia: Insignia) => {
    setInsigniaSeleccionada(insignia);
    setAsignando(true);

    try {
      // TODO: Reemplazar con endpoint real
      await apiClient.post('/gamificacion/asignar-insignia', {
        estudianteId: estudianteSeleccionado!.id,
        claseId: claseId,
        insigniaId: insignia.id,
        nombre: insignia.nombre,
        descripcion: insignia.descripcion,
        puntos: insignia.puntos
      });

      setExitoMostrado(true);
      setTimeout(() => {
        onInsigniaAsignada?.();
        onClose();
      }, 2000);
    } catch (error: unknown) {
      console.error('Error asignando insignia:', error);
      alert('Error al asignar insignia. Intenta nuevamente.');
    } finally {
      setAsignando(false);
    }
  };

  const handleVolver = () => {
    if (paso === 'seleccionar-insignia') {
      setPaso('seleccionar-estudiante');
      setEstudianteSeleccionado(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl border-2 border-purple-500/50 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-t-3xl p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-black/20 hover:bg-black/40 transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="flex items-center gap-4">
              <Award className="w-10 h-10 text-white" />
              <div>
                <h2 className="text-3xl font-black text-white">
                  Asignar Insignia
                </h2>
                <p className="text-white/90 text-sm font-semibold">
                  {paso === 'seleccionar-estudiante'
                    ? 'Selecciona un estudiante'
                    : `Selecciona insignia para ${estudianteSeleccionado?.nombre}`}
                </p>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-2 mt-4">
              <div className={`flex-1 h-2 rounded-full ${paso === 'seleccionar-estudiante' || paso === 'seleccionar-insignia' ? 'bg-white' : 'bg-white/30'}`} />
              <div className={`flex-1 h-2 rounded-full ${paso === 'seleccionar-insignia' ? 'bg-white' : 'bg-white/30'}`} />
            </div>
          </div>

          <div className="p-6">
            {/* Paso 1: Seleccionar Estudiante */}
            {paso === 'seleccionar-estudiante' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">
                    Estudiantes Conectados ({estudiantes.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
                  {estudiantes.map((estudiante) => (
                    <motion.button
                      key={estudiante.id}
                      onClick={() => handleSeleccionarEstudiante(estudiante)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-4 border-2 border-slate-600 hover:border-purple-500 transition-all text-left flex items-center gap-4"
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-purple-500/50">
                        <img
                          src={`https://api.dicebear.com/7.x/${estudiante.avatar_url}/svg?seed=${estudiante.id}`}
                          alt={estudiante.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white">
                          {estudiante.nombre} {estudiante.apellido}
                        </h4>
                        <p className="text-sm text-gray-400">
                          Click para asignar insignia
                        </p>
                      </div>
                      <Award className="w-6 h-6 text-purple-400" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Paso 2: Seleccionar Insignia */}
            {paso === 'seleccionar-insignia' && !exitoMostrado && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Estudiante Seleccionado */}
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-4 border-2 border-purple-500/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500">
                      <img
                        src={`https://api.dicebear.com/7.x/${estudianteSeleccionado!.avatar_url}/svg?seed=${estudianteSeleccionado!.id}`}
                        alt={estudianteSeleccionado!.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">
                        {estudianteSeleccionado!.nombre} {estudianteSeleccionado!.apellido}
                      </h4>
                      <p className="text-sm text-purple-400 font-semibold">
                        Estudiante seleccionado
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleVolver}
                    className="text-gray-400 hover:text-white transition-colors text-sm font-semibold"
                  >
                    Cambiar
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-xl font-bold text-white">
                    Selecciona una Insignia
                  </h3>
                </div>

                {/* Grid de Insignias */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto">
                  {INSIGNIAS_PREDEFINIDAS.map((insignia) => (
                    <motion.button
                      key={insignia.id}
                      onClick={() => handleSeleccionarInsignia(insignia)}
                      disabled={asignando}
                      whileHover={!asignando ? { scale: 1.05, y: -4 } : {}}
                      whileTap={!asignando ? { scale: 0.95 } : {}}
                      className={`relative bg-gradient-to-br ${insignia.color} rounded-2xl p-6 border-2 border-white/20 hover:border-white/40 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
                    >
                      <div className="text-5xl mb-3">{insignia.icono}</div>
                      <h4 className="text-lg font-black text-white mb-2">
                        {insignia.nombre}
                      </h4>
                      <p className="text-xs text-white/80 mb-3 line-clamp-2">
                        {insignia.descripcion}
                      </p>
                      <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-sm font-bold text-white">
                          +{insignia.puntos} pts
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Éxito */}
            {exitoMostrado && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-8xl mb-6"
                >
                  🎉
                </motion.div>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                  <h3 className="text-3xl font-black text-white">
                    ¡Insignia Asignada!
                  </h3>
                </div>
                <p className="text-xl text-gray-300 mb-2">
                  {estudianteSeleccionado!.nombre} recibió:
                </p>
                <div className={`inline-block bg-gradient-to-r ${insigniaSeleccionada!.color} rounded-2xl px-6 py-4 border-2 border-white/20`}>
                  <div className="text-5xl mb-2">{insigniaSeleccionada!.icono}</div>
                  <div className="text-2xl font-black text-white">
                    {insigniaSeleccionada!.nombre}
                  </div>
                  <div className="text-sm text-white/80 mt-1">
                    +{insigniaSeleccionada!.puntos} puntos
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
