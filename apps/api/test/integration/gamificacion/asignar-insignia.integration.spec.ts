/**
 * ============================================================================
 * INTEGRATION TESTS - POST /gamificacion/asignar-insignia
 * ============================================================================
 *
 * Asigna una insignia predefinida a un estudiante durante clase en vivo.
 * Las insignias son predefinidas en el frontend y se registran como puntos con contexto.
 *
 * NOTA ARQUITECTÓNICA:
 * - claseId es OPCIONAL porque el frontend de clases en vivo usa ClaseGrupo
 *   (grupos recurrentes), no Clase (clases individuales con cupos)
 * - Cuando se proporciona claseId, debe existir en la tabla Clase
 * - El modelo PuntoObtenido.clase_id ya es nullable en Prisma
 *
 * EQUIVALENCE CLASSES:
 * - Auth: [válido-docente, válido-admin, válido-estudiante, válido-tutor, inválido]
 * - Estudiante: [existe-activo, no-existe]
 * - Clase: [existe, no-existe, null/undefined]
 * - Puntos: [positivos, cero, negativos]
 *
 * BOUNDARIES:
 * - puntos: 1 (mínimo válido), 0 (inválido), -1 (inválido), 100+ (válido alto)
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: cd apps/api && npx jest --config test/jest-e2e.json --testPathPattern="asignar-insignia.integration" --runInBand
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
  createTestEstudiante,
  createTestTutor,
  createTestAdmin,
  createTestClase,
} from '../../fixtures/factories';
import { generateUniqueIP, FRONTEND_ORIGIN } from '../../helpers/auth.helpers';

describe('[INTEGRATION] POST /gamificacion/asignar-insignia', () => {
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
  // HELPERS: Login
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
      throw new Error(
        `Login failed: ${response.status} - ${JSON.stringify(response.body)}`,
      );
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
      throw new Error(
        `Login failed: ${response.status} - ${JSON.stringify(response.body)}`,
      );
    }

    return response.headers['set-cookie'] as string[];
  }

  async function loginAdmin(
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
  // HELPER: Crear setup completo
  // ============================================================================
  async function createFullSetup() {
    const { docente, password } = await createTestDocente(prisma);
    const { estudiante } = await createTestEstudiante(prisma);
    const admin = await createTestAdmin(prisma);

    // Crear una Clase real (no ClaseGrupo)
    const clase = await createTestClase(prisma, {
      docenteId: docente.id,
    });

    return {
      docente,
      password,
      estudiante,
      admin,
      clase,
    };
  }

  // ============================================================================
  // PAYLOAD VÁLIDO BASE (sin claseId - es opcional)
  // ============================================================================
  function createValidPayload(estudianteId: string, claseId?: string) {
    const payload: Record<string, unknown> = {
      estudianteId,
      insigniaId: 'participacion',
      nombre: 'Participación Activa',
      descripcion: 'Por participar activamente en clase',
      puntos: 20,
    };

    if (claseId !== undefined) {
      payload.claseId = claseId;
    }

    return payload;
  }

  // ============================================================================
  // CATEGORÍA 1: AUTENTICACIÓN Y AUTORIZACIÓN
  // ============================================================================
  describe('Equivalence Partitioning: Autenticación', () => {
    it('Clase INVÁLIDO (sin token): debe retornar 401', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .send(createValidPayload('some-id'));

      expect(response.status).toBe(401);
    });

    it('Clase INVÁLIDO (token malformado): debe retornar 401', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', ['auth-token=invalid-token'])
        .send(createValidPayload('some-id'));

      expect(response.status).toBe(401);
    });

    it('Clase ESTUDIANTE: debe retornar 403', async () => {
      const { estudiante, password } = await createTestEstudiante(prisma);
      const cookies = await loginEstudianteHelper(
        estudiante.username,
        password,
      );

      const response = await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send(createValidPayload(estudiante.id));

      expect(response.status).toBe(403);
    });

    it('Clase TUTOR: debe retornar 403', async () => {
      const { tutor, password } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      const cookies = await loginTutor(tutor.email, password);

      const response = await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send(createValidPayload(estudiante.id));

      expect(response.status).toBe(403);
    });

    it('Clase DOCENTE: debe permitir acceso', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);

      const response = await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send(createValidPayload(setup.estudiante.id));

      expect(response.status).toBe(201);
    });

    it('Clase ADMIN: debe retornar 403 (solo docentes pueden asignar insignias)', async () => {
      const setup = await createFullSetup();
      const cookies = await loginAdmin(setup.admin.email, 'TestPassword123!');

      const response = await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send(createValidPayload(setup.estudiante.id));

      expect(response.status).toBe(403);
    });
  });

  // ============================================================================
  // CATEGORÍA 2: VALIDACIÓN DE PARÁMETROS
  // ============================================================================
  describe('Equivalence Partitioning: Validación de Payload', () => {
    it('debe retornar 400 si falta estudianteId', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);

      const payload = {
        insigniaId: 'participacion',
        nombre: 'Participación Activa',
        descripcion: 'Por participar activamente en clase',
        puntos: 20,
      };

      const response = await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send(payload);

      expect(response.status).toBe(400);
    });

    it('claseId es OPCIONAL - debe aceptar sin claseId', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);

      const payload = {
        estudianteId: setup.estudiante.id,
        insigniaId: 'participacion',
        nombre: 'Participación Activa',
        descripcion: 'Por participar activamente en clase',
        puntos: 20,
      };

      const response = await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send(payload);

      expect(response.status).toBe(201);

      // Verificar que clase_id es null en la DB
      const puntoObtenido = await prisma.puntoObtenido.findFirst({
        where: { estudiante_id: setup.estudiante.id },
      });
      expect(puntoObtenido?.clase_id).toBeNull();
    });

    it('debe retornar 400 si falta insigniaId', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);

      const payload = {
        estudianteId: setup.estudiante.id,
        nombre: 'Participación Activa',
        descripcion: 'Por participar activamente en clase',
        puntos: 20,
      };

      const response = await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send(payload);

      expect(response.status).toBe(400);
    });

    it('debe retornar 400 si falta nombre', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);

      const payload = {
        estudianteId: setup.estudiante.id,
        insigniaId: 'participacion',
        descripcion: 'Por participar activamente en clase',
        puntos: 20,
      };

      const response = await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send(payload);

      expect(response.status).toBe(400);
    });

    it('debe retornar 400 si falta puntos', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);

      const payload = {
        estudianteId: setup.estudiante.id,
        insigniaId: 'participacion',
        nombre: 'Participación Activa',
        descripcion: 'Por participar activamente en clase',
      };

      const response = await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send(payload);

      expect(response.status).toBe(400);
    });
  });

  // ============================================================================
  // CATEGORÍA 3: BOUNDARY VALUE ANALYSIS - PUNTOS
  // ============================================================================
  describe('Boundary Value Analysis: Puntos', () => {
    it('puntos=1 (mínimo válido): debe aceptar', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);

      const payload = createValidPayload(setup.estudiante.id);
      payload.puntos = 1;

      const response = await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('puntos=0 (inválido): debe retornar 400', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);

      const payload = createValidPayload(setup.estudiante.id);
      payload.puntos = 0;

      const response = await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send(payload);

      expect(response.status).toBe(400);
    });

    it('puntos=-1 (negativo): debe retornar 400', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);

      const payload = createValidPayload(setup.estudiante.id);
      payload.puntos = -1;

      const response = await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send(payload);

      expect(response.status).toBe(400);
    });

    it('puntos=100 (alto válido): debe aceptar', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);

      const payload = createValidPayload(setup.estudiante.id);
      payload.puntos = 100;

      const response = await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send(payload);

      expect(response.status).toBe(201);

      // Verificar XP actualizado
      const recursos = await prisma.recursosEstudiante.findUnique({
        where: { estudiante_id: setup.estudiante.id },
      });
      expect(recursos?.xp_total).toBe(100);
    });
  });

  // ============================================================================
  // CATEGORÍA 4: RECURSOS NO ENCONTRADOS
  // ============================================================================
  describe('Equivalence Partitioning: Recursos', () => {
    it('estudiante no existe: debe retornar 404', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);

      const payload = createValidPayload(
        '00000000-0000-0000-0000-000000000000',
      );

      const response = await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send(payload);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Estudiante no encontrado');
    });

    it('clase no existe (cuando se proporciona claseId): debe retornar 404', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);

      const payload = createValidPayload(
        setup.estudiante.id,
        '00000000-0000-0000-0000-000000000000',
      );

      const response = await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send(payload);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Clase no encontrada');
    });
  });

  // ============================================================================
  // CATEGORÍA 5: HAPPY PATHS
  // ============================================================================
  describe('Happy Paths', () => {
    it('debe asignar insignia SIN claseId (caso común en clases en vivo)', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);

      const payload = {
        estudianteId: setup.estudiante.id,
        insigniaId: 'participacion',
        nombre: 'Participación Activa',
        descripcion: 'Por participar activamente en clase',
        puntos: 20,
      };

      const response = await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.puntoObtenido).toBeDefined();
      expect(response.body.puntoObtenido.puntos).toBe(20);
      expect(response.body.xp).toBeDefined();

      // Verificar en DB - PuntoObtenido
      const puntoObtenido = await prisma.puntoObtenido.findFirst({
        where: { estudiante_id: setup.estudiante.id },
      });
      expect(puntoObtenido).not.toBeNull();
      expect(puntoObtenido?.tipo_accion).toBe('LOGRO');
      expect(puntoObtenido?.puntos).toBe(20);
      expect(puntoObtenido?.contexto).toContain('Participación Activa');
      expect(puntoObtenido?.contexto).toContain('participacion');
      expect(puntoObtenido?.clase_id).toBeNull(); // Sin clase asociada
      expect(puntoObtenido?.docente_id).toBe(setup.docente.id);

      // Verificar en DB - RecursosEstudiante
      const recursos = await prisma.recursosEstudiante.findUnique({
        where: { estudiante_id: setup.estudiante.id },
      });
      expect(recursos?.xp_total).toBe(20);
    });

    it('debe asignar insignia CON claseId válido', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);

      const payload = {
        estudianteId: setup.estudiante.id,
        claseId: setup.clase.id,
        insigniaId: 'participacion',
        nombre: 'Participación Activa',
        descripcion: 'Por participar activamente en clase',
        puntos: 20,
      };

      const response = await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      // Verificar en DB - clase_id debe estar asociado
      const puntoObtenido = await prisma.puntoObtenido.findFirst({
        where: { estudiante_id: setup.estudiante.id },
      });
      expect(puntoObtenido?.clase_id).toBe(setup.clase.id);
    });

    it('debe incluir información de la insignia en el contexto', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);

      const payload = {
        estudianteId: setup.estudiante.id,
        insigniaId: 'creatividad',
        nombre: 'Mente Creativa',
        descripcion: 'Por una solución creativa',
        puntos: 30,
      };

      await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send(payload)
        .expect(201);

      const puntoObtenido = await prisma.puntoObtenido.findFirst({
        where: { estudiante_id: setup.estudiante.id },
      });

      expect(puntoObtenido?.contexto).toContain('Mente Creativa');
      expect(puntoObtenido?.contexto).toContain('Por una solución creativa');
      expect(puntoObtenido?.contexto).toContain('creatividad');
    });
  });

  // ============================================================================
  // CATEGORÍA 6: MÚLTIPLES ASIGNACIONES
  // ============================================================================
  describe('Múltiples Asignaciones', () => {
    it('debe permitir asignar múltiples insignias al mismo estudiante', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);

      // Primera insignia
      await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send({
          estudianteId: setup.estudiante.id,
          insigniaId: 'participacion',
          nombre: 'Participación Activa',
          descripcion: 'Por participar',
          puntos: 20,
        })
        .expect(201);

      // Segunda insignia
      await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send({
          estudianteId: setup.estudiante.id,
          insigniaId: 'creatividad',
          nombre: 'Mente Creativa',
          descripcion: 'Por creatividad',
          puntos: 30,
        })
        .expect(201);

      // Verificar que hay dos registros
      const puntosObtenidos = await prisma.puntoObtenido.findMany({
        where: { estudiante_id: setup.estudiante.id },
      });
      expect(puntosObtenidos).toHaveLength(2);

      // Verificar XP acumulado
      const recursos = await prisma.recursosEstudiante.findUnique({
        where: { estudiante_id: setup.estudiante.id },
      });
      expect(recursos?.xp_total).toBe(50);
    });

    it('debe permitir la misma insignia múltiples veces (no es idempotente)', async () => {
      const setup = await createFullSetup();
      const cookies = await loginDocente(setup.docente.email, setup.password);

      const payload = {
        estudianteId: setup.estudiante.id,
        insigniaId: 'participacion',
        nombre: 'Participación Activa',
        descripcion: 'Por participar',
        puntos: 20,
      };

      // Asignar la misma insignia 3 veces
      await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send(payload)
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send(payload)
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send(payload)
        .expect(201);

      // Verificar 3 registros separados
      const puntosObtenidos = await prisma.puntoObtenido.findMany({
        where: { estudiante_id: setup.estudiante.id },
      });
      expect(puntosObtenidos).toHaveLength(3);

      // Verificar XP acumulado (20 * 3 = 60)
      const recursos = await prisma.recursosEstudiante.findUnique({
        where: { estudiante_id: setup.estudiante.id },
      });
      expect(recursos?.xp_total).toBe(60);
    });
  });

  // ============================================================================
  // CATEGORÍA 7: AISLAMIENTO ENTRE ESTUDIANTES
  // ============================================================================
  describe('Aislamiento entre Estudiantes', () => {
    it('asignar insignia a un estudiante NO afecta a otros', async () => {
      const setup = await createFullSetup();
      const { estudiante: otroEstudiante } = await createTestEstudiante(prisma);
      const cookies = await loginDocente(setup.docente.email, setup.password);

      // Asignar insignia solo al primer estudiante
      await request(app.getHttpServer())
        .post('/api/gamificacion/asignar-insignia')
        .set('Cookie', cookies)
        .send({
          estudianteId: setup.estudiante.id,
          insigniaId: 'participacion',
          nombre: 'Participación Activa',
          descripcion: 'Por participar',
          puntos: 50,
        })
        .expect(201);

      // Verificar que el otro estudiante tiene 0 XP
      const recursosOtro = await prisma.recursosEstudiante.findUnique({
        where: { estudiante_id: otroEstudiante.id },
      });
      expect(recursosOtro?.xp_total).toBe(0);

      // Verificar que el otro estudiante no tiene puntos obtenidos
      const puntosOtro = await prisma.puntoObtenido.findMany({
        where: { estudiante_id: otroEstudiante.id },
      });
      expect(puntosOtro).toHaveLength(0);
    });
  });
});
