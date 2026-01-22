import { Test, TestingModule } from '@nestjs/testing';
import { ObservacionesService } from '../observaciones.service';
import { PrismaService } from '../../core/database/prisma.service';
import {
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  TipoObservacion,
  PrioridadObservacion,
  EstadoObservacion,
} from '@prisma/client';
import { AuthUser } from '../../auth/interfaces';
import { Role } from '../../auth/decorators/roles.decorator';

describe('ObservacionesService', () => {
  let service: ObservacionesService;

  // Mock AuthUser para docente
  const mockDocenteUser: AuthUser = {
    id: 'docente-1',
    email: 'docente@test.com',
    roles: [Role.DOCENTE],
    role: Role.DOCENTE,
  };

  // Mock AuthUser para otro docente
  const mockOtroDocenteUser: AuthUser = {
    id: 'docente-otro',
    email: 'otro@test.com',
    roles: [Role.DOCENTE],
    role: Role.DOCENTE,
  };

  // Mock AuthUser para admin
  const mockAdminUser: AuthUser = {
    id: 'admin-1',
    email: 'admin@test.com',
    roles: [Role.ADMIN],
    role: Role.ADMIN,
  };

  // Mock data
  const mockComision = {
    id: 'comision-1',
    nombre: 'Matemáticas 101',
    docenteId: 'docente-1',
  };

  const mockObservacion = {
    id: 'obs-1',
    docenteId: 'docente-1',
    comisionId: 'comision-1',
    contenido: 'Observación de prueba con contenido suficiente',
    fechaEvento: new Date('2024-01-15'),
    tipo: TipoObservacion.Academica,
    prioridad: PrioridadObservacion.Baja,
    requiereSeguimiento: false,
    notificarAdmin: false,
    notificarPedagogia: false,
    estado: EstadoObservacion.Abierta,
    createdAt: new Date(),
    updatedAt: new Date(),
    estudiantes: [{ estudianteId: 'estudiante-1', observacionId: 'obs-1' }],
    seguimientos: [],
  };

  const mockPrismaService = {
    observacion: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    observacionEstudiante: {
      createMany: jest.fn(),
    },
    seguimientoObservacion: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    comision: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    estudiante: {
      findMany: jest.fn(),
    },
    inscripcionComision: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObservacionesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ObservacionesService>(ObservacionesService);

    // Reset mocks
    jest.clearAllMocks();
  });

  // ============================================================
  // 6.1 CREACIÓN
  // ============================================================
  describe('Crear Observación', () => {
    describe('Validaciones básicas', () => {
      it('should_create_observation_when_valid_data', async () => {
        // Arrange
        const dto = {
          estudianteIds: ['estudiante-1'],
          comisionId: 'comision-1',
          contenido: 'Excelente participación en clase de fracciones',
          fechaEvento: '2024-01-15',
          tipo: TipoObservacion.Academica,
        };

        mockPrismaService.comision.findFirst.mockResolvedValue(mockComision);
        mockPrismaService.inscripcionComision.findMany.mockResolvedValue([
          { estudianteId: 'estudiante-1', comisionId: 'comision-1' },
        ]);
        mockPrismaService.observacion.create.mockResolvedValue(mockObservacion);

        // Act
        const result = await service.crear(dto, 'docente-1');

        // Assert
        expect(result).toBeDefined();
        expect(result.id).toBe('obs-1');
        expect(mockPrismaService.observacion.create).toHaveBeenCalled();
      });

      it('should_create_group_observation_when_multiple_students', async () => {
        // Arrange
        const dto = {
          estudianteIds: ['estudiante-1', 'estudiante-2', 'estudiante-3'],
          comisionId: 'comision-1',
          contenido: 'Grupo trabajó excelentemente en proyecto colaborativo',
          fechaEvento: '2024-01-15',
          tipo: TipoObservacion.Academica,
        };

        mockPrismaService.comision.findFirst.mockResolvedValue(mockComision);
        mockPrismaService.inscripcionComision.findMany.mockResolvedValue([
          { estudianteId: 'estudiante-1', comisionId: 'comision-1' },
          { estudianteId: 'estudiante-2', comisionId: 'comision-1' },
          { estudianteId: 'estudiante-3', comisionId: 'comision-1' },
        ]);
        mockPrismaService.observacion.create.mockResolvedValue({
          ...mockObservacion,
          estudiantes: [
            { estudianteId: 'estudiante-1' },
            { estudianteId: 'estudiante-2' },
            { estudianteId: 'estudiante-3' },
          ],
        });

        // Act
        const result = await service.crear(dto, 'docente-1');

        // Assert
        expect(result.estudiantes).toHaveLength(3);
      });

      it('should_fail_when_no_students_provided', async () => {
        // Arrange
        const dto = {
          estudianteIds: [],
          contenido: 'Observación sin estudiantes asignados',
          fechaEvento: '2024-01-15',
          tipo: TipoObservacion.Academica,
        };

        // Act & Assert
        await expect(service.crear(dto, 'docente-1')).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should_fail_when_content_too_short', async () => {
        // Arrange
        const dto = {
          estudianteIds: ['estudiante-1'],
          contenido: 'Corto', // Menos de 10 caracteres
          fechaEvento: '2024-01-15',
          tipo: TipoObservacion.Academica,
        };

        // Act & Assert
        await expect(service.crear(dto, 'docente-1')).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should_fail_when_content_too_long', async () => {
        // Arrange
        const dto = {
          estudianteIds: ['estudiante-1'],
          contenido: 'x'.repeat(2001), // Más de 2000 caracteres
          fechaEvento: '2024-01-15',
          tipo: TipoObservacion.Academica,
        };

        // Act & Assert
        await expect(service.crear(dto, 'docente-1')).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should_fail_when_fechaEvento_is_future', async () => {
        // Arrange
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dto = {
          estudianteIds: ['estudiante-1'],
          contenido: 'Observación con fecha futura inválida',
          fechaEvento: tomorrow.toISOString().split('T')[0],
          tipo: TipoObservacion.Academica,
        };

        // Act & Assert
        await expect(service.crear(dto, 'docente-1')).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe('Reglas de negocio automáticas', () => {
      it('should_auto_set_notificarAdmin_when_prioridad_urgente', async () => {
        // Arrange
        const dto = {
          estudianteIds: ['estudiante-1'],
          comisionId: 'comision-1',
          contenido: 'Situación urgente que requiere atención inmediata',
          fechaEvento: '2024-01-15',
          tipo: TipoObservacion.Incidente,
          prioridad: PrioridadObservacion.Urgente,
          notificarAdmin: false,
        };

        mockPrismaService.comision.findFirst.mockResolvedValue(mockComision);
        mockPrismaService.inscripcionComision.findMany.mockResolvedValue([
          { estudianteId: 'estudiante-1', comisionId: 'comision-1' },
        ]);
        mockPrismaService.observacion.create.mockImplementation((args) => {
          return Promise.resolve({
            ...mockObservacion,
            ...args.data,
            id: 'obs-new',
          });
        });

        // Act
        await service.crear(dto, 'docente-1');

        // Assert
        expect(mockPrismaService.observacion.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              notificarAdmin: true,
            }),
          }),
        );
      });

      it('should_auto_set_requiereSeguimiento_when_tipo_incidente', async () => {
        // Arrange
        const dto = {
          estudianteIds: ['estudiante-1'],
          comisionId: 'comision-1',
          contenido: 'Incidente que ocurrió durante la clase práctica',
          fechaEvento: '2024-01-15',
          tipo: TipoObservacion.Incidente,
          requiereSeguimiento: false,
        };

        mockPrismaService.comision.findFirst.mockResolvedValue(mockComision);
        mockPrismaService.inscripcionComision.findMany.mockResolvedValue([
          { estudianteId: 'estudiante-1', comisionId: 'comision-1' },
        ]);
        mockPrismaService.observacion.create.mockImplementation((args) => {
          return Promise.resolve({
            ...mockObservacion,
            ...args.data,
          });
        });

        // Act
        await service.crear(dto, 'docente-1');

        // Assert
        expect(mockPrismaService.observacion.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              requiereSeguimiento: true,
            }),
          }),
        );
      });

      it('should_default_prioridad_to_baja_when_not_provided', async () => {
        // Arrange
        const dto = {
          estudianteIds: ['estudiante-1'],
          comisionId: 'comision-1',
          contenido: 'Observación sin prioridad especificada por el docente',
          fechaEvento: '2024-01-15',
          tipo: TipoObservacion.Academica,
        };

        mockPrismaService.comision.findFirst.mockResolvedValue(mockComision);
        mockPrismaService.inscripcionComision.findMany.mockResolvedValue([
          { estudianteId: 'estudiante-1', comisionId: 'comision-1' },
        ]);
        mockPrismaService.observacion.create.mockImplementation((args) => {
          return Promise.resolve({
            ...mockObservacion,
            ...args.data,
          });
        });

        // Act
        await service.crear(dto, 'docente-1');

        // Assert
        expect(mockPrismaService.observacion.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              prioridad: PrioridadObservacion.Baja,
            }),
          }),
        );
      });

      it('should_default_estado_to_abierta', async () => {
        // Arrange
        const dto = {
          estudianteIds: ['estudiante-1'],
          comisionId: 'comision-1',
          contenido: 'Nueva observación que debe iniciar en estado abierta',
          fechaEvento: '2024-01-15',
          tipo: TipoObservacion.Academica,
        };

        mockPrismaService.comision.findFirst.mockResolvedValue(mockComision);
        mockPrismaService.inscripcionComision.findMany.mockResolvedValue([
          { estudianteId: 'estudiante-1', comisionId: 'comision-1' },
        ]);
        mockPrismaService.observacion.create.mockImplementation((args) => {
          return Promise.resolve({
            ...mockObservacion,
            ...args.data,
          });
        });

        // Act
        await service.crear(dto, 'docente-1');

        // Assert
        expect(mockPrismaService.observacion.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              estado: EstadoObservacion.Abierta,
            }),
          }),
        );
      });
    });

    describe('Validaciones de pertenencia', () => {
      it('should_fail_when_docente_not_belongs_to_comision', async () => {
        // Arrange
        const dto = {
          estudianteIds: ['estudiante-1'],
          comisionId: 'comision-otra',
          contenido: 'Intentando crear observación en comisión ajena',
          fechaEvento: '2024-01-15',
          tipo: TipoObservacion.Academica,
        };

        mockPrismaService.comision.findFirst.mockResolvedValue(null);

        // Act & Assert
        await expect(service.crear(dto, 'docente-1')).rejects.toThrow(
          ForbiddenException,
        );
      });

      it('should_fail_when_estudiante_not_in_docente_comisiones', async () => {
        // Arrange
        const dto = {
          estudianteIds: ['estudiante-externo'],
          comisionId: 'comision-1',
          contenido: 'Observación de estudiante que no tengo asignado',
          fechaEvento: '2024-01-15',
          tipo: TipoObservacion.Academica,
        };

        mockPrismaService.comision.findFirst.mockResolvedValue(mockComision);
        mockPrismaService.inscripcionComision.findMany.mockResolvedValue([]);

        // Act & Assert
        await expect(service.crear(dto, 'docente-1')).rejects.toThrow(
          ForbiddenException,
        );
      });

      it('should_allow_observation_without_comision_if_estudiante_in_any_comision', async () => {
        // Arrange
        const dto = {
          estudianteIds: ['estudiante-1'],
          contenido:
            'Observación general del estudiante sin comisión específica',
          fechaEvento: '2024-01-15',
          tipo: TipoObservacion.Academica,
        };

        mockPrismaService.comision.findMany.mockResolvedValue([mockComision]);
        mockPrismaService.inscripcionComision.findMany.mockResolvedValue([
          { estudianteId: 'estudiante-1', comisionId: 'comision-1' },
        ]);
        mockPrismaService.observacion.create.mockResolvedValue({
          ...mockObservacion,
          comisionId: null,
        });

        // Act
        const result = await service.crear(dto, 'docente-1');

        // Assert
        expect(result).toBeDefined();
      });

      it('should_fail_when_estudiante_not_exists', async () => {
        // Arrange
        const dto = {
          estudianteIds: ['estudiante-inexistente'],
          comisionId: 'comision-1',
          contenido: 'Observación de estudiante que no existe en el sistema',
          fechaEvento: '2024-01-15',
          tipo: TipoObservacion.Academica,
        };

        mockPrismaService.comision.findFirst.mockResolvedValue(mockComision);
        mockPrismaService.inscripcionComision.findMany.mockResolvedValue([]);

        // Act & Assert
        await expect(service.crear(dto, 'docente-1')).rejects.toThrow(
          ForbiddenException,
        );
      });
    });
  });

  // ============================================================
  // 6.2 SEGUIMIENTO
  // ============================================================
  describe('Seguimiento', () => {
    describe('Creación de seguimiento', () => {
      it('should_add_seguimiento_when_autor_is_owner', async () => {
        // Arrange
        mockPrismaService.observacion.findUnique
          .mockResolvedValueOnce(mockObservacion)
          .mockResolvedValueOnce({
            ...mockObservacion,
            estado: EstadoObservacion.EnSeguimiento,
            seguimientos: [
              {
                id: 'seg-1',
                contenido: 'Seguimiento agregado por el autor',
              },
            ],
          });
        mockPrismaService.seguimientoObservacion.create.mockResolvedValue({
          id: 'seg-1',
          observacionId: 'obs-1',
          autorId: 'docente-1',
          autorTipo: 'Docente',
          contenido: 'Seguimiento agregado por el autor',
          createdAt: new Date(),
        });
        mockPrismaService.observacion.update.mockResolvedValue({
          ...mockObservacion,
          estado: EstadoObservacion.EnSeguimiento,
        });

        // Act
        const result = await service.agregarSeguimiento(
          'obs-1',
          { contenido: 'Seguimiento agregado por el autor' },
          mockDocenteUser,
        );

        // Assert
        expect(result).toBeDefined();
        expect(result?.seguimientos).toHaveLength(1);
      });

      it('should_add_seguimiento_when_autor_is_admin', async () => {
        // Arrange
        mockPrismaService.observacion.findUnique
          .mockResolvedValueOnce(mockObservacion)
          .mockResolvedValueOnce({
            ...mockObservacion,
            estado: EstadoObservacion.EnSeguimiento,
            seguimientos: [
              {
                id: 'seg-1',
                contenido: 'Seguimiento de administración sobre el caso',
              },
            ],
          });
        mockPrismaService.seguimientoObservacion.create.mockResolvedValue({
          id: 'seg-1',
          observacionId: 'obs-1',
          autorId: 'admin-1',
          autorTipo: 'Admin',
          contenido: 'Seguimiento de administración sobre el caso',
          createdAt: new Date(),
        });
        mockPrismaService.observacion.update.mockResolvedValue({
          ...mockObservacion,
          estado: EstadoObservacion.EnSeguimiento,
        });

        // Act
        const result = await service.agregarSeguimiento(
          'obs-1',
          { contenido: 'Seguimiento de administración sobre el caso' },
          mockAdminUser,
        );

        // Assert
        expect(result).toBeDefined();
      });

      it('should_fail_when_autor_is_different_docente', async () => {
        // Arrange
        mockPrismaService.observacion.findUnique.mockResolvedValue(
          mockObservacion,
        );

        // Act & Assert
        await expect(
          service.agregarSeguimiento(
            'obs-1',
            { contenido: 'Intentando agregar seguimiento a observación ajena' },
            mockOtroDocenteUser,
          ),
        ).rejects.toThrow(ForbiddenException);
      });

      it('should_fail_when_observacion_is_cerrada', async () => {
        // Arrange
        mockPrismaService.observacion.findUnique.mockResolvedValue({
          ...mockObservacion,
          estado: EstadoObservacion.Cerrada,
        });

        // Act & Assert
        await expect(
          service.agregarSeguimiento(
            'obs-1',
            { contenido: 'Intentando agregar a observación cerrada' },
            mockDocenteUser,
          ),
        ).rejects.toThrow(BadRequestException);
      });

      it('should_fail_when_contenido_too_short', async () => {
        // Arrange
        mockPrismaService.observacion.findUnique.mockResolvedValue(
          mockObservacion,
        );

        // Act & Assert
        await expect(
          service.agregarSeguimiento(
            'obs-1',
            { contenido: 'Hola' }, // Menos de 5 caracteres
            mockDocenteUser,
          ),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('Cambio de estado automático', () => {
      it('should_change_estado_to_en_seguimiento_when_first_seguimiento', async () => {
        // Arrange
        mockPrismaService.observacion.findUnique
          .mockResolvedValueOnce({
            ...mockObservacion,
            estado: EstadoObservacion.Abierta,
          })
          .mockResolvedValueOnce({
            ...mockObservacion,
            estado: EstadoObservacion.EnSeguimiento,
          });
        mockPrismaService.seguimientoObservacion.create.mockResolvedValue({
          id: 'seg-1',
          contenido: 'Primer seguimiento de la observación',
        });
        mockPrismaService.observacion.update.mockResolvedValue({
          ...mockObservacion,
          estado: EstadoObservacion.EnSeguimiento,
        });

        // Act
        await service.agregarSeguimiento(
          'obs-1',
          { contenido: 'Primer seguimiento de la observación' },
          mockDocenteUser,
        );

        // Assert
        expect(mockPrismaService.observacion.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              estado: EstadoObservacion.EnSeguimiento,
            }),
          }),
        );
      });

      it('should_keep_estado_en_seguimiento_when_already', async () => {
        // Arrange
        mockPrismaService.observacion.findUnique
          .mockResolvedValueOnce({
            ...mockObservacion,
            estado: EstadoObservacion.EnSeguimiento,
          })
          .mockResolvedValueOnce({
            ...mockObservacion,
            estado: EstadoObservacion.EnSeguimiento,
          });
        mockPrismaService.seguimientoObservacion.create.mockResolvedValue({
          id: 'seg-2',
          contenido: 'Segundo seguimiento adicional',
        });

        // Act
        await service.agregarSeguimiento(
          'obs-1',
          { contenido: 'Segundo seguimiento adicional' },
          mockDocenteUser,
        );

        // Assert - No debe llamar a update si ya está en EnSeguimiento
        expect(mockPrismaService.observacion.update).not.toHaveBeenCalled();
      });

      it('should_reopen_to_en_seguimiento_when_resuelta_and_new_seguimiento', async () => {
        // Arrange
        mockPrismaService.observacion.findUnique
          .mockResolvedValueOnce({
            ...mockObservacion,
            estado: EstadoObservacion.Resuelta,
          })
          .mockResolvedValueOnce({
            ...mockObservacion,
            estado: EstadoObservacion.EnSeguimiento,
          });
        mockPrismaService.seguimientoObservacion.create.mockResolvedValue({
          id: 'seg-3',
          contenido: 'Nuevo seguimiento que reabre la observación',
        });
        mockPrismaService.observacion.update.mockResolvedValue({
          ...mockObservacion,
          estado: EstadoObservacion.EnSeguimiento,
        });

        // Act
        await service.agregarSeguimiento(
          'obs-1',
          { contenido: 'Nuevo seguimiento que reabre la observación' },
          mockAdminUser,
        );

        // Assert
        expect(mockPrismaService.observacion.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              estado: EstadoObservacion.EnSeguimiento,
            }),
          }),
        );
      });
    });
  });

  // ============================================================
  // 6.3 CAMBIO DE ESTADO
  // ============================================================
  describe('Cambio de Estado', () => {
    describe('Transiciones válidas', () => {
      it('should_allow_abierta_to_resuelta', async () => {
        // Arrange
        mockPrismaService.observacion.findUnique.mockResolvedValue({
          ...mockObservacion,
          estado: EstadoObservacion.Abierta,
        });
        mockPrismaService.observacion.update.mockResolvedValue({
          ...mockObservacion,
          estado: EstadoObservacion.Resuelta,
        });

        // Act
        const result = await service.cambiarEstado(
          'obs-1',
          EstadoObservacion.Resuelta,
          mockDocenteUser,
        );

        // Assert
        expect(result.estado).toBe(EstadoObservacion.Resuelta);
      });

      it('should_allow_en_seguimiento_to_resuelta', async () => {
        // Arrange
        mockPrismaService.observacion.findUnique.mockResolvedValue({
          ...mockObservacion,
          estado: EstadoObservacion.EnSeguimiento,
        });
        mockPrismaService.observacion.update.mockResolvedValue({
          ...mockObservacion,
          estado: EstadoObservacion.Resuelta,
        });

        // Act
        const result = await service.cambiarEstado(
          'obs-1',
          EstadoObservacion.Resuelta,
          mockDocenteUser,
        );

        // Assert
        expect(result.estado).toBe(EstadoObservacion.Resuelta);
      });

      it('should_allow_resuelta_to_cerrada', async () => {
        // Arrange
        mockPrismaService.observacion.findUnique.mockResolvedValue({
          ...mockObservacion,
          estado: EstadoObservacion.Resuelta,
        });
        mockPrismaService.observacion.update.mockResolvedValue({
          ...mockObservacion,
          estado: EstadoObservacion.Cerrada,
        });

        // Act
        const result = await service.cambiarEstado(
          'obs-1',
          EstadoObservacion.Cerrada,
          mockDocenteUser,
        );

        // Assert
        expect(result.estado).toBe(EstadoObservacion.Cerrada);
      });
    });

    describe('Transiciones inválidas', () => {
      it('should_fail_cerrada_to_any_state', async () => {
        // Arrange
        mockPrismaService.observacion.findUnique.mockResolvedValue({
          ...mockObservacion,
          estado: EstadoObservacion.Cerrada,
        });

        // Act & Assert
        await expect(
          service.cambiarEstado(
            'obs-1',
            EstadoObservacion.Abierta,
            mockDocenteUser,
          ),
        ).rejects.toThrow(BadRequestException);
      });

      it('should_fail_abierta_to_cerrada_directly', async () => {
        // Arrange
        mockPrismaService.observacion.findUnique.mockResolvedValue({
          ...mockObservacion,
          estado: EstadoObservacion.Abierta,
        });

        // Act & Assert
        await expect(
          service.cambiarEstado(
            'obs-1',
            EstadoObservacion.Cerrada,
            mockDocenteUser,
          ),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('Permisos', () => {
      it('should_allow_owner_docente_to_change_estado', async () => {
        // Arrange
        mockPrismaService.observacion.findUnique.mockResolvedValue(
          mockObservacion,
        );
        mockPrismaService.observacion.update.mockResolvedValue({
          ...mockObservacion,
          estado: EstadoObservacion.Resuelta,
        });

        // Act
        const result = await service.cambiarEstado(
          'obs-1',
          EstadoObservacion.Resuelta,
          mockDocenteUser,
        );

        // Assert
        expect(result).toBeDefined();
      });

      it('should_allow_admin_to_change_estado', async () => {
        // Arrange
        mockPrismaService.observacion.findUnique.mockResolvedValue(
          mockObservacion,
        );
        mockPrismaService.observacion.update.mockResolvedValue({
          ...mockObservacion,
          estado: EstadoObservacion.Resuelta,
        });

        // Act
        const result = await service.cambiarEstado(
          'obs-1',
          EstadoObservacion.Resuelta,
          mockAdminUser,
        );

        // Assert
        expect(result).toBeDefined();
      });

      it('should_fail_when_different_docente', async () => {
        // Arrange
        mockPrismaService.observacion.findUnique.mockResolvedValue(
          mockObservacion,
        );

        // Act & Assert
        await expect(
          service.cambiarEstado(
            'obs-1',
            EstadoObservacion.Resuelta,
            mockOtroDocenteUser,
          ),
        ).rejects.toThrow(ForbiddenException);
      });
    });
  });

  // ============================================================
  // 6.4 INMUTABILIDAD
  // ============================================================
  describe('Inmutabilidad', () => {
    describe('No existe endpoint DELETE', () => {
      it('should_not_have_delete_method_in_service', () => {
        // Assert
        expect((service as any).eliminar).toBeUndefined();
        expect((service as any).delete).toBeUndefined();
        expect((service as any).remove).toBeUndefined();
      });
    });

    describe('Archivar observaciones', () => {
      it('should_allow_changing_estado_to_cerrada', async () => {
        // Arrange
        mockPrismaService.observacion.findUnique.mockResolvedValue({
          ...mockObservacion,
          estado: EstadoObservacion.Resuelta,
        });
        mockPrismaService.observacion.update.mockResolvedValue({
          ...mockObservacion,
          estado: EstadoObservacion.Cerrada,
        });

        // Act
        const result = await service.cambiarEstado(
          'obs-1',
          EstadoObservacion.Cerrada,
          mockDocenteUser,
        );

        // Assert
        expect(result.estado).toBe(EstadoObservacion.Cerrada);
      });

      it('should_hide_cerrada_observations_from_default_list', async () => {
        // Arrange
        mockPrismaService.observacion.findMany.mockResolvedValue([
          mockObservacion,
        ]);
        mockPrismaService.observacion.count.mockResolvedValue(1);

        // Act
        await service.listar({}, mockDocenteUser);

        // Assert - Por defecto no debe incluir cerradas
        expect(mockPrismaService.observacion.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              estado: { not: EstadoObservacion.Cerrada },
            }),
          }),
        );
      });

      it('should_include_cerrada_observations_when_explicitly_filtered', async () => {
        // Arrange
        mockPrismaService.observacion.findMany.mockResolvedValue([
          { ...mockObservacion, estado: EstadoObservacion.Cerrada },
        ]);
        mockPrismaService.observacion.count.mockResolvedValue(1);

        // Act
        await service.listar(
          { estado: EstadoObservacion.Cerrada },
          mockDocenteUser,
        );

        // Assert
        expect(mockPrismaService.observacion.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              estado: EstadoObservacion.Cerrada,
            }),
          }),
        );
      });
    });
  });

  // ============================================================
  // 6.5 CONSULTAS
  // ============================================================
  describe('Consultas', () => {
    describe('Listado básico', () => {
      it('should_return_only_own_observations_for_docente', async () => {
        // Arrange
        mockPrismaService.observacion.findMany.mockResolvedValue([
          mockObservacion,
        ]);
        mockPrismaService.observacion.count.mockResolvedValue(1);

        // Act
        await service.listar({}, mockDocenteUser);

        // Assert
        expect(mockPrismaService.observacion.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              docenteId: 'docente-1',
            }),
          }),
        );
      });

      it('should_return_all_observations_for_admin', async () => {
        // Arrange
        mockPrismaService.observacion.findMany.mockResolvedValue([
          mockObservacion,
        ]);
        mockPrismaService.observacion.count.mockResolvedValue(1);

        // Act
        await service.listar({}, mockAdminUser);

        // Assert
        const callArgs =
          mockPrismaService.observacion.findMany.mock.calls[0][0];
        expect(callArgs.where.docenteId).toBeUndefined();
      });

      it('should_order_by_createdAt_desc', async () => {
        // Arrange
        mockPrismaService.observacion.findMany.mockResolvedValue([
          mockObservacion,
        ]);
        mockPrismaService.observacion.count.mockResolvedValue(1);

        // Act
        await service.listar({}, mockDocenteUser);

        // Assert
        expect(mockPrismaService.observacion.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { createdAt: 'desc' },
          }),
        );
      });
    });

    describe('Filtros', () => {
      it('should_filter_by_tipo', async () => {
        // Arrange
        mockPrismaService.observacion.findMany.mockResolvedValue([]);
        mockPrismaService.observacion.count.mockResolvedValue(0);

        // Act
        await service.listar(
          { tipo: TipoObservacion.Academica },
          mockDocenteUser,
        );

        // Assert
        expect(mockPrismaService.observacion.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              tipo: TipoObservacion.Academica,
            }),
          }),
        );
      });

      it('should_filter_by_prioridad', async () => {
        // Arrange
        mockPrismaService.observacion.findMany.mockResolvedValue([]);
        mockPrismaService.observacion.count.mockResolvedValue(0);

        // Act
        await service.listar(
          { prioridad: PrioridadObservacion.Urgente },
          mockDocenteUser,
        );

        // Assert
        expect(mockPrismaService.observacion.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              prioridad: PrioridadObservacion.Urgente,
            }),
          }),
        );
      });

      it('should_filter_by_estado', async () => {
        // Arrange
        mockPrismaService.observacion.findMany.mockResolvedValue([]);
        mockPrismaService.observacion.count.mockResolvedValue(0);

        // Act
        await service.listar(
          { estado: EstadoObservacion.EnSeguimiento },
          mockDocenteUser,
        );

        // Assert
        expect(mockPrismaService.observacion.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              estado: EstadoObservacion.EnSeguimiento,
            }),
          }),
        );
      });

      it('should_filter_by_estudiante', async () => {
        // Arrange
        mockPrismaService.observacion.findMany.mockResolvedValue([]);
        mockPrismaService.observacion.count.mockResolvedValue(0);

        // Act
        await service.listar({ estudianteId: 'estudiante-1' }, mockDocenteUser);

        // Assert
        expect(mockPrismaService.observacion.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              estudiantes: {
                some: { estudianteId: 'estudiante-1' },
              },
            }),
          }),
        );
      });

      it('should_filter_by_comision', async () => {
        // Arrange
        mockPrismaService.observacion.findMany.mockResolvedValue([]);
        mockPrismaService.observacion.count.mockResolvedValue(0);

        // Act
        await service.listar({ comisionId: 'comision-1' }, mockDocenteUser);

        // Assert
        expect(mockPrismaService.observacion.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              comisionId: 'comision-1',
            }),
          }),
        );
      });

      it('should_filter_by_fecha_range', async () => {
        // Arrange
        mockPrismaService.observacion.findMany.mockResolvedValue([]);
        mockPrismaService.observacion.count.mockResolvedValue(0);

        // Act
        await service.listar(
          {
            fechaDesde: '2024-01-01',
            fechaHasta: '2024-01-31',
          },
          mockDocenteUser,
        );

        // Assert
        expect(mockPrismaService.observacion.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              fechaEvento: {
                gte: expect.any(Date),
                lte: expect.any(Date),
              },
            }),
          }),
        );
      });

      it('should_filter_by_requiereSeguimiento', async () => {
        // Arrange
        mockPrismaService.observacion.findMany.mockResolvedValue([]);
        mockPrismaService.observacion.count.mockResolvedValue(0);

        // Act
        await service.listar({ requiereSeguimiento: true }, mockDocenteUser);

        // Assert
        expect(mockPrismaService.observacion.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              requiereSeguimiento: true,
            }),
          }),
        );
      });
    });

    describe('Paginación', () => {
      it('should_respect_limit_parameter', async () => {
        // Arrange
        mockPrismaService.observacion.findMany.mockResolvedValue([]);
        mockPrismaService.observacion.count.mockResolvedValue(100);

        // Act
        await service.listar({ limit: 10 }, mockDocenteUser);

        // Assert
        expect(mockPrismaService.observacion.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            take: 10,
          }),
        );
      });

      it('should_respect_offset_parameter', async () => {
        // Arrange
        mockPrismaService.observacion.findMany.mockResolvedValue([]);
        mockPrismaService.observacion.count.mockResolvedValue(100);

        // Act
        await service.listar({ offset: 20 }, mockDocenteUser);

        // Assert
        expect(mockPrismaService.observacion.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            skip: 20,
          }),
        );
      });

      it('should_return_total_count', async () => {
        // Arrange
        mockPrismaService.observacion.findMany.mockResolvedValue([
          mockObservacion,
        ]);
        mockPrismaService.observacion.count.mockResolvedValue(50);

        // Act
        const result = await service.listar({}, mockDocenteUser);

        // Assert
        expect(result.total).toBe(50);
      });
    });

    describe('Includes', () => {
      it('should_include_estudiantes_on_detail', async () => {
        // Arrange
        mockPrismaService.observacion.findUnique.mockResolvedValue({
          ...mockObservacion,
          estudiantes: [
            {
              estudiante: { id: 'est-1', nombre: 'Juan', apellido: 'Pérez' },
            },
          ],
        });

        // Act
        await service.obtenerPorId('obs-1', mockDocenteUser);

        // Assert
        expect(mockPrismaService.observacion.findUnique).toHaveBeenCalledWith(
          expect.objectContaining({
            include: expect.objectContaining({
              estudiantes: expect.anything(),
            }),
          }),
        );
      });

      it('should_include_seguimientos_on_detail', async () => {
        // Arrange
        mockPrismaService.observacion.findUnique.mockResolvedValue({
          ...mockObservacion,
          seguimientos: [{ id: 'seg-1', contenido: 'Seguimiento test' }],
        });

        // Act
        await service.obtenerPorId('obs-1', mockDocenteUser);

        // Assert
        expect(mockPrismaService.observacion.findUnique).toHaveBeenCalledWith(
          expect.objectContaining({
            include: expect.objectContaining({
              seguimientos: expect.anything(),
            }),
          }),
        );
      });

      it('should_include_docente_name', async () => {
        // Arrange
        mockPrismaService.observacion.findUnique.mockResolvedValue({
          ...mockObservacion,
          docente: {
            id: 'doc-1',
            nombre: 'Prof',
            apellido: 'García',
          },
        });

        // Act
        await service.obtenerPorId('obs-1', mockDocenteUser);

        // Assert
        expect(mockPrismaService.observacion.findUnique).toHaveBeenCalledWith(
          expect.objectContaining({
            include: expect.objectContaining({
              docente: expect.anything(),
            }),
          }),
        );
      });
    });
  });
});
