/**
 * Overlay Renderer - Renderiza un overlay individual con depth transformations
 * Aplica scale, blur, brightness según profundidad en el stack
 */

'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { OverlayRendererProps, DepthTransform } from '../types/overlay.types';

/**
 * Calcular transformaciones visuales según profundidad
 */
function calculateDepthTransform(depth: number): DepthTransform {
  // depth = 0 → top overlay (completamente visible)
  // depth = 1 → overlay debajo (blur + scale reducido)
  // depth = 2+ → muy borroso o invisible

  if (depth === 0) {
    return {
      scale: 1,
      blur: 0,
      brightness: 1,
      zIndex: 50,
      opacity: 1,
    };
  }

  if (depth === 1) {
    return {
      scale: 0.95,
      blur: 5,
      brightness: 0.8,
      zIndex: 40,
      opacity: 1,
    };
  }

  if (depth === 2) {
    return {
      scale: 0.9,
      blur: 10,
      brightness: 0.6,
      zIndex: 30,
      opacity: 0.8,
    };
  }

  // depth >= 3 → Ocultar para performance
  return {
    scale: 0.85,
    blur: 15,
    brightness: 0.4,
    zIndex: 20,
    opacity: 0,
  };
}

export interface OverlayRendererInternalProps extends OverlayRendererProps {
  component: React.ComponentType<any>;
  gradient: string;
  renderType: 'modal' | 'sidebar';
  estudiante: {
    nombre: string;
    apellido?: string;
    nivel_actual?: number;
    puntos_totales?: number;
    avatar_url?: string | null;
    id?: string;
  };
}

export function OverlayRenderer({
  config,
  depth,
  isTop,
  onBackdropClick,
  component: Component,
  gradient,
  renderType,
  estudiante,
}: OverlayRendererInternalProps) {
  const transform = calculateDepthTransform(depth);
  const isSidebar = renderType === 'sidebar';

  // Solo el overlay top puede recibir pointer events
  const pointerEvents = isTop ? 'auto' : 'none';

  // Backdrop opacity según depth
  const backdropOpacity = isTop ? (isSidebar ? 0.3 : 0.4) : 0;

  return (
    <>
      {/* Backdrop */}
      {transform.opacity > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: backdropOpacity }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={isTop ? onBackdropClick : undefined}
          className="fixed inset-0 bg-black"
          style={{
            zIndex: transform.zIndex - 1,
            pointerEvents,
          }}
        />
      )}

      {/* Overlay content */}
      {isSidebar ? (
        // SIDEBAR - Desde la derecha
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{
            x: 0,
            opacity: transform.opacity,
            scale: transform.scale,
            filter: `blur(${transform.blur}px) brightness(${transform.brightness})`,
          }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{
            type: 'spring',
            damping: 30,
            stiffness: 300,
            duration: 0.3,
          }}
          className={`
            fixed top-0 right-0 h-screen w-[420px]
            bg-gradient-to-b ${gradient}
            shadow-2xl
            border-l-2 border-white/10
            overflow-y-auto
          `}
          style={{
            zIndex: transform.zIndex,
            pointerEvents,
          }}
        >
          {isTop && (
            <button
              onClick={onBackdropClick}
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
          )}

          <div className="px-6 pb-6">
            <Component estudiante={estudiante} config={config} />
          </div>
        </motion.div>
      ) : (
        // MODAL - Centrado
        <div
          className="fixed inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: transform.zIndex }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: '100%' }}
            animate={{
              opacity: transform.opacity,
              scale: transform.scale,
              x: 0,
              filter: `blur(${transform.blur}px) brightness(${transform.brightness})`,
            }}
            exit={{ opacity: 0, scale: 0.95, x: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            className={`
              w-[80vw] h-[80vh]
              bg-gradient-to-br ${gradient}
              backdrop-blur-xl
              rounded-3xl
              shadow-2xl
              border-4 border-white/30
              overflow-hidden
              relative
            `}
            style={{
              pointerEvents,
            }}
          >
            {isTop && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBackdropClick}
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
            )}

            <Component estudiante={estudiante} config={config} />
          </motion.div>
        </div>
      )}
    </>
  );
}
