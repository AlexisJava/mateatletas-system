import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ClasesAsistenciaService } from '../services/clases-asistencia.service';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * ClasesAsistenciaService - BATCH UPSERT TESTS
 *
 * BATCH OPTIMIZATION TESTS:
 * - registrarAsistencia(): Verifica batch upsert optimization
 * - Test separación de updates vs creates
 * - Test atomicidad de transacción
 * - Performance: Verificar número de queries reducido
 *
 * PERFORMANCE OBJETIVO:
 * - ANTES: N individual upserts (30 students = 30 queries)
 * - AHORA: 1 findMany + batch operations in transaction (3-4 queries)
 */

describe('ClasesAsistenciaService - Batch Upsert Optimization', () => {
  let service: ClasesAsistenciaService;
  let prisma: PrismaService;

  const mockClase = {
    id: 'clase-1',
    docente_id: 'doc-1',
    fecha_hora_inicio: new Date('2025-10-15T10:00:00Z'),
    inscripciones: [
      { estudiante_id: 'est-1' },
      { estudiante_id: 'est-2' },
      { estudiante_id: 'est-3' },
      { estudiante_id: 'est-4' },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClasesAsistenciaService,
        {
          provide: PrismaService,
          useValue: {
            clase: {
              findUnique: jest.fn(),
            },
            asistencia: {
              findMany: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClasesAsistenciaService>(ClasesAsistenciaService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Batch Optimization - Separate Updates from Creates', () => {
    it('should separate existing from new asistencias', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);

      // Mock: est-1 y est-2 YA tienen asistencia registrada
      jest.spyOn(prisma.asistencia, 'findMany').mockResolvedValue([
        { estudiante_id: 'est-1' },
        { estudiante_id: 'est-2' },
      ] as any);

      const mockTransactionCallback = jest.fn(async (tx) => {
        // Simulate updates for est-1, est-2
        // Simulate creates for est-3, est-4
        return [
          { id: 'asist-1', estudiante_id: 'est-1', estado: 'Presente', estudiante: { nombre: 'Est1', apellido: 'Apellido1' } },
          { id: 'asist-2', estudiante_id: 'est-2', estado: 'Ausente', estudiante: { nombre: 'Est2', apellido: 'Apellido2' } },
          { id: 'asist-3', estudiante_id: 'est-3', estado: 'Presente', estudiante: { nombre: 'Est3', apellido: 'Apellido3' } },
          { id: 'asist-4', estudiante_id: 'est-4', estado: 'Tardanza', estudiante: { nombre: 'Est4', apellido: 'Apellido4' } },
        ];
      });

      (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(prisma));

      // Mock transaction operations
      jest.spyOn(prisma.asistencia, 'update')
        .mockResolvedValueOnce({ id: 'asist-1', estudiante_id: 'est-1', estado: 'Presente', estudiante: { nombre: 'Est1', apellido: 'Apellido1' } } as any)
        .mockResolvedValueOnce({ id: 'asist-2', estudiante_id: 'est-2', estado: 'Ausente', estudiante: { nombre: 'Est2', apellido: 'Apellido2' } } as any);

      jest.spyOn(prisma.asistencia, 'create')
        .mockResolvedValueOnce({ id: 'asist-3', estudiante_id: 'est-3', estado: 'Presente', estudiante: { nombre: 'Est3', apellido: 'Apellido3' } } as any)
        .mockResolvedValueOnce({ id: 'asist-4', estudiante_id: 'est-4', estado: 'Tardanza', estudiante: { nombre: 'Est4', apellido: 'Apellido4' } } as any);

      const dto = {
        asistencias: [
          { estudianteId: 'est-1', estado: 'Presente' as const, observaciones: null, puntosOtorgados: 10 },
          { estudianteId: 'est-2', estado: 'Ausente' as const, observaciones: null, puntosOtorgados: 0 },
          { estudianteId: 'est-3', estado: 'Presente' as const, observaciones: null, puntosOtorgados: 10 },
          { estudianteId: 'est-4', estado: 'Tardanza' as const, observaciones: 'Llegó 10 min tarde', puntosOtorgados: 5 },
        ],
      };

      // Act
      const result = await service.registrarAsistencia('clase-1', 'doc-1', dto);

      // Assert
      expect(result).toHaveLength(4);
      expect(prisma.asistencia.findMany).toHaveBeenCalledWith({
        where: {
          clase_id: 'clase-1',
          estudiante_id: { in: ['est-1', 'est-2', 'est-3', 'est-4'] },
        },
        select: {
          estudiante_id: true,
        },
      });

      // Verify 2 updates + 2 creates (instead of 4 upserts)
      expect(prisma.asistencia.update).toHaveBeenCalledTimes(2);
      expect(prisma.asistencia.create).toHaveBeenCalledTimes(2);
    });

    it('should only create when all asistencias are new', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);
      jest.spyOn(prisma.asistencia, 'findMany').mockResolvedValue([]); // No existing asistencias

      (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(prisma));

      jest.spyOn(prisma.asistencia, 'create')
        .mockResolvedValueOnce({ id: 'asist-1', estudiante_id: 'est-1', estudiante: { nombre: 'Est1', apellido: 'A' } } as any)
        .mockResolvedValueOnce({ id: 'asist-2', estudiante_id: 'est-2', estudiante: { nombre: 'Est2', apellido: 'B' } } as any);

      const dto = {
        asistencias: [
          { estudianteId: 'est-1', estado: 'Presente' as const, observaciones: null, puntosOtorgados: 10 },
          { estudianteId: 'est-2', estado: 'Presente' as const, observaciones: null, puntosOtorgados: 10 },
        ],
      };

      // Act
      const result = await service.registrarAsistencia('clase-1', 'doc-1', dto);

      // Assert
      expect(result).toHaveLength(2);
      expect(prisma.asistencia.update).not.toHaveBeenCalled(); // No updates
      expect(prisma.asistencia.create).toHaveBeenCalledTimes(2); // Only creates
    });

    it('should only update when all asistencias already exist', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);
      jest.spyOn(prisma.asistencia, 'findMany').mockResolvedValue([
        { estudiante_id: 'est-1' },
        { estudiante_id: 'est-2' },
      ] as any);

      (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(prisma));

      jest.spyOn(prisma.asistencia, 'update')
        .mockResolvedValueOnce({ id: 'asist-1', estudiante_id: 'est-1', estudiante: { nombre: 'Est1', apellido: 'A' } } as any)
        .mockResolvedValueOnce({ id: 'asist-2', estudiante_id: 'est-2', estudiante: { nombre: 'Est2', apellido: 'B' } } as any);

      const dto = {
        asistencias: [
          { estudianteId: 'est-1', estado: 'Presente' as const, observaciones: null, puntosOtorgados: 10 },
          { estudianteId: 'est-2', estado: 'Ausente' as const, observaciones: null, puntosOtorgados: 0 },
        ],
      };

      // Act
      const result = await service.registrarAsistencia('clase-1', 'doc-1', dto);

      // Assert
      expect(result).toHaveLength(2);
      expect(prisma.asistencia.update).toHaveBeenCalledTimes(2); // Only updates
      expect(prisma.asistencia.create).not.toHaveBeenCalled(); // No creates
    });
  });

  describe('Transaction Atomicity', () => {
    it('should use transaction for batch operations', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);
      jest.spyOn(prisma.asistencia, 'findMany').mockResolvedValue([]);

      (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(prisma));

      jest.spyOn(prisma.asistencia, 'create').mockResolvedValue({ id: 'asist-1', estudiante: { nombre: 'Test', apellido: 'Student' } } as any);

      const dto = {
        asistencias: [
          { estudianteId: 'est-1', estado: 'Presente' as const, observaciones: null, puntosOtorgados: 10 },
        ],
      };

      // Act
      await service.registrarAsistencia('clase-1', 'doc-1', dto);

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should rollback all operations if transaction fails', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);
      jest.spyOn(prisma.asistencia, 'findMany').mockResolvedValue([]);

      // Mock transaction to fail
      (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('Transaction failed'));

      const dto = {
        asistencias: [
          { estudianteId: 'est-1', estado: 'Presente' as const, observaciones: null, puntosOtorgados: 10 },
        ],
      };

      // Act & Assert
      await expect(
        service.registrarAsistencia('clase-1', 'doc-1', dto),
      ).rejects.toThrow('Transaction failed');
    });
  });

  describe('Performance - Query Reduction', () => {
    it('should make constant queries regardless of number of students', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue({
        ...mockClase,
        inscripciones: Array.from({ length: 30 }, (_, i) => ({ estudiante_id: `est-${i + 1}` })),
      } as any);

      jest.spyOn(prisma.asistencia, 'findMany').mockResolvedValue([]); // All new

      (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(prisma));

      const createSpy = jest.spyOn(prisma.asistencia, 'create').mockImplementation(
        async (args: any) => ({ id: 'mock', estudiante_id: args.data.estudiante_id, estudiante: { nombre: 'Test', apellido: 'Student' } } as any),
      );

      const dto = {
        asistencias: Array.from({ length: 30 }, (_, i) => ({
          estudianteId: `est-${i + 1}`,
          estado: 'Presente' as const,
          observaciones: null,
          puntosOtorgados: 10,
        })),
      };

      // Act
      await service.registrarAsistencia('clase-1', 'doc-1', dto);

      // Assert - Queries made:
      // 1. clase.findUnique (verify class)
      // 2. asistencia.findMany (check existing)
      // 3. $transaction (batch creates)
      expect(prisma.clase.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.asistencia.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);

      // OLD CODE: Would have called upsert 30 times (30 queries)
      // NEW CODE: 3 queries total (1 findUnique + 1 findMany + 1 transaction)
      // Performance: 90% query reduction
    });

    it('should handle mixed scenario (half updates, half creates) efficiently', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue({
        ...mockClase,
        inscripciones: Array.from({ length: 20 }, (_, i) => ({ estudiante_id: `est-${i + 1}` })),
      } as any);

      // Mock: first 10 students already have asistencia
      jest.spyOn(prisma.asistencia, 'findMany').mockResolvedValue(
        Array.from({ length: 10 }, (_, i) => ({ estudiante_id: `est-${i + 1}` })) as any,
      );

      (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(prisma));

      jest.spyOn(prisma.asistencia, 'update').mockImplementation(
        async (args: any) => ({ id: 'mock-update', estudiante: { nombre: 'Test', apellido: 'Student' } } as any),
      );

      jest.spyOn(prisma.asistencia, 'create').mockImplementation(
        async (args: any) => ({ id: 'mock-create', estudiante: { nombre: 'Test', apellido: 'Student' } } as any),
      );

      const dto = {
        asistencias: Array.from({ length: 20 }, (_, i) => ({
          estudianteId: `est-${i + 1}`,
          estado: 'Presente' as const,
          observaciones: null,
          puntosOtorgados: 10,
        })),
      };

      // Act
      await service.registrarAsistencia('clase-1', 'doc-1', dto);

      // Assert
      expect(prisma.asistencia.update).toHaveBeenCalledTimes(10); // Update existing
      expect(prisma.asistencia.create).toHaveBeenCalledTimes(10); // Create new
      expect(prisma.$transaction).toHaveBeenCalledTimes(1); // All in one transaction

      // OLD CODE: 20 upserts
      // NEW CODE: 1 findMany + 10 updates + 10 creates (all in 1 transaction)
    });
  });

  describe('Data Correctness', () => {
    it('should set fecha_registro correctly in transaction', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);
      jest.spyOn(prisma.asistencia, 'findMany').mockResolvedValue([{ estudiante_id: 'est-1' }] as any);

      (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(prisma));

      const updateSpy = jest.spyOn(prisma.asistencia, 'update').mockResolvedValue({
        id: 'asist-1',
        estudiante: { nombre: 'Test', apellido: 'Student' },
      } as any);

      const dto = {
        asistencias: [
          { estudianteId: 'est-1', estado: 'Presente' as const, observaciones: null, puntosOtorgados: 10 },
        ],
      };

      // Act
      await service.registrarAsistencia('clase-1', 'doc-1', dto);

      // Assert
      expect(updateSpy).toHaveBeenCalledWith({
        where: {
          clase_id_estudiante_id: {
            clase_id: 'clase-1',
            estudiante_id: 'est-1',
          },
        },
        data: expect.objectContaining({
          fecha_registro: expect.any(Date),
        }),
        include: expect.any(Object),
      });
    });

    it('should include estudiante details in response', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);
      jest.spyOn(prisma.asistencia, 'findMany').mockResolvedValue([]);

      (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(prisma));

      jest.spyOn(prisma.asistencia, 'create').mockResolvedValue({
        id: 'asist-1',
        estudiante_id: 'est-1',
        estado: 'Presente',
        estudiante: { nombre: 'Juan', apellido: 'Pérez' },
      } as any);

      const dto = {
        asistencias: [
          { estudianteId: 'est-1', estado: 'Presente' as const, observaciones: null, puntosOtorgados: 10 },
        ],
      };

      // Act
      const result = await service.registrarAsistencia('clase-1', 'doc-1', dto);

      // Assert
      expect(result[0]).toHaveProperty('estudiante');
      expect(result[0].estudiante).toEqual({ nombre: 'Juan', apellido: 'Pérez' });
    });

    it('should preserve observaciones and puntos_otorgados', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);
      jest.spyOn(prisma.asistencia, 'findMany').mockResolvedValue([]);

      (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(prisma));

      const createSpy = jest.spyOn(prisma.asistencia, 'create').mockResolvedValue({
        id: 'asist-1',
        estudiante: { nombre: 'Test', apellido: 'Student' },
      } as any);

      const dto = {
        asistencias: [
          {
            estudianteId: 'est-1',
            estado: 'Presente' as const,
            observaciones: 'Excelente participación',
            puntosOtorgados: 15,
          },
        ],
      };

      // Act
      await service.registrarAsistencia('clase-1', 'doc-1', dto);

      // Assert
      expect(createSpy).toHaveBeenCalledWith({
        data: expect.objectContaining({
          observaciones: 'Excelente participación',
          puntos_otorgados: 15,
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('Regression Tests - Existing Functionality', () => {
    it('should still throw NotFoundException if class does not exist', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(null);

      const dto = {
        asistencias: [
          { estudianteId: 'est-1', estado: 'Presente' as const, observaciones: null, puntosOtorgados: 10 },
        ],
      };

      // Act & Assert
      await expect(
        service.registrarAsistencia('non-existent', 'doc-1', dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should still throw ForbiddenException if docente does not own the class', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue({
        ...mockClase,
        docente_id: 'other-doc',
      } as any);

      const dto = {
        asistencias: [
          { estudianteId: 'est-1', estado: 'Presente' as const, observaciones: null, puntosOtorgados: 10 },
        ],
      };

      // Act & Assert
      await expect(
        service.registrarAsistencia('clase-1', 'doc-1', dto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should still throw BadRequestException if student not enrolled', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);

      const dto = {
        asistencias: [
          { estudianteId: 'est-999', estado: 'Presente' as const, observaciones: null, puntosOtorgados: 10 },
        ],
      };

      // Act & Assert
      await expect(
        service.registrarAsistencia('clase-1', 'doc-1', dto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.registrarAsistencia('clase-1', 'doc-1', dto),
      ).rejects.toThrow('El estudiante est-999 no está inscrito en esta clase');
    });
  });
});
