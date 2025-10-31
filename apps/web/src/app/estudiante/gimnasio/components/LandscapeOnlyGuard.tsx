'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone } from 'lucide-react';

/**
 * Guard que FUERZA orientación landscape en dispositivos móviles
 * Bloquea todo el contenido si está en portrait en mobile
 * Desktop no tiene restricciones
 */
export function LandscapeOnlyGuard({ children }: { children: React.ReactNode }) {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Detectar si es mobile: width < 1024px (tablet/phone)
      const isMobile = window.innerWidth < 1024;

      // Detectar si está en portrait: height > width
      const isPortrait = window.innerHeight > window.innerWidth;

      // Mostrar warning SOLO si es mobile Y está en portrait
      setShowWarning(isMobile && isPortrait);
    };

    // Check inicial
    checkOrientation();

    // Escuchar cambios de orientación y resize
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return (
    <>
      {/* Contenido normal */}
      {children}

      {/* Overlay bloqueante - SOLO en mobile portrait */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
          >
            {/* Contenido del mensaje */}
            <div className="text-center px-8">
              {/* Icono animado de teléfono rotando */}
              <motion.div
                animate={{
                  rotate: [0, -90, -90, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="inline-block mb-8"
              >
                <Smartphone className="w-24 h-24 text-cyan-400" strokeWidth={1.5} />
              </motion.div>

              {/* Emoji gigante */}
              <div className="text-8xl mb-6">🔄</div>

              {/* Título */}
              <h1 className="text-4xl font-black text-white mb-4 font-[family-name:var(--font-lilita)]">
                ROTA TU DISPOSITIVO
              </h1>

              {/* Subtítulo */}
              <p className="text-xl text-cyan-300 font-bold mb-2">
                El Gimnasio está diseñado para
              </p>
              <p className="text-xl text-cyan-300 font-bold">
                jugarse en modo horizontal
              </p>

              {/* Instrucción */}
              <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-cyan-400/40">
                <p className="text-white/90 text-sm font-bold">
                  👉 Gira tu teléfono o tablet para continuar
                </p>
              </div>

              {/* Animación de flechas indicando rotación */}
              <div className="mt-8 flex justify-center gap-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="text-cyan-400 text-2xl"
                  >
                    ↻
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
