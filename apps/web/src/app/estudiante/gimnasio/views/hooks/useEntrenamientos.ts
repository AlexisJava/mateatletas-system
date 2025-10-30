/**
 * Hook para manejar el estado de la vista de Entrenamientos
 * Obtiene progreso del estudiante en las 4 ciencias del Mes de la Ciencia
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  UseEntrenamientosReturn,
  CienciaCompleta,
  MesCienciaProgresoResponse,
  ProgresoCiencia,
  EstadisticasMesCiencia,
} from '../types/entrenamientos.types';
import { METADATOS_CIENCIAS, CIENCIAS_ORDENADAS } from '../constants/ciencias.constants';

/**
 * Hook para obtener progreso del Mes de la Ciencia
 *
 * TODO: Conectar con endpoint real cuando backend esté listo
 * Endpoint esperado: GET /estudiante/mes-ciencia/progreso/:estudianteId
 */
export function useEntrenamientos(estudianteId: string): UseEntrenamientosReturn {
  const [ciencias, setCiencias] = useState<CienciaCompleta[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasMesCiencia>({
    progresoGlobalPorcentaje: 0,
    totalActividadesCompletadas: 0,
    totalActividades: 16, // 4 ciencias * 4 actividades
    totalPuntosGanados: 0,
    totalTiempoInvertidoMinutos: 0,
    estrellasGanadas: 0,
    cienciasCompletadas: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProgreso = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Reemplazar con llamada real al backend
      // const response = await fetch(`/api/estudiante/mes-ciencia/progreso/${estudianteId}`);
      // const data: MesCienciaProgresoResponse = await response.json();

      // MOCK DATA temporal - Simula progreso del estudiante
      const mockData: MesCienciaProgresoResponse = {
        ciencias: [
          {
            codigo: '2025-11-mes-ciencia-quimica',
            progresoPorcentaje: 100,
            actividadesCompletadas: 4,
            actividadesTotales: 4,
            puntosGanados: 200,
            tiempoInvertidoMinutos: 85,
            estrellas: 4,
            ultimaActividad: new Date().toISOString(),
          },
          {
            codigo: '2025-11-mes-ciencia-astronomia',
            progresoPorcentaje: 75,
            actividadesCompletadas: 3,
            actividadesTotales: 4,
            puntosGanados: 150,
            tiempoInvertidoMinutos: 62,
            estrellas: 3,
            ultimaActividad: new Date().toISOString(),
          },
          {
            codigo: '2025-11-mes-ciencia-fisica',
            progresoPorcentaje: 50,
            actividadesCompletadas: 2,
            actividadesTotales: 4,
            puntosGanados: 100,
            tiempoInvertidoMinutos: 45,
            estrellas: 2,
            ultimaActividad: new Date().toISOString(),
          },
          {
            codigo: '2025-11-mes-ciencia-informatica',
            progresoPorcentaje: 25,
            actividadesCompletadas: 1,
            actividadesTotales: 4,
            puntosGanados: 50,
            tiempoInvertidoMinutos: 20,
            estrellas: 1,
            ultimaActividad: null,
          },
        ],
        estadisticas: {
          progresoGlobalPorcentaje: 62,
          totalActividadesCompletadas: 10,
          totalActividades: 16,
          totalPuntosGanados: 500,
          totalTiempoInvertidoMinutos: 212,
          estrellasGanadas: 10,
          cienciasCompletadas: 1,
        },
      };

      // Combinar metadatos con progreso
      const cienciasCompletas: CienciaCompleta[] = CIENCIAS_ORDENADAS.map((codigo) => {
        const progresoData = mockData.ciencias.find((c) => c.codigo === codigo);

        // Fallback si no hay datos de progreso
        const progreso: ProgresoCiencia = progresoData || {
          codigo,
          progresoPorcentaje: 0,
          actividadesCompletadas: 0,
          actividadesTotales: 4,
          puntosGanados: 0,
          tiempoInvertidoMinutos: 0,
          estrellas: 0,
          ultimaActividad: null,
        };

        return {
          metadatos: METADATOS_CIENCIAS[codigo],
          progreso,
        };
      });

      setCiencias(cienciasCompletas);
      setEstadisticas(mockData.estadisticas);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error desconocido al cargar progreso');
      setError(errorObj);
      console.error('Error al obtener progreso del Mes de la Ciencia:', errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [estudianteId]);

  // Efecto para cargar datos al montar
  useEffect(() => {
    fetchProgreso();
  }, [fetchProgreso]);

  return {
    ciencias,
    estadisticas,
    isLoading,
    error,
    refetch: fetchProgreso,
  };
}
