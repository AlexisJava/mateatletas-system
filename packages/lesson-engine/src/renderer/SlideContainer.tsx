import type { ReactNode } from 'react';

export interface SlideContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * SlideContainer - Contenedor 100vh para cada slide
 *
 * Regla de oro: NO SCROLL - cada slide ocupa exactamente 100vh
 */
export function SlideContainer({ children, className = '' }: SlideContainerProps): ReactNode {
  return (
    <div
      className={`h-screen h-[100dvh] w-full overflow-hidden flex flex-col ${className}`}
      style={{ minHeight: '100dvh', maxHeight: '100dvh' }}
    >
      {children}
    </div>
  );
}
