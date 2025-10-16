'use client';

import { motion } from 'framer-motion';
import { ActivityCard } from './ActivityCard';
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
    ruta_curricular: {
      nombre: string;
      color: string;
    };
    docente: {
      nombre: string;
      apellido: string;
    };
    fecha_hora_inicio: Date | string;
    modalidad?: 'presencial' | 'virtual';
    cupos_disponibles?: number;
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
  const esHoy = format(fechaClase, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const esMañana =
    format(fechaClase, 'yyyy-MM-dd') ===
    format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

  let tiempoRelativo = '';
  if (esHoy) {
    tiempoRelativo = 'Hoy';
  } else if (esMañana) {
    tiempoRelativo = 'Mañana';
  } else {
    tiempoRelativo = formatDistanceToNow(fechaClase, {
      addSuffix: true,
      locale: es,
    });
  }

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
          <p className="text-gray-600 text-sm">{tiempoRelativo}</p>
        </div>
        <div className="text-3xl">📚</div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-4 border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: clase.ruta_curricular.color }}
          />
          <h4 className="font-bold text-gray-800 text-lg">{clase.ruta_curricular.nombre}</h4>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
          <User className="w-4 h-4" />
          <span>
            Prof. {clase.docente.nombre} {clase.docente.apellido}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
          <Calendar className="w-4 h-4" />
          <span>{format(fechaClase, "HH:mm 'hs'", { locale: es })}</span>
        </div>

        {clase.modalidad && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <MapPin className="w-4 h-4" />
            <span className="capitalize">{clase.modalidad}</span>
          </div>
        )}
      </div>

      {clase.cupos_disponibles !== undefined && clase.cupos_disponibles > 0 && (
        <div
          className={`text-center py-2 rounded-lg mb-4 ${
            clase.cupos_disponibles <= 3 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
        >
          <p className="text-sm font-semibold">
            {clase.cupos_disponibles} {clase.cupos_disponibles === 1 ? 'cupo' : 'cupos'}{' '}
            {clase.cupos_disponibles <= 3 ? '¡Últimos!' : 'disponibles'}
          </p>
        </div>
      )}

      {onIrAClase && esHoy && (
        <button
          onClick={onIrAClase}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all"
        >
          ¡Ir a la Clase!
        </button>
      )}
    </motion.div>
  );
}
