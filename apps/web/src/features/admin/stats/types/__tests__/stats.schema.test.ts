import { describe, it, expect } from 'vitest';
import { SystemStatsSchema, parseSystemStats, safeParseSystemStats } from '../stats.schema';

describe('SystemStatsSchema', () => {
  describe('validación exitosa', () => {
    it('debe validar datos correctos del sistema', () => {
      const validData = {
        totalUsuarios: 100,
        totalTutores: 50,
        totalDocentes: 20,
        totalEstudiantes: 30,
        totalClases: 150,
        clasesActivas: 75,
        totalProductos: 10,
        ingresosTotal: 50000,
      };

      const result = SystemStatsSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('debe aceptar valores en cero', () => {
      const zeroData = {
        totalUsuarios: 0,
        totalTutores: 0,
        totalDocentes: 0,
        totalEstudiantes: 0,
        totalClases: 0,
        clasesActivas: 0,
        totalProductos: 0,
        ingresosTotal: 0,
      };

      const result = SystemStatsSchema.safeParse(zeroData);

      expect(result.success).toBe(true);
    });
  });

  describe('validación fallida', () => {
    it('debe rechazar números negativos', () => {
      const invalidData = {
        totalUsuarios: -10,
        totalTutores: 50,
        totalDocentes: 20,
        totalEstudiantes: 30,
        totalClases: 150,
        clasesActivas: 75,
        totalProductos: 10,
        ingresosTotal: 50000,
      };

      const result = SystemStatsSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('debe rechazar campos faltantes', () => {
      const incompleteData = {
        totalUsuarios: 100,
        totalTutores: 50,
        // Faltan campos
      };

      const result = SystemStatsSchema.safeParse(incompleteData);

      expect(result.success).toBe(false);
    });

    it('debe rechazar tipos incorrectos', () => {
      const wrongTypeData = {
        totalUsuarios: '100', // String en lugar de number
        totalTutores: 50,
        totalDocentes: 20,
        totalEstudiantes: 30,
        totalClases: 150,
        clasesActivas: 75,
        totalProductos: 10,
        ingresosTotal: 50000,
      };

      const result = SystemStatsSchema.safeParse(wrongTypeData);

      expect(result.success).toBe(false);
    });
  });

  describe('parseSystemStats', () => {
    it('debe parsear datos válidos correctamente', () => {
      const validData = {
        totalUsuarios: 100,
        totalTutores: 50,
        totalDocentes: 20,
        totalEstudiantes: 30,
        totalClases: 150,
        clasesActivas: 75,
        totalProductos: 10,
        ingresosTotal: 50000,
      };

      const parsed = parseSystemStats(validData);

      expect(parsed).toEqual(validData);
    });

    it('debe lanzar error con datos inválidos', () => {
      const invalidData = {
        totalUsuarios: -10,
      };

      expect(() => parseSystemStats(invalidData)).toThrow();
    });
  });

  describe('safeParseSystemStats', () => {
    it('debe retornar datos válidos', () => {
      const validData = {
        totalUsuarios: 100,
        totalTutores: 50,
        totalDocentes: 20,
        totalEstudiantes: 30,
        totalClases: 150,
        clasesActivas: 75,
        totalProductos: 10,
        ingresosTotal: 50000,
      };

      const result = safeParseSystemStats(validData);

      expect(result).toEqual(validData);
    });

    it('debe retornar null con datos inválidos', () => {
      const invalidData = {
        totalUsuarios: -10,
      };

      const result = safeParseSystemStats(invalidData);

      expect(result).toBeNull();
    });
  });
});
