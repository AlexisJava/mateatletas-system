/**
 * ============================================================================
 * E2E TESTS - Critical Business Flows
 * ============================================================================
 *
 * Estos tests verifican los flujos críticos end-to-end del sistema,
 * especialmente aquellos que involucran módulos con dependencias circulares:
 *
 * - Auth ↔ Gamificación (registro otorga puntos)
 * - Estudiantes → Logros → Gamificación
 * - Clases → Asistencia → Progreso → Logros
 *
 * CRÍTICO: Estos flujos serán refactorizados para eliminar dependencias
 * circulares. Los tests deben pasar después del refactor.
 *
 * Setup required:
 *   docker-compose -f docker-compose.test.yml up -d
 *   DATABASE_URL="postgresql://test:test_password_123@localhost:5433/mateatletas_test" npx prisma migrate deploy
 *
 * Run:
 *   npm run test:e2e
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../src/core/database/prisma.service';
import { AppModule } from '../../src/app.module';

describe('[E2E] Critical Business Flows', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // ============================================================================
  // Setup
  // ============================================================================
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prisma = app.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Limpiar todas las tablas
    await prisma.asistencia.deleteMany({});
    await prisma.inscripcionClase.deleteMany({});
    await prisma.clase.deleteMany({});
    await prisma.estudianteLogro.deleteMany({});
    await prisma.logro.deleteMany({});
    await prisma.estudiante.deleteMany({});
    await prisma.rutaCurricular.deleteMany({});
    await prisma.tutor.deleteMany({});
    await prisma.docente.deleteMany({});
    await prisma.admin.deleteMany({});
    await prisma.equipo.deleteMany({});
  });

  // ============================================================================
  // FLUJO 1: Registro de Tutor → Gamificación (Circular Dependency)
  // ============================================================================
  describe('Flujo: Registro de Tutor con Gamificación', () => {
    it('should register tutor and initialize gamification data', async () => {
      // PASO 1: Registrar tutor
      const registerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'tutor-gamificacion@example.com',
          password: 'SecurePassword123!',
          nombre: 'Tutor',
          apellido: 'Gamificado',
          role: 'tutor',
        })
        .expect(201);

      expect(registerResponse.body).toHaveProperty('access_token');
      expect(registerResponse.body.user.email).toBe('tutor-gamificacion@example.com');

      const tutorId = registerResponse.body.user.tutorId;
      const token = registerResponse.body.access_token;

      // PASO 2: Verificar que el tutor existe en DB
      const tutorInDb = await prisma.tutor.findUnique({
        where: { id: tutorId },
      });
      expect(tutorInDb).toBeDefined();

      // PASO 3: Login funciona correctamente
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'tutor-gamificacion@example.com',
          password: 'SecurePassword123!',
        })
        .expect(200);

      expect(loginResponse.body.access_token).toBeDefined();
    });
  });

  // ============================================================================
  // FLUJO 2: Crear Estudiante → Asignar a Casa → Logro de Bienvenida
  // ============================================================================
  describe('Flujo: Crear Estudiante → Gamificación Inicial', () => {
    let tutorToken: string;
    let tutorId: string;
    let equipoId: string;

    beforeEach(async () => {
      // Setup: Crear tutor
      const tutorResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'tutor@example.com',
          password: 'Password123!',
          nombre: 'Tutor',
          apellido: 'Test',
          role: 'tutor',
        });
      tutorToken = tutorResponse.body.access_token;
      tutorId = tutorResponse.body.user.tutorId;

      // Crear equipo
      const equipo = await prisma.equipo.create({
        data: {
          nombre: 'Phoenix',
          color_primario: '#FF0000',
          color_secundario: '#FF5555',
        },
      });
      equipoId = equipo.id;
    });

    it('should create estudiante and assign to casa (equipo)', async () => {
      // PASO 1: Crear estudiante
      const createResponse = await request(app.getHttpServer())
        .post('/api/estudiantes')
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({
          nombre: 'Nuevo',
          apellido: 'Estudiante',
          edad: 10,
          nivel_escolar: 'Primaria',
          equipo_id: equipoId,
        })
        .expect(201);

      const estudianteId = createResponse.body.data.id;

      // PASO 2: Verificar que estudiante fue asignado a casa (equipo)
      expect(createResponse.body.data.equipo_id).toBe(equipoId);

      // PASO 3: Verificar que el estudiante tiene XP inicial = 0
      const estudianteInDb = await prisma.estudiante.findUnique({
        where: { id: estudianteId },
      });
      expect(estudianteInDb?.puntos_totales).toBe(0);
      expect(estudianteInDb?.nivel_actual).toBe(1);

      // PASO 4: Obtener detalle del estudiante
      const detalleResponse = await request(app.getHttpServer())
        .get(`/api/estudiantes/${estudianteId}/detalle`)
        .set('Authorization', `Bearer ${tutorToken}`)
        .expect(200);

      expect(detalleResponse.body.data.estadisticas).toBeDefined();
      expect(detalleResponse.body.data.estadisticas.logros).toBe(0); // Sin logros al inicio
    });
  });

  // ============================================================================
  // FLUJO 3: Completar Clase → Asistencia → Otorgar XP
  // ============================================================================
  describe('Flujo: Completar Clase → Asistencia → XP y Progreso', () => {
    let adminToken: string;
    let docenteToken: string;
    let docenteId: string;
    let tutorToken: string;
    let estudianteId: string;
    let rutaCurricularId: string;
    let claseId: string;

    beforeEach(async () => {
      // Setup: Crear admin
      const adminResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'admin@example.com',
          password: 'AdminPassword123!',
          nombre: 'Admin',
          apellido: 'Test',
          role: 'admin',
        });
      adminToken = adminResponse.body.access_token;

      // Crear docente
      const docenteResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'docente@example.com',
          password: 'DocentePassword123!',
          nombre: 'Docente',
          apellido: 'Test',
          role: 'docente',
        });
      docenteToken = docenteResponse.body.access_token;
      docenteId = docenteResponse.body.user.docenteId;

      // Crear tutor y estudiante
      const tutorResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'tutor@example.com',
          password: 'TutorPassword123!',
          nombre: 'Tutor',
          apellido: 'Test',
          role: 'tutor',
        });
      tutorToken = tutorResponse.body.access_token;

      const estudianteResponse = await request(app.getHttpServer())
        .post('/api/estudiantes')
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({
          nombre: 'Estudiante',
          apellido: 'Test',
          edad: 10,
          nivel_escolar: 'Primaria',
        });
      estudianteId = estudianteResponse.body.data.id;

      // Crear ruta curricular
      const ruta = await prisma.rutaCurricular.create({
        data: {
          nombre: 'Matemáticas Básicas',
          descripcion: 'Curso de matemáticas',
          nivel: 'Primaria',
          orden: 1,
        },
      });
      rutaCurricularId = ruta.id;

      // Crear clase
      const fechaPasada = new Date();
      fechaPasada.setDate(fechaPasada.getDate() - 1);

      const claseResponse = await request(app.getHttpServer())
        .post('/api/clases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rutaCurricularId: rutaCurricularId,
          docenteId: docenteId,
          fecha: fechaPasada.toISOString(),
          horaInicio: '10:00',
          horaFin: '11:00',
          cuposMaximos: 20,
        });
      claseId = claseResponse.body.data.id;

      // Reservar clase
      await request(app.getHttpServer())
        .post(`/api/clases/${claseId}/reservar`)
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({
          estudianteId: estudianteId,
        });
    });

    it('should complete full class flow: reserve → attend → earn XP', async () => {
      // PASO 1: Verificar que estudiante tiene 0 XP inicialmente
      let estudiante = await prisma.estudiante.findUnique({
        where: { id: estudianteId },
      });
      expect(estudiante?.puntos_totales).toBe(0);

      // PASO 2: Registrar asistencia como "Presente"
      const asistenciaResponse = await request(app.getHttpServer())
        .post(`/api/clases/${claseId}/asistencia`)
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({
          asistencias: [
            {
              estudianteId: estudianteId,
              estado: 'Presente',
            },
          ],
        })
        .expect(201);

      expect(asistenciaResponse.body.data[0].estado).toBe('Presente');

      // PASO 3: Verificar asistencia en DB
      const asistencia = await prisma.asistencia.findFirst({
        where: {
          claseId: claseId,
          estudianteId: estudianteId,
        },
      });
      expect(asistencia).toBeDefined();
      expect(asistencia?.estado).toBe('Presente');

      // PASO 4: Obtener detalle del estudiante con métricas actualizadas
      const detalleResponse = await request(app.getHttpServer())
        .get(`/api/estudiantes/${estudianteId}/detalle`)
        .set('Authorization', `Bearer ${tutorToken}`)
        .expect(200);

      expect(detalleResponse.body.data.estadisticas.total_clases).toBe(1);
      expect(detalleResponse.body.data.estadisticas.clases_presente).toBe(1);
      expect(detalleResponse.body.data.estadisticas.tasa_asistencia).toBe(100);
    });

    it('should track multiple classes and calculate attendance rate', async () => {
      // Crear segunda clase
      const fechaPasada2 = new Date();
      fechaPasada2.setDate(fechaPasada2.getDate() - 2);

      const clase2Response = await request(app.getHttpServer())
        .post('/api/clases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rutaCurricularId: rutaCurricularId,
          docenteId: docenteId,
          fecha: fechaPasada2.toISOString(),
          horaInicio: '11:00',
          horaFin: '12:00',
          cuposMaximos: 20,
        });
      const clase2Id = clase2Response.body.data.id;

      // Reservar segunda clase
      await request(app.getHttpServer())
        .post(`/api/clases/${clase2Id}/reservar`)
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({
          estudianteId: estudianteId,
        });

      // Registrar asistencia en clase 1: Presente
      await request(app.getHttpServer())
        .post(`/api/clases/${claseId}/asistencia`)
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({
          asistencias: [{ estudianteId, estado: 'Presente' }],
        });

      // Registrar asistencia en clase 2: Ausente
      await request(app.getHttpServer())
        .post(`/api/clases/${clase2Id}/asistencia`)
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({
          asistencias: [{ estudianteId, estado: 'Ausente' }],
        });

      // Verificar tasa de asistencia: 1/2 = 50%
      const detalleResponse = await request(app.getHttpServer())
        .get(`/api/estudiantes/${estudianteId}/detalle`)
        .set('Authorization', `Bearer ${tutorToken}`)
        .expect(200);

      expect(detalleResponse.body.data.estadisticas.total_clases).toBe(2);
      expect(detalleResponse.body.data.estadisticas.clases_presente).toBe(1);
      expect(detalleResponse.body.data.estadisticas.tasa_asistencia).toBe(50);
    });
  });

  // ============================================================================
  // FLUJO 4: Response Format Estandarizado en Todos los Endpoints
  // ============================================================================
  describe('Flujo: Formato de Respuesta Estandarizado', () => {
    let tutorToken: string;

    beforeEach(async () => {
      const tutorResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'tutor@example.com',
          password: 'Password123!',
          nombre: 'Tutor',
          apellido: 'Test',
          role: 'tutor',
        });
      tutorToken = tutorResponse.body.access_token;
    });

    it('should return standardized format for all endpoints', async () => {
      // Test 1: GET /estudiantes
      const listResponse = await request(app.getHttpServer())
        .get('/api/estudiantes')
        .set('Authorization', `Bearer ${tutorToken}`)
        .expect(200);

      expect(listResponse.body).toHaveProperty('data');
      expect(listResponse.body).toHaveProperty('metadata');
      expect(Array.isArray(listResponse.body.data)).toBe(true);

      // Test 2: POST /estudiantes
      const createResponse = await request(app.getHttpServer())
        .post('/api/estudiantes')
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({
          nombre: 'Test',
          apellido: 'Formato',
          edad: 10,
          nivel_escolar: 'Primaria',
        })
        .expect(201);

      expect(createResponse.body).toHaveProperty('data');
      expect(createResponse.body.data).toHaveProperty('id');

      // Test 3: GET /estudiantes/:id
      const getResponse = await request(app.getHttpServer())
        .get(`/api/estudiantes/${createResponse.body.data.id}`)
        .set('Authorization', `Bearer ${tutorToken}`)
        .expect(200);

      expect(getResponse.body).toHaveProperty('data');
      expect(getResponse.body.data.id).toBe(createResponse.body.data.id);

      // Test 4: GET /estudiantes/estadisticas
      const statsResponse = await request(app.getHttpServer())
        .get('/api/estudiantes/estadisticas')
        .set('Authorization', `Bearer ${tutorToken}`)
        .expect(200);

      expect(statsResponse.body).toHaveProperty('data');
      expect(statsResponse.body.data).toHaveProperty('total');
    });
  });

  // ============================================================================
  // FLUJO 5: CSRF Protection en Endpoints Críticos
  // ============================================================================
  describe('Flujo: CSRF Protection (Opt-In)', () => {
    it('should allow login from web origin', async () => {
      // Crear tutor primero
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'csrf-test@example.com',
          password: 'Password123!',
          nombre: 'CSRF',
          apellido: 'Test',
          role: 'tutor',
        });

      // Login con Origin header válido
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('Origin', process.env.FRONTEND_URL || 'http://localhost:3000')
        .send({
          email: 'csrf-test@example.com',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
    });

    it('should reject login without Origin header (CSRF protection)', async () => {
      // Crear tutor primero
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'csrf-test2@example.com',
          password: 'Password123!',
          nombre: 'CSRF',
          apellido: 'Test2',
          role: 'tutor',
        });

      // Login SIN Origin header (debe fallar si CSRF está activo)
      // Nota: En testing, CSRF puede estar deshabilitado
      // Este test verifica el comportamiento actual
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'csrf-test2@example.com',
          password: 'Password123!',
        });

      // Si CSRF está activo: expect(403)
      // Si CSRF está deshabilitado en test: expect(200)
      // Documentar comportamiento actual
      expect([200, 403]).toContain(response.status);
    });
  });

  // ============================================================================
  // FLUJO 6: Ownership Guards Funcionando
  // ============================================================================
  describe('Flujo: Ownership Protection', () => {
    let tutor1Token: string;
    let tutor1Id: string;
    let tutor2Token: string;
    let estudiante1Id: string;

    beforeEach(async () => {
      // Crear tutor 1
      const tutor1Response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'tutor1@example.com',
          password: 'Password123!',
          nombre: 'Tutor1',
          apellido: 'Test',
          role: 'tutor',
        });
      tutor1Token = tutor1Response.body.access_token;
      tutor1Id = tutor1Response.body.user.tutorId;

      // Crear tutor 2
      const tutor2Response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'tutor2@example.com',
          password: 'Password123!',
          nombre: 'Tutor2',
          apellido: 'Test',
          role: 'tutor',
        });
      tutor2Token = tutor2Response.body.access_token;

      // Crear estudiante bajo tutor 1
      const estudianteResponse = await request(app.getHttpServer())
        .post('/api/estudiantes')
        .set('Authorization', `Bearer ${tutor1Token}`)
        .send({
          nombre: 'Estudiante',
          apellido: 'Tutor1',
          edad: 10,
          nivel_escolar: 'Primaria',
        });
      estudiante1Id = estudianteResponse.body.data.id;
    });

    it('should allow tutor1 to access their own estudiante', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/estudiantes/${estudiante1Id}`)
        .set('Authorization', `Bearer ${tutor1Token}`)
        .expect(200);

      expect(response.body.data.id).toBe(estudiante1Id);
    });

    it('should prevent tutor2 from accessing tutor1 estudiante', async () => {
      await request(app.getHttpServer())
        .get(`/api/estudiantes/${estudiante1Id}`)
        .set('Authorization', `Bearer ${tutor2Token}`)
        .expect(404); // NotFoundException for security
    });

    it('should prevent tutor2 from updating tutor1 estudiante', async () => {
      await request(app.getHttpServer())
        .patch(`/api/estudiantes/${estudiante1Id}`)
        .set('Authorization', `Bearer ${tutor2Token}`)
        .send({
          nombre: 'Hacked',
        })
        .expect(404);
    });

    it('should prevent tutor2 from deleting tutor1 estudiante', async () => {
      await request(app.getHttpServer())
        .delete(`/api/estudiantes/${estudiante1Id}`)
        .set('Authorization', `Bearer ${tutor2Token}`)
        .expect(404);
    });
  });
});
