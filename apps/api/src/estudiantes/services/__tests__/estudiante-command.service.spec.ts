import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EstudianteCommandService } from '../estudiante-command.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { EstudianteBusinessValidator } from '../../validators/estudiante-business.validator';

describe('EstudianteCommandService', () => {
  let service: EstudianteCommandService;
  let prisma: jest.Mocked<PrismaService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let validator: jest.Mocked<EstudianteBusinessValidator>;

  beforeEach(async () => {
    const mockPrisma = {
      estudiante: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      tutor: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      clase: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      inscripcionClase: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const mockValidator = {
      validateTutorExists: jest.fn(),
      validateCasaExists: jest.fn(),
      validateEdad: jest.fn(),
      validateOwnership: jest.fn(),
      validateEstudianteExists: jest.fn(),
      validateClaseExists: jest.fn(),
      validateSectorExists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstudianteCommandService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: EstudianteBusinessValidator,
          useValue: mockValidator,
        },
      ],
    }).compile();

    service = module.get<EstudianteCommandService>(EstudianteCommandService);
    prisma = module.get(PrismaService);
    eventEmitter = module.get(EventEmitter2);
    validator = module.get(EstudianteBusinessValidator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear un estudiante y emitir evento', async () => {
      const createDto = {
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 10,
        nivelEscolar: 'Primaria',
        email: 'juan@test.com',
      };

      const mockEstudiante = {
        id: 'est-1',
        ...createDto,
        username: 'juan.perez',
        tutor_id: 'tutor-1',
        casa: null,
      };

      jest.spyOn(validator, 'validateTutorExists').mockResolvedValue(undefined);
      jest.spyOn(validator, 'validateEdad').mockReturnValue(undefined);
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.estudiante, 'create')
        .mockResolvedValue(mockEstudiante as any);

      const result = await service.create('tutor-1', createDto as any);

      expect(result).toEqual(mockEstudiante);
      expect(validator.validateTutorExists).toHaveBeenCalledWith('tutor-1');
      expect(validator.validateEdad).toHaveBeenCalledWith(10);
      expect(eventEmitter.emit).toHaveBeenCalledWith('estudiante.created', {
        estudianteId: 'est-1',
        tutorId: 'tutor-1',
      });
    });

    it('debe validar equipo si se proporciona', async () => {
      const createDto = {
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 10,
        nivelEscolar: 'Primaria',
        email: 'juan@test.com',
        casaId: 'casa-1',
      };

      jest.spyOn(validator, 'validateTutorExists').mockResolvedValue(undefined);
      jest.spyOn(validator, 'validateCasaExists').mockResolvedValue(undefined);
      jest.spyOn(validator, 'validateEdad').mockReturnValue(undefined);
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.estudiante, 'create')
        .mockResolvedValue({ id: 'est-1' } as any);

      await service.create('tutor-1', createDto as any);

      expect(validator.validateCasaExists).toHaveBeenCalledWith('casa-1');
    });

    it('debe generar username único si ya existe', async () => {
      const createDto = {
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 10,
        nivelEscolar: 'Primaria',
        email: 'juan@test.com',
      };

      jest.spyOn(validator, 'validateTutorExists').mockResolvedValue(undefined);
      jest.spyOn(validator, 'validateEdad').mockReturnValue(undefined);
      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValueOnce({ username: 'juan.perez' } as any) // Ya existe
        .mockResolvedValueOnce(null); // juan.perez1 no existe
      jest.spyOn(prisma.estudiante, 'create').mockResolvedValue({
        id: 'est-1',
        username: 'juan.perez1',
      } as any);

      const result = await service.create('tutor-1', createDto as any);

      expect(result.username).toBe('juan.perez1');
    });
  });

  describe('update', () => {
    it('debe actualizar un estudiante y emitir evento', async () => {
      const updateDto = {
        nombre: 'Juan Carlos',
        edad: 11,
      };

      const mockEstudiante = {
        id: 'est-1',
        nombre: 'Juan Carlos',
        edad: 11,
        tutor_id: 'tutor-1',
        casa: null,
      };

      jest.spyOn(validator, 'validateOwnership').mockResolvedValue(undefined);
      jest.spyOn(validator, 'validateEdad').mockReturnValue(undefined);
      jest
        .spyOn(prisma.estudiante, 'update')
        .mockResolvedValue(mockEstudiante as any);

      const result = await service.update('est-1', 'tutor-1', updateDto as any);

      expect(result).toEqual(mockEstudiante);
      expect(validator.validateOwnership).toHaveBeenCalledWith(
        'est-1',
        'tutor-1',
      );
      expect(validator.validateEdad).toHaveBeenCalledWith(11);
      expect(eventEmitter.emit).toHaveBeenCalledWith('estudiante.updated', {
        estudianteId: 'est-1',
        tutorId: 'tutor-1',
        changes: updateDto,
      });
    });

    it('debe validar equipo si se actualiza', async () => {
      const updateDto = {
        casaId: 'casa-nueva',
      };

      jest.spyOn(validator, 'validateOwnership').mockResolvedValue(undefined);
      jest.spyOn(validator, 'validateCasaExists').mockResolvedValue(undefined);
      jest
        .spyOn(prisma.estudiante, 'update')
        .mockResolvedValue({ id: 'est-1' } as any);

      await service.update('est-1', 'tutor-1', updateDto as any);

      expect(validator.validateCasaExists).toHaveBeenCalledWith('casa-nueva');
    });
  });

  describe('remove', () => {
    it('debe eliminar un estudiante y emitir evento', async () => {
      jest.spyOn(validator, 'validateOwnership').mockResolvedValue(undefined);
      jest
        .spyOn(prisma.estudiante, 'delete')
        .mockResolvedValue({ id: 'est-1' } as any);

      const result = await service.remove('est-1', 'tutor-1');

      expect(result).toEqual({ message: 'Estudiante eliminado correctamente' });
      expect(validator.validateOwnership).toHaveBeenCalledWith(
        'est-1',
        'tutor-1',
      );
      expect(prisma.estudiante.delete).toHaveBeenCalledWith({
        where: { id: 'est-1' },
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('estudiante.deleted', {
        estudianteId: 'est-1',
        tutorId: 'tutor-1',
      });
    });
  });

  describe('updateAnimacionIdle', () => {
    it('debe actualizar la animación idle', async () => {
      const mockEstudiante = {
        id: 'est-1',
        nombre: 'Juan',
        animacion_idle_url: 'https://example.com/anim.gif',
        casa: null,
        tutor: {
          id: 'tutor-1',
          nombre: 'Pedro',
          apellido: 'López',
          email: 'pedro@test.com',
        },
      };

      jest
        .spyOn(validator, 'validateEstudianteExists')
        .mockResolvedValue(undefined);
      jest
        .spyOn(prisma.estudiante, 'update')
        .mockResolvedValue(mockEstudiante as any);

      const result = await service.updateAnimacionIdle(
        'est-1',
        'https://example.com/anim.gif',
      );

      expect(result).toEqual(mockEstudiante);
      expect(validator.validateEstudianteExists).toHaveBeenCalledWith('est-1');
    });
  });

  describe('updateAvatarGradient', () => {
    it('debe actualizar el avatar gradient', async () => {
      const mockEstudiante = {
        id: 'est-1',
        nombre: 'Juan',
        apellido: 'Pérez',
        avatar_gradient: 5,
      };

      jest
        .spyOn(validator, 'validateEstudianteExists')
        .mockResolvedValue(undefined);
      jest
        .spyOn(prisma.estudiante, 'update')
        .mockResolvedValue(mockEstudiante as any);

      const result = await service.updateAvatarGradient('est-1', 5);

      expect(result).toEqual(mockEstudiante);
      expect(validator.validateEstudianteExists).toHaveBeenCalledWith('est-1');
    });
  });

  describe('crearEstudiantesConTutor', () => {
    it('debe crear estudiantes con tutor existente', async () => {
      const dto = {
        tutor: {
          nombre: 'Pedro',
          apellido: 'López',
          email: 'pedro@test.com',
          dni: '12345678',
          telefono: '123456789',
        },
        estudiantes: [
          {
            nombre: 'Juan',
            apellido: 'López',
            edad: 10,
            nivelEscolar: 'Primaria',
            email: 'juan.lopez@test.com',
          },
        ],
        sectorId: 'sector-1',
      };

      const mockTutor = { id: 'tutor-1', email: 'pedro@test.com' };
      const mockEstudiante = {
        id: 'est-1',
        nombre: 'Juan',
        apellido: 'López',
        tutor_id: 'tutor-1',
      };

      jest
        .spyOn(validator, 'validateSectorExists')
        .mockResolvedValue(undefined);
      jest.spyOn(prisma.tutor, 'findFirst').mockResolvedValue(mockTutor as any);
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null); // Para generarUsername
      (prisma.$transaction as jest.Mock).mockImplementation((callback: any) => {
        return callback(prisma);
      });
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.estudiante, 'create')
        .mockResolvedValue(mockEstudiante as any);

      const result = await service.crearEstudiantesConTutor(dto as any);

      expect(result.tutor).toEqual(mockTutor);
      expect(result.estudiantes).toHaveLength(1);
      expect(result.credenciales.estudiantes).toHaveLength(1);
    });

    it('debe crear tutor nuevo si no existe', async () => {
      const dto = {
        tutor: {
          nombre: 'Pedro',
          apellido: 'López',
          email: 'nuevo@test.com',
          dni: '12345678',
          telefono: '123456789',
        },
        estudiantes: [
          {
            nombre: 'Juan',
            apellido: 'López',
            edad: 10,
            nivelEscolar: 'Primaria',
            email: 'juan.lopez@test.com',
          },
        ],
        sectorId: 'sector-1',
      };

      const mockTutor = { id: 'tutor-nuevo', email: 'nuevo@test.com' };

      jest
        .spyOn(validator, 'validateSectorExists')
        .mockResolvedValue(undefined);
      jest.spyOn(prisma.tutor, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null); // Para generarUsername
      jest.spyOn(prisma.tutor, 'create').mockResolvedValue(mockTutor as any);
      (prisma.$transaction as jest.Mock).mockImplementation((callback: any) => {
        return callback(prisma);
      });
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.estudiante, 'create')
        .mockResolvedValue({ id: 'est-1' } as any);

      const result = await service.crearEstudiantesConTutor(dto as any);

      expect(prisma.tutor.create).toHaveBeenCalled();
      expect(result.credenciales.tutor).toBeDefined();
    });
  });

  describe('asignarClaseAEstudiante', () => {
    it('debe asignar estudiante a clase', async () => {
      const mockEstudiante = {
        id: 'est-1',
        sector_id: 'sector-1',
        tutor_id: 'tutor-1',
      };
      const mockClase = {
        id: 'clase-1',
        sector_id: 'sector-1',
        cupos_ocupados: 5,
        cupos_maximo: 10,
      };
      const mockInscripcion = {
        id: 'insc-1',
        estudiante_id: 'est-1',
        clase_id: 'clase-1',
        tutor_id: 'tutor-1',
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);
      jest.spyOn(validator, 'validateClaseExists').mockResolvedValue(undefined);
      jest
        .spyOn(prisma.clase, 'findUnique')
        .mockResolvedValue(mockClase as any);
      jest.spyOn(prisma.inscripcionClase, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prisma.inscripcionClase, 'create')
        .mockResolvedValue(mockInscripcion as any);
      jest.spyOn(prisma.clase, 'update').mockResolvedValue(mockClase as any);

      const result = await service.asignarClaseAEstudiante('est-1', 'clase-1');

      expect(result).toEqual(mockInscripcion);
      expect(prisma.clase.update).toHaveBeenCalledWith({
        where: { id: 'clase-1' },
        data: { cupos_ocupados: { increment: 1 } },
      });
    });

    it('debe lanzar error si estudiante no existe', async () => {
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);

      await expect(
        service.asignarClaseAEstudiante('est-inexistente', 'clase-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar error si clase no pertenece al sector del estudiante', async () => {
      const mockEstudiante = {
        id: 'est-1',
        sector_id: 'sector-1',
        tutor_id: 'tutor-1',
      };
      const mockClase = {
        id: 'clase-1',
        sector_id: 'sector-diferente',
        cupos_ocupados: 5,
        cupos_maximo: 10,
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);
      jest.spyOn(validator, 'validateClaseExists').mockResolvedValue(undefined);
      jest
        .spyOn(prisma.clase, 'findUnique')
        .mockResolvedValue(mockClase as any);

      await expect(
        service.asignarClaseAEstudiante('est-1', 'clase-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar error si no hay cupos disponibles', async () => {
      const mockEstudiante = {
        id: 'est-1',
        sector_id: 'sector-1',
        tutor_id: 'tutor-1',
      };
      const mockClase = {
        id: 'clase-1',
        sector_id: 'sector-1',
        cupos_ocupados: 10,
        cupos_maximo: 10,
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);
      jest.spyOn(validator, 'validateClaseExists').mockResolvedValue(undefined);
      jest
        .spyOn(prisma.clase, 'findUnique')
        .mockResolvedValue(mockClase as any);

      await expect(
        service.asignarClaseAEstudiante('est-1', 'clase-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('debe lanzar error si estudiante ya está inscrito', async () => {
      const mockEstudiante = {
        id: 'est-1',
        sector_id: 'sector-1',
        tutor_id: 'tutor-1',
      };
      const mockClase = {
        id: 'clase-1',
        sector_id: 'sector-1',
        cupos_ocupados: 5,
        cupos_maximo: 10,
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);
      jest.spyOn(validator, 'validateClaseExists').mockResolvedValue(undefined);
      jest
        .spyOn(prisma.clase, 'findUnique')
        .mockResolvedValue(mockClase as any);
      jest
        .spyOn(prisma.inscripcionClase, 'findFirst')
        .mockResolvedValue({ id: 'insc-1' } as any);

      await expect(
        service.asignarClaseAEstudiante('est-1', 'clase-1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('asignarClasesAEstudiante', () => {
    it('debe asignar múltiples clases a estudiante', async () => {
      const mockEstudiante = {
        id: 'est-1',
        sector_id: 'sector-1',
        tutor_id: 'tutor-1',
      };
      const mockClases = [
        {
          id: 'clase-1',
          nombre: 'Clase A',
          sector_id: 'sector-1',
          cupos_ocupados: 5,
          cupos_maximo: 10,
        },
        {
          id: 'clase-2',
          nombre: 'Clase B',
          sector_id: 'sector-1',
          cupos_ocupados: 3,
          cupos_maximo: 10,
        },
      ];

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);
      jest.spyOn(prisma.clase, 'findMany').mockResolvedValue(mockClases as any);
      (prisma.$transaction as jest.Mock).mockImplementation((callback: any) => {
        return callback(prisma);
      });
      jest.spyOn(prisma.inscripcionClase, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prisma.inscripcionClase, 'create')
        .mockResolvedValue({ id: 'insc-1' } as any);
      jest.spyOn(prisma.clase, 'update').mockResolvedValue({} as any);

      const result = await service.asignarClasesAEstudiante('est-1', [
        'clase-1',
        'clase-2',
      ]);

      expect(result).toHaveLength(2);
    });

    it('debe lanzar error si alguna clase no existe', async () => {
      const mockEstudiante = {
        id: 'est-1',
        sector_id: 'sector-1',
        tutor_id: 'tutor-1',
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);
      jest
        .spyOn(prisma.clase, 'findMany')
        .mockResolvedValue([{ id: 'clase-1' }] as any);

      await expect(
        service.asignarClasesAEstudiante('est-1', [
          'clase-1',
          'clase-inexistente',
        ]),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
