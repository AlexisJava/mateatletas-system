import { Test, TestingModule } from '@nestjs/testing';
import { PaymentStateMapperService } from '../payment-state-mapper.service';
import { EstadoPago, EstadoMercadoPago } from '../../../domain/constants';

describe('PaymentStateMapperService', () => {
  let service: PaymentStateMapperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentStateMapperService],
    }).compile();

    service = module.get<PaymentStateMapperService>(PaymentStateMapperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('mapearEstadoPago', () => {
    it('debe mapear approved a PAGADO', () => {
      expect(service.mapearEstadoPago('approved')).toBe(EstadoPago.PAGADO);
    });

    it('debe mapear rejected a RECHAZADO', () => {
      expect(service.mapearEstadoPago('rejected')).toBe(EstadoPago.RECHAZADO);
    });

    it('debe mapear cancelled a CANCELADO', () => {
      expect(service.mapearEstadoPago('cancelled')).toBe(EstadoPago.CANCELADO);
    });

    it('debe mapear pending a PENDIENTE', () => {
      expect(service.mapearEstadoPago('pending')).toBe(EstadoPago.PENDIENTE);
    });

    it('debe mapear authorized a PAGADO', () => {
      expect(service.mapearEstadoPago('authorized')).toBe(EstadoPago.PAGADO);
    });

    it('debe usar PENDIENTE como default para estado desconocido', () => {
      expect(service.mapearEstadoPago('unknown_status')).toBe(
        EstadoPago.PENDIENTE,
      );
    });

    it('debe mapear refunded a REEMBOLSADO', () => {
      expect(service.mapearEstadoPago('refunded')).toBe(EstadoPago.REEMBOLSADO);
    });
  });

  describe('mapearEstadoMembresia', () => {
    it('debe mapear PAGADO a Activa', () => {
      expect(service.mapearEstadoMembresia(EstadoPago.PAGADO)).toBe('Activa');
    });

    it('debe mapear RECHAZADO a Pendiente', () => {
      expect(service.mapearEstadoMembresia(EstadoPago.RECHAZADO)).toBe(
        'Pendiente',
      );
    });

    it('debe mapear CANCELADO a Pendiente', () => {
      expect(service.mapearEstadoMembresia(EstadoPago.CANCELADO)).toBe(
        'Pendiente',
      );
    });

    it('debe mapear EXPIRADO a Atrasada', () => {
      expect(service.mapearEstadoMembresia(EstadoPago.EXPIRADO)).toBe(
        'Atrasada',
      );
    });

    it('debe mapear PENDIENTE a Pendiente', () => {
      expect(service.mapearEstadoMembresia(EstadoPago.PENDIENTE)).toBe(
        'Pendiente',
      );
    });

    it('debe mapear REEMBOLSADO a Cancelada (usuario pierde acceso tras refund/chargeback)', () => {
      expect(service.mapearEstadoMembresia(EstadoPago.REEMBOLSADO)).toBe(
        'Cancelada',
      );
    });
  });

  describe('mapearEstadoInscripcion', () => {
    it('debe mapear PAGADO a Pagado', () => {
      expect(service.mapearEstadoInscripcion(EstadoPago.PAGADO)).toBe('Pagado');
    });

    it('debe mapear RECHAZADO a Pendiente', () => {
      expect(service.mapearEstadoInscripcion(EstadoPago.RECHAZADO)).toBe(
        'Pendiente',
      );
    });

    it('debe mapear CANCELADO a Pendiente', () => {
      expect(service.mapearEstadoInscripcion(EstadoPago.CANCELADO)).toBe(
        'Pendiente',
      );
    });

    it('debe mapear PENDIENTE a Pendiente', () => {
      expect(service.mapearEstadoInscripcion(EstadoPago.PENDIENTE)).toBe(
        'Pendiente',
      );
    });

    it('debe mapear REEMBOLSADO a Vencido (inscripción invalidada tras refund)', () => {
      expect(service.mapearEstadoInscripcion(EstadoPago.REEMBOLSADO)).toBe(
        'Vencido',
      );
    });

    it('debe mapear EXPIRADO a Vencido', () => {
      expect(service.mapearEstadoInscripcion(EstadoPago.EXPIRADO)).toBe(
        'Vencido',
      );
    });
  });

  describe('procesarEstadoMembresia', () => {
    it('debe procesar estado completo de membresía para approved', () => {
      const result = service.procesarEstadoMembresia('approved');
      expect(result.estadoPago).toBe(EstadoPago.PAGADO);
      expect(result.estadoMembresia).toBe('Activa'); // EstadoMembresia.Activa
    });

    it('debe procesar estado completo de membresía para rejected', () => {
      const result = service.procesarEstadoMembresia('rejected');
      expect(result.estadoPago).toBe(EstadoPago.RECHAZADO);
      expect(result.estadoMembresia).toBe('Pendiente');
    });

    it('debe procesar estado completo de membresía para pending', () => {
      const result = service.procesarEstadoMembresia('pending');
      expect(result.estadoPago).toBe(EstadoPago.PENDIENTE);
      expect(result.estadoMembresia).toBe('Pendiente');
    });

    it('debe procesar refunded como Cancelada (usuario pierde acceso)', () => {
      const result = service.procesarEstadoMembresia('refunded');
      expect(result.estadoPago).toBe(EstadoPago.REEMBOLSADO);
      expect(result.estadoMembresia).toBe('Cancelada');
    });

    it('debe procesar charged_back como Cancelada (chargeback = pierde acceso)', () => {
      const result = service.procesarEstadoMembresia('charged_back');
      expect(result.estadoPago).toBe(EstadoPago.REEMBOLSADO);
      expect(result.estadoMembresia).toBe('Cancelada');
    });
  });

  describe('procesarEstadoInscripcion', () => {
    it('debe procesar estado completo de inscripción para approved', () => {
      const result = service.procesarEstadoInscripcion('approved');
      expect(result.estadoPago).toBe(EstadoPago.PAGADO);
      expect(result.estadoInscripcion).toBe('Pagado');
    });

    it('debe procesar estado completo de inscripción para rejected', () => {
      const result = service.procesarEstadoInscripcion('rejected');
      expect(result.estadoPago).toBe(EstadoPago.RECHAZADO);
      expect(result.estadoInscripcion).toBe('Pendiente');
    });
  });

  describe('esEstadoValido', () => {
    it('debe retornar true para estados válidos de MercadoPago', () => {
      expect(service.esEstadoValido('approved')).toBe(true);
      expect(service.esEstadoValido('rejected')).toBe(true);
      expect(service.esEstadoValido('pending')).toBe(true);
      expect(service.esEstadoValido('cancelled')).toBe(true);
    });

    it('debe retornar false para estados inválidos', () => {
      expect(service.esEstadoValido('invalid_state')).toBe(false);
      expect(service.esEstadoValido('')).toBe(false);
    });
  });

  describe('esPagoExitoso', () => {
    it('debe retornar true para PAGADO', () => {
      expect(service.esPagoExitoso(EstadoPago.PAGADO)).toBe(true);
    });

    it('debe retornar false para otros estados', () => {
      expect(service.esPagoExitoso(EstadoPago.RECHAZADO)).toBe(false);
      expect(service.esPagoExitoso(EstadoPago.PENDIENTE)).toBe(false);
      expect(service.esPagoExitoso(EstadoPago.CANCELADO)).toBe(false);
      expect(service.esPagoExitoso(EstadoPago.EXPIRADO)).toBe(false);
    });
  });

  describe('esPagoFallido', () => {
    it('debe retornar true para RECHAZADO', () => {
      expect(service.esPagoFallido(EstadoPago.RECHAZADO)).toBe(true);
    });

    it('debe retornar true para CANCELADO', () => {
      expect(service.esPagoFallido(EstadoPago.CANCELADO)).toBe(true);
    });

    it('debe retornar false para otros estados', () => {
      expect(service.esPagoFallido(EstadoPago.PAGADO)).toBe(false);
      expect(service.esPagoFallido(EstadoPago.PENDIENTE)).toBe(false);
      expect(service.esPagoFallido(EstadoPago.EXPIRADO)).toBe(false);
    });
  });

  describe('permiteReintentar', () => {
    it('debe retornar true para PENDIENTE', () => {
      expect(service.permiteReintentar(EstadoPago.PENDIENTE)).toBe(true);
    });

    it('debe retornar true para RECHAZADO', () => {
      expect(service.permiteReintentar(EstadoPago.RECHAZADO)).toBe(true);
    });

    it('debe retornar true para CANCELADO', () => {
      expect(service.permiteReintentar(EstadoPago.CANCELADO)).toBe(true);
    });

    it('debe retornar false para PAGADO', () => {
      expect(service.permiteReintentar(EstadoPago.PAGADO)).toBe(false);
    });

    it('debe retornar false para EXPIRADO', () => {
      expect(service.permiteReintentar(EstadoPago.EXPIRADO)).toBe(false);
    });
  });
});
