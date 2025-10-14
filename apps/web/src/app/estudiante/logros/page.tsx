'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useGamificacionStore } from '@/store/gamificacion.store';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

export default function LogrosPage() {
  const { logros, fetchLogros, logroRecienDesbloqueado, clearLogroModal } =
    useGamificacionStore();
  const { user } = useAuthStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedLogro, setSelectedLogro] = useState<any>(null);

  useEffect(() => {
    // Obtener logros del estudiante actual
    if (user?.id && user?.role === 'estudiante') {
      fetchLogros(user.id);
    }
  }, [user?.id]);

  // Logros mock
  const mockLogros = [
    {
      id: 'primera-clase',
      nombre: 'Primera Clase',
      descripcion: 'Asististe a tu primera clase',
      icono: '🎓',
      puntos: 50,
      categoria: 'inicio',
      desbloqueado: true,
    },
    {
      id: 'asistencia-perfecta',
      nombre: 'Asistencia Perfecta',
      descripcion: 'Asististe a todas las clases de la semana',
      icono: '⭐',
      puntos: 100,
      categoria: 'asistencia',
      desbloqueado: true,
    },
    {
      id: '10-clases',
      nombre: '10 Clases Completadas',
      descripcion: 'Completaste 10 clases',
      icono: '🔥',
      puntos: 150,
      categoria: 'progreso',
      desbloqueado: false,
    },
    {
      id: 'maestro-algebra',
      nombre: 'Maestro del Álgebra',
      descripcion: 'Completaste el 100% de Álgebra',
      icono: '📐',
      puntos: 200,
      categoria: 'maestria',
      desbloqueado: false,
    },
    {
      id: 'ayudante',
      nombre: 'Compañero Solidario',
      descripcion: 'Ayudaste a 5 compañeros',
      icono: '🤝',
      puntos: 120,
      categoria: 'social',
      desbloqueado: false,
    },
    {
      id: 'racha-7',
      nombre: 'Racha de 7 Días',
      descripcion: 'Asististe 7 días consecutivos',
      icono: '🔥',
      puntos: 180,
      categoria: 'racha',
      desbloqueado: true,
    },
    {
      id: 'racha-30',
      nombre: 'Racha de 30 Días',
      descripcion: 'Asististe 30 días consecutivos',
      icono: '🔥🔥',
      puntos: 500,
      categoria: 'racha',
      desbloqueado: false,
    },
    {
      id: 'mvp-mes',
      nombre: 'MVP del Mes',
      descripcion: 'Fuiste el estudiante con más puntos del mes',
      icono: '👑',
      puntos: 300,
      categoria: 'elite',
      desbloqueado: false,
    },
  ];

  const logrosData = logros.length > 0 ? logros : mockLogros;
  const desbloqueados = logrosData.filter((l) => l.desbloqueado).length;
  const porcentaje = (desbloqueados / logrosData.length) * 100;

  // Efecto cuando se desbloquea un logro
  useEffect(() => {
    if (logroRecienDesbloqueado) {
      setShowConfetti(true);
      setSelectedLogro(logroRecienDesbloqueado);
      toast.success(`¡Desbloqueaste: ${logroRecienDesbloqueado.nombre}!`, {
        icon: logroRecienDesbloqueado.icono,
        duration: 5000,
      });

      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }
  }, [logroRecienDesbloqueado]);

  const handleLogroClick = (logro: any) => {
    if (logro.desbloqueado) {
      setSelectedLogro(logro);
    }
  };

  return (
    <div
      className="h-full overflow-y-auto p-4 space-y-6"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #164e63 50%, #0f172a 100%)'
      }}
    >
      {/* Confetti cuando se desbloquea logro */}
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

      {/* Header con progreso - CELESTE CHUNKY */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="rounded-2xl p-8"
        style={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
          border: '5px solid #000',
          boxShadow: '8px 8px 0 0 rgba(0, 0, 0, 1)',
        }}
      >
        <h1
          className="text-4xl font-bold text-white mb-4"
          style={{ textShadow: '3px 3px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}
        >
          TUS LOGROS
        </h1>
        <p
          className="text-white text-lg mb-4 font-semibold"
          style={{ textShadow: '2px 2px 0 #000' }}
        >
          Has desbloqueado {desbloqueados} de {logrosData.length} logros
        </p>

        {/* Progress Bar - CHUNKY */}
        <div
          className="relative w-full h-10 rounded-full overflow-hidden"
          style={{
            background: '#0c4a6e',
            border: '4px solid #000',
            boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 1)',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${porcentaje}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="h-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
            }}
          >
            <span
              className="text-black font-bold text-base"
              style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.5)' }}
            >
              {Math.round(porcentaje)}%
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Grid de Logros - CHUNKY STYLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {logrosData.map((logro, index) => (
          <motion.div
            key={logro.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeOut' }}
            whileHover={{
              scale: logro.desbloqueado ? 1.03 : 1.01,
              y: logro.desbloqueado ? -4 : 0,
              transition: { duration: 0.2, ease: 'easeOut' }
            }}
            onClick={() => handleLogroClick(logro)}
            className="relative cursor-pointer rounded-2xl p-6"
            style={{
              background: logro.desbloqueado
                ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                : '#1e293b',
              border: '4px solid #000',
              boxShadow: logro.desbloqueado
                ? '6px 6px 0 0 rgba(0, 0, 0, 1)'
                : '4px 4px 0 0 rgba(0, 0, 0, 1)',
              opacity: logro.desbloqueado ? 1 : 0.5,
            }}
          >
            {/* Lock overlay para bloqueados */}
            {!logro.desbloqueado && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
                <span className="text-6xl">🔒</span>
              </div>
            )}

            <div className="relative z-10 text-center">
              {/* Icono */}
              <motion.div
                animate={
                  logro.desbloqueado
                    ? { scale: [1, 1.1, 1] }
                    : {}
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: 'easeInOut',
                }}
                className="text-6xl mb-3"
              >
                {logro.icono}
              </motion.div>

              {/* Nombre */}
              <h3
                className="text-lg font-bold mb-2"
                style={{
                  color: logro.desbloqueado ? '#000' : '#64748b',
                  textShadow: logro.desbloqueado ? '1px 1px 0 rgba(255,255,255,0.3)' : 'none',
                }}
              >
                {logro.nombre}
              </h3>

              {/* Descripción */}
              <p
                className="text-sm mb-3"
                style={{
                  color: logro.desbloqueado ? '#000' : '#475569',
                }}
              >
                {logro.descripcion}
              </p>

              {/* Puntos */}
              <div
                className="inline-block px-3 py-2 rounded-lg text-sm font-bold"
                style={{
                  background: logro.desbloqueado ? '#fff' : '#334155',
                  color: logro.desbloqueado ? '#000' : '#64748b',
                  border: '2px solid #000',
                  boxShadow: '2px 2px 0 0 rgba(0, 0, 0, 1)',
                }}
              >
                +{logro.puntos} pts
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal de Logro Desbloqueado - CHUNKY */}
      <AnimatePresence>
        {selectedLogro && selectedLogro.desbloqueado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedLogro(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-3xl p-8 max-w-md w-full"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
                border: '6px solid #000',
                boxShadow: '12px 12px 0 0 rgba(0, 0, 0, 1)',
              }}
            >
              <div className="text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="text-9xl mb-4"
                >
                  {selectedLogro.icono}
                </motion.div>

                <h2
                  className="text-3xl font-bold text-white mb-2"
                  style={{ textShadow: '3px 3px 0 #000' }}
                >
                  ¡{selectedLogro.nombre}!
                </h2>

                <p
                  className="text-white text-lg mb-6 font-semibold"
                  style={{ textShadow: '2px 2px 0 #000' }}
                >
                  {selectedLogro.descripcion}
                </p>

                <div
                  className="rounded-2xl p-4 mb-6"
                  style={{
                    background: '#FFD700',
                    border: '4px solid #000',
                    boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 1)',
                  }}
                >
                  <p className="text-black font-bold text-2xl">
                    +{selectedLogro.puntos} Puntos
                  </p>
                </div>

                <motion.button
                  whileHover={{
                    x: -2,
                    y: -2,
                    transition: { duration: 0.2, ease: 'easeOut' }
                  }}
                  whileTap={{
                    x: 0,
                    y: 0,
                    transition: { duration: 0.1 }
                  }}
                  onClick={() => setSelectedLogro(null)}
                  className="px-8 py-3 rounded-xl text-white font-bold text-lg"
                  style={{
                    background: '#0891b2',
                    border: '4px solid #000',
                    boxShadow: '6px 6px 0 0 rgba(0, 0, 0, 1)',
                    textShadow: '2px 2px 0 #000',
                  }}
                >
                  ¡Genial!
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
