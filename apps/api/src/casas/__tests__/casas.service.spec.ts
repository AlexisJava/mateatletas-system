import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CasasService } from '../casas.service';
import { PrismaService } from '../../core/database/prisma.service';
import { CasaTipo } from '@prisma/client';

/**
 * CasasService - Tests TDD
 *
 * Sistema de 3 casas organizadas por edad:
 * - QUANTUM: 6-9 años (exploradores)
 * - VERTEX: 10-12 años (constructores)
 * - PULSAR: 13-17 años (dominadores)
 *
 * Reglas de negocio:
 * - La edad determina la casa BASE
 * - Un estudiante puede BAJAR de casa (nunca subir)
 * - PULSAR solo puede bajar a VERTEX (nunca a QUANTUM)
 * - Competencia es INTERNA por casa
 */
describe('CasasService', () => {
  let service: CasasService;
  let prisma: PrismaService;

  const mockCasas = [
    {
      id: 'casa-quantum-id',
      tipo: 'QUANTUM' as CasaTipo,
      nombre: 'Quantum',
      emoji: '🌟',
      slogan: 'Exploradores del conocimiento',
      edadMinima: 6,
      edadMaxima: 9,
      colorPrimary: '#F472B6',
      colorSecondary: '#F9A8D4',
      colorAccent: '#FCE7F3',
      colorDark: '#DB2777',
      gradiente: 'linear-gradient(135deg, #F472B6 0%, #FB923C 100%)',
      puntosTotales: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'casa-vertex-id',
      tipo: 'VERTEX' as CasaTipo,
      nombre: 'Vertex',
      emoji: '🚀',
      slogan: 'Constructores del futuro',
      edadMinima: 10,
      edadMaxima: 12,
      colorPrimary: '#38BDF8',
      colorSecondary: '#7DD3FC',
      colorAccent: '#E0F2FE',
      colorDark: '#0284C7',
      gradiente: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 100%)',
      puntosTotales: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'casa-pulsar-id',
      tipo: 'PULSAR' as CasaTipo,
      nombre: 'Pulsar',
      emoji: '⚡',
      slogan: 'Dominadores de skills',
      edadMinima: 13,
      edadMaxima: 17,
      colorPrimary: '#6366F1',
      colorSecondary: '#8B5CF6',
      colorAccent: '#6C7086',
      colorDark: '#11111B',
      gradiente:
        'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
      puntosTotales: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockPrismaService = {
    casa: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    estudiante: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CasasService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CasasService>(CasasService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('determinarCasaPorEdad', () => {
    it('should_assign_QUANTUM_when_age_is_6', () => {
      const resultado = service.determinarCasaPorEdad(6);
      expect(resultado).toBe('QUANTUM');
    });

    it('should_assign_QUANTUM_when_age_is_9', () => {
      const resultado = service.determinarCasaPorEdad(9);
      expect(resultado).toBe('QUANTUM');
    });

    it('should_assign_QUANTUM_when_age_is_7', () => {
      const resultado = service.determinarCasaPorEdad(7);
      expect(resultado).toBe('QUANTUM');
    });

    it('should_assign_VERTEX_when_age_is_10', () => {
      const resultado = service.determinarCasaPorEdad(10);
      expect(resultado).toBe('VERTEX');
    });

    it('should_assign_VERTEX_when_age_is_12', () => {
      const resultado = service.determinarCasaPorEdad(12);
      expect(resultado).toBe('VERTEX');
    });

    it('should_assign_VERTEX_when_age_is_11', () => {
      const resultado = service.determinarCasaPorEdad(11);
      expect(resultado).toBe('VERTEX');
    });

    it('should_assign_PULSAR_when_age_is_13', () => {
      const resultado = service.determinarCasaPorEdad(13);
      expect(resultado).toBe('PULSAR');
    });

    it('should_assign_PULSAR_when_age_is_17', () => {
      const resultado = service.determinarCasaPorEdad(17);
      expect(resultado).toBe('PULSAR');
    });

    it('should_assign_PULSAR_when_age_is_15', () => {
      const resultado = service.determinarCasaPorEdad(15);
      expect(resultado).toBe('PULSAR');
    });

    it('should_throw_error_when_age_is_below_6', () => {
      expect(() => service.determinarCasaPorEdad(5)).toThrow(
        'Edad fuera del rango permitido (6-17 años)',
      );
    });

    it('should_throw_error_when_age_is_above_17', () => {
      expect(() => service.determinarCasaPorEdad(18)).toThrow(
        'Edad fuera del rango permitido (6-17 años)',
      );
    });

    it('should_throw_error_when_age_is_negative', () => {
      expect(() => service.determinarCasaPorEdad(-1)).toThrow(
        'Edad fuera del rango permitido (6-17 años)',
      );
    });

    it('should_throw_error_when_age_is_zero', () => {
      expect(() => service.determinarCasaPorEdad(0)).toThrow(
        'Edad fuera del rango permitido (6-17 años)',
      );
    });
  });

  describe('puedeDescender', () => {
    it('should_allow_PULSAR_to_descend_to_VERTEX', () => {
      const resultado = service.puedeDescender('PULSAR', 'VERTEX');
      expect(resultado).toBe(true);
    });

    it('should_NOT_allow_PULSAR_to_descend_to_QUANTUM', () => {
      const resultado = service.puedeDescender('PULSAR', 'QUANTUM');
      expect(resultado).toBe(false);
    });

    it('should_allow_VERTEX_to_descend_to_QUANTUM', () => {
      const resultado = service.puedeDescender('VERTEX', 'QUANTUM');
      expect(resultado).toBe(true);
    });

    it('should_NOT_allow_QUANTUM_to_ascend_to_VERTEX', () => {
      const resultado = service.puedeDescender('QUANTUM', 'VERTEX');
      expect(resultado).toBe(false);
    });

    it('should_NOT_allow_QUANTUM_to_ascend_to_PULSAR', () => {
      const resultado = service.puedeDescender('QUANTUM', 'PULSAR');
      expect(resultado).toBe(false);
    });

    it('should_NOT_allow_VERTEX_to_ascend_to_PULSAR', () => {
      const resultado = service.puedeDescender('VERTEX', 'PULSAR');
      expect(resultado).toBe(false);
    });

    it('should_NOT_allow_same_casa_QUANTUM_to_QUANTUM', () => {
      const resultado = service.puedeDescender('QUANTUM', 'QUANTUM');
      expect(resultado).toBe(false);
    });

    it('should_NOT_allow_same_casa_VERTEX_to_VERTEX', () => {
      const resultado = service.puedeDescender('VERTEX', 'VERTEX');
      expect(resultado).toBe(false);
    });

    it('should_NOT_allow_same_casa_PULSAR_to_PULSAR', () => {
      const resultado = service.puedeDescender('PULSAR', 'PULSAR');
      expect(resultado).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should_return_all_3_casas', async () => {
      mockPrismaService.casa.findMany.mockResolvedValue(mockCasas);

      const resultado = await service.findAll();

      expect(resultado).toHaveLength(3);
      expect(mockPrismaService.casa.findMany).toHaveBeenCalled();
    });

    it('should_return_casas_ordered_by_edadMinima', async () => {
      mockPrismaService.casa.findMany.mockResolvedValue(mockCasas);

      const resultado = await service.findAll();

      expect(resultado[0]?.tipo).toBe('QUANTUM');
      expect(resultado[1]?.tipo).toBe('VERTEX');
      expect(resultado[2]?.tipo).toBe('PULSAR');
    });
  });

  describe('findOne', () => {
    it('should_return_casa_by_id', async () => {
      const casaQuantum = mockCasas[0];
      mockPrismaService.casa.findUnique.mockResolvedValue(casaQuantum);

      const resultado = await service.findOne('casa-quantum-id');

      expect(resultado).toEqual(casaQuantum);
      expect(mockPrismaService.casa.findUnique).toHaveBeenCalledWith({
        where: { id: 'casa-quantum-id' },
        include: expect.any(Object),
      });
    });

    it('should_throw_NotFoundException_when_casa_not_found', async () => {
      mockPrismaService.casa.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByTipo', () => {
    it('should_return_casa_by_tipo_QUANTUM', async () => {
      const casaQuantum = mockCasas[0];
      mockPrismaService.casa.findFirst.mockResolvedValue(casaQuantum);

      const resultado = await service.findByTipo('QUANTUM');

      expect(resultado).toEqual(casaQuantum);
      expect(mockPrismaService.casa.findFirst).toHaveBeenCalledWith({
        where: { tipo: 'QUANTUM' },
      });
    });

    it('should_throw_NotFoundException_when_tipo_not_found', async () => {
      mockPrismaService.casa.findFirst.mockResolvedValue(null);

      await expect(service.findByTipo('INVALID' as CasaTipo)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getRankingInterno', () => {
    it('should_return_estudiantes_ordenados_por_puntos', async () => {
      const casaQuantum = {
        ...mockCasas[0],
        // Ordenado en memoria por xp_total DESC
        estudiantes: [
          {
            id: 'est-2',
            nombre: 'Luis',
            apellido: 'Perez',
            recursos: { xp_total: 750 },
            nivel_actual: 3,
            avatarUrl: null,
          },
          {
            id: 'est-1',
            nombre: 'Ana',
            apellido: 'Garcia',
            recursos: { xp_total: 500 },
            nivel_actual: 2,
            avatarUrl: null,
          },
          {
            id: 'est-3',
            nombre: 'Maria',
            apellido: 'Lopez',
            recursos: { xp_total: 300 },
            nivel_actual: 1,
            avatarUrl: null,
          },
        ],
      };
      mockPrismaService.casa.findUnique.mockResolvedValue(casaQuantum);

      const resultado = await service.getRankingInterno('casa-quantum-id');

      expect(resultado).toHaveLength(3);
      // El servicio debe ordenar por puntos descendente
      expect(resultado[0]?.puntosTotales).toBe(750);
      expect(resultado[1]?.puntosTotales).toBe(500);
      expect(resultado[2]?.puntosTotales).toBe(300);
    });

    it('should_throw_NotFoundException_when_casa_not_found', async () => {
      mockPrismaService.casa.findUnique.mockResolvedValue(null);

      await expect(service.getRankingInterno('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should_return_empty_array_when_no_estudiantes', async () => {
      const casaSinEstudiantes = {
        ...mockCasas[0],
        estudiantes: [],
      };
      mockPrismaService.casa.findUnique.mockResolvedValue(casaSinEstudiantes);

      const resultado = await service.getRankingInterno('casa-quantum-id');

      expect(resultado).toHaveLength(0);
    });
  });

  describe('getEstadisticas', () => {
    it('should_return_estadisticas_de_todas_las_casas', async () => {
      const casasConEstudiantes = mockCasas.map((casa, index) => ({
        ...casa,
        _count: { estudiantes: (index + 1) * 10 },
        puntosTotales: (index + 1) * 1000,
      }));
      mockPrismaService.casa.findMany.mockResolvedValue(casasConEstudiantes);

      const resultado = await service.getEstadisticas();

      expect(resultado.totalCasas).toBe(3);
      expect(resultado.totalEstudiantes).toBe(60); // 10 + 20 + 30
      expect(resultado.ranking).toHaveLength(3);
    });
  });
});
