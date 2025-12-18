'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SemanaRoblox } from '@/data/roblox/semana2-estilo-astro';

interface MenuNavegacionProps {
  semana: SemanaRoblox;
  bloqueActual: number;
  actividadActual: number;
  onNavigate: (bloque: number, actividad: number) => void;
}

export default function MenuNavegacion({
  semana,
  bloqueActual,
  actividadActual,
  onNavigate,
}: MenuNavegacionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botón hamburguesa */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white p-3 rounded-lg shadow-2xl transition-all duration-300"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </motion.button>

      {/* Panel lateral */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Menú */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l-2 border-purple-500/40 shadow-2xl z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 sticky top-0 z-10">
                <h3 className="text-2xl font-black text-white mb-1">{semana.titulo}</h3>
                <p className="text-purple-200 text-sm">{semana.duracion}</p>
              </div>

              {/* Lista de bloques */}
              <div className="p-4 space-y-4">
                {semana.bloques.map((bloque, bloqueIdx) => (
                  <div key={bloqueIdx}>
                    {/* Header del bloque */}
                    <div
                      className={`bg-slate-800/50 border-2 rounded-xl p-4 mb-2 ${
                        bloqueIdx === bloqueActual ? 'border-purple-500/60' : 'border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{bloque.emoji}</span>
                        <div className="flex-1">
                          <h4 className="text-white font-bold text-lg">{bloque.titulo}</h4>
                          <p className="text-slate-400 text-xs">{bloque.tiempo}</p>
                        </div>
                      </div>
                    </div>

                    {/* Lista de actividades */}
                    <div className="ml-6 space-y-2">
                      {bloque.actividades.map((actividad, actIdx) => {
                        const isCurrent = bloqueIdx === bloqueActual && actIdx === actividadActual;

                        const getIcon = () => {
                          switch (actividad.tipo) {
                            case 'testimonio':
                              return '👤';
                            case 'teoria':
                              return '📚';
                            case 'curiosidad':
                              return '💡';
                            case 'ejercicio-luau':
                              return '💻';
                            case 'quiz':
                              return '❓';
                            default:
                              return '📄';
                          }
                        };

                        const getNombre = () => {
                          if (actividad.nombre) return actividad.nombre;
                          if (actividad.tipo === 'testimonio')
                            return `Testimonio: ${actividad.testimonio?.nombre}`;
                          if (actividad.tipo === 'ejercicio-luau')
                            return actividad.ejercicio?.titulo;
                          return actividad.descripcion.substring(0, 30) + '...';
                        };

                        return (
                          <button
                            key={actIdx}
                            onClick={() => {
                              onNavigate(bloqueIdx, actIdx);
                              setIsOpen(false);
                            }}
                            className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${
                              isCurrent
                                ? 'bg-purple-500/20 border-2 border-purple-500/60 text-white'
                                : 'bg-slate-800/30 border-2 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{getIcon()}</span>
                              <span className="text-sm font-medium flex-1">{getNombre()}</span>
                              {isCurrent && (
                                <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                                  Actual
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-bold rounded-lg transition-all duration-300"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
