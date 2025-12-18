'use client';

import { motion } from 'framer-motion';

interface SeccionTeoriaProps {
  nombre: string;
  contenido: string[];
}

export default function SeccionTeoria({ nombre, contenido }: SeccionTeoriaProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="my-4"
    >
      <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-2 border-blue-500/30 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <h3 className="text-lg font-black text-white">{nombre}</h3>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-2">
          {contenido.map((parrafo, idx) => {
            // Detectar si es un título/subtítulo (comienza con emoji o es todo mayúsculas)
            const primerChar = parrafo.charCodeAt(0);
            const esEmoji = primerChar > 127; // Caracteres unicode más allá de ASCII
            const esSubtitulo =
              esEmoji || (parrafo === parrafo.toUpperCase() && parrafo.length < 100);

            // Detectar si es una lista (comienza con • o número)
            const esLista = /^[•\d]/.test(parrafo);

            if (esSubtitulo) {
              return (
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="text-base font-bold text-blue-300 mt-3 first:mt-0"
                >
                  {parrafo}
                </motion.p>
              );
            }

            if (esLista) {
              return (
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="text-slate-300 text-sm pl-3 leading-relaxed"
                >
                  {parrafo}
                </motion.p>
              );
            }

            return (
              <motion.p
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="text-slate-300 text-sm leading-relaxed"
              >
                {parrafo}
              </motion.p>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
