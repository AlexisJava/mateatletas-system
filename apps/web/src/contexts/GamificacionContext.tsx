'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useRecursos } from '@/hooks/useRecursos';
import { useNotificacionesLogros } from '@/hooks/useNotificacionesLogros';
import type { RecursosEstudiante, RachaEstudiante, NotificacionLogro } from '@/types/gamificacion';

/**
 * Contexto global de gamificación
 * Provee estado compartido de recursos, racha y notificaciones
 */

interface GamificacionContextType {
  // Recursos del estudiante
  recursos: (RecursosEstudiante & { racha: RachaEstudiante }) | undefined;
  isLoadingRecursos: boolean;

  // Notificaciones de logros
  notificacionActual: NotificacionLogro | null;
  cerrarNotificacion: () => void;
  hayMasNotificaciones: boolean;

  // Refresh manual
  refetchRecursos: () => void;
}

const GamificacionContext = createContext<GamificacionContextType | undefined>(undefined);

interface GamificacionProviderProps {
  children: ReactNode;
  estudianteId: string;
}

export function GamificacionProvider({ children, estudianteId }: GamificacionProviderProps) {
  const {
    data: recursos,
    isLoading: isLoadingRecursos,
    refetch: refetchRecursos,
  } = useRecursos(estudianteId);

  const {
    notificacionActual,
    cerrarNotificacion,
    hayMasNotificaciones,
  } = useNotificacionesLogros(estudianteId);

  return (
    <GamificacionContext.Provider
      value={{
        recursos,
        isLoadingRecursos,
        notificacionActual,
        cerrarNotificacion,
        hayMasNotificaciones,
        refetchRecursos,
      }}
    >
      {children}
    </GamificacionContext.Provider>
  );
}

/**
 * Hook para consumir el contexto de gamificación
 * Lanza error si se usa fuera del provider
 */
export function useGamificacion() {
  const context = useContext(GamificacionContext);
  if (context === undefined) {
    throw new Error('useGamificacion debe usarse dentro de GamificacionProvider');
  }
  return context;
}
