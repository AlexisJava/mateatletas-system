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

type ColorKey = 'emerald' | 'blue' | 'purple';
type TierId = 'ARCADE' | 'ARCADE_PLUS' | 'PRO';

const TIERS: Array<{
  id: TierId;
  emoji: string;
  nombre: string;
  precio: string;
  color: ColorKey;
}> = [
  {
    id: 'ARCADE',
    emoji: '🎮',
    nombre: 'Arcade',
    precio: '$30.000',
    color: 'emerald',
  },
  {
    id: 'ARCADE_PLUS',
    emoji: '🚀',
    nombre: 'Arcade+',
    precio: '$60.000',
    color: 'blue',
  },
  {
    id: 'PRO',
    emoji: '👑',
    nombre: 'Pro',
    precio: '$75.000',
    color: 'purple',
  },
];

const COLOR_CLASSES: Record<ColorKey, { border: string; bg: string; text: string }> = {
  emerald: {
    border: 'border-emerald-500',
    bg: 'bg-emerald-500/5',
    text: 'text-emerald-400',
  },
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-500/5',
    text: 'text-blue-400',
  },
  purple: {
    border: 'border-purple-500',
    bg: 'bg-purple-500/5',
    text: 'text-purple-400',
  },
};

export function WizardPaso5() {
  const {
    datos,
    setCantidadSemanas,
    setActividadesPorSemana,
    setTierMinimo,
    siguientePaso,
    pasoAnterior,
  } = useStudioWizardStore();

  const getTierAccess = (tierIndex: number, selectedIndex: number) => {
    if (tierIndex === selectedIndex) return 'selected';
    if (tierIndex > selectedIndex) return 'has-access';
    return 'no-access';
  };

  const selectedTierIndex = TIERS.findIndex((t) => t.id === datos.tierMinimo);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex-1 flex flex-col min-h-0"
    >
      {/* Title section - compacto */}
      <motion.div variants={item} className="mb-4">
        <p className="text-xs font-semibold tracking-[0.3em] text-orange-500 uppercase mb-1">
          Paso 05 — Configuración
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-white">Duración y acceso</h1>
      </motion.div>

      {/* Grid de 2 filas */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        {/* Fila 1: Duración (semanas + actividades) */}
        <motion.div variants={item} className="grid grid-cols-2 gap-4">
          {/* Semanas */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <label className="block text-[10px] font-semibold tracking-wider text-white/40 uppercase mb-2">
              Semanas
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-lg p-1">
                <button
                  onClick={() => setCantidadSemanas(Math.max(1, datos.cantidadSemanas - 1))}
                  disabled={datos.cantidadSemanas <= 1}
                  className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-all ${
                    datos.cantidadSemanas <= 1
                      ? 'bg-white/5 text-white/20'
                      : 'bg-white/10 text-white hover:bg-orange-500/20'
                  }`}
                >
                  −
                </button>
                <span className="w-10 text-center text-xl font-bold text-white">
                  {datos.cantidadSemanas}
                </span>
                <button
                  onClick={() => setCantidadSemanas(Math.min(12, datos.cantidadSemanas + 1))}
                  disabled={datos.cantidadSemanas >= 12}
                  className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-all ${
                    datos.cantidadSemanas >= 12
                      ? 'bg-white/5 text-white/20'
                      : 'bg-white/10 text-white hover:bg-orange-500/20'
                  }`}
                >
                  +
                </button>
              </div>
              <span className="text-white/40 text-xs">1-12 sem</span>
            </div>
          </div>

          {/* Actividades */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <label className="block text-[10px] font-semibold tracking-wider text-white/40 uppercase mb-2">
              Actividades/semana
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-lg p-1">
                <button
                  onClick={() =>
                    setActividadesPorSemana(Math.max(1, datos.actividadesPorSemana - 1))
                  }
                  disabled={datos.actividadesPorSemana <= 1}
                  className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-all ${
                    datos.actividadesPorSemana <= 1
                      ? 'bg-white/5 text-white/20'
                      : 'bg-white/10 text-white hover:bg-orange-500/20'
                  }`}
                >
                  −
                </button>
                <span className="w-10 text-center text-xl font-bold text-white">
                  {datos.actividadesPorSemana}
                </span>
                <button
                  onClick={() =>
                    setActividadesPorSemana(Math.min(5, datos.actividadesPorSemana + 1))
                  }
                  disabled={datos.actividadesPorSemana >= 5}
                  className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-all ${
                    datos.actividadesPorSemana >= 5
                      ? 'bg-white/5 text-white/20'
                      : 'bg-white/10 text-white hover:bg-orange-500/20'
                  }`}
                >
                  +
                </button>
              </div>
              <div className="text-right">
                <p className="text-orange-400 font-bold text-sm">
                  = {datos.cantidadSemanas * datos.actividadesPorSemana} total
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Fila 2: Tier mínimo */}
        <motion.div variants={item} className="flex-1 flex flex-col min-h-0">
          <label className="block text-[10px] font-semibold tracking-wider text-white/40 uppercase mb-2">
            Tier mínimo requerido
          </label>
          <div className="grid grid-cols-3 gap-3">
            {TIERS.map((tier, index) => {
              const colors = COLOR_CLASSES[tier.color];
              const access = getTierAccess(index, selectedTierIndex);
              const isSelected = access === 'selected';
              const hasAccess = access === 'has-access';

              return (
                <button
                  key={tier.id}
                  onClick={() => setTierMinimo(tier.id)}
                  className={`relative text-left p-3 rounded-xl transition-all duration-300 border ${
                    isSelected
                      ? `${colors.border} ${colors.bg}`
                      : hasAccess
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-white/10 hover:border-white/25 bg-white/[0.02]'
                  }`}
                >
                  {isSelected && (
                    <div
                      className={`absolute top-2 right-2 w-4 h-4 rounded-full ${colors.border.replace('border-', 'bg-')} flex items-center justify-center`}
                    >
                      <svg
                        className="w-2.5 h-2.5 text-black"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {hasAccess && (
                    <div className="absolute top-2 right-2 text-[10px] text-emerald-400 font-medium">
                      ACCESO
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{tier.emoji}</span>
                    <h3 className="text-sm font-semibold text-white">{tier.nombre}</h3>
                  </div>
                  <p className={`${colors.text} text-base font-bold`}>{tier.precio}</p>
                </button>
              );
            })}
          </div>

          {/* Info de acceso - inline */}
          {datos.tierMinimo && (
            <div className="mt-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-white/70 text-xs">
                <span className="text-emerald-400 font-medium">Acceso: </span>
                {datos.tierMinimo === 'ARCADE' && 'ARCADE, ARCADE+ y PRO (todos)'}
                {datos.tierMinimo === 'ARCADE_PLUS' && 'ARCADE+ y PRO'}
                {datos.tierMinimo === 'PRO' && 'Solo PRO (exclusivo)'}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Actions */}
      <motion.div
        variants={item}
        className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5"
      >
        <NavigationButtons
          onBack={pasoAnterior}
          onNext={siguientePaso}
          nextDisabled={!datos.tierMinimo}
        />
      </motion.div>
    </motion.div>
  );
}
