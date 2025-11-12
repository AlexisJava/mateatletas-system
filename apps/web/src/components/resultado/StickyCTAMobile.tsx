// ═══════════════════════════════════════════════════════════════════════════════
// STICKY CTA MOBILE - ULTRA PERSUASIVO
// Botón fijo en bottom IMPOSIBLE DE IGNORAR
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import { motion, useScroll } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

interface StickyCTAMobileProps {
  nombreEstudiante: string;
  precio: number;
  moneda: 'USD' | 'ARS';
  onCTAClick?: () => void;
}

export default function StickyCTAMobile({
  nombreEstudiante,
  precio,
  moneda,
  onCTAClick
}: StickyCTAMobileProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();

  // Mostrar el CTA sticky después de scroll inicial (300px) - MÁS TEMPRANO
  useEffect(() => {
    const updateVisibility = () => {
      const currentScrollY = scrollY.get();
      setIsVisible(currentScrollY > 300);
    };

    const unsubscribe = scrollY.on('change', updateVisibility);
    return () => unsubscribe();
  }, [scrollY]);

  const handleClick = () => {
    if (onCTAClick) {
      onCTAClick();
    } else {
      // Default: scroll to payment section
      const paymentSection = document.getElementById('opciones-pago');
      if (paymentSection) {
        paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{
        y: isVisible ? 0 : 100,
        opacity: isVisible ? 1 : 0
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
    >
      {/* Gradient fade effect - MÁS LARGO */}
      <div className="absolute inset-x-0 -top-16 h-16 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />

      {/* Glow effect PULSANTE */}
      <div className="absolute inset-x-0 -top-2 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 animate-pulse" />

      {/* CTA Container */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 backdrop-blur-xl border-t-4 border-emerald-500/50 px-4 py-4 shadow-2xl">
        <div className="flex items-center gap-3">
          {/* Info rápida - MÁS PERSUASIVA */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span className="text-xs text-yellow-400 font-bold uppercase tracking-wider">
                Última oportunidad
              </span>
            </div>
            <div className="font-black text-white text-xl">
              ${precio.toLocaleString()}{' '}
              <span className="text-sm text-slate-400 font-normal">
                {moneda}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Ruta completa • {nombreEstudiante}
            </div>
          </div>

          {/* Botón CTA - MÁS GRANDE Y LLAMATIVO */}
          <motion.button
            onClick={handleClick}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                '0 0 20px rgba(16, 185, 129, 0.4)',
                '0 0 40px rgba(16, 185, 129, 0.6)',
                '0 0 20px rgba(16, 185, 129, 0.4)',
              ]
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }
            }}
            className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 text-white font-black text-base rounded-2xl shadow-2xl flex flex-col items-center gap-1"
          >
            <span className="text-2xl leading-none">🚀</span>
            <span className="text-xs leading-none">INSCRIBIR</span>
          </motion.button>
        </div>

        {/* Trust badges - MÁS PROMINENTES */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1">
            <span className="text-emerald-400">✓</span>
            <span className="text-emerald-400 font-semibold">Garantía 7 días</span>
          </div>
          <div className="flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-3 py-1">
            <span className="text-cyan-400">🔒</span>
            <span className="text-cyan-400 font-semibold">Pago seguro</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
