import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PuntosService, TipoAccionPuntos } from '../puntos.service';
import { PrismaService } from '../../core/database/prisma.service';
import { RecursosService } from '../services/recursos.service';

describe('PuntosService - Transaction Security', () => {
  let service: PuntosService;
  let prisma: PrismaService;
  let recursosService: RecursosService;

  const mockEstudiante = {
    id: 'est-1',
    nombre: 'Juan',
    apellido: 'Pérez',
  };

  const mockDocente = {
    id: 'doc-1',
    nombre: 'María',
    apellido: 'García',
  };

  const mockClase = {
    id: 'clase-1',
  };

  const mockPuntoObtenido = {
    id: 'punto-1',
    estudiante_id: 'est-1',
    docente_id: 'doc-1',
    tipo_accion: 'PARTICIPACION',
    clase_id: 'clase-1',
    puntos: 5,
    contexto: 'Test',
    fecha_otorgado: new Date(),
    estudiante: mockEstudiante,
    docente: mockDocente,
  };

  const mockRecursosResult = {
    recursos: { id: 'rec-1', estudiante_id: 'est-1', xp_total: 105 },
    nivel_anterior: 1,
    nivel_nuevo: 1,
    subio_nivel: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PuntosService,
        {
          provide: PrismaService,
          useValue: {
            estudiante: {
              findUnique: jest.fn(),
            },
            docente: {
              findUnique: jest.fn(),
            },
            clase: {
              findUnique: jest.fn(),
            },
            puntoObtenido: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
            asistencia: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: RecursosService,
          useValue: {
            agregarXP: jest.fn(),
            obtenerRecursosConNivel: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PuntosService>(PuntosService);
    prisma = module.get<PrismaService>(PrismaService);
    recursosService = module.get<RecursosService>(RecursosService);
  });

  describe('getTiposAccion', () => {
    it('should return all available action types with their point values', () => {
      const tipos = service.getTiposAccion();

      expect(tipos).toHaveLength(7);
      expect(tipos).toContainEqual({ tipo: 'ASISTENCIA', puntos: 10 });
      expect(tipos).toContainEqual({ tipo: 'PARTICIPACION', puntos: 5 });
      expect(tipos).toContainEqual({ tipo: 'LOGRO', puntos: 50 });
    });
  });

  describe('otorgarPuntos', () => {
    it('should create punto and call RecursosService.agregarXP', async () => {
      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);
      jest
        .spyOn(prisma.docente, 'findUnique')
        .mockResolvedValue(mockDocente as any);
      jest
        .spyOn(prisma.clase, 'findUnique')
        .mockResolvedValue(mockClase as any);
      jest
        .spyOn(prisma.puntoObtenido, 'create')
        .mockResolvedValue(mockPuntoObtenido as any);
      jest
        .spyOn(recursosService, 'agregarXP')
        .mockResolvedValue(mockRecursosResult as any);

      const result = await service.otorgarPuntos(
        'doc-1',
        'est-1',
        'PARTICIPACION' as TipoAccionPuntos,
        'clase-1',
        'Test',
      );

      expect(result.success).toBe(true);
      expect(result.mensaje).toContain('5 puntos');
      expect(result.mensaje).toContain('Juan Pérez');
      expect(prisma.puntoObtenido.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tipo_accion: 'PARTICIPACION',
            puntos: 5,
          }),
        }),
      );
      expect(recursosService.agregarXP).toHaveBeenCalledWith(
        'est-1',
        5,
        'PARTICIPACION',
        expect.any(Object),
      );
    });

    it('should use custom points when provided', async () => {
      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);
      jest
        .spyOn(prisma.docente, 'findUnique')
        .mockResolvedValue(mockDocente as any);
      jest
        .spyOn(prisma.puntoObtenido, 'create')
        .mockResolvedValue({ ...mockPuntoObtenido, puntos: 100 } as any);
      jest
        .spyOn(recursosService, 'agregarXP')
        .mockResolvedValue(mockRecursosResult as any);

      const result = await service.otorgarPuntos(
        'doc-1',
        'est-1',
        'BONUS' as TipoAccionPuntos,
        undefined,
        'Premio especial',
        100, // Custom points
      );

      expect(result.success).toBe(true);
      expect(result.mensaje).toContain('100 puntos');
    });

    it('should throw BadRequestException for zero or negative points', async () => {
      await expect(
        service.otorgarPuntos(
          'doc-1',
          'est-1',
          'PARTICIPACION' as TipoAccionPuntos,
          undefined,
          undefined,
          0,
        ),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.otorgarPuntos(
          'doc-1',
          'est-1',
          'PARTICIPACION' as TipoAccionPuntos,
          undefined,
          undefined,
          -5,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when estudiante does not exist', async () => {
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);

      await expect(
        service.otorgarPuntos(
          'doc-1',
          'est-invalid',
          'PARTICIPACION' as TipoAccionPuntos,
        ),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.otorgarPuntos(
          'doc-1',
          'est-invalid',
          'PARTICIPACION' as TipoAccionPuntos,
        ),
      ).rejects.toThrow('Estudiante no encontrado');
    });

    it('should throw NotFoundException when docente does not exist', async () => {
      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);

      await expect(
        service.otorgarPuntos(
          'doc-invalid',
          'est-1',
          'PARTICIPACION' as TipoAccionPuntos,
        ),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.otorgarPuntos(
          'doc-invalid',
          'est-1',
          'PARTICIPACION' as TipoAccionPuntos,
        ),
      ).rejects.toThrow('Docente no encontrado');
    });

    it('should throw NotFoundException when clase does not exist', async () => {
      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);
      jest
        .spyOn(prisma.docente, 'findUnique')
        .mockResolvedValue(mockDocente as any);
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(null);

      await expect(
        service.otorgarPuntos(
          'doc-1',
          'est-1',
          'PARTICIPACION' as TipoAccionPuntos,
          'clase-invalid',
        ),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.otorgarPuntos(
          'doc-1',
          'est-1',
          'PARTICIPACION' as TipoAccionPuntos,
          'clase-invalid',
        ),
      ).rejects.toThrow('Clase no encontrada');
    });

    it('should work without claseId', async () => {
      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);
      jest
        .spyOn(prisma.docente, 'findUnique')
        .mockResolvedValue(mockDocente as any);
      jest
        .spyOn(prisma.puntoObtenido, 'create')
        .mockResolvedValue({ ...mockPuntoObtenido, clase_id: null } as any);
      jest
        .spyOn(recursosService, 'agregarXP')
        .mockResolvedValue(mockRecursosResult as any);

      const result = await service.otorgarPuntos(
        'doc-1',
        'est-1',
        'AYUDA_COMPANERO' as TipoAccionPuntos,
      );

      expect(result.success).toBe(true);
      expect(prisma.clase.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('getPuntosEstudiante', () => {
    it('should return points summary using RecursosService', async () => {
      jest.spyOn(recursosService, 'obtenerRecursosConNivel').mockResolvedValue({
        id: 'rec-1',
        estudiante_id: 'est-1',
        xp_total: 150,
        nivel: 2,
        xp_progreso: 50,
        xp_necesario: 100,
        porcentaje_nivel: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      jest.spyOn(prisma.asistencia, 'findMany').mockResolvedValue([
        { estado: 'Presente', clase: { id: 'c1', nombre: 'Mate' } },
        { estado: 'Presente', clase: { id: 'c2', nombre: 'Álgebra' } },
        { estado: 'Ausente', clase: { id: 'c3', nombre: 'Geo' } },
      ] as any);

      const result = await service.getPuntosEstudiante('est-1');

      expect(result.total).toBe(150);
      expect(result.nivel).toBe(2);
      expect(result.porcentaje_nivel).toBe(50);
      expect(result.asistencia).toBe(20); // 2 presentes × 10 puntos
    });
  });
});
