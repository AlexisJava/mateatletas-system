/**
 * Botón para volver al Gimnasio desde una planificación
 */

'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

export interface BackButtonProps {
  /**
   * Ruta a la que volver (por defecto /estudiante/gimnasio)
   */
  href?: string;

  /**
   * Texto del botón (por defecto "Volver al Gimnasio")
   */
  label?: string;

  /**
   * Clases CSS adicionales
   */
  className?: string;
}

export function BackButton({
  href = '/estudiante/gimnasio',
  label = 'Volver al Gimnasio',
  className = '',
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.05, x: -4 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`
        fixed top-6 left-6 z-50
        flex items-center gap-2
        bg-white/10 hover:bg-white/20
        backdrop-blur-sm
        border-2 border-white/20
        rounded-2xl
        px-4 py-3
        text-white font-bold
        transition-colors duration-200
        ${className}
      `}
    >
      <ChevronLeft className="w-5 h-5" />
      <span>{label}</span>
    </motion.button>
  );
}
