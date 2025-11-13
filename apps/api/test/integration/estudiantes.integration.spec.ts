/**
 * ============================================================================
 * INTEGRATION TESTS - Estudiantes Module
 * ============================================================================
 *
 * Estos tests corren contra una base de datos REAL (PostgreSQL de test).
 * Verifican el flujo completo de operaciones CRUD de estudiantes.
 *
 * CRÍTICO: Estos tests cubren funcionalidad que será refactorizada.
 * Cualquier refactor debe pasar estos tests para evitar regresiones.
 *
 * Setup required:
 *   docker-compose -f docker-compose.test.yml up -d
 *   DATABASE_URL="postgresql://test:test_password_123@localhost:5433/mateatletas_test" npx prisma migrate deploy
 *
 * Run:
 *   npm run test:integration
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../src/core/database/prisma.service';
import { AppModule } from '../../src/app.module';

describe('[INTEGRATION] Estudiantes Module', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tutorId: string;
  let authToken: string;
  let equipoId: string;

  // ============================================================================
  // Setup: Levantar aplicación con DB real
  // ============================================================================
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Aplicar los mismos pipes que en producción
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

  // ============================================================================
  // Cleanup: Limpiar DB antes de cada test
  // ============================================================================
  beforeEach(async () => {
    // Limpiar tablas en orden (respetando foreign keys)
    await prisma.estudiante.deleteMany({});
    await prisma.tutor.deleteMany({});
    await prisma.equipo.deleteMany({});

    // Crear tutor de prueba para todos los tests
    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'tutor-test@example.com',
        password: 'SecurePassword123!',
        nombre: 'Tutor',
        apellido: 'Test',
        role: 'tutor',
      });

    tutorId = registerResponse.body.user.tutorId;
    authToken = registerResponse.body.access_token;

    // Crear equipo de prueba
    const equipo = await prisma.equipo.create({
      data: {
        nombre: 'Equipo Rojo',
        color_primario: '#FF0000',
        color_secundario: '#FF5555',
      },
    });
    equipoId = equipo.id;
  });

  // ============================================================================
  // TEST 1: CRUD Básico de Estudiantes
  // ============================================================================
  describe('POST /estudiantes - Crear estudiante', () => {
    it('should create estudiante successfully with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/estudiantes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: 'Juan',
          apellido: 'Pérez',
          edad: 10,
          nivelEscolar: 'Primaria',
          equipoId: equipoId,
        })
        .expect(201);

      // Verificar estructura de respuesta estandarizada
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.nombre).toBe('Juan');
      expect(response.body.data.apellido).toBe('Pérez');
      expect(response.body.data.edad).toBe(10);
      expect(response.body.data.nivelEscolar).toBe('Primaria');
      expect(response.body.data.equipoId).toBe(equipoId);

      // Verificar username autogenerado
      expect(response.body.data.username).toMatch(/juan\.perez/i);

      // Verificar que existe en DB
      const estudianteInDb = await prisma.estudiante.findUnique({
        where: { id: response.body.data.id },
      });
      expect(estudianteInDb).toBeDefined();
      expect(estudianteInDb?.tutor_id).toBe(tutorId);
    });

    it('should create estudiante without equipoId', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/estudiantes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: 'María',
          apellido: 'González',
          edad: 12,
          nivelEscolar: 'Secundaria',
        })
        .expect(201);

      expect(response.body.data.equipoId).toBeNull();
    });

    it('should reject edad < 3', async () => {
      await request(app.getHttpServer())
        .post('/api/estudiantes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: 'Bebé',
          apellido: 'Test',
          edad: 2,
          nivelEscolar: 'Preescolar',
        })
        .expect(400);
    });

    it('should reject edad > 99', async () => {
      await request(app.getHttpServer())
        .post('/api/estudiantes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: 'Anciano',
          apellido: 'Test',
          edad: 100,
          nivelEscolar: 'Universidad',
        })
        .expect(400);
    });

    it('should reject non-existent equipoId', async () => {
      await request(app.getHttpServer())
        .post('/api/estudiantes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: 'Test',
          apellido: 'Test',
          edad: 10,
          nivelEscolar: 'Primaria',
          equipoId: 'non-existent-id',
        })
        .expect(404);
    });

    it('should generate unique usernames for duplicate names', async () => {
      // Crear primer estudiante
      const response1 = await request(app.getHttpServer())
        .post('/api/estudiantes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: 'Pedro',
          apellido: 'García',
          edad: 10,
          nivelEscolar: 'Primaria',
        })
        .expect(201);

      // Crear segundo estudiante con mismo nombre
      const response2 = await request(app.getHttpServer())
        .post('/api/estudiantes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: 'Pedro',
          apellido: 'García',
          edad: 11,
          nivelEscolar: 'Primaria',
        })
        .expect(201);

      // Verificar que los usernames son diferentes
      expect(response1.body.data.username).not.toBe(response2.body.data.username);
      expect(response2.body.data.username).toMatch(/pedro\.garcia\d+/i);
    });
  });

  // ============================================================================
  // TEST 2: Listar Estudiantes con Filtros y Paginación
  // ============================================================================
  describe('GET /estudiantes - Listar estudiantes', () => {
    beforeEach(async () => {
      // Crear varios estudiantes de prueba
      await prisma.estudiante.createMany({
        data: [
          {
            nombre: 'Est1',
            apellido: 'Primaria',
            username: 'est1.primaria',
            edad: 8,
            nivelEscolar: 'Primaria',
            tutor_id: tutorId,
            equipoId: equipoId,
          },
          {
            nombre: 'Est2',
            apellido: 'Primaria',
            username: 'est2.primaria',
            edad: 9,
            nivelEscolar: 'Primaria',
            tutor_id: tutorId,
            equipoId: equipoId,
          },
          {
            nombre: 'Est3',
            apellido: 'Secundaria',
            username: 'est3.secundaria',
            edad: 13,
            nivelEscolar: 'Secundaria',
            tutor_id: tutorId,
          },
        ],
      });
    });

    it('should return all estudiantes for tutor', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.metadata).toMatchObject({
        total: 3,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter by equipoId', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes')
        .query({ equipoId: equipoId })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((e: any) => e.equipoId === equipoId)).toBe(true);
    });

    it('should filter by nivelEscolar', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes')
        .query({ nivelEscolar: 'Primaria' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((e: any) => e.nivelEscolar === 'Primaria')).toBe(true);
    });

    it('should paginate correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes')
        .query({ page: 1, limit: 2 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.metadata).toMatchObject({
        total: 3,
        page: 1,
        limit: 2,
        totalPages: 2,
      });
    });

    it('should return empty array for tutor without estudiantes', async () => {
      // Crear otro tutor
      const response2 = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'tutor2@example.com',
          password: 'Password123!',
          nombre: 'Tutor2',
          apellido: 'Test',
          role: 'tutor',
        });

      const token2 = response2.body.access_token;

      const response = await request(app.getHttpServer())
        .get('/api/estudiantes')
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.metadata.total).toBe(0);
    });
  });

  // ============================================================================
  // TEST 3: Obtener Estudiante Individual (Ownership)
  // ============================================================================
  describe('GET /estudiantes/:id - Obtener estudiante', () => {
    let estudianteId: string;
    let otroTutorToken: string;

    beforeEach(async () => {
      // Crear estudiante
      const estudiante = await prisma.estudiante.create({
        data: {
          nombre: 'Test',
          apellido: 'Estudiante',
          username: 'test.estudiante',
          edad: 10,
          nivelEscolar: 'Primaria',
          tutor_id: tutorId,
        },
      });
      estudianteId = estudiante.id;

      // Crear otro tutor
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'otro-tutor@example.com',
          password: 'Password123!',
          nombre: 'Otro',
          apellido: 'Tutor',
          role: 'tutor',
        });
      otroTutorToken = response.body.access_token;
    });

    it('should return estudiante for owner tutor', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/estudiantes/${estudianteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.id).toBe(estudianteId);
      expect(response.body.data.nombre).toBe('Test');
    });

    it('should reject access from non-owner tutor', async () => {
      await request(app.getHttpServer())
        .get(`/api/estudiantes/${estudianteId}`)
        .set('Authorization', `Bearer ${otroTutorToken}`)
        .expect(404); // NotFoundException por seguridad
    });

    it('should return 404 for non-existent estudiante', async () => {
      await request(app.getHttpServer())
        .get('/api/estudiantes/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  // ============================================================================
  // TEST 4: Actualizar Estudiante
  // ============================================================================
  describe('PATCH /estudiantes/:id - Actualizar estudiante', () => {
    let estudianteId: string;

    beforeEach(async () => {
      const estudiante = await prisma.estudiante.create({
        data: {
          nombre: 'Original',
          apellido: 'Nombre',
          username: 'original.nombre',
          edad: 10,
          nivelEscolar: 'Primaria',
          tutor_id: tutorId,
        },
      });
      estudianteId = estudiante.id;
    });

    it('should update estudiante successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/estudiantes/${estudianteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: 'Actualizado',
          edad: 11,
        })
        .expect(200);

      expect(response.body.data.nombre).toBe('Actualizado');
      expect(response.body.data.edad).toBe(11);
      expect(response.body.data.apellido).toBe('Nombre'); // No cambió

      // Verificar en DB
      const estudianteInDb = await prisma.estudiante.findUnique({
        where: { id: estudianteId },
      });
      expect(estudianteInDb?.nombre).toBe('Actualizado');
      expect(estudianteInDb?.edad).toBe(11);
    });

    it('should validate edad on update', async () => {
      await request(app.getHttpServer())
        .patch(`/api/estudiantes/${estudianteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ edad: 2 })
        .expect(400);
    });

    it('should validate equipo exists when updating equipoId', async () => {
      await request(app.getHttpServer())
        .patch(`/api/estudiantes/${estudianteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ equipoId: 'non-existent' })
        .expect(404);
    });

    it('should update equipoId to valid equipo', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/estudiantes/${estudianteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ equipoId: equipoId })
        .expect(200);

      expect(response.body.data.equipoId).toBe(equipoId);
    });
  });

  // ============================================================================
  // TEST 5: Eliminar Estudiante
  // ============================================================================
  describe('DELETE /estudiantes/:id - Eliminar estudiante', () => {
    let estudianteId: string;

    beforeEach(async () => {
      const estudiante = await prisma.estudiante.create({
        data: {
          nombre: 'ToDelete',
          apellido: 'Test',
          username: 'todelete.test',
          edad: 10,
          nivelEscolar: 'Primaria',
          tutor_id: tutorId,
        },
      });
      estudianteId = estudiante.id;
    });

    it('should delete estudiante successfully', async () => {
      await request(app.getHttpServer())
        .delete(`/api/estudiantes/${estudianteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verificar que no existe en DB
      const estudianteInDb = await prisma.estudiante.findUnique({
        where: { id: estudianteId },
      });
      expect(estudianteInDb).toBeNull();
    });

    it('should return 404 for non-existent estudiante', async () => {
      await request(app.getHttpServer())
        .delete('/api/estudiantes/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  // ============================================================================
  // TEST 6: Estadísticas de Estudiantes
  // ============================================================================
  describe('GET /estudiantes/estadisticas - Obtener estadísticas', () => {
    beforeEach(async () => {
      // Crear estudiantes con diferentes características
      await prisma.estudiante.createMany({
        data: [
          {
            nombre: 'Est1',
            apellido: 'Test',
            username: 'est1.test',
            edad: 8,
            nivelEscolar: 'Primaria',
            puntos_totales: 100,
            tutor_id: tutorId,
            equipoId: equipoId,
          },
          {
            nombre: 'Est2',
            apellido: 'Test',
            username: 'est2.test',
            edad: 9,
            nivelEscolar: 'Primaria',
            puntos_totales: 200,
            tutor_id: tutorId,
            equipoId: equipoId,
          },
          {
            nombre: 'Est3',
            apellido: 'Test',
            username: 'est3.test',
            edad: 13,
            nivelEscolar: 'Secundaria',
            puntos_totales: 300,
            tutor_id: tutorId,
          },
        ],
      });
    });

    it('should return correct statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/estadisticas')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        total: 3,
        puntos_totales: 600,
      });

      expect(response.body.data.por_nivel).toMatchObject({
        Primaria: 2,
        Secundaria: 1,
      });

      expect(response.body.data.por_equipo['Equipo Rojo']).toBe(2);
      expect(response.body.data.por_equipo['Sin equipo']).toBe(1);
    });
  });

  // ============================================================================
  // TEST 7: Detalle Completo de Estudiante (con métricas)
  // ============================================================================
  describe('GET /estudiantes/:id/detalle - Obtener detalle completo', () => {
    let estudianteId: string;

    beforeEach(async () => {
      const estudiante = await prisma.estudiante.create({
        data: {
          nombre: 'Detalle',
          apellido: 'Test',
          username: 'detalle.test',
          edad: 10,
          nivelEscolar: 'Primaria',
          tutor_id: tutorId,
        },
      });
      estudianteId = estudiante.id;
    });

    it('should return complete student details with statistics', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/estudiantes/${estudianteId}/detalle`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('id', estudianteId);
      expect(response.body.data).toHaveProperty('estadisticas');
      expect(response.body.data.estadisticas).toMatchObject({
        total_clases: 0,
        clases_presente: 0,
        tasa_asistencia: 0,
        logros: 0,
      });
    });
  });
});
