'use client';

import { ReactNode } from 'react';

/**
 * Layout para el módulo Studio
 * Envuelve todas las páginas bajo /admin/studio
 */
export default function StudioLayout({ children }: { children: ReactNode }) {
  return <div className="flex flex-col h-full">{children}</div>;
}
