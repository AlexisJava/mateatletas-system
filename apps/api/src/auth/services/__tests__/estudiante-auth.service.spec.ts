import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EstudianteAuthService } from '../estudiante-auth.service';
import { PasswordService } from '../password.service';
import { TokenService } from '../token.service';
import { LoginAttemptService } from '../login-attempt.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { Role } from '../../decorators/roles.decorator';

describe('EstudianteAuthService', () => {
  let service: EstudianteAuthService;
  let prisma: jest.Mocked<PrismaService>;
  let passwordService: jest.Mocked<PasswordService>;
  let tokenService: jest.Mocked<TokenService>;
  let loginAttemptService: jest.Mocked<LoginAttemptService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockTutor = {
    id: 'tutor-123',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'tutor@test.com',
  };

  const mockCasa = {
    id: 'casa-123',
    nombre: 'Los Matemáticos',
    color_primario: '#FF5733',
  };

  const mockEstudiante = {
    id: 'estudiante-123',
    username: 'pedro.martinez',
    email: 'pedro@test.com',
    nombre: 'Pedro',
    apellido: 'Martínez',
    edad: 12,
    nivelEscolar: 'Secundaria',
    fotoUrl: null,
    avatarUrl: 'https://example.com/avatar.png',
    animacion_idle_url: null,
    puntos_totales: 100,
    nivel_actual: 2,
    password_hash: 'hashed-password',
    debe_cambiar_password: false,
    roles: 'Estudiante',
    tutor: mockTutor,
    casa: mockCasa,
  };

  beforeEach(async () => {
    const mockPrisma = {
      estudiante: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      logroEstudiante: {
        count: jest.fn(),
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
        EstudianteAuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: LoginAttemptService, useValue: mockLoginAttemptService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<EstudianteAuthService>(EstudianteAuthService);
    prisma = module.get(PrismaService);
    passwordService = module.get(PasswordService);
    tokenService = module.get(TokenService);
    loginAttemptService = module.get(LoginAttemptService);
    eventEmitter = module.get(EventEmitter2);

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login a estudiante with valid credentials', async () => {
      prisma.estudiante.findUnique.mockResolvedValue(mockEstudiante as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: true,
        needsRehash: false,
      });
      tokenService.generateAccessToken.mockReturnValue('jwt-token');
      loginAttemptService.checkAndRecordAttempt.mockResolvedValue(undefined);
      (prisma.logroEstudiante.count as jest.Mock).mockResolvedValue(5);

      const result = await service.login(
        'pedro.martinez',
        'password123',
        '127.0.0.1',
      );

      expect(result.access_token).toBe('jwt-token');
      expect(result.user.id).toBe('estudiante-123');
      expect(result.user.email).toBe('pedro@test.com');
      expect(result.user.nombre).toBe('Pedro');
      expect(result.user.apellido).toBe('Martínez');
      expect(result.user.edad).toBe(12);
      expect(result.user.nivelEscolar).toBe('Secundaria');
      expect(result.user.puntos_totales).toBe(100);
      expect(result.user.nivel_actual).toBe(2);
      expect(result.user.casa).toEqual(mockCasa);
      expect(result.user.tutor).toEqual(mockTutor);
      expect(result.user.role).toBe(Role.ESTUDIANTE);
      expect(result.user.roles).toContain(Role.ESTUDIANTE);
      expect(loginAttemptService.checkAndRecordAttempt).toHaveBeenCalledWith(
        'pedro.martinez',
        '127.0.0.1',
        true,
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'estudiante.logged-in',
        expect.any(Object),
      );
    });

    it('should throw UnauthorizedException when estudiante not found', async () => {
      prisma.estudiante.findUnique.mockResolvedValue(null);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: false,
        needsRehash: false,
      });

      await expect(
        service.login('unknown.user', 'password123', '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);

      expect(loginAttemptService.checkAndRecordAttempt).toHaveBeenCalledWith(
        'unknown.user',
        '127.0.0.1',
        false,
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      prisma.estudiante.findUnique.mockResolvedValue(mockEstudiante as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: false,
        needsRehash: false,
      });

      await expect(
        service.login('pedro.martinez', 'wrong-password', '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);

      expect(loginAttemptService.checkAndRecordAttempt).toHaveBeenCalledWith(
        'pedro.martinez',
        '127.0.0.1',
        false,
      );
    });

    it('should throw UnauthorizedException when estudiante has no username', async () => {
      const estudianteWithoutUsername = { ...mockEstudiante, username: null };
      prisma.estudiante.findUnique.mockResolvedValue(
        estudianteWithoutUsername as any,
      );
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: true,
        needsRehash: false,
      });

      await expect(
        service.login('pedro.martinez', 'password123', '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should upgrade password hash when needsRehash is true', async () => {
      prisma.estudiante.findUnique.mockResolvedValue(mockEstudiante as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: true,
        needsRehash: true,
      });
      passwordService.hash.mockResolvedValue('new-hash');
      tokenService.generateAccessToken.mockReturnValue('jwt-token');
      (prisma.logroEstudiante.count as jest.Mock).mockResolvedValue(1);

      await service.login('pedro.martinez', 'password123', '127.0.0.1');

      expect(passwordService.hash).toHaveBeenCalledWith('password123');
      expect(prisma.estudiante.update).toHaveBeenCalledWith({
        where: { id: 'estudiante-123' },
        data: { password_hash: 'new-hash' },
      });
    });

    it('should emit primer-login event when estudiante has no achievements', async () => {
      prisma.estudiante.findUnique.mockResolvedValue(mockEstudiante as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: true,
        needsRehash: false,
      });
      tokenService.generateAccessToken.mockReturnValue('jwt-token');
      (prisma.logroEstudiante.count as jest.Mock).mockResolvedValue(0);

      await service.login('pedro.martinez', 'password123', '127.0.0.1');

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'estudiante.logged-in',
        expect.objectContaining({
          esPrimerLogin: true,
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'estudiante.primer-login',
        expect.any(Object),
      );
    });

    it('should not emit primer-login event when estudiante has achievements', async () => {
      prisma.estudiante.findUnique.mockResolvedValue(mockEstudiante as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: true,
        needsRehash: false,
      });
      tokenService.generateAccessToken.mockReturnValue('jwt-token');
      (prisma.logroEstudiante.count as jest.Mock).mockResolvedValue(5);

      await service.login('pedro.martinez', 'password123', '127.0.0.1');

      const primerLoginCalls = eventEmitter.emit.mock.calls.filter(
        (call) => call[0] === 'estudiante.primer-login',
      );
      expect(primerLoginCalls).toHaveLength(0);
    });

    it('should use username as email fallback when email is null', async () => {
      const estudianteWithoutEmail = { ...mockEstudiante, email: null };
      prisma.estudiante.findUnique.mockResolvedValue(
        estudianteWithoutEmail as any,
      );
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: true,
        needsRehash: false,
      });
      tokenService.generateAccessToken.mockReturnValue('jwt-token');
      (prisma.logroEstudiante.count as jest.Mock).mockResolvedValue(1);

      const result = await service.login(
        'pedro.martinez',
        'password123',
        '127.0.0.1',
      );

      expect(result.user.email).toBe('pedro.martinez');
    });

    it('should handle estudiante without tutor and casa', async () => {
      const estudianteSinRelaciones = {
        ...mockEstudiante,
        tutor: null,
        casa: null,
      };
      prisma.estudiante.findUnique.mockResolvedValue(
        estudianteSinRelaciones as any,
      );
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: true,
        needsRehash: false,
      });
      tokenService.generateAccessToken.mockReturnValue('jwt-token');
      (prisma.logroEstudiante.count as jest.Mock).mockResolvedValue(1);

      const result = await service.login(
        'pedro.martinez',
        'password123',
        '127.0.0.1',
      );

      expect(result.user.tutor).toBeNull();
      expect(result.user.casa).toBeNull();
    });

    it('should use default IP when not provided', async () => {
      prisma.estudiante.findUnique.mockResolvedValue(mockEstudiante as any);
      passwordService.verifyWithTimingProtection.mockResolvedValue({
        isValid: true,
        needsRehash: false,
      });
      tokenService.generateAccessToken.mockReturnValue('jwt-token');
      (prisma.logroEstudiante.count as jest.Mock).mockResolvedValue(1);

      await service.login('pedro.martinez', 'password123');

      expect(loginAttemptService.checkAndRecordAttempt).toHaveBeenCalledWith(
        'pedro.martinez',
        'unknown',
        true,
      );
    });
  });
});
