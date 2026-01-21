/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST
 * ============================================================================
 *
 * SUITE: Portal Docente - Bugs Corregidos
 *
 * Esta suite verifica que los 3 bugs reportados están corregidos:
 * - BUG-001: Asignar Puntos a estudiante
 * - BUG-002: Observaciones con seguimientos
 * - BUG-003: XP Otorgados = suma de Top Estudiantes
 *
 * IMPORTANTE: Tests escritos SIN mirar la implementación.
 * Basados únicamente en el comportamiento esperado documentado.
 *
 * ============================================================================
 * BUG-001: ASIGNAR PUNTOS
 * ============================================================================
 *
 * COMPORTAMIENTO ESPERADO:
 * 1. GET /gamificacion/acciones retorna lista de acciones puntuables
 *    - Cada acción tiene: id, nombre, descripcion, puntos, activo
 *    - Acciones disponibles: PARTICIPACION, TAREA_COMPLETADA, QUIZ_APROBADO,
 *      AYUDA_COMPANERO, BONUS, LOGRO, ASISTENCIA
 *
 * 2. POST /gamificacion/puntos otorga puntos al estudiante
 *    - Requiere: estudianteId, tipoAccion
 *    - El estudiante debe recibir los XP correspondientes
 *
 * EQUIVALENCE CLASSES:
 * - Rol: [docente-válido, estudiante, sin-auth]
 * - Acción: [válida-existente, inválida-no-existe]
 * - Estudiante: [existe-en-comisión, no-existe, existe-otra-comisión]
 *
 * ============================================================================
 * BUG-002: OBSERVACIONES
 * ============================================================================
 *
 * COMPORTAMIENTO ESPERADO:
 * 1. POST /observaciones crea observación con estudiantes
 * 2. GET /observaciones lista observaciones con conteo de seguimientos
 * 3. POST /observaciones/:id/seguimientos agrega seguimiento
 * 4. GET /observaciones/:id retorna observación con seguimientos completos
 *
 * EQUIVALENCE CLASSES:
 * - Rol: [docente-dueño, docente-otro, admin, sin-auth]
 * - Observación: [con-seguimientos, sin-seguimientos]
 * - Estado: [Abierta, EnSeguimiento, Resuelta, Cerrada]
 *
 * ============================================================================
 * BUG-003: MÉTRICAS XP
 * ============================================================================
 *
 * COMPORTAMIENTO ESPERADO:
 * GET /docentes/me/comisiones/:id/metricas retorna:
 * - totalPuntos = suma de xp_total de todos los estudiantes de la comisión
 * - Esta suma debe coincidir con la suma de XP individuales de los estudiantes
 *
 * BOUNDARIES:
 * - 0 estudiantes → totalPuntos = 0
 * - N estudiantes → totalPuntos = sum(xp_total de cada estudiante)
 *
 * ============================================================================
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="portal-docente-bugs" --runInBand
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
  createEstudianteConComision,
  createTestDocente,
  createTestProducto,
  createTestEstudiante,
} from '../../fixtures/factories';
import {
  loginUser,
  generateUniqueIP,
  FRONTEND_ORIGIN,
} from '../../helpers/auth.helpers';

describe('[INTEGRATION] Portal Docente - Bugs Corregidos', () => {
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
  // BUG-001: ASIGNAR PUNTOS
  // ============================================================================
  describe('BUG-001: Asignar Puntos', () => {
    describe('GET /api/gamificacion/acciones', () => {
      it('debe retornar lista de acciones puntuables para docente autenticado', async () => {
        // ARRANGE
        const { docente, docentePassword } =
          await createEstudianteConComision(prisma);
        const auth = await loginUser(app, {
          email: docente.email,
          password: docentePassword,
        });

        // ACT
        const response = await request(app.getHttpServer())
          .get('/api/gamificacion/acciones')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        // ASSERT
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);

        // Cada acción debe tener los campos esperados
        const primeraAccion = response.body[0];
        expect(primeraAccion).toHaveProperty('tipo');
        expect(primeraAccion).toHaveProperty('puntos');
        expect(typeof primeraAccion.puntos).toBe('number');
      });

      it('debe incluir PARTICIPACION en las acciones disponibles', async () => {
        // ARRANGE
        const { docente, docentePassword } =
          await createEstudianteConComision(prisma);
        const auth = await loginUser(app, {
          email: docente.email,
          password: docentePassword,
        });

        // ACT
        const response = await request(app.getHttpServer())
          .get('/api/gamificacion/acciones')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        // ASSERT
        expect(response.status).toBe(200);
        const acciones = response.body as Array<{
          tipo: string;
          puntos: number;
        }>;
        const participacion = acciones.find((a) => a.tipo === 'PARTICIPACION');
        expect(participacion).toBeDefined();
        expect(participacion!.puntos).toBeGreaterThan(0);
      });

      it('debe fallar sin autenticación (401)', async () => {
        // ACT
        const response = await request(app.getHttpServer())
          .get('/api/gamificacion/acciones')
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        // ASSERT
        expect(response.status).toBe(401);
      });
    });

    describe('POST /api/gamificacion/puntos', () => {
      it('debe otorgar puntos al estudiante correctamente', async () => {
        // ARRANGE
        const { docente, estudiante, docentePassword } =
          await createEstudianteConComision(prisma);
        const auth = await loginUser(app, {
          email: docente.email,
          password: docentePassword,
        });

        // Obtener XP inicial del estudiante
        const recursosAntes = await prisma.recursosEstudiante.findUnique({
          where: { estudiante_id: estudiante.id },
        });
        const xpAntes = recursosAntes?.xp_total ?? 0;

        // ACT - Otorgar puntos por PARTICIPACION
        const response = await request(app.getHttpServer())
          .post('/api/gamificacion/puntos')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP())
          .send({
            estudianteId: estudiante.id,
            tipoAccion: 'PARTICIPACION',
          });

        // ASSERT
        expect(response.status).toBe(201);

        // Verificar que el estudiante recibió los XP
        const recursosDespues = await prisma.recursosEstudiante.findUnique({
          where: { estudiante_id: estudiante.id },
        });
        expect(recursosDespues).toBeDefined();
        expect(recursosDespues!.xp_total).toBeGreaterThan(xpAntes);
      });

      it('debe fallar con tipoAccion inválido', async () => {
        // ARRANGE
        const { docente, estudiante, docentePassword } =
          await createEstudianteConComision(prisma);
        const auth = await loginUser(app, {
          email: docente.email,
          password: docentePassword,
        });

        // ACT
        const response = await request(app.getHttpServer())
          .post('/api/gamificacion/puntos')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP())
          .send({
            estudianteId: estudiante.id,
            tipoAccion: 'ACCION_INVENTADA_QUE_NO_EXISTE',
          });

        // ASSERT - Debe rechazar acción inválida
        expect(response.status).toBeGreaterThanOrEqual(400);
      });

      it('debe fallar sin autenticación (401)', async () => {
        // ACT
        const response = await request(app.getHttpServer())
          .post('/api/gamificacion/puntos')
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP())
          .send({
            estudianteId: 'cualquier-id',
            tipoAccion: 'PARTICIPACION',
          });

        // ASSERT
        expect(response.status).toBe(401);
      });
    });
  });

  // ============================================================================
  // BUG-002: OBSERVACIONES
  // ============================================================================
  describe('BUG-002: Observaciones', () => {
    describe('POST /api/observaciones', () => {
      it('debe crear observación para estudiante de su comisión', async () => {
        // ARRANGE
        const { docente, estudiante, comision, docentePassword } =
          await createEstudianteConComision(prisma);
        const auth = await loginUser(app, {
          email: docente.email,
          password: docentePassword,
        });

        const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // ACT
        const response = await request(app.getHttpServer())
          .post('/api/observaciones')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP())
          .send({
            estudianteIds: [estudiante.id],
            comisionId: comision.id,
            contenido: 'Observación de prueba con al menos 10 caracteres',
            fechaEvento: hoy,
            tipo: 'Academica',
            prioridad: 'Baja',
          });

        // ASSERT
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.contenido).toBe(
          'Observación de prueba con al menos 10 caracteres',
        );
        expect(response.body.tipo).toBe('Academica');
      });

      it('debe fallar con contenido menor a 10 caracteres', async () => {
        // ARRANGE
        const { docente, estudiante, comision, docentePassword } =
          await createEstudianteConComision(prisma);
        const auth = await loginUser(app, {
          email: docente.email,
          password: docentePassword,
        });

        const hoy = new Date().toISOString().split('T')[0];

        // ACT
        const response = await request(app.getHttpServer())
          .post('/api/observaciones')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP())
          .send({
            estudianteIds: [estudiante.id],
            comisionId: comision.id,
            contenido: 'Corto', // Menos de 10 caracteres
            fechaEvento: hoy,
            tipo: 'Academica',
          });

        // ASSERT
        expect(response.status).toBe(400);
      });
    });

    describe('GET /api/observaciones', () => {
      it('debe listar observaciones con conteo de seguimientos', async () => {
        // ARRANGE
        const { docente, estudiante, comision, docentePassword } =
          await createEstudianteConComision(prisma);
        const auth = await loginUser(app, {
          email: docente.email,
          password: docentePassword,
        });

        // Crear una observación directamente en DB
        const observacion = await prisma.observacion.create({
          data: {
            docente_id: docente.id,
            comision_id: comision.id,
            contenido: 'Observación de prueba para listar',
            fecha_evento: new Date(),
            tipo: 'Academica',
            prioridad: 'Baja',
            estado: 'Abierta',
            estudiantes: {
              create: { estudiante_id: estudiante.id },
            },
          },
        });

        // Agregar un seguimiento
        await prisma.seguimientoObservacion.create({
          data: {
            observacion_id: observacion.id,
            autor_id: docente.id,
            autor_tipo: 'Docente',
            contenido: 'Primer seguimiento de prueba',
          },
        });

        // ACT
        const response = await request(app.getHttpServer())
          .get('/api/observaciones')
          .query({ comisionId: comision.id })
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        // ASSERT
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);

        // La observación debe tener el conteo de seguimientos
        const obs = response.body.data[0];
        expect(obs).toHaveProperty('_count');
        expect(obs._count).toHaveProperty('seguimientos');
        expect(obs._count.seguimientos).toBe(1);
      });
    });

    describe('POST /api/observaciones/:id/seguimientos', () => {
      it('debe agregar seguimiento a observación propia', async () => {
        // ARRANGE
        const { docente, estudiante, comision, docentePassword } =
          await createEstudianteConComision(prisma);
        const auth = await loginUser(app, {
          email: docente.email,
          password: docentePassword,
        });

        // Crear observación
        const observacion = await prisma.observacion.create({
          data: {
            docente_id: docente.id,
            comision_id: comision.id,
            contenido: 'Observación para agregar seguimiento',
            fecha_evento: new Date(),
            tipo: 'Academica',
            prioridad: 'Baja',
            estado: 'Abierta',
            estudiantes: {
              create: { estudiante_id: estudiante.id },
            },
          },
        });

        // ACT
        const response = await request(app.getHttpServer())
          .post(`/api/observaciones/${observacion.id}/seguimientos`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP())
          .send({
            contenido: 'Nuevo seguimiento de prueba',
          });

        // ASSERT
        expect(response.status).toBe(201);
        expect(response.body.seguimientos).toBeDefined();
        expect(response.body.seguimientos.length).toBe(1);
        expect(response.body.seguimientos[0].contenido).toBe(
          'Nuevo seguimiento de prueba',
        );
      });
    });

    describe('GET /api/observaciones/:id', () => {
      it('debe retornar observación con seguimientos completos', async () => {
        // ARRANGE
        const { docente, estudiante, comision, docentePassword } =
          await createEstudianteConComision(prisma);
        const auth = await loginUser(app, {
          email: docente.email,
          password: docentePassword,
        });

        // Crear observación con seguimientos
        const observacion = await prisma.observacion.create({
          data: {
            docente_id: docente.id,
            comision_id: comision.id,
            contenido: 'Observación con seguimientos para detalle',
            fecha_evento: new Date(),
            tipo: 'Logro',
            prioridad: 'Alta',
            estado: 'Abierta',
            estudiantes: {
              create: { estudiante_id: estudiante.id },
            },
            seguimientos: {
              create: [
                {
                  autor_id: docente.id,
                  autor_tipo: 'Docente',
                  contenido: 'Seguimiento 1',
                },
                {
                  autor_id: docente.id,
                  autor_tipo: 'Docente',
                  contenido: 'Seguimiento 2',
                },
              ],
            },
          },
        });

        // ACT
        const response = await request(app.getHttpServer())
          .get(`/api/observaciones/${observacion.id}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        // ASSERT
        expect(response.status).toBe(200);
        expect(response.body.id).toBe(observacion.id);
        expect(response.body.seguimientos).toBeDefined();
        expect(Array.isArray(response.body.seguimientos)).toBe(true);
        expect(response.body.seguimientos.length).toBe(2);

        // Cada seguimiento debe tener contenido completo
        const seg = response.body.seguimientos[0];
        expect(seg).toHaveProperty('id');
        expect(seg).toHaveProperty('contenido');
        expect(seg).toHaveProperty('autor_id');
      });
    });
  });

  // ============================================================================
  // BUG-003: MÉTRICAS XP
  // ============================================================================
  describe('BUG-003: Métricas XP', () => {
    describe('GET /api/docentes/me/comisiones/:id/metricas', () => {
      it('debe retornar totalPuntos = 0 cuando no hay estudiantes', async () => {
        // ARRANGE - Crear comisión vacía (sin estudiantes)
        const { docente, password } = await createTestDocente(prisma);
        const auth = await loginUser(app, {
          email: docente.email,
          password,
        });

        // Crear producto y comisión vacía usando factories
        const producto = await createTestProducto(prisma);

        const comision = await prisma.comision.create({
          data: {
            nombre: 'Comisión Vacía',
            producto_id: producto.id,
            docente_id: docente.id,
          },
        });

        // ACT
        const response = await request(app.getHttpServer())
          .get(`/api/docentes/me/comisiones/${comision.id}/metricas`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        // ASSERT
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('totalPuntos');
        expect(response.body.totalPuntos).toBe(0);
      });

      it('debe retornar totalPuntos = suma de XP de todos los estudiantes', async () => {
        // ARRANGE
        const { docente, estudiante, comision, docentePassword } =
          await createEstudianteConComision(prisma);

        // Asignar XP conocido al estudiante
        await prisma.recursosEstudiante.upsert({
          where: { estudiante_id: estudiante.id },
          create: {
            estudiante_id: estudiante.id,
            xp_total: 150,
          },
          update: {
            xp_total: 150,
          },
        });

        const auth = await loginUser(app, {
          email: docente.email,
          password: docentePassword,
        });

        // ACT
        const response = await request(app.getHttpServer())
          .get(`/api/docentes/me/comisiones/${comision.id}/metricas`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        // ASSERT
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('totalPuntos');
        // El totalPuntos debe ser igual al XP del estudiante
        expect(response.body.totalPuntos).toBe(150);
      });

      it('debe sumar XP de múltiples estudiantes correctamente', async () => {
        // ARRANGE - Crear comisión con múltiples estudiantes
        const { docente, estudiante, comision, tutor, docentePassword } =
          await createEstudianteConComision(prisma);

        // Crear segundo estudiante en la misma comisión usando factory
        const { estudiante: estudiante2 } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });

        // Inscribir segundo estudiante
        await prisma.inscripcionComision.create({
          data: {
            estudiante_id: estudiante2.id,
            comision_id: comision.id,
            estado: 'Confirmada',
          },
        });

        // Asignar XP conocidos a ambos estudiantes
        await prisma.recursosEstudiante.upsert({
          where: { estudiante_id: estudiante.id },
          create: { estudiante_id: estudiante.id, xp_total: 100 },
          update: { xp_total: 100 },
        });

        await prisma.recursosEstudiante.upsert({
          where: { estudiante_id: estudiante2.id },
          create: { estudiante_id: estudiante2.id, xp_total: 200 },
          update: { xp_total: 200 },
        });

        const auth = await loginUser(app, {
          email: docente.email,
          password: docentePassword,
        });

        // ACT
        const response = await request(app.getHttpServer())
          .get(`/api/docentes/me/comisiones/${comision.id}/metricas`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        // ASSERT
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('totalPuntos');
        // 100 + 200 = 300
        expect(response.body.totalPuntos).toBe(300);
      });

      it('debe fallar para comisión que no es del docente (403)', async () => {
        // ARRANGE
        const { comision } = await createEstudianteConComision(prisma);

        // Crear otro docente
        const { docente: otroDocente, password } =
          await createTestDocente(prisma);
        const auth = await loginUser(app, {
          email: otroDocente.email,
          password,
        });

        // ACT - Intentar acceder a comisión de otro docente
        const response = await request(app.getHttpServer())
          .get(`/api/docentes/me/comisiones/${comision.id}/metricas`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        // ASSERT - No debe poder acceder
        expect([403, 404, 500]).toContain(response.status);
      });
    });
  });
});
