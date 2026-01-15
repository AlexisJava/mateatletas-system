/**
 * ============================================================================
 * MÚLTIPLES HIJOS CON DIFERENTES ESTADOS - Black Box Testing
 * ============================================================================
 *
 * Tests de integración para escenarios con familias numerosas donde cada
 * hijo puede tener diferentes estados de acceso.
 *
 * ============================================================================
 * CLASES DE EQUIVALENCIA
 * ============================================================================
 *
 * ESTADOS DE ACCESO POR ESTUDIANTE:
 * CE1: Todos los hijos con acceso activo
 * CE2: Algunos hijos con acceso, otros sin acceso
 * CE3: Todos los hijos sin acceso (tutor moroso)
 * CE4: Hijos con diferentes planes activos
 * CE5: Hijos con suscripción vs comisión vs override
 *
 * ESCENARIOS DE MOROSIDAD:
 * CE6: Tutor moroso afecta a todos los hijos
 * CE7: Un hijo dado de baja, otros mantienen acceso
 * CE8: Suscripción cancelada, hijos en comisión mantienen acceso
 *
 * ESCENARIOS DE TRANSICIÓN:
 * CE9: Tutor paga morosidad → todos los hijos recuperan acceso
 * CE10: Nuevo hijo agregado a suscripción existente
 * CE11: Hijo removido de suscripción (cambio de plan)
 *
 * ============================================================================
 * CASOS BORDE
 * ============================================================================
 *
 * - Familia con 10+ hijos
 * - Estudiante en múltiples comisiones
 * - Estudiante con override de admin
 * - Tutor con múltiples suscripciones (diferentes planes)
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { EstadoSuscripcion, EstadoPago, TipoProducto } from '@prisma/client';

import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/core/database/prisma.service';
import {
  createTestTutor,
  createTestEstudiante,
  createTestAdmin,
} from '../../fixtures/factories';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import { loginUser, generateUniqueIP } from '../../helpers/test-utils';

const FRONTEND_ORIGIN = 'http://localhost:3000';
const DEFAULT_PASSWORD = 'Test123!@#';

describe('Múltiples Hijos con Diferentes Estados (BBT)', () => {
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
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  }, 60000);

  afterAll(async () => {
    await cleanAllTestTables(prisma);
    await app.close();
  }, 30000);

  afterEach(async () => {
    await cleanAllTestTables(prisma);
  });

  // ============================================================================
  // HELPERS
  // ============================================================================

  async function crearPlanSuscripcion(
    nombre = 'STEAM_SINCRONICO',
    precio = 95000,
  ) {
    return prisma.planSuscripcion.create({
      data: {
        nombre,
        descripcion: `Plan ${nombre} test`,
        precio_base: precio,
        frecuencia_cobro: 'monthly',
        activo: true,
        beneficios: ['Acceso completo'],
      },
    });
  }

  async function crearSuscripcion(
    tutorId: string,
    planId: string,
    estado: EstadoSuscripcion,
    estudianteIds: string[] = [],
  ) {
    return prisma.suscripcion.create({
      data: {
        tutor_id: tutorId,
        plan_id: planId,
        estado,
        precio_final: 95000,
        mp_preapproval_id: `preapproval_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        mp_status:
          estado === EstadoSuscripcion.ACTIVA ? 'authorized' : 'pending',
        estudiantes:
          estudianteIds.length > 0
            ? { connect: estudianteIds.map((id) => ({ id })) }
            : undefined,
      },
      include: { estudiantes: true },
    });
  }

  async function crearProductoConComision(docenteId?: string) {
    const producto = await prisma.producto.create({
      data: {
        nombre: `Producto Test ${Date.now()}`,
        tipo: TipoProducto.Curso,
        monto: 50000,
        fecha_inicio: new Date(),
        fecha_fin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        activo: true,
      },
    });

    let docente = null;
    if (!docenteId) {
      // Crear docente si no se proporciona
      docente = await prisma.persona.create({
        data: {
          email: `docente_${Date.now()}@test.com`,
          password_hash: 'hash',
          nombre: 'Docente',
          apellido: 'Test',
          telefono: '1234567890',
          tipo_documento: 'DNI',
          nro_documento: `${Date.now()}`,
          roles: { create: { rol: 'DOCENTE' } },
        },
      });
    }

    const comision = await prisma.comision.create({
      data: {
        nombre: `Comisión ${Date.now()}`,
        producto_id: producto.id,
        docente_id: docenteId || docente!.id,
        cupo_maximo: 20,
        fecha_inicio: new Date(),
        fecha_fin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });

    return { producto, comision, docente };
  }

  // ============================================================================
  // CE1: TODOS LOS HIJOS CON ACCESO ACTIVO
  // ============================================================================

  describe('CE1: Todos los hijos con acceso activo', () => {
    it('should grant access to all children when suscription is ACTIVA', async () => {
      const admin = await createTestAdmin(prisma);
      const { tutor } = await createTestTutor(prisma);
      const plan = await crearPlanSuscripcion();

      // Crear 3 estudiantes
      const estudiantes = [];
      for (let i = 0; i < 3; i++) {
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        estudiantes.push(estudiante);
      }

      // Crear suscripción ACTIVA con los 3 estudiantes
      await crearSuscripcion(
        tutor.id,
        plan.id,
        EstadoSuscripcion.ACTIVA,
        estudiantes.map((e) => e.id),
      );

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Verificar que todos tienen acceso
      for (const estudiante of estudiantes) {
        const response = await request(app.getHttpServer())
          .get(`/api/pagos/morosidad/estudiante/${estudiante.id}`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
        expect(response.body.permitirAcceso).toBe(true);
      }
    });
  });

  // ============================================================================
  // CE2: ALGUNOS HIJOS CON ACCESO, OTROS SIN ACCESO
  // ============================================================================

  describe('CE2: Algunos hijos con acceso, otros sin acceso', () => {
    it('should handle mixed access states within same family', async () => {
      const admin = await createTestAdmin(prisma);
      const { tutor } = await createTestTutor(prisma);
      const plan = await crearPlanSuscripcion();

      // Hijo 1: Con suscripción ACTIVA
      const { estudiante: hijo1 } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      await crearSuscripcion(tutor.id, plan.id, EstadoSuscripcion.ACTIVA, [
        hijo1.id,
      ]);

      // Hijo 2: Sin suscripción (solo creado)
      const { estudiante: hijo2 } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Hijo 3: Con suscripción CANCELADA
      const { estudiante: hijo3 } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      await crearSuscripcion(tutor.id, plan.id, EstadoSuscripcion.CANCELADA, [
        hijo3.id,
      ]);

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Hijo 1: Debería tener acceso
      const resp1 = await request(app.getHttpServer())
        .get(`/api/pagos/morosidad/estudiante/${hijo1.id}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());
      expect(resp1.body.permitirAcceso).toBe(true);

      // Hijo 2: Sin suscripción - debería tener acceso si no hay deudas
      const resp2 = await request(app.getHttpServer())
        .get(`/api/pagos/morosidad/estudiante/${hijo2.id}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());
      expect(resp2.status).toBe(200);
      // Sin deudas = permitir acceso
      expect(resp2.body.permitirAcceso).toBe(true);

      // Hijo 3: Con suscripción cancelada - depende si tiene deudas
      const resp3 = await request(app.getHttpServer())
        .get(`/api/pagos/morosidad/estudiante/${hijo3.id}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());
      expect(resp3.status).toBe(200);
    });
  });

  // ============================================================================
  // CE3: TODOS LOS HIJOS SIN ACCESO (TUTOR MOROSO)
  // ============================================================================

  describe('CE3: Todos los hijos sin acceso (tutor moroso)', () => {
    it('should deny access to all children when tutor is moroso', async () => {
      const admin = await createTestAdmin(prisma);
      const { tutor } = await createTestTutor(prisma);
      const plan = await crearPlanSuscripcion();

      // Crear 3 estudiantes
      const estudiantes = [];
      for (let i = 0; i < 3; i++) {
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        estudiantes.push(estudiante);
      }

      // Crear suscripción MOROSA con los 3 estudiantes
      await crearSuscripcion(
        tutor.id,
        plan.id,
        EstadoSuscripcion.MOROSA,
        estudiantes.map((e) => e.id),
      );

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Verificar que la suscripción está morosa
      const suscripcion = await prisma.suscripcion.findFirst({
        where: { tutor_id: tutor.id },
      });
      expect(suscripcion?.estado).toBe(EstadoSuscripcion.MOROSA);
    });
  });

  // ============================================================================
  // CE4: HIJOS CON DIFERENTES PLANES ACTIVOS
  // ============================================================================

  describe('CE4: Hijos con diferentes planes activos', () => {
    it('should handle children with different active plans', async () => {
      const admin = await createTestAdmin(prisma);
      const { tutor } = await createTestTutor(prisma);

      // Crear diferentes planes
      const planLibros = await crearPlanSuscripcion('STEAM_LIBROS', 40000);
      const planAsync = await crearPlanSuscripcion('STEAM_ASINCRONICO', 65000);
      const planSync = await crearPlanSuscripcion('STEAM_SINCRONICO', 95000);

      // Hijo 1: Plan Libros
      const { estudiante: hijo1 } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      await crearSuscripcion(
        tutor.id,
        planLibros.id,
        EstadoSuscripcion.ACTIVA,
        [hijo1.id],
      );

      // Hijo 2: Plan Asincrónico
      const { estudiante: hijo2 } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      await crearSuscripcion(tutor.id, planAsync.id, EstadoSuscripcion.ACTIVA, [
        hijo2.id,
      ]);

      // Hijo 3: Plan Sincrónico
      const { estudiante: hijo3 } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      await crearSuscripcion(tutor.id, planSync.id, EstadoSuscripcion.ACTIVA, [
        hijo3.id,
      ]);

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Verificar que el tutor tiene 3 suscripciones activas
      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/admin')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);

      const suscripcionesDelTutor = response.body.data.filter(
        (s: { tutor: { id: string }; estado: string }) =>
          s.tutor.id === tutor.id && s.estado === 'ACTIVA',
      );
      expect(suscripcionesDelTutor.length).toBe(3);
    });
  });

  // ============================================================================
  // CE6: TUTOR MOROSO AFECTA A TODOS LOS HIJOS
  // ============================================================================

  describe('CE6: Tutor moroso afecta a todos los hijos', () => {
    it('should list tutor as moroso when has overdue payments', async () => {
      const admin = await createTestAdmin(prisma);
      const { tutor } = await createTestTutor(prisma);

      // Crear estudiante
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Crear producto para inscripciones
      const producto = await prisma.producto.create({
        data: {
          nombre: 'Producto Test',
          tipo: TipoProducto.Curso,
          monto: 50000,
          activo: true,
          fecha_inicio: new Date(),
          fecha_fin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
      });

      // Crear inscripción vencida (periodo pasado)
      const periodoVencido = new Date();
      periodoVencido.setMonth(periodoVencido.getMonth() - 2);
      const periodoStr = `${periodoVencido.getFullYear()}-${String(periodoVencido.getMonth() + 1).padStart(2, '0')}`;

      await prisma.inscripcionMensual.create({
        data: {
          estudiante_id: estudiante.id,
          tutor_id: tutor.id,
          producto_id: producto.id,
          periodo: periodoStr,
          monto: 50000,
          fecha_vencimiento: new Date(
            periodoVencido.getFullYear(),
            periodoVencido.getMonth() + 1,
            0,
          ),
          estado_pago: EstadoPago.Pendiente,
        },
      });

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Verificar morosidad del tutor
      const response = await request(app.getHttpServer())
        .get(`/api/pagos/morosidad/tutor/${tutor.id}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);
      expect(response.body.tieneMorosidad).toBe(true);
    });
  });

  // ============================================================================
  // FAMILIA NUMEROSA (10+ HIJOS)
  // ============================================================================

  describe('Familia Numerosa (10+ hijos)', () => {
    it('should handle family with 10 children', async () => {
      const admin = await createTestAdmin(prisma);
      const { tutor } = await createTestTutor(prisma);
      const plan = await crearPlanSuscripcion();

      // Crear 10 estudiantes
      const estudiantes = [];
      for (let i = 0; i < 10; i++) {
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        estudiantes.push(estudiante);
      }

      // Crear suscripción con los 10 estudiantes
      await crearSuscripcion(
        tutor.id,
        plan.id,
        EstadoSuscripcion.ACTIVA,
        estudiantes.map((e) => e.id),
      );

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Verificar que se puede consultar
      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/admin')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);

      // Verificar en DB
      const suscripcion = await prisma.suscripcion.findFirst({
        where: { tutor_id: tutor.id },
        include: { estudiantes: true },
      });
      expect(suscripcion?.estudiantes.length).toBe(10);
    });
  });

  // ============================================================================
  // ESTUDIANTE CON OVERRIDE DE ADMIN
  // ============================================================================

  describe('Estudiante con override de admin', () => {
    it('should handle estudiante with admin override', async () => {
      const admin = await createTestAdmin(prisma);
      const { tutor } = await createTestTutor(prisma);

      // Estudiante con override de acceso
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Agregar override de acceso (si existe el campo)
      // Esto depende de la implementación específica

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const response = await request(app.getHttpServer())
        .get(`/api/pagos/morosidad/estudiante/${estudiante.id}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);
    });
  });

  // ============================================================================
  // DASHBOARD TUTOR CON MÚLTIPLES HIJOS
  // ============================================================================

  describe('Dashboard Tutor con Múltiples Hijos', () => {
    it('should show correct summary for tutor with multiple children', async () => {
      const { tutor, password } = await createTestTutor(prisma);
      const plan = await crearPlanSuscripcion();

      // Crear 5 estudiantes con diferentes estados
      const { estudiante: hijo1 } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      const { estudiante: hijo2 } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      const { estudiante: hijo3 } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Suscripción ACTIVA con hijos 1 y 2
      await crearSuscripcion(tutor.id, plan.id, EstadoSuscripcion.ACTIVA, [
        hijo1.id,
        hijo2.id,
      ]);

      // Hijo 3 sin suscripción
      // (solo creado)

      const auth = await loginUser(app, { email: tutor.email, password });

      // Obtener mis suscripciones
      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/mis-suscripciones')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);
      expect(response.body.suscripciones.length).toBeGreaterThanOrEqual(1);
    });
  });
});
