import { Decimal } from 'decimal.js';
import { ActualizarConfiguracionPreciosUseCase } from './actualizar-configuracion-precios.use-case';
import { IConfiguracionPreciosRepository } from '../../domain/repositories/configuracion-precios.repository.interface';
import { ConfiguracionPrecios } from '../../domain/types/pagos.types';
import { ActualizarConfiguracionPreciosInputDTO } from '../dtos/actualizar-configuracion-precios.dto';

/**
 * Tests para ActualizarConfiguracionPreciosUseCase
 * TDD: Red-Green-Refactor
 *
 * Use Case de Application Layer que:
 * 1. Obtiene configuración actual
 * 2. Aplica cambios parciales
 * 3. Guarda historial de auditoría
 * 4. Retorna configuración actualizada con resumen de cambios
 */
describe('ActualizarConfiguracionPreciosUseCase - Application Layer', () => {
  let useCase: ActualizarConfiguracionPreciosUseCase;
  let mockConfigRepo: jest.Mocked<IConfiguracionPreciosRepository>;

  const configuracionActual: ConfiguracionPrecios = {
    precioClubMatematicas: new Decimal(50000),
    precioCursosEspecializados: new Decimal(55000),
    precioMultipleActividades: new Decimal(44000),
    precioHermanosBasico: new Decimal(44000),
    precioHermanosMultiple: new Decimal(38000),
    descuentoAacreaPorcentaje: new Decimal(20),
    descuentoAacreaActivo: true,
  };

  beforeEach(() => {
    mockConfigRepo = {
      obtenerConfiguracion: jest.fn().mockResolvedValue(configuracionActual),
      actualizarConfiguracion: jest.fn().mockImplementation(async (config) => {
        return { ...configuracionActual, ...config };
      }),
      obtenerHistorialCambios: jest.fn(),
    };

    useCase = new ActualizarConfiguracionPreciosUseCase(mockConfigRepo);
  });

  describe('Actualización de precios base', () => {
    it('debe actualizar precio de Club Matemáticas', async () => {
      const input: ActualizarConfiguracionPreciosInputDTO = {
        adminId: 'admin-1',
        precioClubMatematicas: new Decimal(52000),
        motivoCambio: 'Ajuste inflacionario 4%',
      };

      const resultado = await useCase.execute(input);

      expect(mockConfigRepo.actualizarConfiguracion).toHaveBeenCalledWith(
        expect.objectContaining({
          precioClubMatematicas: new Decimal(52000),
        }),
        'admin-1',
        'Ajuste inflacionario 4%',
      );
      expect(resultado.cambiosRealizados).toHaveLength(1);
      expect(resultado.cambiosRealizados[0].campo).toBe(
        'precioClubMatematicas',
      );
      expect(resultado.cambiosRealizados[0].valorAnterior).toEqual(
        new Decimal(50000),
      );
      expect(resultado.cambiosRealizados[0].valorNuevo).toEqual(
        new Decimal(52000),
      );
    });

    it('debe actualizar múltiples precios a la vez', async () => {
      const input: ActualizarConfiguracionPreciosInputDTO = {
        adminId: 'admin-1',
        precioClubMatematicas: new Decimal(52000),
        precioCursosEspecializados: new Decimal(57000),
        precioMultipleActividades: new Decimal(46000),
        motivoCambio: 'Ajuste general de precios',
      };

      const resultado = await useCase.execute(input);

      expect(resultado.cambiosRealizados).toHaveLength(3);
      expect(resultado.cambiosRealizados.map((c) => c.campo)).toEqual(
        expect.arrayContaining([
          'precioClubMatematicas',
          'precioCursosEspecializados',
          'precioMultipleActividades',
        ]),
      );
    });
  });

  describe('Actualización de descuentos', () => {
    it('debe actualizar porcentaje de descuento AACREA', async () => {
      const input: ActualizarConfiguracionPreciosInputDTO = {
        adminId: 'admin-1',
        descuentoAacreaPorcentaje: new Decimal(25),
        motivoCambio: 'Aumento de descuento AACREA',
      };

      const resultado = await useCase.execute(input);

      expect(resultado.cambiosRealizados).toHaveLength(1);
      expect(resultado.cambiosRealizados[0].campo).toBe(
        'descuentoAacreaPorcentaje',
      );
      expect(resultado.cambiosRealizados[0].valorNuevo).toEqual(
        new Decimal(25),
      );
    });

    it('debe poder desactivar descuento AACREA', async () => {
      const input: ActualizarConfiguracionPreciosInputDTO = {
        adminId: 'admin-1',
        descuentoAacreaActivo: false,
        motivoCambio: 'Suspensión temporal de descuento AACREA',
      };

      const resultado = await useCase.execute(input);

      expect(resultado.cambiosRealizados).toHaveLength(1);
      expect(resultado.cambiosRealizados[0].campo).toBe(
        'descuentoAacreaActivo',
      );
      expect(resultado.cambiosRealizados[0].valorAnterior).toBe(true);
      expect(resultado.cambiosRealizados[0].valorNuevo).toBe(false);
    });
  });

  describe('Actualización de configuración de notificaciones', () => {
    it('debe actualizar día de vencimiento', async () => {
      const input: ActualizarConfiguracionPreciosInputDTO = {
        adminId: 'admin-1',
        diaVencimiento: 10,
        motivoCambio: 'Cambio de política de vencimiento',
      };

      const resultado = await useCase.execute(input);

      expect(mockConfigRepo.actualizarConfiguracion).toHaveBeenCalled();
      expect(
        resultado.cambiosRealizados.some((c) => c.campo === 'diaVencimiento'),
      ).toBe(true);
    });
  });

  describe('Validaciones', () => {
    it('debe lanzar error si no hay configuración existente', async () => {
      mockConfigRepo.obtenerConfiguracion.mockResolvedValue(null);

      const input: ActualizarConfiguracionPreciosInputDTO = {
        adminId: 'admin-1',
        precioClubMatematicas: new Decimal(52000),
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        'No se encontró la configuración de precios',
      );
    });

    it('debe lanzar error si adminId no está presente', async () => {
      const input = {
        precioClubMatematicas: new Decimal(52000),
      } as ActualizarConfiguracionPreciosInputDTO;

      await expect(useCase.execute(input)).rejects.toThrow(
        'adminId es requerido',
      );
    });

    it('debe lanzar error si no hay cambios para aplicar', async () => {
      const input: ActualizarConfiguracionPreciosInputDTO = {
        adminId: 'admin-1',
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        'No se proporcionaron cambios para actualizar',
      );
    });

    it('debe lanzar error si precio es negativo', async () => {
      const input: ActualizarConfiguracionPreciosInputDTO = {
        adminId: 'admin-1',
        precioClubMatematicas: new Decimal(-100),
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        'Los precios no pueden ser negativos',
      );
    });

    it('debe lanzar error si porcentaje de descuento es inválido', async () => {
      const input: ActualizarConfiguracionPreciosInputDTO = {
        adminId: 'admin-1',
        descuentoAacreaPorcentaje: new Decimal(150),
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        'El porcentaje de descuento debe estar entre 0 y 100',
      );
    });

    it('debe lanzar error si día de vencimiento es inválido', async () => {
      const input: ActualizarConfiguracionPreciosInputDTO = {
        adminId: 'admin-1',
        diaVencimiento: 32,
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        'El día de vencimiento debe estar entre 1 y 31',
      );
    });
  });

  describe('Auditoría y trazabilidad', () => {
    it('debe llamar al repositorio con adminId y motivo', async () => {
      const input: ActualizarConfiguracionPreciosInputDTO = {
        adminId: 'admin-1',
        precioClubMatematicas: new Decimal(52000),
        motivoCambio: 'Test de auditoría',
      };

      await useCase.execute(input);

      expect(mockConfigRepo.actualizarConfiguracion).toHaveBeenCalledWith(
        expect.any(Object),
        'admin-1',
        'Test de auditoría',
      );
    });

    it('debe funcionar sin motivo (opcional)', async () => {
      const input: ActualizarConfiguracionPreciosInputDTO = {
        adminId: 'admin-1',
        precioClubMatematicas: new Decimal(52000),
      };

      await useCase.execute(input);

      expect(mockConfigRepo.actualizarConfiguracion).toHaveBeenCalledWith(
        expect.any(Object),
        'admin-1',
        undefined,
      );
    });
  });

  describe('Respuesta del use case', () => {
    it('debe retornar configuración actualizada y mensaje de éxito', async () => {
      const input: ActualizarConfiguracionPreciosInputDTO = {
        adminId: 'admin-1',
        precioClubMatematicas: new Decimal(52000),
      };

      const resultado = await useCase.execute(input);

      expect(resultado.configuracion).toBeDefined();
      expect(resultado.configuracion.precioClubMatematicas).toEqual(
        new Decimal(52000),
      );
      expect(resultado.mensaje).toContain('actualizada exitosamente');
      expect(resultado.cambiosRealizados).toHaveLength(1);
    });

    it('debe incluir todos los cambios en el resumen', async () => {
      const input: ActualizarConfiguracionPreciosInputDTO = {
        adminId: 'admin-1',
        precioClubMatematicas: new Decimal(52000),
        precioCursosEspecializados: new Decimal(57000),
      };

      const resultado = await useCase.execute(input);

      expect(resultado.cambiosRealizados).toHaveLength(2);
      resultado.cambiosRealizados.forEach((cambio) => {
        expect(cambio.campo).toBeDefined();
        expect(cambio.valorAnterior).toBeDefined();
        expect(cambio.valorNuevo).toBeDefined();
      });
    });
  });
});
