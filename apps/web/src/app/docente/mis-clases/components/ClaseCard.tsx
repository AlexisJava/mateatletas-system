import { motion } from 'framer-motion';
import {
  Video,
  FileText,
  Users,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Clase, EstadoClase } from '@/types/clases.types';

interface ClaseCardProps {
  clase: Clase;
  onIniciarClase: (id: string) => void;
  onCancelar: (id: string) => void;
  puedeCancelar: (clase: Clase) => boolean;
  puedeRegistrarAsistencia: (clase: Clase) => boolean;
  getEstadoColor: (estado: EstadoClase | 'Programada' | 'EnCurso' | 'Finalizada' | 'Cancelada') => string;
}

export function ClaseCard({
  clase,
  onIniciarClase,
  onCancelar,
  puedeCancelar,
  puedeRegistrarAsistencia,
  getEstadoColor,
}: ClaseCardProps) {
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

  // Mock data contextual
  const asistenciaPromedio = 85;
  const observacionesPendientes = 2;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-card p-5 border-l-4 hover:shadow-2xl hover:shadow-purple-200/30 dark:hover:shadow-purple-900/40 transition-all cursor-pointer group"
      style={{ borderLeftColor: clase.ruta_curricular?.color || '#8b5cf6' }}
      onClick={() => router.push(`/docente/grupos/${clase.id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-indigo-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
            {clase.titulo}
          </h3>
          {clase.ruta_curricular && (
            <span
              className="inline-block px-2 py-0.5 rounded-md text-xs font-bold mt-1"
              style={{
                backgroundColor: `${clase.ruta_curricular.color}20`,
                color: clase.ruta_curricular.color,
              }}
            >
              {clase.ruta_curricular.nombre}
            </span>
          )}
        </div>
        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getEstadoColor(clase.estado)}`}>
          {clase.estado}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          <span className="text-purple-600 dark:text-purple-300 font-medium truncate">
            {new Date(clase.fecha_hora_inicio).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          <span className="text-purple-600 dark:text-purple-300 font-medium">
            {clase.duracion_minutos}min
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          <span className="text-purple-600 dark:text-purple-300 font-medium">
            {clase.cupo_maximo - clase.cupo_disponible}/{clase.cupo_maximo}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-purple-600 dark:text-purple-300 font-medium">
            {asistenciaPromedio}%
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        {esHoy() && clase.estado === EstadoClase.Programada && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onIniciarClase(clase.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold shadow-lg shadow-purple-500/40 hover:from-violet-600 hover:to-purple-700 transition-all"
          >
            <Video className="w-4 h-4" />
            Iniciar
          </motion.button>
        )}

        {puedeRegistrarAsistencia(clase) && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/docente/clases/${clase.id}/asistencia`)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-100/60 dark:bg-purple-900/40 text-indigo-900 dark:text-white text-sm font-bold hover:bg-purple-200/70 dark:hover:bg-purple-800/50 transition-all"
          >
            <FileText className="w-4 h-4" />
            Asistencia
          </motion.button>
        )}

        {puedeCancelar(clase) && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCancelar(clase.id)}
            className="px-3 py-2 rounded-lg border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
          >
            <XCircle className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Contextual Info */}
      {observacionesPendientes > 0 && (
        <div className="mt-3 pt-3 border-t border-purple-200/30 dark:border-purple-700/30">
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            {observacionesPendientes} observación(es) pendiente(s)
          </div>
        </div>
      )}
    </motion.div>
  );
}
