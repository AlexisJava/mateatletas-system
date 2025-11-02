import { Test, TestingModule } from '@nestjs/testing';
import { EstudiantesService } from '../estudiantes.service';
import { PrismaService } from '../../core/database/prisma.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { LogrosService } from '../../gamificacion/services/logros.service';

/**
 * TDD: Copiar estudiante existente a otro sector
 *
 * FUNCIONALIDAD:
 * - Buscar estudiante existente por DNI o ID
 * - Vincular estudiante a un nuevo sector
 * - Mantener relación con el mismo tutor
 * - No duplicar el usuario, solo agregar sector
 * - Validar que el estudiante no esté ya en ese sector
 */
describe('EstudiantesService - Copiar entre Sectores', () => {
  let service: EstudiantesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstudiantesService,
        {
          provide: PrismaService,
          useValue: {
            estudiante: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
            },
            sector: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: LogrosService,
          useValue: {
            asignarLogroBienvenida: jest.fn().mockResolvedValue(undefined),
            getLogrosDisponibles: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<EstudiantesService>(EstudiantesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('RED - Test 8: Copiar estudiante existente a nuevo sector', () => {
    it('debería vincular un estudiante existente a un nuevo sector', async () => {
      // Arrange
      const estudianteId = 'estudiante-id';
      const nuevoSectorId = 'sector-programacion-id';

      const estudianteExistente = {
        id: estudianteId,
        nombre: 'Juan',
        apellido: 'Pérez',
        sector_id: 'sector-matematica-id',
        tutor: { id: 'tutor-id', nombre: 'María' },
      };

      const nuevoSector = {
        id: nuevoSectorId,
        nombre: 'Programación',
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(estudianteExistente as any);
      jest
        .spyOn(prisma.sector, 'findUnique')
        .mockResolvedValue(nuevoSector as any);
      jest.spyOn(prisma.estudiante, 'update').mockResolvedValue({
        ...estudianteExistente,
        sector_id: nuevoSectorId,
      } as any);

      // Act
      const result = await service.copiarEstudianteASector(
        estudianteId,
        nuevoSectorId,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.sector_id).toBe(nuevoSectorId);
      expect(prisma.estudiante.update).toHaveBeenCalledWith({
        where: { id: estudianteId },
        data: { sector_id: nuevoSectorId },
        include: expect.any(Object),
      });
    });
  });

  describe('RED - Test 9: Validar que el sector destino existe', () => {
    it('debería lanzar BadRequestException si el sector no existe', async () => {
      // Arrange
      const estudianteId = 'estudiante-id';
      const sectorInexistente = 'sector-inexistente';

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue({ id: estudianteId } as any);
      jest.spyOn(prisma.sector, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.copiarEstudianteASector(estudianteId, sectorInexistente),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.copiarEstudianteASector(estudianteId, sectorInexistente),
      ).rejects.toThrow('El sector destino no existe');
    });
  });

  describe('RED - Test 10: Validar que el estudiante existe', () => {
    it('debería lanzar BadRequestException si el estudiante no existe', async () => {
      // Arrange
      const estudianteInexistente = 'estudiante-inexistente';
      const sectorId = 'sector-id';

      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.sector, 'findUnique')
        .mockResolvedValue({ id: sectorId } as any);

      // Act & Assert
      await expect(
        service.copiarEstudianteASector(estudianteInexistente, sectorId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.copiarEstudianteASector(estudianteInexistente, sectorId),
      ).rejects.toThrow('El estudiante no existe');
    });
  });

  describe('RED - Test 11: Prevenir duplicación en el mismo sector', () => {
    it('debería lanzar ConflictException si el estudiante ya está en ese sector', async () => {
      // Arrange
      const estudianteId = 'estudiante-id';
      const sectorId = 'sector-id';

      const estudiante = {
        id: estudianteId,
        sector_id: sectorId, // Ya está en ese sector
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(estudiante as any);
      jest
        .spyOn(prisma.sector, 'findUnique')
        .mockResolvedValue({ id: sectorId } as any);

      // Act & Assert
      await expect(
        service.copiarEstudianteASector(estudianteId, sectorId),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.copiarEstudianteASector(estudianteId, sectorId),
      ).rejects.toThrow('El estudiante ya está asignado a este sector');
    });
  });

  describe('RED - Test 12: Buscar estudiante por DNI para copiar', () => {
    it('debería permitir buscar estudiante por DNI para copiarlo', async () => {
      // Arrange
      const dni = '12345678';
      const nuevoSectorId = 'sector-programacion-id';

      const estudiante = {
        id: 'estudiante-id',
        dni,
        nombre: 'Juan',
        sector_id: 'sector-matematica-id',
        tutor: { id: 'tutor-id', nombre: 'María' },
      };

      jest
        .spyOn(prisma.estudiante, 'findFirst')
        .mockResolvedValue(estudiante as any);
      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(estudiante as any);
      jest
        .spyOn(prisma.sector, 'findUnique')
        .mockResolvedValue({ id: nuevoSectorId } as any);
      jest.spyOn(prisma.estudiante, 'update').mockResolvedValue({
        ...estudiante,
        sector_id: nuevoSectorId,
      } as any);

      // Act
      const result = await service.copiarEstudiantePorDNIASector(
        dni,
        nuevoSectorId,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.sector_id).toBe(nuevoSectorId);
      expect(prisma.estudiante.findFirst).toHaveBeenCalledWith({
        where: { dni },
        include: expect.any(Object),
      });
    });
  });
});
