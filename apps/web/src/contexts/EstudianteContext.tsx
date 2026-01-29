'use client';

import { createContext, useContext, useMemo } from 'react';
import { useAuthStore, type User, type CasaTipo } from '@/store/auth.store';

/**
 * Datos del estudiante disponibles en el contexto del portal
 */
export interface EstudianteContextData {
  /** ID del estudiante */
  id: string;
  /** Nombre del estudiante */
  nombre: string;
  /** Apellido del estudiante */
  apellido: string;
  /** Nombre completo formateado */
  nombreCompleto: string;
  /** Email del estudiante */
  email: string;
  /** XP total acumulado */
  xpTotal: number;
  /** Nivel actual */
  nivelActual: number;
  /** URL del avatar */
  avatarUrl: string | null;
  /** Casa del estudiante (Quantum, Vertex, Pulsar) */
  casa: {
    id: string;
    nombre: string;
    tipo: CasaTipo;
    color: string;
  } | null;
  /** Si debe cambiar contraseña */
  debeCambiarPassword: boolean;
}

interface EstudianteContextValue {
  estudiante: EstudianteContextData | null;
  isLoading: boolean;
}

const EstudianteContext = createContext<EstudianteContextValue | null>(null);

/**
 * Transforma el User del auth store a EstudianteContextData
 */
function transformUserToEstudiante(user: User | null): EstudianteContextData | null {
  if (!user || user.role !== 'estudiante') {
    return null;
  }

  return {
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    nombreCompleto: `${user.nombre} ${user.apellido}`,
    email: user.email,
    xpTotal: user.xpTotal ?? 0,
    nivelActual: user.nivelActual ?? 1,
    avatarUrl: user.avatarUrl ?? null,
    casa: user.casa
      ? {
          id: user.casa.id,
          nombre: user.casa.nombre,
          tipo: user.casa.tipo,
          color: user.casa.color,
        }
      : null,
    debeCambiarPassword: user.debeCambiarPassword ?? false,
  };
}

/**
 * Provider del contexto del estudiante
 *
 * Extrae los datos del usuario autenticado del auth store
 * y los expone en un formato conveniente para el portal.
 */
export function EstudianteProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { user, isLoading } = useAuthStore();

  const value = useMemo<EstudianteContextValue>(
    () => ({
      estudiante: transformUserToEstudiante(user),
      isLoading,
    }),
    [user, isLoading],
  );

  return <EstudianteContext.Provider value={value}>{children}</EstudianteContext.Provider>;
}

/**
 * Hook para acceder al contexto del estudiante
 *
 * @throws Error si se usa fuera del EstudianteProvider
 */
export function useEstudiante(): EstudianteContextValue {
  const context = useContext(EstudianteContext);

  if (context === null) {
    throw new Error('useEstudiante debe usarse dentro de un EstudianteProvider');
  }

  return context;
}

/**
 * Hook para acceder a los datos del estudiante (no-null)
 *
 * Útil cuando estás seguro de que el estudiante está autenticado
 * (por ejemplo, dentro de una ruta protegida)
 *
 * @throws Error si no hay estudiante autenticado
 */
export function useEstudianteRequired(): EstudianteContextData {
  const { estudiante } = useEstudiante();

  if (!estudiante) {
    throw new Error('No hay estudiante autenticado');
  }

  return estudiante;
}
