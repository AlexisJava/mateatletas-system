import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ClasesReservasService } from './clases-reservas.service';
import { PrismaService } from '../../core/database/prisma.service';

describe('ClasesReservasService', () => {
  let service: ClasesReservasService;
  let prisma: PrismaService;

  const mockClase = {
    id: 'clase-1',
    estado: 'Programada',
    fecha_hora_inicio: new Date('2025-12-01T10:00:00Z'),
    cupos_ocupados: 5,
    cupos_maximo: 20,
    producto_id: null,
    producto: null,
  };

  const mockEstudiante = {
    id: 'est-1',
    nombre: 'Juan',
    apellido: 'Pérez',
    tutor_id: 'tutor-1',
    inscripciones_curso: [],
  };

  const mockInscripcion = {
    id: 'insc-1',
    clase_id: 'clase-1',
    estudiante_id: 'est-1',
    tutor_id: 'tutor-1',
    observaciones: null,
    estudiante: { nombre: 'Juan', apellido: 'Pérez' },
    clase: {
      id: 'clase-1',
      rutaCurricular: { nombre: 'Álgebra' },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClasesReservasService,
        {
          provide: PrismaService,
          useValue: {
            clase: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            estudiante: {
              findUnique: jest.fn(),
            },
            inscripcionClase: {
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClasesReservasService>(ClasesReservasService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('reservarClase', () => {
    const validDto = {
      estudianteId: 'est-1',
      observaciones: 'Primera clase',
    };

    it('should reserve class successfully', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(mockEstudiante as any);
      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback({
          clase: {
            findUnique: jest.fn().mockResolvedValue(mockClase), // ✅ Agregado para el fix
            update: jest.fn().mockResolvedValue(mockClase),
          },
          inscripcionClase: {
            findUnique: jest.fn().mockResolvedValue(null), // ✅ Agregado para el fix
            create: jest.fn().mockResolvedValue(mockInscripcion),
          },
        });
      });

      // Act
      const result = await service.reservarClase('clase-1', 'tutor-1', validDto);

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
    });

    it('should throw NotFoundException if class does not exist', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(mockEstudiante as any);
      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback({
          clase: {
            findUnique: jest.fn().mockResolvedValue(null), // ✅ Clase no existe
          },
        });
      });

      // Act & Assert
      await expect(
        service.reservarClase('non-existent', 'tutor-1', validDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.reservarClase('non-existent', 'tutor-1', validDto),
      ).rejects.toThrow('Clase con ID non-existent no encontrada');
    });

    it('should throw BadRequestException if class is cancelled', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(mockEstudiante as any);
      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback({
          clase: {
            findUnique: jest.fn().mockResolvedValue({
              ...mockClase,
              estado: 'Cancelada',
            }),
          },
        });
      });

      // Act & Assert
      await expect(
        service.reservarClase('clase-1', 'tutor-1', validDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.reservarClase('clase-1', 'tutor-1', validDto),
      ).rejects.toThrow('La clase está cancelada');
    });

    it('should throw BadRequestException if class already started', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(mockEstudiante as any);
      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback({
          clase: {
            findUnique: jest.fn().mockResolvedValue({
              ...mockClase,
              fecha_hora_inicio: new Date('2020-01-01T10:00:00Z'), // Pasada
            }),
          },
        });
      });

      // Act & Assert
      await expect(
        service.reservarClase('clase-1', 'tutor-1', validDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.reservarClase('clase-1', 'tutor-1', validDto),
      ).rejects.toThrow('La clase ya comenzó o pasó');
    });

    it('should throw BadRequestException if class is full', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(mockEstudiante as any);
      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback({
          clase: {
            findUnique: jest.fn().mockResolvedValue({
              ...mockClase,
              cupos_ocupados: 20,
              cupos_maximo: 20,
            }),
          },
        });
      });

      // Act & Assert
      await expect(
        service.reservarClase('clase-1', 'tutor-1', validDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.reservarClase('clase-1', 'tutor-1', validDto),
      ).rejects.toThrow('La clase está llena');
    });

    it('should throw NotFoundException if student does not exist', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.reservarClase('clase-1', 'tutor-1', validDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.reservarClase('clase-1', 'tutor-1', validDto),
      ).rejects.toThrow('Estudiante con ID est-1 no encontrado');
    });

    it('should throw ForbiddenException if student does not belong to tutor', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue({
        ...mockEstudiante,
        tutor_id: 'other-tutor', // Diferente tutor
      } as any);

      // Act & Assert
      await expect(
        service.reservarClase('clase-1', 'tutor-1', validDto),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.reservarClase('clase-1', 'tutor-1', validDto),
      ).rejects.toThrow('El estudiante no pertenece a este tutor');
    });

    it('should throw BadRequestException if student not enrolled in required course', async () => {
      // Arrange
      const claseConCurso = {
        ...mockClase,
        producto_id: 'curso-1',
        producto: { nombre: 'Curso de Álgebra' },
      };
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue({
        ...mockEstudiante,
        inscripciones_curso: [], // Sin inscripciones
      } as any);
      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback({
          clase: {
            findUnique: jest.fn().mockResolvedValue(claseConCurso),
          },
        });
      });

      // Act & Assert
      await expect(
        service.reservarClase('clase-1', 'tutor-1', validDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.reservarClase('clase-1', 'tutor-1', validDto),
      ).rejects.toThrow('El estudiante no está inscrito en el curso');
    });

    it('should throw BadRequestException if student already enrolled', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(mockEstudiante as any);
      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback({
          clase: {
            findUnique: jest.fn().mockResolvedValue(mockClase),
          },
          inscripcionClase: {
            findUnique: jest.fn().mockResolvedValue(mockInscripcion), // Ya inscrito
          },
        });
      });

      // Act & Assert
      await expect(
        service.reservarClase('clase-1', 'tutor-1', validDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.reservarClase('clase-1', 'tutor-1', validDto),
      ).rejects.toThrow('El estudiante ya está inscrito en esta clase');
    });

    it('should increment cupos_ocupados on successful reservation', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(mockEstudiante as any);

      const mockTx = {
        clase: {
          findUnique: jest.fn().mockResolvedValue(mockClase), // ✅ Agregado
          update: jest.fn().mockResolvedValue(mockClase),
        },
        inscripcionClase: {
          findUnique: jest.fn().mockResolvedValue(null), // ✅ Agregado
          create: jest.fn().mockResolvedValue(mockInscripcion),
        },
      };

      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      // Act
      await service.reservarClase('clase-1', 'tutor-1', validDto);

      // Assert
      expect(mockTx.clase.update).toHaveBeenCalledWith({
        where: { id: 'clase-1' },
        data: { cupos_ocupados: { increment: 1 } },
      });
    });
  });

  describe('cancelarReserva', () => {
    const mockInscripcionCompleta = {
      ...mockInscripcion,
      clase: {
        id: 'clase-1',
        fecha_hora_inicio: new Date('2025-12-01T10:00:00Z'),
      },
    };

    it('should cancel reservation successfully', async () => {
      // Arrange
      jest
        .spyOn(prisma.inscripcionClase, 'findUnique')
        .mockResolvedValue(mockInscripcionCompleta as any);

      const mockTx = {
        inscripcionClase: {
          delete: jest.fn().mockResolvedValue(mockInscripcion),
        },
        clase: {
          update: jest.fn().mockResolvedValue(mockClase),
        },
      };

      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      // Act
      const result = await service.cancelarReserva('insc-1', 'tutor-1');

      // Assert
      expect(result).toHaveProperty('message', 'Inscripción cancelada exitosamente');
    });

    it('should throw NotFoundException if inscription does not exist', async () => {
      // Arrange
      jest.spyOn(prisma.inscripcionClase, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.cancelarReserva('non-existent', 'tutor-1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.cancelarReserva('non-existent', 'tutor-1')).rejects.toThrow(
        'Inscripción con ID non-existent no encontrada',
      );
    });

    it('should throw ForbiddenException if inscription does not belong to tutor', async () => {
      // Arrange
      jest.spyOn(prisma.inscripcionClase, 'findUnique').mockResolvedValue({
        ...mockInscripcionCompleta,
        tutor_id: 'other-tutor',
      } as any);

      // Act & Assert
      await expect(service.cancelarReserva('insc-1', 'tutor-1')).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.cancelarReserva('insc-1', 'tutor-1')).rejects.toThrow(
        'No tienes permiso para cancelar esta inscripción',
      );
    });

    it('should throw BadRequestException if class already started', async () => {
      // Arrange
      jest.spyOn(prisma.inscripcionClase, 'findUnique').mockResolvedValue({
        ...mockInscripcionCompleta,
        clase: {
          ...mockInscripcionCompleta.clase,
          fecha_hora_inicio: new Date('2020-01-01T10:00:00Z'), // Pasada
        },
      } as any);

      // Act & Assert
      await expect(service.cancelarReserva('insc-1', 'tutor-1')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.cancelarReserva('insc-1', 'tutor-1')).rejects.toThrow(
        'No se puede cancelar una inscripción de una clase que ya comenzó',
      );
    });

    it('should decrement cupos_ocupados on successful cancellation', async () => {
      // Arrange
      jest
        .spyOn(prisma.inscripcionClase, 'findUnique')
        .mockResolvedValue(mockInscripcionCompleta as any);

      const mockTx = {
        inscripcionClase: {
          delete: jest.fn().mockResolvedValue(mockInscripcion),
        },
        clase: {
          update: jest.fn().mockResolvedValue(mockClase),
        },
      };

      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      // Act
      await service.cancelarReserva('insc-1', 'tutor-1');

      // Assert
      expect(mockTx.clase.update).toHaveBeenCalledWith({
        where: { id: 'clase-1' },
        data: { cupos_ocupados: { decrement: 1 } },
      });
    });

    it('should delete inscription in transaction', async () => {
      // Arrange
      jest
        .spyOn(prisma.inscripcionClase, 'findUnique')
        .mockResolvedValue(mockInscripcionCompleta as any);

      const mockTx = {
        inscripcionClase: {
          delete: jest.fn().mockResolvedValue(mockInscripcion),
        },
        clase: {
          update: jest.fn().mockResolvedValue(mockClase),
        },
      };

      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      // Act
      await service.cancelarReserva('insc-1', 'tutor-1');

      // Assert
      expect(mockTx.inscripcionClase.delete).toHaveBeenCalledWith({
        where: { id: 'insc-1' },
      });
    });
  });
});
