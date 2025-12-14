import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TutorAuthService } from '../tutor-auth.service';
import { PasswordService } from '../password.service';
import { TokenService } from '../token.service';
import { LoginAttemptService } from '../login-attempt.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { Role } from '../../decorators/roles.decorator';

describe('TutorAuthService', () => {
  let service: TutorAuthService;
  let prisma: jest.Mocked<PrismaService>;
  let passwordService: jest.Mocked<PasswordService>;
  let tokenService: jest.Mocked<TokenService>;
  let loginAttemptService: jest.Mocked<LoginAttemptService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockTutor = {
    id: 'tutor-123',
    email: 'tutor@test.com',
    nombre: 'Juan',
    apellido: 'Pérez',
    dni: '12345678',
    telefono: '+5491123456789',
    password_hash: 'hashed-password',
    fecha_registro: new Date('2024-01-01'),
    ha_completado_onboarding: true,
    roles: 'Tutor',
  };

  beforeEach(async () => {
    const mockPrisma = {
      tutor: {
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
    };

    const mockLoginAttemptService = {
      checkAndRecordAttempt: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TutorAuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: LoginAttemptService, useValue: mockLoginAttemptService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<TutorAuthService>(TutorAuthService);
    prisma = module.get(PrismaService);
    passwordService = module.get(PasswordService);
    tokenService = module.get(TokenService);
    loginAttemptService = module.get(LoginAttemptService);
    eventEmitter = module.get(EventEmitter2);

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login a tutor with valid credentials', async () => {
      prisma.tutor.findUnique.mockResolvedValue(mockTutor as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: true,
        needsRehash: false,
      });
      tokenService.generateAccessToken.mockReturnValue('jwt-token');
      loginAttemptService.checkAndRecordAttempt.mockResolvedValue(undefined);

      const result = await service.login(
        'tutor@test.com',
        'password123',
        '127.0.0.1',
      );

      expect(result.access_token).toBe('jwt-token');
      expect(result.user.id).toBe('tutor-123');
      expect(result.user.email).toBe('tutor@test.com');
      expect(result.user.role).toBe(Role.TUTOR);
      expect(result.user.roles).toContain(Role.TUTOR);
      expect(loginAttemptService.checkAndRecordAttempt).toHaveBeenCalledWith(
        'tutor@test.com',
        '127.0.0.1',
        true,
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.logged-in',
        expect.any(Object),
      );
    });

    it('should throw UnauthorizedException when tutor not found', async () => {
      prisma.tutor.findUnique.mockResolvedValue(null);
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
      prisma.tutor.findUnique.mockResolvedValue(mockTutor as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: false,
        needsRehash: false,
      });

      await expect(
        service.login('tutor@test.com', 'wrong-password', '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);

      expect(loginAttemptService.checkAndRecordAttempt).toHaveBeenCalledWith(
        'tutor@test.com',
        '127.0.0.1',
        false,
      );
    });

    it('should throw UnauthorizedException when tutor has no email', async () => {
      const tutorWithoutEmail = { ...mockTutor, email: null };
      prisma.tutor.findUnique.mockResolvedValue(tutorWithoutEmail as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: true,
        needsRehash: false,
      });

      await expect(
        service.login('tutor@test.com', 'password123', '127.0.0.1'),
      ).rejects.toThrow('El usuario no tiene email configurado');
    });

    it('should upgrade password hash when needsRehash is true', async () => {
      prisma.tutor.findUnique.mockResolvedValue(mockTutor as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: true,
        needsRehash: true,
      });
      passwordService.hash.mockResolvedValue('new-hash');
      tokenService.generateAccessToken.mockReturnValue('jwt-token');

      await service.login('tutor@test.com', 'password123', '127.0.0.1');

      expect(passwordService.hash).toHaveBeenCalledWith('password123');
      expect(prisma.tutor.update).toHaveBeenCalledWith({
        where: { id: 'tutor-123' },
        data: { password_hash: 'new-hash' },
      });
    });

    it('should use default IP when not provided', async () => {
      prisma.tutor.findUnique.mockResolvedValue(mockTutor as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: true,
        needsRehash: false,
      });
      tokenService.generateAccessToken.mockReturnValue('jwt-token');

      await service.login('tutor@test.com', 'password123');

      expect(loginAttemptService.checkAndRecordAttempt).toHaveBeenCalledWith(
        'tutor@test.com',
        'unknown',
        true,
      );
    });

    it('should parse and use existing roles from tutor', async () => {
      const tutorWithMultipleRoles = { ...mockTutor, roles: 'Tutor,Admin' };
      prisma.tutor.findUnique.mockResolvedValue(tutorWithMultipleRoles as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: true,
        needsRehash: false,
      });
      tokenService.generateAccessToken.mockReturnValue('jwt-token');

      const result = await service.login(
        'tutor@test.com',
        'password123',
        '127.0.0.1',
      );

      expect(result.user.roles).toContain(Role.TUTOR);
      expect(tokenService.generateAccessToken).toHaveBeenCalledWith(
        'tutor-123',
        'tutor@test.com',
        expect.arrayContaining([Role.TUTOR]),
      );
    });
  });
});
