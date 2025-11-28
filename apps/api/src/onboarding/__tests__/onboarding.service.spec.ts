import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import {
  OnboardingEstado,
  NivelInterno,
  MundoTipo,
  TierNombre,
  CasaTipo,
} from '@prisma/client';
import { OnboardingService, AvatarConfig } from '../onboarding.service';
import { PrismaService } from '../../core/database/prisma.service';
import { TiersService } from '../../tiers/tiers.service';
import { CasasService } from '../../casas/casas.service';

/**
 * Tests TDD para OnboardingService - Sistema Mateatletas 2026
 *
 * SLICE 4: ONBOARDING
 *
 * Flujo de onboarding:
 * 1. PENDIENTE -> SELECCION_MUNDOS
 * 2. SELECCION_MUNDOS -> TEST_UBICACION
 * 3. TEST_UBICACION -> CONFIRMACION_CASA
 * 4. CONFIRMACION_CASA -> CREACION_AVATAR
 * 5. CREACION_AVATAR -> COMPLETADO
 *
 * Asignación de nivel por puntaje:
 * - 0-40: BASICO
 * - 41-70: INTERMEDIO
 * - 71-90: AVANZADO
 * - 91-100: OLIMPICO
 */
describe('OnboardingService', () => {
  let service: OnboardingService;

  // Mock data
  const mockEstudianteId = 'estudiante-123';
  const mockMundoMateId = 'mundo-mate-id';
  const mockMundoProgId = 'mundo-prog-id';
  const mockMundoCienciasId = 'mundo-ciencias-id';
  const mockCasaQuantumId = 'casa-quantum-id';
  const mockCasaVertexId = 'casa-vertex-id';

  const mockEstudianteInscripcion = {
    id: 'est-inscripcion-123',
    estudiante_id: mockEstudianteId,
    inscripcion_id: 'inscripcion-123',
    nombre: 'Juan Test',
    edad: 10,
    pin: '1234',
    tier_id: 'tier-arcade-id',
    onboarding_estado: OnboardingEstado.PENDIENTE,
    onboarding_completado_at: null,
    avatar_config: null,
    mundos_seleccionados: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    tier: {
      id: 'tier-arcade-id',
      nombre: TierNombre.ARCADE,
      precio_mensual: 30000,
      mundos_async: 1,
      mundos_sync: 0,
      tiene_docente: false,
    },
  };

  const mockEstudiante = {
    id: mockEstudianteId,
    casa_id: mockCasaVertexId,
    edad: 10,
    casa: {
      id: mockCasaVertexId,
      tipo: CasaTipo.VERTEX,
      nombre: 'Vertex',
    },
  };

  const mockMundoMatematica = {
    id: mockMundoMateId,
    tipo: MundoTipo.MATEMATICA,
    nombre: 'Matemática',
  };

  const mockMundoProgramacion = {
    id: mockMundoProgId,
    tipo: MundoTipo.PROGRAMACION,
    nombre: 'Programación',
  };

  const mockMundoCiencias = {
    id: mockMundoCienciasId,
    tipo: MundoTipo.CIENCIAS,
    nombre: 'Ciencias',
  };

  const mockCasaVertex = {
    id: mockCasaVertexId,
    tipo: CasaTipo.VERTEX,
    nombre: 'Vertex',
    edadMinima: 10,
    edadMaxima: 12,
  };

  const mockCasaQuantum = {
    id: mockCasaQuantumId,
    tipo: CasaTipo.QUANTUM,
    nombre: 'Quantum',
    edadMinima: 6,
    edadMaxima: 9,
  };

  const mockPrismaService = {
    estudianteInscripcion2026: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    estudiante: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    mundo: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    testUbicacionResultado: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    estudianteMundoNivel: {
      create: jest.fn(),
      upsert: jest.fn(),
    },
    casa: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const mockTiersService = {
    validarSeleccionMundos: jest.fn(),
    getCantidadMundosPorTier: jest.fn(),
  };

  const mockCasasService = {
    puedeDescender: jest.fn(),
    findByTipo: jest.fn(),
    determinarCasaPorEdad: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: TiersService,
          useValue: mockTiersService,
        },
        {
          provide: CasasService,
          useValue: mockCasasService,
        },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('getEstadoOnboarding', () => {
    it('should_return_current_onboarding_estado_for_estudiante', async () => {
      // Arrange
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue(
        mockEstudianteInscripcion,
      );

      // Act
      const result = await service.getEstadoOnboarding(mockEstudianteId);

      // Assert
      expect(result).toBe(OnboardingEstado.PENDIENTE);
      expect(
        mockPrismaService.estudianteInscripcion2026.findFirst,
      ).toHaveBeenCalledWith({
        where: { estudiante_id: mockEstudianteId },
      });
    });

    it('should_throw_NotFoundException_if_inscripcion_not_found', async () => {
      // Arrange
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue(
        null,
      );

      // Act & Assert
      await expect(service.getEstadoOnboarding('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('iniciarOnboarding', () => {
    it('should_set_estado_to_SELECCION_MUNDOS', async () => {
      // Arrange
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue(
        mockEstudianteInscripcion,
      );
      mockPrismaService.estudianteInscripcion2026.update.mockResolvedValue({
        ...mockEstudianteInscripcion,
        onboarding_estado: OnboardingEstado.SELECCION_MUNDOS,
      });

      // Act
      const result = await service.iniciarOnboarding(mockEstudianteId);

      // Assert
      expect(result).toBe(OnboardingEstado.SELECCION_MUNDOS);
      expect(
        mockPrismaService.estudianteInscripcion2026.update,
      ).toHaveBeenCalledWith({
        where: { id: mockEstudianteInscripcion.id },
        data: { onboarding_estado: OnboardingEstado.SELECCION_MUNDOS },
      });
    });

    it('should_throw_BadRequestException_if_already_started', async () => {
      // Arrange
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue({
        ...mockEstudianteInscripcion,
        onboarding_estado: OnboardingEstado.TEST_UBICACION,
      });

      // Act & Assert
      await expect(service.iniciarOnboarding(mockEstudianteId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('seleccionarMundos', () => {
    it('should_validate_mundos_count_matches_tier_ARCADE_1_async', async () => {
      // Arrange
      const inscripcionConTierArcade = {
        ...mockEstudianteInscripcion,
        onboarding_estado: OnboardingEstado.SELECCION_MUNDOS,
      };
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue(
        inscripcionConTierArcade,
      );
      // Service makes two findMany calls: one for async mundos, one for sync mundos
      mockPrismaService.mundo.findMany
        .mockResolvedValueOnce([mockMundoMatematica]) // async mundos
        .mockResolvedValueOnce([]); // sync mundos (empty for ARCADE)
      mockTiersService.validarSeleccionMundos.mockImplementation(() => {});
      mockPrismaService.estudianteInscripcion2026.update.mockResolvedValue({
        ...inscripcionConTierArcade,
        onboarding_estado: OnboardingEstado.TEST_UBICACION,
      });

      // Act
      const result = await service.seleccionarMundos(
        mockEstudianteId,
        [mockMundoMateId],
        [],
      );

      // Assert
      expect(result).toBe(OnboardingEstado.TEST_UBICACION);
      expect(mockTiersService.validarSeleccionMundos).toHaveBeenCalledWith(
        TierNombre.ARCADE,
        [MundoTipo.MATEMATICA],
        [],
      );
    });

    it('should_validate_mundos_count_matches_tier_ARCADE_PLUS_3_async', async () => {
      // Arrange
      const inscripcionConTierArcadePlus = {
        ...mockEstudianteInscripcion,
        onboarding_estado: OnboardingEstado.SELECCION_MUNDOS,
        tier: {
          ...mockEstudianteInscripcion.tier,
          nombre: TierNombre.ARCADE_PLUS,
          mundos_async: 3,
        },
      };
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue(
        inscripcionConTierArcadePlus,
      );
      // Service makes two findMany calls: one for async mundos, one for sync mundos
      mockPrismaService.mundo.findMany
        .mockResolvedValueOnce([
          mockMundoMatematica,
          mockMundoProgramacion,
          mockMundoCiencias,
        ]) // async mundos
        .mockResolvedValueOnce([]); // sync mundos (empty for ARCADE_PLUS)
      mockTiersService.validarSeleccionMundos.mockImplementation(() => {});
      mockPrismaService.estudianteInscripcion2026.update.mockResolvedValue({
        ...inscripcionConTierArcadePlus,
        onboarding_estado: OnboardingEstado.TEST_UBICACION,
      });

      // Act
      const result = await service.seleccionarMundos(
        mockEstudianteId,
        [mockMundoMateId, mockMundoProgId, mockMundoCienciasId],
        [],
      );

      // Assert
      expect(result).toBe(OnboardingEstado.TEST_UBICACION);
      expect(mockTiersService.validarSeleccionMundos).toHaveBeenCalledWith(
        TierNombre.ARCADE_PLUS,
        [MundoTipo.MATEMATICA, MundoTipo.PROGRAMACION, MundoTipo.CIENCIAS],
        [],
      );
    });

    it('should_validate_PRO_has_different_async_and_sync_mundos', async () => {
      // Arrange
      const inscripcionConTierPro = {
        ...mockEstudianteInscripcion,
        onboarding_estado: OnboardingEstado.SELECCION_MUNDOS,
        tier: {
          ...mockEstudianteInscripcion.tier,
          nombre: TierNombre.PRO,
          mundos_async: 1,
          mundos_sync: 1,
          tiene_docente: true,
        },
      };
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue(
        inscripcionConTierPro,
      );
      mockPrismaService.mundo.findMany
        .mockResolvedValueOnce([mockMundoMatematica]) // async
        .mockResolvedValueOnce([mockMundoProgramacion]); // sync
      mockTiersService.validarSeleccionMundos.mockImplementation(() => {});
      mockPrismaService.estudianteInscripcion2026.update.mockResolvedValue({
        ...inscripcionConTierPro,
        onboarding_estado: OnboardingEstado.TEST_UBICACION,
      });

      // Act
      const result = await service.seleccionarMundos(
        mockEstudianteId,
        [mockMundoMateId],
        [mockMundoProgId],
      );

      // Assert
      expect(result).toBe(OnboardingEstado.TEST_UBICACION);
      expect(mockTiersService.validarSeleccionMundos).toHaveBeenCalledWith(
        TierNombre.PRO,
        [MundoTipo.MATEMATICA],
        [MundoTipo.PROGRAMACION],
      );
    });

    it('should_throw_BadRequestException_if_mundos_exceed_tier_limit', async () => {
      // Arrange
      const inscripcionConTierArcade = {
        ...mockEstudianteInscripcion,
        onboarding_estado: OnboardingEstado.SELECCION_MUNDOS,
      };
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue(
        inscripcionConTierArcade,
      );
      mockPrismaService.mundo.findMany.mockResolvedValue([
        mockMundoMatematica,
        mockMundoProgramacion,
      ]);
      mockTiersService.validarSeleccionMundos.mockImplementation(() => {
        throw new BadRequestException('ARCADE permite maximo 1 mundo async');
      });

      // Act & Assert
      await expect(
        service.seleccionarMundos(
          mockEstudianteId,
          [mockMundoMateId, mockMundoProgId],
          [],
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should_throw_BadRequestException_if_not_in_correct_state', async () => {
      // Arrange
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue({
        ...mockEstudianteInscripcion,
        onboarding_estado: OnboardingEstado.PENDIENTE,
      });

      // Act & Assert
      await expect(
        service.seleccionarMundos(mockEstudianteId, [mockMundoMateId], []),
      ).rejects.toThrow(BadRequestException);
    });

    it('should_save_selected_mundos_in_inscripcion', async () => {
      // Arrange
      const inscripcion = {
        ...mockEstudianteInscripcion,
        onboarding_estado: OnboardingEstado.SELECCION_MUNDOS,
      };
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue(
        inscripcion,
      );
      mockPrismaService.mundo.findMany.mockResolvedValue([mockMundoMatematica]);
      mockTiersService.validarSeleccionMundos.mockImplementation(() => {});
      mockPrismaService.estudianteInscripcion2026.update.mockResolvedValue({
        ...inscripcion,
        onboarding_estado: OnboardingEstado.TEST_UBICACION,
      });

      // Act
      await service.seleccionarMundos(mockEstudianteId, [mockMundoMateId], []);

      // Assert
      expect(
        mockPrismaService.estudianteInscripcion2026.update,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            mundos_seleccionados: [mockMundoMateId],
            onboarding_estado: OnboardingEstado.TEST_UBICACION,
          }),
        }),
      );
    });
  });

  describe('registrarResultadoTest', () => {
    it('should_create_TestUbicacionResultado', async () => {
      // Arrange
      mockPrismaService.estudiante.findUnique.mockResolvedValue(mockEstudiante);
      mockPrismaService.testUbicacionResultado.create.mockResolvedValue({
        id: 'test-result-id',
        estudiante_id: mockEstudianteId,
        mundo_id: mockMundoMateId,
        puntaje: 65,
        nivel_asignado: NivelInterno.INTERMEDIO,
        bajo_de_casa: false,
        casa_original_id: mockCasaVertexId,
        casa_asignada_id: mockCasaVertexId,
      });
      mockPrismaService.estudianteMundoNivel.upsert.mockResolvedValue({});
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue({
        ...mockEstudianteInscripcion,
        onboarding_estado: OnboardingEstado.TEST_UBICACION,
        mundos_seleccionados: [mockMundoMateId],
      });
      mockPrismaService.testUbicacionResultado.count.mockResolvedValue(1);

      // Act
      const result = await service.registrarResultadoTest(
        mockEstudianteId,
        mockMundoMateId,
        65,
        15,
        10,
      );

      // Assert
      expect(result.id).toBeDefined();
      expect(
        mockPrismaService.testUbicacionResultado.create,
      ).toHaveBeenCalled();
    });

    it('should_assign_nivel_BASICO_for_puntaje_0_40', async () => {
      // Arrange
      mockPrismaService.estudiante.findUnique.mockResolvedValue(mockEstudiante);
      mockPrismaService.testUbicacionResultado.create.mockResolvedValue({
        id: 'test-result-id',
        estudiante_id: mockEstudianteId,
        mundo_id: mockMundoMateId,
        puntaje: 35,
        nivel_asignado: NivelInterno.BASICO,
        bajo_de_casa: false,
        casa_original_id: mockCasaVertexId,
        casa_asignada_id: mockCasaVertexId,
      });
      mockPrismaService.estudianteMundoNivel.upsert.mockResolvedValue({});
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue({
        ...mockEstudianteInscripcion,
        onboarding_estado: OnboardingEstado.TEST_UBICACION,
        mundos_seleccionados: [mockMundoMateId],
      });
      mockPrismaService.testUbicacionResultado.count.mockResolvedValue(1);

      // Act
      const result = await service.registrarResultadoTest(
        mockEstudianteId,
        mockMundoMateId,
        35,
        15,
        5,
      );

      // Assert
      expect(result.nivel_asignado).toBe(NivelInterno.BASICO);
    });

    it('should_assign_nivel_INTERMEDIO_for_puntaje_41_70', async () => {
      // Arrange
      mockPrismaService.estudiante.findUnique.mockResolvedValue(mockEstudiante);
      mockPrismaService.testUbicacionResultado.create.mockResolvedValue({
        id: 'test-result-id',
        estudiante_id: mockEstudianteId,
        mundo_id: mockMundoMateId,
        puntaje: 55,
        nivel_asignado: NivelInterno.INTERMEDIO,
        bajo_de_casa: false,
        casa_original_id: mockCasaVertexId,
        casa_asignada_id: mockCasaVertexId,
      });
      mockPrismaService.estudianteMundoNivel.upsert.mockResolvedValue({});
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue({
        ...mockEstudianteInscripcion,
        onboarding_estado: OnboardingEstado.TEST_UBICACION,
        mundos_seleccionados: [mockMundoMateId],
      });
      mockPrismaService.testUbicacionResultado.count.mockResolvedValue(1);

      // Act
      const result = await service.registrarResultadoTest(
        mockEstudianteId,
        mockMundoMateId,
        55,
        15,
        8,
      );

      // Assert
      expect(result.nivel_asignado).toBe(NivelInterno.INTERMEDIO);
    });

    it('should_assign_nivel_AVANZADO_for_puntaje_71_90', async () => {
      // Arrange
      mockPrismaService.estudiante.findUnique.mockResolvedValue(mockEstudiante);
      mockPrismaService.testUbicacionResultado.create.mockResolvedValue({
        id: 'test-result-id',
        estudiante_id: mockEstudianteId,
        mundo_id: mockMundoMateId,
        puntaje: 85,
        nivel_asignado: NivelInterno.AVANZADO,
        bajo_de_casa: false,
        casa_original_id: mockCasaVertexId,
        casa_asignada_id: mockCasaVertexId,
      });
      mockPrismaService.estudianteMundoNivel.upsert.mockResolvedValue({});
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue({
        ...mockEstudianteInscripcion,
        onboarding_estado: OnboardingEstado.TEST_UBICACION,
        mundos_seleccionados: [mockMundoMateId],
      });
      mockPrismaService.testUbicacionResultado.count.mockResolvedValue(1);

      // Act
      const result = await service.registrarResultadoTest(
        mockEstudianteId,
        mockMundoMateId,
        85,
        15,
        13,
      );

      // Assert
      expect(result.nivel_asignado).toBe(NivelInterno.AVANZADO);
    });

    it('should_assign_nivel_OLIMPICO_for_puntaje_91_100', async () => {
      // Arrange
      mockPrismaService.estudiante.findUnique.mockResolvedValue(mockEstudiante);
      mockPrismaService.testUbicacionResultado.create.mockResolvedValue({
        id: 'test-result-id',
        estudiante_id: mockEstudianteId,
        mundo_id: mockMundoMateId,
        puntaje: 95,
        nivel_asignado: NivelInterno.OLIMPICO,
        bajo_de_casa: false,
        casa_original_id: mockCasaVertexId,
        casa_asignada_id: mockCasaVertexId,
      });
      mockPrismaService.estudianteMundoNivel.upsert.mockResolvedValue({});
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue({
        ...mockEstudianteInscripcion,
        onboarding_estado: OnboardingEstado.TEST_UBICACION,
        mundos_seleccionados: [mockMundoMateId],
      });
      mockPrismaService.testUbicacionResultado.count.mockResolvedValue(1);

      // Act
      const result = await service.registrarResultadoTest(
        mockEstudianteId,
        mockMundoMateId,
        95,
        15,
        14,
      );

      // Assert
      expect(result.nivel_asignado).toBe(NivelInterno.OLIMPICO);
    });

    it('should_create_EstudianteMundoNivel_record', async () => {
      // Arrange
      mockPrismaService.estudiante.findUnique.mockResolvedValue(mockEstudiante);
      mockPrismaService.testUbicacionResultado.create.mockResolvedValue({
        id: 'test-result-id',
        estudiante_id: mockEstudianteId,
        mundo_id: mockMundoMateId,
        puntaje: 65,
        nivel_asignado: NivelInterno.INTERMEDIO,
        bajo_de_casa: false,
        casa_original_id: mockCasaVertexId,
        casa_asignada_id: mockCasaVertexId,
      });
      mockPrismaService.estudianteMundoNivel.upsert.mockResolvedValue({});
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue({
        ...mockEstudianteInscripcion,
        onboarding_estado: OnboardingEstado.TEST_UBICACION,
        mundos_seleccionados: [mockMundoMateId],
      });
      mockPrismaService.testUbicacionResultado.count.mockResolvedValue(1);

      // Act
      await service.registrarResultadoTest(
        mockEstudianteId,
        mockMundoMateId,
        65,
        15,
        10,
      );

      // Assert
      expect(
        mockPrismaService.estudianteMundoNivel.upsert,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            estudiante_id_mundo_id: {
              estudiante_id: mockEstudianteId,
              mundo_id: mockMundoMateId,
            },
          },
          create: expect.objectContaining({
            estudiante_id: mockEstudianteId,
            mundo_id: mockMundoMateId,
            nivel_interno: NivelInterno.INTERMEDIO,
          }),
        }),
      );
    });

    it('should_detect_if_estudiante_needs_to_bajar_de_casa', async () => {
      // Arrange - estudiante de 10 años con puntaje muy bajo
      mockPrismaService.estudiante.findUnique.mockResolvedValue(mockEstudiante);
      mockCasasService.puedeDescender.mockReturnValue(true);
      mockCasasService.findByTipo.mockResolvedValue(mockCasaQuantum);
      mockPrismaService.estudiante.update.mockResolvedValue({});
      mockPrismaService.testUbicacionResultado.create.mockResolvedValue({
        id: 'test-result-id',
        estudiante_id: mockEstudianteId,
        mundo_id: mockMundoMateId,
        puntaje: 15,
        nivel_asignado: NivelInterno.BASICO,
        bajo_de_casa: true,
        casa_original_id: mockCasaVertexId,
        casa_asignada_id: mockCasaQuantumId,
      });
      mockPrismaService.estudianteMundoNivel.upsert.mockResolvedValue({});
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue({
        ...mockEstudianteInscripcion,
        onboarding_estado: OnboardingEstado.TEST_UBICACION,
        mundos_seleccionados: [mockMundoMateId],
      });
      mockPrismaService.testUbicacionResultado.count.mockResolvedValue(1);

      // Act
      const result = await service.registrarResultadoTest(
        mockEstudianteId,
        mockMundoMateId,
        15,
        15,
        2,
      );

      // Assert
      expect(result.bajo_de_casa).toBe(true);
      expect(result.casa_asignada_id).toBe(mockCasaQuantumId);
    });

    it('should_throw_NotFoundException_if_estudiante_not_found', async () => {
      // Arrange
      mockPrismaService.estudiante.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.registrarResultadoTest(
          'invalid-id',
          mockMundoMateId,
          65,
          15,
          10,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('confirmarCasa', () => {
    it('should_advance_estado_to_CREACION_AVATAR', async () => {
      // Arrange
      const inscripcion = {
        ...mockEstudianteInscripcion,
        onboarding_estado: OnboardingEstado.CONFIRMACION_CASA,
      };
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue(
        inscripcion,
      );
      mockPrismaService.estudianteInscripcion2026.update.mockResolvedValue({
        ...inscripcion,
        onboarding_estado: OnboardingEstado.CREACION_AVATAR,
      });

      // Act
      const result = await service.confirmarCasa(mockEstudianteId);

      // Assert
      expect(result).toBe(OnboardingEstado.CREACION_AVATAR);
      expect(
        mockPrismaService.estudianteInscripcion2026.update,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { onboarding_estado: OnboardingEstado.CREACION_AVATAR },
        }),
      );
    });

    it('should_throw_BadRequestException_if_not_in_correct_state', async () => {
      // Arrange
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue({
        ...mockEstudianteInscripcion,
        onboarding_estado: OnboardingEstado.SELECCION_MUNDOS,
      });

      // Act & Assert
      await expect(service.confirmarCasa(mockEstudianteId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should_throw_NotFoundException_if_inscripcion_not_found', async () => {
      // Arrange
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue(
        null,
      );

      // Act & Assert
      await expect(service.confirmarCasa('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('guardarAvatar', () => {
    const mockAvatarConfig: AvatarConfig = {
      skin: 'medium',
      hair: 'short',
      eyes: 'brown',
      outfit: 'casual',
      accessories: [],
    };

    it('should_save_avatar_config_and_complete_onboarding', async () => {
      // Arrange
      const inscripcion = {
        ...mockEstudianteInscripcion,
        onboarding_estado: OnboardingEstado.CREACION_AVATAR,
      };
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue(
        inscripcion,
      );
      mockPrismaService.estudianteInscripcion2026.update.mockResolvedValue({
        ...inscripcion,
        avatar_config: mockAvatarConfig,
        onboarding_estado: OnboardingEstado.COMPLETADO,
        onboarding_completado_at: new Date(),
      });

      // Act
      const result = await service.guardarAvatar(
        mockEstudianteId,
        mockAvatarConfig,
      );

      // Assert
      expect(result).toBe(OnboardingEstado.COMPLETADO);
      expect(
        mockPrismaService.estudianteInscripcion2026.update,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            avatar_config: mockAvatarConfig,
            onboarding_estado: OnboardingEstado.COMPLETADO,
            onboarding_completado_at: expect.any(Date),
          }),
        }),
      );
    });

    it('should_throw_BadRequestException_if_not_in_correct_state', async () => {
      // Arrange
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue({
        ...mockEstudianteInscripcion,
        onboarding_estado: OnboardingEstado.TEST_UBICACION,
      });

      // Act & Assert
      await expect(
        service.guardarAvatar(mockEstudianteId, mockAvatarConfig),
      ).rejects.toThrow(BadRequestException);
    });

    it('should_throw_NotFoundException_if_inscripcion_not_found', async () => {
      // Arrange
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue(
        null,
      );

      // Act & Assert
      await expect(
        service.guardarAvatar('invalid-id', mockAvatarConfig),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProgresoOnboarding', () => {
    it('should_return_progress_info', async () => {
      // Arrange
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue({
        ...mockEstudianteInscripcion,
        onboarding_estado: OnboardingEstado.TEST_UBICACION,
        mundos_seleccionados: [mockMundoMateId],
      });
      mockPrismaService.estudiante.findUnique.mockResolvedValue(mockEstudiante);
      mockPrismaService.testUbicacionResultado.count.mockResolvedValue(0);

      // Act
      const result = await service.getProgresoOnboarding(mockEstudianteId);

      // Assert
      expect(result.estado_actual).toBe(OnboardingEstado.TEST_UBICACION);
      expect(result.mundos_seleccionados).toHaveLength(1);
      expect(result.tests_completados).toBe(0);
      expect(result.tests_pendientes).toBe(1);
      expect(result.porcentaje_completado).toBe(40);
    });

    it('should_return_100_percent_when_completed', async () => {
      // Arrange
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue({
        ...mockEstudianteInscripcion,
        onboarding_estado: OnboardingEstado.COMPLETADO,
        mundos_seleccionados: [mockMundoMateId],
        avatar_config: { skin: 'light' },
      });
      mockPrismaService.estudiante.findUnique.mockResolvedValue(mockEstudiante);
      mockPrismaService.testUbicacionResultado.count.mockResolvedValue(1);

      // Act
      const result = await service.getProgresoOnboarding(mockEstudianteId);

      // Assert
      expect(result.estado_actual).toBe(OnboardingEstado.COMPLETADO);
      expect(result.porcentaje_completado).toBe(100);
      expect(result.avatar_configurado).toBe(true);
    });

    it('should_throw_NotFoundException_if_inscripcion_not_found', async () => {
      // Arrange
      mockPrismaService.estudianteInscripcion2026.findFirst.mockResolvedValue(
        null,
      );

      // Act & Assert
      await expect(service.getProgresoOnboarding('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
