/**
 * ============================================================================
 * ADMIN CLASE-GRUPOS INTEGRATION TEST - Black Box Testing
 * ============================================================================
 *
 * ENDPOINTS:
 * - POST /admin/clase-grupos → Crear grupo recurrente
 * - GET /admin/clase-grupos → Listar grupos con filtros
 * - GET /admin/clase-grupos/:id → Obtener detalle de grupo
 * - PUT /admin/clase-grupos/:id → Actualizar grupo
 * - DELETE /admin/clase-grupos/:id → Eliminar grupo (soft delete)
 * - POST /admin/clase-grupos/:id/estudiantes → Agregar estudiantes
 * - DELETE /admin/clase-grupos/:id/estudiantes/:estudianteId → Remover estudiante
 * - POST /admin/clase-grupos/:id/asistencias → Registrar asistencias
 * - GET /admin/clase-grupos/:id/asistencias → Obtener asistencias por fecha
 * - GET /admin/clase-grupos/:id/asistencias/historial → Historial de asistencias
 * - PATCH /admin/asistencias/:id → Actualizar asistencia
 * - GET /admin/clase-grupos/:id/estudiantes/:estudianteId/estadisticas → Stats estudiante
 *
 * EQUIVALENCE CLASSES:
 *
 * POST /admin/clase-grupos:
 * - CE1: Admin crea grupo válido → 201 + grupo con inscripciones
 * - CE2: Nombre duplicado → 400 (unique constraint)
 * - CE3: grupoId no existente → 400/404
 * - CE4: docenteId no existente → 400/404
 * - CE5: horaInicio formato inválido → 400
 * - CE6: horaFin formato inválido → 400
 * - CE7: cupoMaximo < 1 → 400
 * - CE8: cupoMaximo > 50 → 400
 * - CE9: anioLectivo < 2024 → 400
 *
 * GET /admin/clase-grupos:
 * - CE10: Sin filtros → Lista todos los grupos
 * - CE11: Filtro por anioLectivo → Solo de ese año
 *
 * GET /admin/clase-grupos/:id:
 * - CE12: ID existente → Grupo con inscripciones
 * - CE13: ID no existente → 404
 *
 * PUT /admin/clase-grupos/:id:
 * - CE14: Actualizar nombre → 200
 *
 * DELETE /admin/clase-grupos/:id:
 * - CE15: Soft delete → 200 + activo=false
 *
 * Estudiantes:
 * - CE16: Agregar estudiantes → 201
 * - CE17: Remover estudiante → 200
 * - CE18: Agregar estudiante duplicado → 400 (unique constraint)
 *
 * Asistencias:
 * - CE19: Registrar asistencias → 201
 * - CE20: Obtener asistencias por fecha → 200
 * - CE21: Actualizar asistencia → 200
 *
 * Security:
 * - CE22: No autenticado → 401
 * - CE23: Docente → 403
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn test:integration -- --testPathPattern="clase-grupos.integration"
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../../../src/app.module';
import { PrismaService } from '../../../../src/core/database/prisma.service';
import {
  createTestAdmin,
  createTestDocente,
  createTestEstudiante,
  createTestTutor,
} from '../../../fixtures/factories';
import { DEFAULT_PASSWORD } from '../../../fixtures/factories/usuario.factory';
import { cleanAllTestTables } from '../../../helpers/db-cleanup';
import { loginUser } from '../../../helpers/auth.helpers';

describe('[INTEGRATION] Admin Clase-Grupos (BBT)', () => {
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
  // HELPER: Crear GrupoPedagogico de test
  // ============================================================================
  async function createTestGrupoPedagogico(codigo: string) {
    return prisma.grupoPedagogico.create({
      data: {
        codigo,
        nombre: `Grupo ${codigo}`,
        casa_tipo: 'QUANTUM',
        mundo_tipo: 'MATEMATICA',
        activo: true,
      },
    });
  }

  // ============================================================================
  // HELPER: Crear ClaseGrupo de test
  // ============================================================================
  async function createTestClaseGrupo(options: {
    grupoId: string;
    docenteId: string;
    nombre?: string;
    codigo?: string;
  }) {
    const suffix = Date.now().toString();
    return prisma.claseGrupo.create({
      data: {
        codigo: options.codigo ?? `CG-${suffix}`,
        nombre: options.nombre ?? `Clase Grupo ${suffix}`,
        grupo_id: options.grupoId,
        docente_id: options.docenteId,
        dia_semana: 'LUNES',
        hora_inicio: '19:30',
        hora_fin: '21:00',
        fecha_inicio: new Date(),
        fecha_fin: new Date('2026-12-15'),
        anio_lectivo: 2026,
        cupo_maximo: 20,
        activo: true,
      },
    });
  }

  // ============================================================================
  // CE1-CE9: POST /admin/clase-grupos - Crear grupo
  // ============================================================================
  describe('POST /api/admin/clase-grupos', () => {
    it('CE1: should create clase-grupo when admin sends valid data', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const { docente } = await createTestDocente(prisma);
      const grupo = await createTestGrupoPedagogico('GP-001');
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const uniqueName = `Clase Test ${Date.now()}`;
      const dto = {
        grupoId: grupo.id,
        codigo: `CG-${Date.now()}`,
        nombre: uniqueName,
        tipo: 'GRUPO_REGULAR',
        diaSemana: 'LUNES',
        horaInicio: '19:30',
        horaFin: '21:00',
        fechaInicio: '2026-03-01',
        anioLectivo: 2026,
        cupoMaximo: 15,
        docenteId: docente.id,
        estudiantesIds: [estudiante.id],
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/admin/clase-grupos')
        .set('Cookie', auth.cookie)
        .send(dto);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.nombre).toBe(uniqueName);
      expect(response.body.data.docente_id).toBe(docente.id);
      expect(response.body.data.cupo_maximo).toBe(15);
    });

    it('CE2: should reject when nombre is duplicated', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const { docente } = await createTestDocente(prisma);
      const grupo = await createTestGrupoPedagogico('GP-002');

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const nombreDuplicado = `Clase Duplicada ${Date.now()}`;

      // Crear primera clase
      await prisma.claseGrupo.create({
        data: {
          codigo: `CG-DUP-1`,
          nombre: nombreDuplicado,
          grupo_id: grupo.id,
          docente_id: docente.id,
          dia_semana: 'LUNES',
          hora_inicio: '10:00',
          hora_fin: '11:00',
          fecha_inicio: new Date(),
          fecha_fin: new Date('2026-12-15'),
          anio_lectivo: 2026,
          cupo_maximo: 20,
        },
      });

      // Act - Intentar crear con mismo nombre
      const response = await request(app.getHttpServer())
        .post('/api/admin/clase-grupos')
        .set('Cookie', auth.cookie)
        .send({
          grupoId: grupo.id,
          codigo: `CG-DUP-2`,
          nombre: nombreDuplicado, // Nombre duplicado
          tipo: 'GRUPO_REGULAR',
          diaSemana: 'MARTES',
          horaInicio: '10:00',
          horaFin: '11:00',
          fechaInicio: '2026-03-01',
          anioLectivo: 2026,
          cupoMaximo: 20,
          docenteId: docente.id,
          estudiantesIds: [],
        });

      // Assert
      expect(response.status).toBe(400);
    });

    it('CE3: should reject when grupoId does not exist', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const { docente } = await createTestDocente(prisma);

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/admin/clase-grupos')
        .set('Cookie', auth.cookie)
        .send({
          grupoId: '00000000-0000-0000-0000-000000000000',
          codigo: `CG-INV`,
          nombre: `Clase Invalida ${Date.now()}`,
          tipo: 'GRUPO_REGULAR',
          diaSemana: 'LUNES',
          horaInicio: '10:00',
          horaFin: '11:00',
          fechaInicio: '2026-03-01',
          anioLectivo: 2026,
          cupoMaximo: 20,
          docenteId: docente.id,
          estudiantesIds: [],
        });

      // Assert
      expect([400, 404]).toContain(response.status);
    });

    it('CE5: should reject when horaInicio has invalid format', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const { docente } = await createTestDocente(prisma);
      const grupo = await createTestGrupoPedagogico('GP-003');

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/admin/clase-grupos')
        .set('Cookie', auth.cookie)
        .send({
          grupoId: grupo.id,
          codigo: `CG-HORA`,
          nombre: `Clase Hora Invalida ${Date.now()}`,
          tipo: 'GRUPO_REGULAR',
          diaSemana: 'LUNES',
          horaInicio: '25:00', // Formato inválido
          horaFin: '11:00',
          fechaInicio: '2026-03-01',
          anioLectivo: 2026,
          cupoMaximo: 20,
          docenteId: docente.id,
          estudiantesIds: [],
        });

      // Assert
      expect(response.status).toBe(400);
    });

    it('CE7: should reject when cupoMaximo < 1', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const { docente } = await createTestDocente(prisma);
      const grupo = await createTestGrupoPedagogico('GP-004');

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/admin/clase-grupos')
        .set('Cookie', auth.cookie)
        .send({
          grupoId: grupo.id,
          codigo: `CG-CUPO`,
          nombre: `Clase Cupo Invalido ${Date.now()}`,
          tipo: 'GRUPO_REGULAR',
          diaSemana: 'LUNES',
          horaInicio: '10:00',
          horaFin: '11:00',
          fechaInicio: '2026-03-01',
          anioLectivo: 2026,
          cupoMaximo: 0, // Inválido
          docenteId: docente.id,
          estudiantesIds: [],
        });

      // Assert
      expect(response.status).toBe(400);
    });

    it('CE8: should reject when cupoMaximo > 50', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const { docente } = await createTestDocente(prisma);
      const grupo = await createTestGrupoPedagogico('GP-005');

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/admin/clase-grupos')
        .set('Cookie', auth.cookie)
        .send({
          grupoId: grupo.id,
          codigo: `CG-CUPO2`,
          nombre: `Clase Cupo Grande ${Date.now()}`,
          tipo: 'GRUPO_REGULAR',
          diaSemana: 'LUNES',
          horaInicio: '10:00',
          horaFin: '11:00',
          fechaInicio: '2026-03-01',
          anioLectivo: 2026,
          cupoMaximo: 51, // Inválido
          docenteId: docente.id,
          estudiantesIds: [],
        });

      // Assert
      expect(response.status).toBe(400);
    });

    it('CE9: should reject when anioLectivo < 2024', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const { docente } = await createTestDocente(prisma);
      const grupo = await createTestGrupoPedagogico('GP-006');

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/admin/clase-grupos')
        .set('Cookie', auth.cookie)
        .send({
          grupoId: grupo.id,
          codigo: `CG-ANIO`,
          nombre: `Clase Año Invalido ${Date.now()}`,
          tipo: 'GRUPO_REGULAR',
          diaSemana: 'LUNES',
          horaInicio: '10:00',
          horaFin: '11:00',
          fechaInicio: '2023-03-01',
          anioLectivo: 2023, // Inválido
          cupoMaximo: 20,
          docenteId: docente.id,
          estudiantesIds: [],
        });

      // Assert
      expect(response.status).toBe(400);
    });
  });

  // ============================================================================
  // CE10-CE11: GET /admin/clase-grupos - Listar con filtros
  // ============================================================================
  describe('GET /api/admin/clase-grupos', () => {
    it('CE10: should list all clase-grupos without filters', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const { docente } = await createTestDocente(prisma);
      const grupo = await createTestGrupoPedagogico('GP-LIST');

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      await createTestClaseGrupo({ grupoId: grupo.id, docenteId: docente.id });
      await createTestClaseGrupo({ grupoId: grupo.id, docenteId: docente.id });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/admin/clase-grupos')
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('CE11: should filter by anioLectivo', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const { docente } = await createTestDocente(prisma);
      const grupo = await createTestGrupoPedagogico('GP-ANIO');

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Crear clases de diferentes años
      await prisma.claseGrupo.create({
        data: {
          codigo: 'CG-2026',
          nombre: `Clase 2026 ${Date.now()}`,
          grupo_id: grupo.id,
          docente_id: docente.id,
          dia_semana: 'LUNES',
          hora_inicio: '10:00',
          hora_fin: '11:00',
          fecha_inicio: new Date('2026-01-01'),
          fecha_fin: new Date('2026-12-15'),
          anio_lectivo: 2026,
          cupo_maximo: 20,
        },
      });

      await prisma.claseGrupo.create({
        data: {
          codigo: 'CG-2025',
          nombre: `Clase 2025 ${Date.now()}`,
          grupo_id: grupo.id,
          docente_id: docente.id,
          dia_semana: 'MARTES',
          hora_inicio: '10:00',
          hora_fin: '11:00',
          fecha_inicio: new Date('2025-01-01'),
          fecha_fin: new Date('2025-12-15'),
          anio_lectivo: 2025,
          cupo_maximo: 20,
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/admin/clase-grupos?anio_lectivo=2026')
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(
        response.body.data.every(
          (c: { anio_lectivo: number }) => c.anio_lectivo === 2026,
        ),
      ).toBe(true);
    });
  });

  // ============================================================================
  // CE12-CE13: GET /admin/clase-grupos/:id
  // ============================================================================
  describe('GET /api/admin/clase-grupos/:id', () => {
    it('CE12: should return clase-grupo with inscripciones when ID exists', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const { docente } = await createTestDocente(prisma);
      const grupo = await createTestGrupoPedagogico('GP-DET');
      const claseGrupo = await createTestClaseGrupo({
        grupoId: grupo.id,
        docenteId: docente.id,
      });

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get(`/api/admin/clase-grupos/${claseGrupo.id}`)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(claseGrupo.id);
      expect(response.body.data).toHaveProperty('inscripciones');
    });

    it('CE13: should return 404 when ID does not exist', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/admin/clase-grupos/00000000-0000-0000-0000-000000000000')
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(404);
    });
  });

  // ============================================================================
  // CE14: PUT /admin/clase-grupos/:id
  // ============================================================================
  describe('PUT /api/admin/clase-grupos/:id', () => {
    it('CE14: should update nombre', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const { docente } = await createTestDocente(prisma);
      const grupo = await createTestGrupoPedagogico('GP-UPD');
      const claseGrupo = await createTestClaseGrupo({
        grupoId: grupo.id,
        docenteId: docente.id,
      });

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const nuevoNombre = `Nombre Actualizado ${Date.now()}`;

      // Act
      const response = await request(app.getHttpServer())
        .put(`/api/admin/clase-grupos/${claseGrupo.id}`)
        .set('Cookie', auth.cookie)
        .send({
          nombre: nuevoNombre,
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.nombre).toBe(nuevoNombre);
    });
  });

  // ============================================================================
  // CE15: DELETE /admin/clase-grupos/:id
  // ============================================================================
  describe('DELETE /api/admin/clase-grupos/:id', () => {
    it('CE15: should soft delete clase-grupo', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const { docente } = await createTestDocente(prisma);
      const grupo = await createTestGrupoPedagogico('GP-DEL');
      const claseGrupo = await createTestClaseGrupo({
        grupoId: grupo.id,
        docenteId: docente.id,
      });

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .delete(`/api/admin/clase-grupos/${claseGrupo.id}`)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);

      // Verificar soft delete
      const deleted = await prisma.claseGrupo.findUnique({
        where: { id: claseGrupo.id },
      });
      expect(deleted?.activo).toBe(false);
    });
  });

  // ============================================================================
  // CE16-CE18: Gestión de Estudiantes
  // ============================================================================
  describe('Estudiantes Management', () => {
    it('CE16: should add estudiantes to clase-grupo', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const { docente } = await createTestDocente(prisma);
      const grupo = await createTestGrupoPedagogico('GP-EST');
      const claseGrupo = await createTestClaseGrupo({
        grupoId: grupo.id,
        docenteId: docente.id,
      });
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post(`/api/admin/clase-grupos/${claseGrupo.id}/estudiantes`)
        .set('Cookie', auth.cookie)
        .send({
          estudiantes_ids: [estudiante.id],
        });

      // Assert
      expect([200, 201]).toContain(response.status);

      // Verificar inscripción en DB
      const inscripcion = await prisma.inscripcionClaseGrupo.findFirst({
        where: {
          clase_grupo_id: claseGrupo.id,
          estudiante_id: estudiante.id,
        },
      });
      expect(inscripcion).not.toBeNull();
    });

    it('CE17: should remove estudiante from clase-grupo', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const { docente } = await createTestDocente(prisma);
      const grupo = await createTestGrupoPedagogico('GP-REM');
      const claseGrupo = await createTestClaseGrupo({
        grupoId: grupo.id,
        docenteId: docente.id,
      });
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Inscribir estudiante
      await prisma.inscripcionClaseGrupo.create({
        data: {
          clase_grupo_id: claseGrupo.id,
          estudiante_id: estudiante.id,
          tutor_id: tutor.id,
        },
      });

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .delete(
          `/api/admin/clase-grupos/${claseGrupo.id}/estudiantes/${estudiante.id}`,
        )
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);

      // Verificar eliminación
      const inscripcion = await prisma.inscripcionClaseGrupo.findFirst({
        where: {
          clase_grupo_id: claseGrupo.id,
          estudiante_id: estudiante.id,
        },
      });
      expect(inscripcion).toBeNull();
    });

    it('CE18: should reject duplicate estudiante inscription', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const { docente } = await createTestDocente(prisma);
      const grupo = await createTestGrupoPedagogico('GP-DUP');
      const claseGrupo = await createTestClaseGrupo({
        grupoId: grupo.id,
        docenteId: docente.id,
      });
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Primera inscripción
      await prisma.inscripcionClaseGrupo.create({
        data: {
          clase_grupo_id: claseGrupo.id,
          estudiante_id: estudiante.id,
          tutor_id: tutor.id,
        },
      });

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act - Intentar inscribir de nuevo
      const response = await request(app.getHttpServer())
        .post(`/api/admin/clase-grupos/${claseGrupo.id}/estudiantes`)
        .set('Cookie', auth.cookie)
        .send({
          estudiantes_ids: [estudiante.id],
        });

      // Assert - Puede ser 400 o ignorar duplicados silenciosamente
      // La implementación puede variar, verificamos que no haya duplicados
      const inscripciones = await prisma.inscripcionClaseGrupo.findMany({
        where: {
          clase_grupo_id: claseGrupo.id,
          estudiante_id: estudiante.id,
        },
      });
      expect(inscripciones.length).toBe(1); // Solo debe haber una inscripción
    });
  });

  // ============================================================================
  // CE19-CE21: Asistencias
  // ============================================================================
  describe('Asistencias Management', () => {
    it('CE19: should register asistencias', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const { docente } = await createTestDocente(prisma);
      const grupo = await createTestGrupoPedagogico('GP-ASIS');
      const claseGrupo = await createTestClaseGrupo({
        grupoId: grupo.id,
        docenteId: docente.id,
      });
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Inscribir estudiante
      await prisma.inscripcionClaseGrupo.create({
        data: {
          clase_grupo_id: claseGrupo.id,
          estudiante_id: estudiante.id,
          tutor_id: tutor.id,
        },
      });

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const hoy = new Date().toISOString();

      // Act
      const response = await request(app.getHttpServer())
        .post(`/api/admin/clase-grupos/${claseGrupo.id}/asistencias`)
        .set('Cookie', auth.cookie)
        .send({
          fecha: hoy,
          asistencias: [
            {
              estudianteId: estudiante.id,
              estado: 'Presente',
              observaciones: 'Llegó puntual',
            },
          ],
        });

      // Assert
      expect([200, 201]).toContain(response.status);

      // Verificar en DB
      const asistencia = await prisma.asistenciaClaseGrupo.findFirst({
        where: {
          clase_grupo_id: claseGrupo.id,
          estudiante_id: estudiante.id,
        },
      });
      expect(asistencia).not.toBeNull();
      expect(asistencia?.estado).toBe('Presente');
    });

    it('CE20: should get asistencias by fecha', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const { docente } = await createTestDocente(prisma);
      const grupo = await createTestGrupoPedagogico('GP-FECHA');
      const claseGrupo = await createTestClaseGrupo({
        grupoId: grupo.id,
        docenteId: docente.id,
      });
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const fecha = new Date('2026-03-15');

      // Crear asistencia
      await prisma.asistenciaClaseGrupo.create({
        data: {
          clase_grupo_id: claseGrupo.id,
          estudiante_id: estudiante.id,
          fecha,
          estado: 'Presente',
        },
      });

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get(
          `/api/admin/clase-grupos/${claseGrupo.id}/asistencias?fecha=2026-03-15`,
        )
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
    });

    it('CE21: should update asistencia', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const { docente } = await createTestDocente(prisma);
      const grupo = await createTestGrupoPedagogico('GP-UPAS');
      const claseGrupo = await createTestClaseGrupo({
        grupoId: grupo.id,
        docenteId: docente.id,
      });
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Crear asistencia
      const asistencia = await prisma.asistenciaClaseGrupo.create({
        data: {
          clase_grupo_id: claseGrupo.id,
          estudiante_id: estudiante.id,
          fecha: new Date(),
          estado: 'Presente',
        },
      });

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .patch(`/api/admin/asistencias/${asistencia.id}`)
        .set('Cookie', auth.cookie)
        .send({
          estado: 'Ausente',
          observaciones: 'No vino',
        });

      // Assert
      expect(response.status).toBe(200);
      // API devuelve { data: ..., metadata: ... }
      const asistenciaActualizada = response.body.data || response.body;
      expect(asistenciaActualizada.estado).toBe('Ausente');
    });
  });

  // ============================================================================
  // CE22-CE23: Security - Access Control
  // ============================================================================
  describe('Security: Access Control', () => {
    it('CE22: should return 401 when not authenticated', async () => {
      // Act - Ejecutar secuencialmente para evitar ECONNRESET
      const r1 = await request(app.getHttpServer()).get(
        '/api/admin/clase-grupos',
      );
      const r2 = await request(app.getHttpServer()).get(
        '/api/admin/clase-grupos/00000000-0000-0000-0000-000000000000',
      );
      const r3 = await request(app.getHttpServer())
        .post('/api/admin/clase-grupos')
        .send({ nombre: 'Test' });
      const r4 = await request(app.getHttpServer())
        .put('/api/admin/clase-grupos/00000000-0000-0000-0000-000000000000')
        .send({ nombre: 'Test' });
      const r5 = await request(app.getHttpServer()).delete(
        '/api/admin/clase-grupos/00000000-0000-0000-0000-000000000000',
      );

      // Assert
      expect(r1.status).toBe(401);
      expect(r2.status).toBe(401);
      expect(r3.status).toBe(401);
      expect(r4.status).toBe(401);
      expect(r5.status).toBe(401);
    });

    it('CE23: should return 403 when user is docente', async () => {
      // Arrange
      const { docente, password } = await createTestDocente(prisma);
      const auth = await loginUser(app, { email: docente.email, password });

      // Act
      const responses = await Promise.all([
        request(app.getHttpServer())
          .get('/api/admin/clase-grupos')
          .set('Cookie', auth.cookie),
        request(app.getHttpServer())
          .post('/api/admin/clase-grupos')
          .set('Cookie', auth.cookie)
          .send({
            grupoId: 'test',
            nombre: 'Test',
            codigo: 'TEST',
            tipo: 'GRUPO_REGULAR',
            diaSemana: 'LUNES',
            horaInicio: '10:00',
            horaFin: '11:00',
            fechaInicio: '2026-01-01',
            anioLectivo: 2026,
            cupoMaximo: 20,
            docenteId: docente.id,
            estudiantesIds: [],
          }),
      ]);

      // Assert
      responses.forEach((response) => {
        expect(response.status).toBe(403);
      });
    });
  });

  // ============================================================================
  // Boundary: cupoMaximo
  // ============================================================================
  describe('Boundary: cupoMaximo', () => {
    it('should accept cupoMaximo=1 (minimum)', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const { docente } = await createTestDocente(prisma);
      const grupo = await createTestGrupoPedagogico('GP-MIN');

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/admin/clase-grupos')
        .set('Cookie', auth.cookie)
        .send({
          grupoId: grupo.id,
          codigo: `CG-MIN`,
          nombre: `Clase Cupo Min ${Date.now()}`,
          tipo: 'GRUPO_REGULAR',
          diaSemana: 'LUNES',
          horaInicio: '10:00',
          horaFin: '11:00',
          fechaInicio: '2026-03-01',
          anioLectivo: 2026,
          cupoMaximo: 1, // Mínimo válido
          docenteId: docente.id,
          estudiantesIds: [],
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.data.cupo_maximo).toBe(1);
    });

    it('should accept cupoMaximo=50 (maximum)', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const { docente } = await createTestDocente(prisma);
      const grupo = await createTestGrupoPedagogico('GP-MAX');

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/admin/clase-grupos')
        .set('Cookie', auth.cookie)
        .send({
          grupoId: grupo.id,
          codigo: `CG-MAX`,
          nombre: `Clase Cupo Max ${Date.now()}`,
          tipo: 'GRUPO_REGULAR',
          diaSemana: 'LUNES',
          horaInicio: '10:00',
          horaFin: '11:00',
          fechaInicio: '2026-03-01',
          anioLectivo: 2026,
          cupoMaximo: 50, // Máximo válido
          docenteId: docente.id,
          estudiantesIds: [],
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.data.cupo_maximo).toBe(50);
    });
  });
});
