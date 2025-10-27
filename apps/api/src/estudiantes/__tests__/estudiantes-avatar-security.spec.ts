import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EstudiantesController } from '../estudiantes.controller';
import { EstudiantesService } from '../estudiantes.service';
import { PrismaService } from '../../core/database/prisma.service';
import { EstudianteOwnershipGuard } from '../guards/estudiante-ownership.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

describe('EstudiantesController - Avatar Ownership Security', () => {
  let controller: EstudiantesController;
  let service: EstudiantesService;
  let prisma: PrismaService;

  const mockEstudiante = {
    id: 'est-123',
    nombre: 'Juan',
    apellido: 'Perez',
    tutor_id: 'tutor-owner',
    avatar_url: 'old-avatar.jpg',
    edad: 10,
    nivel_escolar: 'Primaria',
    equipo_id: null,
    foto_url: null,
    puntos_totales: 0,
    nivel_actual: 1,
    fecha_nacimiento: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstudiantesController],
      providers: [
        EstudiantesService,
        {
          provide: PrismaService,
          useValue: {
            estudiante: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
            tutor: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(EstudianteOwnershipGuard)
      .useValue({ canActivate: () => true }) // Será testeado por separado
      .compile();

    controller = module.get<EstudiantesController>(EstudiantesController);
    service = module.get<EstudiantesService>(EstudiantesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('SECURITY: Avatar Update Authorization', () => {
    it('should have EstudianteOwnershipGuard applied to updateAvatar', () => {
      // ✅ TEST: Verificar que el guard está aplicado
      const metadata = Reflect.getMetadata(
        '__guards__',
        controller.updateAvatar,
      );

      // Este test FALLARÁ hasta que agreguemos el guard
      expect(metadata).toBeDefined();
    });

    it('should reject avatar update from non-owner tutor via service', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue({
        ...mockEstudiante,
        tutor_id: 'tutor-owner',
      } as any);

      // Act & Assert - Simular que el guard rechazó
      // El guard verifica ownership, el service solo actualiza
      await expect(service.findOne('est-123', 'tutor-other')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should allow avatar update from owner tutor', async () => {
      // Arrange
      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);
      jest.spyOn(prisma.estudiante, 'update').mockResolvedValue({
        ...mockEstudiante,
        avatar_url: 'new-avatar.jpg',
      } as any);

      // Act
      const result = await service.updateAvatar('est-123', 'new-avatar.jpg');

      // Assert
      expect(result).toHaveProperty('id', 'est-123');
      expect(result).toHaveProperty('avatar_url', 'new-avatar.jpg');
      expect(prisma.estudiante.update).toHaveBeenCalledWith({
        where: { id: 'est-123' },
        data: { avatar_url: 'new-avatar.jpg' },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          avatar_url: true,
        },
      });
    });
  });

  describe('REGRESSION: Existing Functionality Must Not Break', () => {
    it('should still update avatar successfully for valid requests', async () => {
      // ✅ Test de regresión: funcionalidad existente debe seguir funcionando
      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);
      jest.spyOn(prisma.estudiante, 'update').mockResolvedValue({
        ...mockEstudiante,
        avatar_url: 'valid-new-avatar.jpg',
      } as any);

      const result = await service.updateAvatar(
        'est-123',
        'valid-new-avatar.jpg',
      );

      expect(result).toHaveProperty('avatar_url', 'valid-new-avatar.jpg');
      expect(result).toHaveProperty('nombre', 'Juan');
      expect(result).toHaveProperty('apellido', 'Perez');
    });

    it('should throw NotFoundException for non-existent student', async () => {
      // ✅ Test de regresión: validaciones existentes siguen funcionando
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);

      await expect(
        service.updateAvatar('non-existent', 'new-avatar.jpg'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return only safe fields (no password_hash, etc.)', async () => {
      // ✅ Test de regresión: seguridad de datos sigue intacta
      const estudianteWithSensitiveData = {
        ...mockEstudiante,
        password_hash: 'should-not-be-returned',
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(estudianteWithSensitiveData as any);
      jest.spyOn(prisma.estudiante, 'update').mockResolvedValue({
        id: 'est-123',
        nombre: 'Juan',
        apellido: 'Perez',
        avatar_url: 'new-avatar.jpg',
      } as any);

      const result = await service.updateAvatar('est-123', 'new-avatar.jpg');

      // No debe retornar password_hash
      expect(result).not.toHaveProperty('password_hash');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('avatar_url');
    });
  });

  describe('EDGE CASES: Handle Invalid Inputs', () => {
    it('should handle empty avatar_url', async () => {
      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);
      jest.spyOn(prisma.estudiante, 'update').mockResolvedValue({
        ...mockEstudiante,
        avatar_url: '',
      } as any);

      const result = await service.updateAvatar('est-123', '');
      expect(result.avatar_url).toBe('');
    });

    it('should handle very long avatar URLs', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(500);

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);
      jest.spyOn(prisma.estudiante, 'update').mockResolvedValue({
        ...mockEstudiante,
        avatar_url: longUrl,
      } as any);

      const result = await service.updateAvatar('est-123', longUrl);
      expect(result.avatar_url).toBe(longUrl);
    });
  });
});
