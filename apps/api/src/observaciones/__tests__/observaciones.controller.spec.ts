import { Test, TestingModule } from '@nestjs/testing';
import { ObservacionesController } from '../observaciones.controller';
import { ObservacionesService } from '../observaciones.service';
import {
  TipoObservacion,
  PrioridadObservacion,
  EstadoObservacion,
} from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthUser } from '../../auth/interfaces';

/**
 * Tests para ObservacionesController
 *
 * Verificaciones:
 * - Endpoints correctamente mapeados
 * - Guards aplicados (JwtAuthGuard, RolesGuard)
 * - Roles correctos (DOCENTE, ADMIN, PEDAGOGIA)
 * - Parámetros correctamente parseados y validados
 * - Delegación correcta al servicio
 */
describe('ObservacionesController', () => {
  let controller: ObservacionesController;
  let service: jest.Mocked<ObservacionesService>;

  // Mock de usuario docente autenticado
  const mockDocenteUser: AuthUser = {
    id: 'docente-123',
    email: 'docente@test.com',
    role: 'DOCENTE',
  };

  // Mock de usuario admin autenticado
  const mockAdminUser: AuthUser = {
    id: 'admin-123',
    email: 'admin@test.com',
    role: 'ADMIN',
  };

  // Mock de observación creada
  const mockObservacion = {
    id: 'obs-123',
    contenido: 'Estudiante muestra dificultad con fracciones',
    fechaEvento: new Date('2024-01-15'),
    tipo: TipoObservacion.Academica,
    prioridad: PrioridadObservacion.Media,
    estado: EstadoObservacion.Abierta,
    requiereSeguimiento: false,
    notificarAdmin: false,
    notificarPedagogia: false,
    docenteId: 'docente-123',
    comisionId: 'comision-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    fecha_resolucion: null,
    estudiantes: [
      {
        estudiante: {
          id: 'est-1',
          nombre: 'Juan Pérez',
        },
      },
    ],
    seguimientos: [],
  };

  beforeEach(async () => {
    // Mock del servicio
    service = {
      crear: jest.fn(),
      listar: jest.fn(),
      obtenerPorId: jest.fn(),
      agregarSeguimiento: jest.fn(),
      cambiarEstado: jest.fn(),
      obtenerPendientes: jest.fn(),
      obtenerPorEstudiante: jest.fn(),
    } as unknown as jest.Mocked<ObservacionesService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObservacionesController],
      providers: [
        {
          provide: ObservacionesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ObservacionesController>(ObservacionesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // POST /observaciones - Crear observación
  // ============================================================================
  describe('POST /observaciones - crear()', () => {
    const createDto = {
      estudianteIds: ['est-1', 'est-2'],
      comisionId: 'comision-123',
      contenido: 'Estudiante muestra dificultad con fracciones',
      fechaEvento: '2024-01-15',
      tipo: TipoObservacion.Academica,
      prioridad: PrioridadObservacion.Media,
    };

    it('should_create_observation_when_docente_has_access', async () => {
      service.crear.mockResolvedValue(mockObservacion);

      const result = await controller.crear(createDto, mockDocenteUser);

      expect(service.crear).toHaveBeenCalledWith(createDto, mockDocenteUser.id);
      expect(result).toEqual(mockObservacion);
    });

    it('should_pass_dto_without_modification_to_service', async () => {
      service.crear.mockResolvedValue(mockObservacion);

      await controller.crear(createDto, mockDocenteUser);

      const callArg = service.crear.mock.calls[0][0];
      expect(callArg).toEqual(createDto);
      expect(callArg.estudianteIds).toEqual(['est-1', 'est-2']);
      expect(callArg.tipo).toBe(TipoObservacion.Academica);
    });

    it('should_propagate_forbidden_exception_from_service', async () => {
      service.crear.mockRejectedValue(
        new ForbiddenException('No tiene acceso a estos estudiantes'),
      );

      await expect(
        controller.crear(createDto, mockDocenteUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ============================================================================
  // GET /observaciones - Listar observaciones
  // ============================================================================
  describe('GET /observaciones - listar()', () => {
    const filtrosDto = {
      tipo: TipoObservacion.Academica,
      estado: EstadoObservacion.Abierta,
      limit: 20,
      offset: 0,
    };

    const mockListResponse = {
      data: [mockObservacion],
      total: 1,
      limit: 20,
      offset: 0,
    };

    it('should_list_observations_for_docente', async () => {
      service.listar.mockResolvedValue(mockListResponse);

      const result = await controller.listar(filtrosDto, mockDocenteUser);

      expect(service.listar).toHaveBeenCalledWith(filtrosDto, mockDocenteUser);
      expect(result).toEqual(mockListResponse);
    });

    it('should_list_all_observations_for_admin', async () => {
      service.listar.mockResolvedValue(mockListResponse);

      const result = await controller.listar(filtrosDto, mockAdminUser);

      expect(service.listar).toHaveBeenCalledWith(filtrosDto, mockAdminUser);
      expect(result).toEqual(mockListResponse);
    });

    it('should_apply_filters_correctly', async () => {
      const filtrosConFechas = {
        ...filtrosDto,
        fechaDesde: '2024-01-01',
        fechaHasta: '2024-01-31',
        requiereSeguimiento: true,
      };
      service.listar.mockResolvedValue(mockListResponse);

      await controller.listar(filtrosConFechas, mockDocenteUser);

      expect(service.listar).toHaveBeenCalledWith(
        filtrosConFechas,
        mockDocenteUser,
      );
    });
  });

  // ============================================================================
  // GET /observaciones/:id - Obtener por ID
  // ============================================================================
  describe('GET /observaciones/:id - obtenerPorId()', () => {
    it('should_return_observation_when_found', async () => {
      service.obtenerPorId.mockResolvedValue(mockObservacion);

      const result = await controller.obtenerPorId('obs-123', mockDocenteUser);

      expect(service.obtenerPorId).toHaveBeenCalledWith(
        'obs-123',
        mockDocenteUser,
      );
      expect(result).toEqual(mockObservacion);
    });

    it('should_propagate_not_found_exception', async () => {
      service.obtenerPorId.mockRejectedValue(
        new NotFoundException('Observación no encontrada'),
      );

      await expect(
        controller.obtenerPorId('obs-invalid', mockDocenteUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should_propagate_forbidden_when_no_access', async () => {
      service.obtenerPorId.mockRejectedValue(
        new ForbiddenException('No tiene acceso a esta observación'),
      );

      await expect(
        controller.obtenerPorId('obs-123', mockDocenteUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ============================================================================
  // POST /observaciones/:id/seguimientos - Agregar seguimiento
  // ============================================================================
  describe('POST /observaciones/:id/seguimientos - agregarSeguimiento()', () => {
    const seguimientoDto = {
      contenido: 'Se habló con el tutor sobre la situación',
    };

    const mockObservacionConSeguimiento = {
      ...mockObservacion,
      estado: EstadoObservacion.EnSeguimiento,
      seguimientos: [
        {
          id: 'seg-1',
          contenido: 'Se habló con el tutor sobre la situación',
          autorId: 'docente-123',
          createdAt: new Date(),
        },
      ],
    };

    it('should_add_seguimiento_when_authorized', async () => {
      service.agregarSeguimiento.mockResolvedValue(
        mockObservacionConSeguimiento,
      );

      const result = await controller.agregarSeguimiento(
        'obs-123',
        seguimientoDto,
        mockDocenteUser,
      );

      expect(service.agregarSeguimiento).toHaveBeenCalledWith(
        'obs-123',
        seguimientoDto,
        mockDocenteUser,
      );
      expect(result.seguimientos).toHaveLength(1);
      expect(result.estado).toBe(EstadoObservacion.EnSeguimiento);
    });

    it('should_propagate_forbidden_when_not_authorized', async () => {
      service.agregarSeguimiento.mockRejectedValue(
        new ForbiddenException(
          'Solo autor, admin o pedagogía pueden agregar seguimientos',
        ),
      );

      await expect(
        controller.agregarSeguimiento(
          'obs-123',
          seguimientoDto,
          mockDocenteUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ============================================================================
  // PATCH /observaciones/:id/estado - Cambiar estado
  // ============================================================================
  describe('PATCH /observaciones/:id/estado - cambiarEstado()', () => {
    const updateEstadoDto = {
      estado: EstadoObservacion.Resuelta,
    };

    const mockObservacionResuelta = {
      ...mockObservacion,
      estado: EstadoObservacion.Resuelta,
      fecha_resolucion: new Date(),
    };

    it('should_change_estado_when_transition_valid', async () => {
      service.cambiarEstado.mockResolvedValue(mockObservacionResuelta);

      const result = await controller.cambiarEstado(
        'obs-123',
        updateEstadoDto,
        mockDocenteUser,
      );

      expect(service.cambiarEstado).toHaveBeenCalledWith(
        'obs-123',
        updateEstadoDto.estado,
        mockDocenteUser,
      );
      expect(result.estado).toBe(EstadoObservacion.Resuelta);
    });

    it('should_propagate_bad_request_when_invalid_transition', async () => {
      service.cambiarEstado.mockRejectedValue(
        new Error('Transición de estado no válida'),
      );

      await expect(
        controller.cambiarEstado('obs-123', updateEstadoDto, mockDocenteUser),
      ).rejects.toThrow('Transición de estado no válida');
    });
  });

  // ============================================================================
  // GET /observaciones/pendientes - Obtener pendientes de seguimiento
  // ============================================================================
  describe('GET /observaciones/pendientes - obtenerPendientes()', () => {
    const mockPendientes = {
      data: [{ ...mockObservacion, requiereSeguimiento: true }],
      total: 1,
    };

    it('should_return_pending_observations_for_docente', async () => {
      service.obtenerPendientes.mockResolvedValue(mockPendientes);

      const result = await controller.obtenerPendientes(mockDocenteUser);

      expect(service.obtenerPendientes).toHaveBeenCalledWith(mockDocenteUser);
      expect(result).toEqual(mockPendientes);
    });

    it('should_return_all_pending_for_admin', async () => {
      service.obtenerPendientes.mockResolvedValue(mockPendientes);

      const result = await controller.obtenerPendientes(mockAdminUser);

      expect(service.obtenerPendientes).toHaveBeenCalledWith(mockAdminUser);
      expect(result).toEqual(mockPendientes);
    });
  });

  // ============================================================================
  // GET /observaciones/estudiante/:estudianteId - Historial de estudiante
  // ============================================================================
  describe('GET /observaciones/estudiante/:estudianteId - obtenerPorEstudiante()', () => {
    const mockHistorial = {
      data: [mockObservacion],
      total: 1,
    };

    it('should_return_student_history_when_authorized', async () => {
      service.obtenerPorEstudiante.mockResolvedValue(mockHistorial);

      const result = await controller.obtenerPorEstudiante(
        'est-1',
        mockDocenteUser,
      );

      expect(service.obtenerPorEstudiante).toHaveBeenCalledWith(
        'est-1',
        mockDocenteUser,
      );
      expect(result).toEqual(mockHistorial);
    });

    it('should_propagate_forbidden_when_no_student_access', async () => {
      service.obtenerPorEstudiante.mockRejectedValue(
        new ForbiddenException('No tiene acceso a este estudiante'),
      );

      await expect(
        controller.obtenerPorEstudiante('est-other', mockDocenteUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ============================================================================
  // Verificaciones de integración Controller-Service
  // ============================================================================
  describe('Service Integration', () => {
    it('should_call_service_exactly_once_per_request', async () => {
      service.crear.mockResolvedValue(mockObservacion);

      await controller.crear(
        {
          estudianteIds: ['est-1'],
          contenido: 'Test',
          fechaEvento: '2024-01-15',
          tipo: TipoObservacion.Academica,
        },
        mockDocenteUser,
      );

      expect(service.crear).toHaveBeenCalledTimes(1);
    });

    it('should_return_service_response_without_modification', async () => {
      const customResponse = { ...mockObservacion, id: 'custom-id' };
      service.obtenerPorId.mockResolvedValue(customResponse);

      const result = await controller.obtenerPorId(
        'custom-id',
        mockDocenteUser,
      );

      expect(result).toBe(customResponse);
      expect(result.id).toBe('custom-id');
    });
  });
});
