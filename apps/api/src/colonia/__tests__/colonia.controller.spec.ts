import { Test, TestingModule } from '@nestjs/testing';
import { ColoniaController } from '../colonia.controller';
import { ColoniaService } from '../colonia.service';
import { CreateInscriptionDto } from '../dto/create-inscription.dto';
import { Logger } from '@nestjs/common';
import { ConflictException, BadRequestException } from '@nestjs/common';

describe('ColoniaController', () => {
  let controller: ColoniaController;
  let service: jest.Mocked<ColoniaService>;
  let loggerLogSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  const mockSuccessResponse = {
    message: 'Inscripción a Colonia de Verano 2026 creada exitosamente',
    tutorId: 'tutor-uuid-123',
    inscriptionId: 'inscription-uuid-456',
    estudiantes: [
      {
        id: 'estudiante-uuid-1',
        nombre: 'Juan Pérez',
        username: 'estudiante12345',
        pin: '1234',
        edad: 8,
        cursos: [
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
    pago: {
      mes: 'enero',
      monto: 12000,
      descuento: 0,
      mercadoPagoUrl:
        'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=12345',
    },
  };

  const createValidDto = (): CreateInscriptionDto => ({
    nombre: 'Carlos García',
    email: 'carlos.garcia@example.com',
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

  beforeEach(async () => {
    // Mock ColoniaService
    service = {
      createInscription: jest.fn(),
    } as unknown as jest.Mocked<ColoniaService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColoniaController],
      providers: [
        {
          provide: ColoniaService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ColoniaController>(ColoniaController);

    // Spy on Logger methods
    loggerLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createInscription - Happy Path', () => {
    it('debe crear una inscripción exitosa y retornar datos completos', async () => {
      // Arrange
      const dto = createValidDto();
      service.createInscription.mockResolvedValue(mockSuccessResponse);

      // Act
      const result = await controller.createInscription(dto);

      // Assert
      expect(service.createInscription).toHaveBeenCalledWith(dto);
      expect(service.createInscription).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSuccessResponse);
      expect(result.message).toBe(
        'Inscripción a Colonia de Verano 2026 creada exitosamente',
      );
      expect(result.tutorId).toBe('tutor-uuid-123');
      expect(result.inscriptionId).toBe('inscription-uuid-456');
    });

    it('debe retornar datos de estudiante con username y PIN generados', async () => {
      // Arrange
      const dto = createValidDto();
      service.createInscription.mockResolvedValue(mockSuccessResponse);

      // Act
      const result = await controller.createInscription(dto);

      // Assert
      expect(result.estudiantes).toHaveLength(1);
      expect(result.estudiantes[0]).toHaveProperty('username');
      expect(result.estudiantes[0]).toHaveProperty('pin');
      expect(result.estudiantes[0].username).toMatch(/^estudiante\d+$/);
      expect(result.estudiantes[0].pin).toMatch(/^\d{4}$/);
    });

    it('debe retornar datos de pago con URL de MercadoPago', async () => {
      // Arrange
      const dto = createValidDto();
      service.createInscription.mockResolvedValue(mockSuccessResponse);

      // Act
      const result = await controller.createInscription(dto);

      // Assert
      expect(result.pago).toBeDefined();
      expect(result.pago.mes).toBe('enero');
      expect(result.pago.monto).toBe(12000);
      expect(result.pago.descuento).toBe(0);
      expect(result.pago.mercadoPagoUrl).toContain(
        'https://www.mercadopago.com.ar/checkout',
      );
      expect(result.pago.mercadoPagoUrl).toContain('pref_id=');
    });

    it('debe retornar cursos completos del estudiante con todos los campos', async () => {
      // Arrange
      const dto = createValidDto();
      service.createInscription.mockResolvedValue(mockSuccessResponse);

      // Act
      const result = await controller.createInscription(dto);

      // Assert
      const curso = result.estudiantes[0].cursos[0];
      expect(curso).toBeDefined();
      expect(curso.id).toBe('mat-juegos-desafios');
      expect(curso.name).toBe('Juegos y Desafíos Lógicos');
      expect(curso.area).toBe('Matemáticas');
      expect(curso.instructor).toBe('Lucía Ramírez');
      expect(curso.dayOfWeek).toBe('Lunes');
      expect(curso.timeSlot).toBe('10:00 - 11:00');
      expect(curso.color).toBe('#3B82F6');
      expect(curso.icon).toBe('🎯');
    });
  });

  describe('createInscription - Logging', () => {
    it('debe registrar log al recibir nueva solicitud con email', async () => {
      // Arrange
      const dto = createValidDto();
      service.createInscription.mockResolvedValue(mockSuccessResponse);

      // Act
      await controller.createInscription(dto);

      // Assert
      expect(loggerLogSpy).toHaveBeenCalledWith(
        `Nueva solicitud de inscripción - Email: ${dto.email}`,
      );
    });

    it('debe registrar log exitoso con inscription ID', async () => {
      // Arrange
      const dto = createValidDto();
      service.createInscription.mockResolvedValue(mockSuccessResponse);

      // Clear any previous calls
      loggerLogSpy.mockClear();

      // Act
      await controller.createInscription(dto);

      // Assert
      expect(loggerLogSpy).toHaveBeenCalledWith(
        `Inscripción exitosa - Inscription ID: ${mockSuccessResponse.inscriptionId}`,
      );
      expect(loggerLogSpy).toHaveBeenCalledTimes(2);

      // Verify both logs were called in correct order
      expect(loggerLogSpy.mock.calls[0][0]).toBe(
        `Nueva solicitud de inscripción - Email: ${dto.email}`,
      );
      expect(loggerLogSpy.mock.calls[1][0]).toBe(
        `Inscripción exitosa - Inscription ID: ${mockSuccessResponse.inscriptionId}`,
      );
    });

    it('debe registrar error con mensaje y stack trace cuando falla', async () => {
      // Arrange
      const dto = createValidDto();
      const error = new ConflictException('Email ya registrado');
      error.stack = 'Error stack trace...';
      service.createInscription.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.createInscription(dto)).rejects.toThrow(
        ConflictException,
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `Error en inscripción: ${error.message}`,
        error.stack,
      );
    });

    it('debe registrar log de solicitud ANTES de llamar al servicio', async () => {
      // Arrange
      const dto = createValidDto();
      let logCalledBeforeService = false;

      loggerLogSpy.mockImplementation(() => {
        if (!service.createInscription.mock.calls.length) {
          logCalledBeforeService = true;
        }
      });

      service.createInscription.mockResolvedValue(mockSuccessResponse);

      // Act
      await controller.createInscription(dto);

      // Assert
      expect(logCalledBeforeService).toBe(true);
    });
  });

  describe('createInscription - Error Handling', () => {
    it('debe propagar ConflictException cuando email ya existe', async () => {
      // Arrange
      const dto = createValidDto();
      const error = new ConflictException(
        'Ya existe un tutor registrado con este email',
      );
      service.createInscription.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.createInscription(dto)).rejects.toThrow(
        ConflictException,
      );
      await expect(controller.createInscription(dto)).rejects.toThrow(
        'Ya existe un tutor registrado con este email',
      );
    });

    it('debe propagar BadRequestException cuando DTO es inválido', async () => {
      // Arrange
      const dto = createValidDto();
      const error = new BadRequestException('Validation failed');
      service.createInscription.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.createInscription(dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.createInscription(dto)).rejects.toThrow(
        'Validation failed',
      );
    });

    it('debe propagar error genérico sin modificar', async () => {
      // Arrange
      const dto = createValidDto();
      const error = new Error('Database connection failed');
      service.createInscription.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.createInscription(dto)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('debe registrar error ANTES de propagarlo', async () => {
      // Arrange
      const dto = createValidDto();
      const error = new ConflictException('Email duplicado');
      error.stack = 'Stack trace...';
      service.createInscription.mockRejectedValue(error);

      let errorLoggedBeforeThrow = false;
      loggerErrorSpy.mockImplementation(() => {
        errorLoggedBeforeThrow = true;
      });

      // Act & Assert
      try {
        await controller.createInscription(dto);
        fail('Should have thrown an error');
      } catch (e) {
        // Expected to throw
        expect(errorLoggedBeforeThrow).toBe(true);
        expect(e).toBeInstanceOf(ConflictException);
      }

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `Error en inscripción: ${error.message}`,
        error.stack,
      );
    });
  });

  describe('createInscription - Service Integration', () => {
    it('debe pasar DTO completo sin modificaciones al servicio', async () => {
      // Arrange
      const dto = createValidDto();
      service.createInscription.mockResolvedValue(mockSuccessResponse);

      // Act
      await controller.createInscription(dto);

      // Assert
      const callArg = service.createInscription.mock.calls[0][0];
      expect(callArg).toEqual(dto);
      expect(callArg.nombre).toBe(dto.nombre);
      expect(callArg.email).toBe(dto.email);
      expect(callArg.telefono).toBe(dto.telefono);
      expect(callArg.password).toBe(dto.password);
      expect(callArg.dni).toBe(dto.dni);
      expect(callArg.estudiantes).toEqual(dto.estudiantes);
    });

    it('debe retornar respuesta del servicio sin modificaciones', async () => {
      // Arrange
      const dto = createValidDto();
      const customResponse = {
        ...mockSuccessResponse,
        tutorId: 'custom-tutor-id',
        inscriptionId: 'custom-inscription-id',
      };
      service.createInscription.mockResolvedValue(customResponse);

      // Act
      const result = await controller.createInscription(dto);

      // Assert
      expect(result).toBe(customResponse);
      expect(result).not.toBe(mockSuccessResponse);
      expect(result.tutorId).toBe('custom-tutor-id');
      expect(result.inscriptionId).toBe('custom-inscription-id');
    });

    it('debe invocar servicio exactamente una vez', async () => {
      // Arrange
      const dto = createValidDto();
      service.createInscription.mockResolvedValue(mockSuccessResponse);

      // Act
      await controller.createInscription(dto);

      // Assert
      expect(service.createInscription).toHaveBeenCalledTimes(1);
    });
  });
});
