/**
 * Layout para la sección de planificaciones
 * Envuelve todas las páginas de /estudiante/planificaciones/*
 */

import type { Metadata } from 'next';
import type { PlanificacionesLayoutProps } from './types/planificacion-loader.types';

export const metadata: Metadata = {
  title: 'Mes de la Ciencia - Mateatletas',
  description: 'Aventuras científicas interactivas: Química, Astronomía, Física e Informática',
};

export default function PlanificacionesLayout({ children }: PlanificacionesLayoutProps) {
  return <div className="min-h-screen overflow-x-hidden">{children}</div>;
}
