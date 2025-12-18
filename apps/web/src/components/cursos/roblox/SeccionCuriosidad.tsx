'use client';

import { motion } from 'framer-motion';

interface SeccionCuriosidadProps {
  dato: string;
}

export default function SeccionCuriosidad({ dato }: SeccionCuriosidadProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="my-4"
    >
      <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-2 border-amber-500/40 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <motion.span
            className="text-3xl"
            animate={{ rotate: [0, 10, -10, 10, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            💡
          </motion.span>
          <div className="flex-1">
            <h4 className="text-base font-black text-amber-400 mb-2">¿Sabías que...?</h4>
            <p className="text-amber-200 leading-relaxed text-sm">{dato}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
