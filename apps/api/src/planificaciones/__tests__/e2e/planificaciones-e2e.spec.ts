import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../../../core/database/prisma.service';
import { PlanificacionesModuleV2 } from '../../planificaciones.module.v2';
import { DatabaseModule } from '../../../core/database/database.module';
import { EstadoPlanificacion } from '@prisma/client';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';

describe('Planificaciones E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testAdminId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, PlanificacionesModuleV2],
    })
      // Mock guards para evitar complejidad de auth
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Create test admin
    const admin = await prisma.admin.create({
      data: {
        nombre: 'Admin',
        apellido: 'E2E',
        email: `admin-e2e-${Date.now()}@test.com`,
        password_hash: 'hashed',
      },
    });
    testAdminId = admin.id;
  });

  afterAll(async () => {
    if (testAdminId) {
      await prisma.planificacionMensual.deleteMany({
        where: { created_by_admin_id: testAdminId },
      });
      await prisma.admin.delete({ where: { id: testAdminId } });
    }
    await prisma.$disconnect();
    await app.close();
  });

  afterEach(async () => {
    await prisma.planificacionMensual.deleteMany({
      where: { created_by_admin_id: testAdminId },
    });
  });

  describe('GET /planificaciones', () => {
    it('should return empty list when no planifications exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/planificaciones')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('total_pages');
      expect(response.body.data).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    it('should return planifications list', async () => {
      // Create test data
      const plan1 = await prisma.planificacionMensual.create({
        data: {
          codigo_grupo: 'B1',
          mes: 11,
          anio: 2025,
          titulo: 'Test Plan 1',
          descripcion: 'Desc 1',
          tematica_principal: 'Tema 1',
          objetivos_aprendizaje: ['Obj 1'],
          estado: EstadoPlanificacion.PUBLICADA,
          created_by_admin_id: testAdminId,
        },
      });

      await prisma.planificacionMensual.create({
        data: {
          codigo_grupo: 'B2',
          mes: 11,
          anio: 2025,
          titulo: 'Test Plan 2',
          descripcion: 'Desc 2',
          tematica_principal: 'Tema 2',
          objetivos_aprendizaje: ['Obj 2'],
          estado: EstadoPlanificacion.BORRADOR,
          created_by_admin_id: testAdminId,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/planificaciones')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.total).toBe(2);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('codigo_grupo');
      expect(response.body.data[0]).toHaveProperty('titulo');
      expect(response.body.data[0]).toHaveProperty('estado');
      expect(response.body.data[0]).toHaveProperty('total_actividades');
      expect(response.body.data[0]).toHaveProperty('total_asignaciones');
    });

    it('should filter by codigo_grupo', async () => {
      await prisma.planificacionMensual.createMany({
        data: [
          {
            codigo_grupo: 'B1',
            mes: 11,
            anio: 2025,
            titulo: 'B1 Plan',
            descripcion: 'Desc',
            tematica_principal: 'Tema',
            objetivos_aprendizaje: ['Obj'],
            estado: EstadoPlanificacion.PUBLICADA,
            created_by_admin_id: testAdminId,
          },
          {
            codigo_grupo: 'B2',
            mes: 11,
            anio: 2025,
            titulo: 'B2 Plan',
            descripcion: 'Desc',
            tematica_principal: 'Tema',
            objetivos_aprendizaje: ['Obj'],
            estado: EstadoPlanificacion.PUBLICADA,
            created_by_admin_id: testAdminId,
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/planificaciones?codigo_grupo=B1')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].codigo_grupo).toBe('B1');
    });

    it('should filter by estado', async () => {
      await prisma.planificacionMensual.createMany({
        data: [
          {
            codigo_grupo: 'B1',
            mes: 11,
            anio: 2025,
            titulo: 'Publicada',
            descripcion: 'Desc',
            tematica_principal: 'Tema',
            objetivos_aprendizaje: ['Obj'],
            estado: EstadoPlanificacion.PUBLICADA,
            created_by_admin_id: testAdminId,
          },
          {
            codigo_grupo: 'B2',
            mes: 11,
            anio: 2025,
            titulo: 'Borrador',
            descripcion: 'Desc',
            tematica_principal: 'Tema',
            objetivos_aprendizaje: ['Obj'],
            estado: EstadoPlanificacion.BORRADOR,
            created_by_admin_id: testAdminId,
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/planificaciones?estado=PUBLICADA')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].estado).toBe('PUBLICADA');
      expect(response.body.data[0].titulo).toBe('Publicada');
    });

    it('should filter by mes and anio', async () => {
      await prisma.planificacionMensual.createMany({
        data: [
          {
            codigo_grupo: 'B1',
            mes: 11,
            anio: 2025,
            titulo: 'Noviembre 2025',
            descripcion: 'Desc',
            tematica_principal: 'Tema',
            objetivos_aprendizaje: ['Obj'],
            estado: EstadoPlanificacion.PUBLICADA,
            created_by_admin_id: testAdminId,
          },
          {
            codigo_grupo: 'B1',
            mes: 12,
            anio: 2025,
            titulo: 'Diciembre 2025',
            descripcion: 'Desc',
            tematica_principal: 'Tema',
            objetivos_aprendizaje: ['Obj'],
            estado: EstadoPlanificacion.PUBLICADA,
            created_by_admin_id: testAdminId,
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/planificaciones?mes=11&anio=2025')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].mes).toBe(11);
      expect(response.body.data[0].anio).toBe(2025);
    });

    it('should apply pagination correctly', async () => {
      // Create 15 planifications with unique combinations
      const plans = [];
      let counter = 0;
      for (let anio = 2025; anio <= 2026; anio++) {
        for (let mes = 1; mes <= 12; mes++) {
          if (counter >= 15) break;
          plans.push({
            codigo_grupo: 'B1',
            mes,
            anio,
            titulo: `Plan ${counter + 1}`,
            descripcion: 'Desc',
            tematica_principal: 'Tema',
            objetivos_aprendizaje: ['Obj'],
            estado: EstadoPlanificacion.PUBLICADA,
            created_by_admin_id: testAdminId,
          });
          counter++;
        }
        if (counter >= 15) break;
      }

      await prisma.planificacionMensual.createMany({ data: plans });

      // Get page 1 with limit 5
      const page1 = await request(app.getHttpServer())
        .get('/planificaciones?page=1&limit=5')
        .expect(200);

      expect(page1.body.data).toHaveLength(5);
      expect(page1.body.page).toBe(1);
      expect(page1.body.limit).toBe(5);
      expect(page1.body.total).toBe(15);
      expect(page1.body.total_pages).toBe(3);

      // Get page 2
      const page2 = await request(app.getHttpServer())
        .get('/planificaciones?page=2&limit=5')
        .expect(200);

      expect(page2.body.data).toHaveLength(5);
      expect(page2.body.page).toBe(2);

      // Get page 3
      const page3 = await request(app.getHttpServer())
        .get('/planificaciones?page=3&limit=5')
        .expect(200);

      expect(page3.body.data).toHaveLength(5);
      expect(page3.body.page).toBe(3);
    });

    it('should validate query parameters - invalid mes', async () => {
      const response = await request(app.getHttpServer())
        .get('/planificaciones?mes=13')
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should validate query parameters - invalid limit', async () => {
      const response = await request(app.getHttpServer())
        .get('/planificaciones?limit=200')
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should include activity and assignment counts', async () => {
      const planificacion = await prisma.planificacionMensual.create({
        data: {
          codigo_grupo: 'B1',
          mes: 11,
          anio: 2025,
          titulo: 'With Activities',
          descripcion: 'Desc',
          tematica_principal: 'Tema',
          objetivos_aprendizaje: ['Obj'],
          estado: EstadoPlanificacion.PUBLICADA,
          created_by_admin_id: testAdminId,
        },
      });

      // Create 3 activities
      await prisma.actividadSemanal.createMany({
        data: [
          {
            planificacion_id: planificacion.id,
            semana_numero: 1,
            orden: 1,
            titulo: 'Act 1',
            descripcion: 'Desc',
            componente_nombre: 'JuegoSuma',
            componente_props: {},
            nivel_dificultad: 'BASICO',
            puntos_gamificacion: 10,
            tiempo_estimado_minutos: 30,
            instrucciones_docente: 'Instrucciones docente',
            instrucciones_estudiante: 'Instrucciones estudiante',
          },
          {
            planificacion_id: planificacion.id,
            semana_numero: 2,
            orden: 2,
            titulo: 'Act 2',
            descripcion: 'Desc',
            componente_nombre: 'VideoEducativo',
            componente_props: {},
            nivel_dificultad: 'INTERMEDIO',
            puntos_gamificacion: 15,
            tiempo_estimado_minutos: 20,
            instrucciones_docente: 'Instrucciones docente',
            instrucciones_estudiante: 'Instrucciones estudiante',
          },
          {
            planificacion_id: planificacion.id,
            semana_numero: 3,
            orden: 3,
            titulo: 'Act 3',
            descripcion: 'Desc',
            componente_nombre: 'EjercicioPractica',
            componente_props: {},
            nivel_dificultad: 'AVANZADO',
            puntos_gamificacion: 20,
            tiempo_estimado_minutos: 45,
            instrucciones_docente: 'Instrucciones docente',
            instrucciones_estudiante: 'Instrucciones estudiante',
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/planificaciones')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].total_actividades).toBe(3);
      expect(response.body.data[0].total_asignaciones).toBe(0);
    });

    it('should return default pagination when not specified', async () => {
      await prisma.planificacionMensual.create({
        data: {
          codigo_grupo: 'B1',
          mes: 11,
          anio: 2025,
          titulo: 'Test',
          descripcion: 'Desc',
          tematica_principal: 'Tema',
          objetivos_aprendizaje: ['Obj'],
          estado: EstadoPlanificacion.PUBLICADA,
          created_by_admin_id: testAdminId,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/planificaciones')
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
    });
  });
});
