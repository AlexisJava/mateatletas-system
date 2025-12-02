import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AdminAuthService, isMfaRequired } from '../admin-auth.service';
import { PasswordService } from '../password.service';
import { TokenService } from '../token.service';
import { LoginAttemptService } from '../login-attempt.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { Role } from '../../decorators/roles.decorator';

describe('AdminAuthService', () => {
  let service: AdminAuthService;
  let prisma: jest.Mocked<PrismaService>;
  let passwordService: jest.Mocked<PasswordService>;
  let tokenService: jest.Mocked<TokenService>;
  let loginAttemptService: jest.Mocked<LoginAttemptService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockAdmin = {
    id: 'admin-123',
    email: 'admin@test.com',
    nombre: 'Admin',
    apellido: 'User',
    password_hash: 'hashed-password',
    fecha_registro: new Date('2024-01-01'),
    mfa_enabled: false,
    mfa_secret: null,
    debe_cambiar_password: false,
    roles: 'Admin',
  };

  const mockAdminWithMfa = {
    ...mockAdmin,
    id: 'admin-mfa-123',
    mfa_enabled: true,
    mfa_secret: 'JBSWY3DPEHPK3PXP',
  };

  beforeEach(async () => {
    const mockPrisma = {
      admin: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const mockPasswordService = {
      verifyWithTimingProtection: jest.fn(),
      hash: jest.fn(),
    };

    const mockTokenService = {
      generateAccessToken: jest.fn(),
      generateMfaToken: jest.fn(),
    };

    const mockLoginAttemptService = {
      checkAndRecordAttempt: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: LoginAttemptService, useValue: mockLoginAttemptService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<AdminAuthService>(AdminAuthService);
    prisma = module.get(PrismaService);
    passwordService = module.get(PasswordService);
    tokenService = module.get(TokenService);
    loginAttemptService = module.get(LoginAttemptService);
    eventEmitter = module.get(EventEmitter2);

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login an admin without MFA', async () => {
      prisma.admin.findUnique.mockResolvedValue(mockAdmin as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: true,
        needsRehash: false,
      });
      tokenService.generateAccessToken.mockReturnValue('jwt-token');
      loginAttemptService.checkAndRecordAttempt.mockResolvedValue(undefined);

      const result = await service.login(
        'admin@test.com',
        'password123',
        '127.0.0.1',
      );

      expect(isMfaRequired(result)).toBe(false);
      if (!isMfaRequired(result)) {
        expect(result.access_token).toBe('jwt-token');
        expect(result.user.id).toBe('admin-123');
        expect(result.user.email).toBe('admin@test.com');
        expect(result.user.role).toBe(Role.ADMIN);
        expect(result.user.roles).toContain(Role.ADMIN);
      }
      expect(loginAttemptService.checkAndRecordAttempt).toHaveBeenCalledWith(
        'admin@test.com',
        '127.0.0.1',
        true,
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.logged-in',
        expect.any(Object),
      );
    });

    it('should return MFA required response when admin has MFA enabled', async () => {
      prisma.admin.findUnique.mockResolvedValue(mockAdminWithMfa as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: true,
        needsRehash: false,
      });
      tokenService.generateMfaToken.mockReturnValue('mfa-pending-token');
      loginAttemptService.checkAndRecordAttempt.mockResolvedValue(undefined);

      const result = await service.login(
        'admin@test.com',
        'password123',
        '127.0.0.1',
      );

      expect(isMfaRequired(result)).toBe(true);
      if (isMfaRequired(result)) {
        expect(result.requires_mfa).toBe(true);
        expect(result.mfa_token).toBe('mfa-pending-token');
        expect(result.message).toBe(
          'Verificación MFA requerida. Por favor ingresa tu código de autenticación.',
        );
      }
      expect(tokenService.generateMfaToken).toHaveBeenCalledWith(
        'admin-mfa-123',
        'admin@test.com',
      );
    });

    it('should throw UnauthorizedException when admin not found', async () => {
      prisma.admin.findUnique.mockResolvedValue(null);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: false,
        needsRehash: false,
      });

      await expect(
        service.login('unknown@test.com', 'password123', '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);

      expect(loginAttemptService.checkAndRecordAttempt).toHaveBeenCalledWith(
        'unknown@test.com',
        '127.0.0.1',
        false,
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      prisma.admin.findUnique.mockResolvedValue(mockAdmin as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: false,
        needsRehash: false,
      });

      await expect(
        service.login('admin@test.com', 'wrong-password', '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);

      expect(loginAttemptService.checkAndRecordAttempt).toHaveBeenCalledWith(
        'admin@test.com',
        '127.0.0.1',
        false,
      );
    });

    it('should throw UnauthorizedException when admin has no email', async () => {
      const adminWithoutEmail = { ...mockAdmin, email: null };
      prisma.admin.findUnique.mockResolvedValue(adminWithoutEmail as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: true,
        needsRehash: false,
      });

      await expect(
        service.login('admin@test.com', 'password123', '127.0.0.1'),
      ).rejects.toThrow('El usuario no tiene email configurado');
    });

    it('should upgrade password hash when needsRehash is true', async () => {
      prisma.admin.findUnique.mockResolvedValue(mockAdmin as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: true,
        needsRehash: true,
      });
      passwordService.hash.mockResolvedValue('new-hash');
      tokenService.generateAccessToken.mockReturnValue('jwt-token');

      await service.login('admin@test.com', 'password123', '127.0.0.1');

      expect(passwordService.hash).toHaveBeenCalledWith('password123');
      expect(prisma.admin.update).toHaveBeenCalledWith({
        where: { id: 'admin-123' },
        data: { password_hash: 'new-hash' },
      });
    });
  });

  describe('isMfaRequired type guard', () => {
    it('should return true for MFA required response', () => {
      const mfaResponse = {
        requires_mfa: true as const,
        mfa_token: 'token',
        message: 'Se requiere verificación MFA',
      };
      expect(isMfaRequired(mfaResponse)).toBe(true);
    });

    it('should return false for regular login response', () => {
      const loginResponse = {
        access_token: 'token',
        user: {
          id: 'admin-123',
          email: 'admin@test.com',
          nombre: 'Admin',
          apellido: 'User',
          fecha_registro: new Date(),
          role: Role.ADMIN,
          roles: [Role.ADMIN],
          debe_cambiar_password: false,
        },
      };
      expect(isMfaRequired(loginResponse)).toBe(false);
    });
  });
});
