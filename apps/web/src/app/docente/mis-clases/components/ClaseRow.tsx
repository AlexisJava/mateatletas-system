import { motion } from 'framer-motion';
import {
  Video,
  FileText,
  Users,
  Clock,
  Eye,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Clase, EstadoClase } from '@/types/clases.types';

interface ClaseRowProps {
  clase: Clase;
  onIniciarClase: (id: string) => void;
  puedeRegistrarAsistencia: (clase: Clase) => boolean;
  getEstadoColor: (estado: EstadoClase | 'Programada' | 'EnCurso' | 'Finalizada' | 'Cancelada') => string;
}

export function ClaseRow({
  clase,
  onIniciarClase,
  puedeRegistrarAsistencia,
  getEstadoColor,
}: ClaseRowProps) {
  const router = useRouter();

  const esHoy = () => {
    const hoy = new Date();
    const fechaClase = new Date(clase.fecha_hora_inicio);
    return (
      hoy.getDate() === fechaClase.getDate() &&
      hoy.getMonth() === fechaClase.getMonth() &&
      hoy.getFullYear() === fechaClase.getFullYear()
    );
  };

  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="glass-card p-4 border-l-4 hover:shadow-lg hover:shadow-purple-200/20 dark:hover:shadow-purple-900/30 transition-all"
      style={{ borderLeftColor: clase.ruta_curricular?.color || '#8b5cf6' }}
    >
      <div className="flex items-center gap-4">
        {/* Hora */}
        <div className="flex flex-col items-center justify-center w-20 flex-shrink-0">
          <div className="text-2xl font-black text-indigo-900 dark:text-white">
            {new Date(clase.fecha_hora_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-xs font-bold text-purple-600 dark:text-purple-300">
            {new Date(clase.fecha_hora_inicio).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-indigo-900 dark:text-white truncate">
                {clase.titulo}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                {clase.ruta_curricular && (
                  <span
                    className="px-2 py-0.5 rounded text-xs font-bold"
                    style={{
                      backgroundColor: `${clase.ruta_curricular.color}20`,
                      color: clase.ruta_curricular.color,
                    }}
                  >
                    {clase.ruta_curricular.nombre}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-300 font-medium">
                  <Users className="w-3.5 h-3.5" />
                  {clase.cupo_maximo - clase.cupo_disponible}/{clase.cupo_maximo}
                </span>
                <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-300 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {clase.duracion_minutos}min
                </span>
              </div>
            </div>

            {/* Estado */}
            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getEstadoColor(clase.estado)}`}>
              {clase.estado}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {esHoy() && clase.estado === EstadoClase.Programada && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onIniciarClase(clase.id)}
              className="px-3 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold shadow-lg shadow-purple-500/40"
            >
              <Video className="w-4 h-4" />
            </motion.button>
          )}

          {puedeRegistrarAsistencia(clase) && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/docente/clases/${clase.id}/asistencia`)}
              className="px-3 py-2 rounded-lg bg-purple-100/60 dark:bg-purple-900/40 text-indigo-900 dark:text-white text-sm font-bold"
            >
              <FileText className="w-4 h-4" />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/docente/grupos/${clase.id}`)}
            className="px-3 py-2 rounded-lg bg-purple-100/60 dark:bg-purple-900/40 text-indigo-900 dark:text-white text-sm font-bold"
          >
            <Eye className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
