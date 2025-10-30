'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type OverlayType =
  | 'mi-grupo'
  | 'mis-logros'
  | 'entrenamientos'
  | 'mis-cursos'
  | 'mi-progreso'
  | 'tienda'
  | 'notificaciones'
  | 'ajustes'
  | null;

interface OverlayContextType {
  activeOverlay: OverlayType;
  openOverlay: (type: OverlayType) => void;
  closeOverlay: () => void;
}

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [activeOverlay, setActiveOverlay] = useState<OverlayType>(null);

  const openOverlay = (type: OverlayType) => {
    setActiveOverlay(type);
    // Prevenir scroll del body cuando hay overlay activo
    document.body.style.overflow = 'hidden';
  };

  const closeOverlay = () => {
    setActiveOverlay(null);
    document.body.style.overflow = 'auto';
  };

  // Limpiar overflow cuando se desmonta
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Atajo de teclado ESC para cerrar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeOverlay) {
        closeOverlay();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [activeOverlay]);

  return (
    <OverlayContext.Provider value={{ activeOverlay, openOverlay, closeOverlay }}>
      {children}
    </OverlayContext.Provider>
  );
}

export function useOverlay() {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error('useOverlay must be used within OverlayProvider');
  }
  return context;
}
