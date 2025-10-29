'use client';

import { useOverlay } from '../contexts/OverlayProvider';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

// Importar vistas de overlays
import { MiGrupoView } from '../views/MiGrupoView';
import { MiProgresoView } from '../views/MiProgresoView';
import { NotificacionesView } from '../views/NotificacionesView';
import { AjustesView } from '../views/AjustesView';

export function OverlayManager() {
  const { activeOverlay, closeOverlay } = useOverlay();

  // Configuración de overlays con estética BRUTAL
  const overlayConfig: Record<string, { component: React.ComponentType<any>; title: string; gradient: string; glowColor: string; icon: string }> = {
    'mi-grupo': {
      component: MiGrupoView,
      title: 'MI GRUPO',
      gradient: 'from-orange-600 via-red-600 to-pink-700',
      glowColor: 'rgba(249, 115, 22, 0.8)',
      icon: '🔥',
    },
    'mi-progreso': {
      component: MiProgresoView,
      title: 'MI PROGRESO',
      gradient: 'from-cyan-600 via-blue-600 to-purple-700',
      glowColor: 'rgba(6, 182, 212, 0.8)',
      icon: '📊',
    },
    'mis-logros': {
      component: () => <PlaceholderView title="MIS LOGROS" emoji="🏆" />,
      title: 'MIS LOGROS',
      gradient: 'from-yellow-600 via-amber-600 to-orange-700',
      glowColor: 'rgba(251, 191, 36, 0.8)',
      icon: '🏆',
    },
    'entrenamientos': {
      component: () => <PlaceholderView title="ENTRENAMIENTOS" emoji="🎮" />,
      title: 'ENTRENAMIENTOS',
      gradient: 'from-green-600 via-emerald-600 to-teal-700',
      glowColor: 'rgba(16, 185, 129, 0.8)',
      icon: '🎮',
    },
    'mis-cursos': {
      component: () => <PlaceholderView title="MIS CURSOS" emoji="📚" />,
      title: 'MIS CURSOS',
      gradient: 'from-purple-600 via-violet-600 to-indigo-700',
      glowColor: 'rgba(147, 51, 234, 0.8)',
      icon: '📚',
    },
    'tienda': {
      component: () => <PlaceholderView title="TIENDA" emoji="🛒" />,
      title: 'TIENDA',
      gradient: 'from-pink-600 via-rose-600 to-red-700',
      glowColor: 'rgba(236, 72, 153, 0.8)',
      icon: '🛒',
    },
    'notificaciones': {
      component: NotificacionesView,
      title: 'NOTIFICACIONES',
      gradient: 'from-red-600 via-orange-600 to-amber-700',
      glowColor: 'rgba(239, 68, 68, 0.8)',
      icon: '🔔',
    },
    'ajustes': {
      component: AjustesView,
      title: 'AJUSTES',
      gradient: 'from-slate-700 via-gray-700 to-zinc-800',
      glowColor: 'rgba(100, 116, 139, 0.8)',
      icon: '⚙️',
    },
  };

  const config = activeOverlay ? overlayConfig[activeOverlay] : null;
  const ActiveComponent = config?.component;

  return (
    <AnimatePresence>
      {activeOverlay && config && (
        <>
          {/* Backdrop BRUTAL con blur intenso */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOverlay}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-40"
            style={{
              backdropFilter: 'blur(20px) saturate(180%)',
            }}
          />

          {/* Modal CENTRADO - ESTILO VIDEOJUEGO AAA */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 md:p-8">
            <motion.div
              initial={{
                scale: 0.7,
                opacity: 0,
                rotateX: 30,
                y: 100,
              }}
              animate={{
                scale: 1,
                opacity: 1,
                rotateX: 0,
                y: 0,
              }}
              exit={{
                scale: 0.7,
                opacity: 0,
                rotateX: -30,
                y: -100,
              }}
              transition={{
                type: 'spring',
                damping: 20,
                stiffness: 150,
                duration: 0.5,
              }}
              className="w-full max-w-7xl h-[90vh] relative"
              style={{
                perspective: '2000px',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* GLOW EXTERIOR BRUTAL */}
              <div
                className="absolute -inset-4 rounded-[3rem] blur-3xl opacity-60 animate-pulse"
                style={{
                  background: `radial-gradient(circle, ${config.glowColor}, transparent 70%)`,
                  animation: 'pulse 3s ease-in-out infinite',
                }}
              />

              {/* CONTAINER PRINCIPAL */}
              <div className={`
                relative w-full h-full
                bg-gradient-to-br ${config.gradient}
                rounded-[2.5rem]
                overflow-hidden
                border-4 border-white/30
                shadow-[0_0_80px_rgba(0,0,0,0.9),inset_0_2px_60px_rgba(255,255,255,0.1)]
              `}>

                {/* Textura de fondo estilo videojuego */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                     style={{
                       backgroundImage: `
                         linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.1) 50%, transparent 55%),
                         linear-gradient(-45deg, transparent 45%, rgba(255,255,255,0.1) 50%, transparent 55%)
                       `,
                       backgroundSize: '30px 30px',
                     }}
                />

                {/* Líneas de neón decorativas */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-transparent via-white to-transparent opacity-50" />
                <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-transparent via-white to-transparent opacity-50" />

                {/* HEADER ÉPICO */}
                <div className="relative h-24 bg-black/40 backdrop-blur-md border-b-2 border-white/20
                               flex items-center justify-between px-8">

                  {/* Detalles decorativos esquinas */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-white/40 rounded-tl-3xl" />
                  <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-white/40 rounded-tr-3xl" />

                  {/* Icono + Título */}
                  <div className="flex items-center gap-4 z-10">
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="text-6xl drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                    >
                      {config.icon}
                    </motion.div>
                    <h1 className="text-5xl font-black text-white uppercase tracking-wider
                                   drop-shadow-[0_0_30px_rgba(0,0,0,0.9)]
                                   bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80
                                   font-[family-name:var(--font-lilita)]">
                      {config.title}
                    </h1>
                  </div>

                  {/* Botón CERRAR estilo videojuego */}
                  <motion.button
                    whileHover={{
                      scale: 1.15,
                      rotate: 180,
                      boxShadow: '0 0 40px rgba(255,255,255,0.8)',
                    }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closeOverlay}
                    className="w-16 h-16 rounded-2xl
                               bg-gradient-to-br from-red-500 to-red-700
                               border-4 border-white/40
                               shadow-[0_0_30px_rgba(239,68,68,0.6),inset_0_2px_20px_rgba(255,255,255,0.3)]
                               flex items-center justify-center
                               relative overflow-hidden
                               group z-10"
                  >
                    {/* Brillo animado */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    />
                    <X className="w-8 h-8 text-white relative z-10 drop-shadow-lg" />
                  </motion.button>
                </div>

                {/* CONTENIDO SCROLLEABLE */}
                <div className="h-[calc(100%-6rem)] overflow-y-auto overflow-x-hidden
                               scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/30">
                  {ActiveComponent && <ActiveComponent estudiante={{ nombre: 'Estudiante' }} />}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Componente placeholder BRUTAL
function PlaceholderView({ title, emoji }: { title: string; emoji: string }) {
  return (
    <div className="min-h-full flex items-center justify-center p-8">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          damping: 15,
          stiffness: 100,
          delay: 0.2,
        }}
        className="text-center"
      >
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="text-[12rem] mb-8 drop-shadow-[0_0_60px_rgba(255,255,255,0.8)]"
        >
          {emoji}
        </motion.div>
        <h2 className="text-white text-7xl font-black mb-6
                       drop-shadow-[0_0_40px_rgba(0,0,0,1)]
                       font-[family-name:var(--font-lilita)]">
          {title}
        </h2>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white/80 text-3xl font-bold"
        >
          Próximamente...
        </motion.div>
      </motion.div>
    </div>
  );
}
