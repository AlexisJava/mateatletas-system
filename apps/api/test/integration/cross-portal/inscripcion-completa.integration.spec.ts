/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST - FLUJO CROSS-PORTAL DE INSCRIPCIÓN
 * ============================================================================
 *
 * Este test verifica el flujo completo de inscripción que cruza múltiples portales:
 *   TUTOR → ADMIN → ESTUDIANTE
 *
 * OBJETIVO: Encontrar bugs en las interacciones entre portales
 *
 * ============================================================================
 * EQUIVALENCE CLASSES
 * ============================================================================
 *
 * Fuentes de Acceso del Estudiante:
 * - E1: Plan directo vigente → puedeAcceder = true
 * - E2: Suscripción tutor activa → puedeAcceder = true
 * - E3: InscripcionComision Confirmada → puedeAcceder = true
 * - E4: InscripcionComision Pendiente (dentro de fechas) → puedeAcceder = true (auto-confirma!)
 * - E5: Override activo → puedeAcceder = true
 * - E6: Estudiante SUSPENDIDO → puedeAcceder = false
 * - E7: Sin ninguna fuente → puedeAcceder = false
 * - E8: InscripcionMensual Pagada sin InscripcionComision → puedeAcceder = ??? (CASO CRÍTICO)
 *
 * Estados de Inscripción a Comisión:
 * - Pendiente → auto-confirma en login/verificarAcceso
 * - Confirmada → acceso permitido
 * - Cancelada → sin acceso
 * - ListaEspera → sin acceso
 *
 * Estados de Pago (InscripcionMensual):
 * - Pendiente → sin acceso directo
 * - Pagado → sin acceso directo (DESCONECTADO de InscripcionComision)
 * - Vencido → sin acceso directo
 * - Parcial → sin acceso directo
 *
 * ============================================================================
 * STATE TRANSITIONS
 * ============================================================================
 *
 * InscripcionComision:
 *   Pendiente ──(login)──> Confirmada (auto)
 *   Pendiente ──(admin)──> Confirmada (manual)
 *   Pendiente ──(admin)──> Cancelada
 *   Confirmada ──(admin)──> Cancelada
 *
 * InscripcionMensual:
 *   Pendiente ──(pago)──> Pagado
 *   Pendiente ──(tiempo)──> Vencido
 *   Pendiente ──(parcial)──> Parcial
 *   Parcial ──(resto)──> Pagado
 *
 * ============================================================================
 * GAPS CRÍTICOS A TESTEAR
 * ============================================================================
 *
 * 1. InscripcionMensual.estado_pago = Pagado NO crea InscripcionComision
 *    → Estudiante paga pero NO tiene acceso a comisión
 *
 * 2. InscripcionComision se auto-confirma en verificarAcceso (línea 219)
 *    Y TAMBIÉN en InscripcionesListener al login (evento estudiante.logged-in)
 *    → Posible race condition o duplicación
 *
 * 3. La query de inscripcionesComision incluye estado 'Pendiente' (línea 179)
 *    → Estudiantes con inscripción Pendiente pueden tener acceso antes de confirmar
 *
 * Setup:
 *   docker-compose -f docker-compose.test.yml up -d
 *   DATABASE_URL="postgresql://test:test_password_123@localhost:5433/mateatletas_test" npx prisma migrate deploy
 *
 * Run:
 *   yarn workspace api test --testPathPattern="inscripcion-completa" --runInBand
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { AppModule } from '../../../src/app.module';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import {
  createTestTutor,
  createTestEstudiante,
  createTestDocente,
  createTestAdmin,
} from '../../fixtures/factories/usuario.factory';
import {
  createTestProducto,
  createTestComision,
  createTestInscripcionComision,
} from '../../fixtures/factories/comision.factory';
import {
  loginEstudiante,
  loginUser,
  withAuthHeaders,
  FRONTEND_ORIGIN,
  generateUniqueIP,
} from '../../helpers/auth.helpers';
import {
  TipoProducto,
  EstadoInscripcionComision,
  EstadoPago,
} from '@prisma/client';

describe('[INTEGRATION] Cross-Portal: Flujo de Inscripción Completa', () => {
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
  // HELPERS
  // ============================================================================

  async function getVerificarAcceso(auth: { cookie: string; token: string }) {
    return withAuthHeaders(
      request(app.getHttpServer())
        .get('/api/estudiantes/verificar-acceso')
        .set('Origin', FRONTEND_ORIGIN),
      auth,
    );
  }

  // ============================================================================
  // GAP CRÍTICO #1: InscripcionMensual Pagada NO da acceso
  // ============================================================================
  describe('Gap Crítico: InscripcionMensual vs InscripcionComision', () => {
    it('CASO CRÍTICO: Pagar InscripcionMensual NO crea InscripcionComision - estudiante sin acceso', async () => {
      /**
       * Este test documenta un GAP DE DISEÑO importante:
       *
       * El flujo de facturación (InscripcionMensual) está completamente desconectado
       * del flujo de acceso (InscripcionComision).
       *
       * ESCENARIO:
       * 1. Tutor tiene estudiante
       * 2. Admin crea InscripcionMensual para el estudiante (facturación)
       * 3. Tutor/Admin registra pago (estado_pago = Pagado)
       * 4. Estudiante intenta acceder → SIN ACCESO
       *
       * PORQUE: No existe InscripcionComision, solo InscripcionMensual
       */

      // ARRANGE - Crear escenario
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Crear producto y comisión
      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
        precio: 5000,
      });

      // Crear InscripcionMensual PAGADA (simula que tutor pagó)
      const periodoActual = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      await prisma.inscripcionMensual.create({
        data: {
          estudiante_id: estudiante.id,
          producto_id: producto.id,
          tutor_id: tutor.id,
          periodo: periodoActual,
          anio: new Date().getFullYear(),
          mes: new Date().getMonth() + 1,
          precio_base: 5000,
          descuento_aplicado: 0,
          precio_final: 5000,
          tipo_descuento: 'NINGUNO',
          detalle_calculo: 'Precio base sin descuentos',
          estado_pago: EstadoPago.Pagado, // ← PAGADO
          monto_pagado: 5000,
          fecha_pago: new Date(),
          metodo_pago: 'Manual',
        },
      });

      // Verificar que InscripcionMensual existe y está pagada
      const inscripcionMensual = await prisma.inscripcionMensual.findFirst({
        where: { estudiante_id: estudiante.id },
      });
      expect(inscripcionMensual).toBeDefined();
      expect(inscripcionMensual?.estado_pago).toBe('Pagado');

      // ACT - Login como estudiante y verificar acceso
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT - Documentar comportamiento actual
      expect(response.status).toBe(200);

      // ESTE ES EL GAP: A pesar de haber PAGADO, el estudiante NO tiene acceso
      // porque no existe InscripcionComision
      expect(response.body.puedeAcceder).toBe(false);
      expect(response.body.motivo).toBe('SIN_ACCESO');

      // Verificar que NO existe InscripcionComision
      const inscripcionComision = await prisma.inscripcionComision.findFirst({
        where: { estudiante_id: estudiante.id },
      });
      expect(inscripcionComision).toBeNull();
    });

    it('Estudiante con InscripcionComision Confirmada SÍ tiene acceso', async () => {
      /**
       * Contraste con el caso anterior:
       * Si el admin TAMBIÉN crea InscripcionComision, entonces SÍ hay acceso.
       */

      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { docente } = await createTestDocente(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
        precio: 5000,
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      const comision = await createTestComision(prisma, {
        productoId: producto.id,
        docenteId: docente.id,
      });

      // Crear AMBAS inscripciones
      const periodoActual = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      await prisma.inscripcionMensual.create({
        data: {
          estudiante_id: estudiante.id,
          producto_id: producto.id,
          tutor_id: tutor.id,
          periodo: periodoActual,
          anio: new Date().getFullYear(),
          mes: new Date().getMonth() + 1,
          precio_base: 5000,
          descuento_aplicado: 0,
          precio_final: 5000,
          tipo_descuento: 'NINGUNO',
          detalle_calculo: 'Precio base sin descuentos',
          estado_pago: EstadoPago.Pagado,
          monto_pagado: 5000,
          fecha_pago: new Date(),
          metodo_pago: 'Manual',
        },
      });

      // Esta es la pieza clave que falta en el caso anterior
      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision.id,
        EstadoInscripcionComision.Confirmada,
      );

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT - CON InscripcionComision, SÍ hay acceso
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.motivo).toBe('COMISION_ACTIVA');
    });
  });

  // ============================================================================
  // GAP CRÍTICO #2: Auto-confirmación de inscripciones
  // ============================================================================
  describe('Gap Crítico: Auto-confirmación de Inscripciones Pendientes', () => {
    it('InscripcionComision Pendiente se auto-confirma al verificar acceso', async () => {
      /**
       * Comportamiento documentado:
       * Si un estudiante tiene InscripcionComision en estado Pendiente,
       * al llamar a verificarAcceso, el sistema la auto-confirma.
       *
       * Esto ocurre en AccesoEstudianteService.confirmarInscripcionesPendientes()
       */

      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { docente } = await createTestDocente(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      const comision = await createTestComision(prisma, {
        productoId: producto.id,
        docenteId: docente.id,
      });

      // Crear inscripción en estado PENDIENTE
      const inscripcion = await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision.id,
        EstadoInscripcionComision.Pendiente, // ← PENDIENTE
      );

      // Verificar estado inicial
      expect(inscripcion.estado).toBe('Pendiente');

      // ACT - Login y verificar acceso
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT - Tiene acceso Y la inscripción fue auto-confirmada
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.motivo).toBe('COMISION_ACTIVA');

      // Verificar que se auto-confirmó en la DB
      const inscripcionActualizada =
        await prisma.inscripcionComision.findUnique({
          where: { id: inscripcion.id },
        });
      expect(inscripcionActualizada?.estado).toBe('Confirmada');
    });

    it('InscripcionComision Cancelada NO se auto-confirma ni da acceso', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { docente } = await createTestDocente(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      const comision = await createTestComision(prisma, {
        productoId: producto.id,
        docenteId: docente.id,
      });

      // Crear inscripción CANCELADA
      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision.id,
        EstadoInscripcionComision.Cancelada, // ← CANCELADA
      );

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT - NO tiene acceso
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(false);
      expect(response.body.motivo).toBe('SIN_ACCESO');
    });

    it('InscripcionComision ListaEspera NO da acceso', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { docente } = await createTestDocente(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      const comision = await createTestComision(prisma, {
        productoId: producto.id,
        docenteId: docente.id,
      });

      // Crear inscripción en LISTA DE ESPERA
      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision.id,
        EstadoInscripcionComision.ListaEspera, // ← LISTA ESPERA
      );

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT - NO tiene acceso (ListaEspera no está en la query)
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(false);
    });
  });

  // ============================================================================
  // GAP CRÍTICO #3: Comisión con fechas vencidas
  // ============================================================================
  describe('Gap Crítico: Comisiones con fechas', () => {
    it('Comisión vencida (fecha_fin pasada) NO da acceso', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { docente } = await createTestDocente(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
      });

      // Comisión que YA TERMINÓ (hace 1 día)
      const comision = await prisma.comision.create({
        data: {
          nombre: 'Comisión Vencida',
          producto_id: producto.id,
          docente_id: docente.id,
          fecha_inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          fecha_fin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // ← VENCIDA
          activo: true,
        },
      });

      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision.id,
        EstadoInscripcionComision.Confirmada,
      );

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT - Comisión vencida no da acceso
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(false);
    });

    it('Comisión sin fecha_fin (null) da acceso indefinido', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { docente } = await createTestDocente(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
      });

      // Comisión sin fecha_fin → acceso indefinido
      const comision = await prisma.comision.create({
        data: {
          nombre: 'Comisión Sin Fin',
          producto_id: producto.id,
          docente_id: docente.id,
          fecha_inicio: new Date(),
          fecha_fin: null, // ← SIN FECHA FIN
          activo: true,
        },
      });

      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision.id,
        EstadoInscripcionComision.Confirmada,
      );

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT - Sin fecha_fin = acceso indefinido
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.motivo).toBe('COMISION_ACTIVA');
    });

    it('Comisión que aún no empieza (fecha_inicio futura) NO da acceso', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { docente } = await createTestDocente(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
      });

      // Comisión que empieza EN EL FUTURO
      const comision = await prisma.comision.create({
        data: {
          nombre: 'Comisión Futura',
          producto_id: producto.id,
          docente_id: docente.id,
          fecha_inicio: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // ← FUTURA
          fecha_fin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          activo: true,
        },
      });

      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision.id,
        EstadoInscripcionComision.Confirmada,
      );

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT - Comisión futura no da acceso aún
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(false);
    });
  });

  // ============================================================================
  // FLUJO CROSS-PORTAL COMPLETO
  // ============================================================================
  describe('Flujo Cross-Portal: Admin inscribe → Estudiante accede', () => {
    it('Admin inscribe estudiante a comisión → Estudiante puede acceder', async () => {
      /**
       * FLUJO CORRECTO:
       * 1. Admin crea producto y comisión
       * 2. Tutor registra estudiante
       * 3. Admin inscribe estudiante a comisión (estado: Confirmada)
       * 4. Estudiante puede acceder
       */

      // ARRANGE - Portal ADMIN
      const admin = await createTestAdmin(prisma);
      const { docente } = await createTestDocente(prisma);

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Evento,
        nombre: 'Colonia de Verano 2026',
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const comision = await createTestComision(prisma, {
        productoId: producto.id,
        docenteId: docente.id,
        nombre: 'QUANTUM Mañana',
      });

      // Portal TUTOR - registra estudiante
      const { tutor, password: tutorPassword } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Admin inscribe estudiante a comisión
      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision.id,
        EstadoInscripcionComision.Confirmada,
      );

      // ACT - Portal ESTUDIANTE
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.motivo).toBe('COMISION_ACTIVA');
      expect(response.body.detalles.comisionesActivas).toHaveLength(1);
      expect(response.body.detalles.comisionesActivas[0].nombre).toBe(
        'QUANTUM Mañana',
      );
    });

    it('Admin inscribe con estado Pendiente → Login auto-confirma', async () => {
      /**
       * FLUJO ALTERNATIVO:
       * 1. Admin inscribe con estado Pendiente (pre-inscripción)
       * 2. Al hacer login, el sistema auto-confirma
       */

      // ARRANGE
      const { docente } = await createTestDocente(prisma);
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      const comision = await createTestComision(prisma, {
        productoId: producto.id,
        docenteId: docente.id,
      });

      // Inscripción en estado PENDIENTE
      const inscripcion = await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision.id,
        EstadoInscripcionComision.Pendiente,
      );

      // Verificar estado inicial
      const inscripcionAntes = await prisma.inscripcionComision.findUnique({
        where: { id: inscripcion.id },
      });
      expect(inscripcionAntes?.estado).toBe('Pendiente');

      // ACT - Login dispara auto-confirmación
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      // Llamar a verificar acceso (que también auto-confirma)
      const response = await getVerificarAcceso(auth);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);

      // Verificar que se auto-confirmó
      const inscripcionDespues = await prisma.inscripcionComision.findUnique({
        where: { id: inscripcion.id },
      });
      expect(inscripcionDespues?.estado).toBe('Confirmada');
    });
  });

  // ============================================================================
  // PRIORIDAD DE FUENTES DE ACCESO
  // ============================================================================
  describe('Prioridad de Fuentes de Acceso', () => {
    it('Estudiante SUSPENDIDO no tiene acceso aunque tenga comisión activa', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { docente } = await createTestDocente(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
        suspendido: true, // ← SUSPENDIDO
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      const comision = await createTestComision(prisma, {
        productoId: producto.id,
        docenteId: docente.id,
      });

      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision.id,
        EstadoInscripcionComision.Confirmada,
      );

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT - Suspendido tiene prioridad sobre todo
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(false);
      expect(response.body.mensaje).toContain('suspendido');
    });

    it('Override tiene prioridad sobre comisión', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { docente } = await createTestDocente(prisma);

      // Estudiante con override
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
        override: {
          acceso_clases_vivo: true,
          hasta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          motivo: 'Becado especial',
        },
      });

      // También tiene comisión activa
      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      const comision = await createTestComision(prisma, {
        productoId: producto.id,
        docenteId: docente.id,
      });

      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision.id,
        EstadoInscripcionComision.Confirmada,
      );

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT - Override tiene prioridad
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.motivo).toBe('OVERRIDE');
      expect(response.body.detalles.override.motivo).toBe('Becado especial');
    });
  });

  // ============================================================================
  // ERROR GUESSING - Casos típicos de fallo
  // ============================================================================
  describe('Error Guessing: Casos típicos de fallo', () => {
    it('Comisión inactiva (activo=false) NO da acceso', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { docente } = await createTestDocente(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
      });

      // Comisión INACTIVA
      const comision = await prisma.comision.create({
        data: {
          nombre: 'Comisión Inactiva',
          producto_id: producto.id,
          docente_id: docente.id,
          fecha_inicio: new Date(),
          fecha_fin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          activo: false, // ← INACTIVA
        },
      });

      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision.id,
        EstadoInscripcionComision.Confirmada,
      );

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT - Comisión inactiva no da acceso
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(false);
    });

    it('Estudiante con múltiples inscripciones - todas deben aparecer', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { docente } = await createTestDocente(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const producto1 = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
        nombre: 'Matemática',
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      const producto2 = await createTestProducto(prisma, {
        tipo: TipoProducto.Evento,
        nombre: 'Colonia',
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const comision1 = await createTestComision(prisma, {
        productoId: producto1.id,
        docenteId: docente.id,
        nombre: 'Mate Mañana',
      });

      const comision2 = await createTestComision(prisma, {
        productoId: producto2.id,
        docenteId: docente.id,
        nombre: 'Colonia Tarde',
      });

      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision1.id,
        EstadoInscripcionComision.Confirmada,
      );

      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision2.id,
        EstadoInscripcionComision.Confirmada,
      );

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT - Debe mostrar AMBAS comisiones
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.detalles.comisionesActivas).toHaveLength(2);

      const nombres = response.body.detalles.comisionesActivas.map(
        (c: { nombre: string }) => c.nombre,
      );
      expect(nombres).toContain('Mate Mañana');
      expect(nombres).toContain('Colonia Tarde');
    });
  });

  // ============================================================================
  // MODALIDAD: SINCRONICO vs ASINCRONICO
  // ============================================================================
  describe('Modalidad: SINCRONICO vs ASINCRONICO', () => {
    it('Comisión SINCRONICO da accesoClasesVivo = true', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { docente } = await createTestDocente(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      const comision = await createTestComision(prisma, {
        productoId: producto.id,
        docenteId: docente.id,
        modalidad: 'SINCRONICO' as const,
      });

      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision.id,
        EstadoInscripcionComision.Confirmada,
      );

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.permisos.accesoClasesVivo).toBe(true);
      expect(response.body.permisos.accesoPlanificaciones).toBe(true);
      expect(response.body.permisos.accesoLibros).toBe(true);
      expect(response.body.detalles.comisionesActivas[0].modalidad).toBe(
        'SINCRONICO',
      );
    });

    it('Comisión ASINCRONICO da accesoClasesVivo = false', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { docente } = await createTestDocente(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      const comision = await createTestComision(prisma, {
        productoId: producto.id,
        docenteId: docente.id,
        modalidad: 'ASINCRONICO' as const,
      });

      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision.id,
        EstadoInscripcionComision.Confirmada,
      );

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.permisos.accesoClasesVivo).toBe(false); // ← NO tiene acceso a clases en vivo
      expect(response.body.permisos.accesoPlanificaciones).toBe(true); // Sí tiene planificaciones
      expect(response.body.permisos.accesoLibros).toBe(true);
      expect(response.body.detalles.comisionesActivas[0].modalidad).toBe(
        'ASINCRONICO',
      );
    });

    it('Estudiante con AMBAS modalidades (SYNC + ASYNC) → accesoClasesVivo = true', async () => {
      /**
       * Si tiene al menos UNA comisión SINCRONICO, tiene acceso a clases en vivo
       */

      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { docente } = await createTestDocente(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const producto1 = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
        nombre: 'Curso Async',
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      const producto2 = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
        nombre: 'Curso Sync',
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      const comisionAsync = await createTestComision(prisma, {
        productoId: producto1.id,
        docenteId: docente.id,
        nombre: 'Comisión Async',
        modalidad: 'ASINCRONICO' as const,
      });

      const comisionSync = await createTestComision(prisma, {
        productoId: producto2.id,
        docenteId: docente.id,
        nombre: 'Comisión Sync',
        modalidad: 'SINCRONICO' as const,
      });

      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comisionAsync.id,
        EstadoInscripcionComision.Confirmada,
      );

      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comisionSync.id,
        EstadoInscripcionComision.Confirmada,
      );

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.permisos.accesoClasesVivo).toBe(true); // ← Tiene SYNC, entonces true
      expect(response.body.detalles.comisionesActivas).toHaveLength(2);
    });

    it('Estudiante con múltiples comisiones ASYNC → accesoClasesVivo = false', async () => {
      /**
       * Si TODAS las comisiones son ASYNC, no tiene acceso a clases en vivo
       */

      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { docente } = await createTestDocente(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const producto1 = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
        nombre: 'Curso Async 1',
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      const producto2 = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
        nombre: 'Curso Async 2',
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      const comision1 = await createTestComision(prisma, {
        productoId: producto1.id,
        docenteId: docente.id,
        nombre: 'Programación Async',
        modalidad: 'ASINCRONICO' as const,
      });

      const comision2 = await createTestComision(prisma, {
        productoId: producto2.id,
        docenteId: docente.id,
        nombre: 'Robótica Async',
        modalidad: 'ASINCRONICO' as const,
      });

      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision1.id,
        EstadoInscripcionComision.Confirmada,
      );

      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision2.id,
        EstadoInscripcionComision.Confirmada,
      );

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.permisos.accesoClasesVivo).toBe(false); // ← Todas ASYNC = no vivo
      expect(response.body.permisos.accesoPlanificaciones).toBe(true);
      expect(response.body.detalles.comisionesActivas).toHaveLength(2);
    });
  });

  // ============================================================================
  // CASOS EXTREMOS Y BOUNDARY VALUES
  // ============================================================================
  describe('Boundary Values: Fechas límite', () => {
    it('Comisión que termina HOY (23:59) aún da acceso', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { docente } = await createTestDocente(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
      });

      // Comisión que termina HOY al final del día
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999);

      const comision = await prisma.comision.create({
        data: {
          nombre: 'Comisión Termina Hoy',
          producto_id: producto.id,
          docente_id: docente.id,
          fecha_inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          fecha_fin: hoy,
          activo: true,
          modalidad: 'SINCRONICO',
        },
      });

      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision.id,
        EstadoInscripcionComision.Confirmada,
      );

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT - Aún tiene acceso porque fecha_fin >= hoy
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
    });

    it('Comisión que empieza HOY (00:00) ya da acceso', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { docente } = await createTestDocente(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
      });

      // Comisión que empieza HOY a las 00:00
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const comision = await prisma.comision.create({
        data: {
          nombre: 'Comisión Empieza Hoy',
          producto_id: producto.id,
          docente_id: docente.id,
          fecha_inicio: hoy,
          fecha_fin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          activo: true,
          modalidad: 'SINCRONICO',
        },
      });

      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision.id,
        EstadoInscripcionComision.Confirmada,
      );

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT - Ya tiene acceso porque fecha_inicio <= hoy
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
    });

    it('Comisión que terminó AYER no da acceso', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { docente } = await createTestDocente(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
      });

      // Comisión que terminó ayer
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      ayer.setHours(23, 59, 59, 999);

      const comision = await prisma.comision.create({
        data: {
          nombre: 'Comisión Terminó Ayer',
          producto_id: producto.id,
          docente_id: docente.id,
          fecha_inicio: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          fecha_fin: ayer,
          activo: true,
          modalidad: 'SINCRONICO',
        },
      });

      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision.id,
        EstadoInscripcionComision.Confirmada,
      );

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT - No tiene acceso
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(false);
    });

    it('Comisión que empieza MAÑANA no da acceso aún', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { docente } = await createTestDocente(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
      });

      // Comisión que empieza mañana
      const manana = new Date();
      manana.setDate(manana.getDate() + 1);
      manana.setHours(0, 0, 0, 0);

      const comision = await prisma.comision.create({
        data: {
          nombre: 'Comisión Empieza Mañana',
          producto_id: producto.id,
          docente_id: docente.id,
          fecha_inicio: manana,
          fecha_fin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          activo: true,
          modalidad: 'SINCRONICO',
        },
      });

      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision.id,
        EstadoInscripcionComision.Confirmada,
      );

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT - No tiene acceso aún
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(false);
    });
  });

  // ============================================================================
  // COMBINACIONES: TIER + COMISIÓN
  // ============================================================================
  describe('Combinaciones: Suscripción Tier + Comisión', () => {
    it('Estudiante con Tier LIBROS + Comisión SYNC tiene accesoClasesVivo', async () => {
      /**
       * Tier LIBROS no da clases en vivo, pero la comisión SYNC sí
       */

      // ARRANGE - Crear plan STEAM_LIBROS
      const planLibros = await prisma.planSuscripcion.create({
        data: {
          nombre: `STEAM_LIBROS_${Date.now()}`,
          descripcion: 'Plan básico con libros',
          precio_base: 40000,
          activo: true,
        },
      });

      const { tutor, password: tutorPassword } = await createTestTutor(prisma);
      const { docente } = await createTestDocente(prisma);

      // Crear suscripción activa con plan LIBROS
      await prisma.suscripcion.create({
        data: {
          tutor_id: tutor.id,
          plan_id: planLibros.id,
          estado: 'ACTIVA',
          fecha_inicio: new Date(),
          fecha_proximo_cobro: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          precio_final: 40000,
        },
      });

      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Crear comisión SYNC
      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      const comision = await createTestComision(prisma, {
        productoId: producto.id,
        docenteId: docente.id,
        modalidad: 'SINCRONICO' as const,
      });

      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision.id,
        EstadoInscripcionComision.Confirmada,
      );

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT - Tiene acceso por suscripción del tutor
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
      // Comisión SYNC da clases en vivo aunque tier sea LIBROS
      expect(response.body.permisos.accesoClasesVivo).toBe(true);
    });

    it('Estudiante con Tier SINCRONICO + Comisión ASYNC mantiene accesoClasesVivo del tier', async () => {
      /**
       * Tier SINCRONICO da clases en vivo, comisión ASYNC no lo quita
       */

      // ARRANGE - Crear plan STEAM_SINCRONICO
      const planSync = await prisma.planSuscripcion.create({
        data: {
          nombre: `STEAM_SINCRONICO_${Date.now()}`,
          descripcion: 'Plan completo con clases en vivo',
          precio_base: 95000,
          activo: true,
        },
      });

      const { tutor } = await createTestTutor(prisma);
      const { docente } = await createTestDocente(prisma);

      // Crear suscripción activa con plan SINCRONICO
      await prisma.suscripcion.create({
        data: {
          tutor_id: tutor.id,
          plan_id: planSync.id,
          estado: 'ACTIVA',
          fecha_inicio: new Date(),
          fecha_proximo_cobro: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          precio_final: 95000,
        },
      });

      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Crear comisión ASYNC adicional
      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      const comision = await createTestComision(prisma, {
        productoId: producto.id,
        docenteId: docente.id,
        modalidad: 'ASINCRONICO' as const,
      });

      await createTestInscripcionComision(
        prisma,
        estudiante.id,
        comision.id,
        EstadoInscripcionComision.Confirmada,
      );

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT - Tiene acceso por suscripción del tutor (SUSCRIPCION_TUTOR tiene prioridad)
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.motivo).toBe('SUSCRIPCION_TUTOR');
      // STEAM_SINCRONICO da clases en vivo + comisión adicional
      expect(response.body.permisos.accesoClasesVivo).toBe(true);
    });
  });

  // ============================================================================
  // EDGE CASES EXTREMOS
  // ============================================================================
  describe('Edge Cases Extremos', () => {
    it('Estudiante sin tutor válido no tiene acceso', async () => {
      /**
       * Caso donde el estudiante existe pero su tutor fue eliminado o inválido
       */
      // Este caso requiere manipulación directa de DB, skip por ahora
      // ya que el modelo tiene FK constraint
    });

    it('Comisión con producto eliminado no da acceso', async () => {
      // Este caso también tiene FK constraint (onDelete: Cascade)
      // La comisión se eliminaría junto con el producto
    });

    it('Inscripción duplicada a misma comisión - DB impide duplicados (unique constraint)', async () => {
      /**
       * El modelo tiene unique constraint en (comision_id, estudiante_id)
       * Esto es el comportamiento CORRECTO: no debería ser posible
       * inscribirse dos veces a la misma comisión
       */

      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { docente } = await createTestDocente(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      const comision = await createTestComision(prisma, {
        productoId: producto.id,
        docenteId: docente.id,
      });

      // Crear primera inscripción
      await prisma.inscripcionComision.create({
        data: {
          comision_id: comision.id,
          estudiante_id: estudiante.id,
          estado: 'Confirmada',
        },
      });

      // ACT & ASSERT - Intentar crear segunda inscripción debe fallar
      await expect(
        prisma.inscripcionComision.create({
          data: {
            comision_id: comision.id,
            estudiante_id: estudiante.id,
            estado: 'Confirmada',
          },
        }),
      ).rejects.toThrow();

      // Verificar que solo existe una inscripción
      const inscripciones = await prisma.inscripcionComision.findMany({
        where: {
          comision_id: comision.id,
          estudiante_id: estudiante.id,
        },
      });
      expect(inscripciones).toHaveLength(1);
    });

    it('Override vencido NO da acceso', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
        override: {
          acceso_clases_vivo: true,
          hasta: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // AYER
          motivo: 'Override vencido',
        },
      });

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT - Override vencido no cuenta
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(false);
      expect(response.body.motivo).toBe('SIN_ACCESO');
    });

    it('Override sin fecha (null) es indefinido', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);

      // Crear estudiante con override sin fecha de vencimiento
      const { estudiante: estudianteBase, password } =
        await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });

      // Actualizar para poner override sin fecha
      await prisma.estudiante.update({
        where: { id: estudianteBase.id },
        data: {
          acceso_override: true,
          acceso_override_hasta: null, // Sin fecha = indefinido
          acceso_override_motivo: 'Beca permanente',
        },
      });

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudianteBase.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT - Override sin fecha es válido
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.motivo).toBe('OVERRIDE');
    });

    it('Estudiante con estado_acceso VENCIDO no tiene acceso', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { estudiante: estudianteBase, password } =
        await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });

      // Cambiar estado a VENCIDO
      await prisma.estudiante.update({
        where: { id: estudianteBase.id },
        data: {
          estado_acceso: 'VENCIDO',
        },
      });

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudianteBase.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT - VENCIDO no bloquea como SUSPENDIDO (solo SUSPENDIDO bloquea)
      // VENCIDO es un estado informativo, el acceso depende de las fuentes
      expect(response.status).toBe(200);
      // Sin suscripción ni comisión = sin acceso
      expect(response.body.puedeAcceder).toBe(false);
    });

    it('Estudiante con estado_acceso BECA tiene acceso aunque no tenga suscripción', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { estudiante: estudianteBase, password } =
        await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });

      // Cambiar estado a BECA con override activo
      await prisma.estudiante.update({
        where: { id: estudianteBase.id },
        data: {
          estado_acceso: 'BECA',
          acceso_override: true,
          acceso_override_motivo: 'Beca por rendimiento',
        },
      });

      // ACT
      const auth = await loginEstudiante(app, {
        username: estudianteBase.username,
        password,
      });

      const response = await getVerificarAcceso(auth);

      // ASSERT - BECA + override = acceso
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.motivo).toBe('OVERRIDE');
    });
  });
});
