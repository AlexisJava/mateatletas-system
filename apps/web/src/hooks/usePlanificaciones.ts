import { useEffect } from 'react';
import { usePlanificacionesStore } from '@/stores/planificaciones.store';

interface UsePlanificacionesOptions {
  autoFetch?: boolean;
}

export const usePlanificaciones = (options?: UsePlanificacionesOptions) => {
  const autoFetch = options?.autoFetch ?? true;
  const fetchPlanificaciones = usePlanificacionesStore((state) => state.fetchPlanificaciones);
  const store = usePlanificacionesStore();

  useEffect(() => {
    if (!autoFetch) {
      return;
    }
    fetchPlanificaciones();
  }, [autoFetch, fetchPlanificaciones]);

  return store;
};
