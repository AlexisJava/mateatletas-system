'use client';

import { motion } from 'framer-motion';
import type { Logro } from '@/types/gamificacion';
import { getColorRareza } from '@/lib/utils/gamificacion.utils';
import { useState } from 'react';
import { LogroModal } from './LogroModal';

interface LogroCardProps {
  logro: Logro;
  desbloqueado: boolean;
  fecha_desbloqueo?: Date | null;
}

export function LogroCard({ logro, desbloqueado, fecha_desbloqueo }: LogroCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const rareza = (logro.rareza ?? 'comun') as 'comun' | 'raro' | 'epico' | 'legendario';
  const colores = getColorRareza(rareza);
  const monedas = logro.monedas_recompensa ?? 0;
  const xp = logro.xp_recompensa ?? 0;
  const esSecreto = Boolean(logro.secreto);
  const fecha = fecha_desbloqueo ? new Date(fecha_desbloqueo) : null;

  return (
    <>
      <motion.button
        onClick={() => setModalOpen(true)}
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        className={`relative rounded-xl p-4 transition-all ${
          desbloqueado
            ? `bg-gradient-to-br ${colores.gradient} shadow-lg`
            : 'bg-gray-800 opacity-50'
        }`}
      >
        {/* Badge de rareza */}
        <div className="absolute top-2 right-2">
          <span
            className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
              desbloqueado ? 'bg-white/90 text-gray-800' : 'bg-gray-700 text-gray-400'
            }`}
          >
            {rareza}
          </span>
        </div>

        {/* Icono */}
        <div className="mb-3">
          <motion.div
            className={`text-6xl ${desbloqueado ? '' : 'grayscale'}`}
            animate={desbloqueado ? { rotate: [0, -10, 10, -10, 0] } : {}}
            transition={desbloqueado ? { repeat: Infinity, duration: 3, repeatDelay: 2 } : {}}
          >
            {desbloqueado ? logro.icono : '🔒'}
          </motion.div>
        </div>

        {/* Nombre */}
        <h3 className={`font-bold text-lg mb-2 ${desbloqueado ? 'text-white' : 'text-gray-400'}`}>
          {esSecreto && !desbloqueado ? '???' : logro.nombre}
        </h3>

        {/* Descripción */}
        <p
          className={`text-sm mb-3 line-clamp-2 ${
            desbloqueado ? 'text-white/90' : 'text-gray-500'
          }`}
        >
          {esSecreto && !desbloqueado ? 'Logro secreto. ¡Descúbrelo jugando!' : logro.descripcion}
        </p>

        {/* Recompensas */}
        {desbloqueado && (
          <div className="flex items-center justify-center gap-3 text-white font-semibold">
            {monedas > 0 && (
              <div className="flex items-center gap-1">
                <span>💰</span>
                <span>+{monedas}</span>
              </div>
            )}
            {xp > 0 && (
              <div className="flex items-center gap-1">
                <span>⚡</span>
                <span>+{xp}</span>
              </div>
            )}
          </div>
        )}

        {/* Fecha de desbloqueo */}
        {desbloqueado && fecha && (
          <p className="text-white/70 text-xs mt-2">
            Desbloqueado: {fecha.toLocaleDateString('es-AR')}
          </p>
        )}

        {/* Efecto brillante si está desbloqueado */}
        {desbloqueado && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
          />
        )}
      </motion.button>

      <LogroModal
        logro={logro}
        desbloqueado={desbloqueado}
        fecha_desbloqueo={fecha_desbloqueo}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
