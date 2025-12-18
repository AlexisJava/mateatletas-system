import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TierNombre, MundoTipo } from '@prisma/client';
import { TiersService } from '../tiers.service';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * Tests TDD para TiersService - Sistema Mateatletas 2026
 *
 * Modelo STEAM:
 * - STEAM_LIBROS: $40k - Plataforma completa (Mate + Progra + Ciencias)
 * - STEAM_ASINCRONICO: $65k - Todo + clases grabadas
 * - STEAM_SINCRONICO: $95k - Todo + clases en vivo con docente
 *
 * Descuento familiar simplificado:
 * - 1 hijo: 0%
 * - 2+ hijos: 10% sobre monto de hermanos adicionales
 */
describe('TiersService', () => {
  let service: TiersService;
  let prisma: PrismaService;

  // Mock data - Tiers STEAM
  const mockTierSteamLibros = {
    id: 'tier-steam-libros-id',
    nombre: TierNombre.STEAM_LIBROS,
    precio_mensual: 40000,
    mundos_async: 3,
    mundos_sync: 0,
    tiene_docente: false,
    descripcion: 'Plataforma completa STEAM',
    activo: true,
    orden: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTierSteamAsincronico = {
    id: 'tier-steam-asincronico-id',
    nombre: TierNombre.STEAM_ASINCRONICO,
    precio_mensual: 65000,
    mundos_async: 3,
    mundos_sync: 0,
    tiene_docente: false,
    descripcion: 'STEAM + clases grabadas',
    activo: true,
    orden: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTierSteamSincronico = {
    id: 'tier-steam-sincronico-id',
    nombre: TierNombre.STEAM_SINCRONICO,
    precio_mensual: 95000,
    mundos_async: 3,
    mundos_sync: 1,
    tiene_docente: true,
    descripcion: 'STEAM + clases en vivo',
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
      const expectedTiers = [
        mockTierSteamLibros,
        mockTierSteamAsincronico,
        mockTierSteamSincronico,
      ];
      mockPrismaService.tier.findMany.mockResolvedValue(expectedTiers);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].nombre).toBe(TierNombre.STEAM_LIBROS);
      expect(result[1].nombre).toBe(TierNombre.STEAM_ASINCRONICO);
      expect(result[2].nombre).toBe(TierNombre.STEAM_SINCRONICO);
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
      mockPrismaService.tier.findUnique.mockResolvedValue(mockTierSteamLibros);

      // Act
      const result = await service.findByNombre(TierNombre.STEAM_LIBROS);

      // Assert
      expect(result).toEqual(mockTierSteamLibros);
      expect(result.precio_mensual).toBe(40000);
      expect(mockPrismaService.tier.findUnique).toHaveBeenCalledWith({
        where: { nombre: TierNombre.STEAM_LIBROS },
      });
    });

    it('should_throw_NotFoundException_if_tier_not_found', async () => {
      // Arrange
      mockPrismaService.tier.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findByNombre(TierNombre.STEAM_SINCRONICO),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.findByNombre(TierNombre.STEAM_SINCRONICO),
      ).rejects.toThrow('Tier STEAM_SINCRONICO no encontrado');
    });
  });

  describe('findOne', () => {
    it('should_return_tier_by_id', async () => {
      // Arrange
      mockPrismaService.tier.findUnique.mockResolvedValue(
        mockTierSteamSincronico,
      );

      // Act
      const result = await service.findOne('tier-steam-sincronico-id');

      // Assert
      expect(result).toEqual(mockTierSteamSincronico);
      expect(mockPrismaService.tier.findUnique).toHaveBeenCalledWith({
        where: { id: 'tier-steam-sincronico-id' },
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
      const tiers = [mockTierSteamLibros]; // 1 estudiante con STEAM_LIBROS

      // Act
      const result = service.calcularPrecioFamiliar(tiers);

      // Assert
      expect(result.subtotal).toBe(40000);
      expect(result.descuento_porcentaje).toBe(0);
      expect(result.descuento_monto).toBe(0);
      expect(result.total).toBe(40000);
    });

    it('should_apply_10_percent_discount_on_second_sibling_only', () => {
      // Arrange - 2 estudiantes con STEAM_LIBROS ($40k cada uno)
      const tiers = [mockTierSteamLibros, mockTierSteamLibros];

      // Act
      const result = service.calcularPrecioFamiliar(tiers);

      // Assert
      // Subtotal: $40k + $40k = $80k
      // Descuento: 10% de $40k (solo el 2do hermano) = $4k
      // Total: $80k - $4k = $76k
      expect(result.subtotal).toBe(80000);
      expect(result.descuento_monto).toBe(4000);
      expect(result.total).toBe(76000);
    });

    it('should_apply_10_percent_discount_on_all_additional_siblings', () => {
      // Arrange - 3 estudiantes: 1 STEAM_LIBROS, 1 STEAM_ASINCRONICO, 1 STEAM_SINCRONICO
      const tiers = [
        mockTierSteamLibros,
        mockTierSteamAsincronico,
        mockTierSteamSincronico,
      ];

      // Act
      const result = service.calcularPrecioFamiliar(tiers);

      // Assert
      // Subtotal: $40k + $65k + $95k = $200k
      // Hermanos adicionales (2do y 3ro): $65k + $95k = $160k
      // Descuento: 10% de $160k = $16k
      // Total: $200k - $16k = $184k
      expect(result.subtotal).toBe(200000);
      expect(result.descuento_monto).toBe(16000);
      expect(result.total).toBe(184000);
    });

    it('should_apply_10_percent_discount_for_4_students', () => {
      // Arrange - 4 estudiantes todos con STEAM_LIBROS
      const tiers = [
        mockTierSteamLibros,
        mockTierSteamLibros,
        mockTierSteamLibros,
        mockTierSteamLibros,
      ];

      // Act
      const result = service.calcularPrecioFamiliar(tiers);

      // Assert
      // Subtotal: $40k * 4 = $160k
      // Hermanos adicionales (2do, 3ro, 4to): $40k * 3 = $120k
      // Descuento: 10% de $120k = $12k
      // Total: $160k - $12k = $148k
      expect(result.subtotal).toBe(160000);
      expect(result.descuento_monto).toBe(12000);
      expect(result.total).toBe(148000);
    });

    it('should_return_zero_for_empty_tiers_array', () => {
      // Arrange
      const tiers: (typeof mockTierSteamLibros)[] = [];

      // Act
      const result = service.calcularPrecioFamiliar(tiers);

      // Assert
      expect(result.subtotal).toBe(0);
      expect(result.descuento_porcentaje).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe('validarSeleccionMundos', () => {
    it('should_allow_3_async_mundos_for_STEAM_LIBROS', () => {
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
          TierNombre.STEAM_LIBROS,
          mundosAsync,
          mundosSync,
        ),
      ).not.toThrow();
    });

    it('should_reject_sync_mundo_for_STEAM_LIBROS', () => {
      // Arrange
      const mundosAsync = [MundoTipo.MATEMATICA];
      const mundosSync = [MundoTipo.PROGRAMACION];

      // Act & Assert
      expect(() =>
        service.validarSeleccionMundos(
          TierNombre.STEAM_LIBROS,
          mundosAsync,
          mundosSync,
        ),
      ).toThrow(BadRequestException);
      expect(() =>
        service.validarSeleccionMundos(
          TierNombre.STEAM_LIBROS,
          mundosAsync,
          mundosSync,
        ),
      ).toThrow('STEAM_LIBROS no incluye clases en vivo');
    });

    it('should_allow_3_async_mundos_for_STEAM_ASINCRONICO', () => {
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
          TierNombre.STEAM_ASINCRONICO,
          mundosAsync,
          mundosSync,
        ),
      ).not.toThrow();
    });

    it('should_reject_sync_mundo_for_STEAM_ASINCRONICO', () => {
      // Arrange
      const mundosAsync = [MundoTipo.MATEMATICA];
      const mundosSync = [MundoTipo.PROGRAMACION];

      // Act & Assert
      expect(() =>
        service.validarSeleccionMundos(
          TierNombre.STEAM_ASINCRONICO,
          mundosAsync,
          mundosSync,
        ),
      ).toThrow(BadRequestException);
      expect(() =>
        service.validarSeleccionMundos(
          TierNombre.STEAM_ASINCRONICO,
          mundosAsync,
          mundosSync,
        ),
      ).toThrow('STEAM_ASINCRONICO no incluye clases en vivo');
    });

    it('should_allow_3_async_and_1_sync_for_STEAM_SINCRONICO', () => {
      // Arrange
      const mundosAsync = [
        MundoTipo.MATEMATICA,
        MundoTipo.PROGRAMACION,
        MundoTipo.CIENCIAS,
      ];
      const mundosSync = [MundoTipo.MATEMATICA];

      // Act & Assert - No debe lanzar excepcion
      expect(() =>
        service.validarSeleccionMundos(
          TierNombre.STEAM_SINCRONICO,
          mundosAsync,
          mundosSync,
        ),
      ).not.toThrow();
    });

    it('should_reject_more_than_1_sync_mundo_for_STEAM_SINCRONICO', () => {
      // Arrange
      const mundosAsync = [MundoTipo.MATEMATICA];
      const mundosSync = [MundoTipo.PROGRAMACION, MundoTipo.CIENCIAS];

      // Act & Assert
      expect(() =>
        service.validarSeleccionMundos(
          TierNombre.STEAM_SINCRONICO,
          mundosAsync,
          mundosSync,
        ),
      ).toThrow(BadRequestException);
      expect(() =>
        service.validarSeleccionMundos(
          TierNombre.STEAM_SINCRONICO,
          mundosAsync,
          mundosSync,
        ),
      ).toThrow('STEAM_SINCRONICO permite máximo 1 mundo sync');
    });
  });

  describe('getCantidadMundosPorTier', () => {
    it('should_return_3_async_0_sync_for_STEAM_LIBROS', () => {
      // Act
      const result = service.getCantidadMundosPorTier(TierNombre.STEAM_LIBROS);

      // Assert
      expect(result.mundos_async).toBe(3);
      expect(result.mundos_sync).toBe(0);
    });

    it('should_return_3_async_0_sync_for_STEAM_ASINCRONICO', () => {
      // Act
      const result = service.getCantidadMundosPorTier(
        TierNombre.STEAM_ASINCRONICO,
      );

      // Assert
      expect(result.mundos_async).toBe(3);
      expect(result.mundos_sync).toBe(0);
    });

    it('should_return_3_async_1_sync_for_STEAM_SINCRONICO', () => {
      // Act
      const result = service.getCantidadMundosPorTier(
        TierNombre.STEAM_SINCRONICO,
      );

      // Assert
      expect(result.mundos_async).toBe(3);
      expect(result.mundos_sync).toBe(1);
    });
  });

  describe('tieneDocente', () => {
    it('should_return_false_for_STEAM_LIBROS', () => {
      expect(service.tieneDocente(TierNombre.STEAM_LIBROS)).toBe(false);
    });

    it('should_return_false_for_STEAM_ASINCRONICO', () => {
      expect(service.tieneDocente(TierNombre.STEAM_ASINCRONICO)).toBe(false);
    });

    it('should_return_true_for_STEAM_SINCRONICO', () => {
      expect(service.tieneDocente(TierNombre.STEAM_SINCRONICO)).toBe(true);
    });
  });

  describe('cambiarTier (upgrade/downgrade)', () => {
    const mockEstudianteInscripcionId = 'estudiante-inscripcion-123';

    describe('upgrade', () => {
      it('should_schedule_upgrade_for_next_month', async () => {
        // Arrange
        const tierActual = TierNombre.STEAM_LIBROS;
        const tierNuevo = TierNombre.STEAM_ASINCRONICO;
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
        const tierActual = TierNombre.STEAM_LIBROS;
        const tierNuevo = TierNombre.STEAM_SINCRONICO;

        // Act
        const result = await service.solicitarCambioTier(
          mockEstudianteInscripcionId,
          tierActual,
          tierNuevo,
        );

        // Assert
        expect(result.tier_actual).toBe(TierNombre.STEAM_LIBROS);
        expect(result.tier_pendiente).toBe(TierNombre.STEAM_SINCRONICO);
        expect(result.cambio_aplicado).toBe(false);
      });

      it('should_store_pending_tier_change_with_fecha_efectiva', async () => {
        // Arrange
        const tierActual = TierNombre.STEAM_LIBROS;
        const tierNuevo = TierNombre.STEAM_ASINCRONICO;

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
        const tierActual = TierNombre.STEAM_SINCRONICO;
        const tierNuevo = TierNombre.STEAM_ASINCRONICO;

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

      it('should_remove_sync_mundo_access_immediately_on_downgrade_from_STEAM_SINCRONICO', async () => {
        // Arrange
        const tierActual = TierNombre.STEAM_SINCRONICO;
        const tierNuevo = TierNombre.STEAM_ASINCRONICO;

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
        // Arrange - STEAM_SINCRONICO -> STEAM_ASINCRONICO (3 async)
        const tierActual = TierNombre.STEAM_SINCRONICO;
        const tierNuevo = TierNombre.STEAM_ASINCRONICO;

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
      it('should_throw_if_trying_to_upgrade_to_same_tier', () => {
        // Arrange
        const tierActual = TierNombre.STEAM_LIBROS;
        const tierNuevo = TierNombre.STEAM_LIBROS;

        // Act & Assert - solicitarCambioTier es síncrono
        expect(() =>
          service.solicitarCambioTier(
            mockEstudianteInscripcionId,
            tierActual,
            tierNuevo,
          ),
        ).toThrow(BadRequestException);
        expect(() =>
          service.solicitarCambioTier(
            mockEstudianteInscripcionId,
            tierActual,
            tierNuevo,
          ),
        ).toThrow('No se puede cambiar al mismo tier');
      });

      it('should_throw_if_trying_to_downgrade_to_same_tier', () => {
        // Arrange
        const tierActual = TierNombre.STEAM_SINCRONICO;
        const tierNuevo = TierNombre.STEAM_SINCRONICO;

        // Act & Assert - solicitarCambioTier es síncrono
        expect(() =>
          service.solicitarCambioTier(
            mockEstudianteInscripcionId,
            tierActual,
            tierNuevo,
          ),
        ).toThrow(BadRequestException);
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
