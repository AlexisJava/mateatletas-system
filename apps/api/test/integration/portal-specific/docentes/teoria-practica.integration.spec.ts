/**
 * ============================================================================
 * INTEGRATION TESTS - Teoria y Practica (Endpoints 4-7)
 * ============================================================================
 *
 * Endpoints:
 * - POST /api/docentes/asignaciones/:id/clases/:claseId/teoria/activar
 * - POST /api/docentes/asignaciones/:id/clases/:claseId/teoria/desactivar
 * - POST /api/docentes/asignaciones/:id/clases/:claseId/practica/activar
 * - POST /api/docentes/asignaciones/:id/clases/:claseId/practica/desactivar
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPatterns="teoria-practica.integration" --runInBand
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import {
  createTestDocente,
  createTestTutor,
  createTestEstudiante,
  createTestAdmin,
  createTestSector,
  createTestClaseGrupo,
  createTestPlanificacion,
  createTestAsignacionPlanificacion,
} from '../../fixtures/factories';
import { generateUniqueIP, FRONTEND_ORIGIN } from '../../helpers/auth.helpers';

describe('[INTEGRATION] Teoria y Practica - Endpoints 4-7', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // ============================================================================
  // SETUP
  // ============================================================================
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

    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  }, 60000);

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  }, 30000);

  beforeEach(async () => {
    await cleanAllTestTables(prisma);
  });

  // ============================================================================
  // HELPERS
  // ============================================================================
  async function loginDocente(
    email: string,
    password: string,
  ): Promise<string[]> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('Origin', FRONTEND_ORIGIN)
      .set('X-Forwarded-For', generateUniqueIP())
      .send({ email, password });

    if (response.status !== 200) {
      throw new Error(
        `Login failed: ${response.status} - ${JSON.stringify(response.body)}`,
      );
    }

    return response.headers['set-cookie'] as string[];
  }

  async function loginTutor(
    email: string,
    password: string,
  ): Promise<string[]> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('Origin', FRONTEND_ORIGIN)
      .set('X-Forwarded-For', generateUniqueIP())
      .send({ email, password });

    if (response.status !== 200) {
      throw new Error(`Login failed: ${response.status}`);
    }

    return response.headers['set-cookie'] as string[];
  }

  async function loginEstudianteHelper(
    username: string,
    password: string,
  ): Promise<string[]> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/estudiante/login')
      .set('Origin', FRONTEND_ORIGIN)
      .set('X-Forwarded-For', generateUniqueIP())
      .send({ username, password });

    if (response.status !== 200) {
      throw new Error(`Login failed: ${response.status}`);
    }

    return response.headers['set-cookie'] as string[];
  }

  async function createFullSetup(options?: { cantidadClases?: number }) {
    const cantidadClases = options?.cantidadClases ?? 3;
    const { docente, password } = await createTestDocente(prisma);
    const admin = await createTestAdmin(prisma);
    const sector = await createTestSector(prisma);
    const claseGrupo = await createTestClaseGrupo(prisma, {
      docenteId: docente.id,
      sectorId: sector.id,
    });
    const planificacion = await createTestPlanificacion(prisma, admin.id, {
      cantidadClases,
    });
    const { asignacion, clases } = await createTestAsignacionPlanificacion(
      prisma,
      planificacion.id,
      claseGrupo.id,
      docente.id,
    );
    return {
      docente,
      password,
      admin,
      sector,
      claseGrupo,
      planificacion,
      asignacion,
      clases,
    };
  }

  async function getEstadoClase(asignacionId: string, claseId: string) {
    return prisma.estadoClaseGrupo.findUnique({
      where: {
        asignacion_id_clase_id: {
          asignacion_id: asignacionId,
          clase_id: claseId,
        },
      },
    });
  }

  async function setEstadoClase(
    asignacionId: string,
    claseId: string,
    teoriaActiva: boolean,
    practicaActiva: boolean,
  ) {
    await prisma.estadoClaseGrupo.upsert({
      where: {
        asignacion_id_clase_id: {
          asignacion_id: asignacionId,
          clase_id: claseId,
        },
      },
      update: {
        teoria_activa: teoriaActiva,
        practica_activa: practicaActiva,
      },
      create: {
        asignacion_id: asignacionId,
        clase_id: claseId,
        teoria_activa: teoriaActiva,
        practica_activa: practicaActiva,
        activada_en: new Date(),
      },
    });
  }

  // ============================================================================
  // ENDPOINT 4: POST /teoria/activar
  // ============================================================================
  describe('POST /api/docentes/asignaciones/:id/clases/:claseId/teoria/activar', () => {
    describe('Autenticación y Autorización', () => {
      it('debe retornar 401 si no hay token', async () => {
        const response = await request(app.getHttpServer()).post(
          '/api/docentes/asignaciones/some-id/clases/some-clase-id/teoria/activar',
        );
        expect(response.status).toBe(401);
      });

      it('debe retornar 403 si el rol es TUTOR', async () => {
        const { tutor, password } = await createTestTutor(prisma);
        const cookies = await loginTutor(tutor.email, password);

        const response = await request(app.getHttpServer())
          .post(
            '/api/docentes/asignaciones/some-id/clases/some-clase-id/teoria/activar',
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(403);
      });

      it('debe retornar 403 si el rol es ESTUDIANTE', async () => {
        const { estudiante, password } = await createTestEstudiante(prisma);
        const cookies = await loginEstudianteHelper(
          estudiante.username,
          password,
        );

        const response = await request(app.getHttpServer())
          .post(
            '/api/docentes/asignaciones/some-id/clases/some-clase-id/teoria/activar',
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(403);
      });
    });

    describe('Validación de Parámetros', () => {
      it('debe retornar 404 si la asignación no existe', async () => {
        const { docente, password } = await createTestDocente(prisma);
        const cookies = await loginDocente(docente.email, password);
        const fakeId = '00000000-0000-0000-0000-000000000000';

        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${fakeId}/clases/${fakeId}/teoria/activar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(404);
      });

      it('debe retornar 404 si la clase no pertenece a la planificación', async () => {
        const setup = await createFullSetup();
        const cookies = await loginDocente(setup.docente.email, setup.password);

        // Crear otra planificación con otra clase
        const otraPlanificacion = await createTestPlanificacion(
          prisma,
          setup.admin.id,
          { cantidadClases: 1 },
        );
        const otraClaseId = otraPlanificacion.clases[0].id;

        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${otraClaseId}/teoria/activar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(404);
      });
    });

    describe('Ownership', () => {
      it('debe retornar 403 si el docente intenta activar clase de otro docente', async () => {
        const setup = await createFullSetup();
        const { docente: otroDocente, password: otraPass } =
          await createTestDocente(prisma);
        const cookies = await loginDocente(otroDocente.email, otraPass);

        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${setup.clases[0].id}/teoria/activar`,
          )
          .set('Cookie', cookies);

        expect([403, 404]).toContain(response.status);
      });
    });

    describe('Happy Paths', () => {
      it('debe activar solo teoría sin afectar práctica (desde estado vacío)', async () => {
        const setup = await createFullSetup();
        const cookies = await loginDocente(setup.docente.email, setup.password);
        const claseId = setup.clases[0].id;

        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/teoria/activar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
          success: true,
          message: 'Teoría activada',
        });

        const estado = await getEstadoClase(setup.asignacion.id, claseId);
        expect(estado?.teoria_activa).toBe(true);
        expect(estado?.practica_activa).toBe(false);
      });

      it('debe activar teoría preservando práctica activa', async () => {
        const setup = await createFullSetup();
        const cookies = await loginDocente(setup.docente.email, setup.password);
        const claseId = setup.clases[0].id;

        // Primero activar práctica
        await setEstadoClase(setup.asignacion.id, claseId, false, true);

        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/teoria/activar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(201);

        const estado = await getEstadoClase(setup.asignacion.id, claseId);
        expect(estado?.teoria_activa).toBe(true);
        expect(estado?.practica_activa).toBe(true); // Preservada
      });

      it('debe ser idempotente - activar teoría ya activa no causa error', async () => {
        const setup = await createFullSetup();
        const cookies = await loginDocente(setup.docente.email, setup.password);
        const claseId = setup.clases[0].id;

        // Primera activación
        await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/teoria/activar`,
          )
          .set('Cookie', cookies);

        // Segunda activación
        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/teoria/activar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });
    });
  });

  // ============================================================================
  // ENDPOINT 5: POST /teoria/desactivar
  // ============================================================================
  describe('POST /api/docentes/asignaciones/:id/clases/:claseId/teoria/desactivar', () => {
    describe('Autenticación y Autorización', () => {
      it('debe retornar 401 si no hay token', async () => {
        const response = await request(app.getHttpServer()).post(
          '/api/docentes/asignaciones/some-id/clases/some-clase-id/teoria/desactivar',
        );
        expect(response.status).toBe(401);
      });

      it('debe retornar 403 si el rol es TUTOR', async () => {
        const { tutor, password } = await createTestTutor(prisma);
        const cookies = await loginTutor(tutor.email, password);

        const response = await request(app.getHttpServer())
          .post(
            '/api/docentes/asignaciones/some-id/clases/some-clase-id/teoria/desactivar',
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(403);
      });
    });

    describe('Validación de Parámetros', () => {
      it('debe retornar 404 si la asignación no existe', async () => {
        const { docente, password } = await createTestDocente(prisma);
        const cookies = await loginDocente(docente.email, password);
        const fakeId = '00000000-0000-0000-0000-000000000000';

        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${fakeId}/clases/${fakeId}/teoria/desactivar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(404);
      });
    });

    describe('Happy Paths', () => {
      it('debe desactivar solo teoría sin afectar práctica', async () => {
        const setup = await createFullSetup();
        const cookies = await loginDocente(setup.docente.email, setup.password);
        const claseId = setup.clases[0].id;

        // Activar ambas primero
        await setEstadoClase(setup.asignacion.id, claseId, true, true);

        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/teoria/desactivar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
          success: true,
          message: 'Teoría desactivada',
        });

        const estado = await getEstadoClase(setup.asignacion.id, claseId);
        expect(estado?.teoria_activa).toBe(false);
        expect(estado?.practica_activa).toBe(true); // Preservada
      });

      it('debe ser idempotente - desactivar teoría ya desactivada no causa error', async () => {
        const setup = await createFullSetup();
        const cookies = await loginDocente(setup.docente.email, setup.password);
        const claseId = setup.clases[0].id;

        // Activar solo práctica
        await setEstadoClase(setup.asignacion.id, claseId, false, true);

        // Desactivar teoría (ya está desactivada)
        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/teoria/desactivar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      it('debe crear estado desactivado si no existe', async () => {
        const setup = await createFullSetup();
        const cookies = await loginDocente(setup.docente.email, setup.password);
        const claseId = setup.clases[0].id;

        // Sin estado previo
        const estadoAntes = await getEstadoClase(setup.asignacion.id, claseId);
        expect(estadoAntes).toBeNull();

        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/teoria/desactivar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(201);

        const estadoDespues = await getEstadoClase(
          setup.asignacion.id,
          claseId,
        );
        expect(estadoDespues?.teoria_activa).toBe(false);
        expect(estadoDespues?.practica_activa).toBe(false);
      });
    });
  });

  // ============================================================================
  // ENDPOINT 6: POST /practica/activar
  // ============================================================================
  describe('POST /api/docentes/asignaciones/:id/clases/:claseId/practica/activar', () => {
    describe('Autenticación y Autorización', () => {
      it('debe retornar 401 si no hay token', async () => {
        const response = await request(app.getHttpServer()).post(
          '/api/docentes/asignaciones/some-id/clases/some-clase-id/practica/activar',
        );
        expect(response.status).toBe(401);
      });

      it('debe retornar 403 si el rol es TUTOR', async () => {
        const { tutor, password } = await createTestTutor(prisma);
        const cookies = await loginTutor(tutor.email, password);

        const response = await request(app.getHttpServer())
          .post(
            '/api/docentes/asignaciones/some-id/clases/some-clase-id/practica/activar',
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(403);
      });

      it('debe retornar 403 si el rol es ESTUDIANTE', async () => {
        const { estudiante, password } = await createTestEstudiante(prisma);
        const cookies = await loginEstudianteHelper(
          estudiante.username,
          password,
        );

        const response = await request(app.getHttpServer())
          .post(
            '/api/docentes/asignaciones/some-id/clases/some-clase-id/practica/activar',
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(403);
      });
    });

    describe('Validación de Parámetros', () => {
      it('debe retornar 404 si la asignación no existe', async () => {
        const { docente, password } = await createTestDocente(prisma);
        const cookies = await loginDocente(docente.email, password);
        const fakeId = '00000000-0000-0000-0000-000000000000';

        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${fakeId}/clases/${fakeId}/practica/activar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(404);
      });

      it('debe retornar 404 si la clase no pertenece a la planificación', async () => {
        const setup = await createFullSetup();
        const cookies = await loginDocente(setup.docente.email, setup.password);

        const otraPlanificacion = await createTestPlanificacion(
          prisma,
          setup.admin.id,
          { cantidadClases: 1 },
        );
        const otraClaseId = otraPlanificacion.clases[0].id;

        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${otraClaseId}/practica/activar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(404);
      });
    });

    describe('Ownership', () => {
      it('debe retornar 403 si el docente intenta activar clase de otro docente', async () => {
        const setup = await createFullSetup();
        const { docente: otroDocente, password: otraPass } =
          await createTestDocente(prisma);
        const cookies = await loginDocente(otroDocente.email, otraPass);

        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${setup.clases[0].id}/practica/activar`,
          )
          .set('Cookie', cookies);

        expect([403, 404]).toContain(response.status);
      });
    });

    describe('Happy Paths', () => {
      it('debe activar solo práctica sin afectar teoría (desde estado vacío)', async () => {
        const setup = await createFullSetup();
        const cookies = await loginDocente(setup.docente.email, setup.password);
        const claseId = setup.clases[0].id;

        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/practica/activar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
          success: true,
          message: 'Práctica activada',
        });

        const estado = await getEstadoClase(setup.asignacion.id, claseId);
        expect(estado?.practica_activa).toBe(true);
        expect(estado?.teoria_activa).toBe(false);
      });

      it('debe activar práctica preservando teoría activa', async () => {
        const setup = await createFullSetup();
        const cookies = await loginDocente(setup.docente.email, setup.password);
        const claseId = setup.clases[0].id;

        // Primero activar teoría
        await setEstadoClase(setup.asignacion.id, claseId, true, false);

        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/practica/activar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(201);

        const estado = await getEstadoClase(setup.asignacion.id, claseId);
        expect(estado?.practica_activa).toBe(true);
        expect(estado?.teoria_activa).toBe(true); // Preservada
      });

      it('debe ser idempotente - activar práctica ya activa no causa error', async () => {
        const setup = await createFullSetup();
        const cookies = await loginDocente(setup.docente.email, setup.password);
        const claseId = setup.clases[0].id;

        // Primera activación
        await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/practica/activar`,
          )
          .set('Cookie', cookies);

        // Segunda activación
        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/practica/activar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });
    });
  });

  // ============================================================================
  // ENDPOINT 7: POST /practica/desactivar
  // ============================================================================
  describe('POST /api/docentes/asignaciones/:id/clases/:claseId/practica/desactivar', () => {
    describe('Autenticación y Autorización', () => {
      it('debe retornar 401 si no hay token', async () => {
        const response = await request(app.getHttpServer()).post(
          '/api/docentes/asignaciones/some-id/clases/some-clase-id/practica/desactivar',
        );
        expect(response.status).toBe(401);
      });

      it('debe retornar 403 si el rol es TUTOR', async () => {
        const { tutor, password } = await createTestTutor(prisma);
        const cookies = await loginTutor(tutor.email, password);

        const response = await request(app.getHttpServer())
          .post(
            '/api/docentes/asignaciones/some-id/clases/some-clase-id/practica/desactivar',
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(403);
      });
    });

    describe('Validación de Parámetros', () => {
      it('debe retornar 404 si la asignación no existe', async () => {
        const { docente, password } = await createTestDocente(prisma);
        const cookies = await loginDocente(docente.email, password);
        const fakeId = '00000000-0000-0000-0000-000000000000';

        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${fakeId}/clases/${fakeId}/practica/desactivar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(404);
      });
    });

    describe('Happy Paths', () => {
      it('debe desactivar solo práctica sin afectar teoría', async () => {
        const setup = await createFullSetup();
        const cookies = await loginDocente(setup.docente.email, setup.password);
        const claseId = setup.clases[0].id;

        // Activar ambas primero
        await setEstadoClase(setup.asignacion.id, claseId, true, true);

        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/practica/desactivar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
          success: true,
          message: 'Práctica desactivada',
        });

        const estado = await getEstadoClase(setup.asignacion.id, claseId);
        expect(estado?.practica_activa).toBe(false);
        expect(estado?.teoria_activa).toBe(true); // Preservada
      });

      it('debe ser idempotente - desactivar práctica ya desactivada no causa error', async () => {
        const setup = await createFullSetup();
        const cookies = await loginDocente(setup.docente.email, setup.password);
        const claseId = setup.clases[0].id;

        // Activar solo teoría
        await setEstadoClase(setup.asignacion.id, claseId, true, false);

        // Desactivar práctica (ya está desactivada)
        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/practica/desactivar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      it('debe crear estado desactivado si no existe', async () => {
        const setup = await createFullSetup();
        const cookies = await loginDocente(setup.docente.email, setup.password);
        const claseId = setup.clases[0].id;

        // Sin estado previo
        const estadoAntes = await getEstadoClase(setup.asignacion.id, claseId);
        expect(estadoAntes).toBeNull();

        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/practica/desactivar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(201);

        const estadoDespues = await getEstadoClase(
          setup.asignacion.id,
          claseId,
        );
        expect(estadoDespues?.practica_activa).toBe(false);
        expect(estadoDespues?.teoria_activa).toBe(false);
      });
    });
  });

  // ============================================================================
  // TESTS COMBINADOS: INTERACCIÓN TEORÍA/PRÁCTICA
  // ============================================================================
  describe('Interacción entre Teoría y Práctica', () => {
    it('debe poder activar teoría y práctica independientemente', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);
      const claseId = setup.clases[0].id;

      // Activar teoría
      await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/teoria/activar`,
        )
        .set('Cookie', cookies);

      let estado = await getEstadoClase(setup.asignacion.id, claseId);
      expect(estado?.teoria_activa).toBe(true);
      expect(estado?.practica_activa).toBe(false);

      // Activar práctica
      await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/practica/activar`,
        )
        .set('Cookie', cookies);

      estado = await getEstadoClase(setup.asignacion.id, claseId);
      expect(estado?.teoria_activa).toBe(true);
      expect(estado?.practica_activa).toBe(true);
    });

    it('debe poder desactivar teoría y práctica independientemente', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);
      const claseId = setup.clases[0].id;

      // Activar ambas
      await setEstadoClase(setup.asignacion.id, claseId, true, true);

      // Desactivar teoría
      await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/teoria/desactivar`,
        )
        .set('Cookie', cookies);

      let estado = await getEstadoClase(setup.asignacion.id, claseId);
      expect(estado?.teoria_activa).toBe(false);
      expect(estado?.practica_activa).toBe(true);

      // Desactivar práctica
      await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/practica/desactivar`,
        )
        .set('Cookie', cookies);

      estado = await getEstadoClase(setup.asignacion.id, claseId);
      expect(estado?.teoria_activa).toBe(false);
      expect(estado?.practica_activa).toBe(false);
    });

    it('debe soportar ciclo completo: activar ambas, desactivar una, reactivar', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);
      const claseId = setup.clases[0].id;

      // 1. Activar teoría
      await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/teoria/activar`,
        )
        .set('Cookie', cookies);

      // 2. Activar práctica
      await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/practica/activar`,
        )
        .set('Cookie', cookies);

      // Verificar ambas activas
      let estado = await getEstadoClase(setup.asignacion.id, claseId);
      expect(estado?.teoria_activa).toBe(true);
      expect(estado?.practica_activa).toBe(true);

      // 3. Desactivar teoría
      await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/teoria/desactivar`,
        )
        .set('Cookie', cookies);

      estado = await getEstadoClase(setup.asignacion.id, claseId);
      expect(estado?.teoria_activa).toBe(false);
      expect(estado?.practica_activa).toBe(true);

      // 4. Reactivar teoría
      await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/teoria/activar`,
        )
        .set('Cookie', cookies);

      estado = await getEstadoClase(setup.asignacion.id, claseId);
      expect(estado?.teoria_activa).toBe(true);
      expect(estado?.practica_activa).toBe(true);
    });

    it('operaciones en una clase NO afectan otras clases de la misma asignación', async () => {
      const setup = await createFullSetup({ cantidadClases: 3 });
      const cookies = await loginDocente(setup.docente.email, setup.password);
      const clase1Id = setup.clases[0].id;
      const clase2Id = setup.clases[1].id;

      // Activar ambas en clase 2
      await setEstadoClase(setup.asignacion.id, clase2Id, true, true);

      // Activar solo teoría en clase 1
      await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${clase1Id}/teoria/activar`,
        )
        .set('Cookie', cookies);

      // Verificar que clase 2 no fue afectada
      const estado2 = await getEstadoClase(setup.asignacion.id, clase2Id);
      expect(estado2?.teoria_activa).toBe(true);
      expect(estado2?.practica_activa).toBe(true);

      // Verificar estado de clase 1
      const estado1 = await getEstadoClase(setup.asignacion.id, clase1Id);
      expect(estado1?.teoria_activa).toBe(true);
      expect(estado1?.practica_activa).toBe(false);
    });
  });
});
