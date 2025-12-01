'use client';

import { useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { useStudioWizardStore, MundoTipo } from '@/store/studio-wizard.store';
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

const ESTETICAS_POR_MUNDO: Record<
  MundoTipo,
  { base: string; variantes: readonly string[]; emoji: string }
> = {
  MATEMATICA: {
    base: 'geometrica',
    variantes: ['Default', 'Minecraft', 'Arte', 'Juegos'],
    emoji: '📐',
  },
  PROGRAMACION: {
    base: 'cyber',
    variantes: ['Default', 'Roblox', 'Robots', 'Apps'],
    emoji: '🌐',
  },
  CIENCIAS: {
    base: 'espacial',
    variantes: ['Default', 'Harry Potter', 'Dinosaurios', 'Océanos'],
    emoji: '🚀',
  },
};

const MUNDO_NOMBRES: Record<MundoTipo, string> = {
  MATEMATICA: 'Matemática',
  PROGRAMACION: 'Programación',
  CIENCIAS: 'Ciencias',
};

export function WizardPaso4() {
  const {
    datos,
    errores,
    setNombre,
    setDescripcion,
    setEsteticaBase,
    setEsteticaVariante,
    siguientePaso,
    pasoAnterior,
  } = useStudioWizardStore();

  const esteticaActual = datos.mundo ? ESTETICAS_POR_MUNDO[datos.mundo] : null;

  // Auto-setear estética base cuando llegamos al paso 4
  useEffect(() => {
    if (esteticaActual && datos.esteticaBase !== esteticaActual.base) {
      setEsteticaBase(esteticaActual.base);
    }
  }, [esteticaActual, datos.esteticaBase, setEsteticaBase]);

  const canContinue =
    datos.nombre && datos.nombre.length >= 3 && datos.descripcion && datos.descripcion.length >= 10;

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
          Paso 04 — Detalles
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-white">Definí tu curso</h1>
      </motion.div>

      {/* Grid de 2 columnas */}
      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        {/* Columna izquierda: Nombre y Descripción */}
        <div className="flex flex-col gap-3">
          {/* Nombre del curso */}
          <motion.div variants={item}>
            <label className="block text-[10px] font-semibold tracking-wider text-white/40 uppercase mb-1">
              Nombre del curso
            </label>
            <input
              type="text"
              value={datos.nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Aventuras Matemáticas en el Espacio"
              maxLength={200}
              className={`
                w-full px-3 py-2 rounded-lg bg-white/[0.03] border-2 transition-all duration-300
                text-white placeholder-white/30 text-sm
                focus:outline-none focus:ring-0
                ${
                  errores.nombre
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-white/10 focus:border-orange-500/50'
                }
              `}
            />
            <div className="flex justify-between mt-1">
              {errores.nombre ? (
                <p className="text-red-400 text-[10px]">{errores.nombre}</p>
              ) : (
                <p className="text-white/30 text-[10px]">Mín. 3 caracteres</p>
              )}
              <p className="text-white/30 text-[10px]">{datos.nombre.length}/200</p>
            </div>
          </motion.div>

          {/* Descripción */}
          <motion.div variants={item} className="flex-1 flex flex-col min-h-0">
            <label className="block text-[10px] font-semibold tracking-wider text-white/40 uppercase mb-1">
              Descripción
            </label>
            <textarea
              value={datos.descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describí de qué trata el curso..."
              maxLength={2000}
              className={`
                flex-1 w-full px-3 py-2 rounded-lg bg-white/[0.03] border-2 transition-all duration-300
                text-white placeholder-white/30 text-sm resize-none min-h-[80px]
                focus:outline-none focus:ring-0
                ${
                  errores.descripcion
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-white/10 focus:border-orange-500/50'
                }
              `}
            />
            <div className="flex justify-between mt-1">
              {errores.descripcion ? (
                <p className="text-red-400 text-[10px]">{errores.descripcion}</p>
              ) : (
                <p className="text-white/30 text-[10px]">Mín. 10 caracteres</p>
              )}
              <p className="text-white/30 text-[10px]">{datos.descripcion.length}/2000</p>
            </div>
          </motion.div>
        </div>

        {/* Columna derecha: Estética */}
        <div className="flex flex-col gap-3">
          {/* Estética Base */}
          <motion.div variants={item}>
            <label className="block text-[10px] font-semibold tracking-wider text-white/40 uppercase mb-1">
              Estética base
              <span className="text-emerald-500/70 font-normal ml-1">— Auto</span>
            </label>
            <div className="px-3 py-2 rounded-lg bg-white/[0.03] border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-base">
                  {esteticaActual?.emoji}
                </div>
                <div>
                  <p className="text-white font-medium text-sm capitalize">
                    {esteticaActual?.base || 'No definida'}
                  </p>
                  <p className="text-white/40 text-[10px]">
                    Mundo: {datos.mundo ? MUNDO_NOMBRES[datos.mundo] : '—'}
                  </p>
                </div>
              </div>
              <svg
                className="w-4 h-4 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </motion.div>

          {/* Variante temática */}
          <motion.div variants={item} className="flex-1">
            <label className="block text-[10px] font-semibold tracking-wider text-white/40 uppercase mb-1">
              Variante temática
              <span className="text-white/20 font-normal ml-1">(opcional)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {esteticaActual?.variantes.map((variante) => (
                <button
                  key={variante}
                  onClick={() => setEsteticaVariante(variante)}
                  className={`
                    px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300
                    border
                    ${
                      datos.esteticaVariante === variante
                        ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                        : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/25 hover:text-white'
                    }
                  `}
                >
                  {variante}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Actions - fijo abajo */}
      <motion.div
        variants={item}
        className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5"
      >
        <NavigationButtons
          onBack={pasoAnterior}
          onNext={siguientePaso}
          nextDisabled={!canContinue}
        />
      </motion.div>
    </motion.div>
  );
}
