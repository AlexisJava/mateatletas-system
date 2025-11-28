'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeCard, Badge } from './BadgeCard';
import { X, Filter } from 'lucide-react';

/**
 * Badge Gallery Component
 *
 * Galería completa de badges/logros del estudiante.
 * Incluye:
 * - Grid responsive de badges
 * - Filtros por categoría
 * - Modal con detalles
 * - Progreso de colección
 * - Estados locked/unlocked
 *
 * Props:
 * - badges: Badge[] - Lista de todos los badges
 * - isOpen: boolean - Si la galería está abierta
 * - onClose: () => void - Callback al cerrar
 */

interface BadgeGalleryProps {
  badges: Badge[];
  isOpen: boolean;
  onClose: () => void;
}

const categorias = [
  { id: 'all', nombre: 'Todos', icon: '🏆' },
  { id: 'racha', nombre: 'Rachas', icon: '🔥' },
  { id: 'puntos', nombre: 'Puntos', icon: '💎' },
  { id: 'asistencia', nombre: 'Asistencia', icon: '📚' },
  { id: 'excelencia', nombre: 'Excelencia', icon: '⭐' },
  { id: 'especial', nombre: 'Especiales', icon: '🌟' },
];

export function BadgeGallery({ badges, isOpen, onClose }: BadgeGalleryProps) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('all');
  const [badgeSeleccionado, setBadgeSeleccionado] = useState<Badge | null>(null);

  // Filtrar badges por categoría
  const badgesFiltrados =
    categoriaSeleccionada === 'all'
      ? badges
      : badges.filter((b) => b.categoria === categoriaSeleccionada);

  // Calcular progreso
  const badgesDesbloqueados = badges.filter((b) => b.desbloqueado).length;
  const totalBadges = badges.length;
  const porcentajeProgreso = Math.round((badgesDesbloqueados / totalBadges) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />

          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full max-w-6xl max-h-[85vh] overflow-y-auto"
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                borderRadius: '24px',
                border: '6px solid #000',
                boxShadow: '12px 12px 0 0 rgba(0, 0, 0, 1)',
              }}
            >
              {/* Header */}
              <div
                className="sticky top-0 z-10 px-8 py-6 border-b-4 border-black"
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2
                      className="text-4xl font-bold text-white"
                      style={{ textShadow: '3px 3px 0 #000' }}
                    >
                      🏆 GALERÍA DE LOGROS
                    </h2>
                    <p
                      className="text-white/90 font-semibold mt-2"
                      style={{ textShadow: '1px 1px 0 #000' }}
                    >
                      Colecciona todos los logros y conviértete en leyenda
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-14 h-14 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    style={{
                      border: '3px solid #000',
                      boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 1)',
                    }}
                  >
                    <X className="w-7 h-7 text-white" />
                  </button>
                </div>

                {/* Progreso */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className="text-sm font-bold text-white"
                      style={{ textShadow: '1px 1px 0 #000' }}
                    >
                      Progreso: {badgesDesbloqueados}/{totalBadges}
                    </span>
                    <span
                      className="text-sm font-bold text-white"
                      style={{ textShadow: '1px 1px 0 #000' }}
                    >
                      {porcentajeProgreso}%
                    </span>
                  </div>
                  <div
                    className="w-full h-4 rounded-full overflow-hidden"
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '3px solid #000',
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${porcentajeProgreso}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full"
                      style={{
                        background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Filtros */}
              <div className="sticky top-[140px] z-10 px-8 py-4 border-b-4 border-black bg-slate-900/95 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="w-5 h-5 text-white" />
                  <span className="text-white font-bold">Filtrar por:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categorias.map((cat) => {
                    const isSelected = categoriaSeleccionada === cat.id;
                    return (
                      <motion.button
                        key={cat.id}
                        onClick={() => setCategoriaSeleccionada(cat.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-2"
                        style={{
                          background: isSelected
                            ? 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)'
                            : 'rgba(255, 255, 255, 0.1)',
                          border: '3px solid #000',
                          boxShadow: isSelected
                            ? '4px 4px 0 0 rgba(0, 0, 0, 1)'
                            : '2px 2px 0 0 rgba(0, 0, 0, 1)',
                        }}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.nombre}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Grid de Badges */}
              <div className="p-8">
                {badgesFiltrados.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-white/70 text-lg">No hay logros en esta categoría</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {badgesFiltrados.map((badge, index) => (
                      <BadgeCard
                        key={badge.id}
                        badge={badge}
                        index={index}
                        onClick={() => badge.desbloqueado && setBadgeSeleccionado(badge)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Modal de detalles del badge */}
          {badgeSeleccionado && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[150] flex items-center justify-center p-4"
              onClick={() => setBadgeSeleccionado(null)}
            >
              <div
                className="w-full max-w-md p-8 text-center"
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                  borderRadius: '20px',
                  border: '6px solid #000',
                  boxShadow: '12px 12px 0 0 rgba(0, 0, 0, 1)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-8xl mb-4">{badgeSeleccionado.icono}</div>
                <h3
                  className="text-3xl font-bold text-white mb-3"
                  style={{ textShadow: '2px 2px 0 #000' }}
                >
                  {badgeSeleccionado.nombre}
                </h3>
                <p className="text-white/90 text-lg mb-4">{badgeSeleccionado.descripcion}</p>
                <div
                  className="inline-block px-6 py-3 rounded-full text-lg font-bold text-white mb-4"
                  style={{
                    background: '#fbbf24',
                    border: '3px solid #000',
                    boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 1)',
                  }}
                >
                  +{badgeSeleccionado.puntos} puntos
                </div>
                <button
                  onClick={() => setBadgeSeleccionado(null)}
                  className="w-full py-3 px-6 text-lg font-bold text-white rounded-xl"
                  style={{
                    background: 'rgba(0,0,0,0.2)',
                    border: '4px solid #000',
                    boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 1)',
                    textShadow: '2px 2px 0 #000',
                  }}
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
