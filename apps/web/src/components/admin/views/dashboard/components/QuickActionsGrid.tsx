'use client';

import { Users, CreditCard, GraduationCap, TrendingUp } from 'lucide-react';
import { QuickAction } from './QuickAction';

/**
 * QuickActionsGrid - Grid de acciones rápidas
 *
 * Accesos directos a las funcionalidades principales en una fila compacta.
 */

export function QuickActionsGrid() {
  return (
    <div className="p-4 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickAction
          href="/admin/personas"
          label="Gestionar Personas"
          description="Estudiantes, docentes, tutores"
          icon={Users}
        />
        <QuickAction
          href="/admin/finanzas"
          label="Registrar Pago"
          description="Pagos manuales"
          icon={CreditCard}
        />
        <QuickAction
          href="/admin/productos"
          label="Ver Productos"
          description="Colonia, cursos, talleres"
          icon={GraduationCap}
        />
        <QuickAction
          href="/admin/analytics"
          label="Generar Reporte"
          description="Exportar datos"
          icon={TrendingUp}
        />
      </div>
    </div>
  );
}
