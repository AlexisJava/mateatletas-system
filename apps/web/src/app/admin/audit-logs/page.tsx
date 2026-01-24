'use client';

import { AuditLogsView } from '@/components/admin/views/audit-logs';

/**
 * Admin Audit Logs Page
 *
 * Vista de registro de auditoría del sistema.
 * Permite ver y filtrar todos los eventos del sistema
 * por severidad, categoría, usuario y acción.
 */
export default function AdminAuditLogsPage() {
  return <AuditLogsView />;
}
