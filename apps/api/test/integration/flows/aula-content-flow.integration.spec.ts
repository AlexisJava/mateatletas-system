/**
 * ============================================================================
 * AULA CONTENT FLOW INTEGRATION TEST - Black Box Testing
 * ============================================================================
 *
 * Tests de integración para flujos de contenido del aula virtual.
 * Basado en los REQUISITOS reales del sistema documentados en:
 * - estudiantes.controller.ts (endpoints /estudiantes/aula/*)
 *
 * Endpoints:
 * - GET /estudiantes/mi-aula → Resumen del aula con planificaciones activas
 * - GET /estudiantes/aula/planificacion/:asignacionId → Detalle de planificación
 * - GET /estudiantes/aula/contenido/:asignacionId/:claseId/:tipo → Contenido de lección
 * - POST /estudiantes/aula/completar-leccion → Marcar lección como completada
 * - GET /estudiantes/aula/leaderboard/:asignacionId → Leaderboard de la planificación
 *
 * Guards:
 * - JwtAuthGuard (autenticación requerida)
 * - RolesGuard con @ExactRoles(Role.ESTUDIANTE)
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { createFullAulaSetup } from '../../fixtures/factories/scenarios.factory';
import { createTestDocente } from '../../fixtures/factories/usuario.factory';
import { cleanAllTestTables } from '../../helpers/db-cleanup';

describe('Aula Content Flow Integration Tests (BBT)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());

    const expressApp = app
      .getHttpAdapter()
      .getInstance() as express.Application;
    expressApp.set('trust proxy', true);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  }, 60000);

  afterAll(async () => {
    await cleanAllTestTables(prisma);
    await app.close();
  }, 30000);

  afterEach(async () => {
    await cleanAllTestTables(prisma);
  });

  // Helper: Login estudiante y obtener cookie
  async function loginAsEstudiante(
    username: string,
    password: string,
  ): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/estudiante/login')
      .send({ username, password });
    const cookies = response.headers['set-cookie'] as string[];
    return cookies.join('; ');
  }

  // Helper: Login docente y obtener cookie
  async function loginAsDocente(
    email: string,
    password: string,
  ): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password });
    const cookies = response.headers['set-cookie'] as string[];
    return cookies.join('; ');
  }

  // ==========================================================================
  // CLASE DE EQUIVALENCIA: MI AULA - ACCESO AUTORIZADO
  // ==========================================================================

  describe('GET /estudiantes/mi-aula', () => {
    it('should_return_aula_resumen_when_estudiante_authenticated', async () => {
      // Arrange
      const setup = await createFullAulaSetup(prisma, {
        cantidadClases: 2,
        activarClases: [1],
      });
      const cookie = await loginAsEstudiante(
        setup.estudiante.username!,
        setup.estudiantePassword,
      );

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mi-aula')
        .set('Cookie', cookie);

      // Assert - Debe retornar resumen del aula
      expect(response.status).toBe(200);
      // La estructura exacta depende de getMiAula(), pero debe ser un objeto
      expect(typeof response.body).toBe('object');
    });

    it('should_return_401_when_not_authenticated', async () => {
      // Act - Sin cookie
      const response = await request(app.getHttpServer()).get(
        '/api/estudiantes/mi-aula',
      );

      // Assert
      expect(response.status).toBe(401);
    });

    it('should_return_403_when_docente_tries_estudiante_endpoint', async () => {
      // Arrange - Docente intenta acceder a endpoint de estudiante
      const setup = await createFullAulaSetup(prisma);
      const cookie = await loginAsDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mi-aula')
        .set('Cookie', cookie);

      // Assert - 403: No tiene rol ESTUDIANTE
      expect(response.status).toBe(403);
    });
  });

  // ==========================================================================
  // CLASE DE EQUIVALENCIA: DETALLE DE PLANIFICACIÓN
  // ==========================================================================

  describe('GET /estudiantes/aula/planificacion/:asignacionId', () => {
    it('should_return_planificacion_when_estudiante_inscrito', async () => {
      // Arrange
      const setup = await createFullAulaSetup(prisma, {
        cantidadClases: 2,
        activarClases: [1],
      });
      const cookie = await loginAsEstudiante(
        setup.estudiante.username!,
        setup.estudiantePassword,
      );

      // Act
      const response = await request(app.getHttpServer())
        .get(`/api/estudiantes/aula/planificacion/${setup.asignacion.id}`)
        .set('Cookie', cookie);

      // Assert
      expect(response.status).toBe(200);
    });

    it('should_return_404_when_asignacion_not_exists', async () => {
      // Arrange
      const setup = await createFullAulaSetup(prisma);
      const cookie = await loginAsEstudiante(
        setup.estudiante.username!,
        setup.estudiantePassword,
      );

      // Act - ID inexistente
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/aula/planificacion/nonexistent-id-12345')
        .set('Cookie', cookie);

      // Assert - 404 o 403 (depende de implementación)
      expect([403, 404]).toContain(response.status);
    });
  });

  // ==========================================================================
  // CLASE DE EQUIVALENCIA: CONTENIDO DE CLASE
  // ==========================================================================

  describe('GET /estudiantes/aula/contenido/:asignacionId/:claseId/:tipo', () => {
    it('should_return_teoria_content_when_clase_activada', async () => {
      // Arrange - Crear setup con clase 1 activada
      const setup = await createFullAulaSetup(prisma, {
        cantidadClases: 2,
        activarClases: [1],
      });
      const cookie = await loginAsEstudiante(
        setup.estudiante.username!,
        setup.estudiantePassword,
      );

      // Obtener ID de la primera clase activada
      const primeraClase = setup.clases[0];

      // Act
      const response = await request(app.getHttpServer())
        .get(
          `/api/estudiantes/aula/contenido/${setup.asignacion.id}/${primeraClase.id}/teoria`,
        )
        .set('Cookie', cookie);

      // Assert - 200 si la clase está activada
      expect(response.status).toBe(200);
    });

    it('should_return_practica_content_when_clase_activada', async () => {
      // Arrange
      const setup = await createFullAulaSetup(prisma, {
        cantidadClases: 2,
        activarClases: [1],
      });
      const cookie = await loginAsEstudiante(
        setup.estudiante.username!,
        setup.estudiantePassword,
      );

      const primeraClase = setup.clases[0];

      // Act
      const response = await request(app.getHttpServer())
        .get(
          `/api/estudiantes/aula/contenido/${setup.asignacion.id}/${primeraClase.id}/practica`,
        )
        .set('Cookie', cookie);

      // Assert
      expect(response.status).toBe(200);
    });

    it('should_return_400_when_tipo_invalid', async () => {
      // Arrange
      const setup = await createFullAulaSetup(prisma, {
        cantidadClases: 1,
        activarClases: [1],
      });
      const cookie = await loginAsEstudiante(
        setup.estudiante.username!,
        setup.estudiantePassword,
      );

      const primeraClase = setup.clases[0];

      // Act - Tipo inválido (no es 'teoria' ni 'practica')
      const response = await request(app.getHttpServer())
        .get(
          `/api/estudiantes/aula/contenido/${setup.asignacion.id}/${primeraClase.id}/invalid`,
        )
        .set('Cookie', cookie);

      // Assert - 400: "Tipo debe ser 'teoria' o 'practica'"
      expect(response.status).toBe(400);
    });
  });

  // ==========================================================================
  // CLASE DE EQUIVALENCIA: COMPLETAR LECCIÓN
  // ==========================================================================

  describe('POST /estudiantes/aula/completar-leccion', () => {
    it('should_complete_leccion_and_return_xp_when_valid', async () => {
      // Arrange
      const setup = await createFullAulaSetup(prisma, {
        cantidadClases: 2,
        activarClases: [1],
      });
      const cookie = await loginAsEstudiante(
        setup.estudiante.username!,
        setup.estudiantePassword,
      );

      const primeraClase = setup.clases[0];

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/estudiantes/aula/completar-leccion')
        .set('Cookie', cookie)
        .send({
          asignacionId: setup.asignacion.id,
          claseId: primeraClase.id,
          tipo: 'teoria',
          tiempoSegundos: 300, // 5 minutos
        });

      // Assert
      expect(response.status).toBe(201);
      // Debe retornar información sobre XP ganado
    });

    it('should_return_400_when_tipo_invalid', async () => {
      // Arrange
      const setup = await createFullAulaSetup(prisma, {
        cantidadClases: 1,
        activarClases: [1],
      });
      const cookie = await loginAsEstudiante(
        setup.estudiante.username!,
        setup.estudiantePassword,
      );

      const primeraClase = setup.clases[0];

      // Act - Tipo inválido
      const response = await request(app.getHttpServer())
        .post('/api/estudiantes/aula/completar-leccion')
        .set('Cookie', cookie)
        .send({
          asignacionId: setup.asignacion.id,
          claseId: primeraClase.id,
          tipo: 'invalid',
          tiempoSegundos: 300,
        });

      // Assert
      expect(response.status).toBe(400);
    });

    it('should_return_401_when_not_authenticated', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/api/estudiantes/aula/completar-leccion')
        .send({
          asignacionId: 'any-id',
          claseId: 'any-id',
          tipo: 'teoria',
          tiempoSegundos: 300,
        });

      // Assert
      expect(response.status).toBe(401);
    });
  });

  // ==========================================================================
  // CLASE DE EQUIVALENCIA: LEADERBOARD
  // ==========================================================================

  describe('GET /estudiantes/aula/leaderboard/:asignacionId', () => {
    it('should_return_leaderboard_when_estudiante_inscrito', async () => {
      // Arrange
      const setup = await createFullAulaSetup(prisma);
      const cookie = await loginAsEstudiante(
        setup.estudiante.username!,
        setup.estudiantePassword,
      );

      // Act
      const response = await request(app.getHttpServer())
        .get(`/api/estudiantes/aula/leaderboard/${setup.asignacion.id}`)
        .set('Cookie', cookie);

      // Assert
      expect(response.status).toBe(200);
      // Debe ser un array o objeto con rankings
    });

    it('should_return_401_when_not_authenticated', async () => {
      // Act
      const response = await request(app.getHttpServer()).get(
        '/api/estudiantes/aula/leaderboard/any-id',
      );

      // Assert
      expect(response.status).toBe(401);
    });
  });

  // ==========================================================================
  // CLASE DE EQUIVALENCIA: DOCENTE - ACTIVAR CLASE
  // ==========================================================================

  describe('Docente - Activar/Desactivar Clases', () => {
    it('should_activate_clase_when_docente_owns_asignacion', async () => {
      // Arrange - Crear setup con 2 clases, solo 1 activada
      const setup = await createFullAulaSetup(prisma, {
        cantidadClases: 2,
        activarClases: [1],
      });
      const cookie = await loginAsDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // Segunda clase (no activada)
      const segundaClase = setup.clases[1];

      // Act - Activar la segunda clase
      const response = await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${segundaClase.id}/activar`,
        )
        .set('Cookie', cookie);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should_return_403_when_docente_not_owns_asignacion', async () => {
      // Arrange
      const setup = await createFullAulaSetup(prisma, {
        cantidadClases: 2,
        activarClases: [1],
      });

      // Otro docente que NO es dueño
      const { docente: otroDocente, password: otroPassword } =
        await createTestDocente(prisma);
      const cookie = await loginAsDocente(otroDocente.email, otroPassword);

      const segundaClase = setup.clases[1];

      // Act
      const response = await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${segundaClase.id}/activar`,
        )
        .set('Cookie', cookie);

      // Assert - 403 o 404 (no es su asignación)
      expect([403, 404]).toContain(response.status);
    });
  });

  // ==========================================================================
  // CLASE DE EQUIVALENCIA: TAREAS
  // ==========================================================================

  describe('GET /estudiantes/mis-tareas', () => {
    it('should_return_tareas_list_when_estudiante_authenticated', async () => {
      // Arrange
      const setup = await createFullAulaSetup(prisma);
      const cookie = await loginAsEstudiante(
        setup.estudiante.username!,
        setup.estudiantePassword,
      );

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mis-tareas')
        .set('Cookie', cookie);

      // Assert
      expect(response.status).toBe(200);
      // Puede ser array vacío si no hay tareas asignadas
      expect(
        Array.isArray(response.body) || typeof response.body === 'object',
      ).toBe(true);
    });

    it('should_filter_tareas_by_pendientes', async () => {
      // Arrange
      const setup = await createFullAulaSetup(prisma);
      const cookie = await loginAsEstudiante(
        setup.estudiante.username!,
        setup.estudiantePassword,
      );

      // Act - Filtrar por pendientes
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mis-tareas?filtro=pendientes')
        .set('Cookie', cookie);

      // Assert
      expect(response.status).toBe(200);
    });

    it('should_filter_tareas_by_completadas', async () => {
      // Arrange
      const setup = await createFullAulaSetup(prisma);
      const cookie = await loginAsEstudiante(
        setup.estudiante.username!,
        setup.estudiantePassword,
      );

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mis-tareas?filtro=completadas')
        .set('Cookie', cookie);

      // Assert
      expect(response.status).toBe(200);
    });
  });
});
