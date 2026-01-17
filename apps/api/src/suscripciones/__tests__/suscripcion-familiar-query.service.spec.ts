/**
 * Tests unitarios para SuscripcionFamiliarQueryService
 *
 * Operaciones de LECTURA:
 * - obtenerPorTutorId
 * - obtenerPorId
 * - simularMonto
 * - listarTodas
 */
import { Test, TestingModule } from '@nestjs/testing';
import { SuscripcionFamiliarQueryService } from '../services/suscripcion-familiar-query.service';
import { PrismaService } from '../../core/database/prisma.service';
import {
  SuscripcionFamiliarError,
  SuscripcionFamiliarErrorCode,
} from '../types';

describe('SuscripcionFamiliarQueryService', () => {
  let service: SuscripcionFamiliarQueryService;

  // ============================================================================
  // MOCKS
  // ============================================================================
  const mockPrisma = {
    suscripcionFamiliar: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    producto: {
      findMany: jest.fn(),
    },
  };

  // Mock de suscripción para reutilizar
  const createMockSuscripcion = (overrides = {}) => ({
    id: 'sus-fam-123',
    tutor_id: 'tutor-123',
    tutor: { nombre: 'Juan', apellido: 'Pérez' },
    estado: 'ACTIVA',
    tier: 'STEAM_SINCRONICO',
    monto_mensual: 95000,
    fecha_proximo_cobro: new Date('2026-02-01'),
    fecha_gracia: null,
    created_at: new Date('2026-01-01'),
    updated_at: new Date('2026-01-01'),
    inscripciones: [
      {
        id: 'insc-1',
        estudiante_id: 'est-1',
        estudiante: { id: 'est-1', nombre: 'Lucas', apellido: 'Pérez' },
        producto_id: 'prod-1',
        producto: {
          id: 'prod-1',
          nombre: 'Club Matemática',
          precio: { toNumber: () => 95000 },
        },
        clase_grupo_id: 'cg-1',
        clase_grupo: { id: 'cg-1', nombre: 'Lunes 18:00' },
        comision_id: null,
        comision: null,
        estado: 'ACTIVA',
        fecha_inicio: new Date('2026-01-01'),
        fecha_fin: null,
      },
    ],
    ...overrides,
  });

  // ============================================================================
  // SETUP
  // ============================================================================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuscripcionFamiliarQueryService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SuscripcionFamiliarQueryService>(
      SuscripcionFamiliarQueryService,
    );

    jest.clearAllMocks();
  });

  // ============================================================================
  // obtenerPorTutorId
  // ============================================================================
  describe('obtenerPorTutorId', () => {
    it('should_return_subscription_when_tutor_has_one', async () => {
      const mockSuscripcion = createMockSuscripcion();
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue(
        mockSuscripcion,
      );

      const result = await service.obtenerPorTutorId('tutor-123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('sus-fam-123');
      expect(result?.tutorNombre).toBe('Juan Pérez');
      expect(result?.estado).toBe('ACTIVA');
      expect(result?.tier).toBe('STEAM_SINCRONICO');
      expect(result?.inscripciones).toHaveLength(1);
      expect(mockPrisma.suscripcionFamiliar.findUnique).toHaveBeenCalledWith({
        where: { tutor_id: 'tutor-123' },
        include: expect.any(Object),
      });
    });

    it('should_return_null_when_tutor_has_no_subscription', async () => {
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue(null);

      const result = await service.obtenerPorTutorId('tutor-sin-suscripcion');

      expect(result).toBeNull();
    });

    it('should_calculate_discount_for_multiple_inscriptions', async () => {
      const mockSuscripcion = createMockSuscripcion({
        inscripciones: [
          {
            id: 'insc-1',
            estudiante_id: 'est-1',
            estudiante: { id: 'est-1', nombre: 'Lucas', apellido: 'Pérez' },
            producto_id: 'prod-1',
            producto: {
              id: 'prod-1',
              nombre: 'Club Matemática',
              precio: { toNumber: () => 95000 },
            },
            clase_grupo_id: 'cg-1',
            clase_grupo: { id: 'cg-1', nombre: 'Lunes 18:00' },
            comision_id: null,
            comision: null,
            estado: 'ACTIVA',
            fecha_inicio: new Date('2026-01-01'),
            fecha_fin: null,
          },
          {
            id: 'insc-2',
            estudiante_id: 'est-2',
            estudiante: { id: 'est-2', nombre: 'María', apellido: 'Pérez' },
            producto_id: 'prod-2',
            producto: {
              id: 'prod-2',
              nombre: 'Club Programación',
              precio: { toNumber: () => 95000 },
            },
            clase_grupo_id: 'cg-2',
            clase_grupo: { id: 'cg-2', nombre: 'Martes 19:00' },
            comision_id: null,
            comision: null,
            estado: 'ACTIVA',
            fecha_inicio: new Date('2026-01-01'),
            fecha_fin: null,
          },
        ],
      });

      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue(
        mockSuscripcion,
      );

      const result = await service.obtenerPorTutorId('tutor-123');

      expect(result?.inscripciones).toHaveLength(2);
      // Primera inscripción: sin descuento
      expect(result?.inscripciones[0].descuentoAplicado).toBe(0);
      expect(result?.inscripciones[0].precioConDescuento).toBe(95000);
      // Segunda inscripción: 10% descuento
      expect(result?.inscripciones[1].descuentoAplicado).toBe(10);
      expect(result?.inscripciones[1].precioConDescuento).toBe(85500);
    });

    it('should_count_unique_students', async () => {
      const mockSuscripcion = createMockSuscripcion({
        inscripciones: [
          {
            id: 'insc-1',
            estudiante_id: 'est-1',
            estudiante: { id: 'est-1', nombre: 'Lucas', apellido: 'Pérez' },
            producto_id: 'prod-1',
            producto: {
              id: 'prod-1',
              nombre: 'Club A',
              precio: { toNumber: () => 95000 },
            },
            clase_grupo_id: null,
            clase_grupo: null,
            comision_id: null,
            comision: null,
            estado: 'ACTIVA',
            fecha_inicio: new Date(),
            fecha_fin: null,
          },
          {
            id: 'insc-2',
            estudiante_id: 'est-1', // Mismo estudiante, otra actividad
            estudiante: { id: 'est-1', nombre: 'Lucas', apellido: 'Pérez' },
            producto_id: 'prod-2',
            producto: {
              id: 'prod-2',
              nombre: 'Club B',
              precio: { toNumber: () => 95000 },
            },
            clase_grupo_id: null,
            clase_grupo: null,
            comision_id: null,
            comision: null,
            estado: 'ACTIVA',
            fecha_inicio: new Date(),
            fecha_fin: null,
          },
        ],
      });

      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue(
        mockSuscripcion,
      );

      const result = await service.obtenerPorTutorId('tutor-123');

      // 2 actividades pero solo 1 estudiante único
      expect(result?.cantidadActividades).toBe(2);
      expect(result?.cantidadEstudiantes).toBe(1);
    });
  });

  // ============================================================================
  // obtenerPorId
  // ============================================================================
  describe('obtenerPorId', () => {
    it('should_return_subscription_when_found', async () => {
      const mockSuscripcion = createMockSuscripcion();
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue(
        mockSuscripcion,
      );

      const result = await service.obtenerPorId('sus-fam-123');

      expect(result.id).toBe('sus-fam-123');
      expect(result.tutorId).toBe('tutor-123');
    });

    it('should_throw_not_found_when_subscription_not_exists', async () => {
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue(null);

      await expect(service.obtenerPorId('sus-inexistente')).rejects.toThrow(
        SuscripcionFamiliarError,
      );

      try {
        await service.obtenerPorId('sus-inexistente');
      } catch (error) {
        expect(error).toBeInstanceOf(SuscripcionFamiliarError);
        expect((error as SuscripcionFamiliarError).code).toBe(
          SuscripcionFamiliarErrorCode.NOT_FOUND,
        );
      }
    });

    it('should_throw_unauthorized_when_tutor_not_owner', async () => {
      const mockSuscripcion = createMockSuscripcion({ tutor_id: 'otro-tutor' });
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue(
        mockSuscripcion,
      );

      await expect(
        service.obtenerPorId('sus-fam-123', 'tutor-123'),
      ).rejects.toThrow(SuscripcionFamiliarError);

      try {
        await service.obtenerPorId('sus-fam-123', 'tutor-123');
      } catch (error) {
        expect(error).toBeInstanceOf(SuscripcionFamiliarError);
        expect((error as SuscripcionFamiliarError).code).toBe(
          SuscripcionFamiliarErrorCode.UNAUTHORIZED,
        );
      }
    });

    it('should_allow_access_when_tutor_is_owner', async () => {
      const mockSuscripcion = createMockSuscripcion();
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue(
        mockSuscripcion,
      );

      const result = await service.obtenerPorId('sus-fam-123', 'tutor-123');

      expect(result.id).toBe('sus-fam-123');
    });
  });

  // ============================================================================
  // simularMonto
  // ============================================================================
  describe('simularMonto', () => {
    it('should_calculate_total_with_discounts_for_new_products', async () => {
      // Tutor sin suscripción previa
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue(null);

      // Productos a simular
      mockPrisma.producto.findMany.mockResolvedValue([
        { id: 'prod-1', precio: { toNumber: () => 95000 }, nombre: 'Club A' },
        { id: 'prod-2', precio: { toNumber: () => 95000 }, nombre: 'Club B' },
      ]);

      const result = await service.simularMonto('tutor-123', [
        'prod-1',
        'prod-2',
      ]);

      // 95000 + 85500 (10% descuento en la 2da)
      expect(result.montoSinDescuento).toBe(190000);
      expect(result.montoConDescuento).toBe(180500);
      expect(result.ahorroTotal).toBe(9500);
      expect(result.detalleInscripciones).toHaveLength(2);
    });

    it('should_add_to_existing_subscriptions', async () => {
      // Tutor con suscripción existente (1 inscripción)
      const mockSuscripcion = createMockSuscripcion();
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue(
        mockSuscripcion,
      );

      // Producto nuevo a agregar
      mockPrisma.producto.findMany.mockResolvedValue([
        { id: 'prod-2', precio: { toNumber: () => 95000 }, nombre: 'Club B' },
      ]);

      const result = await service.simularMonto('tutor-123', ['prod-2']);

      // Existente: 95000 (sin descuento)
      // Nuevo: 85500 (con 10% descuento)
      expect(result.montoSinDescuento).toBe(190000);
      expect(result.montoConDescuento).toBe(180500);
      expect(result.detalleInscripciones).toHaveLength(2);
    });

    it('should_return_zero_when_no_products', async () => {
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue(null);
      mockPrisma.producto.findMany.mockResolvedValue([]);

      const result = await service.simularMonto('tutor-123', []);

      expect(result.montoSinDescuento).toBe(0);
      expect(result.montoConDescuento).toBe(0);
      expect(result.ahorroTotal).toBe(0);
    });
  });

  // ============================================================================
  // listarTodas
  // ============================================================================
  describe('listarTodas', () => {
    it('should_return_paginated_subscriptions', async () => {
      const mockSuscripciones = [
        createMockSuscripcion({ id: 'sus-1' }),
        createMockSuscripcion({ id: 'sus-2', tutor_id: 'tutor-456' }),
      ];

      mockPrisma.suscripcionFamiliar.findMany.mockResolvedValue(
        mockSuscripciones,
      );
      mockPrisma.suscripcionFamiliar.count.mockResolvedValue(25);

      const result = await service.listarTodas({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(25);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(3); // 25 / 10 = 3 páginas
    });

    it('should_filter_by_estado', async () => {
      mockPrisma.suscripcionFamiliar.findMany.mockResolvedValue([]);
      mockPrisma.suscripcionFamiliar.count.mockResolvedValue(0);

      await service.listarTodas({ estado: 'CANCELADA' });

      expect(mockPrisma.suscripcionFamiliar.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { estado: 'CANCELADA' },
        }),
      );
    });

    it('should_use_default_pagination', async () => {
      mockPrisma.suscripcionFamiliar.findMany.mockResolvedValue([]);
      mockPrisma.suscripcionFamiliar.count.mockResolvedValue(0);

      const result = await service.listarTodas({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should_return_empty_array_when_no_subscriptions', async () => {
      mockPrisma.suscripcionFamiliar.findMany.mockResolvedValue([]);
      mockPrisma.suscripcionFamiliar.count.mockResolvedValue(0);

      const result = await service.listarTodas({});

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });
});
