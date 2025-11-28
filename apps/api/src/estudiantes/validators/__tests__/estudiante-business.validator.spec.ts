import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EstudianteBusinessValidator } from '../estudiante-business.validator';
import { PrismaService } from '../../../core/database/prisma.service';

describe('EstudianteBusinessValidator', () => {
  let validator: EstudianteBusinessValidator;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrisma = {
      tutor: {
        findUnique: jest.fn(),
      },
      casa: {
        findUnique: jest.fn(),
      },
      estudiante: {
        findUnique: jest.fn(),
      },
      clase: {
        findUnique: jest.fn(),
      },
      sector: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstudianteBusinessValidator,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    validator = module.get<EstudianteBusinessValidator>(
      EstudianteBusinessValidator,
    );
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateTutorExists', () => {
    it('no debe lanzar error si el tutor existe', async () => {
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue({
        id: 'tutor-123',
      } as any);

      await expect(
        validator.validateTutorExists('tutor-123'),
      ).resolves.not.toThrow();
      expect(prisma.tutor.findUnique).toHaveBeenCalledWith({
        where: { id: 'tutor-123' },
      });
    });

    it('debe lanzar NotFoundException si el tutor no existe', async () => {
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);

      await expect(
        validator.validateTutorExists('tutor-inexistente'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        validator.validateTutorExists('tutor-inexistente'),
      ).rejects.toThrow('Tutor no encontrado');
    });
  });

  describe('validateCasaExists', () => {
    it('no debe lanzar error si el equipo existe', async () => {
      jest.spyOn(prisma.casa, 'findUnique').mockResolvedValue({
        id: 'casa-123',
      } as any);

      await expect(
        validator.validateCasaExists('casa-123'),
      ).resolves.not.toThrow();
      expect(prisma.casa.findUnique).toHaveBeenCalledWith({
        where: { id: 'casa-123' },
      });
    });

    it('debe lanzar NotFoundException si el equipo no existe', async () => {
      jest.spyOn(prisma.casa, 'findUnique').mockResolvedValue(null);

      await expect(
        validator.validateCasaExists('casa-inexistente'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        validator.validateCasaExists('casa-inexistente'),
      ).rejects.toThrow('Casa no encontrada');
    });
  });

  describe('validateEdad', () => {
    it('no debe lanzar error para edad válida (dentro del rango 3-99)', () => {
      expect(() => validator.validateEdad(5)).not.toThrow();
      expect(() => validator.validateEdad(10)).not.toThrow();
      expect(() => validator.validateEdad(18)).not.toThrow();
      expect(() => validator.validateEdad(50)).not.toThrow();
      expect(() => validator.validateEdad(99)).not.toThrow();
    });

    it('debe lanzar BadRequestException para edad menor a 3', () => {
      expect(() => validator.validateEdad(2)).toThrow(BadRequestException);
      expect(() => validator.validateEdad(0)).toThrow(BadRequestException);
      expect(() => validator.validateEdad(-1)).toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException para edad mayor a 99', () => {
      expect(() => validator.validateEdad(100)).toThrow(BadRequestException);
      expect(() => validator.validateEdad(150)).toThrow(BadRequestException);
    });

    it('debe tener el mensaje de error correcto', () => {
      expect(() => validator.validateEdad(2)).toThrow(
        'La edad debe estar entre 3 y 99 años',
      );
    });
  });

  describe('validateOwnership', () => {
    it('no debe lanzar error si el estudiante pertenece al tutor', async () => {
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue({
        id: 'estudiante-123',
        tutor_id: 'tutor-123',
      } as any);

      await expect(
        validator.validateOwnership('estudiante-123', 'tutor-123'),
      ).resolves.not.toThrow();
      expect(prisma.estudiante.findUnique).toHaveBeenCalledWith({
        where: { id: 'estudiante-123' },
        select: { id: true, tutor_id: true },
      });
    });

    it('debe lanzar NotFoundException si el estudiante no existe', async () => {
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);

      await expect(
        validator.validateOwnership('estudiante-inexistente', 'tutor-123'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        validator.validateOwnership('estudiante-inexistente', 'tutor-123'),
      ).rejects.toThrow('Estudiante no encontrado');
    });

    it('debe lanzar BadRequestException si el estudiante no pertenece al tutor', async () => {
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue({
        id: 'estudiante-123',
        tutor_id: 'otro-tutor-456',
      } as any);

      await expect(
        validator.validateOwnership('estudiante-123', 'tutor-123'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        validator.validateOwnership('estudiante-123', 'tutor-123'),
      ).rejects.toThrow('Este estudiante no pertenece al tutor especificado');
    });
  });

  describe('validateEstudianteExists', () => {
    it('no debe lanzar error si el estudiante existe', async () => {
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue({
        id: 'estudiante-123',
      } as any);

      await expect(
        validator.validateEstudianteExists('estudiante-123'),
      ).resolves.not.toThrow();
      expect(prisma.estudiante.findUnique).toHaveBeenCalledWith({
        where: { id: 'estudiante-123' },
        select: { id: true },
      });
    });

    it('debe lanzar NotFoundException si el estudiante no existe', async () => {
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);

      await expect(
        validator.validateEstudianteExists('estudiante-inexistente'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        validator.validateEstudianteExists('estudiante-inexistente'),
      ).rejects.toThrow('Estudiante no encontrado');
    });
  });

  describe('validateClaseExists', () => {
    it('no debe lanzar error si la clase existe', async () => {
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue({
        id: 'clase-123',
      } as any);

      await expect(
        validator.validateClaseExists('clase-123'),
      ).resolves.not.toThrow();
      expect(prisma.clase.findUnique).toHaveBeenCalledWith({
        where: { id: 'clase-123' },
        select: { id: true },
      });
    });

    it('debe lanzar NotFoundException si la clase no existe', async () => {
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(null);

      await expect(
        validator.validateClaseExists('clase-inexistente'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        validator.validateClaseExists('clase-inexistente'),
      ).rejects.toThrow('Clase no encontrada');
    });
  });

  describe('validateSectorExists', () => {
    it('no debe lanzar error si el sector existe', async () => {
      jest.spyOn(prisma.sector, 'findUnique').mockResolvedValue({
        id: 'sector-123',
      } as any);

      await expect(
        validator.validateSectorExists('sector-123'),
      ).resolves.not.toThrow();
      expect(prisma.sector.findUnique).toHaveBeenCalledWith({
        where: { id: 'sector-123' },
        select: { id: true },
      });
    });

    it('debe lanzar NotFoundException si el sector no existe', async () => {
      jest.spyOn(prisma.sector, 'findUnique').mockResolvedValue(null);

      await expect(
        validator.validateSectorExists('sector-inexistente'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        validator.validateSectorExists('sector-inexistente'),
      ).rejects.toThrow('Sector no encontrado');
    });
  });
});
