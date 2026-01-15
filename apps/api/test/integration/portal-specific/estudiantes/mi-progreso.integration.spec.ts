/**
 * ============================================================================
 * INTEGRATION TESTS - Mi Progreso (Endpoint Consolidado)
 * ============================================================================
 *
 * Tests de integración para el endpoint GET /estudiantes/mi-progreso
 *
 * Este endpoint retorna datos consolidados de gamificación:
 * - Datos del estudiante (nombre, casa)
 * - XP, nivel, porcentaje de progreso
 * - Racha actual y máxima
 * - Logros desbloqueados (últimos 5)
 * - Actividades recientes (últimas 10)
 *
 * Setup required:
 *   docker-compose -f docker-compose.test.yml up -d
 *   DATABASE_URL="postgresql://test:test_password_123@localhost:5433/mateatletas_test"
 *
 * Run:
 *   yarn workspace api test --testPathPattern="mi-progreso.integration" --runInBand
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
  createTestTutor,
  createTestDocente,
  createTestEstudiante,
  createTestLogro,
  createTestActividadFeed,
} from '../../../fixtures/factories';
import {
  generateUniqueIP,
  loginEstudianteRaw,
  FRONTEND_ORIGIN,
} from '../../../helpers/auth.helpers';

describe('[INTEGRATION] Mi Progreso - Endpoint Consolidado', () => {
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
  // Helper wrapper para usar el helper centralizado con la app actual
  async function loginEstudiante(
    username: string,
    password: string,
  ): Promise<string[]> {
    return loginEstudianteRaw(app, { username, password });
  }

  // ============================================================================
  // HAPPY PATH
  // ============================================================================
  describe('GET /estudiantes/mi-progreso - Happy Path', () => {
    it('debe retornar estructura completa para estudiante con datos', async () => {
      // ARRANGE - Estudiante con XP y racha
      // NOTA: El primer login otorga +25 XP (logro PRIMER_INGRESO si existe en DB)
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
        xpInicial: 250,
        rachaInicial: 5,
      });
      const cookies = await loginEstudiante(estudiante.username, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mi-progreso')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);

      // Estructura del estudiante
      expect(response.body.estudiante).toBeDefined();
      expect(response.body.estudiante.id).toBe(estudiante.id);
      expect(response.body.estudiante.nombre).toBe(estudiante.nombre);

      // Gamificación - XP base 250, puede tener bonus de primer login (+25)
      expect(response.body.gamificacion).toBeDefined();
      expect(response.body.gamificacion.xp_total).toBeGreaterThanOrEqual(250);
      expect(response.body.gamificacion.nivel).toBeGreaterThanOrEqual(1);
      expect(response.body.gamificacion.porcentaje_nivel).toBeDefined();

      // Racha
      expect(response.body.racha).toBeDefined();
      expect(response.body.racha.racha_actual).toBe(5);
      expect(response.body.racha.racha_maxima).toBe(5);

      // Logros
      expect(response.body.logros).toBeDefined();
      expect(response.body.logros.desbloqueados).toBeDefined();
      expect(response.body.logros.totales).toBeDefined();
      expect(Array.isArray(response.body.logros.recientes)).toBe(true);

      // Actividad reciente
      expect(Array.isArray(response.body.actividad_reciente)).toBe(true);
    });

    it('debe retornar valores iniciales para estudiante nuevo', async () => {
      // ARRANGE - Estudiante sin XP ni logros
      // NOTA: El primer login puede otorgar +25 XP (logro PRIMER_INGRESO si existe en DB)
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
        xpInicial: 0,
        rachaInicial: 0,
      });
      const cookies = await loginEstudiante(estudiante.username, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mi-progreso')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);
      // XP puede ser 0 o 25 (bonus primer login si existe logro PRIMER_INGRESO)
      expect(response.body.gamificacion.xp_total).toBeGreaterThanOrEqual(0);
      expect(response.body.gamificacion.xp_total).toBeLessThanOrEqual(25);
      expect(response.body.gamificacion.nivel).toBe(1);
      expect(response.body.racha.racha_actual).toBe(0);
      // Puede tener 0 o 1 logro (PRIMER_INGRESO si existe)
      expect(response.body.logros.desbloqueados).toBeGreaterThanOrEqual(0);
      expect(response.body.logros.desbloqueados).toBeLessThanOrEqual(1);
    });

    it('debe incluir logros recientes ordenados por fecha', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Crear logros y desbloquearlos
      const logro1 = await createTestLogro(prisma, {
        codigo: 'test_logro_1',
        nombre: 'Primer Logro',
        xp_recompensa: 50,
      });
      const logro2 = await createTestLogro(prisma, {
        codigo: 'test_logro_2',
        nombre: 'Segundo Logro',
        xp_recompensa: 100,
      });

      // Desbloquear logros con fechas diferentes
      await prisma.logroEstudiante.create({
        data: {
          estudiante_id: estudiante.id,
          logro_id: logro1.id,
          fecha_desbloqueo: new Date('2024-01-01'),
        },
      });
      await prisma.logroEstudiante.create({
        data: {
          estudiante_id: estudiante.id,
          logro_id: logro2.id,
          fecha_desbloqueo: new Date('2024-01-02'),
        },
      });

      const cookies = await loginEstudiante(estudiante.username, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mi-progreso')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.logros.desbloqueados).toBe(2);
      expect(response.body.logros.recientes.length).toBe(2);
      // El más reciente primero
      expect(response.body.logros.recientes[0].nombre).toBe('Segundo Logro');
    });

    it('debe limitar logros recientes a 5', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Crear 7 logros
      for (let i = 1; i <= 7; i++) {
        const logro = await createTestLogro(prisma, {
          codigo: `test_logro_${i}`,
          nombre: `Logro ${i}`,
        });
        await prisma.logroEstudiante.create({
          data: {
            estudiante_id: estudiante.id,
            logro_id: logro.id,
          },
        });
      }

      const cookies = await loginEstudiante(estudiante.username, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mi-progreso')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.logros.desbloqueados).toBe(7);
      expect(response.body.logros.recientes.length).toBe(5);
    });

    it('debe incluir actividades recientes', async () => {
      // ARRANGE
      // NOTA: El primer login puede crear actividad de logro PRIMER_INGRESO
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Crear actividades
      await createTestActividadFeed(prisma, estudiante.id, {
        tipo: 'LECCION_COMPLETADA',
        mensaje: 'Completó Lección 1',
        xpGanado: 50,
      });
      await createTestActividadFeed(prisma, estudiante.id, {
        tipo: 'NIVEL_SUBIDO',
        mensaje: 'Subió al nivel 2',
        xpGanado: 0,
      });

      const cookies = await loginEstudiante(estudiante.username, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mi-progreso')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);
      // 2 actividades creadas + posible actividad de PRIMER_INGRESO
      expect(response.body.actividad_reciente.length).toBeGreaterThanOrEqual(2);
      expect(response.body.actividad_reciente[0].tipo).toBeDefined();
      expect(response.body.actividad_reciente[0].mensaje).toBeDefined();
    });

    it('debe limitar actividades recientes a 10', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Crear 15 actividades
      for (let i = 1; i <= 15; i++) {
        await createTestActividadFeed(prisma, estudiante.id, {
          mensaje: `Actividad ${i}`,
        });
      }

      const cookies = await loginEstudiante(estudiante.username, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mi-progreso')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.actividad_reciente.length).toBe(10);
    });
  });

  // ============================================================================
  // CASOS DE ERROR
  // ============================================================================
  describe('GET /estudiantes/mi-progreso - Errores', () => {
    it('debe retornar 401 sin token', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mi-progreso')
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(401);
    });

    it('debe retornar 403 con token de docente', async () => {
      // ARRANGE - Login como docente
      const { docente, password } = await createTestDocente(prisma);

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({ email: docente.email, password });

      const cookies = loginResponse.headers['set-cookie'] ?? [];

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mi-progreso')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT - Debería ser 403 Forbidden (rol incorrecto)
      expect([401, 403]).toContain(response.status);
    });
  });

  // ============================================================================
  // CAMPOS ESPECÍFICOS
  // ============================================================================
  describe('GET /estudiantes/mi-progreso - Validación de campos', () => {
    it('gamificacion debe tener todos los campos requeridos', async () => {
      // ARRANGE
      // NOTA: El primer login puede agregar +25 XP (logro PRIMER_INGRESO)
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
        xpInicial: 500, // Nivel 3 (sqrt(500/100) + 1 = 3.23 → nivel 3)
      });
      const cookies = await loginEstudiante(estudiante.username, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mi-progreso')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);

      const { gamificacion } = response.body;
      // XP base 500, puede tener bonus de primer login (+25)
      expect(gamificacion.xp_total).toBeGreaterThanOrEqual(500);
      expect(gamificacion.nivel).toBe(3);
      expect(typeof gamificacion.xp_progreso).toBe('number');
      expect(typeof gamificacion.xp_necesario).toBe('number');
      expect(typeof gamificacion.porcentaje_nivel).toBe('number');
      expect(gamificacion.porcentaje_nivel).toBeGreaterThanOrEqual(0);
      expect(gamificacion.porcentaje_nivel).toBeLessThanOrEqual(100);
    });

    it('racha debe incluir ultima_actividad cuando existe', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
        rachaInicial: 3,
      });

      // Actualizar racha con última actividad
      await prisma.rachaEstudiante.update({
        where: { estudiante_id: estudiante.id },
        data: {
          ultima_actividad: new Date(),
          total_dias_activos: 10,
        },
      });

      const cookies = await loginEstudiante(estudiante.username, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mi-progreso')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.racha.racha_actual).toBe(3);
      expect(response.body.racha.total_dias_activos).toBe(10);
      expect(response.body.racha.ultima_actividad).toBeDefined();
    });
  });
});
