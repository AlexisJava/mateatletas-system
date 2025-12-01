'use client';

import { motion } from 'framer-motion';
import { useStudioWizardStore } from '@/store/studio-wizard.store';
import { NavigationButtons } from './shared';

const EMOJIS = {
  casa: { QUANTUM: '⚛️', VERTEX: '🔷', PULSAR: '💫' },
  mundo: { MATEMATICA: '🔢', PROGRAMACION: '💻', CIENCIAS: '🔬' },
  tipoExperiencia: {
    NARRATIVO: '📖',
    EXPEDICION: '🗺️',
    LABORATORIO: '🧪',
    SIMULACION: '🎮',
    PROYECTO: '🛠️',
    DESAFIO: '🏆',
  },
  materia: { MATEMATICA_ESCOLAR: '🔢', FISICA: '⚡', QUIMICA: '🧪', PROGRAMACION: '💻' },
  tier: { ARCADE: '🎮', ARCADE_PLUS: '🚀', PRO: '👑' },
} as const;

const COLOR_CLASSES = {
  casa: { QUANTUM: 'text-emerald-400', VERTEX: 'text-blue-400', PULSAR: 'text-purple-400' },
  mundo: {
    MATEMATICA: 'text-orange-400',
    PROGRAMACION: 'text-cyan-400',
    CIENCIAS: 'text-green-400',
  },
  tier: { ARCADE: 'text-emerald-400', ARCADE_PLUS: 'text-blue-400', PRO: 'text-purple-400' },
} as const;

export function WizardPaso6() {
  const { datos, isSubmitting, irAPaso, pasoAnterior, crearCurso } = useStudioWizardStore();

  const handleCrearCurso = async () => {
    const cursoId = await crearCurso();
    if (cursoId) {
      alert(`Curso creado con ID: ${cursoId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col min-h-0"
    >
      {/* Header compacto */}
      <div className="mb-3">
        <p className="text-xs font-semibold tracking-[0.3em] text-orange-500 uppercase mb-1">
          Paso 06 — Confirmación
        </p>
        <h1 className="text-2xl font-bold text-white">Revisá tu curso</h1>
      </div>

      {/* Bento Grid - compacto */}
      <div className="flex-1 grid grid-cols-12 gap-2 min-h-0">
        {/* Columna izquierda - Nombre y descripción (span 5) */}
        <div className="col-span-5 flex flex-col gap-2">
          {/* Nombre del curso - Card principal */}
          <button
            onClick={() => irAPaso(4)}
            className="flex-1 p-3 rounded-lg bg-white/[0.03] border border-white/10 hover:border-orange-500/30 hover:bg-white/[0.05] transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold tracking-wider text-white/30 uppercase">
                Nombre
              </span>
              <span className="text-[10px] text-orange-500/0 group-hover:text-orange-500/70 transition-colors">
                editar
              </span>
            </div>
            <h2 className="text-base font-bold text-white leading-tight mb-1">
              {datos.nombre || 'Sin nombre'}
            </h2>
            <p className="text-xs text-white/50 line-clamp-2">
              {datos.descripcion || 'Sin descripción'}
            </p>
          </button>

          {/* Fila: Categoría + Estética */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => irAPaso(1)}
              className="p-2 rounded-lg bg-white/[0.03] border border-white/10 hover:border-orange-500/30 hover:bg-white/[0.05] transition-all text-left"
            >
              <span className="text-[9px] font-semibold tracking-wider text-white/30 uppercase block">
                Categoría
              </span>
              <span className="text-xs font-semibold text-orange-400">
                {datos.categoria === 'EXPERIENCIA' ? 'Experiencia' : 'Curricular'}
              </span>
            </button>
            <button
              onClick={() => irAPaso(4)}
              className="p-2 rounded-lg bg-white/[0.03] border border-white/10 hover:border-orange-500/30 hover:bg-white/[0.05] transition-all text-left"
            >
              <span className="text-[9px] font-semibold tracking-wider text-white/30 uppercase block">
                Estética
              </span>
              <span className="text-xs font-semibold text-white capitalize">
                {datos.esteticaBase}
                {datos.esteticaVariante && datos.esteticaVariante !== 'Default' && (
                  <span className="text-white/40 ml-1">+{datos.esteticaVariante}</span>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Columna derecha - Grid de datos (span 7) */}
        <div className="col-span-7 grid grid-cols-2 grid-rows-3 gap-2">
          {/* Casa */}
          <button
            onClick={() => irAPaso(2)}
            className="p-2 rounded-lg bg-white/[0.03] border border-white/10 hover:border-orange-500/30 hover:bg-white/[0.05] transition-all text-left"
          >
            <span className="text-[9px] font-semibold tracking-wider text-white/30 uppercase block">
              Casa
            </span>
            <div className="flex items-center gap-1">
              <span className="text-sm">{datos.casa && EMOJIS.casa[datos.casa]}</span>
              <span className={`text-xs font-bold ${datos.casa && COLOR_CLASSES.casa[datos.casa]}`}>
                {datos.casa}
              </span>
            </div>
          </button>

          {/* Mundo */}
          <button
            onClick={() => irAPaso(2)}
            className="p-2 rounded-lg bg-white/[0.03] border border-white/10 hover:border-orange-500/30 hover:bg-white/[0.05] transition-all text-left"
          >
            <span className="text-[9px] font-semibold tracking-wider text-white/30 uppercase block">
              Mundo
            </span>
            <div className="flex items-center gap-1">
              <span className="text-sm">{datos.mundo && EMOJIS.mundo[datos.mundo]}</span>
              <span
                className={`text-xs font-bold ${datos.mundo && COLOR_CLASSES.mundo[datos.mundo]}`}
              >
                {datos.mundo === 'MATEMATICA'
                  ? 'Matemática'
                  : datos.mundo === 'PROGRAMACION'
                    ? 'Prog.'
                    : 'Ciencias'}
              </span>
            </div>
          </button>

          {/* Tipo/Materia - span 2 columnas */}
          <button
            onClick={() => irAPaso(3)}
            className="col-span-2 p-2 rounded-lg bg-white/[0.03] border border-white/10 hover:border-orange-500/30 hover:bg-white/[0.05] transition-all text-left"
          >
            <span className="text-[9px] font-semibold tracking-wider text-white/30 uppercase block">
              {datos.categoria === 'EXPERIENCIA' ? 'Tipo' : 'Materia'}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-sm">
                {datos.categoria === 'EXPERIENCIA' &&
                  datos.tipoExperiencia &&
                  EMOJIS.tipoExperiencia[datos.tipoExperiencia]}
                {datos.categoria === 'CURRICULAR' && datos.materia && EMOJIS.materia[datos.materia]}
              </span>
              <span className="text-xs font-bold text-white">
                {datos.categoria === 'EXPERIENCIA'
                  ? datos.tipoExperiencia
                  : datos.materia?.replace('_', ' ')}
              </span>
            </div>
          </button>

          {/* Duración */}
          <button
            onClick={() => irAPaso(5)}
            className="p-2 rounded-lg bg-white/[0.03] border border-white/10 hover:border-orange-500/30 hover:bg-white/[0.05] transition-all text-left"
          >
            <span className="text-[9px] font-semibold tracking-wider text-white/30 uppercase block">
              Duración
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-white">{datos.cantidadSemanas}</span>
              <span className="text-[10px] text-white/40">sem</span>
              <span className="text-white/20">×</span>
              <span className="text-lg font-bold text-white">{datos.actividadesPorSemana}</span>
              <span className="text-[10px] text-orange-400">
                ={datos.cantidadSemanas * datos.actividadesPorSemana}
              </span>
            </div>
          </button>

          {/* Tier */}
          <button
            onClick={() => irAPaso(5)}
            className="p-2 rounded-lg bg-white/[0.03] border border-white/10 hover:border-orange-500/30 hover:bg-white/[0.05] transition-all text-left"
          >
            <span className="text-[9px] font-semibold tracking-wider text-white/30 uppercase block">
              Tier
            </span>
            <div className="flex items-center gap-1">
              <span className="text-sm">{datos.tierMinimo && EMOJIS.tier[datos.tierMinimo]}</span>
              <span
                className={`text-xs font-bold ${datos.tierMinimo && COLOR_CLASSES.tier[datos.tierMinimo]}`}
              >
                {datos.tierMinimo === 'ARCADE_PLUS' ? 'ARCADE+' : datos.tierMinimo}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
        <NavigationButtons
          onBack={pasoAnterior}
          onNext={handleCrearCurso}
          nextLabel="CREAR CURSO"
          isSubmitting={isSubmitting}
          variant="submit"
        />
      </div>
    </motion.div>
  );
}
