import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DocenteAuthService } from '../docente-auth.service';
import { PasswordService } from '../password.service';
import { TokenService } from '../token.service';
import { LoginAttemptService } from '../login-attempt.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { Role } from '../../decorators/roles.decorator';

describe('DocenteAuthService', () => {
  let service: DocenteAuthService;
  let prisma: jest.Mocked<PrismaService>;
  let passwordService: jest.Mocked<PasswordService>;
  let tokenService: jest.Mocked<TokenService>;
  let loginAttemptService: jest.Mocked<LoginAttemptService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockDocente = {
    id: 'docente-123',
    email: 'docente@test.com',
    nombre: 'María',
    apellido: 'García',
    dni: '87654321',
    telefono: '+5491198765432',
    password_hash: 'hashed-password',
    fecha_registro: new Date('2024-01-01'),
    titulo: 'Licenciada en Matemáticas',
    bio: 'Profesora con 10 años de experiencia',
    debe_cambiar_password: false,
    roles: 'Docente',
  };

  beforeEach(async () => {
    const mockPrisma = {
      docente: {
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
        DocenteAuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: LoginAttemptService, useValue: mockLoginAttemptService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<DocenteAuthService>(DocenteAuthService);
    prisma = module.get(PrismaService);
    passwordService = module.get(PasswordService);
    tokenService = module.get(TokenService);
    loginAttemptService = module.get(LoginAttemptService);
    eventEmitter = module.get(EventEmitter2);

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login a docente with valid credentials', async () => {
      prisma.docente.findUnique.mockResolvedValue(mockDocente as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: true,
        needsRehash: false,
      });
      tokenService.generateAccessToken.mockReturnValue('jwt-token');
      loginAttemptService.checkAndRecordAttempt.mockResolvedValue(undefined);

      const result = await service.login('docente@test.com', 'password123', '127.0.0.1');

      expect(result.access_token).toBe('jwt-token');
      expect(result.user.id).toBe('docente-123');
      expect(result.user.email).toBe('docente@test.com');
      expect(result.user.titulo).toBe('Licenciada en Matemáticas');
      expect(result.user.bio).toBe('Profesora con 10 años de experiencia');
      expect(result.user.role).toBe(Role.DOCENTE);
      expect(result.user.roles).toContain(Role.DOCENTE);
      expect(loginAttemptService.checkAndRecordAttempt).toHaveBeenCalledWith(
        'docente@test.com',
        '127.0.0.1',
        true,
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.logged-in',
        expect.any(Object),
      );
    });

    it('should throw UnauthorizedException when docente not found', async () => {
      prisma.docente.findUnique.mockResolvedValue(null);
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
      prisma.docente.findUnique.mockResolvedValue(mockDocente as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: false,
        needsRehash: false,
      });

      await expect(
        service.login('docente@test.com', 'wrong-password', '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);

      expect(loginAttemptService.checkAndRecordAttempt).toHaveBeenCalledWith(
        'docente@test.com',
        '127.0.0.1',
        false,
      );
    });

    it('should throw UnauthorizedException when docente has no email', async () => {
      const docenteWithoutEmail = { ...mockDocente, email: null };
      prisma.docente.findUnique.mockResolvedValue(docenteWithoutEmail as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: true,
        needsRehash: false,
      });

      await expect(
        service.login('docente@test.com', 'password123', '127.0.0.1'),
      ).rejects.toThrow('El usuario no tiene email configurado');
    });

    it('should upgrade password hash when needsRehash is true', async () => {
      prisma.docente.findUnique.mockResolvedValue(mockDocente as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: true,
        needsRehash: true,
      });
      passwordService.hash.mockResolvedValue('new-hash');
      tokenService.generateAccessToken.mockReturnValue('jwt-token');

      await service.login('docente@test.com', 'password123', '127.0.0.1');

      expect(passwordService.hash).toHaveBeenCalledWith('password123');
      expect(prisma.docente.update).toHaveBeenCalledWith({
        where: { id: 'docente-123' },
        data: { password_hash: 'new-hash' },
      });
    });

    it('should use default IP when not provided', async () => {
      prisma.docente.findUnique.mockResolvedValue(mockDocente as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: true,
        needsRehash: false,
      });
      tokenService.generateAccessToken.mockReturnValue('jwt-token');

      await service.login('docente@test.com', 'password123');

      expect(loginAttemptService.checkAndRecordAttempt).toHaveBeenCalledWith(
        'docente@test.com',
        'unknown',
        true,
      );
    });

    it('should handle docente with null optional fields', async () => {
      const docenteWithNulls = {
        ...mockDocente,
        titulo: null,
        bio: null,
        dni: null,
        telefono: null,
      };
      prisma.docente.findUnique.mockResolvedValue(docenteWithNulls as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: true,
        needsRehash: false,
      });
      tokenService.generateAccessToken.mockReturnValue('jwt-token');

      const result = await service.login('docente@test.com', 'password123', '127.0.0.1');

      expect(result.user.titulo).toBeNull();
      expect(result.user.bio).toBeNull();
    });
  });
});