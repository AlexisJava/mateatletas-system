import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TierNombre, MundoTipo } from '@prisma/client';
import { TiersService } from '../tiers.service';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * Tests TDD para TiersService - Sistema Mateatletas 2026
 *
 * SLICE 3: TIERS
 *
 * Modelo de negocio:
 * - ARCADE: $30k - 1 mundo async, 0 sync, sin docente
 * - ARCADE_PLUS: $60k - 3 mundos async, 0 sync, sin docente
 * - PRO: $75k - 1 mundo async, 1 sync, con docente
 *
 * Descuentos familiares:
 * - 1 hijo: 0%
 * - 2 hijos: 12%
 * - 3+ hijos: 20%
 *
 * Reglas:
 * - PRO requiere que mundo async != mundo sync
 */
describe('TiersService', () => {
  let service: TiersService;
  let prisma: PrismaService;

  // Mock data
  const mockTierArcade = {
    id: 'tier-arcade-id',
    nombre: TierNombre.ARCADE,
    precio_mensual: 30000,
    mundos_async: 1,
    mundos_sync: 0,
    tiene_docente: false,
    descripcion: 'Plan inicial',
    activo: true,
    orden: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTierArcadePlus = {
    id: 'tier-arcade-plus-id',
    nombre: TierNombre.ARCADE_PLUS,
    precio_mensual: 60000,
    mundos_async: 3,
    mundos_sync: 0,
    tiene_docente: false,
    descripcion: 'Plan amplitud',
    activo: true,
    orden: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTierPro = {
    id: 'tier-pro-id',
    nombre: TierNombre.PRO,
    precio_mensual: 75000,
    mundos_async: 1,
    mundos_sync: 1,
    tiene_docente: true,
    descripcion: 'Plan profundidad',
    activo: true,
    orden: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    tier: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TiersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TiersService>(TiersService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should_return_all_active_tiers_ordered_by_precio', async () => {
      // Arrange
      const expectedTiers = [mockTierArcade, mockTierArcadePlus, mockTierPro];
      mockPrismaService.tier.findMany.mockResolvedValue(expectedTiers);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].nombre).toBe(TierNombre.ARCADE);
      expect(result[1].nombre).toBe(TierNombre.ARCADE_PLUS);
      expect(result[2].nombre).toBe(TierNombre.PRO);
      expect(mockPrismaService.tier.findMany).toHaveBeenCalledWith({
        where: { activo: true },
        orderBy: { precio_mensual: 'asc' },
      });
    });

    it('should_return_empty_array_if_no_tiers', async () => {
      // Arrange
      mockPrismaService.tier.findMany.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findByNombre', () => {
    it('should_return_tier_by_nombre', async () => {
      // Arrange
      mockPrismaService.tier.findUnique.mockResolvedValue(mockTierArcade);

      // Act
      const result = await service.findByNombre(TierNombre.ARCADE);

      // Assert
      expect(result).toEqual(mockTierArcade);
      expect(result.precio_mensual).toBe(30000);
      expect(mockPrismaService.tier.findUnique).toHaveBeenCalledWith({
        where: { nombre: TierNombre.ARCADE },
      });
    });

    it('should_throw_NotFoundException_if_tier_not_found', async () => {
      // Arrange
      mockPrismaService.tier.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByNombre(TierNombre.PRO)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByNombre(TierNombre.PRO)).rejects.toThrow(
        'Tier PRO no encontrado',
      );
    });
  });

  describe('findOne', () => {
    it('should_return_tier_by_id', async () => {
      // Arrange
      mockPrismaService.tier.findUnique.mockResolvedValue(mockTierPro);

      // Act
      const result = await service.findOne('tier-pro-id');

      // Assert
      expect(result).toEqual(mockTierPro);
      expect(mockPrismaService.tier.findUnique).toHaveBeenCalledWith({
        where: { id: 'tier-pro-id' },
      });
    });

    it('should_throw_NotFoundException_if_tier_id_not_found', async () => {
      // Arrange
      mockPrismaService.tier.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('calcularPrecioFamiliar', () => {
    it('should_return_full_price_for_1_student', () => {
      // Arrange
      const tiers = [mockTierArcade]; // 1 estudiante con ARCADE

      // Act
      const result = service.calcularPrecioFamiliar(tiers);

      // Assert
      expect(result.subtotal).toBe(30000);
      expect(result.descuento_porcentaje).toBe(0);
      expect(result.descuento_monto).toBe(0);
      expect(result.total).toBe(30000);
    });

    it('should_apply_12_percent_discount_for_2_students', () => {
      // Arrange
      const tiers = [mockTierArcade, mockTierArcadePlus]; // 2 estudiantes

      // Act
      const result = service.calcularPrecioFamiliar(tiers);

      // Assert
      expect(result.subtotal).toBe(90000); // 30k + 60k
      expect(result.descuento_porcentaje).toBe(12);
      expect(result.descuento_monto).toBe(10800); // 90k * 0.12
      expect(result.total).toBe(79200); // 90k - 10.8k
    });

    it('should_apply_20_percent_discount_for_3_or_more_students', () => {
      // Arrange
      const tiers = [mockTierArcade, mockTierArcadePlus, mockTierPro]; // 3 estudiantes

      // Act
      const result = service.calcularPrecioFamiliar(tiers);

      // Assert
      expect(result.subtotal).toBe(165000); // 30k + 60k + 75k
      expect(result.descuento_porcentaje).toBe(20);
      expect(result.descuento_monto).toBe(33000); // 165k * 0.20
      expect(result.total).toBe(132000); // 165k - 33k
    });

    it('should_apply_20_percent_discount_for_4_students', () => {
      // Arrange
      const tiers = [
        mockTierArcade,
        mockTierArcade,
        mockTierArcadePlus,
        mockTierPro,
      ]; // 4 estudiantes

      // Act
      const result = service.calcularPrecioFamiliar(tiers);

      // Assert
      expect(result.subtotal).toBe(195000); // 30k + 30k + 60k + 75k
      expect(result.descuento_porcentaje).toBe(20);
      expect(result.total).toBe(156000); // 195k * 0.80
    });

    it('should_return_zero_for_empty_tiers_array', () => {
      // Arrange
      const tiers: (typeof mockTierArcade)[] = [];

      // Act
      const result = service.calcularPrecioFamiliar(tiers);

      // Assert
      expect(result.subtotal).toBe(0);
      expect(result.descuento_porcentaje).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe('validarSeleccionMundos', () => {
    it('should_allow_1_async_mundo_for_ARCADE', () => {
      // Arrange
      const mundosAsync = [MundoTipo.MATEMATICA];
      const mundosSync: MundoTipo[] = [];

      // Act & Assert - No debe lanzar excepcion
      expect(() =>
        service.validarSeleccionMundos(
          TierNombre.ARCADE,
          mundosAsync,
          mundosSync,
        ),
      ).not.toThrow();
    });

    it('should_reject_more_than_1_async_mundo_for_ARCADE', () => {
      // Arrange
      const mundosAsync = [MundoTipo.MATEMATICA, MundoTipo.PROGRAMACION];
      const mundosSync: MundoTipo[] = [];

      // Act & Assert
      expect(() =>
        service.validarSeleccionMundos(
          TierNombre.ARCADE,
          mundosAsync,
          mundosSync,
        ),
      ).toThrow(BadRequestException);
      expect(() =>
        service.validarSeleccionMundos(
          TierNombre.ARCADE,
          mundosAsync,
          mundosSync,
        ),
      ).toThrow('ARCADE permite maximo 1 mundo async');
    });

    it('should_allow_3_async_mundos_for_ARCADE_PLUS', () => {
      // Arrange
      const mundosAsync = [
        MundoTipo.MATEMATICA,
        MundoTipo.PROGRAMACION,
        MundoTipo.CIENCIAS,
      ];
      const mundosSync: MundoTipo[] = [];

      // Act & Assert - No debe lanzar excepcion
      expect(() =>
        service.validarSeleccionMundos(
          TierNombre.ARCADE_PLUS,
          mundosAsync,
          mundosSync,
        ),
      ).not.toThrow();
    });

    it('should_reject_sync_mundo_for_ARCADE_PLUS', () => {
      // Arrange
      const mundosAsync = [MundoTipo.MATEMATICA];
      const mundosSync = [MundoTipo.PROGRAMACION];

      // Act & Assert
      expect(() =>
        service.validarSeleccionMundos(
          TierNombre.ARCADE_PLUS,
          mundosAsync,
          mundosSync,
        ),
      ).toThrow(BadRequestException);
      expect(() =>
        service.validarSeleccionMundos(
          TierNombre.ARCADE_PLUS,
          mundosAsync,
          mundosSync,
        ),
      ).toThrow('ARCADE_PLUS no incluye mundos sync');
    });

    it('should_require_different_mundos_for_PRO_async_and_sync', () => {
      // Arrange
      const mundosAsync = [MundoTipo.MATEMATICA];
      const mundosSync = [MundoTipo.PROGRAMACION]; // Diferente de async

      // Act & Assert - No debe lanzar excepcion
      expect(() =>
        service.validarSeleccionMundos(TierNombre.PRO, mundosAsync, mundosSync),
      ).not.toThrow();
    });

    it('should_throw_if_PRO_selects_same_mundo_for_async_and_sync', () => {
      // Arrange
      const mundosAsync = [MundoTipo.MATEMATICA];
      const mundosSync = [MundoTipo.MATEMATICA]; // Mismo que async

      // Act & Assert
      expect(() =>
        service.validarSeleccionMundos(TierNombre.PRO, mundosAsync, mundosSync),
      ).toThrow(BadRequestException);
      expect(() =>
        service.validarSeleccionMundos(TierNombre.PRO, mundosAsync, mundosSync),
      ).toThrow('PRO requiere que el mundo sync sea diferente del async');
    });

    it('should_require_exactly_1_async_and_1_sync_for_PRO', () => {
      // Arrange - PRO con 2 mundos async (invalido)
      const mundosAsync = [MundoTipo.MATEMATICA, MundoTipo.PROGRAMACION];
      const mundosSync = [MundoTipo.CIENCIAS];

      // Act & Assert
      expect(() =>
        service.validarSeleccionMundos(TierNombre.PRO, mundosAsync, mundosSync),
      ).toThrow(BadRequestException);
      expect(() =>
        service.validarSeleccionMundos(TierNombre.PRO, mundosAsync, mundosSync),
      ).toThrow('PRO permite exactamente 1 mundo async');
    });

    it('should_require_1_sync_mundo_for_PRO', () => {
      // Arrange - PRO sin mundo sync (invalido)
      const mundosAsync = [MundoTipo.MATEMATICA];
      const mundosSync: MundoTipo[] = [];

      // Act & Assert
      expect(() =>
        service.validarSeleccionMundos(TierNombre.PRO, mundosAsync, mundosSync),
      ).toThrow(BadRequestException);
      expect(() =>
        service.validarSeleccionMundos(TierNombre.PRO, mundosAsync, mundosSync),
      ).toThrow('PRO requiere exactamente 1 mundo sync');
    });
  });

  describe('getCantidadMundosPorTier', () => {
    it('should_return_1_async_0_sync_for_ARCADE', () => {
      // Act
      const result = service.getCantidadMundosPorTier(TierNombre.ARCADE);

      // Assert
      expect(result.mundos_async).toBe(1);
      expect(result.mundos_sync).toBe(0);
    });

    it('should_return_3_async_0_sync_for_ARCADE_PLUS', () => {
      // Act
      const result = service.getCantidadMundosPorTier(TierNombre.ARCADE_PLUS);

      // Assert
      expect(result.mundos_async).toBe(3);
      expect(result.mundos_sync).toBe(0);
    });

    it('should_return_1_async_1_sync_for_PRO', () => {
      // Act
      const result = service.getCantidadMundosPorTier(TierNombre.PRO);

      // Assert
      expect(result.mundos_async).toBe(1);
      expect(result.mundos_sync).toBe(1);
    });
  });

  describe('tieneDocente', () => {
    it('should_return_false_for_ARCADE', () => {
      expect(service.tieneDocente(TierNombre.ARCADE)).toBe(false);
    });

    it('should_return_false_for_ARCADE_PLUS', () => {
      expect(service.tieneDocente(TierNombre.ARCADE_PLUS)).toBe(false);
    });

    it('should_return_true_for_PRO', () => {
      expect(service.tieneDocente(TierNombre.PRO)).toBe(true);
    });
  });

  describe('cambiarTier (upgrade/downgrade)', () => {
    const mockEstudianteInscripcionId = 'estudiante-inscripcion-123';

    describe('upgrade', () => {
      it('should_schedule_upgrade_for_next_month', async () => {
        // Arrange
        const tierActual = TierNombre.ARCADE;
        const tierNuevo = TierNombre.ARCADE_PLUS;
        const hoy = new Date('2026-03-15');
        jest.useFakeTimers().setSystemTime(hoy);

        // Act
        const result = await service.solicitarCambioTier(
          mockEstudianteInscripcionId,
          tierActual,
          tierNuevo,
        );

        // Assert
        expect(result.tipo_cambio).toBe('upgrade');
        expect(result.aplicacion_inmediata).toBe(false);
        expect(result.fecha_efectiva.getMonth()).toBe(3); // Abril (0-indexed)
        expect(result.fecha_efectiva.getDate()).toBe(1); // Dia 1

        jest.useRealTimers();
      });

      it('should_not_change_current_tier_until_next_month', async () => {
        // Arrange
        const tierActual = TierNombre.ARCADE;
        const tierNuevo = TierNombre.PRO;

        // Act
        const result = await service.solicitarCambioTier(
          mockEstudianteInscripcionId,
          tierActual,
          tierNuevo,
        );

        // Assert
        expect(result.tier_actual).toBe(TierNombre.ARCADE);
        expect(result.tier_pendiente).toBe(TierNombre.PRO);
        expect(result.cambio_aplicado).toBe(false);
      });

      it('should_store_pending_tier_change_with_fecha_efectiva', async () => {
        // Arrange
        const tierActual = TierNombre.ARCADE;
        const tierNuevo = TierNombre.ARCADE_PLUS;

        // Act
        const result = await service.solicitarCambioTier(
          mockEstudianteInscripcionId,
          tierActual,
          tierNuevo,
        );

        // Assert
        expect(result.id).toBeDefined();
        expect(result.fecha_efectiva).toBeInstanceOf(Date);
        expect(result.estado).toBe('pendiente');
      });
    });

    describe('downgrade', () => {
      it('should_apply_downgrade_immediately', async () => {
        // Arrange
        const tierActual = TierNombre.PRO;
        const tierNuevo = TierNombre.ARCADE_PLUS;

        // Act
        const result = await service.solicitarCambioTier(
          mockEstudianteInscripcionId,
          tierActual,
          tierNuevo,
        );

        // Assert
        expect(result.tipo_cambio).toBe('downgrade');
        expect(result.aplicacion_inmediata).toBe(true);
        expect(result.cambio_aplicado).toBe(true);
      });

      it('should_remove_sync_mundo_access_immediately_on_downgrade_from_PRO', async () => {
        // Arrange
        const tierActual = TierNombre.PRO;
        const tierNuevo = TierNombre.ARCADE_PLUS;

        // Act
        const result = await service.solicitarCambioTier(
          mockEstudianteInscripcionId,
          tierActual,
          tierNuevo,
        );

        // Assert
        expect(result.accesos_removidos).toContain('mundo_sync');
        expect(result.accesos_removidos).toContain('docente');
      });

      it('should_keep_async_mundo_access_based_on_new_tier', async () => {
        // Arrange - PRO -> ARCADE_PLUS (3 async)
        const tierActual = TierNombre.PRO;
        const tierNuevo = TierNombre.ARCADE_PLUS;

        // Act
        const result = await service.solicitarCambioTier(
          mockEstudianteInscripcionId,
          tierActual,
          tierNuevo,
        );

        // Assert
        expect(result.mundos_async_permitidos).toBe(3);
      });
    });

    describe('validaciones', () => {
      it('should_throw_if_trying_to_upgrade_to_same_tier', async () => {
        // Arrange
        const tierActual = TierNombre.ARCADE;
        const tierNuevo = TierNombre.ARCADE;

        // Act & Assert
        await expect(
          service.solicitarCambioTier(
            mockEstudianteInscripcionId,
            tierActual,
            tierNuevo,
          ),
        ).rejects.toThrow(BadRequestException);
        await expect(
          service.solicitarCambioTier(
            mockEstudianteInscripcionId,
            tierActual,
            tierNuevo,
          ),
        ).rejects.toThrow('No se puede cambiar al mismo tier');
      });

      it('should_throw_if_trying_to_downgrade_to_same_tier', async () => {
        // Arrange
        const tierActual = TierNombre.PRO;
        const tierNuevo = TierNombre.PRO;

        // Act & Assert
        await expect(
          service.solicitarCambioTier(
            mockEstudianteInscripcionId,
            tierActual,
            tierNuevo,
          ),
        ).rejects.toThrow(BadRequestException);
      });

      it('should_allow_parent_to_cancel_pending_upgrade_before_fecha_efectiva', async () => {
        // Arrange
        const cambioTierId = 'cambio-tier-pendiente-123';

        // Act
        const result = await service.cancelarCambioPendiente(cambioTierId);

        // Assert
        expect(result.estado).toBe('cancelado');
        expect(result.cancelado_en).toBeInstanceOf(Date);
      });
    });
  });
});
