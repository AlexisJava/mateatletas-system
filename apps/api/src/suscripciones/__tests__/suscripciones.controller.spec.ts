import { Test, TestingModule } from '@nestjs/testing';
import { EstadoSuscripcion } from '@prisma/client';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SuscripcionesController } from '../presentation/suscripciones.controller';
import { SuscripcionQueryService } from '../services/suscripcion-query.service';
import { SuscripcionAdminService } from '../services/suscripcion-admin.service';
import { PreapprovalService } from '../services/preapproval.service';
import { PrismaService } from '../../core/database/prisma.service';

describe('SuscripcionesController', () => {
  let controller: SuscripcionesController;
  let queryService: jest.Mocked<SuscripcionQueryService>;
  let adminService: jest.Mocked<SuscripcionAdminService>;
  let preapprovalService: jest.Mocked<PreapprovalService>;
  let prisma: jest.Mocked<PrismaService>;

  const mockQueryService = {
    getPlanes: jest.fn(),
    getMisSuscripciones: jest.fn(),
    getSuscripcionDetalle: jest.fn(),
    getHistorialPagos: jest.fn(),
  };

  const mockAdminService = {
    listarTodas: jest.fn(),
    listarMorosas: jest.fn(),
    getMetricas: jest.fn(),
  };

  const mockPreapprovalService = {
    crear: jest.fn(),
    cancelar: jest.fn(),
  };

  const mockPrisma = {
    estudiante: {
      findMany: jest.fn(),
    },
    planSuscripcion: {
      findUnique: jest.fn(),
    },
    claseGrupo: {
      findUnique: jest.fn(),
    },
    suscripcion: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuscripcionesController],
      providers: [
        { provide: SuscripcionQueryService, useValue: mockQueryService },
        { provide: SuscripcionAdminService, useValue: mockAdminService },
        { provide: PreapprovalService, useValue: mockPreapprovalService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    controller = module.get<SuscripcionesController>(SuscripcionesController);
    queryService = module.get(SuscripcionQueryService);
    adminService = module.get(SuscripcionAdminService);
    preapprovalService = module.get(PreapprovalService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('GET /planes', () => {
    it('should_return_list_of_plans', async () => {
      const mockPlanes = {
        planes: [
          {
            id: 'plan-1',
            nombre: 'STEAM_LIBROS',
            descripcion: 'Plan básico',
            precio: 30000,
            features: ['Feature 1'],
          },
        ],
      };

      mockQueryService.getPlanes.mockResolvedValue(mockPlanes);

      const result = await controller.getPlanes();

      expect(result).toEqual(mockPlanes);
      expect(mockQueryService.getPlanes).toHaveBeenCalled();
    });
  });

  describe('POST /suscripciones', () => {
    const tutorId = 'tutor-123';
    const tutorUser = {
      id: tutorId,
      email: 'tutor@test.com',
      nombre: 'Juan',
      roles: ['tutor'],
    };

    it('should_create_subscription_successfully', async () => {
      const dto = {
        plan_id: 'plan-1',
        estudiante_ids: ['est-1', 'est-2'],
      };

      // Mock estudiantes pertenecen al tutor
      mockPrisma.estudiante.findMany.mockResolvedValue([
        { id: 'est-1', tutor_id: tutorId },
        { id: 'est-2', tutor_id: tutorId },
      ]);

      // Mock plan existe y no requiere clase
      mockPrisma.planSuscripcion.findUnique.mockResolvedValue({
        id: 'plan-1',
        nombre: 'STEAM_LIBROS',
        activo: true,
      });

      // Mock creación exitosa
      mockPreapprovalService.crear.mockResolvedValue({
        suscripcionId: 'sus-1',
        checkoutUrl: 'https://mp.com/checkout',
        precioFinal: 27000,
        descuentoPorcentaje: 10,
      });

      const result = await controller.crearSuscripcion(dto, tutorUser);

      expect(result.suscripcion_id).toBe('sus-1');
      expect(result.init_point).toBe('https://mp.com/checkout');
      expect(result.monto_final).toBe(27000);
    });

    it('should_fail_when_estudiante_not_belongs_to_tutor', async () => {
      const dto = {
        plan_id: 'plan-1',
        estudiante_ids: ['est-1'],
      };

      // Mock estudiante no pertenece al tutor
      mockPrisma.estudiante.findMany.mockResolvedValue([]);

      await expect(controller.crearSuscripcion(dto, tutorUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should_fail_when_sync_plan_without_clase_grupo', async () => {
      const dto = {
        plan_id: 'plan-sync',
        estudiante_ids: ['est-1'],
        // Sin clase_grupo_id
      };

      mockPrisma.estudiante.findMany.mockResolvedValue([
        { id: 'est-1', tutor_id: tutorId },
      ]);

      mockPrisma.planSuscripcion.findUnique.mockResolvedValue({
        id: 'plan-sync',
        nombre: 'STEAM_SINCRONICO', // Requiere clase
        activo: true,
      });

      await expect(controller.crearSuscripcion(dto, tutorUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('GET /suscripciones/mis-suscripciones', () => {
    it('should_return_tutor_subscriptions', async () => {
      const tutorUser = { id: 'tutor-123', roles: ['tutor'] };
      const mockSuscripciones = {
        suscripciones: [
          {
            id: 'sus-1',
            estado: EstadoSuscripcion.ACTIVA,
            plan: { id: 'plan-1', nombre: 'STEAM_LIBROS' },
          },
        ],
      };

      mockQueryService.getMisSuscripciones.mockResolvedValue(mockSuscripciones);

      const result = await controller.getMisSuscripciones(tutorUser);

      expect(result.suscripciones).toHaveLength(1);
      expect(mockQueryService.getMisSuscripciones).toHaveBeenCalledWith(
        'tutor-123',
      );
    });

    it('should_return_empty_array_when_no_subscriptions', async () => {
      const tutorUser = { id: 'tutor-123', roles: ['tutor'] };
      mockQueryService.getMisSuscripciones.mockResolvedValue({
        suscripciones: [],
      });

      const result = await controller.getMisSuscripciones(tutorUser);

      expect(result.suscripciones).toHaveLength(0);
    });
  });

  describe('GET /suscripciones/:id', () => {
    it('should_return_subscription_detail_with_payments', async () => {
      const tutorUser = { id: 'tutor-123', roles: ['tutor'] };
      const mockDetalle = {
        id: 'sus-1',
        estado: EstadoSuscripcion.ACTIVA,
        pagos: [{ id: 'pago-1', monto: 30000 }],
        historial_estados: [],
      };

      mockQueryService.getSuscripcionDetalle.mockResolvedValue(mockDetalle);

      const result = await controller.getSuscripcionDetalle('sus-1', tutorUser);

      expect(result.id).toBe('sus-1');
      expect(result.pagos).toHaveLength(1);
    });

    it('should_throw_forbidden_when_not_owner', async () => {
      const tutorUser = { id: 'tutor-123', roles: ['tutor'] };
      mockQueryService.getSuscripcionDetalle.mockRejectedValue(
        new ForbiddenException(),
      );

      await expect(
        controller.getSuscripcionDetalle('sus-1', tutorUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('POST /suscripciones/:id/cancelar', () => {
    it('should_cancel_subscription_and_return_end_date', async () => {
      const tutorUser = { id: 'tutor-123', roles: ['tutor'] };
      const fechaFinAcceso = new Date('2025-02-01');

      mockPrisma.suscripcion.findUnique.mockResolvedValue({
        id: 'sus-1',
        tutor_id: 'tutor-123',
        estado: EstadoSuscripcion.ACTIVA,
        fecha_proximo_cobro: fechaFinAcceso,
      });

      mockPreapprovalService.cancelar.mockResolvedValue(undefined);

      const result = await controller.cancelarSuscripcion('sus-1', tutorUser);

      expect(result.mensaje).toContain('cancelada');
      expect(result.fecha_fin_acceso).toEqual(fechaFinAcceso);
    });

    it('should_fail_when_already_cancelled', async () => {
      const tutorUser = { id: 'tutor-123', roles: ['tutor'] };

      mockPrisma.suscripcion.findUnique.mockResolvedValue({
        id: 'sus-1',
        tutor_id: 'tutor-123',
        estado: EstadoSuscripcion.CANCELADA,
      });

      await expect(
        controller.cancelarSuscripcion('sus-1', tutorUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('GET /suscripciones/:id/pagos', () => {
    it('should_return_payment_history', async () => {
      const tutorUser = { id: 'tutor-123', roles: ['tutor'] };
      const mockPagos = {
        pagos: [
          { id: 'pago-1', monto: 30000, estado: 'approved' },
          { id: 'pago-2', monto: 30000, estado: 'approved' },
        ],
        total: 2,
      };

      mockQueryService.getHistorialPagos.mockResolvedValue(mockPagos);

      const result = await controller.getHistorialPagos('sus-1', tutorUser);

      expect(result.pagos).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  // === ADMIN ENDPOINTS ===

  describe('GET /admin/suscripciones', () => {
    it('should_return_paginated_subscriptions', async () => {
      const mockResponse = {
        data: [
          {
            id: 'sus-1',
            estado: EstadoSuscripcion.ACTIVA,
            tutor: { nombre: 'Juan' },
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      mockAdminService.listarTodas.mockResolvedValue(mockResponse);

      const result = await controller.adminListar({});

      expect(result.data).toHaveLength(1);
      expect(mockAdminService.listarTodas).toHaveBeenCalled();
    });
  });

  describe('GET /admin/suscripciones/morosas', () => {
    it('should_return_morosas_list', async () => {
      const mockMorosas = {
        suscripciones: [{ id: 'sus-1', estado: EstadoSuscripcion.MOROSA }],
        total: 1,
      };

      mockAdminService.listarMorosas.mockResolvedValue(mockMorosas);

      const result = await controller.adminListarMorosas();

      expect(result.total).toBe(1);
    });
  });

  describe('GET /admin/suscripciones/metricas', () => {
    it('should_return_dashboard_metrics', async () => {
      const mockMetricas = {
        total_activas: 50,
        total_morosas: 5,
        total_en_gracia: 3,
        total_canceladas_mes: 2,
        ingresos_mes: 1500000,
        tasa_cancelacion: 3.33,
      };

      mockAdminService.getMetricas.mockResolvedValue(mockMetricas);

      const result = await controller.adminGetMetricas();

      expect(result.total_activas).toBe(50);
      expect(result.ingresos_mes).toBe(1500000);
    });
  });
});
