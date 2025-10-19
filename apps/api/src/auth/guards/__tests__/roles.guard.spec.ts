import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../roles.guard';
import { Role } from '../../decorators/roles.decorator';

/**
 * RolesGuard - COMPREHENSIVE TESTS
 *
 * COVERAGE:
 * - No required roles → allow access
 * - User with matching role → allow access
 * - User with multiple roles, one matches → allow access
 * - User without matching role → deny access
 * - No user in request → deny access
 * - User without roles → deny access
 * - Legacy single role support (user.role) → allow access
 *
 * SECURITY:
 * - Validates ROLES_KEY metadata correctly
 * - Supports multi-role users (user.roles array)
 * - Backward compatible with single role (user.role)
 */

describe('RolesGuard - COMPREHENSIVE TESTS', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  // Helper function to create mock ExecutionContext
  const createMockContext = (user: any): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as any);

  describe('No Required Roles', () => {
    it('should allow access when no roles are required', () => {
      // Arrange
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const mockContext = createMockContext({ id: 'user-123', role: 'tutor' });

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should allow access when required roles array is empty', () => {
      // Arrange
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
      const mockContext = createMockContext({ id: 'user-123', role: 'tutor' });

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('User with Matching Roles', () => {
    it('should allow access when user has exact matching role (multi-role user)', () => {
      // Arrange
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);
      const mockContext = createMockContext({
        id: 'user-123',
        roles: ['admin', 'docente'],
      });

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should allow access when user has one of multiple required roles', () => {
      // Arrange
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin, Role.Docente]);
      const mockContext = createMockContext({
        id: 'user-123',
        roles: ['docente'], // User has docente, which is one of the required roles
      });

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should allow access when user has multiple roles and one matches', () => {
      // Arrange
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Tutor]);
      const mockContext = createMockContext({
        id: 'user-123',
        roles: ['tutor', 'estudiante'], // User has multiple roles, one matches
      });

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should support legacy single role format (user.role instead of user.roles)', () => {
      // Arrange
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Tutor]);
      const mockContext = createMockContext({
        id: 'user-123',
        role: 'tutor', // Legacy format: single role, not array
      });

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('User without Matching Roles', () => {
    it('should deny access when user role does not match required role', () => {
      // Arrange
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);
      const mockContext = createMockContext({
        id: 'user-123',
        roles: ['tutor'], // User is tutor, but admin is required
      });

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(false);
    });

    it('should deny access when user has multiple roles but none match', () => {
      // Arrange
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);
      const mockContext = createMockContext({
        id: 'user-123',
        roles: ['tutor', 'estudiante'], // User has multiple roles, but none is admin
      });

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(false);
    });

    it('should deny access when user has no roles property', () => {
      // Arrange
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);
      const mockContext = createMockContext({
        id: 'user-123',
        // No roles or role property
      });

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(false);
    });

    it('should deny access when user.roles is empty array', () => {
      // Arrange
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);
      const mockContext = createMockContext({
        id: 'user-123',
        roles: [], // Empty roles array
      });

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('No User in Request', () => {
    it('should deny access when user is not in request', () => {
      // Arrange
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Tutor]);
      const mockContext = createMockContext(null); // No user

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(false);
    });

    it('should deny access when user is undefined', () => {
      // Arrange
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Tutor]);
      const mockContext = createMockContext(undefined);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle case-sensitive role comparison correctly', () => {
      // Arrange
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);
      const mockContext = createMockContext({
        id: 'user-123',
        roles: ['Admin'], // Uppercase 'A' - should NOT match 'admin'
      });

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(false); // Case-sensitive comparison should fail
    });

    it('should handle user with both role and roles properties (prefer roles array)', () => {
      // Arrange
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);
      const mockContext = createMockContext({
        id: 'user-123',
        role: 'tutor', // Legacy single role
        roles: ['admin'], // Modern roles array - should take precedence
      });

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true); // Should use roles array, not role
    });

    it('should correctly validate against multiple required roles', () => {
      // Arrange
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
        Role.Admin,
        Role.Docente,
        Role.Tutor,
      ]);
      const mockContext = createMockContext({
        id: 'user-123',
        roles: ['tutor'], // User only has tutor, which is one of the three required
      });

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true); // User needs AL MENOS UNO de los roles requeridos
    });
  });

  describe('Reflector Integration', () => {
    it('should call reflector.getAllAndOverride with correct parameters', () => {
      // Arrange
      const getAllAndOverrideSpy = jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
      const mockContext = createMockContext({ id: 'user-123', roles: ['tutor'] });

      // Act
      guard.canActivate(mockContext);

      // Assert
      expect(getAllAndOverrideSpy).toHaveBeenCalledWith('roles', [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });
  });
});
