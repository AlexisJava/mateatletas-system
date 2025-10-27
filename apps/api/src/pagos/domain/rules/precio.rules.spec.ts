/**
 * Tests TDD para reglas de cálculo de precios
 *
 * Especificación de negocio Mateatletas:
 * - Club Matemáticas: $50.000/mes
 * - Cursos Especializados: $55.000/mes
 * - Múltiples actividades (1 estudiante): $44.000/act
 * - Hermanos básico (1 act c/u): $44.000/act
 * - Hermanos múltiple (2+ act c/u): $38.000/act
 * - AACREA: 20% descuento (solo 1 estudiante, 1 actividad)
 */

import { Decimal } from '@prisma/client/runtime/library';
import {
  calcularPrecioActividad,
  calcularTotalMensual,
  CalculoPrecioInput,
  ConfiguracionPrecios,
} from './precio.rules';
import { TipoDescuento } from '../types/pagos.types';

describe('Reglas de Cálculo de Precios - TDD', () => {
  // Configuración de precios por defecto para todos los tests
  const configuracionDefault: ConfiguracionPrecios = {
    precioClubMatematicas: new Decimal(50000),
    precioCursosEspecializados: new Decimal(55000),
    precioMultipleActividades: new Decimal(44000),
    precioHermanosBasico: new Decimal(44000),
    precioHermanosMultiple: new Decimal(38000),
    descuentoAacreaPorcentaje: new Decimal(20),
    descuentoAacreaActivo: true,
  };

  describe('Caso Base: 1 estudiante, 1 actividad', () => {
    it('debe calcular precio base para Club Matemáticas', () => {
      const input: CalculoPrecioInput = {
        cantidadHermanos: 1,
        actividadesPorEstudiante: 1,
        tipoProducto: 'CLUB_MATEMATICAS',
        tieneAACREA: false,
        configuracion: configuracionDefault,
      };

      const resultado = calcularPrecioActividad(input);

      expect(resultado.precioBase.toNumber()).toBe(50000);
      expect(resultado.precioFinal.toNumber()).toBe(50000);
      expect(resultado.descuentoAplicado.toNumber()).toBe(0);
      expect(resultado.tipoDescuento).toBe(TipoDescuento.NINGUNO);
      expect(resultado.detalleCalculo).toContain('sin descuento');
    });

    it('debe calcular precio base para Curso Especializado', () => {
      const input: CalculoPrecioInput = {
        cantidadHermanos: 1,
        actividadesPorEstudiante: 1,
        tipoProducto: 'CURSO_ESPECIALIZADO',
        tieneAACREA: false,
        configuracion: configuracionDefault,
      };

      const resultado = calcularPrecioActividad(input);

      expect(resultado.precioBase.toNumber()).toBe(55000);
      expect(resultado.precioFinal.toNumber()).toBe(55000);
      expect(resultado.descuentoAplicado.toNumber()).toBe(0);
      expect(resultado.tipoDescuento).toBe(TipoDescuento.NINGUNO);
    });
  });

  describe('Descuento: Múltiples actividades (1 estudiante)', () => {
    it('debe aplicar descuento cuando estudiante tiene 2 actividades', () => {
      const input: CalculoPrecioInput = {
        cantidadHermanos: 1,
        actividadesPorEstudiante: 2,
        tipoProducto: 'CLUB_MATEMATICAS',
        tieneAACREA: false,
        configuracion: configuracionDefault,
      };

      const resultado = calcularPrecioActividad(input);

      expect(resultado.precioBase.toNumber()).toBe(50000);
      expect(resultado.precioFinal.toNumber()).toBe(44000);
      expect(resultado.descuentoAplicado.toNumber()).toBe(6000);
      expect(resultado.tipoDescuento).toBe(TipoDescuento.MULTIPLE_ACTIVIDADES);
      expect(resultado.detalleCalculo).toContain('2 actividades');
    });

    it('debe aplicar descuento cuando estudiante tiene 3+ actividades', () => {
      const input: CalculoPrecioInput = {
        cantidadHermanos: 1,
        actividadesPorEstudiante: 3,
        tipoProducto: 'CURSO_ESPECIALIZADO',
        tieneAACREA: false,
        configuracion: configuracionDefault,
      };

      const resultado = calcularPrecioActividad(input);

      expect(resultado.precioFinal.toNumber()).toBe(44000);
      expect(resultado.tipoDescuento).toBe(TipoDescuento.MULTIPLE_ACTIVIDADES);
    });
  });

  describe('Descuento: Hermanos básico (1 actividad c/u)', () => {
    it('debe aplicar descuento hermanos con 2 hermanos, 1 actividad cada uno', () => {
      const input: CalculoPrecioInput = {
        cantidadHermanos: 2,
        actividadesPorEstudiante: 1,
        tipoProducto: 'CLUB_MATEMATICAS',
        tieneAACREA: false,
        configuracion: configuracionDefault,
      };

      const resultado = calcularPrecioActividad(input);

      expect(resultado.precioBase.toNumber()).toBe(50000);
      expect(resultado.precioFinal.toNumber()).toBe(44000);
      expect(resultado.descuentoAplicado.toNumber()).toBe(6000);
      expect(resultado.tipoDescuento).toBe(TipoDescuento.HERMANOS_BASICO);
      expect(resultado.detalleCalculo).toContain('2 hermanos');
      expect(resultado.detalleCalculo).toContain('1 actividad');
    });

    it('debe aplicar descuento hermanos con 3+ hermanos', () => {
      const input: CalculoPrecioInput = {
        cantidadHermanos: 3,
        actividadesPorEstudiante: 1,
        tipoProducto: 'CLUB_MATEMATICAS',
        tieneAACREA: false,
        configuracion: configuracionDefault,
      };

      const resultado = calcularPrecioActividad(input);

      expect(resultado.precioFinal.toNumber()).toBe(44000);
      expect(resultado.tipoDescuento).toBe(TipoDescuento.HERMANOS_BASICO);
    });
  });

  describe('Descuento: Hermanos múltiple (2+ actividades c/u)', () => {
    it('debe aplicar mayor descuento con 2 hermanos, 2 actividades cada uno', () => {
      const input: CalculoPrecioInput = {
        cantidadHermanos: 2,
        actividadesPorEstudiante: 2,
        tipoProducto: 'CLUB_MATEMATICAS',
        tieneAACREA: false,
        configuracion: configuracionDefault,
      };

      const resultado = calcularPrecioActividad(input);

      expect(resultado.precioBase.toNumber()).toBe(50000);
      expect(resultado.precioFinal.toNumber()).toBe(38000);
      expect(resultado.descuentoAplicado.toNumber()).toBe(12000);
      expect(resultado.tipoDescuento).toBe(TipoDescuento.HERMANOS_MULTIPLE);
      expect(resultado.detalleCalculo).toContain('2 hermanos');
      expect(resultado.detalleCalculo).toContain('2 actividades');
    });

    it('debe aplicar descuento hermanos múltiple con 2 hermanos, 3+ actividades', () => {
      const input: CalculoPrecioInput = {
        cantidadHermanos: 2,
        actividadesPorEstudiante: 4,
        tipoProducto: 'CURSO_ESPECIALIZADO',
        tieneAACREA: false,
        configuracion: configuracionDefault,
      };

      const resultado = calcularPrecioActividad(input);

      expect(resultado.precioFinal.toNumber()).toBe(38000);
      expect(resultado.tipoDescuento).toBe(TipoDescuento.HERMANOS_MULTIPLE);
    });
  });

  describe('Descuento AACREA: 20%', () => {
    it('debe aplicar 20% descuento AACREA sobre Club Matemáticas', () => {
      const input: CalculoPrecioInput = {
        cantidadHermanos: 1,
        actividadesPorEstudiante: 1,
        tipoProducto: 'CLUB_MATEMATICAS',
        tieneAACREA: true,
        configuracion: configuracionDefault,
      };

      const resultado = calcularPrecioActividad(input);

      expect(resultado.precioBase.toNumber()).toBe(50000);
      expect(resultado.precioFinal.toNumber()).toBe(40000); // 50000 - 20%
      expect(resultado.descuentoAplicado.toNumber()).toBe(10000);
      expect(resultado.tipoDescuento).toBe(TipoDescuento.AACREA);
      expect(resultado.detalleCalculo).toContain('AACREA');
      expect(resultado.detalleCalculo).toContain('20%');
    });

    it('debe aplicar 20% descuento AACREA sobre Curso Especializado', () => {
      const input: CalculoPrecioInput = {
        cantidadHermanos: 1,
        actividadesPorEstudiante: 1,
        tipoProducto: 'CURSO_ESPECIALIZADO',
        tieneAACREA: true,
        configuracion: configuracionDefault,
      };

      const resultado = calcularPrecioActividad(input);

      expect(resultado.precioBase.toNumber()).toBe(55000);
      expect(resultado.precioFinal.toNumber()).toBe(44000); // 55000 - 20%
      expect(resultado.descuentoAplicado.toNumber()).toBe(11000);
      expect(resultado.tipoDescuento).toBe(TipoDescuento.AACREA);
    });

    it('NO debe aplicar AACREA si tiene múltiples actividades', () => {
      const input: CalculoPrecioInput = {
        cantidadHermanos: 1,
        actividadesPorEstudiante: 2,
        tipoProducto: 'CLUB_MATEMATICAS',
        tieneAACREA: true,
        configuracion: configuracionDefault,
      };

      const resultado = calcularPrecioActividad(input);

      // Debe aplicar descuento múltiples actividades, NO AACREA
      expect(resultado.precioFinal.toNumber()).toBe(44000);
      expect(resultado.tipoDescuento).toBe(TipoDescuento.MULTIPLE_ACTIVIDADES);
      expect(resultado.tipoDescuento).not.toBe(TipoDescuento.AACREA);
    });

    it('NO debe aplicar AACREA si son hermanos', () => {
      const input: CalculoPrecioInput = {
        cantidadHermanos: 2,
        actividadesPorEstudiante: 1,
        tipoProducto: 'CLUB_MATEMATICAS',
        tieneAACREA: true,
        configuracion: configuracionDefault,
      };

      const resultado = calcularPrecioActividad(input);

      // Debe aplicar descuento hermanos, NO AACREA
      expect(resultado.precioFinal.toNumber()).toBe(44000);
      expect(resultado.tipoDescuento).toBe(TipoDescuento.HERMANOS_BASICO);
      expect(resultado.tipoDescuento).not.toBe(TipoDescuento.AACREA);
    });

    it('NO debe aplicar AACREA si está desactivado', () => {
      const configuracionAacreaOff: ConfiguracionPrecios = {
        ...configuracionDefault,
        descuentoAacreaActivo: false,
      };

      const input: CalculoPrecioInput = {
        cantidadHermanos: 1,
        actividadesPorEstudiante: 1,
        tipoProducto: 'CLUB_MATEMATICAS',
        tieneAACREA: true,
        configuracion: configuracionAacreaOff,
      };

      const resultado = calcularPrecioActividad(input);

      expect(resultado.precioFinal.toNumber()).toBe(50000);
      expect(resultado.tipoDescuento).toBe(TipoDescuento.NINGUNO);
    });
  });

  describe('Prioridad de Descuentos', () => {
    it('hermanos múltiple tiene prioridad sobre hermanos básico', () => {
      const input: CalculoPrecioInput = {
        cantidadHermanos: 2,
        actividadesPorEstudiante: 2,
        tipoProducto: 'CLUB_MATEMATICAS',
        tieneAACREA: false,
        configuracion: configuracionDefault,
      };

      const resultado = calcularPrecioActividad(input);

      expect(resultado.tipoDescuento).toBe(TipoDescuento.HERMANOS_MULTIPLE);
      expect(resultado.precioFinal.toNumber()).toBe(38000);
    });

    it('hermanos tiene prioridad sobre AACREA', () => {
      const input: CalculoPrecioInput = {
        cantidadHermanos: 2,
        actividadesPorEstudiante: 1,
        tipoProducto: 'CLUB_MATEMATICAS',
        tieneAACREA: true,
        configuracion: configuracionDefault,
      };

      const resultado = calcularPrecioActividad(input);

      expect(resultado.tipoDescuento).toBe(TipoDescuento.HERMANOS_BASICO);
      expect(resultado.precioFinal.toNumber()).toBe(44000);
    });

    it('múltiples actividades tiene prioridad sobre AACREA', () => {
      const input: CalculoPrecioInput = {
        cantidadHermanos: 1,
        actividadesPorEstudiante: 2,
        tipoProducto: 'CLUB_MATEMATICAS',
        tieneAACREA: true,
        configuracion: configuracionDefault,
      };

      const resultado = calcularPrecioActividad(input);

      expect(resultado.tipoDescuento).toBe(TipoDescuento.MULTIPLE_ACTIVIDADES);
      expect(resultado.precioFinal.toNumber()).toBe(44000);
    });
  });

  describe('Configuración Dinámica de Precios', () => {
    it('debe usar configuración personalizada de precios', () => {
      const configuracionCustom: ConfiguracionPrecios = {
        precioClubMatematicas: new Decimal(60000),
        precioCursosEspecializados: new Decimal(65000),
        precioMultipleActividades: new Decimal(50000),
        precioHermanosBasico: new Decimal(48000),
        precioHermanosMultiple: new Decimal(42000),
        descuentoAacreaPorcentaje: new Decimal(25),
        descuentoAacreaActivo: true,
      };

      const input: CalculoPrecioInput = {
        cantidadHermanos: 1,
        actividadesPorEstudiante: 1,
        tipoProducto: 'CLUB_MATEMATICAS',
        tieneAACREA: false,
        configuracion: configuracionCustom,
      };

      const resultado = calcularPrecioActividad(input);

      expect(resultado.precioBase.toNumber()).toBe(60000);
      expect(resultado.precioFinal.toNumber()).toBe(60000);
    });

    it('debe recalcular descuentos con nueva configuración', () => {
      const configuracionCustom: ConfiguracionPrecios = {
        ...configuracionDefault,
        precioMultipleActividades: new Decimal(40000),
      };

      const input: CalculoPrecioInput = {
        cantidadHermanos: 1,
        actividadesPorEstudiante: 2,
        tipoProducto: 'CLUB_MATEMATICAS',
        tieneAACREA: false,
        configuracion: configuracionCustom,
      };

      const resultado = calcularPrecioActividad(input);

      expect(resultado.precioFinal.toNumber()).toBe(40000);
    });
  });

  describe('Cálculo de Total Mensual', () => {
    it('debe sumar correctamente múltiples inscripciones', () => {
      const inscripciones = [
        {
          precioBase: new Decimal(50000),
          precioFinal: new Decimal(44000),
          descuentoAplicado: new Decimal(6000),
          tipoDescuento: TipoDescuento.MULTIPLE_ACTIVIDADES,
          detalleCalculo: 'Test',
        },
        {
          precioBase: new Decimal(55000),
          precioFinal: new Decimal(44000),
          descuentoAplicado: new Decimal(11000),
          tipoDescuento: TipoDescuento.MULTIPLE_ACTIVIDADES,
          detalleCalculo: 'Test',
        },
      ];

      const resultado = calcularTotalMensual(inscripciones);

      expect(resultado.subtotal.toNumber()).toBe(105000); // 50k + 55k
      expect(resultado.total.toNumber()).toBe(88000); // 44k + 44k
      expect(resultado.descuentoTotal.toNumber()).toBe(17000); // 6k + 11k
    });

    it('debe calcular correctamente con inscripciones sin descuento', () => {
      const inscripciones = [
        {
          precioBase: new Decimal(50000),
          precioFinal: new Decimal(50000),
          descuentoAplicado: new Decimal(0),
          tipoDescuento: TipoDescuento.NINGUNO,
          detalleCalculo: 'Test',
        },
      ];

      const resultado = calcularTotalMensual(inscripciones);

      expect(resultado.subtotal.toNumber()).toBe(50000);
      expect(resultado.total.toNumber()).toBe(50000);
      expect(resultado.descuentoTotal.toNumber()).toBe(0);
    });
  });

  describe('Casos Edge: Validaciones', () => {
    it('debe manejar cantidad hermanos = 0 como 1', () => {
      const input: CalculoPrecioInput = {
        cantidadHermanos: 0,
        actividadesPorEstudiante: 1,
        tipoProducto: 'CLUB_MATEMATICAS',
        tieneAACREA: false,
        configuracion: configuracionDefault,
      };

      const resultado = calcularPrecioActividad(input);

      expect(resultado.precioFinal.toNumber()).toBe(50000);
      expect(resultado.tipoDescuento).toBe(TipoDescuento.NINGUNO);
    });

    it('debe manejar actividades = 0 como 1', () => {
      const input: CalculoPrecioInput = {
        cantidadHermanos: 1,
        actividadesPorEstudiante: 0,
        tipoProducto: 'CLUB_MATEMATICAS',
        tieneAACREA: false,
        configuracion: configuracionDefault,
      };

      const resultado = calcularPrecioActividad(input);

      expect(resultado.precioFinal.toNumber()).toBe(50000);
      expect(resultado.tipoDescuento).toBe(TipoDescuento.NINGUNO);
    });
  });
});
