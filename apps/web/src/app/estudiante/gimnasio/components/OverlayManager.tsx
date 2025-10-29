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

  // Configuración de overlays
  const overlayConfig: Record<string, { component: React.ComponentType<any>; gradient: string }> = {
    'mi-grupo': {
      component: MiGrupoView,
      gradient: 'from-orange-600 via-red-600 to-pink-700',
    },
    'mi-progreso': {
      component: MiProgresoView,
      gradient: 'from-cyan-600 via-blue-600 to-purple-700',
    },
    'mis-logros': {
      component: () => <PlaceholderView title="MIS LOGROS" emoji="🏆" />,
      gradient: 'from-yellow-600 via-amber-600 to-orange-700',
    },
    'entrenamientos': {
      component: () => <PlaceholderView title="ENTRENAMIENTOS" emoji="🎮" />,
      gradient: 'from-green-600 via-emerald-600 to-teal-700',
    },
    'mis-cursos': {
      component: () => <PlaceholderView title="MIS CURSOS" emoji="📚" />,
      gradient: 'from-purple-600 via-violet-600 to-indigo-700',
    },
    'tienda': {
      component: () => <PlaceholderView title="TIENDA" emoji="🛒" />,
      gradient: 'from-pink-600 via-rose-600 to-red-700',
    },
    'notificaciones': {
      component: NotificacionesView,
      gradient: 'from-red-600 via-orange-600 to-amber-700',
    },
    'ajustes': {
      component: AjustesView,
      gradient: 'from-slate-700 via-gray-700 to-zinc-800',
    },
  };

  const config = activeOverlay ? overlayConfig[activeOverlay] : null;
  const ActiveComponent = config?.component;

  return (
    <AnimatePresence>
      {activeOverlay && config && (
        <>
          {/* Backdrop - Dashboard visible con blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOverlay}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Modal centrado - 80% x 80% */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`
                w-[80vw] h-[80vh]
                bg-gradient-to-br ${config.gradient}
                rounded-[40px]
                shadow-2xl
                border-4 border-white/30
                overflow-hidden
                pointer-events-auto
                relative
              `}
            >
              {/* Botón cerrar */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeOverlay}
                className="absolute top-6 right-6 z-10
                           w-14 h-14 rounded-2xl
                           bg-red-500 hover:bg-red-600
                           flex items-center justify-center
                           shadow-xl
                           border-2 border-white/30
                           transition-colors"
              >
                <X className="w-7 h-7 text-white" />
              </motion.button>

              {/* Contenido del overlay */}
              {ActiveComponent && <ActiveComponent estudiante={{ nombre: 'Estudiante' }} />}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Componente placeholder simple
function PlaceholderView({ title, emoji }: { title: string; emoji: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <div className="text-9xl mb-6">{emoji}</div>
        <h2 className="text-white text-6xl font-black mb-4
                       font-[family-name:var(--font-lilita)]">
          {title}
        </h2>
        <p className="text-white/80 text-2xl font-bold">
          Próximamente...
        </p>
      </motion.div>
    </div>
  );
}
