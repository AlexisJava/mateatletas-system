/**
 * Test Suite: ValidateCredentialsUseCase
 *
 * TDD: Tests escritos PRIMERO antes de la implementación
 *
 * RESPONSABILIDAD ÚNICA:
 * - Validar email + password contra la base de datos
 * - Migrar hashes de bcrypt con rounds antiguos (10 → 12)
 * - Retornar usuario sin password_hash si es válido
 *
 * SEGURIDAD:
 * - NIST SP 800-63B 2025: bcrypt 12 rounds mínimo
 * - Migración gradual de hashes antiguos
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ValidateCredentialsUseCase } from '../validate-credentials.use-case';
import { PrismaService } from '../../../core/database/prisma.service';
import { BCRYPT_ROUNDS } from '../../../common/constants/security.constants';
import * as bcrypt from 'bcrypt';

describe('ValidateCredentialsUseCase', () => {
  let useCase: ValidateCredentialsUseCase;
  let prismaService: PrismaService;

  const mockPrismaService = {
    tutor: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateCredentialsUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<ValidateCredentialsUseCase>(
      ValidateCredentialsUseCase,
    );
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('Validación básica de credenciales', () => {
    /**
     * TEST 1: should_return_null_when_email_not_found
     */
    it('should_return_null_when_email_not_found', async () => {
      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(null);

      const result = await useCase.execute('nonexistent@email.com', 'password');

      expect(result).toBeNull();
      expect(mockPrismaService.tutor.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@email.com' },
      });
    });

    /**
     * TEST 2: should_return_null_when_password_invalid
     */
    it('should_return_null_when_password_invalid', async () => {
      const hashedPassword = await bcrypt.hash(
        'correct-password',
        BCRYPT_ROUNDS,
      );
      const mockTutor = {
        id: 'tutor-123',
        email: 'test@email.com',
        password_hash: hashedPassword,
        nombre: 'Juan',
        apellido: 'Pérez',
      };

      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(mockTutor);

      const result = await useCase.execute('test@email.com', 'wrong-password');

      expect(result).toBeNull();
    });

    /**
     * TEST 3: should_return_tutor_without_password_hash_when_valid
     */
    it('should_return_tutor_without_password_hash_when_valid', async () => {
      const password = 'valid-password';
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const mockTutor = {
        id: 'tutor-123',
        email: 'test@email.com',
        password_hash: hashedPassword,
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '12345678',
        telefono: '1234567890',
        ha_completado_onboarding: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(mockTutor);

      const result = await useCase.execute('test@email.com', password);

      expect(result).not.toBeNull();
      expect(result).not.toHaveProperty('password_hash');
      expect(result?.id).toBe('tutor-123');
      expect(result?.email).toBe('test@email.com');
      expect(result?.nombre).toBe('Juan');
    });
  });

  describe('Migración de bcrypt rounds', () => {
    /**
     * TEST 4: should_rehash_password_when_old_rounds_detected
     * CRÍTICO: Migración gradual de hashes con 10 rounds a 12 rounds
     */
    it('should_rehash_password_when_old_rounds_detected', async () => {
      const password = 'old-password';
      // Hash con rounds antiguos (siempre menor que BCRYPT_ROUNDS configurado)
      const oldRounds = Math.max(4, BCRYPT_ROUNDS - 2); // Usar rounds menores al configurado
      const oldHash = await bcrypt.hash(password, oldRounds);
      const mockTutor = {
        id: 'tutor-old-hash',
        email: 'old@email.com',
        password_hash: oldHash,
        nombre: 'María',
        apellido: 'González',
      };

      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(mockTutor);
      mockPrismaService.tutor.update.mockResolvedValueOnce(mockTutor);

      const result = await useCase.execute('old@email.com', password);

      expect(result).not.toBeNull();
      // Verificar que se intentó actualizar el hash
      expect(mockPrismaService.tutor.update).toHaveBeenCalledWith({
        where: { id: 'tutor-old-hash' },
        data: { password_hash: expect.any(String) },
      });

      // Verificar que el nuevo hash tiene 12 rounds
      const updateCall = mockPrismaService.tutor.update.mock.calls[0][0];
      const newHash = updateCall.data.password_hash;
      const parts = newHash.split('$');
      const newRounds = parseInt(parts[2], 10);
      expect(newRounds).toBe(BCRYPT_ROUNDS);
    });

    /**
     * TEST 5: should_not_rehash_password_when_current_rounds_valid
     */
    it('should_not_rehash_password_when_current_rounds_valid', async () => {
      const password = 'current-password';
      // Hash con rounds actuales (12)
      const currentHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const mockTutor = {
        id: 'tutor-current-hash',
        email: 'current@email.com',
        password_hash: currentHash,
        nombre: 'Carlos',
        apellido: 'Rodríguez',
      };

      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(mockTutor);

      const result = await useCase.execute('current@email.com', password);

      expect(result).not.toBeNull();
      // NO debe intentar actualizar el hash
      expect(mockPrismaService.tutor.update).not.toHaveBeenCalled();
    });

    /**
     * TEST 6: should_handle_rehash_error_gracefully
     * La actualización del hash es fire-and-forget, no debe bloquear login
     */
    it('should_handle_rehash_error_gracefully', async () => {
      const password = 'old-password';
      const oldRounds = Math.max(4, BCRYPT_ROUNDS - 2);
      const oldHash = await bcrypt.hash(password, oldRounds);
      const mockTutor = {
        id: 'tutor-rehash-error',
        email: 'error@email.com',
        password_hash: oldHash,
        nombre: 'Error',
        apellido: 'User',
      };

      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(mockTutor);
      mockPrismaService.tutor.update.mockRejectedValueOnce(
        new Error('Database error'),
      );

      // El login debe ser exitoso aunque falle el rehash
      const result = await useCase.execute('error@email.com', password);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('tutor-rehash-error');
    });
  });

  describe('Edge cases', () => {
    /**
     * TEST 7: should_return_null_on_database_error
     */
    it('should_return_null_on_database_error', async () => {
      mockPrismaService.tutor.findUnique.mockRejectedValueOnce(
        new Error('Connection lost'),
      );

      const result = await useCase.execute('test@email.com', 'password');

      expect(result).toBeNull();
    });

    /**
     * TEST 8: should_handle_empty_credentials
     */
    it('should_handle_empty_credentials', async () => {
      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(null);

      const result = await useCase.execute('', '');

      expect(result).toBeNull();
    });

    /**
     * TEST 9: should_extract_rounds_from_hash_correctly
     */
    it('should_extract_rounds_from_hash_correctly', async () => {
      // Test interno del helper de extracción de rounds
      const hash10 = '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABC';
      const hash12 = '$2b$12$abcdefghijklmnopqrstuvwxyz1234567890ABC';

      // Acceder al método privado para testing
      const rounds10 = (useCase as any).getRoundsFromHash(hash10);
      const rounds12 = (useCase as any).getRoundsFromHash(hash12);

      expect(rounds10).toBe(10);
      expect(rounds12).toBe(12);
    });

    /**
     * TEST 10: should_return_0_for_invalid_hash_format
     */
    it('should_return_0_for_invalid_hash_format', async () => {
      const rounds = (useCase as any).getRoundsFromHash('invalid-hash');
      expect(rounds).toBe(0);
    });
  });

  describe('Tipos explícitos (TypeScript strict)', () => {
    /**
     * TEST 11: should_have_explicit_return_type
     */
    it('should_have_explicit_return_type', async () => {
      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(null);

      const result = await useCase.execute('test@email.com', 'password');

      // El tipo debe ser Tutor (sin password_hash) | null
      expect(result === null || typeof result === 'object').toBe(true);
    });
  });
});
