import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EstudianteQueryService } from '../estudiante-query.service';
import { PrismaService } from '../../../core/database/prisma.service';

describe('EstudianteQueryService', () => {
  let service: EstudianteQueryService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrisma = {
      estudiante: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
      },
      clase: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      claseGrupo: {
        findFirst: jest.fn(),
      },
      inscripcionClaseGrupo: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstudianteQueryService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<EstudianteQueryService>(EstudianteQueryService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllByTutor', () => {
    it('debe retornar estudiantes del tutor con paginación', async () => {
      const mockEstudiantes = [
        { id: 'est-1', nombre: 'Juan', tutor_id: 'tutor-1', equipo: null },
        { id: 'est-2', nombre: 'María', tutor_id: 'tutor-1', equipo: null },
      ];

      jest.spyOn(prisma.estudiante, 'findMany').mockResolvedValue(mockEstudiantes as any);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(2);

      const result = await service.findAllByTutor('tutor-1', { page: 1, limit: 10 });

      expect(result).toEqual({
        data: mockEstudiantes,
        metadata: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
      expect(prisma.estudiante.findMany).toHaveBeenCalledWith({
        where: { tutor_id: 'tutor-1' },
        include: { equipo: true },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('debe aplicar filtros de equipoId y nivelEscolar', async () => {
      jest.spyOn(prisma.estudiante, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(0);

      await service.findAllByTutor('tutor-1', {
        page: 1,
        limit: 10,
        equipoId: 'equipo-1',
        nivelEscolar: 'Primaria',
      });

      expect(prisma.estudiante.findMany).toHaveBeenCalledWith({
        where: {
          tutor_id: 'tutor-1',
          equipoId: 'equipo-1',
          nivelEscolar: 'Primaria',
        },
        include: { equipo: true },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('debe usar valores por defecto de paginación si no se proveen', async () => {
      jest.spyOn(prisma.estudiante, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(0);

      await service.findAllByTutor('tutor-1');

      expect(prisma.estudiante.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      );
    });
  });

  describe('findOneById', () => {
    it('debe retornar estudiante por ID sin validar ownership', async () => {
      const mockEstudiante = {
        id: 'est-1',
        nombre: 'Juan',
        tutor_id: 'tutor-1',
        equipo: null,
        tutor: { id: 'tutor-1', nombre: 'Pedro', apellido: 'López', email: 'pedro@test.com' },
      };

      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(mockEstudiante as any);

      const result = await service.findOneById('est-1');

      expect(result).toEqual(mockEstudiante);
      expect(prisma.estudiante.findUnique).toHaveBeenCalledWith({
        where: { id: 'est-1' },
        include: {
          equipo: true,
          tutor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
            },
          },
        },
      });
    });

    it('debe lanzar NotFoundException si el estudiante no existe', async () => {
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);

      await expect(service.findOneById('est-inexistente')).rejects.toThrow(NotFoundException);
      await expect(service.findOneById('est-inexistente')).rejects.toThrow('Estudiante no encontrado');
    });
  });

  describe('findOne', () => {
    it('debe retornar estudiante validando ownership', async () => {
      const mockEstudiante = {
        id: 'est-1',
        nombre: 'Juan',
        tutor_id: 'tutor-1',
        equipo: null,
        tutor: { id: 'tutor-1', nombre: 'Pedro', apellido: 'López', email: 'pedro@test.com' },
      };

      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(mockEstudiante as any);

      const result = await service.findOne('est-1', 'tutor-1');

      expect(result).toEqual(mockEstudiante);
    });

    it('debe lanzar NotFoundException si el estudiante no existe', async () => {
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('est-inexistente', 'tutor-1')).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar NotFoundException si el estudiante no pertenece al tutor', async () => {
      const mockEstudiante = {
        id: 'est-1',
        nombre: 'Juan',
        tutor_id: 'tutor-otro',
        equipo: null,
        tutor: { id: 'tutor-otro', nombre: 'Otro', apellido: 'Tutor', email: 'otro@test.com' },
      };

      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(mockEstudiante as any);

      await expect(service.findOne('est-1', 'tutor-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('debe retornar todos los estudiantes con paginación (admin)', async () => {
      const mockEstudiantes = [
        { id: 'est-1', nombre: 'Juan', tutor: {}, equipo: null },
        { id: 'est-2', nombre: 'María', tutor: {}, equipo: null },
      ];

      jest.spyOn(prisma.estudiante, 'findMany').mockResolvedValue(mockEstudiantes as any);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(2);

      const result = await service.findAll(1, 50);

      expect(result).toEqual({
        data: mockEstudiantes,
        meta: {
          total: 2,
          page: 1,
          limit: 50,
          totalPages: 1,
        },
      });
    });

    it('debe usar valores por defecto de paginación', async () => {
      jest.spyOn(prisma.estudiante, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(0);

      await service.findAll();

      expect(prisma.estudiante.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 50,
        }),
      );
    });
  });

  describe('countByTutor', () => {
    it('debe contar estudiantes de un tutor', async () => {
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(5);

      const result = await service.countByTutor('tutor-1');

      expect(result).toBe(5);
      expect(prisma.estudiante.count).toHaveBeenCalledWith({
        where: { tutor_id: 'tutor-1' },
      });
    });
  });

  describe('getDetalleCompleto', () => {
    it('debe retornar detalle completo del estudiante con estadísticas', async () => {
      const mockEstudiante = {
        id: 'est-1',
        nombre: 'Juan',
        tutor_id: 'tutor-1',
        nivel_actual: 5,
        puntos_totales: 100,
        equipo: null,
        logros_desbloqueados: [{ id: 'logro-1' }, { id: 'logro-2' }],
        inscripciones_clase: [],
        asistencias: [
          { id: 'asist-1', estado: 'Presente', clase: {} },
          { id: 'asist-2', estado: 'Presente', clase: {} },
          { id: 'asist-3', estado: 'Ausente', clase: {} },
        ],
      };

      jest.spyOn(prisma.estudiante, 'findFirst').mockResolvedValue(mockEstudiante as any);

      const result = await service.getDetalleCompleto('est-1', 'tutor-1');

      expect(result).toMatchObject({
        id: 'est-1',
        nombre: 'Juan',
        estadisticas: {
          total_clases: 3,
          clases_presente: 2,
          tasa_asistencia: 67,
          nivel: 5,
          puntos: 100,
          logros: 2,
        },
      });
    });

    it('debe lanzar NotFoundException si el estudiante no pertenece al tutor', async () => {
      jest.spyOn(prisma.estudiante, 'findFirst').mockResolvedValue(null);

      await expect(service.getDetalleCompleto('est-1', 'tutor-1')).rejects.toThrow(NotFoundException);
      await expect(service.getDetalleCompleto('est-1', 'tutor-1')).rejects.toThrow(
        'Estudiante no encontrado o no pertenece a este tutor',
      );
    });

    it('debe calcular tasa_asistencia como 0 si no hay clases', async () => {
      const mockEstudiante = {
        id: 'est-1',
        nombre: 'Juan',
        tutor_id: 'tutor-1',
        nivel_actual: 1,
        puntos_totales: 0,
        equipo: null,
        logros_desbloqueados: [],
        inscripciones_clase: [],
        asistencias: [],
      };

      jest.spyOn(prisma.estudiante, 'findFirst').mockResolvedValue(mockEstudiante as any);

      const result = await service.getDetalleCompleto('est-1', 'tutor-1');

      expect(result.estadisticas.tasa_asistencia).toBe(0);
    });
  });

  describe('obtenerClasesDisponiblesParaEstudiante', () => {
    it('debe retornar clases disponibles del sector del estudiante', async () => {
      const mockEstudiante = { id: 'est-1', sector_id: 'sector-1' };
      const mockClases = [
        { id: 'clase-1', cupos_ocupados: 5, cupos_maximo: 10, docente: {}, sector: {} },
        { id: 'clase-2', cupos_ocupados: 10, cupos_maximo: 10, docente: {}, sector: {} },
        { id: 'clase-3', cupos_ocupados: 2, cupos_maximo: 8, docente: {}, sector: {} },
      ];

      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(mockEstudiante as any);
      jest.spyOn(prisma.clase, 'findMany').mockResolvedValue(mockClases as any);

      const result = await service.obtenerClasesDisponiblesParaEstudiante('est-1');

      expect(result).toHaveLength(2);
      expect(result).toEqual([mockClases[0], mockClases[2]]);
    });

    it('debe lanzar BadRequestException si el estudiante no existe', async () => {
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);

      await expect(service.obtenerClasesDisponiblesParaEstudiante('est-inexistente')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.obtenerClasesDisponiblesParaEstudiante('est-inexistente')).rejects.toThrow(
        'El estudiante no existe',
      );
    });
  });

  describe('obtenerProximaClase', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-15T10:00:00Z')); // Miércoles 10:00 AM
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('debe retornar próxima clase grupal con fecha calculada', async () => {
      const mockClaseGrupo = {
        id: 'clase-grupo-1',
        nombre: 'Matemáticas Básicas',
        codigo: 'MAT-001',
        dia_semana: 'JUEVES',
        hora_inicio: '14:00',
        hora_fin: '15:30',
        activo: true,
        docente: { id: 'doc-1', nombre: 'Ana', apellido: 'García' },
        rutaCurricular: { id: 'ruta-1', nombre: 'Aritmética', descripcion: 'Curso básico' },
        grupo: { id: 'grupo-1', codigo: 'G-001', nombre: 'Grupo A', link_meet: 'https://meet.google.com/abc' },
      };

      jest.spyOn(prisma.claseGrupo, 'findFirst').mockResolvedValue(mockClaseGrupo as any);

      const result = await service.obtenerProximaClase('est-1');

      expect(result).toMatchObject({
        tipo: 'grupo',
        id: 'clase-grupo-1',
        nombre: 'Matemáticas Básicas',
        codigo: 'MAT-001',
        duracion_minutos: 90,
        dia_semana: 'JUEVES',
        hora_inicio: '14:00',
      });
      expect(result?.fecha_hora_inicio).toBeDefined();
    });

    it('debe retornar próxima clase individual si no hay clase grupal', async () => {
      const mockClaseIndividual = {
        id: 'clase-1',
        fecha_hora_inicio: new Date('2025-01-16T15:00:00Z'),
        duracion_minutos: 60,
        estado: 'Programada',
        docente: { id: 'doc-1', nombre: 'Ana', apellido: 'García' },
        rutaCurricular: { id: 'ruta-1', nombre: 'Aritmética', descripcion: 'Curso básico' },
      };

      jest.spyOn(prisma.claseGrupo, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.clase, 'findFirst').mockResolvedValue(mockClaseIndividual as any);

      const result = await service.obtenerProximaClase('est-1');

      expect(result).toMatchObject({
        tipo: 'individual',
        id: 'clase-1',
        duracion_minutos: 60,
        estado: 'Programada',
      });
    });

    it('debe retornar null si no hay clases programadas', async () => {
      jest.spyOn(prisma.claseGrupo, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.clase, 'findFirst').mockResolvedValue(null);

      const result = await service.obtenerProximaClase('est-1');

      expect(result).toBeNull();
    });
  });

  describe('obtenerCompanerosDeClase', () => {
    it('debe retornar compañeros del mismo ClaseGrupo', async () => {
      const mockInscripcion = {
        estudiante_id: 'est-1',
        clase_grupo_id: 'clase-grupo-1',
        claseGrupo: { id: 'clase-grupo-1' },
      };

      const mockCompaneros = [
        { id: 'est-2', nombre: 'María', apellido: 'López', puntos_totales: 150 },
        { id: 'est-3', nombre: 'Pedro', apellido: 'Gómez', puntos_totales: 100 },
      ];

      jest.spyOn(prisma.inscripcionClaseGrupo, 'findFirst').mockResolvedValue(mockInscripcion as any);
      jest.spyOn(prisma.estudiante, 'findMany').mockResolvedValue(mockCompaneros as any);

      const result = await service.obtenerCompanerosDeClase('est-1');

      expect(result).toEqual([
        { id: 'est-2', nombre: 'María', apellido: 'López', puntos: 150 },
        { id: 'est-3', nombre: 'Pedro', apellido: 'Gómez', puntos: 100 },
      ]);
    });

    it('debe retornar array vacío si el estudiante no tiene inscripciones', async () => {
      jest.spyOn(prisma.inscripcionClaseGrupo, 'findFirst').mockResolvedValue(null);

      const result = await service.obtenerCompanerosDeClase('est-1');

      expect(result).toEqual([]);
    });
  });

  describe('obtenerMisSectores', () => {
    it('debe retornar sectores únicos con sus grupos', async () => {
      const mockInscripciones = [
        {
          estudiante_id: 'est-1',
          clase_grupo_id: 'cg-1',
          fecha_baja: null,
          claseGrupo: {
            id: 'cg-1',
            grupo: {
              id: 'grupo-1',
              codigo: 'MAT-001',
              nombre: 'Matemáticas A',
              link_meet: 'https://meet.google.com/mat',
              sector: {
                id: 'sector-1',
                nombre: 'Matemática',
                descripcion: 'Sector de matemática',
                color: '#FF5733',
                icono: 'calculate',
              },
            },
          },
        },
        {
          estudiante_id: 'est-1',
          clase_grupo_id: 'cg-2',
          fecha_baja: null,
          claseGrupo: {
            id: 'cg-2',
            grupo: {
              id: 'grupo-2',
              codigo: 'PROG-001',
              nombre: 'Programación B',
              link_meet: 'https://meet.google.com/prog',
              sector: {
                id: 'sector-2',
                nombre: 'Programación',
                descripcion: 'Sector de programación',
                color: '#33C3FF',
                icono: 'code',
              },
            },
          },
        },
      ];

      jest.spyOn(prisma.inscripcionClaseGrupo, 'findMany').mockResolvedValue(mockInscripciones as any);

      const result = await service.obtenerMisSectores('est-1');

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'sector-1',
        nombre: 'Matemática',
        grupos: [
          {
            id: 'grupo-1',
            codigo: 'MAT-001',
            nombre: 'Matemáticas A',
            link_meet: 'https://meet.google.com/mat',
          },
        ],
      });
    });

    it('debe agrupar múltiples grupos del mismo sector', async () => {
      const mockInscripciones = [
        {
          estudiante_id: 'est-1',
          clase_grupo_id: 'cg-1',
          fecha_baja: null,
          claseGrupo: {
            id: 'cg-1',
            grupo: {
              id: 'grupo-1',
              codigo: 'MAT-001',
              nombre: 'Matemáticas A',
              link_meet: null,
              sector: {
                id: 'sector-1',
                nombre: 'Matemática',
                descripcion: null,
                color: '#FF5733',
                icono: 'calculate',
              },
            },
          },
        },
        {
          estudiante_id: 'est-1',
          clase_grupo_id: 'cg-2',
          fecha_baja: null,
          claseGrupo: {
            id: 'cg-2',
            grupo: {
              id: 'grupo-2',
              codigo: 'MAT-002',
              nombre: 'Matemáticas B',
              link_meet: null,
              sector: {
                id: 'sector-1',
                nombre: 'Matemática',
                descripcion: null,
                color: '#FF5733',
                icono: 'calculate',
              },
            },
          },
        },
      ];

      jest.spyOn(prisma.inscripcionClaseGrupo, 'findMany').mockResolvedValue(mockInscripciones as any);

      const result = await service.obtenerMisSectores('est-1');

      expect(result).toHaveLength(1);
      expect(result[0].grupos).toHaveLength(2);
    });

    it('debe retornar array vacío si no hay inscripciones activas', async () => {
      jest.spyOn(prisma.inscripcionClaseGrupo, 'findMany').mockResolvedValue([]);

      const result = await service.obtenerMisSectores('est-1');

      expect(result).toEqual([]);
    });
  });
});
