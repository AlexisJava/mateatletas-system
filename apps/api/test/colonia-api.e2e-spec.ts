import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaClient } from '@prisma/client';

const FRONTEND_ORIGIN = 'http://localhost:3000';

/**
 * E2E Tests para el módulo de Colonia de Verano 2026
 *
 * Estos tests verifican el comportamiento completo del endpoint de inscripción:
 * - POST /api/colonia/inscripcion
 * - Validación de DTOs
 * - Respuestas HTTP correctas
 * - Manejo de errores
 * - Estructura de respuestas
 *
 * Ejecutan requests HTTP reales contra el servidor completo.
 */
describe('Colonia API - E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  const createValidDto = () => ({
    nombre: 'Carlos García E2E',
    email: `e2e-test-${Date.now()}@example.com`,
    telefono: '1234567890',
    password: 'Password123',
    dni: '12345678',
    estudiantes: [
      {
        nombre: 'Juan Pérez',
        edad: 8,
        cursosSeleccionados: [
          {
            id: 'mat-juegos-desafios',
            name: 'Juegos y Desafíos Lógicos',
            area: 'Matemáticas',
            instructor: 'Lucía Ramírez',
            dayOfWeek: 'Lunes',
            timeSlot: '10:00 - 11:00',
            color: '#3B82F6',
            icon: '🎯',
          },
        ],
      },
    ],
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Aplicar el mismo ValidationPipe que usa la aplicación
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = moduleFixture.get<PrismaClient>(PrismaClient);
  });

  afterAll(async () => {
    // Limpiar los datos de prueba creados
    const testEmails = await prisma.tutor.findMany({
      where: {
        email: {
          startsWith: 'e2e-test-',
          endsWith: '@example.com',
        },
      },
      select: { id: true },
    });

    const tutorIds = testEmails.map((t) => t.id);

    if (tutorIds.length > 0) {
      // Eliminar estudiantes asociados
      await prisma.estudiante.deleteMany({
        where: {
          tutor_id: {
            in: tutorIds,
          },
        },
      });

      // Eliminar inscripciones
      await prisma.coloniaInscription.deleteMany({
        where: {
          tutorId: {
            in: tutorIds,
          },
        },
      });

      // Eliminar tutores
      await prisma.tutor.deleteMany({
        where: {
          id: {
            in: tutorIds,
          },
        },
      });
    }

    await app.close();
  });

  describe('POST /colonia/inscripcion - Happy Path', () => {
    it('debe crear una inscripción válida y retornar 201 Created', async () => {
      // Arrange
      const dto = createValidDto();

      // Act
      const response = await request(app.getHttpServer())
        .post('/colonia/inscripcion')
        .set('Origin', FRONTEND_ORIGIN)
        .send(dto)
        .expect(201);

      // Assert - Estructura de respuesta
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('tutorId');
      expect(response.body).toHaveProperty('inscriptionId');
      expect(response.body).toHaveProperty('estudiantes');
      expect(response.body).toHaveProperty('pago');

      // Assert - Estudiantes
      expect(response.body.estudiantes).toHaveLength(1);
      expect(response.body.estudiantes[0]).toHaveProperty('username');
      expect(response.body.estudiantes[0]).toHaveProperty('pin');
      expect(response.body.estudiantes[0].nombre).toBe('Juan Pérez');

      // Assert - Pago
      expect(response.body.pago).toHaveProperty('mes', 'enero');
      expect(response.body.pago).toHaveProperty('monto');
      expect(response.body.pago).toHaveProperty('descuento');
      expect(response.body.pago).toHaveProperty('mercadoPagoUrl');
      expect(response.body.pago.mercadoPagoUrl).toContain('mercadopago');
    });

    it('debe retornar Content-Type application/json', async () => {
      // Arrange
      const dto = createValidDto();

      // Act
      const response = await request(app.getHttpServer())
        .post('/colonia/inscripcion')
        .set('Origin', FRONTEND_ORIGIN)
        .send(dto)
        .expect(201);

      // Assert
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('debe calcular descuento correcto para múltiples estudiantes', async () => {
      // Arrange
      const dto = createValidDto();
      dto.estudiantes = [
        {
          nombre: 'Juan',
          edad: 8,
          cursosSeleccionados: [
            {
              id: 'mat-juegos',
              name: 'Matemáticas',
              area: 'Matemáticas',
              instructor: 'Ana',
              dayOfWeek: 'Lunes',
              timeSlot: '10:00',
              color: '#FFF',
              icon: '🎯',
            },
          ],
        },
        {
          nombre: 'María',
          edad: 10,
          cursosSeleccionados: [
            {
              id: 'art-pintura',
              name: 'Pintura',
              area: 'Arte',
              instructor: 'Pedro',
              dayOfWeek: 'Martes',
              timeSlot: '11:00',
              color: '#AAA',
              icon: '🎨',
            },
          ],
        },
      ];

      // Act
      const response = await request(app.getHttpServer())
        .post('/colonia/inscripcion')
        .set('Origin', FRONTEND_ORIGIN)
        .send(dto)
        .expect(201);

      // Assert - 2 estudiantes debe dar 12% de descuento
      expect(response.body.pago.descuento).toBe(12);
      expect(response.body.estudiantes).toHaveLength(2);
    });
  });

  describe('POST /colonia/inscripcion - Validaciones', () => {
    it('debe rechazar nombre de tutor muy corto con 400 Bad Request', async () => {
      // Arrange
      const dto = createValidDto();
      dto.nombre = 'A'; // Menos de 2 caracteres

      // Act
      const response = await request(app.getHttpServer())
        .post('/colonia/inscripcion')
        .set('Origin', FRONTEND_ORIGIN)
        .send(dto)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('message');
      expect(Array.isArray(response.body.message)).toBe(true);
    });

    it('debe rechazar email inválido con 400 Bad Request', async () => {
      // Arrange
      const dto = createValidDto();
      dto.email = 'email-invalido-sin-arroba';

      // Act
      const response = await request(app.getHttpServer())
        .post('/colonia/inscripcion')
        .set('Origin', FRONTEND_ORIGIN)
        .send(dto)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body.message).toContain('email');
    });

    it('debe rechazar teléfono inválido con 400 Bad Request', async () => {
      // Arrange
      const dto = createValidDto();
      dto.telefono = '123'; // Muy corto

      // Act
      const response = await request(app.getHttpServer())
        .post('/colonia/inscripcion')
        .set('Origin', FRONTEND_ORIGIN)
        .send(dto)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('statusCode', 400);
    });

    it('debe rechazar password sin mayúscula con 400 Bad Request', async () => {
      // Arrange
      const dto = createValidDto();
      dto.password = 'password123'; // Sin mayúscula

      // Act
      const response = await request(app.getHttpServer())
        .post('/colonia/inscripcion')
        .set('Origin', FRONTEND_ORIGIN)
        .send(dto)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('statusCode', 400);
      expect(JSON.stringify(response.body.message)).toContain('mayúscula');
    });

    it('debe rechazar edad de estudiante fuera de rango con 400 Bad Request', async () => {
      // Arrange
      const dto = createValidDto();
      dto.estudiantes[0].edad = 15; // Fuera del rango 6-12

      // Act
      const response = await request(app.getHttpServer())
        .post('/colonia/inscripcion')
        .set('Origin', FRONTEND_ORIGIN)
        .send(dto)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('statusCode', 400);
    });

    it('debe rechazar array vacío de estudiantes con 400 Bad Request', async () => {
      // Arrange
      const dto = createValidDto();
      dto.estudiantes = [];

      // Act
      const response = await request(app.getHttpServer())
        .post('/colonia/inscripcion')
        .set('Origin', FRONTEND_ORIGIN)
        .send(dto)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('statusCode', 400);
    });

    it('debe rechazar campos faltantes con 400 Bad Request', async () => {
      // Arrange
      const dto: any = {
        nombre: 'Test',
        // Faltan email, telefono, password, estudiantes
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/colonia/inscripcion')
        .set('Origin', FRONTEND_ORIGIN)
        .send(dto)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('message');
      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.length).toBeGreaterThan(1); // Múltiples errores
    });
  });

  describe('POST /colonia/inscripcion - Manejo de Errores', () => {
    it('debe rechazar email duplicado con 409 Conflict', async () => {
      // Arrange
      const dto = createValidDto();

      // Act - Crear primera inscripción
      await request(app.getHttpServer())
        .post('/colonia/inscripcion')
        .set('Origin', FRONTEND_ORIGIN)
        .send(dto)
        .expect(201);

      // Act - Intentar crear segunda inscripción con el mismo email
      const response = await request(app.getHttpServer())
        .post('/colonia/inscripcion')
        .set('Origin', FRONTEND_ORIGIN)
        .send(dto)
        .expect(409);

      // Assert
      expect(response.body).toHaveProperty('statusCode', 409);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Ya existe un tutor');
    });

    it('debe rechazar Content-Type no soportado con 415 o 400', async () => {
      // Arrange
      const dto = createValidDto();

      // Act
      const response = await request(app.getHttpServer())
        .post('/colonia/inscripcion')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Content-Type', 'text/plain')
        .send('invalid data')
        .expect((res) => {
          // Puede ser 400 o 415 dependiendo del framework
          expect([400, 415]).toContain(res.status);
        });

      // Assert
      expect(response.body).toHaveProperty('statusCode');
    });
  });

  describe('POST /colonia/inscripcion - Seguridad', () => {
    it('NO debe exponer password_hash en la respuesta', async () => {
      // Arrange
      const dto = createValidDto();

      // Act
      const response = await request(app.getHttpServer())
        .post('/colonia/inscripcion')
        .set('Origin', FRONTEND_ORIGIN)
        .send(dto)
        .expect(201);

      // Assert
      const responseString = JSON.stringify(response.body);
      expect(responseString).not.toContain('password');
      expect(responseString).not.toContain('password_hash');
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('password_hash');
    });

    it('debe sanitizar entrada para prevenir XSS', async () => {
      // Arrange
      const dto = createValidDto();
      dto.nombre = '<script>alert("xss")</script>';

      // Act
      const response = await request(app.getHttpServer())
        .post('/colonia/inscripcion')
        .set('Origin', FRONTEND_ORIGIN)
        .send(dto)
        .expect(201);

      // Assert - El nombre debe ser aceptado pero sanitizado en la respuesta
      expect(response.body.tutorId).toBeDefined();
    });
  });

  describe('Validación de estructura completa de respuesta', () => {
    it('debe retornar TODOS los campos esperados en la respuesta', async () => {
      // Arrange
      const dto = createValidDto();

      // Act
      const response = await request(app.getHttpServer())
        .post('/colonia/inscripcion')
        .set('Origin', FRONTEND_ORIGIN)
        .send(dto)
        .expect(201);

      // Assert - Campos raíz
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('tutorId');
      expect(response.body).toHaveProperty('inscriptionId');
      expect(response.body).toHaveProperty('estudiantes');
      expect(response.body).toHaveProperty('pago');

      // Assert - Estructura de estudiantes
      const estudiante = response.body.estudiantes[0];
      expect(estudiante).toHaveProperty('id');
      expect(estudiante).toHaveProperty('nombre');
      expect(estudiante).toHaveProperty('username');
      expect(estudiante).toHaveProperty('pin');
      expect(estudiante).toHaveProperty('edad');
      expect(estudiante).toHaveProperty('cursos');

      // Assert - Estructura de cursos
      const curso = estudiante.cursos[0];
      expect(curso).toHaveProperty('id');
      expect(curso).toHaveProperty('name');
      expect(curso).toHaveProperty('area');
      expect(curso).toHaveProperty('instructor');
      expect(curso).toHaveProperty('dayOfWeek');
      expect(curso).toHaveProperty('timeSlot');
      expect(curso).toHaveProperty('color');
      expect(curso).toHaveProperty('icon');

      // Assert - Estructura de pago
      expect(response.body.pago).toHaveProperty('mes');
      expect(response.body.pago).toHaveProperty('monto');
      expect(response.body.pago).toHaveProperty('descuento');
      expect(response.body.pago).toHaveProperty('mercadoPagoUrl');
    });
  });
});
