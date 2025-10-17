import { motion } from 'framer-motion';
import { Clase, EstadoClase } from '@/types/clases.types';
import { ClaseCard } from './ClaseCard';
import { ClaseRow } from './ClaseRow';
import { ViewMode } from '../hooks/useMisClases';

interface ClasesListProps {
  title: string;
  icon: string;
  clases: Clase[];
  viewMode: ViewMode;
  onIniciarClase: (id: string) => void;
  onEnviarRecordatorio: (id: string) => void;
  onCancelar: (id: string) => void;
  puedeCancelar: (clase: Clase) => boolean;
  puedeRegistrarAsistencia: (clase: Clase) => boolean;
  getEstadoColor: (estado: EstadoClase | 'Programada' | 'EnCurso' | 'Finalizada' | 'Cancelada') => string;
  formatFecha: (isoDate: string) => string;
}

export function ClasesList({
  title,
  icon,
  clases,
  viewMode,
  onIniciarClase,
  onCancelar,
  puedeCancelar,
  puedeRegistrarAsistencia,
  getEstadoColor,
}: ClasesListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Group Header */}
      <div className="flex items-center gap-3 px-2">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-lg font-black text-indigo-900 dark:text-white">{title}</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-purple-300 to-transparent dark:from-purple-700"></div>
        <span className="text-sm font-bold text-purple-600 dark:text-purple-300">
          {clases.length}
        </span>
      </div>

      {/* Classes */}
      <div className={viewMode === 'card' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-3'}>
        {clases.map((clase, index) => (
          <motion.div
            key={clase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {viewMode === 'card' ? (
              <ClaseCard
                clase={clase}
                onIniciarClase={onIniciarClase}
                onCancelar={onCancelar}
                puedeCancelar={puedeCancelar}
                puedeRegistrarAsistencia={puedeRegistrarAsistencia}
                getEstadoColor={getEstadoColor}
              />
            ) : (
              <ClaseRow
                clase={clase}
                onIniciarClase={onIniciarClase}
                puedeRegistrarAsistencia={puedeRegistrarAsistencia}
                getEstadoColor={getEstadoColor}
              />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
