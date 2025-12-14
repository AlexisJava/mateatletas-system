import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DocenteCommandService } from '../services/docente-command.service';
import { DocenteBusinessValidator } from '../validators/docente-business.validator';
import { PrismaService } from '../../core/database/prisma.service';
import * as bcrypt from 'bcrypt';

// Mock de bcrypt y generateSecurePassword
jest.mock('bcrypt');
jest.mock('../../common/utils/password.utils', () => ({
  generateSecurePassword: jest.fn(() => 'GeneratedPass123!'),
}));

describe('DocenteCommandService', () => {
  let service: DocenteCommandService;
  let prisma: PrismaService;
  let validator: DocenteBusinessValidator;

  const mockDocente = {
    id: 'docente-123',
    email: 'juan@example.com',
    password_hash: 'hashed_password',
    nombre: 'Juan',
    apellido: 'Pérez',
    titulo: 'Licenciado en Matemáticas',
    bio: 'Docente con experiencia',
    telefono: '+54123456789',
    especialidades: ['Álgebra'],
    experiencia_anos: 10,
    disponibilidad_horaria: {},
    nivel_educativo: ['Secundaria'],
    estado: 'activo',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocenteCommandService,
        {
          provide: PrismaService,
          useValue: {
            docente: {
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              findUnique: jest.fn(),
            },
            clase: {
              updateMany: jest.fn(),
            },
          },
        },
        {
          provide: DocenteBusinessValidator,
          useValue: {
            validarEmailUnico: jest.fn(),
            validarDocenteExiste: jest.fn(),
            validarDocenteTieneClases: jest.fn(),
            validarReasignacionValida: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DocenteCommandService>(DocenteCommandService);
    prisma = module.get<PrismaService>(PrismaService);
    validator = module.get<DocenteBusinessValidator>(DocenteBusinessValidator);

    // Mock de bcrypt.hash
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
  });

  describe('create', () => {
    it('should create docente with provided password', async () => {
      jest.spyOn(validator, 'validarEmailUnico').mockResolvedValue();
      jest.spyOn(prisma.docente, 'create').mockResolvedValue(mockDocente);

      const createDto = {
        email: 'juan@example.com',
        password: 'MySecurePass123!',
        nombre: 'Juan',
        apellido: 'Pérez',
        titulo: 'Licenciado',
      };

      const result = await service.create(createDto);

      expect(validator.validarEmailUnico).toHaveBeenCalledWith(
        'juan@example.com',
      );
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password_hash');
      expect(result).not.toHaveProperty('generatedPassword'); // No se generó
      expect(result.nombre).toBe('Juan');
    });

    it('should throw ConflictException if email is already in use', async () => {
      jest
        .spyOn(validator, 'validarEmailUnico')
        .mockRejectedValue(
          new ConflictException('El email ya está registrado'),
        );

      const createDto = {
        email: 'juan@example.com',
        nombre: 'Juan',
        apellido: 'Pérez',
        titulo: 'Licenciado',
      };

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should exclude password_hash from response', async () => {
      jest.spyOn(validator, 'validarEmailUnico').mockResolvedValue();
      jest.spyOn(prisma.docente, 'create').mockResolvedValue(mockDocente);

      const createDto = {
        email: 'juan@example.com',
        password: 'MyPass123!',
        nombre: 'Juan',
        apellido: 'Pérez',
        titulo: 'Licenciado',
      };

      const result = await service.create(createDto);

      expect(result).not.toHaveProperty('password_hash');
    });
  });

  describe('update', () => {
    it('should update docente with basic data', async () => {
      jest.spyOn(validator, 'validarDocenteExiste').mockResolvedValue();
      jest.spyOn(prisma.docente, 'update').mockResolvedValue({
        ...mockDocente,
        nombre: 'Juan Carlos',
      });

      const updateDto = {
        nombre: 'Juan Carlos',
        apellido: 'Pérez',
      };

      const result = await service.update('docente-123', updateDto);

      expect(validator.validarDocenteExiste).toHaveBeenCalledWith(
        'docente-123',
      );
      expect(result.nombre).toBe('Juan Carlos');
      expect(result).not.toHaveProperty('password_hash');
    });

    it('should validate unique email when updating email', async () => {
      jest.spyOn(validator, 'validarDocenteExiste').mockResolvedValue();
      jest.spyOn(validator, 'validarEmailUnico').mockResolvedValue();
      jest.spyOn(prisma.docente, 'update').mockResolvedValue(mockDocente);

      const updateDto = {
        email: 'nuevo@example.com',
      };

      await service.update('docente-123', updateDto);

      expect(validator.validarEmailUnico).toHaveBeenCalledWith(
        'nuevo@example.com',
        'docente-123',
      );
    });

    it('should hash password if provided in update', async () => {
      jest.spyOn(validator, 'validarDocenteExiste').mockResolvedValue();
      jest.spyOn(prisma.docente, 'update').mockResolvedValue(mockDocente);

      const updateDto = {
        password: 'NewPass123!',
      };

      await service.update('docente-123', updateDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(
        'NewPass123!',
        expect.any(Number),
      );
      expect(prisma.docente.update).toHaveBeenCalledWith({
        where: { id: 'docente-123' },
        data: expect.objectContaining({
          password_hash: 'hashed_password',
        }),
      });
    });

    it('should throw NotFoundException if docente does not exist', async () => {
      jest
        .spyOn(validator, 'validarDocenteExiste')
        .mockRejectedValue(new NotFoundException('Docente no encontrado'));

      const updateDto = { nombre: 'Juan' };

      await expect(service.update('docente-999', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if new email is already in use', async () => {
      jest.spyOn(validator, 'validarDocenteExiste').mockResolvedValue();
      jest
        .spyOn(validator, 'validarEmailUnico')
        .mockRejectedValue(new ConflictException('El email ya está en uso'));

      const updateDto = { email: 'existente@example.com' };

      await expect(service.update('docente-123', updateDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should exclude password_hash from response', async () => {
      jest.spyOn(validator, 'validarDocenteExiste').mockResolvedValue();
      jest.spyOn(prisma.docente, 'update').mockResolvedValue(mockDocente);

      const updateDto = { nombre: 'Juan' };

      const result = await service.update('docente-123', updateDto);

      expect(result).not.toHaveProperty('password_hash');
    });
  });

  describe('remove', () => {
    it('should delete docente if no clases assigned', async () => {
      jest.spyOn(validator, 'validarDocenteTieneClases').mockResolvedValue(0);
      jest.spyOn(prisma.docente, 'delete').mockResolvedValue(mockDocente);

      const result = await service.remove('docente-123');

      expect(validator.validarDocenteTieneClases).toHaveBeenCalledWith(
        'docente-123',
      );
      expect(prisma.docente.delete).toHaveBeenCalledWith({
        where: { id: 'docente-123' },
      });
      expect(result.message).toBe('Docente eliminado correctamente');
    });

    it('should throw ConflictException if docente has clases', async () => {
      jest
        .spyOn(validator, 'validarDocenteTieneClases')
        .mockRejectedValue(
          new ConflictException(
            'No se puede eliminar el docente porque tiene 5 clase(s) asignada(s)',
          ),
        );

      await expect(service.remove('docente-123')).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.docente.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if docente does not exist', async () => {
      jest
        .spyOn(validator, 'validarDocenteTieneClases')
        .mockRejectedValue(new NotFoundException('Docente no encontrado'));

      await expect(service.remove('docente-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('reasignarClases', () => {
    it('should reassign clases from one docente to another', async () => {
      jest.spyOn(validator, 'validarReasignacionValida').mockResolvedValue();
      jest
        .spyOn(prisma.docente, 'findUnique')
        .mockResolvedValueOnce({
          ...mockDocente,
          id: 'docente-123',
          nombre: 'Juan',
          apellido: 'Pérez',
          _count: { clases: 5 },
        } as any)
        .mockResolvedValueOnce({
          ...mockDocente,
          id: 'docente-456',
          nombre: 'María',
          apellido: 'González',
        } as any);
      jest.spyOn(prisma.clase, 'updateMany').mockResolvedValue({ count: 5 });

      const result = await service.reasignarClases(
        'docente-123',
        'docente-456',
      );

      expect(validator.validarReasignacionValida).toHaveBeenCalledWith(
        'docente-123',
        'docente-456',
      );
      expect(prisma.clase.updateMany).toHaveBeenCalledWith({
        where: { docente_id: 'docente-123' },
        data: { docente_id: 'docente-456' },
      });
      expect(result.clasesReasignadas).toBe(5);
      expect(result.desde).toBe('Juan Pérez');
      expect(result.hacia).toBe('María González');
    });

    it('should throw ConflictException if trying to reassign to same docente', async () => {
      jest
        .spyOn(validator, 'validarReasignacionValida')
        .mockRejectedValue(
          new ConflictException(
            'No se puede reasignar clases al mismo docente',
          ),
        );

      await expect(
        service.reasignarClases('docente-123', 'docente-123'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if fromDocente does not exist', async () => {
      jest
        .spyOn(validator, 'validarReasignacionValida')
        .mockRejectedValue(
          new NotFoundException('Docente origen no encontrado'),
        );

      await expect(
        service.reasignarClases('docente-999', 'docente-456'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if toDocente does not exist', async () => {
      jest
        .spyOn(validator, 'validarReasignacionValida')
        .mockRejectedValue(
          new NotFoundException('Docente destino no encontrado'),
        );

      await expect(
        service.reasignarClases('docente-123', 'docente-999'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
