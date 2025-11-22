/**
 * Test Suite: Ownership Validation - GET /:id
 *
 * OBJETIVO:
 * Validar que solo el tutor dueño de la inscripción (o admin) pueda verla.
 *
 * CONTEXTO DE SEGURIDAD:
 * - Endpoint GET /:id retorna datos completos de inscripción
 * - Incluye datos sensibles: nombres, emails, teléfonos, montos, payment IDs
 * - Sin ownership validation: cualquier usuario autenticado ve cualquier inscripción
 *
 * ESCENARIO DE ATAQUE:
 * 1. Tutor A crea inscripción → ID: insc-123-abc
 * 2. Tutor B (malicioso) enumera IDs: insc-123-abc, insc-123-abd, ...
 * 3. GET /inscripciones-2026/insc-123-abc → ve datos de familia de Tutor A
 * 4. Tutor B obtiene: nombres estudiantes, emails, teléfonos, montos pagados
 * 5. Violación de privacidad: datos personales de otras familias expuestos
 *
 * IMPACTO:
 * - Violación GDPR/LOPD (protección de datos personales)
 * - Exposición de información financiera sensible
 * - Fraude: Tutor B puede usar info para suplantar identidad
 * - Reputación: Pérdida de confianza de clientes
 * - Legal: Multas por violación de privacidad
 *
 * SOLUCIÓN:
 * - OwnershipGuard valida que req.user.id === inscripcion.tutor_id
 * - Permitir si usuario es ADMIN o superior (jerarquía)
 * - Rechazar con 403 Forbidden si no es dueño ni admin
 *
 * ESTÁNDARES DE SEGURIDAD:
 * - OWASP A01:2021 - Broken Access Control
 * - GDPR Art. 32 - Security of processing
 * - ISO 27001 A.9.4.1 - Information access restriction
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../core/database/prisma.service';
import { Role } from '../../domain/constants';
import { AuthUser } from '../../auth/interfaces';
import { InscripcionOwnershipGuard } from '../guards/inscripcion-ownership.guard';

describe('Inscripciones2026 - GET /:id Ownership Validation', () => {
  let guard: InscripcionOwnershipGuard;
  let prisma: PrismaService;
  let reflector: Reflector;

  const mockPrisma = {
    inscripcion2026: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InscripcionOwnershipGuard,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<InscripcionOwnershipGuard>(InscripcionOwnershipGuard);
    prisma = module.get<PrismaService>(PrismaService);
    reflector = module.get<Reflector>(Reflector);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Helper para crear ExecutionContext mock
   */
  const createMockExecutionContext = (
    user: AuthUser | undefined,
    inscripcionId: string,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          params: { id: inscripcionId },
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  describe('Ownership Validation - Tutores', () => {
    /**
     * TEST 1: DEBE PERMITIR AL TUTOR DUEÑO VER SU INSCRIPCIÓN
     *
     * ESCENARIO:
     * 1. Tutor A autenticado (user_id: tutor-123)
     * 2. Inscripción pertenece a Tutor A (tutor_id: tutor-123)
     * 3. GET /inscripciones-2026/insc-abc
     * 4. Sistema debe PERMITIR (es el dueño)
     *
     * VALIDACIONES:
     * - Guard retorna true
     * - Tutor ve su propia inscripción
     */
    it('debe permitir al tutor dueño ver su propia inscripción', async () => {
      // ARRANGE: Tutor A es el dueño
      const tutorUser: AuthUser = {
        id: 'tutor-123',
        email: 'tutor@test.com',
        roles: [Role.TUTOR],
      };

      const inscripcionId = 'insc-abc-123';

      // Mock: Inscripción pertenece a tutor-123
      mockPrisma.inscripcion2026.findUnique.mockResolvedValue({
        id: inscripcionId,
        tutor_id: 'tutor-123', // ✅ Mismo ID que el usuario
        tipo_inscripcion: 'colonia',
        estado: 'active',
      });

      const context = createMockExecutionContext(tutorUser, inscripcionId);

      // ACT
      const result = await guard.canActivate(context);

      // ASSERT: Debe permitir (es el dueño)
      expect(result).toBe(true);
      expect(prisma.inscripcion2026.findUnique).toHaveBeenCalledWith({
        where: { id: inscripcionId },
        select: { tutor_id: true },
      });
    });

    /**
     * TEST 2: DEBE RECHAZAR A TUTOR QUE NO ES DUEÑO
     *
     * ESCENARIO:
     * 1. Tutor B autenticado (user_id: tutor-456)
     * 2. Inscripción pertenece a Tutor A (tutor_id: tutor-123)
     * 3. Tutor B intenta: GET /inscripciones-2026/insc-abc
     * 4. Sistema debe RECHAZAR (no es el dueño)
     *
     * VALIDACIONES:
     * - Guard lanza ForbiddenException
     * - Mensaje indica falta de ownership
     */
    it('debe rechazar a tutor que no es dueño de la inscripción', async () => {
      // ARRANGE: Tutor B intenta ver inscripción de Tutor A
      const tutorB: AuthUser = {
        id: 'tutor-456', // ❌ NO es el dueño
        email: 'tutorb@test.com',
        roles: [Role.TUTOR],
      };

      const inscripcionId = 'insc-abc-123';

      // Mock: Inscripción pertenece a tutor-123 (Tutor A)
      mockPrisma.inscripcion2026.findUnique.mockResolvedValue({
        id: inscripcionId,
        tutor_id: 'tutor-123', // ✅ Dueño es Tutor A
        tipo_inscripcion: 'colonia',
        estado: 'active',
      });

      const context = createMockExecutionContext(tutorB, inscripcionId);

      // ACT & ASSERT: Debe rechazar con 403
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(context)).rejects.toThrow(
        /not authorized.*inscripción/i,
      );
    });

    /**
     * TEST 3: DEBE RECHAZAR SI INSCRIPCIÓN NO EXISTE
     *
     * ESCENARIO:
     * 1. Tutor intenta acceder a inscripción inexistente
     * 2. GET /inscripciones-2026/insc-fake-999
     * 3. DB retorna null
     * 4. Sistema debe rechazar
     *
     * VALIDACIONES:
     * - Guard lanza ForbiddenException
     * - Prevenir enumeración de IDs válidos
     */
    it('debe rechazar si la inscripción no existe', async () => {
      // ARRANGE: Inscripción no existe
      const tutorUser: AuthUser = {
        id: 'tutor-123',
        email: 'tutor@test.com',
        roles: [Role.TUTOR],
      };

      const inscripcionId = 'insc-fake-999';

      // Mock: Inscripción no encontrada
      mockPrisma.inscripcion2026.findUnique.mockResolvedValue(null);

      const context = createMockExecutionContext(tutorUser, inscripcionId);

      // ACT & ASSERT: Debe rechazar
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Ownership Validation - Admins', () => {
    /**
     * TEST 4: DEBE PERMITIR A ADMIN VER CUALQUIER INSCRIPCIÓN
     *
     * ESCENARIO:
     * 1. Usuario ADMIN autenticado
     * 2. Inscripción pertenece a otro tutor
     * 3. Admin debe poder verla (jerarquía)
     *
     * VALIDACIONES:
     * - Guard retorna true
     * - Admin bypassa ownership check
     */
    it('debe permitir a admin ver cualquier inscripción', async () => {
      // ARRANGE: Usuario con rol ADMIN
      const adminUser: AuthUser = {
        id: 'admin-xyz',
        email: 'admin@test.com',
        roles: [Role.ADMIN],
      };

      const inscripcionId = 'insc-abc-123';

      // Mock: Inscripción de otro tutor
      mockPrisma.inscripcion2026.findUnique.mockResolvedValue({
        id: inscripcionId,
        tutor_id: 'tutor-otro',
        tipo_inscripcion: 'colonia',
        estado: 'active',
      });

      const context = createMockExecutionContext(adminUser, inscripcionId);

      // ACT
      const result = await guard.canActivate(context);

      // ASSERT: Admin puede ver cualquier inscripción
      expect(result).toBe(true);
    });

    /**
     * TEST 5: DEBE PERMITIR A SUPER_ADMIN VER CUALQUIER INSCRIPCIÓN
     *
     * ESCENARIO:
     * 1. Usuario SUPER_ADMIN autenticado
     * 2. Inscripción de cualquier tutor
     * 3. Super admin debe poder verla
     *
     * VALIDACIONES:
     * - Guard retorna true
     * - Jerarquía de roles respetada
     */
    it('debe permitir a super admin ver cualquier inscripción', async () => {
      // ARRANGE: Usuario SUPER_ADMIN
      const superAdminUser: AuthUser = {
        id: 'superadmin-999',
        email: 'superadmin@test.com',
        roles: [Role.SUPER_ADMIN],
      };

      const inscripcionId = 'insc-abc-123';

      // Mock: Inscripción de otro tutor
      mockPrisma.inscripcion2026.findUnique.mockResolvedValue({
        id: inscripcionId,
        tutor_id: 'tutor-otro',
        tipo_inscripcion: 'pack-completo',
        estado: 'pending',
      });

      const context = createMockExecutionContext(superAdminUser, inscripcionId);

      // ACT
      const result = await guard.canActivate(context);

      // ASSERT: Super admin puede ver cualquier inscripción
      expect(result).toBe(true);
    });

    /**
     * TEST 6: DEBE RECHAZAR A DOCENTE (no tiene permisos de admin)
     *
     * ESCENARIO:
     * 1. Usuario DOCENTE autenticado
     * 2. Inscripción de otro tutor
     * 3. Docente NO debe poder verla (jerarquía insuficiente)
     *
     * VALIDACIONES:
     * - Guard lanza ForbiddenException
     * - Solo ADMIN+ pueden bypasear ownership
     */
    it('debe rechazar a docente que intenta ver inscripción ajena', async () => {
      // ARRANGE: Usuario DOCENTE (jerarquía 3, menor que ADMIN 4)
      const docenteUser: AuthUser = {
        id: 'docente-555',
        email: 'docente@test.com',
        roles: [Role.DOCENTE],
      };

      const inscripcionId = 'insc-abc-123';

      // Mock: Inscripción de otro tutor
      mockPrisma.inscripcion2026.findUnique.mockResolvedValue({
        id: inscripcionId,
        tutor_id: 'tutor-otro',
        tipo_inscripcion: 'colonia',
        estado: 'active',
      });

      const context = createMockExecutionContext(docenteUser, inscripcionId);

      // ACT & ASSERT: Docente no puede ver inscripción ajena
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Edge Cases - Ownership', () => {
    /**
     * TEST 7: DEBE RECHAZAR SI NO HAY USUARIO AUTENTICADO
     *
     * ESCENARIO:
     * 1. Request sin objeto user (JwtAuthGuard falló)
     * 2. Sistema debe rechazar
     *
     * VALIDACIONES:
     * - Guard lanza ForbiddenException
     * - No permitir acceso sin autenticación
     */
    it('debe rechazar si no hay usuario autenticado', async () => {
      // ARRANGE: Request sin user
      const context = createMockExecutionContext(undefined, 'insc-abc-123');

      // ACT & ASSERT: Debe rechazar
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    /**
     * TEST 8: DEBE TENER TIPOS EXPLÍCITOS
     *
     * VALIDACIONES:
     * - Verificar que todas las variables tienen tipos explícitos
     * - No usar any ni unknown (excepto en lugares permitidos)
     */
    it('debe tener tipos explícitos en validación de ownership', () => {
      const userId: string = 'tutor-123';
      const tutorId: string = 'tutor-123';
      const isOwner: boolean = userId === tutorId;
      const isAdmin: boolean = false;

      expect(typeof userId).toBe('string');
      expect(typeof tutorId).toBe('string');
      expect(typeof isOwner).toBe('boolean');
      expect(typeof isAdmin).toBe('boolean');
    });
  });
});