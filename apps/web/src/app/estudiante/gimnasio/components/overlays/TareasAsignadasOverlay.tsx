'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, AlertCircle, BookOpen } from 'lucide-react';
import { useOverlayStack } from '../../contexts/OverlayStackProvider';
import { useState, useEffect } from 'react';
import { estudiantesApi } from '@/lib/api/estudiantes.api';

interface SectorData {
  id: string;
  nombre: string;
  descripcion: string | null;
  color: string;
  icono: string;
  grupos: Array<{
    id: string;
    codigo: string;
    nombre: string;
    link_meet: string | null;
  }>;
}

export function TareasAsignadasOverlay() {
  const { pop, push } = useOverlayStack();
  const [sectores, setSectores] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarSectores = async () => {
      try {
        setLoading(true);
        const data = await estudiantesApi.getMisSectores();
        setSectores(data);
      } catch (error) {
        console.error('Error al cargar sectores:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarSectores();
  }, []);

  // Mapeo de iconos por sector
  const getEmojiPorSector = (nombre: string): string => {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('matemática') || nombreLower.includes('matematica')) return '🔢';
    if (nombreLower.includes('programación') || nombreLower.includes('programacion')) return '💻';
    if (nombreLower.includes('ciencia')) return '🔬';
    return '📚';
  };

  // Configuración de colores por sector
  const getColorConfig = (nombre: string) => {
    const nombreLower = nombre.toLowerCase();

    if (nombreLower.includes('matemática') || nombreLower.includes('matematica')) {
      return {
        gradient: 'from-blue-500 to-cyan-600',
        glow: 'rgba(14, 165, 233, 0.4)',
        border: 'border-blue-500/40',
      };
    }

    if (nombreLower.includes('programación') || nombreLower.includes('programacion')) {
      return {
        gradient: 'from-purple-500 to-violet-600',
        glow: 'rgba(168, 85, 247, 0.4)',
        border: 'border-purple-500/40',
      };
    }

    if (nombreLower.includes('ciencia')) {
      return {
        gradient: 'from-green-500 to-emerald-600',
        glow: 'rgba(16, 185, 129, 0.4)',
        border: 'border-green-500/40',
      };
    }

    // Default
    return {
      gradient: 'from-orange-500 to-red-600',
      glow: 'rgba(249, 115, 22, 0.4)',
      border: 'border-orange-500/40',
    };
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm"
        onClick={pop}
      />

      {/* Modal Container FULLSCREEN */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-0 sm:inset-4 z-[9999] flex items-center justify-center p-0 sm:p-4"
      >
        {/* Panel principal */}
        <div
          className="relative w-full h-full sm:h-[95vh] sm:max-w-[1600px] overflow-hidden sm:rounded-3xl
                     bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900
                     border-2 border-white/20 shadow-[0_0_100px_rgba(139,92,246,0.5)]
                     flex flex-col"
        >
          {/* Botón cerrar - Flotante arriba derecha */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={pop}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[100] w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/50 flex items-center justify-center transition-colors backdrop-blur-xl"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
          </motion.button>

        {/* Header */}
        <div className="flex-shrink-0 p-4 sm:p-6 md:p-8 border-b border-white/10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-wide font-[family-name:var(--font-lilita)]"
            style={{
              textShadow: '0 0 30px rgba(139,92,246,0.8), 0 4px 0 rgba(0,0,0,0.4)',
            }}
          >
            MIS CURSOS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-cyan-300/80 text-xs sm:text-sm md:text-base mt-1 sm:mt-2"
          >
            {sectores.length} {sectores.length === 1 ? 'materia' : 'materias'} disponibles
          </motion.p>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white/60 text-lg sm:text-xl font-bold">Cargando cursos...</div>
            </div>
          ) : sectores.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 text-white/40" />
              <div className="text-white/60 text-lg sm:text-xl font-bold text-center">
                No estás inscrito en ningún curso todavía
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {sectores.map((sector, index) => {
                const config = getColorConfig(sector.nombre);
                const emoji = getEmojiPorSector(sector.nombre);
                const totalGrupos = sector.grupos.length;

                return (
                  <motion.div
                    key={sector.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      push({
                        type: 'planificaciones-sector',
                        sectorNombre: sector.nombre,
                        sectorColor: config.gradient,
                        sectorEmoji: emoji,
                      });
                    }}
                    className={`
                      relative rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2
                      bg-gradient-to-br ${config.gradient} ${config.border}
                      cursor-pointer hover:scale-[1.02] transition-all duration-200
                      min-h-[180px] sm:min-h-[200px]
                    `}
                    style={{
                      boxShadow: `0 0 30px ${config.glow}`,
                    }}
                  >
                    {/* Badge de disponible */}
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                      <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1
                                    bg-green-500/30 border border-green-400 rounded-md sm:rounded-lg">
                        <Sparkles className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-green-400" />
                        <span className="text-[10px] sm:text-xs font-bold text-green-300">DISPONIBLE</span>
                      </div>
                    </div>

                    {/* Emoji del sector */}
                    <div className="text-5xl sm:text-6xl mb-2 sm:mb-3">
                      {emoji}
                    </div>

                    {/* Título */}
                    <h3 className="text-lg sm:text-xl font-black mb-2 text-white">
                      {sector.nombre.toUpperCase()}
                    </h3>

                    {/* Descripción */}
                    {sector.descripcion && (
                      <p className="text-xs sm:text-sm mb-3 sm:mb-4 text-white/80 line-clamp-2">
                        {sector.descripcion}
                      </p>
                    )}

                    {/* Info de grupos */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white/70" />
                        <span className="text-[11px] sm:text-xs font-bold text-white/90">
                          {totalGrupos} {totalGrupos === 1 ? 'grupo' : 'grupos'}
                        </span>
                      </div>

                      {/* Lista de grupos (máximo 3 visibles) */}
                      <div className="flex flex-wrap gap-1 sm:gap-1.5">
                        {sector.grupos.slice(0, 3).map((grupo) => (
                          <div
                            key={grupo.id}
                            className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white/20 rounded-md text-[10px] sm:text-xs font-bold text-white"
                          >
                            {grupo.codigo}
                          </div>
                        ))}
                        {totalGrupos > 3 && (
                          <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white/10 rounded-md text-[10px] sm:text-xs font-bold text-white/70">
                            +{totalGrupos - 3}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-white/0 hover:bg-white/5 transition-colors rounded-xl sm:rounded-2xl" />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer con info */}
        <div className="flex-shrink-0 p-3 sm:p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-2 text-cyan-300">
            <AlertCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
            <p className="text-[10px] sm:text-xs font-bold">
              Hacé click en una materia para ver sus actividades y planificaciones
            </p>
          </div>
        </div>
        </div>
      </motion.div>
    </>
  );
}
