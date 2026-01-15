/**
 * ============================================================================
 * LIVEKIT FLOW INTEGRATION TEST - Black Box Testing
 * ============================================================================
 *
 * Tests de integración para flujos de LiveKit (videollamadas en vivo).
 * Basado en los REQUISITOS reales del sistema documentados en:
 * - livekit.controller.ts
 * - livekit-token.service.ts
 *
 * Endpoints:
 * - POST /livekit/token/docente → @Roles(DOCENTE) - Token con canPublish: true
 * - POST /livekit/token/estudiante → @Roles(ESTUDIANTE) - Token con canPublish: false
 *
 * Validaciones reales (documentadas en livekit-token.service.ts):
 * - Docente ClaseGrupo: claseGrupo.docente_id === docenteId
 * - Docente Comision: comision.docente_id === docenteId
 * - Estudiante ClaseGrupo: inscripcionClaseGrupo.fecha_baja IS NULL
 * - Estudiante Comision: inscripcionComision.estado === 'Confirmada'
 *
 * NOTA: El sistema NO valida fechas de comisión (fecha_fin) - solo inscripción activa
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/core/database/prisma.service';
import {
  createEstudianteConClaseGrupo,
  createEstudianteConComision,
} from '../../fixtures/factories/scenarios.factory';
import { createTestDocente } from '../../fixtures/factories/usuario.factory';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import { EstadoInscripcionComision } from '@prisma/client';

describe('LiveKit Flow Integration Tests (BBT)', () => {
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

  // Helper: Login y obtener cookie
  async function loginAs(email: string, password: string): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password });
    const cookies = response.headers['set-cookie'] as string[];
    return cookies.join('; ');
  }

  async function loginAsEstudiante(
    username: string,
    password: string,
  ): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/estudiante/login')
      .send({ username, password });
    const cookies = response.headers['set-cookie'] as string[];
    return cookies.join('; ');
  }

  // ==========================================================================
  // CLASE DE EQUIVALENCIA: TOKEN DOCENTE - CLASE GRUPO
  // ==========================================================================

  describe('Token Docente - ClaseGrupo', () => {
    it('should_return_token_when_docente_owns_clase_grupo', async () => {
      // Arrange - Crear escenario con ClaseGrupo
      const setup = await createEstudianteConClaseGrupo(prisma);
      const cookie = await loginAs(setup.docente.email, setup.docentePassword);

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token/docente')
        .set('Cookie', cookie)
        .send({ claseGrupoId: setup.claseGrupo.id });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('wsUrl');
      expect(response.body).toHaveProperty('roomName');
      expect(response.body.roomName).toContain('clase-grupo-');
    });

    it('should_return_403_when_docente_does_not_own_clase_grupo', async () => {
      // Arrange - Crear escenario y otro docente que NO es dueño
      const setup = await createEstudianteConClaseGrupo(prisma);
      const { docente: otroDocente, password: otroPassword } =
        await createTestDocente(prisma);
      const cookie = await loginAs(otroDocente.email, otroPassword);

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token/docente')
        .set('Cookie', cookie)
        .send({ claseGrupoId: setup.claseGrupo.id });

      // Assert - 403 Forbidden: "No tienes permisos para esta clase"
      expect(response.status).toBe(403);
    });
  });

  // ==========================================================================
  // CLASE DE EQUIVALENCIA: TOKEN DOCENTE - COMISIÓN
  // ==========================================================================

  describe('Token Docente - Comisión', () => {
    it('should_return_token_when_docente_owns_comision', async () => {
      // Arrange - Crear escenario con Comisión
      const setup = await createEstudianteConComision(prisma);
      const cookie = await loginAs(setup.docente.email, setup.docentePassword);

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token/docente')
        .set('Cookie', cookie)
        .send({ comisionId: setup.comision.id });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.roomName).toContain('comision-');
    });

    it('should_return_403_when_docente_does_not_own_comision', async () => {
      // Arrange
      const setup = await createEstudianteConComision(prisma);
      const { docente: otroDocente, password: otroPassword } =
        await createTestDocente(prisma);
      const cookie = await loginAs(otroDocente.email, otroPassword);

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token/docente')
        .set('Cookie', cookie)
        .send({ comisionId: setup.comision.id });

      // Assert
      expect(response.status).toBe(403);
    });
  });

  // ==========================================================================
  // CLASE DE EQUIVALENCIA: TOKEN ESTUDIANTE - CLASE GRUPO
  // ==========================================================================

  describe('Token Estudiante - ClaseGrupo', () => {
    it('should_return_token_when_estudiante_inscrito_activo', async () => {
      // Arrange - Estudiante con inscripción activa (fecha_baja: null)
      const setup = await createEstudianteConClaseGrupo(prisma);
      const cookie = await loginAsEstudiante(
        setup.estudiante.username!,
        setup.estudiantePassword,
      );

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token/estudiante')
        .set('Cookie', cookie)
        .send({ claseGrupoId: setup.claseGrupo.id });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.roomName).toContain('clase-grupo-');
    });

    it('should_return_403_when_estudiante_not_inscrito', async () => {
      // Arrange - Crear estudiante SIN inscripción en esa clase
      const setup = await createEstudianteConClaseGrupo(prisma);

      // Crear otro estudiante que NO está inscrito en esa clase
      const { tutor } = await createTestTutorWithEstudiante(prisma);

      const cookie = await loginAsEstudiante(
        tutor.estudiante.username!,
        tutor.estudiantePassword,
      );

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token/estudiante')
        .set('Cookie', cookie)
        .send({ claseGrupoId: setup.claseGrupo.id });

      // Assert - 403: "No estás inscrito en esta clase"
      expect(response.status).toBe(403);
    });

    it('should_return_403_when_inscripcion_tiene_fecha_baja', async () => {
      // Arrange - Estudiante con inscripción dada de baja
      const setup = await createEstudianteConClaseGrupo(prisma);

      // Dar de baja la inscripción
      await prisma.inscripcionClaseGrupo.update({
        where: { id: setup.inscripcion.id },
        data: { fecha_baja: new Date() },
      });

      const cookie = await loginAsEstudiante(
        setup.estudiante.username!,
        setup.estudiantePassword,
      );

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token/estudiante')
        .set('Cookie', cookie)
        .send({ claseGrupoId: setup.claseGrupo.id });

      // Assert - 403: Inscripción no activa
      expect(response.status).toBe(403);
    });
  });

  // ==========================================================================
  // CLASE DE EQUIVALENCIA: TOKEN ESTUDIANTE - COMISIÓN
  // ==========================================================================

  describe('Token Estudiante - Comisión', () => {
    it('should_return_token_when_inscripcion_confirmada', async () => {
      // Arrange - Estudiante con inscripción estado='Confirmada'
      const setup = await createEstudianteConComision(prisma);
      const cookie = await loginAsEstudiante(
        setup.estudiante.username!,
        setup.estudiantePassword,
      );

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token/estudiante')
        .set('Cookie', cookie)
        .send({ comisionId: setup.comision.id });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
    });

    it('should_return_403_when_inscripcion_estado_not_confirmada', async () => {
      // Arrange - Cambiar estado a algo diferente de 'Confirmada'
      const setup = await createEstudianteConComision(prisma);

      await prisma.inscripcionComision.update({
        where: { id: setup.inscripcion.id },
        data: { estado: EstadoInscripcionComision.Pendiente },
      });

      const cookie = await loginAsEstudiante(
        setup.estudiante.username!,
        setup.estudiantePassword,
      );

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token/estudiante')
        .set('Cookie', cookie)
        .send({ comisionId: setup.comision.id });

      // Assert - 403: "No tienes inscripción activa en esta comisión"
      expect(response.status).toBe(403);
    });
  });

  // ==========================================================================
  // CLASE DE EQUIVALENCIA: VALIDACIÓN DE REQUEST
  // ==========================================================================

  describe('Validación de Request', () => {
    it('should_return_400_when_both_ids_provided', async () => {
      // Arrange
      const setup = await createEstudianteConComision(prisma);
      const cookie = await loginAs(setup.docente.email, setup.docentePassword);

      // Act - Enviar AMBOS IDs (inválido)
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token/docente')
        .set('Cookie', cookie)
        .send({
          claseGrupoId: 'some-id',
          comisionId: setup.comision.id,
        });

      // Assert - 400: "Debe proporcionar claseGrupoId o comisionId, no ambos"
      expect(response.status).toBe(400);
    });

    it('should_return_400_when_no_id_provided', async () => {
      // Arrange
      const setup = await createEstudianteConComision(prisma);
      const cookie = await loginAs(setup.docente.email, setup.docentePassword);

      // Act - No enviar ningún ID
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token/docente')
        .set('Cookie', cookie)
        .send({});

      // Assert - 400: "Debe proporcionar claseGrupoId o comisionId"
      expect(response.status).toBe(400);
    });
  });

  // ==========================================================================
  // CLASE DE EQUIVALENCIA: ROLES INCORRECTOS
  // ==========================================================================

  describe('Control de Roles', () => {
    it('should_return_403_when_estudiante_tries_token_docente', async () => {
      // Arrange - Estudiante intenta endpoint de docente
      const setup = await createEstudianteConClaseGrupo(prisma);
      const cookie = await loginAsEstudiante(
        setup.estudiante.username!,
        setup.estudiantePassword,
      );

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token/docente')
        .set('Cookie', cookie)
        .send({ claseGrupoId: setup.claseGrupo.id });

      // Assert - 403: No tiene rol DOCENTE
      expect(response.status).toBe(403);
    });

    it('should_return_403_when_docente_tries_token_estudiante', async () => {
      // Arrange - Docente intenta endpoint de estudiante
      const setup = await createEstudianteConClaseGrupo(prisma);
      const cookie = await loginAs(setup.docente.email, setup.docentePassword);

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token/estudiante')
        .set('Cookie', cookie)
        .send({ claseGrupoId: setup.claseGrupo.id });

      // Assert - 403: No tiene rol ESTUDIANTE
      expect(response.status).toBe(403);
    });

    it('should_return_401_when_not_authenticated', async () => {
      // Act - Sin cookie de autenticación
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token/docente')
        .send({ claseGrupoId: 'any-id' });

      // Assert
      expect(response.status).toBe(401);
    });
  });
});

// Helper para crear tutor con estudiante (no inscrito en ninguna clase específica)
async function createTestTutorWithEstudiante(prisma: PrismaService) {
  const { createTestTutor, createTestEstudiante } = await import(
    '../../fixtures/factories/usuario.factory'
  );
  const { tutor, password: tutorPassword } = await createTestTutor(prisma);
  const { estudiante, password: estudiantePassword } =
    await createTestEstudiante(prisma, { tutorId: tutor.id });

  return {
    tutor: {
      ...tutor,
      estudiante,
      estudiantePassword,
    },
    tutorPassword,
  };
}
