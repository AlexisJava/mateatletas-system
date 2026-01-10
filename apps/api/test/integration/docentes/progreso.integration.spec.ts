/**
 * ============================================================================
 * INTEGRATION TESTS - Progreso de Estudiantes (Endpoint 8/10)
 * ============================================================================
 *
 * Endpoint: GET /api/docentes/asignaciones/:id/progreso
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPatterns="progreso.integration" --runInBand
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
  createTestInscripcionClaseGrupo,
} from '../../fixtures/factories';
import { generateUniqueIP, FRONTEND_ORIGIN } from '../../helpers/auth.helpers';

describe('[INTEGRATION] GET /docentes/asignaciones/:id/progreso', () => {
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

  async function inscribirEstudiante(claseGrupoId: string) {
    const { tutor } = await createTestTutor(prisma);
    const { estudiante, password } = await createTestEstudiante(prisma, {
      tutorId: tutor.id,
    });
    await createTestInscripcionClaseGrupo(
      prisma,
      estudiante.id,
      claseGrupoId,
      tutor.id,
    );
    return { estudiante, password, tutor };
  }

  async function crearProgresoClase(
    estudianteId: string,
    claseId: string,
    data: {
      teoriaCompletada?: boolean;
      practicaCompletada?: boolean;
      tiempoTeoria?: number;
      tiempoPractica?: number;
    },
  ) {
    return prisma.progresoClaseEstudiante.create({
      data: {
        estudiante_id: estudianteId,
        clase_id: claseId,
        teoria_completada: data.teoriaCompletada ?? false,
        practica_completada: data.practicaCompletada ?? false,
        tiempo_teoria_segundos: data.tiempoTeoria ?? 0,
        tiempo_practica_segundos: data.tiempoPractica ?? 0,
      },
    });
  }

  // ============================================================================
  // AUTENTICACIÓN Y AUTORIZACIÓN
  // ============================================================================
  describe('Autenticación y Autorización', () => {
    it('debe retornar 401 si no hay token', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/docentes/asignaciones/some-id/progreso',
      );
      expect(response.status).toBe(401);
    });

    it('debe retornar 401 con token malformado', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/docentes/asignaciones/some-id/progreso')
        .set('Cookie', ['auth-token=invalid-token']);

      expect(response.status).toBe(401);
    });

    it('debe retornar 403 si el rol es TUTOR', async () => {
      const { tutor, password } = await createTestTutor(prisma);
      const cookies = await loginTutor(tutor.email, password);

      const response = await request(app.getHttpServer())
        .get('/api/docentes/asignaciones/some-id/progreso')
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
        .get('/api/docentes/asignaciones/some-id/progreso')
        .set('Cookie', cookies);

      expect(response.status).toBe(403);
    });

    it('debe permitir acceso con rol DOCENTE válido', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);

      const response = await request(app.getHttpServer())
        .get(`/api/docentes/asignaciones/${setup.asignacion.id}/progreso`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
    });
  });

  // ============================================================================
  // VALIDACIÓN DE PARÁMETROS
  // ============================================================================
  describe('Validación de Parámetros', () => {
    it('debe retornar 404 si la asignación no existe', async () => {
      const { docente, password } = await createTestDocente(prisma);
      const cookies = await loginDocente(docente.email, password);
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app.getHttpServer())
        .get(`/api/docentes/asignaciones/${fakeId}/progreso`)
        .set('Cookie', cookies);

      expect(response.status).toBe(404);
    });
  });

  // ============================================================================
  // OWNERSHIP Y AISLAMIENTO
  // ============================================================================
  describe('Ownership y Aislamiento', () => {
    it('debe retornar 403 si el docente intenta ver progreso de otro docente', async () => {
      const setup = await createFullSetup();
      const { docente: otroDocente, password: otraPass } =
        await createTestDocente(prisma);
      const cookies = await loginDocente(otroDocente.email, otraPass);

      const response = await request(app.getHttpServer())
        .get(`/api/docentes/asignaciones/${setup.asignacion.id}/progreso`)
        .set('Cookie', cookies);

      expect([403, 404]).toContain(response.status);
    });

    it('debe permitir al docente dueño ver el progreso', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);

      const response = await request(app.getHttpServer())
        .get(`/api/docentes/asignaciones/${setup.asignacion.id}/progreso`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('progresos');
      expect(Array.isArray(response.body.progresos)).toBe(true);
    });
  });

  // ============================================================================
  // HAPPY PATHS - SIN PROGRESO
  // ============================================================================
  describe('Happy Paths - Sin Progreso', () => {
    it('debe retornar array vacío si no hay estudiantes inscritos', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);

      const response = await request(app.getHttpServer())
        .get(`/api/docentes/asignaciones/${setup.asignacion.id}/progreso`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.progresos).toEqual([]);
    });

    it('debe retornar array vacío si hay estudiantes pero sin progreso', async () => {
      const setup = await createFullSetup();
      await inscribirEstudiante(setup.claseGrupo.id);
      const cookies = await loginDocente(setup.docente.email, setup.password);

      const response = await request(app.getHttpServer())
        .get(`/api/docentes/asignaciones/${setup.asignacion.id}/progreso`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.progresos).toEqual([]);
    });
  });

  // ============================================================================
  // HAPPY PATHS - CON PROGRESO
  // ============================================================================
  describe('Happy Paths - Con Progreso', () => {
    it('debe retornar progreso de un estudiante en una clase', async () => {
      const setup = await createFullSetup();
      const { estudiante } = await inscribirEstudiante(setup.claseGrupo.id);
      const claseId = setup.clases[0].id;

      await crearProgresoClase(estudiante.id, claseId, {
        teoriaCompletada: true,
        practicaCompletada: false,
        tiempoTeoria: 300,
      });

      const cookies = await loginDocente(setup.docente.email, setup.password);

      const response = await request(app.getHttpServer())
        .get(`/api/docentes/asignaciones/${setup.asignacion.id}/progreso`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.progresos).toHaveLength(1);
      expect(response.body.progresos[0]).toMatchObject({
        teoria_completada: true,
        practica_completada: false,
        tiempo_teoria_segundos: 300,
      });
      expect(response.body.progresos[0].estudiante).toMatchObject({
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
      });
    });

    it('debe retornar progreso de múltiples estudiantes', async () => {
      const setup = await createFullSetup();
      const { estudiante: est1 } = await inscribirEstudiante(
        setup.claseGrupo.id,
      );
      const { estudiante: est2 } = await inscribirEstudiante(
        setup.claseGrupo.id,
      );
      const claseId = setup.clases[0].id;

      await crearProgresoClase(est1.id, claseId, {
        teoriaCompletada: true,
        practicaCompletada: true,
      });
      await crearProgresoClase(est2.id, claseId, {
        teoriaCompletada: false,
        practicaCompletada: false,
      });

      const cookies = await loginDocente(setup.docente.email, setup.password);

      const response = await request(app.getHttpServer())
        .get(`/api/docentes/asignaciones/${setup.asignacion.id}/progreso`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.progresos).toHaveLength(2);
    });

    it('debe retornar progreso de un estudiante en múltiples clases', async () => {
      const setup = await createFullSetup({ cantidadClases: 3 });
      const { estudiante } = await inscribirEstudiante(setup.claseGrupo.id);

      // Crear progreso en las 3 clases
      for (let i = 0; i < 3; i++) {
        await crearProgresoClase(estudiante.id, setup.clases[i].id, {
          teoriaCompletada: i < 2, // primeras 2 completadas
          practicaCompletada: i === 0, // solo la primera
        });
      }

      const cookies = await loginDocente(setup.docente.email, setup.password);

      const response = await request(app.getHttpServer())
        .get(`/api/docentes/asignaciones/${setup.asignacion.id}/progreso`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.progresos).toHaveLength(3);
    });
  });

  // ============================================================================
  // ESTRUCTURA DEL RESPONSE
  // ============================================================================
  describe('Estructura del Response', () => {
    it('debe incluir todos los campos requeridos en el progreso', async () => {
      const setup = await createFullSetup();
      const { estudiante } = await inscribirEstudiante(setup.claseGrupo.id);
      const claseId = setup.clases[0].id;

      await crearProgresoClase(estudiante.id, claseId, {
        teoriaCompletada: true,
        practicaCompletada: true,
        tiempoTeoria: 600,
        tiempoPractica: 1200,
      });

      const cookies = await loginDocente(setup.docente.email, setup.password);

      const response = await request(app.getHttpServer())
        .get(`/api/docentes/asignaciones/${setup.asignacion.id}/progreso`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      const progreso = response.body.progresos[0];

      expect(progreso).toHaveProperty('id');
      expect(progreso).toHaveProperty('estudiante');
      expect(progreso).toHaveProperty('clase_numero');
      expect(progreso).toHaveProperty('clase_titulo');
      expect(progreso).toHaveProperty('teoria_completada');
      expect(progreso).toHaveProperty('practica_completada');
      expect(progreso).toHaveProperty('tiempo_teoria_segundos');
      expect(progreso).toHaveProperty('tiempo_practica_segundos');
    });

    it('debe incluir número y título de la clase', async () => {
      const setup = await createFullSetup();
      const { estudiante } = await inscribirEstudiante(setup.claseGrupo.id);

      await crearProgresoClase(estudiante.id, setup.clases[1].id, {
        teoriaCompletada: true,
      });

      const cookies = await loginDocente(setup.docente.email, setup.password);

      const response = await request(app.getHttpServer())
        .get(`/api/docentes/asignaciones/${setup.asignacion.id}/progreso`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      const progreso = response.body.progresos[0];
      expect(progreso.clase_numero).toBe(2); // Segunda clase
      expect(typeof progreso.clase_titulo).toBe('string');
    });
  });

  // ============================================================================
  // AISLAMIENTO DE DATOS
  // ============================================================================
  describe('Aislamiento de Datos', () => {
    it('solo debe retornar progreso de estudiantes inscritos en el grupo', async () => {
      const setup = await createFullSetup();

      // Estudiante inscrito en este grupo
      const { estudiante: estInscrito } = await inscribirEstudiante(
        setup.claseGrupo.id,
      );

      // Estudiante NO inscrito (crear otro grupo)
      const otroSector = await createTestSector(prisma);
      const otroGrupo = await createTestClaseGrupo(prisma, {
        docenteId: setup.docente.id,
        sectorId: otroSector.id,
      });
      const { estudiante: estNoInscrito } = await inscribirEstudiante(
        otroGrupo.id,
      );

      // Crear progreso para ambos estudiantes en la misma clase
      const claseId = setup.clases[0].id;
      await crearProgresoClase(estInscrito.id, claseId, {
        teoriaCompletada: true,
      });
      await crearProgresoClase(estNoInscrito.id, claseId, {
        teoriaCompletada: true,
      });

      const cookies = await loginDocente(setup.docente.email, setup.password);

      const response = await request(app.getHttpServer())
        .get(`/api/docentes/asignaciones/${setup.asignacion.id}/progreso`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      // Solo debe retornar el progreso del estudiante inscrito
      expect(response.body.progresos).toHaveLength(1);
      expect(response.body.progresos[0].estudiante.nombre).toBe(
        estInscrito.nombre,
      );
    });

    it('solo debe retornar progreso de clases de esta planificación', async () => {
      const setup = await createFullSetup();
      const { estudiante } = await inscribirEstudiante(setup.claseGrupo.id);

      // Crear otra planificación con otras clases
      const otraPlanificacion = await createTestPlanificacion(
        prisma,
        setup.admin.id,
        { cantidadClases: 2 },
      );
      const otraClaseId = otraPlanificacion.clases[0].id;

      // Crear progreso en clase de esta planificación
      await crearProgresoClase(estudiante.id, setup.clases[0].id, {
        teoriaCompletada: true,
      });

      // Crear progreso en clase de otra planificación
      await crearProgresoClase(estudiante.id, otraClaseId, {
        teoriaCompletada: true,
      });

      const cookies = await loginDocente(setup.docente.email, setup.password);

      const response = await request(app.getHttpServer())
        .get(`/api/docentes/asignaciones/${setup.asignacion.id}/progreso`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      // Solo debe retornar 1 progreso (de la planificación correcta)
      expect(response.body.progresos).toHaveLength(1);
    });

    it('no debe incluir estudiantes dados de baja del grupo', async () => {
      const setup = await createFullSetup();
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Inscribir y luego dar de baja
      const inscripcion = await createTestInscripcionClaseGrupo(
        prisma,
        estudiante.id,
        setup.claseGrupo.id,
        tutor.id,
      );
      await prisma.inscripcionClaseGrupo.update({
        where: { id: inscripcion.id },
        data: { fecha_baja: new Date() },
      });

      // Crear progreso
      await crearProgresoClase(estudiante.id, setup.clases[0].id, {
        teoriaCompletada: true,
      });

      const cookies = await loginDocente(setup.docente.email, setup.password);

      const response = await request(app.getHttpServer())
        .get(`/api/docentes/asignaciones/${setup.asignacion.id}/progreso`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      // No debe retornar el progreso porque el estudiante fue dado de baja
      expect(response.body.progresos).toHaveLength(0);
    });
  });

  // ============================================================================
  // ORDENAMIENTO
  // ============================================================================
  describe('Ordenamiento', () => {
    it('debe ordenar por número de clase ascendente', async () => {
      const setup = await createFullSetup({ cantidadClases: 3 });
      const { estudiante } = await inscribirEstudiante(setup.claseGrupo.id);

      // Crear progreso en orden inverso
      await crearProgresoClase(estudiante.id, setup.clases[2].id, {
        teoriaCompletada: true,
      });
      await crearProgresoClase(estudiante.id, setup.clases[0].id, {
        teoriaCompletada: true,
      });
      await crearProgresoClase(estudiante.id, setup.clases[1].id, {
        teoriaCompletada: true,
      });

      const cookies = await loginDocente(setup.docente.email, setup.password);

      const response = await request(app.getHttpServer())
        .get(`/api/docentes/asignaciones/${setup.asignacion.id}/progreso`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.progresos).toHaveLength(3);
      expect(response.body.progresos[0].clase_numero).toBe(1);
      expect(response.body.progresos[1].clase_numero).toBe(2);
      expect(response.body.progresos[2].clase_numero).toBe(3);
    });
  });
});
