import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/axios';
import {
  type CasaDistribution,
  EMPTY_CASA_DISTRIBUTION,
  getCasaByEdad,
} from '@/lib/constants/casas-2026';

interface EstudianteBasico {
  edad: number;
  casa?: { nombre: string } | null;
}

interface UseCasaDistributionReturn {
  distribution: CasaDistribution;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para cargar y calcular la distribución de estudiantes por Casa
 *
 * @example
 * ```tsx
 * const { distribution, isLoading } = useCasaDistribution();
 *
 * return (
 *   <div>
 *     <p>Quantum: {distribution.Quantum}</p>
 *     <p>Vertex: {distribution.Vertex}</p>
 *     <p>Pulsar: {distribution.Pulsar}</p>
 *   </div>
 * );
 * ```
 */
export function useCasaDistribution(): UseCasaDistributionReturn {
  const [distribution, setDistribution] = useState<CasaDistribution>(EMPTY_CASA_DISTRIBUTION);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDistribution = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get<{ data?: EstudianteBasico[] } | EstudianteBasico[]>(
        '/admin/estudiantes',
      );

      const data = (response as { data?: EstudianteBasico[] })?.data
        ? (response as { data: EstudianteBasico[] }).data
        : Array.isArray(response)
          ? response
          : [];

      const newDistribution: CasaDistribution = {
        Quantum: 0,
        Vertex: 0,
        Pulsar: 0,
        SinCasa: 0,
      };

      data.forEach((est) => {
        const casaNombre = est.casa?.nombre || getCasaByEdad(est.edad);
        if (casaNombre === 'Quantum') newDistribution.Quantum++;
        else if (casaNombre === 'Vertex') newDistribution.Vertex++;
        else if (casaNombre === 'Pulsar') newDistribution.Pulsar++;
        else newDistribution.SinCasa++;
      });

      setDistribution(newDistribution);
    } catch (err) {
      console.error('Error al cargar distribución de casas:', err);
      setError('Error al cargar distribución de estudiantes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDistribution();
  }, [loadDistribution]);

  return {
    distribution,
    isLoading,
    error,
    refetch: loadDistribution,
  };
}
