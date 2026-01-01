import { Test, TestingModule } from '@nestjs/testing';
import { ComisionesService } from '../comisiones.service';
import { PrismaService } from '../../core/database/prisma.service';
import { AdminEstudiantesService } from '../services/admin-estudiantes.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EstadoInscripcionComision, TipoProducto } from '@prisma/client';

describe('ComisionesService', () => {
  let service: ComisionesService;
  let prisma: jest.Mocked<PrismaService>;
  let estudiantesService: jest.Mocked<AdminEstudiantesService>;

  // ============================================================================
  // MOCKS DE DATOS
  // ============================================================================

  const mockProductoCurso = {
    id: 'producto-colonia-2026',
    nombre: 'Colonia de Verano 2026',
    descripcion: 'Colonia de verano para niños',
    tipo: TipoProducto.Curso,
    precio: 150000,
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProductoDigital = {
    id: 'producto-libro-digital',
    nombre: 'Libro Digital STEAM',
    descripcion: 'Libro de ejercicios',
    tipo: TipoProducto.Digital,
    precio: 5000,
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCasa = {
    id: 'casa-quantum-id',
    nombre: 'QUANTUM',
    emoji: '⚛️',
    color_primario: '#10B981',
    color_secundario: '#34D399',
    icono_url: null,
    xp_total: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDocente = {
    id: 'docente-maria-id',
    nombre: 'María',
    apellido: 'García',
    email: 'maria@mateatletas.com',
    titulo: 'Profesora de Matemáticas',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockComision = {
    id: 'comision-quantum-manana',
    nombre: 'QUANTUM Mañana',
    descripcion: 'Turno mañana para casa QUANTUM',
    producto_id: 'producto-colonia-2026',
    casa_id: 'casa-quantum-id',
    docente_id: 'docente-maria-id',
    cupo_maximo: 15,
    horario: 'Lun-Vie 9:00-12:00',
    fecha_inicio: new Date('2026-01-06'),
    fecha_fin: new Date('2026-01-31'),
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEstudiante = {
    id: 'estudiante-juan-id',
    nombre: 'Juan',
    apellido: 'Pérez',
    username: 'juan.perez.abc1',
    edad: 10,
    nivel_escolar: 'Primaria',
    equipo_id: 'casa-quantum-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockInscripcion = {
    id: 'inscripcion-1',
    comision_id: 'comision-quantum-manana',
    estudiante_id: 'estudiante-juan-id',
    estado: EstadoInscripcionComision.Confirmada,
    fecha_inscripcion: new Date(),
    notas: null,
  };

  // ============================================================================
  // SETUP
  // ============================================================================

  beforeEach(async () => {
    const mockPrisma = {
      producto: {
        findUnique: jest.fn(),
      },
      casa: {
        findUnique: jest.fn(),
      },
      docente: {
        findUnique: jest.fn(),
      },
      comision: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      inscripcionComision: {
        create: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      estudiante: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      // $transaction puede recibir un array de queries o un callback
      $transaction: jest.fn((arg) => {
        if (Array.isArray(arg)) {
          // Si es array, ejecutamos todas las promesas
          return Promise.all(arg);
        }
        // Si es callback, lo ejecutamos
        return arg(mockPrisma);
      }),
    };

    const mockEstudiantesService = {
      crearEstudianteConCredenciales: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComisionesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AdminEstudiantesService, useValue: mockEstudiantesService },
      ],
    }).compile();

    service = module.get<ComisionesService>(ComisionesService);
    prisma = module.get(PrismaService);
    estudiantesService = module.get(AdminEstudiantesService);
  });

  // ============================================================================
  // TESTS: CREATE
  // ============================================================================

  describe('create', () => {
    it('should create a comision for a Curso product', async () => {
      prisma.producto.findUnique.mockResolvedValue(mockProductoCurso);
      prisma.casa.findUnique.mockResolvedValue(mockCasa);
      prisma.docente.findUnique.mockResolvedValue(mockDocente);
      prisma.comision.create.mockResolvedValue({
        ...mockComision,
        producto: mockProductoCurso,
        casa: mockCasa,
        docente: mockDocente,
        _count: { inscripciones: 0 },
      });

      const result = await service.create({
        nombre: 'QUANTUM Mañana',
        producto_id: 'producto-colonia-2026',
        casa_id: 'casa-quantum-id',
        docente_id: 'docente-maria-id',
        cupo_maximo: 15,
        horario: 'Lun-Vie 9:00-12:00',
      });

      expect(result.success).toBe(true);
      expect(result.data.nombre).toBe('QUANTUM Mañana');
      expect(prisma.comision.create).toHaveBeenCalled();
    });

    it('should throw error when product is not found', async () => {
      prisma.producto.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          nombre: 'QUANTUM Mañana',
          producto_id: 'producto-inexistente',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when product is not of type Curso', async () => {
      prisma.producto.findUnique.mockResolvedValue(mockProductoDigital);

      await expect(
        service.create({
          nombre: 'Test',
          producto_id: 'producto-libro-digital',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error when casa is not found', async () => {
      prisma.producto.findUnique.mockResolvedValue(mockProductoCurso);
      prisma.casa.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          nombre: 'QUANTUM Mañana',
          producto_id: 'producto-colonia-2026',
          casa_id: 'casa-inexistente',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when docente is not found', async () => {
      prisma.producto.findUnique.mockResolvedValue(mockProductoCurso);
      prisma.docente.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          nombre: 'QUANTUM Mañana',
          producto_id: 'producto-colonia-2026',
          docente_id: 'docente-inexistente',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============================================================================
  // TESTS: FIND ALL
  // ============================================================================

  describe('findAll', () => {
    it('should return all comisiones with relations', async () => {
      const comisionesWithRelations = [
        {
          ...mockComision,
          producto: mockProductoCurso,
          casa: mockCasa,
          docente: mockDocente,
          _count: { inscripciones: 5 },
        },
      ];
      prisma.comision.findMany.mockResolvedValue(comisionesWithRelations);

      const result = await service.findAll({});

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].total_inscriptos).toBe(5);
      expect(result.data[0].cupos_disponibles).toBe(10); // 15 - 5
    });

    it('should filter by producto_id', async () => {
      prisma.comision.findMany.mockResolvedValue([]);

      await service.findAll({ producto_id: 'producto-colonia-2026' });

      expect(prisma.comision.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            producto_id: 'producto-colonia-2026',
          }),
        }),
      );
    });

    it('should filter by casa_id', async () => {
      prisma.comision.findMany.mockResolvedValue([]);

      await service.findAll({ casa_id: 'casa-quantum-id' });

      expect(prisma.comision.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            casa_id: 'casa-quantum-id',
          }),
        }),
      );
    });

    it('should filter by docente_id', async () => {
      prisma.comision.findMany.mockResolvedValue([]);

      await service.findAll({ docente_id: 'docente-maria-id' });

      expect(prisma.comision.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            docente_id: 'docente-maria-id',
          }),
        }),
      );
    });

    it('should filter by activo status', async () => {
      prisma.comision.findMany.mockResolvedValue([]);

      await service.findAll({ activo: true });

      expect(prisma.comision.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            activo: true,
          }),
        }),
      );
    });
  });

  // ============================================================================
  // TESTS: FIND ONE
  // ============================================================================

  describe('findOne', () => {
    it('should return comision with inscripciones', async () => {
      prisma.comision.findUnique.mockResolvedValue({
        ...mockComision,
        producto: mockProductoCurso,
        casa: mockCasa,
        docente: mockDocente,
        inscripciones: [
          {
            ...mockInscripcion,
            estudiante: mockEstudiante,
          },
        ],
        _count: { inscripciones: 1 },
      });

      const result = await service.findOne('comision-quantum-manana');

      expect(result.success).toBe(true);
      expect(result.data.inscripciones).toHaveLength(1);
      expect(result.data.total_inscriptos).toBe(1);
    });

    it('should throw error when comision is not found', async () => {
      prisma.comision.findUnique.mockResolvedValue(null);

      await expect(service.findOne('comision-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ============================================================================
  // TESTS: UPDATE
  // ============================================================================

  describe('update', () => {
    it('should update comision data', async () => {
      prisma.comision.findUnique.mockResolvedValue(mockComision);
      prisma.comision.update.mockResolvedValue({
        ...mockComision,
        nombre: 'QUANTUM Tarde',
        horario: 'Lun-Vie 14:00-17:00',
        producto: mockProductoCurso,
        casa: mockCasa,
        docente: mockDocente,
        _count: { inscripciones: 0 },
      });

      const result = await service.update('comision-quantum-manana', {
        nombre: 'QUANTUM Tarde',
        horario: 'Lun-Vie 14:00-17:00',
      });

      expect(result.success).toBe(true);
      expect(result.data.nombre).toBe('QUANTUM Tarde');
    });

    it('should update docente_id to null (desasignar docente)', async () => {
      prisma.comision.findUnique.mockResolvedValue(mockComision);
      prisma.comision.update.mockResolvedValue({
        ...mockComision,
        docente_id: null,
        docente: null,
        producto: mockProductoCurso,
        casa: mockCasa,
        _count: { inscripciones: 0 },
      });

      const result = await service.update('comision-quantum-manana', {
        docente_id: null,
      });

      expect(result.success).toBe(true);
      expect(result.data.docente).toBeNull();
      // El servicio usa { docente: { disconnect: true } } para desasignar
      expect(prisma.comision.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            docente: { disconnect: true },
          }),
        }),
      );
    });

    it('should update casa_id to null (desasignar casa)', async () => {
      prisma.comision.findUnique.mockResolvedValue(mockComision);
      prisma.comision.update.mockResolvedValue({
        ...mockComision,
        casa_id: null,
        casa: null,
        producto: mockProductoCurso,
        docente: mockDocente,
        _count: { inscripciones: 0 },
      });

      const result = await service.update('comision-quantum-manana', {
        casa_id: null,
      });

      expect(result.success).toBe(true);
      expect(result.data.casa).toBeNull();
    });

    it('should throw error when comision is not found', async () => {
      prisma.comision.findUnique.mockResolvedValue(null);

      await expect(
        service.update('comision-inexistente', { nombre: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate new casa exists if provided', async () => {
      prisma.comision.findUnique.mockResolvedValue(mockComision);
      prisma.casa.findUnique.mockResolvedValue(null);

      await expect(
        service.update('comision-quantum-manana', {
          casa_id: 'casa-inexistente',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate new docente exists if provided', async () => {
      prisma.comision.findUnique.mockResolvedValue(mockComision);
      prisma.docente.findUnique.mockResolvedValue(null);

      await expect(
        service.update('comision-quantum-manana', {
          docente_id: 'docente-inexistente',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============================================================================
  // TESTS: REMOVE (SOFT DELETE)
  // ============================================================================

  describe('remove', () => {
    it('should soft delete comision by setting activo to false', async () => {
      // El servicio de remove hace findUnique con include { _count: { select: { inscripciones: true } } }
      prisma.comision.findUnique.mockResolvedValue({
        ...mockComision,
        _count: { inscripciones: 3 },
      });
      prisma.comision.update.mockResolvedValue({
        ...mockComision,
        activo: false,
      });

      const result = await service.remove('comision-quantum-manana');

      expect(result.success).toBe(true);
      expect(result.message).toContain('3 inscripciones afectadas');
      expect(prisma.comision.update).toHaveBeenCalledWith({
        where: { id: 'comision-quantum-manana' },
        data: { activo: false },
      });
    });

    it('should throw error when comision is not found', async () => {
      prisma.comision.findUnique.mockResolvedValue(null);

      await expect(service.remove('comision-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ============================================================================
  // TESTS: INSCRIBIR ESTUDIANTES
  // ============================================================================

  describe('inscribirEstudiantes', () => {
    it('should inscribe multiple students to comision', async () => {
      prisma.comision.findUnique.mockResolvedValue({
        ...mockComision,
        _count: { inscripciones: 5 },
      });
      prisma.estudiante.findMany.mockResolvedValue([
        mockEstudiante,
        { ...mockEstudiante, id: 'estudiante-maria-id', nombre: 'María' },
      ]);
      prisma.inscripcionComision.findMany.mockResolvedValue([]);

      // El servicio usa $transaction con array de creates
      // Mockear create para retornar promesas que serán resueltas por $transaction
      const mockInscripcion1 = {
        ...mockInscripcion,
        estudiante: mockEstudiante,
      };
      const mockInscripcion2 = {
        ...mockInscripcion,
        id: 'inscripcion-2',
        estudiante_id: 'estudiante-maria-id',
        estudiante: {
          ...mockEstudiante,
          id: 'estudiante-maria-id',
          nombre: 'María',
        },
      };

      prisma.inscripcionComision.create
        .mockResolvedValueOnce(mockInscripcion1)
        .mockResolvedValueOnce(mockInscripcion2);

      const result = await service.inscribirEstudiantes(
        'comision-quantum-manana',
        {
          estudiantes_ids: ['estudiante-juan-id', 'estudiante-maria-id'],
        },
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should throw error when comision is not found', async () => {
      prisma.comision.findUnique.mockResolvedValue(null);

      await expect(
        service.inscribirEstudiantes('comision-inexistente', {
          estudiantes_ids: ['estudiante-juan-id'],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when comision is inactive', async () => {
      prisma.comision.findUnique.mockResolvedValue({
        ...mockComision,
        activo: false,
        _count: { inscripciones: 0 },
      });

      await expect(
        service.inscribirEstudiantes('comision-quantum-manana', {
          estudiantes_ids: ['estudiante-juan-id'],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error when no cupos available', async () => {
      prisma.comision.findUnique.mockResolvedValue({
        ...mockComision,
        cupo_maximo: 15,
        _count: { inscripciones: 15 },
      });

      await expect(
        service.inscribirEstudiantes('comision-quantum-manana', {
          estudiantes_ids: ['estudiante-juan-id'],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error when some students not found', async () => {
      prisma.comision.findUnique.mockResolvedValue({
        ...mockComision,
        _count: { inscripciones: 0 },
      });
      prisma.estudiante.findMany.mockResolvedValue([mockEstudiante]);
      prisma.inscripcionComision.findMany.mockResolvedValue([]);

      await expect(
        service.inscribirEstudiantes('comision-quantum-manana', {
          estudiantes_ids: ['estudiante-juan-id', 'estudiante-inexistente'],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when students already inscribed', async () => {
      // El servicio lanza BadRequestException si hay estudiantes ya inscritos
      prisma.comision.findUnique.mockResolvedValue({
        ...mockComision,
        _count: { inscripciones: 1 },
      });
      prisma.estudiante.findMany.mockResolvedValue([mockEstudiante]);
      prisma.inscripcionComision.findMany.mockResolvedValue([mockInscripcion]);

      await expect(
        service.inscribirEstudiantes('comision-quantum-manana', {
          estudiantes_ids: ['estudiante-juan-id'],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================================================
  // TESTS: ACTUALIZAR INSCRIPCION
  // ============================================================================

  describe('actualizarInscripcion', () => {
    it('should update inscription status', async () => {
      // Servicio usa findUnique con composite key
      prisma.inscripcionComision.findUnique.mockResolvedValue(mockInscripcion);
      prisma.inscripcionComision.update.mockResolvedValue({
        ...mockInscripcion,
        estado: EstadoInscripcionComision.Cancelada,
        notas: 'Cancelado por solicitud del tutor',
        estudiante: mockEstudiante,
        comision: mockComision,
      });

      const result = await service.actualizarInscripcion(
        'comision-quantum-manana',
        'estudiante-juan-id',
        {
          estado: EstadoInscripcionComision.Cancelada,
          notas: 'Cancelado por solicitud del tutor',
        },
      );

      expect(result.success).toBe(true);
      expect(result.data.estado).toBe(EstadoInscripcionComision.Cancelada);
    });

    it('should throw error when inscription not found', async () => {
      prisma.inscripcionComision.findUnique.mockResolvedValue(null);

      await expect(
        service.actualizarInscripcion(
          'comision-quantum-manana',
          'estudiante-inexistente',
          { estado: EstadoInscripcionComision.Confirmada },
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============================================================================
  // TESTS: REMOVER ESTUDIANTE
  // ============================================================================

  describe('removerEstudiante', () => {
    it('should remove student from comision', async () => {
      // Servicio usa findUnique con composite key
      prisma.inscripcionComision.findUnique.mockResolvedValue({
        ...mockInscripcion,
        estudiante: mockEstudiante,
      });
      prisma.inscripcionComision.delete.mockResolvedValue(mockInscripcion);

      const result = await service.removerEstudiante(
        'comision-quantum-manana',
        'estudiante-juan-id',
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Juan');
    });

    it('should throw error when inscription not found', async () => {
      prisma.inscripcionComision.findUnique.mockResolvedValue(null);

      await expect(
        service.removerEstudiante(
          'comision-quantum-manana',
          'estudiante-inexistente',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============================================================================
  // TESTS: CREAR ESTUDIANTE E INSCRIBIR
  // ============================================================================

  describe('crearEstudianteEInscribir', () => {
    const createStudentDto = {
      nombreEstudiante: 'Juan',
      apellidoEstudiante: 'Pérez',
      edadEstudiante: 10,
      nivelEscolar: 'Primaria' as const,
      sectorId: 'sector-matematica-id',
      casaId: 'casa-quantum-id',
      nombreTutor: 'Carlos',
      apellidoTutor: 'Pérez',
      emailTutor: 'carlos@test.com',
    };

    const mockCredencialesResponse = {
      estudiante: mockEstudiante,
      tutor: {
        id: 'tutor-id-123',
        nombre: 'Carlos',
        apellido: 'Pérez',
      },
      tutorCreado: true,
      credencialesEstudiante: {
        username: 'juan.perez.abc1',
        pin: '1234',
      },
      credencialesTutor: {
        username: 'carlos.perez.def2',
        passwordTemporal: 'Tutor-P@ss123',
      },
    };

    it('should create student and inscribe to comision', async () => {
      prisma.comision.findUnique.mockResolvedValue({
        ...mockComision,
        _count: { inscripciones: 5 },
      });
      estudiantesService.crearEstudianteConCredenciales.mockResolvedValue(
        mockCredencialesResponse,
      );
      prisma.inscripcionComision.create.mockResolvedValue({
        ...mockInscripcion,
        comision: { id: mockComision.id, nombre: mockComision.nombre },
      });

      const result = await service.crearEstudianteEInscribir(
        'comision-quantum-manana',
        createStudentDto,
      );

      expect(result.estudiante).toBeDefined();
      expect(result.credencialesEstudiante).toBeDefined();
      expect(result.inscripcion).toBeDefined();
      expect(result.inscripcion.estado).toBe(
        EstadoInscripcionComision.Confirmada,
      );
    });

    it('should throw error when comision is not found', async () => {
      prisma.comision.findUnique.mockResolvedValue(null);

      await expect(
        service.crearEstudianteEInscribir(
          'comision-inexistente',
          createStudentDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when comision is inactive', async () => {
      prisma.comision.findUnique.mockResolvedValue({
        ...mockComision,
        activo: false,
        _count: { inscripciones: 0 },
      });

      await expect(
        service.crearEstudianteEInscribir(
          'comision-quantum-manana',
          createStudentDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error when no cupos available', async () => {
      prisma.comision.findUnique.mockResolvedValue({
        ...mockComision,
        cupo_maximo: 15,
        _count: { inscripciones: 15 },
      });

      await expect(
        service.crearEstudianteEInscribir(
          'comision-quantum-manana',
          createStudentDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow inscription when cupo_maximo is null (unlimited)', async () => {
      prisma.comision.findUnique.mockResolvedValue({
        ...mockComision,
        cupo_maximo: null,
        _count: { inscripciones: 100 },
      });
      estudiantesService.crearEstudianteConCredenciales.mockResolvedValue(
        mockCredencialesResponse,
      );
      prisma.inscripcionComision.create.mockResolvedValue({
        ...mockInscripcion,
        comision: { id: mockComision.id, nombre: mockComision.nombre },
      });

      const result = await service.crearEstudianteEInscribir(
        'comision-quantum-manana',
        createStudentDto,
      );

      expect(result.inscripcion).toBeDefined();
    });
  });

  // ============================================================================
  // TESTS: EDGE CASES
  // ============================================================================

  describe('edge cases', () => {
    it('should handle comision with null cupo_maximo (unlimited)', async () => {
      const comisionWithoutCupo = {
        ...mockComision,
        cupo_maximo: null,
        _count: { inscripciones: 100 },
      };
      prisma.comision.findMany.mockResolvedValue([
        {
          ...comisionWithoutCupo,
          producto: mockProductoCurso,
          casa: mockCasa,
          docente: mockDocente,
        },
      ]);

      const result = await service.findAll({});

      expect(result.data[0].cupos_disponibles).toBeNull();
    });

    it('should handle comision without docente', async () => {
      const comisionWithoutDocente = {
        ...mockComision,
        docente_id: null,
        docente: null,
        _count: { inscripciones: 0 },
      };
      prisma.comision.findUnique.mockResolvedValue({
        ...comisionWithoutDocente,
        producto: mockProductoCurso,
        casa: mockCasa,
        inscripciones: [],
      });

      const result = await service.findOne('comision-quantum-manana');

      expect(result.data.docente).toBeNull();
    });

    it('should handle comision without casa', async () => {
      const comisionWithoutCasa = {
        ...mockComision,
        casa_id: null,
        casa: null,
        _count: { inscripciones: 0 },
      };
      prisma.comision.findUnique.mockResolvedValue({
        ...comisionWithoutCasa,
        producto: mockProductoCurso,
        docente: mockDocente,
        inscripciones: [],
      });

      const result = await service.findOne('comision-quantum-manana');

      expect(result.data.casa).toBeNull();
    });
  });
});
