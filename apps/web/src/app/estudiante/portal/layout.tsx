import { PortalEstudianteClientLayout } from './PortalEstudianteClientLayout';

/**
 * Layout Server Component para el Portal Estudiante
 *
 * Este es un Server Component que:
 * 1. Exporta dynamic='force-dynamic' para evitar SSG (el portal usa auth)
 * 2. Envuelve el Client Layout que maneja autenticación y contexto
 */

// Forzar renderizado dinámico - evita SSG porque el portal usa
// sessionStorage y localStorage (Zustand persist) para autenticación
export const dynamic = 'force-dynamic';

export default function PortalEstudianteLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <PortalEstudianteClientLayout>{children}</PortalEstudianteClientLayout>;
}
