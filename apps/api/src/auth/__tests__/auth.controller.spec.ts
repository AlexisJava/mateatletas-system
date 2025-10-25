import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { TokenBlacklistService } from '../token-blacklist.service';
import { LoginDto } from '../dto/login.dto';
import { Request, Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
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
      login: jest.fn(),
      loginEstudiante: jest.fn(),
      register: jest.fn(),
      validateUser: jest.fn(),
      getProfile: jest.fn(),
      generateJwtToken: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    tokenBlacklistService = {
      addToBlacklist: jest.fn(),
      isBlacklisted: jest.fn(),
      blacklistAllUserTokens: jest.fn(),
      isUserBlacklisted: jest.fn(),
    } as unknown as jest.Mocked<TokenBlacklistService>;

    controller = new AuthController(authService, tokenBlacklistService);
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
      const mockUser = { id: 'user-1', email: dto.email, nombre: 'Demo', role: 'Tutor' };
      authService.login.mockResolvedValue({ access_token: 'token-123', user: mockUser });
      const { response, cookie } = createMockResponse();

      const result = await controller.login(dto, response);

      expect(cookie).toHaveBeenCalledWith(
        'auth-token',
        'token-123',
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/',
        }),
      );
      expect(result).toEqual({ user: mockUser });
      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('loginEstudiante', () => {
    it('should mirror tutor login behavior for estudiantes', async () => {
      const dto: LoginDto = { email: 'student@test.com', password: 'Secret123!' };
      const mockUser = { id: 'student-1', email: dto.email, nombre: 'Ana', role: 'Estudiante' };
      authService.loginEstudiante.mockResolvedValue({
        access_token: 'student-token',
        user: mockUser,
      });
      const { response, cookie } = createMockResponse();

      const result = await controller.loginEstudiante(dto, response);

      expect(cookie).toHaveBeenCalledWith(
        'auth-token',
        'student-token',
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/',
        }),
      );
      expect(result).toEqual({ user: mockUser });
      expect(authService.loginEstudiante).toHaveBeenCalledWith(dto);
    });
  });

  describe('logout', () => {
    it('should blacklist the token and clear the cookie when Authorization header exists', async () => {
      const req = { headers: { authorization: 'Bearer jwt-token' } } as unknown as Request;
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
          sameSite: 'strict',
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
});

