'use client';

import { useParams } from 'next/navigation';
import { Suspense, lazy } from 'react';

/**
 * Página de planificación dinámica para estudiantes
 *
 * Esta página carga dinámicamente la planificación correcta basándose en el código.
 * Las planificaciones se encuentran en /planificaciones/
 */
export default function PlanificacionPage() {
  const params = useParams();
  const codigo = params?.codigo as string;

  if (!codigo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Código de planificación no especificado</p>
      </div>
    );
  }

  // Cargar dinámicamente la planificación
  let PlanificacionComponent;
  try {
    // Intentar cargar desde /planificaciones/[codigo].tsx
    PlanificacionComponent = lazy(() => import(`@/planificaciones/${codigo}`));
  } catch (error) {
    // Si no existe como archivo directo, intentar como carpeta con index.tsx
    try {
      PlanificacionComponent = lazy(() => import(`@/planificaciones/${codigo}/index`));
    } catch (innerError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-4">Planificación no encontrada</h2>
            <p className="text-slate-400 mb-6">
              La planificación &quot;{codigo}&quot; no existe
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-2 border-purple-400/50 text-white font-bold hover:shadow-lg transition-all"
            >
              Volver
            </button>
          </div>
        </div>
      );
    }
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-bold">Cargando planificación...</p>
          </div>
        </div>
      }
    >
      <PlanificacionComponent />
    </Suspense>
  );
}
