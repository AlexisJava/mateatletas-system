'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useOverlayStack } from '../../contexts/OverlayStackProvider';
import { useState, useEffect } from 'react';
import type { OverlayConfig } from '../../types/overlay.types';

interface PlanificacionCard {
  id: string;
  titulo: string;
  descripcion: string;
  semana: number;
  estado: 'bloqueada' | 'disponible';
  fecha_disponible?: string;
  total_actividades: number;
  actividades_completadas: number;
}

interface PlanificacionesSectorProps {
  config?: OverlayConfig;
  estudiante?: {
    nombre: string;
    apellido?: string;
    nivel_actual?: number;
    puntos_totales?: number;
    avatar_url?: string | null;
    id?: string;
  };
}

export function PlanificacionesSectorOverlay({ config }: PlanificacionesSectorProps) {
  const { pop } = useOverlayStack();

  // Extraer props del config
  const sectorNombre = config?.type === 'planificaciones-sector' ? config.sectorNombre : '';
  const _sectorColor = config?.type === 'planificaciones-sector' ? config.sectorColor : '';
  const sectorEmoji = config?.type === 'planificaciones-sector' ? config.sectorEmoji : '';
  const [planificaciones, setPlanificaciones] = useState<PlanificacionCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarPlanificaciones = async () => {
      try {
        setLoading(true);

        // TODO: Aquí irá el endpoint real cuando esté listo
        // Por ahora, mostramos el "MES DE LA CIENCIA" bloqueado
        const planificacionesMock: PlanificacionCard[] = [
          {
            id: '1',
            titulo: 'MES DE LA CIENCIA - Semana 1',
            descripcion: 'Introducción y conceptos básicos',
            semana: 1,
            estado: 'bloqueada',
            fecha_disponible: '2025-11-03', // Lunes 3 de noviembre
            total_actividades: 8,
            actividades_completadas: 0,
          },
          {
            id: '2',
            titulo: 'MES DE LA CIENCIA - Semana 2',
            descripcion: 'Experimentos y aplicaciones prácticas',
            semana: 2,
            estado: 'bloqueada',
            fecha_disponible: '2025-11-10',
            total_actividades: 10,
            actividades_completadas: 0,
          },
          {
            id: '3',
            titulo: 'MES DE LA CIENCIA - Semana 3',
            descripcion: 'Proyectos y desafíos',
            semana: 3,
            estado: 'bloqueada',
            fecha_disponible: '2025-11-17',
            total_actividades: 12,
            actividades_completadas: 0,
          },
          {
            id: '4',
            titulo: 'MES DE LA CIENCIA - Semana 4',
            descripcion: 'Evaluación y cierre',
            semana: 4,
            estado: 'bloqueada',
            fecha_disponible: '2025-11-24',
            total_actividades: 15,
            actividades_completadas: 0,
          },
        ];

        setPlanificaciones(planificacionesMock);
      } catch (error) {
        console.error('Error al cargar planificaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarPlanificaciones();
  }, []);

  // Convertir color hex a rgba para el glow
  const _hexToRgba = (hex: string, alpha: number = 0.4) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={pop}
      />

      {/* Panel principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-5xl h-[90vh] sm:h-[85vh] mx-3 sm:mx-4
                   bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95
                   backdrop-blur-2xl rounded-2xl sm:rounded-3xl border-2 border-white/20 shadow-2xl
                   flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={pop}
              className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20
                       flex items-center justify-center transition-colors border border-white/20"
            >
              <ArrowLeft className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-3xl sm:text-4xl">{sectorEmoji}</div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-black text-white font-[family-name:var(--font-lilita)]">
                  {sectorNombre.toUpperCase()}
                </h1>
                <p className="text-cyan-300 text-xs sm:text-sm font-bold mt-1">
                  {planificaciones.filter((p) => p.estado === 'bloqueada').length} planificaciones
                  bloqueadas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white/60 text-lg sm:text-xl font-bold">
                Cargando planificaciones...
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {planificaciones.map((planificacion, index) => {
                const esBloqueada = planificacion.estado === 'bloqueada';
                const progreso = Math.round(
                  (planificacion.actividades_completadas / planificacion.total_actividades) * 100,
                );

                return (
                  <motion.div
                    key={planificacion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      relative rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2
                      ${
                        esBloqueada
                          ? 'bg-slate-800/40 border-slate-700/40 cursor-not-allowed'
                          : 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-500/40 cursor-pointer hover:scale-[1.02]'
                      }
                      transition-all duration-200 min-h-[200px] sm:min-h-[220px]
                    `}
                  >
                    {/* Badge de estado */}
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                      <div
                        className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1
                                    bg-slate-900/60 border border-slate-700 rounded-md sm:rounded-lg"
                      >
                        <Lock className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-slate-400" />
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400">
                          BLOQUEADA
                        </span>
                      </div>
                    </div>

                    {/* Emoji/Icono */}
                    <div className="text-4xl sm:text-5xl mb-2 sm:mb-3 opacity-40 grayscale">🔬</div>

                    {/* Título */}
                    <h3 className="text-lg sm:text-xl font-black mb-2 text-slate-500">
                      {planificacion.titulo}
                    </h3>

                    {/* Descripción */}
                    <p className="text-xs sm:text-sm mb-3 sm:mb-4 text-slate-600">
                      {planificacion.descripcion}
                    </p>

                    {/* Info adicional */}
                    <div className="space-y-2">
                      {/* Semana */}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-slate-600" />
                        <span className="text-[11px] sm:text-xs font-bold text-slate-600">
                          Semana {planificacion.semana}
                        </span>
                      </div>

                      {/* Fecha disponible */}
                      {planificacion.fecha_disponible && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-slate-600" />
                          <span className="text-[11px] sm:text-xs font-bold text-slate-600">
                            Disponible:{' '}
                            {new Date(planificacion.fecha_disponible).toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}

                      {/* Actividades */}
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-slate-600" />
                        <span className="text-[11px] sm:text-xs font-bold text-slate-600">
                          {planificacion.actividades_completadas}/{planificacion.total_actividades}{' '}
                          actividades
                        </span>
                      </div>
                    </div>

                    {/* Overlay de bloqueo */}
                    <div
                      className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] rounded-xl sm:rounded-2xl
                                  flex items-center justify-center"
                    >
                      <div className="text-center px-4">
                        <Lock className="w-10 sm:w-12 h-10 sm:h-12 text-slate-500 mx-auto mb-2" />
                        <p className="text-slate-400 text-xs sm:text-sm font-bold">
                          Disponible el{' '}
                          {planificacion.fecha_disponible &&
                            new Date(planificacion.fecha_disponible).toLocaleDateString('es-AR', {
                              day: 'numeric',
                              month: 'long',
                            })}
                        </p>
                      </div>
                    </div>
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
              Las planificaciones se desbloquearán automáticamente en sus fechas programadas
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
