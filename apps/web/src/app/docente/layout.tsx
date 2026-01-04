'use client';

import { ProtectedLayout } from '@/components/shared/ProtectedLayout';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import ModalCambioPasswordObligatorio from '@/components/auth/ModalCambioPasswordObligatorio';
import { useAuthStore } from '@/store/auth.store';

/**
 * Portal Docente Layout - TeacherDash Pro Design
 *
 * Layout minimalista que solo maneja:
 * - Proteccion de rutas (solo DOCENTE)
 * - Modal de cambio de password obligatorio
 *
 * El dashboard maneja su propio header, sidebar y background effects.
 */
export default function DocenteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout
      allowedRoles={['DOCENTE']}
      loadingComponent={<LoadingScreen variant="docente" />}
    >
      <DocenteLayoutContent>{children}</DocenteLayoutContent>
    </ProtectedLayout>
  );
}

function DocenteLayoutContent({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const mustChangePassword = user?.debe_cambiar_password === true;

  return (
    <div className="fixed inset-0 bg-[#020617] flex flex-col overflow-hidden" data-docente="true">
      {/* Modal de cambio de password obligatorio */}
      <ModalCambioPasswordObligatorio isOpen={mustChangePassword} />

      {/* Main Content - Full height */}
      {children}
    </div>
  );
}
