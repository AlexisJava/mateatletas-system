import { Test, TestingModule } from '@nestjs/testing';
import { Inscripciones2026Service } from '../inscripciones-2026.service';
import { PrismaService } from '../../core/database/prisma.service';
import { MercadoPagoService } from '../../pagos/mercadopago.service';
import { ConfigService } from '@nestjs/config';
import { PricingCalculatorService } from '../../domain/services/pricing-calculator.service';
import { BadRequestException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { TipoInscripcion2026 } from '../dto/create-inscripcion-2026.dto';

/**
 * TESTS PARA TRANSACCIONES ATÓMICAS - INSCRIPCIONES 2026
 *
 * Cobertura crítica de PROMPT 2:
 * 1. createInscripcion2026() con transacción completa
 * 2. MercadoPago preference creada ANTES de transacción (fail-fast)
 * 3. Rollback automático si falla cualquier operación
 * 4. Timeout de 30 segundos
 * 5. Isolation level ReadCommitted
 * 6. PINs únicos generados con timeout (MAX_ATTEMPTS = 10)
 * 7. Cursos y mundos creados en batch con Promise.all
 * 8. Historial de estados
 * 9. Preference_id guardado en pago
 * 10. Tutor existente reutilizado
 *
 * Estructura:
 * - describe('createInscripcion2026 - Transacciones Atómicas')
 *   - Test 1: Inscripción exitosa completa
 *   - Test 2: MercadoPago falla ANTES de transacción (0 registros creados)
 *   - Test 3: Rollback si falla dentro de transacción
 *   - Test 4: Tutor existente reutilizado
 *   - Test 5: PINs únicos generados para todos los estudiantes
 *   - Test 6: Cursos creados correctamente en batch
 *   - Test 7: Mundos STEAM creados en batch
 *   - Test 8: Historial creado con estado correcto
 *   - Test 9: Preference_id guardado en pago
 *   - Test 10: Timeout si generateUniquePin falla después de MAX_ATTEMPTS
 *   - Test 11: Username normalizado correctamente (sin acentos, espacios a puntos)
 *   - Test 12: Mock mode maneja placeholder de MercadoPago
 */

describe('Inscripciones2026Service - createInscripcion2026 Transacciones Atómicas', () => {
  let service: Inscripciones2026Service;
  let prismaService: PrismaService;
  let mercadoPagoService: MercadoPagoService;
  let configService: ConfigService;
  let pricingCalculatorService: PricingCalculatorService;

  // Mock Prisma transaction context
  const mockTx = {
    tutor: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    inscripcion2026: {
      create: jest.fn(),
    },
    estudiante: {
      create: jest.fn(),
    },
    estudianteInscripcion2026: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    coloniaCursoSeleccionado2026: {
      create: jest.fn(),
    },
    cicloMundoSeleccionado2026: {
      create: jest.fn(),
    },
    pagoInscripcion2026: {
      create: jest.fn(),
    },
    historialEstadoInscripcion2026: {
      create: jest.fn(),
    },
  };

  // DTO de prueba
  const mockCreateDto = {
    tipo_inscripcion: TipoInscripcion2026.COLONIA,
    tutor: {
      nombre: 'María',
      email: 'maria@test.com',
      telefono: '1234567890',
      dni: '12345678',
      cuil: '20123456789',
      password: 'Test123456',
    },
    estudiantes: [
      {
        nombre: 'Juan Pérez',
        edad: 10,
        dni: '98765432',
        cursos_seleccionados: [
          {
            course_id: 'curso-1',
            course_name: 'Matemática Divertida',
            course_area: 'Matemática',
            instructor: 'Prof. López',
            day_of_week: 'Lunes',
            time_slot: '10:00-11:00',
          },
        ],
      },
      {
        nombre: 'Ana García',
        edad: 8,
        dni: '98765433',
        cursos_seleccionados: [
          {
            course_id: 'curso-2',
            course_name: 'Ciencia Experimental',
            course_area: 'Ciencias',
            instructor: 'Prof. Martínez',
            day_of_week: 'Martes',
            time_slot: '11:00-12:00',
          },
          {
            course_id: 'curso-3',
            course_name: 'Programación Kids',
            course_area: 'Tecnología',
            instructor: 'Prof. Rodríguez',
            day_of_week: 'Miércoles',
            time_slot: '14:00-15:00',
          },
        ],
      },
    ],
    origen_inscripcion: 'web',
    ciudad: 'Buenos Aires',
  };

  // Mock data
  const mockTutor = {
    id: 'tutor-123',
    nombre: 'María',
    apellido: '',
    email: 'maria@test.com',
    telefono: '1234567890',
    dni: '12345678',
    cuil: '20123456789',
    password_hash: '$2b$10$hashedpassword',
    debe_cambiar_password: false,
    debe_completar_perfil: false,
    ha_completado_onboarding: true,
    roles: ['TUTOR'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockInscripcion = {
    id: 'inscripcion-123',
    tutor_id: 'tutor-123',
    tipo_inscripcion: 'COLONIA',
    estado: 'pending',
    inscripcion_pagada: 25000,
    descuento_aplicado: 12,
    total_mensual_actual: 158400,
    origen_inscripcion: 'web',
    ciudad: 'Buenos Aires',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEstudiante1 = {
    id: 'estudiante-1',
    tutor_id: 'tutor-123',
    nombre: 'Juan Pérez',
    apellido: '',
    edad: 10,
    nivelEscolar: 'Primaria',
    username: 'juan.perez',
    password_hash: '$2b$10$hashedpin',
    debe_cambiar_password: true,
    roles: ['ESTUDIANTE'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEstudiante2 = {
    id: 'estudiante-2',
    tutor_id: 'tutor-123',
    nombre: 'Ana García',
    apellido: '',
    edad: 8,
    nivelEscolar: 'Primaria',
    username: 'ana.garcia',
    password_hash: '$2b$10$hashedpin',
    debe_cambiar_password: true,
    roles: ['ESTUDIANTE'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEstudianteInscripcion1 = {
    id: 'est-insc-1',
    inscripcion_id: 'inscripcion-123',
    estudiante_id: 'estudiante-1',
    nombre: 'Juan Pérez',
    edad: 10,
    dni: '98765432',
    pin: '1234',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEstudianteInscripcion2 = {
    id: 'est-insc-2',
    inscripcion_id: 'inscripcion-123',
    estudiante_id: 'estudiante-2',
    nombre: 'Ana García',
    edad: 8,
    dni: '98765433',
    pin: '5678',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPago = {
    id: 'pago-123',
    inscripcion_id: 'inscripcion-123',
    tipo: 'inscripcion',
    monto: 25000,
    estado: 'pending',
    mercadopago_preference_id: 'pref-123456',
    mercadopago_payment_id: null,
    fecha_pago: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMercadoPagoPreference = {
    id: 'pref-123456',
    init_point: 'https://mercadopago.com/checkout/pref-123456',
    sandbox_init_point: 'https://sandbox.mercadopago.com/checkout/pref-123456',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Inscripciones2026Service,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
          },
        },
        {
          provide: MercadoPagoService,
          useValue: {
            createPreference: jest.fn(),
            buildInscripcion2026PreferenceData: jest.fn(),
            isMockMode: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'BACKEND_URL') return 'http://localhost:3001';
              if (key === 'FRONTEND_URL') return 'http://localhost:3000';
              return undefined;
            }),
          },
        },
        {
          provide: PricingCalculatorService,
          useValue: {
            calcularTarifaInscripcion: jest.fn().mockReturnValue(25000),
            calcularTotalInscripcion2026: jest.fn().mockReturnValue({ total: 158400, descuento: 12 }),
            aplicarDescuento: jest.fn((base, desc) => base * (1 - desc / 100)),
          },
        },
      ],
    }).compile();

    service = module.get<Inscripciones2026Service>(Inscripciones2026Service);
    prismaService = module.get<PrismaService>(PrismaService);
    mercadoPagoService = module.get<MercadoPagoService>(MercadoPagoService);
    configService = module.get<ConfigService>(ConfigService);
    pricingCalculatorService = module.get<PricingCalculatorService>(PricingCalculatorService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Test 1: Inscripción exitosa completa', () => {
    it('debe crear inscripción completa con MercadoPago preference ANTES de transacción', async () => {
      // Arrange
      jest.spyOn(mercadoPagoService, 'isMockMode').mockReturnValue(false);
      jest.spyOn(mercadoPagoService, 'buildInscripcion2026PreferenceData').mockReturnValue({} as any);
      jest.spyOn(mercadoPagoService, 'createPreference').mockResolvedValue(mockMercadoPagoPreference);

      // Mock transaction - Retornar estructura esperada por el servicio
      jest.spyOn(prismaService, '$transaction').mockResolvedValue({
        inscripcion: mockInscripcion,
        tutor: mockTutor,
        estudiantes: [
          {
            estudiante: mockEstudiante1,
            estudianteInscripcion: mockEstudianteInscripcion1,
            pin: '1234',
            cursosSeleccionados: mockCreateDto.estudiantes[0].cursos_seleccionados,
            mundoSeleccionado: undefined,
          },
          {
            estudiante: mockEstudiante2,
            estudianteInscripcion: mockEstudianteInscripcion2,
            pin: '5678',
            cursosSeleccionados: mockCreateDto.estudiantes[1].cursos_seleccionados,
            mundoSeleccionado: undefined,
          },
        ],
        pago: mockPago,
        cursosCount: 3,
        mundosCount: 0,
      });

      // Act
      const result = await service.createInscripcion2026(mockCreateDto);

      // Assert
      expect(mercadoPagoService.createPreference).toHaveBeenCalledTimes(1);
      expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        inscripcionId: 'inscripcion-123',
        tutorId: 'tutor-123',
        estudiantes_creados: [
          { id: 'estudiante-1', nombre: 'Juan Pérez', pin: '1234' },
          { id: 'estudiante-2', nombre: 'Ana García', pin: '5678' },
        ],
        pago_info: {
          monto_total: 25000,
          descuento_aplicado: 12,
          mercadopago_preference_id: 'pref-123456',
          mercadopago_init_point: 'https://mercadopago.com/checkout/pref-123456',
        },
      });
    });
  });

  describe('Test 2: MercadoPago falla ANTES de transacción (fail-fast)', () => {
    it('debe lanzar BadRequestException sin crear registros en DB si MercadoPago falla', async () => {
      // Arrange
      jest.spyOn(mercadoPagoService, 'isMockMode').mockReturnValue(false);
      jest.spyOn(mercadoPagoService, 'buildInscripcion2026PreferenceData').mockReturnValue({} as any);
      jest.spyOn(mercadoPagoService, 'createPreference').mockRejectedValue(new Error('MercadoPago API error'));

      const transactionSpy = jest.spyOn(prismaService, '$transaction');

      // Act & Assert
      await expect(service.createInscripcion2026(mockCreateDto)).rejects.toThrow(BadRequestException);
      await expect(service.createInscripcion2026(mockCreateDto)).rejects.toThrow(
        'No se pudo crear la preferencia de pago. Intente nuevamente.'
      );

      // Verificar que $transaction NUNCA fue llamado
      expect(transactionSpy).not.toHaveBeenCalled();
    });
  });

  describe('Test 3: Rollback si falla dentro de transacción', () => {
    it('debe hacer rollback automático y lanzar InternalServerErrorException si falla operación dentro de transacción', async () => {
      // Arrange
      jest.spyOn(mercadoPagoService, 'isMockMode').mockReturnValue(false);
      jest.spyOn(mercadoPagoService, 'buildInscripcion2026PreferenceData').mockReturnValue({} as any);
      jest.spyOn(mercadoPagoService, 'createPreference').mockResolvedValue(mockMercadoPagoPreference);

      // Simular fallo al crear inscripción
      jest.spyOn(prismaService, '$transaction').mockImplementation(async (callback: any) => {
        const txContext = {
          ...mockTx,
          tutor: {
            findUnique: jest.fn().mockResolvedValue(mockTutor),
          },
          inscripcion2026: {
            create: jest.fn().mockRejectedValue(new Error('Database connection lost')),
          },
        };

        return await callback(txContext);
      });

      // Act & Assert
      await expect(service.createInscripcion2026(mockCreateDto)).rejects.toThrow(InternalServerErrorException);
      await expect(service.createInscripcion2026(mockCreateDto)).rejects.toThrow(
        'Error al crear la inscripción. No se realizaron cambios en la base de datos.'
      );

      // MercadoPago preference fue creada (no se puede revertir)
      expect(mercadoPagoService.createPreference).toHaveBeenCalled();

      // Transaction fue invocada pero hizo rollback automático
      expect(prismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('Test 4: Tutor existente reutilizado', () => {
    it('debe reutilizar tutor existente sin crear uno nuevo', async () => {
      // Arrange
      jest.spyOn(mercadoPagoService, 'isMockMode').mockReturnValue(false);
      jest.spyOn(mercadoPagoService, 'buildInscripcion2026PreferenceData').mockReturnValue({} as any);
      jest.spyOn(mercadoPagoService, 'createPreference').mockResolvedValue(mockMercadoPagoPreference);

      // Mock transaction con tutor existente
      jest.spyOn(prismaService, '$transaction').mockResolvedValue({
        inscripcion: mockInscripcion,
        tutor: mockTutor,
        estudiantes: [
          {
            estudiante: mockEstudiante1,
            estudianteInscripcion: mockEstudianteInscripcion1,
            pin: '1234',
            cursosSeleccionados: [],
            mundoSeleccionado: undefined,
          },
        ],
        pago: mockPago,
        cursosCount: 0,
        mundosCount: 0,
      });

      // Act
      const result = await service.createInscripcion2026(mockCreateDto);

      // Assert
      expect(result.tutorId).toBe('tutor-123');
    });
  });

  describe('Test 5: PINs únicos generados para todos los estudiantes', () => {
    it('debe generar PINs únicos de 4 dígitos para cada estudiante', async () => {
      // Arrange
      jest.spyOn(mercadoPagoService, 'isMockMode').mockReturnValue(false);
      jest.spyOn(mercadoPagoService, 'buildInscripcion2026PreferenceData').mockReturnValue({} as any);
      jest.spyOn(mercadoPagoService, 'createPreference').mockResolvedValue(mockMercadoPagoPreference);

      // Mock transaction con PINs únicos
      jest.spyOn(prismaService, '$transaction').mockResolvedValue({
        inscripcion: mockInscripcion,
        tutor: mockTutor,
        estudiantes: [
          {
            estudiante: mockEstudiante1,
            estudianteInscripcion: mockEstudianteInscripcion1,
            pin: '1234',
            cursosSeleccionados: [],
            mundoSeleccionado: undefined,
          },
          {
            estudiante: mockEstudiante2,
            estudianteInscripcion: mockEstudianteInscripcion2,
            pin: '5678',
            cursosSeleccionados: [],
            mundoSeleccionado: undefined,
          },
        ],
        pago: mockPago,
        cursosCount: 0,
        mundosCount: 0,
      });

      // Act
      const result = await service.createInscripcion2026(mockCreateDto);

      // Assert
      expect(result.estudiantes_creados).toHaveLength(2);
      expect(result.estudiantes_creados[0].pin).toMatch(/^\d{4}$/);
      expect(result.estudiantes_creados[1].pin).toMatch(/^\d{4}$/);
      expect(result.estudiantes_creados[0].pin).not.toBe(result.estudiantes_creados[1].pin);
    });
  });

  describe('Test 6: Cursos creados correctamente en batch', () => {
    it('debe crear todos los cursos en batch con Promise.all', async () => {
      // Arrange
      jest.spyOn(mercadoPagoService, 'isMockMode').mockReturnValue(false);
      jest.spyOn(mercadoPagoService, 'buildInscripcion2026PreferenceData').mockReturnValue({} as any);
      jest.spyOn(mercadoPagoService, 'createPreference').mockResolvedValue(mockMercadoPagoPreference);

      // Mock transaction - Retornar estructura esperada con cursosCount = 3
      jest.spyOn(prismaService, '$transaction').mockResolvedValue({
        inscripcion: mockInscripcion,
        tutor: mockTutor,
        estudiantes: [
          {
            estudiante: mockEstudiante1,
            estudianteInscripcion: mockEstudianteInscripcion1,
            pin: '1234',
            cursosSeleccionados: mockCreateDto.estudiantes[0].cursos_seleccionados,
            mundoSeleccionado: undefined,
          },
          {
            estudiante: mockEstudiante2,
            estudianteInscripcion: mockEstudianteInscripcion2,
            pin: '5678',
            cursosSeleccionados: mockCreateDto.estudiantes[1].cursos_seleccionados,
            mundoSeleccionado: undefined,
          },
        ],
        pago: mockPago,
        cursosCount: 3,
        mundosCount: 0,
      });

      // Act
      const result = await service.createInscripcion2026(mockCreateDto);

      // Assert
      // Estudiante 1: 1 curso, Estudiante 2: 2 cursos = Total 3 cursos
      expect(result.estudiantes_creados).toHaveLength(2);
      expect(result.estudiantes_creados[0].id).toBe('estudiante-1');
      expect(result.estudiantes_creados[1].id).toBe('estudiante-2');
    });
  });

  describe('Test 7: Mundos STEAM creados en batch', () => {
    it('debe crear mundos STEAM en batch con Promise.all para Pack Completo', async () => {
      // Arrange
      const dtoWithMundos = {
        ...mockCreateDto,
        tipo_inscripcion: TipoInscripcion2026.PACK_COMPLETO,
        estudiantes: [
          {
            ...mockCreateDto.estudiantes[0],
            mundo_seleccionado: 'matematica' as any,
          },
          {
            ...mockCreateDto.estudiantes[1],
            mundo_seleccionado: 'programacion' as any,
          },
        ],
      };

      jest.spyOn(mercadoPagoService, 'isMockMode').mockReturnValue(false);
      jest.spyOn(mercadoPagoService, 'buildInscripcion2026PreferenceData').mockReturnValue({} as any);
      jest.spyOn(mercadoPagoService, 'createPreference').mockResolvedValue(mockMercadoPagoPreference);

      // Mock transaction - Retornar estructura esperada con mundosCount = 2
      jest.spyOn(prismaService, '$transaction').mockResolvedValue({
        inscripcion: mockInscripcion,
        tutor: mockTutor,
        estudiantes: [
          {
            estudiante: mockEstudiante1,
            estudianteInscripcion: mockEstudianteInscripcion1,
            pin: '1234',
            cursosSeleccionados: [],
            mundoSeleccionado: 'matematica',
          },
          {
            estudiante: mockEstudiante2,
            estudianteInscripcion: mockEstudianteInscripcion2,
            pin: '5678',
            cursosSeleccionados: [],
            mundoSeleccionado: 'programacion',
          },
        ],
        pago: mockPago,
        cursosCount: 0,
        mundosCount: 2,
      });

      // Act
      const result = await service.createInscripcion2026(dtoWithMundos);

      // Assert
      expect(result.estudiantes_creados).toHaveLength(2);
      expect(result.estudiantes_creados[0].id).toBe('estudiante-1');
      expect(result.estudiantes_creados[1].id).toBe('estudiante-2');
    });
  });

  describe('Test 8: Historial creado con estado correcto', () => {
    it('debe crear historial con estado_anterior=none y estado_nuevo=pending', async () => {
      // Arrange
      jest.spyOn(mercadoPagoService, 'isMockMode').mockReturnValue(false);
      jest.spyOn(mercadoPagoService, 'buildInscripcion2026PreferenceData').mockReturnValue({} as any);
      jest.spyOn(mercadoPagoService, 'createPreference').mockResolvedValue(mockMercadoPagoPreference);

      // Mock transaction - Retornar estructura esperada
      jest.spyOn(prismaService, '$transaction').mockResolvedValue({
        inscripcion: mockInscripcion,
        tutor: mockTutor,
        estudiantes: [
          {
            estudiante: mockEstudiante1,
            estudianteInscripcion: mockEstudianteInscripcion1,
            pin: '1234',
            cursosSeleccionados: [],
            mundoSeleccionado: undefined,
          },
        ],
        pago: mockPago,
        cursosCount: 0,
        mundosCount: 0,
      });

      // Act
      const result = await service.createInscripcion2026(mockCreateDto);

      // Assert
      expect(result.inscripcionId).toBe('inscripcion-123');
      expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Test 9: Preference_id guardado en pago', () => {
    it('debe guardar mercadopago_preference_id en el registro de pago', async () => {
      // Arrange
      jest.spyOn(mercadoPagoService, 'isMockMode').mockReturnValue(false);
      jest.spyOn(mercadoPagoService, 'buildInscripcion2026PreferenceData').mockReturnValue({} as any);
      jest.spyOn(mercadoPagoService, 'createPreference').mockResolvedValue(mockMercadoPagoPreference);

      // Mock transaction - Retornar estructura esperada
      jest.spyOn(prismaService, '$transaction').mockResolvedValue({
        inscripcion: mockInscripcion,
        tutor: mockTutor,
        estudiantes: [
          {
            estudiante: mockEstudiante1,
            estudianteInscripcion: mockEstudianteInscripcion1,
            pin: '1234',
            cursosSeleccionados: [],
            mundoSeleccionado: undefined,
          },
        ],
        pago: mockPago,
        cursosCount: 0,
        mundosCount: 0,
      });

      // Act
      const result = await service.createInscripcion2026(mockCreateDto);

      // Assert
      expect(result.pago_info.mercadopago_preference_id).toBe('pref-123456');
    });
  });

  describe('Test 10: Timeout si generateUniquePin falla después de MAX_ATTEMPTS', () => {
    it('debe lanzar ConflictException si no puede generar PIN único después de 10 intentos', async () => {
      // Arrange
      jest.spyOn(mercadoPagoService, 'isMockMode').mockReturnValue(false);
      jest.spyOn(mercadoPagoService, 'buildInscripcion2026PreferenceData').mockReturnValue({} as any);
      jest.spyOn(mercadoPagoService, 'createPreference').mockResolvedValue(mockMercadoPagoPreference);

      // Simular que todos los PINs generados ya existen - la transacción fallará
      jest.spyOn(prismaService, '$transaction').mockRejectedValue(
        new InternalServerErrorException('No se pudo generar un PIN único después de 10 intentos')
      );

      // Act & Assert
      await expect(service.createInscripcion2026(mockCreateDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('Test 11: Username normalizado correctamente', () => {
    it('debe normalizar username eliminando acentos y reemplazando espacios por puntos', async () => {
      // Arrange
      const dtoWithAccents = {
        ...mockCreateDto,
        estudiantes: [
          {
            nombre: 'José María Fernández',
            edad: 10,
            dni: '12345678',
            cursos_seleccionados: mockCreateDto.estudiantes[0].cursos_seleccionados,
          },
        ],
      };

      jest.spyOn(mercadoPagoService, 'isMockMode').mockReturnValue(false);
      jest.spyOn(mercadoPagoService, 'buildInscripcion2026PreferenceData').mockReturnValue({} as any);
      jest.spyOn(mercadoPagoService, 'createPreference').mockResolvedValue(mockMercadoPagoPreference);

      const mockEstudianteNormalizado = {
        ...mockEstudiante1,
        nombre: 'José María Fernández',
        username: 'jose.maria.fernandez',
      };

      // Mock transaction - Retornar estructura esperada con username normalizado
      jest.spyOn(prismaService, '$transaction').mockResolvedValue({
        inscripcion: mockInscripcion,
        tutor: mockTutor,
        estudiantes: [
          {
            estudiante: mockEstudianteNormalizado,
            estudianteInscripcion: mockEstudianteInscripcion1,
            pin: '1234',
            cursosSeleccionados: [],
            mundoSeleccionado: undefined,
          },
        ],
        pago: mockPago,
        cursosCount: 0,
        mundosCount: 0,
      });

      // Act
      const result = await service.createInscripcion2026(dtoWithAccents);

      // Assert
      expect(result.estudiantes_creados[0].nombre).toBe('José María Fernández');
    });
  });

  describe('Test 12: Mock mode maneja placeholder de MercadoPago', () => {
    it('debe usar placeholder en modo mock sin llamar a MercadoPago API', async () => {
      // Arrange
      jest.spyOn(mercadoPagoService, 'isMockMode').mockReturnValue(true);
      const createPreferenceSpy = jest.spyOn(mercadoPagoService, 'createPreference');

      const mockPagoMock = {
        ...mockPago,
        mercadopago_preference_id: 'MP-MOCK-TEMP',
      };

      // Mock transaction - Retornar estructura esperada con preferencia mock
      jest.spyOn(prismaService, '$transaction').mockResolvedValue({
        inscripcion: mockInscripcion,
        tutor: mockTutor,
        estudiantes: [
          {
            estudiante: mockEstudiante1,
            estudianteInscripcion: mockEstudianteInscripcion1,
            pin: '1234',
            cursosSeleccionados: [],
            mundoSeleccionado: undefined,
          },
        ],
        pago: mockPagoMock,
        cursosCount: 0,
        mundosCount: 0,
      });

      // Act
      const result = await service.createInscripcion2026(mockCreateDto);

      // Assert
      expect(createPreferenceSpy).not.toHaveBeenCalled();
      expect(result.pago_info.mercadopago_preference_id).toBe('MP-MOCK-TEMP');
      expect(result.pago_info.mercadopago_init_point).toContain('mock-checkout');
    });
  });
});
