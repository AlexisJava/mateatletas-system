import { Test, TestingModule } from '@nestjs/testing';
import { GetPlanificacionesUseCase } from '../../application/use-cases/get-planificaciones.use-case';
import {
  IPlanificacionRepository,
  PlanificacionFilters,
  PaginationOptions,
  PlanificacionWithCounts,
} from '../../domain/planificacion.repository.interface';
import { EstadoPlanificacion } from '@prisma/client';

describe('GetPlanificacionesUseCase', () => {
  let useCase: GetPlanificacionesUseCase;
  let repository: jest.Mocked<IPlanificacionRepository>;

  // Mock data - create entity and extend with counts
  const baseDate = new Date('2025-11-01');
  const mockPlanificacion: PlanificacionWithCounts = Object.assign(
    new (class {
      id = 'plan-123';
      codigoGrupo = 'B1';
      mes = 11;
      anio = 2025;
      titulo = 'Planificación Noviembre';
      descripcion = 'Descripción de prueba';
      tematicaPrincipal = 'Suma y resta';
      objetivosAprendizaje = ['Objetivo 1', 'Objetivo 2'];
      estado = EstadoPlanificacion.PUBLICADA;
      createdByAdminId = 'admin-123';
      notasDocentes = null;
      fechaPublicacion = baseDate;
      createdAt = baseDate;
      updatedAt = baseDate;
      canBePublished = () => false;
      isActive = () => true;
      getPeriodIdentifier = () => 'B1-11/2025';
      toPersistence = () => ({} as never);
    })(),
    {
      activityCount: 5,
      assignmentCount: 2,
    },
  );

  beforeEach(async () => {
    // Create mock repository
    const mockRepository: jest.Mocked<IPlanificacionRepository> = {
      findById: jest.fn(),
      findByIdOptional: jest.fn(),
      findAll: jest.fn(),
      findByPeriod: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      getActivityCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPlanificacionesUseCase,
        {
          provide: 'IPlanificacionRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetPlanificacionesUseCase>(GetPlanificacionesUseCase);
    repository = module.get('IPlanificacionRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return all planifications without filters', async () => {
      // Arrange
      const expectedResult = {
        data: [mockPlanificacion],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      repository.findAll.mockResolvedValue(expectedResult);

      // Act
      const result = await useCase.execute({});

      // Assert
      expect(repository.findAll).toHaveBeenCalledWith({}, { page: 1, limit: 10 });
      expect(result).toEqual(expectedResult);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].codigoGrupo).toBe('B1');
    });

    it('should apply filters correctly', async () => {
      // Arrange
      const filters: PlanificacionFilters = {
        codigoGrupo: 'B1',
        mes: 11,
        anio: 2025,
        estado: EstadoPlanificacion.PUBLICADA,
      };

      const expectedResult = {
        data: [mockPlanificacion],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      repository.findAll.mockResolvedValue(expectedResult);

      // Act
      const result = await useCase.execute(filters);

      // Assert
      expect(repository.findAll).toHaveBeenCalledWith(filters, { page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].estado).toBe(EstadoPlanificacion.PUBLICADA);
    });

    it('should apply pagination correctly', async () => {
      // Arrange
      const pagination: PaginationOptions = {
        page: 2,
        limit: 5,
      };

      const expectedResult = {
        data: [],
        total: 12,
        page: 2,
        limit: 5,
        totalPages: 3,
      };

      repository.findAll.mockResolvedValue(expectedResult);

      // Act
      const result = await useCase.execute({}, pagination);

      // Assert
      expect(repository.findAll).toHaveBeenCalledWith({}, pagination);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(result.totalPages).toBe(3);
    });

    it('should return empty array when no planifications found', async () => {
      // Arrange
      const expectedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      repository.findAll.mockResolvedValue(expectedResult);

      // Act
      const result = await useCase.execute({ codigoGrupo: 'X99' });

      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should use default pagination when not provided', async () => {
      // Arrange
      const expectedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      repository.findAll.mockResolvedValue(expectedResult);

      // Act
      await useCase.execute({});

      // Assert
      expect(repository.findAll).toHaveBeenCalledWith({}, { page: 1, limit: 10 });
    });

    it('should filter by estado only', async () => {
      // Arrange
      const filters: PlanificacionFilters = {
        estado: EstadoPlanificacion.BORRADOR,
      };

      const expectedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      repository.findAll.mockResolvedValue(expectedResult);

      // Act
      await useCase.execute(filters);

      // Assert
      expect(repository.findAll).toHaveBeenCalledWith(filters, { page: 1, limit: 10 });
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      repository.findAll.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(useCase.execute({})).rejects.toThrow('Database connection failed');
    });
  });
});
