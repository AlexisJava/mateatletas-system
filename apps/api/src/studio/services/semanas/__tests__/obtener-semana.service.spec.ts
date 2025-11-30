import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ObtenerSemanaService } from '../obtener-semana.service';
import { PrismaService } from '../../../../core/database/prisma.service';
import { EstadoSemanaStudio } from '@prisma/client';
import { SemanaContenidoJson } from '../../../interfaces';

describe('ObtenerSemanaService', () => {
  let service: ObtenerSemanaService;
  let prisma: PrismaService;

  // Factory para crear semana mock de Prisma (snake_case)
  const crearSemanaPrismaMock = (
    overrides: {
      id?: string;
      curso_id?: string;
      numero?: number;
      nombre?: string | null;
      descripcion?: string | null;
      contenido?: SemanaContenidoJson | null;
      estado?: EstadoSemanaStudio;
      creado_en?: Date;
      actualizado_en?: Date;
    } = {},
  ) => ({
    id: overrides.id ?? 'semana-1',
    curso_id: overrides.curso_id ?? 'curso-1',
    numero: overrides.numero ?? 1,
    nombre: overrides.nombre ?? 'Semana de Introducción',
    descripcion: overrides.descripcion ?? 'Primera semana del curso',
    contenido: overrides.contenido ?? null,
    estado: overrides.estado ?? EstadoSemanaStudio.VACIA,
    creado_en: overrides.creado_en ?? new Date('2025-01-01'),
    actualizado_en: overrides.actualizado_en ?? new Date('2025-01-15'),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObtenerSemanaService,
        {
          provide: PrismaService,
          useValue: {
            semanaStudio: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ObtenerSemanaService>(ObtenerSemanaService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('ejecutar', () => {
    describe('happy path', () => {
      it('debe obtener semana existente con estructura completa', async () => {
        // Arrange
        const semanaMock = crearSemanaPrismaMock({
          id: 'semana-uuid',
          curso_id: 'curso-123',
          numero: 2,
          nombre: 'Semana de Práctica',
          descripcion: 'Ejercicios prácticos',
          estado: EstadoSemanaStudio.COMPLETA,
        });

        jest
          .spyOn(prisma.semanaStudio, 'findUnique')
          .mockResolvedValue(semanaMock);

        // Act
        const result = await service.ejecutar('curso-123', 2);

        // Assert
        expect(result).toEqual({
          id: 'semana-uuid',
          cursoId: 'curso-123',
          numero: 2,
          nombre: 'Semana de Práctica',
          descripcion: 'Ejercicios prácticos',
          contenido: null,
          estado: EstadoSemanaStudio.COMPLETA,
          creadoEn: expect.any(Date),
          actualizadoEn: expect.any(Date),
        });
      });

      it('debe buscar por índice compuesto curso_id y numero', async () => {
        // Arrange
        jest
          .spyOn(prisma.semanaStudio, 'findUnique')
          .mockResolvedValue(crearSemanaPrismaMock());

        // Act
        await service.ejecutar('curso-abc', 3);

        // Assert
        expect(prisma.semanaStudio.findUnique).toHaveBeenCalledWith({
          where: {
            curso_id_numero: {
              curso_id: 'curso-abc',
              numero: 3,
            },
          },
        });
      });
    });

    describe('mapeo de datos', () => {
      it('debe mapear campos snake_case a camelCase', async () => {
        // Arrange
        const semanaMock = crearSemanaPrismaMock({
          curso_id: 'curso-xyz',
          creado_en: new Date('2025-02-01'),
          actualizado_en: new Date('2025-02-15'),
        });
        jest
          .spyOn(prisma.semanaStudio, 'findUnique')
          .mockResolvedValue(semanaMock);

        // Act
        const result = await service.ejecutar('curso-xyz', 1);

        // Assert
        expect(result).toHaveProperty('cursoId', 'curso-xyz');
        expect(result).toHaveProperty('creadoEn');
        expect(result).toHaveProperty('actualizadoEn');
        expect(result).not.toHaveProperty('curso_id');
        expect(result).not.toHaveProperty('creado_en');
        expect(result).not.toHaveProperty('actualizado_en');
      });

      it('debe mapear contenido JSON correctamente', async () => {
        // Arrange
        const contenidoMock: SemanaContenidoJson = {
          numero: 1,
          nombre: 'Semana 1',
          descripcion: 'Descripción',
          objetivosAprendizaje: ['Objetivo 1'],
          actividades: [],
          recursos: [],
          resumenGamificacion: {
            xpTotalSemana: 100,
            xpBonusPosible: 20,
            badgesPosibles: ['badge-1'],
          },
        };
        const semanaMock = crearSemanaPrismaMock({
          contenido: contenidoMock,
        });
        jest
          .spyOn(prisma.semanaStudio, 'findUnique')
          .mockResolvedValue(semanaMock);

        // Act
        const result = await service.ejecutar('curso-1', 1);

        // Assert
        expect(result.contenido).toEqual(contenidoMock);
      });

      it('debe manejar campos nullables correctamente', async () => {
        // Arrange
        const semanaMock = {
          id: 'semana-1',
          curso_id: 'curso-1',
          numero: 1,
          nombre: null,
          descripcion: null,
          contenido: null,
          estado: EstadoSemanaStudio.VACIA,
          creado_en: new Date('2025-01-01'),
          actualizado_en: new Date('2025-01-15'),
        };
        jest
          .spyOn(prisma.semanaStudio, 'findUnique')
          .mockResolvedValue(semanaMock);

        // Act
        const result = await service.ejecutar('curso-1', 1);

        // Assert
        expect(result.nombre).toBeNull();
        expect(result.descripcion).toBeNull();
        expect(result.contenido).toBeNull();
      });
    });

    describe('error handling', () => {
      it('debe lanzar NotFoundException cuando la semana no existe', async () => {
        // Arrange
        jest.spyOn(prisma.semanaStudio, 'findUnique').mockResolvedValue(null);

        // Act & Assert
        await expect(service.ejecutar('curso-x', 5)).rejects.toThrow(
          NotFoundException,
        );
        await expect(service.ejecutar('curso-x', 5)).rejects.toThrow(
          'Semana 5 del curso curso-x no encontrada',
        );
      });
    });
  });

  describe('listarPorCurso', () => {
    describe('happy path', () => {
      it('debe listar todas las semanas de un curso ordenadas por número', async () => {
        // Arrange
        const semanasMock = [
          crearSemanaPrismaMock({ numero: 1, nombre: 'Semana 1' }),
          crearSemanaPrismaMock({ numero: 2, nombre: 'Semana 2' }),
          crearSemanaPrismaMock({ numero: 3, nombre: 'Semana 3' }),
        ];
        jest
          .spyOn(prisma.semanaStudio, 'findMany')
          .mockResolvedValue(semanasMock);

        // Act
        const result = await service.listarPorCurso('curso-1');

        // Assert
        expect(result).toHaveLength(3);
        expect(result[0].numero).toBe(1);
        expect(result[1].numero).toBe(2);
        expect(result[2].numero).toBe(3);
      });

      it('debe usar orderBy numero asc en la query', async () => {
        // Arrange
        jest.spyOn(prisma.semanaStudio, 'findMany').mockResolvedValue([]);

        // Act
        await service.listarPorCurso('curso-abc');

        // Assert
        expect(prisma.semanaStudio.findMany).toHaveBeenCalledWith({
          where: { curso_id: 'curso-abc' },
          orderBy: { numero: 'asc' },
        });
      });
    });

    describe('mapeo de datos', () => {
      it('debe mapear cada semana con estructura SemanaCompleta', async () => {
        // Arrange
        const semanaMock = crearSemanaPrismaMock({
          id: 'sem-1',
          curso_id: 'curso-1',
          numero: 1,
        });
        jest
          .spyOn(prisma.semanaStudio, 'findMany')
          .mockResolvedValue([semanaMock]);

        // Act
        const result = await service.listarPorCurso('curso-1');

        // Assert
        expect(result[0]).toMatchObject({
          id: 'sem-1',
          cursoId: 'curso-1',
          numero: 1,
        });
        expect(result[0]).toHaveProperty('nombre');
        expect(result[0]).toHaveProperty('descripcion');
        expect(result[0]).toHaveProperty('contenido');
        expect(result[0]).toHaveProperty('estado');
        expect(result[0]).toHaveProperty('creadoEn');
        expect(result[0]).toHaveProperty('actualizadoEn');
      });
    });

    describe('casos vacíos', () => {
      it('debe devolver array vacío si el curso no tiene semanas', async () => {
        // Arrange
        jest.spyOn(prisma.semanaStudio, 'findMany').mockResolvedValue([]);

        // Act
        const result = await service.listarPorCurso('curso-sin-semanas');

        // Assert
        expect(result).toEqual([]);
        expect(result).toHaveLength(0);
      });
    });
  });
});
