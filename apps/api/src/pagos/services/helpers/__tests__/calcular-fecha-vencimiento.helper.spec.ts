import { BadRequestException } from '@nestjs/common';
import { calcularFechaVencimiento } from '../calcular-fecha-vencimiento.helper';

/**
 * calcularFechaVencimiento Helper Tests
 *
 * OBJETIVO: Validar cálculo correcto de fechas de vencimiento
 *
 * Casos críticos:
 * 1. Calcular último día del mes correctamente
 * 2. Manejar meses con 28/29/30/31 días
 * 3. Establecer hora en 23:59:59.999
 * 4. Rechazar períodos inválidos
 */

describe('calcularFechaVencimiento', () => {
  describe('Valid periods', () => {
    it('should calculate last day of January (31 days)', () => {
      // Act
      const result = calcularFechaVencimiento('2025-01');

      // Assert
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0); // Enero (0-indexed)
      expect(result.getDate()).toBe(31);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });

    it('should calculate last day of February in non-leap year (28 days)', () => {
      // Act
      const result = calcularFechaVencimiento('2025-02');

      // Assert
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(1); // Febrero
      expect(result.getDate()).toBe(28);
    });

    it('should calculate last day of February in leap year (29 days)', () => {
      // Act
      const result = calcularFechaVencimiento('2024-02');

      // Assert
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(1); // Febrero
      expect(result.getDate()).toBe(29);
    });

    it('should calculate last day of April (30 days)', () => {
      // Act
      const result = calcularFechaVencimiento('2025-04');

      // Assert
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(3); // Abril
      expect(result.getDate()).toBe(30);
    });

    it('should calculate last day of December (31 days)', () => {
      // Act
      const result = calcularFechaVencimiento('2025-12');

      // Assert
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(11); // Diciembre
      expect(result.getDate()).toBe(31);
    });

    it('should handle months with leading zeros', () => {
      // Act
      const result = calcularFechaVencimiento('2025-05');

      // Assert
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(4); // Mayo
      expect(result.getDate()).toBe(31);
    });

    it('should handle months without leading zeros', () => {
      // Act
      const result = calcularFechaVencimiento('2025-5');

      // Assert
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(4); // Mayo
      expect(result.getDate()).toBe(31);
    });

    it('should always set time to 23:59:59.999', () => {
      // Act
      const results = [
        calcularFechaVencimiento('2025-01'),
        calcularFechaVencimiento('2025-06'),
        calcularFechaVencimiento('2025-12'),
      ];

      // Assert - Todos deben tener la misma hora exacta
      results.forEach((result) => {
        expect(result.getHours()).toBe(23);
        expect(result.getMinutes()).toBe(59);
        expect(result.getSeconds()).toBe(59);
        expect(result.getMilliseconds()).toBe(999);
      });
    });
  });

  describe('Invalid periods', () => {
    it('should throw BadRequestException for invalid month (0)', () => {
      // Act & Assert
      expect(() => calcularFechaVencimiento('2025-0')).toThrow(BadRequestException);
      expect(() => calcularFechaVencimiento('2025-0')).toThrow(
        'Período inválido recibido para calcular fecha de vencimiento: "2025-0"',
      );
    });

    it('should throw BadRequestException for invalid month (13)', () => {
      // Act & Assert
      expect(() => calcularFechaVencimiento('2025-13')).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for negative month', () => {
      // Act & Assert
      expect(() => calcularFechaVencimiento('2025--1')).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid format (missing dash)', () => {
      // Act & Assert
      expect(() => calcularFechaVencimiento('202501')).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid format (only year)', () => {
      // Act & Assert
      expect(() => calcularFechaVencimiento('2025')).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for non-numeric year', () => {
      // Act & Assert
      expect(() => calcularFechaVencimiento('abcd-01')).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for non-numeric month', () => {
      // Act & Assert
      expect(() => calcularFechaVencimiento('2025-ab')).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for empty string', () => {
      // Act & Assert
      expect(() => calcularFechaVencimiento('')).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for month as string', () => {
      // Act & Assert
      expect(() => calcularFechaVencimiento('2025-January')).toThrow(BadRequestException);
    });
  });

  describe('Edge cases', () => {
    it('should handle very old dates', () => {
      // Act
      const result = calcularFechaVencimiento('1900-01');

      // Assert
      expect(result.getFullYear()).toBe(1900);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(31);
    });

    it('should handle future dates', () => {
      // Act
      const result = calcularFechaVencimiento('2099-12');

      // Assert
      expect(result.getFullYear()).toBe(2099);
      expect(result.getMonth()).toBe(11);
      expect(result.getDate()).toBe(31);
    });

    it('should correctly handle all months in a year', () => {
      // Arrange - Días esperados por mes en año no bisiesto
      const expectedDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

      // Act & Assert
      for (let mes = 1; mes <= 12; mes++) {
        const periodo = `2025-${String(mes).padStart(2, '0')}`;
        const result = calcularFechaVencimiento(periodo);
        expect(result.getDate()).toBe(expectedDays[mes - 1]);
      }
    });

    it('should be usable for date comparisons', () => {
      // Arrange
      const periodo = '2025-01';
      const fechaVencimiento = calcularFechaVencimiento(periodo);

      // Fechas dentro del mes
      const fechaDentro1 = new Date('2025-01-01T00:00:00');
      const fechaDentro2 = new Date('2025-01-15T12:00:00');
      const fechaDentro3 = new Date('2025-01-31T20:00:00');

      // Fechas fuera del mes
      const fechaFuera1 = new Date('2025-02-01T00:00:00');
      const fechaFuera2 = new Date('2025-02-15T12:00:00');

      // Assert - Fechas dentro del mes deben ser <= vencimiento
      expect(fechaDentro1 <= fechaVencimiento).toBe(true);
      expect(fechaDentro2 <= fechaVencimiento).toBe(true);
      expect(fechaDentro3 <= fechaVencimiento).toBe(true);

      // Assert - Fechas fuera del mes deben ser > vencimiento
      expect(fechaFuera1 > fechaVencimiento).toBe(true);
      expect(fechaFuera2 > fechaVencimiento).toBe(true);
    });
  });

  describe('Consistency', () => {
    it('should return same result for same input', () => {
      // Act
      const result1 = calcularFechaVencimiento('2025-06');
      const result2 = calcularFechaVencimiento('2025-06');

      // Assert
      expect(result1.getTime()).toBe(result2.getTime());
    });

    it('should return different results for different inputs', () => {
      // Act
      const result1 = calcularFechaVencimiento('2025-01');
      const result2 = calcularFechaVencimiento('2025-02');

      // Assert
      expect(result1.getTime()).not.toBe(result2.getTime());
    });
  });
});