'use client';

import { motion } from 'framer-motion';
import { Calendar, User, MapPin } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Próxima Clase Card Component
 *
 * Card que muestra información de la próxima clase del estudiante.
 * Incluye:
 * - Ruta curricular
 * - Docente
 * - Fecha y hora
 * - Estado de reserva
 */

interface ProximaClaseCardProps {
  clase?: {
    id: string;
    ruta_curricular?: {
      nombre: string;
      color: string;
    } | null;
    rutaCurricular?: {
      nombre: string;
      color: string;
    } | null;
    docente: {
      nombre: string;
      apellido: string;
    };
    fecha_hora_inicio: Date | string;
    modalidad?: 'presencial' | 'virtual';
    cupos_disponibles?: number;
    cupo_maximo?: number | null;
    cupos_ocupados?: number | null;
    _count?: {
      inscripciones?: number;
    } | null;
  };
  onIrAClase?: () => void;
  delay?: number;
}

export function ProximaClaseCard({ clase, onIrAClase, delay = 0 }: ProximaClaseCardProps) {
  if (!clase) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6 hover:shadow-xl transition-shadow"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">Próxima Clase</h3>
            <p className="text-gray-600 text-sm">No hay clases programadas</p>
          </div>
          <div className="text-3xl">📚</div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No tenés clases programadas</p>
          <p className="text-gray-400 text-xs mt-1">Reservá una clase para comenzar</p>
        </div>
      </motion.div>
    );
  }

  const fechaClase = new Date(clase.fecha_hora_inicio);
  const ruta = clase.ruta_curricular ?? clase.rutaCurricular;
  const rutaColor = ruta?.color ?? '#6366f1';
  const rutaNombre = ruta?.nombre ?? 'Clase Programada';

  const esHoy = format(fechaClase, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const esMañana =
    format(fechaClase, 'yyyy-MM-dd') ===
    format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

  // Mostrar día de la semana + hora
  const diaYHora = format(fechaClase, "EEEE HH:mm 'hs'", { locale: es });
  const diaMayus = diaYHora.charAt(0).toUpperCase() + diaYHora.slice(1);

  let badge = '';
  if (esHoy) {
    badge = 'HOY';
  } else if (esMañana) {
    badge = 'MAÑANA';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-cyan-900/30 backdrop-blur-sm rounded-2xl border-2 border-purple-500/30 p-6 hover:border-purple-400/50 transition-all shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-cyan-400" />
          <h3 className="text-base font-black text-white">PRÓXIMA CLASE</h3>
        </div>
        {badge && (
          <span className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-black rounded-lg">
            {badge}
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full shadow-lg"
            style={{ backgroundColor: rutaColor, boxShadow: `0 0 10px ${rutaColor}` }}
          />
          <span className="text-white font-bold text-base">{rutaNombre}</span>
        </div>

        <div className="flex items-center gap-2 text-base text-cyan-300">
          <User className="w-5 h-5" />
          <span>
            Prof. {clase.docente.nombre} {clase.docente.apellido}
          </span>
        </div>

        <div className="flex items-center gap-2 text-base font-bold text-orange-400">
          <Calendar className="w-5 h-5" />
          <span>{diaMayus}</span>
        </div>
      </div>
    </motion.div>
  );
}
