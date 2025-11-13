/**
 * ============================================================================
 * INTEGRATION TESTS - Clases Module
 * ============================================================================
 *
 * Estos tests corren contra una base de datos REAL (PostgreSQL de test).
 * Verifican el flujo completo de operaciones de clases, reservas y asistencia.
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

describe('[INTEGRATION] Clases Module', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let adminId: string;
  let tutorToken: string;
  let tutorId: string;
  let docenteToken: string;
  let docenteId: string;
  let estudianteId: string;
  let rutaCurricularId: string;

  // ============================================================================
  // Setup: Levantar aplicación con DB real
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

  // ============================================================================
  // Cleanup: Limpiar DB antes de cada test
  // ============================================================================
  beforeEach(async () => {
    // Limpiar tablas en orden (respetando foreign keys)
    await prisma.asistencia.deleteMany({});
    await prisma.inscripcionClase.deleteMany({});
    await prisma.clase.deleteMany({});
    await prisma.estudiante.deleteMany({});
    await prisma.rutaCurricular.deleteMany({});
    await prisma.tutor.deleteMany({});
    await prisma.docente.deleteMany({});
    await prisma.admin.deleteMany({});

    // Crear admin
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
    adminId = adminResponse.body.user.adminId;

    // Crear tutor
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
    tutorId = tutorResponse.body.user.tutorId;

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

    // Crear estudiante
    const estudiante = await prisma.estudiante.create({
      data: {
        nombre: 'Estudiante',
        apellido: 'Test',
        username: 'estudiante.test',
        edad: 10,
        nivel_escolar: 'Primaria',
        tutor_id: tutorId,
      },
    });
    estudianteId = estudiante.id;

    // Crear ruta curricular
    const ruta = await prisma.rutaCurricular.create({
      data: {
        nombre: 'Matemáticas Básicas',
        descripcion: 'Curso de matemáticas para primaria',
        nivel: 'Primaria',
        orden: 1,
      },
    });
    rutaCurricularId = ruta.id;
  });

  // ============================================================================
  // TEST 1: Programar Clases (Admin)
  // ============================================================================
  describe('POST /clases - Programar clase', () => {
    it('should create clase successfully as admin', async () => {
      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 7);

      const response = await request(app.getHttpServer())
        .post('/api/clases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rutaCurricularId: rutaCurricularId,
          docenteId: docenteId,
          fecha: fechaFutura.toISOString(),
          horaInicio: '10:00',
          horaFin: '11:00',
          cuposMaximos: 20,
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.rutaCurricularId).toBe(rutaCurricularId);
      expect(response.body.data.docenteId).toBe(docenteId);
      expect(response.body.data.estado).toBe('Programada');
      expect(response.body.data.cuposMaximos).toBe(20);
      expect(response.body.data.cuposDisponibles).toBe(20);

      // Verificar en DB
      const claseInDb = await prisma.clase.findUnique({
        where: { id: response.body.data.id },
      });
      expect(claseInDb).toBeDefined();
    });

    it('should reject clase creation by tutor (forbidden)', async () => {
      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 7);

      await request(app.getHttpServer())
        .post('/api/clases')
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({
          rutaCurricularId: rutaCurricularId,
          docenteId: docenteId,
          fecha: fechaFutura.toISOString(),
          horaInicio: '10:00',
          horaFin: '11:00',
          cuposMaximos: 20,
        })
        .expect(403);
    });

    it('should validate horaFin > horaInicio', async () => {
      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 7);

      await request(app.getHttpServer())
        .post('/api/clases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rutaCurricularId: rutaCurricularId,
          docenteId: docenteId,
          fecha: fechaFutura.toISOString(),
          horaInicio: '11:00',
          horaFin: '10:00', // Hora fin antes de hora inicio
          cuposMaximos: 20,
        })
        .expect(400);
    });

    it('should reject non-existent rutaCurricular', async () => {
      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 7);

      await request(app.getHttpServer())
        .post('/api/clases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rutaCurricularId: 'non-existent-id',
          docenteId: docenteId,
          fecha: fechaFutura.toISOString(),
          horaInicio: '10:00',
          horaFin: '11:00',
          cuposMaximos: 20,
        })
        .expect(404);
    });

    it('should reject non-existent docente', async () => {
      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 7);

      await request(app.getHttpServer())
        .post('/api/clases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rutaCurricularId: rutaCurricularId,
          docenteId: 'non-existent-id',
          fecha: fechaFutura.toISOString(),
          horaInicio: '10:00',
          horaFin: '11:00',
          cuposMaximos: 20,
        })
        .expect(404);
    });
  });

  // ============================================================================
  // TEST 2: Listar Clases
  // ============================================================================
  describe('GET /clases - Listar clases', () => {
    let claseId: string;

    beforeEach(async () => {
      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 7);

      const clase = await prisma.clase.create({
        data: {
          rutaCurricularId: rutaCurricularId,
          docenteId: docenteId,
          fecha: fechaFutura,
          horaInicio: '10:00',
          horaFin: '11:00',
          cuposMaximos: 20,
          cuposDisponibles: 20,
          estado: 'Programada',
        },
      });
      claseId = clase.id;
    });

    it('should list all clases as admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/clases')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(claseId);
    });

    it('should filter by estado', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/clases')
        .query({ estado: 'Programada' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].estado).toBe('Programada');
    });

    it('should filter by docenteId', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/clases')
        .query({ docenteId })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].docenteId).toBe(docenteId);
    });
  });

  // ============================================================================
  // TEST 3: Reservar Clase (Tutor)
  // ============================================================================
  describe('POST /clases/:id/reservar - Reservar clase', () => {
    let claseId: string;

    beforeEach(async () => {
      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 7);

      const clase = await prisma.clase.create({
        data: {
          rutaCurricularId: rutaCurricularId,
          docenteId: docenteId,
          fecha: fechaFutura,
          horaInicio: '10:00',
          horaFin: '11:00',
          cuposMaximos: 20,
          cuposDisponibles: 20,
          estado: 'Programada',
        },
      });
      claseId = clase.id;
    });

    it('should reserve clase successfully', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/clases/${claseId}/reservar`)
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({
          estudianteId: estudianteId,
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.claseId).toBe(claseId);
      expect(response.body.data.estudianteId).toBe(estudianteId);

      // Verificar que los cupos disminuyeron
      const claseActualizada = await prisma.clase.findUnique({
        where: { id: claseId },
      });
      expect(claseActualizada?.cuposDisponibles).toBe(19);

      // Verificar inscripción en DB
      const inscripcion = await prisma.inscripcionClase.findFirst({
        where: {
          claseId: claseId,
          estudianteId: estudianteId,
        },
      });
      expect(inscripcion).toBeDefined();
    });

    it('should reject duplicate reservation', async () => {
      // Primera reserva
      await request(app.getHttpServer())
        .post(`/api/clases/${claseId}/reservar`)
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({
          estudianteId: estudianteId,
        })
        .expect(201);

      // Segunda reserva (debe fallar)
      await request(app.getHttpServer())
        .post(`/api/clases/${claseId}/reservar`)
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({
          estudianteId: estudianteId,
        })
        .expect(400); // Estudiante ya inscrito
    });

    it('should reject reservation when no cupos available', async () => {
      // Crear clase con 1 cupo
      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 7);
      const claseConUnCupo = await prisma.clase.create({
        data: {
          rutaCurricularId: rutaCurricularId,
          docenteId: docenteId,
          fecha: fechaFutura,
          horaInicio: '11:00',
          horaFin: '12:00',
          cuposMaximos: 1,
          cuposDisponibles: 0, // Sin cupos
          estado: 'Programada',
        },
      });

      await request(app.getHttpServer())
        .post(`/api/clases/${claseConUnCupo.id}/reservar`)
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({
          estudianteId: estudianteId,
        })
        .expect(400); // No hay cupos disponibles
    });

    it('should reject reservation for non-existent estudiante', async () => {
      await request(app.getHttpServer())
        .post(`/api/clases/${claseId}/reservar`)
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({
          estudianteId: 'non-existent-id',
        })
        .expect(404);
    });
  });

  // ============================================================================
  // TEST 4: Cancelar Reserva
  // ============================================================================
  describe('DELETE /clases/:id/reservar/:estudianteId - Cancelar reserva', () => {
    let claseId: string;

    beforeEach(async () => {
      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 7);

      const clase = await prisma.clase.create({
        data: {
          rutaCurricularId: rutaCurricularId,
          docenteId: docenteId,
          fecha: fechaFutura,
          horaInicio: '10:00',
          horaFin: '11:00',
          cuposMaximos: 20,
          cuposDisponibles: 19, // 1 cupo ya reservado
          estado: 'Programada',
        },
      });
      claseId = clase.id;

      // Crear inscripción
      await prisma.inscripcionClase.create({
        data: {
          claseId: claseId,
          estudianteId: estudianteId,
        },
      });
    });

    it('should cancel reservation successfully', async () => {
      await request(app.getHttpServer())
        .delete(`/api/clases/${claseId}/reservar/${estudianteId}`)
        .set('Authorization', `Bearer ${tutorToken}`)
        .expect(200);

      // Verificar que los cupos aumentaron
      const claseActualizada = await prisma.clase.findUnique({
        where: { id: claseId },
      });
      expect(claseActualizada?.cuposDisponibles).toBe(20);

      // Verificar que la inscripción fue eliminada
      const inscripcion = await prisma.inscripcionClase.findFirst({
        where: {
          claseId: claseId,
          estudianteId: estudianteId,
        },
      });
      expect(inscripcion).toBeNull();
    });

    it('should return 404 if reservation does not exist', async () => {
      await request(app.getHttpServer())
        .delete(`/api/clases/${claseId}/reservar/non-existent-id`)
        .set('Authorization', `Bearer ${tutorToken}`)
        .expect(404);
    });
  });

  // ============================================================================
  // TEST 5: Registrar Asistencia (Docente)
  // ============================================================================
  describe('POST /clases/:id/asistencia - Registrar asistencia', () => {
    let claseId: string;

    beforeEach(async () => {
      const fechaPasada = new Date();
      fechaPasada.setDate(fechaPasada.getDate() - 1); // Clase de ayer

      const clase = await prisma.clase.create({
        data: {
          rutaCurricularId: rutaCurricularId,
          docenteId: docenteId,
          fecha: fechaPasada,
          horaInicio: '10:00',
          horaFin: '11:00',
          cuposMaximos: 20,
          cuposDisponibles: 19,
          estado: 'Programada',
        },
      });
      claseId = clase.id;

      // Crear inscripción
      await prisma.inscripcionClase.create({
        data: {
          claseId: claseId,
          estudianteId: estudianteId,
        },
      });
    });

    it('should register asistencia successfully as docente', async () => {
      const response = await request(app.getHttpServer())
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

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].estudianteId).toBe(estudianteId);
      expect(response.body.data[0].estado).toBe('Presente');

      // Verificar en DB
      const asistencia = await prisma.asistencia.findFirst({
        where: {
          claseId: claseId,
          estudianteId: estudianteId,
        },
      });
      expect(asistencia).toBeDefined();
      expect(asistencia?.estado).toBe('Presente');
    });

    it('should allow admin to register asistencia', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/clases/${claseId}/asistencia`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          asistencias: [
            {
              estudianteId: estudianteId,
              estado: 'Ausente',
            },
          ],
        })
        .expect(201);

      expect(response.body.data[0].estado).toBe('Ausente');
    });

    it('should reject asistencia by tutor (forbidden)', async () => {
      await request(app.getHttpServer())
        .post(`/api/clases/${claseId}/asistencia`)
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({
          asistencias: [
            {
              estudianteId: estudianteId,
              estado: 'Presente',
            },
          ],
        })
        .expect(403);
    });

    it('should update existing asistencia (upsert)', async () => {
      // Primera asistencia
      await request(app.getHttpServer())
        .post(`/api/clases/${claseId}/asistencia`)
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({
          asistencias: [
            {
              estudianteId: estudianteId,
              estado: 'Ausente',
            },
          ],
        })
        .expect(201);

      // Actualizar asistencia
      const response = await request(app.getHttpServer())
        .post(`/api/clases/${claseId}/asistencia`)
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({
          asistencias: [
            {
              estudianteId: estudianteId,
              estado: 'Presente', // Cambio de Ausente a Presente
            },
          ],
        })
        .expect(201);

      expect(response.body.data[0].estado).toBe('Presente');

      // Verificar que solo hay 1 registro de asistencia
      const asistencias = await prisma.asistencia.findMany({
        where: {
          claseId: claseId,
          estudianteId: estudianteId,
        },
      });
      expect(asistencias).toHaveLength(1);
      expect(asistencias[0].estado).toBe('Presente');
    });
  });

  // ============================================================================
  // TEST 6: Cancelar Clase (Admin o Docente)
  // ============================================================================
  describe('PATCH /clases/:id/cancelar - Cancelar clase', () => {
    let claseId: string;

    beforeEach(async () => {
      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 7);

      const clase = await prisma.clase.create({
        data: {
          rutaCurricularId: rutaCurricularId,
          docenteId: docenteId,
          fecha: fechaFutura,
          horaInicio: '10:00',
          horaFin: '11:00',
          cuposMaximos: 20,
          cuposDisponibles: 20,
          estado: 'Programada',
        },
      });
      claseId = clase.id;
    });

    it('should cancel clase as admin', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/clases/${claseId}/cancelar`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.estado).toBe('Cancelada');

      // Verificar en DB
      const clase = await prisma.clase.findUnique({
        where: { id: claseId },
      });
      expect(clase?.estado).toBe('Cancelada');
    });

    it('should cancel clase as docente owner', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/clases/${claseId}/cancelar`)
        .set('Authorization', `Bearer ${docenteToken}`)
        .expect(200);

      expect(response.body.data.estado).toBe('Cancelada');
    });

    it('should reject cancellation by tutor (forbidden)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/clases/${claseId}/cancelar`)
        .set('Authorization', `Bearer ${tutorToken}`)
        .expect(403);
    });
  });

  // ============================================================================
  // TEST 7: Listar Reservas del Tutor
  // ============================================================================
  describe('GET /clases/mis-reservas - Listar reservas del tutor', () => {
    beforeEach(async () => {
      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 7);

      const clase = await prisma.clase.create({
        data: {
          rutaCurricularId: rutaCurricularId,
          docenteId: docenteId,
          fecha: fechaFutura,
          horaInicio: '10:00',
          horaFin: '11:00',
          cuposMaximos: 20,
          cuposDisponibles: 19,
          estado: 'Programada',
        },
      });

      await prisma.inscripcionClase.create({
        data: {
          claseId: clase.id,
          estudianteId: estudianteId,
        },
      });
    });

    it('should return reservas for tutor', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/clases/mis-reservas')
        .set('Authorization', `Bearer ${tutorToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].estudianteId).toBe(estudianteId);
    });

    it('should return empty array for tutor without reservas', async () => {
      // Crear otro tutor sin reservas
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
        .get('/api/clases/mis-reservas')
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });
  });
});
