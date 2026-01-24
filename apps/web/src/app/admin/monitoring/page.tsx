'use client';

import { MonitoringView } from '@/components/admin/views/monitoring';

/**
 * Admin Monitoring Page
 *
 * Vista de monitoring de colas y webhooks.
 * Permite ver el estado de BullMQ, webhooks en DLQ,
 * y tomar acciones sobre webhooks fallidos.
 */
export default function AdminMonitoringPage() {
  return <MonitoringView />;
}
