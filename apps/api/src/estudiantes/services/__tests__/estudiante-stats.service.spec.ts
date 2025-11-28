import { Test, TestingModule } from '@nestjs/testing';
import { EstudianteStatsService } from '../estudiante-stats.service';
import { PrismaService } from '../../../core/database/prisma.service';

describe('EstudianteStatsService', () => {
  let service: EstudianteStatsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrisma = {
      estudiante: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstudianteStatsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<EstudianteStatsService>(EstudianteStatsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getEstadisticas', () => {
    it('debe retornar estadísticas completas con distribuciones', async () => {
      const mockEstudiantes = [
        {
          id: 'est-1',
          nombre: 'Juan',
          nivelEscolar: 'Primaria',
          puntos_totales: 100,
          casa: { id: 'eq-1', nombre: 'Equipo Rojo' },
        },
        {
          id: 'est-2',
          nombre: 'María',
          nivelEscolar: 'Primaria',
          puntos_totales: 150,
          casa: { id: 'eq-1', nombre: 'Equipo Rojo' },
        },
        {
          id: 'est-3',
          nombre: 'Pedro',
          nivelEscolar: 'Secundaria',
          puntos_totales: 200,
          casa: { id: 'eq-2', nombre: 'Equipo Azul' },
        },
      ];

      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue(mockEstudiantes as any);

      const result = await service.getEstadisticas('tutor-1');

      expect(result).toEqual({
        total: 3,
        por_nivel: {
          Primaria: 2,
          Secundaria: 1,
        },
        por_casa: {
          'Equipo Rojo': 2,
          'Equipo Azul': 1,
        },
        puntos_totales: 450,
      });
    });

    it('debe contar estudiantes sin equipo correctamente', async () => {
      const mockEstudiantes = [
        {
          id: 'est-1',
          nombre: 'Juan',
          nivelEscolar: 'Primaria',
          puntos_totales: 100,
          casa: { id: 'eq-1', nombre: 'Equipo Rojo' },
        },
        {
          id: 'est-2',
          nombre: 'María',
          nivelEscolar: 'Primaria',
          puntos_totales: 50,
          casa: null,
        },
        {
          id: 'est-3',
          nombre: 'Pedro',
          nivelEscolar: 'Secundaria',
          puntos_totales: 75,
          casa: null,
        },
      ];

      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue(mockEstudiantes as any);

      const result = await service.getEstadisticas('tutor-1');

      expect(result.por_casa).toEqual({
        'Equipo Rojo': 1,
        'Sin casa': 2,
      });
    });

    it('debe retornar estadísticas vacías si no hay estudiantes', async () => {
      jest.spyOn(prisma.estudiante, 'findMany').mockResolvedValue([]);

      const result = await service.getEstadisticas('tutor-1');

      expect(result).toEqual({
        total: 0,
        por_nivel: {},
        por_casa: {},
        puntos_totales: 0,
      });
    });

    it('debe calcular correctamente la suma de puntos totales', async () => {
      const mockEstudiantes = [
        {
          id: 'est-1',
          nombre: 'Juan',
          nivelEscolar: 'Primaria',
          puntos_totales: 123,
          casa: null,
        },
        {
          id: 'est-2',
          nombre: 'María',
          nivelEscolar: 'Primaria',
          puntos_totales: 456,
          casa: null,
        },
        {
          id: 'est-3',
          nombre: 'Pedro',
          nivelEscolar: 'Secundaria',
          puntos_totales: 789,
          casa: null,
        },
      ];

      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue(mockEstudiantes as any);

      const result = await service.getEstadisticas('tutor-1');

      expect(result.puntos_totales).toBe(1368);
    });

    it('debe agrupar correctamente múltiples niveles escolares', async () => {
      const mockEstudiantes = [
        {
          id: 'est-1',
          nivelEscolar: 'Preescolar',
          puntos_totales: 10,
          casa: null,
        },
        {
          id: 'est-2',
          nivelEscolar: 'Primaria',
          puntos_totales: 20,
          casa: null,
        },
        {
          id: 'est-3',
          nivelEscolar: 'Primaria',
          puntos_totales: 30,
          casa: null,
        },
        {
          id: 'est-4',
          nivelEscolar: 'Secundaria',
          puntos_totales: 40,
          casa: null,
        },
        {
          id: 'est-5',
          nivelEscolar: 'Secundaria',
          puntos_totales: 50,
          casa: null,
        },
        {
          id: 'est-6',
          nivelEscolar: 'Secundaria',
          puntos_totales: 60,
          casa: null,
        },
        {
          id: 'est-7',
          nivelEscolar: 'Universitario',
          puntos_totales: 70,
          casa: null,
        },
      ];

      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue(mockEstudiantes as any);

      const result = await service.getEstadisticas('tutor-1');

      expect(result.por_nivel).toEqual({
        Preescolar: 1,
        Primaria: 2,
        Secundaria: 3,
        Universitario: 1,
      });
    });

    it('debe agrupar correctamente múltiples equipos', async () => {
      const mockEstudiantes = [
        {
          id: 'est-1',
          nivelEscolar: 'Primaria',
          puntos_totales: 10,
          casa: { nombre: 'Equipo A' },
        },
        {
          id: 'est-2',
          nivelEscolar: 'Primaria',
          puntos_totales: 20,
          casa: { nombre: 'Equipo A' },
        },
        {
          id: 'est-3',
          nivelEscolar: 'Primaria',
          puntos_totales: 30,
          casa: { nombre: 'Equipo B' },
        },
        {
          id: 'est-4',
          nivelEscolar: 'Primaria',
          puntos_totales: 40,
          casa: { nombre: 'Equipo C' },
        },
        {
          id: 'est-5',
          nivelEscolar: 'Primaria',
          puntos_totales: 50,
          casa: { nombre: 'Equipo C' },
        },
        {
          id: 'est-6',
          nivelEscolar: 'Primaria',
          puntos_totales: 60,
          casa: { nombre: 'Equipo C' },
        },
      ];

      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue(mockEstudiantes as any);

      const result = await service.getEstadisticas('tutor-1');

      expect(result.por_casa).toEqual({
        'Equipo A': 2,
        'Equipo B': 1,
        'Equipo C': 3,
      });
    });

    it('debe llamar a Prisma con el tutorId correcto', async () => {
      jest.spyOn(prisma.estudiante, 'findMany').mockResolvedValue([]);

      await service.getEstadisticas('tutor-123');

      expect(prisma.estudiante.findMany).toHaveBeenCalledWith({
        where: { tutor_id: 'tutor-123' },
        include: { casa: true },
      });
    });

    it('debe manejar estudiantes con puntos_totales en cero', async () => {
      const mockEstudiantes = [
        {
          id: 'est-1',
          nivelEscolar: 'Primaria',
          puntos_totales: 0,
          casa: null,
        },
        {
          id: 'est-2',
          nivelEscolar: 'Primaria',
          puntos_totales: 0,
          casa: null,
        },
        {
          id: 'est-3',
          nivelEscolar: 'Primaria',
          puntos_totales: 100,
          casa: null,
        },
      ];

      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue(mockEstudiantes as any);

      const result = await service.getEstadisticas('tutor-1');

      expect(result.puntos_totales).toBe(100);
      expect(result.total).toBe(3);
    });

    it('debe manejar mezcla de estudiantes con y sin equipo', async () => {
      const mockEstudiantes = [
        {
          id: 'est-1',
          nivelEscolar: 'Primaria',
          puntos_totales: 10,
          casa: { nombre: 'Equipo Rojo' },
        },
        {
          id: 'est-2',
          nivelEscolar: 'Primaria',
          puntos_totales: 20,
          casa: null,
        },
        {
          id: 'est-3',
          nivelEscolar: 'Primaria',
          puntos_totales: 30,
          casa: { nombre: 'Equipo Azul' },
        },
        {
          id: 'est-4',
          nivelEscolar: 'Primaria',
          puntos_totales: 40,
          casa: null,
        },
        {
          id: 'est-5',
          nivelEscolar: 'Primaria',
          puntos_totales: 50,
          casa: { nombre: 'Equipo Rojo' },
        },
      ];

      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue(mockEstudiantes as any);

      const result = await service.getEstadisticas('tutor-1');

      expect(result.por_casa).toEqual({
        'Equipo Rojo': 2,
        'Equipo Azul': 1,
        'Sin casa': 2,
      });
    });
  });
});
