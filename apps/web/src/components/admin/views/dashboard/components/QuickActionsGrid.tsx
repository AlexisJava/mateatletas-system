'use client';

import { Users, CreditCard, GraduationCap, TrendingUp } from 'lucide-react';
import { QuickAction } from './QuickAction';

/**
 * QuickActionsGrid - Grid de acciones rápidas
 *
 * Accesos directos a las funcionalidades principales.
 */

export function QuickActionsGrid() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--admin-text)] mb-4">Acciones rápidas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

export default QuickActionsGrid;
