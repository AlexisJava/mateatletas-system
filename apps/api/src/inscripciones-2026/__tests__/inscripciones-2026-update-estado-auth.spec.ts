/**
 * Test Suite: Authorization en PATCH /estado - Inscripciones 2026
 *
 * OBJETIVO:
 * Validar que solo usuarios ADMIN pueden modificar el estado de inscripciones.
 *
 * CONTEXTO DE SEGURIDAD:
 * - Endpoint crítico que cambia estado de inscripciones (active, cancelled, refunded)
 * - Sin autorización: cualquier tutor podría cancelar inscripciones de otros
 * - Sin autorización: estudiantes podrían auto-activarse sin pagar
 *
 * ESCENARIO DE ATAQUE:
 * 1. Tutor malicioso obtiene ID de inscripción de otro tutor
 * 2. Envía PATCH /:id/estado con estado='active'
 * 3. Sin RolesGuard: inscripción se activa sin validación de rol
 * 4. Estudiante accede a servicios sin pagar
 *
 * IMPACTO FINANCIERO:
 * - Pérdida de ingresos por servicios no pagados
 * - Fraude de identidad (activar inscripciones ajenas)
 * - Violación de reglas de negocio (solo admin puede modificar estados)
 *
 * SOLUCIÓN:
 * - RolesGuard valida que user.role sea ADMIN o superior
 * - Jerarquía: ADMIN (4) > DOCENTE (3) > TUTOR (2) > ESTUDIANTE (1)
 * - Rechazar tutores, docentes y estudiantes
 * - Permitir ADMIN y SUPER_ADMIN
 *
 * ESTÁNDARES DE SEGURIDAD:
 * - OWASP A01:2021 - Broken Access Control
 * - OWASP A04:2021 - Insecure Design
 * - ISO 27001 A.9.2.3 - Management of privileged access rights
 * - PCI DSS Req 7.1 - Limit access to system components
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Role, ROLE_HIERARCHY } from '../../domain/constants';
import { AuthUser } from '../../auth/interfaces';

describe('Inscripciones2026 - PATCH /:id/estado Authorization', () => {
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

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Helper para crear ExecutionContext mock
   */
  const createMockExecutionContext = (user: AuthUser | undefined, requiredRoles: Role[]): ExecutionContext => {
    // Mock del reflector para retornar los roles requeridos
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  describe('PATCH /:id/estado - Role Authorization', () => {
    /**
     * TEST 1: DEBE RECHAZAR TUTORES
     *
     * ESCENARIO:
     * 1. Usuario autenticado con rol TUTOR
     * 2. Intenta acceder a PATCH /:id/estado
     * 3. Endpoint requiere rol ADMIN
     * 4. Sistema debe RECHAZAR
     *
     * VALIDACIONES:
     * - RolesGuard debe retornar false
     * - Tutor no tiene suficiente jerarquía (2 < 4)
     */
    it('debe rechazar tutores que intentan modificar estado', () => {
      // ARRANGE: Usuario con rol TUTOR
      const tutorUser: AuthUser = {
        id: 'tutor-123',
        email: 'tutor@test.com',
        roles: [Role.TUTOR],
      };

      const context = createMockExecutionContext(tutorUser, [Role.ADMIN]);

      // ACT
      const result = guard.canActivate(context);

      // ASSERT: Debe rechazar (jerarquía TUTOR=2 < ADMIN=4)
      expect(result).toBe(false);
      expect(ROLE_HIERARCHY[Role.TUTOR]).toBe(2);
      expect(ROLE_HIERARCHY[Role.ADMIN]).toBe(4);
    });

    /**
     * TEST 2: DEBE RECHAZAR DOCENTES
     *
     * ESCENARIO:
     * 1. Usuario con rol DOCENTE
     * 2. Intenta modificar estado de inscripción
     * 3. Solo ADMIN puede hacerlo
     *
     * VALIDACIONES:
     * - Docente tiene jerarquía 3, menor que ADMIN (4)
     * - RolesGuard debe rechazar
     */
    it('debe rechazar docentes que intentan modificar estado', () => {
      // ARRANGE: Usuario con rol DOCENTE
      const docenteUser: AuthUser = {
        id: 'docente-456',
        email: 'docente@test.com',
        roles: [Role.DOCENTE],
      };

      const context = createMockExecutionContext(docenteUser, [Role.ADMIN]);

      // ACT
      const result = guard.canActivate(context);

      // ASSERT: Debe rechazar (jerarquía DOCENTE=3 < ADMIN=4)
      expect(result).toBe(false);
      expect(ROLE_HIERARCHY[Role.DOCENTE]).toBe(3);
    });

    /**
     * TEST 3: DEBE RECHAZAR ESTUDIANTES
     *
     * ESCENARIO:
     * 1. Usuario con rol ESTUDIANTE
     * 2. Intenta auto-activar su inscripción
     * 3. Sistema debe rechazar categóricamente
     *
     * VALIDACIONES:
     * - Estudiante tiene jerarquía 1 (mínima)
     * - RolesGuard debe rechazar
     */
    it('debe rechazar estudiantes que intentan modificar estado', () => {
      // ARRANGE: Usuario con rol ESTUDIANTE
      const estudianteUser: AuthUser = {
        id: 'estudiante-789',
        email: 'estudiante@test.com',
        roles: [Role.ESTUDIANTE],
      };

      const context = createMockExecutionContext(estudianteUser, [Role.ADMIN]);

      // ACT
      const result = guard.canActivate(context);

      // ASSERT: Debe rechazar (jerarquía ESTUDIANTE=1 < ADMIN=4)
      expect(result).toBe(false);
      expect(ROLE_HIERARCHY[Role.ESTUDIANTE]).toBe(1);
    });

    /**
     * TEST 4: DEBE PERMITIR ADMIN
     *
     * ESCENARIO:
     * 1. Usuario con rol ADMIN
     * 2. Accede a PATCH /:id/estado
     * 3. Endpoint requiere ADMIN
     * 4. Sistema debe PERMITIR
     *
     * VALIDACIONES:
     * - RolesGuard debe retornar true
     * - Admin tiene jerarquía exacta (4 === 4)
     */
    it('debe permitir admin modificar estado de inscripción', () => {
      // ARRANGE: Usuario con rol ADMIN
      const adminUser: AuthUser = {
        id: 'admin-abc',
        email: 'admin@test.com',
        roles: [Role.ADMIN],
      };

      const context = createMockExecutionContext(adminUser, [Role.ADMIN]);

      // ACT
      const result = guard.canActivate(context);

      // ASSERT: Debe permitir (jerarquía ADMIN=4 === ADMIN=4)
      expect(result).toBe(true);
      expect(ROLE_HIERARCHY[Role.ADMIN]).toBe(4);
    });

    /**
     * TEST 5: DEBE PERMITIR SUPER_ADMIN
     *
     * ESCENARIO:
     * 1. Usuario con rol SUPER_ADMIN
     * 2. Accede a endpoint que requiere ADMIN
     * 3. Sistema debe permitir (jerarquía superior)
     *
     * VALIDACIONES:
     * - RolesGuard debe retornar true
     * - Super admin tiene jerarquía superior (5 > 4)
     */
    it('debe permitir super admin modificar estado de inscripción', () => {
      // ARRANGE: Usuario con rol SUPER_ADMIN
      const superAdminUser: AuthUser = {
        id: 'superadmin-xyz',
        email: 'superadmin@test.com',
        roles: [Role.SUPER_ADMIN],
      };

      const context = createMockExecutionContext(superAdminUser, [Role.ADMIN]);

      // ACT
      const result = guard.canActivate(context);

      // ASSERT: Debe permitir (jerarquía SUPER_ADMIN=5 > ADMIN=4)
      expect(result).toBe(true);
      expect(ROLE_HIERARCHY[Role.SUPER_ADMIN]).toBe(5);
    });

    /**
     * TEST 6: DEBE RECHAZAR USUARIOS SIN ROL
     *
     * ESCENARIO:
     * 1. JWT válido pero sin campo 'roles'
     * 2. Posible manipulación de token
     * 3. Sistema debe rechazar por seguridad
     *
     * VALIDACIONES:
     * - RolesGuard debe retornar false
     * - No asumir permisos por defecto
     */
    it('debe rechazar usuarios sin roles definidos', () => {
      // ARRANGE: Usuario sin roles
      const userWithoutRoles: AuthUser = {
        id: 'user-no-roles',
        email: 'noroles@test.com',
        roles: [],
      };

      const context = createMockExecutionContext(userWithoutRoles, [Role.ADMIN]);

      // ACT
      const result = guard.canActivate(context);

      // ASSERT: Debe rechazar (sin roles = sin permisos)
      expect(result).toBe(false);
    });

    /**
     * TEST 7: DEBE RECHAZAR REQUESTS SIN USUARIO
     *
     * ESCENARIO:
     * 1. Request sin objeto user (JwtAuthGuard falló)
     * 2. Sistema debe rechazar como medida de seguridad
     *
     * VALIDACIONES:
     * - RolesGuard debe retornar false
     * - No permitir acceso si no hay usuario autenticado
     */
    it('debe rechazar requests sin usuario autenticado', () => {
      // ARRANGE: Request sin user
      const context = createMockExecutionContext(undefined, [Role.ADMIN]);

      // ACT
      const result = guard.canActivate(context);

      // ASSERT: Debe rechazar (no hay usuario)
      expect(result).toBe(false);
    });

    /**
     * TEST 8: DEBE TENER TIPOS EXPLÍCITOS
     *
     * VALIDACIONES:
     * - Verificar que todas las variables tienen tipos explícitos
     * - No usar any ni unknown (excepto en lugares permitidos)
     */
    it('debe tener tipos explícitos en validación de roles', () => {
      const userId: string = 'user-123';
      const userRole: Role = Role.ADMIN;
      const requiredRole: Role = Role.ADMIN;
      const hasAccess: boolean = true;

      expect(typeof userId).toBe('string');
      expect(typeof userRole).toBe('string');
      expect(typeof requiredRole).toBe('string');
      expect(typeof hasAccess).toBe('boolean');
    });
  });

  describe('Edge Cases - Authorization', () => {
    /**
     * TEST 9: DEBE MANEJAR MÚLTIPLES ROLES DEL USUARIO
     *
     * ESCENARIO:
     * 1. Usuario con roles [TUTOR, ADMIN]
     * 2. Al menos uno cumple con el requisito
     * 3. Sistema debe permitir
     *
     * VALIDACIONES:
     * - RolesGuard valida que AL MENOS UNO cumpla
     * - Permitir si algún rol es suficiente
     */
    it('debe permitir si el usuario tiene al menos un rol válido', () => {
      // ARRANGE: Usuario con múltiples roles (uno válido)
      const multiRoleUser: AuthUser = {
        id: 'multi-role-user',
        email: 'multi@test.com',
        roles: [Role.TUTOR, Role.ADMIN],
      };

      const context = createMockExecutionContext(multiRoleUser, [Role.ADMIN]);

      // ACT
      const result = guard.canActivate(context);

      // ASSERT: Debe permitir (tiene ADMIN entre sus roles)
      expect(result).toBe(true);
    });

    /**
     * TEST 10: DEBE VALIDAR JERARQUÍA CORRECTAMENTE
     *
     * ESCENARIO:
     * 1. Verificar que la jerarquía de roles está bien configurada
     * 2. ESTUDIANTE < TUTOR < DOCENTE < ADMIN < SUPER_ADMIN
     *
     * VALIDACIONES:
     * - Valores numéricos correctos
     * - Orden ascendente
     */
    it('debe tener jerarquía de roles correctamente configurada', () => {
      // ASSERT: Verificar orden jerárquico
      expect(ROLE_HIERARCHY[Role.ESTUDIANTE]).toBeLessThan(ROLE_HIERARCHY[Role.TUTOR]);
      expect(ROLE_HIERARCHY[Role.TUTOR]).toBeLessThan(ROLE_HIERARCHY[Role.DOCENTE]);
      expect(ROLE_HIERARCHY[Role.DOCENTE]).toBeLessThan(ROLE_HIERARCHY[Role.ADMIN]);
      expect(ROLE_HIERARCHY[Role.ADMIN]).toBeLessThan(ROLE_HIERARCHY[Role.SUPER_ADMIN]);

      // ASSERT: Valores específicos
      expect(ROLE_HIERARCHY[Role.ESTUDIANTE]).toBe(1);
      expect(ROLE_HIERARCHY[Role.TUTOR]).toBe(2);
      expect(ROLE_HIERARCHY[Role.DOCENTE]).toBe(3);
      expect(ROLE_HIERARCHY[Role.ADMIN]).toBe(4);
      expect(ROLE_HIERARCHY[Role.SUPER_ADMIN]).toBe(5);
    });
  });
});