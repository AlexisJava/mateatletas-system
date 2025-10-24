/**
 * PlanificacionApp - Wrapper principal para todas las planificaciones
 *
 * Este componente maneja automáticamente:
 * - Autenticación del estudiante
 * - Tracking de progreso
 * - Guardado automático de estado
 * - Puntos de gamificación
 * - Registro de tiempo de actividad
 */

'use client';

import { useEffect, useState, ReactNode } from 'react';
import { usePlanificacionTracking } from '../hooks/usePlanificacionTracking';

interface PlanificacionAppProps {
  codigo: string;
  titulo: string;
  descripcion?: string;
  children: ReactNode;
}

export function PlanificacionApp({
  codigo,
  titulo,
  descripcion,
  children,
}: PlanificacionAppProps) {
  const [tiempoInicio] = useState<Date>(new Date());
  const [tiempoActual, setTiempoActual] = useState<number>(0);

  // Hook personalizado para tracking
  const { registrarInicio, registrarProgreso, guardarEstado } = usePlanificacionTracking(codigo);

  // Registrar inicio al montar el componente
  useEffect(() => {
    registrarInicio();

    // Cleanup al desmontar
    return () => {
      const tiempoTotal = Math.floor((new Date().getTime() - tiempoInicio.getTime()) / 1000 / 60);
      registrarProgreso({
        tiempo_total_minutos: tiempoTotal,
      });
    };
  }, [codigo]);

  // Actualizar tiempo cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      const minutos = Math.floor((new Date().getTime() - tiempoInicio.getTime()) / 1000 / 60);
      setTiempoActual(minutos);
    }, 60000); // Cada minuto

    return () => clearInterval(interval);
  }, [tiempoInicio]);

  // Auto-guardado cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      guardarEstado();
    }, 5 * 60 * 1000); // Cada 5 minutos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="planificacion-app" data-planificacion={codigo}>
      {/* Metadata oculto para tracking */}
      <div className="hidden" data-titulo={titulo} data-descripcion={descripcion} />

      {/* Contenido de la planificación */}
      {children}
    </div>
  );
}
