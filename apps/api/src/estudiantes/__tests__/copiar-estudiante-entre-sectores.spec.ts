import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EstudianteCopyService } from '../services/estudiante-copy.service';
import { EstudianteBusinessValidator } from '../validators/estudiante-business.validator';
import { PrismaService } from '../../core/database/prisma.service';
import { BadRequestException, ConflictException } from '@nestjs/common';

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
describe.skip('EstudianteCopyService - Copiar entre Sectores', () => {
  let service: EstudianteCopyService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstudianteCopyService,
        EstudianteBusinessValidator,
        {
          provide: PrismaService,
          useValue: {
            estudiante: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
            },
            sector: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
            emitAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EstudianteCopyService>(EstudianteCopyService);
    prisma = module.get<PrismaService>(PrismaService);

    // Mock por defecto para create
    (prisma.estudiante.create as jest.Mock).mockImplementation(
      async (args: any) => ({
        id: 'new-estudiante-id',
        ...args.data,
      }),
    );
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
        tutor_id: 'tutor-id',
        edad: 10,
        nivel_escolar: 'Primaria',
        email: 'juan@example.com',
        nivel_actual: 1,
        puntos_totales: 0,
        avatar_gradient: 1,
        equipo_id: null,
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
      // Mock findFirst para que no encuentre duplicado
      jest.spyOn(prisma.estudiante, 'findFirst').mockResolvedValue(null);
      // Mock create para devolver el estudiante duplicado
      jest.spyOn(prisma.estudiante, 'create').mockResolvedValue({
        ...estudianteExistente,
        id: 'new-estudiante-id',
        sector_id: nuevoSectorId,
        sector: nuevoSector,
      } as any);

      // Act
      const result = await service.copiarEstudianteASector(
        estudianteId,
        nuevoSectorId,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.sector_id).toBe(nuevoSectorId);
      expect(prisma.estudiante.create).toHaveBeenCalledWith({
        data: {
          nombre: estudianteExistente.nombre,
          apellido: estudianteExistente.apellido,
          edad: estudianteExistente.edad,
          nivel_escolar: estudianteExistente.nivel_escolar,
          email: estudianteExistente.email,
          tutor_id: estudianteExistente.tutor_id,
          sector_id: nuevoSectorId,
          nivel_actual: estudianteExistente.nivel_actual,
          puntos_totales: estudianteExistente.puntos_totales,
          avatar_gradient: estudianteExistente.avatar_gradient,
          equipo_id: estudianteExistente.equipo_id,
        },
        include: {
          sector: true,
          tutor: true,
        },
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
        nombre: 'Juan',
        apellido: 'Pérez',
        tutor_id: 'tutor-id',
        sector_id: sectorId, // Ya está en ese sector
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(estudiante as any);
      jest
        .spyOn(prisma.sector, 'findUnique')
        .mockResolvedValue({ id: sectorId } as any);
      // Mock findFirst para simular que ya existe un duplicado
      jest.spyOn(prisma.estudiante, 'findFirst').mockResolvedValue({
        id: 'duplicado-id',
        nombre: 'Juan',
        apellido: 'Pérez',
        tutor_id: 'tutor-id',
        sector_id: sectorId,
      } as any);

      // Act & Assert
      await expect(
        service.copiarEstudianteASector(estudianteId, sectorId),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.copiarEstudianteASector(estudianteId, sectorId),
      ).rejects.toThrow(
        'Este estudiante ya está inscrito en el sector destino',
      );
    });
  });

  describe('RED - Test 12: Buscar estudiante por email para copiar', () => {
    it('debería permitir buscar estudiante por email para copiarlo', async () => {
      // Arrange
      const email = 'juan@example.com';
      const nuevoSectorId = 'sector-programacion-id';

      const estudiante = {
        id: 'estudiante-id',
        email,
        nombre: 'Juan',
        apellido: 'Pérez',
        tutor_id: 'tutor-id',
        sector_id: 'sector-matematica-id',
        edad: 10,
        nivel_escolar: 'Primaria',
        nivel_actual: 1,
        puntos_totales: 0,
        avatar_gradient: 1,
        equipo_id: null,
        tutor: { id: 'tutor-id', nombre: 'María' },
        sector: { id: 'sector-matematica-id', nombre: 'Matemática' },
      };

      const nuevoSector = {
        id: nuevoSectorId,
        nombre: 'Programación',
      };

      // Primera llamada a findFirst: buscar por email
      // Segunda llamada a findFirst: verificar duplicado (debe retornar null)
      jest
        .spyOn(prisma.estudiante, 'findFirst')
        .mockResolvedValueOnce(estudiante as any) // Buscar por email
        .mockResolvedValueOnce(null); // Verificar duplicado
      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(estudiante as any);
      jest
        .spyOn(prisma.sector, 'findUnique')
        .mockResolvedValue(nuevoSector as any);
      jest.spyOn(prisma.estudiante, 'create').mockResolvedValue({
        ...estudiante,
        id: 'new-estudiante-id',
        sector_id: nuevoSectorId,
        sector: nuevoSector,
      } as any);

      // Act
      const result = await service.copiarEstudiantePorDNIASector(
        email,
        nuevoSectorId,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.sector_id).toBe(nuevoSectorId);
      expect(prisma.estudiante.findFirst).toHaveBeenCalledWith({
        where: { email },
        include: expect.any(Object),
      });
    });
  });
});
