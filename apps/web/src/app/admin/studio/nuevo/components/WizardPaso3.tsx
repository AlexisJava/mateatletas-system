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

type ColorKey = 'violet' | 'amber' | 'teal' | 'sky' | 'rose' | 'orange' | 'blue' | 'green' | 'cyan';

type TipoExpId = 'NARRATIVO' | 'EXPEDICION' | 'LABORATORIO' | 'SIMULACION' | 'PROYECTO' | 'DESAFIO';
type MateriaId = 'MATEMATICA_ESCOLAR' | 'FISICA' | 'QUIMICA' | 'PROGRAMACION';

const TIPOS_EXPERIENCIA: Array<{
  id: TipoExpId;
  emoji: string;
  nombre: string;
  subtitulo: string;
  descripcion: string;
  color: ColorKey;
}> = [
  {
    id: 'NARRATIVO',
    emoji: '📖',
    nombre: 'Narrativo',
    subtitulo: 'Historia inmersiva',
    descripcion: 'Aventura con personajes y trama',
    color: 'violet',
  },
  {
    id: 'EXPEDICION',
    emoji: '🗺️',
    nombre: 'Expedición',
    subtitulo: 'Exploración guiada',
    descripcion: 'Descubrimiento progresivo',
    color: 'amber',
  },
  {
    id: 'LABORATORIO',
    emoji: '🧪',
    nombre: 'Laboratorio',
    subtitulo: 'Experimentación',
    descripcion: 'Prueba y error científico',
    color: 'teal',
  },
  {
    id: 'SIMULACION',
    emoji: '🎮',
    nombre: 'Simulación',
    subtitulo: 'Mundo virtual',
    descripcion: 'Escenarios interactivos',
    color: 'sky',
  },
  {
    id: 'PROYECTO',
    emoji: '🛠️',
    nombre: 'Proyecto',
    subtitulo: 'Construcción guiada',
    descripcion: 'Crear algo tangible',
    color: 'rose',
  },
  {
    id: 'DESAFIO',
    emoji: '🏆',
    nombre: 'Desafío',
    subtitulo: 'Competencia',
    descripcion: 'Retos y logros',
    color: 'orange',
  },
];

const MATERIAS: Array<{
  id: MateriaId;
  emoji: string;
  nombre: string;
  subtitulo: string;
  descripcion: string;
  color: ColorKey;
}> = [
  {
    id: 'MATEMATICA_ESCOLAR',
    emoji: '🔢',
    nombre: 'Matemática',
    subtitulo: 'Escolar',
    descripcion: 'Aritmética, álgebra, geometría y más.',
    color: 'orange',
  },
  {
    id: 'FISICA',
    emoji: '⚡',
    nombre: 'Física',
    subtitulo: 'Ciencias exactas',
    descripcion: 'Mecánica, energía, ondas y más.',
    color: 'blue',
  },
  {
    id: 'QUIMICA',
    emoji: '🧪',
    nombre: 'Química',
    subtitulo: 'Ciencias naturales',
    descripcion: 'Elementos, reacciones, compuestos.',
    color: 'green',
  },
  {
    id: 'PROGRAMACION',
    emoji: '💻',
    nombre: 'Programación',
    subtitulo: 'Tecnología',
    descripcion: 'Código, algoritmos, lógica.',
    color: 'cyan',
  },
];

const COLOR_CLASSES: Record<
  ColorKey,
  { border: string; bg: string; text: string; iconBg: string }
> = {
  violet: {
    border: 'border-violet-500',
    bg: 'bg-violet-500/5',
    text: 'text-violet-400',
    iconBg: 'bg-violet-500/20',
  },
  amber: {
    border: 'border-amber-500',
    bg: 'bg-amber-500/5',
    text: 'text-amber-400',
    iconBg: 'bg-amber-500/20',
  },
  teal: {
    border: 'border-teal-500',
    bg: 'bg-teal-500/5',
    text: 'text-teal-400',
    iconBg: 'bg-teal-500/20',
  },
  sky: {
    border: 'border-sky-500',
    bg: 'bg-sky-500/5',
    text: 'text-sky-400',
    iconBg: 'bg-sky-500/20',
  },
  rose: {
    border: 'border-rose-500',
    bg: 'bg-rose-500/5',
    text: 'text-rose-400',
    iconBg: 'bg-rose-500/20',
  },
  orange: {
    border: 'border-orange-500',
    bg: 'bg-orange-500/5',
    text: 'text-orange-400',
    iconBg: 'bg-orange-500/20',
  },
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-500/5',
    text: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
  },
  green: {
    border: 'border-green-500',
    bg: 'bg-green-500/5',
    text: 'text-green-400',
    iconBg: 'bg-green-500/20',
  },
  cyan: {
    border: 'border-cyan-500',
    bg: 'bg-cyan-500/5',
    text: 'text-cyan-400',
    iconBg: 'bg-cyan-500/20',
  },
};

export function WizardPaso3() {
  const { datos, errores, setTipoExperiencia, setMateria, siguientePaso, pasoAnterior } =
    useStudioWizardStore();

  const isExperiencia = datos.categoria === 'EXPERIENCIA';
  const isCurricular = datos.categoria === 'CURRICULAR';

  const canContinue = isExperiencia ? !!datos.tipoExperiencia : !!datos.materia;

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Title section - dinámico según categoría */}
      <motion.div variants={item} className="mb-8">
        <p className="text-xs font-semibold tracking-[0.3em] text-orange-500 uppercase mb-3">
          Paso 03 — {isExperiencia ? 'Tipo de experiencia' : 'Materia'}
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white leading-tight mb-4">
          {isExperiencia ? '¿Qué tipo de experiencia?' : '¿Qué materia vas a enseñar?'}
        </h1>
        <p className="text-base font-normal text-white/60 max-w-lg leading-relaxed">
          {isExperiencia
            ? 'Elegí el formato narrativo que mejor se adapte a tu curso.'
            : 'Seleccioná la disciplina curricular para tu curso.'}
        </p>
      </motion.div>

      {/* Cards de EXPERIENCIA (6 opciones) */}
      {isExperiencia && (
        <motion.div variants={item} className="mb-8">
          <div className="grid grid-cols-3 gap-4">
            {TIPOS_EXPERIENCIA.map((tipo) => {
              const selected = datos.tipoExperiencia === tipo.id;
              const colors = COLOR_CLASSES[tipo.color];

              return (
                <button
                  key={tipo.id}
                  onClick={() => setTipoExperiencia(tipo.id)}
                  className={`
                    group relative text-left p-5 rounded-xl transition-all duration-300 border-2
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
                    {tipo.emoji}
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">{tipo.nombre}</h3>
                  <p className={`${colors.text} text-xs font-semibold mb-1`}>{tipo.subtitulo}</p>
                  <p className="text-white/40 text-xs">{tipo.descripcion}</p>
                </button>
              );
            })}
          </div>
          {errores.tipoExperiencia && (
            <p className="text-red-400 text-xs mt-3">{errores.tipoExperiencia}</p>
          )}
        </motion.div>
      )}

      {/* Cards de CURRICULAR (4 opciones) */}
      {isCurricular && (
        <motion.div variants={item} className="mb-8">
          <div className="grid grid-cols-2 gap-5">
            {MATERIAS.map((materia) => {
              const selected = datos.materia === materia.id;
              const colors = COLOR_CLASSES[materia.color];

              return (
                <button
                  key={materia.id}
                  onClick={() => setMateria(materia.id)}
                  className={`
                    group relative text-left p-6 rounded-xl transition-all duration-300 border-2
                    ${selected ? `${colors.border} ${colors.bg}` : 'border-white/10 hover:border-white/25 bg-white/[0.02]'}
                  `}
                >
                  {selected && (
                    <div
                      className={`absolute top-5 right-5 w-6 h-6 rounded-full ${colors.border.replace('border-', 'bg-')} flex items-center justify-center`}
                    >
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
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4 ${selected ? colors.iconBg : 'bg-white/5'}`}
                  >
                    {materia.emoji}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{materia.nombre}</h3>
                  <p className={`${colors.text} text-xs font-semibold mb-2`}>{materia.subtitulo}</p>
                  <p className="text-white/50 text-sm">{materia.descripcion}</p>
                </button>
              );
            })}
          </div>
          {errores.materia && <p className="text-red-400 text-xs mt-3">{errores.materia}</p>}
        </motion.div>
      )}

      {/* Actions */}
      <motion.div variants={item} className="flex items-center gap-4">
        <NavigationButtons
          onBack={pasoAnterior}
          onNext={siguientePaso}
          nextDisabled={!canContinue}
        />
        {canContinue && (
          <p className="text-xs text-white/50">
            Seleccionaste:{' '}
            <span className="text-orange-500 font-medium">
              {isExperiencia ? datos.tipoExperiencia : datos.materia?.replace('_', ' ')}
            </span>
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
