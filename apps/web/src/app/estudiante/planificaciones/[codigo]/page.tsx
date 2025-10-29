/**
 * Página de planificación individual
 * Router: /estudiante/planificaciones/[codigo]
 *
 * Carga dinámicamente el componente de la planificación según el código
 */

'use client';

import { use } from 'react';
import { useAuthStore } from '@/store/auth.store';
import type { PlanificacionPageProps } from '../types/planificacion-loader.types';
import { usePlanificacionLoader } from '../hooks/usePlanificacionLoader';
import { adaptarPorNivel } from '../utils/nivel.utils';
import { puedeAccederPorNivel } from '../utils/validacion.utils';
import { BackButton, LoadingPlanificacion, ErrorPlanificacion } from '../components';

export default function PlanificacionPage({ params }: PlanificacionPageProps) {
  // Unwrap params (Next.js 15 async params)
  const { codigo } = use(Promise.resolve(params));

  // Obtener usuario del store
  const { user } = useAuthStore();

  // Cargar planificación dinámicamente
  const { isLoading, error, component: PlanificacionComponent } = usePlanificacionLoader(codigo);

  // Loading state
  if (isLoading) {
    return <LoadingPlanificacion />;
  }

  // Error state
  if (error || !PlanificacionComponent) {
    return (
      <ErrorPlanificacion
        error={error || new Error('No se pudo cargar el componente de la planificación')}
        codigo={codigo}
      />
    );
  }

  // Validar autenticación
  if (!user) {
    return (
      <ErrorPlanificacion
        error={new Error('Debes iniciar sesión para acceder a esta planificación')}
        codigo={codigo}
      />
    );
  }

  // Adaptar por nivel del estudiante
  const adaptacion = adaptarPorNivel(user.nivel_actual || 1);

  // Verificar acceso por nivel (por si acaso hay restricciones futuras)
  const tieneAcceso = puedeAccederPorNivel(adaptacion.nivelActual, codigo as any);

  if (!tieneAcceso) {
    return (
      <ErrorPlanificacion
        error={new Error(
          `Esta planificación requiere un nivel diferente. Tu nivel actual: ${adaptacion.nivelActual}`
        )}
        codigo={codigo}
      />
    );
  }

  // Renderizar la planificación
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Botón volver */}
      <BackButton />

      {/* Badge de nivel (esquina superior derecha) */}
      <div className="fixed top-6 right-6 z-50 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl px-4 py-2">
        <div className="text-white text-sm font-bold">
          {adaptacion.descripcionNivel}
        </div>
        <div className="text-white/70 text-xs">
          Dificultad: {adaptacion.dificultadRecomendada}
        </div>
      </div>

      {/* Renderizar componente de planificación */}
      <PlanificacionComponent
        estudianteId={user.sub || user.id || ''}
        nivelEstudiante={adaptacion.nivelActual}
      />
    </div>
  );
}
