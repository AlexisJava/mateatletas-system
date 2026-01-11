import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import request from 'supertest';
import { PrismaService } from '../../core/database/prisma.service';
import { EstudiantesController } from '../estudiantes.controller';
import { EstudiantesFacadeService } from '../estudiantes-facade.service';
import { AccesoEstudianteService } from '../services/acceso-estudiante.service';
import { EstudianteQueryService } from '../services/estudiante-query.service';
import { EstudianteCommandService } from '../services/estudiante-command.service';
import { EstudianteCopyService } from '../services/estudiante-copy.service';
import { EstudianteStatsService } from '../services/estudiante-stats.service';
import { EstudianteBusinessValidator } from '../validators/estudiante-business.validator';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { EstudianteOwnershipGuard } from '../guards/estudiante-ownership.guard';

/**
 * TDD: Tests de INTEGRACIÓN para endpoints de acceso de estudiantes
 *
 * ENDPOINTS A IMPLEMENTAR:
 * - GET /estudiantes/verificar-acceso - Verificar acceso del estudiante logueado
 * - GET /estudiantes/puede-entrar-clase - Verificar si puede entrar a una clase específica
 *
 * METODOLOGÍA: TDD con integración real (no mocks)
 * Patrón copiado de acceso-estudiante.service.spec.ts
 */
describe('EstudiantesController - Endpoints de Acceso (Integración)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // IDs de prueba
  let tutorId: string;
  let estudianteId: string;
  let docenteId: string;
  let planLibrosId: string;
  let planAsincId: string;
  let planSincId: string;
  let comisionId: string;
  let claseGrupoId: string;

  // JWT token para autenticación
  let authToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      controllers: [EstudiantesController],
      providers: [
        PrismaService,
        AccesoEstudianteService,
        EstudiantesFacadeService,
        EstudianteQueryService,
        EstudianteCommandService,
        EstudianteCopyService,
        EstudianteStatsService,
        EstudianteBusinessValidator,
        EventEmitter2,
        {
          provide: JwtService,
          useValue: {
            sign: (payload: object) => `test-token-${JSON.stringify(payload)}`,
            verify: (token: string) => {
              // Extraer payload del token de prueba
              const match = token.match(/test-token-(.+)/);
              if (match && match[1]) {
                return JSON.parse(match[1]);
              }
              throw new Error('Invalid token');
            },
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: import('@nestjs/common').ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          // Simular usuario autenticado desde el token
          req.user = {
            id: estudianteId,
            email: 'estudiante@test.com',
            role: 'ESTUDIANTE',
          };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: () => true,
      })
      .overrideGuard(EstudianteOwnershipGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    app = module.createNestApplication();
    await app.init();

    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  beforeEach(async () => {
    // Limpiar datos de prueba antes de cada test
    await prisma.historialAccesoEstudiante.deleteMany({});
    await prisma.inscripcionComision.deleteMany({});
    await prisma.inscripcionClaseGrupo.deleteMany({});
    await prisma.comision.deleteMany({});
    await prisma.claseGrupo.deleteMany({});
    await prisma.suscripcion.deleteMany({});
    await prisma.estudiante.deleteMany({});
    await prisma.tutor.deleteMany({});
    await prisma.docente.deleteMany({});
    await prisma.planSuscripcion.deleteMany({});
    await prisma.producto.deleteMany({});
    await prisma.grupoPedagogico.deleteMany({});
    await prisma.sector.deleteMany({});

    // Crear planes de suscripción
    const planLibros = await prisma.planSuscripcion.create({
      data: {
        nombre: 'STEAM_LIBROS',
        descripcion: 'Plan básico con acceso a libros',
        precio_base: 45000,
      },
    });
    planLibrosId = planLibros.id;

    const planAsinc = await prisma.planSuscripcion.create({
      data: {
        nombre: 'STEAM_ASINCRONICO',
        descripcion: 'Plan con contenido asincrónico',
        precio_base: 65000,
      },
    });
    planAsincId = planAsinc.id;

    const planSinc = await prisma.planSuscripcion.create({
      data: {
        nombre: 'STEAM_SINCRONICO',
        descripcion: 'Plan completo con clases en vivo',
        precio_base: 95000,
      },
    });
    planSincId = planSinc.id;

    // Crear tutor
    const tutor = await prisma.tutor.create({
      data: {
        nombre: 'Tutor',
        apellido: 'Test',
        email: `tutor-${Date.now()}@test.com`,
        password_hash: 'hash123',
      },
    });
    tutorId = tutor.id;

    // Crear docente
    const docente = await prisma.docente.create({
      data: {
        nombre: 'Docente',
        apellido: 'Test',
        email: `docente-${Date.now()}@test.com`,
        password_hash: 'hash123',
      },
    });
    docenteId = docente.id;

    // Crear estudiante base (sin plan)
    const estudiante = await prisma.estudiante.create({
      data: {
        username: `estudiante-${Date.now()}`,
        nombre: 'Estudiante',
        apellido: 'Test',
        nivelEscolar: 'Primaria',
        edad: 10,
        tutor_id: tutorId,
      },
    });
    estudianteId = estudiante.id;

    // Crear sector para grupos
    const sector = await prisma.sector.create({
      data: {
        nombre: 'Matemática',
        descripcion: 'Sector de matemáticas',
        color: '#FF5733',
        icono: '📐',
      },
    });

    // Crear grupo
    const grupo = await prisma.grupoPedagogico.create({
      data: {
        codigo: 'B1',
        nombre: 'Grupo B1 Test',
        descripcion: 'Grupo de prueba',
        sector_id: sector.id,
      },
    });

    // Crear ClaseGrupo
    const claseGrupo = await prisma.claseGrupo.create({
      data: {
        codigo: 'CG-TEST',
        nombre: `ClaseGrupo Test ${Date.now()}`,
        dia_semana: 'LUNES',
        hora_inicio: '18:00',
        hora_fin: '19:30',
        fecha_inicio: new Date('2026-01-01'),
        fecha_fin: new Date('2026-12-15'),
        anio_lectivo: 2026,
        cupo_maximo: 15,
        grupo_id: grupo.id,
        docente_id: docenteId,
        sector_id: sector.id,
      },
    });
    claseGrupoId = claseGrupo.id;

    // Crear producto para comisión
    const producto = await prisma.producto.create({
      data: {
        nombre: 'Colonia Verano 2026',
        descripcion: 'Colonia de verano',
        precio: 150000,
        tipo: 'Curso',
        activo: true,
      },
    });

    // Crear comisión activa (fechas incluyen hoy)
    const hoy = new Date();
    const comision = await prisma.comision.create({
      data: {
        nombre: 'Turno Mañana',
        producto_id: producto.id,
        docente_id: docenteId,
        fecha_inicio: new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000), // Hace 7 días
        fecha_fin: new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000), // En 30 días
        activo: true,
      },
    });
    comisionId = comision.id;

    // Generar token de autenticación
    authToken = jwtService.sign({
      id: estudianteId,
      email: 'estudiante@test.com',
      role: 'ESTUDIANTE',
    });
  });

  afterAll(async () => {
    // Limpiar todo al finalizar
    await prisma.historialAccesoEstudiante.deleteMany({});
    await prisma.inscripcionComision.deleteMany({});
    await prisma.inscripcionClaseGrupo.deleteMany({});
    await prisma.comision.deleteMany({});
    await prisma.claseGrupo.deleteMany({});
    await prisma.suscripcion.deleteMany({});
    await prisma.estudiante.deleteMany({});
    await prisma.tutor.deleteMany({});
    await prisma.docente.deleteMany({});
    await prisma.planSuscripcion.deleteMany({});
    await prisma.producto.deleteMany({});
    await prisma.grupoPedagogico.deleteMany({});
    await prisma.sector.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  // ============================================================================
  // GET /estudiantes/verificar-acceso
  // ============================================================================
  describe('GET /estudiantes/verificar-acceso', () => {
    it('should_return_sin_acceso_when_estudiante_has_no_plan_no_subscription_no_comision', async () => {
      const response = await request(app.getHttpServer())
        .get('/estudiantes/verificar-acceso')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.puedeAcceder).toBe(false);
      expect(response.body.motivo).toBe('SIN_ACCESO');
      expect(response.body.permisos.accesoLibros).toBe(false);
      expect(response.body.permisos.accesoPlanificaciones).toBe(false);
      expect(response.body.permisos.accesoClasesVivo).toBe(false);
    });

    it('should_return_acceso_when_tutor_has_active_subscription', async () => {
      await prisma.suscripcion.create({
        data: {
          tutor_id: tutorId,
          plan_id: planSincId,
          estado: 'ACTIVA',
          precio_final: 95000,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/estudiantes/verificar-acceso')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.motivo).toBe('SUSCRIPCION_TUTOR');
      expect(response.body.permisos.accesoClasesVivo).toBe(true);
    });

    it('should_return_acceso_when_estudiante_has_plan_directo', async () => {
      await prisma.estudiante.update({
        where: { id: estudianteId },
        data: { plan_id: planSincId },
      });

      const response = await request(app.getHttpServer())
        .get('/estudiantes/verificar-acceso')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.motivo).toBe('PLAN_DIRECTO');
    });

    it('should_return_acceso_when_estudiante_has_comision_activa', async () => {
      await prisma.inscripcionComision.create({
        data: {
          estudiante_id: estudianteId,
          comision_id: comisionId,
          estado: 'Confirmada',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/estudiantes/verificar-acceso')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.motivo).toBe('COMISION_ACTIVA');
    });

    it('should_return_acceso_when_estudiante_has_override', async () => {
      await prisma.estudiante.update({
        where: { id: estudianteId },
        data: {
          acceso_override: true,
          acceso_override_motivo: 'Acceso de prueba',
          acceso_override_hasta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const response = await request(app.getHttpServer())
        .get('/estudiantes/verificar-acceso')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.motivo).toBe('OVERRIDE');
    });
  });

  // ============================================================================
  // GET /estudiantes/puede-entrar-clase
  // ============================================================================
  describe('GET /estudiantes/puede-entrar-clase', () => {
    it('should_return_400_when_no_clase_id_provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/estudiantes/puede-entrar-clase')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.message).toContain('claseGrupoId o comisionId');
    });

    it('should_return_400_when_both_ids_provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/estudiantes/puede-entrar-clase')
        .query({ claseGrupoId, comisionId })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.message).toContain('Solo uno');
    });

    it('should_return_false_when_not_inscribed_in_clase_grupo', async () => {
      await prisma.estudiante.update({
        where: { id: estudianteId },
        data: { plan_id: planSincId },
      });

      const response = await request(app.getHttpServer())
        .get('/estudiantes/puede-entrar-clase')
        .query({ claseGrupoId })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.puedeEntrar).toBe(false);
      expect(response.body.motivo).toBe('SIN_INSCRIPCION');
    });

    it('should_return_false_when_not_inscribed_in_comision', async () => {
      const response = await request(app.getHttpServer())
        .get('/estudiantes/puede-entrar-clase')
        .query({ comisionId })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.puedeEntrar).toBe(false);
      expect(response.body.motivo).toBe('SIN_INSCRIPCION');
    });

    it('should_return_true_when_inscribed_in_comision', async () => {
      await prisma.inscripcionComision.create({
        data: {
          estudiante_id: estudianteId,
          comision_id: comisionId,
          estado: 'Confirmada',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/estudiantes/puede-entrar-clase')
        .query({ comisionId })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.puedeEntrar).toBe(true);
      expect(response.body.motivo).toBe('COMISION_INSCRIPTO');
    });

    it('should_return_true_when_inscribed_in_clase_grupo_with_plan_sincronico', async () => {
      await prisma.estudiante.update({
        where: { id: estudianteId },
        data: { plan_id: planSincId },
      });

      await prisma.inscripcionClaseGrupo.create({
        data: {
          estudiante_id: estudianteId,
          clase_grupo_id: claseGrupoId,
          tutor_id: tutorId,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/estudiantes/puede-entrar-clase')
        .query({ claseGrupoId })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.puedeEntrar).toBe(true);
      expect(response.body.motivo).toBe('PLAN_SINCRONICO');
    });
  });
});
