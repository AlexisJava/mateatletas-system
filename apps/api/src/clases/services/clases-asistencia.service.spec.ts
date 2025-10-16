import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ClasesAsistenciaService } from './clases-asistencia.service';
import { PrismaService } from '../../core/database/prisma.service';

describe('ClasesAsistenciaService', () => {
  let service: ClasesAsistenciaService;
  let prisma: PrismaService;

  const mockClase = {
    id: 'clase-1',
    docente_id: 'doc-1',
    fecha_hora_inicio: new Date('2025-10-15T10:00:00Z'),
    inscripciones: [
      { estudiante_id: 'est-1' },
      { estudiante_id: 'est-2' },
    ],
  };

  const mockAsistencias = [
    {
      id: 'asist-1',
      clase_id: 'clase-1',
      estudiante_id: 'est-1',
      estado: 'Presente',
      observaciones: 'Excelente participación',
      puntos_otorgados: 10,
      estudiante: { nombre: 'Juan', apellido: 'Pérez' },
    },
    {
      id: 'asist-2',
      clase_id: 'clase-1',
      estudiante_id: 'est-2',
      estado: 'Ausente',
      observaciones: null,
      puntos_otorgados: 0,
      estudiante: { nombre: 'María', apellido: 'González' },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClasesAsistenciaService,
        {
          provide: PrismaService,
          useValue: {
            clase: {
              findUnique: jest.fn(),
            },
            asistencia: {
              upsert: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ClasesAsistenciaService>(ClasesAsistenciaService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registrarAsistencia', () => {
    const validDto = {
      asistencias: [
        {
          estudianteId: 'est-1',
          estado: 'Presente' as const,
          observaciones: 'Excelente participación',
          puntosOtorgados: 10,
        },
        {
          estudianteId: 'est-2',
          estado: 'Ausente' as const,
          observaciones: null,
          puntosOtorgados: 0,
        },
      ],
    };

    it('should register attendance successfully', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);
      jest.spyOn(prisma.asistencia, 'upsert')
        .mockResolvedValueOnce(mockAsistencias[0] as any)
        .mockResolvedValueOnce(mockAsistencias[1] as any);

      // Act
      const result = await service.registrarAsistencia('clase-1', 'doc-1', validDto);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 'asist-1');
      expect(result[0]).toHaveProperty('estado', 'Presente');
      expect(result[1]).toHaveProperty('estado', 'Ausente');
    });

    it('should throw NotFoundException if class does not exist', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.registrarAsistencia('non-existent', 'doc-1', validDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.registrarAsistencia('non-existent', 'doc-1', validDto),
      ).rejects.toThrow('Clase con ID non-existent no encontrada');
    });

    it('should throw ForbiddenException if docente does not own the class', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue({
        ...mockClase,
        docente_id: 'other-doc',
      } as any);

      // Act & Assert
      await expect(
        service.registrarAsistencia('clase-1', 'doc-1', validDto),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.registrarAsistencia('clase-1', 'doc-1', validDto),
      ).rejects.toThrow('No tienes permiso para registrar asistencia de esta clase');
    });

    it('should throw BadRequestException if student not enrolled', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);

      const dtoWithUnenrolledStudent = {
        asistencias: [
          {
            estudianteId: 'est-999', // No está inscrito
            estado: 'Presente' as const,
            observaciones: null,
            puntosOtorgados: 0,
          },
        ],
      };

      // Act & Assert
      await expect(
        service.registrarAsistencia('clase-1', 'doc-1', dtoWithUnenrolledStudent),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.registrarAsistencia('clase-1', 'doc-1', dtoWithUnenrolledStudent),
      ).rejects.toThrow('El estudiante est-999 no está inscrito en esta clase');
    });

    it('should use upsert to allow updates', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);
      const upsertSpy = jest
        .spyOn(prisma.asistencia, 'upsert')
        .mockResolvedValue(mockAsistencias[0] as any);

      const singleAttendance = {
        asistencias: [validDto.asistencias[0]],
      };

      // Act
      await service.registrarAsistencia('clase-1', 'doc-1', singleAttendance);

      // Assert
      expect(upsertSpy).toHaveBeenCalledWith({
        where: {
          clase_id_estudiante_id: {
            clase_id: 'clase-1',
            estudiante_id: 'est-1',
          },
        },
        update: expect.objectContaining({
          estado: 'Presente',
          observaciones: 'Excelente participación',
          puntos_otorgados: 10,
        }),
        create: expect.objectContaining({
          clase_id: 'clase-1',
          estudiante_id: 'est-1',
          estado: 'Presente',
        }),
        include: expect.any(Object),
      });
    });

    it('should process multiple students in parallel', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);
      const upsertSpy = jest.spyOn(prisma.asistencia, 'upsert')
        .mockResolvedValueOnce(mockAsistencias[0] as any)
        .mockResolvedValueOnce(mockAsistencias[1] as any);

      // Act
      const start = Date.now();
      await service.registrarAsistencia('clase-1', 'doc-1', validDto);
      const duration = Date.now() - start;

      // Assert
      expect(upsertSpy).toHaveBeenCalledTimes(2);
      // Promise.all ejecuta en paralelo, debería ser rápido
      expect(duration).toBeLessThan(100);
    });

    it('should set fecha_registro on update', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);
      const upsertSpy = jest
        .spyOn(prisma.asistencia, 'upsert')
        .mockResolvedValue(mockAsistencias[0] as any);

      const singleAttendance = {
        asistencias: [validDto.asistencias[0]],
      };

      // Act
      await service.registrarAsistencia('clase-1', 'doc-1', singleAttendance);

      // Assert
      expect(upsertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            fecha_registro: expect.any(Date),
          }),
        }),
      );
    });

    it('should handle observaciones as null', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);
      const upsertSpy = jest
        .spyOn(prisma.asistencia, 'upsert')
        .mockResolvedValue(mockAsistencias[1] as any);

      const attendanceWithoutObservations = {
        asistencias: [
          {
            estudianteId: 'est-2',
            estado: 'Ausente' as const,
            observaciones: null,
            puntosOtorgados: 0,
          },
        ],
      };

      // Act
      await service.registrarAsistencia('clase-1', 'doc-1', attendanceWithoutObservations);

      // Assert
      expect(upsertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            observaciones: null,
          }),
          create: expect.objectContaining({
            observaciones: null,
          }),
        }),
      );
    });

    it('should default puntos_otorgados to 0 if not provided', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);
      const upsertSpy = jest
        .spyOn(prisma.asistencia, 'upsert')
        .mockResolvedValue(mockAsistencias[0] as any);

      const attendanceWithoutPoints = {
        asistencias: [
          {
            estudianteId: 'est-1',
            estado: 'Presente' as const,
            observaciones: null,
            puntosOtorgados: undefined, // Sin puntos
          },
        ],
      };

      // Act
      await service.registrarAsistencia('clase-1', 'doc-1', attendanceWithoutPoints);

      // Assert
      expect(upsertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            puntos_otorgados: 0,
          }),
          create: expect.objectContaining({
            puntos_otorgados: 0,
          }),
        }),
      );
    });

    it('should include estudiante details in response', async () => {
      // Arrange
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);
      jest.spyOn(prisma.asistencia, 'upsert')
        .mockResolvedValueOnce(mockAsistencias[0] as any)
        .mockResolvedValueOnce(mockAsistencias[1] as any);

      // Act
      const result = await service.registrarAsistencia('clase-1', 'doc-1', validDto);

      // Assert
      expect(result[0]).toHaveProperty('estudiante');
      expect(result[0].estudiante).toHaveProperty('nombre', 'Juan');
      expect(result[0].estudiante).toHaveProperty('apellido', 'Pérez');
    });
  });
});
