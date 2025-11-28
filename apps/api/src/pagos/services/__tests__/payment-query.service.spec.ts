import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PaymentQueryService } from '../payment-query.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { ConfiguracionPreciosRepository } from '../../infrastructure/repositories/configuracion-precios.repository';
import { InscripcionMensualRepository } from '../../infrastructure/repositories/inscripcion-mensual.repository';
import { EstadoPago, EstadoMembresia } from '@prisma/client';

/**
 * PaymentQueryService Tests
 *
 * OBJETIVO: Validar operaciones de consulta (read-only) de pagos
 *
 * Casos críticos:
 * 1. Buscar inscripciones con filtros y paginación
 * 2. Encontrar inscripción por ID
 * 3. Verificar inscripción pendiente
 * 4. Buscar membresías activas
 * 5. Obtener configuración de precios
 */

describe('PaymentQueryService', () => {
  let service: PaymentQueryService;
  let prismaService: jest.Mocked<PrismaService>;
  let configuracionRepo: jest.Mocked<ConfiguracionPreciosRepository>;
  let inscripcionRepo: jest.Mocked<InscripcionMensualRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentQueryService,
        {
          provide: PrismaService,
          useValue: {
            inscripcionMensual: {
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
            },
            membresia: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: ConfiguracionPreciosRepository,
          useValue: {
            obtenerConfiguracion: jest.fn(),
            obtenerHistorialCambios: jest.fn(),
          },
        },
        {
          provide: InscripcionMensualRepository,
          useValue: {
            obtenerInscripcionesPorPeriodo: jest.fn(),
            obtenerEstudiantesConDescuentos: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentQueryService>(PaymentQueryService);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
    configuracionRepo = module.get(
      ConfiguracionPreciosRepository,
    ) as jest.Mocked<ConfiguracionPreciosRepository>;
    inscripcionRepo = module.get(
      InscripcionMensualRepository,
    ) as jest.Mocked<InscripcionMensualRepository>;
  });

  describe('findAllInscripciones', () => {
    it('should return paginated inscripciones', async () => {
      // Arrange
      const mockInscripciones = [
        {
          id: '1',
          estudiante_id: 'est-1',
          tutor_id: 'tutor-1',
          anio: 2025,
          mes: 1,
          estado_pago: EstadoPago.Pagado,
          estudiante: {
            id: 'est-1',
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan@test.com',
          },
          tutor: {
            id: 'tutor-1',
            nombre: 'Ana',
            apellido: 'García',
            email: 'ana@test.com',
          },
        },
      ];

      prismaService.inscripcionMensual.findMany.mockResolvedValue(
        mockInscripciones,
      );
      prismaService.inscripcionMensual.count.mockResolvedValue(1);

      // Act
      const result = await service.findAllInscripciones({ page: 1, limit: 10 });

      // Assert
      expect(result).toEqual({
        data: mockInscripciones,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(prismaService.inscripcionMensual.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      );
    });

    it('should apply filters correctly', async () => {
      // Arrange
      prismaService.inscripcionMensual.findMany.mockResolvedValue([]);
      prismaService.inscripcionMensual.count.mockResolvedValue(0);

      // Act
      await service.findAllInscripciones({
        tutorId: 123,
        estudianteId: 456,
        anio: 2025,
        mes: 1,
        estado: 'Pendiente',
        page: 2,
        limit: 20,
      });

      // Assert
      expect(prismaService.inscripcionMensual.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            tutor_id: '123',
            estudiante_id: '456',
            anio: 2025,
            mes: 1,
            estado_pago: 'Pendiente',
          },
          skip: 20, // (page 2 - 1) * limit 20
          take: 20,
        }),
      );
    });

    it('should calculate totalPages correctly', async () => {
      // Arrange
      prismaService.inscripcionMensual.findMany.mockResolvedValue([]);
      prismaService.inscripcionMensual.count.mockResolvedValue(45); // 45 registros

      // Act
      const result = await service.findAllInscripciones({ page: 1, limit: 10 });

      // Assert
      expect(result.totalPages).toBe(5); // Math.ceil(45 / 10) = 5
    });
  });

  describe('findInscripcionById', () => {
    it('should return inscripcion when found', async () => {
      // Arrange
      const mockInscripcion = {
        id: 'inscripcion-1',
        estudiante_id: 'est-1',
        estudiante: {
          id: 'est-1',
          nombre: 'Juan',
          apellido: 'Pérez',
          email: 'juan@test.com',
        },
        tutor: {
          id: 'tutor-1',
          nombre: 'Ana',
          apellido: 'García',
          email: 'ana@test.com',
        },
      };

      prismaService.inscripcionMensual.findUnique.mockResolvedValue(
        mockInscripcion as any,
      );

      // Act
      const result = await service.findInscripcionById('inscripcion-1');

      // Assert
      expect(result).toEqual(mockInscripcion);
      expect(prismaService.inscripcionMensual.findUnique).toHaveBeenCalledWith({
        where: { id: 'inscripcion-1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when inscripcion not found', async () => {
      // Arrange
      prismaService.inscripcionMensual.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findInscripcionById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findInscripcionById('nonexistent')).rejects.toThrow(
        'Inscripción mensual nonexistent no encontrada',
      );
    });

    it('should accept number as ID and convert to string', async () => {
      // Arrange
      prismaService.inscripcionMensual.findUnique.mockResolvedValue({
        id: '123',
      } as any);

      // Act
      await service.findInscripcionById(123);

      // Assert
      expect(prismaService.inscripcionMensual.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        include: expect.any(Object),
      });
    });
  });

  describe('tieneInscripcionPendiente', () => {
    it('should return true when pendiente inscripcion exists', async () => {
      // Arrange
      prismaService.inscripcionMensual.findFirst.mockResolvedValue({
        id: 'inscripcion-1',
      } as any);

      // Act
      const result = await service.tieneInscripcionPendiente('est-1', 2025, 1);

      // Assert
      expect(result).toBe(true);
      expect(prismaService.inscripcionMensual.findFirst).toHaveBeenCalledWith({
        where: {
          estudiante_id: 'est-1',
          anio: 2025,
          mes: 1,
          estado_pago: EstadoPago.Pendiente,
        },
      });
    });

    it('should return false when no pendiente inscripcion exists', async () => {
      // Arrange
      prismaService.inscripcionMensual.findFirst.mockResolvedValue(null);

      // Act
      const result = await service.tieneInscripcionPendiente('est-1', 2025, 1);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('findMembresiaActiva', () => {
    it('should return active membresia', async () => {
      // Arrange
      const mockMembresia = {
        id: 'mem-1',
        tutor_id: 'tutor-1',
        estado: EstadoMembresia.Activa,
        producto: { id: 'prod-1', nombre: 'Membresía Premium' },
      };

      prismaService.membresia.findFirst.mockResolvedValue(mockMembresia as any);

      // Act
      const result = await service.findMembresiaActiva('tutor-1');

      // Assert
      expect(result).toEqual(mockMembresia);
      expect(prismaService.membresia.findFirst).toHaveBeenCalledWith({
        where: {
          tutor_id: 'tutor-1',
          estado: EstadoMembresia.Activa,
        },
        include: { producto: true },
      });
    });

    it('should return null when no active membresia exists', async () => {
      // Arrange
      prismaService.membresia.findFirst.mockResolvedValue(null);

      // Act
      const result = await service.findMembresiaActiva('tutor-1');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findMembresiasDelTutor', () => {
    it('should return all membresias ordered by fecha_inicio desc', async () => {
      // Arrange
      const mockMembresias = [
        { id: 'mem-2', fecha_inicio: new Date('2025-02-01') },
        { id: 'mem-1', fecha_inicio: new Date('2025-01-01') },
      ];

      prismaService.membresia.findMany.mockResolvedValue(mockMembresias as any);

      // Act
      const result = await service.findMembresiasDelTutor('tutor-1');

      // Assert
      expect(result).toEqual(mockMembresias);
      expect(prismaService.membresia.findMany).toHaveBeenCalledWith({
        where: { tutor_id: 'tutor-1' },
        include: { producto: true },
        orderBy: { fecha_inicio: 'desc' },
      });
    });
  });

  describe('findInscripcionPorPeriodo', () => {
    it('should return inscripcion for specific period', async () => {
      // Arrange
      const mockInscripcion = {
        id: 'inscripcion-1',
        estudiante_id: 'est-1',
        anio: 2025,
        mes: 1,
        estudiante: { id: 'est-1', nombre: 'Juan', apellido: 'Pérez' },
        tutor: { id: 'tutor-1', nombre: 'Ana', apellido: 'García' },
      };

      prismaService.inscripcionMensual.findFirst.mockResolvedValue(
        mockInscripcion as any,
      );

      // Act
      const result = await service.findInscripcionPorPeriodo('est-1', 2025, 1);

      // Assert
      expect(result).toEqual(mockInscripcion);
    });

    it('should return null when no inscripcion in period', async () => {
      // Arrange
      prismaService.inscripcionMensual.findFirst.mockResolvedValue(null);

      // Act
      const result = await service.findInscripcionPorPeriodo('est-1', 2025, 1);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('obtenerConfiguracion', () => {
    it('should return configuracion from repository', async () => {
      // Arrange
      const mockConfig = {
        id: 'config-1',
        precioBase: 10000,
        descuentoHermanos: 0.1,
      };

      configuracionRepo.obtenerConfiguracion.mockResolvedValue(
        mockConfig as any,
      );

      // Act
      const result = await service.obtenerConfiguracion();

      // Assert
      expect(result).toEqual(mockConfig);
      expect(configuracionRepo.obtenerConfiguracion).toHaveBeenCalled();
    });
  });

  describe('obtenerHistorialCambios', () => {
    it('should return historial with default limit 50', async () => {
      // Arrange
      const mockHistorial = [
        { id: '1', cambio: 'Precio actualizado' },
        { id: '2', cambio: 'Descuento modificado' },
      ];

      configuracionRepo.obtenerHistorialCambios.mockResolvedValue(
        mockHistorial as any,
      );

      // Act
      const result = await service.obtenerHistorialCambios();

      // Assert
      expect(result).toEqual(mockHistorial);
      expect(configuracionRepo.obtenerHistorialCambios).toHaveBeenCalledWith(
        50,
      );
    });

    it('should accept custom limit', async () => {
      // Arrange
      configuracionRepo.obtenerHistorialCambios.mockResolvedValue([]);

      // Act
      await service.obtenerHistorialCambios(100);

      // Assert
      expect(configuracionRepo.obtenerHistorialCambios).toHaveBeenCalledWith(
        100,
      );
    });
  });

  describe('obtenerInscripcionesPendientes', () => {
    it('should return only pendiente inscripciones for current period', async () => {
      // Arrange
      const mockInscripciones = [
        { id: '1', estadoPago: EstadoPago.Pendiente },
        { id: '2', estadoPago: EstadoPago.Pagado },
        { id: '3', estadoPago: EstadoPago.Pendiente },
      ];

      inscripcionRepo.obtenerInscripcionesPorPeriodo.mockResolvedValue(
        mockInscripciones as any,
      );

      // Act
      const result = await service.obtenerInscripcionesPendientes();

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every((i) => i.estadoPago === EstadoPago.Pendiente)).toBe(
        true,
      );
    });

    it('should call repository with correct current period', async () => {
      // Arrange
      inscripcionRepo.obtenerInscripcionesPorPeriodo.mockResolvedValue([]);
      const now = new Date();
      const expectedPeriodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // Act
      await service.obtenerInscripcionesPendientes();

      // Assert
      expect(
        inscripcionRepo.obtenerInscripcionesPorPeriodo,
      ).toHaveBeenCalledWith(expectedPeriodo);
    });
  });

  describe('obtenerEstudiantesConDescuentos', () => {
    it('should return estudiantes with descuentos for current period', async () => {
      // Arrange
      const mockEstudiantes = [
        { estudianteId: 'est-1', descuentos: ['hermanos', 'aacrea'] },
        { estudianteId: 'est-2', descuentos: ['hermanos'] },
      ];

      inscripcionRepo.obtenerEstudiantesConDescuentos.mockResolvedValue(
        mockEstudiantes as any,
      );

      // Act
      const result = await service.obtenerEstudiantesConDescuentos();

      // Assert
      expect(result).toEqual(mockEstudiantes);
    });
  });

  describe('buscarInscripcionesPendientes', () => {
    it('should return inscripciones pendientes for estudiante in period', async () => {
      // Arrange
      const mockInscripciones = [
        {
          id: 'inscripcion-1',
          estudiante_id: 'est-1',
          tutor_id: 'tutor-1',
          periodo: '2025-01',
          estado_pago: 'Pendiente',
          estudiante: { nombre: 'Juan', apellido: 'Pérez' },
        },
      ];

      prismaService.inscripcionMensual.findMany.mockResolvedValue(
        mockInscripciones as any,
      );

      // Act
      const result = await service.buscarInscripcionesPendientes(
        'est-1',
        'tutor-1',
        '2025-01',
      );

      // Assert
      expect(result).toEqual(mockInscripciones);
      expect(prismaService.inscripcionMensual.findMany).toHaveBeenCalledWith({
        where: {
          estudiante_id: 'est-1',
          tutor_id: 'tutor-1',
          periodo: '2025-01',
          estado_pago: 'Pendiente',
        },
        include: {
          estudiante: {
            select: {
              nombre: true,
              apellido: true,
            },
          },
        },
      });
    });
  });
});
