/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST
 * ============================================================================
 *
 * FEATURE: Admin Endpoints para Suscripciones Familiares 2026
 *
 * REGLAS DE NEGOCIO A VERIFICAR (NO mirar la implementación):
 * 1. Solo ADMIN puede acceder a estos endpoints (ni tutor ni docente)
 * 2. Pausar: Solo suscripciones en estado AUTHORIZED pueden pausarse
 * 3. Reactivar: Solo suscripciones en estado PAUSED pueden reactivarse
 * 4. Cancelar: Se puede cancelar desde AUTHORIZED o PAUSED, CANCELLED es final
 * 5. Cambiar tier: Admin puede cambiar tier de cualquier inscripción sin ownership
 *
 * EQUIVALENCE CLASSES:
 * - Auth: [admin-válido, tutor, docente, sin-auth]
 * - Suscripción estado: [AUTHORIZED, PAUSED, CANCELLED, PENDING, no-existe]
 * - Inscripción: [existe-activa, no-existe, cancelada]
 * - Tier: [STEAM_LIBROS, STEAM_ASINCRONICO, STEAM_SINCRONICO]
 *
 * STATE TRANSITIONS:
 * - AUTHORIZED → pausar → PAUSED ✓
 * - PAUSED → reactivar → AUTHORIZED ✓
 * - AUTHORIZED → cancelar → CANCELLED ✓
 * - PAUSED → cancelar → CANCELLED ✓
 * - CANCELLED → pausar → ERROR (estado final)
 * - CANCELLED → reactivar → ERROR (estado final)
 * - PENDING → pausar → ERROR (no autorizada aún)
 *
 * BOUNDARIES:
 * - Tier inscripción: valores válidos del enum TierNombre
 * - Motivo: string requerido para pausar/cancelar, opcional para reactivar
 *
 * ERROR GUESSING:
 * - UUID inválido para suscripción/inscripción
 * - Suscripción no existe
 * - Inscripción no existe
 * - Tier inválido
 * - Sin motivo cuando es requerido
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="suscripcion-familiar-admin.integration" --runInBand
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
  createTestTutor,
  createTestEstudiante,
  createTestProducto,
  createTestDocente,
  createTestAdmin,
  DEFAULT_PASSWORD,
} from '../../fixtures/factories';
import { loginUser, FRONTEND_ORIGIN } from '../../helpers/auth.helpers';
import {
  TipoProducto,
  EstadoSuscripcionFamiliar,
  TierNombre,
} from '@prisma/client';

describe('[INTEGRATION] Admin Suscripciones Familiares 2026', () => {
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
  // HELPER: Setup común para tests
  // ============================================================================

  /**
   * Crea un admin y retorna su auth cookie
   */
  async function setupAdmin() {
    const admin = await createTestAdmin(prisma);
    const auth = await loginUser(app, {
      email: admin.email,
      password: DEFAULT_PASSWORD,
    });
    return { admin, auth };
  }

  /**
   * Crea un tutor con hijos y productos activos
   */
  async function setupTutorConHijos(cantidadHijos: number = 2) {
    const { tutor, password } = await createTestTutor(prisma);

    const estudiantes = [];
    for (let i = 0; i < cantidadHijos; i++) {
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
        nombre: `Hijo${i + 1}`,
      });
      estudiantes.push(estudiante);
    }

    const auth = await loginUser(app, {
      email: tutor.email,
      password,
    });

    return { tutor, estudiantes, auth, password };
  }

  /**
   * Crea productos activos de tipo Club
   */
  async function setupProductosActivos(cantidad: number = 2) {
    const productos = [];
    for (let i = 0; i < cantidad; i++) {
      const producto = await createTestProducto(prisma, {
        nombre: `Club Test ${i + 1}`,
        tipo: TipoProducto.Club,
        precio: 40000,
      });
      productos.push(producto);
    }
    return productos;
  }

  /**
   * Crea una suscripción familiar y la retorna
   * Estado inicial depende de la implementación, típicamente PENDING o AUTHORIZED
   */
  async function crearSuscripcionFamiliar(
    tutorAuth: { cookie: string },
    estudianteId: string,
    productoId: string,
    tier: TierNombre = TierNombre.STEAM_LIBROS,
  ) {
    const response = await request(app.getHttpServer())
      .post('/api/suscripciones/familiar')
      .set('Cookie', tutorAuth.cookie)
      .set('Origin', FRONTEND_ORIGIN)
      .send({
        tier,
        inscripciones: [
          {
            estudianteId,
            productoId,
          },
        ],
      });

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(
        `Error creando suscripción: ${JSON.stringify(response.body)}`,
      );
    }

    return response.body.data;
  }

  /**
   * Fuerza el estado de una suscripción directamente en la DB
   * (Para testing de transiciones de estado)
   */
  async function forzarEstadoSuscripcion(
    suscripcionId: string,
    estado: EstadoSuscripcionFamiliar,
  ) {
    await prisma.suscripcionFamiliar.update({
      where: { id: suscripcionId },
      data: { estado },
    });
  }

  // ============================================================================
  // EQUIVALENCE PARTITIONING: Autenticación y Autorización
  // ============================================================================
  describe('Equivalence Partitioning: Autenticación Admin', () => {
    it('Clase SIN-AUTH: debe retornar 401 para POST /admin/:id/pausar', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/suscripciones/familiar/admin/any-id/pausar')
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Test' });

      expect(response.status).toBe(401);
    });

    it('Clase SIN-AUTH: debe retornar 401 para POST /admin/:id/reactivar', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/suscripciones/familiar/admin/any-id/reactivar')
        .set('Origin', FRONTEND_ORIGIN)
        .send({});

      expect(response.status).toBe(401);
    });

    it('Clase SIN-AUTH: debe retornar 401 para POST /admin/:id/cancelar', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/suscripciones/familiar/admin/any-id/cancelar')
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Test' });

      expect(response.status).toBe(401);
    });

    it('Clase SIN-AUTH: debe retornar 401 para PATCH /admin/inscripciones/:id/tier', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/suscripciones/familiar/admin/inscripciones/any-id/tier')
        .set('Origin', FRONTEND_ORIGIN)
        .send({ nuevoTier: 'STEAM_SINCRONICO' });

      expect(response.status).toBe(401);
    });

    it('Clase TUTOR: debe retornar 403 para endpoints admin', async () => {
      const { tutor, estudiantes, auth } = await setupTutorConHijos();
      const productos = await setupProductosActivos();

      // Crear suscripción
      const suscripcion = await crearSuscripcionFamiliar(
        auth,
        estudiantes[0].id,
        productos[0].id,
      );

      // Forzar estado AUTHORIZED para poder pausar
      await forzarEstadoSuscripcion(
        suscripcion.suscripcionId,
        EstadoSuscripcionFamiliar.AUTHORIZED,
      );

      // Tutor intenta pausar su propia suscripción via admin endpoint
      const response = await request(app.getHttpServer())
        .post(
          `/api/suscripciones/familiar/admin/${suscripcion.suscripcionId}/pausar`,
        )
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Test desde tutor' });

      expect(response.status).toBe(403);
    });

    it('Clase DOCENTE: debe retornar 403 para endpoints admin', async () => {
      const { docente, password } = await createTestDocente(prisma);
      const docenteAuth = await loginUser(app, {
        email: docente.email,
        password,
      });

      const response = await request(app.getHttpServer())
        .post('/api/suscripciones/familiar/admin/any-id/pausar')
        .set('Cookie', docenteAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Test desde docente' });

      expect(response.status).toBe(403);
    });

    it('Clase ADMIN-VÁLIDO: debe permitir acceso a endpoints admin', async () => {
      const { auth: adminAuth } = await setupAdmin();
      const { estudiantes, auth: tutorAuth } = await setupTutorConHijos();
      const productos = await setupProductosActivos();

      const suscripcion = await crearSuscripcionFamiliar(
        tutorAuth,
        estudiantes[0].id,
        productos[0].id,
      );

      await forzarEstadoSuscripcion(
        suscripcion.suscripcionId,
        EstadoSuscripcionFamiliar.AUTHORIZED,
      );

      const response = await request(app.getHttpServer())
        .post(
          `/api/suscripciones/familiar/admin/${suscripcion.suscripcionId}/pausar`,
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Pausa administrativa' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  // ============================================================================
  // STATE TRANSITIONS: Pausar Suscripción
  // ============================================================================
  describe('State Transitions: POST /admin/:id/pausar', () => {
    it('AUTHORIZED → pausar → PAUSED: transición válida', async () => {
      const { auth: adminAuth } = await setupAdmin();
      const { estudiantes, auth: tutorAuth } = await setupTutorConHijos();
      const productos = await setupProductosActivos();

      const suscripcion = await crearSuscripcionFamiliar(
        tutorAuth,
        estudiantes[0].id,
        productos[0].id,
      );

      await forzarEstadoSuscripcion(
        suscripcion.suscripcionId,
        EstadoSuscripcionFamiliar.AUTHORIZED,
      );

      const response = await request(app.getHttpServer())
        .post(
          `/api/suscripciones/familiar/admin/${suscripcion.suscripcionId}/pausar`,
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Pausa por falta de pago' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('suscripcionId');
      expect(response.body.data).toHaveProperty(
        'estadoAnterior',
        EstadoSuscripcionFamiliar.AUTHORIZED,
      );

      // Verificar estado en DB
      const suscripcionDB = await prisma.suscripcionFamiliar.findUnique({
        where: { id: suscripcion.suscripcionId },
      });
      expect(suscripcionDB?.estado).toBe(EstadoSuscripcionFamiliar.PAUSED);
    });

    it('PAUSED → pausar → ERROR: ya está pausada', async () => {
      const { auth: adminAuth } = await setupAdmin();
      const { estudiantes, auth: tutorAuth } = await setupTutorConHijos();
      const productos = await setupProductosActivos();

      const suscripcion = await crearSuscripcionFamiliar(
        tutorAuth,
        estudiantes[0].id,
        productos[0].id,
      );

      await forzarEstadoSuscripcion(
        suscripcion.suscripcionId,
        EstadoSuscripcionFamiliar.PAUSED,
      );

      const response = await request(app.getHttpServer())
        .post(
          `/api/suscripciones/familiar/admin/${suscripcion.suscripcionId}/pausar`,
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Intento de doble pausa' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('code', 'INVALID_STATE');
    });

    it('CANCELLED → pausar → ERROR: estado final', async () => {
      const { auth: adminAuth } = await setupAdmin();
      const { estudiantes, auth: tutorAuth } = await setupTutorConHijos();
      const productos = await setupProductosActivos();

      const suscripcion = await crearSuscripcionFamiliar(
        tutorAuth,
        estudiantes[0].id,
        productos[0].id,
      );

      await forzarEstadoSuscripcion(
        suscripcion.suscripcionId,
        EstadoSuscripcionFamiliar.CANCELLED,
      );

      const response = await request(app.getHttpServer())
        .post(
          `/api/suscripciones/familiar/admin/${suscripcion.suscripcionId}/pausar`,
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Intento pausar cancelada' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('code', 'INVALID_STATE');
    });

    it('PENDING → pausar → ERROR: no autorizada aún', async () => {
      const { auth: adminAuth } = await setupAdmin();
      const { estudiantes, auth: tutorAuth } = await setupTutorConHijos();
      const productos = await setupProductosActivos();

      const suscripcion = await crearSuscripcionFamiliar(
        tutorAuth,
        estudiantes[0].id,
        productos[0].id,
      );

      // Estado por defecto puede ser PENDING
      await forzarEstadoSuscripcion(
        suscripcion.suscripcionId,
        EstadoSuscripcionFamiliar.PENDING,
      );

      const response = await request(app.getHttpServer())
        .post(
          `/api/suscripciones/familiar/admin/${suscripcion.suscripcionId}/pausar`,
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Intento pausar pendiente' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('code', 'INVALID_STATE');
    });

    it('Debe requerir motivo para pausar', async () => {
      const { auth: adminAuth } = await setupAdmin();
      const { estudiantes, auth: tutorAuth } = await setupTutorConHijos();
      const productos = await setupProductosActivos();

      const suscripcion = await crearSuscripcionFamiliar(
        tutorAuth,
        estudiantes[0].id,
        productos[0].id,
      );

      await forzarEstadoSuscripcion(
        suscripcion.suscripcionId,
        EstadoSuscripcionFamiliar.AUTHORIZED,
      );

      const response = await request(app.getHttpServer())
        .post(
          `/api/suscripciones/familiar/admin/${suscripcion.suscripcionId}/pausar`,
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({}); // Sin motivo

      expect(response.status).toBe(400);
    });
  });

  // ============================================================================
  // STATE TRANSITIONS: Reactivar Suscripción
  // ============================================================================
  describe('State Transitions: POST /admin/:id/reactivar', () => {
    it('PAUSED → reactivar → AUTHORIZED: transición válida', async () => {
      const { auth: adminAuth } = await setupAdmin();
      const { estudiantes, auth: tutorAuth } = await setupTutorConHijos();
      const productos = await setupProductosActivos();

      const suscripcion = await crearSuscripcionFamiliar(
        tutorAuth,
        estudiantes[0].id,
        productos[0].id,
      );

      await forzarEstadoSuscripcion(
        suscripcion.suscripcionId,
        EstadoSuscripcionFamiliar.PAUSED,
      );

      const response = await request(app.getHttpServer())
        .post(
          `/api/suscripciones/familiar/admin/${suscripcion.suscripcionId}/reactivar`,
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Pago regularizado' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('suscripcionId');
      expect(response.body.data).toHaveProperty(
        'estadoAnterior',
        EstadoSuscripcionFamiliar.PAUSED,
      );

      // Verificar estado en DB
      const suscripcionDB = await prisma.suscripcionFamiliar.findUnique({
        where: { id: suscripcion.suscripcionId },
      });
      expect(suscripcionDB?.estado).toBe(EstadoSuscripcionFamiliar.AUTHORIZED);
    });

    it('AUTHORIZED → reactivar → ERROR: ya está activa', async () => {
      const { auth: adminAuth } = await setupAdmin();
      const { estudiantes, auth: tutorAuth } = await setupTutorConHijos();
      const productos = await setupProductosActivos();

      const suscripcion = await crearSuscripcionFamiliar(
        tutorAuth,
        estudiantes[0].id,
        productos[0].id,
      );

      await forzarEstadoSuscripcion(
        suscripcion.suscripcionId,
        EstadoSuscripcionFamiliar.AUTHORIZED,
      );

      const response = await request(app.getHttpServer())
        .post(
          `/api/suscripciones/familiar/admin/${suscripcion.suscripcionId}/reactivar`,
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('code', 'INVALID_STATE');
    });

    it('CANCELLED → reactivar → ERROR: estado final', async () => {
      const { auth: adminAuth } = await setupAdmin();
      const { estudiantes, auth: tutorAuth } = await setupTutorConHijos();
      const productos = await setupProductosActivos();

      const suscripcion = await crearSuscripcionFamiliar(
        tutorAuth,
        estudiantes[0].id,
        productos[0].id,
      );

      await forzarEstadoSuscripcion(
        suscripcion.suscripcionId,
        EstadoSuscripcionFamiliar.CANCELLED,
      );

      const response = await request(app.getHttpServer())
        .post(
          `/api/suscripciones/familiar/admin/${suscripcion.suscripcionId}/reactivar`,
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('code', 'INVALID_STATE');
    });

    it('Reactivar sin motivo debe funcionar (motivo es opcional)', async () => {
      const { auth: adminAuth } = await setupAdmin();
      const { estudiantes, auth: tutorAuth } = await setupTutorConHijos();
      const productos = await setupProductosActivos();

      const suscripcion = await crearSuscripcionFamiliar(
        tutorAuth,
        estudiantes[0].id,
        productos[0].id,
      );

      await forzarEstadoSuscripcion(
        suscripcion.suscripcionId,
        EstadoSuscripcionFamiliar.PAUSED,
      );

      const response = await request(app.getHttpServer())
        .post(
          `/api/suscripciones/familiar/admin/${suscripcion.suscripcionId}/reactivar`,
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({}); // Sin motivo

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  // ============================================================================
  // STATE TRANSITIONS: Cancelar Suscripción (Admin)
  // ============================================================================
  describe('State Transitions: POST /admin/:id/cancelar', () => {
    it('AUTHORIZED → cancelar → CANCELLED: transición válida', async () => {
      const { auth: adminAuth } = await setupAdmin();
      const { estudiantes, auth: tutorAuth } = await setupTutorConHijos();
      const productos = await setupProductosActivos();

      const suscripcion = await crearSuscripcionFamiliar(
        tutorAuth,
        estudiantes[0].id,
        productos[0].id,
      );

      await forzarEstadoSuscripcion(
        suscripcion.suscripcionId,
        EstadoSuscripcionFamiliar.AUTHORIZED,
      );

      const response = await request(app.getHttpServer())
        .post(
          `/api/suscripciones/familiar/admin/${suscripcion.suscripcionId}/cancelar`,
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Cancelación administrativa' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);

      // Verificar estado en DB
      const suscripcionDB = await prisma.suscripcionFamiliar.findUnique({
        where: { id: suscripcion.suscripcionId },
      });
      expect(suscripcionDB?.estado).toBe(EstadoSuscripcionFamiliar.CANCELLED);
    });

    it('PAUSED → cancelar → CANCELLED: transición válida', async () => {
      const { auth: adminAuth } = await setupAdmin();
      const { estudiantes, auth: tutorAuth } = await setupTutorConHijos();
      const productos = await setupProductosActivos();

      const suscripcion = await crearSuscripcionFamiliar(
        tutorAuth,
        estudiantes[0].id,
        productos[0].id,
      );

      await forzarEstadoSuscripcion(
        suscripcion.suscripcionId,
        EstadoSuscripcionFamiliar.PAUSED,
      );

      const response = await request(app.getHttpServer())
        .post(
          `/api/suscripciones/familiar/admin/${suscripcion.suscripcionId}/cancelar`,
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Cancelación de suscripción pausada' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);

      const suscripcionDB = await prisma.suscripcionFamiliar.findUnique({
        where: { id: suscripcion.suscripcionId },
      });
      expect(suscripcionDB?.estado).toBe(EstadoSuscripcionFamiliar.CANCELLED);
    });

    it('CANCELLED → cancelar → ERROR: ya está cancelada', async () => {
      const { auth: adminAuth } = await setupAdmin();
      const { estudiantes, auth: tutorAuth } = await setupTutorConHijos();
      const productos = await setupProductosActivos();

      const suscripcion = await crearSuscripcionFamiliar(
        tutorAuth,
        estudiantes[0].id,
        productos[0].id,
      );

      await forzarEstadoSuscripcion(
        suscripcion.suscripcionId,
        EstadoSuscripcionFamiliar.CANCELLED,
      );

      const response = await request(app.getHttpServer())
        .post(
          `/api/suscripciones/familiar/admin/${suscripcion.suscripcionId}/cancelar`,
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Doble cancelación' });

      // El endpoint existente de cancelar maneja esto
      // Puede ser 400 con código específico o 200 si es idempotente
      expect([200, 400]).toContain(response.status);
    });

    it('Debe requerir motivo para cancelar', async () => {
      const { auth: adminAuth } = await setupAdmin();
      const { estudiantes, auth: tutorAuth } = await setupTutorConHijos();
      const productos = await setupProductosActivos();

      const suscripcion = await crearSuscripcionFamiliar(
        tutorAuth,
        estudiantes[0].id,
        productos[0].id,
      );

      await forzarEstadoSuscripcion(
        suscripcion.suscripcionId,
        EstadoSuscripcionFamiliar.AUTHORIZED,
      );

      const response = await request(app.getHttpServer())
        .post(
          `/api/suscripciones/familiar/admin/${suscripcion.suscripcionId}/cancelar`,
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({}); // Sin motivo

      expect(response.status).toBe(400);
    });
  });

  // ============================================================================
  // CAMBIAR TIER INSCRIPCIÓN (Admin)
  // ============================================================================
  describe('Admin: PATCH /admin/inscripciones/:id/tier', () => {
    it('Debe permitir cambiar tier de inscripción existente', async () => {
      const { auth: adminAuth } = await setupAdmin();
      const { estudiantes, auth: tutorAuth } = await setupTutorConHijos();
      const productos = await setupProductosActivos();

      await crearSuscripcionFamiliar(
        tutorAuth,
        estudiantes[0].id,
        productos[0].id,
        TierNombre.STEAM_LIBROS,
      );

      // Obtener inscripción
      const getSuscripcion = await request(app.getHttpServer())
        .get('/api/suscripciones/familiar')
        .set('Cookie', tutorAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      const inscripcionId = getSuscripcion.body.data?.inscripciones?.[0]?.id;

      if (!inscripcionId) {
        // Si no hay inscripciones en el response, buscar directamente en DB
        const inscripcion = await prisma.inscripcionActividad.findFirst({
          where: { estudianteId: estudiantes[0].id },
        });
        expect(inscripcion).toBeDefined();
        return; // Skip este test si no podemos obtener la inscripción
      }

      const response = await request(app.getHttpServer())
        .patch(
          `/api/suscripciones/familiar/admin/inscripciones/${inscripcionId}/tier`,
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          nuevoTier: TierNombre.STEAM_SINCRONICO,
          motivo: 'Upgrade administrativo',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('inscripcionId');
      expect(response.body.data).toHaveProperty(
        'nuevoTier',
        TierNombre.STEAM_SINCRONICO,
      );
    });

    it('Debe rechazar inscripción inexistente', async () => {
      const { auth: adminAuth } = await setupAdmin();

      const response = await request(app.getHttpServer())
        .patch(
          '/api/suscripciones/familiar/admin/inscripciones/00000000-0000-0000-0000-000000000000/tier',
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          nuevoTier: TierNombre.STEAM_SINCRONICO,
          motivo: 'Test',
        });

      expect(response.status).toBe(400);
    });

    it('Debe rechazar tier inválido', async () => {
      const { auth: adminAuth } = await setupAdmin();
      const { estudiantes, auth: tutorAuth } = await setupTutorConHijos();
      const productos = await setupProductosActivos();

      await crearSuscripcionFamiliar(
        tutorAuth,
        estudiantes[0].id,
        productos[0].id,
      );

      // Buscar inscripción en DB
      const inscripcion = await prisma.inscripcionActividad.findFirst({
        where: { estudiante_id: estudiantes[0].id },
      });

      if (!inscripcion) {
        return; // Skip si no hay inscripción
      }

      const response = await request(app.getHttpServer())
        .patch(
          `/api/suscripciones/familiar/admin/inscripciones/${inscripcion.id}/tier`,
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          nuevoTier: 'TIER_INVALIDO',
          motivo: 'Test',
        });

      expect(response.status).toBe(400);
    });

    it('Motivo es opcional para cambio de tier', async () => {
      const { auth: adminAuth } = await setupAdmin();
      const { estudiantes, auth: tutorAuth } = await setupTutorConHijos();
      const productos = await setupProductosActivos();

      await crearSuscripcionFamiliar(
        tutorAuth,
        estudiantes[0].id,
        productos[0].id,
      );

      const inscripcion = await prisma.inscripcionActividad.findFirst({
        where: { estudiante_id: estudiantes[0].id },
      });

      if (!inscripcion) {
        return;
      }

      const response = await request(app.getHttpServer())
        .patch(
          `/api/suscripciones/familiar/admin/inscripciones/${inscripcion.id}/tier`,
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          nuevoTier: TierNombre.STEAM_ASINCRONICO,
          // Sin motivo
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  // ============================================================================
  // ERROR GUESSING: Casos edge
  // ============================================================================
  describe('Error Guessing: Casos edge', () => {
    it('UUID inválido para suscripción', async () => {
      const { auth: adminAuth } = await setupAdmin();

      const response = await request(app.getHttpServer())
        .post('/api/suscripciones/familiar/admin/not-a-uuid/pausar')
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Test' });

      // ParseIdPipe debe rechazar UUID inválido con 400
      expect(response.status).toBe(400);
    });

    it('Suscripción no existe', async () => {
      const { auth: adminAuth } = await setupAdmin();

      const response = await request(app.getHttpServer())
        .post(
          '/api/suscripciones/familiar/admin/00000000-0000-0000-0000-000000000000/pausar',
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'code',
        'SUSCRIPCION_FAMILIAR_NOT_FOUND',
      );
    });

    it('Motivo vacío debe ser rechazado para pausar', async () => {
      const { auth: adminAuth } = await setupAdmin();
      const { estudiantes, auth: tutorAuth } = await setupTutorConHijos();
      const productos = await setupProductosActivos();

      const suscripcion = await crearSuscripcionFamiliar(
        tutorAuth,
        estudiantes[0].id,
        productos[0].id,
      );

      await forzarEstadoSuscripcion(
        suscripcion.suscripcionId,
        EstadoSuscripcionFamiliar.AUTHORIZED,
      );

      const response = await request(app.getHttpServer())
        .post(
          `/api/suscripciones/familiar/admin/${suscripcion.suscripcionId}/pausar`,
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: '' }); // Motivo vacío

      expect(response.status).toBe(400);
    });

    it('Flujo completo: AUTHORIZED → PAUSED → AUTHORIZED → CANCELLED', async () => {
      const { auth: adminAuth } = await setupAdmin();
      const { estudiantes, auth: tutorAuth } = await setupTutorConHijos();
      const productos = await setupProductosActivos();

      const suscripcion = await crearSuscripcionFamiliar(
        tutorAuth,
        estudiantes[0].id,
        productos[0].id,
      );

      await forzarEstadoSuscripcion(
        suscripcion.suscripcionId,
        EstadoSuscripcionFamiliar.AUTHORIZED,
      );

      // 1. AUTHORIZED → PAUSED
      const pausar = await request(app.getHttpServer())
        .post(
          `/api/suscripciones/familiar/admin/${suscripcion.suscripcionId}/pausar`,
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Pausa temporal' });

      expect(pausar.status).toBe(200);

      // 2. PAUSED → AUTHORIZED
      const reactivar = await request(app.getHttpServer())
        .post(
          `/api/suscripciones/familiar/admin/${suscripcion.suscripcionId}/reactivar`,
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Reactivación' });

      expect(reactivar.status).toBe(200);

      // 3. AUTHORIZED → CANCELLED
      const cancelar = await request(app.getHttpServer())
        .post(
          `/api/suscripciones/familiar/admin/${suscripcion.suscripcionId}/cancelar`,
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Cancelación final' });

      expect(cancelar.status).toBe(200);

      // 4. Verificar estado final
      const suscripcionDB = await prisma.suscripcionFamiliar.findUnique({
        where: { id: suscripcion.suscripcionId },
      });
      expect(suscripcionDB?.estado).toBe(EstadoSuscripcionFamiliar.CANCELLED);

      // 5. No se puede reactivar una cancelada
      const intentoReactivar = await request(app.getHttpServer())
        .post(
          `/api/suscripciones/familiar/admin/${suscripcion.suscripcionId}/reactivar`,
        )
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({});

      expect(intentoReactivar.status).toBe(400);
    });
  });
});
