/**
 * ============================================================================
 * INTEGRATION TESTS - Docentes Module - Próxima Clase
 * ============================================================================
 *
 * TDD: Test escrito PRIMERO, antes del endpoint.
 *
 * Estos tests corren contra una base de datos REAL (PostgreSQL de test).
 * Verifican el flujo completo del endpoint GET /docentes/me/proxima-clase
 *
 * Setup required:
 *   docker-compose -f docker-compose.test.yml up -d
 *   DATABASE_URL="postgresql://test:test_password_123@localhost:5433/mateatletas_test" npx prisma migrate deploy
 *
 * Run:
 *   npm run test:integration -- --testPathPattern="docentes.integration"
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { PrismaService } from '../../src/core/database/prisma.service';
import { AppModule } from '../../src/app.module';
import * as bcrypt from 'bcrypt';

describe('[INTEGRATION] Docentes - Próxima Clase', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // ============================================================================
  // Setup: Levantar aplicación con DB real
  // ============================================================================
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    prisma = app.get<PrismaService>(PrismaService);

    await app.init();
  }, 60000);

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  }, 60000); // Timeout aumentado para evitar conexiones abiertas

  // ============================================================================
  // Cleanup: Limpiar DB antes de cada test
  // ============================================================================
  beforeEach(async () => {
    // Limpiar tablas en orden correcto (hijos primero, luego padres)
    // IMPORTANTE: NO borrar casas - son datos fijos del sistema
    await prisma.inscripcionComision.deleteMany({});
    await prisma.comision.deleteMany({});
    await prisma.estudiante.deleteMany({});
    await prisma.producto.deleteMany({});
    await prisma.docente.deleteMany({});
    await prisma.tutor.deleteMany({});
  });

  // ============================================================================
  // Helper: Crear docente directamente en DB y hacer login
  // ============================================================================
  async function createDocenteAndLogin(email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear docente directamente en DB (no hay endpoint de registro para docentes)
    await prisma.docente.create({
      data: {
        email,
        password_hash: passwordHash,
        nombre: 'Test',
        apellido: 'Docente',
      },
    });

    // Login para obtener cookies
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password });

    return loginResponse.headers['set-cookie'];
  }

  // ============================================================================
  // Helper: Crear producto para poder crear comisiones
  // ============================================================================
  async function createProducto() {
    return prisma.producto.create({
      data: {
        nombre: 'Curso de Matemáticas',
        precio: 5000,
        tipo: 'Curso',
        activo: true,
      },
    });
  }

  // ============================================================================
  // Helper: Obtener o crear casa (las casas son datos fijos, no crear nuevas)
  // ============================================================================
  async function getOrCreateCasa() {
    // Intentar encontrar casa existente
    let casa = await prisma.casa.findFirst({
      where: { tipo: 'QUANTUM' },
    });

    // Si no existe, crearla (solo en DB de test vacía)
    if (!casa) {
      casa = await prisma.casa.create({
        data: {
          tipo: 'QUANTUM',
          nombre: 'Quantum',
          emoji: '⚡',
          edadMinima: 6,
          edadMaxima: 9,
          colorPrimary: '#4F46E5',
          colorSecondary: '#818CF8',
          colorAccent: '#A5B4FC',
          colorDark: '#312E81',
          gradiente: 'from-indigo-500 to-purple-600',
        },
      });
    }

    return casa;
  }

  // ============================================================================
  // INTEGRATION TESTS: GET /docentes/me/proxima-clase
  // ============================================================================
  describe('GET /api/docentes/me/proxima-clase', () => {
    it('debe retornar la próxima clase del docente con comisión activa', async () => {
      // Arrange: Crear docente y loguearse
      const cookies = await createDocenteAndLogin(
        'docente-test@example.com',
        'Password123!',
      );

      // Crear producto y comisión con horario futuro
      const producto = await createProducto();
      const docente = await prisma.docente.findUnique({
        where: { email: 'docente-test@example.com' },
      });

      // Crear comisión para mañana
      const manana = new Date();
      manana.setDate(manana.getDate() + 1);
      manana.setHours(10, 0, 0, 0);

      await prisma.comision.create({
        data: {
          nombre: 'Turno Mañana',
          producto_id: producto.id,
          docente_id: docente!.id,
          horario: 'Lunes 10:00-12:00',
          fecha_inicio: new Date(),
          fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
          activo: true,
        },
      });

      // Act: Llamar al endpoint
      const response = await request(app.getHttpServer())
        .get('/api/docentes/me/proxima-clase')
        .set('Cookie', cookies);

      // Assert: Verificar respuesta
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('comision');
      expect(response.body).toHaveProperty('fecha_hora');
      expect(response.body).toHaveProperty('minutos_restantes');
      expect(response.body.comision.nombre).toBe('Turno Mañana');
    });

    it('debe retornar null si el docente no tiene comisiones', async () => {
      // Arrange: Crear docente sin comisiones
      const cookies = await createDocenteAndLogin(
        'docente-sin-clases@example.com',
        'Password123!',
      );

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/docentes/me/proxima-clase')
        .set('Cookie', cookies);

      // Assert: Cuando no hay próxima clase, el body es null o vacío
      expect(response.status).toBe(200);
      // NestJS puede serializar null como {} o como null dependiendo de la configuración
      const isEmpty =
        response.body === null || Object.keys(response.body).length === 0;
      expect(isEmpty).toBe(true);
    });

    it('debe retornar 401 sin autenticación', async () => {
      // Act: Llamar sin cookies
      const response = await request(app.getHttpServer()).get(
        '/api/docentes/me/proxima-clase',
      );

      // Assert
      expect(response.status).toBe(401);
    });

    it('debe retornar 403 si el usuario no es docente', async () => {
      // Arrange: Crear tutor (no docente) y loguearse
      await request(app.getHttpServer()).post('/api/auth/register').send({
        email: 'tutor-proxima@example.com',
        password: 'Password123!',
        nombre: 'Tutor',
        apellido: 'Test',
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'tutor-proxima@example.com',
          password: 'Password123!',
        });

      const cookies = loginResponse.headers['set-cookie'];

      // Act: Intentar acceder como tutor
      const response = await request(app.getHttpServer())
        .get('/api/docentes/me/proxima-clase')
        .set('Cookie', cookies);

      // Assert: Debe ser 403 Forbidden (no tiene rol DOCENTE)
      expect(response.status).toBe(403);
    });

    it('debe ignorar comisiones inactivas', async () => {
      // Arrange: Crear docente con comisión inactiva
      const cookies = await createDocenteAndLogin(
        'docente-inactivo@example.com',
        'Password123!',
      );

      const producto = await createProducto();
      const docente = await prisma.docente.findUnique({
        where: { email: 'docente-inactivo@example.com' },
      });

      // Crear comisión INACTIVA
      await prisma.comision.create({
        data: {
          nombre: 'Comisión Cancelada',
          producto_id: producto.id,
          docente_id: docente!.id,
          horario: 'Lunes 10:00-12:00',
          activo: false, // INACTIVA
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/docentes/me/proxima-clase')
        .set('Cookie', cookies);

      // Assert: No debe encontrar comisiones (body vacío o null)
      expect(response.status).toBe(200);
      const isEmpty =
        response.body === null || Object.keys(response.body).length === 0;
      expect(isEmpty).toBe(true);
    });
  });

  // ============================================================================
  // INTEGRATION TESTS: GET /docentes/me/comisiones/:id (Endpoint 3)
  // ============================================================================
  describe('GET /api/docentes/me/comisiones/:id', () => {
    it('debe retornar detalle de comisión con estudiantes inscritos', async () => {
      // Arrange: Crear docente y loguearse
      const cookies = await createDocenteAndLogin(
        'docente-comision@example.com',
        'Password123!',
      );

      const producto = await createProducto();
      const docente = await prisma.docente.findUnique({
        where: { email: 'docente-comision@example.com' },
      });

      // Crear comisión
      const comision = await prisma.comision.create({
        data: {
          nombre: 'Turno Tarde',
          producto_id: producto.id,
          docente_id: docente!.id,
          horario: 'Martes 14:00',
          descripcion: 'Clases de matemáticas',
          cupo_maximo: 20,
          activo: true,
        },
      });

      // Crear tutor primero (requerido para estudiante)
      const tutor = await prisma.tutor.create({
        data: {
          email: 'tutor-detalle@test.com',
          password_hash: 'hash123',
          nombre: 'Tutor',
          apellido: 'Test',
        },
      });

      // Crear estudiante e inscribirlo
      const estudiante = await prisma.estudiante.create({
        data: {
          username: 'juan_perez_detalle',
          nombre: 'Juan',
          apellido: 'Pérez',
          email: 'juan-detalle@test.com',
          password_hash: 'hash123',
          nivelEscolar: 'Primaria',
          edad: 10,
          tutor_id: tutor.id,
        },
      });

      await prisma.inscripcionComision.create({
        data: {
          comision_id: comision.id,
          estudiante_id: estudiante.id,
          estado: 'Confirmada',
        },
      });

      // Act: Llamar al endpoint
      const response = await request(app.getHttpServer())
        .get(`/api/docentes/me/comisiones/${comision.id}`)
        .set('Cookie', cookies);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', comision.id);
      expect(response.body).toHaveProperty('nombre', 'Turno Tarde');
      expect(response.body).toHaveProperty('estudiantes');
      expect(response.body.estudiantes).toHaveLength(1);
      expect(response.body.estudiantes[0]).toHaveProperty('nombre', 'Juan');
      expect(response.body.estudiantes[0]).toHaveProperty('apellido', 'Pérez');
      expect(response.body.estudiantes[0]).toHaveProperty(
        'estado',
        'Confirmada',
      );
    });

    it('debe incluir producto y casa en el detalle', async () => {
      // Arrange
      const cookies = await createDocenteAndLogin(
        'docente-prod@example.com',
        'Password123!',
      );

      const producto = await createProducto();
      const docente = await prisma.docente.findUnique({
        where: { email: 'docente-prod@example.com' },
      });

      // Obtener o crear casa (usar helper para evitar unique constraint)
      const casa = await getOrCreateCasa();

      // Crear comisión con casa
      const comision = await prisma.comision.create({
        data: {
          nombre: 'Comisión QUANTUM',
          producto_id: producto.id,
          docente_id: docente!.id,
          casa_id: casa.id,
          activo: true,
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .get(`/api/docentes/me/comisiones/${comision.id}`)
        .set('Cookie', cookies);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('producto');
      expect(response.body.producto).toHaveProperty('id', producto.id);
      expect(response.body.producto).toHaveProperty(
        'nombre',
        'Curso de Matemáticas',
      );
      expect(response.body).toHaveProperty('casa');
      expect(response.body.casa).toHaveProperty('id', casa.id);
      expect(response.body.casa).toHaveProperty('nombre', 'Quantum');
      expect(response.body.casa).toHaveProperty('emoji', '⚡');
    });

    it('debe retornar error si la comisión no existe', async () => {
      // Arrange
      const cookies = await createDocenteAndLogin(
        'docente-noexiste@example.com',
        'Password123!',
      );

      // Act: Intentar acceder a comisión inexistente
      const response = await request(app.getHttpServer())
        .get('/api/docentes/me/comisiones/comision-inexistente-123')
        .set('Cookie', cookies);

      // Assert: Debe retornar error (400 por ID inválido o 500 por no encontrado)
      expect([400, 500]).toContain(response.status);
    });

    it('debe retornar error si la comisión pertenece a otro docente', async () => {
      // Arrange: Crear primer docente y loguearse
      const cookies1 = await createDocenteAndLogin(
        'docente1-ownership@example.com',
        'Password123!',
      );

      // Crear segundo docente directamente
      const passwordHash = await bcrypt.hash('Password123!', 10);
      const docente2 = await prisma.docente.create({
        data: {
          email: 'docente2-ownership@example.com',
          password_hash: passwordHash,
          nombre: 'Otro',
          apellido: 'Docente',
        },
      });

      const producto = await createProducto();

      // Crear comisión del docente 2
      const comision = await prisma.comision.create({
        data: {
          nombre: 'Comisión de Otro',
          producto_id: producto.id,
          docente_id: docente2.id,
          activo: true,
        },
      });

      // Act: Docente 1 intenta acceder a comisión de docente 2
      const response = await request(app.getHttpServer())
        .get(`/api/docentes/me/comisiones/${comision.id}`)
        .set('Cookie', cookies1);

      // Assert: Debe retornar error (500 por "no encontrada o no tienes acceso")
      expect(response.status).toBe(500);
    });

    it('debe retornar 401 sin autenticación', async () => {
      // Act
      const response = await request(app.getHttpServer()).get(
        '/api/docentes/me/comisiones/any-id',
      );

      // Assert
      expect(response.status).toBe(401);
    });

    it('debe retornar 403 si el usuario no es docente', async () => {
      // Arrange: Crear tutor
      await request(app.getHttpServer()).post('/api/auth/register').send({
        email: 'tutor-comision-forbidden@example.com',
        password: 'Password123!',
        nombre: 'Tutor',
        apellido: 'Test',
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'tutor-comision-forbidden@example.com',
          password: 'Password123!',
        });

      const cookies = loginResponse.headers['set-cookie'];

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/docentes/me/comisiones/any-id')
        .set('Cookie', cookies);

      // Assert
      expect(response.status).toBe(403);
    });

    it('debe filtrar inscripciones canceladas', async () => {
      // Arrange
      const cookies = await createDocenteAndLogin(
        'docente-filter@example.com',
        'Password123!',
      );

      const producto = await createProducto();
      const docente = await prisma.docente.findUnique({
        where: { email: 'docente-filter@example.com' },
      });

      const comision = await prisma.comision.create({
        data: {
          nombre: 'Comisión Filtro',
          producto_id: producto.id,
          docente_id: docente!.id,
          activo: true,
        },
      });

      // Crear tutor para estudiantes
      const tutorFilter = await prisma.tutor.create({
        data: {
          email: 'tutor-filter-unique@test.com',
          password_hash: 'hash',
          nombre: 'Tutor',
          apellido: 'Filter',
        },
      });

      // Crear estudiantes
      const estudianteConfirmado = await prisma.estudiante.create({
        data: {
          username: 'confirmado_filter_test',
          nombre: 'Confirmado',
          apellido: 'Est',
          email: 'confirmado-filter@test.com',
          password_hash: 'hash',
          nivelEscolar: 'Primaria',
          edad: 10,
          tutor_id: tutorFilter.id,
        },
      });

      const estudianteCancelado = await prisma.estudiante.create({
        data: {
          username: 'cancelado_filter_test',
          nombre: 'Cancelado',
          apellido: 'Est',
          email: 'cancelado-filter@test.com',
          password_hash: 'hash',
          nivelEscolar: 'Primaria',
          edad: 11,
          tutor_id: tutorFilter.id,
        },
      });

      // Inscribir estudiantes con diferentes estados
      await prisma.inscripcionComision.createMany({
        data: [
          {
            comision_id: comision.id,
            estudiante_id: estudianteConfirmado.id,
            estado: 'Confirmada',
          },
          {
            comision_id: comision.id,
            estudiante_id: estudianteCancelado.id,
            estado: 'Cancelada', // Este NO debe aparecer
          },
        ],
      });

      // Act
      const response = await request(app.getHttpServer())
        .get(`/api/docentes/me/comisiones/${comision.id}`)
        .set('Cookie', cookies);

      // Assert: Solo debe aparecer el confirmado
      expect(response.status).toBe(200);
      expect(response.body.estudiantes).toHaveLength(1);
      expect(response.body.estudiantes[0].nombre).toBe('Confirmado');
    });
  });
});
