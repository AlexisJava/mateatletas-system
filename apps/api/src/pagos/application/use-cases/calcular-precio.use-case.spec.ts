import { Decimal } from 'decimal.js';
import { CalcularPrecioUseCase } from './calcular-precio.use-case';
import { IConfiguracionPreciosRepository } from '../../domain/repositories/configuracion-precios.repository.interface';
import {
  ConfiguracionPrecios,
  TipoDescuento,
  TipoProducto,
} from '../../domain/types/pagos.types';
import { CalcularPrecioInputDTO } from '../dtos/calcular-precio.dto';

/**
 * Tests para CalcularPrecioUseCase
 * TDD: Red-Green-Refactor
 *
 * Use Case de Application Layer que:
 * 1. Obtiene configuración de precios (repository)
 * 2. Obtiene datos de estudiantes y productos (repositories)
 * 3. Aplica reglas de negocio del Domain Layer
 * 4. Retorna resultado estructurado (DTO)
 */
describe('CalcularPrecioUseCase - Application Layer', () => {
  let useCase: CalcularPrecioUseCase;
  let mockConfigRepo: jest.Mocked<IConfiguracionPreciosRepository>;
  let mockEstudianteRepo: MockEstudianteRepository;
  let mockProductoRepo: MockProductoRepository;

  const configuracionDefault: ConfiguracionPrecios = {
    precioClubMatematicas: new Decimal(50000),
    precioCursosEspecializados: new Decimal(55000),
    precioMultipleActividades: new Decimal(44000),
    precioHermanosBasico: new Decimal(44000),
    precioHermanosMultiple: new Decimal(38000),
    descuentoAacreaPorcentaje: new Decimal(20),
    descuentoAacreaActivo: true,
  };

  beforeEach(() => {
    // Mock del repositorio de configuración
    mockConfigRepo = {
      obtenerConfiguracion: jest.fn().mockResolvedValue(configuracionDefault),
      actualizarConfiguracion: jest.fn(),
      obtenerHistorialCambios: jest.fn(),
    };

    // Mock del repositorio de estudiantes
    mockEstudianteRepo = {
      obtenerPorId: jest.fn((id: string) => {
        const estudiantes: Record<string, EstudianteMock> = {
          'est-1': {
            id: 'est-1',
            nombre: 'Juan',
            apellido: 'Pérez',
            tutorId: 'tutor-1',
          },
          'est-2': {
            id: 'est-2',
            nombre: 'María',
            apellido: 'Pérez',
            tutorId: 'tutor-1',
          },
        };
        return Promise.resolve(estudiantes[id] || null);
      }),
      obtenerPorIds: jest.fn(),
    };

    // Mock del repositorio de productos
    mockProductoRepo = {
      obtenerPorId: jest.fn((id: string) => {
        const productos: Record<string, ProductoMock> = {
          'prod-club': {
            id: 'prod-club',
            nombre: 'Club Matemáticas',
            tipo: 'CLUB_MATEMATICAS' as TipoProducto,
          },
          'prod-curso': {
            id: 'prod-curso',
            nombre: 'Curso Álgebra',
            tipo: 'CURSO_ESPECIALIZADO' as TipoProducto,
          },
        };
        return Promise.resolve(productos[id] || null);
      }),
      obtenerPorIds: jest.fn(),
    };

    useCase = new CalcularPrecioUseCase(
      mockConfigRepo,
      mockEstudianteRepo as any,
      mockProductoRepo as any,
    );
  });

  describe('Caso: 1 estudiante, 1 actividad', () => {
    it('debe calcular precio base sin descuentos', async () => {
      const input: CalcularPrecioInputDTO = {
        tutorId: 'tutor-1',
        estudiantesIds: ['est-1'],
        productosIdsPorEstudiante: {
          'est-1': ['prod-club'],
        },
        tieneAACREA: false,
      };

      const resultado = await useCase.execute(input);

      expect(resultado.calculos).toHaveLength(1);
      expect(resultado.calculos[0].precioBase.toNumber()).toBe(50000);
      expect(resultado.calculos[0].precioFinal.toNumber()).toBe(50000);
      expect(resultado.calculos[0].tipoDescuento).toBe(TipoDescuento.NINGUNO);
      expect(resultado.resumen.totalFinal.toNumber()).toBe(50000);
      expect(resultado.resumen.cantidadEstudiantes).toBe(1);
    });

    it('debe aplicar descuento AACREA 20% cuando corresponde', async () => {
      const input: CalcularPrecioInputDTO = {
        tutorId: 'tutor-1',
        estudiantesIds: ['est-1'],
        productosIdsPorEstudiante: {
          'est-1': ['prod-club'],
        },
        tieneAACREA: true,
      };

      const resultado = await useCase.execute(input);

      expect(resultado.calculos[0].precioBase.toNumber()).toBe(50000);
      expect(resultado.calculos[0].precioFinal.toNumber()).toBe(40000); // 20% off
      expect(resultado.calculos[0].tipoDescuento).toBe(TipoDescuento.AACREA);
      expect(resultado.resumen.tieneDescuentoAACREA).toBe(true);
    });
  });

  describe('Caso: 1 estudiante, múltiples actividades', () => {
    it('debe aplicar descuento múltiples actividades', async () => {
      const input: CalcularPrecioInputDTO = {
        tutorId: 'tutor-1',
        estudiantesIds: ['est-1'],
        productosIdsPorEstudiante: {
          'est-1': ['prod-club', 'prod-curso'],
        },
        tieneAACREA: false,
      };

      const resultado = await useCase.execute(input);

      expect(resultado.calculos).toHaveLength(2);
      resultado.calculos.forEach((calculo) => {
        expect(calculo.precioFinal.toNumber()).toBe(44000);
        expect(calculo.tipoDescuento).toBe(TipoDescuento.MULTIPLE_ACTIVIDADES);
      });
      expect(resultado.resumen.totalFinal.toNumber()).toBe(88000); // 44k * 2
      expect(resultado.resumen.tieneDescuentoMultipleActividades).toBe(true);
    });

    it('NO debe aplicar AACREA con múltiples actividades', async () => {
      const input: CalcularPrecioInputDTO = {
        tutorId: 'tutor-1',
        estudiantesIds: ['est-1'],
        productosIdsPorEstudiante: {
          'est-1': ['prod-club', 'prod-curso'],
        },
        tieneAACREA: true,
      };

      const resultado = await useCase.execute(input);

      resultado.calculos.forEach((calculo) => {
        expect(calculo.tipoDescuento).toBe(TipoDescuento.MULTIPLE_ACTIVIDADES);
        expect(calculo.tipoDescuento).not.toBe(TipoDescuento.AACREA);
      });
      expect(resultado.resumen.tieneDescuentoAACREA).toBe(false);
    });
  });

  describe('Caso: 2 hermanos, 1 actividad cada uno', () => {
    it('debe aplicar descuento hermanos básico', async () => {
      const input: CalcularPrecioInputDTO = {
        tutorId: 'tutor-1',
        estudiantesIds: ['est-1', 'est-2'],
        productosIdsPorEstudiante: {
          'est-1': ['prod-club'],
          'est-2': ['prod-club'],
        },
        tieneAACREA: false,
      };

      const resultado = await useCase.execute(input);

      expect(resultado.calculos).toHaveLength(2);
      resultado.calculos.forEach((calculo) => {
        expect(calculo.precioFinal.toNumber()).toBe(44000);
        expect(calculo.tipoDescuento).toBe(TipoDescuento.HERMANOS_BASICO);
      });
      expect(resultado.resumen.totalFinal.toNumber()).toBe(88000);
      expect(resultado.resumen.tieneDescuentoHermanos).toBe(true);
      expect(resultado.resumen.cantidadHermanos).toBe(2);
    });
  });

  describe('Caso: 2 hermanos, 2+ actividades cada uno', () => {
    it('debe aplicar descuento hermanos múltiple (mayor descuento)', async () => {
      const input: CalcularPrecioInputDTO = {
        tutorId: 'tutor-1',
        estudiantesIds: ['est-1', 'est-2'],
        productosIdsPorEstudiante: {
          'est-1': ['prod-club', 'prod-curso'],
          'est-2': ['prod-club', 'prod-curso'],
        },
        tieneAACREA: false,
      };

      const resultado = await useCase.execute(input);

      expect(resultado.calculos).toHaveLength(4); // 2 estudiantes * 2 productos
      resultado.calculos.forEach((calculo) => {
        expect(calculo.precioFinal.toNumber()).toBe(38000);
        expect(calculo.tipoDescuento).toBe(TipoDescuento.HERMANOS_MULTIPLE);
      });
      expect(resultado.resumen.totalFinal.toNumber()).toBe(152000); // 38k * 4
      expect(resultado.resumen.tieneDescuentoHermanos).toBe(true);
    });
  });

  describe('Validaciones y errores', () => {
    it('debe lanzar error si no existe la configuración', async () => {
      mockConfigRepo.obtenerConfiguracion.mockResolvedValue(null);

      const input: CalcularPrecioInputDTO = {
        tutorId: 'tutor-1',
        estudiantesIds: ['est-1'],
        productosIdsPorEstudiante: { 'est-1': ['prod-club'] },
        tieneAACREA: false,
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        'No se encontró la configuración de precios',
      );
    });

    it('debe lanzar error si estudiantesIds está vacío', async () => {
      const input: CalcularPrecioInputDTO = {
        tutorId: 'tutor-1',
        estudiantesIds: [],
        productosIdsPorEstudiante: {},
        tieneAACREA: false,
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        'Debe proporcionar al menos un estudiante',
      );
    });

    it('debe lanzar error si un estudiante no existe', async () => {
      mockEstudianteRepo.obtenerPorId = jest.fn().mockResolvedValue(null);

      const input: CalcularPrecioInputDTO = {
        tutorId: 'tutor-1',
        estudiantesIds: ['est-inexistente'],
        productosIdsPorEstudiante: { 'est-inexistente': ['prod-club'] },
        tieneAACREA: false,
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        'Estudiante con ID est-inexistente no encontrado',
      );
    });

    it('debe lanzar error si estudiante no pertenece al tutor', async () => {
      mockEstudianteRepo.obtenerPorId = jest.fn().mockResolvedValue({
        id: 'est-1',
        nombre: 'Juan',
        apellido: 'Pérez',
        tutorId: 'tutor-otro',
      });

      const input: CalcularPrecioInputDTO = {
        tutorId: 'tutor-1',
        estudiantesIds: ['est-1'],
        productosIdsPorEstudiante: { 'est-1': ['prod-club'] },
        tieneAACREA: false,
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        'El estudiante est-1 no pertenece al tutor tutor-1',
      );
    });

    it('debe lanzar error si un producto no existe', async () => {
      mockProductoRepo.obtenerPorId = jest.fn().mockResolvedValue(null);

      const input: CalcularPrecioInputDTO = {
        tutorId: 'tutor-1',
        estudiantesIds: ['est-1'],
        productosIdsPorEstudiante: { 'est-1': ['prod-inexistente'] },
        tieneAACREA: false,
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        'Producto con ID prod-inexistente no encontrado',
      );
    });
  });

  describe('Resumen del cálculo', () => {
    it('debe calcular correctamente el resumen con múltiples escenarios', async () => {
      const input: CalcularPrecioInputDTO = {
        tutorId: 'tutor-1',
        estudiantesIds: ['est-1', 'est-2'],
        productosIdsPorEstudiante: {
          'est-1': ['prod-club', 'prod-curso'],
          'est-2': ['prod-club'],
        },
        tieneAACREA: false,
      };

      const resultado = await useCase.execute(input);

      expect(resultado.resumen.cantidadEstudiantes).toBe(2);
      expect(resultado.resumen.cantidadHermanos).toBe(2);
      expect(resultado.resumen.totalActividades).toBe(3);
      expect(resultado.resumen.subtotal.toNumber()).toBeGreaterThan(0);
      expect(resultado.resumen.totalDescuentos.toNumber()).toBeGreaterThan(0);
      expect(resultado.resumen.totalFinal.toNumber()).toBe(
        resultado.resumen.subtotal
          .minus(resultado.resumen.totalDescuentos)
          .toNumber(),
      );
    });
  });
});

// ============================================================================
// MOCKS Y HELPERS
// ============================================================================

interface EstudianteMock {
  id: string;
  nombre: string;
  apellido: string;
  tutorId: string;
}

interface ProductoMock {
  id: string;
  nombre: string;
  tipo: TipoProducto;
}

interface MockEstudianteRepository {
  obtenerPorId: jest.Mock;
  obtenerPorIds: jest.Mock;
}

interface MockProductoRepository {
  obtenerPorId: jest.Mock;
  obtenerPorIds: jest.Mock;
}
