import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { AuthOrchestratorService } from '../services/auth-orchestrator.service';
import { TokenBlacklistService } from '../token-blacklist.service';
import { LoginDto } from '../dto/login.dto';
import { Request, Response } from 'express';
import { Role } from '../decorators/roles.decorator';

/**
 * AuthController Tests (Post-Refactor)
 *
 * El controller ahora usa:
 * - AuthOrchestratorService para login() y loginEstudiante()
 * - AuthService para register(), getProfile(), cambiarPassword(), completeMfaLogin()
 */
describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let authOrchestrator: jest.Mocked<AuthOrchestratorService>;
  let tokenBlacklistService: jest.Mocked<TokenBlacklistService>;
  let originalNodeEnv: string | undefined;

  const createMockResponse = () => {
    const cookie = jest.fn();
    const clearCookie = jest.fn();

    const response = {
      cookie,
      clearCookie,
    } as unknown as Response;

    return { response, cookie, clearCookie };
  };

  beforeAll(() => {
    originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
  });

  beforeEach(() => {
    authService = {
      register: jest.fn(),
      getProfile: jest.fn(),
      cambiarPassword: jest.fn(),
      completeMfaLogin: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    authOrchestrator = {
      login: jest.fn(),
      loginEstudiante: jest.fn(),
      requiresMfa: jest.fn().mockReturnValue(false),
    } as unknown as jest.Mocked<AuthOrchestratorService>;

    tokenBlacklistService = {
      addToBlacklist: jest.fn(),
      isBlacklisted: jest.fn(),
      blacklistAllUserTokens: jest.fn(),
      isUserBlacklisted: jest.fn(),
    } as unknown as jest.Mocked<TokenBlacklistService>;

    controller = new AuthController(
      authService,
      authOrchestrator,
      tokenBlacklistService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('login', () => {
    it('should set httpOnly cookie with JWT and return user payload', async () => {
      const dto: LoginDto = { email: 'demo@test.com', password: 'Secret123!' };
      const mockUser = {
        id: 'user-1',
        email: dto.email,
        nombre: 'Demo',
        apellido: 'Usuario',
        fecha_registro: new Date('2024-01-01T00:00:00Z'),
        dni: null,
        telefono: null,
        role: 'Tutor',
        roles: [Role.TUTOR] as Role[],
        debe_cambiar_password: false,
      };

      authOrchestrator.login.mockResolvedValue({
        access_token: 'token-123',
        user: mockUser,
      });
      authOrchestrator.requiresMfa.mockReturnValue(false);

      const { response, cookie } = createMockResponse();
      const mockIp = '127.0.0.1';

      const result = await controller.login(dto, response, mockIp);

      expect(cookie).toHaveBeenCalledWith(
        'auth-token',
        'token-123',
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 60 * 60 * 1000,
          path: '/',
        }),
      );
      expect(result).toEqual({ user: mockUser, roles: [Role.TUTOR] });
      expect(authOrchestrator.login).toHaveBeenCalledWith(dto, mockIp);
    });

    it('should return MFA response when MFA is required', async () => {
      const dto: LoginDto = { email: 'admin@test.com', password: 'Secret123!' };
      const mfaResponse = {
        requires_mfa: true as const,
        mfa_token: 'mfa-pending-token',
        message: 'Verificación MFA requerida',
      };

      authOrchestrator.login.mockResolvedValue(mfaResponse);
      authOrchestrator.requiresMfa.mockReturnValue(true);

      const { response, cookie } = createMockResponse();
      const mockIp = '127.0.0.1';

      const result = await controller.login(dto, response, mockIp);

      expect(cookie).not.toHaveBeenCalled();
      expect(result).toEqual(mfaResponse);
    });
  });

  describe('loginEstudiante', () => {
    it('should mirror tutor login behavior for estudiantes', async () => {
      const dto = {
        username: 'pedro.martinez',
        password: 'Secret123!',
      };
      const mockUser = {
        id: 'student-1',
        email: 'pedro.martinez@test.com',
        nombre: 'Ana',
        apellido: 'García',
        edad: 12,
        nivel_escolar: 'Secundaria',
        foto_url: null,
        puntos_totales: 0,
        nivel_actual: 1,
        equipo: null,
        tutor: {
          id: 'tutor-1',
          nombre: 'Tutor',
          apellido: 'Test',
          email: 'tutor@test.com',
        },
        role: 'Estudiante',
        roles: [Role.ESTUDIANTE] as Role[],
        debe_cambiar_password: false,
      };

      authOrchestrator.loginEstudiante.mockResolvedValue({
        access_token: 'student-token',
        user: mockUser,
      });

      const { response, cookie } = createMockResponse();
      const mockIp = '127.0.0.1';

      const result = await controller.loginEstudiante(dto, response, mockIp);

      expect(cookie).toHaveBeenCalledWith(
        'auth-token',
        'student-token',
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 60 * 60 * 1000,
          path: '/',
        }),
      );
      expect(result).toEqual({ user: mockUser });
      expect(authOrchestrator.loginEstudiante).toHaveBeenCalledWith(
        dto,
        mockIp,
      );
    });
  });

  describe('changePassword', () => {
    it('should call service to change password and blacklist user tokens', async () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        roles: [],
        role: undefined,
      };
      const dto = {
        passwordActual: 'Temp123!',
        nuevaPassword: 'NuevaPassword123!',
      };

      authService.cambiarPassword.mockResolvedValue({
        success: true,
        message: 'Contraseña actualizada exitosamente',
      });

      const result = await controller.changePassword(user as any, dto);

      expect(authService.cambiarPassword).toHaveBeenCalledWith(
        user.id,
        dto.passwordActual,
        dto.nuevaPassword,
      );
      expect(tokenBlacklistService.blacklistAllUserTokens).toHaveBeenCalledWith(
        user.id,
        'password_change',
      );
      expect(result).toEqual({
        success: true,
        message: 'Contraseña actualizada exitosamente',
      });
    });
  });

  describe('logout', () => {
    it('should blacklist the token and clear the cookie when Authorization header exists', async () => {
      const req = {
        headers: { authorization: 'Bearer jwt-token' },
      } as unknown as Request;
      const { response, clearCookie } = createMockResponse();

      const result = await controller.logout(req, response);

      expect(tokenBlacklistService.addToBlacklist).toHaveBeenCalledWith(
        'jwt-token',
        'user_logout',
      );
      expect(clearCookie).toHaveBeenCalledWith(
        'auth-token',
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/',
        }),
      );
      expect(result).toEqual({
        message: 'Logout exitoso',
        description: 'La sesión ha sido cerrada y el token invalidado',
      });
    });

    it('should skip blacklist when Authorization header is missing', async () => {
      const req = { headers: {} } as unknown as Request;
      const { response } = createMockResponse();

      await controller.logout(req, response);

      expect(tokenBlacklistService.addToBlacklist).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        role: Role.TUTOR,
        roles: [Role.TUTOR],
      };
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        nombre: 'Test',
        apellido: 'User',
        role: Role.TUTOR,
      };

      authService.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile(user as any);

      expect(authService.getProfile).toHaveBeenCalledWith(user.id, Role.TUTOR);
      expect(result).toEqual(mockProfile);
    });
  });
});