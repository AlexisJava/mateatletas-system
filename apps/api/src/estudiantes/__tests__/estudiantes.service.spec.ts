import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EstudiantesService } from '../estudiantes.service';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * EstudiantesService - COMPREHENSIVE TESTS
 *
 * Coverage de TODOS los métodos del servicio:
 * - create(): Crear estudiante
 * - findAllByTutor(): Listar con filtros y paginación
 * - findOne(): Obtener por ID con ownership
 * - update(): Actualizar con validaciones
 * - remove(): Eliminar con ownership
 * - countByTutor(): Contar estudiantes
 * - getEstadisticas(): Estadísticas agregadas
 * - findAll(): Listar todos (admin)
 * - updateAvatar(): Actualizar avatar
 * - getDetalleCompleto(): Detalle completo con métricas
 */

describe('EstudiantesService', () => {
  let service: EstudiantesService;
  let prisma: PrismaService;

  const mockTutor = {
    id: 'tutor-1',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@example.com',
  };

  const mockEquipo = {
    id: 'equipo-1',
    nombre: 'Equipo Rojo',
    color_primario: '#FF0000',
    color_secundario: '#FFaaaa',
  };

  const mockEstudiante = {
    id: 'est-1',
    nombre: 'María',
    apellido: 'González',
    edad: 10,
    nivel_escolar: 'Primaria',
    nivel_actual: 1,
    puntos_totales: 100,
    tutor_id: 'tutor-1',
    equipo_id: 'equipo-1',
    avatar_url: 'avatar-default',
    foto_url: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstudiantesService,
        {
          provide: PrismaService,
          useValue: {
            tutor: {
              findUnique: jest.fn(),
            },
            equipo: {
              findUnique: jest.fn(),
            },
            estudiante: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<EstudiantesService>(EstudiantesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      nombre: 'María',
      apellido: 'González',
      edad: 10,
      nivel_escolar: 'Primaria',
      equipo_id: 'equipo-1',
    };

    it('should create a student successfully', async () => {
      // Arrange
      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(mockTutor as any);
      jest
        .spyOn(prisma.equipo, 'findUnique')
        .mockResolvedValue(mockEquipo as any);
      jest.spyOn(prisma.estudiante, 'create').mockResolvedValue({
        ...mockEstudiante,
        equipo: mockEquipo,
      } as any);

      // Act
      const result = await service.create('tutor-1', createDto);

      // Assert
      expect(result).toHaveProperty('id');
      expect(result.nombre).toBe('María');
      expect(result.equipo).toEqual(mockEquipo);
      expect(prisma.estudiante.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          tutor_id: 'tutor-1',
        },
        include: {
          equipo: true,
        },
      });
    });

    it('should throw NotFoundException if tutor does not exist', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.create('non-existent', createDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create('non-existent', createDto)).rejects.toThrow(
        'Tutor no encontrado',
      );
    });

    it('should throw NotFoundException if equipo does not exist', async () => {
      // Arrange
      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(mockTutor as any);
      jest.spyOn(prisma.equipo, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.create('tutor-1', createDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create('tutor-1', createDto)).rejects.toThrow(
        'Equipo no encontrado',
      );
    });

    it('should validate age is between 3 and 99', async () => {
      // Arrange
      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(mockTutor as any);
      jest
        .spyOn(prisma.equipo, 'findUnique')
        .mockResolvedValue(mockEquipo as any); // Mock equipo to pass equipo validation first

      const invalidDtoYoung = { ...createDto, edad: 2 };
      const invalidDtoOld = { ...createDto, edad: 100 };

      // Act & Assert - Too young
      await expect(service.create('tutor-1', invalidDtoYoung)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create('tutor-1', invalidDtoYoung)).rejects.toThrow(
        'La edad debe estar entre 3 y 99 años',
      );

      // Act & Assert - Too old
      await expect(service.create('tutor-1', invalidDtoOld)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create student without equipo_id', async () => {
      // Arrange
      const dtoWithoutEquipo = {
        nombre: 'María',
        apellido: 'González',
        edad: 10,
        nivel_escolar: 'Primaria',
      };

      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(mockTutor as any);
      jest
        .spyOn(prisma.estudiante, 'create')
        .mockResolvedValue(mockEstudiante as any);

      // Act
      const result = await service.create('tutor-1', dtoWithoutEquipo);

      // Assert
      expect(result).toBeDefined();
      expect(prisma.equipo.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('findAllByTutor', () => {
    it('should return paginated list of students', async () => {
      // Arrange
      const mockEstudiantes = [
        { ...mockEstudiante, id: 'est-1', equipo: mockEquipo },
        { ...mockEstudiante, id: 'est-2', equipo: mockEquipo },
      ];

      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue(mockEstudiantes as any);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(2);

      // Act
      const result = await service.findAllByTutor('tutor-1', {
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.metadata.total).toBe(2);
      expect(result.metadata.page).toBe(1);
      expect(result.metadata.limit).toBe(10);
      expect(result.metadata.totalPages).toBe(1);
    });

    it('should filter by equipo_id', async () => {
      // Arrange
      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue([mockEstudiante] as any);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(1);

      // Act
      await service.findAllByTutor('tutor-1', { equipo_id: 'equipo-1' });

      // Assert
      expect(prisma.estudiante.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tutor_id: 'tutor-1',
            equipo_id: 'equipo-1',
          }),
        }),
      );
    });

    it('should filter by nivel_escolar', async () => {
      // Arrange
      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue([mockEstudiante] as any);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(1);

      // Act
      await service.findAllByTutor('tutor-1', { nivel_escolar: 'Primaria' });

      // Assert
      expect(prisma.estudiante.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tutor_id: 'tutor-1',
            nivel_escolar: 'Primaria',
          }),
        }),
      );
    });

    it('should handle pagination correctly', async () => {
      // Arrange
      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue([mockEstudiante] as any);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(25);

      // Act
      const result = await service.findAllByTutor('tutor-1', {
        page: 2,
        limit: 10,
      });

      // Assert
      expect(prisma.estudiante.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (2-1) * 10
          take: 10,
        }),
      );
      expect(result.metadata.totalPages).toBe(3); // ceil(25/10)
    });

    it('should use default pagination when not provided', async () => {
      // Arrange
      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue([mockEstudiante] as any);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(1);

      // Act
      const result = await service.findAllByTutor('tutor-1');

      // Assert
      expect(result.metadata.page).toBe(1);
      expect(result.metadata.limit).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return student when found and ownership matches', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue({
        ...mockEstudiante,
        equipo: mockEquipo,
        tutor: mockTutor,
      } as any);

      // Act
      const result = await service.findOne('est-1', 'tutor-1');

      // Assert
      expect(result).toHaveProperty('id', 'est-1');
      expect(result.equipo).toEqual(mockEquipo);
      expect(result.tutor).toEqual(mockTutor);
    });

    it('should throw NotFoundException if student does not exist', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('non-existent', 'tutor-1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent', 'tutor-1')).rejects.toThrow(
        'Estudiante no encontrado',
      );
    });

    it('should throw NotFoundException if ownership does not match', async () => {
      // Arrange - Student belongs to tutor-1 but tutor-2 is requesting
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue({
        ...mockEstudiante,
        tutor_id: 'tutor-1',
      } as any);

      // Act & Assert
      await expect(service.findOne('est-1', 'tutor-2')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('est-1', 'tutor-2')).rejects.toThrow(
        'Estudiante no encontrado',
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      nombre: 'María Updated',
      edad: 11,
    };

    it('should update student successfully', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue({
        ...mockEstudiante,
        tutor: mockTutor,
      } as any);
      jest.spyOn(prisma.estudiante, 'update').mockResolvedValue({
        ...mockEstudiante,
        ...updateDto,
        equipo: mockEquipo,
      } as any);

      // Act
      const result = await service.update('est-1', 'tutor-1', updateDto);

      // Assert
      expect(result.nombre).toBe('María Updated');
      expect(result.edad).toBe(11);
    });

    it('should validate ownership before updating', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue({
        ...mockEstudiante,
        tutor_id: 'tutor-1',
      } as any);

      // Act & Assert
      await expect(
        service.update('est-1', 'tutor-2', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate edad when updating', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue({
        ...mockEstudiante,
        tutor: mockTutor,
      } as any);

      const invalidDto = { edad: 2 };

      // Act & Assert
      await expect(
        service.update('est-1', 'tutor-1', invalidDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update('est-1', 'tutor-1', invalidDto),
      ).rejects.toThrow('La edad debe estar entre 3 y 99 años');
    });

    it('should validate equipo exists when updating equipo_id', async () => {
      // Arrange
      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValueOnce({
          ...mockEstudiante,
          tutor: mockTutor,
        } as any)
        .mockResolvedValueOnce(null); // equipo not found

      jest.spyOn(prisma.equipo, 'findUnique').mockResolvedValue(null);

      const dtoWithEquipo = { equipo_id: 'non-existent-equipo' };

      // Act & Assert
      await expect(
        service.update('est-1', 'tutor-1', dtoWithEquipo),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete student successfully', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue({
        ...mockEstudiante,
        tutor: mockTutor,
      } as any);
      jest
        .spyOn(prisma.estudiante, 'delete')
        .mockResolvedValue(mockEstudiante as any);

      // Act
      const result = await service.remove('est-1', 'tutor-1');

      // Assert
      expect(result).toEqual({ message: 'Estudiante eliminado exitosamente' });
      expect(prisma.estudiante.delete).toHaveBeenCalledWith({
        where: { id: 'est-1' },
      });
    });

    it('should validate ownership before deleting', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue({
        ...mockEstudiante,
        tutor_id: 'tutor-1',
      } as any);

      // Act & Assert
      await expect(service.remove('est-1', 'tutor-2')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.estudiante.delete).not.toHaveBeenCalled();
    });
  });

  describe('countByTutor', () => {
    it('should return count of students for tutor', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(5);

      // Act
      const result = await service.countByTutor('tutor-1');

      // Assert
      expect(result).toBe(5);
      expect(prisma.estudiante.count).toHaveBeenCalledWith({
        where: { tutor_id: 'tutor-1' },
      });
    });
  });

  describe('getEstadisticas', () => {
    it('should return statistics with distributions', async () => {
      // Arrange
      const estudiantes = [
        {
          ...mockEstudiante,
          id: 'est-1',
          nivel_escolar: 'Primaria',
          puntos_totales: 100,
          equipo: { nombre: 'Equipo Rojo' },
        },
        {
          ...mockEstudiante,
          id: 'est-2',
          nivel_escolar: 'Primaria',
          puntos_totales: 150,
          equipo: { nombre: 'Equipo Azul' },
        },
        {
          ...mockEstudiante,
          id: 'est-3',
          nivel_escolar: 'Secundaria',
          puntos_totales: 200,
          equipo: null,
        },
      ];

      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue(estudiantes as any);

      // Act
      const result = await service.getEstadisticas('tutor-1');

      // Assert
      expect(result.total).toBe(3);
      expect(result.por_nivel).toEqual({
        Primaria: 2,
        Secundaria: 1,
      });
      expect(result.por_equipo).toEqual({
        'Equipo Rojo': 1,
        'Equipo Azul': 1,
        'Sin equipo': 1,
      });
      expect(result.puntos_totales).toBe(450); // 100 + 150 + 200
    });
  });

  describe('findAll (admin)', () => {
    it('should return all students with pagination', async () => {
      // Arrange
      const mockEstudiantes = [
        {
          ...mockEstudiante,
          id: 'est-1',
          tutor: mockTutor,
          equipo: mockEquipo,
        },
        {
          ...mockEstudiante,
          id: 'est-2',
          tutor: mockTutor,
          equipo: mockEquipo,
        },
      ];

      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue(mockEstudiantes as any);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(100);

      // Act
      const result = await service.findAll(1, 50);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(100);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(50);
      expect(result.meta.totalPages).toBe(2);
    });
  });

  describe('updateAvatar', () => {
    it('should update avatar successfully', async () => {
      // Arrange
      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);
      jest.spyOn(prisma.estudiante, 'update').mockResolvedValue({
        id: 'est-1',
        nombre: 'María',
        apellido: 'González',
        avatar_gradient: 4,
      } as any);

      // Act
      const result = await service.updateAvatar('est-1', 4);

      // Assert
      expect(result.avatar_gradient).toBe(4);
      expect(prisma.estudiante.update).toHaveBeenCalledWith({
        where: { id: 'est-1' },
        data: { avatar_gradient: 4 },
        select: expect.objectContaining({
          id: true,
          nombre: true,
          apellido: true,
          avatar_gradient: true,
        }),
      });
    });

    it('should throw NotFoundException if student does not exist', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateAvatar('non-existent', 7),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getDetalleCompleto', () => {
    it('should return complete student details with statistics', async () => {
      // Arrange
      const mockDetalleCompleto = {
        ...mockEstudiante,
        equipo: mockEquipo,
        logrosDesbloqueados: [
          {
            id: 'logro-1',
            logro: { nombre: 'Logro 1' },
            fecha_obtenido: new Date(),
          },
        ],
        inscripciones_clase: [
          {
            id: 'insc-1',
            clase: {
              id: 'clase-1',
              nombre: 'Matemáticas',
              rutaCurricular: { nombre: 'Álgebra' },
              docente: {
                id: 'doc-1',
                nombre: 'Juan',
                apellido: 'Pérez',
                email: 'juan@example.com',
              },
            },
          },
        ],
        asistencias: [
          {
            id: 'asist-1',
            estado: 'Presente',
            clase: { rutaCurricular: { nombre: 'Álgebra' } },
          },
          {
            id: 'asist-2',
            estado: 'Ausente',
            clase: { rutaCurricular: { nombre: 'Geometría' } },
          },
        ],
      };

      jest
        .spyOn(prisma.estudiante, 'findFirst')
        .mockResolvedValue(mockDetalleCompleto as any);

      // Act
      const result = await service.getDetalleCompleto('est-1', 'tutor-1');

      // Assert
      expect(result).toHaveProperty('estadisticas');
      expect(result.estadisticas.total_clases).toBe(2);
      expect(result.estadisticas.clases_presente).toBe(1);
      expect(result.estadisticas.tasa_asistencia).toBe(50); // 1/2 * 100
      expect(result.estadisticas.logros).toBe(1);
    });

    it('should throw NotFoundException if student does not exist or ownership invalid', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findFirst').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getDetalleCompleto('est-1', 'wrong-tutor'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.getDetalleCompleto('est-1', 'wrong-tutor'),
      ).rejects.toThrow('Estudiante no encontrado o no pertenece a este tutor');
    });

    it('should calculate 0% attendance when no classes', async () => {
      // Arrange
      const mockWithoutAsistencias = {
        ...mockEstudiante,
        asistencias: [],
        logrosDesbloqueados: [],
        inscripciones_clase: [],
      };

      jest
        .spyOn(prisma.estudiante, 'findFirst')
        .mockResolvedValue(mockWithoutAsistencias as any);

      // Act
      const result = await service.getDetalleCompleto('est-1', 'tutor-1');

      // Assert
      expect(result.estadisticas.total_clases).toBe(0);
      expect(result.estadisticas.tasa_asistencia).toBe(0);
    });
  });
});
