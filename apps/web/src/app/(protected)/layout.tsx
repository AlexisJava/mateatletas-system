'use client';

import { ProtectedLayout } from '@/components/shared/ProtectedLayout';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import ForcePasswordChangeOverlay from '@/components/auth/ForcePasswordChangeOverlay';

/**
 * Protected Layout - Envuelve todas las rutas que requieren autenticación
 *
 * Rutas protegidas:
 * - /dashboard (tutores)
 * - /profile
 * - /atletas
 * - etc.
 *
 * Usa ProtectedLayout centralizado para validación de auth.
 * Permite rol TUTOR por defecto (dashboard de padres/tutores).
 */
export default function TutorProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout allowedRoles={['TUTOR']} loadingComponent={<LoadingScreen variant="tutor" />}>
      {children}
      <ForcePasswordChangeOverlay />
    </ProtectedLayout>
  );
}
