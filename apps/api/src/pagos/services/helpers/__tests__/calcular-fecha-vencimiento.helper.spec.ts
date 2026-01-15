import { BadRequestException } from '@nestjs/common';
import {
  calcularFechaVencimiento,
  calcularFechaLimiteRecargo,
  calcularEstadoPago,
  calcularMontoProporcional,
  estaEnPeriodoRecargo,
  estaPasadoLimite,
  FECHA_VENCIMIENTO_NORMAL,
  FECHA_VENCIMIENTO_CON_RECARGO,
  PORCENTAJE_RECARGO,
} from '../calcular-fecha-vencimiento.helper';

/**
 * Tests para el helper de fechas de vencimiento
 *
 * REGLA DE NEGOCIO:
 * - Día 1-9: Pago normal (VIGENTE)
 * - Día 10-12: Pago con 15% recargo (CON_RECARGO)
 * - Día 13+: Se anula inscripción (ANULABLE)
 */

describe('calcularFechaVencimiento', () => {
  describe('Constantes', () => {
    it('debe tener día 9 como vencimiento normal', () => {
      expect(FECHA_VENCIMIENTO_NORMAL).toBe(9);
    });

    it('debe tener día 12 como límite con recargo', () => {
      expect(FECHA_VENCIMIENTO_CON_RECARGO).toBe(12);
    });

    it('debe tener 15% de recargo', () => {
      expect(PORCENTAJE_RECARGO).toBe(15);
    });
  });

  describe('calcularFechaVencimiento (día 9)', () => {
    it('debe retornar día 9 de enero para periodo 2025-01', () => {
      const result = calcularFechaVencimiento('2025-01');

      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0); // Enero (0-indexed)
      expect(result.getDate()).toBe(9);
    });

    it('debe retornar día 9 de febrero para periodo 2025-02', () => {
      const result = calcularFechaVencimiento('2025-02');

      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(1);
      expect(result.getDate()).toBe(9);
    });

    it('debe retornar día 9 de diciembre para periodo 2025-12', () => {
      const result = calcularFechaVencimiento('2025-12');

      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(11);
      expect(result.getDate()).toBe(9);
    });

    it('debe establecer hora en 23:59:59.999', () => {
      const result = calcularFechaVencimiento('2025-06');

      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });

    it('debe manejar meses con ceros iniciales', () => {
      const result = calcularFechaVencimiento('2025-05');

      expect(result.getMonth()).toBe(4); // Mayo
      expect(result.getDate()).toBe(9);
    });

    it('debe manejar meses sin ceros iniciales', () => {
      const result = calcularFechaVencimiento('2025-5');

      expect(result.getMonth()).toBe(4);
      expect(result.getDate()).toBe(9);
    });
  });

  describe('calcularFechaLimiteRecargo (día 12)', () => {
    it('debe retornar día 12 de enero para periodo 2025-01', () => {
      const result = calcularFechaLimiteRecargo('2025-01');

      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(12);
    });

    it('debe establecer hora en 23:59:59.999', () => {
      const result = calcularFechaLimiteRecargo('2025-06');

      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe('Periodos inválidos', () => {
    it('debe lanzar BadRequestException para mes 0', () => {
      expect(() => calcularFechaVencimiento('2025-0')).toThrow(
        BadRequestException,
      );
      expect(() => calcularFechaVencimiento('2025-0')).toThrow(
        'Período inválido recibido: "2025-0"',
      );
    });

    it('debe lanzar BadRequestException para mes 13', () => {
      expect(() => calcularFechaVencimiento('2025-13')).toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar BadRequestException para mes negativo', () => {
      expect(() => calcularFechaVencimiento('2025--1')).toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar BadRequestException para formato inválido', () => {
      expect(() => calcularFechaVencimiento('202501')).toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar BadRequestException para string vacío', () => {
      expect(() => calcularFechaVencimiento('')).toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException para año no numérico', () => {
      expect(() => calcularFechaVencimiento('abcd-01')).toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar BadRequestException para mes no numérico', () => {
      expect(() => calcularFechaVencimiento('2025-ab')).toThrow(
        BadRequestException,
      );
    });
  });
});

describe('calcularEstadoPago', () => {
  const MONTO_BASE = 10000;

  describe('Estado VIGENTE (día 1-9)', () => {
    it('debe retornar VIGENTE para día 1', () => {
      const fecha = new Date(2025, 0, 1); // 1 enero
      const result = calcularEstadoPago('2025-01', MONTO_BASE, fecha);

      expect(result.estado).toBe('VIGENTE');
      expect(result.porcentajeRecargo).toBe(0);
      expect(result.montoRecargo).toBe(0);
      expect(result.montoTotal).toBe(MONTO_BASE);
    });

    it('debe retornar VIGENTE para día 9', () => {
      const fecha = new Date(2025, 0, 9); // 9 enero
      const result = calcularEstadoPago('2025-01', MONTO_BASE, fecha);

      expect(result.estado).toBe('VIGENTE');
      expect(result.diasRestantes).toBe(0); // Es el último día vigente
    });

    it('debe calcular días restantes correctamente', () => {
      const fecha = new Date(2025, 0, 5); // 5 enero
      const result = calcularEstadoPago('2025-01', MONTO_BASE, fecha);

      expect(result.estado).toBe('VIGENTE');
      expect(result.diasRestantes).toBe(4); // Faltan 4 días para el 9
    });
  });

  describe('Estado CON_RECARGO (día 10-12)', () => {
    it('debe retornar CON_RECARGO para día 10', () => {
      const fecha = new Date(2025, 0, 10); // 10 enero
      const result = calcularEstadoPago('2025-01', MONTO_BASE, fecha);

      expect(result.estado).toBe('CON_RECARGO');
      expect(result.porcentajeRecargo).toBe(15);
      expect(result.montoRecargo).toBe(1500); // 15% de 10000
      expect(result.montoTotal).toBe(11500);
    });

    it('debe retornar CON_RECARGO para día 12', () => {
      const fecha = new Date(2025, 0, 12); // 12 enero
      const result = calcularEstadoPago('2025-01', MONTO_BASE, fecha);

      expect(result.estado).toBe('CON_RECARGO');
      expect(result.diasRestantes).toBe(0); // Último día con recargo
    });

    it('debe calcular días restantes hasta día 12', () => {
      const fecha = new Date(2025, 0, 10); // 10 enero
      const result = calcularEstadoPago('2025-01', MONTO_BASE, fecha);

      expect(result.diasRestantes).toBe(2); // Faltan 2 días para el 12
    });
  });

  describe('Estado ANULABLE (día 13+)', () => {
    it('debe retornar ANULABLE para día 13', () => {
      const fecha = new Date(2025, 0, 13); // 13 enero
      const result = calcularEstadoPago('2025-01', MONTO_BASE, fecha);

      expect(result.estado).toBe('ANULABLE');
      expect(result.diasRestantes).toBe(0);
    });

    it('debe retornar ANULABLE para día 20', () => {
      const fecha = new Date(2025, 0, 20); // 20 enero
      const result = calcularEstadoPago('2025-01', MONTO_BASE, fecha);

      expect(result.estado).toBe('ANULABLE');
    });

    it('debe retornar ANULABLE para último día del mes', () => {
      const fecha = new Date(2025, 0, 31); // 31 enero
      const result = calcularEstadoPago('2025-01', MONTO_BASE, fecha);

      expect(result.estado).toBe('ANULABLE');
    });
  });

  describe('Periodos pasados', () => {
    it('debe retornar ANULABLE para periodo de mes anterior', () => {
      const fecha = new Date(2025, 1, 5); // 5 febrero
      const result = calcularEstadoPago('2025-01', MONTO_BASE, fecha); // Periodo enero

      expect(result.estado).toBe('ANULABLE');
    });
  });
});

describe('calcularMontoProporcional', () => {
  const MONTO_MENSUAL = 30000;

  describe('Inscripción antes del día 12', () => {
    it('debe retornar monto completo para día 1', () => {
      const fecha = new Date(2025, 0, 1);
      const result = calcularMontoProporcional(MONTO_MENSUAL, fecha);

      expect(result).toBe(MONTO_MENSUAL);
    });

    it('debe retornar monto completo para día 12', () => {
      const fecha = new Date(2025, 0, 12);
      const result = calcularMontoProporcional(MONTO_MENSUAL, fecha);

      expect(result).toBe(MONTO_MENSUAL);
    });
  });

  describe('Inscripción después del día 12 (proporcional)', () => {
    it('debe calcular proporcional para día 13 de enero (31 días)', () => {
      const fecha = new Date(2025, 0, 13); // 13 enero
      const result = calcularMontoProporcional(MONTO_MENSUAL, fecha);

      // Días restantes: 31 - 13 + 1 = 19 días
      // Proporcional: (30000 / 31) * 19 ≈ 18387
      const expected = Math.round((MONTO_MENSUAL / 31) * 19);
      expect(result).toBe(expected);
    });

    it('debe calcular proporcional para día 15 de enero', () => {
      const fecha = new Date(2025, 0, 15);
      const result = calcularMontoProporcional(MONTO_MENSUAL, fecha);

      // Días restantes: 31 - 15 + 1 = 17 días
      const expected = Math.round((MONTO_MENSUAL / 31) * 17);
      expect(result).toBe(expected);
    });

    it('debe calcular proporcional para día 20 de febrero (28 días)', () => {
      const fecha = new Date(2025, 1, 20); // 20 febrero 2025 (no bisiesto)
      const result = calcularMontoProporcional(MONTO_MENSUAL, fecha);

      // Días restantes: 28 - 20 + 1 = 9 días
      const expected = Math.round((MONTO_MENSUAL / 28) * 9);
      expect(result).toBe(expected);
    });

    it('debe calcular proporcional para último día del mes', () => {
      const fecha = new Date(2025, 0, 31); // 31 enero
      const result = calcularMontoProporcional(MONTO_MENSUAL, fecha);

      // Días restantes: 31 - 31 + 1 = 1 día
      const expected = Math.round(MONTO_MENSUAL / 31);
      expect(result).toBe(expected);
    });
  });
});

describe('Funciones auxiliares', () => {
  describe('estaEnPeriodoRecargo', () => {
    it('debe retornar false para día 9', () => {
      const fecha = new Date(2025, 0, 9);
      expect(estaEnPeriodoRecargo(fecha, '2025-01')).toBe(false);
    });

    it('debe retornar true para día 10', () => {
      const fecha = new Date(2025, 0, 10);
      expect(estaEnPeriodoRecargo(fecha, '2025-01')).toBe(true);
    });

    it('debe retornar true para día 12', () => {
      const fecha = new Date(2025, 0, 12);
      expect(estaEnPeriodoRecargo(fecha, '2025-01')).toBe(true);
    });

    it('debe retornar false para día 13', () => {
      const fecha = new Date(2025, 0, 13);
      expect(estaEnPeriodoRecargo(fecha, '2025-01')).toBe(false);
    });
  });

  describe('estaPasadoLimite', () => {
    it('debe retornar false para día 12', () => {
      const fecha = new Date(2025, 0, 12);
      expect(estaPasadoLimite(fecha, '2025-01')).toBe(false);
    });

    it('debe retornar true para día 13', () => {
      const fecha = new Date(2025, 0, 13);
      expect(estaPasadoLimite(fecha, '2025-01')).toBe(true);
    });

    it('debe retornar true para día 20', () => {
      const fecha = new Date(2025, 0, 20);
      expect(estaPasadoLimite(fecha, '2025-01')).toBe(true);
    });
  });
});

describe('Consistencia', () => {
  it('debe retornar mismo resultado para mismo input', () => {
    const result1 = calcularFechaVencimiento('2025-06');
    const result2 = calcularFechaVencimiento('2025-06');

    expect(result1.getTime()).toBe(result2.getTime());
  });

  it('debe retornar resultados diferentes para inputs diferentes', () => {
    const result1 = calcularFechaVencimiento('2025-01');
    const result2 = calcularFechaVencimiento('2025-02');

    expect(result1.getTime()).not.toBe(result2.getTime());
  });
});
