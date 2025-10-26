/**
 * Test E2E del flujo completo - API Only
 *
 * Tests sin interfaz gráfica, solo endpoints de API
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  loginEstudiante,
  loginUser,
  type AuthSession,
  withAuthHeaders,
  withOriginHeader,
} from './utils/auth.helpers';

describe('Planificaciones - Flujo Completo E2E (API)', () => {
  let app: INestApplication;
  let adminAuth: AuthSession;
  let docenteAuth: AuthSession;
  let estudianteAuth: AuthSession;
  let docenteId: string;
  let claseGrupoId: string;
  let asignacionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Obtener tokens
    adminAuth = await loginUser(app, {
      email: 'admin.test@mateatletas.com',
      password: 'Admin123!',
    });

    docenteAuth = await loginUser(app, {
      email: 'docente.test@mateatletas.com',
      password: 'Docente123!',
    });
    docenteId = docenteAuth.user?.id;

    const estudianteLogin = await loginEstudiante(app, {
      email: 'estudiante.test@mateatletas.com',
      password: 'Estudiante123!',
    });
    estudianteAuth = estudianteLogin;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Auto-detección', () => {
    it('debe listar planificaciones detectadas', async () => {
      const response = await withAuthHeaders(
        request(app.getHttpServer()).get('/planificaciones'),
        adminAuth,
      ).expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      const ejemploMinimo = response.body.find((p: any) => p.codigo === 'ejemplo-minimo');
      expect(ejemploMinimo).toBeDefined();
      expect(ejemploMinimo.titulo).toBe('Ejemplo Mínimo - Planificación de Prueba');
    });

    it('debe obtener detalle de planificación específica', async () => {
      const response = await withAuthHeaders(
        request(app.getHttpServer()).get(
          '/planificaciones/ejemplo-minimo/detalle',
        ),
        adminAuth,
      ).expect(200);

      expect(response.body.codigo).toBe('ejemplo-minimo');
      expect(response.body.semanas_total).toBe(2);
    });
  });

  describe('2. Asignación (Admin)', () => {
    it('debe permitir a admin asignar planificación a docente', async () => {
      // Primero obtener un clase_grupo_id válido
      const grupos = await withAuthHeaders(
        request(app.getHttpServer()).get('/clase-grupos'),
        adminAuth,
      ).expect(200);

      claseGrupoId = grupos.body.data[0]?.id;

      if (!claseGrupoId) {
        console.warn('⚠️  No hay clase_grupo disponible, skipping test');
        return;
      }

      const response = await withOriginHeader(
        withAuthHeaders(
          request(app.getHttpServer()).post(
            '/planificaciones/ejemplo-minimo/asignar',
          ),
          adminAuth,
        ),
      )
        .send({
          docente_id: docenteId,
          clase_grupo_id: claseGrupoId,
        })
        .expect(201);

      expect(response.body.docente_id).toBe(docenteId);
      expect(response.body.clase_grupo_id).toBe(claseGrupoId);

      asignacionId = response.body.id;
    });
  });

  describe('3. Gestión de Semanas (Docente)', () => {
    it('debe permitir al docente listar sus asignaciones', async () => {
      const response = await withAuthHeaders(
        request(app.getHttpServer()).get('/planificaciones/mis-asignaciones'),
        docenteAuth,
      ).expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const asignacion = response.body.find((a: any) => a.planificacion.codigo === 'ejemplo-minimo');
      expect(asignacion).toBeDefined();
    });

    it('debe permitir activar semana 1', async () => {
      if (!asignacionId) {
        console.warn('⚠️  No hay asignacionId, skipping test');
        return;
      }

      const response = await withOriginHeader(
        withAuthHeaders(
          request(app.getHttpServer()).post(
            `/planificaciones/asignacion/${asignacionId}/semana/1/activar`,
          ),
          docenteAuth,
        ),
      ).expect(201);

      expect(response.body.semana_numero).toBe(1);
      expect(response.body.activa).toBe(true);
    });

    it('debe permitir activar semana 2', async () => {
      if (!asignacionId) {
        console.warn('⚠️  No hay asignacionId, skipping test');
        return;
      }

      const response = await withOriginHeader(
        withAuthHeaders(
          request(app.getHttpServer()).post(
            `/planificaciones/asignacion/${asignacionId}/semana/2/activar`,
          ),
          docenteAuth,
        ),
      ).expect(201);

      expect(response.body.semana_numero).toBe(2);
      expect(response.body.activa).toBe(true);
    });

    it('debe permitir desactivar semana 2', async () => {
      if (!asignacionId) {
        console.warn('⚠️  No hay asignacionId, skipping test');
        return;
      }

      const response = await withOriginHeader(
        withAuthHeaders(
          request(app.getHttpServer()).post(
            `/planificaciones/asignacion/${asignacionId}/semana/2/desactivar`,
          ),
          docenteAuth,
        ),
      ).expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('4. Progreso del Estudiante', () => {
    it('debe permitir al estudiante obtener su progreso', async () => {
      const response = await withAuthHeaders(
        request(app.getHttpServer()).get(
          '/planificaciones/ejemplo-minimo/progreso',
        ),
        estudianteAuth,
      ).expect(200);

      expect(response.body.progreso).toBeDefined();
      expect(response.body.semanasActivas).toBeDefined();
      expect(Array.isArray(response.body.semanasActivas)).toBe(true);
    });

    it('debe permitir al estudiante guardar estado', async () => {
      const estadoGuardado = {
        nivel: 5,
        vidas: 3,
        itemsDesbloqueados: ['item1', 'item2'],
      };

      const response = await withOriginHeader(
        withAuthHeaders(
          request(app.getHttpServer()).put(
            '/planificaciones/ejemplo-minimo/progreso',
          ),
          estudianteAuth,
        ),
      )
        .send({ estado_guardado: estadoGuardado })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('debe permitir al estudiante completar semana', async () => {
      const response = await withOriginHeader(
        withAuthHeaders(
          request(app.getHttpServer()).post(
            '/planificaciones/ejemplo-minimo/progreso/completar-semana',
          ),
          estudianteAuth,
        ),
      )
        .send({
          semana: 1,
          puntos: 100,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('debe permitir al estudiante registrar tiempo', async () => {
      const response = await withOriginHeader(
        withAuthHeaders(
          request(app.getHttpServer()).post(
            '/planificaciones/ejemplo-minimo/progreso/tiempo',
          ),
          estudianteAuth,
        ),
      )
        .send({
          minutos: 30,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.tiempo_total).toBeGreaterThanOrEqual(30);
    });
  });

  describe('5. Monitoreo (Docente)', () => {
    it('debe permitir al docente ver progreso de estudiantes', async () => {
      if (!asignacionId) {
        console.warn('⚠️  No hay asignacionId, skipping test');
        return;
      }

      const response = await withAuthHeaders(
        request(app.getHttpServer()).get(
          `/planificaciones/asignacion/${asignacionId}/progreso`,
        ),
        docenteAuth,
      ).expect(200);

      expect(response.body.asignacion).toBeDefined();
      expect(response.body.planificacion).toBeDefined();
      expect(response.body.progresos).toBeDefined();
      expect(Array.isArray(response.body.progresos)).toBe(true);
    });
  });
});
