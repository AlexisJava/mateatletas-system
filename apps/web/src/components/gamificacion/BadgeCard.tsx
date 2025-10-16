'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Badge Card Component
 *
 * Componente individual para mostrar un badge/logro.
 * Puede estar desbloqueado o bloqueado.
 *
 * Props:
 * - badge: Información del badge
 * - isLocked: Si está bloqueado
 * - index: Para animación escalonada
 */

export interface Badge {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  puntos: number;
  categoria: 'racha' | 'puntos' | 'asistencia' | 'excelencia' | 'especial';
  desbloqueado: boolean;
  fecha_desbloqueo?: Date | string;
  rareza?: 'comun' | 'raro' | 'epico' | 'legendario';
}

interface BadgeCardProps {
  badge: Badge;
  index?: number;
  onClick?: () => void;
}

const rarezaConfig = {
  comun: {
    gradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
    shadow: 'rgba(148, 163, 184, 0.5)',
    glow: '#94a3b8',
  },
  raro: {
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    shadow: 'rgba(59, 130, 246, 0.5)',
    glow: '#3b82f6',
  },
  epico: {
    gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
    shadow: 'rgba(168, 85, 247, 0.5)',
    glow: '#a855f7',
  },
  legendario: {
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    shadow: 'rgba(245, 158, 11, 0.5)',
    glow: '#f59e0b',
  },
};

export function BadgeCard({ badge, index = 0, onClick }: BadgeCardProps) {
  const rareza = rarezaConfig[badge.rareza || 'comun'];
  const isLocked = !badge.desbloqueado;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.05,
        duration: 0.3,
        ease: 'easeOut',
      }}
      whileHover={{ scale: isLocked ? 1 : 1.05, y: isLocked ? 0 : -4 }}
      onClick={onClick}
      className={`relative ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        background: isLocked
          ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          : rareza.gradient,
        borderRadius: '16px',
        border: '4px solid #000',
        boxShadow: isLocked
          ? '4px 4px 0 0 rgba(0, 0, 0, 1)'
          : `4px 4px 0 0 rgba(0, 0, 0, 1), 0 0 20px ${rareza.shadow}`,
        overflow: 'hidden',
      }}
    >
      {/* Brillo animado para desbloqueados */}
      {!isLocked && (
        <motion.div
          animate={{
            background: [
              `radial-gradient(circle at 30% 30%, ${rareza.glow}33 0%, transparent 70%)`,
              `radial-gradient(circle at 70% 70%, ${rareza.glow}33 0%, transparent 70%)`,
              `radial-gradient(circle at 30% 30%, ${rareza.glow}33 0%, transparent 70%)`,
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0"
        />
      )}

      <div className="relative p-6 flex flex-col items-center">
        {/* Icono del badge */}
        <div className="relative mb-4">
          {isLocked ? (
            <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center border-4 border-gray-700/50">
              <Lock className="w-10 h-10 text-gray-600" />
            </div>
          ) : (
            <motion.div
              animate={{
                rotate: [0, -5, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-7xl"
            >
              {badge.icono}
            </motion.div>
          )}
        </div>

        {/* Nombre */}
        <h3
          className={`text-lg font-bold text-center mb-2 ${
            isLocked ? 'text-gray-500' : 'text-white'
          }`}
          style={isLocked ? {} : { textShadow: '2px 2px 0 #000' }}
        >
          {isLocked ? '???' : badge.nombre}
        </h3>

        {/* Descripción */}
        <p
          className={`text-sm text-center mb-3 ${
            isLocked ? 'text-gray-600' : 'text-white/90'
          }`}
        >
          {isLocked ? 'Logro bloqueado' : badge.descripcion}
        </p>

        {/* Puntos */}
        {!isLocked && (
          <div
            className="px-3 py-1 rounded-full text-sm font-bold text-white flex items-center gap-1"
            style={{
              background: '#fbbf24',
              border: '2px solid #000',
              boxShadow: '2px 2px 0 0 rgba(0, 0, 0, 1)',
            }}
          >
            <span>+{badge.puntos} pts</span>
          </div>
        )}

        {/* Fecha de desbloqueo */}
        {!isLocked && badge.fecha_desbloqueo && (
          <p className="text-xs text-white/60 mt-2">
            Desbloqueado el {format(new Date(badge.fecha_desbloqueo), "d 'de' MMM", { locale: es })}
          </p>
        )}

        {/* Indicador de rareza */}
        {!isLocked && badge.rareza && badge.rareza !== 'comun' && (
          <div className="absolute top-2 right-2">
            <div
              className="px-2 py-1 rounded-full text-xs font-bold text-white"
              style={{
                background: rareza.gradient,
                border: '2px solid #000',
                textShadow: '1px 1px 0 #000',
              }}
            >
              {badge.rareza.toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
