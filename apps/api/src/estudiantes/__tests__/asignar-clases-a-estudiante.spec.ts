import { Test, TestingModule } from '@nestjs/testing';
import { EstudiantesService } from '../estudiantes.service';
import { PrismaService } from '../../core/database/prisma.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { LogrosService } from '../../gamificacion/services/logros.service';

/**
 * TDD: Asignar clases a estudiante en un sector
 *
 * FUNCIONALIDAD:
 * - Asignar una o múltiples clases a un estudiante
 * - Validar que las clases pertenezcan al sector del estudiante
 * - Crear inscripciones automáticamente
 * - Validar cupos disponibles
 * - Prevenir inscripciones duplicadas
 */
describe('EstudiantesService - Asignar Clases', () => {
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
            },
            clase: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            inscripcionClase: {
              create: jest.fn(),
              findFirst: jest.fn(),
              createMany: jest.fn(),
            },
            $transaction: jest.fn(),
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

    jest.clearAllMocks();

    (prisma.$transaction as jest.Mock).mockImplementation(
      async (fn: (tx: typeof prisma) => Promise<void>) =>
        fn({
          inscripcionClase: prisma.inscripcionClase,
          clase: prisma.clase,
        } as typeof prisma),
    );
  });

  describe('RED - Test 13: Asignar una clase a un estudiante', () => {
    it('debería crear una inscripción para la clase seleccionada', async () => {
      // Arrange
      const estudianteId = 'estudiante-id';
      const claseId = 'clase-matematica-b1';

      const estudiante = {
        id: estudianteId,
        nombre: 'Juan',
        sector_id: 'sector-matematica-id',
      };

      const clase = {
        id: claseId,
        nombre: 'Matemática B1',
        sector_id: 'sector-matematica-id',
        cupos_maximo: 10,
        cupos_ocupados: 5,
      };

      const inscripcion = {
        id: 'inscripcion-id',
        estudiante_id: estudianteId,
        clase_id: claseId,
        estado: 'Activa',
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(estudiante as any);
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(clase as any);
      jest.spyOn(prisma.inscripcionClase, 'findFirst').mockResolvedValue(null); // No existe inscripción previa
      jest
        .spyOn(prisma.inscripcionClase, 'create')
        .mockResolvedValue(inscripcion as any);
      jest
        .spyOn(prisma.clase, 'update')
        .mockResolvedValue({ ...clase, cupos_ocupados: 6 } as any);

      // Act
      const result = await service.asignarClaseAEstudiante(
        estudianteId,
        claseId,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.estudiante_id).toBe(estudianteId);
      expect(result.clase_id).toBe(claseId);
      expect(prisma.clase.update).toHaveBeenCalledWith({
        where: { id: claseId },
        data: { cupos_ocupados: { increment: 1 } },
      });
    });
  });

  describe('RED - Test 14: Asignar múltiples clases a un estudiante', () => {
    it('debería crear inscripciones para todas las clases seleccionadas', async () => {
      // Arrange
      const estudianteId = 'estudiante-id';
      const clasesIds = ['clase-1', 'clase-2', 'clase-3'];

      const estudiante = {
        id: estudianteId,
        sector_id: 'sector-matematica-id',
      };

      const clases = clasesIds.map((id, index) => ({
        id,
        nombre: `Clase ${index + 1}`,
        sector_id: 'sector-matematica-id',
        cupos_maximo: 10,
        cupos_ocupados: 5,
      }));

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(estudiante as any);
      jest.spyOn(prisma.clase, 'findMany').mockResolvedValue(clases as any);
      (prisma.inscripcionClase.create as jest.Mock)
        .mockResolvedValueOnce({
          id: 'inscripcion-clase-1',
          estudiante_id: estudianteId,
          clase_id: 'clase-1',
        } as any)
        .mockResolvedValueOnce({
          id: 'inscripcion-clase-2',
          estudiante_id: estudianteId,
          clase_id: 'clase-2',
        } as any)
        .mockResolvedValueOnce({
          id: 'inscripcion-clase-3',
          estudiante_id: estudianteId,
          clase_id: 'clase-3',
        } as any);

      (prisma.clase.update as jest.Mock).mockResolvedValue({
        ...clases[0],
        cupos_ocupados: 6,
      } as any);

      // Act
      const result = await service.asignarClasesAEstudiante(
        estudianteId,
        clasesIds,
      );

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].estudiante_id).toBe(estudianteId);
      expect(result[1].estudiante_id).toBe(estudianteId);
      expect(result[2].estudiante_id).toBe(estudianteId);
    });
  });

  describe('RED - Test 15: Validar que las clases pertenecen al sector del estudiante', () => {
    it('debería lanzar BadRequestException si una clase no pertenece al sector', async () => {
      // Arrange
      const estudianteId = 'estudiante-id';
      const claseId = 'clase-programacion'; // Clase de otro sector

      const estudiante = {
        id: estudianteId,
        sector_id: 'sector-matematica-id',
      };

      const clase = {
        id: claseId,
        nombre: 'Programación',
        sector_id: 'sector-programacion-id', // Sector diferente
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(estudiante as any);
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(clase as any);

      // Act & Assert
      await expect(
        service.asignarClaseAEstudiante(estudianteId, claseId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.asignarClaseAEstudiante(estudianteId, claseId),
      ).rejects.toThrow('La clase no pertenece al sector del estudiante');
    });
  });

  describe('RED - Test 16: Validar cupos disponibles', () => {
    it('debería lanzar ConflictException si la clase está llena', async () => {
      // Arrange
      const estudianteId = 'estudiante-id';
      const claseId = 'clase-llena';

      const estudiante = {
        id: estudianteId,
        sector_id: 'sector-matematica-id',
      };

      const claseCompleta = {
        id: claseId,
        nombre: 'Matemática B1',
        sector_id: 'sector-matematica-id',
        cupos_maximo: 10,
        cupos_ocupados: 10, // Clase llena
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(estudiante as any);
      jest
        .spyOn(prisma.clase, 'findUnique')
        .mockResolvedValue(claseCompleta as any);

      // Act & Assert
      await expect(
        service.asignarClaseAEstudiante(estudianteId, claseId),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.asignarClaseAEstudiante(estudianteId, claseId),
      ).rejects.toThrow('La clase no tiene cupos disponibles');
    });
  });

  describe('RED - Test 17: Prevenir inscripción duplicada', () => {
    it('debería lanzar ConflictException si el estudiante ya está inscrito', async () => {
      // Arrange
      const estudianteId = 'estudiante-id';
      const claseId = 'clase-id';

      const estudiante = {
        id: estudianteId,
        sector_id: 'sector-matematica-id',
      };

      const clase = {
        id: claseId,
        sector_id: 'sector-matematica-id',
        cupos_maximo: 10,
        cupos_ocupados: 5,
      };

      const inscripcionExistente = {
        id: 'inscripcion-existente',
        estudiante_id: estudianteId,
        clase_id: claseId,
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(estudiante as any);
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(clase as any);
      jest
        .spyOn(prisma.inscripcionClase, 'findFirst')
        .mockResolvedValue(inscripcionExistente as any);

      // Act & Assert
      await expect(
        service.asignarClaseAEstudiante(estudianteId, claseId),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.asignarClaseAEstudiante(estudianteId, claseId),
      ).rejects.toThrow('El estudiante ya está inscrito en esta clase');
    });
  });

  describe('RED - Test 18: Obtener clases disponibles por sector', () => {
    it('debería listar solo las clases del sector del estudiante con cupos disponibles', async () => {
      // Arrange
      const estudianteId = 'estudiante-id';
      const sectorId = 'sector-matematica-id';

      const estudiante = {
        id: estudianteId,
        sector_id: sectorId,
      };

      const clasesDisponibles = [
        {
          id: 'clase-1',
          nombre: 'Matemática B1',
          sector_id: sectorId,
          cupos_maximo: 10,
          cupos_ocupados: 5,
        },
        {
          id: 'clase-2',
          nombre: 'Matemática B2',
          sector_id: sectorId,
          cupos_maximo: 8,
          cupos_ocupados: 3,
        },
      ];

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(estudiante as any);
      jest
        .spyOn(prisma.clase, 'findMany')
        .mockResolvedValue(clasesDisponibles as any);

      // Act
      const result =
        await service.obtenerClasesDisponiblesParaEstudiante(estudianteId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].cupos_maximo).toBeGreaterThan(result[0].cupos_ocupados);
      expect(prisma.clase.findMany).toHaveBeenCalledWith({
        where: {
          sector_id: sectorId,
          cupos_ocupados: { lt: expect.any(Object) },
        },
      });
    });
  });
});
