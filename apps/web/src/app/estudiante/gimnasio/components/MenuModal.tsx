'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

interface NavButton {
  id: string;
  overlayId: string | null;
  label: string;
  description: string;
  icon: ReactNode;
  gradient: string;
  glowColor: string;
  badge?: number;
  pulse?: boolean;
}

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  navButtons: NavButton[];
  onNavigate: (overlayId: string | null, buttonId: string) => void;
}

/**
 * Modal de Menú Principal - REDISEÑO 50/50 ULTRA PREMIUM
 * Izquierda: Botones del menú
 * Derecha: MATEATLETAS + CLUB STEAM con letras iluminadas
 */
export function MenuModal({ isOpen, onClose, navButtons, onNavigate }: MenuModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay oscuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container FULLSCREEN - 50/50 Layout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 sm:inset-4 z-[9999] flex items-center justify-center p-0 sm:p-4"
          >
            {/* Card principal FULLSCREEN */}
            <div className="relative w-full h-full sm:h-[95vh] sm:max-w-[1600px] overflow-hidden sm:rounded-3xl bg-black shadow-[0_0_100px_rgba(139,92,246,0.5)]">
              {/* Botón cerrar - Flotante arriba derecha */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/50 flex items-center justify-center transition-colors backdrop-blur-xl"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
              </motion.button>

              {/* Layout 50/50 - Responsive: columna en mobile, fila en desktop */}
              <div className="flex flex-col md:flex-row w-full h-full">
                {/* ========== COLUMNA IZQUIERDA: BOTONES DEL MENÚ ========== */}
                <div className="w-full md:w-1/2 h-1/2 md:h-full bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden">
                  {/* Partículas de fondo */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                    {[...Array(40)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-purple-400 rounded-full"
                        initial={{
                          x: Math.random() * 100 + '%',
                          y: Math.random() * 100 + '%',
                        }}
                        animate={{
                          y: [null, (Math.random() - 0.5) * 100 + '%'],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: Math.random() * 3 + 2,
                          repeat: Infinity,
                          delay: Math.random() * 2,
                        }}
                      />
                    ))}
                  </div>

                  {/* Header */}
                  <div className="relative p-4 sm:p-6 md:p-8 border-b border-white/10">
                    <motion.h2
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-wide font-[family-name:var(--font-lilita)]"
                      style={{
                        textShadow: '0 0 30px rgba(139,92,246,0.8), 0 4px 0 rgba(0,0,0,0.4)',
                      }}
                    >
                      Menú Principal
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-cyan-300/80 text-xs sm:text-sm mt-1"
                    >
                      Selecciona una opción para continuar
                    </motion.p>
                  </div>

                  {/* Grid de Botones con Scroll */}
                  <div className="relative overflow-y-auto h-[calc(100%-80px)] sm:h-[calc(100%-100px)] md:h-[calc(100%-120px)] p-3 sm:p-4 md:p-6">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                      {navButtons.map((button, index) => (
                        <motion.button
                          key={button.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05, type: 'spring' }}
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            onNavigate(button.overlayId, button.id);
                            if (button.id !== 'cerrar-sesion') {
                              onClose();
                            }
                          }}
                          className="relative group"
                        >
                          {/* Card container */}
                          <div className="relative h-full min-h-[100px] sm:min-h-[120px] overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-800/70 via-slate-700/70 to-slate-800/70 backdrop-blur-xl border-2 border-white/10 hover:border-white/30 transition-all p-3 sm:p-4">
                            {/* Glow effect on hover */}
                            <div
                              className={`absolute inset-0 bg-gradient-to-br ${button.gradient} opacity-0 group-hover:opacity-20 transition-opacity blur-xl`}
                            />

                            {/* Badge si hay notificaciones */}
                            {button.badge && button.badge > 0 && (
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg z-10"
                              >
                                <span className="text-white text-[9px] sm:text-[10px] font-black">
                                  {button.badge}
                                </span>
                              </motion.div>
                            )}

                            {/* Pulse effect */}
                            {button.pulse && (
                              <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br ${button.gradient}`}
                              />
                            )}

                            {/* Content */}
                            <div className="relative z-10 flex flex-col items-center text-center gap-2 sm:gap-3 h-full justify-center">
                              {/* Icon */}
                              <div
                                className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${button.gradient} flex items-center justify-center shadow-lg`}
                              >
                                <div className="text-white scale-75 sm:scale-90 md:scale-100">
                                  {button.icon}
                                </div>
                              </div>

                              {/* Label */}
                              <div>
                                <h3 className="text-white font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-wide leading-tight">
                                  {button.label}
                                </h3>
                                <p className="text-white/60 text-[9px] sm:text-[10px] md:text-xs mt-0.5 line-clamp-2">
                                  {button.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ========== COLUMNA DERECHA: LOGO MATEATLETAS ULTRA PREMIUM ========== */}
                <div className="w-full md:w-1/2 h-1/2 md:h-full bg-black relative overflow-hidden flex items-center justify-center">
                  {/* Grid pattern de fondo */}
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)
                      `,
                      backgroundSize: '60px 60px',
                    }}
                  />

                  {/* Glow central pulsante */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <div
                      className="w-[600px] h-[600px] rounded-full blur-[120px]"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
                      }}
                    />
                  </motion.div>

                  {/* Contenido principal */}
                  <div className="relative z-10 text-center px-6 sm:px-8">
                    {/* MATEATLETAS - Título principal */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 50 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.3, type: 'spring', damping: 20 }}
                      className="mb-6 sm:mb-8 md:mb-12"
                    >
                      <h1
                        className="font-[family-name:var(--font-lilita)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase text-white tracking-wider leading-none mb-2"
                        style={{
                          textShadow: `
                            0 0 40px rgba(139,92,246,1),
                            0 0 80px rgba(139,92,246,0.8),
                            0 0 120px rgba(139,92,246,0.6),
                            0 8px 0 rgba(0,0,0,0.4)
                          `,
                          WebkitTextStroke: '2px rgba(139,92,246,0.5)',
                        }}
                      >
                        MATEATLETAS
                      </h1>

                      {/* Línea decorativa animada */}
                      <motion.div
                        className="h-1 mx-auto rounded-full"
                        style={{
                          width: '60%',
                          background:
                            'linear-gradient(90deg, transparent, rgba(139,92,246,1), transparent)',
                          boxShadow: '0 0 20px rgba(139,92,246,1)',
                        }}
                        animate={{
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                    </motion.div>

                    {/* CLUB STEAM - Subtítulo */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mb-8 sm:mb-10"
                    >
                      <h2
                        className="font-[family-name:var(--font-lilita)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase text-cyan-300 tracking-widest"
                        style={{
                          textShadow: `
                            0 0 30px rgba(6,182,212,1),
                            0 0 60px rgba(6,182,212,0.6),
                            0 4px 0 rgba(0,0,0,0.4)
                          `,
                        }}
                      >
                        CLUB STEAM
                      </h2>
                    </motion.div>

                    {/* Estrellas decorativas */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="flex items-center justify-center gap-4 sm:gap-6"
                    >
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            rotate: [0, 360],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.3,
                          }}
                        >
                          <Sparkles
                            className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-yellow-400"
                            style={{
                              filter: 'drop-shadow(0 0 10px rgba(250,204,21,0.8))',
                            }}
                          />
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Tagline opcional */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                      className="mt-6 sm:mt-8 text-white/70 text-sm sm:text-base md:text-lg font-bold uppercase tracking-widest"
                      style={{
                        textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                      }}
                    >
                      ¡Entrená tu mente!
                    </motion.p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
