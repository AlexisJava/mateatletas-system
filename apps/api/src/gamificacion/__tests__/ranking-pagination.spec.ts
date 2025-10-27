import { Test, TestingModule } from '@nestjs/testing';
import { RankingService } from '../ranking.service';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * RankingService - PAGINATION TESTS
 *
 * TESTS DE PAGINACIÓN:
 * - getRankingGlobal(): Verificar paginación correcta
 * - Metadata correcta (total, page, limit, totalPages, hasNextPage, hasPreviousPage)
 * - Validación de parámetros (page, limit)
 * - Límites de seguridad (max 100 por página)
 */

describe('RankingService - Pagination', () => {
  let service: RankingService;
  let prisma: PrismaService;

  const createMockEstudiantes = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `est-${i + 1}`,
      nombre: `Estudiante${i + 1}`,
      apellido: `Apellido${i + 1}`,
      foto_url: `https://example.com/foto${i + 1}.jpg`,
      puntos_totales: 1000 - i * 10, // Descendente
      equipo: {
        id: `equipo-${(i % 3) + 1}`,
        nombre: `Equipo ${(i % 3) + 1}`,
        color_primario: '#FF5722',
      },
    }));
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingService,
        {
          provide: PrismaService,
          useValue: {
            estudiante: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RankingService>(RankingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRankingGlobal - Happy Path', () => {
    it('should return first page with default limit (20)', async () => {
      // Arrange
      const mockEstudiantes = createMockEstudiantes(20);
      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue(mockEstudiantes as any);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(100);

      // Act
      const result = await service.getRankingGlobal();

      // Assert
      expect(result.data).toHaveLength(20);
      expect(result.metadata).toEqual({
        total: 100,
        page: 1,
        limit: 20,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: false,
      });

      // Verify posicion is calculated correctly
      expect(result.data[0].posicion).toBe(1);
      expect(result.data[19].posicion).toBe(20);
    });

    it('should return second page correctly', async () => {
      // Arrange
      const mockEstudiantes = createMockEstudiantes(20);
      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue(mockEstudiantes as any);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(100);

      // Act
      const result = await service.getRankingGlobal(2, 20);

      // Assert
      expect(result.data).toHaveLength(20);
      expect(result.metadata).toEqual({
        total: 100,
        page: 2,
        limit: 20,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: true,
      });

      // Verify skip was called correctly
      expect(prisma.estudiante.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (2-1) * 20
          take: 20,
        }),
      );

      // Verify posicion starts at 21
      expect(result.data[0].posicion).toBe(21);
      expect(result.data[19].posicion).toBe(40);
    });

    it('should handle last page with partial results', async () => {
      // Arrange
      const mockEstudiantes = createMockEstudiantes(7); // Solo 7 en última página
      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue(mockEstudiantes as any);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(47);

      // Act
      const result = await service.getRankingGlobal(3, 20);

      // Assert
      expect(result.data).toHaveLength(7);
      expect(result.metadata).toEqual({
        total: 47,
        page: 3,
        limit: 20,
        totalPages: 3,
        hasNextPage: false,
        hasPreviousPage: true,
      });
    });

    it('should use custom limit', async () => {
      // Arrange
      const mockEstudiantes = createMockEstudiantes(50);
      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue(mockEstudiantes as any);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(200);

      // Act
      const result = await service.getRankingGlobal(1, 50);

      // Assert
      expect(result.data).toHaveLength(50);
      expect(result.metadata.limit).toBe(50);
      expect(result.metadata.totalPages).toBe(4); // 200 / 50 = 4
    });
  });

  describe('getRankingGlobal - Parameter Validation', () => {
    it('should normalize negative page to 1', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(0);

      // Act
      const result = await service.getRankingGlobal(-5, 20);

      // Assert
      expect(result.metadata.page).toBe(1);
      expect(prisma.estudiante.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0, // page 1
        }),
      );
    });

    it('should normalize zero page to 1', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(0);

      // Act
      const result = await service.getRankingGlobal(0, 20);

      // Assert
      expect(result.metadata.page).toBe(1);
    });

    it('should enforce max limit of 100', async () => {
      // Arrange
      const mockEstudiantes = createMockEstudiantes(100);
      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue(mockEstudiantes as any);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(500);

      // Act
      const result = await service.getRankingGlobal(1, 500); // Try to get 500

      // Assert
      expect(result.metadata.limit).toBe(100); // Capped at 100
      expect(prisma.estudiante.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        }),
      );
    });

    it('should normalize zero limit to 1', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(0);

      // Act
      const result = await service.getRankingGlobal(1, 0);

      // Assert
      expect(result.metadata.limit).toBe(1);
    });
  });

  describe('getRankingGlobal - Edge Cases', () => {
    it('should handle empty results', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(0);

      // Act
      const result = await service.getRankingGlobal();

      // Assert
      expect(result.data).toEqual([]);
      expect(result.metadata).toEqual({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('should handle single page of results', async () => {
      // Arrange
      const mockEstudiantes = createMockEstudiantes(5);
      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue(mockEstudiantes as any);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(5);

      // Act
      const result = await service.getRankingGlobal(1, 20);

      // Assert
      expect(result.data).toHaveLength(5);
      expect(result.metadata).toEqual({
        total: 5,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('should handle page beyond total pages (return empty)', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(20);

      // Act
      const result = await service.getRankingGlobal(10, 20); // Page 10 but only 1 page exists

      // Assert
      expect(result.data).toEqual([]);
      expect(result.metadata).toEqual({
        total: 20,
        page: 10,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: true,
      });
    });
  });

  describe('getRankingGlobal - Data Correctness', () => {
    it('should include all required fields', async () => {
      // Arrange
      const mockEstudiantes = createMockEstudiantes(1);
      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue(mockEstudiantes as any);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(1);

      // Act
      const result = await service.getRankingGlobal();

      // Assert
      expect(result.data[0]).toEqual({
        id: 'est-1',
        nombre: 'Estudiante1',
        apellido: 'Apellido1',
        avatar: 'https://example.com/foto1.jpg',
        equipo: expect.objectContaining({
          id: 'equipo-1',
          nombre: 'Equipo 1',
        }),
        puntos: 1000,
        posicion: 1,
      });
    });

    it('should order by puntos_totales desc', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(0);

      // Act
      await service.getRankingGlobal();

      // Assert
      expect(prisma.estudiante.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            puntos_totales: 'desc',
          },
        }),
      );
    });
  });
});
