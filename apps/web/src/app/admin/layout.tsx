'use client';

import { ProtectedLayout } from '@/components/shared/ProtectedLayout';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { Header } from '@/components/admin/Header';
import { TabNavigation } from '@/components/admin/TabNavigation';

/**
 * Admin Layout v3.0 - Horizontal Tabs Design
 *
 * Estructura:
 * - Header con saludo, reloj y acciones de usuario
 * - TabNavigation horizontal (reemplaza sidebar vertical)
 * - Contenido principal
 *
 * Autenticación manejada por ProtectedLayout.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout allowedRoles={['ADMIN']} loadingComponent={<LoadingScreen variant="admin" />}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ProtectedLayout>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--admin-bg)] flex flex-col" data-admin="true">
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
