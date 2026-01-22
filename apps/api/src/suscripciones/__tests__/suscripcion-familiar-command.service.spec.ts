/**
 * Tests unitarios para SuscripcionFamiliarCommandService
 *
 * Operaciones de ESCRITURA:
 * - crear
 * - agregarInscripciones
 * - bajaInscripciones
 * - cancelar
 * - cambiarHorario
 * - cambiarProducto
 * - cambiarTier
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SuscripcionFamiliarCommandService } from '../services/suscripcion-familiar-command.service';
import { MercadoPagoPreApprovalClientService } from '../services/mercadopago-preapproval-client.service';
import { PrismaService } from '../../core/database/prisma.service';
import {
  SuscripcionFamiliarError,
  SuscripcionFamiliarErrorCode,
} from '../types';
import { EstadoSuscripcionFamiliar } from '@prisma/client';

describe('SuscripcionFamiliarCommandService', () => {
  let service: SuscripcionFamiliarCommandService;

  // ============================================================================
  // MOCKS
  // ============================================================================
  const mockPrisma = {
    tutor: {
      findUnique: jest.fn(),
    },
    producto: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    suscripcionFamiliar: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    inscripcionActividad: {
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    cambioInscripcion: {
      create: jest.fn(),
    },
    claseGrupo: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((fn) =>
      fn({
        suscripcionFamiliar: mockPrisma.suscripcionFamiliar,
        inscripcionActividad: mockPrisma.inscripcionActividad,
        cambioInscripcion: mockPrisma.cambioInscripcion,
      }),
    ),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:3000'),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockMpClient = {
    isConfigured: jest.fn().mockReturnValue(false), // Por defecto no configurado
    create: jest.fn(),
    cancel: jest.fn(),
    updateAmount: jest.fn(),
  };

  // ============================================================================
  // SETUP
  // ============================================================================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuscripcionFamiliarCommandService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        {
          provide: MercadoPagoPreApprovalClientService,
          useValue: mockMpClient,
        },
      ],
    }).compile();

    service = module.get<SuscripcionFamiliarCommandService>(
      SuscripcionFamiliarCommandService,
    );

    jest.clearAllMocks();
  });

  // ============================================================================
  // crear()
  // ============================================================================
  describe('crear', () => {
    const validInput = {
      tutorId: 'tutor-123',
      tier: 'STEAM_SINCRONICO' as const,
      tutorEmail: 'tutor@example.com',
      tutorNombre: 'Juan Pérez',
    };

    it('should_create_subscription_when_tutor_exists_and_has_no_subscription', async () => {
      // Mock tutor sin suscripción
      mockPrisma.tutor.findUnique.mockResolvedValue({
        id: 'tutor-123',
        suscripcionFamiliar: null,
        estudiantes: [],
      });

      // Mock creación de suscripción
      mockPrisma.suscripcionFamiliar.create.mockResolvedValue({
        id: 'sus-fam-new',
        tutorId: 'tutor-123',
        tier: 'STEAM_SINCRONICO',
        estado: 'PENDING',
        montoMensual: 95000,
      });

      mockPrisma.suscripcionFamiliar.update.mockResolvedValue({});

      const result = await service.crear(validInput);

      expect(result.suscripcionId).toBe('sus-fam-new');
      expect(result.tier).toBe('STEAM_SINCRONICO');
      expect(result.montoMensual).toBe(95000); // Precio tier STEAM_SINCRONICO
      expect(result.cobradoInmediatamente).toBe(false);
    });

    it('should_throw_not_found_when_tutor_not_exists', async () => {
      mockPrisma.tutor.findUnique.mockResolvedValue(null);

      await expect(service.crear(validInput)).rejects.toThrow(
        SuscripcionFamiliarError,
      );

      try {
        await service.crear(validInput);
      } catch (error) {
        expect((error as SuscripcionFamiliarError).code).toBe(
          SuscripcionFamiliarErrorCode.TUTOR_NOT_FOUND,
        );
      }
    });

    it('should_throw_already_exists_when_tutor_has_subscription', async () => {
      mockPrisma.tutor.findUnique.mockResolvedValue({
        id: 'tutor-123',
        suscripcionFamiliar: { id: 'existing-sus' },
        estudiantes: [],
      });

      await expect(service.crear(validInput)).rejects.toThrow(
        SuscripcionFamiliarError,
      );

      try {
        await service.crear(validInput);
      } catch (error) {
        expect((error as SuscripcionFamiliarError).code).toBe(
          SuscripcionFamiliarErrorCode.ALREADY_EXISTS,
        );
      }
    });

    it('should_create_with_inscriptions_when_provided', async () => {
      mockPrisma.tutor.findUnique.mockResolvedValue({
        id: 'tutor-123',
        suscripcionFamiliar: null,
        estudiantes: [{ id: 'est-1' }, { id: 'est-2' }],
      });

      mockPrisma.producto.findMany.mockResolvedValue([
        { id: 'prod-1', precio: { toNumber: () => 95000 } },
        { id: 'prod-2', precio: { toNumber: () => 95000 } },
      ]);

      mockPrisma.suscripcionFamiliar.create.mockResolvedValue({
        id: 'sus-fam-new',
        tutorId: 'tutor-123',
        tier: 'STEAM_SINCRONICO',
        estado: 'PENDING',
        montoMensual: 180500, // 95000 + 85500 (10% desc)
      });

      mockPrisma.inscripcionActividad.createMany.mockResolvedValue({
        count: 2,
      });
      mockPrisma.suscripcionFamiliar.update.mockResolvedValue({});

      const result = await service.crear({
        ...validInput,
        inscripciones: [
          { estudianteId: 'est-1', productoId: 'prod-1' },
          { estudianteId: 'est-2', productoId: 'prod-2' },
        ],
      });

      expect(result.montoMensual).toBe(180500);
      expect(mockPrisma.inscripcionActividad.createMany).toHaveBeenCalled();
    });

    it('should_throw_when_student_not_belongs_to_tutor', async () => {
      mockPrisma.tutor.findUnique.mockResolvedValue({
        id: 'tutor-123',
        suscripcionFamiliar: null,
        estudiantes: [{ id: 'est-1' }], // Solo est-1
      });

      const inputWithInvalidStudent = {
        ...validInput,
        inscripciones: [
          { estudianteId: 'est-otro', productoId: 'prod-1' }, // est-otro no pertenece
        ],
      };

      await expect(service.crear(inputWithInvalidStudent)).rejects.toThrow(
        SuscripcionFamiliarError,
      );

      try {
        await service.crear(inputWithInvalidStudent);
      } catch (error) {
        expect((error as SuscripcionFamiliarError).code).toBe(
          SuscripcionFamiliarErrorCode.ESTUDIANTE_NOT_FOUND,
        );
      }
    });

    it('should_throw_when_product_not_found', async () => {
      mockPrisma.tutor.findUnique.mockResolvedValue({
        id: 'tutor-123',
        suscripcionFamiliar: null,
        estudiantes: [{ id: 'est-1' }],
      });

      mockPrisma.producto.findMany.mockResolvedValue([]); // Producto no existe

      const inputWithInvalidProduct = {
        ...validInput,
        inscripciones: [
          { estudianteId: 'est-1', productoId: 'prod-inexistente' },
        ],
      };

      await expect(service.crear(inputWithInvalidProduct)).rejects.toThrow(
        SuscripcionFamiliarError,
      );

      try {
        await service.crear(inputWithInvalidProduct);
      } catch (error) {
        expect((error as SuscripcionFamiliarError).code).toBe(
          SuscripcionFamiliarErrorCode.PRODUCTO_NOT_FOUND,
        );
      }
    });
  });

  // ============================================================================
  // agregarInscripciones()
  // ============================================================================
  describe('agregarInscripciones', () => {
    const validInput = {
      suscripcionFamiliarId: 'sus-fam-123',
      tutorId: 'tutor-123',
      inscripciones: [{ estudianteId: 'est-1', productoId: 'prod-1' }],
    };

    it('should_add_inscriptions_and_recalculate_amount', async () => {
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue({
        id: 'sus-fam-123',
        tutorId: 'tutor-123',
        tier: 'STEAM_SINCRONICO',
        estado: EstadoSuscripcionFamiliar.ACTIVA,
        montoMensual: 95000,
        inscripciones: [
          {
            id: 'insc-existing',
            producto: { precio: { toNumber: () => 95000 } },
          },
        ],
        tutor: { estudiantes: [{ id: 'est-1' }, { id: 'est-2' }] },
      });

      mockPrisma.producto.findMany.mockResolvedValue([
        { id: 'prod-1', precio: { toNumber: () => 95000 } },
      ]);

      mockPrisma.inscripcionActividad.create.mockResolvedValue({
        id: 'insc-new',
      });

      const result = await service.agregarInscripciones(validInput);

      expect(result.inscripcionesCreadas).toHaveLength(1);
      expect(result.montoAnterior).toBe(95000);
      expect(result.nuevoMontoMensual).toBe(180500); // 95000 + 85500
      expect(result.diferenciaMonto).toBe(85500);
    });

    it('should_throw_not_found_when_subscription_not_exists', async () => {
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue(null);

      await expect(service.agregarInscripciones(validInput)).rejects.toThrow(
        SuscripcionFamiliarError,
      );

      try {
        await service.agregarInscripciones(validInput);
      } catch (error) {
        expect((error as SuscripcionFamiliarError).code).toBe(
          SuscripcionFamiliarErrorCode.NOT_FOUND,
        );
      }
    });

    it('should_throw_unauthorized_when_tutor_not_owner', async () => {
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue({
        id: 'sus-fam-123',
        tutorId: 'otro-tutor', // Diferente tutor
        tier: 'STEAM_SINCRONICO',
        estado: EstadoSuscripcionFamiliar.ACTIVA,
        montoMensual: 95000,
        inscripciones: [],
        tutor: { estudiantes: [] },
      });

      await expect(service.agregarInscripciones(validInput)).rejects.toThrow(
        SuscripcionFamiliarError,
      );

      try {
        await service.agregarInscripciones(validInput);
      } catch (error) {
        expect((error as SuscripcionFamiliarError).code).toBe(
          SuscripcionFamiliarErrorCode.UNAUTHORIZED,
        );
      }
    });

    it('should_throw_invalid_state_when_subscription_cancelled', async () => {
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue({
        id: 'sus-fam-123',
        tutorId: 'tutor-123',
        tier: 'STEAM_SINCRONICO',
        estado: EstadoSuscripcionFamiliar.CANCELLED,
        montoMensual: 0,
        inscripciones: [],
        tutor: { estudiantes: [{ id: 'est-1' }] },
      });

      await expect(service.agregarInscripciones(validInput)).rejects.toThrow(
        SuscripcionFamiliarError,
      );

      try {
        await service.agregarInscripciones(validInput);
      } catch (error) {
        expect((error as SuscripcionFamiliarError).code).toBe(
          SuscripcionFamiliarErrorCode.INVALID_STATE,
        );
      }
    });
  });

  // ============================================================================
  // bajaInscripciones()
  // ============================================================================
  describe('bajaInscripciones', () => {
    it('should_remove_inscriptions_and_recalculate_amount', async () => {
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue({
        id: 'sus-fam-123',
        tutorId: 'tutor-123',
        tier: 'STEAM_SINCRONICO',
        montoMensual: 180500, // 2 inscripciones
        inscripciones: [
          {
            id: 'insc-1',
            producto: { precio: { toNumber: () => 95000 } },
          },
          {
            id: 'insc-2',
            producto: { precio: { toNumber: () => 95000 } },
          },
        ],
      });

      const result = await service.bajaInscripciones({
        suscripcionFamiliarId: 'sus-fam-123',
        tutorId: 'tutor-123',
        inscripcionIds: ['insc-2'],
        motivo: 'Solicitud del tutor',
      });

      expect(result.inscripcionesBaja).toEqual(['insc-2']);
      expect(result.montoAnterior).toBe(180500);
      expect(result.nuevoMontoMensual).toBe(95000); // Solo 1 inscripción
    });

    it('should_set_amount_to_zero_when_all_inscriptions_removed', async () => {
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue({
        id: 'sus-fam-123',
        tutorId: 'tutor-123',
        tier: 'STEAM_SINCRONICO',
        montoMensual: 95000,
        inscripciones: [
          {
            id: 'insc-1',
            producto: { precio: { toNumber: () => 95000 } },
          },
        ],
      });

      const result = await service.bajaInscripciones({
        suscripcionFamiliarId: 'sus-fam-123',
        tutorId: 'tutor-123',
        inscripcionIds: ['insc-1'],
        motivo: 'Cancelación',
      });

      expect(result.nuevoMontoMensual).toBe(0);
    });
  });

  // ============================================================================
  // cancelar()
  // ============================================================================
  describe('cancelar', () => {
    it('should_cancel_subscription_and_all_inscriptions', async () => {
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue({
        id: 'sus-fam-123',
        tutorId: 'tutor-123',
        estado: EstadoSuscripcionFamiliar.ACTIVA,
        montoMensual: 95000,
        preapprovalId: null,
      });

      await service.cancelar({
        suscripcionFamiliarId: 'sus-fam-123',
        tutorId: 'tutor-123',
        motivo: 'Solicitud del usuario',
        canceladoPor: 'tutor',
      });

      expect(mockPrisma.suscripcionFamiliar.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sus-fam-123' },
          data: expect.objectContaining({
            estado: EstadoSuscripcionFamiliar.CANCELLED,
            montoMensual: 0,
          }),
        }),
      );

      expect(mockPrisma.inscripcionActividad.updateMany).toHaveBeenCalled();
    });

    it('should_throw_not_found_when_subscription_not_exists', async () => {
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue(null);

      await expect(
        service.cancelar({
          suscripcionFamiliarId: 'sus-inexistente',
          tutorId: 'tutor-123',
          motivo: 'Test',
          canceladoPor: 'tutor',
        }),
      ).rejects.toThrow(SuscripcionFamiliarError);
    });

    it('should_throw_invalid_state_when_already_cancelled', async () => {
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue({
        id: 'sus-fam-123',
        tutorId: 'tutor-123',
        estado: EstadoSuscripcionFamiliar.CANCELLED,
        montoMensual: 0,
      });

      await expect(
        service.cancelar({
          suscripcionFamiliarId: 'sus-fam-123',
          tutorId: 'tutor-123',
          motivo: 'Test',
          canceladoPor: 'tutor',
        }),
      ).rejects.toThrow(SuscripcionFamiliarError);

      try {
        await service.cancelar({
          suscripcionFamiliarId: 'sus-fam-123',
          tutorId: 'tutor-123',
          motivo: 'Test',
          canceladoPor: 'tutor',
        });
      } catch (error) {
        expect((error as SuscripcionFamiliarError).code).toBe(
          SuscripcionFamiliarErrorCode.INVALID_STATE,
        );
      }
    });

    it('should_allow_admin_to_cancel_any_subscription', async () => {
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue({
        id: 'sus-fam-123',
        tutorId: 'otro-tutor',
        estado: EstadoSuscripcionFamiliar.ACTIVA,
        montoMensual: 95000,
        preapprovalId: null,
      });

      // Admin cancela suscripción de otro tutor - no debe lanzar error
      await expect(
        service.cancelar({
          suscripcionFamiliarId: 'sus-fam-123',
          tutorId: 'admin-123',
          motivo: 'Cancelación administrativa',
          canceladoPor: 'admin',
        }),
      ).resolves.not.toThrow();
    });
  });

  // ============================================================================
  // cambiarHorario()
  // ============================================================================
  describe('cambiarHorario', () => {
    it('should_change_claseGrupo_without_affecting_amount', async () => {
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue({
        id: 'sus-fam-123',
        tutorId: 'tutor-123',
        montoMensual: 95000,
        inscripciones: [
          {
            id: 'insc-1',
            producto: { id: 'prod-1' },
            claseGrupoId: 'cg-old',
          },
        ],
      });

      mockPrisma.claseGrupo.findUnique.mockResolvedValue({
        id: 'cg-new',
        nombre: 'Martes 19:00',
        productoId: 'prod-1', // Mismo producto
      });

      const result = await service.cambiarHorario({
        suscripcionFamiliarId: 'sus-fam-123',
        tutorId: 'tutor-123',
        inscripcionId: 'insc-1',
        nuevoClaseGrupoId: 'cg-new',
      });

      expect(result.nuevoClaseGrupoId).toBe('cg-new');
      expect(result.nuevoHorarioNombre).toBe('Martes 19:00');
      expect(mockPrisma.inscripcionActividad.update).toHaveBeenCalled();
    });

    it('should_throw_when_new_grupo_belongs_to_different_product', async () => {
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue({
        id: 'sus-fam-123',
        tutorId: 'tutor-123',
        montoMensual: 95000,
        inscripciones: [
          {
            id: 'insc-1',
            producto: { id: 'prod-1' },
            claseGrupoId: 'cg-old',
          },
        ],
      });

      mockPrisma.claseGrupo.findUnique.mockResolvedValue({
        id: 'cg-new',
        nombre: 'Otro horario',
        productoId: 'prod-diferente', // Producto diferente
      });

      await expect(
        service.cambiarHorario({
          suscripcionFamiliarId: 'sus-fam-123',
          tutorId: 'tutor-123',
          inscripcionId: 'insc-1',
          nuevoClaseGrupoId: 'cg-new',
        }),
      ).rejects.toThrow(SuscripcionFamiliarError);

      try {
        await service.cambiarHorario({
          suscripcionFamiliarId: 'sus-fam-123',
          tutorId: 'tutor-123',
          inscripcionId: 'insc-1',
          nuevoClaseGrupoId: 'cg-new',
        });
      } catch (error) {
        expect((error as SuscripcionFamiliarError).code).toBe(
          SuscripcionFamiliarErrorCode.INVALID_STATE,
        );
      }
    });
  });

  // ============================================================================
  // cambiarProducto()
  // ============================================================================
  describe('cambiarProducto', () => {
    it('should_change_product_and_recalculate_amount', async () => {
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue({
        id: 'sus-fam-123',
        tutorId: 'tutor-123',
        tier: 'STEAM_SINCRONICO',
        montoMensual: 95000,
        preapprovalId: null,
        inscripciones: [
          {
            id: 'insc-1',
            producto: { id: 'prod-old', precio: { toNumber: () => 95000 } },
          },
        ],
      });

      mockPrisma.producto.findUnique.mockResolvedValue({
        id: 'prod-new',
        nombre: 'Club Premium',
        precio: { toNumber: () => 120000 },
      });

      const result = await service.cambiarProducto({
        suscripcionFamiliarId: 'sus-fam-123',
        tutorId: 'tutor-123',
        inscripcionId: 'insc-1',
        nuevoProductoId: 'prod-new',
      });

      expect(result.nuevoProductoId).toBe('prod-new');
      expect(result.nuevoProductoNombre).toBe('Club Premium');
      expect(result.montoAnterior).toBe(95000);
      expect(result.nuevoMontoMensual).toBe(120000);
    });

    it('should_throw_when_product_not_found', async () => {
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue({
        id: 'sus-fam-123',
        tutorId: 'tutor-123',
        tier: 'STEAM_SINCRONICO',
        montoMensual: 95000,
        inscripciones: [
          {
            id: 'insc-1',
            producto: { id: 'prod-old', precio: { toNumber: () => 95000 } },
          },
        ],
      });

      mockPrisma.producto.findUnique.mockResolvedValue(null);

      await expect(
        service.cambiarProducto({
          suscripcionFamiliarId: 'sus-fam-123',
          tutorId: 'tutor-123',
          inscripcionId: 'insc-1',
          nuevoProductoId: 'prod-inexistente',
        }),
      ).rejects.toThrow(SuscripcionFamiliarError);
    });
  });

  // ============================================================================
  // cambiarTier()
  // ============================================================================
  describe('cambiarTier', () => {
    it('should_change_tier_and_recalculate_for_inscriptions_without_price', async () => {
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue({
        id: 'sus-fam-123',
        tutorId: 'tutor-123',
        tier: 'STEAM_LIBROS',
        estado: EstadoSuscripcionFamiliar.ACTIVA,
        montoMensual: 40000,
        preapprovalId: null,
        inscripciones: [
          {
            id: 'insc-1',
            producto: { precio: null }, // Sin precio específico - usa tier
          },
        ],
      });

      const result = await service.cambiarTier({
        suscripcionFamiliarId: 'sus-fam-123',
        tutorId: 'tutor-123',
        nuevoTier: 'STEAM_SINCRONICO',
      });

      expect(result.tierAnterior).toBe('STEAM_LIBROS');
      expect(result.nuevoTier).toBe('STEAM_SINCRONICO');
      expect(result.montoAnterior).toBe(40000);
      expect(result.nuevoMontoMensual).toBe(95000);
      expect(result.diferenciaMonto).toBe(55000);
    });

    it('should_throw_invalid_state_when_subscription_cancelled', async () => {
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue({
        id: 'sus-fam-123',
        tutorId: 'tutor-123',
        tier: 'STEAM_LIBROS',
        estado: EstadoSuscripcionFamiliar.CANCELLED,
        montoMensual: 0,
        inscripciones: [],
      });

      await expect(
        service.cambiarTier({
          suscripcionFamiliarId: 'sus-fam-123',
          tutorId: 'tutor-123',
          nuevoTier: 'STEAM_SINCRONICO',
        }),
      ).rejects.toThrow(SuscripcionFamiliarError);

      try {
        await service.cambiarTier({
          suscripcionFamiliarId: 'sus-fam-123',
          tutorId: 'tutor-123',
          nuevoTier: 'STEAM_SINCRONICO',
        });
      } catch (error) {
        expect((error as SuscripcionFamiliarError).code).toBe(
          SuscripcionFamiliarErrorCode.INVALID_STATE,
        );
      }
    });

    it('should_keep_prices_for_inscriptions_with_specific_price', async () => {
      mockPrisma.suscripcionFamiliar.findUnique.mockResolvedValue({
        id: 'sus-fam-123',
        tutorId: 'tutor-123',
        tier: 'STEAM_LIBROS',
        estado: EstadoSuscripcionFamiliar.ACTIVA,
        montoMensual: 120000,
        preapprovalId: null,
        inscripciones: [
          {
            id: 'insc-1',
            producto: { precio: { toNumber: () => 120000 } }, // Precio específico
          },
        ],
      });

      const result = await service.cambiarTier({
        suscripcionFamiliarId: 'sus-fam-123',
        tutorId: 'tutor-123',
        nuevoTier: 'STEAM_SINCRONICO',
      });

      // El monto no cambia porque el producto tiene precio específico
      expect(result.nuevoMontoMensual).toBe(120000);
      expect(result.diferenciaMonto).toBe(0);
    });
  });
});
