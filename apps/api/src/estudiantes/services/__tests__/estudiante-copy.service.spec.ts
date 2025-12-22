import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { EstudianteCopyService } from '../estudiante-copy.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { EstudianteBusinessValidator } from '../../validators/estudiante-business.validator';

describe('EstudianteCopyService', () => {
  let service: EstudianteCopyService;
  let prisma: jest.Mocked<PrismaService>;
  let validator: jest.Mocked<EstudianteBusinessValidator>;

  beforeEach(async () => {
    const mockPrisma = {
      estudiante: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    const mockValidator = {
      validateSectorExists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstudianteCopyService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: EstudianteBusinessValidator,
          useValue: mockValidator,
        },
      ],
    }).compile();

    service = module.get<EstudianteCopyService>(EstudianteCopyService);
    prisma = module.get(PrismaService);
    validator = module.get(EstudianteBusinessValidator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('copiarEstudianteASector', () => {
    it('debe copiar un estudiante a un nuevo sector', async () => {
      const mockEstudiante = {
        id: 'est-1',
        nombre: 'Juan',
        apellido: 'Pérez',
        username: 'juan.perez',
        edad: 10,
        nivelEscolar: 'Primaria',
        email: 'juan@test.com',
        tutor_id: 'tutor-1',
        sector_id: 'sector-1',
        nivel_actual: 5,
        xp_total: 100,
        avatar_gradient: 1,
        casaId: null,
        tutor: { id: 'tutor-1', nombre: 'Pedro', apellido: 'López' },
      };

      const mockEstudianteDuplicado = {
        id: 'est-nuevo',
        nombre: 'Juan',
        apellido: 'Pérez',
        username: 'juan.perez.sect',
        edad: 10,
        nivelEscolar: 'Primaria',
        email: 'juan@test.com',
        tutor_id: 'tutor-1',
        sector_id: 'sector-2',
        nivel_actual: 5,
        xp_total: 100,
        avatar_gradient: 1,
        casaId: null,
        sector: { id: 'sector-2', nombre: 'Matemática' },
        tutor: { id: 'tutor-1', nombre: 'Pedro', apellido: 'López' },
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValueOnce(mockEstudiante as any) // Estudiante original (findUnique inicial)
        .mockResolvedValueOnce(null); // Username nuevo no existe (generarUsernameUnico)
      jest
        .spyOn(validator, 'validateSectorExists')
        .mockResolvedValue(undefined);
      jest.spyOn(prisma.estudiante, 'findFirst').mockResolvedValue(null); // No existe duplicado
      jest
        .spyOn(prisma.estudiante, 'create')
        .mockResolvedValue(mockEstudianteDuplicado as any);

      const result = await service.copiarEstudianteASector('est-1', 'sector-2');

      expect(result.id).toBe('est-nuevo');
      expect(result.sector_id).toBe('sector-2');
      expect(validator.validateSectorExists).toHaveBeenCalledWith('sector-2');
    });

    it('debe lanzar error si el estudiante no existe', async () => {
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);

      await expect(
        service.copiarEstudianteASector('est-inexistente', 'sector-2'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.copiarEstudianteASector('est-inexistente', 'sector-2'),
      ).rejects.toThrow('El estudiante no existe');
    });

    it('debe lanzar error si ya existe duplicado en el sector destino', async () => {
      const mockEstudiante = {
        id: 'est-1',
        nombre: 'Juan',
        apellido: 'Pérez',
        tutor_id: 'tutor-1',
        sector_id: 'sector-1',
        tutor: {},
      };

      const mockDuplicado = {
        id: 'est-duplicado',
        nombre: 'Juan',
        apellido: 'Pérez',
        tutor_id: 'tutor-1',
        sector_id: 'sector-2',
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);
      jest
        .spyOn(validator, 'validateSectorExists')
        .mockResolvedValue(undefined);
      jest
        .spyOn(prisma.estudiante, 'findFirst')
        .mockResolvedValue(mockDuplicado as any);

      await expect(
        service.copiarEstudianteASector('est-1', 'sector-2'),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.copiarEstudianteASector('est-1', 'sector-2'),
      ).rejects.toThrow(
        'Este estudiante ya está inscrito en el sector destino',
      );
    });

    it('debe generar username único con sufijo del sector', async () => {
      const mockEstudiante = {
        id: 'est-1',
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 10,
        nivelEscolar: 'Primaria',
        email: 'juan@test.com',
        tutor_id: 'tutor-1',
        sector_id: 'sector-1',
        nivel_actual: 1,
        xp_total: 0,
        avatar_gradient: 1,
        casaId: null,
        tutor: {},
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValueOnce(mockEstudiante as any) // Estudiante original
        .mockResolvedValueOnce(null); // Username nuevo no existe
      jest
        .spyOn(validator, 'validateSectorExists')
        .mockResolvedValue(undefined);
      jest.spyOn(prisma.estudiante, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prisma.estudiante, 'create')
        .mockResolvedValue({ id: 'est-nuevo' } as any);

      await service.copiarEstudianteASector('est-1', 'sector-abcd-1234');

      expect(prisma.estudiante.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            username: expect.stringMatching(/juan\.perez\.sect/),
          }),
        }),
      );
    });

    /**
     * NOTA: xp_total ya NO se copia porque está en RecursosEstudiante (SUB-FASE 1.3)
     * Solo se copian: nivel_actual, avatar_gradient, casaId
     */
    it('debe copiar datos de gamificación del estudiante original (sin xp_total)', async () => {
      const mockEstudiante = {
        id: 'est-1',
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 10,
        nivelEscolar: 'Primaria',
        email: 'juan@test.com',
        tutor_id: 'tutor-1',
        sector_id: 'sector-1',
        nivel_actual: 8,
        avatar_gradient: 3,
        casaId: 'equipo-1',
        tutor: {},
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValueOnce(mockEstudiante as any)
        .mockResolvedValueOnce(null);
      jest
        .spyOn(validator, 'validateSectorExists')
        .mockResolvedValue(undefined);
      jest.spyOn(prisma.estudiante, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prisma.estudiante, 'create')
        .mockResolvedValue({ id: 'est-nuevo' } as any);

      await service.copiarEstudianteASector('est-1', 'sector-2');

      expect(prisma.estudiante.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nivel_actual: 8,
            avatar_gradient: 3,
            casaId: 'equipo-1',
          }),
        }),
      );
    });
  });

  describe('copiarEstudiantePorDNIASector', () => {
    it('debe buscar estudiante por email y copiarlo', async () => {
      const mockEstudiante = {
        id: 'est-1',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@test.com',
        tutor_id: 'tutor-1',
        sector_id: 'sector-1',
        nivel_actual: 5,
        avatar_gradient: 1,
        casaId: null,
        edad: 10,
        nivelEscolar: 'Primaria',
        sector: {},
        tutor: {},
      };

      jest
        .spyOn(prisma.estudiante, 'findFirst')
        .mockResolvedValueOnce(mockEstudiante as any) // Para findFirst en copiarEstudiantePorDNIASector
        .mockResolvedValueOnce(null); // Para findFirst en copiarEstudianteASector (verificar duplicado)
      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValueOnce(mockEstudiante as any) // Para findUnique en copiarEstudianteASector (estudiante original)
        .mockResolvedValueOnce(null); // Para generarUsernameUnico
      jest
        .spyOn(validator, 'validateSectorExists')
        .mockResolvedValue(undefined);
      jest.spyOn(prisma.estudiante, 'create').mockResolvedValue({
        id: 'est-nuevo',
        sector_id: 'sector-2',
      } as any);

      const result = await service.copiarEstudiantePorDNIASector(
        'juan@test.com',
        'sector-2',
      );

      expect(prisma.estudiante.findFirst).toHaveBeenCalledWith({
        where: { email: 'juan@test.com' },
        include: { sector: true, tutor: true },
      });
      expect(result.sector_id).toBe('sector-2');
    });

    it('debe lanzar error si no encuentra estudiante con el email', async () => {
      jest.spyOn(prisma.estudiante, 'findFirst').mockResolvedValue(null);

      await expect(
        service.copiarEstudiantePorDNIASector(
          'inexistente@test.com',
          'sector-2',
        ),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.copiarEstudiantePorDNIASector(
          'inexistente@test.com',
          'sector-2',
        ),
      ).rejects.toThrow(
        'No se encontró un estudiante con email inexistente@test.com',
      );
    });
  });

  describe('generarUsernameUnico (privado, testeado indirectamente)', () => {
    it('debe generar username único cuando hay colisión', async () => {
      const mockEstudiante = {
        id: 'est-1',
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 10,
        nivelEscolar: 'Primaria',
        email: 'juan@test.com',
        tutor_id: 'tutor-1',
        sector_id: 'sector-1',
        nivel_actual: 1,
        xp_total: 0,
        avatar_gradient: 1,
        casaId: null,
        tutor: {},
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValueOnce(mockEstudiante as any) // Estudiante original
        .mockResolvedValueOnce({ username: 'juan.perez.sect' } as any) // Ya existe
        .mockResolvedValueOnce(null); // juan.perez.sect1 no existe
      jest
        .spyOn(validator, 'validateSectorExists')
        .mockResolvedValue(undefined);
      jest.spyOn(prisma.estudiante, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prisma.estudiante, 'create')
        .mockResolvedValue({ id: 'est-nuevo' } as any);

      await service.copiarEstudianteASector('est-1', 'sector-abcd-1234');

      // Debe verificar username dos veces (primero con sufijo, luego con sufijo + número)
      expect(prisma.estudiante.findUnique).toHaveBeenCalledTimes(3);
    });
  });
});
