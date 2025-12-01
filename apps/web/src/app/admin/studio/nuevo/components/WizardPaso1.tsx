'use client';

import { motion, Variants } from 'framer-motion';
import { useStudioWizardStore } from '@/store/studio-wizard.store';
import { NavigationButtons } from './shared';

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const cubicEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: cubicEase } },
};

export function WizardPaso1() {
  const { datos, errores, setCategoria, siguientePaso } = useStudioWizardStore();

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Title section */}
      <motion.div variants={item} className="mb-10">
        <p className="text-xs font-semibold tracking-[0.3em] text-orange-500 uppercase mb-3">
          Paso 01 — Categoría
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white leading-tight mb-4">
          ¿Qué vas a crear?
        </h1>
        <p className="text-base font-normal text-white/60 max-w-lg leading-relaxed">
          Seleccioná el tipo de experiencia educativa que querés diseñar.
        </p>
      </motion.div>

      {/* Cards */}
      <motion.div variants={item} className="grid grid-cols-2 gap-5 mb-10">
        {/* EXPERIENCIA */}
        <button
          onClick={() => setCategoria('EXPERIENCIA')}
          className={`
            group relative text-left p-6 rounded-xl transition-all duration-300
            border-2
            ${
              datos.categoria === 'EXPERIENCIA'
                ? 'border-orange-500 bg-orange-500/5'
                : 'border-white/10 hover:border-white/25 bg-white/[0.02]'
            }
          `}
        >
          {datos.categoria === 'EXPERIENCIA' && (
            <div className="absolute top-5 right-5 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
              <svg
                className="w-3.5 h-3.5 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          <div className="mb-5">
            <div
              className={`
                w-12 h-12 rounded-lg flex items-center justify-center text-2xl
                transition-colors duration-300
                ${datos.categoria === 'EXPERIENCIA' ? 'bg-orange-500/20' : 'bg-white/5 group-hover:bg-white/10'}
              `}
            >
              🚀
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white mb-2 leading-snug">
            Experiencia Temática
          </h3>

          <p className="text-sm text-white/60 leading-relaxed mb-4">
            Cursos inmersivos tipo videojuego con narrativa, exploración y simulación.
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-orange-500 uppercase">
              Premium
            </span>
            <span className="text-white/30">·</span>
            <span className="text-xs text-white/50">Ej: La Química de Harry Potter</span>
          </div>
        </button>

        {/* CURRICULAR */}
        <button
          onClick={() => setCategoria('CURRICULAR')}
          className={`
            group relative text-left p-6 rounded-xl transition-all duration-300
            border-2
            ${
              datos.categoria === 'CURRICULAR'
                ? 'border-orange-500 bg-orange-500/5'
                : 'border-white/10 hover:border-white/25 bg-white/[0.02]'
            }
          `}
        >
          {datos.categoria === 'CURRICULAR' && (
            <div className="absolute top-5 right-5 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
              <svg
                className="w-3.5 h-3.5 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          <div className="mb-5">
            <div
              className={`
                w-12 h-12 rounded-lg flex items-center justify-center text-2xl
                transition-colors duration-300
                ${datos.categoria === 'CURRICULAR' ? 'bg-orange-500/20' : 'bg-white/5 group-hover:bg-white/10'}
              `}
            >
              📚
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white mb-2 leading-snug">Curso Curricular</h3>

          <p className="text-sm text-white/60 leading-relaxed mb-4">
            Apoyo escolar estructurado y alineado al programa oficial.
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-orange-500 uppercase">
              Estructurado
            </span>
            <span className="text-white/30">·</span>
            <span className="text-xs text-white/50">Ej: Fracciones 5to grado</span>
          </div>
        </button>
      </motion.div>

      {/* Error */}
      {errores.categoria && (
        <motion.p variants={item} className="text-red-400 text-sm mb-5">
          {errores.categoria}
        </motion.p>
      )}

      {/* Action */}
      <motion.div variants={item} className="flex items-center gap-5">
        <NavigationButtons
          onNext={siguientePaso}
          nextDisabled={!datos.categoria}
          showBack={false}
        />

        {datos.categoria && (
          <p className="text-xs text-white/50">
            Seleccionaste:{' '}
            <span className="text-orange-500 font-medium">
              {datos.categoria === 'EXPERIENCIA' ? 'Experiencia Temática' : 'Curso Curricular'}
            </span>
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
