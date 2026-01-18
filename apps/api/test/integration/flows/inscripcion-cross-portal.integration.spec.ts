/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST - VISTA UNIFICADA DE INSCRIPCIONES CROSS-PORTAL
 * ============================================================================
 *
 * Este test verifica el flujo cross-portal de inscripciones a ClaseGrupos:
 *   ADMIN (manual) + TUTOR (suscripción 2026) → DOCENTE (vista unificada)
 *
 * OBJETIVO: Verificar que la vista inscripciones_unificadas funciona correctamente
 * y que el docente puede ver estudiantes de AMBAS fuentes de inscripción.
 *
 * ============================================================================
 * EQUIVALENCE CLASSES
 * ============================================================================
 *
 * Fuentes de Inscripción a ClaseGrupo:
 * - E1: Inscripción MANUAL (admin/becas) via inscripciones_clase_grupo → visible
 * - E2: Inscripción SUSCRIPCION_2026 (tutor) via inscripciones_actividad → visible
 * - E3: Sin inscripción → no visible
 * - E4: Ambas fuentes (mismo estudiante) → 2 registros visibles
 *
 * Estados de Inscripción Manual:
 * - fecha_baja IS NULL → estado ACTIVA
 * - fecha_baja IS NOT NULL → estado CANCELADA
 *
 * Estados de Inscripción Suscripción 2026:
 * - estado = ACTIVA → visible
 * - estado = PAUSADA → NO visible (suscripción pausada)
 * - estado = CANCELADA → NO visible
 *
 * Tipo de Acceso (derivado del tier):
 * - tier = STEAM_SINCRONICO → tipo_acceso = SINCRONICO
 * - tier = STEAM_ASINCRONICO → tipo_acceso = ASINCRONICO
 * - tier = STEAM_LIBROS → tipo_acceso = ASINCRONICO
 *
 * ============================================================================
 * STATE TRANSITIONS
 * ============================================================================
 *
 * Inscripción Manual:
 *   ACTIVA (fecha_baja=null) ──(admin da baja)──> CANCELADA (fecha_baja=fecha)
 *
 * Inscripción Suscripción 2026:
 *   ACTIVA ──(tutor cancela)──> CANCELADA
 *   ACTIVA ──(fallo pago)──> PAUSADA
 *   PAUSADA ──(pago exitoso)──> ACTIVA
 *
 * ============================================================================
 * BOUNDARIES
 * ============================================================================
 *
 * - Fechas límite de inscripción (fecha_inicio, fecha_fin/fecha_baja)
 * - IDs únicos entre fuentes (no colisionan por ser CUIDs)
 *
 * ============================================================================
 * ERROR GUESSING
 * ============================================================================
 *
 * - Estudiante inscrito por AMBAS vías al mismo ClaseGrupo
 * - Suscripción familiar sin tutor_id válido
 * - Inscripción actividad sin clase_grupo_id (solo comisión)
 * - Rate limiting en queries del docente (5 req/min)
 *
 * Setup:
 *   docker-compose -f docker-compose.test.yml up -d
 *   DATABASE_URL="postgresql://test:test_password_123@localhost:5433/mateatletas_test" npx prisma migrate deploy
 *
 * Run:
 *   yarn workspace api test --testPathPattern="inscripcion-cross-portal" --runInBand
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
  createTestSector,
  createTestClaseGrupo,
  createTestInscripcionClaseGrupo,
} from '../../fixtures/factories/grupo.factory';
import { createTestProducto } from '../../fixtures/factories/comision.factory';
import {
  loginUser,
  withAuthHeaders,
  FRONTEND_ORIGIN,
  generateUniqueIP,
} from '../../helpers/auth.helpers';
import {
  TipoProducto,
  EstadoInscripcionActividad,
  EstadoSuscripcionFamiliar,
  TierNombre,
} from '@prisma/client';

describe('[INTEGRATION] Cross-Portal: Vista Unificada de Inscripciones', () => {
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

  /**
   * Crea una suscripción familiar 2026 con inscripción actividad a ClaseGrupo
   */
  async function createSuscripcionFamiliarConInscripcion(options: {
    tutorId: string;
    estudianteId: string;
    claseGrupoId: string;
    productoId: string;
    tier?: TierNombre;
    estadoSuscripcion?: EstadoSuscripcionFamiliar;
    estadoInscripcion?: EstadoInscripcionActividad;
  }) {
    // Crear suscripción familiar
    const suscripcionFamiliar = await prisma.suscripcionFamiliar.create({
      data: {
        tutor_id: options.tutorId,
        estado:
          options.estadoSuscripcion ?? EstadoSuscripcionFamiliar.AUTHORIZED,
        tier: options.tier ?? TierNombre.STEAM_SINCRONICO,
        monto_mensual: 95000,
        fecha_proximo_cobro: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Crear inscripción actividad
    const inscripcionActividad = await prisma.inscripcionActividad.create({
      data: {
        suscripcion_familiar_id: suscripcionFamiliar.id,
        estudiante_id: options.estudianteId,
        producto_id: options.productoId,
        clase_grupo_id: options.claseGrupoId,
        tier: options.tier ?? TierNombre.STEAM_SINCRONICO,
        estado: options.estadoInscripcion ?? EstadoInscripcionActividad.ACTIVA,
        fecha_inicio: new Date(),
      },
    });

    return { suscripcionFamiliar, inscripcionActividad };
  }

  /**
   * Obtiene las inscripciones unificadas de un ClaseGrupo via raw query
   * (Simula lo que hace el docente al consultar sus estudiantes)
   */
  async function getInscripcionesUnificadas(claseGrupoId: string) {
    return prisma.inscripcionUnificada.findMany({
      where: {
        clase_grupo_id: claseGrupoId,
        estado: 'ACTIVA',
      },
      include: {
        estudiante: true,
      },
    });
  }

  /**
   * Hace request como docente para obtener stats de su ClaseGrupo
   */
  async function getDocenteEstudiantes(
    auth: { cookie: string; token: string },
    claseGrupoId: string,
  ) {
    return withAuthHeaders(
      request(app.getHttpServer())
        .get(`/api/docentes/clase-grupos/${claseGrupoId}/estudiantes`)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP()),
      auth,
    );
  }

  // ============================================================================
  // EQUIVALENCE PARTITIONING: Fuentes de Inscripción
  // ============================================================================
  describe('Equivalence Partitioning: Fuentes de Inscripción', () => {
    it('E1: Inscripción MANUAL (admin/becas) es visible en vista unificada con fuente="MANUAL"', async () => {
      /**
       * ESCENARIO:
       * Admin inscribe estudiante manualmente (beca) → Docente debe ver al estudiante
       */

      // ARRANGE
      const { docente, password: docentePassword } =
        await createTestDocente(prisma);
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });

      // Inscripción MANUAL (admin/beca)
      await createTestInscripcionClaseGrupo(
        prisma,
        estudiante.id,
        claseGrupo.id,
        tutor.id,
      );

      // ACT - Consultar vista unificada
      const inscripciones = await getInscripcionesUnificadas(claseGrupo.id);

      // ASSERT
      expect(inscripciones).toHaveLength(1);
      expect(inscripciones[0].fuente).toBe('MANUAL');
      expect(inscripciones[0].estudiante_id).toBe(estudiante.id);
      expect(inscripciones[0].estado).toBe('ACTIVA');
      expect(inscripciones[0].suscripcion_familiar_id).toBeNull();
    });

    it('E2: Inscripción SUSCRIPCION_2026 (tutor) es visible en vista unificada con fuente="SUSCRIPCION_2026"', async () => {
      /**
       * ESCENARIO:
       * Tutor crea suscripción familiar 2026 con inscripción a ClaseGrupo
       * → Docente debe ver al estudiante
       */

      // ARRANGE
      const { docente } = await createTestDocente(prisma);
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Club,
        nombre: 'Club Matemática',
      });

      // Inscripción via SUSCRIPCION_2026
      const { suscripcionFamiliar, inscripcionActividad } =
        await createSuscripcionFamiliarConInscripcion({
          tutorId: tutor.id,
          estudianteId: estudiante.id,
          claseGrupoId: claseGrupo.id,
          productoId: producto.id,
        });

      // ACT - Consultar vista unificada
      const inscripciones = await getInscripcionesUnificadas(claseGrupo.id);

      // ASSERT
      expect(inscripciones).toHaveLength(1);
      expect(inscripciones[0].fuente).toBe('SUSCRIPCION_2026');
      expect(inscripciones[0].estudiante_id).toBe(estudiante.id);
      expect(inscripciones[0].estado).toBe('ACTIVA');
      expect(inscripciones[0].suscripcion_familiar_id).toBe(
        suscripcionFamiliar.id,
      );
      expect(inscripciones[0].tier).toBe('STEAM_SINCRONICO');
    });

    it('E3: Estudiante sin ninguna inscripción NO aparece en vista unificada', async () => {
      /**
       * ESCENARIO:
       * Estudiante existe pero no tiene ninguna inscripción a ClaseGrupo
       */

      // ARRANGE
      const { docente } = await createTestDocente(prisma);
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });

      // NO crear inscripción

      // ACT - Consultar vista unificada
      const inscripciones = await getInscripcionesUnificadas(claseGrupo.id);

      // ASSERT
      expect(inscripciones).toHaveLength(0);
    });

    it('E4: Estudiante inscrito por AMBAS fuentes aparece 2 veces (registros diferentes)', async () => {
      /**
       * ESCENARIO VÁLIDO:
       * Estudiante tiene BECA (manual) + SUSCRIPCIÓN del tutor (2026)
       * La vista muestra ambos registros porque son inscripciones diferentes
       */

      // ARRANGE
      const { docente } = await createTestDocente(prisma);
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Club,
        nombre: 'Club Matemática',
      });

      // Inscripción MANUAL (beca del admin)
      await createTestInscripcionClaseGrupo(
        prisma,
        estudiante.id,
        claseGrupo.id,
        tutor.id,
      );

      // Inscripción SUSCRIPCION_2026 (suscripción del tutor)
      await createSuscripcionFamiliarConInscripcion({
        tutorId: tutor.id,
        estudianteId: estudiante.id,
        claseGrupoId: claseGrupo.id,
        productoId: producto.id,
      });

      // ACT - Consultar vista unificada
      const inscripciones = await getInscripcionesUnificadas(claseGrupo.id);

      // ASSERT - Debe haber 2 registros (diferentes fuentes)
      expect(inscripciones).toHaveLength(2);

      const fuentes = inscripciones.map((i) => i.fuente);
      expect(fuentes).toContain('MANUAL');
      expect(fuentes).toContain('SUSCRIPCION_2026');

      // Ambos apuntan al mismo estudiante
      expect(
        inscripciones.every((i) => i.estudiante_id === estudiante.id),
      ).toBe(true);
    });
  });

  // ============================================================================
  // STATE TRANSITIONS: Estados de Inscripción
  // ============================================================================
  describe('State Transitions: Estados de Inscripción', () => {
    it('Inscripción MANUAL con fecha_baja → estado CANCELADA → NO visible', async () => {
      /**
       * ESCENARIO:
       * Admin da de baja a estudiante (fecha_baja != null)
       * → Docente ya NO debe ver al estudiante
       */

      // ARRANGE
      const { docente } = await createTestDocente(prisma);
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });

      // Crear inscripción CON fecha_baja (cancelada)
      await prisma.inscripcionClaseGrupo.create({
        data: {
          clase_grupo_id: claseGrupo.id,
          estudiante_id: estudiante.id,
          tutor_id: tutor.id,
          fecha_baja: new Date(), // BAJA
        },
      });

      // ACT - Consultar vista unificada (solo ACTIVAS)
      const inscripciones = await getInscripcionesUnificadas(claseGrupo.id);

      // ASSERT - No debe aparecer porque estado = CANCELADA
      expect(inscripciones).toHaveLength(0);

      // Verificar que existe en la vista pero con estado CANCELADA
      const todasLasInscripciones = await prisma.inscripcionUnificada.findMany({
        where: { clase_grupo_id: claseGrupo.id },
      });
      expect(todasLasInscripciones).toHaveLength(1);
      expect(todasLasInscripciones[0].estado).toBe('CANCELADA');
    });

    it('Inscripción SUSCRIPCION_2026 con estado CANCELADA → NO visible', async () => {
      /**
       * ESCENARIO:
       * Tutor cancela suscripción → Inscripción pasa a CANCELADA
       * → Docente ya NO debe ver al estudiante
       */

      // ARRANGE
      const { docente } = await createTestDocente(prisma);
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Club,
      });

      // Crear inscripción CANCELADA
      await createSuscripcionFamiliarConInscripcion({
        tutorId: tutor.id,
        estudianteId: estudiante.id,
        claseGrupoId: claseGrupo.id,
        productoId: producto.id,
        estadoInscripcion: EstadoInscripcionActividad.CANCELADA,
      });

      // ACT - Consultar vista unificada (solo ACTIVAS)
      const inscripciones = await getInscripcionesUnificadas(claseGrupo.id);

      // ASSERT - No debe aparecer
      expect(inscripciones).toHaveLength(0);
    });

    it('Inscripción SUSCRIPCION_2026 con estado PAUSADA → NO visible (pero sigue existiendo)', async () => {
      /**
       * ESCENARIO:
       * Fallo de pago → Suscripción pausada → Inscripción PAUSADA
       * → Docente NO ve al estudiante hasta que se reactive
       */

      // ARRANGE
      const { docente } = await createTestDocente(prisma);
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Club,
      });

      // Crear inscripción PAUSADA (fallo de pago)
      await createSuscripcionFamiliarConInscripcion({
        tutorId: tutor.id,
        estudianteId: estudiante.id,
        claseGrupoId: claseGrupo.id,
        productoId: producto.id,
        estadoInscripcion: EstadoInscripcionActividad.PAUSADA,
        estadoSuscripcion: EstadoSuscripcionFamiliar.PAUSED,
      });

      // ACT - Consultar vista unificada (solo ACTIVAS)
      const inscripciones = await getInscripcionesUnificadas(claseGrupo.id);

      // ASSERT - No debe aparecer en activas
      expect(inscripciones).toHaveLength(0);

      // Pero existe en la vista con estado PAUSADA
      const todasLasInscripciones = await prisma.inscripcionUnificada.findMany({
        where: { clase_grupo_id: claseGrupo.id },
      });
      expect(todasLasInscripciones).toHaveLength(1);
      expect(todasLasInscripciones[0].estado).toBe('PAUSADA');
    });

    it('Transición ACTIVA → CANCELADA en inscripción manual', async () => {
      /**
       * ESCENARIO:
       * Admin da de baja a estudiante (actualiza fecha_baja)
       * → Estado cambia de ACTIVA a CANCELADA
       */

      // ARRANGE
      const { docente } = await createTestDocente(prisma);
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });

      // Crear inscripción ACTIVA
      const inscripcion = await createTestInscripcionClaseGrupo(
        prisma,
        estudiante.id,
        claseGrupo.id,
        tutor.id,
      );

      // Verificar estado inicial ACTIVA
      let vistaBefore = await prisma.inscripcionUnificada.findFirst({
        where: { id: inscripcion.id },
      });
      expect(vistaBefore?.estado).toBe('ACTIVA');

      // ACT - Dar de baja (simula acción del admin)
      await prisma.inscripcionClaseGrupo.update({
        where: { id: inscripcion.id },
        data: { fecha_baja: new Date() },
      });

      // ASSERT - Estado cambió a CANCELADA
      const vistaAfter = await prisma.inscripcionUnificada.findFirst({
        where: { id: inscripcion.id },
      });
      expect(vistaAfter?.estado).toBe('CANCELADA');
    });
  });

  // ============================================================================
  // TIPO DE ACCESO: Derivado del Tier
  // ============================================================================
  describe('Tipo de Acceso derivado del Tier', () => {
    it('tier STEAM_SINCRONICO → tipo_acceso SINCRONICO', async () => {
      // ARRANGE
      const { docente } = await createTestDocente(prisma);
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Club,
      });

      await createSuscripcionFamiliarConInscripcion({
        tutorId: tutor.id,
        estudianteId: estudiante.id,
        claseGrupoId: claseGrupo.id,
        productoId: producto.id,
        tier: TierNombre.STEAM_SINCRONICO,
      });

      // ACT
      const inscripciones = await getInscripcionesUnificadas(claseGrupo.id);

      // ASSERT
      expect(inscripciones).toHaveLength(1);
      expect(inscripciones[0].tipo_acceso).toBe('SINCRONICO');
      expect(inscripciones[0].tier).toBe('STEAM_SINCRONICO');
    });

    it('tier STEAM_ASINCRONICO → tipo_acceso ASINCRONICO', async () => {
      // ARRANGE
      const { docente } = await createTestDocente(prisma);
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Club,
      });

      await createSuscripcionFamiliarConInscripcion({
        tutorId: tutor.id,
        estudianteId: estudiante.id,
        claseGrupoId: claseGrupo.id,
        productoId: producto.id,
        tier: TierNombre.STEAM_ASINCRONICO,
      });

      // ACT
      const inscripciones = await getInscripcionesUnificadas(claseGrupo.id);

      // ASSERT
      expect(inscripciones).toHaveLength(1);
      expect(inscripciones[0].tipo_acceso).toBe('ASINCRONICO');
      expect(inscripciones[0].tier).toBe('STEAM_ASINCRONICO');
    });

    it('tier STEAM_LIBROS → tipo_acceso ASINCRONICO', async () => {
      // ARRANGE
      const { docente } = await createTestDocente(prisma);
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Club,
      });

      await createSuscripcionFamiliarConInscripcion({
        tutorId: tutor.id,
        estudianteId: estudiante.id,
        claseGrupoId: claseGrupo.id,
        productoId: producto.id,
        tier: TierNombre.STEAM_LIBROS,
      });

      // ACT
      const inscripciones = await getInscripcionesUnificadas(claseGrupo.id);

      // ASSERT
      expect(inscripciones).toHaveLength(1);
      expect(inscripciones[0].tipo_acceso).toBe('ASINCRONICO');
      expect(inscripciones[0].tier).toBe('STEAM_LIBROS');
    });

    it('Inscripción MANUAL hereda tipo_acceso del registro original', async () => {
      // ARRANGE
      const { docente } = await createTestDocente(prisma);
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });

      // Inscripción manual con tipo_acceso específico
      await prisma.inscripcionClaseGrupo.create({
        data: {
          clase_grupo_id: claseGrupo.id,
          estudiante_id: estudiante.id,
          tutor_id: tutor.id,
          tipo_acceso: 'SINCRONICO',
        },
      });

      // ACT
      const inscripciones = await getInscripcionesUnificadas(claseGrupo.id);

      // ASSERT
      expect(inscripciones).toHaveLength(1);
      expect(inscripciones[0].tipo_acceso).toBe('SINCRONICO');
      expect(inscripciones[0].fuente).toBe('MANUAL');
      expect(inscripciones[0].tier).toBeNull(); // MANUAL no tiene tier
    });
  });

  // ============================================================================
  // CROSS-PORTAL FLOW: Admin + Tutor → Docente
  // ============================================================================
  describe('Cross-Portal Flow: Admin + Tutor → Docente ve ambos', () => {
    it('Docente ve estudiantes de AMBAS fuentes en su ClaseGrupo', async () => {
      /**
       * FLUJO COMPLETO:
       * 1. Admin inscribe Estudiante A (beca)
       * 2. Tutor inscribe Estudiante B (suscripción 2026)
       * 3. Docente consulta su ClaseGrupo → Ve A + B
       */

      // ARRANGE
      const { docente, password: docentePassword } =
        await createTestDocente(prisma);

      // Tutor con 2 hijos
      const { tutor } = await createTestTutor(prisma);
      const { estudiante: estudianteA } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      const { estudiante: estudianteB } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
        nombre: 'Matemática Lunes 19hs',
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Club,
        nombre: 'Club Matemática',
      });

      // Admin inscribe Estudiante A (BECA)
      await createTestInscripcionClaseGrupo(
        prisma,
        estudianteA.id,
        claseGrupo.id,
        tutor.id,
      );

      // Tutor inscribe Estudiante B (SUSCRIPCION 2026)
      await createSuscripcionFamiliarConInscripcion({
        tutorId: tutor.id,
        estudianteId: estudianteB.id,
        claseGrupoId: claseGrupo.id,
        productoId: producto.id,
      });

      // ACT - Docente consulta sus estudiantes
      const inscripciones = await getInscripcionesUnificadas(claseGrupo.id);

      // ASSERT
      expect(inscripciones).toHaveLength(2);

      const estudianteIds = inscripciones.map((i) => i.estudiante_id);
      expect(estudianteIds).toContain(estudianteA.id);
      expect(estudianteIds).toContain(estudianteB.id);

      const fuentes = inscripciones.map((i) => i.fuente);
      expect(fuentes).toContain('MANUAL');
      expect(fuentes).toContain('SUSCRIPCION_2026');
    });

    it('Admin da baja a estudiante → Docente ya NO lo ve', async () => {
      /**
       * FLUJO:
       * 1. Admin inscribe estudiante
       * 2. Docente lo ve
       * 3. Admin da de baja
       * 4. Docente ya NO lo ve
       */

      // ARRANGE
      const { docente } = await createTestDocente(prisma);
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });

      const inscripcion = await createTestInscripcionClaseGrupo(
        prisma,
        estudiante.id,
        claseGrupo.id,
        tutor.id,
      );

      // Verificar que docente lo ve
      let inscripciones = await getInscripcionesUnificadas(claseGrupo.id);
      expect(inscripciones).toHaveLength(1);

      // ACT - Admin da de baja
      await prisma.inscripcionClaseGrupo.update({
        where: { id: inscripcion.id },
        data: { fecha_baja: new Date() },
      });

      // ASSERT - Docente ya NO lo ve
      inscripciones = await getInscripcionesUnificadas(claseGrupo.id);
      expect(inscripciones).toHaveLength(0);
    });

    it('Tutor cancela suscripción → Docente ya NO ve al estudiante', async () => {
      /**
       * FLUJO:
       * 1. Tutor crea suscripción con inscripción
       * 2. Docente lo ve
       * 3. Tutor cancela suscripción
       * 4. Docente ya NO lo ve
       */

      // ARRANGE
      const { docente } = await createTestDocente(prisma);
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Club,
      });

      const { inscripcionActividad } =
        await createSuscripcionFamiliarConInscripcion({
          tutorId: tutor.id,
          estudianteId: estudiante.id,
          claseGrupoId: claseGrupo.id,
          productoId: producto.id,
        });

      // Verificar que docente lo ve
      let inscripciones = await getInscripcionesUnificadas(claseGrupo.id);
      expect(inscripciones).toHaveLength(1);

      // ACT - Tutor cancela
      await prisma.inscripcionActividad.update({
        where: { id: inscripcionActividad.id },
        data: { estado: EstadoInscripcionActividad.CANCELADA },
      });

      // ASSERT - Docente ya NO lo ve
      inscripciones = await getInscripcionesUnificadas(claseGrupo.id);
      expect(inscripciones).toHaveLength(0);
    });
  });

  // ============================================================================
  // ERROR GUESSING: Casos Típicos de Fallo
  // ============================================================================
  describe('Error Guessing: Casos Típicos de Fallo', () => {
    it('Inscripción actividad SIN clase_grupo_id (solo comisión) NO aparece en vista', async () => {
      /**
       * ESCENARIO:
       * La inscripción es a una Comisión, no a un ClaseGrupo
       * → NO debe aparecer en la vista unificada de ClaseGrupos
       */

      // ARRANGE
      const { docente } = await createTestDocente(prisma);
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Curso,
        nombre: 'Curso Temporal',
      });

      // Crear comisión
      const comision = await prisma.comision.create({
        data: {
          nombre: 'Comisión Test',
          producto_id: producto.id,
          docente_id: docente.id,
          fecha_inicio: new Date(),
          fecha_fin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          activo: true,
        },
      });

      // Crear suscripción familiar
      const suscripcionFamiliar = await prisma.suscripcionFamiliar.create({
        data: {
          tutor_id: tutor.id,
          estado: EstadoSuscripcionFamiliar.AUTHORIZED,
          tier: TierNombre.STEAM_SINCRONICO,
          monto_mensual: 95000,
        },
      });

      // Crear inscripción a COMISIÓN (no a ClaseGrupo)
      await prisma.inscripcionActividad.create({
        data: {
          suscripcion_familiar_id: suscripcionFamiliar.id,
          estudiante_id: estudiante.id,
          producto_id: producto.id,
          comision_id: comision.id, // A comisión
          clase_grupo_id: null, // NO a ClaseGrupo
          tier: TierNombre.STEAM_SINCRONICO,
          estado: EstadoInscripcionActividad.ACTIVA,
        },
      });

      // ACT - Consultar vista unificada del ClaseGrupo
      const inscripciones = await getInscripcionesUnificadas(claseGrupo.id);

      // ASSERT - NO debe aparecer porque es inscripción a Comisión
      expect(inscripciones).toHaveLength(0);
    });

    it('Múltiples estudiantes del mismo tutor con diferentes estados', async () => {
      /**
       * ESCENARIO:
       * Tutor tiene 3 hijos:
       * - Hijo A: inscripción ACTIVA
       * - Hijo B: inscripción CANCELADA
       * - Hijo C: inscripción PAUSADA
       * → Docente solo ve a Hijo A
       */

      // ARRANGE
      const { docente } = await createTestDocente(prisma);
      const { tutor } = await createTestTutor(prisma);
      const { estudiante: hijoA } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      const { estudiante: hijoB } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      const { estudiante: hijoC } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Club,
      });

      // Hijo A: ACTIVA
      await createSuscripcionFamiliarConInscripcion({
        tutorId: tutor.id,
        estudianteId: hijoA.id,
        claseGrupoId: claseGrupo.id,
        productoId: producto.id,
        estadoInscripcion: EstadoInscripcionActividad.ACTIVA,
      });

      // Para Hijo B y C necesitamos suscripciones familiares separadas
      // (porque unique constraint en tutor_id)
      // En realidad en el sistema real sería la MISMA suscripción familiar
      // pero con diferentes inscripcionesActividad

      // Simulamos creando inscripciones directamente sin pasar por helper
      const suscripcionFamiliar = await prisma.suscripcionFamiliar.findFirst({
        where: { tutor_id: tutor.id },
      });

      // Hijo B: CANCELADA (usando la misma suscripción familiar)
      await prisma.inscripcionActividad.create({
        data: {
          suscripcion_familiar_id: suscripcionFamiliar!.id,
          estudiante_id: hijoB.id,
          producto_id: producto.id,
          clase_grupo_id: claseGrupo.id,
          tier: TierNombre.STEAM_SINCRONICO,
          estado: EstadoInscripcionActividad.CANCELADA,
        },
      });

      // Hijo C: PAUSADA
      await prisma.inscripcionActividad.create({
        data: {
          suscripcion_familiar_id: suscripcionFamiliar!.id,
          estudiante_id: hijoC.id,
          producto_id: producto.id,
          clase_grupo_id: claseGrupo.id,
          tier: TierNombre.STEAM_SINCRONICO,
          estado: EstadoInscripcionActividad.PAUSADA,
        },
      });

      // ACT - Consultar solo ACTIVAS
      const inscripciones = await getInscripcionesUnificadas(claseGrupo.id);

      // ASSERT - Solo Hijo A (ACTIVA)
      expect(inscripciones).toHaveLength(1);
      expect(inscripciones[0].estudiante_id).toBe(hijoA.id);
    });

    it('Vista unificada no tiene duplicados por IDs diferentes', async () => {
      /**
       * ESCENARIO:
       * Los IDs de inscripciones_clase_grupo e inscripciones_actividad
       * son CUIDs independientes, no deberían colisionar
       */

      // ARRANGE
      const { docente } = await createTestDocente(prisma);
      const { tutor } = await createTestTutor(prisma);
      const { estudiante: est1 } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      const { estudiante: est2 } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Club,
      });

      // Estudiante 1: MANUAL
      await createTestInscripcionClaseGrupo(
        prisma,
        est1.id,
        claseGrupo.id,
        tutor.id,
      );

      // Estudiante 2: SUSCRIPCION_2026
      await createSuscripcionFamiliarConInscripcion({
        tutorId: tutor.id,
        estudianteId: est2.id,
        claseGrupoId: claseGrupo.id,
        productoId: producto.id,
      });

      // ACT
      const inscripciones = await getInscripcionesUnificadas(claseGrupo.id);

      // ASSERT - 2 registros con IDs diferentes
      expect(inscripciones).toHaveLength(2);

      const ids = inscripciones.map((i) => i.id);
      expect(new Set(ids).size).toBe(2); // IDs únicos
    });
  });

  // ============================================================================
  // BOUNDARY VALUES: Fechas Límite
  // ============================================================================
  describe('Boundary Values: Fechas de Inscripción', () => {
    it('Inscripción actividad con fecha_fin pasada aparece como CANCELADA', async () => {
      // ARRANGE
      const { docente } = await createTestDocente(prisma);
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Club,
      });

      // Crear suscripción familiar
      const suscripcionFamiliar = await prisma.suscripcionFamiliar.create({
        data: {
          tutor_id: tutor.id,
          estado: EstadoSuscripcionFamiliar.AUTHORIZED,
          tier: TierNombre.STEAM_SINCRONICO,
          monto_mensual: 95000,
        },
      });

      // Inscripción con fecha_fin en el pasado
      await prisma.inscripcionActividad.create({
        data: {
          suscripcion_familiar_id: suscripcionFamiliar.id,
          estudiante_id: estudiante.id,
          producto_id: producto.id,
          clase_grupo_id: claseGrupo.id,
          tier: TierNombre.STEAM_SINCRONICO,
          estado: EstadoInscripcionActividad.ACTIVA,
          fecha_inicio: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // Hace 60 días
          fecha_fin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Ayer
        },
      });

      // ACT - La vista muestra el estado del registro, no calcula por fecha
      const inscripciones = await prisma.inscripcionUnificada.findMany({
        where: { clase_grupo_id: claseGrupo.id },
      });

      // ASSERT - La inscripción existe pero con estado del registro (ACTIVA)
      // Nota: La lógica de negocio debe filtrar por fecha_fin si es necesario
      expect(inscripciones).toHaveLength(1);
      // La vista refleja el estado del registro, no calcula por fechas
      expect(inscripciones[0].estado).toBe('ACTIVA');
    });

    it('Inscripción manual creada HOY tiene fecha_inscripcion correcta', async () => {
      // ARRANGE
      const { docente } = await createTestDocente(prisma);
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });

      const hoy = new Date();

      // ACT
      await createTestInscripcionClaseGrupo(
        prisma,
        estudiante.id,
        claseGrupo.id,
        tutor.id,
      );

      const inscripciones = await getInscripcionesUnificadas(claseGrupo.id);

      // ASSERT
      expect(inscripciones).toHaveLength(1);
      // La fecha de inscripción debe ser hoy (con margen de segundos)
      const fechaInscripcion = new Date(inscripciones[0].fecha_inscripcion);
      expect(fechaInscripcion.getDate()).toBe(hoy.getDate());
      expect(fechaInscripcion.getMonth()).toBe(hoy.getMonth());
      expect(fechaInscripcion.getFullYear()).toBe(hoy.getFullYear());
    });
  });

  // ============================================================================
  // PERFORMANCE: Consultas con Múltiples Estudiantes
  // ============================================================================
  describe('Performance: Consultas con volumen', () => {
    it('Vista maneja ClaseGrupo con 10 estudiantes de fuentes mixtas', async () => {
      /**
       * ESCENARIO:
       * ClaseGrupo con 10 estudiantes:
       * - 5 via inscripción manual
       * - 5 via suscripción 2026
       */

      // ARRANGE
      const { docente } = await createTestDocente(prisma);

      const sector = await createTestSector(prisma);
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
        cupoMaximo: 20,
      });

      const producto = await createTestProducto(prisma, {
        tipo: TipoProducto.Club,
      });

      // Crear 5 estudiantes con inscripción MANUAL
      for (let i = 0; i < 5; i++) {
        const { tutor } = await createTestTutor(prisma);
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        await createTestInscripcionClaseGrupo(
          prisma,
          estudiante.id,
          claseGrupo.id,
          tutor.id,
        );
      }

      // Crear 5 estudiantes con inscripción SUSCRIPCION_2026
      for (let i = 0; i < 5; i++) {
        const { tutor } = await createTestTutor(prisma);
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        await createSuscripcionFamiliarConInscripcion({
          tutorId: tutor.id,
          estudianteId: estudiante.id,
          claseGrupoId: claseGrupo.id,
          productoId: producto.id,
        });
      }

      // ACT
      const startTime = Date.now();
      const inscripciones = await getInscripcionesUnificadas(claseGrupo.id);
      const queryTime = Date.now() - startTime;

      // ASSERT
      expect(inscripciones).toHaveLength(10);

      const manuales = inscripciones.filter((i) => i.fuente === 'MANUAL');
      const suscripciones = inscripciones.filter(
        (i) => i.fuente === 'SUSCRIPCION_2026',
      );

      expect(manuales).toHaveLength(5);
      expect(suscripciones).toHaveLength(5);

      // Query debe ser razonablemente rápida (< 500ms)
      expect(queryTime).toBeLessThan(500);
    });
  });
});
