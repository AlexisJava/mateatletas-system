/**
 * Tests de Constantes para Suscripciones Familiares 2026
 *
 * REGLA DE NEGOCIO 2026:
 * - Una suscripción por familia (no por hijo como antes)
 * - Descuento 10% FIJO desde la 2da actividad (no incremental)
 * - Un solo PreApproval en MercadoPago por familia
 *
 * DIFERENCIA vs modelo 2025:
 * - Antes: Descuento por hijo (10%, 20%, 30%... hasta 50%)
 * - Ahora: Descuento FIJO 10% desde la 2da actividad, sin límite
 *
 * BLACK BOX TESTING - BOUNDARIES:
 * - ordenActividad: [0, 1, 2, N]
 * - precioBase: [0, negativo, positivo]
 * - preciosActividades: [vacío, 1, 2, N]
 */
import {
  DESCUENTO_ACTIVIDAD_ADICIONAL,
  calcularPrecioActividad,
  calcularMontoMensualTotal,
  simularAgregarActividades,
  obtenerPrecioTier,
} from '../domain/constants/suscripcion-familiar.constants';
import { TIERS_STEAM } from '../../domain/constants/pricing.constants';

describe('Constantes de Suscripción Familiar 2026', () => {
  describe('DESCUENTO_ACTIVIDAD_ADICIONAL', () => {
    it('debe ser 10% (descuento fijo desde la 2da actividad)', () => {
      expect(DESCUENTO_ACTIVIDAD_ADICIONAL).toBe(10);
    });
  });

  describe('obtenerPrecioTier', () => {
    it('debe retornar $40,000 para STEAM_LIBROS', () => {
      expect(obtenerPrecioTier('STEAM_LIBROS')).toBe(TIERS_STEAM.STEAM_LIBROS);
      expect(obtenerPrecioTier('STEAM_LIBROS')).toBe(40000);
    });

    it('debe retornar $65,000 para STEAM_ASINCRONICO', () => {
      expect(obtenerPrecioTier('STEAM_ASINCRONICO')).toBe(
        TIERS_STEAM.STEAM_ASINCRONICO,
      );
      expect(obtenerPrecioTier('STEAM_ASINCRONICO')).toBe(65000);
    });

    it('debe retornar $95,000 para STEAM_SINCRONICO', () => {
      expect(obtenerPrecioTier('STEAM_SINCRONICO')).toBe(
        TIERS_STEAM.STEAM_SINCRONICO,
      );
      expect(obtenerPrecioTier('STEAM_SINCRONICO')).toBe(95000);
    });

    it('debe retornar precio de STEAM_LIBROS para tier desconocido (fallback)', () => {
      // @ts-expect-error - Testear tier inválido
      expect(obtenerPrecioTier('TIER_DESCONOCIDO')).toBe(
        TIERS_STEAM.STEAM_LIBROS,
      );
    });
  });

  describe('calcularPrecioActividad', () => {
    describe('Boundaries: ordenActividad', () => {
      it('ordenActividad=1 (primera): debe retornar precio completo SIN descuento', () => {
        const resultado = calcularPrecioActividad(40000, 1);

        expect(resultado.precioBase).toBe(40000);
        expect(resultado.descuentoPorcentaje).toBe(0);
        expect(resultado.descuentoMonto).toBe(0);
        expect(resultado.precioFinal).toBe(40000);
        expect(resultado.ordenActividad).toBe(1);
      });

      it('ordenActividad=2 (segunda): debe aplicar 10% de descuento', () => {
        const resultado = calcularPrecioActividad(40000, 2);

        expect(resultado.precioBase).toBe(40000);
        expect(resultado.descuentoPorcentaje).toBe(10);
        expect(resultado.descuentoMonto).toBe(4000);
        expect(resultado.precioFinal).toBe(36000);
        expect(resultado.ordenActividad).toBe(2);
      });

      it('ordenActividad=3 (tercera): debe aplicar 10% de descuento (mismo que 2da)', () => {
        const resultado = calcularPrecioActividad(40000, 3);

        expect(resultado.descuentoPorcentaje).toBe(10);
        expect(resultado.precioFinal).toBe(36000);
      });

      it('ordenActividad=10 (décima): debe aplicar 10% de descuento (constante)', () => {
        const resultado = calcularPrecioActividad(40000, 10);

        // El descuento es FIJO 10%, no incrementa como el modelo 2025
        expect(resultado.descuentoPorcentaje).toBe(10);
        expect(resultado.precioFinal).toBe(36000);
      });

      it('ordenActividad=0 (inválido): debe lanzar error', () => {
        expect(() => calcularPrecioActividad(40000, 0)).toThrow(
          'Orden de actividad inválido: 0',
        );
      });

      it('ordenActividad=-1 (negativo): debe lanzar error', () => {
        expect(() => calcularPrecioActividad(40000, -1)).toThrow(
          'Orden de actividad inválido: -1',
        );
      });
    });

    describe('Boundaries: precioBase', () => {
      it('precioBase=0: debe retornar 0 (sin error)', () => {
        const resultado = calcularPrecioActividad(0, 1);

        expect(resultado.precioBase).toBe(0);
        expect(resultado.precioFinal).toBe(0);
      });

      it('precioBase negativo: debe lanzar error', () => {
        expect(() => calcularPrecioActividad(-1000, 1)).toThrow(
          'Precio base inválido: -1000',
        );
      });

      it('debe redondear descuentos correctamente', () => {
        // 10% de 95000 = 9500 (exacto)
        const resultado = calcularPrecioActividad(95000, 2);
        expect(resultado.descuentoMonto).toBe(9500);
        expect(resultado.precioFinal).toBe(85500);
      });

      it('debe redondear hacia el entero más cercano (Math.round)', () => {
        // 10% de 45555 = 4555.5 → 4556 (redondeado)
        const resultado = calcularPrecioActividad(45555, 2);
        expect(resultado.descuentoMonto).toBe(4556);
        expect(resultado.precioFinal).toBe(45555 - 4556);
      });
    });
  });

  describe('calcularMontoMensualTotal', () => {
    describe('Boundaries: preciosActividades', () => {
      it('array vacío: debe retornar todo en 0', () => {
        const resultado = calcularMontoMensualTotal([]);

        expect(resultado.montoSinDescuento).toBe(0);
        expect(resultado.montoConDescuento).toBe(0);
        expect(resultado.ahorroTotal).toBe(0);
        expect(resultado.actividadesConDescuento).toBe(0);
        expect(resultado.totalActividades).toBe(0);
      });

      it('1 actividad: debe retornar precio completo sin descuento', () => {
        const resultado = calcularMontoMensualTotal([40000]);

        expect(resultado.montoSinDescuento).toBe(40000);
        expect(resultado.montoConDescuento).toBe(40000);
        expect(resultado.ahorroTotal).toBe(0);
        expect(resultado.actividadesConDescuento).toBe(0);
        expect(resultado.totalActividades).toBe(1);
      });

      it('2 actividades: debe aplicar descuento solo a la 2da', () => {
        const resultado = calcularMontoMensualTotal([40000, 40000]);

        // 1ra: 40000 (0%)
        // 2da: 36000 (10%)
        expect(resultado.montoSinDescuento).toBe(80000);
        expect(resultado.montoConDescuento).toBe(76000);
        expect(resultado.ahorroTotal).toBe(4000);
        expect(resultado.actividadesConDescuento).toBe(1);
        expect(resultado.totalActividades).toBe(2);
      });

      it('3 actividades: debe aplicar descuento a 2da y 3ra', () => {
        const resultado = calcularMontoMensualTotal([40000, 40000, 40000]);

        // 1ra: 40000 (0%)
        // 2da: 36000 (10%)
        // 3ra: 36000 (10%)
        expect(resultado.montoSinDescuento).toBe(120000);
        expect(resultado.montoConDescuento).toBe(112000);
        expect(resultado.ahorroTotal).toBe(8000);
        expect(resultado.actividadesConDescuento).toBe(2);
        expect(resultado.totalActividades).toBe(3);
      });
    });

    describe('Escenarios de negocio', () => {
      it('Familia con 3 hijos en diferentes planes', () => {
        // Hijo 1: STEAM_LIBROS (40k)
        // Hijo 2: STEAM_ASINCRONICO (65k)
        // Hijo 3: STEAM_SINCRONICO (95k)
        const resultado = calcularMontoMensualTotal([40000, 65000, 95000]);

        // 1ra: 40000 (0%)
        // 2da: 58500 (65000 - 6500)
        // 3ra: 85500 (95000 - 9500)
        expect(resultado.montoSinDescuento).toBe(200000);
        expect(resultado.montoConDescuento).toBe(40000 + 58500 + 85500);
        expect(resultado.montoConDescuento).toBe(184000);
        expect(resultado.ahorroTotal).toBe(16000); // 6500 + 9500
      });

      it('Familia con 5 actividades (caso límite alto)', () => {
        const precios = [40000, 40000, 65000, 65000, 95000];
        const resultado = calcularMontoMensualTotal(precios);

        // 1ra: 40000 (0%)
        // 2da: 36000 (10%)
        // 3ra: 58500 (10%)
        // 4ta: 58500 (10%)
        // 5ta: 85500 (10%)
        const esperado = 40000 + 36000 + 58500 + 58500 + 85500;
        expect(resultado.montoConDescuento).toBe(esperado);
        expect(resultado.actividadesConDescuento).toBe(4); // todas menos la primera
      });
    });
  });

  describe('simularAgregarActividades', () => {
    it('debe calcular diferencia al agregar actividad a suscripción vacía', () => {
      const resultado = simularAgregarActividades([], [40000]);

      expect(resultado.montoActual).toBe(0);
      expect(resultado.montoNuevo).toBe(40000);
      expect(resultado.diferencia).toBe(40000);
      expect(resultado.ahorroAdicional).toBe(0); // primera actividad no tiene descuento
    });

    it('debe calcular diferencia al agregar 2da actividad', () => {
      const resultado = simularAgregarActividades([40000], [40000]);

      // Actual: 40000
      // Nueva: 40000 + 36000 = 76000
      expect(resultado.montoActual).toBe(40000);
      expect(resultado.montoNuevo).toBe(76000);
      expect(resultado.diferencia).toBe(36000); // 76000 - 40000
      expect(resultado.ahorroAdicional).toBe(4000); // descuento de la 2da
    });

    it('debe calcular diferencia al agregar múltiples actividades', () => {
      const resultado = simularAgregarActividades(
        [40000],
        [65000, 95000], // agregar 2 actividades
      );

      // Actual: 40000 (0%)
      // Nuevas: 40000 + 58500 + 85500 = 184000
      expect(resultado.montoActual).toBe(40000);
      expect(resultado.montoNuevo).toBe(40000 + 58500 + 85500);
      expect(resultado.diferencia).toBe(144000);
      expect(resultado.ahorroAdicional).toBe(16000); // 6500 + 9500
    });
  });

  describe('Comparación modelo 2025 vs 2026', () => {
    it('MODELO 2026: Descuento FIJO 10% desde 2da actividad', () => {
      // 3 actividades de $40k cada una
      const resultado = calcularMontoMensualTotal([40000, 40000, 40000]);

      // 2026: 40000 + 36000 + 36000 = 112000
      expect(resultado.montoConDescuento).toBe(112000);
      expect(resultado.ahorroTotal).toBe(8000);
    });

    it('DIFERENCIA: en 2025 el descuento era incremental por hijo', () => {
      // En 2025 con el modelo viejo sería:
      // Hijo 1: 40000 (0%)
      // Hijo 2: 36000 (10%)
      // Hijo 3: 32000 (20%)
      // Total 2025: 108000
      // Ahorro 2025: 12000

      // En 2026 con descuento fijo:
      // Act 1: 40000 (0%)
      // Act 2: 36000 (10%)
      // Act 3: 36000 (10%)
      // Total 2026: 112000
      // Ahorro 2026: 8000

      // El nuevo modelo es más simple pero genera menos ahorro para familias grandes
      const resultado2026 = calcularMontoMensualTotal([40000, 40000, 40000]);
      expect(resultado2026.ahorroTotal).toBe(8000);

      // Pero para familias con muchas actividades, el descuento es predecible
      const familia5Actividades = calcularMontoMensualTotal([
        40000, 40000, 40000, 40000, 40000,
      ]);

      // Todas las actividades después de la 1ra tienen 10%
      expect(familia5Actividades.actividadesConDescuento).toBe(4);
      expect(familia5Actividades.ahorroTotal).toBe(16000); // 4 * 4000
    });
  });
});
