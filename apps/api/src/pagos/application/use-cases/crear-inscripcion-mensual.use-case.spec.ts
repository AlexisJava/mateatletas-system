import { Decimal } from 'decimal.js';
import { CrearInscripcionMensualUseCase } from './crear-inscripcion-mensual.use-case';
import { CalcularPrecioUseCase } from './calcular-precio.use-case';
import { IInscripcionMensualRepository } from '../../domain/repositories/inscripcion-mensual.repository.interface';
import { CrearInscripcionMensualInputDTO } from '../dtos/crear-inscripcion-mensual.dto';
import { TipoDescuento, EstadoPago } from '../../domain/types/pagos.types';

/**
 * Tests para CrearInscripcionMensualUseCase
 * TDD: Red-Green-Refactor
 *
 * Use Case que:
 * 1. Usa CalcularPrecioUseCase para calcular precios
 * 2. Valida que no existan inscripciones duplicadas
 * 3. Crea inscripciones mensuales en el repositorio
 * 4. Retorna resumen con todas las inscripciones creadas
 */
describe('CrearInscripcionMensualUseCase - Application Layer', () => {
  let useCase: CrearInscripcionMensualUseCase;
  let mockCalcularPrecioUseCase: jest.Mocked<CalcularPrecioUseCase>;
  let mockInscripcionRepo: jest.Mocked<IInscripcionMensualRepository>;

  beforeEach(() => {
    // Mock del CalcularPrecioUseCase
    mockCalcularPrecioUseCase = {
      execute: jest.fn(),
    } as any;

    // Mock del repositorio
    mockInscripcionRepo = {
      crear: jest.fn(),
      buscarPorEstudianteYPeriodo: jest.fn(),
      buscarPorTutorYPeriodo: jest.fn(),
      buscarPorEstadoPago: jest.fn(),
      actualizarEstadoPago: jest.fn(),
      calcularTotalMensualTutor: jest.fn(),
      existe: jest.fn(),
    };

    useCase = new CrearInscripcionMensualUseCase(
      mockCalcularPrecioUseCase,
      mockInscripcionRepo,
    );
  });

  describe('Creación exitosa de inscripciones', () => {
    it('debe crear inscripción para 1 estudiante, 1 actividad', async () => {
      const input: CrearInscripcionMensualInputDTO = {
        tutorId: 'tutor-1',
        estudiantesIds: ['est-1'],
        productosIdsPorEstudiante: {
          'est-1': ['prod-1'],
        },
        anio: 2025,
        mes: 1,
        tieneAACREA: false,
      };

      // Mock: CalcularPrecioUseCase retorna cálculo
      mockCalcularPrecioUseCase.execute.mockResolvedValue({
        calculos: [
          {
            estudianteId: 'est-1',
            estudianteNombre: 'Juan Pérez',
            productoId: 'prod-1',
            productoNombre: 'Club Matemáticas',
            tipoProducto: 'CLUB_MATEMATICAS',
            precioBase: new Decimal(50000),
            descuentoAplicado: new Decimal(0),
            precioFinal: new Decimal(50000),
            tipoDescuento: TipoDescuento.NINGUNO,
            detalleCalculo: '1 estudiante, 1 actividad - Sin descuento',
          },
        ],
        resumen: {
          cantidadEstudiantes: 1,
          cantidadHermanos: 0,
          totalActividades: 1,
          subtotal: new Decimal(50000),
          totalDescuentos: new Decimal(0),
          totalFinal: new Decimal(50000),
          tieneDescuentoHermanos: false,
          tieneDescuentoMultipleActividades: false,
          tieneDescuentoAACREA: false,
        },
      });

      // Mock: No existe inscripción previa
      mockInscripcionRepo.existe.mockResolvedValue(false);

      // Mock: Crear inscripción
      mockInscripcionRepo.crear.mockResolvedValue({
        id: 'insc-1',
        estudianteId: 'est-1',
        productoId: 'prod-1',
        tutorId: 'tutor-1',
        anio: 2025,
        mes: 1,
        periodo: '2025-01',
        precioBase: new Decimal(50000),
        descuentoAplicado: new Decimal(0),
        precioFinal: new Decimal(50000),
        tipoDescuento: TipoDescuento.NINGUNO,
        detalleCalculo: '1 estudiante, 1 actividad - Sin descuento',
        estadoPago: EstadoPago.Pendiente,
        fechaPago: null,
        metodoPago: null,
        comprobanteUrl: null,
        observaciones: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const resultado = await useCase.execute(input);

      expect(resultado.inscripciones).toHaveLength(1);
      expect(resultado.inscripciones[0].estudianteNombre).toBe('Juan Pérez');
      expect(resultado.inscripciones[0].precioFinal.toNumber()).toBe(50000);
      expect(resultado.resumen.cantidadInscripciones).toBe(1);
      expect(resultado.resumen.totalGeneral.toNumber()).toBe(50000);
      expect(resultado.mensaje).toContain('1 inscripción');
    });

    it('debe crear múltiples inscripciones para hermanos con descuentos', async () => {
      const input: CrearInscripcionMensualInputDTO = {
        tutorId: 'tutor-1',
        estudiantesIds: ['est-1', 'est-2'],
        productosIdsPorEstudiante: {
          'est-1': ['prod-1', 'prod-2'],
          'est-2': ['prod-1', 'prod-2'],
        },
        anio: 2025,
        mes: 1,
        tieneAACREA: false,
      };

      // Mock: CalcularPrecioUseCase retorna 4 cálculos
      mockCalcularPrecioUseCase.execute.mockResolvedValue({
        calculos: [
          {
            estudianteId: 'est-1',
            estudianteNombre: 'Juan Pérez',
            productoId: 'prod-1',
            productoNombre: 'Club Matemáticas',
            tipoProducto: 'CLUB_MATEMATICAS',
            precioBase: new Decimal(50000),
            descuentoAplicado: new Decimal(12000),
            precioFinal: new Decimal(38000),
            tipoDescuento: TipoDescuento.HERMANOS_MULTIPLE,
            detalleCalculo: '2 hermanos, 2 actividades c/u',
          },
          {
            estudianteId: 'est-1',
            estudianteNombre: 'Juan Pérez',
            productoId: 'prod-2',
            productoNombre: 'Curso Álgebra',
            tipoProducto: 'CURSO_ESPECIALIZADO',
            precioBase: new Decimal(55000),
            descuentoAplicado: new Decimal(17000),
            precioFinal: new Decimal(38000),
            tipoDescuento: TipoDescuento.HERMANOS_MULTIPLE,
            detalleCalculo: '2 hermanos, 2 actividades c/u',
          },
          {
            estudianteId: 'est-2',
            estudianteNombre: 'María Pérez',
            productoId: 'prod-1',
            productoNombre: 'Club Matemáticas',
            tipoProducto: 'CLUB_MATEMATICAS',
            precioBase: new Decimal(50000),
            descuentoAplicado: new Decimal(12000),
            precioFinal: new Decimal(38000),
            tipoDescuento: TipoDescuento.HERMANOS_MULTIPLE,
            detalleCalculo: '2 hermanos, 2 actividades c/u',
          },
          {
            estudianteId: 'est-2',
            estudianteNombre: 'María Pérez',
            productoId: 'prod-2',
            productoNombre: 'Curso Álgebra',
            tipoProducto: 'CURSO_ESPECIALIZADO',
            precioBase: new Decimal(55000),
            descuentoAplicado: new Decimal(17000),
            precioFinal: new Decimal(38000),
            tipoDescuento: TipoDescuento.HERMANOS_MULTIPLE,
            detalleCalculo: '2 hermanos, 2 actividades c/u',
          },
        ],
        resumen: {
          cantidadEstudiantes: 2,
          cantidadHermanos: 2,
          totalActividades: 4,
          subtotal: new Decimal(210000),
          totalDescuentos: new Decimal(58000),
          totalFinal: new Decimal(152000),
          tieneDescuentoHermanos: true,
          tieneDescuentoMultipleActividades: false,
          tieneDescuentoAACREA: false,
        },
      });

      mockInscripcionRepo.existe.mockResolvedValue(false);
      mockInscripcionRepo.crear.mockImplementation(async (datos) => ({
        id: `insc-${Math.random()}`,
        ...datos,
        estadoPago: EstadoPago.Pendiente,
        fechaPago: null,
        metodoPago: null,
        comprobanteUrl: null,
        observaciones: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const resultado = await useCase.execute(input);

      expect(resultado.inscripciones).toHaveLength(4);
      expect(resultado.resumen.cantidadInscripciones).toBe(4);
      expect(resultado.resumen.totalGeneral.toNumber()).toBe(152000);
      expect(resultado.mensaje).toContain('4 inscripciones');
    });
  });

  describe('Validaciones', () => {
    it('debe lanzar error si ya existe inscripción duplicada', async () => {
      const input: CrearInscripcionMensualInputDTO = {
        tutorId: 'tutor-1',
        estudiantesIds: ['est-1'],
        productosIdsPorEstudiante: {
          'est-1': ['prod-1'],
        },
        anio: 2025,
        mes: 1,
        tieneAACREA: false,
      };

      mockCalcularPrecioUseCase.execute.mockResolvedValue({
        calculos: [
          {
            estudianteId: 'est-1',
            estudianteNombre: 'Juan Pérez',
            productoId: 'prod-1',
            productoNombre: 'Club Matemáticas',
            tipoProducto: 'CLUB_MATEMATICAS',
            precioBase: new Decimal(50000),
            descuentoAplicado: new Decimal(0),
            precioFinal: new Decimal(50000),
            tipoDescuento: TipoDescuento.NINGUNO,
            detalleCalculo: 'Test',
          },
        ],
        resumen: {} as any,
      });

      // Mock: Ya existe la inscripción
      mockInscripcionRepo.existe.mockResolvedValue(true);

      await expect(useCase.execute(input)).rejects.toThrow(
        'Ya existe una inscripción para el estudiante est-1 y el producto prod-1 en el período 2025-01'
      );
    });

    it('debe lanzar error si el mes es inválido', async () => {
      const input: CrearInscripcionMensualInputDTO = {
        tutorId: 'tutor-1',
        estudiantesIds: ['est-1'],
        productosIdsPorEstudiante: {
          'est-1': ['prod-1'],
        },
        anio: 2025,
        mes: 13, // Inválido
        tieneAACREA: false,
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        'El mes debe estar entre 1 y 12'
      );
    });

    it('debe lanzar error si el año es muy antiguo', async () => {
      const input: CrearInscripcionMensualInputDTO = {
        tutorId: 'tutor-1',
        estudiantesIds: ['est-1'],
        productosIdsPorEstudiante: {
          'est-1': ['prod-1'],
        },
        anio: 2020, // Muy antiguo
        mes: 1,
        tieneAACREA: false,
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        'El año debe ser mayor o igual a 2024'
      );
    });
  });

  describe('Formato de período', () => {
    it('debe generar período en formato YYYY-MM correcto', async () => {
      const input: CrearInscripcionMensualInputDTO = {
        tutorId: 'tutor-1',
        estudiantesIds: ['est-1'],
        productosIdsPorEstudiante: {
          'est-1': ['prod-1'],
        },
        anio: 2025,
        mes: 3, // Marzo
        tieneAACREA: false,
      };

      mockCalcularPrecioUseCase.execute.mockResolvedValue({
        calculos: [
          {
            estudianteId: 'est-1',
            estudianteNombre: 'Juan Pérez',
            productoId: 'prod-1',
            productoNombre: 'Club Matemáticas',
            tipoProducto: 'CLUB_MATEMATICAS',
            precioBase: new Decimal(50000),
            descuentoAplicado: new Decimal(0),
            precioFinal: new Decimal(50000),
            tipoDescuento: TipoDescuento.NINGUNO,
            detalleCalculo: 'Test',
          },
        ],
        resumen: {} as any,
      });

      mockInscripcionRepo.existe.mockResolvedValue(false);
      mockInscripcionRepo.crear.mockImplementation(async (datos) => ({
        id: 'insc-1',
        ...datos,
        estadoPago: EstadoPago.Pendiente,
        fechaPago: null,
        metodoPago: null,
        comprobanteUrl: null,
        observaciones: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const resultado = await useCase.execute(input);

      expect(resultado.inscripciones[0].periodo).toBe('2025-03');
      expect(resultado.resumen.periodo).toBe('2025-03');
    });
  });
});
