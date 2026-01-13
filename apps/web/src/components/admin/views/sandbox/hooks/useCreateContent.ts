'use client';

import { useState, useCallback } from 'react';
import {
  createContenido,
  type CasaTipo,
  type MundoTipo,
  type ContenidoBackend,
} from '@/lib/api/contenidos.api';
import {
  crearPlanificacion,
  type Planificacion,
  type CrearPlanificacionDto,
} from '@/lib/api/planificaciones-admin.api';

export type ContentType = 'microleccion' | 'planificacion';

interface CreateMicroleccionParams {
  titulo: string;
  casaTipo: CasaTipo;
  mundoTipo: MundoTipo;
  descripcion?: string;
}

interface CreatePlanificacionParams {
  titulo: string;
  casaTipo: CasaTipo;
  mundoTipo: MundoTipo;
  cantidadClases: number;
  descripcion?: string;
}

export function useCreateContent() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMicroleccion = useCallback(
    async (params: CreateMicroleccionParams): Promise<ContenidoBackend | null> => {
      setIsCreating(true);
      setError(null);
      try {
        const result = await createContenido(params);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear microlección');
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [],
  );

  const createPlanificacionContent = useCallback(
    async (params: CreatePlanificacionParams): Promise<Planificacion | null> => {
      setIsCreating(true);
      setError(null);
      try {
        const dto: CrearPlanificacionDto = {
          titulo: params.titulo,
          casa_tipo: params.casaTipo,
          mundo_tipo: params.mundoTipo,
          cantidad_clases: params.cantidadClases,
        };
        if (params.descripcion) {
          dto.descripcion = params.descripcion;
        }
        const result = await crearPlanificacion(dto);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear planificación');
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [],
  );

  return {
    createMicroleccion,
    createPlanificacion: createPlanificacionContent,
    isCreating,
    error,
  };
}
