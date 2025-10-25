/**
 * E2E Test: Crear Planificación Mensual (SLICE 2)
 *
 * TDD - RED PHASE
 * Este test debe FALLAR inicialmente porque la funcionalidad no existe.
 *
 * Flujo:
 * 1. Admin crea planificación con datos válidos → 201 Created
 * 2. Admin intenta crear duplicada (mismo grupo+mes+año) → 409 Conflict
 * 3. Admin intenta crear con mes inválido → 400 Bad Request
 * 4. Admin intenta crear con código grupo inválido → 400 Bad Request
 */

import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import { PlanificacionesModule } from '../../planificaciones.module';
import { EstadoPlanificacion } from '@prisma/client';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Role } from '../../../auth/decorators/roles.decorator';

describe('POST /api/planificaciones - Crear Planificación (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let grupoB1Id: string;
  let grupoB2Id: string;
  let grupoB3Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PlanificacionesModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            id: 'test-admin-user',
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

    // Aplicar prefijo global 'api' (igual que en main.ts)
    app.setGlobalPrefix('api');

    // Configurar validación global (igual que en main.ts)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Obtener IDs de grupos pedagógicos
    const grupoB1 = await prisma.grupo.findUnique({ where: { codigo: 'B1' } });
    const grupoB2 = await prisma.grupo.findUnique({ where: { codigo: 'B2' } });
    const grupoB3 = await prisma.grupo.findUnique({ where: { codigo: 'B3' } });

    if (!grupoB1 || !grupoB2 || !grupoB3) {
      throw new Error('Grupos B1, B2, B3 no encontrados. Ejecutar migración primero.');
    }

    grupoB1Id = grupoB1.id;
    grupoB2Id = grupoB2.id;
    grupoB3Id = grupoB3.id;
  });

  afterAll(async () => {
    // Limpiar datos de test
    await prisma.planificacionMensual.deleteMany({
      where: {
        titulo: {
          contains: 'TEST',
        },
      },
    });

    await app.close();
  });

  afterEach(async () => {
    // Limpiar entre tests
    await prisma.planificacionMensual.deleteMany({
      where: {
        titulo: {
          contains: 'TEST',
        },
      },
    });
  });

  describe('✅ Casos exitosos', () => {
    it('debe crear una planificación con datos válidos', async () => {
      const payload = {
        grupo_id: grupoB1Id,
        mes: 12,
        anio: 2025,
        titulo: 'TEST - Multiplicaciones Diciembre 2025',
        descripcion: 'Planificación de test para multiplicaciones',
        tematica_principal: 'Multiplicaciones',
        objetivos_aprendizaje: [
          'Dominar tablas del 1 al 10',
          'Resolver problemas de multiplicación',
        ],
        notas_docentes: 'Enfocarse en la práctica diaria',
      };

      const response = await request(app.getHttpServer())
        .post('/api/planificaciones')
        .send(payload)
        .expect(201);

      // Verificar estructura de respuesta
      expect(response.body).toHaveProperty('id');
      expect(response.body.grupoId).toBe(grupoB1Id);
      expect(response.body.mes).toBe(12);
      expect(response.body.anio).toBe(2025);
      expect(response.body.titulo).toBe('TEST - Multiplicaciones Diciembre 2025');
      expect(response.body.estado).toBe(EstadoPlanificacion.BORRADOR);
      expect(response.body.objetivosAprendizaje).toEqual([
        'Dominar tablas del 1 al 10',
        'Resolver problemas de multiplicación',
      ]);
      expect(response.body.actividades).toEqual([]);

      // Verificar en BD
      const planificacionEnBD = await prisma.planificacionMensual.findUnique({
        where: { id: response.body.id },
      });

      expect(planificacionEnBD).toBeDefined();
      expect(planificacionEnBD?.grupo_id).toBe(grupoB1Id);
      expect(planificacionEnBD?.estado).toBe(EstadoPlanificacion.BORRADOR);
    });

    it('debe crear planificación sin campos opcionales', async () => {
      const payload = {
        grupo_id: grupoB2Id,
        mes: 3,
        anio: 2025,
        titulo: 'TEST - Marzo 2025 B2',
        tematica_principal: 'Fracciones',
      };

      const response = await request(app.getHttpServer())
        .post('/api/planificaciones')
        .send(payload)
        .expect(201);

      expect(response.body.grupoId).toBe(grupoB2Id);
      expect(response.body.descripcion).toBe('');
      expect(response.body.notasDocentes).toBeNull();
      expect(response.body.objetivosAprendizaje).toEqual([]);
    });
  });

  describe('❌ Validaciones de negocio', () => {
    it('debe rechazar planificación duplicada (mismo grupo+mes+año)', async () => {
      // Crear primera planificación
      const payload = {
        grupo_id: grupoB1Id,
        mes: 6,
        anio: 2025,
        titulo: 'TEST - Junio 2025 B1',
        tematica_principal: 'Geometría',
      };

      await request(app.getHttpServer())
        .post('/api/planificaciones')
        .send(payload)
        .expect(201);

      // Intentar crear duplicada
      const response = await request(app.getHttpServer())
        .post('/api/planificaciones')
        .send(payload)
        .expect(409);

      expect(response.body.message).toContain('Ya existe una planificación');
      expect(response.body.message).toContain('Junio');
      expect(response.body.message).toContain('2025');
    });

    it('debe permitir misma planificación para diferentes grupos', async () => {
      const basePayload = {
        mes: 8,
        anio: 2025,
        titulo: 'TEST - Agosto 2025',
        tematica_principal: 'Álgebra',
      };

      // Crear para B1
      await request(app.getHttpServer())
        .post('/api/planificaciones')
        .send({ ...basePayload, grupo_id: grupoB1Id })
        .expect(201);

      // Crear para B2 (debe ser exitoso)
      await request(app.getHttpServer())
        .post('/api/planificaciones')
        .send({ ...basePayload, grupo_id: grupoB2Id })
        .expect(201);

      // Crear para B3 (debe ser exitoso)
      await request(app.getHttpServer())
        .post('/api/planificaciones')
        .send({ ...basePayload, grupo_id: grupoB3Id })
        .expect(201);
    });
  });

  describe('❌ Validaciones de entrada', () => {
    it('debe rechazar mes inválido (menor a 1)', async () => {
      const payload = {
        grupo_id: grupoB1Id,
        mes: 0,
        anio: 2025,
        titulo: 'TEST - Mes inválido',
        tematica_principal: 'Test',
      };

      const response = await request(app.getHttpServer())
        .post('/api/planificaciones')
        .send(payload)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('mes'),
          expect.stringContaining('1'),
          expect.stringContaining('12'),
        ]),
      );
    });

    it('debe rechazar mes inválido (mayor a 12)', async () => {
      const payload = {
        grupo_id: grupoB1Id,
        mes: 13,
        anio: 2025,
        titulo: 'TEST - Mes inválido',
        tematica_principal: 'Test',
      };

      const response = await request(app.getHttpServer())
        .post('/api/planificaciones')
        .send(payload)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('mes'),
        ]),
      );
    });

    it('debe rechazar año inválido (muy antiguo)', async () => {
      const payload = {
        grupo_id: grupoB1Id,
        mes: 5,
        anio: 2019,
        titulo: 'TEST - Año inválido',
        tematica_principal: 'Test',
      };

      const response = await request(app.getHttpServer())
        .post('/api/planificaciones')
        .send(payload)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('anio'),
          expect.stringContaining('2020'),
        ]),
      );
    });

    it('debe rechazar grupo_id inválido (no es UUID)', async () => {
      const payload = {
        grupo_id: 'INVALID-NOT-UUID',
        mes: 5,
        anio: 2025,
        titulo: 'TEST - Grupo inválido',
        tematica_principal: 'Test',
      };

      const response = await request(app.getHttpServer())
        .post('/api/planificaciones')
        .send(payload)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('grupo_id'),
          expect.stringContaining('UUID'),
        ]),
      );
    });

    it('debe rechazar título vacío', async () => {
      const payload = {
        grupo_id: grupoB1Id,
        mes: 5,
        anio: 2025,
        titulo: '',
        tematica_principal: 'Test',
      };

      const response = await request(app.getHttpServer())
        .post('/api/planificaciones')
        .send(payload)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('titulo'),
        ]),
      );
    });

    it('debe rechazar temática principal vacía', async () => {
      const payload = {
        grupo_id: grupoB1Id,
        mes: 5,
        anio: 2025,
        titulo: 'TEST - Sin temática',
        tematica_principal: '',
      };

      const response = await request(app.getHttpServer())
        .post('/api/planificaciones')
        .send(payload)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('tematica_principal'),
        ]),
      );
    });

    it('debe rechazar campos requeridos faltantes', async () => {
      const payload = {
        mes: 5,
        anio: 2025,
        // Falta: grupo_id, titulo, tematica_principal
      };

      const response = await request(app.getHttpServer())
        .post('/api/planificaciones')
        .send(payload)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('grupo_id'),
          expect.stringContaining('titulo'),
          expect.stringContaining('tematica_principal'),
        ]),
      );
    });
  });
});
