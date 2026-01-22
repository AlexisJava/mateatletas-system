/**
 * Unit Tests - PagosManagementFacadeService
 *
 * El Facade es un orquestador puro (no tiene lógica de negocio).
 * Estos tests verifican que delega correctamente a los servicios especializados.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PagosManagementFacadeService } from '../pagos-management-facade.service';
import { PaymentQueryService } from '../payment-query.service';
import { PaymentCommandService } from '../payment-command.service';
import { PaymentWebhookService } from '../payment-webhook.service';
import { PaymentStateMapperService } from '../payment-state-mapper.service';
import { EstadoPago } from '../../../domain/constants';

describe('PagosManagementFacadeService', () => {
  let facade: PagosManagementFacadeService;
  let queryService: jest.Mocked<PaymentQueryService>;
  let commandService: jest.Mocked<PaymentCommandService>;
  let webhookService: jest.Mocked<PaymentWebhookService>;
  let stateMapper: jest.Mocked<PaymentStateMapperService>;

  beforeEach(async () => {
    const mockQueryService = {
      findAllInscripciones: jest.fn(),
      findInscripcionById: jest.fn(),
      tieneInscripcionPendiente: jest.fn(),
      obtenerConfiguracion: jest.fn(),
      obtenerHistorialCambios: jest.fn(),
      obtenerInscripcionesPendientes: jest.fn(),
      obtenerEstudiantesConDescuentos: jest.fn(),
      findInscripcionPorPeriodo: jest.fn(),
    };

    const mockCommandService = {
      registrarPagoManual: jest.fn(),
      actualizarEstadoInscripcion: jest.fn(),
    };

    const mockWebhookService = {
      procesarWebhookMercadoPago: jest.fn(),
    };

    const mockStateMapper = {
      mapearEstadoPago: jest.fn(),
      esPagoExitoso: jest.fn(),
      esPagoFallido: jest.fn(),
      permiteReintentar: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagosManagementFacadeService,
        { provide: PaymentQueryService, useValue: mockQueryService },
        { provide: PaymentCommandService, useValue: mockCommandService },
        { provide: PaymentWebhookService, useValue: mockWebhookService },
        { provide: PaymentStateMapperService, useValue: mockStateMapper },
      ],
    }).compile();

    facade = module.get<PagosManagementFacadeService>(
      PagosManagementFacadeService,
    );
    queryService = module.get(PaymentQueryService);
    commandService = module.get(PaymentCommandService);
    webhookService = module.get(PaymentWebhookService);
    stateMapper = module.get(PaymentStateMapperService);
  });

  describe('Queries - Delegación a PaymentQueryService', () => {
    it('findAllInscripciones debe delegar a queryService', async () => {
      const params = { page: 1, limit: 10 };
      const expectedResult = { data: [], total: 0 };
      queryService.findAllInscripciones.mockResolvedValue(expectedResult);

      const result = await facade.findAllInscripciones(params);

      expect(queryService.findAllInscripciones).toHaveBeenCalledWith(params);
      expect(result).toBe(expectedResult);
    });

    it('findInscripcionById debe delegar a queryService', async () => {
      const inscripcionId = 'insc-123';
      const expectedResult = { id: inscripcionId, periodo: '2026-01' };
      queryService.findInscripcionById.mockResolvedValue(expectedResult);

      const result = await facade.findInscripcionById(inscripcionId);

      expect(queryService.findInscripcionById).toHaveBeenCalledWith(
        inscripcionId,
      );
      expect(result).toBe(expectedResult);
    });

    it('tieneInscripcionPendiente debe delegar a queryService', async () => {
      queryService.tieneInscripcionPendiente.mockResolvedValue(true);

      const result = await facade.tieneInscripcionPendiente('est-1', 2026, 1);

      expect(queryService.tieneInscripcionPendiente).toHaveBeenCalledWith(
        'est-1',
        2026,
        1,
      );
      expect(result).toBe(true);
    });

    it('obtenerConfiguracion debe delegar a queryService', async () => {
      const config = { precioBase: 10000 };
      queryService.obtenerConfiguracion.mockResolvedValue(config);

      const result = await facade.obtenerConfiguracion();

      expect(queryService.obtenerConfiguracion).toHaveBeenCalled();
      expect(result).toBe(config);
    });

    it('obtenerHistorialCambios debe delegar a queryService', async () => {
      const historial = [{ fecha: new Date(), cambio: 'test' }];
      queryService.obtenerHistorialCambios.mockResolvedValue(historial);

      const result = await facade.obtenerHistorialCambios(5);

      expect(queryService.obtenerHistorialCambios).toHaveBeenCalledWith(5);
      expect(result).toBe(historial);
    });

    it('obtenerInscripcionesPendientes debe delegar a queryService', async () => {
      const pendientes = [{ id: '1' }, { id: '2' }];
      queryService.obtenerInscripcionesPendientes.mockResolvedValue(pendientes);

      const result = await facade.obtenerInscripcionesPendientes();

      expect(queryService.obtenerInscripcionesPendientes).toHaveBeenCalled();
      expect(result).toBe(pendientes);
    });

    it('obtenerEstudiantesConDescuentos debe delegar a queryService', async () => {
      const estudiantes = [{ id: 'est-1', descuento: 10 }];
      queryService.obtenerEstudiantesConDescuentos.mockResolvedValue(
        estudiantes,
      );

      const result = await facade.obtenerEstudiantesConDescuentos();

      expect(queryService.obtenerEstudiantesConDescuentos).toHaveBeenCalled();
      expect(result).toBe(estudiantes);
    });

    it('findInscripcionPorPeriodo debe delegar a queryService', async () => {
      const inscripcion = { id: 'insc-1', periodo: '2026-01' };
      queryService.findInscripcionPorPeriodo.mockResolvedValue(inscripcion);

      const result = await facade.findInscripcionPorPeriodo('est-1', 2026, 1);

      expect(queryService.findInscripcionPorPeriodo).toHaveBeenCalledWith(
        'est-1',
        2026,
        1,
      );
      expect(result).toBe(inscripcion);
    });
  });

  describe('Commands - Delegación a PaymentCommandService', () => {
    it('registrarPagoManual debe delegar a commandService', async () => {
      const dto = {
        estudianteId: 'est-1',
        periodo: '2026-01',
        monto: 10000,
        metodoPago: 'Efectivo',
      };
      const expectedResult = { success: true, inscripcionId: 'insc-1' };
      commandService.registrarPagoManual.mockResolvedValue(expectedResult);

      const result = await facade.registrarPagoManual(dto);

      expect(commandService.registrarPagoManual).toHaveBeenCalledWith(dto);
      expect(result).toBe(expectedResult);
    });

    it('actualizarEstadoInscripcion debe delegar a commandService', async () => {
      const inscripcionId = 'insc-1';
      const estado = EstadoPago.PAGADO;
      const expectedResult = { id: inscripcionId, estadoPago: estado };
      commandService.actualizarEstadoInscripcion.mockResolvedValue(
        expectedResult,
      );

      const result = await facade.actualizarEstadoInscripcion(
        inscripcionId,
        estado,
      );

      expect(commandService.actualizarEstadoInscripcion).toHaveBeenCalledWith(
        inscripcionId,
        estado,
      );
      expect(result).toBe(expectedResult);
    });
  });

  describe('Webhooks - Delegación a PaymentWebhookService', () => {
    it('procesarWebhookMercadoPago debe delegar a webhookService', async () => {
      const webhookData = {
        type: 'payment',
        action: 'payment.created',
        data: { id: 'MP-123' },
      };
      const expectedResult = { success: true, type: 'inscripcion' };
      webhookService.procesarWebhookMercadoPago.mockResolvedValue(
        expectedResult,
      );

      const result = await facade.procesarWebhookMercadoPago(webhookData);

      expect(webhookService.procesarWebhookMercadoPago).toHaveBeenCalledWith(
        webhookData,
      );
      expect(result).toBe(expectedResult);
    });
  });

  describe('Utilities - Delegación a PaymentStateMapperService', () => {
    it('mapearEstadoPago debe delegar a stateMapper', () => {
      stateMapper.mapearEstadoPago.mockReturnValue(EstadoPago.PAGADO);

      const result = facade.mapearEstadoPago('approved');

      expect(stateMapper.mapearEstadoPago).toHaveBeenCalledWith('approved');
      expect(result).toBe(EstadoPago.PAGADO);
    });

    it('esPagoExitoso debe delegar a stateMapper', () => {
      stateMapper.esPagoExitoso.mockReturnValue(true);

      const result = facade.esPagoExitoso(EstadoPago.PAGADO);

      expect(stateMapper.esPagoExitoso).toHaveBeenCalledWith(EstadoPago.PAGADO);
      expect(result).toBe(true);
    });

    it('esPagoFallido debe delegar a stateMapper', () => {
      stateMapper.esPagoFallido.mockReturnValue(false);

      const result = facade.esPagoFallido(EstadoPago.PENDIENTE);

      expect(stateMapper.esPagoFallido).toHaveBeenCalledWith(
        EstadoPago.PENDIENTE,
      );
      expect(result).toBe(false);
    });

    it('permiteReintentar debe delegar a stateMapper', () => {
      stateMapper.permiteReintentar.mockReturnValue(true);

      const result = facade.permiteReintentar(EstadoPago.PENDIENTE);

      expect(stateMapper.permiteReintentar).toHaveBeenCalledWith(
        EstadoPago.PENDIENTE,
      );
      expect(result).toBe(true);
    });
  });
});
