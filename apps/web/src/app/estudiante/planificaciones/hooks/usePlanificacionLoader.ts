/**
 * Hook para cargar dinámicamente componentes de planificaciones
 */

'use client';

import { useState, useEffect } from 'react';
import type {
  CodigoPlanificacionValido,
  PlanificacionLoaderState,
  PlanificacionModule,
} from '../types/planificacion-loader.types';
import { validarCodigoPlanificacion } from '../utils/validacion.utils';

/**
 * Hook que carga dinámicamente un componente de planificación
 */
export function usePlanificacionLoader(codigo: string): PlanificacionLoaderState {
  const [state, setState] = useState<PlanificacionLoaderState>({
    isLoading: true,
    error: null,
    component: null,
    config: null,
  });

  useEffect(() => {
    let isMounted = true;

    const loadPlanificacion = async () => {
      setState({
        isLoading: true,
        error: null,
        component: null,
        config: null,
      });

      try {
        // 1. Validar código
        const validacion = validarCodigoPlanificacion(codigo);

        if (!validacion.valido || !validacion.codigo) {
          throw new Error(validacion.error || 'Código de planificación inválido');
        }

        const codigoValido: CodigoPlanificacionValido = validacion.codigo;

        // 2. Cargar módulo dinámicamente
        const modulo = await import(
          /* webpackChunkName: "planificacion-[request]" */
          `@/planificaciones/${codigoValido}/index`
        ) as PlanificacionModule;

        // 3. Verificar que tenga el componente default
        if (!modulo.default) {
          throw new Error(`La planificación "${codigoValido}" no exporta un componente default`);
        }

        // 4. Actualizar estado solo si el componente sigue montado
        if (isMounted) {
          setState({
            isLoading: false,
            error: null,
            component: modulo.default,
            config: modulo.PLANIFICACION_CONFIG || null,
          });
        }
      } catch (error) {
        if (isMounted) {
          const errorObj = error instanceof Error
            ? error
            : new Error('Error desconocido al cargar la planificación');

          setState({
            isLoading: false,
            error: errorObj,
            component: null,
            config: null,
          });

          console.error(`Error al cargar planificación "${codigo}":`, errorObj);
        }
      }
    };

    loadPlanificacion();

    // Cleanup
    return () => {
      isMounted = false;
    };
  }, [codigo]);

  return state;
}
