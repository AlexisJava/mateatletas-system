'use client';

import { motion } from 'framer-motion';
import type { Testimonio } from '@/data/roblox/semana2-estilo-astro';

interface TestimonioCardProps {
  testimonio: Testimonio;
  contenido?: string[];
}

export default function TestimonioCard({ testimonio, contenido }: TestimonioCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="my-4"
    >
      {/* Card del testimonio */}
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          {/* Avatar con emoji */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl shadow-lg">
              {testimonio.emoji}
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-black text-white">{testimonio.nombre}</h3>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold">
                {testimonio.edad} años
              </span>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-3 border-l-4 border-amber-500">
              <p className="text-base text-slate-200 leading-relaxed italic">
                &ldquo;{testimonio.problema}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contexto adicional */}
      {contenido && contenido.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-3 space-y-2"
        >
          {contenido.map((parrafo, idx) => (
            <p
              key={idx}
              className="text-slate-300 text-sm leading-relaxed pl-4 border-l-2 border-amber-500/30"
            >
              {parrafo}
            </p>
          ))}
        </motion.div>
      )}

      {/* Banner "Vamos a ayudarlo" */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-3 text-center"
      >
        <p className="text-white text-base font-bold">
          💪 ¡Vamos a ayudar a {testimonio.nombre} a resolver este problema!
        </p>
      </motion.div>
    </motion.div>
  );
}
