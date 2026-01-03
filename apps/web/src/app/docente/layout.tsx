'use client';

import { ProtectedLayout } from '@/components/shared/ProtectedLayout';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { Header, TabNavigation } from '@/components/docente';

/**
 * Portal Docente Layout v2.0 - Horizontal Tabs Design
 *
 * Estructura igual que admin:
 * - Header con saludo, reloj y acciones de usuario
 * - TabNavigation horizontal (reemplaza sidebar vertical)
 * - Contenido principal
 *
 * Colores: Purple accent (#8b5cf6)
 * Autenticación manejada por ProtectedLayout.
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
  return (
    <div className="min-h-screen bg-[var(--docente-bg)] flex flex-col" data-docente="true">
      {/* Background Glows - sutiles como admin */}
      <div className="fixed top-0 left-[20%] w-[500px] h-[500px] bg-[var(--docente-accent)]/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-[10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col flex-1 max-w-[1920px] mx-auto w-full p-4 lg:p-6">
        {/* Header - Saludo, reloj, notificaciones, avatar */}
        <Header />

        {/* Tab Navigation - Horizontal tabs */}
        <TabNavigation />

        {/* Main Content Area */}
        <main className="flex-1 relative min-h-0">
          <div className="absolute inset-0 overflow-y-auto pr-2 pb-2 custom-scrollbar">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
