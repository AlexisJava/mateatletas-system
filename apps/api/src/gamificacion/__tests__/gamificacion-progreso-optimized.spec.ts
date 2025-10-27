import { Test, TestingModule } from '@nestjs/testing';
import { GamificacionService } from '../gamificacion.service';
import { PrismaService } from '../../core/database/prisma.service';
import { PuntosService } from '../puntos.service';
import { LogrosService } from '../logros.service';
import { RankingService } from '../ranking.service';
import { EstadoAsistencia } from '@prisma/client';

/**
 * GamificacionService - PROGRESO OPTIMIZED TESTS
 *
 * TESTS DE OPTIMIZACIÓN N+1:
 * - getProgresoEstudiante(): Verificar que retorna datos correctos
 * - Verificar que usa groupBy (agregaciones) en lugar de múltiples counts
 * - Casos edge: rutas sin clases, estudiante sin asistencias, rutas vacías
 *
 * PERFORMANCE OBJETIVO:
 * - ANTES: 1 + (N × 2) queries donde N = número de rutas
 * - AHORA: 4 queries fijos independiente del número de rutas
 */

describe('GamificacionService - getProgresoEstudiante OPTIMIZED', () => {
  let service: GamificacionService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificacionService,
        {
          provide: PrismaService,
          useValue: {
            rutaCurricular: {
              findMany: jest.fn(),
            },
            clase: {
              groupBy: jest.fn(),
              findMany: jest.fn(),
            },
            asistencia: {
              groupBy: jest.fn(),
            },
          },
        },
        {
          provide: PuntosService,
          useValue: {},
        },
        {
          provide: LogrosService,
          useValue: {},
        },
        {
          provide: RankingService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<GamificacionService>(GamificacionService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path - Data Correctness', () => {
    it('should return correct progress data for student with asistencias', async () => {
      // Arrange
      const mockRutas = [
        { id: 'ruta-1', nombre: 'Álgebra', color: '#FF5722' },
        { id: 'ruta-2', nombre: 'Geometría', color: '#4CAF50' },
      ];

      const mockClasesTotales = [
        { ruta_curricular_id: 'ruta-1', _count: { id: 10 } },
        { ruta_curricular_id: 'ruta-2', _count: { id: 8 } },
      ];

      const mockAsistencias = [
        { clase_id: 'clase-1', _count: { id: 1 } },
        { clase_id: 'clase-2', _count: { id: 1 } },
        { clase_id: 'clase-3', _count: { id: 1 } },
      ];

      const mockClasesConRuta = [
        { id: 'clase-1', ruta_curricular_id: 'ruta-1' },
        { id: 'clase-2', ruta_curricular_id: 'ruta-1' },
        { id: 'clase-3', ruta_curricular_id: 'ruta-2' },
      ];

      jest
        .spyOn(prisma.rutaCurricular, 'findMany')
        .mockResolvedValue(mockRutas as any);
      jest
        .spyOn(prisma.clase, 'groupBy')
        .mockResolvedValue(mockClasesTotales as any);
      jest
        .spyOn(prisma.asistencia, 'groupBy')
        .mockResolvedValue(mockAsistencias as any);
      jest
        .spyOn(prisma.clase, 'findMany')
        .mockResolvedValue(mockClasesConRuta as any);

      // Act
      const result = await service.getProgresoEstudiante('est-123');

      // Assert
      expect(result).toHaveLength(2);

      expect(result[0]).toEqual({
        ruta: 'Álgebra',
        color: '#FF5722',
        clasesTotales: 10,
        clasesAsistidas: 2, // clase-1 + clase-2
        porcentaje: 20, // 2/10 = 20%
      });

      expect(result[1]).toEqual({
        ruta: 'Geometría',
        color: '#4CAF50',
        clasesTotales: 8,
        clasesAsistidas: 1, // clase-3
        porcentaje: 13, // 1/8 = 12.5% → rounded to 13%
      });
    });

    it('should correctly calculate percentage for different scenarios', async () => {
      // Arrange
      const mockRutas = [
        { id: 'ruta-1', nombre: 'Álgebra', color: '#FF5722' },
        { id: 'ruta-2', nombre: 'Geometría', color: '#4CAF50' },
        { id: 'ruta-3', nombre: 'Cálculo', color: '#2196F3' },
      ];

      const mockClasesTotales = [
        { ruta_curricular_id: 'ruta-1', _count: { id: 4 } }, // 100% completion
        { ruta_curricular_id: 'ruta-2', _count: { id: 5 } }, // 50% completion
        { ruta_curricular_id: 'ruta-3', _count: { id: 3 } }, // 0% completion
      ];

      const mockAsistencias = [
        { clase_id: 'clase-1', _count: { id: 1 } },
        { clase_id: 'clase-2', _count: { id: 1 } },
        { clase_id: 'clase-3', _count: { id: 1 } },
        { clase_id: 'clase-4', _count: { id: 1 } },
        { clase_id: 'clase-5', _count: { id: 1 } },
        { clase_id: 'clase-6', _count: { id: 1 } },
        { clase_id: 'clase-7', _count: { id: 1 } },
      ];

      const mockClasesConRuta = [
        { id: 'clase-1', ruta_curricular_id: 'ruta-1' },
        { id: 'clase-2', ruta_curricular_id: 'ruta-1' },
        { id: 'clase-3', ruta_curricular_id: 'ruta-1' },
        { id: 'clase-4', ruta_curricular_id: 'ruta-1' },
        { id: 'clase-5', ruta_curricular_id: 'ruta-2' },
        { id: 'clase-6', ruta_curricular_id: 'ruta-2' },
        { id: 'clase-7', ruta_curricular_id: 'ruta-2' },
      ];

      jest
        .spyOn(prisma.rutaCurricular, 'findMany')
        .mockResolvedValue(mockRutas as any);
      jest
        .spyOn(prisma.clase, 'groupBy')
        .mockResolvedValue(mockClasesTotales as any);
      jest
        .spyOn(prisma.asistencia, 'groupBy')
        .mockResolvedValue(mockAsistencias as any);
      jest
        .spyOn(prisma.clase, 'findMany')
        .mockResolvedValue(mockClasesConRuta as any);

      // Act
      const result = await service.getProgresoEstudiante('est-123');

      // Assert
      expect(result[0].porcentaje).toBe(100); // 4/4 = 100%
      expect(result[1].porcentaje).toBe(60); // 3/5 = 60%
      expect(result[2].porcentaje).toBe(0); // 0/3 = 0%
    });
  });

  describe('Edge Cases', () => {
    it('should handle ruta with no clases', async () => {
      // Arrange
      const mockRutas = [
        { id: 'ruta-1', nombre: 'Álgebra', color: '#FF5722' },
        { id: 'ruta-2', nombre: 'Ruta Vacía', color: '#4CAF50' }, // No clases
      ];

      const mockClasesTotales = [
        { ruta_curricular_id: 'ruta-1', _count: { id: 5 } },
        // ruta-2 no está en mockClasesTotales (sin clases)
      ];

      const mockAsistencias = [{ clase_id: 'clase-1', _count: { id: 1 } }];

      const mockClasesConRuta = [
        { id: 'clase-1', ruta_curricular_id: 'ruta-1' },
      ];

      jest
        .spyOn(prisma.rutaCurricular, 'findMany')
        .mockResolvedValue(mockRutas as any);
      jest
        .spyOn(prisma.clase, 'groupBy')
        .mockResolvedValue(mockClasesTotales as any);
      jest
        .spyOn(prisma.asistencia, 'groupBy')
        .mockResolvedValue(mockAsistencias as any);
      jest
        .spyOn(prisma.clase, 'findMany')
        .mockResolvedValue(mockClasesConRuta as any);

      // Act
      const result = await service.getProgresoEstudiante('est-123');

      // Assert
      expect(result[1]).toEqual({
        ruta: 'Ruta Vacía',
        color: '#4CAF50',
        clasesTotales: 0, // No classes
        clasesAsistidas: 0,
        porcentaje: 0, // 0/0 → 0% (avoids division by zero)
      });
    });

    it('should handle student with no asistencias', async () => {
      // Arrange
      const mockRutas = [{ id: 'ruta-1', nombre: 'Álgebra', color: '#FF5722' }];

      const mockClasesTotales = [
        { ruta_curricular_id: 'ruta-1', _count: { id: 10 } },
      ];

      jest
        .spyOn(prisma.rutaCurricular, 'findMany')
        .mockResolvedValue(mockRutas as any);
      jest
        .spyOn(prisma.clase, 'groupBy')
        .mockResolvedValue(mockClasesTotales as any);
      jest.spyOn(prisma.asistencia, 'groupBy').mockResolvedValue([] as any); // No asistencias
      jest.spyOn(prisma.clase, 'findMany').mockResolvedValue([] as any);

      // Act
      const result = await service.getProgresoEstudiante('est-123');

      // Assert
      expect(result[0]).toEqual({
        ruta: 'Álgebra',
        color: '#FF5722',
        clasesTotales: 10,
        clasesAsistidas: 0, // No asistencias
        porcentaje: 0,
      });
    });

    it('should handle empty rutas array', async () => {
      // Arrange
      jest.spyOn(prisma.rutaCurricular, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.clase, 'groupBy').mockResolvedValue([]);
      jest.spyOn(prisma.asistencia, 'groupBy').mockResolvedValue([]);
      jest.spyOn(prisma.clase, 'findMany').mockResolvedValue([]);

      // Act
      const result = await service.getProgresoEstudiante('est-123');

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle multiple asistencias per clase (aggregated correctly)', async () => {
      // Arrange
      const mockRutas = [{ id: 'ruta-1', nombre: 'Álgebra', color: '#FF5722' }];

      const mockClasesTotales = [
        { ruta_curricular_id: 'ruta-1', _count: { id: 5 } },
      ];

      // Same clase_id appears multiple times (should aggregate)
      const mockAsistencias = [
        { clase_id: 'clase-1', _count: { id: 3 } }, // 3 asistencias for clase-1
      ];

      const mockClasesConRuta = [
        { id: 'clase-1', ruta_curricular_id: 'ruta-1' },
      ];

      jest
        .spyOn(prisma.rutaCurricular, 'findMany')
        .mockResolvedValue(mockRutas as any);
      jest
        .spyOn(prisma.clase, 'groupBy')
        .mockResolvedValue(mockClasesTotales as any);
      jest
        .spyOn(prisma.asistencia, 'groupBy')
        .mockResolvedValue(mockAsistencias as any);
      jest
        .spyOn(prisma.clase, 'findMany')
        .mockResolvedValue(mockClasesConRuta as any);

      // Act
      const result = await service.getProgresoEstudiante('est-123');

      // Assert
      expect(result[0].clasesAsistidas).toBe(3);
    });
  });

  describe('Performance - Query Optimization', () => {
    it('should make EXACTLY 4 queries regardless of number of rutas', async () => {
      // Arrange
      const mockRutas = [
        { id: 'ruta-1', nombre: 'Álgebra', color: '#FF5722' },
        { id: 'ruta-2', nombre: 'Geometría', color: '#4CAF50' },
        { id: 'ruta-3', nombre: 'Cálculo', color: '#2196F3' },
        { id: 'ruta-4', nombre: 'Estadística', color: '#9C27B0' },
        { id: 'ruta-5', nombre: 'Trigonometría', color: '#FF9800' },
        // 5 rutas, but only 4 queries should be made
      ];

      jest
        .spyOn(prisma.rutaCurricular, 'findMany')
        .mockResolvedValue(mockRutas as any);
      jest.spyOn(prisma.clase, 'groupBy').mockResolvedValue([]);
      jest.spyOn(prisma.asistencia, 'groupBy').mockResolvedValue([]);
      jest.spyOn(prisma.clase, 'findMany').mockResolvedValue([]);

      // Act
      await service.getProgresoEstudiante('est-123');

      // Assert - Verify EXACTLY 4 queries (not N+1)
      expect(prisma.rutaCurricular.findMany).toHaveBeenCalledTimes(1); // Query 1: rutas
      expect(prisma.clase.groupBy).toHaveBeenCalledTimes(1); // Query 2: clases totales
      expect(prisma.asistencia.groupBy).toHaveBeenCalledTimes(1); // Query 3: asistencias
      expect(prisma.clase.findMany).toHaveBeenCalledTimes(1); // Query 4: clases con ruta

      // OLD CODE would have made: 1 + (5 × 2) = 11 queries
      // NEW CODE makes: 4 queries (63% reduction)
    });

    it('should use groupBy for aggregation (not individual counts)', async () => {
      // Arrange
      jest.spyOn(prisma.rutaCurricular, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.clase, 'groupBy').mockResolvedValue([]);
      jest.spyOn(prisma.asistencia, 'groupBy').mockResolvedValue([]);
      jest.spyOn(prisma.clase, 'findMany').mockResolvedValue([]);

      // Act
      await service.getProgresoEstudiante('est-123');

      // Assert - Verify groupBy is used (not count)
      expect(prisma.clase.groupBy).toHaveBeenCalledWith({
        by: ['ruta_curricular_id'],
        _count: { id: true },
      });

      expect(prisma.asistencia.groupBy).toHaveBeenCalledWith({
        by: ['clase_id'],
        where: {
          estudiante_id: 'est-123',
          estado: EstadoAsistencia.Presente,
        },
        _count: { id: true },
      });
    });

    it('should select only necessary fields from rutas', async () => {
      // Arrange
      jest.spyOn(prisma.rutaCurricular, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.clase, 'groupBy').mockResolvedValue([]);
      jest.spyOn(prisma.asistencia, 'groupBy').mockResolvedValue([]);
      jest.spyOn(prisma.clase, 'findMany').mockResolvedValue([]);

      // Act
      await service.getProgresoEstudiante('est-123');

      // Assert - Verify select optimization
      expect(prisma.rutaCurricular.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          nombre: true,
          color: true,
        },
      });
    });
  });
});
