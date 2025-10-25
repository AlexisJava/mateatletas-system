import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  loginUser,
  type AuthSession,
  withAuthHeaders,
  withOriginHeader,
} from './utils/auth.helpers';

/**
 * E2E tests para el módulo de Pagos.
 * Validan los endpoints expuestos para configuración, métricas
 * y cálculo de precios que se utilizan desde el dashboard administrativo
 * y el portal de tutores.
 */
describe('Pagos - Endpoints principales (API)', () => {
  let app: INestApplication;
  let adminAuth: AuthSession;
  let tutorAuth: AuthSession;
  let tutorId: string;
  let estudianteIds: string[] = [];

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

    tutorAuth = await loginUser(app, {
      email: 'maria.garcia@tutor.com',
      password: 'Test123!',
    });
    tutorId = tutorAuth.user?.id;

    const estudiantesResponse = await withAuthHeaders(
      request(app.getHttpServer()).get('/estudiantes'),
      tutorAuth,
    ).expect(200);

    const data = estudiantesResponse.body?.data ?? estudiantesResponse.body;
    if (Array.isArray(data)) {
      estudianteIds = data.map((item: any) => item.id).filter(Boolean);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('exponer configuración de precios vigente', async () => {
    const response = await request(app.getHttpServer())
      .get('/pagos/configuracion')
      .expect(200);

    expect(response.body).toHaveProperty('precioClubMatematicas');
    expect(typeof response.body.precioClubMatematicas).toBe('string');
  });

  it('exponer historial de cambios de configuración', async () => {
    const response = await request(app.getHttpServer())
      .get('/pagos/historial-cambios')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('exponer métricas del dashboard administrativo', async () => {
    const response = await request(app.getHttpServer())
      .get('/pagos/dashboard/metricas')
      .expect(200);

    expect(response.body).toHaveProperty('metricasGenerales');
    expect(response.body).toHaveProperty('evolucionMensual');
  });

  it('exponer inscripciones pendientes y estudiantes con descuentos', async () => {
    const pendientes = await request(app.getHttpServer())
      .get('/pagos/inscripciones/pendientes')
      .expect(200);

    expect(Array.isArray(pendientes.body)).toBe(true);

    const descuentos = await request(app.getHttpServer())
      .get('/pagos/estudiantes-descuentos')
      .expect(200);

    expect(Array.isArray(descuentos.body)).toBe(true);
  });

  it('permitir a tutores calcular precios de forma transparente', async () => {
    if (!tutorId || estudianteIds.length === 0) {
      console.warn('⚠️  No hay estudiantes asociados al tutor de pruebas, se omite el test de cálculo de precio.');
      return;
    }

    const estudianteId = estudianteIds[0];

    const response = await withOriginHeader(
      withAuthHeaders(
        request(app.getHttpServer()).post('/pagos/calcular-precio'),
        tutorAuth,
      ),
    )
      .send({
        tutorId,
        estudiantesIds: [estudianteId],
        productosIdsPorEstudiante: {
          [estudianteId]: ['seed-suscripcion-mensual'],
        },
        tieneAACREA: false,
      })
      .expect(200);

    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('detallePorEstudiante');
  });

  it('permitir al admin actualizar configuración con trazabilidad', async () => {
    const motivo = `Test actualización ${new Date().toISOString()}`;

    const response = await withOriginHeader(
      withAuthHeaders(
        request(app.getHttpServer()).post('/pagos/configuracion/actualizar'),
        adminAuth,
      ),
    )
      .send({
        adminId: adminAuth.user?.id,
        precioClubMatematicas: 2500,
        precioCursosEspecializados: 4500,
        precioMultipleActividades: 4200,
        precioHermanosBasico: 2300,
        precioHermanosMultiple: 2100,
        descuentoAacreaPorcentaje: 10,
        descuentoAacreaActivo: true,
        diaVencimiento: 10,
        diasAntesRecordatorio: 3,
        notificacionesActivas: true,
        motivoCambio: motivo,
      })
      .expect(200);

    expect(response.body).toHaveProperty('precioClubMatematicas');
    expect(response.body).toHaveProperty('descuentoAacreaActivo', true);
  });
});
