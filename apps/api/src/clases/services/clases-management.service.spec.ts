import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ClasesManagementService } from './clases-management.service';
import { PrismaService } from '../../core/database/prisma.service';

describe('ClasesManagementService', () => {
  let service: ClasesManagementService;
  let prisma: PrismaService;

  const mockRuta = {
    id: 'ruta-1',
    nombre: 'Álgebra',
    color: '#FF5733',
  };

  const mockDocente = {
    id: 'doc-1',
    nombre: 'María',
    apellido: 'González',
    email: 'maria@example.com',
  };

  const mockProducto = {
    id: 'prod-1',
    nombre: 'Curso de Álgebra',
    tipo: 'Curso',
  };

  const mockClase = {
    id: 'clase-1',
    nombre: 'Clase de Álgebra',
    ruta_curricular_id: 'ruta-1',
    docente_id: 'doc-1',
    fecha_hora_inicio: new Date('2025-12-01T10:00:00Z'),
    duracion_minutos: 60,
    cupos_maximo: 20,
    cupos_ocupados: 5,
    estado: 'Programada',
    producto_id: null,
    rutaCurricular: mockRuta,
    docente: mockDocente,
    producto: null,
    inscripciones: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClasesManagementService,
        {
          provide: PrismaService,
          useValue: {
            rutaCurricular: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
            },
            docente: {
              findUnique: jest.fn(),
            },
            producto: {
              findUnique: jest.fn(),
            },
            tutor: {
              findUnique: jest.fn(),
            },
            clase: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            reset: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClasesManagementService>(ClasesManagementService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('programarClase', () => {
    const validDto = {
      nombre: 'Clase de Álgebra',
      rutaCurricularId: 'ruta-1',
      docenteId: 'doc-1',
      fechaHoraInicio: new Date('2025-12-01T10:00:00Z'),
      duracionMinutos: 60,
      cuposMaximo: 20,
      productoId: undefined,
    };

    it('should create a new class successfully', async () => {
      // Arrange
      jest.spyOn(prisma.rutaCurricular, 'findUnique').mockResolvedValue(mockRuta as any);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(mockDocente as any);
      jest.spyOn(prisma.clase, 'create').mockResolvedValue(mockClase as any);

      // Act
      const result = await service.programarClase(validDto);

      // Assert
      expect(result).toEqual(mockClase);
      expect(prisma.clase.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ruta_curricular_id: 'ruta-1',
          docente_id: 'doc-1',
          cupos_ocupados: 0,
          estado: 'Programada',
        }),
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if ruta curricular does not exist', async () => {
      // Arrange
      jest.spyOn(prisma.rutaCurricular, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.programarClase(validDto)).rejects.toThrow(NotFoundException);
      await expect(service.programarClase(validDto)).rejects.toThrow(
        'Ruta curricular con ID ruta-1 no encontrada',
      );
    });

    it('should throw NotFoundException if docente does not exist', async () => {
      // Arrange
      jest.spyOn(prisma.rutaCurricular, 'findUnique').mockResolvedValue(mockRuta as any);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.programarClase(validDto)).rejects.toThrow(NotFoundException);
      await expect(service.programarClase(validDto)).rejects.toThrow(
        'Docente con ID doc-1 no encontrado',
      );
    });

    it('should validate producto is type Curso when productoId provided', async () => {
      // Arrange
      const dtoWithProducto = { ...validDto, productoId: 'prod-1' };
      jest.spyOn(prisma.rutaCurricular, 'findUnique').mockResolvedValue(mockRuta as any);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(mockDocente as any);
      jest.spyOn(prisma.producto, 'findUnique').mockResolvedValue({
        ...mockProducto,
        tipo: 'Suscripcion', // Wrong type
      } as any);

      // Act & Assert
      await expect(service.programarClase(dtoWithProducto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.programarClase(dtoWithProducto)).rejects.toThrow(
        'El producto asociado debe ser de tipo Curso',
      );
    });

    it('should throw BadRequestException if fecha is in the past', async () => {
      // Arrange
      const dtoWithPastDate = {
        ...validDto,
        fechaHoraInicio: new Date('2020-01-01T10:00:00Z'), // Fecha pasada
      };
      jest.spyOn(prisma.rutaCurricular, 'findUnique').mockResolvedValue(mockRuta as any);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(mockDocente as any);

      // Act & Assert
      await expect(service.programarClase(dtoWithPastDate)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.programarClase(dtoWithPastDate)).rejects.toThrow(
        'La fecha de inicio debe ser en el futuro',
      );
    });
  });

  describe('cancelarClase', () => {
    const mockClaseConInscripciones = {
      ...mockClase,
      inscripciones: [
        { id: 'insc-1', estudiante_id: 'est-1' },
        { id: 'insc-2', estudiante_id: 'est-2' },
      ],
    };

    it('should cancel class successfully as admin', async () => {
      // Arrange
      jest
        .spyOn(prisma.clase, 'findUnique')
        .mockResolvedValue(mockClaseConInscripciones as any);
      jest.spyOn(prisma.clase, 'update').mockResolvedValue({
        ...mockClase,
        estado: 'Cancelada',
        cupos_ocupados: 0,
      } as any);

      // Act
      const result = await service.cancelarClase('clase-1', 'admin-1', 'admin');

      // Assert
      expect(result.estado).toBe('Cancelada');
      expect(prisma.clase.update).toHaveBeenCalledWith({
        where: { id: 'clase-1' },
        data: {
          estado: 'Cancelada',
          cupos_ocupados: 0,
        },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if class does not exist', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.cancelarClase('non-existent', 'admin-1', 'admin')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if class already cancelled', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue({
        ...mockClase,
        estado: 'Cancelada',
        inscripciones: [],
      } as any);

      // Act & Assert
      await expect(service.cancelarClase('clase-1', 'admin-1', 'admin')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.cancelarClase('clase-1', 'admin-1', 'admin')).rejects.toThrow(
        'La clase ya está cancelada',
      );
    });
  });

  describe('listarTodasLasClases', () => {
    it('should return paginated list of classes', async () => {
      // Arrange
      const mockClases = [mockClase, { ...mockClase, id: 'clase-2' }];
      jest.spyOn(prisma.clase, 'findMany').mockResolvedValue(mockClases as any);
      jest.spyOn(prisma.clase, 'count').mockResolvedValue(2);

      // Act
      const result = await service.listarTodasLasClases(undefined, 1, 10);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter by fecha range', async () => {
      // Arrange
      const filtros = {
        fechaDesde: new Date('2025-12-01'),
        fechaHasta: new Date('2025-12-31'),
      };
      const findManySpy = jest.spyOn(prisma.clase, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.clase, 'count').mockResolvedValue(0);

      // Act
      await service.listarTodasLasClases(filtros, 1, 10);

      // Assert
      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            fecha_hora_inicio: {
              gte: filtros.fechaDesde,
              lte: filtros.fechaHasta,
            },
          }),
        }),
      );
    });

    it('should filter by estado', async () => {
      // Arrange
      const filtros = { estado: 'Programada' as const };
      const findManySpy = jest.spyOn(prisma.clase, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.clase, 'count').mockResolvedValue(0);

      // Act
      await service.listarTodasLasClases(filtros, 1, 10);

      // Assert
      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            estado: 'Programada',
          }),
        }),
      );
    });

    it('should apply pagination correctly', async () => {
      // Arrange
      const findManySpy = jest.spyOn(prisma.clase, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.clase, 'count').mockResolvedValue(0);

      // Act
      await service.listarTodasLasClases(undefined, 2, 20);

      // Assert
      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (page 2 - 1) * limit 20
          take: 20,
        }),
      );
    });
  });

  describe('obtenerClase', () => {
    it('should return class with full details', async () => {
      // Arrange
      const mockClaseCompleta = {
        ...mockClase,
        inscripciones: [{ id: 'insc-1', estudiante: { nombre: 'Juan' } }],
        asistencias: [{ id: 'asist-1', estado: 'Presente' }],
      };
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClaseCompleta as any);

      // Act
      const result = await service.obtenerClase('clase-1');

      // Assert
      expect(result).toEqual(mockClaseCompleta);
      expect(result.inscripciones).toBeDefined();
      expect(result.asistencias).toBeDefined();
    });

    it('should throw NotFoundException if class does not exist', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.obtenerClase('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.obtenerClase('non-existent')).rejects.toThrow(
        'Clase con ID non-existent no encontrada',
      );
    });
  });

  describe('listarRutasCurriculares', () => {
    it('should return list of rutas curriculares ordered by nombre', async () => {
      // Arrange
      const mockRutas = [
        { id: 'r1', nombre: 'Álgebra', color: '#FF0000' },
        { id: 'r2', nombre: 'Geometría', color: '#00FF00' },
      ];
      const findManySpy = jest
        .spyOn(prisma.rutaCurricular, 'findMany')
        .mockResolvedValue(mockRutas as any);

      // Act
      const result = await service.listarRutasCurriculares();

      // Assert
      expect(result).toEqual(mockRutas);
      expect(findManySpy).toHaveBeenCalledWith({
        orderBy: { nombre: 'asc' },
      });
    });

    it('should return empty array when no rutas exist', async () => {
      // Arrange
      jest.spyOn(prisma.rutaCurricular, 'findMany').mockResolvedValue([]);

      // Act
      const result = await service.listarRutasCurriculares();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('listarClasesParaTutor', () => {
    const mockTutor = {
      id: 'tutor-1',
      email: 'tutor@test.com',
      estudiantes: [
        {
          id: 'est-1',
          inscripciones_curso: [
            { producto_id: 'curso-1' },
            { producto_id: 'curso-2' },
          ],
        },
      ],
    };

    const mockClasesDisponibles = [
      {
        id: 'clase-1',
        estado: 'Programada',
        fecha_hora_inicio: new Date('2025-12-01T10:00:00Z'),
        producto_id: null,
        inscripciones: [],
      },
      {
        id: 'clase-2',
        estado: 'Programada',
        fecha_hora_inicio: new Date('2025-12-02T10:00:00Z'),
        producto_id: 'curso-1',
        inscripciones: [{ id: 'insc-1', estudiante_id: 'est-1' }],
      },
    ];

    it('should return available classes for tutor', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(mockTutor as any);
      jest.spyOn(prisma.clase, 'findMany').mockResolvedValue(mockClasesDisponibles as any);

      // Act
      const result = await service.listarClasesParaTutor('tutor-1');

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });

    it('should throw NotFoundException if tutor not found', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.listarClasesParaTutor('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.listarClasesParaTutor('non-existent')).rejects.toThrow(
        'Tutor no encontrado',
      );
    });

    it('should filter classes based on active course enrollments', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(mockTutor as any);
      const findManySpy = jest.spyOn(prisma.clase, 'findMany').mockResolvedValue([]);

      // Act
      await service.listarClasesParaTutor('tutor-1');

      // Assert
      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { producto_id: null },
              { producto_id: { in: ['curso-1', 'curso-2'] } },
            ],
          }),
        }),
      );
    });

    it('should only return programmed and future classes', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(mockTutor as any);
      const findManySpy = jest.spyOn(prisma.clase, 'findMany').mockResolvedValue([]);

      // Act
      await service.listarClasesParaTutor('tutor-1');

      // Assert
      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            estado: 'Programada',
            fecha_hora_inicio: { gte: expect.any(Date) },
          }),
        }),
      );
    });
  });

  describe('obtenerCalendarioTutor', () => {
    const mockTutor = {
      id: 'tutor-1',
      estudiantes: [{ id: 'est-1' }, { id: 'est-2' }],
    };

    const mockClases = [
      {
        id: 'clase-1',
        fecha_hora_inicio: new Date('2025-12-15T10:00:00Z'),
        inscripciones: [{ estudiante_id: 'est-1' }],
      },
      {
        id: 'clase-2',
        fecha_hora_inicio: new Date('2025-12-20T14:00:00Z'),
        inscripciones: [{ estudiante_id: 'est-2' }],
      },
    ];

    it('should return calendar for specified month and year', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(mockTutor as any);
      jest.spyOn(prisma.clase, 'findMany').mockResolvedValue(mockClases as any);

      // Act
      const result = await service.obtenerCalendarioTutor('tutor-1', 12, 2025);

      // Assert
      expect(result).toBeDefined();
      expect(result.mes).toBe(12);
      expect(result.anio).toBe(2025);
      expect(result.clases).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should use current month/year if not provided', async () => {
      // Arrange
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(mockTutor as any);
      jest.spyOn(prisma.clase, 'findMany').mockResolvedValue([]);

      // Act
      const result = await service.obtenerCalendarioTutor('tutor-1');

      // Assert
      expect(result.mes).toBe(currentMonth);
      expect(result.anio).toBe(currentYear);
    });

    it('should throw BadRequestException for invalid month', async () => {
      // Act & Assert
      await expect(service.obtenerCalendarioTutor('tutor-1', 13, 2025)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.obtenerCalendarioTutor('tutor-1', 0, 2025)).rejects.toThrow(
        'El mes debe estar entre 1 y 12',
      );
    });

    it('should throw NotFoundException if tutor not found', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.obtenerCalendarioTutor('non-existent', 12, 2025)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return empty array if tutor has no students', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue({
        ...mockTutor,
        estudiantes: [],
      } as any);

      // Act
      const result = await service.obtenerCalendarioTutor('tutor-1', 12, 2025);

      // Assert
      expect(result.clases).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should filter classes by date range correctly', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(mockTutor as any);
      const findManySpy = jest.spyOn(prisma.clase, 'findMany').mockResolvedValue([]);

      // Act
      await service.obtenerCalendarioTutor('tutor-1', 12, 2025);

      // Assert
      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            fecha_hora_inicio: {
              gte: expect.any(Date),
              lte: expect.any(Date),
            },
          }),
        }),
      );
    });
  });

  describe('listarClasesDeDocente', () => {
    const mockClases = [
      {
        id: 'clase-1',
        docente_id: 'doc-1',
        fecha_hora_inicio: new Date('2025-12-01T10:00:00Z'),
      },
      {
        id: 'clase-2',
        docente_id: 'doc-1',
        fecha_hora_inicio: new Date('2024-01-01T10:00:00Z'),
      },
    ];

    it('should return future classes by default', async () => {
      // Arrange
      const findManySpy = jest.spyOn(prisma.clase, 'findMany').mockResolvedValue([mockClases[0]] as any);

      // Act
      const result = await service.listarClasesDeDocente('doc-1');

      // Assert
      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            docente_id: 'doc-1',
            fecha_hora_inicio: { gte: expect.any(Date) },
          }),
        }),
      );
      expect(result).toBeDefined();
    });

    it('should include past classes when incluirPasadas is true', async () => {
      // Arrange
      const findManySpy = jest.spyOn(prisma.clase, 'findMany').mockResolvedValue(mockClases as any);

      // Act
      const result = await service.listarClasesDeDocente('doc-1', true);

      // Assert
      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            docente_id: 'doc-1',
          },
        }),
      );
      expect(result).toHaveLength(2);
    });
  });
});
