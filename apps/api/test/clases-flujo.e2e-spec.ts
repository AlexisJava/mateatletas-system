import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  loginUser,
  type AuthSession,
  withAuthHeaders,
  withOriginHeader,
  FRONTEND_ORIGIN,
} from './utils/auth.helpers';

/**
 * E2E tests para el módulo de Clases.
 * Cubren los flujos principales de programación, consulta y cancelación
 * para los distintos roles (admin, docente, tutor).
 */
describe('Clases - Flujos principales (API)', () => {
  let app: INestApplication;
  let adminAuth: AuthSession;
  let docenteAuth: AuthSession;
  let tutorAuth: AuthSession;
  let claseProgramadaId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    adminAuth = await loginUser(app, {
      email: 'admin.test@mateatletas.com',
      password: 'Admin123!',
    });

    docenteAuth = await loginUser(app, {
      email: 'docente.test@mateatletas.com',
      password: 'Docente123!',
    });

    tutorAuth = await loginUser(app, {
      email: 'maria.garcia@tutor.com',
      password: 'Test123!',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('admin puede obtener metadata de rutas curriculares', async () => {
    const response = await withAuthHeaders(
      request(app.getHttpServer()).get('/clases/metadata/rutas-curriculares'),
      adminAuth,
    ).expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('nombre');
    }
  });

  it('admin puede programar y cancelar una clase', async () => {
    const rutasResponse = await withAuthHeaders(
      request(app.getHttpServer()).get('/clases/metadata/rutas-curriculares'),
      adminAuth,
    ).expect(200);

    const rutaCurricularId = rutasResponse.body?.[0]?.id ?? null;
    const fecha = new Date(Date.now() + 48 * 60 * 60 * 1000);
    fecha.setUTCHours(15, 0, 0, 0);

    const programarResponse = await withOriginHeader(
      withAuthHeaders(request(app.getHttpServer()).post('/clases'), adminAuth),
    )
      .send({
        nombre: 'Clase de prueba automatizada',
        rutaCurricularId,
        docenteId: docenteAuth.user?.id,
        fechaHoraInicio: fecha.toISOString(),
        duracionMinutos: 60,
        cuposMaximo: 10,
        descripcion: 'Clase creada desde pruebas E2E',
      })
      .expect(201);

    claseProgramadaId = programarResponse.body.id;
    expect(programarResponse.body.nombre).toBe('Clase de prueba automatizada');

    const detalle = await withAuthHeaders(
      request(app.getHttpServer()).get(`/clases/${claseProgramadaId}`),
      adminAuth,
    ).expect(200);

    expect(detalle.body).toHaveProperty('id', claseProgramadaId);
    expect(detalle.body).toHaveProperty('estado', 'Programada');

    const cancelarResponse = await withOriginHeader(
      withAuthHeaders(
        request(app.getHttpServer()).patch(
          `/clases/${claseProgramadaId}/cancelar`,
        ),
        adminAuth,
      ),
    ).expect(200);

    expect(cancelarResponse.body.estado).toBe('Cancelada');
  });

  it('admin puede listar clases con paginación', async () => {
    const response = await withAuthHeaders(
      request(app.getHttpServer()).get('/clases/admin/todas?limit=5'),
      adminAuth,
    ).expect(200);

    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body).toHaveProperty('meta');
    expect(response.body.meta).toHaveProperty('total');
  });

  it('docente puede obtener sus clases', async () => {
    const response = await withAuthHeaders(
      request(app.getHttpServer()).get('/clases/docente/mis-clases'),
      docenteAuth,
    ).expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('tutor puede listar clases disponibles y calendario', async () => {
    const clasesDisponibles = await withAuthHeaders(
      request(app.getHttpServer()).get('/clases'),
      tutorAuth,
    ).expect(200);

    expect(Array.isArray(clasesDisponibles.body)).toBe(true);

    const calendario = await withAuthHeaders(
      request(app.getHttpServer()).get('/clases/calendario'),
      tutorAuth,
    ).expect(200);

    expect(calendario.body).toHaveProperty('clases');
  });

  it('expose helper origin constant for debugging', () => {
    expect(FRONTEND_ORIGIN).toBeDefined();
  });
});
