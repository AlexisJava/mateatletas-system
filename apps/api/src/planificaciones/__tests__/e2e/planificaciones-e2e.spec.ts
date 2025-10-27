import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../../../core/database/prisma.service';
import { PlanificacionesModule } from '../../planificaciones.module';
import { DatabaseModule } from '../../../core/database/database.module';
import { EstadoPlanificacion } from '@prisma/client';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Role } from '../../../auth/decorators/roles.decorator';

describe('Planificaciones E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testAdminId: string;
  let testGrupoAId: string;
  let testGrupoACodigo: string;
  let testGrupoBId: string;
  let testGrupoBCodigo: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, PlanificacionesModule],
    })
      // Mock guards para evitar complejidad de auth
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            id: testAdminId ?? 'admin-e2e-user',
            email: 'admin@test.com',
            roles: [Role.Admin],
          };
          return true;
        },
      })
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

    // Create test groups
    const grupoA = await prisma.grupo.create({
      data: {
        codigo: `E2E-A-${Date.now()}`,
        nombre: 'Grupo E2E A',
        descripcion: 'Grupo de prueba A',
      },
    });
    testGrupoAId = grupoA.id;
    testGrupoACodigo = grupoA.codigo;

    const grupoB = await prisma.grupo.create({
      data: {
        codigo: `E2E-B-${Date.now()}`,
        nombre: 'Grupo E2E B',
        descripcion: 'Grupo de prueba B',
      },
    });
    testGrupoBId = grupoB.id;
    testGrupoBCodigo = grupoB.codigo;
  });

  afterAll(async () => {
    if (testAdminId) {
      await prisma.planificacionMensual.deleteMany({
        where: { created_by_admin_id: testAdminId },
      });
      await prisma.admin.delete({ where: { id: testAdminId } });
    }
    if (testGrupoAId) {
      await prisma.grupo.delete({ where: { id: testGrupoAId } });
    }
    if (testGrupoBId) {
      await prisma.grupo.delete({ where: { id: testGrupoBId } });
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
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body.data).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    it('should return planifications list', async () => {
      // Create test data
      const plan1 = await prisma.planificacionMensual.create({
        data: {
          grupo_id: testGrupoAId,
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
          grupo_id: testGrupoBId,
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
      expect(response.body.data[0]).toHaveProperty('codigoGrupo');
      expect(response.body.data[0]).toHaveProperty('titulo');
      expect(response.body.data[0]).toHaveProperty('estado');
      expect(response.body.data[0]).toHaveProperty('activityCount');
      expect(response.body.data[0]).toHaveProperty('assignmentCount');
    });

    it('should filter by codigo_grupo', async () => {
      await prisma.planificacionMensual.createMany({
        data: [
          {
            grupo_id: testGrupoAId,
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
            grupo_id: testGrupoBId,
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
        .get(`/planificaciones?codigo_grupo=${testGrupoACodigo}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].codigoGrupo).toBe(testGrupoACodigo);
    });

    it('should filter by estado', async () => {
      await prisma.planificacionMensual.createMany({
        data: [
          {
            grupo_id: testGrupoAId,
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
            grupo_id: testGrupoBId,
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
            grupo_id: testGrupoAId,
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
            grupo_id: testGrupoAId,
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
            grupo_id: testGrupoAId,
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
      expect(page1.body.totalPages).toBe(3);

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
          grupo_id: testGrupoAId,
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
      expect(response.body.data[0].activityCount).toBe(3);
      expect(response.body.data[0].assignmentCount).toBe(0);
    });

    it('should return default pagination when not specified', async () => {
      await prisma.planificacionMensual.create({
        data: {
          grupo_id: testGrupoAId,
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

  describe('Planificacion detail and mutations', () => {
    it('should return planification detail with activities', async () => {
      const planificacion = await prisma.planificacionMensual.create({
        data: {
          grupo_id: testGrupoAId,
          mes: 9,
          anio: 2026,
          titulo: 'Detalle Plan',
          descripcion: 'Detalle de prueba',
          tematica_principal: 'Temática detalle',
          objetivos_aprendizaje: ['Detalle 1'],
          estado: EstadoPlanificacion.PUBLICADA,
          created_by_admin_id: testAdminId,
        },
      });

      await prisma.actividadSemanal.create({
        data: {
          planificacion_id: planificacion.id,
          semana_numero: 1,
          titulo: 'Actividad detalle',
          descripcion: 'Actividad para detalle',
          componente_nombre: 'JuegoSuma',
          componente_props: {},
          nivel_dificultad: 'BASICO',
          tiempo_estimado_minutos: 20,
          puntos_gamificacion: 10,
          instrucciones_docente: 'Instrucciones docente',
          instrucciones_estudiante: 'Instrucciones estudiante',
          orden: 1,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/planificaciones/${planificacion.id}`)
        .expect(200);

      expect(response.body.id).toBe(planificacion.id);
      expect(response.body.actividades).toHaveLength(1);
      expect(response.body.actividades[0].planificacionId).toBe(
        planificacion.id,
      );
    });

    it('should update a planification', async () => {
      const planificacion = await prisma.planificacionMensual.create({
        data: {
          grupo_id: testGrupoAId,
          mes: 10,
          anio: 2026,
          titulo: 'Plan a actualizar',
          descripcion: 'Descripción original',
          tematica_principal: 'Temática',
          objetivos_aprendizaje: ['Objetivo'],
          estado: EstadoPlanificacion.BORRADOR,
          created_by_admin_id: testAdminId,
        },
      });

      const response = await request(app.getHttpServer())
        .patch(`/planificaciones/${planificacion.id}`)
        .send({
          titulo: 'Plan actualizado',
          estado: 'PUBLICADA',
        })
        .expect(200);

      expect(response.body.titulo).toBe('Plan actualizado');
      expect(response.body.estado).toBe('PUBLICADA');
      expect(response.body.fechaPublicacion).toBeTruthy();

      const updated = await prisma.planificacionMensual.findUnique({
        where: { id: planificacion.id },
      });
      expect(updated?.titulo).toBe('Plan actualizado');
      expect(updated?.estado).toBe(EstadoPlanificacion.PUBLICADA);
    });

    it('should delete a planification', async () => {
      const planificacion = await prisma.planificacionMensual.create({
        data: {
          grupo_id: testGrupoAId,
          mes: 8,
          anio: 2026,
          titulo: 'Plan para eliminar',
          descripcion: 'Descripción',
          tematica_principal: 'Temática',
          objetivos_aprendizaje: ['Objetivo'],
          estado: EstadoPlanificacion.BORRADOR,
          created_by_admin_id: testAdminId,
        },
      });

      await request(app.getHttpServer())
        .delete(`/planificaciones/${planificacion.id}`)
        .expect(204);

      const deleted = await prisma.planificacionMensual.findUnique({
        where: { id: planificacion.id },
      });
      expect(deleted).toBeNull();
    });

    it('should create, update and delete an activity', async () => {
      const planificacion = await prisma.planificacionMensual.create({
        data: {
          grupo_id: testGrupoAId,
          mes: 7,
          anio: 2026,
          titulo: 'Plan con actividad',
          descripcion: 'Descripción',
          tematica_principal: 'Temática',
          objetivos_aprendizaje: ['Objetivo'],
          estado: EstadoPlanificacion.BORRADOR,
          created_by_admin_id: testAdminId,
        },
      });

      const createResponse = await request(app.getHttpServer())
        .post(`/planificaciones/${planificacion.id}/actividades`)
        .send({
          semana: 1,
          titulo: 'Actividad creada',
          descripcion: 'Descripción actividad',
          componente: 'JuegoSuma',
          props: {},
          nivel_dificultad: 'BASICO',
          tiempo_estimado_minutos: 25,
          puntos_gamificacion: 12,
          instrucciones_docente: 'Indicación docente',
          instrucciones_estudiante: 'Indicación estudiante',
          orden: 1,
        })
        .expect(201);

      expect(createResponse.body.planificacionId).toBe(planificacion.id);
      expect(createResponse.body.titulo).toBe('Actividad creada');

      const updateResponse = await request(app.getHttpServer())
        .patch(
          `/planificaciones/${planificacion.id}/actividades/${createResponse.body.id}`,
        )
        .send({
          titulo: 'Actividad actualizada',
          semana: 2,
        })
        .expect(200);

      expect(updateResponse.body.titulo).toBe('Actividad actualizada');
      expect(updateResponse.body.semana).toBe(2);

      await request(app.getHttpServer())
        .delete(
          `/planificaciones/${planificacion.id}/actividades/${createResponse.body.id}`,
        )
        .expect(204);

      const deletedActividad = await prisma.actividadSemanal.findUnique({
        where: { id: createResponse.body.id },
      });
      expect(deletedActividad).toBeNull();
    });
  });
});
