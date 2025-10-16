import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AdminUsuariosService } from './admin-usuarios.service';
import { PrismaService } from '../../core/database/prisma.service';
import { Role } from '../../auth/decorators/roles.decorator';

describe('AdminUsuariosService', () => {
  let service: AdminUsuariosService;
  let prisma: PrismaService;

  const mockTutor = {
    id: 'tutor-1',
    email: 'tutor@example.com',
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    password_hash: 'hashed_password',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      estudiantes: 2,
    },
  };

  const mockDocente = {
    id: 'doc-1',
    email: 'docente@example.com',
    nombre: 'María',
    apellido: 'González',
    password_hash: 'hashed_password',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      clases: 5,
    },
  };

  const mockAdmin = {
    id: 'admin-1',
    email: 'admin@example.com',
    nombre: 'Juan',
    apellido: 'Pérez',
    password_hash: 'hashed_password',
    createdAt: new Date(),
    updatedAt: new Date(),
    fecha_registro: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUsuariosService,
        {
          provide: PrismaService,
          useValue: {
            tutor: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            docente: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            admin: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminUsuariosService>(AdminUsuariosService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listarUsuarios', () => {
    it('should return list of all users grouped by role', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'findMany').mockResolvedValue([mockTutor] as any);
      jest.spyOn(prisma.docente, 'findMany').mockResolvedValue([mockDocente] as any);
      jest.spyOn(prisma.admin, 'findMany').mockResolvedValue([mockAdmin] as any);

      // Act
      const result = await service.listarUsuarios();

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('role', Role.Tutor);
      expect(result[1]).toHaveProperty('role', Role.Docente);
      expect(result[2]).toHaveProperty('role', Role.Admin);
    });

    it('should include _count for tutores', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'findMany').mockResolvedValue([mockTutor] as any);
      jest.spyOn(prisma.docente, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.admin, 'findMany').mockResolvedValue([]);

      // Act
      const result = await service.listarUsuarios();

      // Assert
      expect(result[0]._count).toHaveProperty('estudiantes', 2);
      expect(result[0]._count).toHaveProperty('equipos', 0);
      expect(result[0]._count).toHaveProperty('clases', 0);
    });

    it('should include _count for docentes', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.docente, 'findMany').mockResolvedValue([mockDocente] as any);
      jest.spyOn(prisma.admin, 'findMany').mockResolvedValue([]);

      // Act
      const result = await service.listarUsuarios();

      // Assert
      expect(result[0]._count).toHaveProperty('clases', 5);
      expect(result[0]._count).toHaveProperty('estudiantes', 0);
      expect(result[0]._count).toHaveProperty('equipos', 0);
    });

    it('should return empty array when no users exist', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.docente, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.admin, 'findMany').mockResolvedValue([]);

      // Act
      const result = await service.listarUsuarios();

      // Assert
      expect(result).toEqual([]);
    });

    it('should execute queries in parallel', async () => {
      // Arrange
      const tutorSpy = jest.spyOn(prisma.tutor, 'findMany').mockResolvedValue([]);
      const docenteSpy = jest.spyOn(prisma.docente, 'findMany').mockResolvedValue([]);
      const adminSpy = jest.spyOn(prisma.admin, 'findMany').mockResolvedValue([]);

      // Act
      await service.listarUsuarios();

      // Assert
      expect(tutorSpy).toHaveBeenCalled();
      expect(docenteSpy).toHaveBeenCalled();
      expect(adminSpy).toHaveBeenCalled();
    });
  });

  describe('changeUserRole', () => {
    // NOTE: changeUserRole is currently a stub/MVP implementation
    // It returns a message instead of performing actual role changes
    // These tests verify the stub behavior as documented

    it('should return pending implementation message for existing user', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(mockTutor as any);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.admin, 'findUnique').mockResolvedValue(null);

      // Act
      const result = await service.changeUserRole('tutor-1', Role.Docente);

      // Assert
      expect(result).toBeDefined();
      expect(result.message).toBe('Cambio de rol pendiente de implementación completa');
      expect(result.userId).toBe('tutor-1');
      expect(result.requestedRole).toBe(Role.Docente);
      expect(result.note).toContain('validaciones adicionales');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.admin, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.changeUserRole('non-existent', Role.Admin)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.changeUserRole('non-existent', Role.Admin)).rejects.toThrow(
        'Usuario no encontrado',
      );
    });

    it('should return pending message even if user has dependencies', async () => {
      // Arrange - Tutor with students (would block in real implementation)
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(mockTutor as any);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.admin, 'findUnique').mockResolvedValue(null);

      // Act
      const result = await service.changeUserRole('tutor-1', Role.Admin);

      // Assert - Stub doesn't validate dependencies yet
      expect(result).toBeDefined();
      expect(result.message).toBe('Cambio de rol pendiente de implementación completa');
    });

    it('should query all role tables to find user', async () => {
      // Arrange
      const tutorSpy = jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      const docenteSpy = jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(mockDocente as any);
      const adminSpy = jest.spyOn(prisma.admin, 'findUnique').mockResolvedValue(null);

      // Act
      await service.changeUserRole('doc-1', Role.Tutor);

      // Assert
      expect(tutorSpy).toHaveBeenCalledWith({ where: { id: 'doc-1' } });
      expect(docenteSpy).toHaveBeenCalledWith({ where: { id: 'doc-1' } });
      expect(adminSpy).toHaveBeenCalledWith({ where: { id: 'doc-1' } });
    });

    it('should work for admin role changes', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.admin, 'findUnique').mockResolvedValue(mockAdmin as any);

      // Act
      const result = await service.changeUserRole('admin-1', Role.Docente);

      // Assert
      expect(result).toBeDefined();
      expect(result.userId).toBe('admin-1');
      expect(result.requestedRole).toBe(Role.Docente);
    });
  });

  describe('deleteUser', () => {
    it('should delete tutor successfully', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'delete').mockResolvedValue(mockTutor as any);

      // Act
      const result = await service.deleteUser('tutor-1');

      // Assert
      expect(result).toHaveProperty('message', 'Tutor eliminado correctamente');
      expect(result).toHaveProperty('role', Role.Tutor);
    });

    it('should delete docente successfully', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'delete').mockRejectedValue({ code: 'P2025' });
      jest.spyOn(prisma.docente, 'delete').mockResolvedValue(mockDocente as any);

      // Act
      const result = await service.deleteUser('doc-1');

      // Assert
      expect(result).toHaveProperty('message', 'Docente eliminado correctamente');
      expect(result).toHaveProperty('role', Role.Docente);
    });

    it('should delete admin successfully', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'delete').mockRejectedValue({ code: 'P2025' });
      jest.spyOn(prisma.docente, 'delete').mockRejectedValue({ code: 'P2025' });
      jest.spyOn(prisma.admin, 'delete').mockResolvedValue(mockAdmin as any);

      // Act
      const result = await service.deleteUser('admin-1');

      // Assert
      expect(result).toHaveProperty('message', 'Admin eliminado correctamente');
      expect(result).toHaveProperty('role', Role.Admin);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'delete').mockRejectedValue({ code: 'P2025' });
      jest.spyOn(prisma.docente, 'delete').mockRejectedValue({ code: 'P2025' });
      jest.spyOn(prisma.admin, 'delete').mockRejectedValue({ code: 'P2025' });

      // Act & Assert
      await expect(service.deleteUser('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if docente has classes', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'delete').mockRejectedValue({ code: 'P2025' });
      jest.spyOn(prisma.docente, 'delete').mockRejectedValue({
        code: 'P2003', // Foreign key constraint
      });

      // Act & Assert
      await expect(service.deleteUser('doc-1')).rejects.toThrow(ConflictException);
      await expect(service.deleteUser('doc-1')).rejects.toThrow(
        'El docente tiene clases asociadas y no puede eliminarse',
      );
    });

    it('should try deleting from all tables sequentially', async () => {
      // Arrange
      const tutorSpy = jest
        .spyOn(prisma.tutor, 'delete')
        .mockRejectedValue({ code: 'P2025' });
      const docenteSpy = jest
        .spyOn(prisma.docente, 'delete')
        .mockRejectedValue({ code: 'P2025' });
      const adminSpy = jest.spyOn(prisma.admin, 'delete').mockResolvedValue(mockAdmin as any);

      // Act
      await service.deleteUser('admin-1');

      // Assert
      expect(tutorSpy).toHaveBeenCalled();
      expect(docenteSpy).toHaveBeenCalled();
      expect(adminSpy).toHaveBeenCalled();
    });
  });
});
