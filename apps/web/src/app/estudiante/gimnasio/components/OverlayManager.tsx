'use client';

import { useOverlay } from '../contexts/OverlayProvider';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft } from 'lucide-react';

// Importar vistas de overlays
import { MiGrupoView } from '../views/MiGrupoView';
import { MiProgresoView } from '../views/MiProgresoView';

export function OverlayManager() {
  const { activeOverlay, closeOverlay } = useOverlay();

  // Mapear tipo de overlay a componente y configuración
  const overlayConfig: Record<string, { component: React.ComponentType<any>; title: string; gradient: string }> = {
    'mi-grupo': {
      component: MiGrupoView,
      title: 'MI GRUPO',
      gradient: 'from-orange-500 via-red-500 to-pink-600',
    },
    'mi-progreso': {
      component: MiProgresoView,
      title: 'MI PROGRESO',
      gradient: 'from-cyan-500 via-blue-500 to-purple-600',
    },
    'mis-logros': {
      component: () => <PlaceholderView title="MIS LOGROS" emoji="🏆" />,
      title: 'MIS LOGROS',
      gradient: 'from-yellow-500 via-amber-500 to-orange-600',
    },
    'entrenamientos': {
      component: () => <PlaceholderView title="ENTRENAMIENTOS" emoji="🎮" />,
      title: 'ENTRENAMIENTOS',
      gradient: 'from-green-500 via-emerald-500 to-teal-600',
    },
    'mis-cursos': {
      component: () => <PlaceholderView title="MIS CURSOS" emoji="📚" />,
      title: 'MIS CURSOS',
      gradient: 'from-purple-500 via-violet-500 to-indigo-600',
    },
    'tienda': {
      component: () => <PlaceholderView title="TIENDA" emoji="🛒" />,
      title: 'TIENDA',
      gradient: 'from-pink-500 via-rose-500 to-red-600',
    },
    'notificaciones': {
      component: () => <PlaceholderView title="NOTIFICACIONES" emoji="🔔" />,
      title: 'NOTIFICACIONES',
      gradient: 'from-red-500 via-orange-500 to-amber-600',
    },
    'ajustes': {
      component: () => <PlaceholderView title="AJUSTES" emoji="⚙️" />,
      title: 'AJUSTES',
      gradient: 'from-slate-600 via-gray-600 to-slate-700',
    },
  };

  const config = activeOverlay ? overlayConfig[activeOverlay] : null;
  const ActiveComponent = config?.component;

  return (
    <AnimatePresence>
      {activeOverlay && config && (
        <>
          {/* Backdrop con blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOverlay}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
          />

          {/* Modal Container - Slide desde derecha */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-0 bottom-0 w-full md:w-4/5 lg:w-3/4
                       bg-gradient-to-br ${config.gradient}
                       shadow-2xl z-50 overflow-hidden`}
          >
            {/* Header del modal */}
            <div className="absolute top-0 left-0 right-0 h-16
                           bg-black/30 backdrop-blur-sm
                           flex items-center justify-between px-6
                           border-b border-white/10 z-10">

              {/* Botón volver */}
              <motion.button
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeOverlay}
                className="flex items-center gap-2 text-white font-bold text-lg
                           bg-white/10 hover:bg-white/20 rounded-xl px-4 py-2
                           transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
                Volver
              </motion.button>

              {/* Título del overlay */}
              <h1 className="text-white text-2xl font-black uppercase tracking-wider
                             drop-shadow-lg">
                {config.title}
              </h1>

              {/* Botón cerrar (X) */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeOverlay}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20
                           flex items-center justify-center text-white
                           transition-colors"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Contenido scrolleable */}
            <div className="h-full pt-16 overflow-y-auto">
              {ActiveComponent && <ActiveComponent estudiante={{ nombre: 'Estudiante' }} />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Componente placeholder para vistas no implementadas
function PlaceholderView({ title, emoji }: { title: string; emoji: string }) {
  return (
    <div className="min-h-full flex items-center justify-center p-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <div className="text-9xl mb-8 animate-bounce">
          {emoji}
        </div>
        <h2 className="text-white text-5xl font-black mb-4">
          {title}
        </h2>
        <p className="text-white/70 text-2xl">
          Próximamente
        </p>
      </motion.div>
    </div>
  );
}
