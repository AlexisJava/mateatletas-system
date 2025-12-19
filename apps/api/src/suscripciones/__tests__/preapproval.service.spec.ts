/**
 * Tests TDD para PreapprovalService
 *
 * REGLA DE NEGOCIO: Las suscripciones NO SE PAUSAN.
 * Si el tutor no paga, se cancela. Si quiere volver, crea una nueva.
 *
 * Convención de nombres: should_[action]_when_[condition]
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EstadoSuscripcion, IntervaloSuscripcion } from '@prisma/client';

import { PreapprovalService } from '../services/preapproval.service';
import { PrismaService } from '../../core/database/prisma.service';
import {
  PreApprovalError,
  PreApprovalErrorCode,
  CrearSuscripcionInput,
  CancelarSuscripcionInput,
} from '../types';
import { SuscripcionCreadaEvent, SuscripcionCanceladaEvent } from '../events';

// Mocks
const mockPrismaService = {
  tutor: {
    findUnique: jest.fn(),
  },
  planSuscripcion: {
    findUnique: jest.fn(),
  },
  suscripcion: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  historialEstadoSuscripcion: {
    create: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(mockPrismaService)),
};

const mockEventEmitter = {
  emit: jest.fn(),
};

// Mock del cliente de MercadoPago PreApproval
const mockPreApprovalClient = {
  create: jest.fn(),
  update: jest.fn(),
  get: jest.fn(),
};

describe('PreapprovalService', () => {
  let service: PreapprovalService;
  let prisma: typeof mockPrismaService;
  let eventEmitter: typeof mockEventEmitter;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        PreapprovalService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<PreapprovalService>(PreapprovalService);
    prisma = mockPrismaService;
    eventEmitter = mockEventEmitter;

    // Inyectar mock del cliente MP (el servicio debería exponer un setter para testing)
    service.setMpPreApprovalClient(mockPreApprovalClient);
  });

  describe('crear', () => {
    const mockTutor = {
      id: 'tutor-123',
      email: 'tutor@test.com',
      nombre: 'Juan',
      apellido: 'Pérez',
    };

    const mockPlan = {
      id: 'plan-123',
      nombre: 'STEAM_LIBROS',
      precio_base: { toNumber: () => 40000 },
      intervalo: IntervaloSuscripcion.MENSUAL,
      intervalo_cantidad: 1,
      activo: true,
    };

    const crearInput: CrearSuscripcionInput = {
      tutorId: 'tutor-123',
      planId: 'plan-123',
      tutorEmail: 'tutor@test.com',
      tutorNombre: 'Juan Pérez',
      numeroHijo: 1,
    };

    it('should_create_subscription_when_valid_input', async () => {
      // Arrange
      prisma.tutor.findUnique.mockResolvedValue(mockTutor);
      prisma.planSuscripcion.findUnique.mockResolvedValue(mockPlan);
      prisma.suscripcion.count.mockResolvedValue(0); // primer hijo
      prisma.suscripcion.create.mockResolvedValue({
        id: 'suscripcion-123',
        tutor_id: 'tutor-123',
        plan_id: 'plan-123',
        precio_final: { toNumber: () => 40000 },
        descuento_porcentaje: 0,
        estado: EstadoSuscripcion.PENDIENTE,
      });

      mockPreApprovalClient.create.mockResolvedValue({
        id: 'mp-preapproval-123',
        init_point: 'https://mercadopago.com/checkout/123',
        status: 'pending',
      });

      // Act
      const result = await service.crear(crearInput);

      // Assert
      expect(result.suscripcionId).toBe('suscripcion-123');
      expect(result.mpPreapprovalId).toBe('mp-preapproval-123');
      expect(result.checkoutUrl).toBe('https://mercadopago.com/checkout/123');
      expect(result.precioFinal).toBe(40000);
      expect(result.descuentoPorcentaje).toBe(0);

      // Verificar que se emitió el evento
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        SuscripcionCreadaEvent.EVENT_NAME,
        expect.any(SuscripcionCreadaEvent),
      );
    });

    it('should_apply_10_percent_discount_when_second_child', async () => {
      // Arrange
      const inputSegundoHijo: CrearSuscripcionInput = {
        ...crearInput,
        numeroHijo: 2,
      };

      prisma.tutor.findUnique.mockResolvedValue(mockTutor);
      prisma.planSuscripcion.findUnique.mockResolvedValue(mockPlan);
      prisma.suscripcion.create.mockResolvedValue({
        id: 'suscripcion-124',
        tutor_id: 'tutor-123',
        plan_id: 'plan-123',
        precio_final: { toNumber: () => 36000 }, // 40000 * 0.9
        descuento_porcentaje: 10,
        estado: EstadoSuscripcion.PENDIENTE,
      });

      mockPreApprovalClient.create.mockResolvedValue({
        id: 'mp-preapproval-124',
        init_point: 'https://mercadopago.com/checkout/124',
        status: 'pending',
      });

      // Act
      const result = await service.crear(inputSegundoHijo);

      // Assert
      expect(result.precioFinal).toBe(36000);
      expect(result.descuentoPorcentaje).toBe(10);
    });

    it('should_throw_error_when_tutor_not_found', async () => {
      // Arrange
      prisma.tutor.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.crear(crearInput)).rejects.toThrow(PreApprovalError);
      await expect(service.crear(crearInput)).rejects.toMatchObject({
        code: PreApprovalErrorCode.TUTOR_NOT_FOUND,
      });
    });

    it('should_throw_error_when_plan_not_found', async () => {
      // Arrange
      prisma.tutor.findUnique.mockResolvedValue(mockTutor);
      prisma.planSuscripcion.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.crear(crearInput)).rejects.toThrow(PreApprovalError);
      await expect(service.crear(crearInput)).rejects.toMatchObject({
        code: PreApprovalErrorCode.PLAN_NOT_FOUND,
      });
    });

    it('should_throw_error_when_plan_inactive', async () => {
      // Arrange
      prisma.tutor.findUnique.mockResolvedValue(mockTutor);
      prisma.planSuscripcion.findUnique.mockResolvedValue({
        ...mockPlan,
        activo: false,
      });

      // Act & Assert
      await expect(service.crear(crearInput)).rejects.toThrow(PreApprovalError);
      await expect(service.crear(crearInput)).rejects.toMatchObject({
        code: PreApprovalErrorCode.PLAN_NOT_FOUND,
      });
    });

    it('should_call_mp_api_with_correct_data', async () => {
      // Arrange
      prisma.tutor.findUnique.mockResolvedValue(mockTutor);
      prisma.planSuscripcion.findUnique.mockResolvedValue(mockPlan);
      prisma.suscripcion.create.mockResolvedValue({
        id: 'suscripcion-123',
        tutor_id: 'tutor-123',
        plan_id: 'plan-123',
        precio_final: { toNumber: () => 40000 },
        descuento_porcentaje: 0,
        estado: EstadoSuscripcion.PENDIENTE,
      });

      mockPreApprovalClient.create.mockResolvedValue({
        id: 'mp-preapproval-123',
        init_point: 'https://mercadopago.com/checkout/123',
        status: 'pending',
      });

      // Act
      await service.crear(crearInput);

      // Assert
      expect(mockPreApprovalClient.create).toHaveBeenCalledWith({
        body: expect.objectContaining({
          payer_email: 'tutor@test.com',
          reason: expect.stringContaining('STEAM_LIBROS'),
          auto_recurring: expect.objectContaining({
            frequency: 1,
            frequency_type: 'months',
            transaction_amount: 40000,
            currency_id: 'ARS',
          }),
        }),
      });
    });
  });

  describe('cancelar', () => {
    const mockSuscripcion = {
      id: 'suscripcion-123',
      tutor_id: 'tutor-123',
      mp_preapproval_id: 'mp-preapproval-123',
      estado: EstadoSuscripcion.ACTIVA,
      plan: { nombre: 'STEAM_LIBROS' },
    };

    const cancelarInput: CancelarSuscripcionInput = {
      suscripcionId: 'suscripcion-123',
      tutorId: 'tutor-123',
      motivo: 'Ya no necesito el servicio',
      canceladoPor: 'tutor',
    };

    it('should_cancel_subscription_when_valid', async () => {
      // Arrange
      prisma.suscripcion.findUnique.mockResolvedValue(mockSuscripcion);
      prisma.suscripcion.update.mockResolvedValue({
        ...mockSuscripcion,
        estado: EstadoSuscripcion.CANCELADA,
      });
      mockPreApprovalClient.update.mockResolvedValue({ status: 'cancelled' });

      // Act
      await service.cancelar(cancelarInput);

      // Assert
      expect(mockPreApprovalClient.update).toHaveBeenCalledWith({
        id: 'mp-preapproval-123',
        body: { status: 'cancelled' },
      });

      expect(prisma.suscripcion.update).toHaveBeenCalledWith({
        where: { id: 'suscripcion-123' },
        data: expect.objectContaining({
          estado: EstadoSuscripcion.CANCELADA,
          motivo_cancelacion: 'Ya no necesito el servicio',
          cancelado_por: 'tutor',
        }),
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        SuscripcionCanceladaEvent.EVENT_NAME,
        expect.any(SuscripcionCanceladaEvent),
      );
    });

    it('should_throw_error_when_subscription_not_found', async () => {
      // Arrange
      prisma.suscripcion.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.cancelar(cancelarInput)).rejects.toMatchObject({
        code: PreApprovalErrorCode.NOT_FOUND,
      });
    });

    it('should_throw_error_when_tutor_not_owner', async () => {
      // Arrange
      prisma.suscripcion.findUnique.mockResolvedValue({
        ...mockSuscripcion,
        tutor_id: 'otro-tutor',
      });

      // Act & Assert
      await expect(service.cancelar(cancelarInput)).rejects.toMatchObject({
        code: PreApprovalErrorCode.UNAUTHORIZED,
      });
    });

    it('should_throw_error_when_already_cancelled', async () => {
      // Arrange
      prisma.suscripcion.findUnique.mockResolvedValue({
        ...mockSuscripcion,
        estado: EstadoSuscripcion.CANCELADA,
      });

      // Act & Assert
      await expect(service.cancelar(cancelarInput)).rejects.toMatchObject({
        code: PreApprovalErrorCode.INVALID_STATE,
      });
    });
  });

  describe('calcularPrecioConDescuento', () => {
    it('should_return_full_price_for_first_child', () => {
      const resultado = service.calcularPrecioConDescuento(40000, 1);

      expect(resultado.precioFinal).toBe(40000);
      expect(resultado.descuentoPorcentaje).toBe(0);
      expect(resultado.descuentoMonto).toBe(0);
    });

    it('should_apply_10_percent_for_second_child', () => {
      const resultado = service.calcularPrecioConDescuento(40000, 2);

      expect(resultado.precioFinal).toBe(36000);
      expect(resultado.descuentoPorcentaje).toBe(10);
      expect(resultado.descuentoMonto).toBe(4000);
    });

    it('should_apply_20_percent_for_third_child', () => {
      const resultado = service.calcularPrecioConDescuento(40000, 3);

      expect(resultado.precioFinal).toBe(32000);
      expect(resultado.descuentoPorcentaje).toBe(20);
      expect(resultado.descuentoMonto).toBe(8000);
    });

    it('should_cap_discount_at_50_percent', () => {
      const resultado = service.calcularPrecioConDescuento(40000, 10);

      expect(resultado.descuentoPorcentaje).toBe(50);
      expect(resultado.precioFinal).toBe(20000);
    });
  });

  describe('Circuit Breaker', () => {
    it('should_throw_circuit_open_error_when_mp_unavailable', async () => {
      // Arrange
      const crearInput: CrearSuscripcionInput = {
        tutorId: 'tutor-123',
        planId: 'plan-123',
        tutorEmail: 'tutor@test.com',
        tutorNombre: 'Juan Pérez',
        numeroHijo: 1,
      };

      prisma.tutor.findUnique.mockResolvedValue({
        id: 'tutor-123',
        email: 'tutor@test.com',
      });
      prisma.planSuscripcion.findUnique.mockResolvedValue({
        id: 'plan-123',
        precio_base: { toNumber: () => 40000 },
        activo: true,
      });
      prisma.suscripcion.create.mockResolvedValue({
        id: 'suscripcion-123',
        precio_final: { toNumber: () => 40000 },
      });

      // Simular que el circuit breaker está abierto
      mockPreApprovalClient.create.mockRejectedValue(
        new Error('Circuit breaker is OPEN'),
      );

      // Forzar apertura del circuit breaker con múltiples fallos
      for (let i = 0; i < 5; i++) {
        try {
          await service.crear(crearInput);
        } catch {
          // Esperamos que falle
        }
      }

      // Act & Assert - el próximo intento debería fallar inmediatamente
      await expect(service.crear(crearInput)).rejects.toThrow();
    });
  });
});
