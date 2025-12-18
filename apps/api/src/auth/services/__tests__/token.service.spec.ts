import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { TokenService } from '../token.service';
import { Role } from '../../../domain/constants';
import {
  ACCESS_TOKEN_COOKIE_MAX_AGE,
  REFRESH_TOKEN_COOKIE_MAX_AGE,
} from '../../../common/constants/security.constants';

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
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: userId,
          email,
          role: roles[0],
          roles,
          type: 'access',
        },
        { expiresIn: '1h' }, // dev mode
      );
    });

    it('should handle single role as parameter', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const role = Role.ADMIN;
      const expectedToken = 'mock-jwt-token';

      mockJwtService.sign.mockReturnValue(expectedToken);

      const token = service.generateAccessToken(userId, email, role);

      expect(token).toBe(expectedToken);
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: userId,
          email,
          role: Role.ADMIN,
          roles: [Role.ADMIN],
          type: 'access',
        },
        { expiresIn: '1h' }, // dev mode
      );
    });

    it('should default to TUTOR role when empty array', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const expectedToken = 'mock-jwt-token';

      mockJwtService.sign.mockReturnValue(expectedToken);

      const token = service.generateAccessToken(userId, email, []);

      expect(token).toBe(expectedToken);
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: userId,
          email,
          role: Role.TUTOR,
          roles: [Role.TUTOR],
          type: 'access',
        },
        { expiresIn: '1h' }, // dev mode
      );
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
        maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE,
        path: '/',
      });
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token with JTI', () => {
      const userId = 'user-123';
      const expectedToken = 'mock-refresh-token';

      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = service.generateRefreshToken(userId);

      expect(result.token).toBe(expectedToken);
      expect(result.jti).toBeDefined();
      expect(typeof result.jti).toBe('string');
      expect(result.jti.length).toBeGreaterThan(0);

      // Verify sign was called with correct payload
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: userId,
          type: 'refresh',
          jti: expect.any(String),
        }),
        { expiresIn: '7d' },
      );
    });

    it('should generate unique JTI for each call', () => {
      mockJwtService.sign.mockReturnValue('token');

      const result1 = service.generateRefreshToken('user-1');
      const result2 = service.generateRefreshToken('user-2');

      expect(result1.jti).not.toBe(result2.jti);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should return payload for valid refresh token', () => {
      const validPayload = {
        sub: 'user-123',
        type: 'refresh',
        jti: 'unique-jti-123',
      };

      mockJwtService.verify.mockReturnValue(validPayload);

      const result = service.verifyRefreshToken('valid-refresh-token');

      expect(result).toEqual(validPayload);
    });

    it('should throw UnauthorizedException for non-refresh token', () => {
      const accessTokenPayload = {
        sub: 'user-123',
        type: 'access',
        email: 'test@example.com',
      };

      mockJwtService.verify.mockReturnValue(accessTokenPayload);

      expect(() => service.verifyRefreshToken('access-token')).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for token without JTI', () => {
      const payloadWithoutJti = {
        sub: 'user-123',
        type: 'refresh',
        // missing jti
      };

      mockJwtService.verify.mockReturnValue(payloadWithoutJti);

      expect(() => service.verifyRefreshToken('token-without-jti')).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid token', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => service.verifyRefreshToken('invalid-token')).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const roles = [Role.TUTOR];

      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = service.generateTokenPair(userId, email, roles);

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.refreshTokenJti).toBeDefined();
    });
  });

  describe('getRefreshTokenTtl', () => {
    it('should return correct TTL for valid payload', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = {
        sub: 'user-123',
        type: 'refresh' as const,
        jti: 'jti-123',
        exp: futureExp,
      };

      const ttl = service.getRefreshTokenTtl(payload);

      // Allow 2 second tolerance for test execution time
      expect(ttl).toBeGreaterThan(3598);
      expect(ttl).toBeLessThanOrEqual(3600);
    });

    it('should return 0 for expired token', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const payload = {
        sub: 'user-123',
        type: 'refresh' as const,
        jti: 'jti-123',
        exp: pastExp,
      };

      const ttl = service.getRefreshTokenTtl(payload);

      expect(ttl).toBe(0);
    });

    it('should return 0 for payload without exp', () => {
      const payload = {
        sub: 'user-123',
        type: 'refresh' as const,
        jti: 'jti-123',
      };

      const ttl = service.getRefreshTokenTtl(payload);

      expect(ttl).toBe(0);
    });
  });

  describe('setRefreshTokenCookie', () => {
    it('should set refresh token cookie with correct options', () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const token = 'refresh-token';

      service.setRefreshTokenCookie(mockResponse, token);

      expect(mockResponse.cookie).toHaveBeenCalledWith('refresh-token', token, {
        httpOnly: true,
        secure: false, // development mode
        sameSite: 'lax',
        maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
        path: '/',
      });
    });
  });

  describe('clearAllTokenCookies', () => {
    it('should clear both auth-token and refresh-token cookies', () => {
      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      service.clearAllTokenCookies(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('auth-token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
      });
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh-token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
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
