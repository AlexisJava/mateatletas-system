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

type ColorKey = 'emerald' | 'blue' | 'purple' | 'orange' | 'cyan' | 'green';

const CASAS: Array<{
  id: 'QUANTUM' | 'VERTEX' | 'PULSAR';
  emoji: string;
  nombre: string;
  edades: string;
  descripcion: string;
  color: ColorKey;
}> = [
  {
    id: 'QUANTUM',
    emoji: '⚛️',
    nombre: 'Quantum',
    edades: '6 - 9 años',
    descripcion: 'Exploradores curiosos',
    color: 'emerald',
  },
  {
    id: 'VERTEX',
    emoji: '🔷',
    nombre: 'Vertex',
    edades: '10 - 12 años',
    descripcion: 'Constructores de ideas',
    color: 'blue',
  },
  {
    id: 'PULSAR',
    emoji: '💫',
    nombre: 'Pulsar',
    edades: '13 - 17 años',
    descripcion: 'Pensadores abstractos',
    color: 'purple',
  },
];

const MUNDOS: Array<{
  id: 'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS';
  emoji: string;
  nombre: string;
  subtitulo: string;
  descripcion: string;
  color: ColorKey;
}> = [
  {
    id: 'MATEMATICA',
    emoji: '🔢',
    nombre: 'Matemática',
    subtitulo: 'Números y lógica',
    descripcion: 'Aritmética, álgebra, geometría',
    color: 'orange',
  },
  {
    id: 'PROGRAMACION',
    emoji: '💻',
    nombre: 'Programación',
    subtitulo: 'Código y algoritmos',
    descripcion: 'Pensamiento computacional',
    color: 'cyan',
  },
  {
    id: 'CIENCIAS',
    emoji: '🔬',
    nombre: 'Ciencias',
    subtitulo: 'Física y química',
    descripcion: 'Exploración natural',
    color: 'green',
  },
];

const COLOR_CLASSES: Record<
  ColorKey,
  { border: string; bg: string; text: string; iconBg: string }
> = {
  emerald: {
    border: 'border-emerald-500',
    bg: 'bg-emerald-500/5',
    text: 'text-emerald-400',
    iconBg: 'bg-emerald-500/20',
  },
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-500/5',
    text: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
  },
  purple: {
    border: 'border-purple-500',
    bg: 'bg-purple-500/5',
    text: 'text-purple-400',
    iconBg: 'bg-purple-500/20',
  },
  orange: {
    border: 'border-orange-500',
    bg: 'bg-orange-500/5',
    text: 'text-orange-400',
    iconBg: 'bg-orange-500/20',
  },
  cyan: {
    border: 'border-cyan-500',
    bg: 'bg-cyan-500/5',
    text: 'text-cyan-400',
    iconBg: 'bg-cyan-500/20',
  },
  green: {
    border: 'border-green-500',
    bg: 'bg-green-500/5',
    text: 'text-green-400',
    iconBg: 'bg-green-500/20',
  },
};

export function WizardPaso2() {
  const { datos, errores, setCasa, setMundo, siguientePaso, pasoAnterior } = useStudioWizardStore();

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Title section */}
      <motion.div variants={item} className="mb-8">
        <p className="text-xs font-semibold tracking-[0.3em] text-orange-500 uppercase mb-3">
          Paso 02 — Destino
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white leading-tight mb-4">
          Elegí el destino
        </h1>
        <p className="text-base font-normal text-white/60 max-w-lg leading-relaxed">
          Seleccioná la casa (rango de edad) y el mundo (área de conocimiento).
        </p>
      </motion.div>

      {/* CASA Section */}
      <motion.div variants={item} className="mb-8">
        <p className="text-xs font-semibold tracking-wider text-white/40 uppercase mb-4">
          Casa — Rango de edad
        </p>
        <div className="grid grid-cols-3 gap-4">
          {CASAS.map((casa) => {
            const selected = datos.casa === casa.id;
            const colors = COLOR_CLASSES[casa.color];

            return (
              <button
                key={casa.id}
                onClick={() => setCasa(casa.id)}
                className={`
                  group relative text-left p-5 rounded-xl transition-all duration-300
                  border-2
                  ${selected ? `${colors.border} ${colors.bg}` : 'border-white/10 hover:border-white/25 bg-white/[0.02]'}
                `}
              >
                {selected && (
                  <div
                    className={`absolute top-4 right-4 w-5 h-5 rounded-full ${colors.border.replace('border-', 'bg-')} flex items-center justify-center`}
                  >
                    <svg
                      className="w-3 h-3 text-black"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 ${selected ? colors.iconBg : 'bg-white/5'}`}
                >
                  {casa.emoji}
                </div>
                <h3 className="text-base font-semibold text-white mb-1">{casa.nombre}</h3>
                <p className={`${colors.text} text-xs font-semibold mb-1`}>{casa.edades}</p>
                <p className="text-white/40 text-xs">{casa.descripcion}</p>
              </button>
            );
          })}
        </div>
        {errores.casa && <p className="text-red-400 text-xs mt-2">{errores.casa}</p>}
      </motion.div>

      {/* MUNDO Section */}
      <motion.div variants={item} className="mb-8">
        <p className="text-xs font-semibold tracking-wider text-white/40 uppercase mb-4">
          Mundo — Área de conocimiento
        </p>
        <div className="grid grid-cols-3 gap-4">
          {MUNDOS.map((mundo) => {
            const selected = datos.mundo === mundo.id;
            const colors = COLOR_CLASSES[mundo.color];

            return (
              <button
                key={mundo.id}
                onClick={() => setMundo(mundo.id)}
                className={`
                  group relative text-left p-5 rounded-xl transition-all duration-300
                  border-2
                  ${selected ? `${colors.border} ${colors.bg}` : 'border-white/10 hover:border-white/25 bg-white/[0.02]'}
                `}
              >
                {selected && (
                  <div
                    className={`absolute top-4 right-4 w-5 h-5 rounded-full ${colors.border.replace('border-', 'bg-')} flex items-center justify-center`}
                  >
                    <svg
                      className="w-3 h-3 text-black"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 ${selected ? colors.iconBg : 'bg-white/5'}`}
                >
                  {mundo.emoji}
                </div>
                <h3 className="text-base font-semibold text-white mb-1">{mundo.nombre}</h3>
                <p className={`${colors.text} text-xs font-semibold mb-1`}>{mundo.subtitulo}</p>
                <p className="text-white/40 text-xs">{mundo.descripcion}</p>
              </button>
            );
          })}
        </div>
        {errores.mundo && <p className="text-red-400 text-xs mt-2">{errores.mundo}</p>}
      </motion.div>

      {/* Actions */}
      <motion.div variants={item} className="flex items-center gap-4">
        <NavigationButtons
          onBack={pasoAnterior}
          onNext={siguientePaso}
          nextDisabled={!datos.casa || !datos.mundo}
        />
        {datos.casa && datos.mundo && (
          <p className="text-xs text-white/50">
            {datos.casa} + {datos.mundo}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
