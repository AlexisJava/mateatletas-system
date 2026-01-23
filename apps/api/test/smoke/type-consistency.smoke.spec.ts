/**
 * =============================================================================
 * SMOKE TESTS: CONSISTENCIA DE TIPOS FRONT ↔ BACK
 * =============================================================================
 *
 * Tests de humo para verificar que los tipos devueltos por el backend
 * coinciden con lo que espera el frontend.
 *
 * PROPÓSITO:
 * - Detectar regresiones de naming (snake_case vs camelCase)
 * - Verificar campos obligatorios están presentes
 * - Prevenir typos en campos importantes (ej: puntosToales vs puntosTotales)
 *
 * FILOSOFÍA:
 * - Tests simples y rápidos
 * - Verifican contrato de API, no lógica de negocio
 * - Se ejecutan como parte del CI/CD
 *
 * SETUP: docker-compose -f docker-compose.test.yml up -d
 * RUN: yarn workspace api test -- --testPathPattern="type-consistency.smoke" --runInBand
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/core/database/prisma.service';
import {
  createTestEstudiante,
  createTestDocente,
  createTestAdmin,
} from '../fixtures/factories';
import {
  loginUser,
  FRONTEND_ORIGIN,
  generateUniqueIP,
} from '../helpers/auth.helpers';
import { DEFAULT_PASSWORD } from '../fixtures/factories/usuario.factory';

describe('[SMOKE] Type Consistency Front ↔ Back', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let estudianteToken: string;
  let docenteToken: string;
  let adminToken: string;
  let testEstudianteId: string;

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
        transform: true,
      }),
    );

    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Crear usuarios de prueba
    const { estudiante, password: estPassword } = await createTestEstudiante(
      prisma,
      {
        xpInicial: 100,
      },
    );
    testEstudianteId = estudiante.id;

    const { docente, password: docPassword } = await createTestDocente(prisma);
    const admin = await createTestAdmin(prisma);

    // Obtener tokens
    estudianteToken = await loginUser(
      app,
      'estudiante',
      estudiante.username,
      estPassword,
      generateUniqueIP(),
      FRONTEND_ORIGIN,
    );

    docenteToken = await loginUser(
      app,
      'docente',
      docente.email,
      docPassword,
      generateUniqueIP(),
      FRONTEND_ORIGIN,
    );

    adminToken = await loginUser(
      app,
      'admin',
      admin.email,
      DEFAULT_PASSWORD,
      generateUniqueIP(),
      FRONTEND_ORIGIN,
    );
  }, 30000);

  afterAll(async () => {
    // Cleanup test data
    if (testEstudianteId) {
      await prisma.rachaEstudiante.deleteMany({
        where: { estudiante_id: testEstudianteId },
      });
      await prisma.recursosEstudiante.deleteMany({
        where: { estudiante_id: testEstudianteId },
      });
      await prisma.estudiante
        .delete({ where: { id: testEstudianteId } })
        .catch(() => {});
    }
    await app?.close();
  });

  // ============================================================================
  // GAMIFICACIÓN DASHBOARD
  // ============================================================================
  describe('Gamificación Dashboard', () => {
    it('should_return_puntosTotales_not_puntosToales', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/gamificacion/dashboard/${testEstudianteId}`)
        .set('Cookie', [`accessToken=${estudianteToken}`])
        .set('Origin', FRONTEND_ORIGIN)
        .expect(200);

      // Verificar que existe puntosTotales (camelCase correcto)
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('puntosTotales');
      expect(typeof response.body.stats.puntosTotales).toBe('number');

      // Verificar que NO existe el typo
      expect(response.body.stats).not.toHaveProperty('puntosToales');
    });

    it('should_return_nivel_object_with_correct_structure', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/gamificacion/dashboard/${testEstudianteId}`)
        .set('Cookie', [`accessToken=${estudianteToken}`])
        .set('Origin', FRONTEND_ORIGIN)
        .expect(200);

      // Verificar estructura de nivel
      expect(response.body).toHaveProperty('nivel');
      const nivel = response.body.nivel;

      // Campos obligatorios
      expect(nivel).toHaveProperty('nivelActual');
      expect(nivel).toHaveProperty('nombre');
      expect(nivel).toHaveProperty('puntosActuales');
      expect(nivel).toHaveProperty('puntosMinimos');
      expect(nivel).toHaveProperty('puntosMaximos');
      expect(nivel).toHaveProperty('porcentajeProgreso');

      // Tipos correctos
      expect(typeof nivel.nivelActual).toBe('number');
      expect(typeof nivel.nombre).toBe('string');
      expect(typeof nivel.puntosActuales).toBe('number');
    });

    it('should_return_estudiante_with_casa_object', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/gamificacion/dashboard/${testEstudianteId}`)
        .set('Cookie', [`accessToken=${estudianteToken}`])
        .set('Origin', FRONTEND_ORIGIN)
        .expect(200);

      // Verificar estructura de estudiante
      expect(response.body).toHaveProperty('estudiante');
      const estudiante = response.body.estudiante;

      expect(estudiante).toHaveProperty('id');
      expect(estudiante).toHaveProperty('nombre');
      expect(estudiante).toHaveProperty('apellido');

      // Casa puede ser null si el estudiante no tiene casa asignada
      if (estudiante.casa !== null) {
        expect(estudiante.casa).toHaveProperty('id');
        expect(estudiante.casa).toHaveProperty('nombre');
        expect(estudiante.casa).toHaveProperty('color');
      }
    });
  });

  // ============================================================================
  // GAMIFICACIÓN RECURSOS
  // ============================================================================
  describe('Gamificación Recursos', () => {
    it('should_return_xpTotal_in_recursos', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/gamificacion/recursos/${testEstudianteId}`)
        .set('Cookie', [`accessToken=${estudianteToken}`])
        .set('Origin', FRONTEND_ORIGIN)
        .expect(200);

      // Verificar que xpTotal existe y es número
      expect(response.body).toHaveProperty('xpTotal');
      expect(typeof response.body.xpTotal).toBe('number');

      // NO debe haber xp_total (snake_case)
      expect(response.body).not.toHaveProperty('xp_total');
    });

    it('should_return_nivel_and_progress_fields', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/gamificacion/recursos/${testEstudianteId}`)
        .set('Cookie', [`accessToken=${estudianteToken}`])
        .set('Origin', FRONTEND_ORIGIN)
        .expect(200);

      // Campos de nivel y progreso
      expect(response.body).toHaveProperty('nivel');
      expect(response.body).toHaveProperty('xpProgreso');
      expect(response.body).toHaveProperty('xpNecesario');
      expect(response.body).toHaveProperty('porcentajeNivel');

      // Tipos correctos
      expect(typeof response.body.nivel).toBe('number');
      expect(typeof response.body.xpProgreso).toBe('number');
      expect(typeof response.body.xpNecesario).toBe('number');
      expect(typeof response.body.porcentajeNivel).toBe('number');
    });

    it('should_return_racha_in_recursos', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/gamificacion/recursos/${testEstudianteId}`)
        .set('Cookie', [`accessToken=${estudianteToken}`])
        .set('Origin', FRONTEND_ORIGIN)
        .expect(200);

      // Verificar racha
      expect(response.body).toHaveProperty('racha');
      const racha = response.body.racha;

      expect(racha).toHaveProperty('rachaActual');
      expect(racha).toHaveProperty('rachaMaxima');
      expect(typeof racha.rachaActual).toBe('number');
    });
  });

  // ============================================================================
  // GAMIFICACIÓN PUNTOS
  // ============================================================================
  describe('Gamificación Puntos', () => {
    it('should_return_puntos_with_correct_structure', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/gamificacion/puntos/${testEstudianteId}`)
        .set('Cookie', [`accessToken=${estudianteToken}`])
        .set('Origin', FRONTEND_ORIGIN)
        .expect(200);

      // Estructura esperada según contracts
      expect(response.body).toHaveProperty('total');
      expect(typeof response.body.total).toBe('number');

      // Campos camelCase
      expect(response.body).not.toHaveProperty('total_puntos');
    });
  });

  // ============================================================================
  // ACCIONES PUNTUABLES
  // ============================================================================
  describe('Acciones Puntuables', () => {
    it('should_return_acciones_with_tipo_and_puntos', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/gamificacion/acciones')
        .set('Cookie', [`accessToken=${docenteToken}`])
        .set('Origin', FRONTEND_ORIGIN)
        .expect(200);

      // Debe ser un array
      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        const accion = response.body[0];

        // Verificar estructura de acción
        expect(accion).toHaveProperty('tipo');
        expect(accion).toHaveProperty('puntos');
        expect(typeof accion.tipo).toBe('string');
        expect(typeof accion.puntos).toBe('number');
      }
    });
  });

  // ============================================================================
  // RANKING
  // ============================================================================
  describe('Ranking', () => {
    it('should_return_ranking_with_correct_fields', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/gamificacion/ranking/${testEstudianteId}`)
        .set('Cookie', [`accessToken=${estudianteToken}`])
        .set('Origin', FRONTEND_ORIGIN)
        .expect(200);

      // Verificar estructura de ranking
      expect(response.body).toHaveProperty('posicion');
      expect(response.body).toHaveProperty('total');

      // Tipos correctos
      expect(typeof response.body.posicion).toBe('number');
      expect(typeof response.body.total).toBe('number');
    });
  });

  // ============================================================================
  // LOGROS
  // ============================================================================
  describe('Logros', () => {
    it('should_return_logros_array_with_correct_structure', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/gamificacion/logros/estudiante/${testEstudianteId}`)
        .set('Cookie', [`accessToken=${estudianteToken}`])
        .set('Origin', FRONTEND_ORIGIN)
        .expect(200);

      // Debe ser un array
      expect(Array.isArray(response.body)).toBe(true);

      // Si hay logros, verificar estructura
      if (response.body.length > 0) {
        const logro = response.body[0];

        // Campos obligatorios según contracts
        expect(logro).toHaveProperty('id');
        expect(logro).toHaveProperty('nombre');
        expect(logro).toHaveProperty('codigo');
      }
    });

    it('should_return_all_logros_catalog', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/gamificacion/logros')
        .set('Cookie', [`accessToken=${estudianteToken}`])
        .set('Origin', FRONTEND_ORIGIN)
        .expect(200);

      // Debe ser un array
      expect(Array.isArray(response.body)).toBe(true);

      // Si hay logros en el catálogo, verificar estructura
      if (response.body.length > 0) {
        const logro = response.body[0];

        expect(logro).toHaveProperty('id');
        expect(logro).toHaveProperty('nombre');
        expect(logro).toHaveProperty('descripcion');
        expect(logro).toHaveProperty('codigo');
        expect(logro).toHaveProperty('categoria');

        // camelCase, no snake_case
        expect(logro).not.toHaveProperty('xp_recompensa');
        // El campo correcto depende del schema, verificar lo que sí está
        if ('xpRecompensa' in logro) {
          expect(typeof logro.xpRecompensa).toBe('number');
        }
      }
    });
  });

  // ============================================================================
  // HISTORIAL
  // ============================================================================
  describe('Historial de Puntos', () => {
    it('should_return_historial_array_with_camelCase_fields', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/gamificacion/historial/${testEstudianteId}`)
        .set('Cookie', [`accessToken=${estudianteToken}`])
        .set('Origin', FRONTEND_ORIGIN)
        .expect(200);

      // Debe ser un array
      expect(Array.isArray(response.body)).toBe(true);

      // Si hay historial, verificar que usa camelCase
      if (response.body.length > 0) {
        const item = response.body[0];

        // Campos deben ser camelCase
        const keys = Object.keys(item);
        keys.forEach((key) => {
          // No debe haber snake_case
          expect(key).not.toMatch(/_/);
        });
      }
    });
  });

  // ============================================================================
  // NIVELES
  // ============================================================================
  describe('Niveles', () => {
    it('should_return_all_niveles_with_correct_structure', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/gamificacion/niveles')
        .set('Cookie', [`accessToken=${estudianteToken}`])
        .set('Origin', FRONTEND_ORIGIN)
        .expect(200);

      // Debe ser un array de niveles
      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        const nivel = response.body[0];

        // Campos esperados
        expect(nivel).toHaveProperty('nivel');
        expect(nivel).toHaveProperty('nombre');
        expect(nivel).toHaveProperty('puntosMinimos');
        expect(nivel).toHaveProperty('puntosMaximos');

        // camelCase
        expect(nivel).not.toHaveProperty('puntos_minimos');
        expect(nivel).not.toHaveProperty('puntos_maximos');
      }
    });
  });
});
