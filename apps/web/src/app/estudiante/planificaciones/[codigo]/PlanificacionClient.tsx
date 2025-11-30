/**
 * Cliente Component para renderizar planificación
 * Funciona tanto en router standalone como en overlay stack
 */

'use client';

import { useAuthStore } from '@/store/auth.store';
import { usePlanificacionLoader } from '../hooks/usePlanificacionLoader';
import { adaptarPorNivel } from '../utils/nivel.utils';
import { puedeAccederPorNivel, validarCodigoPlanificacion } from '../utils/validacion.utils';
import { LoadingPlanificacion, ErrorPlanificacion } from '../components';
import type { OverlayConfig } from '@/app/estudiante/gimnasio/types/overlay.types';

export interface PlanificacionClientProps {
  codigo?: string; // Opcional cuando viene desde overlay
  config?: OverlayConfig; // Cuando se usa en overlay stack
  estudiante?: {
    nombre: string;
    apellido?: string;
    nivel_actual?: number;
    id?: string;
    sub?: string;
  };
}

export function PlanificacionClient({
  codigo: codigoProp,
  config,
  estudiante: estudianteProp,
}: PlanificacionClientProps) {
  // Determinar código: desde prop o desde config
  const codigoDesdeConfig = config?.type === 'planificacion' ? config.codigo : undefined;
  const codigo = codigoProp ?? codigoDesdeConfig ?? '';

  // Obtener usuario del store (fallback si no viene desde overlay)
  const { user } = useAuthStore();
  const estudiante = estudianteProp || user;

  // Cargar planificación dinámicamente (hook debe llamarse incondicionalmente)
  const { isLoading, error, component: PlanificacionComponent } = usePlanificacionLoader(codigo);

  // Validar código después del hook
  if (!codigo) {
    return (
      <ErrorPlanificacion
        error={new Error('Debes seleccionar una planificación para continuar')}
        codigo={codigo}
      />
    );
  }

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
  if (!estudiante) {
    return (
      <ErrorPlanificacion
        error={new Error('Debes iniciar sesión para acceder a esta planificación')}
        codigo={codigo}
      />
    );
  }

  // Adaptar por nivel del estudiante
  const adaptacion = adaptarPorNivel(estudiante.nivel_actual || 1);

  // Verificar acceso por nivel (por si acaso hay restricciones futuras)
  const validacion = validarCodigoPlanificacion(codigo);

  if (!validacion.valido || !validacion.codigo) {
    return (
      <ErrorPlanificacion
        error={new Error(validacion.error || 'Código de planificación inválido')}
        codigo={codigo}
      />
    );
  }

  const codigoValidado = validacion.codigo;

  const tieneAcceso = puedeAccederPorNivel(adaptacion.nivelActual, codigoValidado);

  if (!tieneAcceso) {
    return (
      <ErrorPlanificacion
        error={
          new Error(
            `Esta planificación requiere un nivel diferente. Tu nivel actual: ${adaptacion.nivelActual}`,
          )
        }
        codigo={codigo}
      />
    );
  }

  // Renderizar la planificación
  // Nota: El wrapper con gradient y BackButton ya no es necesario cuando se usa en overlay
  // El OverlayRenderer maneja esos aspectos
  return (
    <div className="w-full h-full">
      {/* Sin gradient aquí - lo maneja OverlayRenderer */}

      {/* Badge de nivel */}
      <div className="absolute top-6 right-20 z-10 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl px-4 py-2">
        <div className="text-white text-sm font-bold">{adaptacion.descripcionNivel}</div>
        <div className="text-white/70 text-xs">Dificultad: {adaptacion.dificultadRecomendada}</div>
      </div>

      {/* Renderizar componente de planificación */}
      <PlanificacionComponent
        estudianteId={estudiante.id || estudiante.sub || ''}
        nivelEstudiante={adaptacion.nivelActual}
      />
    </div>
  );
}
