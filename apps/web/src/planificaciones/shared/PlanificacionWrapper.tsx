/**
 * PlanificacionWrapper - Componente que envuelve toda planificación
 *
 * Funcionalidad automática:
 * - Verificar acceso del estudiante
 * - Cargar progreso
 * - Auto-guardar cada 30 segundos
 * - Tracking de tiempo cada minuto
 * - Proveer hooks a los componentes hijos
 *
 * Uso:
 * ```tsx
 * export default function MiPlanificacion() {
 *   return (
 *     <PlanificacionWrapper config={PLANIFICACION_CONFIG}>
 *       <div>Tu contenido aquí</div>
 *     </PlanificacionWrapper>
 *   );
 * }
 * ```
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { PlanificacionConfig, UsePlanificacionProgressReturn } from './types';
import { usePlanificacionProgress } from './usePlanificacionProgress';

// ============================================================================
// CONTEXT
// ============================================================================

const PlanificacionContext = createContext<UsePlanificacionProgressReturn | null>(null);

/**
 * Hook para acceder al contexto desde cualquier componente hijo
 */
export function usePlanificacion(): UsePlanificacionProgressReturn {
  const context = useContext(PlanificacionContext);
  if (!context) {
    throw new Error('usePlanificacion debe usarse dentro de PlanificacionWrapper');
  }
  return context;
}

// ============================================================================
// WRAPPER COMPONENT
// ============================================================================

interface PlanificacionWrapperProps {
  config: PlanificacionConfig;
  children: ReactNode;
}

export function PlanificacionWrapper({
  config,
  children,
}: PlanificacionWrapperProps) {
  const progressData = usePlanificacionProgress(config);
  const [tiempoInicio] = useState<Date>(new Date());
  const [minutosJugados, setMinutosJugados] = useState(0);

  // ============================================================================
  // AUTO-GUARDAR CADA 30 SEGUNDOS
  // ============================================================================
  useEffect(() => {
    if (!progressData.progreso) return;

    const interval = setInterval(() => {
      // Solo guardamos si hay estado guardado
      if (progressData.progreso?.estadoGuardado) {
        progressData.guardarEstado(progressData.progreso.estadoGuardado).catch((err) => {
          console.error('Error en auto-guardado:', err);
        });
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [progressData]);

  // ============================================================================
  // TRACKING DE TIEMPO CADA MINUTO
  // ============================================================================
  useEffect(() => {
    const interval = setInterval(() => {
      const minutosTranscurridos = Math.floor(
        (new Date().getTime() - tiempoInicio.getTime()) / 1000 / 60
      );

      if (minutosTranscurridos > minutosJugados) {
        const nuevosMinutos = minutosTranscurridos - minutosJugados;
        setMinutosJugados(minutosTranscurridos);
        progressData.registrarTiempo(nuevosMinutos).catch((err) => {
          console.error('Error registrando tiempo:', err);
        });
      }
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, [tiempoInicio, minutosJugados, progressData]);

  // ============================================================================
  // CLEANUP AL DESMONTAR
  // ============================================================================
  useEffect(() => {
    return () => {
      // Registrar tiempo final al salir
      const tiempoTotal = Math.floor(
        (new Date().getTime() - tiempoInicio.getTime()) / 1000 / 60
      );
      if (tiempoTotal > minutosJugados) {
        const minutosFinales = tiempoTotal - minutosJugados;
        progressData.registrarTiempo(minutosFinales).catch(() => {
          // Silencioso, estamos desmontando
        });
      }
    };
  }, [tiempoInicio, minutosJugados, progressData]);

  // ============================================================================
  // ESTADOS DE CARGA Y ERROR
  // ============================================================================

  if (progressData.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mb-4"></div>
          <p className="text-white text-xl font-semibold">Cargando {config.titulo}...</p>
        </div>
      </div>
    );
  }

  if (progressData.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 to-orange-500 p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Error al Cargar</h2>
            <p className="text-gray-600 mb-6">{progressData.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Verificar acceso a la semana actual
  const { progreso, semanasInfo } = progressData;

  if (progreso && !semanasInfo.puedeAcceder(progreso.semanaActual)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-500 to-orange-500 p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Semana No Disponible</h2>
            <p className="text-gray-600 mb-6">
              La semana {progreso.semanaActual} todavía no está disponible.
              <br />
              Tu docente la activará pronto.
            </p>
            <p className="text-sm text-gray-500">
              Semanas disponibles: {semanasInfo.semanasActivas.join(', ')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER NORMAL
  // ============================================================================

  return (
    <PlanificacionContext.Provider value={progressData}>
      <div className="planificacion-wrapper" data-planificacion={config.codigo}>
        {/* Metadata oculta para debugging */}
        <div
          className="hidden"
          data-titulo={config.titulo}
          data-grupo={config.grupo}
          data-semana-actual={progreso?.semanaActual}
        />

        {/* Contenido de la planificación */}
        {children}

        {/* Indicador de auto-guardado (opcional, puedes quitarlo) */}
        <div className="fixed bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
          ⏱️ {progressData.progreso?.tiempoTotalMinutos || 0} min •
          🏆 {progressData.progreso?.puntosTotales || 0} pts
        </div>
      </div>
    </PlanificacionContext.Provider>
  );
}
