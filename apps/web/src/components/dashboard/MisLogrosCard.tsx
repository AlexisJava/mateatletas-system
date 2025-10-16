'use client';

import { motion } from 'framer-motion';
import { ActivityCard } from './ActivityCard';
import { Award, Zap, Target } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Mis Logros Card Component
 *
 * Card que muestra los logros recientes del estudiante.
 * Incluye:
 * - Últimos logros desbloqueados
 * - Icono y nombre del logro
 * - Puntos ganados
 * - Fecha de desbloqueo
 */

interface Logro {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  puntos: number;
  fecha_desbloqueo?: Date | string;
  categoria?: 'racha' | 'puntos' | 'asistencia' | 'excelencia';
}

interface MisLogrosCardProps {
  estudianteId?: string;
  logros?: Logro[];
  onVerTodos?: () => void;
  delay?: number;
}

const categoriaConfig = {
  racha: { color: '#f97316', icon: Zap },
  puntos: { color: '#fbbf24', icon: Target },
  asistencia: { color: '#10b981', icon: Award },
  excelencia: { color: '#a855f7', icon: Award },
};

export function MisLogrosCard({ estudianteId, logros = [], onVerTodos, delay = 0 }: MisLogrosCardProps) {
  // Mock data si no hay logros
  const mockLogros: Logro[] = [
    {
      id: '1',
      nombre: 'Racha de Fuego',
      descripcion: '7 días seguidos asistiendo',
      icono: '🔥',
      puntos: 100,
      fecha_desbloqueo: new Date(Date.now() - 86400000),
      categoria: 'racha',
    },
    {
      id: '2',
      nombre: 'Maestro del Álgebra',
      descripcion: 'Completaste 10 ejercicios perfectos',
      icono: '🎯',
      puntos: 50,
      fecha_desbloqueo: new Date(Date.now() - 172800000),
      categoria: 'excelencia',
    },
    {
      id: '3',
      nombre: 'Acumulador',
      descripcion: 'Alcanzaste 1000 puntos totales',
      icono: '💎',
      puntos: 200,
      fecha_desbloqueo: new Date(Date.now() - 259200000),
      categoria: 'puntos',
    },
  ];

  const logrosData = logros.length > 0 ? logros : mockLogros;
  const ultimosLogros = logrosData.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-6 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">Mis Logros</h3>
          <p className="text-gray-600 text-sm">Últimos badges desbloqueados</p>
        </div>
        <div className="text-3xl">🏆</div>
      </div>

      {ultimosLogros.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">Todavía no tenés logros desbloqueados</p>
          <p className="text-gray-400 text-xs mt-1">¡Seguí participando para desbloquearlos!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ultimosLogros.map((logro, index) => {
            const categoria = categoriaConfig[logro.categoria || 'excelencia'];

            return (
              <motion.div
                key={logro.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.1 + index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200"
              >
                <div className="text-3xl">{logro.icono}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800 text-sm truncate">{logro.nombre}</p>
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      +{logro.puntos}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{logro.descripcion}</p>
                  {logro.fecha_desbloqueo && (
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(logro.fecha_desbloqueo), "d 'de' MMMM", { locale: es })}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {logrosData.length > 3 && (
        <p className="text-center text-sm text-gray-500 mt-4">
          +{logrosData.length - 3} logros más
        </p>
      )}

      <button
        onClick={onVerTodos}
        className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 rounded-xl hover:shadow-lg transition-all text-sm"
      >
        Ver Galería Completa →
      </button>
    </motion.div>
  );
}
