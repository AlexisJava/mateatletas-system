jest.mock('@prisma/client', () => ({
  PrismaClient: class {},
  TipoProducto: {
    Suscripcion: 'Suscripcion',
    Curso: 'Curso',
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PagosService } from '../presentation/services/pagos.service';
import { PrismaService } from '../../core/database/prisma.service';
import { ProductosService } from '../../catalogo/productos.service';
import { MercadoPagoService } from '../mercadopago.service';
import { TipoProducto } from '@prisma/client';
import { MercadoPagoWebhookDto } from '../dto/mercadopago-webhook.dto';
import { LogrosService } from '../../gamificacion/services/logros.service';

class MockPagosService {
  public generarPreferenciaSuscripcion = jest.fn();
  public generarPreferenciaCurso = jest.fn();
  public createMockMembershipPreference = jest.fn();
  public createMockCoursePreference = jest.fn();
  public shouldIgnoreWebhook = jest.fn().mockReturnValue(false);
  public activarMembresiaMock = jest.fn();
}

const TipoProductoEnum = TipoProducto || {
  Suscripcion: 'Suscripcion',
  Curso: 'Curso',
};

const createWebhookPayload = (
  override: Partial<MercadoPagoWebhookDto> = {},
): MercadoPagoWebhookDto => {
  // Si override.data tiene id explícitamente definido (incluso como undefined), usar ese valor
  // Si no, usar 'payment-123' por defecto
  let paymentData: { id?: string };

  if (override.data && 'id' in override.data) {
    paymentData = { id: (override.data as { id?: string }).id };
  } else {
    paymentData = { id: 'payment-123' };
  }

  return {
    action: override.action ?? 'payment.updated',
    type: override.type ?? 'payment',
    data: paymentData as unknown as { id: string },
    live_mode: override.live_mode,
    date_created: override.date_created,
    user_id: override.user_id,
    api_version: override.api_version,
  } as MercadoPagoWebhookDto;
};

/**
 * TESTS COMPREHENSIVOS PARA PAGOS SERVICE
 *
 * CRITICAL SERVICE - Maneja flujos de dinero real
 *
 * Cobertura completa:
 * 1. generarPreferenciaSuscripcion
 *    - Happy path
 *    - Producto no encontrado
 *    - Producto no es suscripción
 *    - Tutor no encontrado
 *    - Modo mock vs real
 *    - Transacciones atomicas
 *
 * 2. generarPreferenciaCurso
 *    - Happy path
 *    - Validación de estudiante
 *    - Inscripción duplicada
 *    - Modo mock vs real
 *
 * 3. procesarWebhookMercadoPago
 *    - Pago aprobado (membresía)
 *    - Pago rechazado (membresía)
 *    - Pago aprobado (curso)
 *    - Pago rechazado (curso)
 *    - External reference inválido
 *    - Payment ID missing
 *    - Modo mock ignorado
 *
 * 4. obtenerMembresiaTutor
 * 5. obtenerEstadoMembresia
 * 6. obtenerInscripcionesEstudiante
 * 7. obtenerHistorialPagosTutor
 */

describe('PagosService - COMPREHENSIVE TESTS', () => {
  let service: PagosService;
  let pagosService: any;
  let prisma: PrismaService;
  let productosService: ProductosService;
  let mercadoPagoService: MercadoPagoService;
  let mockPagosService: MockPagosService;
  let cacheManager: any;

  // Mocks de datos
  const mockTutor = {
    id: 'tutor-123',
    email: 'tutor@test.com',
    nombre: 'Juan',
    apellido: 'Pérez',
  };

  const mockProductoSuscripcion = {
    id: 'prod-subs-1',
    nombre: 'Membresía Premium',
    descripcion: 'Acceso completo',
    tipo: TipoProductoEnum.Suscripcion,
    precio: 5000,
    duracion_meses: 1,
  };

  const mockProductoCurso = {
    id: 'prod-curso-1',
    nombre: 'Matemática Avanzada',
    descripcion: 'Curso completo',
    tipo: TipoProductoEnum.Curso,
    precio: 3500,
  };

  const mockEstudiante = {
    id: 'est-456',
    nombre: 'Sofía',
    apellido: 'González',
    tutor_id: 'tutor-123',
  };

  const mockMembresia = {
    id: 'memb-789',
    tutor_id: 'tutor-123',
    producto_id: 'prod-subs-1',
    estado: 'Pendiente',
    fecha_inicio: null,
    fecha_proximo_pago: null,
    preferencia_id: null,
    createdAt: new Date(),
  };

  const mockInscripcion = {
    id: 'insc-999',
    estudiante_id: 'est-456',
    producto_id: 'prod-curso-1',
    estado: 'PreInscrito',
    preferencia_id: null,
    createdAt: new Date(),
  };

  const mockPreferenceResponse = {
    id: 'pref-abc-123',
    init_point:
      'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref-abc-123',
  };

  beforeEach(async () => {
    // Mock para cache manager
    cacheManager = {
      get: jest.fn().mockResolvedValue(null), // Por defecto, no hay cache
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagosService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
        {
          provide: PrismaService,
          useValue: {
            tutor: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
            },
            estudiante: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
            },
            membresia: {
              create: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
            },
            inscripcionCurso: {
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: ProductosService,
          useValue: {
            findById: jest.fn(),
            findSuscripciones: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'FRONTEND_URL') return 'http://localhost:3000';
              if (key === 'BACKEND_URL') return 'http://localhost:3001';
              if (key === 'MERCADOPAGO_ACCESS_TOKEN') return 'XXXXXXXX'; // Mock mode
              return null;
            }),
          },
        },
        {
          provide: MercadoPagoService,
          useValue: {
            isMockMode: jest.fn().mockReturnValue(false), // Default: real mode
            createPreference: jest.fn(),
            getPayment: jest.fn(),
            buildMembershipPreferenceData: jest.fn(),
            buildCoursePreferenceData: jest.fn(),
          },
        },
        {
          provide: MockPagosService,
          useClass: MockPagosService,
        },
      ],
    }).compile();

    service = module.get<PagosService>(PagosService);
    pagosService = service as any;
    prisma = module.get<PrismaService>(PrismaService);
    productosService = module.get<ProductosService>(ProductosService);
    mercadoPagoService = module.get<MercadoPagoService>(MercadoPagoService);
    mockPagosService = module.get<MockPagosService>(MockPagosService);
    (prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) =>
      fn(prisma),
    );
    cacheManager = module.get(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  describe('generarPreferenciaSuscripcion - Happy Path', () => {
    it('should generate preference for subscription successfully (REAL MODE)', async () => {
      // Arrange
      jest
        .spyOn(productosService, 'findById')
        .mockResolvedValue(mockProductoSuscripcion as any);
      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(mockTutor as any);
      jest
        .spyOn(prisma.membresia, 'create')
        .mockResolvedValue(mockMembresia as any);
      jest.spyOn(prisma.membresia, 'update').mockResolvedValue({
        ...mockMembresia,
        preferencia_id: 'pref-abc-123',
      } as any);
      jest.spyOn(mercadoPagoService, 'isMockMode').mockReturnValue(false);
      jest
        .spyOn(mercadoPagoService, 'buildMembershipPreferenceData')
        .mockReturnValue({} as any);
      jest
        .spyOn(mercadoPagoService, 'createPreference')
        .mockResolvedValue(mockPreferenceResponse as any);

      // Act
      const result = await pagosService.generarPreferenciaSuscripcion(
        'tutor-123',
        'prod-subs-1',
      );

      // Assert
      expect(result).toEqual({
        init_point: mockPreferenceResponse.init_point,
        membresiaId: mockMembresia.id,
        preferenciaId: mockPreferenceResponse.id,
      });

      // Verify sequence of operations
      expect(productosService.findById).toHaveBeenCalledWith('prod-subs-1');
      expect(prisma.tutor.findUnique).toHaveBeenCalledWith({
        where: { id: 'tutor-123' },
        select: { id: true, email: true, nombre: true, apellido: true },
      });
      expect(prisma.membresia.create).toHaveBeenCalledWith({
        data: {
          tutor_id: 'tutor-123',
          producto_id: 'prod-subs-1',
          estado: 'Pendiente',
          fecha_inicio: null,
          fecha_proximo_pago: null,
        },
      });
      expect(mercadoPagoService.createPreference).toHaveBeenCalled();
      expect(prisma.membresia.update).toHaveBeenCalledWith({
        where: { id: mockMembresia.id },
        data: { preferencia_id: mockPreferenceResponse.id },
      });
    });

    it('should use first available subscription when no productoId specified', async () => {
      // Arrange
      jest
        .spyOn(productosService, 'findSuscripciones')
        .mockResolvedValue([mockProductoSuscripcion] as any);
      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(mockTutor as any);
      jest
        .spyOn(prisma.membresia, 'create')
        .mockResolvedValue(mockMembresia as any);
      jest
        .spyOn(prisma.membresia, 'update')
        .mockResolvedValue(mockMembresia as any);
      jest.spyOn(mercadoPagoService, 'isMockMode').mockReturnValue(true);
      jest
        .spyOn(mockPagosService, 'createMockMembershipPreference')
        .mockReturnValue(mockPreferenceResponse as any);

      // Act
      const result =
        await pagosService.generarPreferenciaSuscripcion('tutor-123');

      // Assert
      expect(productosService.findSuscripciones).toHaveBeenCalled();
      expect(result.membresiaId).toBe(mockMembresia.id);
    });

    it('should use mock preference in MOCK MODE', async () => {
      // Arrange
      jest
        .spyOn(productosService, 'findById')
        .mockResolvedValue(mockProductoSuscripcion as any);
      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(mockTutor as any);
      jest
        .spyOn(prisma.membresia, 'create')
        .mockResolvedValue(mockMembresia as any);
      jest
        .spyOn(prisma.membresia, 'update')
        .mockResolvedValue(mockMembresia as any);
      jest.spyOn(mercadoPagoService, 'isMockMode').mockReturnValue(true);
      jest
        .spyOn(mockPagosService, 'createMockMembershipPreference')
        .mockReturnValue(mockPreferenceResponse as any);

      // Act
      await pagosService.generarPreferenciaSuscripcion(
        'tutor-123',
        'prod-subs-1',
      );

      // Assert
      expect(
        mockPagosService.createMockMembershipPreference,
      ).toHaveBeenCalledWith(mockMembresia.id);
      expect(mercadoPagoService.createPreference).not.toHaveBeenCalled();
    });
  });

  describe('generarPreferenciaSuscripcion - Error Cases', () => {
    it('should throw NotFoundException when no subscription products available', async () => {
      // Arrange
      jest.spyOn(productosService, 'findSuscripciones').mockResolvedValue([]);

      // Act & Assert
      await expect(
        pagosService.generarPreferenciaSuscripcion('tutor-123'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        pagosService.generarPreferenciaSuscripcion('tutor-123'),
      ).rejects.toThrow('No hay productos de suscripción disponibles');
    });

    it('should throw BadRequestException when product is not a subscription', async () => {
      // Arrange
      jest
        .spyOn(productosService, 'findById')
        .mockResolvedValue(mockProductoCurso as any);

      // Act & Assert
      await expect(
        pagosService.generarPreferenciaSuscripcion('tutor-123', 'prod-curso-1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        pagosService.generarPreferenciaSuscripcion('tutor-123', 'prod-curso-1'),
      ).rejects.toThrow('El producto especificado no es una suscripción');
    });

    it('should throw NotFoundException when tutor not found', async () => {
      // Arrange
      jest
        .spyOn(productosService, 'findById')
        .mockResolvedValue(mockProductoSuscripcion as any);
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(
        pagosService.generarPreferenciaSuscripcion(
          'invalid-tutor',
          'prod-subs-1',
        ),
      ).rejects.toThrow(NotFoundException);
      await expect(
        pagosService.generarPreferenciaSuscripcion(
          'invalid-tutor',
          'prod-subs-1',
        ),
      ).rejects.toThrow('Tutor no encontrado');
    });
  });

  describe('generarPreferenciaCurso - Happy Path', () => {
    it('should generate course preference successfully', async () => {
      // Arrange
      jest
        .spyOn(productosService, 'findById')
        .mockResolvedValue(mockProductoCurso as any);
      jest
        .spyOn(prisma.estudiante, 'findFirst')
        .mockResolvedValue(mockEstudiante as any);
      jest.spyOn(prisma.inscripcionCurso, 'findUnique').mockResolvedValue(null); // No existe inscripción
      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(mockTutor as any);
      jest
        .spyOn(prisma.inscripcionCurso, 'create')
        .mockResolvedValue(mockInscripcion as any);
      jest
        .spyOn(prisma.inscripcionCurso, 'update')
        .mockResolvedValue(mockInscripcion as any);
      jest.spyOn(mercadoPagoService, 'isMockMode').mockReturnValue(false);
      jest
        .spyOn(mercadoPagoService, 'buildCoursePreferenceData')
        .mockReturnValue({} as any);
      jest
        .spyOn(mercadoPagoService, 'createPreference')
        .mockResolvedValue(mockPreferenceResponse as any);

      // Act
      const result = await pagosService.generarPreferenciaCurso(
        'tutor-123',
        'est-456',
        'prod-curso-1',
      );

      // Assert
      expect(result).toEqual({
        init_point: mockPreferenceResponse.init_point,
        inscripcionId: mockInscripcion.id,
        preferenciaId: mockPreferenceResponse.id,
      });

      // Verify inscripcion created with PreInscrito state
      expect(prisma.inscripcionCurso.create).toHaveBeenCalledWith({
        data: {
          estudiante_id: 'est-456',
          producto_id: 'prod-curso-1',
          estado: 'PreInscrito',
        },
      });
    });

    it('should use mock preference in MOCK MODE for courses', async () => {
      // Arrange
      jest
        .spyOn(productosService, 'findById')
        .mockResolvedValue(mockProductoCurso as any);
      jest
        .spyOn(prisma.estudiante, 'findFirst')
        .mockResolvedValue(mockEstudiante as any);
      jest.spyOn(prisma.inscripcionCurso, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(mockTutor as any);
      jest
        .spyOn(prisma.inscripcionCurso, 'create')
        .mockResolvedValue(mockInscripcion as any);
      jest
        .spyOn(prisma.inscripcionCurso, 'update')
        .mockResolvedValue(mockInscripcion as any);
      jest.spyOn(mercadoPagoService, 'isMockMode').mockReturnValue(true);
      jest
        .spyOn(mockPagosService, 'createMockCoursePreference')
        .mockReturnValue(mockPreferenceResponse as any);

      // Act
      await pagosService.generarPreferenciaCurso(
        'tutor-123',
        'est-456',
        'prod-curso-1',
      );

      // Assert
      expect(mockPagosService.createMockCoursePreference).toHaveBeenCalledWith(
        mockInscripcion.id,
      );
      expect(mercadoPagoService.createPreference).not.toHaveBeenCalled();
    });
  });

  describe('generarPreferenciaCurso - Error Cases', () => {
    it('should throw BadRequestException when product is not a course', async () => {
      // Arrange
      jest
        .spyOn(productosService, 'findById')
        .mockResolvedValue(mockProductoSuscripcion as any);

      // Act & Assert
      await expect(
        pagosService.generarPreferenciaCurso(
          'tutor-123',
          'est-456',
          'prod-subs-1',
        ),
      ).rejects.toThrow(BadRequestException);
      await expect(
        pagosService.generarPreferenciaCurso(
          'tutor-123',
          'est-456',
          'prod-subs-1',
        ),
      ).rejects.toThrow('El producto especificado no es un curso');
    });

    it('should throw NotFoundException when student not found', async () => {
      // Arrange
      jest
        .spyOn(productosService, 'findById')
        .mockResolvedValue(mockProductoCurso as any);
      jest.spyOn(prisma.estudiante, 'findFirst').mockResolvedValue(null);

      // Act & Assert
      await expect(
        pagosService.generarPreferenciaCurso(
          'tutor-123',
          'invalid-student',
          'prod-curso-1',
        ),
      ).rejects.toThrow(NotFoundException);
      await expect(
        pagosService.generarPreferenciaCurso(
          'tutor-123',
          'invalid-student',
          'prod-curso-1',
        ),
      ).rejects.toThrow('Estudiante no encontrado o no pertenece al tutor');
    });

    it('should throw NotFoundException when student belongs to different tutor', async () => {
      // Arrange
      jest
        .spyOn(productosService, 'findById')
        .mockResolvedValue(mockProductoCurso as any);
      jest.spyOn(prisma.estudiante, 'findFirst').mockResolvedValue(null); // findFirst with tutor_id filter returns null

      // Act & Assert
      await expect(
        pagosService.generarPreferenciaCurso(
          'wrong-tutor',
          'est-456',
          'prod-curso-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when student already inscribed', async () => {
      // Arrange
      jest
        .spyOn(productosService, 'findById')
        .mockResolvedValue(mockProductoCurso as any);
      jest
        .spyOn(prisma.estudiante, 'findFirst')
        .mockResolvedValue(mockEstudiante as any);
      jest
        .spyOn(prisma.inscripcionCurso, 'findUnique')
        .mockResolvedValue(mockInscripcion as any); // Ya existe

      // Act & Assert
      await expect(
        pagosService.generarPreferenciaCurso(
          'tutor-123',
          'est-456',
          'prod-curso-1',
        ),
      ).rejects.toThrow(BadRequestException);
      await expect(
        pagosService.generarPreferenciaCurso(
          'tutor-123',
          'est-456',
          'prod-curso-1',
        ),
      ).rejects.toThrow('El estudiante ya está inscrito en este curso');
    });
  });

  describe('procesarWebhookMercadoPago - Membresía Flow', () => {
    it('should activate membresia when payment is approved', async () => {
      // Arrange
      const mockPayment = {
        id: 'payment-123',
        status: 'approved',
        external_reference:
          'membresia-memb-789-tutor-tutor-123-producto-prod-subs-1',
      };

      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPayment as any);
      jest.spyOn(prisma.membresia, 'findUnique').mockResolvedValue({
        ...mockMembresia,
        producto: mockProductoSuscripcion,
      } as any);
      jest.spyOn(prisma.membresia, 'update').mockResolvedValue({} as any);

      // Act
      const result = await pagosService.procesarWebhookMercadoPago(
        createWebhookPayload({ data: { id: 'payment-123' } }),
      );

      // Assert
      expect(result).toMatchObject({
        message: 'Webhook processed successfully',
        paymentId: 'payment-123',
        resultado: {
          action: 'activated',
          estado: 'Activa',
          membresiaId: 'memb',
        },
      });

      // Verify dates are present and correct type
      expect(result.resultado.fechaInicio).toBeInstanceOf(Date);
      expect(result.resultado.fechaProximoPago).toBeInstanceOf(Date);

      // Verify update was called (dates are dynamic, so we just check estructura)
      const updateCall = (prisma.membresia.update as jest.Mock).mock
        .calls[0][0];
      expect(updateCall.where.id).toBe('memb');
      expect(updateCall.data.estado).toBe('Activa');
      expect(updateCall.data.fecha_inicio).toBeInstanceOf(Date);
      expect(updateCall.data.fecha_proximo_pago).toBeInstanceOf(Date);
    });

    it('should cancel membresia when payment is rejected', async () => {
      // Arrange
      const mockPayment = {
        id: 'payment-456',
        status: 'rejected',
        external_reference:
          'membresia-memb-789-tutor-tutor-123-producto-prod-subs-1',
      };

      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPayment as any);
      jest.spyOn(prisma.membresia, 'findUnique').mockResolvedValue({
        ...mockMembresia,
        producto: mockProductoSuscripcion,
      } as any);
      jest.spyOn(prisma.membresia, 'update').mockResolvedValue({} as any);

      // Act
      await pagosService.procesarWebhookMercadoPago(
        createWebhookPayload({ data: { id: 'payment-456' } }),
      );

      // Assert
      const updateCall = (prisma.membresia.update as jest.Mock).mock
        .calls[0][0];
      expect(updateCall.where.id).toBe('memb');
      expect(updateCall.data.estado).toBe('Cancelada');
    });

    it('should cancel membresia when payment is cancelled', async () => {
      // Arrange
      const mockPayment = {
        id: 'payment-789',
        status: 'cancelled',
        external_reference:
          'membresia-memb-789-tutor-tutor-123-producto-prod-subs-1',
      };

      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPayment as any);
      jest.spyOn(prisma.membresia, 'findUnique').mockResolvedValue({
        ...mockMembresia,
        producto: mockProductoSuscripcion,
      } as any);
      jest.spyOn(prisma.membresia, 'update').mockResolvedValue({} as any);

      // Act
      await pagosService.procesarWebhookMercadoPago(
        createWebhookPayload({ data: { id: 'payment-789' } }),
      );

      // Assert
      const updateCall = (prisma.membresia.update as jest.Mock).mock
        .calls[0][0];
      expect(updateCall.where.id).toBe('memb');
      expect(updateCall.data.estado).toBe('Cancelada');
    });

    it('should keep membresia as Pendiente when payment is pending', async () => {
      // Arrange
      const mockPayment = {
        id: 'payment-pending',
        status: 'pending',
        external_reference:
          'membresia-memb-789-tutor-tutor-123-producto-prod-subs-1',
      };

      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPayment as any);
      jest.spyOn(prisma.membresia, 'findUnique').mockResolvedValue({
        ...mockMembresia,
        producto: mockProductoSuscripcion,
      } as any);
      jest.spyOn(prisma.membresia, 'update').mockResolvedValue({} as any);

      // Act
      await pagosService.procesarWebhookMercadoPago(
        createWebhookPayload({ data: { id: 'payment-pending' } }),
      );

      // Assert - No update should be called for pending status
      expect(prisma.membresia.update).not.toHaveBeenCalled();
    });

    it('should handle membresia not found gracefully (throw error)', async () => {
      // Arrange
      const mockPayment = {
        id: 'payment-123',
        status: 'approved',
        external_reference:
          'membresia-NONEXISTENT-tutor-tutor-123-producto-prod-subs-1',
      };

      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPayment as any);
      jest.spyOn(prisma.membresia, 'findUnique').mockResolvedValue(null);

      // Act & Assert - Con transacciones, ahora tira NotFoundException
      await expect(
        pagosService.procesarWebhookMercadoPago(
          createWebhookPayload({ data: { id: 'payment-123' } }),
        ),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.membresia.update).not.toHaveBeenCalled();
    });
  });

  describe('procesarWebhookMercadoPago - Curso Flow', () => {
    it('should activate inscripcion when payment is approved', async () => {
      // Arrange
      const mockPayment = {
        id: 'payment-curso-123',
        status: 'approved',
        external_reference:
          'inscripcion-insc-999-estudiante-est-456-producto-prod-curso-1',
      };

      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPayment as any);
      jest.spyOn(prisma.inscripcionCurso, 'findUnique').mockResolvedValue({
        ...mockInscripcion,
        producto: mockProductoCurso,
        estudiante: mockEstudiante,
      } as any);
      jest
        .spyOn(prisma.inscripcionCurso, 'update')
        .mockResolvedValue({} as any);

      // Act
      await pagosService.procesarWebhookMercadoPago(
        createWebhookPayload({ data: { id: 'payment-curso-123' } }),
      );

      // Assert
      const updateCall = (prisma.inscripcionCurso.update as jest.Mock).mock
        .calls[0][0];
      expect(updateCall.where.id).toBe('insc');
      expect(updateCall.data.estado).toBe('Activo');
    });

    it('should DELETE inscripcion when payment is rejected', async () => {
      // Arrange
      const mockPayment = {
        id: 'payment-curso-rejected',
        status: 'rejected',
        external_reference:
          'inscripcion-insc-999-estudiante-est-456-producto-prod-curso-1',
      };

      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPayment as any);
      jest.spyOn(prisma.inscripcionCurso, 'findUnique').mockResolvedValue({
        ...mockInscripcion,
        producto: mockProductoCurso,
        estudiante: mockEstudiante,
      } as any);
      jest
        .spyOn(prisma.inscripcionCurso, 'delete')
        .mockResolvedValue({} as any);

      // Act
      await pagosService.procesarWebhookMercadoPago(
        createWebhookPayload({ data: { id: 'payment-curso-rejected' } }),
      );

      // Assert
      const deleteCall = (prisma.inscripcionCurso.delete as jest.Mock).mock
        .calls[0][0];
      expect(deleteCall.where.id).toBe('insc');
    });

    it('should DELETE inscripcion when payment is cancelled', async () => {
      // Arrange
      const mockPayment = {
        id: 'payment-curso-cancelled',
        status: 'cancelled',
        external_reference:
          'inscripcion-insc-999-estudiante-est-456-producto-prod-curso-1',
      };

      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPayment as any);
      jest.spyOn(prisma.inscripcionCurso, 'findUnique').mockResolvedValue({
        ...mockInscripcion,
        producto: mockProductoCurso,
        estudiante: mockEstudiante,
      } as any);
      jest
        .spyOn(prisma.inscripcionCurso, 'delete')
        .mockResolvedValue({} as any);

      // Act
      await pagosService.procesarWebhookMercadoPago(
        createWebhookPayload({ data: { id: 'payment-curso-cancelled' } }),
      );

      // Assert
      const deleteCall = (prisma.inscripcionCurso.delete as jest.Mock).mock
        .calls[0][0];
      expect(deleteCall.where.id).toBe('insc');
    });

    it('should handle inscripcion not found gracefully (throw error)', async () => {
      // Arrange
      const mockPayment = {
        id: 'payment-curso-123',
        status: 'approved',
        external_reference:
          'inscripcion-NONEXISTENT-estudiante-est-456-producto-prod-curso-1',
      };

      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPayment as any);
      jest.spyOn(prisma.inscripcionCurso, 'findUnique').mockResolvedValue(null);

      // Act & Assert - Con transacciones, ahora tira NotFoundException
      await expect(
        pagosService.procesarWebhookMercadoPago(
          createWebhookPayload({ data: { id: 'payment-curso-123' } }),
        ),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.inscripcionCurso.update).not.toHaveBeenCalled();
    });
  });

  describe('procesarWebhookMercadoPago - Edge Cases', () => {
    it('should ignore webhook in mock mode', async () => {
      // Arrange
      jest.spyOn(mockPagosService, 'shouldIgnoreWebhook').mockReturnValue(true);

      // Act
      const result = await pagosService.procesarWebhookMercadoPago(
        createWebhookPayload({ data: { id: '123' } }),
      );

      // Assert
      expect(result).toEqual({ message: 'Mock mode - webhook ignored' });
      expect(mercadoPagoService.getPayment).not.toHaveBeenCalled();
    });

    it('should ignore non-payment webhooks', async () => {
      // Act
      const result = await pagosService.procesarWebhookMercadoPago(
        createWebhookPayload({ type: 'merchant_order', data: { id: '123' } }),
      );

      // Assert
      expect(result).toEqual({ message: 'Webhook type not handled' });
      expect(mercadoPagoService.getPayment).not.toHaveBeenCalled();
    });

    it('should handle missing payment ID', async () => {
      // Act
      const result = await pagosService.procesarWebhookMercadoPago(
        createWebhookPayload({ data: { id: undefined } } as any),
      );

      // Assert
      expect(result).toEqual({ message: 'No payment ID' });
      expect(mercadoPagoService.getPayment).not.toHaveBeenCalled();
    });

    it('should handle unknown external_reference format', async () => {
      // Arrange
      const mockPayment = {
        id: 'payment-unknown',
        status: 'approved',
        external_reference: 'unknown-format-12345',
      };

      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPayment as any);

      // Act
      const result = await pagosService.procesarWebhookMercadoPago(
        createWebhookPayload({ data: { id: 'payment-unknown' } }),
      );

      // Assert
      expect(result).toEqual({ message: 'Unknown external reference format' });
      expect(prisma.membresia.findUnique).not.toHaveBeenCalled();
      expect(prisma.inscripcionCurso.findUnique).not.toHaveBeenCalled();
    });

    it('should throw error when getPayment fails', async () => {
      // Arrange
      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockRejectedValue(new Error('MercadoPago API error'));

      // Act & Assert
      await expect(
        pagosService.procesarWebhookMercadoPago(
          createWebhookPayload({ data: { id: 'payment-fail' } }),
        ),
      ).rejects.toThrow('MercadoPago API error');
    });
  });

  describe('obtenerMembresiaTutor', () => {
    it('should return active membresia for tutor', async () => {
      // Arrange
      const mockMembresiaConProducto = {
        ...mockMembresia,
        estado: 'Activa',
        producto: mockProductoSuscripcion,
      };

      jest
        .spyOn(prisma.membresia, 'findFirst')
        .mockResolvedValue(mockMembresiaConProducto as any);

      // Act
      const result = await pagosService.obtenerMembresiaTutor('tutor-123');

      // Assert
      expect(result).toEqual(mockMembresiaConProducto);
      expect(prisma.membresia.findFirst).toHaveBeenCalledWith({
        where: {
          tutor_id: 'tutor-123',
          estado: { in: ['Activa', 'Pendiente', 'Atrasada'] },
        },
        include: {
          producto: {
            select: {
              id: true,
              nombre: true,
              descripcion: true,
              precio: true,
              duracion_meses: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return null when tutor has no membresia', async () => {
      // Arrange
      jest.spyOn(prisma.membresia, 'findFirst').mockResolvedValue(null);

      // Act
      const result = await pagosService.obtenerMembresiaTutor('tutor-no-memb');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('obtenerEstadoMembresia', () => {
    it('should return membresia estado for valid tutor', async () => {
      // Arrange
      const mockEstadoMembresia = {
        id: 'memb-789',
        estado: 'Activa',
        fecha_inicio: new Date(),
        fecha_proximo_pago: new Date(),
        createdAt: new Date(),
      };

      jest
        .spyOn(prisma.membresia, 'findFirst')
        .mockResolvedValue(mockEstadoMembresia as any);

      // Act
      const result = await pagosService.obtenerEstadoMembresia(
        'memb-789',
        'tutor-123',
      );

      // Assert
      expect(result).toEqual(mockEstadoMembresia);
      expect(prisma.membresia.findFirst).toHaveBeenCalledWith({
        where: { id: 'memb-789', tutor_id: 'tutor-123' },
        select: {
          id: true,
          estado: true,
          fecha_inicio: true,
          fecha_proximo_pago: true,
          createdAt: true,
        },
      });
    });

    it('should throw NotFoundException when membresia not found', async () => {
      // Arrange
      jest.spyOn(prisma.membresia, 'findFirst').mockResolvedValue(null);

      // Act & Assert
      await expect(
        pagosService.obtenerEstadoMembresia('invalid-memb', 'tutor-123'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        pagosService.obtenerEstadoMembresia('invalid-memb', 'tutor-123'),
      ).rejects.toThrow('Membresía no encontrada');
    });
  });

  describe('obtenerInscripcionesEstudiante', () => {
    it('should return inscripciones for valid student', async () => {
      // Arrange
      const mockInscripciones = [
        {
          ...mockInscripcion,
          producto: mockProductoCurso,
        },
      ];

      jest
        .spyOn(prisma.estudiante, 'findFirst')
        .mockResolvedValue(mockEstudiante as any);
      jest
        .spyOn(prisma.inscripcionCurso, 'findMany')
        .mockResolvedValue(mockInscripciones as any);

      // Act
      const result = await pagosService.obtenerInscripcionesEstudiante(
        'est-456',
        'tutor-123',
      );

      // Assert
      expect(result).toEqual(mockInscripciones);
      expect(prisma.estudiante.findFirst).toHaveBeenCalledWith({
        where: { id: 'est-456', tutor_id: 'tutor-123' },
      });
    });

    it('should throw NotFoundException when student not found', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findFirst').mockResolvedValue(null);

      // Act & Assert
      await expect(
        pagosService.obtenerInscripcionesEstudiante('invalid-est', 'tutor-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('obtenerHistorialPagosTutor', () => {
    it('should return complete payment history for tutor', async () => {
      // Arrange
      const mockMembresias = [
        {
          ...mockMembresia,
          estado: 'Activa',
          producto: mockProductoSuscripcion,
        },
      ];

      const mockInscripciones = [
        {
          ...mockInscripcion,
          estado: 'Activo',
          producto: mockProductoCurso,
          estudiante: mockEstudiante,
        },
      ];

      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(mockTutor as any);
      jest
        .spyOn(prisma.membresia, 'findMany')
        .mockResolvedValue(mockMembresias as any);
      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue([mockEstudiante] as any);
      jest
        .spyOn(prisma.inscripcionCurso, 'findMany')
        .mockResolvedValue(mockInscripciones as any);
      jest
        .spyOn(prisma.membresia, 'findFirst')
        .mockResolvedValue(mockMembresias[0] as any);

      // Act
      const result = await pagosService.obtenerHistorialPagosTutor('tutor-123');

      // Assert
      expect(result).toHaveProperty('historial');
      expect(result).toHaveProperty('resumen');
      expect(result).toHaveProperty('activos');

      expect(result.historial.length).toBe(2); // 1 membresia + 1 inscripcion
      expect(result.resumen.total_pagos).toBe(2);
      expect(result.resumen.total_gastado).toBe(8500); // 5000 + 3500
    });

    it('should throw NotFoundException when tutor not found', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(
        pagosService.obtenerHistorialPagosTutor('invalid-tutor'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('activarMembresiaMock', () => {
    it('should delegate to mockPagosService', async () => {
      // Arrange
      jest
        .spyOn(mockPagosService, 'activarMembresiaMock')
        .mockResolvedValue({ success: true } as any);

      // Act
      const result = await pagosService.activarMembresiaMock('memb-123');

      // Assert
      expect(mockPagosService.activarMembresiaMock).toHaveBeenCalledWith(
        'memb-123',
        false,
      );
      expect(result).toEqual({ success: true });
    });
  });
});
