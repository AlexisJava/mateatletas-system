/**
 * ============================================================================
 * INTEGRATION TESTS - Validación de Fixtures
 * ============================================================================
 *
 * Este test valida que los fixtures de prueba funcionan correctamente.
 * Si estos tests pasan, los fixtures están listos para usar en otros tests.
 *
 * Setup:
 *   docker-compose -f docker-compose.test.yml up -d
 *   DATABASE_URL="postgresql://test:test_password_123@localhost:5433/mateatletas_test" npx prisma migrate deploy
 *
 * Run:
 *   npm run test:integration -- fixtures-validation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { AppModule } from '../../../src/app.module';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import {
  createTestEstudiante,
  createTestTutor,
  createTestDocente,
  createTestPlan,
  createTestSuscripcion,
  createTestClaseGrupo,
  createTestSector,
  createTestInscripcionClaseGrupo,
} from '../fixtures/factories';
import {
  ESTUDIANTE_FIXTURES,
  createClaseConEstudiantes,
} from '../fixtures/presets';
import {
  assertEstudianteExists,
  assertTutorExists,
  assertXPEquals,
  assertRachaEquals,
  assertInscritoEnClaseGrupo,
  assertEstudianteState,
  getXPActual,
} from '../helpers/assertions';
import { loginEstudiante, loginUser } from '../helpers/auth.helpers';
import { EstadoAccesoEstudiante } from '@prisma/client';

describe('[INTEGRATION] Fixtures Validation', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    prisma = app.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await cleanAllTestTables(prisma);
  });

  // ============================================================================
  // TEST 1: Factories básicas funcionan
  // ============================================================================
  describe('Basic Factories', () => {
    it('should create tutor with hashed password', async () => {
      const { tutor, password } = await createTestTutor(prisma, {
        nombre: 'Juan',
        apellido: 'Pérez',
      });

      expect(tutor.id).toBeDefined();
      expect(tutor.nombre).toBe('Juan');
      expect(tutor.apellido).toBe('Pérez');
      expect(tutor.password_hash).toBeDefined();
      expect(tutor.password_hash).not.toBe(password); // Hasheado

      await assertTutorExists(prisma, { id: tutor.id });
    });

    it('should create estudiante with recursos and racha initialized', async () => {
      const { estudiante, password } = await createTestEstudiante(prisma, {
        nombre: 'María',
        apellido: 'García',
        xpInicial: 100,
        rachaInicial: 5,
      });

      expect(estudiante.id).toBeDefined();
      expect(estudiante.nombre).toBe('María');
      expect(estudiante.password_hash).not.toBe(password);

      await assertEstudianteExists(prisma, { id: estudiante.id });
      await assertXPEquals(prisma, estudiante.id, 100);
      await assertRachaEquals(prisma, estudiante.id, 5);
    });

    it('should create docente with password', async () => {
      const { docente, password } = await createTestDocente(prisma);

      expect(docente.id).toBeDefined();
      expect(docente.password_hash).toBeDefined();
      expect(docente.password_hash).not.toBe(password);
    });

    it('should create complete ClaseGrupo with sector and grupo', async () => {
      const { docente } = await createTestDocente(prisma);
      const sector = await createTestSector(prisma, { nombre: 'Matemática' });
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        sectorId: sector.id,
      });

      expect(claseGrupo.id).toBeDefined();
      expect(claseGrupo.docente_id).toBe(docente.id);
      expect(claseGrupo.sector_id).toBe(sector.id);
    });
  });

  // ============================================================================
  // TEST 2: Fixtures predefinidos funcionan
  // ============================================================================
  describe('ESTUDIANTE_FIXTURES', () => {
    it('nuevo - creates student without plan', async () => {
      const { estudiante, tutor } = await ESTUDIANTE_FIXTURES.nuevo(prisma);

      expect(estudiante.plan_id).toBeNull();
      expect(estudiante.tutor_id).toBe(tutor.id);
    });

    it('planLibros - creates student with inherited access from tutor subscription', async () => {
      const { estudiante, plan, suscripcion, tutor } =
        await ESTUDIANTE_FIXTURES.planLibros(prisma);

      // El estudiante NO tiene plan_id directo - hereda acceso de la suscripción del tutor
      expect(estudiante.plan_id).toBeNull();
      expect(estudiante.tutor_id).toBe(tutor.id);
      expect(plan.nombre).toBe('STEAM_LIBROS');
      expect(suscripcion).toBeDefined();
      expect(suscripcion.tutor_id).toBe(tutor.id);
      expect(suscripcion.plan_id).toBe(plan.id);
    });

    it('planSincronico - creates student with inherited access and claseGrupo inscription', async () => {
      const {
        estudiante,
        claseGrupo,
        inscripcion,
        docente,
        tutor,
        suscripcion,
        plan,
      } = await ESTUDIANTE_FIXTURES.planSincronico(prisma);

      // El estudiante NO tiene plan_id directo - hereda acceso de la suscripción del tutor
      expect(estudiante.plan_id).toBeNull();
      expect(estudiante.tutor_id).toBe(tutor.id);
      expect(suscripcion.plan_id).toBe(plan.id);
      expect(inscripcion).toBeDefined();
      await assertInscritoEnClaseGrupo(prisma, estudiante.id, claseGrupo.id);
      expect(docente.id).toBeDefined();
    });

    it('suspendido - creates suspended student', async () => {
      const { estudiante } = await ESTUDIANTE_FIXTURES.suspendido(prisma);

      expect(estudiante.estado_acceso).toBe(EstadoAccesoEstudiante.SUSPENDIDO);
      await assertEstudianteExists(
        prisma,
        { id: estudiante.id },
        {
          estado_acceso: EstadoAccesoEstudiante.SUSPENDIDO,
        },
      );
    });

    it('conOverride - creates student with access override', async () => {
      const { estudiante } = await ESTUDIANTE_FIXTURES.conOverride(prisma);

      expect(estudiante.acceso_override).toBe(true);
      expect(estudiante.acceso_override_hasta).toBeDefined();
      expect(estudiante.acceso_override_motivo).toBe(
        'Prueba de acceso temporal',
      );
    });

    it('conProgreso - creates student with XP, racha, and activities', async () => {
      const { estudiante, recursos, racha, actividades, logros } =
        await ESTUDIANTE_FIXTURES.conProgreso(prisma);

      expect(recursos.xpTotal).toBe(1500);
      expect(racha.actual).toBe(7);
      expect(actividades.length).toBe(3);
      expect(logros.length).toBe(2);

      await assertEstudianteState(prisma, estudiante.id, {
        xp: 1500,
        racha: 7,
        logrosCount: 2,
        actividadesCount: 3,
      });
    });
  });

  // ============================================================================
  // TEST 3: Helper de clase con múltiples estudiantes
  // ============================================================================
  describe('createClaseConEstudiantes', () => {
    it('should create class with multiple enrolled students', async () => {
      const { docente, claseGrupo, estudiantes } =
        await createClaseConEstudiantes(prisma, 3);

      expect(docente.id).toBeDefined();
      expect(claseGrupo.id).toBeDefined();
      expect(estudiantes.length).toBe(3);

      // Verificar que todos están inscritos
      for (const { estudiante } of estudiantes) {
        await assertInscritoEnClaseGrupo(prisma, estudiante.id, claseGrupo.id);
      }
    });
  });

  // ============================================================================
  // TEST 4: Login con fixtures
  // ============================================================================
  describe('Login with fixtures', () => {
    it('should login tutor with fixture credentials', async () => {
      const { tutor, password: tutorPassword } = await createTestTutor(prisma, {
        email: 'login-test@example.com',
      });

      const auth = await loginUser(app, {
        email: tutor.email,
        password: tutorPassword,
      });

      expect(auth.token).toBeDefined();
      expect(auth.cookie).toBeDefined();
    });

    it('should login estudiante with fixture credentials', async () => {
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.planSincronico(prisma);

      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      expect(auth.token).toBeDefined();
      expect(auth.cookie).toBeDefined();
      expect(auth.user).toBeDefined();
    });
  });

  // ============================================================================
  // TEST 5: DB Assertions funcionan
  // ============================================================================
  describe('DB Assertions', () => {
    it('getXPActual returns correct value', async () => {
      const { estudiante } = await createTestEstudiante(prisma, {
        xpInicial: 250,
      });

      const xp = await getXPActual(prisma, estudiante.id);
      expect(xp).toBe(250);
    });

    it('assertEstudianteState validates multiple conditions', async () => {
      const { estudiante } = await ESTUDIANTE_FIXTURES.conProgreso(prisma);

      // Esto NO debe tirar error
      await assertEstudianteState(prisma, estudiante.id, {
        xp: 1500,
        racha: 7,
        logrosCount: 2,
      });
    });

    it('assertEstudianteExists fails for non-existent student', async () => {
      await expect(
        assertEstudianteExists(prisma, { username: 'no-existe-1234' }),
      ).rejects.toThrow('Estudiante no encontrado');
    });
  });
});
