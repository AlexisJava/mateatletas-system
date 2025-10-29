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
  const overlayConfig: Record<string, { component: React.ComponentType<any>; gradient: string; type?: 'modal' | 'sidebar' }> = {
    'mi-grupo': {
      component: MiGrupoView,
      gradient: 'from-cyan-400/20 to-blue-600/20',
      type: 'modal',
    },
    'mi-progreso': {
      component: MiProgresoView,
      gradient: 'from-cyan-600 via-blue-600 to-purple-700',
      type: 'modal',
    },
    'mis-logros': {
      component: () => <PlaceholderView title="MIS LOGROS" emoji="🏆" />,
      gradient: 'from-yellow-600 via-amber-600 to-orange-700',
      type: 'modal',
    },
    'entrenamientos': {
      component: () => <PlaceholderView title="ENTRENAMIENTOS" emoji="🎮" />,
      gradient: 'from-green-600 via-emerald-600 to-teal-700',
      type: 'modal',
    },
    'mis-cursos': {
      component: () => <PlaceholderView title="MIS CURSOS" emoji="📚" />,
      gradient: 'from-purple-600 via-violet-600 to-indigo-700',
      type: 'modal',
    },
    'tienda': {
      component: () => <PlaceholderView title="TIENDA" emoji="🛒" />,
      gradient: 'from-pink-600 via-rose-600 to-red-700',
      type: 'modal',
    },
    'notificaciones': {
      component: NotificacionesView,
      gradient: 'from-slate-800 via-gray-800 to-zinc-900',
      type: 'sidebar', // ⭐ SIDEBAR
    },
    'ajustes': {
      component: AjustesView,
      gradient: 'from-slate-700 via-gray-700 to-zinc-800',
      type: 'modal',
    },
  };

  const config = activeOverlay ? overlayConfig[activeOverlay] : null;
  const ActiveComponent = config?.component;
  const isSidebar = config?.type === 'sidebar';

  return (
    <AnimatePresence>
      {activeOverlay && config && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOverlay}
            className={`fixed inset-0 z-40 ${
              isSidebar ? 'bg-black/30' : 'bg-black/40 backdrop-blur-sm'
            }`}
          />

          {/* Renderizado condicional: Sidebar o Modal */}
          {isSidebar ? (
            // 📱 SIDEBAR - Desde la derecha
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className={`
                fixed top-0 right-0 h-screen w-[420px]
                bg-gradient-to-b ${config.gradient}
                shadow-2xl
                border-l-2 border-white/10
                overflow-y-auto
                z-50
              `}
            >
              {/* Botón cerrar - esquina superior derecha */}
              <button
                onClick={closeOverlay}
                className="sticky top-4 left-full -ml-12
                           w-10 h-10 rounded-xl
                           bg-white/10 hover:bg-white/20
                           backdrop-blur-sm
                           flex items-center justify-center
                           transition-colors duration-150
                           border border-white/20
                           z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Contenido del sidebar */}
              <div className="px-6 pb-6">
                {ActiveComponent && <ActiveComponent estudiante={{ nombre: 'Estudiante' }} />}
              </div>
            </motion.div>
          ) : (
            // 🎯 MODAL - Centrado
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`
                  w-[80vw] h-[80vh]
                  bg-gradient-to-br ${config.gradient}
                  backdrop-blur-xl
                  rounded-3xl
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
          )}
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
