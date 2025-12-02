import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { TokenService } from '../token.service';
import { Role } from '../../../domain/constants';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: JwtService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config: Record<string, string> = {
        NODE_ENV: 'development',
        JWT_SECRET: 'test-secret-key',
        JWT_EXPIRES_IN: '7d',
      };
      return config[key] ?? defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const roles = [Role.TUTOR];
      const expectedToken = 'mock-jwt-token';

      mockJwtService.sign.mockReturnValue(expectedToken);

      const token = service.generateAccessToken(userId, email, roles);

      expect(token).toBe(expectedToken);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: userId,
        email,
        role: roles[0],
        roles,
      });
    });

    it('should handle single role as parameter', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const role = Role.ADMIN;
      const expectedToken = 'mock-jwt-token';

      mockJwtService.sign.mockReturnValue(expectedToken);

      const token = service.generateAccessToken(userId, email, role);

      expect(token).toBe(expectedToken);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: userId,
        email,
        role: Role.ADMIN,
        roles: [Role.ADMIN],
      });
    });

    it('should default to TUTOR role when empty array', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const expectedToken = 'mock-jwt-token';

      mockJwtService.sign.mockReturnValue(expectedToken);

      const token = service.generateAccessToken(userId, email, []);

      expect(token).toBe(expectedToken);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: userId,
        email,
        role: Role.TUTOR,
        roles: [Role.TUTOR],
      });
    });
  });

  describe('generateMfaToken', () => {
    it('should generate MFA token with 5 minute expiration', () => {
      const userId = 'admin-123';
      const email = 'admin@example.com';
      const expectedToken = 'mock-mfa-token';

      mockJwtService.sign.mockReturnValue(expectedToken);

      const token = service.generateMfaToken(userId, email);

      expect(token).toBe(expectedToken);
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: userId,
          email,
          type: 'mfa_pending',
        },
        { expiresIn: '5m' },
      );
    });
  });

  describe('verifyMfaToken', () => {
    it('should return payload for valid MFA token', () => {
      const validPayload = {
        sub: 'admin-123',
        email: 'admin@example.com',
        type: 'mfa_pending',
      };

      mockJwtService.verify.mockReturnValue(validPayload);

      const result = service.verifyMfaToken('valid-mfa-token');

      expect(result).toEqual(validPayload);
    });

    it('should return null for invalid token', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = service.verifyMfaToken('invalid-token');

      expect(result).toBeNull();
    });

    it('should return null for non-MFA token', () => {
      const nonMfaPayload = {
        sub: 'user-123',
        email: 'user@example.com',
        type: 'regular',
      };

      mockJwtService.verify.mockReturnValue(nonMfaPayload);

      const result = service.verifyMfaToken('non-mfa-token');

      expect(result).toBeNull();
    });
  });

  describe('verifyAccessToken', () => {
    it('should return payload for valid access token', () => {
      const validPayload = {
        sub: 'user-123',
        email: 'user@example.com',
        role: Role.TUTOR,
        roles: [Role.TUTOR],
      };

      mockJwtService.verify.mockReturnValue(validPayload);

      const result = service.verifyAccessToken('valid-token');

      expect(result).toEqual(validPayload);
    });

    it('should return null for invalid token', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = service.verifyAccessToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('setTokenCookie', () => {
    it('should set cookie with correct options in development', () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const token = 'test-token';

      service.setTokenCookie(mockResponse, token);

      expect(mockResponse.cookie).toHaveBeenCalledWith('auth-token', token, {
        httpOnly: true,
        secure: false, // development mode
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in dev
        path: '/',
      });
    });
  });

  describe('clearTokenCookie', () => {
    it('should clear cookie with correct options', () => {
      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      service.clearTokenCookie(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('auth-token', {
        httpOnly: true,
        secure: false, // development mode
        sameSite: 'lax',
        path: '/',
      });
    });
  });

  describe('parseExpiresIn', () => {
    it('should parse seconds correctly', () => {
      expect(service.parseExpiresIn('30s')).toBe(30);
    });

    it('should parse minutes correctly', () => {
      expect(service.parseExpiresIn('5m')).toBe(300);
    });

    it('should parse hours correctly', () => {
      expect(service.parseExpiresIn('1h')).toBe(3600);
    });

    it('should parse days correctly', () => {
      expect(service.parseExpiresIn('7d')).toBe(604800);
    });

    it('should return default for invalid format', () => {
      expect(service.parseExpiresIn('invalid')).toBe(3600);
    });
  });
});
