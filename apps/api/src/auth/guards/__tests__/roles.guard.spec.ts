import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../roles.guard';
import {
  Role,
  ROLES_KEY,
  EXACT_ROLES_KEY,
} from '../../decorators/roles.decorator';
import { AuthUser } from '../../interfaces';

/**
 * RolesGuard - COMPREHENSIVE TESTS
 *
 * COVERAGE:
 * - @Roles (hierarchical):
 *   - No required roles → allow access
 *   - User with matching role → allow access
 *   - User with higher role (hierarchy) → allow access
 *   - User with lower role → deny access
 *   - No user in request → deny access
 *
 * - @ExactRoles (no hierarchy):
 *   - Exact role match → allow access
 *   - Higher role in hierarchy → deny access (no hierarchy!)
 *   - Lower role → deny access
 *
 * SECURITY:
 * - Validates ROLES_KEY and EXACT_ROLES_KEY metadata correctly
 * - ExactRoles takes priority over Roles
 * - Supports multi-role users (user.roles array)
 * - Backward compatible with single role (user.role)
 */

describe('RolesGuard - COMPREHENSIVE TESTS', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  // Track mock return values for each key
  let mockRolesKeyValue: Role[] | undefined;
  let mockExactRolesKeyValue: Role[] | undefined;

  beforeEach(async () => {
    mockRolesKeyValue = undefined;
    mockExactRolesKeyValue = undefined;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn((key: string) => {
              if (key === EXACT_ROLES_KEY) {
                return mockExactRolesKeyValue;
              }
              if (key === ROLES_KEY) {
                return mockRolesKeyValue;
              }
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  // Helper function to create mock ExecutionContext
  const createMockContext = (
    user: (Partial<AuthUser> & { role?: Role }) | null,
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user: user as AuthUser | null }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as unknown as ExecutionContext;

  // ============================================================================
  // @Roles() - HIERARCHICAL TESTS
  // ============================================================================

  describe('@Roles() - Hierarchical Access', () => {
    describe('No Required Roles', () => {
      it('should allow access when no roles are required', () => {
        mockRolesKeyValue = undefined;
        mockExactRolesKeyValue = undefined;
        const mockContext = createMockContext({
          id: 'user-123',
          role: Role.TUTOR,
          roles: [Role.TUTOR],
        });

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });

      it('should allow access when required roles array is empty', () => {
        mockRolesKeyValue = [];
        mockExactRolesKeyValue = undefined;
        const mockContext = createMockContext({
          id: 'user-123',
          role: Role.TUTOR,
          roles: [Role.TUTOR],
        });

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });
    });

    describe('Hierarchy: Higher roles can access lower role endpoints', () => {
      it('should allow ADMIN to access DOCENTE endpoints (hierarchy)', () => {
        mockRolesKeyValue = [Role.DOCENTE];
        mockExactRolesKeyValue = undefined;
        const mockContext = createMockContext({
          id: 'user-123',
          roles: [Role.ADMIN],
        });

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });

      it('should allow DOCENTE to access ESTUDIANTE endpoints (hierarchy)', () => {
        mockRolesKeyValue = [Role.ESTUDIANTE];
        mockExactRolesKeyValue = undefined;
        const mockContext = createMockContext({
          id: 'user-123',
          roles: [Role.DOCENTE],
        });

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });

      it('should allow SUPER_ADMIN to access any endpoint (hierarchy)', () => {
        mockRolesKeyValue = [Role.ESTUDIANTE];
        mockExactRolesKeyValue = undefined;
        const mockContext = createMockContext({
          id: 'user-123',
          roles: [Role.SUPER_ADMIN],
        });

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });

      it('should deny ESTUDIANTE access to ADMIN endpoints (hierarchy)', () => {
        mockRolesKeyValue = [Role.ADMIN];
        mockExactRolesKeyValue = undefined;
        const mockContext = createMockContext({
          id: 'user-123',
          roles: [Role.ESTUDIANTE],
        });

        const result = guard.canActivate(mockContext);

        expect(result).toBe(false);
      });

      it('should deny TUTOR access to DOCENTE endpoints (hierarchy)', () => {
        mockRolesKeyValue = [Role.DOCENTE];
        mockExactRolesKeyValue = undefined;
        const mockContext = createMockContext({
          id: 'user-123',
          roles: [Role.TUTOR],
        });

        const result = guard.canActivate(mockContext);

        expect(result).toBe(false);
      });
    });

    describe('User with Matching Roles', () => {
      it('should allow access when user has exact matching role', () => {
        mockRolesKeyValue = [Role.ADMIN];
        mockExactRolesKeyValue = undefined;
        const mockContext = createMockContext({
          id: 'user-123',
          role: Role.ADMIN,
          roles: [Role.ADMIN, Role.DOCENTE],
        });

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });

      it('should allow access when user has one of multiple required roles', () => {
        mockRolesKeyValue = [Role.ADMIN, Role.DOCENTE];
        mockExactRolesKeyValue = undefined;
        const mockContext = createMockContext({
          id: 'user-123',
          role: Role.DOCENTE,
          roles: [Role.DOCENTE],
        });

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });

      it('should support legacy single role format (user.role)', () => {
        mockRolesKeyValue = [Role.TUTOR];
        mockExactRolesKeyValue = undefined;
        const mockContext = createMockContext({
          id: 'user-123',
          role: Role.TUTOR,
        });

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });
    });

    describe('User without Matching Roles', () => {
      it('should deny access when user has no roles property', () => {
        mockRolesKeyValue = [Role.ADMIN];
        mockExactRolesKeyValue = undefined;
        const mockContext = createMockContext({
          id: 'user-123',
        });

        const result = guard.canActivate(mockContext);

        expect(result).toBe(false);
      });

      it('should deny access when user.roles is empty array', () => {
        mockRolesKeyValue = [Role.ADMIN];
        mockExactRolesKeyValue = undefined;
        const mockContext = createMockContext({
          id: 'user-123',
          roles: [],
        });

        const result = guard.canActivate(mockContext);

        expect(result).toBe(false);
      });
    });

    describe('No User in Request', () => {
      it('should deny access when user is not in request', () => {
        mockRolesKeyValue = [Role.TUTOR];
        mockExactRolesKeyValue = undefined;
        const mockContext = createMockContext(null);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(false);
      });

      it('should deny access when user is undefined', () => {
        mockRolesKeyValue = [Role.TUTOR];
        mockExactRolesKeyValue = undefined;
        const mockContext = createMockContext(
          undefined as unknown as Partial<AuthUser>,
        );

        const result = guard.canActivate(mockContext);

        expect(result).toBe(false);
      });
    });
  });

  // ============================================================================
  // @ExactRoles() - NO HIERARCHY TESTS
  // ============================================================================

  describe('@ExactRoles() - No Hierarchy (Exact Match Only)', () => {
    describe('Exact Match Required', () => {
      it('should allow access when user has exact matching role', () => {
        mockExactRolesKeyValue = [Role.ESTUDIANTE];
        mockRolesKeyValue = undefined;
        const mockContext = createMockContext({
          id: 'user-123',
          roles: [Role.ESTUDIANTE],
        });

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });

      it('should allow access when user has one of multiple exact roles', () => {
        mockExactRolesKeyValue = [Role.ESTUDIANTE, Role.TUTOR];
        mockRolesKeyValue = undefined;
        const mockContext = createMockContext({
          id: 'user-123',
          roles: [Role.TUTOR],
        });

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });
    });

    describe('Higher Roles CANNOT Access (No Hierarchy)', () => {
      it('should DENY DOCENTE access to ESTUDIANTE-only endpoint', () => {
        mockExactRolesKeyValue = [Role.ESTUDIANTE];
        mockRolesKeyValue = undefined;
        const mockContext = createMockContext({
          id: 'user-123',
          roles: [Role.DOCENTE],
        });

        const result = guard.canActivate(mockContext);

        expect(result).toBe(false);
      });

      it('should DENY ADMIN access to ESTUDIANTE-only endpoint', () => {
        mockExactRolesKeyValue = [Role.ESTUDIANTE];
        mockRolesKeyValue = undefined;
        const mockContext = createMockContext({
          id: 'user-123',
          roles: [Role.ADMIN],
        });

        const result = guard.canActivate(mockContext);

        expect(result).toBe(false);
      });

      it('should DENY SUPER_ADMIN access to ESTUDIANTE-only endpoint', () => {
        mockExactRolesKeyValue = [Role.ESTUDIANTE];
        mockRolesKeyValue = undefined;
        const mockContext = createMockContext({
          id: 'user-123',
          roles: [Role.SUPER_ADMIN],
        });

        const result = guard.canActivate(mockContext);

        expect(result).toBe(false);
      });

      it('should DENY ADMIN access to DOCENTE-only endpoint', () => {
        mockExactRolesKeyValue = [Role.DOCENTE];
        mockRolesKeyValue = undefined;
        const mockContext = createMockContext({
          id: 'user-123',
          roles: [Role.ADMIN],
        });

        const result = guard.canActivate(mockContext);

        expect(result).toBe(false);
      });
    });

    describe('Lower Roles Cannot Access', () => {
      it('should deny ESTUDIANTE access to DOCENTE-only endpoint', () => {
        mockExactRolesKeyValue = [Role.DOCENTE];
        mockRolesKeyValue = undefined;
        const mockContext = createMockContext({
          id: 'user-123',
          roles: [Role.ESTUDIANTE],
        });

        const result = guard.canActivate(mockContext);

        expect(result).toBe(false);
      });
    });
  });

  // ============================================================================
  // PRIORITY: @ExactRoles takes precedence over @Roles
  // ============================================================================

  describe('Priority: @ExactRoles takes precedence over @Roles', () => {
    it('should use ExactRoles when both are defined (ExactRoles wins)', () => {
      // Both decorators present, ExactRoles requires ESTUDIANTE
      mockExactRolesKeyValue = [Role.ESTUDIANTE];
      mockRolesKeyValue = [Role.ESTUDIANTE]; // Would allow ADMIN via hierarchy
      const mockContext = createMockContext({
        id: 'user-123',
        roles: [Role.ADMIN], // ADMIN would pass @Roles but NOT @ExactRoles
      });

      const result = guard.canActivate(mockContext);

      expect(result).toBe(false); // ExactRoles takes priority, denies ADMIN
    });

    it('should allow when ExactRoles matches, ignoring Roles', () => {
      mockExactRolesKeyValue = [Role.ESTUDIANTE];
      mockRolesKeyValue = [Role.ADMIN]; // Different from ExactRoles
      const mockContext = createMockContext({
        id: 'user-123',
        roles: [Role.ESTUDIANTE],
      });

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true); // ExactRoles matches
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle case-insensitive role comparison (normalizes to uppercase)', () => {
      mockRolesKeyValue = [Role.ADMIN];
      mockExactRolesKeyValue = undefined;
      const mockContext = createMockContext({
        id: 'user-123',
        roles: ['admin' as unknown as Role],
      });

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should handle user with both role and roles properties (prefer roles array)', () => {
      mockRolesKeyValue = [Role.ADMIN];
      mockExactRolesKeyValue = undefined;
      const mockContext = createMockContext({
        id: 'user-123',
        role: Role.TUTOR,
        roles: [Role.ADMIN],
      });

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should correctly validate against multiple required roles', () => {
      mockRolesKeyValue = [Role.ADMIN, Role.DOCENTE, Role.TUTOR];
      mockExactRolesKeyValue = undefined;
      const mockContext = createMockContext({
        id: 'user-123',
        roles: [Role.TUTOR],
      });

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });
  });

  // ============================================================================
  // REFLECTOR INTEGRATION
  // ============================================================================

  describe('Reflector Integration', () => {
    it('should call reflector.getAllAndOverride for both keys', () => {
      const getAllAndOverrideSpy = jest.spyOn(reflector, 'getAllAndOverride');
      mockRolesKeyValue = [];
      mockExactRolesKeyValue = undefined;
      const mockContext = createMockContext({
        id: 'user-123',
        roles: [Role.TUTOR],
      });

      guard.canActivate(mockContext);

      // Should check ExactRoles first, then Roles
      expect(getAllAndOverrideSpy).toHaveBeenCalledWith(EXACT_ROLES_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
      expect(getAllAndOverrideSpy).toHaveBeenCalledWith(ROLES_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });
  });
});
