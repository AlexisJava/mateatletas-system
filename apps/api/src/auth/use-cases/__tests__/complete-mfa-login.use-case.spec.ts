/**
 * Test Suite: CompleteMfaLoginUseCase
 *
 * TDD: Tests escritos PRIMERO antes de la implementación
 *
 * RESPONSABILIDAD ÚNICA:
 * - Completar el login verificando código MFA
 * - Soportar TOTP y códigos de backup
 * - Generar JWT final tras verificación
 * - Emitir evento de login exitoso
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CompleteMfaLoginUseCase } from '../complete-mfa-login.use-case';
import { PrismaService } from '../../../core/database/prisma.service';
import * as bcrypt from 'bcrypt';

// Mock de otplib
jest.mock('otplib', () => ({
  authenticator: {
    options: {},
    verify: jest.fn(),
  },
}));

import { authenticator } from 'otplib';

describe('CompleteMfaLoginUseCase', () => {
  let useCase: CompleteMfaLoginUseCase;

  const mockPrismaService = {
    admin: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    verify: jest.fn(),
    sign: jest.fn().mockReturnValue('mock-final-jwt-token'),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompleteMfaLoginUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    useCase = module.get<CompleteMfaLoginUseCase>(CompleteMfaLoginUseCase);

    jest.clearAllMocks();
  });

  describe('Verificación de token MFA', () => {
    /**
     * TEST 1: should_throw_when_mfa_token_invalid
     */
    it('should_throw_when_mfa_token_invalid', async () => {
      mockJwtService.verify.mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      await expect(useCase.execute('invalid-token', '123456')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    /**
     * TEST 2: should_throw_when_token_type_not_mfa_pending
     */
    it('should_throw_when_token_type_not_mfa_pending', async () => {
      mockJwtService.verify.mockReturnValueOnce({
        sub: 'admin-123',
        email: 'admin@test.com',
        type: 'access', // No es mfa_pending
      });

      await expect(
        useCase.execute('wrong-type-token', '123456'),
      ).rejects.toThrow(UnauthorizedException);
    });

    /**
     * TEST 3: should_throw_when_admin_not_found
     */
    it('should_throw_when_admin_not_found', async () => {
      mockJwtService.verify.mockReturnValueOnce({
        sub: 'nonexistent-admin',
        email: 'admin@test.com',
        type: 'mfa_pending',
      });
      mockPrismaService.admin.findUnique.mockResolvedValueOnce(null);

      await expect(
        useCase.execute('valid-mfa-token', '123456'),
      ).rejects.toThrow(UnauthorizedException);
    });

    /**
     * TEST 4: should_throw_when_mfa_not_enabled
     */
    it('should_throw_when_mfa_not_enabled', async () => {
      mockJwtService.verify.mockReturnValueOnce({
        sub: 'admin-no-mfa',
        email: 'admin@test.com',
        type: 'mfa_pending',
      });
      mockPrismaService.admin.findUnique.mockResolvedValueOnce({
        id: 'admin-no-mfa',
        email: 'admin@test.com',
        mfa_enabled: false, // MFA deshabilitado
        mfa_secret: null,
      });

      await expect(
        useCase.execute('valid-mfa-token', '123456'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Verificación con código TOTP', () => {
    /**
     * TEST 5: should_complete_mfa_with_valid_totp_code
     */
    it('should_complete_mfa_with_valid_totp_code', async () => {
      mockJwtService.verify.mockReturnValueOnce({
        sub: 'admin-123',
        email: 'admin@test.com',
        type: 'mfa_pending',
      });

      const mockAdmin = {
        id: 'admin-123',
        email: 'admin@test.com',
        nombre: 'Admin',
        apellido: 'User',
        fecha_registro: new Date(),
        dni: '12345678',
        telefono: '1234567890',
        mfa_enabled: true,
        mfa_secret: 'JBSWY3DPEHPK3PXP',
        mfa_backup_codes: [],
        roles: '["admin"]',
        debe_cambiar_password: false,
      };

      mockPrismaService.admin.findUnique.mockResolvedValueOnce(mockAdmin);
      (authenticator.verify as jest.Mock).mockReturnValueOnce(true);

      const result = await useCase.execute('valid-mfa-token', '123456');

      expect(result.access_token).toBe('mock-final-jwt-token');
      expect(result.user.id).toBe('admin-123');
      expect(result.user.role).toBe('ADMIN');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'user.logged-in',
        expect.any(Object),
      );
    });

    /**
     * TEST 6: should_throw_when_totp_code_invalid
     */
    it('should_throw_when_totp_code_invalid', async () => {
      mockJwtService.verify.mockReturnValueOnce({
        sub: 'admin-123',
        email: 'admin@test.com',
        type: 'mfa_pending',
      });

      mockPrismaService.admin.findUnique.mockResolvedValueOnce({
        id: 'admin-123',
        email: 'admin@test.com',
        mfa_enabled: true,
        mfa_secret: 'JBSWY3DPEHPK3PXP',
        mfa_backup_codes: [],
      });

      (authenticator.verify as jest.Mock).mockReturnValueOnce(false);

      await expect(
        useCase.execute('valid-mfa-token', '000000'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Verificación con código de backup', () => {
    /**
     * TEST 7: should_complete_mfa_with_valid_backup_code
     */
    it('should_complete_mfa_with_valid_backup_code', async () => {
      const backupCode = 'BACKUP-CODE-123';
      const hashedBackupCode = await bcrypt.hash(backupCode, 10);

      mockJwtService.verify.mockReturnValueOnce({
        sub: 'admin-backup',
        email: 'admin@test.com',
        type: 'mfa_pending',
      });

      const mockAdmin = {
        id: 'admin-backup',
        email: 'admin@test.com',
        nombre: 'Admin',
        apellido: 'Backup',
        fecha_registro: new Date(),
        mfa_enabled: true,
        mfa_secret: 'SECRET',
        mfa_backup_codes: [hashedBackupCode, 'other-hashed-code'],
        roles: '["admin"]',
        debe_cambiar_password: false,
      };

      mockPrismaService.admin.findUnique.mockResolvedValueOnce(mockAdmin);
      mockPrismaService.admin.update.mockResolvedValueOnce(mockAdmin);

      const result = await useCase.execute(
        'valid-mfa-token',
        undefined,
        backupCode,
      );

      expect(result.access_token).toBe('mock-final-jwt-token');
      expect(result.user.id).toBe('admin-backup');

      // Verificar que se eliminó el código usado
      expect(mockPrismaService.admin.update).toHaveBeenCalledWith({
        where: { id: 'admin-backup' },
        data: { mfa_backup_codes: ['other-hashed-code'] },
      });
    });

    /**
     * TEST 8: should_throw_when_backup_code_invalid
     */
    it('should_throw_when_backup_code_invalid', async () => {
      const hashedBackupCode = await bcrypt.hash('REAL-CODE', 10);

      mockJwtService.verify.mockReturnValueOnce({
        sub: 'admin-123',
        email: 'admin@test.com',
        type: 'mfa_pending',
      });

      mockPrismaService.admin.findUnique.mockResolvedValueOnce({
        id: 'admin-123',
        email: 'admin@test.com',
        mfa_enabled: true,
        mfa_secret: 'SECRET',
        mfa_backup_codes: [hashedBackupCode],
      });

      await expect(
        useCase.execute('valid-mfa-token', undefined, 'WRONG-CODE'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Estructura de respuesta', () => {
    /**
     * TEST 9: should_return_correct_structure
     */
    it('should_return_correct_structure', async () => {
      mockJwtService.verify.mockReturnValueOnce({
        sub: 'admin-struct',
        email: 'admin@test.com',
        type: 'mfa_pending',
      });

      const mockAdmin = {
        id: 'admin-struct',
        email: 'admin@test.com',
        nombre: 'Structure',
        apellido: 'Test',
        fecha_registro: new Date('2024-01-01'),
        dni: '99999999',
        telefono: '9999999999',
        mfa_enabled: true,
        mfa_secret: 'SECRET',
        mfa_backup_codes: [],
        roles: '["admin"]',
        debe_cambiar_password: true,
      };

      mockPrismaService.admin.findUnique.mockResolvedValueOnce(mockAdmin);
      (authenticator.verify as jest.Mock).mockReturnValueOnce(true);

      const result = await useCase.execute('valid-mfa-token', '123456');

      expect(result).toHaveProperty('access_token');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('nombre');
      expect(result.user).toHaveProperty('apellido');
      expect(result.user).toHaveProperty('fecha_registro');
      expect(result.user).toHaveProperty('dni');
      expect(result.user).toHaveProperty('telefono');
      expect(result.user).toHaveProperty('role');
      expect(result.user).toHaveProperty('roles');
      expect(result.user).toHaveProperty('debe_cambiar_password');
    });
  });

  describe('Eventos', () => {
    /**
     * TEST 10: should_emit_login_event_on_success
     */
    it('should_emit_login_event_on_success', async () => {
      mockJwtService.verify.mockReturnValueOnce({
        sub: 'admin-event',
        email: 'admin-event@test.com',
        type: 'mfa_pending',
      });

      mockPrismaService.admin.findUnique.mockResolvedValueOnce({
        id: 'admin-event',
        email: 'admin-event@test.com',
        nombre: 'Event',
        apellido: 'Admin',
        fecha_registro: new Date(),
        mfa_enabled: true,
        mfa_secret: 'SECRET',
        mfa_backup_codes: [],
        roles: '["admin"]',
        debe_cambiar_password: false,
      });

      (authenticator.verify as jest.Mock).mockReturnValueOnce(true);

      await useCase.execute('valid-mfa-token', '123456');

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'user.logged-in',
        expect.objectContaining({
          userId: 'admin-event',
          userType: 'admin',
          email: 'admin-event@test.com',
        }),
      );
    });
  });
});
