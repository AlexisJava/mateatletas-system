import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { DocenteBusinessValidator } from '../validators/docente-business.validator';
import { PrismaService } from '../../core/database/prisma.service';

describe('DocenteBusinessValidator', () => {
  let validator: DocenteBusinessValidator;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocenteBusinessValidator,
        {
          provide: PrismaService,
          useValue: {
            docente: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    validator = module.get<DocenteBusinessValidator>(DocenteBusinessValidator);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('validarDocenteExiste', () => {
    it('should not throw if docente exists', async () => {
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue({
        id: 'docente-123',
        email: 'juan@example.com',
        nombre: 'Juan',
        apellido: 'Perez',
      } as any);

      await expect(
        validator.validarDocenteExiste('docente-123'),
      ).resolves.not.toThrow();
    });

    it('should throw NotFoundException if docente does not exist', async () => {
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);

      await expect(
        validator.validarDocenteExiste('docente-999'),
      ).rejects.toThrow(NotFoundException);

      await expect(
        validator.validarDocenteExiste('docente-999'),
      ).rejects.toThrow('Docente no encontrado');
    });
  });

  describe('validarEmailUnico', () => {
    it('should not throw if email is unique (no existing docente)', async () => {
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);

      await expect(
        validator.validarEmailUnico('nuevo@example.com'),
      ).resolves.not.toThrow();
    });

    it('should throw ConflictException if email is already in use', async () => {
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue({
        id: 'docente-123',
        email: 'juan@example.com',
      } as any);

      await expect(
        validator.validarEmailUnico('juan@example.com'),
      ).rejects.toThrow(ConflictException);

      await expect(
        validator.validarEmailUnico('juan@example.com'),
      ).rejects.toThrow('El email ya está registrado');
    });

    it('should not throw if email is used by the same docente (excludeId)', async () => {
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue({
        id: 'docente-123',
        email: 'juan@example.com',
      } as any);

      // Está actualizando SU PROPIO email, no hay conflicto
      await expect(
        validator.validarEmailUnico('juan@example.com', 'docente-123'),
      ).resolves.not.toThrow();
    });

    it('should throw if email is used by another docente (excludeId different)', async () => {
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue({
        id: 'docente-123',
        email: 'juan@example.com',
      } as any);

      // Docente-456 está tratando de usar el email de docente-123
      await expect(
        validator.validarEmailUnico('juan@example.com', 'docente-456'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('validarDocenteTieneClases', () => {
    it('should not throw if docente has no clases', async () => {
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue({
        id: 'docente-123',
        _count: {
          clases: 0,
        },
      } as any);

      const result = await validator.validarDocenteTieneClases('docente-123');
      expect(result).toBe(0);
    });

    it('should throw ConflictException if docente has clases', async () => {
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue({
        id: 'docente-123',
        _count: {
          clases: 5,
        },
      } as any);

      await expect(
        validator.validarDocenteTieneClases('docente-123'),
      ).rejects.toThrow(ConflictException);

      await expect(
        validator.validarDocenteTieneClases('docente-123'),
      ).rejects.toThrow(
        'No se puede eliminar el docente porque tiene 5 clase(s) asignada(s)',
      );
    });

    it('should throw NotFoundException if docente does not exist', async () => {
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);

      await expect(
        validator.validarDocenteTieneClases('docente-999'),
      ).rejects.toThrow(NotFoundException);

      await expect(
        validator.validarDocenteTieneClases('docente-999'),
      ).rejects.toThrow('Docente no encontrado');
    });
  });

  describe('validarReasignacionValida', () => {
    it('should not throw if both docentes exist and are different', async () => {
      jest
        .spyOn(prisma.docente, 'findUnique')
        .mockResolvedValueOnce({
          id: 'docente-123',
          nombre: 'Juan',
        } as any)
        .mockResolvedValueOnce({
          id: 'docente-456',
          nombre: 'Maria',
        } as any);

      await expect(
        validator.validarReasignacionValida('docente-123', 'docente-456'),
      ).resolves.not.toThrow();
    });

    it('should throw ConflictException if trying to reassign to same docente', async () => {
      await expect(
        validator.validarReasignacionValida('docente-123', 'docente-123'),
      ).rejects.toThrow(ConflictException);

      await expect(
        validator.validarReasignacionValida('docente-123', 'docente-123'),
      ).rejects.toThrow('No se puede reasignar clases al mismo docente');
    });

    it('should throw NotFoundException if fromDocente does not exist', async () => {
      // Como Promise.all se ejecuta en paralelo, necesitamos usar mockImplementation
      jest
        .spyOn(prisma.docente, 'findUnique')
        .mockImplementation((args: any) => {
          if (args.where.id === 'docente-999') {
            return Promise.resolve(null);
          }
          if (args.where.id === 'docente-456') {
            return Promise.resolve({ id: 'docente-456' } as any);
          }
          return Promise.resolve(null);
        });

      await expect(
        validator.validarReasignacionValida('docente-999', 'docente-456'),
      ).rejects.toThrow(NotFoundException);

      await expect(
        validator.validarReasignacionValida('docente-999', 'docente-456'),
      ).rejects.toThrow('Docente origen no encontrado');
    });

    it('should throw NotFoundException if toDocente does not exist', async () => {
      // Como Promise.all se ejecuta en paralelo, necesitamos usar mockImplementation
      jest
        .spyOn(prisma.docente, 'findUnique')
        .mockImplementation((args: any) => {
          if (args.where.id === 'docente-123') {
            return Promise.resolve({ id: 'docente-123' } as any);
          }
          if (args.where.id === 'docente-999') {
            return Promise.resolve(null);
          }
          return Promise.resolve(null);
        });

      await expect(
        validator.validarReasignacionValida('docente-123', 'docente-999'),
      ).rejects.toThrow(NotFoundException);

      await expect(
        validator.validarReasignacionValida('docente-123', 'docente-999'),
      ).rejects.toThrow('Docente destino no encontrado');
    });
  });

  describe('validarPasswordSegura', () => {
    it('should not throw if password meets all requirements', () => {
      expect(() => validator.validarPasswordSegura('Abc12345')).not.toThrow();
      expect(() =>
        validator.validarPasswordSegura('SecurePass123!'),
      ).not.toThrow();
    });

    it('should throw if password is less than 8 characters', () => {
      expect(() => validator.validarPasswordSegura('Abc123')).toThrow(
        ConflictException,
      );
      expect(() => validator.validarPasswordSegura('Abc123')).toThrow(
        'La contraseña debe tener al menos 8 caracteres',
      );
    });

    it('should throw if password has no uppercase letter', () => {
      expect(() => validator.validarPasswordSegura('abc12345')).toThrow(
        ConflictException,
      );
      expect(() => validator.validarPasswordSegura('abc12345')).toThrow(
        'La contraseña debe contener al menos una letra mayúscula',
      );
    });

    it('should throw if password has no lowercase letter', () => {
      expect(() => validator.validarPasswordSegura('ABC12345')).toThrow(
        ConflictException,
      );
      expect(() => validator.validarPasswordSegura('ABC12345')).toThrow(
        'La contraseña debe contener al menos una letra minúscula',
      );
    });

    it('should throw if password has no number', () => {
      expect(() => validator.validarPasswordSegura('Abcdefgh')).toThrow(
        ConflictException,
      );
      expect(() => validator.validarPasswordSegura('Abcdefgh')).toThrow(
        'La contraseña debe contener al menos un número',
      );
    });
  });
});
