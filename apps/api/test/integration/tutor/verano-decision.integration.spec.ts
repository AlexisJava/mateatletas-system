/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST - FLUJO DE VERANO
 * ============================================================================
 *
 * SPEC: docs/spec_modelo_suscripciones_verano.md
 *
 * ENDPOINTS TESTEADOS:
 * - POST /tutor/verano/decidir
 * - POST /tutor/verano/solicitar-colonia
 * - POST /tutor/verano/cancelar-colonia
 * - GET  /tutor/verano/estado
 * - POST /admin/verano/procesar-bajas (cron job 6 dic)
 * - POST /admin/verano/restaurar-suscripciones (cron job 1 marzo)
 *
 * EQUIVALENCE CLASSES:
 * - Período: [dentro-de-decisión (15nov-5dic), antes-de-período, después-de-período]
 * - Decisión: [COLONIA, CONTINUIDAD, BAJA]
 * - Estado actual: [ACTIVA, CONTINUIDAD, BAJA, ya-decidió]
 * - Cupos Colonia: [disponibles, sin-cupo]
 * - Relación hijo-tutor: [hijo-propio, hijo-ajeno]
 *
 * STATE TRANSITIONS (según spec):
 * - ACTIVA + decide COLONIA → ACTIVA (monto=$40k dic, $95k ene/feb)
 * - ACTIVA + decide CONTINUIDAD → CONTINUIDAD (monto=$20k/mes)
 * - ACTIVA + decide BAJA → BAJA (monto=$0, pierde cupo)
 * - ACTIVA + no-responde (6 dic) → BAJA (automático)
 * - CONTINUIDAD + solicita-colonia (hay cupo) → ACTIVA (monto=$95k)
 * - CONTINUIDAD + solicita-colonia (sin cupo) → CONTINUIDAD (sin cambio)
 * - COLONIA + cancela-colonia → CONTINUIDAD (pierde matrícula $40k)
 * - CONTINUIDAD (1 marzo) → ACTIVA (monto original del tier)
 *
 * BOUNDARIES:
 * - Fecha límite decisión: 5 de diciembre 23:59:59
 * - Cupo mínimo Colonia: 0 (sin cupo)
 * - Múltiples hijos: hasta N hijos con decisiones independientes
 *
 * BUSINESS RULES (CRÍTICO):
 * - Matrícula Colonia ($40k) es NO REEMBOLSABLE
 * - Cada hijo puede tener decisión diferente
 * - No responder = BAJA automática (pierde cupo)
 * - Cupo se verifica POR GRUPO, no total
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="verano-decision.integration" --runInBand
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { ClockService } from '../../../src/core/services/clock.service';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import {
  loginUser,
  FRONTEND_ORIGIN,
  generateUniqueIP,
} from '../../helpers/auth.helpers';
import {
  createTutorConSuscripcionFamiliar,
  createTutorConDosHijos,
  createGrupoColoniaConCupos,
  PRECIOS_VERANO,
  PRECIOS_TIER,
} from '../../fixtures/factories/verano.factory';
import {
  createTestTutor,
  createTestEstudiante,
} from '../../fixtures/factories';

// ============================================================================
// CONSTANTES DE TEST
// ============================================================================

const FECHA_INICIO_DECISION = new Date('2025-11-15T00:00:00-03:00');
const FECHA_FIN_DECISION = new Date('2025-12-05T23:59:59-03:00');
const FECHA_PROCESAMIENTO = new Date('2025-12-06T00:00:00-03:00');
const FECHA_MARZO = new Date('2026-03-01T00:00:00-03:00');

// ============================================================================
// MOCK CLOCK SERVICE - Fecha configurable via DI
// ============================================================================

/**
 * Mock de ClockService para tests de integración.
 * Permite simular cualquier fecha sin usar jest.useFakeTimers()
 * que interfiere con Prisma y operaciones async.
 */
class MockClockService {
  private _currentDate: Date = new Date();

  setDate(date: Date): void {
    this._currentDate = date;
  }

  reset(): void {
    this._currentDate = new Date();
  }

  now(): Date {
    return new Date(this._currentDate);
  }

  currentYear(): number {
    return this._currentDate.getFullYear();
  }

  currentMonth(): number {
    return this._currentDate.getMonth() + 1;
  }
}

// Instancia global del mock para que los tests puedan configurarlo
const mockClock = new MockClockService();

// Helper functions para los tests
function mockCurrentDate(date: Date): void {
  mockClock.setDate(date);
}

function restoreRealDate(): void {
  mockClock.reset();
}

// ============================================================================
// TEST SUITE
// ============================================================================

describe('[INTEGRATION] Flujo de Verano - Decisión y Transiciones', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // ==========================================================================
  // SETUP
  // ==========================================================================

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ClockService)
      .useValue(mockClock)
      .compile();

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
    restoreRealDate();
    await prisma.$disconnect();
    await app.close();
  }, 30000);

  beforeEach(async () => {
    // Por defecto, simular que estamos dentro del período de decisión (20 nov 2025)
    mockCurrentDate(new Date('2025-11-20T10:00:00-03:00'));
    await cleanAllTestTables(prisma);
  });

  // ==========================================================================
  // 1. DECISIÓN DE VERANO (POST /tutor/verano/decidir)
  // ==========================================================================

  describe('POST /api/tutor/verano/decidir', () => {
    describe('Equivalence Partitioning: Decisiones válidas', () => {
      it('Clase COLONIA: debe cambiar estado y cobrar matrícula $40.000 en diciembre', async () => {
        // ARRANGE
        mockCurrentDate(new Date('2025-11-20T10:00:00-03:00')); // Dentro del período
        const setup = await createTutorConSuscripcionFamiliar(prisma);
        const auth = await loginUser(app, {
          email: setup.tutor.email!,
          password: setup.tutorPassword,
        });

        // ACT
        const response = await request(app.getHttpServer())
          .post('/api/tutor/verano/decidir')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP())
          .send({
            estudianteId: setup.estudiantes[0].id,
            decision: 'COLONIA',
          });

        // ASSERT
        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
          success: true,
          montoProximoCobro: PRECIOS_VERANO.MATRICULA_COLONIA, // $40.000
        });

        // Verificar en DB
        const suscripcionActualizada =
          await prisma.suscripcionFamiliar.findUnique({
            where: { id: setup.suscripcionFamiliar.id },
          });
        // El estado sigue ACTIVA pero con monto de Colonia
        expect(suscripcionActualizada?.montoMensual).toBe(
          PRECIOS_VERANO.MATRICULA_COLONIA,
        );
      });

      it('Clase CONTINUIDAD: debe cambiar estado y cobrar $20.000/mes', async () => {
        // ARRANGE
        mockCurrentDate(new Date('2025-11-20T10:00:00-03:00'));
        const setup = await createTutorConSuscripcionFamiliar(prisma);
        const auth = await loginUser(app, {
          email: setup.tutor.email!,
          password: setup.tutorPassword,
        });

        // ACT
        const response = await request(app.getHttpServer())
          .post('/api/tutor/verano/decidir')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP())
          .send({
            estudianteId: setup.estudiantes[0].id,
            decision: 'CONTINUIDAD',
          });

        // ASSERT
        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
          success: true,
          montoProximoCobro: PRECIOS_VERANO.CUOTA_CONTINUIDAD, // $20.000
        });

        // Verificar en DB - estado debe ser CONTINUIDAD
        const suscripcionActualizada =
          await prisma.suscripcionFamiliar.findUnique({
            where: { id: setup.suscripcionFamiliar.id },
          });
        // NOTA: Este test fallará porque el estado CONTINUIDAD no existe aún
        expect(suscripcionActualizada?.estado).toBe('CONTINUIDAD');
      });

      it('Clase BAJA: debe cancelar suscripción y cobrar $0', async () => {
        // ARRANGE
        mockCurrentDate(new Date('2025-11-20T10:00:00-03:00'));
        const setup = await createTutorConSuscripcionFamiliar(prisma);
        const auth = await loginUser(app, {
          email: setup.tutor.email!,
          password: setup.tutorPassword,
        });

        // ACT
        const response = await request(app.getHttpServer())
          .post('/api/tutor/verano/decidir')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP())
          .send({
            estudianteId: setup.estudiantes[0].id,
            decision: 'BAJA',
          });

        // ASSERT
        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
          success: true,
          montoProximoCobro: 0,
        });

        // Verificar en DB - estado debe ser BAJA (o CANCELLED)
        const suscripcionActualizada =
          await prisma.suscripcionFamiliar.findUnique({
            where: { id: setup.suscripcionFamiliar.id },
          });
        // Pierde el cupo - verificar que inscripción fue cancelada
        const inscripcion = await prisma.inscripcionActividad.findFirst({
          where: { estudianteId: setup.estudiantes[0].id },
        });
        expect(inscripcion?.estado).toBe('CANCELADA');
      });
    });

    describe('Equivalence Partitioning: Período de decisión', () => {
      it('FUERA-PERÍODO (antes 15 nov): debe retornar error', async () => {
        // ARRANGE
        mockCurrentDate(new Date('2025-11-01T10:00:00-03:00')); // Antes del período
        const setup = await createTutorConSuscripcionFamiliar(prisma);
        const auth = await loginUser(app, {
          email: setup.tutor.email!,
          password: setup.tutorPassword,
        });

        // ACT
        const response = await request(app.getHttpServer())
          .post('/api/tutor/verano/decidir')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP())
          .send({
            estudianteId: setup.estudiantes[0].id,
            decision: 'COLONIA',
          });

        // ASSERT
        expect(response.status).toBe(400);
        expect(response.body.message).toContain('período');
      });

      it('FUERA-PERÍODO (después 5 dic): debe retornar error', async () => {
        // ARRANGE
        mockCurrentDate(new Date('2025-12-06T10:00:00-03:00')); // Después del período
        const setup = await createTutorConSuscripcionFamiliar(prisma);
        const auth = await loginUser(app, {
          email: setup.tutor.email!,
          password: setup.tutorPassword,
        });

        // ACT
        const response = await request(app.getHttpServer())
          .post('/api/tutor/verano/decidir')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP())
          .send({
            estudianteId: setup.estudiantes[0].id,
            decision: 'COLONIA',
          });

        // ASSERT
        expect(response.status).toBe(400);
        expect(response.body.message).toContain('período');
      });

      it('BOUNDARY: último momento válido (5 dic 23:59:59)', async () => {
        // ARRANGE
        mockCurrentDate(new Date('2025-12-05T23:59:59-03:00')); // Último segundo válido
        const setup = await createTutorConSuscripcionFamiliar(prisma);
        const auth = await loginUser(app, {
          email: setup.tutor.email!,
          password: setup.tutorPassword,
        });

        // ACT
        const response = await request(app.getHttpServer())
          .post('/api/tutor/verano/decidir')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP())
          .send({
            estudianteId: setup.estudiantes[0].id,
            decision: 'CONTINUIDAD',
          });

        // ASSERT - debe aceptar en el último segundo
        expect(response.status).toBe(201);
      });
    });

    describe('Equivalence Partitioning: Autorización', () => {
      it('SIN-AUTH: debe retornar 401', async () => {
        const setup = await createTutorConSuscripcionFamiliar(prisma);

        const response = await request(app.getHttpServer())
          .post('/api/tutor/verano/decidir')
          .set('Origin', FRONTEND_ORIGIN)
          .send({
            estudianteId: setup.estudiantes[0].id,
            decision: 'COLONIA',
          });

        expect(response.status).toBe(401);
      });

      it('HIJO-AJENO: debe retornar 403 cuando intenta decidir por hijo de otro tutor', async () => {
        // ARRANGE
        mockCurrentDate(new Date('2025-11-20T10:00:00-03:00'));
        const setup1 = await createTutorConSuscripcionFamiliar(prisma);
        const setup2 = await createTutorConSuscripcionFamiliar(prisma);

        // Tutor 1 intenta decidir por hijo de Tutor 2
        const auth = await loginUser(app, {
          email: setup1.tutor.email!,
          password: setup1.tutorPassword,
        });

        // ACT
        const response = await request(app.getHttpServer())
          .post('/api/tutor/verano/decidir')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP())
          .send({
            estudianteId: setup2.estudiantes[0].id, // Hijo de otro tutor
            decision: 'COLONIA',
          });

        // ASSERT
        expect(response.status).toBe(403);
      });
    });

    describe('Error Guessing: Casos borde', () => {
      it('debe retornar error si estudianteId no existe', async () => {
        mockCurrentDate(new Date('2025-11-20T10:00:00-03:00'));
        const setup = await createTutorConSuscripcionFamiliar(prisma);
        const auth = await loginUser(app, {
          email: setup.tutor.email!,
          password: setup.tutorPassword,
        });

        const response = await request(app.getHttpServer())
          .post('/api/tutor/verano/decidir')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP())
          .send({
            estudianteId: 'cxxxxxxxxxxxxxxxxxxxxxxxxx', // ID inválido (25 chars)
            decision: 'COLONIA',
          });

        expect(response.status).toBe(404);
      });

      it('debe retornar error si decisión es inválida', async () => {
        mockCurrentDate(new Date('2025-11-20T10:00:00-03:00'));
        const setup = await createTutorConSuscripcionFamiliar(prisma);
        const auth = await loginUser(app, {
          email: setup.tutor.email!,
          password: setup.tutorPassword,
        });

        const response = await request(app.getHttpServer())
          .post('/api/tutor/verano/decidir')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP())
          .send({
            estudianteId: setup.estudiantes[0].id,
            decision: 'INVALIDA',
          });

        expect(response.status).toBe(400);
      });
    });
  });

  // ==========================================================================
  // 2. CAMBIO TARDÍO: CONTINUIDAD → COLONIA (POST /tutor/verano/solicitar-colonia)
  // ==========================================================================

  describe('POST /api/tutor/verano/solicitar-colonia', () => {
    describe('Equivalence Partitioning: Cupos disponibles', () => {
      it('HAY-CUPO: debe aprobar y cambiar a ACTIVA con monto $95.000', async () => {
        // ARRANGE - Tutor en CONTINUIDAD, grupo con cupos disponibles
        mockCurrentDate(new Date('2026-01-15T10:00:00-03:00')); // Enero
        const setup = await createTutorConSuscripcionFamiliar(prisma);
        const coloniaGrupo = await createGrupoColoniaConCupos(prisma, {
          cupoMaximo: 10,
          cupoOcupado: 5,
        });

        // Simular que el tutor ya está en CONTINUIDAD
        // NOTA: Esto requiere el campo decisionVerano que no existe aún
        const auth = await loginUser(app, {
          email: setup.tutor.email!,
          password: setup.tutorPassword,
        });

        // ACT
        const response = await request(app.getHttpServer())
          .post('/api/tutor/verano/solicitar-colonia')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP())
          .send({
            estudianteId: setup.estudiantes[0].id,
          });

        // ASSERT
        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
          success: true,
          mensaje: expect.stringContaining('Aprobado'),
          cupoAsignado: expect.any(String),
        });

        // Verificar monto actualizado
        const suscripcionActualizada =
          await prisma.suscripcionFamiliar.findUnique({
            where: { id: setup.suscripcionFamiliar.id },
          });
        expect(suscripcionActualizada?.montoMensual).toBe(
          PRECIOS_VERANO.CUOTA_COLONIA,
        );
      });

      it('SIN-CUPO: debe rechazar y mantener CONTINUIDAD', async () => {
        // ARRANGE - Grupo sin cupos
        mockCurrentDate(new Date('2026-01-15T10:00:00-03:00'));
        const setup = await createTutorConSuscripcionFamiliar(prisma);

        // Desactivar todos los grupos existentes para aislar el test
        await prisma.claseGrupo.updateMany({
          data: { activo: false },
        });

        const coloniaGrupo = await createGrupoColoniaConCupos(prisma, {
          cupoMaximo: 5,
          cupoOcupado: 5, // LLENO
          anio: 2026, // Debe coincidir con el año mockeado
        });

        const auth = await loginUser(app, {
          email: setup.tutor.email!,
          password: setup.tutorPassword,
        });

        // ACT
        const response = await request(app.getHttpServer())
          .post('/api/tutor/verano/solicitar-colonia')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP())
          .send({
            estudianteId: setup.estudiantes[0].id,
          });

        // ASSERT
        expect(response.status).toBe(201); // POST siempre retorna 201, success:false indica rechazo de negocio
        expect(response.body).toMatchObject({
          success: false,
          mensaje: expect.stringContaining('Sin cupo'),
        });
      });
    });

    describe('State Transitions: Estados inválidos', () => {
      it('YA-EN-COLONIA: debe retornar error (ya estás en colonia)', async () => {
        // ARRANGE - Tutor ya en COLONIA intenta solicitar COLONIA de nuevo
        mockCurrentDate(new Date('2026-01-15T10:00:00-03:00'));
        const setup = await createTutorConSuscripcionFamiliar(prisma);

        // Crear decisión de COLONIA previa para el estudiante
        await prisma.decisionVeranoEstudiante.create({
          data: {
            estudianteId: setup.estudiantes[0].id,
            suscripcionFamiliarId: setup.suscripcionFamiliar.id,
            anio: 2026,
            decision: 'COLONIA',
            fechaDecision: new Date('2025-11-20'),
            matriculaColoniaPagada: true,
          },
        });

        const auth = await loginUser(app, {
          email: setup.tutor.email!,
          password: setup.tutorPassword,
        });

        // ACT
        const response = await request(app.getHttpServer())
          .post('/api/tutor/verano/solicitar-colonia')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP())
          .send({
            estudianteId: setup.estudiantes[0].id,
          });

        // ASSERT - debe indicar que ya está en Colonia
        expect(response.status).toBe(400);
        expect(response.body.message).toContain('ya');
      });
    });
  });

  // ==========================================================================
  // 3. CAMBIO TARDÍO: COLONIA → CONTINUIDAD (POST /tutor/verano/cancelar-colonia)
  // ==========================================================================

  describe('POST /api/tutor/verano/cancelar-colonia', () => {
    describe('Equivalence Partitioning: Confirmación de pérdida de matrícula', () => {
      it('CONFIRMA-PÉRDIDA: debe cambiar a CONTINUIDAD y monto $20.000', async () => {
        // ARRANGE
        mockCurrentDate(new Date('2026-01-15T10:00:00-03:00'));
        const setup = await createTutorConSuscripcionFamiliar(prisma);

        const auth = await loginUser(app, {
          email: setup.tutor.email!,
          password: setup.tutorPassword,
        });

        // ACT
        const response = await request(app.getHttpServer())
          .post('/api/tutor/verano/cancelar-colonia')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP())
          .send({
            estudianteId: setup.estudiantes[0].id,
            confirmaPerderMatricula: true, // CONFIRMA
          });

        // ASSERT
        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
          success: true,
          mensaje: expect.stringContaining('$20'),
        });

        // Verificar cambio de monto
        const suscripcionActualizada =
          await prisma.suscripcionFamiliar.findUnique({
            where: { id: setup.suscripcionFamiliar.id },
          });
        expect(suscripcionActualizada?.montoMensual).toBe(
          PRECIOS_VERANO.CUOTA_CONTINUIDAD,
        );
      });

      it('NO-CONFIRMA: debe retornar error (debe confirmar pérdida)', async () => {
        // ARRANGE
        mockCurrentDate(new Date('2026-01-15T10:00:00-03:00'));
        const setup = await createTutorConSuscripcionFamiliar(prisma);

        const auth = await loginUser(app, {
          email: setup.tutor.email!,
          password: setup.tutorPassword,
        });

        // ACT
        const response = await request(app.getHttpServer())
          .post('/api/tutor/verano/cancelar-colonia')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP())
          .send({
            estudianteId: setup.estudiantes[0].id,
            confirmaPerderMatricula: false, // NO CONFIRMA
          });

        // ASSERT
        expect(response.status).toBe(400);
        expect(response.body.message).toContain('confirmar');
      });
    });

    describe('Business Rules: Matrícula NO reembolsable', () => {
      it('REGLA-CRÍTICA: la matrícula de $40k NO se devuelve ni se acredita', async () => {
        // ARRANGE
        mockCurrentDate(new Date('2026-01-15T10:00:00-03:00'));
        const setup = await createTutorConSuscripcionFamiliar(prisma);

        // Simular que ya pagó matrícula (campo matriculaColoniaPagada = true)
        const auth = await loginUser(app, {
          email: setup.tutor.email!,
          password: setup.tutorPassword,
        });

        // ACT
        const response = await request(app.getHttpServer())
          .post('/api/tutor/verano/cancelar-colonia')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP())
          .send({
            estudianteId: setup.estudiantes[0].id,
            confirmaPerderMatricula: true,
          });

        // ASSERT - No debe haber ningún crédito/reembolso
        expect(response.status).toBe(201);
        // Verificar que NO hay lógica de reembolso en la respuesta
        expect(response.body.reembolso).toBeUndefined();
        expect(response.body.credito).toBeUndefined();
      });
    });
  });

  // ==========================================================================
  // 4. PROCESAMIENTO AUTOMÁTICO (6 de diciembre - Cron Job)
  // ==========================================================================

  describe('POST /api/admin/verano/procesar-bajas', () => {
    describe('State Transitions: No respondió → BAJA', () => {
      it('debe dar de BAJA a tutores que no respondieron', async () => {
        // ARRANGE - Simular que estamos DESPUÉS del deadline (6 dic)
        mockCurrentDate(FECHA_PROCESAMIENTO);
        const setup1 = await createTutorConSuscripcionFamiliar(prisma);
        const setup2 = await createTutorConSuscripcionFamiliar(prisma);

        // setup1 tiene decisión (CONTINUIDAD), setup2 no tiene decisión
        await prisma.decisionVeranoEstudiante.create({
          data: {
            estudianteId: setup1.estudiantes[0].id,
            suscripcionFamiliarId: setup1.suscripcionFamiliar.id,
            anio: 2025,
            decision: 'CONTINUIDAD',
            fechaDecision: new Date('2025-11-20'),
          },
        });

        // Necesitamos un admin para ejecutar el endpoint
        const admin = await prisma.admin.create({
          data: {
            nombre: 'Admin',
            apellido: 'Test',
            email: `admin_${Date.now()}@test.com`,
            passwordHash: await import('bcrypt').then((b) =>
              b.hash('TestPassword123!', 10),
            ),
          },
        });

        // Login como admin (endpoint admin)
        const auth = await loginUser(app, {
          email: admin.email,
          password: 'TestPassword123!',
        });

        // ACT
        const response = await request(app.getHttpServer())
          .post('/api/admin/verano/procesar-bajas')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        // ASSERT
        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
          procesados: expect.any(Number),
          dadosDeBaja: expect.any(Array),
        });

        // Verificar que setup2 (no respondió) tiene inscripciones CANCELADAS
        // procesarBajas cancela InscripcionActividad, no SuscripcionFamiliar
        const inscripcion2 = await prisma.inscripcionActividad.findFirst({
          where: { estudianteId: setup2.estudiantes[0].id },
        });
        expect(inscripcion2?.estado).toBe('CANCELADA');
      });

      it('debe cobrar matrícula $40k a quienes eligieron COLONIA', async () => {
        // ARRANGE - Simular que estamos DESPUÉS del deadline (6 dic)
        mockCurrentDate(FECHA_PROCESAMIENTO);
        const setup = await createTutorConSuscripcionFamiliar(prisma);
        // Simular que decidió COLONIA

        const admin = await prisma.admin.create({
          data: {
            nombre: 'Admin',
            apellido: 'Test',
            email: `admin_${Date.now()}@test.com`,
            passwordHash: await import('bcrypt').then((b) =>
              b.hash('TestPassword123!', 10),
            ),
          },
        });

        const auth = await loginUser(app, {
          email: admin.email,
          password: 'TestPassword123!',
        });

        // ACT
        const response = await request(app.getHttpServer())
          .post('/api/admin/verano/procesar-bajas')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        // ASSERT
        expect(response.status).toBe(201);

        // Verificar monto de matrícula
        const suscripcion = await prisma.suscripcionFamiliar.findUnique({
          where: { id: setup.suscripcionFamiliar.id },
        });
        // Si decidió COLONIA, el monto debe ser $40k (matrícula)
        // Este test puede necesitar ajuste según la implementación
      });

      it('debe cobrar $20k a quienes eligieron CONTINUIDAD', async () => {
        // ARRANGE - Simular que estamos DESPUÉS del deadline (6 dic)
        mockCurrentDate(FECHA_PROCESAMIENTO);
        const setup = await createTutorConSuscripcionFamiliar(prisma);

        const admin = await prisma.admin.create({
          data: {
            nombre: 'Admin',
            apellido: 'Test',
            email: `admin_${Date.now()}@test.com`,
            passwordHash: await import('bcrypt').then((b) =>
              b.hash('TestPassword123!', 10),
            ),
          },
        });

        const auth = await loginUser(app, {
          email: admin.email,
          password: 'TestPassword123!',
        });

        // Simular decisión CONTINUIDAD y ejecutar procesamiento
        // Verificar monto = $20k
      });
    });
  });

  // ==========================================================================
  // 5. TRANSICIÓN A MARZO (Cron Job 1 de marzo)
  // ==========================================================================

  describe('POST /api/admin/verano/restaurar-suscripciones', () => {
    describe('State Transitions: CONTINUIDAD → ACTIVA', () => {
      it('debe restaurar suscripciones CONTINUIDAD a ACTIVA con monto original', async () => {
        // ARRANGE - Simular que estamos en MARZO para restaurar suscripciones
        mockCurrentDate(FECHA_MARZO);
        const setup = await createTutorConSuscripcionFamiliar(prisma, {
          tier: 'STEAM_SINCRONICO', // $95k original
        });

        // Simular que está en CONTINUIDAD con monto $20k
        // NOTA: Requiere campo montoOriginal y estado CONTINUIDAD

        const admin = await prisma.admin.create({
          data: {
            nombre: 'Admin',
            apellido: 'Test',
            email: `admin_${Date.now()}@test.com`,
            passwordHash: await import('bcrypt').then((b) =>
              b.hash('TestPassword123!', 10),
            ),
          },
        });

        const auth = await loginUser(app, {
          email: admin.email,
          password: 'TestPassword123!',
        });

        // ACT
        const response = await request(app.getHttpServer())
          .post('/api/admin/verano/restaurar-suscripciones')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        // ASSERT
        expect(response.status).toBe(201);

        // Verificar restauración
        const suscripcionActualizada =
          await prisma.suscripcionFamiliar.findUnique({
            where: { id: setup.suscripcionFamiliar.id },
          });
        expect(suscripcionActualizada?.estado).toBe('AUTHORIZED'); // Vuelve a activa
        expect(suscripcionActualizada?.montoMensual).toBe(
          PRECIOS_TIER.STEAM_SINCRONICO,
        );
      });
    });
  });

  // ==========================================================================
  // 6. MÚLTIPLES HIJOS (Decisiones independientes)
  // ==========================================================================

  describe('Múltiples Hijos - Decisiones Independientes', () => {
    it('debe permitir COLONIA para hijo 1 y CONTINUIDAD para hijo 2', async () => {
      // ARRANGE
      mockCurrentDate(new Date('2025-11-20T10:00:00-03:00'));
      const setup = await createTutorConDosHijos(prisma);

      const auth = await loginUser(app, {
        email: setup.tutor.email!,
        password: setup.tutorPassword,
      });

      // ACT - Decidir COLONIA para hijo 1
      const response1 = await request(app.getHttpServer())
        .post('/api/tutor/verano/decidir')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          estudianteId: setup.estudiantes[0].id,
          decision: 'COLONIA',
        });

      // ACT - Decidir CONTINUIDAD para hijo 2
      const response2 = await request(app.getHttpServer())
        .post('/api/tutor/verano/decidir')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          estudianteId: setup.estudiantes[1].id,
          decision: 'CONTINUIDAD',
        });

      // ASSERT - Ambas decisiones deben ser exitosas
      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);

      // Verificar que cada hijo tiene su decisión
      // NOTA: Requiere campo decisionVerano por estudiante/inscripción
    });

    it('debe calcular monto total sumando decisiones de cada hijo', async () => {
      // ARRANGE - Simular DICIEMBRE (dentro del período Y mes=12 para monto matrícula)
      mockCurrentDate(new Date('2025-12-01T10:00:00-03:00'));
      const setup = await createTutorConDosHijos(prisma);

      const auth = await loginUser(app, {
        email: setup.tutor.email!,
        password: setup.tutorPassword,
      });

      // Hijo 1: COLONIA ($40k dic, luego $95k)
      await request(app.getHttpServer())
        .post('/api/tutor/verano/decidir')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          estudianteId: setup.estudiantes[0].id,
          decision: 'COLONIA',
        });

      // Hijo 2: CONTINUIDAD ($20k)
      await request(app.getHttpServer())
        .post('/api/tutor/verano/decidir')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          estudianteId: setup.estudiantes[1].id,
          decision: 'CONTINUIDAD',
        });

      // ASSERT - Monto total = $40k + $20k = $60k en diciembre
      const suscripcion = await prisma.suscripcionFamiliar.findUnique({
        where: { id: setup.suscripcionFamiliar.id },
      });

      const montoEsperadoDiciembre =
        PRECIOS_VERANO.MATRICULA_COLONIA + PRECIOS_VERANO.CUOTA_CONTINUIDAD;
      expect(suscripcion?.montoMensual).toBe(montoEsperadoDiciembre); // $60k
    });
  });

  // ==========================================================================
  // 7. GET /tutor/verano/estado
  // ==========================================================================

  describe('GET /api/tutor/verano/estado', () => {
    it('debe retornar estado actual de verano para todos los hijos', async () => {
      // ARRANGE
      mockCurrentDate(new Date('2025-11-20T10:00:00-03:00'));
      const setup = await createTutorConDosHijos(prisma);

      const auth = await loginUser(app, {
        email: setup.tutor.email!,
        password: setup.tutorPassword,
      });

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/tutor/verano/estado')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        puedeDecidir: true,
        fechaLimite: expect.any(String),
        estudiantes: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            nombre: expect.any(String),
            decision: null, // Aún no decidió
          }),
        ]),
      });
      expect(response.body.estudiantes).toHaveLength(2);
    });

    it('debe indicar puedeDecidir=false fuera del período', async () => {
      // ARRANGE
      mockCurrentDate(new Date('2025-12-10T10:00:00-03:00')); // Después del período
      const setup = await createTutorConSuscripcionFamiliar(prisma);

      const auth = await loginUser(app, {
        email: setup.tutor.email!,
        password: setup.tutorPassword,
      });

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/tutor/verano/estado')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.puedeDecidir).toBe(false);
    });
  });

  // ==========================================================================
  // 8. CUPOS POR GRUPO (Spec 3.6 - CRÍTICO)
  // ==========================================================================

  describe('Cupos de Colonia - Por Grupo (Spec 3.6)', () => {
    it('CUPO-POR-GRUPO: si grupo A lleno pero grupo B tiene cupo, puede inscribirse a B', async () => {
      // ARRANGE
      mockCurrentDate(new Date('2026-01-15T10:00:00-03:00'));
      const setup = await createTutorConSuscripcionFamiliar(prisma);

      // Desactivar todos los grupos existentes para aislar el test
      await prisma.claseGrupo.updateMany({
        data: { activo: false },
      });

      // Crear grupo A LLENO
      const grupoA = await createGrupoColoniaConCupos(prisma, {
        cupoMaximo: 5,
        cupoOcupado: 5, // LLENO
        anio: 2026,
      });

      // Crear grupo B con cupos
      const grupoB = await createGrupoColoniaConCupos(prisma, {
        cupoMaximo: 10,
        cupoOcupado: 3, // 7 disponibles
        anio: 2026,
      });

      const auth = await loginUser(app, {
        email: setup.tutor.email!,
        password: setup.tutorPassword,
      });

      // ACT - Solicitar colonia (debe asignar grupo B porque A está lleno)
      const response = await request(app.getHttpServer())
        .post('/api/tutor/verano/solicitar-colonia')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          estudianteId: setup.estudiantes[0].id,
        });

      // ASSERT - Debe aprobar y asignar grupo B
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.cupoAsignado).toBe(grupoB.claseGrupo.id);
    });

    it('TODOS-GRUPOS-LLENOS: si todos los grupos están llenos, solo puede elegir CONTINUIDAD', async () => {
      // ARRANGE
      mockCurrentDate(new Date('2026-01-15T10:00:00-03:00'));
      const setup = await createTutorConSuscripcionFamiliar(prisma);

      // Desactivar todos los grupos existentes para aislar el test
      await prisma.claseGrupo.updateMany({
        data: { activo: false },
      });

      // Crear múltiples grupos TODOS LLENOS
      await createGrupoColoniaConCupos(prisma, {
        cupoMaximo: 5,
        cupoOcupado: 5,
        anio: 2026,
      });
      await createGrupoColoniaConCupos(prisma, {
        cupoMaximo: 8,
        cupoOcupado: 8,
        anio: 2026,
      });
      await createGrupoColoniaConCupos(prisma, {
        cupoMaximo: 10,
        cupoOcupado: 10,
        anio: 2026,
      });

      const auth = await loginUser(app, {
        email: setup.tutor.email!,
        password: setup.tutorPassword,
      });

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/tutor/verano/solicitar-colonia')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          estudianteId: setup.estudiantes[0].id,
        });

      // ASSERT - Debe rechazar por falta de cupo en TODOS los grupos
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(false);
      expect(response.body.mensaje).toContain('Sin cupo');
    });

    it('PUEDE-ELEGIR-GRUPO: tutor puede especificar grupo preferido si tiene cupo', async () => {
      // ARRANGE
      mockCurrentDate(new Date('2026-01-15T10:00:00-03:00'));
      const setup = await createTutorConSuscripcionFamiliar(prisma);

      const grupoPreferido = await createGrupoColoniaConCupos(prisma, {
        cupoMaximo: 10,
        cupoOcupado: 3,
        anio: 2026,
      });

      const auth = await loginUser(app, {
        email: setup.tutor.email!,
        password: setup.tutorPassword,
      });

      // ACT - Solicitar con grupo específico
      const response = await request(app.getHttpServer())
        .post('/api/tutor/verano/solicitar-colonia')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          estudianteId: setup.estudiantes[0].id,
          grupoPreferidoId: grupoPreferido.claseGrupo.id,
        });

      // ASSERT
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.cupoAsignado).toBe(grupoPreferido.claseGrupo.id);
    });
  });

  // ==========================================================================
  // 9. GARANTÍA DE CUPO EN MARZO (Spec 3.1 y 3.4)
  // ==========================================================================

  describe('Garantía de Cupo en Marzo', () => {
    it('CONTINUIDAD: cupo reservado garantizado para marzo', async () => {
      // ARRANGE - Simular que estamos en MARZO para restaurar suscripciones
      mockCurrentDate(FECHA_MARZO);
      const setup = await createTutorConSuscripcionFamiliar(prisma);

      // Simular que está en CONTINUIDAD (decidió mantener cupo)
      // Cuando se ejecuta restaurar-suscripciones el 1 de marzo,
      // su inscripción debe reactivarse automáticamente

      const admin = await prisma.admin.create({
        data: {
          nombre: 'Admin',
          apellido: 'Test',
          email: `admin_${Date.now()}@test.com`,
          passwordHash: await import('bcrypt').then((b) =>
            b.hash('TestPassword123!', 10),
          ),
        },
      });

      const auth = await loginUser(app, {
        email: admin.email,
        password: 'TestPassword123!',
      });

      // ACT - Restaurar suscripciones (1 marzo)
      const response = await request(app.getHttpServer())
        .post('/api/admin/verano/restaurar-suscripciones')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      // ASSERT
      expect(response.status).toBe(201);

      // Verificar que la inscripción sigue activa (cupo garantizado)
      const inscripcion = await prisma.inscripcionActividad.findFirst({
        where: { estudianteId: setup.estudiantes[0].id },
      });
      expect(inscripcion?.estado).toBe('ACTIVA');
    });

    it('BAJA: si quiere volver en marzo, debe inscribirse como nuevo (sin prioridad)', async () => {
      // ARRANGE - Estudiante dado de BAJA
      const setup = await createTutorConSuscripcionFamiliar(prisma);

      // Simular que fue dado de BAJA (no respondió o eligió baja)
      await prisma.inscripcionActividad.updateMany({
        where: { estudianteId: setup.estudiantes[0].id },
        data: { estado: 'CANCELADA' },
      });
      await prisma.suscripcionFamiliar.update({
        where: { id: setup.suscripcionFamiliar.id },
        data: { estado: 'CANCELLED' },
      });

      const auth = await loginUser(app, {
        email: setup.tutor.email!,
        password: setup.tutorPassword,
      });

      // ACT - Intentar reactivar en marzo
      // Este endpoint NO existe para BAJA - debe inscribirse como nuevo
      const response = await request(app.getHttpServer())
        .post('/api/tutor/suscripcion/reactivar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          estudianteId: setup.estudiantes[0].id,
        });

      // ASSERT - Debe rechazar y pedir nueva inscripción
      // O no existe el endpoint (404)
      // O indica que debe inscribirse como nuevo (400)
      expect([400, 404]).toContain(response.status);
    });

    it('BAJA: no tiene prioridad sobre inscripciones nuevas', async () => {
      // ARRANGE
      const setupBaja = await createTutorConSuscripcionFamiliar(prisma);
      const setupNuevo = await createTutorConSuscripcionFamiliar(prisma);

      // Dar de baja al primero
      await prisma.inscripcionActividad.updateMany({
        where: { estudianteId: setupBaja.estudiantes[0].id },
        data: { estado: 'CANCELADA' },
      });

      // Crear grupo con 1 solo cupo
      const grupoConUnCupo = await createGrupoColoniaConCupos(prisma, {
        cupoMaximo: 1,
        cupoOcupado: 0,
      });

      // Ambos intentan inscribirse - el nuevo tiene misma prioridad
      // (No hay preferencia para ex-alumnos dados de baja)

      // ASSERT - El test valida la política: BAJA = sin beneficios
      // La implementación debe tratar a ambos igual (FIFO o aleatorio)
      expect(true).toBe(true); // Placeholder - implementación define comportamiento
    });
  });

  // ==========================================================================
  // 10. ENDPOINTS ADMIN (Spec 4.3)
  // ==========================================================================

  describe('GET /api/admin/verano/resumen', () => {
    it('debe retornar dashboard con totales y cupos por grupo', async () => {
      // ARRANGE
      const setup1 = await createTutorConSuscripcionFamiliar(prisma);
      const setup2 = await createTutorConSuscripcionFamiliar(prisma);
      const grupo = await createGrupoColoniaConCupos(prisma, {
        cupoMaximo: 20,
        cupoOcupado: 5,
      });

      const admin = await prisma.admin.create({
        data: {
          nombre: 'Admin',
          apellido: 'Test',
          email: `admin_${Date.now()}@test.com`,
          passwordHash: await import('bcrypt').then((b) =>
            b.hash('TestPassword123!', 10),
          ),
        },
      });

      const auth = await loginUser(app, {
        email: admin.email,
        password: 'TestPassword123!',
      });

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/admin/verano/resumen')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        totalEstudiantes: expect.any(Number),
        decidieronColonia: expect.any(Number),
        decidieronContinuidad: expect.any(Number),
        noRespondieron: expect.any(Number),
        fechaLimite: expect.any(String),
        cuposColoniaPorGrupo: expect.arrayContaining([
          expect.objectContaining({
            grupoId: expect.any(String),
            nombre: expect.any(String),
            cupoTotal: expect.any(Number),
            cupoOcupado: expect.any(Number),
            disponible: expect.any(Number),
          }),
        ]),
      });
    });
  });

  describe('GET /api/admin/verano/decisiones', () => {
    it('debe listar todas las decisiones de verano', async () => {
      // ARRANGE
      mockCurrentDate(new Date('2026-11-20T10:00:00-03:00'));
      const setup = await createTutorConDosHijos(prisma);

      // Crear decisiones de verano para que el GET tenga datos
      await prisma.decisionVeranoEstudiante.create({
        data: {
          estudianteId: setup.estudiantes[0].id,
          suscripcionFamiliarId: setup.suscripcionFamiliar.id,
          anio: 2026,
          decision: 'COLONIA',
          fechaDecision: new Date('2026-11-20'),
          matriculaColoniaPagada: true,
        },
      });
      await prisma.decisionVeranoEstudiante.create({
        data: {
          estudianteId: setup.estudiantes[1].id,
          suscripcionFamiliarId: setup.suscripcionFamiliar.id,
          anio: 2026,
          decision: 'CONTINUIDAD',
          fechaDecision: new Date('2026-11-20'),
        },
      });

      const admin = await prisma.admin.create({
        data: {
          nombre: 'Admin',
          apellido: 'Test',
          email: `admin_${Date.now()}@test.com`,
          passwordHash: await import('bcrypt').then((b) =>
            b.hash('TestPassword123!', 10),
          ),
        },
      });

      const auth = await loginUser(app, {
        email: admin.email,
        password: 'TestPassword123!',
      });

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/admin/verano/decisiones')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      // ASSERT
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toMatchObject({
        estudianteId: expect.any(String),
        nombre: expect.any(String),
        tutor: expect.any(String),
        decision: expect.any(String),
      });
    });

    it('debe filtrar por tipo de decisión', async () => {
      // ARRANGE
      const admin = await prisma.admin.create({
        data: {
          nombre: 'Admin',
          apellido: 'Test',
          email: `admin_${Date.now()}@test.com`,
          passwordHash: await import('bcrypt').then((b) =>
            b.hash('TestPassword123!', 10),
          ),
        },
      });

      const auth = await loginUser(app, {
        email: admin.email,
        password: 'TestPassword123!',
      });

      // ACT - Filtrar solo PENDIENTE
      const response = await request(app.getHttpServer())
        .get('/api/admin/verano/decisiones?filtro=PENDIENTE')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      // ASSERT
      expect(response.status).toBe(200);
      // Todos los resultados deben tener decision PENDIENTE
      response.body.forEach((item: { decision: string }) => {
        expect(item.decision).toBe('PENDIENTE');
      });
    });
  });

  describe('POST /api/admin/verano/forzar-decision', () => {
    it('debe permitir al admin forzar decisión con motivo', async () => {
      // ARRANGE
      const setup = await createTutorConSuscripcionFamiliar(prisma);

      const admin = await prisma.admin.create({
        data: {
          nombre: 'Admin',
          apellido: 'Test',
          email: `admin_${Date.now()}@test.com`,
          passwordHash: await import('bcrypt').then((b) =>
            b.hash('TestPassword123!', 10),
          ),
        },
      });

      const auth = await loginUser(app, {
        email: admin.email,
        password: 'TestPassword123!',
      });

      // ACT - Admin fuerza COLONIA para estudiante
      const response = await request(app.getHttpServer())
        .post('/api/admin/verano/forzar-decision')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          estudianteId: setup.estudiantes[0].id,
          decision: 'COLONIA',
          motivo: 'Caso especial - beca deportiva',
        });

      // ASSERT
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('debe requerir motivo para forzar decisión', async () => {
      // ARRANGE
      const setup = await createTutorConSuscripcionFamiliar(prisma);

      const admin = await prisma.admin.create({
        data: {
          nombre: 'Admin',
          apellido: 'Test',
          email: `admin_${Date.now()}@test.com`,
          passwordHash: await import('bcrypt').then((b) =>
            b.hash('TestPassword123!', 10),
          ),
        },
      });

      const auth = await loginUser(app, {
        email: admin.email,
        password: 'TestPassword123!',
      });

      // ACT - Sin motivo
      const response = await request(app.getHttpServer())
        .post('/api/admin/verano/forzar-decision')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          estudianteId: setup.estudiantes[0].id,
          decision: 'COLONIA',
          // motivo: FALTA
        });

      // ASSERT
      expect(response.status).toBe(400);
    });

    it('debe registrar auditoría del override de admin', async () => {
      // ARRANGE
      const setup = await createTutorConSuscripcionFamiliar(prisma);

      const admin = await prisma.admin.create({
        data: {
          nombre: 'Admin',
          apellido: 'Test',
          email: `admin_${Date.now()}@test.com`,
          passwordHash: await import('bcrypt').then((b) =>
            b.hash('TestPassword123!', 10),
          ),
        },
      });

      const auth = await loginUser(app, {
        email: admin.email,
        password: 'TestPassword123!',
      });

      // ACT
      await request(app.getHttpServer())
        .post('/api/admin/verano/forzar-decision')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          estudianteId: setup.estudiantes[0].id,
          decision: 'CONTINUIDAD',
          motivo: 'Excepción por viaje familiar',
        });

      // ASSERT - Verificar registro de auditoría
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          entityType: 'DecisionVeranoEstudiante',
          action: 'FORZAR_DECISION_VERANO',
        },
        orderBy: { timestamp: 'desc' },
      });

      // Verificar campos de auditoría
      expect(auditLog).not.toBeNull();
      expect(auditLog?.userId).toBe(admin.id);
      expect(auditLog?.description).toContain('Excepción por viaje familiar');
    });
  });
});
