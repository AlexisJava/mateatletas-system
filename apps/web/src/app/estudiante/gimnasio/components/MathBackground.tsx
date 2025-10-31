'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import 'katex/dist/katex.min.css';

// Fórmulas matemáticas LaTeX por categoría
const MATH_FORMULAS = {
  algebra: [
    'x^2 + 2x + 1 = 0',
    '(a+b)^2 = a^2 + 2ab + b^2',
    '\\sqrt{x^2 + y^2}',
    '|x - 5| < 3',
    'a^n \\cdot a^m = a^{n+m}',
    '\\frac{a}{b} + \\frac{c}{d}',
  ],
  derivatives: [
    '\\frac{dy}{dx}',
    "f'(x) = 3x^2",
    '\\frac{\\partial f}{\\partial x}',
    '\\lim_{x \\to \\infty} f(x)',
    '\\frac{d}{dx}(\\sin x) = \\cos x',
    '\\frac{d}{dx}(e^x) = e^x',
  ],
  integrals: [
    '\\int x^2 \\, dx',
    '\\int_0^1 f(x) \\, dx',
    '\\int e^x \\, dx = e^x + C',
    '\\int \\frac{1}{x} \\, dx = \\ln|x|',
    '\\int_a^b f(x) \\, dx',
  ],
  geometry: [
    '\\sin^2\\theta + \\cos^2\\theta = 1',
    'A = \\pi r^2',
    'c^2 = a^2 + b^2',
    '\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}',
    'V = \\frac{4}{3}\\pi r^3',
    'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}',
  ],
  statistics: [
    '\\mu = \\frac{\\sum x}{n}',
    '\\sigma^2 = \\frac{\\sum(x-\\mu)^2}{n}',
    'P(A \\cap B) = P(A) \\cdot P(B|A)',
    '\\bar{x} \\pm 1.96\\sigma',
  ],
  theorems: [
    'e^{i\\pi} + 1 = 0',
    'a^2 + b^2 = c^2',
    '\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}',
  ],
  constants: [
    '\\pi \\approx 3.14159',
    'e \\approx 2.71828',
    '\\phi = \\frac{1+\\sqrt{5}}{2}',
    'i^2 = -1',
  ],
};

interface MathParticleProps {
  latex: string;
  delay: number;
  duration: number;
  startX: number;
  color: string;
  size: 'sm' | 'md' | 'lg';
}

function MathParticle({ latex, delay, duration, startX, color, size }: MathParticleProps) {
  const sizeMap = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const colorMap: Record<string, string> = {
    cyan: 'text-cyan-300/30',
    blue: 'text-blue-300/30',
    purple: 'text-purple-300/30',
    pink: 'text-pink-300/30',
    yellow: 'text-yellow-300/30',
    white: 'text-white/20',
  };

  return (
    <motion.div
      className={`absolute ${sizeMap[size]} ${colorMap[color]} font-light pointer-events-none select-none`}
      style={{
        fontFamily: 'KaTeX_Main, Times New Roman, serif',
      }}
      initial={{
        x: startX,
        y: '110vh',
        opacity: 0,
        rotate: 0,
      }}
      animate={{
        y: '-10vh',
        opacity: [0, 0.5, 0.5, 0],
        rotate: 360,
        x: startX + (Math.random() - 0.5) * 200,
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {/* Renderizar fórmula LaTeX */}
      <span dangerouslySetInnerHTML={{ __html: renderLatex(latex) }} />
    </motion.div>
  );
}

// Función simple para renderizar LaTeX (alternativa ligera a react-katex)
function renderLatex(latex: string): string {
  // Por simplicidad, renderizamos el LaTeX raw
  // En producción, podrías usar KaTeX server-side o una lib más ligera
  return `<span style="font-family: 'KaTeX_Main', 'Times New Roman', serif">${latex}</span>`;
}

export function MathBackground({ racha = 0 }: { racha?: number }) {
  const particles = useMemo(() => {
    // Más partículas si hay racha activa
    const particleCount = racha >= 3 ? 50 : 35;

    // Si racha activa, más fórmulas "intensas" (integrales, derivadas)
    const formulas =
      racha >= 3
        ? [...MATH_FORMULAS.integrals, ...MATH_FORMULAS.derivatives, ...MATH_FORMULAS.algebra]
        : Object.values(MATH_FORMULAS).flat();

    const colors = ['cyan', 'blue', 'purple', 'pink', 'yellow', 'white'];
    const sizes: ('sm' | 'md' | 'lg')[] = ['sm', 'md', 'lg'];

    // Generar partículas con distribución aleatoria
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      latex: formulas[Math.floor(Math.random() * formulas.length)]!,
      delay: Math.random() * 25, // Escalonado en 25 segundos
      duration: 18 + Math.random() * 12, // 18-30 segundos
      startX: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
      color: colors[Math.floor(Math.random() * colors.length)]!,
      size: sizes[Math.floor(Math.random() * sizes.length)]!,
    }));
  }, [racha]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Opcional: backdrop blur sutil */}
      <div className="absolute inset-0 backdrop-blur-[0.5px]" />

      {/* Partículas matemáticas */}
      {particles.map((particle) => (
        <MathParticle
          key={particle.id}
          latex={particle.latex}
          delay={particle.delay}
          duration={particle.duration}
          startX={particle.startX}
          color={particle.color}
          size={particle.size}
        />
      ))}
    </div>
  );
}
