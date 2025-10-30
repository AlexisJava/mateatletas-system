/**
 * Página de planificación individual (Server Component)
 * Router: /estudiante/planificaciones/[codigo]
 *
 * Este es un Server Component que unwrap los params async de Next.js 15
 * y pasa el código al Client Component PlanificacionClient
 */

import type { PlanificacionPageProps } from '../types/planificacion-loader.types';
import { PlanificacionClient } from './PlanificacionClient';

export default async function PlanificacionPage({ params }: PlanificacionPageProps) {
  // Unwrap params (Next.js 15 async params - solo funciona en Server Components)
  const { codigo } = await params;

  // Renderizar Client Component con el código
  return <PlanificacionClient codigo={codigo} />;
}
