'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  estudiantesApi,
  type AccesoEstudiante,
  type PuedeEntrarClase,
} from '@/lib/api/estudiantes.api';

/**
 * Permisos del estudiante para acceder a diferentes recursos
 */
export interface PermisosEstudiante {
  accesoClasesVivo: boolean;
  accesoLibros: boolean;
  accesoPlanificaciones: boolean;
}

/**
 * Información de comisión activa
 */
export interface ComisionActiva {
  id: string;
  nombre: string;
  fechaFin: Date | null;
}

/**
 * Estado de acceso simplificado para el hook
 */
export interface AccesoInfo {
  puedeAcceder: boolean;
  motivo: 'PLAN_DIRECTO' | 'SUSCRIPCION_TUTOR' | 'COMISION_ACTIVA' | 'OVERRIDE' | 'SIN_ACCESO';
  comisionesActivas: ComisionActiva[];
  mensaje: string;
}

/**
 * Retorno del hook useAccesoEstudiante
 */
export interface UseAccesoEstudianteReturn {
  acceso: AccesoInfo | null;
  permisos: PermisosEstudiante | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  verificarEntradaClase: (
    claseGrupoId?: string,
    comisionId?: string,
  ) => Promise<PuedeEntrarClase | null>;
}

/**
 * Hook para verificar y cachear el acceso del estudiante a la plataforma
 *
 * Siguiendo mejores prácticas de React hooks para autenticación:
 * - Cache del resultado para evitar llamadas múltiples
 * - Manejo de 401 con redirección a login
 * - Estado de loading y error
 * - Función refetch para actualizar manualmente
 *
 * @see https://auth0.com/blog/complete-guide-to-react-user-authentication/
 * @see https://dev.to/joodi/useauth-hook-in-react-1bp3
 */
export function useAccesoEstudiante(): UseAccesoEstudianteReturn {
  const router = useRouter();
  const [acceso, setAcceso] = useState<AccesoInfo | null>(null);
  const [permisos, setPermisos] = useState<PermisosEstudiante | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref para evitar llamadas duplicadas durante el mount
  const fetchedRef = useRef(false);

  /**
   * Transforma la respuesta del API a la estructura simplificada del hook
   */
  const transformarRespuesta = useCallback((data: AccesoEstudiante): void => {
    // Transformar comisiones activas
    const comisionesActivas: ComisionActiva[] = data.detalles.comisionesActivas.map((c) => ({
      id: c.comisionId,
      nombre: c.nombre,
      fechaFin: c.fechaFin ? new Date(c.fechaFin) : null,
    }));

    setAcceso({
      puedeAcceder: data.puedeAcceder,
      motivo: data.motivo,
      comisionesActivas,
      mensaje: data.mensaje,
    });

    setPermisos({
      accesoClasesVivo: data.permisos.accesoClasesVivo,
      accesoLibros: data.permisos.accesoLibros,
      accesoPlanificaciones: data.permisos.accesoPlanificaciones,
    });
  }, []);

  /**
   * Fetch del acceso del estudiante
   */
  const fetchAcceso = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await estudiantesApi.verificarAcceso();
      transformarRespuesta(data);
    } catch (err) {
      // Manejar 401 - redirigir a login
      if (err instanceof Error && err.message.includes('401')) {
        router.replace('/estudiante-login');
        return;
      }

      // Axios error con response
      const axiosError = err as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        router.replace('/estudiante-login');
        return;
      }

      setError(err instanceof Error ? err.message : 'Error al verificar acceso');
    } finally {
      setIsLoading(false);
    }
  }, [router, transformarRespuesta]);

  /**
   * Verificar si puede entrar a una clase específica
   */
  const verificarEntradaClase = useCallback(
    async (claseGrupoId?: string, comisionId?: string): Promise<PuedeEntrarClase | null> => {
      try {
        return await estudiantesApi.puedeEntrarClase(claseGrupoId, comisionId);
      } catch (err) {
        console.error('Error al verificar entrada a clase:', err);
        return null;
      }
    },
    [],
  );

  // Fetch inicial al montar (solo una vez)
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchAcceso();
  }, [fetchAcceso]);

  return {
    acceso,
    permisos,
    isLoading,
    error,
    refetch: fetchAcceso,
    verificarEntradaClase,
  };
}

export default useAccesoEstudiante;
