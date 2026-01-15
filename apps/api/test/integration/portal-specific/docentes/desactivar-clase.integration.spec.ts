/**
 * ============================================================================
 * INTEGRATION TESTS - POST /docentes/asignaciones/:id/clases/:claseId/desactivar
 * ============================================================================
 *
 * Desactiva una clase (teoría + práctica) para una asignación de docente.
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: cd apps/api && npx jest --config test/jest-e2e.json --testPathPatterns="desactivar-clase.integration" --runInBand
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../../../src/app.module';
import { PrismaService } from '../../../../src/core/database/prisma.service';
import { cleanAllTestTables } from '../../../helpers/db-cleanup';
import {
  createTestDocente,
  createTestTutor,
  createTestEstudiante,
  createTestAdmin,
  createTestSector,
  createTestClaseGrupo,
  createTestPlanificacion,
  createTestAsignacionPlanificacion,
} from '../../../fixtures/factories';
import {
  generateUniqueIP,
  FRONTEND_ORIGIN,
} from '../../../helpers/auth.helpers';

describe('[INTEGRATION] POST /docentes/asignaciones/:id/clases/:claseId/desactivar', () => {
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
  // HELPER: Activar una clase (para luego desactivarla)
  // ============================================================================
  async function activarClase(asignacionId: string, claseId: string) {
    await prisma.estadoClaseGrupo.upsert({
      where: {
        asignacion_id_clase_id: {
          asignacion_id: asignacionId,
          clase_id: claseId,
        },
      },
      update: {
        teoria_activa: true,
        practica_activa: true,
        activada_en: new Date(),
      },
      create: {
        asignacion_id: asignacionId,
        clase_id: claseId,
        teoria_activa: true,
        practica_activa: true,
        activada_en: new Date(),
      },
    });
  }

  // ============================================================================
  // CATEGORÍA 1: AUTENTICACIÓN Y AUTORIZACIÓN
  // ============================================================================
  describe('Autenticación y Autorización', () => {
    it('debe retornar 401 si no hay token', async () => {
      // ACT
      const response = await request(app.getHttpServer()).post(
        '/api/docentes/asignaciones/some-id/clases/some-clase-id/desactivar',
      );

      // ASSERT
      expect(response.status).toBe(401);
    });

    it('debe retornar 401 con token malformado', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .post(
          '/api/docentes/asignaciones/some-id/clases/some-clase-id/desactivar',
        )
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
        .post(
          '/api/docentes/asignaciones/some-id/clases/some-clase-id/desactivar',
        )
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
        .post(
          '/api/docentes/asignaciones/some-id/clases/some-clase-id/desactivar',
        )
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(403);
    });

    it('debe permitir acceso con rol DOCENTE válido', async () => {
      // ARRANGE
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);
      const claseId = setup.planificacion.clases[0].id;

      // Activar primero
      await activarClase(setup.asignacion.id, claseId);

      // ACT
      const response = await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/desactivar`,
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
          `/api/docentes/asignaciones/${fakeAsignacionId}/clases/${fakeClaseId}/desactivar`,
        )
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Asignación no encontrada');
    });
  });

  // ============================================================================
  // CATEGORÍA 3: OWNERSHIP Y AISLAMIENTO
  // ============================================================================
  describe('Ownership y Aislamiento', () => {
    it('debe retornar 403 si el docente intenta desactivar clase de otro docente', async () => {
      // ARRANGE
      const setup = await createFullSetup();
      const claseId = setup.planificacion.clases[0].id;

      // Activar primero
      await activarClase(setup.asignacion.id, claseId);

      // Crear otro docente
      const { docente: otroDocente, password: otroPassword } =
        await createTestDocente(prisma);
      const cookies = await loginDocente(otroDocente.email, otroPassword);

      // ACT
      const response = await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/desactivar`,
        )
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(403);
      expect(response.body.message).toContain(
        'No tienes permisos para modificar esta asignación',
      );
    });

    it('debe permitir al docente dueño desactivar su propia clase', async () => {
      // ARRANGE
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);
      const claseId = setup.planificacion.clases[0].id;

      // Activar primero
      await activarClase(setup.asignacion.id, claseId);

      // ACT
      const response = await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/desactivar`,
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
    it('debe desactivar teoría y práctica correctamente', async () => {
      // ARRANGE
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);
      const claseId = setup.planificacion.clases[0].id;

      // Activar primero
      await activarClase(setup.asignacion.id, claseId);

      // ACT
      const response = await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/desactivar`,
        )
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: 'Clase desactivada',
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
      expect(estado?.teoria_activa).toBe(false);
      expect(estado?.practica_activa).toBe(false);
    });

    it('debe crear estado desactivado si no existe previamente (upsert create)', async () => {
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
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/desactivar`,
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
      expect(estadoNuevo?.teoria_activa).toBe(false);
      expect(estadoNuevo?.practica_activa).toBe(false);
    });

    it('debe actualizar estado activo a desactivado (upsert update)', async () => {
      // ARRANGE
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);
      const claseId = setup.planificacion.clases[0].id;

      // Crear estado activo
      await activarClase(setup.asignacion.id, claseId);

      // Verificar que está activo
      const estadoActivo = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: setup.asignacion.id,
            clase_id: claseId,
          },
        },
      });
      expect(estadoActivo?.teoria_activa).toBe(true);
      expect(estadoActivo?.practica_activa).toBe(true);

      // ACT
      await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/desactivar`,
        )
        .set('Cookie', cookies)
        .expect(201);

      // ASSERT
      const estadoDesactivado = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: setup.asignacion.id,
            clase_id: claseId,
          },
        },
      });

      expect(estadoDesactivado?.teoria_activa).toBe(false);
      expect(estadoDesactivado?.practica_activa).toBe(false);
    });

    it('debe poder desactivar múltiples clases de la misma planificación', async () => {
      // ARRANGE
      const setup = await createFullSetup({ cantidadClases: 3 });
      const cookies = await loginDocente(setup.docente.email, setup.password);

      // Activar todas las clases primero
      for (const clase of setup.planificacion.clases) {
        await activarClase(setup.asignacion.id, clase.id);
      }

      // ACT - Desactivar las 3 clases
      for (const clase of setup.planificacion.clases) {
        const response = await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${clase.id}/desactivar`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(201);
      }

      // ASSERT - Verificar todas desactivadas
      const estados = await prisma.estadoClaseGrupo.findMany({
        where: { asignacion_id: setup.asignacion.id },
      });

      expect(estados).toHaveLength(3);
      estados.forEach((estado) => {
        expect(estado.teoria_activa).toBe(false);
        expect(estado.practica_activa).toBe(false);
      });
    });
  });

  // ============================================================================
  // CATEGORÍA 5: IDEMPOTENCIA
  // ============================================================================
  describe('Idempotencia', () => {
    it('debe ser idempotente - desactivar clase ya desactivada no causa error', async () => {
      // ARRANGE
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);
      const claseId = setup.planificacion.clases[0].id;

      // Activar y desactivar
      await activarClase(setup.asignacion.id, claseId);
      await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/desactivar`,
        )
        .set('Cookie', cookies)
        .expect(201);

      // ACT - Segunda desactivación
      const response = await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/desactivar`,
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
      expect(estados[0].teoria_activa).toBe(false);
      expect(estados[0].practica_activa).toBe(false);
    });

    it('debe mantener estado desactivado al desactivar múltiples veces', async () => {
      // ARRANGE
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);
      const claseId = setup.planificacion.clases[0].id;

      // ACT - Desactivar 3 veces sin activar
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/desactivar`,
          )
          .set('Cookie', cookies)
          .expect(201);
      }

      // ASSERT
      const estado = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: setup.asignacion.id,
            clase_id: claseId,
          },
        },
      });

      expect(estado?.teoria_activa).toBe(false);
      expect(estado?.practica_activa).toBe(false);
    });
  });

  // ============================================================================
  // CATEGORÍA 6: ESTADOS PARCIALES
  // ============================================================================
  describe('Estados Parciales', () => {
    it('debe desactivar ambas cuando solo teoría estaba activa', async () => {
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
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/desactivar`,
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

      expect(estado?.teoria_activa).toBe(false);
      expect(estado?.practica_activa).toBe(false);
    });

    it('debe desactivar ambas cuando solo práctica estaba activa', async () => {
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
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/desactivar`,
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

      expect(estado?.teoria_activa).toBe(false);
      expect(estado?.practica_activa).toBe(false);
    });
  });

  // ============================================================================
  // CATEGORÍA 7: AISLAMIENTO ENTRE ASIGNACIONES
  // ============================================================================
  describe('Aislamiento entre Asignaciones', () => {
    it('desactivar clase en una asignación NO afecta otras asignaciones del mismo docente', async () => {
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

      // Activar la clase en ambas asignaciones
      await activarClase(asignacion1.id, claseId);
      await activarClase(asignacion2.id, claseId);

      // ACT - Desactivar solo en asignación 1
      await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${asignacion1.id}/clases/${claseId}/desactivar`,
        )
        .set('Cookie', cookies)
        .expect(201);

      // ASSERT
      // Asignación 1 debe tener estado desactivado
      const estado1 = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: asignacion1.id,
            clase_id: claseId,
          },
        },
      });
      expect(estado1?.teoria_activa).toBe(false);
      expect(estado1?.practica_activa).toBe(false);

      // Asignación 2 debe seguir activada
      const estado2 = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: asignacion2.id,
            clase_id: claseId,
          },
        },
      });
      expect(estado2?.teoria_activa).toBe(true);
      expect(estado2?.practica_activa).toBe(true);
    });

    it('desactivar clase NO afecta otras clases de la misma asignación', async () => {
      // ARRANGE
      const setup = await createFullSetup({ cantidadClases: 3 });
      const cookies = await loginDocente(setup.docente.email, setup.password);

      const clase1 = setup.planificacion.clases[0].id;
      const clase2 = setup.planificacion.clases[1].id;
      const clase3 = setup.planificacion.clases[2].id;

      // Activar todas las clases
      await activarClase(setup.asignacion.id, clase1);
      await activarClase(setup.asignacion.id, clase2);
      await activarClase(setup.asignacion.id, clase3);

      // ACT - Desactivar solo clase 2
      await request(app.getHttpServer())
        .post(
          `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${clase2}/desactivar`,
        )
        .set('Cookie', cookies)
        .expect(201);

      // ASSERT
      // Clase 1 debe seguir activada
      const estado1 = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: setup.asignacion.id,
            clase_id: clase1,
          },
        },
      });
      expect(estado1?.teoria_activa).toBe(true);
      expect(estado1?.practica_activa).toBe(true);

      // Clase 2 debe estar desactivada
      const estado2 = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: setup.asignacion.id,
            clase_id: clase2,
          },
        },
      });
      expect(estado2?.teoria_activa).toBe(false);
      expect(estado2?.practica_activa).toBe(false);

      // Clase 3 debe seguir activada
      const estado3 = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: setup.asignacion.id,
            clase_id: clase3,
          },
        },
      });
      expect(estado3?.teoria_activa).toBe(true);
      expect(estado3?.practica_activa).toBe(true);
    });
  });

  // ============================================================================
  // CATEGORÍA 8: CICLO ACTIVAR/DESACTIVAR
  // ============================================================================
  describe('Ciclo Activar/Desactivar', () => {
    it('debe poder activar y desactivar la misma clase múltiples veces', async () => {
      // ARRANGE
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);
      const claseId = setup.planificacion.clases[0].id;

      // ACT - Ciclo de activar/desactivar
      for (let i = 0; i < 3; i++) {
        // Activar
        await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/activar`,
          )
          .set('Cookie', cookies)
          .expect(201);

        // Verificar activo
        let estado = await prisma.estadoClaseGrupo.findUnique({
          where: {
            asignacion_id_clase_id: {
              asignacion_id: setup.asignacion.id,
              clase_id: claseId,
            },
          },
        });
        expect(estado?.teoria_activa).toBe(true);
        expect(estado?.practica_activa).toBe(true);

        // Desactivar
        await request(app.getHttpServer())
          .post(
            `/api/docentes/asignaciones/${setup.asignacion.id}/clases/${claseId}/desactivar`,
          )
          .set('Cookie', cookies)
          .expect(201);

        // Verificar desactivado
        estado = await prisma.estadoClaseGrupo.findUnique({
          where: {
            asignacion_id_clase_id: {
              asignacion_id: setup.asignacion.id,
              clase_id: claseId,
            },
          },
        });
        expect(estado?.teoria_activa).toBe(false);
        expect(estado?.practica_activa).toBe(false);
      }

      // ASSERT - Solo debe haber un registro al final
      const estados = await prisma.estadoClaseGrupo.findMany({
        where: {
          asignacion_id: setup.asignacion.id,
          clase_id: claseId,
        },
      });
      expect(estados).toHaveLength(1);
    });
  });
});
