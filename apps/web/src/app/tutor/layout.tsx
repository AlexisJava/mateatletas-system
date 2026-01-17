'use client';

import { ProtectedLayout } from '@/components/shared/ProtectedLayout';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import ModalCambioPasswordObligatorio from '@/components/auth/ModalCambioPasswordObligatorio';
import { useAuthStore } from '@/store/auth.store';

/**
 * Layout del Portal Tutor
 *
 * - Protege rutas con rol TUTOR
 * - Sin sidebar (single page)
 * - Modal de cambio de contraseña obligatorio si corresponde
 */
export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout
      allowedRoles={['TUTOR']}
      loadingComponent={<LoadingScreen variant="default" />}
    >
      <TutorLayoutContent>{children}</TutorLayoutContent>
    </ProtectedLayout>
  );
}

function TutorLayoutContent({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const mustChangePassword = user?.debe_cambiar_password === true;

  return (
    <div className="h-screen bg-[#020617] flex flex-col overflow-hidden" data-tutor="true">
      <ModalCambioPasswordObligatorio isOpen={mustChangePassword} />
      {children}
    </div>
  );
}
