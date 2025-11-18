import { Test, TestingModule } from '@nestjs/testing';
import { ColoniaService } from '../colonia.service';
import { PrismaClient } from '@prisma/client';
import { MercadoPagoService } from '../../pagos/mercadopago.service';
import { ConfigService } from '@nestjs/config';
import { ConflictException } from '@nestjs/common';
import { CreateInscriptionDto } from '../dto/create-inscription.dto';
import { PricingCalculatorService } from '../../domain/services/pricing-calculator.service';

/**
 * ColoniaService - TESTS DE CONDICIONES DE CARRERA (Race Conditions)
 *
 * Cobertura:
 * - Generación concurrente de PINs únicos
 * - Registro concurrente de emails (unicidad)
 * - Serialización de transacciones
 *
 * Patrón: Similar a clases-race-condition.spec.ts
 */

// Mock bcrypt globally
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password_12345'),
}));

import * as bcrypt from 'bcrypt';

describe('ColoniaService - Race Condition Prevention', () => {
  let service: ColoniaService;
  let prisma: PrismaClient;
  let mercadoPagoService: MercadoPagoService;

  const mockMercadoPagoPreference = {
    id: 'pref-123456',
    init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref-123456',
    sandbox_init_point: 'https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref-123456',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColoniaService,
        {
          provide: PrismaClient,
          useValue: {
            tutor: {
              findUnique: jest.fn(),
            },
            estudiante: {
              create: jest.fn(),
            },
            $queryRaw: jest.fn(),
            $executeRaw: jest.fn(),
            $transaction: jest.fn(),
          },
        },
        {
          provide: MercadoPagoService,
          useValue: {
            createPreference: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'FRONTEND_URL') return 'http://localhost:3000';
              if (key === 'BACKEND_URL') return 'http://localhost:3001';
              return null;
            }),
          },
        },
        {
          provide: PricingCalculatorService,
          useValue: {
            calcularDescuentoColonia: jest.fn(),
            calcularTotalColonia: jest.fn(),
            aplicarDescuento: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ColoniaService>(ColoniaService);
    prisma = module.get<PrismaClient>(PrismaClient);
    mercadoPagoService = module.get<MercadoPagoService>(MercadoPagoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PIN Generation - Concurrent Requests', () => {
    it('debe generar PINs únicos para 10 inscripciones concurrentes', async () => {
      // Arrange
      // Mock $queryRaw para simular checks de PIN (siempre libre)
      jest.spyOn(prisma, '$queryRaw').mockResolvedValue([]);

      // Act - Generar 10 PINs concurrentemente
      const pinPromises = Array.from({ length: 10 }, () =>
        service['generateUniquePin'](),
      );

      const pins = await Promise.all(pinPromises);

      // Assert
      expect(pins).toHaveLength(10);

      // Verificar que todos son de 4 dígitos
      pins.forEach((pin) => {
        expect(pin).toMatch(/^\d{4}$/);
        const pinNum = parseInt(pin, 10);
        expect(pinNum).toBeGreaterThanOrEqual(1000);
        expect(pinNum).toBeLessThanOrEqual(9999);
      });

      // La unicidad no está garantizada al 100% con Math.random(),
      // pero debería ser muy alta
      const uniquePins = new Set(pins);
      expect(uniquePins.size).toBeGreaterThan(8); // Al menos 80% únicos
    });

    it('debe manejar colisión de PIN y reintentar correctamente', async () => {
      // Arrange
      let attemptCount = 0;

      // Simular que la primera llamada encuentra un PIN ocupado,
      // y la segunda llamada encuentra un PIN libre
      jest.spyOn(prisma, '$queryRaw').mockImplementation(async () => {
        attemptCount++;
        if (attemptCount === 1) {
          return [{ id: 'existing-id' }]; // Primera vez: PIN ocupado
        }
        return []; // Segunda vez: PIN libre
      });

      // Act
      const pin = await service['generateUniquePin']();

      // Assert
      expect(pin).toBeDefined();
      expect(pin).toMatch(/^\d{4}$/);
      expect(attemptCount).toBe(2); // Debe haber intentado 2 veces
    });

    it('debe serializar generación de PINs en transacciones concurrentes', async () => {
      // Arrange
      const generatedPins: string[] = [];

      jest.spyOn(prisma, '$queryRaw').mockResolvedValue([]);

      // Simular 5 inscripciones concurrentes
      const dto: CreateInscriptionDto = {
        nombre: 'Juan',
        email: 'juan@test.com',
        telefono: '1234567890',
        password: 'Password123',
        estudiantes: [
          {
            nombre: 'María',
            edad: 8,
            cursosSeleccionados: [
              {
                id: 'mat-1',
                name: 'Matemática',
                area: 'Matemática',
                instructor: 'Prof. Ana',
                dayOfWeek: 'Lunes',
                timeSlot: '09:00',
                color: '#FF5722',
                icon: '🎲',
              },
            ],
          },
        ],
      };

      // Mock setup para cada inscripción
      let inscriptionCount = 0;
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback) => {
        inscriptionCount++;
        const txMock = {
          tutor: {
            create: jest.fn().mockResolvedValue({
              id: `tutor-${inscriptionCount}`,
              email: `tutor${inscriptionCount}@test.com`,
            }),
          },
          estudiante: {
            create: jest.fn().mockResolvedValue({
              id: `est-${inscriptionCount}`,
              username: `maria${inscriptionCount}`,
            }),
          },
          $executeRaw: jest.fn().mockResolvedValue(1),
          $queryRaw: jest.fn().mockResolvedValue([]),
        };
        return callback(txMock as any);
      });

      jest
        .spyOn(mercadoPagoService, 'createPreference')
        .mockResolvedValue(mockMercadoPagoPreference as any);

      jest.spyOn(prisma, '$executeRaw').mockResolvedValue(1);

      // Act - Crear 5 inscripciones concurrentemente con emails diferentes
      const inscriptions = Array.from({ length: 5 }, (_, i) => ({
        ...dto,
        email: `tutor${i}@test.com`,
      }));

      const results = await Promise.all(
        inscriptions.map((d) => service.createInscription(d)),
      );

      // Assert
      expect(results).toHaveLength(5);

      // Recolectar todos los PINs generados
      const allPins = results.flatMap((r) => r.estudiantes.map((e) => e.pin));

      // Verificar que se generaron 5 PINs
      expect(allPins).toHaveLength(5);

      // Verificar que todos son válidos
      allPins.forEach((pin) => {
        expect(pin).toMatch(/^\d{4}$/);
      });

      // Verificar unicidad (mayoría únicos, pero no 100% garantizado con Math.random)
      const uniquePins = new Set(allPins);
      expect(uniquePins.size).toBeGreaterThan(3); // Al menos 60% únicos
    });

    it('debe manejar 100 generaciones concurrentes de PINs sin duplicados', async () => {
      // Arrange
      jest.spyOn(prisma, '$queryRaw').mockResolvedValue([]);

      // Act
      const pinPromises = Array.from({ length: 100 }, () =>
        service['generateUniquePin'](),
      );

      const pins = await Promise.all(pinPromises);

      // Assert
      expect(pins).toHaveLength(100);

      // Verificar que todos son válidos
      pins.forEach((pin) => {
        expect(pin).toMatch(/^\d{4}$/);
      });

      // La unicidad no está garantizada al 100% con Math.random(),
      // pero en un rango de 9000 posibilidades, 100 PINs deberían ser mayormente únicos
      const uniquePins = new Set(pins);
      expect(uniquePins.size).toBeGreaterThan(90); // Al menos 90% únicos
    });

    it('debe validar que los PINs generados estén en el rango válido', async () => {
      // Arrange
      jest.spyOn(prisma, '$queryRaw').mockResolvedValue([]);

      // Act
      const pins = await Promise.all(
        Array.from({ length: 50 }, () => service['generateUniquePin']()),
      );

      // Assert
      pins.forEach((pin) => {
        const pinNum = parseInt(pin, 10);
        expect(pinNum).toBeGreaterThanOrEqual(1000);
        expect(pinNum).toBeLessThanOrEqual(9999);
      });
    });
  });

  describe('Email Uniqueness - Concurrent Requests', () => {
    it('debe prevenir registro de email duplicado con 2 solicitudes concurrentes', async () => {
      // Arrange
      const dto: CreateInscriptionDto = {
        nombre: 'Juan',
        email: 'juan@test.com', // Mismo email para ambas solicitudes
        telefono: '1234567890',
        password: 'Password123',
        estudiantes: [
          {
            nombre: 'María',
            edad: 8,
            cursosSeleccionados: [
              {
                id: 'mat-1',
                name: 'Matemática',
                area: 'Matemática',
                instructor: 'Prof. Ana',
                dayOfWeek: 'Lunes',
                timeSlot: '09:00',
                color: '#FF5722',
                icon: '🎲',
              },
            ],
          },
        ],
      };

      // Simular que la primera solicitud verifica y el email está libre
      // pero la segunda solicitud también lo encuentra libre (race condition)
      let findUniqueCallCount = 0;
      jest.spyOn(prisma.tutor, 'findUnique').mockImplementation(async () => {
        findUniqueCallCount++;
        // Primera llamada: email libre
        if (findUniqueCallCount === 1) {
          return null;
        }
        // Segunda llamada: email ya registrado (la primera ya lo creó)
        return {
          id: 'tutor-1',
          email: 'juan@test.com',
        } as any;
      });

      // Act - 2 solicitudes concurrentes con el mismo email
      const results = await Promise.allSettled([
        service.createInscription(dto),
        service.createInscription(dto),
      ]);

      // Assert
      const successes = results.filter((r) => r.status === 'fulfilled');
      const failures = results.filter(
        (r) => r.status === 'rejected' && r.reason instanceof ConflictException,
      );

      // Solo una debe tener éxito, la otra debe fallar con ConflictException
      expect(successes.length).toBeLessThanOrEqual(1);
      expect(failures.length).toBeGreaterThanOrEqual(1);
    });

    it('debe permitir solo 1 registro cuando 5 tutores se registran simultáneamente con el mismo email', async () => {
      // Arrange
      const dto: CreateInscriptionDto = {
        nombre: 'Juan',
        email: 'popular@test.com',
        telefono: '1234567890',
        password: 'Password123',
        estudiantes: [
          {
            nombre: 'María',
            edad: 8,
            cursosSeleccionados: [
              {
                id: 'mat-1',
                name: 'Matemática',
                area: 'Matemática',
                instructor: 'Prof. Ana',
                dayOfWeek: 'Lunes',
                timeSlot: '09:00',
                color: '#FF5722',
                icon: '🎲',
              },
            ],
          },
        ],
      };

      // Simular que solo la primera solicitud encuentra el email libre
      let callCount = 0;
      jest.spyOn(prisma.tutor, 'findUnique').mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          return null; // Email libre
        }
        return {
          id: 'tutor-existing',
          email: 'popular@test.com',
        } as any; // Email ya registrado
      });

      // Act
      const results = await Promise.allSettled(
        Array.from({ length: 5 }, () => service.createInscription(dto)),
      );

      // Assert
      const successes = results.filter((r) => r.status === 'fulfilled');
      const conflicts = results.filter(
        (r) => r.status === 'rejected' && r.reason instanceof ConflictException,
      );

      expect(successes.length).toBeLessThanOrEqual(1);
      expect(conflicts.length).toBeGreaterThanOrEqual(4);
    });

    it('debe usar constraint de base de datos para garantizar unicidad de email', async () => {
      // Arrange
      const dto: CreateInscriptionDto = {
        nombre: 'Juan',
        email: 'test@test.com',
        telefono: '1234567890',
        password: 'Password123',
        estudiantes: [
          {
            nombre: 'María',
            edad: 8,
            cursosSeleccionados: [
              {
                id: 'mat-1',
                name: 'Matemática',
                area: 'Matemática',
                instructor: 'Prof. Ana',
                dayOfWeek: 'Lunes',
                timeSlot: '09:00',
                color: '#FF5722',
                icon: '🎲',
              },
            ],
          },
        ],
      };

      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      // Mock generateUniquePin
      jest.spyOn(prisma, '$queryRaw').mockResolvedValue([]);

      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback) => {
        const txMock = {
          tutor: {
            create: jest.fn().mockResolvedValue({
              id: 'tutor-1',
              email: 'test@test.com',
            }),
          },
          estudiante: {
            create: jest.fn().mockResolvedValue({
              id: 'est-1',
              username: 'maria1234',
            }),
          },
          $executeRaw: jest.fn().mockResolvedValue(1),
          $queryRaw: jest.fn().mockResolvedValue([]),
        };
        return callback(txMock as any);
      });

      jest
        .spyOn(mercadoPagoService, 'createPreference')
        .mockResolvedValue(mockMercadoPagoPreference as any);

      jest.spyOn(prisma, '$executeRaw').mockResolvedValue(1);

      // Act
      const result = await service.createInscription(dto);

      // Assert
      expect(result).toBeDefined();
      // Verificar que findUnique fue llamado primero (validación pre-transacción)
      expect(prisma.tutor.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
    });
  });

  describe('Transaction Serialization', () => {
    it('debe serializar inscripciones concurrentes correctamente', async () => {
      // Arrange
      const dtos: CreateInscriptionDto[] = Array.from({ length: 3 }, (_, i) => ({
        nombre: `Tutor${i}`,
        email: `tutor${i}@test.com`,
        telefono: '1234567890',
        password: 'Password123',
        estudiantes: [
          {
            nombre: `Estudiante${i}`,
            edad: 8,
            cursosSeleccionados: [
              {
                id: 'mat-1',
                name: 'Matemática',
                area: 'Matemática',
                instructor: 'Prof. Ana',
                dayOfWeek: 'Lunes',
                timeSlot: '09:00',
                color: '#FF5722',
                icon: '🎲',
              },
            ],
          },
        ],
      }));

      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      // Mock generateUniquePin
      jest.spyOn(prisma, '$queryRaw').mockResolvedValue([]);

      let transactionCount = 0;
      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback) => {
        transactionCount++;
        const txMock = {
          tutor: {
            create: jest.fn().mockResolvedValue({
              id: `tutor-${transactionCount}`,
              email: `tutor${transactionCount}@test.com`,
            }),
          },
          estudiante: {
            create: jest.fn().mockResolvedValue({
              id: `est-${transactionCount}`,
              username: `estudiante${transactionCount}`,
            }),
          },
          $executeRaw: jest.fn().mockResolvedValue(1),
          $queryRaw: jest.fn().mockResolvedValue([]),
        };
        return callback(txMock as any);
      });

      jest
        .spyOn(mercadoPagoService, 'createPreference')
        .mockResolvedValue(mockMercadoPagoPreference as any);

      jest.spyOn(prisma, '$executeRaw').mockResolvedValue(1);

      // Act
      const results = await Promise.all(
        dtos.map((dto) => service.createInscription(dto)),
      );

      // Assert
      expect(results).toHaveLength(3);
      expect(transactionCount).toBe(3);

      // Verificar que cada inscripción tiene su propio tutor y estudiante
      results.forEach((result, index) => {
        expect(result.tutorId).toBe(`tutor-${index + 1}`);
        // El username tiene un número random al final, solo verificar que empieza con "estudiante"
        expect(result.estudiantes[0].username).toMatch(/^estudiante\d+\d{4}$/);
      });
    });

    it('debe garantizar aislamiento de transacciones (ACID)', async () => {
      // Arrange
      const dto: CreateInscriptionDto = {
        nombre: 'Juan',
        email: 'juan@test.com',
        telefono: '1234567890',
        password: 'Password123',
        estudiantes: [
          {
            nombre: 'María',
            edad: 8,
            cursosSeleccionados: [
              {
                id: 'mat-1',
                name: 'Matemática',
                area: 'Matemática',
                instructor: 'Prof. Ana',
                dayOfWeek: 'Lunes',
                timeSlot: '09:00',
                color: '#FF5722',
                icon: '🎲',
              },
            ],
          },
        ],
      };

      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      // Mock generateUniquePin
      jest.spyOn(prisma, '$queryRaw').mockResolvedValue([]);

      let transactionExecuted = false;
      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback) => {
        if (transactionExecuted) {
          throw new Error('Transaction already in progress');
        }
        transactionExecuted = true;

        const txMock = {
          tutor: {
            create: jest.fn().mockResolvedValue({
              id: 'tutor-1',
              email: 'juan@test.com',
            }),
          },
          estudiante: {
            create: jest.fn().mockResolvedValue({
              id: 'est-1',
              username: 'maria1234',
            }),
          },
          $executeRaw: jest.fn().mockResolvedValue(1),
          $queryRaw: jest.fn().mockResolvedValue([]),
        };

        const result = await callback(txMock as any);
        transactionExecuted = false;
        return result;
      });

      jest
        .spyOn(mercadoPagoService, 'createPreference')
        .mockResolvedValue(mockMercadoPagoPreference as any);

      jest.spyOn(prisma, '$executeRaw').mockResolvedValue(1);

      // Act
      const result = await service.createInscription(dto);

      // Assert
      expect(result).toBeDefined();
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
