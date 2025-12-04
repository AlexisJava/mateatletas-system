'use client';

import React, { ReactElement, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, Star, Trophy, Sparkles, ArrowRight } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para Checkpoint
 */
interface CheckpointExampleData {
  titulo: string;
  mensaje: string;
  tipo: 'logro' | 'avance' | 'completado' | 'celebracion';
  mostrarConfeti?: boolean;
  mostrarEstrella?: boolean;
  textoBoton?: string;
  subtexto?: string;
}

/**
 * Preview interactivo del componente Checkpoint
 * Muestra un mensaje de celebración o punto de control
 */
function CheckpointPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as CheckpointExampleData;

  const [showAnimation, setShowAnimation] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<
    { id: number; x: number; delay: number; color: string }[]
  >([]);

  useEffect(() => {
    // Trigger animation on mount
    setShowAnimation(true);

    // Generate confetti particles
    if (data.mostrarConfeti !== false) {
      const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];
      const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * 5)] ?? '#3B82F6',
      }));
      setConfettiParticles(particles);
    }
  }, [data.mostrarConfeti]);

  const handleContinue = useCallback(() => {
    if (!interactive) return;
    // Reset animation for demo
    setShowAnimation(false);
    setTimeout(() => setShowAnimation(true), 100);
  }, [interactive]);

  const iconConfig = {
    logro: { Icon: Trophy, color: '#F59E0B', bg: 'from-amber-500/20 to-yellow-500/20' },
    avance: { Icon: ArrowRight, color: '#3B82F6', bg: 'from-blue-500/20 to-cyan-500/20' },
    completado: { Icon: CheckCircle2, color: '#10B981', bg: 'from-green-500/20 to-emerald-500/20' },
    celebracion: { Icon: Sparkles, color: '#EC4899', bg: 'from-pink-500/20 to-purple-500/20' },
  };

  const { Icon, color, bg } = iconConfig[data.tipo];

  return (
    <div className="relative overflow-hidden">
      {/* Confetti Animation */}
      {data.mostrarConfeti !== false && showAnimation && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confettiParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full animate-bounce"
              style={{
                left: `${particle.x}%`,
                top: '-10px',
                backgroundColor: particle.color,
                animation: `fall 2s ease-in ${particle.delay}s forwards`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main Checkpoint Card */}
      <div
        className={`
          relative bg-gradient-to-br ${bg}
          rounded-2xl p-8 text-center border border-slate-700
          ${showAnimation ? 'animate-in zoom-in-95 duration-500' : ''}
        `}
      >
        {/* Star decoration */}
        {data.mostrarEstrella !== false && (
          <div className="absolute -top-3 -right-3">
            <Star
              className="w-10 h-10 text-yellow-400 fill-yellow-400 animate-pulse"
              style={{ filter: 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.5))' }}
            />
          </div>
        )}

        {/* Icon */}
        <div
          className={`
            w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4
            ${showAnimation ? 'animate-in zoom-in duration-300 delay-200' : ''}
          `}
          style={{
            backgroundColor: color + '20',
            boxShadow: `0 0 30px ${color}30`,
          }}
        >
          <Icon className="w-10 h-10" style={{ color }} />
        </div>

        {/* Title */}
        <h2
          className={`
            text-2xl font-bold text-white mb-2
            ${showAnimation ? 'animate-in slide-in-from-bottom duration-300 delay-300' : ''}
          `}
        >
          {data.titulo}
        </h2>

        {/* Message */}
        <p
          className={`
            text-slate-300 text-lg mb-4
            ${showAnimation ? 'animate-in slide-in-from-bottom duration-300 delay-400' : ''}
          `}
        >
          {data.mensaje}
        </p>

        {/* Subtext */}
        {data.subtexto && (
          <p
            className={`
              text-slate-400 text-sm mb-6
              ${showAnimation ? 'animate-in fade-in duration-300 delay-500' : ''}
            `}
          >
            {data.subtexto}
          </p>
        )}

        {/* Continue Button */}
        {interactive && (
          <button
            type="button"
            onClick={handleContinue}
            className={`
              px-8 py-3 rounded-xl font-semibold text-white
              bg-gradient-to-r from-blue-600 to-blue-500
              hover:from-blue-500 hover:to-blue-400
              shadow-lg shadow-blue-500/25
              transition-all duration-200 hover:scale-105
              ${showAnimation ? 'animate-in slide-in-from-bottom duration-300 delay-500' : ''}
            `}
          >
            {data.textoBoton || 'Continuar'}
            <ArrowRight className="inline-block w-5 h-5 ml-2" />
          </button>
        )}
      </div>

      {/* CSS for confetti animation */}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(400px) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Documentación de props para Checkpoint
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'titulo',
    type: 'string',
    description: 'Título principal del checkpoint',
    required: true,
  },
  {
    name: 'mensaje',
    type: 'string',
    description: 'Mensaje descriptivo',
    required: true,
  },
  {
    name: 'tipo',
    type: 'string',
    description: 'Tipo de checkpoint: logro, avance, completado, o celebracion',
    required: true,
  },
  {
    name: 'mostrarConfeti',
    type: 'boolean',
    description: 'Si se muestra la animación de confeti',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'mostrarEstrella',
    type: 'boolean',
    description: 'Si se muestra la estrella decorativa',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'textoBoton',
    type: 'string',
    description: 'Texto del botón de continuar',
    required: false,
    defaultValue: 'Continuar',
  },
  {
    name: 'subtexto',
    type: 'string',
    description: 'Texto adicional debajo del mensaje',
    required: false,
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: CheckpointExampleData = {
  titulo: '¡Excelente trabajo!',
  mensaje: 'Has completado la Unidad 3 de Fracciones',
  tipo: 'completado',
  mostrarConfeti: true,
  mostrarEstrella: true,
  textoBoton: 'Siguiente unidad',
  subtexto: 'Ganaste 50 puntos de experiencia',
};

/**
 * Definición del preview para el registry
 */
export const CheckpointPreview: PreviewDefinition = {
  component: CheckpointPreviewComponent,
  exampleData,
  propsDocumentation,
};
