import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ColoniaModule } from '../colonia.module';
import { ColoniaService } from '../colonia.service';
import { CreateInscriptionDto } from '../dto/create-inscription.dto';
import * as bcrypt from 'bcrypt';

/**
 * Integration Tests para Colonia de Verano 2026
 *
 * Estos tests verifican la integración completa entre:
 * - Controller → Service → Repository (Prisma)
 * - Validaciones de DTOs
 * - Transacciones de base de datos
 * - Flujo completo de inscripción
 *
 * IMPORTANTE: Estos tests requieren acceso a una base de datos de test
 * y pueden ser más lentos que los unit tests.
 */

describe.skip('Colonia Inscription Flow - Integration Tests (REQUIRES DB)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  const createValidDto = (): CreateInscriptionDto => ({
    nombre: 'Carlos García',
    email: `test-${Date.now()}@example.com`, // Email único para cada test
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
      imports: [ColoniaModule],
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
          startsWith: 'test-',
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

  describe('Flujo completo de inscripción', () => {
    it('debe crear una inscripción completa con tutor, estudiante y pago', async () => {
      // Arrange
      const dto = createValidDto();
      const coloniaService = app.get(ColoniaService);

      // Act
      const result = await coloniaService.createInscription(dto);

      // Assert - Verificar respuesta
      expect(result).toBeDefined();
      expect(result.tutorId).toBeDefined();
      expect(result.inscriptionId).toBeDefined();
      expect(result.estudiantes).toHaveLength(1);
      expect(result.pago).toBeDefined();
      expect(result.pago.mercadoPagoUrl).toContain('mercadopago');

      // Assert - Verificar que se creó en la base de datos
      const tutorInDB = await prisma.tutor.findUnique({
        where: { id: result.tutorId },
      });
      expect(tutorInDB).toBeDefined();
      expect(tutorInDB.email).toBe(dto.email);

      const estudianteInDB = await prisma.estudiante.findFirst({
        where: { tutor_id: result.tutorId },
      });
      expect(estudianteInDB).toBeDefined();
      expect(estudianteInDB.nombre).toBe(dto.estudiantes[0].nombre);

      const inscriptionInDB = await prisma.coloniaInscription.findUnique({
        where: { id: result.inscriptionId },
      });
      expect(inscriptionInDB).toBeDefined();
      expect(inscriptionInDB.tutorId).toBe(result.tutorId);
    });

    it('debe hashear la contraseña del tutor correctamente', async () => {
      // Arrange
      const dto = createValidDto();
      const plainPassword = dto.password;
      const coloniaService = app.get(ColoniaService);

      // Act
      const result = await coloniaService.createInscription(dto);

      // Assert - Verificar que la contraseña está hasheada
      const tutorInDB = await prisma.tutor.findUnique({
        where: { id: result.tutorId },
      });

      expect(tutorInDB.password_hash).toBeDefined();
      expect(tutorInDB.password_hash).not.toBe(plainPassword);

      // Verificar que el hash es válido con bcrypt
      const isValidPassword = await bcrypt.compare(
        plainPassword,
        tutorInDB.password_hash,
      );
      expect(isValidPassword).toBe(true);
    });

    it('debe generar username y PIN únicos para cada estudiante', async () => {
      // Arrange
      const dto = createValidDto();
      dto.estudiantes.push({
        nombre: 'María González',
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
      });
      const coloniaService = app.get(ColoniaService);

      // Act
      const result = await coloniaService.createInscription(dto);

      // Assert
      expect(result.estudiantes).toHaveLength(2);

      const username1 = result.estudiantes[0].username;
      const username2 = result.estudiantes[1].username;
      const pin1 = result.estudiantes[0].pin;
      const pin2 = result.estudiantes[1].pin;

      // Usernames deben ser diferentes
      expect(username1).not.toBe(username2);

      // PINs deben ser diferentes
      expect(pin1).not.toBe(pin2);

      // PINs deben ser de 4 dígitos
      expect(pin1).toMatch(/^\d{4}$/);
      expect(pin2).toMatch(/^\d{4}$/);
    });

    it('debe calcular correctamente el descuento según cantidad de estudiantes y cursos', async () => {
      // Arrange
      const dto = createValidDto();
      // 2 estudiantes con múltiples cursos = 20% descuento
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
            {
              id: 'dep-futbol',
              name: 'Fútbol',
              area: 'Deportes',
              instructor: 'Carlos',
              dayOfWeek: 'Martes',
              timeSlot: '14:00',
              color: '#AAA',
              icon: '⚽',
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
              dayOfWeek: 'Miércoles',
              timeSlot: '11:00',
              color: '#BBB',
              icon: '🎨',
            },
          ],
        },
      ];
      const coloniaService = app.get(ColoniaService);

      // Act
      const result = await coloniaService.createInscription(dto);

      // Assert
      expect(result.pago.descuento).toBe(20);

      // Verificar en DB
      const inscriptionInDB = await prisma.coloniaInscription.findUnique({
        where: { id: result.inscriptionId },
      });
      expect(inscriptionInDB.descuento).toBe(20);
    });
  });

  describe('Validaciones y manejo de errores', () => {
    it('debe rechazar email duplicado con ConflictException', async () => {
      // Arrange
      const dto = createValidDto();
      const coloniaService = app.get(ColoniaService);

      // Crear primera inscripción
      await coloniaService.createInscription(dto);

      // Act & Assert - Intentar crear segunda inscripción con el mismo email
      await expect(
        coloniaService.createInscription(dto),
      ).rejects.toThrow('Ya existe un tutor registrado con este email');
    });

    it('debe revertir toda la transacción si falla la creación de estudiante', async () => {
      // Arrange
      const dto = createValidDto();
      const coloniaService = app.get(ColoniaService);

      // Forzar un error en la edad (fuera del rango permitido) para que falle la transacción
      dto.estudiantes[0].edad = 99; // Fuera del rango 6-12

      // Act & Assert
      await expect(
        coloniaService.createInscription(dto),
      ).rejects.toThrow();

      // Verificar que NO se creó el tutor en la base de datos
      const tutorInDB = await prisma.tutor.findUnique({
        where: { email: dto.email },
      });
      expect(tutorInDB).toBeNull();
    });

    it('debe validar que el PIN sea único en la base de datos', async () => {
      // Arrange
      const dto1 = createValidDto();
      const dto2 = createValidDto();
      const coloniaService = app.get(ColoniaService);

      // Act - Crear dos inscripciones
      const result1 = await coloniaService.createInscription(dto1);
      const result2 = await coloniaService.createInscription(dto2);

      // Assert - PINs deben ser diferentes
      const pin1 = result1.estudiantes[0].pin;
      const pin2 = result2.estudiantes[0].pin;

      expect(pin1).not.toBe(pin2);

      // Verificar unicidad en la base de datos
      const estudiantes = await prisma.estudiante.findMany({
        where: {
          OR: [
            { pin: pin1 },
            { pin: pin2 },
          ],
        },
      });

      const pins = estudiantes.map((e) => e.pin);
      const uniquePins = new Set(pins);

      expect(pins.length).toBe(uniquePins.size); // No debe haber duplicados
    });
  });

  describe('Integración con MercadoPago', () => {
    it('debe generar URL de MercadoPago válida', async () => {
      // Arrange
      const dto = createValidDto();
      const coloniaService = app.get(ColoniaService);

      // Act
      const result = await coloniaService.createInscription(dto);

      // Assert
      expect(result.pago.mercadoPagoUrl).toBeDefined();
      expect(result.pago.mercadoPagoUrl).toContain('mercadopago');
      expect(result.pago.mercadoPagoUrl).toContain('pref_id');

      // Verificar que la URL sea válida (formato)
      expect(() => new URL(result.pago.mercadoPagoUrl)).not.toThrow();
    });
  });
});
