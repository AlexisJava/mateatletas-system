'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Trophy, Play, CheckCircle } from 'lucide-react';
import { cursosTiendaApi, type CursoEstudiante } from '@/lib/api/cursos-tienda.api';
import { toast } from 'react-hot-toast';

interface MisCursosViewProps {
  estudiante: {
    id: string;
    username: string;
  };
}

/**
 * MisCursosView - Vista de cursos canjeados (SPA Style)
 *
 * Muestra los cursos que el estudiante ha canjeado
 * Con progreso y acceso directo
 */
export function MisCursosView({ estudiante: _estudiante }: MisCursosViewProps) {
  const [cursos, setCursos] = useState<CursoEstudiante[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const data = await cursosTiendaApi.obtenerMisCursos();
      setCursos(data);
    } catch (error) {
      console.error('Error al cargar mis cursos:', error);
      toast.error('Error al cargar tus cursos');
    } finally {
      setLoading(false);
    }
  };

  const getCategoriaEmoji = (categoria: string): string => {
    const emojis: Record<string, string> = {
      ciencia: '🔬',
      programacion: '💻',
      robotica: '🤖',
      matematicas: '📐',
      diseno: '🎨',
    };
    return emojis[categoria] || '📚';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 rounded-2xl p-6 overflow-hidden">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-10 h-10 text-purple-400" />
          <h2 className="text-4xl font-black text-white">MIS CURSOS</h2>
        </div>
        <p className="text-gray-400">
          Tienes {cursos?.length || 0} curso{(cursos?.length || 0) !== 1 ? 's' : ''} activo{(cursos?.length || 0) !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Lista de cursos */}
      <div className="flex-1 overflow-y-auto pr-2">
        {(cursos?.length || 0) === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <BookOpen className="w-20 h-20 mb-4 opacity-50" />
            <p className="text-xl font-bold mb-2">No tienes cursos todavía</p>
            <p className="text-sm">¡Canjea tus monedas por cursos increíbles!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(cursos || []).map((cursoEstudiante) => {
              const curso = cursoEstudiante.curso;
              const progreso = cursoEstudiante.progreso;
              const completado = cursoEstudiante.completado;

              return (
                <motion.div
                  key={cursoEstudiante.id}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="relative bg-black/40 backdrop-blur-xl rounded-xl p-5 border border-white/10 cursor-pointer hover:border-purple-500/50 transition-all"
                >
                  {/* Badge completado */}
                  {completado && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        COMPLETADO
                      </div>
                    </div>
                  )}

                  {/* Emoji de categoría */}
                  <div className="text-5xl mb-3">{getCategoriaEmoji(curso.categoria)}</div>

                  {/* Título */}
                  <h3 className="text-white font-black text-xl mb-2 line-clamp-2 pr-20">
                    {curso.titulo}
                  </h3>

                  {/* Info */}
                  <div className="flex items-center gap-3 mb-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {curso.duracion_clases} clases
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      Nivel {curso.nivel_requerido}
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-bold text-sm">Progreso</span>
                      <span className="text-purple-400 font-bold text-sm">{progreso}%</span>
                    </div>
                    <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-white/10">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progreso}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Botón de acción */}
                  <button className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <Play className="w-5 h-5" fill="white" />
                    {completado ? 'REPASAR' : progreso > 0 ? 'CONTINUAR' : 'COMENZAR'}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
