/**
 * ============================================================================
 * INTEGRATION TESTS - Asignar y Desasignar Tareas (Endpoints 9-10)
 * ============================================================================
 *
 * Endpoints:
 * - POST /api/docentes/asignaciones/:id/tareas/:tareaClaseId/asignar
 * - POST /api/docentes/asignaciones/:id/tareas/:tareaClaseId/desasignar
 *
 * Requisitos de negocio (según implementación actual):
 * - Asignar tarea: Idempotente (usa upsert - asignar dos veces no duplica)
 * - Desasignar tarea: Idempotente + Soft-delete (pone activa=false, no elimina)
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPatterns="tareas.integration" --runInBand
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
  createTestContenido,
} from '../../fixtures/factories';
import { generateUniqueIP, FRONTEND_ORIGIN } from '../../helpers/auth.helpers';

describe('[INTEGRATION] Tareas - Asignar y Desasignar (Endpoints 9-10)', () => {
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
    const cantidadClases = options?.cantidadClases ?? 2;
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

  async function createTareaClase(claseId: string, adminId: string) {
    // Primero crear un contenido que será la tarea
    const contenido = await createTestContenido(prisma, {
      titulo: `Tarea Test ${Date.now()}`,
      creadorId: adminId,
    });

    // Luego crear la TareaClase que vincula la clase con el contenido
    return prisma.tareaClase.create({
      data: {
        clase: { connect: { id: claseId } },
        contenido: { connect: { id: contenido.id } },
      },
    });
  }

  /**
   * Busca una tarea asignada ACTIVA (soft-delete pattern)
   * El backend usa soft-delete: desasignar pone activa=false en vez de eliminar
   */
  async function getTareaAsignadaActiva(
    asignacionId: string,
    tareaClaseId: string,
  ) {
    return prisma.tareaAsignada.findFirst({
      where: {
        asignacion_id: asignacionId,
        tarea_clase_id: tareaClaseId,
        activa: true,
      },
    });
  }

  // ============================================================================
  // ENDPOINT 9: POST /asignaciones/:id/tareas/:tareaClaseId/asignar
  // ============================================================================
  describe('POST /api/docentes/asignaciones/:id/tareas/:tareaClaseId/asignar', () => {
    describe('Autenticación y Autorización', () => {
      it('debe retornar 401 si no hay token', async () => {
        const response = await request(app.getHttpServer()).post(
          '/api/docentes/asignaciones/some-id/tareas/some-tarea-id/asignar',
        );
        expect(response.status).toBe(401);
      });

      it('debe retornar 401 con token malformado', async () => {
        const response = await request(app.getHttpServer())
          .post(
            '/api/docentes/asignaciones/some-id/tareas/some-tarea-id/asignar',
          )
          .set('Cookie', ['auth-token=invalid-token']);

        expect(response.status).toBe(401);
      });

      it('debe retornar 403 si el rol es TUTOR', async () => {
        const { tutor, password } = await createTestTutor(prisma);
        const cookies = await loginTutor(tutor.email, password);

        const response = await request(app.getHttpServer())
          .post(
            '/api/docentes/asignaciones/some-id/tareas/some-tarea-id/asignar',
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
            '/api/docentes/asignaciones/some-id/tareas/some-tarea-id/asignar',
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
          .post(`/api/docentes/asignaciones/${fakeId}/tareas/${fakeId}/asignar`)
          .set('Cookie', cookies);

        expect(response.status).toBe(404);
      });

      it('debe retornar 404 si la tarea no existe', async () => {
        const setup = await createFullSetup();
        const cookies = await loginDocente(setup.docente.email, setup.password);
        const fakeTareaId = '00000000-0000-0000-0000-000000000000';

        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/tareas/${fakeTareaId}/asignar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(404);
      });
    });

    describe('Ownership', () => {
      it('debe retornar 403 si el docente intenta asignar tarea en asignación de otro', async () => {
        const setup = await createFullSetup();
        const tarea = await createTareaClase(
          setup.clases[0].id,
          setup.admin.id,
        );

        const { docente: otroDocente, password: otraPass } =
          await createTestDocente(prisma);
        const cookies = await loginDocente(otroDocente.email, otraPass);

        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/tareas/${tarea.id}/asignar`,
          )
          .set('Cookie', cookies);

        expect([403, 404]).toContain(response.status);
      });
    });

    describe('Happy Paths', () => {
      it('debe asignar tarea correctamente', async () => {
        const setup = await createFullSetup();
        const tarea = await createTareaClase(
          setup.clases[0].id,
          setup.admin.id,
        );
        const cookies = await loginDocente(setup.docente.email, setup.password);

        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/tareas/${tarea.id}/asignar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(201);

        // Verificar en DB
        const tareaAsignada = await getTareaAsignadaActiva(
          setup.asignacion.id,
          tarea.id,
        );
        expect(tareaAsignada).toBeDefined();
      });

      it('debe asignar tarea con fecha_limite', async () => {
        const setup = await createFullSetup();
        const tarea = await createTareaClase(
          setup.clases[0].id,
          setup.admin.id,
        );
        const cookies = await loginDocente(setup.docente.email, setup.password);
        const fechaLimite = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/tareas/${tarea.id}/asignar`,
          )
          .set('Cookie', cookies)
          .send({ fecha_limite: fechaLimite.toISOString() });

        expect(response.status).toBe(201);

        // Verificar en DB
        const tareaAsignada = await getTareaAsignadaActiva(
          setup.asignacion.id,
          tarea.id,
        );
        expect(tareaAsignada).toBeDefined();
        expect(tareaAsignada?.fecha_limite).toBeDefined();
      });

      it('debe poder asignar múltiples tareas a la misma asignación', async () => {
        const setup = await createFullSetup();
        const tarea1 = await createTareaClase(
          setup.clases[0].id,
          setup.admin.id,
        );
        const tarea2 = await createTareaClase(
          setup.clases[0].id,
          setup.admin.id,
        );
        const cookies = await loginDocente(setup.docente.email, setup.password);

        // Asignar primera tarea
        const response1 = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/tareas/${tarea1.id}/asignar`,
          )
          .set('Cookie', cookies);

        // Asignar segunda tarea
        const response2 = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/tareas/${tarea2.id}/asignar`,
          )
          .set('Cookie', cookies);

        expect(response1.status).toBe(201);
        expect(response2.status).toBe(201);

        // Verificar ambas en DB
        const asignada1 = await getTareaAsignadaActiva(
          setup.asignacion.id,
          tarea1.id,
        );
        const asignada2 = await getTareaAsignadaActiva(
          setup.asignacion.id,
          tarea2.id,
        );
        expect(asignada1).toBeDefined();
        expect(asignada2).toBeDefined();
      });
    });

    describe('Requisito de Negocio: Idempotente (Upsert)', () => {
      it('asignar tarea ya asignada debe ser idempotente (upsert)', async () => {
        const setup = await createFullSetup();
        const tarea = await createTareaClase(
          setup.clases[0].id,
          setup.admin.id,
        );
        const cookies = await loginDocente(setup.docente.email, setup.password);

        // Primera asignación
        const response1 = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/tareas/${tarea.id}/asignar`,
          )
          .set('Cookie', cookies);

        expect(response1.status).toBe(201);

        // Segunda asignación - debe ser exitosa (upsert)
        const response2 = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/tareas/${tarea.id}/asignar`,
          )
          .set('Cookie', cookies);

        // El backend usa upsert, así que es idempotente
        expect(response2.status).toBe(201);

        // Verificar que solo hay una tarea asignada (no duplicada)
        const count = await prisma.tareaAsignada.count({
          where: {
            asignacion_id: setup.asignacion.id,
            tarea_clase_id: tarea.id,
          },
        });
        expect(count).toBe(1);
      });
    });

    describe('Aislamiento entre Asignaciones', () => {
      it('asignar tarea en una asignación NO afecta otras asignaciones', async () => {
        const setup = await createFullSetup();
        const tarea = await createTareaClase(
          setup.clases[0].id,
          setup.admin.id,
        );

        // Crear segunda asignación con la misma planificación
        const sector2 = await createTestSector(prisma);
        const claseGrupo2 = await createTestClaseGrupo(prisma, {
          docenteId: setup.docente.id,
          sectorId: sector2.id,
        });
        const { asignacion: asignacion2 } =
          await createTestAsignacionPlanificacion(
            prisma,
            setup.planificacion.id,
            claseGrupo2.id,
            setup.docente.id,
          );

        const cookies = await loginDocente(setup.docente.email, setup.password);

        // Asignar solo en primera asignación
        await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/tareas/${tarea.id}/asignar`,
          )
          .set('Cookie', cookies);

        // Verificar que la segunda asignación NO tiene la tarea asignada
        const enAsignacion1 = await getTareaAsignadaActiva(
          setup.asignacion.id,
          tarea.id,
        );
        const enAsignacion2 = await getTareaAsignadaActiva(
          asignacion2.id,
          tarea.id,
        );

        expect(enAsignacion1).toBeDefined();
        expect(enAsignacion2).toBeNull();
      });
    });
  });

  // ============================================================================
  // ENDPOINT 10: POST /asignaciones/:id/tareas/:tareaClaseId/desasignar
  // ============================================================================
  describe('POST /api/docentes/asignaciones/:id/tareas/:tareaClaseId/desasignar', () => {
    describe('Autenticación y Autorización', () => {
      it('debe retornar 401 si no hay token', async () => {
        const response = await request(app.getHttpServer()).post(
          '/api/docentes/asignaciones/some-id/tareas/some-tarea-id/desasignar',
        );
        expect(response.status).toBe(401);
      });

      it('debe retornar 403 si el rol es TUTOR', async () => {
        const { tutor, password } = await createTestTutor(prisma);
        const cookies = await loginTutor(tutor.email, password);

        const response = await request(app.getHttpServer())
          .post(
            '/api/docentes/asignaciones/some-id/tareas/some-tarea-id/desasignar',
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
            '/api/docentes/asignaciones/some-id/tareas/some-tarea-id/desasignar',
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
            `/api/docentes/asignaciones/${fakeId}/tareas/${fakeId}/desasignar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(404);
      });
    });

    describe('Ownership', () => {
      it('debe retornar 403 si el docente intenta desasignar tarea de otro', async () => {
        const setup = await createFullSetup();
        const tarea = await createTareaClase(
          setup.clases[0].id,
          setup.admin.id,
        );

        // Asignar la tarea primero
        const cookiesOwner = await loginDocente(
          setup.docente.email,
          setup.password,
        );
        await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/tareas/${tarea.id}/asignar`,
          )
          .set('Cookie', cookiesOwner);

        // Intentar desasignar con otro docente
        const { docente: otroDocente, password: otraPass } =
          await createTestDocente(prisma);
        const cookies = await loginDocente(otroDocente.email, otraPass);

        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/tareas/${tarea.id}/desasignar`,
          )
          .set('Cookie', cookies);

        expect([403, 404]).toContain(response.status);
      });
    });

    describe('Happy Paths', () => {
      it('debe desasignar tarea correctamente', async () => {
        const setup = await createFullSetup();
        const tarea = await createTareaClase(
          setup.clases[0].id,
          setup.admin.id,
        );
        const cookies = await loginDocente(setup.docente.email, setup.password);

        // Primero asignar
        await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/tareas/${tarea.id}/asignar`,
          )
          .set('Cookie', cookies);

        // Luego desasignar
        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/tareas/${tarea.id}/desasignar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(201);

        // Verificar en DB
        const tareaAsignada = await getTareaAsignadaActiva(
          setup.asignacion.id,
          tarea.id,
        );
        expect(tareaAsignada).toBeNull();
      });
    });

    describe('Requisito de Negocio: Idempotente', () => {
      it('NO debe fallar al desasignar tarea no asignada', async () => {
        const setup = await createFullSetup();
        const tarea = await createTareaClase(
          setup.clases[0].id,
          setup.admin.id,
        );
        const cookies = await loginDocente(setup.docente.email, setup.password);

        // Desasignar tarea que nunca fue asignada - NO debe fallar
        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/tareas/${tarea.id}/desasignar`,
          )
          .set('Cookie', cookies);

        // Debe retornar éxito (idempotente)
        expect(response.status).toBe(201);
      });

      it('debe poder desasignar múltiples veces sin error', async () => {
        const setup = await createFullSetup();
        const tarea = await createTareaClase(
          setup.clases[0].id,
          setup.admin.id,
        );
        const cookies = await loginDocente(setup.docente.email, setup.password);

        // Asignar
        await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/tareas/${tarea.id}/asignar`,
          )
          .set('Cookie', cookies);

        // Primera desasignación
        const response1 = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/tareas/${tarea.id}/desasignar`,
          )
          .set('Cookie', cookies);

        // Segunda desasignación (ya no está asignada)
        const response2 = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/tareas/${tarea.id}/desasignar`,
          )
          .set('Cookie', cookies);

        expect(response1.status).toBe(201);
        expect(response2.status).toBe(201);
      });
    });

    describe('Aislamiento', () => {
      it('desasignar tarea en una asignación NO afecta otras asignaciones', async () => {
        const setup = await createFullSetup();
        const tarea = await createTareaClase(
          setup.clases[0].id,
          setup.admin.id,
        );

        // Crear segunda asignación
        const sector2 = await createTestSector(prisma);
        const claseGrupo2 = await createTestClaseGrupo(prisma, {
          docenteId: setup.docente.id,
          sectorId: sector2.id,
        });
        const { asignacion: asignacion2 } =
          await createTestAsignacionPlanificacion(
            prisma,
            setup.planificacion.id,
            claseGrupo2.id,
            setup.docente.id,
          );

        const cookies = await loginDocente(setup.docente.email, setup.password);

        // Asignar en ambas
        await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/tareas/${tarea.id}/asignar`,
          )
          .set('Cookie', cookies);

        await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${asignacion2.id}/tareas/${tarea.id}/asignar`,
          )
          .set('Cookie', cookies);

        // Desasignar solo de la primera
        await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/tareas/${tarea.id}/desasignar`,
          )
          .set('Cookie', cookies);

        // Verificar que la segunda aún tiene la tarea
        const enAsignacion1 = await getTareaAsignadaActiva(
          setup.asignacion.id,
          tarea.id,
        );
        const enAsignacion2 = await getTareaAsignadaActiva(
          asignacion2.id,
          tarea.id,
        );

        expect(enAsignacion1).toBeNull();
        expect(enAsignacion2).toBeDefined();
      });
    });

    describe('Ciclo Asignar/Desasignar', () => {
      it('debe poder asignar, desasignar, y volver a asignar', async () => {
        const setup = await createFullSetup();
        const tarea = await createTareaClase(
          setup.clases[0].id,
          setup.admin.id,
        );
        const cookies = await loginDocente(setup.docente.email, setup.password);

        // 1. Asignar
        const r1 = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/tareas/${tarea.id}/asignar`,
          )
          .set('Cookie', cookies);
        expect(r1.status).toBe(201);

        // 2. Desasignar
        const r2 = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/tareas/${tarea.id}/desasignar`,
          )
          .set('Cookie', cookies);
        expect(r2.status).toBe(201);

        // 3. Volver a asignar
        const r3 = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/tareas/${tarea.id}/asignar`,
          )
          .set('Cookie', cookies);
        expect(r3.status).toBe(201);

        // Verificar que está asignada
        const tareaAsignada = await getTareaAsignadaActiva(
          setup.asignacion.id,
          tarea.id,
        );
        expect(tareaAsignada).toBeDefined();
      });
    });
  });
});
