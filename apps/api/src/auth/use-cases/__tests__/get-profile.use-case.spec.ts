/**
 * Test Suite: GetProfileUseCase
 *
 * TDD: Tests escritos PRIMERO antes de la implementación
 *
 * RESPONSABILIDAD ÚNICA:
 * - Obtener perfil de usuario según rol
 * - Soportar Tutor, Docente, Admin y Estudiante
 * - Excluir campos sensibles (password_hash)
 * - Incluir rol en la respuesta
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetProfileUseCase } from '../get-profile.use-case';
import { PrismaService } from '../../../core/database/prisma.service';
import { Role } from '../../decorators/roles.decorator';

describe('GetProfileUseCase', () => {
  let useCase: GetProfileUseCase;

  const mockPrismaService = {
    tutor: {
      findUnique: jest.fn(),
    },
    docente: {
      findUnique: jest.fn(),
    },
    admin: {
      findUnique: jest.fn(),
    },
    estudiante: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProfileUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<GetProfileUseCase>(GetProfileUseCase);

    jest.clearAllMocks();
  });

  describe('Obtener perfil por rol', () => {
    /**
     * TEST 1: should_get_tutor_profile
     */
    it('should_get_tutor_profile', async () => {
      const mockTutor = {
        id: 'tutor-123',
        email: 'tutor@test.com',
        nombre: 'María',
        apellido: 'García',
        dni: '12345678',
        telefono: '1234567890',
        fecha_registro: new Date('2024-01-01'),
        ha_completado_onboarding: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-06-01'),
      };

      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(mockTutor);

      const result = await useCase.execute('tutor-123', Role.TUTOR);

      expect(result.id).toBe('tutor-123');
      expect(result.email).toBe('tutor@test.com');
      expect(result.nombre).toBe('María');
      expect(result.role).toBe(Role.TUTOR);
      expect(result).not.toHaveProperty('password_hash');
    });

    /**
     * TEST 2: should_get_docente_profile
     */
    it('should_get_docente_profile', async () => {
      const mockDocente = {
        id: 'docente-123',
        email: 'docente@test.com',
        nombre: 'Carlos',
        apellido: 'López',
        titulo: 'Profesor de Matemáticas',
        bio: 'Docente con 10 años de experiencia',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-06-01'),
      };

      mockPrismaService.docente.findUnique.mockResolvedValueOnce(mockDocente);

      const result = await useCase.execute('docente-123', Role.DOCENTE);

      expect(result.id).toBe('docente-123');
      expect(result.email).toBe('docente@test.com');
      expect(result.titulo).toBe('Profesor de Matemáticas');
      expect(result.role).toBe(Role.DOCENTE);
    });

    /**
     * TEST 3: should_get_admin_profile
     */
    it('should_get_admin_profile', async () => {
      const mockAdmin = {
        id: 'admin-123',
        email: 'admin@test.com',
        nombre: 'Admin',
        apellido: 'User',
        fecha_registro: new Date('2023-01-01'),
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2024-06-01'),
      };

      mockPrismaService.admin.findUnique.mockResolvedValueOnce(mockAdmin);

      const result = await useCase.execute('admin-123', Role.ADMIN);

      expect(result.id).toBe('admin-123');
      expect(result.email).toBe('admin@test.com');
      expect(result.role).toBe(Role.ADMIN);
    });

    /**
     * TEST 4: should_get_estudiante_profile
     * NOTA: xp_total ahora viene de recursos (RecursosEstudiante)
     */
    it('should_get_estudiante_profile', async () => {
      const mockEstudiante = {
        id: 'est-123',
        email: 'estudiante@test.com',
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 12,
        nivelEscolar: 'PRIMARIA',
        fotoUrl: 'https://foto.url',
        recursos: { xp_total: 500 },
        nivel_actual: 5,
        casaId: 'casa-1',
        tutor_id: 'tutor-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-06-01'),
      };

      mockPrismaService.estudiante.findUnique.mockResolvedValueOnce(
        mockEstudiante,
      );

      const result = await useCase.execute('est-123', Role.ESTUDIANTE);

      expect(result.id).toBe('est-123');
      expect(result.nombre).toBe('Juan');
      expect((result as any).xp_total).toBe(500);
      expect((result as any).nivel_actual).toBe(5);
      expect(result.role).toBe(Role.ESTUDIANTE);
    });
  });

  describe('Manejo de roles en minúsculas', () => {
    /**
     * TEST 5: should_handle_lowercase_tutor_role
     */
    it('should_handle_lowercase_tutor_role', async () => {
      const mockTutor = {
        id: 'tutor-lower',
        email: 'lower@test.com',
        nombre: 'Lower',
        apellido: 'Case',
      };

      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(mockTutor);

      const result = await useCase.execute('tutor-lower', 'tutor');

      expect(result.id).toBe('tutor-lower');
      expect(result.role).toBe(Role.TUTOR);
    });

    /**
     * TEST 6: should_handle_lowercase_docente_role
     */
    it('should_handle_lowercase_docente_role', async () => {
      const mockDocente = {
        id: 'docente-lower',
        email: 'docente-lower@test.com',
        nombre: 'Docente',
        apellido: 'Lower',
      };

      mockPrismaService.docente.findUnique.mockResolvedValueOnce(mockDocente);

      const result = await useCase.execute('docente-lower', 'docente');

      expect(result.id).toBe('docente-lower');
      expect(result.role).toBe(Role.DOCENTE);
    });
  });

  describe('Usuario no encontrado', () => {
    /**
     * TEST 7: should_throw_not_found_for_tutor
     */
    it('should_throw_not_found_for_tutor', async () => {
      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(null);

      await expect(useCase.execute('nonexistent', Role.TUTOR)).rejects.toThrow(
        NotFoundException,
      );
    });

    /**
     * TEST 8: should_throw_not_found_for_docente
     */
    it('should_throw_not_found_for_docente', async () => {
      mockPrismaService.docente.findUnique.mockResolvedValueOnce(null);

      await expect(
        useCase.execute('nonexistent', Role.DOCENTE),
      ).rejects.toThrow(NotFoundException);
    });

    /**
     * TEST 9: should_throw_not_found_for_admin
     */
    it('should_throw_not_found_for_admin', async () => {
      mockPrismaService.admin.findUnique.mockResolvedValueOnce(null);

      await expect(useCase.execute('nonexistent', Role.ADMIN)).rejects.toThrow(
        NotFoundException,
      );
    });

    /**
     * TEST 10: should_throw_not_found_for_estudiante
     */
    it('should_throw_not_found_for_estudiante', async () => {
      mockPrismaService.estudiante.findUnique.mockResolvedValueOnce(null);

      await expect(
        useCase.execute('nonexistent', Role.ESTUDIANTE),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Rol por defecto', () => {
    /**
     * TEST 11: should_default_to_tutor_for_unknown_role
     */
    it('should_default_to_tutor_for_unknown_role', async () => {
      const mockTutor = {
        id: 'tutor-default',
        email: 'default@test.com',
        nombre: 'Default',
        apellido: 'User',
      };

      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(mockTutor);

      const result = await useCase.execute('tutor-default', 'unknown_role');

      expect(result.id).toBe('tutor-default');
      expect(result.role).toBe(Role.TUTOR);
    });
  });
});
