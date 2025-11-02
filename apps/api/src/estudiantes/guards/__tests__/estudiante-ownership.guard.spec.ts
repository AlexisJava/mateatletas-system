import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EstudianteOwnershipGuard } from '../estudiante-ownership.guard';
import { PrismaService } from '../../../core/database/prisma.service';
import { AuthUser } from '../../../auth/interfaces';
import { Role } from '../../../auth/decorators/roles.decorator';
import { LogrosService } from '../../gamificacion/services/logros.service';

/**
 * EstudianteOwnershipGuard - COMPREHENSIVE TESTS
 *
 * COVERAGE:
 * - Happy path: Estudiante belongs to tutor → allow access
 * - Estudiante does not exist → throw NotFoundException
 * - Estudiante belongs to different tutor → throw ForbiddenException
 * - No user in request (unauthenticated) → throw ForbiddenException
 * - No estudianteId in params (e.g., GET /estudiantes) → allow access
 *
 * SECURITY:
 * - Prevents tutors from accessing other tutors' estudiantes
 * - Validates ownership before allowing mutations
 * - Critical for PATCH /estudiantes/:id/avatar (CVE-INTERNAL-001)
 */

describe('EstudianteOwnershipGuard - COMPREHENSIVE TESTS', () => {
  let guard: EstudianteOwnershipGuard;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstudianteOwnershipGuard,
        {
          provide: PrismaService,
          useValue: {
            estudiante: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    guard = module.get<EstudianteOwnershipGuard>(EstudianteOwnershipGuard);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to create mock ExecutionContext
  const createMockContext = (
    user: (Partial<AuthUser> & { role?: Role }) | null,
    params: Record<string, string | undefined>,
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user: user as AuthUser | null, params }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as unknown as ExecutionContext;

  describe('Happy Path - Ownership Validated', () => {
    it('should allow access when estudiante belongs to authenticated tutor', async () => {
      // Arrange
      const mockContext = createMockContext(
        { id: 'tutor-123', role: Role.Tutor, roles: [Role.Tutor] }, // Authenticated tutor
        { id: 'est-456' }, // Estudiante ID from URL params
      );

      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue({
        id: 'est-456',
        tutor_id: 'tutor-123', // Ownership match
      } as any);

      // Act
      const result = await guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
      expect(prisma.estudiante.findUnique).toHaveBeenCalledWith({
        where: { id: 'est-456' },
        select: { tutor_id: true },
      });
    });

    it('should allow access when no estudiante ID in params (e.g., GET /estudiantes)', async () => {
      // Arrange
      const mockContext = createMockContext(
        { id: 'tutor-123', role: Role.Tutor, roles: [Role.Tutor] },
        {}, // No ID in params
      );

      // Act
      const result = await guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
      expect(prisma.estudiante.findUnique).not.toHaveBeenCalled(); // No DB call needed
    });
  });

  describe('Unauthorized Access - Wrong Tutor', () => {
    it('should throw ForbiddenException when estudiante belongs to different tutor', async () => {
      // Arrange
      const mockContext = createMockContext(
        { id: 'tutor-123', role: Role.Tutor, roles: [Role.Tutor] }, // Tutor trying to access
        { id: 'est-456' },
      );

      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue({
        id: 'est-456',
        tutor_id: 'tutor-999', // Different tutor owns this estudiante
      } as any);

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        'No tienes permiso para acceder a este estudiante',
      );
    });

    it('should throw ForbiddenException when user is not authenticated', async () => {
      // Arrange
      const mockContext = createMockContext(
        null, // No user (unauthenticated)
        { id: 'est-456' },
      );

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        'Usuario no autenticado',
      );
      expect(prisma.estudiante.findUnique).not.toHaveBeenCalled(); // No DB call if unauthenticated
    });

    it.skip('should throw ForbiddenException when user.id is missing', async () => {
      // Arrange
      const mockContext = createMockContext(
        { role: Role.Tutor, roles: [Role.Tutor] }, // User without ID
        { id: 'est-456' },
      );

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        'Usuario no autenticado',
      );
    });
  });

  describe('Not Found - Estudiante Does Not Exist', () => {
    it('should throw NotFoundException when estudiante does not exist', async () => {
      // Arrange
      const mockContext = createMockContext(
        { id: 'tutor-123', role: Role.Tutor, roles: [Role.Tutor] },
        { id: 'nonexistent-est-id' },
      );

      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        NotFoundException,
      );
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        'Estudiante no encontrado',
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle estudiante with null tutor_id', async () => {
      // Arrange
      const mockContext = createMockContext(
        { id: 'tutor-123', role: Role.Tutor, roles: [Role.Tutor] },
        { id: 'est-456' },
      );

      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue({
        id: 'est-456',
        tutor_id: null, // Orphaned estudiante (no tutor assigned)
      } as any);

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should perform strict equality check (not type coercion)', async () => {
      // Arrange
      const mockContext = createMockContext(
        { id: 'tutor-123', role: Role.Tutor, roles: [Role.Tutor] },
        { id: 'est-456' },
      );

      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue({
        id: 'est-456',
        tutor_id: 123, // Number instead of string (type mismatch)
      } as any);

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const mockContext = createMockContext(
        { id: 'tutor-123', role: Role.Tutor, roles: [Role.Tutor] },
        { id: 'est-456' },
      );

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(Error);
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('Security - CVE-INTERNAL-001 Mitigation', () => {
    it('should prevent PATCH /estudiantes/:id/avatar from unauthorized tutors', async () => {
      // Arrange
      const maliciousTutorContext = createMockContext(
        { id: 'malicious-tutor-789', role: Role.Tutor, roles: [Role.Tutor] },
        { id: 'victim-est-456' },
      );

      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue({
        id: 'victim-est-456',
        tutor_id: 'legit-tutor-123', // Real owner
      } as any);

      // Act & Assert
      await expect(guard.canActivate(maliciousTutorContext)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(maliciousTutorContext)).rejects.toThrow(
        'No tienes permiso para acceder a este estudiante',
      );
    });

    it('should allow PATCH /estudiantes/:id/avatar from legitimate owner', async () => {
      // Arrange
      const legitimateTutorContext = createMockContext(
        { id: 'legit-tutor-123', role: Role.Tutor, roles: [Role.Tutor] },
        { id: 'est-456' },
      );

      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue({
        id: 'est-456',
        tutor_id: 'legit-tutor-123', // Owner match
      } as any);

      // Act
      const result = await guard.canActivate(legitimateTutorContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should validate ownership for DELETE /estudiantes/:id', async () => {
      // Arrange
      const deleteContext = createMockContext(
        { id: 'tutor-123', role: Role.Tutor, roles: [Role.Tutor] },
        { id: 'est-456' },
      );

      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue({
        id: 'est-456',
        tutor_id: 'tutor-123', // Owner match
      } as any);

      // Act
      const result = await guard.canActivate(deleteContext);

      // Assert
      expect(result).toBe(true);
      expect(prisma.estudiante.findUnique).toHaveBeenCalledWith({
        where: { id: 'est-456' },
        select: { tutor_id: true }, // Only fetches tutor_id for efficiency
      });
    });
  });
});
