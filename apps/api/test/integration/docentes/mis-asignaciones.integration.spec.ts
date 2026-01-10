/**
 * ============================================================================
 * INTEGRATION TESTS - GET /docentes/me/asignaciones
 * ============================================================================
 *
 * ENDPOINT: GET /api/docentes/me/asignaciones
 * GUARDS: [JwtAuthGuard, RolesGuard] (a nivel controller)
 * ROLES: [Role.DOCENTE]
 * RETORNA: AsignacionResponse[] con:
 *   - id: string
 *   - planificacion: { id, titulo, cantidad_clases }
 *   - claseGrupo: { id, nombre }
 *   - clases: ClaseInfo[]
 *   - estados_clases: EstadoClase[]
 *
 * RELACIONES INCLUIDAS:
 *   - planificacion → clases (ordenadas por numero)
 *   - claseGrupo (nombre del grupo)
 *   - estadosClases → clase (estado de activación)
 *
 * LÓGICA:
 *   - Filtra por docente_id del usuario autenticado
 *   - Ordena por created_at DESC
 *   - Mapea a DTO con estructura simplificada
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="mis-asignaciones.integration" --runInBand
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

describe('[INTEGRATION] GET /docentes/me/asignaciones', () => {
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
  // HELPER: Login tutor (para tests de autorización)
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
  // HELPER: Login estudiante (para tests de autorización)
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
  // CATEGORÍA 1: AUTENTICACIÓN Y AUTORIZACIÓN
  // ============================================================================
  describe('Autenticación y Autorización', () => {
    it('debe retornar 401 si no hay token', async () => {
      // ACT
      const response = await request(app.getHttpServer()).get(
        '/api/docentes/me/asignaciones',
      );

      // ASSERT
      expect(response.status).toBe(401);
    });

    it('debe retornar 401 con token malformado', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/docentes/me/asignaciones')
        .set('Authorization', 'Bearer invalid-token-12345');

      // ASSERT
      expect(response.status).toBe(401);
    });

    it('debe retornar 403 si el rol es TUTOR', async () => {
      // ARRANGE
      const { tutor, password } = await createTestTutor(prisma);
      const cookies = await loginTutor(tutor.email, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/docentes/me/asignaciones')
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
        .get('/api/docentes/me/asignaciones')
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(403);
    });

    it('debe permitir acceso con rol DOCENTE válido', async () => {
      // ARRANGE
      const { docente, password } = await createTestDocente(prisma);
      const cookies = await loginDocente(docente.email, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/docentes/me/asignaciones')
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // ============================================================================
  // CATEGORÍA 2: HAPPY PATHS
  // ============================================================================
  describe('Happy Paths', () => {
    it('debe retornar array vacío si el docente no tiene asignaciones', async () => {
      // ARRANGE
      const { docente, password } = await createTestDocente(prisma);
      const cookies = await loginDocente(docente.email, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/docentes/me/asignaciones')
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('debe retornar una asignación cuando el docente tiene una', async () => {
      // ARRANGE
      const { docente, password } = await createTestDocente(prisma);
      const admin = await createTestAdmin(prisma);
      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });
      const planificacion = await createTestPlanificacion(prisma, admin.id, {
        cantidadClases: 2,
      });
      const { asignacion } = await createTestAsignacionPlanificacion(
        prisma,
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );

      const cookies = await loginDocente(docente.email, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/docentes/me/asignaciones')
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(asignacion.id);
    });

    it('debe retornar múltiples asignaciones ordenadas por fecha de creación DESC', async () => {
      // ARRANGE
      const { docente, password } = await createTestDocente(prisma);
      const admin = await createTestAdmin(prisma);
      const sector = await createTestSector(prisma);

      // Crear 3 claseGrupos y asignaciones
      const claseGrupo1 = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
        nombre: 'Grupo A',
      });
      const claseGrupo2 = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
        nombre: 'Grupo B',
      });
      const claseGrupo3 = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
        nombre: 'Grupo C',
      });

      const planificacion = await createTestPlanificacion(prisma, admin.id, {
        cantidadClases: 2,
      });

      // Crear asignaciones en orden
      await createTestAsignacionPlanificacion(
        prisma,
        planificacion.id,
        claseGrupo1.id,
        docente.id,
      );
      await createTestAsignacionPlanificacion(
        prisma,
        planificacion.id,
        claseGrupo2.id,
        docente.id,
      );
      await createTestAsignacionPlanificacion(
        prisma,
        planificacion.id,
        claseGrupo3.id,
        docente.id,
      );

      const cookies = await loginDocente(docente.email, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/docentes/me/asignaciones')
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      // El último creado debe aparecer primero (DESC)
      expect(response.body[0].claseGrupo.nombre).toBe('Grupo C');
    });

    it('debe incluir estructura completa del DTO en la respuesta', async () => {
      // ARRANGE
      const { docente, password } = await createTestDocente(prisma);
      const admin = await createTestAdmin(prisma);
      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
        nombre: 'Grupo Test DTO',
      });
      const planificacion = await createTestPlanificacion(prisma, admin.id, {
        cantidadClases: 3,
        titulo: 'Planificación Test DTO',
      });
      await createTestAsignacionPlanificacion(
        prisma,
        planificacion.id,
        claseGrupo.id,
        docente.id,
        { activarClases: [1, 2] },
      );

      const cookies = await loginDocente(docente.email, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/docentes/me/asignaciones')
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);

      const asignacion = response.body[0];

      // Verificar estructura de asignación
      expect(asignacion).toHaveProperty('id');
      expect(asignacion).toHaveProperty('planificacion');
      expect(asignacion).toHaveProperty('claseGrupo');
      expect(asignacion).toHaveProperty('clases');
      expect(asignacion).toHaveProperty('estados_clases');

      // Verificar planificación
      expect(asignacion.planificacion).toHaveProperty('id');
      expect(asignacion.planificacion).toHaveProperty(
        'titulo',
        'Planificación Test DTO',
      );
      expect(asignacion.planificacion).toHaveProperty('cantidad_clases', 3);

      // Verificar claseGrupo
      expect(asignacion.claseGrupo).toHaveProperty('id');
      expect(asignacion.claseGrupo).toHaveProperty('nombre', 'Grupo Test DTO');

      // Verificar clases
      expect(asignacion.clases).toHaveLength(3);
      expect(asignacion.clases[0]).toHaveProperty('id');
      expect(asignacion.clases[0]).toHaveProperty('numero', 1);
      expect(asignacion.clases[0]).toHaveProperty('titulo');

      // Verificar estados_clases (2 clases activadas)
      expect(asignacion.estados_clases).toHaveLength(2);
      expect(asignacion.estados_clases[0]).toHaveProperty('clase');
      expect(asignacion.estados_clases[0]).toHaveProperty(
        'teoria_activa',
        true,
      );
      expect(asignacion.estados_clases[0]).toHaveProperty(
        'practica_activa',
        true,
      );
    });
  });

  // ============================================================================
  // CATEGORÍA 3: AISLAMIENTO DE DATOS
  // ============================================================================
  describe('Aislamiento de Datos', () => {
    it('solo debe retornar asignaciones del docente autenticado (no de otros)', async () => {
      // ARRANGE
      const { docente: docente1, password: pass1 } =
        await createTestDocente(prisma);
      const { docente: docente2 } = await createTestDocente(prisma);
      const admin = await createTestAdmin(prisma);
      const sector = await createTestSector(prisma);

      // Crear asignación para docente1
      const claseGrupo1 = await createTestClaseGrupo(prisma, {
        docenteId: docente1.id,
        sectorId: sector.id,
        nombre: 'Grupo Docente 1',
      });
      const planificacion = await createTestPlanificacion(prisma, admin.id);
      await createTestAsignacionPlanificacion(
        prisma,
        planificacion.id,
        claseGrupo1.id,
        docente1.id,
      );

      // Crear asignación para docente2
      const claseGrupo2 = await createTestClaseGrupo(prisma, {
        docenteId: docente2.id,
        sectorId: sector.id,
        nombre: 'Grupo Docente 2',
      });
      await createTestAsignacionPlanificacion(
        prisma,
        planificacion.id,
        claseGrupo2.id,
        docente2.id,
      );

      const cookies = await loginDocente(docente1.email, pass1);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/docentes/me/asignaciones')
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].claseGrupo.nombre).toBe('Grupo Docente 1');
    });
  });

  // ============================================================================
  // CATEGORÍA 4: ESTADOS DE CLASES
  // ============================================================================
  describe('Estados de Clases', () => {
    it('debe incluir estados de clases activadas', async () => {
      // ARRANGE
      const { docente, password } = await createTestDocente(prisma);
      const admin = await createTestAdmin(prisma);
      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });
      const planificacion = await createTestPlanificacion(prisma, admin.id, {
        cantidadClases: 4,
      });
      await createTestAsignacionPlanificacion(
        prisma,
        planificacion.id,
        claseGrupo.id,
        docente.id,
        { activarClases: [1, 3] }, // Solo clases 1 y 3 activadas
      );

      const cookies = await loginDocente(docente.email, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/docentes/me/asignaciones')
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(200);
      const asignacion = response.body[0];

      // Debe haber 4 clases en planificación
      expect(asignacion.clases).toHaveLength(4);

      // Pero solo 2 estados de clases (las activadas)
      expect(asignacion.estados_clases).toHaveLength(2);

      // Verificar que son las clases correctas
      const clasesActivadas = asignacion.estados_clases.map(
        (e: { clase: { numero: number } }) => e.clase.numero,
      );
      expect(clasesActivadas).toContain(1);
      expect(clasesActivadas).toContain(3);
    });

    it('debe retornar array vacío de estados si ninguna clase está activada', async () => {
      // ARRANGE
      const { docente, password } = await createTestDocente(prisma);
      const admin = await createTestAdmin(prisma);
      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });
      const planificacion = await createTestPlanificacion(prisma, admin.id, {
        cantidadClases: 2,
      });
      await createTestAsignacionPlanificacion(
        prisma,
        planificacion.id,
        claseGrupo.id,
        docente.id,
        { activarClases: [] }, // Ninguna clase activada
      );

      const cookies = await loginDocente(docente.email, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/docentes/me/asignaciones')
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body[0].estados_clases).toEqual([]);
    });
  });

  // ============================================================================
  // CATEGORÍA 5: EDGE CASES
  // ============================================================================
  describe('Edge Cases', () => {
    it('debe manejar planificación sin clases gracefully', async () => {
      // ARRANGE
      const { docente, password } = await createTestDocente(prisma);
      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });

      // Crear planificación manualmente sin clases
      const planificacion = await prisma.planificacion.create({
        data: {
          titulo: 'Planificación Vacía',
          descripcion: 'Sin clases',
          cantidad_clases: 0,
          duracion_clase_dias: 7,
          casa_tipo: 'QUANTUM',
          mundo_tipo: 'MATEMATICA',
          estado: 'PUBLICADO',
        },
      });

      await prisma.asignacionPlanificacion.create({
        data: {
          planificacion_id: planificacion.id,
          clase_grupo_id: claseGrupo.id,
          docente_id: docente.id,
          activa: true,
        },
      });

      const cookies = await loginDocente(docente.email, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/docentes/me/asignaciones')
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].clases).toEqual([]);
      expect(response.body[0].estados_clases).toEqual([]);
    });

    it('debe manejar caracteres especiales en nombres correctamente', async () => {
      // ARRANGE
      const { docente, password } = await createTestDocente(prisma);
      const admin = await createTestAdmin(prisma);
      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
        nombre: 'Grupo "Especial" <Test> & Más',
      });
      const planificacion = await createTestPlanificacion(prisma, admin.id, {
        titulo: 'Planificación con émojis 🎓 y ñ',
      });
      await createTestAsignacionPlanificacion(
        prisma,
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );

      const cookies = await loginDocente(docente.email, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/docentes/me/asignaciones')
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body[0].claseGrupo.nombre).toBe(
        'Grupo "Especial" <Test> & Más',
      );
      expect(response.body[0].planificacion.titulo).toBe(
        'Planificación con émojis 🎓 y ñ',
      );
    });
  });
});
