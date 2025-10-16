'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useGamificacionStore } from '@/store/gamificacion.store';
import { useAuthStore } from '@/store/auth.store';
import { Lock, Star, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';

export default function LogrosPage() {
  const { logros, fetchLogros, logroRecienDesbloqueado } = useGamificacionStore();
  const { user } = useAuthStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedLogro, setSelectedLogro] = useState<any>(null);
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(0);

  useEffect(() => {
    if (user?.id && user?.role === 'estudiante') {
      fetchLogros(user.id);
    }
  }, [user?.id]);

  // Logros mock (mejorados)
  const mockLogros = [
    {
      id: 'primera-clase',
      nombre: 'Primera Clase',
      descripcion: 'Asististe a tu primera clase',
      icono: '🎓',
      puntos: 50,
      categoria: 'inicio',
      rareza: 'común',
      desbloqueado: true,
    },
    {
      id: 'asistencia-perfecta',
      nombre: 'Asistencia Perfecta',
      descripcion: 'Asististe a todas las clases de la semana',
      icono: '⭐',
      puntos: 100,
      categoria: 'asistencia',
      rareza: 'raro',
      desbloqueado: true,
    },
    {
      id: '10-clases',
      nombre: '10 Clases Completadas',
      descripcion: 'Completaste 10 clases',
      icono: '🔥',
      puntos: 150,
      categoria: 'progreso',
      rareza: 'raro',
      desbloqueado: false,
    },
    {
      id: 'maestro-algebra',
      nombre: 'Maestro del Álgebra',
      descripcion: 'Completaste el 100% de Álgebra',
      icono: '📐',
      puntos: 200,
      categoria: 'maestria',
      rareza: 'épico',
      desbloqueado: false,
    },
    {
      id: 'ayudante',
      nombre: 'Compañero Solidario',
      descripcion: 'Ayudaste a 5 compañeros',
      icono: '🤝',
      puntos: 120,
      categoria: 'social',
      rareza: 'raro',
      desbloqueado: false,
    },
    {
      id: 'racha-7',
      nombre: 'Racha de 7 Días',
      descripcion: 'Asististe 7 días consecutivos',
      icono: '🔥',
      puntos: 180,
      categoria: 'racha',
      rareza: 'épico',
      desbloqueado: true,
    },
  ];

  const logrosData = logros.length > 0 ? logros : mockLogros;
  const desbloqueados = logrosData.filter((l) => l.desbloqueado).length;
  const porcentaje = (desbloqueados / logrosData.length) * 100;

  const categorias = [
    { id: 'todos', nombre: 'Todos', icono: '🏆' },
    { id: 'inicio', nombre: 'Inicio', icono: '🎓' },
    { id: 'racha', nombre: 'Rachas', icono: '🔥' },
    { id: 'progreso', nombre: 'Progreso', icono: '📈' },
  ];

  const rarezaColors = {
    común: { bg: 'from-gray-500 to-gray-600', border: 'gray-500' },
    raro: { bg: 'from-blue-500 to-cyan-500', border: 'blue-500' },
    épico: { bg: 'from-purple-500 to-pink-500', border: 'purple-500' },
    legendario: { bg: 'from-yellow-500 to-orange-500', border: 'yellow-500' },
  };

  useEffect(() => {
    if (logroRecienDesbloqueado) {
      setShowConfetti(true);
      setSelectedLogro(logroRecienDesbloqueado);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [logroRecienDesbloqueado]);

  const logrosFiltrados =
    filtroCategoria === 'todos'
      ? logrosData
      : logrosData.filter((l) => l.categoria === filtroCategoria);

  // Paginación: mostrar 6 logros por página (2x3)
  const LOGROS_POR_PAGINA = 6;
  const totalPaginas = Math.ceil(logrosFiltrados.length / LOGROS_POR_PAGINA);
  const logrosEnPagina = logrosFiltrados.slice(
    paginaActual * LOGROS_POR_PAGINA,
    (paginaActual + 1) * LOGROS_POR_PAGINA
  );

  useEffect(() => {
    setPaginaActual(0);
  }, [filtroCategoria]);

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

      <div className="h-full max-w-7xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl shadow-2xl border-2 border-purple-400 p-6 flex-shrink-0"
        >
          <div className="flex items-center gap-4 mb-4">
            <Trophy className="w-14 h-14 text-white" />
            <div>
              <h1 className="text-4xl font-black text-white drop-shadow-lg">Mis Logros</h1>
              <p className="text-white/90 text-lg font-semibold">
                {desbloqueados} de {logrosData.length} desbloqueados
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-4 bg-black/30 rounded-full overflow-hidden border border-white/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${porcentaje}%` }}
              transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </motion.div>
          </div>
          <div className="text-center mt-1">
            <span className="text-sm text-white/80 font-bold">{Math.round(porcentaje)}% completado</span>
          </div>
        </motion.div>

        {/* Filtros de Categoría */}
        <div className="flex flex-wrap gap-3 flex-shrink-0">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFiltroCategoria(cat.id)}
              className={`px-5 py-3 rounded-xl text-base font-semibold transition-all ${
                filtroCategoria === cat.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 scale-105'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700 border-2 border-purple-500/30'
              }`}
            >
              {cat.icono} {cat.nombre}
            </button>
          ))}
        </div>

        {/* Grid de Logros - Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto lg:overflow-hidden">
            {logrosEnPagina.map((logro, index) => {
              const rareza = rarezaColors[(logro.rareza || 'común') as keyof typeof rarezaColors];

              return (
                <motion.div
                  key={logro.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={logro.desbloqueado ? { scale: 1.05, y: -8 } : {}}
                  onClick={() => logro.desbloqueado && setSelectedLogro(logro)}
                  className="relative group cursor-pointer"
                >
                  {/* Glow Effect */}
                  {logro.desbloqueado && (
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${rareza.bg} rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity`}
                    />
                  )}

                  {/* Card */}
                  <div
                    className={`relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl border-2 p-8 h-full flex flex-col items-center justify-center ${
                      logro.desbloqueado
                        ? `border-${rareza.border}/50 hover:border-${rareza.border} transition-all`
                        : 'border-gray-700 opacity-50'
                    }`}
                  >
                    {/* Lock overlay */}
                    {!logro.desbloqueado && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-3xl z-10">
                        <Lock className="w-20 h-20 text-gray-400" />
                      </div>
                    )}

                    <div className="relative z-0 text-center flex flex-col items-center justify-center h-full">
                      {/* Icono */}
                      <motion.div
                        animate={logro.desbloqueado ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="text-8xl mb-4"
                      >
                        {logro.icono}
                      </motion.div>

                      {/* Rareza Badge */}
                      {logro.desbloqueado && (
                        <div
                          className={`inline-block px-4 py-1 rounded-full text-sm font-bold text-white mb-3 bg-gradient-to-r ${rareza.bg} border border-white/20`}
                        >
                          {logro.rareza?.toUpperCase()}
                        </div>
                      )}

                      {/* Nombre */}
                      <h3 className="text-xl font-bold text-white mb-3">{logro.nombre}</h3>

                      {/* Descripción */}
                      <p className="text-base text-gray-400 mb-4">{logro.descripcion}</p>

                      {/* Puntos */}
                      {logro.desbloqueado && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-base font-bold">
                          <Star className="w-5 h-5" />
                          +{logro.puntos} pts
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6 flex-shrink-0">
              <button
                onClick={() => setPaginaActual((p) => Math.max(0, p - 1))}
                disabled={paginaActual === 0}
                className="p-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-purple-500/30"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="text-white font-bold text-lg">
                Página {paginaActual + 1} de {totalPaginas}
              </span>
              <button
                onClick={() => setPaginaActual((p) => Math.min(totalPaginas - 1, p + 1))}
                disabled={paginaActual === totalPaginas - 1}
                className="p-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-purple-500/30"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Logro */}
      <AnimatePresence>
        {selectedLogro && selectedLogro.desbloqueado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedLogro(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-md w-full border-2 shadow-2xl border-${
                rarezaColors[(selectedLogro.rareza || 'común') as keyof typeof rarezaColors].border
              }`}
            >
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-9xl mb-4"
                >
                  {selectedLogro.icono}
                </motion.div>

                <div
                  className={`inline-block px-4 py-2 rounded-full text-sm font-bold text-white mb-4 bg-gradient-to-r ${
                    rarezaColors[(selectedLogro.rareza || 'común') as keyof typeof rarezaColors].bg
                  }`}
                >
                  {selectedLogro.rareza?.toUpperCase()}
                </div>

                <h2 className="text-3xl font-bold text-white mb-2">{selectedLogro.nombre}</h2>

                <p className="text-white/80 text-lg mb-6">{selectedLogro.descripcion}</p>

                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 mb-6 border border-yellow-500/30">
                  <p className="text-yellow-400 font-bold text-2xl">+{selectedLogro.puntos} Puntos</p>
                </div>

                <button
                  onClick={() => setSelectedLogro(null)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  ¡Genial! 🎉
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
