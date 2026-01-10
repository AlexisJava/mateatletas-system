/**
 * ============================================================================
 * INTEGRATION TESTS - POST /docentes/asignaciones/:id/clases/:claseId/activar
 * ============================================================================
 *
 * Activa una clase (teoría + práctica) para una asignación de docente.
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: cd apps/api && npx jest --config test/jest-e2e.json --testPathPatterns="activar-clase.integration" --runInBand
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

describe('[INTEGRATION] POST /docentes/asignaciones/:id/clases/:claseId/activar', () => {
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
  // HELPER: Login docente
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

    const cookies = response.headers['set-cookie'];
    if (!cookies || !Array.isArray(cookies)) {
      throw new Error('No cookies returned from login');
    }

    return cookies;
  }

  // ============================================================================
  // HELPER: Login tutor
  // ============================================================================
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
      throw new Error(
        `Login failed: ${response.status} - ${JSON.stringify(response.body)}`,
      );
    }

    return response.headers['set-cookie'] as string[];
  }

  // ============================================================================
  // HELPER: Login estudiante
  // ============================================================================
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
      throw new Error(
        `Login failed: ${response.status} - ${JSON.stringify(response.body)}`,
      );
    }

    return response.headers['set-cookie'] as string[];
  }

  // ============================================================================
  // HELPER: Crear setup completo de asignación con clases
  // ============================================================================
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

  // ============================================================================
  // CATEGORÍA 1: AUTENTICACIÓN Y AUTORIZACIÓN
  // ============================================================================
  describe('Autenticación y Autorización', () => {
    it('debe retornar 401 si no hay token', async () => {
      // ACT
      const response = await request(app.getHttpServer()).post(
        '/api/docentes/asignaciones/some-id/clases/some-clase-id/activar',
      );

      // ASSERT
      expect(response.status).toBe(401);
    });

    it('debe retornar 401 con token malformado', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/docentes/asignaciones/some-id/clases/some-clase-id/activar')
        .set('Cookie', ['auth-token=invalid-token']);

      // ASSERT
      expect(response.status).toBe(401);
    });

    it('debe retornar 403 si el rol es TUTOR', async () => {
      // ARRANGE
      const { tutor, password } = await createTestTutor(prisma);
      const cookies = await loginTutor(tutor.email, password);

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/docentes/asignaciones/some-id/clases/some-clase-id/activar')
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(403);
    });

    it('debe retornar 403 si el rol es ESTUDIANTE', async () => {
      // ARRANGE
      const { estudiante, password } = await createTestEstudiante(prisma);
      const cookies = await loginEstudianteHelper(
        estudiante.username,
        password,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/docentes/asignaciones/some-id/clases/some-clase-id/activar')
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(403);
    });

    it('debe permitir acceso con rol DOCENTE válido', async () => {
      // ARRANGE
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);
      const claseId = setup.planificacion.clases[0].id;

      // ACT
      const response = await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/activar`,
        )
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(201);
    });
  });

  // ============================================================================
  // CATEGORÍA 2: VALIDACIÓN DE PARÁMETROS
  // ============================================================================
  describe('Validación de Parámetros', () => {
    it('debe retornar 404 si la asignación no existe', async () => {
      // ARRANGE
      const { docente, password } = await createTestDocente(prisma);
      const cookies = await loginDocente(docente.email, password);
      const fakeAsignacionId = '00000000-0000-0000-0000-000000000000';
      const fakeClaseId = '00000000-0000-0000-0000-000000000001';

      // ACT
      const response = await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${fakeAsignacionId}/clases/${fakeClaseId}/activar`,
        )
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Asignación no encontrada');
    });

    it('debe retornar 404 si la clase no pertenece a la planificación', async () => {
      // ARRANGE
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);

      // Crear otra planificación con otra clase
      const otraPlanificacion = await createTestPlanificacion(
        prisma,
        setup.admin.id,
        { cantidadClases: 1 },
      );
      const claseDeOtraPlanificacion = otraPlanificacion.clases[0].id;

      // ACT
      const response = await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseDeOtraPlanificacion}/activar`,
        )
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(404);
      expect(response.body.message).toContain(
        'La clase no pertenece a esta planificación',
      );
    });
  });

  // ============================================================================
  // CATEGORÍA 3: OWNERSHIP Y AISLAMIENTO
  // ============================================================================
  describe('Ownership y Aislamiento', () => {
    it('debe retornar 403 si el docente intenta activar clase de otro docente', async () => {
      // ARRANGE
      const setup = await createFullSetup();
      const claseId = setup.planificacion.clases[0].id;

      // Crear otro docente
      const { docente: otroDocente, password: otroPassword } =
        await createTestDocente(prisma);
      const cookies = await loginDocente(otroDocente.email, otroPassword);

      // ACT
      const response = await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/activar`,
        )
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(403);
      expect(response.body.message).toContain(
        'No tienes permisos para modificar esta asignación',
      );
    });

    it('debe permitir al docente dueño activar su propia clase', async () => {
      // ARRANGE
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);
      const claseId = setup.planificacion.clases[0].id;

      // ACT
      const response = await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/activar`,
        )
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  // ============================================================================
  // CATEGORÍA 4: HAPPY PATHS - COMPORTAMIENTO ESPERADO
  // ============================================================================
  describe('Happy Paths', () => {
    it('debe activar teoría y práctica correctamente', async () => {
      // ARRANGE
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);
      const claseId = setup.planificacion.clases[0].id;

      // ACT
      const response = await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/activar`,
        )
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: 'Clase activada',
      });

      // Verificar en DB
      const estado = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: setup.asignacion.id,
            clase_id: claseId,
          },
        },
      });

      expect(estado).not.toBeNull();
      expect(estado?.teoria_activa).toBe(true);
      expect(estado?.practica_activa).toBe(true);
      expect(estado?.activada_en).toBeInstanceOf(Date);
    });

    it('debe crear estado si no existe previamente (upsert create)', async () => {
      // ARRANGE
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);
      const claseId = setup.planificacion.clases[0].id;

      // Verificar que no existe estado previo
      const estadoPrevio = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: setup.asignacion.id,
            clase_id: claseId,
          },
        },
      });
      expect(estadoPrevio).toBeNull();

      // ACT
      await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/activar`,
        )
        .set('Cookie', cookies)
        .expect(201);

      // ASSERT
      const estadoNuevo = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: setup.asignacion.id,
            clase_id: claseId,
          },
        },
      });

      expect(estadoNuevo).not.toBeNull();
      expect(estadoNuevo?.teoria_activa).toBe(true);
      expect(estadoNuevo?.practica_activa).toBe(true);
    });

    it('debe actualizar estado si ya existe (upsert update)', async () => {
      // ARRANGE
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);
      const claseId = setup.planificacion.clases[0].id;

      // Crear estado previo desactivado
      await prisma.estadoClaseGrupo.create({
        data: {
          asignacion_id: setup.asignacion.id,
          clase_id: claseId,
          teoria_activa: false,
          practica_activa: false,
        },
      });

      // ACT
      await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/activar`,
        )
        .set('Cookie', cookies)
        .expect(201);

      // ASSERT
      const estadoActualizado = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: setup.asignacion.id,
            clase_id: claseId,
          },
        },
      });

      expect(estadoActualizado?.teoria_activa).toBe(true);
      expect(estadoActualizado?.practica_activa).toBe(true);
      expect(estadoActualizado?.activada_en).not.toBeNull();
    });

    it('debe poder activar múltiples clases de la misma planificación', async () => {
      // ARRANGE
      const setup = await createFullSetup({ cantidadClases: 3 });
      const cookies = await loginDocente(setup.docente.email, setup.password);

      // ACT - Activar las 3 clases
      for (const clase of setup.planificacion.clases) {
        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${clase.id}/activar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(201);
      }

      // ASSERT - Verificar todas activadas
      const estados = await prisma.estadoClaseGrupo.findMany({
        where: { asignacion_id: setup.asignacion.id },
      });

      expect(estados).toHaveLength(3);
      estados.forEach((estado) => {
        expect(estado.teoria_activa).toBe(true);
        expect(estado.practica_activa).toBe(true);
      });
    });
  });

  // ============================================================================
  // CATEGORÍA 5: IDEMPOTENCIA
  // ============================================================================
  describe('Idempotencia', () => {
    it('debe ser idempotente - activar clase ya activada no causa error', async () => {
      // ARRANGE
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);
      const claseId = setup.planificacion.clases[0].id;

      // Primera activación
      await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/activar`,
        )
        .set('Cookie', cookies)
        .expect(201);

      // ACT - Segunda activación
      const response = await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/activar`,
        )
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      // Verificar que solo hay un registro
      const estados = await prisma.estadoClaseGrupo.findMany({
        where: {
          asignacion_id: setup.asignacion.id,
          clase_id: claseId,
        },
      });

      expect(estados).toHaveLength(1);
    });

    it('debe actualizar activada_en en cada activación', async () => {
      // ARRANGE
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);
      const claseId = setup.planificacion.clases[0].id;

      // Primera activación
      await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/activar`,
        )
        .set('Cookie', cookies)
        .expect(201);

      const primerEstado = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: setup.asignacion.id,
            clase_id: claseId,
          },
        },
      });

      // Esperar un poco para que el timestamp sea diferente
      await new Promise((resolve) => setTimeout(resolve, 50));

      // ACT - Segunda activación
      await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/activar`,
        )
        .set('Cookie', cookies)
        .expect(201);

      // ASSERT
      const segundoEstado = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: setup.asignacion.id,
            clase_id: claseId,
          },
        },
      });

      expect(segundoEstado?.activada_en?.getTime()).toBeGreaterThanOrEqual(
        primerEstado?.activada_en?.getTime() ?? 0,
      );
    });
  });

  // ============================================================================
  // CATEGORÍA 6: ESTADOS PARCIALES
  // ============================================================================
  describe('Estados Parciales', () => {
    it('debe activar ambas cuando solo teoría estaba activa', async () => {
      // ARRANGE
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);
      const claseId = setup.planificacion.clases[0].id;

      // Crear estado con solo teoría
      await prisma.estadoClaseGrupo.create({
        data: {
          asignacion_id: setup.asignacion.id,
          clase_id: claseId,
          teoria_activa: true,
          practica_activa: false,
        },
      });

      // ACT
      await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/activar`,
        )
        .set('Cookie', cookies)
        .expect(201);

      // ASSERT
      const estado = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: setup.asignacion.id,
            clase_id: claseId,
          },
        },
      });

      expect(estado?.teoria_activa).toBe(true);
      expect(estado?.practica_activa).toBe(true);
    });

    it('debe activar ambas cuando solo práctica estaba activa', async () => {
      // ARRANGE
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);
      const claseId = setup.planificacion.clases[0].id;

      // Crear estado con solo práctica
      await prisma.estadoClaseGrupo.create({
        data: {
          asignacion_id: setup.asignacion.id,
          clase_id: claseId,
          teoria_activa: false,
          practica_activa: true,
        },
      });

      // ACT
      await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/activar`,
        )
        .set('Cookie', cookies)
        .expect(201);

      // ASSERT
      const estado = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: setup.asignacion.id,
            clase_id: claseId,
          },
        },
      });

      expect(estado?.teoria_activa).toBe(true);
      expect(estado?.practica_activa).toBe(true);
    });
  });

  // ============================================================================
  // CATEGORÍA 7: AISLAMIENTO ENTRE ASIGNACIONES
  // ============================================================================
  describe('Aislamiento entre Asignaciones', () => {
    it('activar clase en una asignación NO afecta otras asignaciones del mismo docente', async () => {
      // ARRANGE
      const { docente, password } = await createTestDocente(prisma);
      const admin = await createTestAdmin(prisma);
      const sector = await createTestSector(prisma);

      // Crear dos claseGrupos
      const claseGrupo1 = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
        nombre: 'Grupo 1',
      });
      const claseGrupo2 = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
        nombre: 'Grupo 2',
      });

      // Crear una planificación compartida
      const planificacion = await createTestPlanificacion(prisma, admin.id, {
        cantidadClases: 2,
      });

      // Crear dos asignaciones con la misma planificación
      const { asignacion: asignacion1 } =
        await createTestAsignacionPlanificacion(
          prisma,
          planificacion.id,
          claseGrupo1.id,
          docente.id,
        );
      const { asignacion: asignacion2 } =
        await createTestAsignacionPlanificacion(
          prisma,
          planificacion.id,
          claseGrupo2.id,
          docente.id,
        );

      const cookies = await loginDocente(docente.email, password);
      const claseId = planificacion.clases[0].id;

      // ACT - Activar solo en asignación 1
      await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${asignacion1.id}/clases/${claseId}/activar`,
        )
        .set('Cookie', cookies)
        .expect(201);

      // ASSERT
      // Asignación 1 debe tener estado activado
      const estado1 = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: asignacion1.id,
            clase_id: claseId,
          },
        },
      });
      expect(estado1?.teoria_activa).toBe(true);
      expect(estado1?.practica_activa).toBe(true);

      // Asignación 2 NO debe tener estado
      const estado2 = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: asignacion2.id,
            clase_id: claseId,
          },
        },
      });
      expect(estado2).toBeNull();
    });

    it('activar clase NO afecta otras clases de la misma asignación', async () => {
      // ARRANGE
      const setup = await createFullSetup({ cantidadClases: 3 });
      const cookies = await loginDocente(setup.docente.email, setup.password);

      const clase1 = setup.planificacion.clases[0].id;
      const clase2 = setup.planificacion.clases[1].id;
      const clase3 = setup.planificacion.clases[2].id;

      // ACT - Activar solo clase 2
      await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${clase2}/activar`,
        )
        .set('Cookie', cookies)
        .expect(201);

      // ASSERT
      // Clase 1 NO debe tener estado
      const estado1 = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: setup.asignacion.id,
            clase_id: clase1,
          },
        },
      });
      expect(estado1).toBeNull();

      // Clase 2 debe estar activada
      const estado2 = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: setup.asignacion.id,
            clase_id: clase2,
          },
        },
      });
      expect(estado2?.teoria_activa).toBe(true);
      expect(estado2?.practica_activa).toBe(true);

      // Clase 3 NO debe tener estado
      const estado3 = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: setup.asignacion.id,
            clase_id: clase3,
          },
        },
      });
      expect(estado3).toBeNull();
    });
  });
});
