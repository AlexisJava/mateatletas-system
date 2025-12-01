import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStatsStore } from '../stats.store';
import { ErrorCode } from '../../../shared/types/errors.types';
import * as adminApi from '@/lib/api/admin.api';

// Mock del módulo admin.api
vi.mock('@/lib/api/admin.api', () => ({
  getSystemStats: vi.fn(),
}));

describe('StatsStore', () => {
  beforeEach(() => {
    // Reset del store antes de cada test
    useStatsStore.setState({
      stats: null,
      isLoading: false,
      error: null,
    });

    // Clear de todos los mocks
    vi.clearAllMocks();
  });

  describe('estado inicial', () => {
    it('debe tener valores iniciales correctos', () => {
      const state = useStatsStore.getState();

      expect(state.stats).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchStats', () => {
    it('debe actualizar stats con datos válidos', async () => {
      const mockStats = {
        totalUsuarios: 100,
        totalTutores: 50,
        totalDocentes: 20,
        totalEstudiantes: 30,
        totalClases: 150,
        clasesActivas: 75,
        totalProductos: 10,
        ingresosTotal: 50000,
        pagosPendientes: 5,
        inscripcionesActivas: 25,
      };

      vi.mocked(adminApi.getSystemStats).mockResolvedValue(mockStats);

      const { fetchStats } = useStatsStore.getState();

      await fetchStats();

      const state = useStatsStore.getState();

      expect(state.stats).toEqual(mockStats);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('debe setear isLoading durante la carga', async () => {
      vi.mocked(adminApi.getSystemStats).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                totalUsuarios: 100,
                totalTutores: 50,
                totalDocentes: 20,
                totalEstudiantes: 30,
                totalClases: 150,
                clasesActivas: 75,
                totalProductos: 10,
                ingresosTotal: 50000,
                pagosPendientes: 5,
                inscripcionesActivas: 25,
              });
            }, 100);
          }),
      );

      const { fetchStats } = useStatsStore.getState();

      const promise = fetchStats();

      // Durante la carga
      expect(useStatsStore.getState().isLoading).toBe(true);

      await promise;

      // Después de la carga
      expect(useStatsStore.getState().isLoading).toBe(false);
    });

    it('debe manejar errores de red', async () => {
      const networkError = new Error('Network Error');
      vi.mocked(adminApi.getSystemStats).mockRejectedValue(networkError);

      const { fetchStats } = useStatsStore.getState();

      await fetchStats();

      const state = useStatsStore.getState();

      expect(state.stats).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).not.toBeNull();
      // Un Error simple sin isAxiosError se convierte en UNKNOWN_ERROR
      expect(state.error?.code).toBe(ErrorCode.UNKNOWN_ERROR);
    });

    it('debe manejar errores de validación Zod', async () => {
      const invalidData = {
        totalUsuarios: -10, // Número negativo inválido
      };

      vi.mocked(adminApi.getSystemStats).mockResolvedValue(invalidData);

      const { fetchStats } = useStatsStore.getState();

      await fetchStats();

      const state = useStatsStore.getState();

      expect(state.stats).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).not.toBeNull();
      expect(state.error?.code).toBe(ErrorCode.VALIDATION_ERROR);
    });
  });

  describe('clearError', () => {
    it('debe limpiar el error', () => {
      // Setear un error manualmente
      useStatsStore.setState({
        error: {
          code: ErrorCode.NETWORK_ERROR,
          message: 'Test error',
          timestamp: new Date().toISOString(),
        },
      });

      const { clearError } = useStatsStore.getState();
      clearError();

      expect(useStatsStore.getState().error).toBeNull();
    });
  });

  describe('reset', () => {
    it('debe resetear todo el estado', () => {
      // Setear estado manualmente
      useStatsStore.setState({
        stats: {
          totalUsuarios: 100,
          totalTutores: 50,
          totalDocentes: 20,
          totalEstudiantes: 30,
          totalClases: 150,
          clasesActivas: 75,
          totalProductos: 10,
          ingresosTotal: 50000,
          pagosPendientes: 5,
          inscripcionesActivas: 25,
        },
        isLoading: true,
        error: {
          code: ErrorCode.NETWORK_ERROR,
          message: 'Test error',
          timestamp: new Date().toISOString(),
        },
      });

      const { reset } = useStatsStore.getState();
      reset();

      const state = useStatsStore.getState();

      expect(state.stats).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
