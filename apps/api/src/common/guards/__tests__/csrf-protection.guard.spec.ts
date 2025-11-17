import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CsrfProtectionGuard } from '../csrf-protection.guard';

describe('CsrfProtectionGuard - CSRF Security', () => {
  let guard: CsrfProtectionGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsrfProtectionGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<CsrfProtectionGuard>(CsrfProtectionGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  /**
   * Helper para crear un mock ExecutionContext con request customizado
   */
  const createMockContext = (
    method: string,
    headers: Record<string, string> = {},
    isPublic = false,
  ): ExecutionContext => {
    // Mock del Reflector para manejar las dos llamadas del guard:
    // 1. REQUIRE_CSRF_KEY → retornar true (simular que endpoint tiene @RequireCsrf())
    // 2. 'isPublic' → retornar el parámetro isPublic
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key: string) => {
      if (key === 'require_csrf') {
        return true; // Simular que endpoint requiere CSRF
      }
      if (key === 'isPublic') {
        return isPublic;
      }
      return false;
    });

    return {
      switchToHttp: () => ({
        getRequest: () => ({
          method,
          url: '/api/test',
          headers,
          ip: '127.0.0.1',
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  describe('SECURITY: Métodos seguros (GET, HEAD, OPTIONS)', () => {
    it('should allow GET requests without Origin header', () => {
      const context = createMockContext('GET', {});

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow HEAD requests without Origin header', () => {
      const context = createMockContext('HEAD', {});

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow OPTIONS requests without Origin header', () => {
      const context = createMockContext('OPTIONS', {});

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('SECURITY: Métodos de modificación (POST, PUT, PATCH, DELETE)', () => {
    it('should allow POST with valid Origin', () => {
      const context = createMockContext('POST', {
        origin: 'http://localhost:3000',
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow PATCH with valid Origin', () => {
      const context = createMockContext('PATCH', {
        origin: 'http://localhost:3000',
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow PUT with valid Origin', () => {
      const context = createMockContext('PUT', {
        origin: 'http://localhost:3002',
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow DELETE with valid Origin', () => {
      const context = createMockContext('DELETE', {
        origin: 'http://localhost:3000',
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow request with valid Referer when Origin is missing', () => {
      const context = createMockContext('POST', {
        referer: 'http://localhost:3000/estudiantes',
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('SECURITY: CSRF Attack Prevention', () => {
    it('should BLOCK POST from malicious origin', () => {
      const context = createMockContext('POST', {
        origin: 'http://sitio-malo.com',
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        "Request rechazado: origin 'http://sitio-malo.com' no permitido",
      );
    });

    it('should BLOCK PATCH from malicious origin', () => {
      const context = createMockContext('PATCH', {
        origin: 'http://atacante.net',
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should BLOCK DELETE from malicious origin', () => {
      const context = createMockContext('DELETE', {
        origin: 'https://phishing-site.com',
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should BLOCK request without Origin or Referer', () => {
      const context = createMockContext('POST', {});

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Request rechazado: falta header Origin/Referer',
      );
    });

    it('should BLOCK request from localhost with different port', () => {
      const context = createMockContext('POST', {
        origin: 'http://localhost:4000', // Puerto no autorizado
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should BLOCK request from different subdomain', () => {
      const context = createMockContext('POST', {
        origin: 'http://malicious.localhost:3000',
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('REGRESSION: Normalización de origins', () => {
    it('should accept Origin with trailing slash', () => {
      const context = createMockContext('POST', {
        origin: 'http://localhost:3000/',
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should accept Referer with path', () => {
      const context = createMockContext('POST', {
        referer: 'http://localhost:3000/estudiantes/123',
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should normalize origins correctly for comparison', () => {
      // Ambos deberían ser considerados el mismo origin
      const context1 = createMockContext('POST', {
        origin: 'http://localhost:3000',
      });
      const context2 = createMockContext('POST', {
        origin: 'http://localhost:3000/',
      });
      const context3 = createMockContext('POST', {
        referer: 'http://localhost:3000/estudiantes',
      });

      expect(guard.canActivate(context1)).toBe(true);
      expect(guard.canActivate(context2)).toBe(true);
      expect(guard.canActivate(context3)).toBe(true);
    });
  });

  describe('REGRESSION: Rutas públicas', () => {
    it('should allow public routes even without Origin', () => {
      const context = createMockContext('POST', {}, true); // isPublic = true

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should verify Reflector is called to check @Public() decorator', () => {
      const context = createMockContext('POST', {
        origin: 'http://localhost:3000',
      });

      guard.canActivate(context);

      // Verificar que se llamó a getAllAndOverride con 'require_csrf' y 'isPublic'
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        'require_csrf',
        expect.any(Array),
      );
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        'isPublic',
        expect.any(Array),
      );
    });
  });

  describe('SECURITY: Case sensitivity', () => {
    it('should handle method names case-insensitively', () => {
      const contextLower = createMockContext('post', {
        origin: 'http://localhost:3000',
      });
      const contextUpper = createMockContext('POST', {
        origin: 'http://localhost:3000',
      });
      const contextMixed = createMockContext('Post', {
        origin: 'http://localhost:3000',
      });

      expect(guard.canActivate(contextLower)).toBe(true);
      expect(guard.canActivate(contextUpper)).toBe(true);
      expect(guard.canActivate(contextMixed)).toBe(true);
    });
  });
});
