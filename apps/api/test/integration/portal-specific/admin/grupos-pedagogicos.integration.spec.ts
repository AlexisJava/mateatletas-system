/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST
 * ============================================================================
 *
 * SISTEMA CASA/MUNDO 2026 - Grupos Pedagógicos
 *
 * ENDPOINTS BAJO TEST:
 * - GET    /api/admin/grupos-pedagogicos            - Listar grupos
 * - GET    /api/admin/grupos-pedagogicos/:id        - Detalle grupo
 * - PATCH  /api/admin/grupos-pedagogicos:id         - Actualizar casa/mundo
 * - POST   /api/admin/grupos-pedagogicos/migrar-legacy - Migrar grupos legacy
 * - GET    /api/admin/grupos-pedagogicos/estadisticas  - Estadísticas
 *
 * EQUIVALENCE CLASSES:
 * Auth:
 * - [ADMIN]: usuario admin autenticado → 200
 * - [DOCENTE]: usuario docente → 403
 * - [NO-AUTH]: sin token → 401
 *
 * Grupo:
 * - [EXISTE]: grupo válido en DB
 * - [NO-EXISTE]: UUID válido pero no existe → 404
 * - [CON-CASA-MUNDO]: grupo ya tiene casa_tipo y mundo_tipo
 * - [SIN-CASA-MUNDO]: grupo legacy sin asignar
 *
 * Filtros:
 * - [SIN-FILTROS]: retorna todos
 * - [FILTRO-CASA]: filtra por casa_tipo
 * - [FILTRO-MUNDO]: filtra por mundo_tipo
 * - [FILTRO-ACTIVO]: filtra por estado activo/inactivo
 *
 * BOUNDARIES:
 * - 0 grupos → array vacío
 * - Muchos grupos → paginación (si aplica)
 *
 * STATE TRANSITIONS:
 * - LEGACY (sin casa/mundo) → actualizar → CON_CASA_MUNDO
 * - CON_CASA_MUNDO → actualizar → NUEVA_CASA_MUNDO
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="grupos-pedagogicos" --runInBand
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
  createTestAdmin,
  createTestDocente,
  createTestGrupo,
  createTestClaseGrupo,
  createTestSector,
} from '../../fixtures/factories';
import {
  loginUser,
  FRONTEND_ORIGIN,
  generateUniqueIP,
} from '../../helpers/auth.helpers';
import { DEFAULT_PASSWORD } from '../../fixtures/factories/usuario.factory';

describe('[INTEGRATION] Sistema Casa/Mundo 2026 - Grupos Pedagógicos', () => {
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
  // HELPER: Login admin
  // ============================================================================
  async function loginAsAdmin() {
    const admin = await createTestAdmin(prisma);
    return loginUser(app, { email: admin.email, password: DEFAULT_PASSWORD });
  }

  // ============================================================================
  // HELPER: Crear grupo pedagógico (ClaseGrupo con casa/mundo)
  // ============================================================================
  async function crearGrupoPedagogico(opciones?: {
    nombre?: string;
    casa_tipo?: 'QUANTUM' | 'VERTEX' | 'PULSAR' | null;
    mundo_tipo?: 'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS' | null;
    activo?: boolean;
  }) {
    // ClaseGrupo representa un "Grupo Pedagógico" en el sistema
    const sector = await createTestSector(prisma);
    const grupo = await createTestGrupo(prisma, { sectorId: sector.id });
    const claseGrupo = await createTestClaseGrupo(prisma, {
      grupoId: grupo.id,
      nombre: opciones?.nombre ?? 'Grupo Test',
    });

    // Actualizar con casa/mundo si se especifica
    if (opciones?.casa_tipo || opciones?.mundo_tipo) {
      await prisma.claseGrupo.update({
        where: { id: claseGrupo.id },
        data: {
          casa_tipo: opciones.casa_tipo,
          mundo_tipo: opciones.mundo_tipo,
        },
      });
    }

    return claseGrupo;
  }

  // ============================================================================
  // TESTS: GET /api/admin/grupos-pedagogicos - Listar Grupos
  // ============================================================================
  describe('GET /api/admin/grupos-pedagogicos', () => {
    describe('Equivalence Partitioning: Autenticación', () => {
      it('Clase ADMIN: debe listar grupos', async () => {
        await crearGrupoPedagogico({ nombre: 'Grupo 1' });
        await crearGrupoPedagogico({ nombre: 'Grupo 2' });
        const auth = await loginAsAdmin();

        const response = await request(app.getHttpServer())
          .get('/api/admin/grupos-pedagogicos')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThanOrEqual(2);
      });

      it('Clase NO-AUTH: debe retornar 401', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/admin/grupos-pedagogicos')
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(401);
      });

      it('Clase DOCENTE: debe retornar 403', async () => {
        const { docente, password } = await createTestDocente(prisma);
        const auth = await loginUser(app, { email: docente.email, password });

        const response = await request(app.getHttpServer())
          .get('/api/admin/grupos-pedagogicos')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        expect(response.status).toBe(403);
      });
    });

    describe('Boundary: Cantidad de grupos', () => {
      it('Sin grupos → array vacío', async () => {
        const auth = await loginAsAdmin();

        const response = await request(app.getHttpServer())
          .get('/api/admin/grupos-pedagogicos')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(0);
      });
    });

    describe('Equivalence Partitioning: Filtros', () => {
      it('Filtro por casa_tipo=QUANTUM', async () => {
        await crearGrupoPedagogico({
          casa_tipo: 'QUANTUM',
          mundo_tipo: 'MATEMATICA',
        });
        await crearGrupoPedagogico({
          casa_tipo: 'VERTEX',
          mundo_tipo: 'MATEMATICA',
        });
        const auth = await loginAsAdmin();

        const response = await request(app.getHttpServer())
          .get('/api/admin/grupos-pedagogicos?casa_tipo=QUANTUM')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        expect(response.status).toBe(200);
        // Todos deben tener casa_tipo QUANTUM
        for (const grupo of response.body) {
          expect(grupo.casa_tipo).toBe('QUANTUM');
        }
      });

      it('Filtro por mundo_tipo=PROGRAMACION', async () => {
        await crearGrupoPedagogico({
          casa_tipo: 'QUANTUM',
          mundo_tipo: 'PROGRAMACION',
        });
        await crearGrupoPedagogico({
          casa_tipo: 'QUANTUM',
          mundo_tipo: 'CIENCIAS',
        });
        const auth = await loginAsAdmin();

        const response = await request(app.getHttpServer())
          .get('/api/admin/grupos-pedagogicos?mundo_tipo=PROGRAMACION')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        expect(response.status).toBe(200);
        for (const grupo of response.body) {
          expect(grupo.mundo_tipo).toBe('PROGRAMACION');
        }
      });

      it('Filtro combinado casa + mundo', async () => {
        await crearGrupoPedagogico({
          casa_tipo: 'QUANTUM',
          mundo_tipo: 'MATEMATICA',
        });
        await crearGrupoPedagogico({
          casa_tipo: 'QUANTUM',
          mundo_tipo: 'PROGRAMACION',
        });
        await crearGrupoPedagogico({
          casa_tipo: 'VERTEX',
          mundo_tipo: 'MATEMATICA',
        });
        const auth = await loginAsAdmin();

        const response = await request(app.getHttpServer())
          .get(
            '/api/admin/grupos-pedagogicos?casa_tipo=QUANTUM&mundo_tipo=MATEMATICA',
          )
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        expect(response.status).toBe(200);
        for (const grupo of response.body) {
          expect(grupo.casa_tipo).toBe('QUANTUM');
          expect(grupo.mundo_tipo).toBe('MATEMATICA');
        }
      });
    });
  });

  // ============================================================================
  // TESTS: GET /api/admin/grupos-pedagogicos/:id - Detalle Grupo
  // ============================================================================
  describe('GET /api/admin/grupos-pedagogicos/:id', () => {
    it('Clase EXISTE: debe retornar detalle', async () => {
      const grupo = await crearGrupoPedagogico({
        nombre: 'Grupo Detalle',
        casa_tipo: 'PULSAR',
        mundo_tipo: 'CIENCIAS',
      });
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .get(`/api/admin/grupos-pedagogicos/${grupo.id}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', grupo.id);
      expect(response.body).toHaveProperty('casa_tipo', 'PULSAR');
      expect(response.body).toHaveProperty('mundo_tipo', 'CIENCIAS');
    });

    it('Clase NO-EXISTE: debe retornar 404', async () => {
      const auth = await loginAsAdmin();
      const fakeId = 'clxxxxxxxxxxxxxxxxxxxxxxxxx';

      const response = await request(app.getHttpServer())
        .get(`/api/admin/grupos-pedagogicos/${fakeId}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(404);
    });
  });

  // ============================================================================
  // TESTS: PATCH /api/admin/grupos-pedagogicos:id - Actualizar Casa/Mundo
  // ============================================================================
  describe('PATCH /api/admin/grupos-pedagogicos:id', () => {
    it('Debe actualizar casa_tipo y mundo_tipo', async () => {
      const grupo = await crearGrupoPedagogico({ nombre: 'Grupo Update' });
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .patch(`/api/admin/grupos-pedagogicos${grupo.id}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ casa_tipo: 'VERTEX', mundo_tipo: 'PROGRAMACION' });

      expect(response.status).toBe(200);

      // Verificar en DB
      const enDB = await prisma.claseGrupo.findUnique({
        where: { id: grupo.id },
      });
      expect(enDB?.casa_tipo).toBe('VERTEX');
      expect(enDB?.mundo_tipo).toBe('PROGRAMACION');
    });

    it('State Transition: LEGACY → actualizar → CON_CASA_MUNDO', async () => {
      // ARRANGE - Crear grupo sin casa/mundo (legacy)
      const grupo = await crearGrupoPedagogico({ nombre: 'Grupo Legacy' });
      const auth = await loginAsAdmin();

      // Verificar estado inicial
      const antes = await prisma.claseGrupo.findUnique({
        where: { id: grupo.id },
      });
      expect(antes?.casa_tipo).toBeNull();
      expect(antes?.mundo_tipo).toBeNull();

      // ACT
      await request(app.getHttpServer())
        .patch(`/api/admin/grupos-pedagogicos${grupo.id}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ casa_tipo: 'QUANTUM', mundo_tipo: 'MATEMATICA' });

      // ASSERT
      const despues = await prisma.claseGrupo.findUnique({
        where: { id: grupo.id },
      });
      expect(despues?.casa_tipo).toBe('QUANTUM');
      expect(despues?.mundo_tipo).toBe('MATEMATICA');
    });

    it('State Transition: CON_CASA_MUNDO → actualizar → NUEVA_CASA_MUNDO', async () => {
      const grupo = await crearGrupoPedagogico({
        casa_tipo: 'QUANTUM',
        mundo_tipo: 'MATEMATICA',
      });
      const auth = await loginAsAdmin();

      await request(app.getHttpServer())
        .patch(`/api/admin/grupos-pedagogicos${grupo.id}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ casa_tipo: 'PULSAR', mundo_tipo: 'CIENCIAS' });

      const despues = await prisma.claseGrupo.findUnique({
        where: { id: grupo.id },
      });
      expect(despues?.casa_tipo).toBe('PULSAR');
      expect(despues?.mundo_tipo).toBe('CIENCIAS');
    });

    it('Clase NO-AUTH: debe retornar 401', async () => {
      const grupo = await crearGrupoPedagogico();

      const response = await request(app.getHttpServer())
        .patch(`/api/admin/grupos-pedagogicos${grupo.id}`)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({ casa_tipo: 'QUANTUM' });

      expect(response.status).toBe(401);
    });

    it('CasaTipo inválido → 400', async () => {
      const grupo = await crearGrupoPedagogico();
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .patch(`/api/admin/grupos-pedagogicos${grupo.id}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ casa_tipo: 'CASA_INVALIDA' });

      expect(response.status).toBe(400);
    });
  });

  // ============================================================================
  // TESTS: POST /api/admin/grupos-pedagogicos/migrar-legacy - Migración
  // ============================================================================
  describe('POST /api/admin/grupos-pedagogicos/migrar-legacy', () => {
    it('Debe migrar grupos legacy basado en sector/edad', async () => {
      // ARRANGE - Crear grupos legacy (sin casa_tipo/mundo_tipo)
      await crearGrupoPedagogico({ nombre: 'Grupo Legacy 1' });
      await crearGrupoPedagogico({ nombre: 'Grupo Legacy 2' });
      const auth = await loginAsAdmin();

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/admin/grupos-pedagogicos/migrar-legacy')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('migrados');
      expect(typeof response.body.migrados).toBe('number');
    });

    it('Sin grupos legacy → migrados = 0', async () => {
      // Crear grupo ya migrado
      await crearGrupoPedagogico({
        nombre: 'Grupo Ya Migrado',
        casa_tipo: 'QUANTUM',
        mundo_tipo: 'MATEMATICA',
      });
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .post('/api/admin/grupos-pedagogicos/migrar-legacy')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(200);
      expect(response.body.migrados).toBe(0);
    });

    it('Clase NO-AUTH: debe retornar 401', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/grupos-pedagogicos/migrar-legacy')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(401);
    });
  });

  // ============================================================================
  // TESTS: GET /api/admin/grupos-pedagogicos/estadisticas - Estadísticas
  // ============================================================================
  describe('GET /api/admin/grupos-pedagogicos/estadisticas', () => {
    it('Debe retornar estadísticas por casa y mundo', async () => {
      // ARRANGE - Crear grupos con diferentes casas/mundos
      await crearGrupoPedagogico({
        casa_tipo: 'QUANTUM',
        mundo_tipo: 'MATEMATICA',
      });
      await crearGrupoPedagogico({
        casa_tipo: 'QUANTUM',
        mundo_tipo: 'PROGRAMACION',
      });
      await crearGrupoPedagogico({
        casa_tipo: 'VERTEX',
        mundo_tipo: 'MATEMATICA',
      });
      await crearGrupoPedagogico({ nombre: 'Legacy' }); // Sin asignar
      const auth = await loginAsAdmin();

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/admin/grupos-pedagogicos/estadisticas')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('porCasa');
      expect(response.body).toHaveProperty('porMundo');
      expect(response.body).toHaveProperty('sinAsignar');
    });

    it('Sin grupos → estadísticas en 0', async () => {
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .get('/api/admin/grupos-pedagogicos/estadisticas')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(0);
    });

    it('Clase NO-AUTH: debe retornar 401', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/grupos-pedagogicos/estadisticas')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(401);
    });
  });

  // ============================================================================
  // ERROR GUESSING
  // ============================================================================
  describe('Error Guessing', () => {
    it('Actualizar grupo con ID inválido → 400', async () => {
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .patch('/api/admin/grupos-pedagogicosinvalid-id')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ casa_tipo: 'QUANTUM' });

      expect(response.status).toBe(400);
    });

    it('Filtro con valor de casa inválido → 400 o ignora', async () => {
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .get('/api/admin/grupos-pedagogicos?casa_tipo=INVALIDO')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      // Puede validar y dar 400, o ignorar el filtro
      expect([200, 400]).toContain(response.status);
    });
  });
});
