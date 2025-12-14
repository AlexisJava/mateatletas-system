/**
 * Test Suite: CambiarPasswordUseCase
 *
 * TDD: Tests escritos PRIMERO antes de la implementación
 *
 * RESPONSABILIDAD ÚNICA:
 * - Cambiar contraseña para cualquier tipo de usuario
 * - Verificar contraseña actual antes de cambiar
 * - Soportar Estudiante, Tutor, Docente y Admin
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { CambiarPasswordUseCase } from '../cambiar-password.use-case';
import { PrismaService } from '../../../core/database/prisma.service';
import * as bcrypt from 'bcrypt';

describe('CambiarPasswordUseCase', () => {
  let useCase: CambiarPasswordUseCase;

  const BCRYPT_ROUNDS = 12;

  const mockPrismaService = {
    estudiante: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    tutor: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    docente: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    admin: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CambiarPasswordUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<CambiarPasswordUseCase>(CambiarPasswordUseCase);

    jest.clearAllMocks();
  });

  describe('Cambio exitoso por tipo de usuario', () => {
    /**
     * TEST 1: should_change_password_for_estudiante
     */
    it('should_change_password_for_estudiante', async () => {
      const passwordActual = 'current-password';
      const nuevaPassword = 'new-secure-password';
      const hashedPassword = await bcrypt.hash(passwordActual, BCRYPT_ROUNDS);

      mockPrismaService.estudiante.findUnique.mockResolvedValueOnce({
        id: 'est-123',
        password_hash: hashedPassword,
      });
      mockPrismaService.estudiante.update.mockResolvedValueOnce({});

      const result = await useCase.execute(
        'est-123',
        passwordActual,
        nuevaPassword,
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('actualizada');
      expect(mockPrismaService.estudiante.update).toHaveBeenCalledWith({
        where: { id: 'est-123' },
        data: expect.objectContaining({
          password_hash: expect.any(String),
          fecha_ultimo_cambio: expect.any(Date),
        }),
      });
    });

    /**
     * TEST 2: should_change_password_for_tutor
     */
    it('should_change_password_for_tutor', async () => {
      const passwordActual = 'tutor-password';
      const nuevaPassword = 'new-tutor-password';
      const hashedPassword = await bcrypt.hash(passwordActual, BCRYPT_ROUNDS);

      mockPrismaService.estudiante.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.tutor.findUnique.mockResolvedValueOnce({
        id: 'tutor-123',
        password_hash: hashedPassword,
      });
      mockPrismaService.tutor.update.mockResolvedValueOnce({});

      const result = await useCase.execute(
        'tutor-123',
        passwordActual,
        nuevaPassword,
      );

      expect(result.success).toBe(true);
      expect(mockPrismaService.tutor.update).toHaveBeenCalledWith({
        where: { id: 'tutor-123' },
        data: expect.objectContaining({
          password_hash: expect.any(String),
        }),
      });
    });

    /**
     * TEST 3: should_change_password_for_docente
     */
    it('should_change_password_for_docente', async () => {
      const passwordActual = 'docente-password';
      const nuevaPassword = 'new-docente-password';
      const hashedPassword = await bcrypt.hash(passwordActual, BCRYPT_ROUNDS);

      mockPrismaService.estudiante.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.docente.findUnique.mockResolvedValueOnce({
        id: 'docente-123',
        password_hash: hashedPassword,
      });
      mockPrismaService.docente.update.mockResolvedValueOnce({});

      const result = await useCase.execute(
        'docente-123',
        passwordActual,
        nuevaPassword,
      );

      expect(result.success).toBe(true);
      expect(mockPrismaService.docente.update).toHaveBeenCalled();
    });

    /**
     * TEST 4: should_change_password_for_admin
     */
    it('should_change_password_for_admin', async () => {
      const passwordActual = 'admin-password';
      const nuevaPassword = 'new-admin-password';
      const hashedPassword = await bcrypt.hash(passwordActual, BCRYPT_ROUNDS);

      mockPrismaService.estudiante.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.docente.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.admin.findUnique.mockResolvedValueOnce({
        id: 'admin-123',
        password_hash: hashedPassword,
      });
      mockPrismaService.admin.update.mockResolvedValueOnce({});

      const result = await useCase.execute(
        'admin-123',
        passwordActual,
        nuevaPassword,
      );

      expect(result.success).toBe(true);
      expect(mockPrismaService.admin.update).toHaveBeenCalled();
    });
  });

  describe('Validaciones de error', () => {
    /**
     * TEST 5: should_throw_not_found_when_user_not_exists
     */
    it('should_throw_not_found_when_user_not_exists', async () => {
      mockPrismaService.estudiante.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.docente.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.admin.findUnique.mockResolvedValueOnce(null);

      await expect(
        useCase.execute('nonexistent-id', 'password', 'new-password'),
      ).rejects.toThrow(NotFoundException);
    });

    /**
     * TEST 6: should_throw_unauthorized_when_current_password_invalid
     */
    it('should_throw_unauthorized_when_current_password_invalid', async () => {
      const hashedPassword = await bcrypt.hash(
        'correct-password',
        BCRYPT_ROUNDS,
      );

      mockPrismaService.estudiante.findUnique.mockResolvedValueOnce({
        id: 'est-wrong',
        password_hash: hashedPassword,
      });

      await expect(
        useCase.execute('est-wrong', 'wrong-password', 'new-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    /**
     * TEST 7: should_throw_unauthorized_when_no_password_hash
     */
    it('should_throw_unauthorized_when_no_password_hash', async () => {
      mockPrismaService.estudiante.findUnique.mockResolvedValueOnce({
        id: 'est-no-hash',
        password_hash: null, // Sin password hash
      });

      await expect(
        useCase.execute('est-no-hash', 'any-password', 'new-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Seguridad', () => {
    /**
     * TEST 8: should_hash_new_password_with_12_rounds
     */
    it('should_hash_new_password_with_12_rounds', async () => {
      const passwordActual = 'current-pass';
      const nuevaPassword = 'new-secure-pass-123';
      const hashedPassword = await bcrypt.hash(passwordActual, BCRYPT_ROUNDS);

      mockPrismaService.estudiante.findUnique.mockResolvedValueOnce({
        id: 'est-rounds',
        password_hash: hashedPassword,
      });
      mockPrismaService.estudiante.update.mockResolvedValueOnce({});

      await useCase.execute('est-rounds', passwordActual, nuevaPassword);

      // Verificar que el nuevo hash fue creado con 12 rounds
      const updateCall = mockPrismaService.estudiante.update.mock.calls[0][0];
      const newHash = updateCall.data.password_hash;

      // Verificar que se puede verificar con bcrypt
      const isValid = await bcrypt.compare(nuevaPassword, newHash);
      expect(isValid).toBe(true);

      // Verificar que tiene 12 rounds (el hash contiene $12$ en formato)
      expect(newHash).toMatch(/^\$2[ab]\$12\$/);
    });

    /**
     * TEST 9: should_update_fecha_ultimo_cambio
     */
    it('should_update_fecha_ultimo_cambio', async () => {
      const passwordActual = 'current-pass';
      const hashedPassword = await bcrypt.hash(passwordActual, BCRYPT_ROUNDS);

      mockPrismaService.estudiante.findUnique.mockResolvedValueOnce({
        id: 'est-fecha',
        password_hash: hashedPassword,
      });
      mockPrismaService.estudiante.update.mockResolvedValueOnce({});

      const beforeCall = new Date();
      await useCase.execute('est-fecha', passwordActual, 'new-password');
      const afterCall = new Date();

      const updateCall = mockPrismaService.estudiante.update.mock.calls[0][0];
      const fechaCambio = updateCall.data.fecha_ultimo_cambio;

      expect(fechaCambio).toBeInstanceOf(Date);
      expect(fechaCambio.getTime()).toBeGreaterThanOrEqual(
        beforeCall.getTime(),
      );
      expect(fechaCambio.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });
  });

  describe('Estructura de respuesta', () => {
    /**
     * TEST 11: should_return_success_response
     */
    it('should_return_success_response', async () => {
      const passwordActual = 'current';
      const hashedPassword = await bcrypt.hash(passwordActual, BCRYPT_ROUNDS);

      mockPrismaService.estudiante.findUnique.mockResolvedValueOnce({
        id: 'est-response',
        password_hash: hashedPassword,
      });
      mockPrismaService.estudiante.update.mockResolvedValueOnce({});

      const result = await useCase.execute(
        'est-response',
        passwordActual,
        'new-password',
      );

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
    });
  });
});
