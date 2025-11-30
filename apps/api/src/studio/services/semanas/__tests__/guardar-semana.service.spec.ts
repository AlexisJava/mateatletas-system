import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { GuardarSemanaService } from '../guardar-semana.service';
import { ValidarSemanaService } from '../validar-semana.service';
import { PrismaService } from '../../../../core/database/prisma.service';
import {
  EstadoSemanaStudio,
  EstadoCursoStudio,
  CasaTipo,
} from '@prisma/client';
import { GuardarSemanaDto } from '../../../dto/guardar-semana.dto';

describe('GuardarSemanaService', () => {
  let service: GuardarSemanaService;
  let prisma: PrismaService;
  let validarSemanaService: ValidarSemanaService;

  // Factory para crear semana mock de Prisma
  const crearSemanaPrismaMock = (
    overrides: {
      id?: string;
      curso_id?: string;
      numero?: number;
      nombre?: string | null;
      descripcion?: string | null;
      contenido?: unknown;
      estado?: EstadoSemanaStudio;
      creado_en?: Date;
      actualizado_en?: Date;
    } = {},
  ) => ({
    id: overrides.id ?? 'semana-1',
    curso_id: overrides.curso_id ?? 'curso-1',
    numero: overrides.numero ?? 1,
    nombre: overrides.nombre ?? 'Semana Test',
    descripcion: overrides.descripcion ?? 'Descripción test',
    contenido: overrides.contenido ?? null,
    estado: overrides.estado ?? EstadoSemanaStudio.VACIA,
    creado_en: overrides.creado_en ?? new Date('2025-01-01'),
    actualizado_en: overrides.actualizado_en ?? new Date('2025-01-15'),
  });

  // Factory para crear curso mock
  const crearCursoPrismaMock = (
    overrides: {
      id?: string;
      casa?: CasaTipo;
      actividades_por_semana?: number;
      estado?: EstadoCursoStudio;
      cantidad_semanas?: number;
      semanas?: { estado: EstadoSemanaStudio }[];
    } = {},
  ) => ({
    id: overrides.id ?? 'curso-1',
    casa: overrides.casa ?? CasaTipo.VERTEX,
    actividades_por_semana: overrides.actividades_por_semana ?? 3,
    estado: overrides.estado ?? EstadoCursoStudio.DRAFT,
    cantidad_semanas: overrides.cantidad_semanas ?? 4,
    semanas: overrides.semanas ?? [],
  });

  // Factory para crear contenido válido de semana
  const crearContenidoValidoMock = (numero: number = 1) => ({
    numero,
    nombre: 'Semana de Introducción',
    descripcion: 'Primera semana del curso',
    objetivosAprendizaje: ['Objetivo 1'],
    actividades: [
      {
        numero: 1,
        nombre: 'Actividad 1',
        descripcion: 'Descripción',
        duracionMinutos: 15,
        objetivos: ['Obj'],
        prerrequisitos: null,
        bloques: [
          { orden: 1, componente: 'TextBlock', titulo: 'Intro', contenido: {} },
          { orden: 2, componente: 'Quiz', titulo: 'Quiz', contenido: {} },
        ],
        gamificacion: { xpCompletar: 10, xpBonusSinErrores: 5, badge: null },
        notasDocente: null,
      },
    ],
    recursos: [],
    resumenGamificacion: {
      xpTotalSemana: 100,
      xpBonusPosible: 20,
      badgesPosibles: [],
    },
  });

  // Mock de transacción
  const mockTransaction = jest.fn();

  beforeEach(async () => {
    mockTransaction.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuardarSemanaService,
        {
          provide: ValidarSemanaService,
          useValue: {
            ejecutar: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            semanaStudio: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            cursoStudio: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            $transaction: mockTransaction,
          },
        },
      ],
    }).compile();

    service = module.get<GuardarSemanaService>(GuardarSemanaService);
    prisma = module.get<PrismaService>(PrismaService);
    validarSemanaService =
      module.get<ValidarSemanaService>(ValidarSemanaService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('ejecutar', () => {
    describe('happy path', () => {
      it('debe guardar contenido válido y retornar SemanaCompleta', async () => {
        // Arrange
        const contenido = crearContenidoValidoMock(1);
        const dto: GuardarSemanaDto = { contenido };
        const semanaExistente = crearSemanaPrismaMock({ numero: 1 });
        const cursoMock = crearCursoPrismaMock();
        const semanaActualizada = crearSemanaPrismaMock({
          nombre: contenido.nombre,
          descripcion: contenido.descripcion,
          contenido: JSON.stringify(contenido),
          estado: EstadoSemanaStudio.COMPLETA,
        });

        jest
          .spyOn(prisma.semanaStudio, 'findUnique')
          .mockResolvedValue(semanaExistente);
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(cursoMock);
        jest.spyOn(validarSemanaService, 'ejecutar').mockResolvedValue({
          valido: true,
          errores: [],
          warnings: [],
          info: [],
        });
        mockTransaction.mockImplementation(async (callback) => {
          const txMock = {
            semanaStudio: {
              update: jest.fn().mockResolvedValue(semanaActualizada),
            },
            cursoStudio: { findUnique: jest.fn(), update: jest.fn() },
          };
          return callback(txMock);
        });

        // Act
        const result = await service.ejecutar('curso-1', 1, dto);

        // Assert
        expect(result).toMatchObject({
          id: 'semana-1',
          cursoId: 'curso-1',
          numero: 1,
        });
        expect(result).toHaveProperty('nombre');
        expect(result).toHaveProperty('estado');
      });

      it('debe llamar a validarSemanaService con contexto correcto', async () => {
        // Arrange
        const contenido = crearContenidoValidoMock(2);
        const dto: GuardarSemanaDto = { contenido };
        const semanaExistente = crearSemanaPrismaMock({ numero: 2 });
        const cursoMock = crearCursoPrismaMock({
          casa: CasaTipo.QUANTUM,
          actividades_por_semana: 5,
        });

        jest
          .spyOn(prisma.semanaStudio, 'findUnique')
          .mockResolvedValue(semanaExistente);
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(cursoMock);
        const validarSpy = jest
          .spyOn(validarSemanaService, 'ejecutar')
          .mockResolvedValue({
            valido: true,
            errores: [],
            warnings: [],
            info: [],
          });
        mockTransaction.mockImplementation(async (callback) => {
          const txMock = {
            semanaStudio: {
              update: jest.fn().mockResolvedValue(crearSemanaPrismaMock()),
            },
            cursoStudio: { findUnique: jest.fn(), update: jest.fn() },
          };
          return callback(txMock);
        });

        // Act
        await service.ejecutar('curso-1', 2, dto);

        // Assert
        expect(validarSpy).toHaveBeenCalledWith(contenido, {
          casa: CasaTipo.QUANTUM,
          numeroSemanaEsperado: 2,
          actividadesEsperadas: 5,
        });
      });
    });

    describe('error handling', () => {
      it('debe lanzar NotFoundException cuando la semana no existe', async () => {
        // Arrange
        const dto: GuardarSemanaDto = { contenido: crearContenidoValidoMock() };
        jest.spyOn(prisma.semanaStudio, 'findUnique').mockResolvedValue(null);

        // Act & Assert
        await expect(service.ejecutar('curso-x', 5, dto)).rejects.toThrow(
          NotFoundException,
        );
        await expect(service.ejecutar('curso-x', 5, dto)).rejects.toThrow(
          'Semana 5 del curso curso-x no encontrada',
        );
      });

      it('debe lanzar NotFoundException cuando el curso no existe', async () => {
        // Arrange
        const dto: GuardarSemanaDto = { contenido: crearContenidoValidoMock() };
        jest
          .spyOn(prisma.semanaStudio, 'findUnique')
          .mockResolvedValue(crearSemanaPrismaMock());
        jest.spyOn(prisma.cursoStudio, 'findUnique').mockResolvedValue(null);

        // Act & Assert
        await expect(service.ejecutar('curso-x', 1, dto)).rejects.toThrow(
          NotFoundException,
        );
        await expect(service.ejecutar('curso-x', 1, dto)).rejects.toThrow(
          'Curso curso-x no encontrado',
        );
      });

      it('debe lanzar BadRequestException cuando la validación falla', async () => {
        // Arrange
        const dto: GuardarSemanaDto = { contenido: crearContenidoValidoMock() };
        jest
          .spyOn(prisma.semanaStudio, 'findUnique')
          .mockResolvedValue(crearSemanaPrismaMock());
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(crearCursoPrismaMock());
        jest.spyOn(validarSemanaService, 'ejecutar').mockResolvedValue({
          valido: false,
          errores: [
            {
              tipo: 'error',
              ubicacion: 'semana.nombre',
              mensaje: 'Nombre requerido',
            },
            {
              tipo: 'error',
              ubicacion: 'actividad_1',
              mensaje: 'Faltan bloques',
            },
          ],
          warnings: [],
          info: [],
        });

        // Act & Assert
        await expect(service.ejecutar('curso-1', 1, dto)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.ejecutar('curso-1', 1, dto)).rejects.toThrow(
          'Validación fallida',
        );
      });

      it('debe incluir mensajes de error de validación en la excepción', async () => {
        // Arrange
        const dto: GuardarSemanaDto = { contenido: crearContenidoValidoMock() };
        jest
          .spyOn(prisma.semanaStudio, 'findUnique')
          .mockResolvedValue(crearSemanaPrismaMock());
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(crearCursoPrismaMock());
        jest.spyOn(validarSemanaService, 'ejecutar').mockResolvedValue({
          valido: false,
          errores: [
            {
              tipo: 'error',
              ubicacion: 'campo.x',
              mensaje: 'Error específico',
            },
          ],
          warnings: [],
          info: [],
        });

        // Act & Assert
        await expect(service.ejecutar('curso-1', 1, dto)).rejects.toThrow(
          'campo.x: Error específico',
        );
      });
    });

    describe('actualización de estado del curso', () => {
      it('debe cambiar curso de DRAFT a EN_PROGRESO cuando hay al menos 1 semana completa', async () => {
        // Arrange
        const dto: GuardarSemanaDto = { contenido: crearContenidoValidoMock() };
        jest
          .spyOn(prisma.semanaStudio, 'findUnique')
          .mockResolvedValue(crearSemanaPrismaMock());
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(crearCursoPrismaMock());
        jest.spyOn(validarSemanaService, 'ejecutar').mockResolvedValue({
          valido: true,
          errores: [],
          warnings: [],
          info: [],
        });

        const cursoUpdateSpy = jest.fn();
        mockTransaction.mockImplementation(async (callback) => {
          const txMock = {
            semanaStudio: {
              update: jest.fn().mockResolvedValue(crearSemanaPrismaMock()),
            },
            cursoStudio: {
              findUnique: jest.fn().mockResolvedValue(
                crearCursoPrismaMock({
                  estado: EstadoCursoStudio.DRAFT,
                  cantidad_semanas: 4,
                  semanas: [{ estado: EstadoSemanaStudio.COMPLETA }],
                }),
              ),
              update: cursoUpdateSpy,
            },
          };
          return callback(txMock);
        });

        // Act
        await service.ejecutar('curso-1', 1, dto);

        // Assert
        expect(cursoUpdateSpy).toHaveBeenCalledWith({
          where: { id: 'curso-1' },
          data: { estado: EstadoCursoStudio.EN_PROGRESO },
        });
      });

      it('debe cambiar curso a EN_REVISION cuando TODAS las semanas están completas', async () => {
        // Arrange
        const dto: GuardarSemanaDto = { contenido: crearContenidoValidoMock() };
        jest
          .spyOn(prisma.semanaStudio, 'findUnique')
          .mockResolvedValue(crearSemanaPrismaMock());
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(crearCursoPrismaMock());
        jest.spyOn(validarSemanaService, 'ejecutar').mockResolvedValue({
          valido: true,
          errores: [],
          warnings: [],
          info: [],
        });

        const cursoUpdateSpy = jest.fn();
        mockTransaction.mockImplementation(async (callback) => {
          const txMock = {
            semanaStudio: {
              update: jest.fn().mockResolvedValue(crearSemanaPrismaMock()),
            },
            cursoStudio: {
              findUnique: jest.fn().mockResolvedValue(
                crearCursoPrismaMock({
                  estado: EstadoCursoStudio.EN_PROGRESO,
                  cantidad_semanas: 2,
                  semanas: [
                    { estado: EstadoSemanaStudio.COMPLETA },
                    { estado: EstadoSemanaStudio.COMPLETA },
                  ],
                }),
              ),
              update: cursoUpdateSpy,
            },
          };
          return callback(txMock);
        });

        // Act
        await service.ejecutar('curso-1', 1, dto);

        // Assert
        expect(cursoUpdateSpy).toHaveBeenCalledWith({
          where: { id: 'curso-1' },
          data: { estado: EstadoCursoStudio.EN_REVISION },
        });
      });

      it('no debe cambiar estado si curso ya está PUBLICADO', async () => {
        // Arrange
        const dto: GuardarSemanaDto = { contenido: crearContenidoValidoMock() };
        jest
          .spyOn(prisma.semanaStudio, 'findUnique')
          .mockResolvedValue(crearSemanaPrismaMock());
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(crearCursoPrismaMock());
        jest.spyOn(validarSemanaService, 'ejecutar').mockResolvedValue({
          valido: true,
          errores: [],
          warnings: [],
          info: [],
        });

        const cursoUpdateSpy = jest.fn();
        mockTransaction.mockImplementation(async (callback) => {
          const txMock = {
            semanaStudio: {
              update: jest.fn().mockResolvedValue(crearSemanaPrismaMock()),
            },
            cursoStudio: {
              findUnique: jest.fn().mockResolvedValue(
                crearCursoPrismaMock({
                  estado: EstadoCursoStudio.PUBLICADO,
                  cantidad_semanas: 2,
                  semanas: [
                    { estado: EstadoSemanaStudio.COMPLETA },
                    { estado: EstadoSemanaStudio.COMPLETA },
                  ],
                }),
              ),
              update: cursoUpdateSpy,
            },
          };
          return callback(txMock);
        });

        // Act
        await service.ejecutar('curso-1', 1, dto);

        // Assert
        expect(cursoUpdateSpy).not.toHaveBeenCalled();
      });

      it('no debe cambiar estado si no hay cambio necesario', async () => {
        // Arrange
        const dto: GuardarSemanaDto = { contenido: crearContenidoValidoMock() };
        jest
          .spyOn(prisma.semanaStudio, 'findUnique')
          .mockResolvedValue(crearSemanaPrismaMock());
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(crearCursoPrismaMock());
        jest.spyOn(validarSemanaService, 'ejecutar').mockResolvedValue({
          valido: true,
          errores: [],
          warnings: [],
          info: [],
        });

        const cursoUpdateSpy = jest.fn();
        mockTransaction.mockImplementation(async (callback) => {
          const txMock = {
            semanaStudio: {
              update: jest.fn().mockResolvedValue(crearSemanaPrismaMock()),
            },
            cursoStudio: {
              findUnique: jest.fn().mockResolvedValue(
                crearCursoPrismaMock({
                  estado: EstadoCursoStudio.EN_PROGRESO,
                  cantidad_semanas: 4,
                  semanas: [
                    { estado: EstadoSemanaStudio.COMPLETA },
                    { estado: EstadoSemanaStudio.VACIA },
                  ],
                }),
              ),
              update: cursoUpdateSpy,
            },
          };
          return callback(txMock);
        });

        // Act
        await service.ejecutar('curso-1', 1, dto);

        // Assert
        expect(cursoUpdateSpy).not.toHaveBeenCalled();
      });
    });

    describe('transacción y guardado', () => {
      it('debe usar transacción para guardar semana y actualizar curso', async () => {
        // Arrange
        const dto: GuardarSemanaDto = { contenido: crearContenidoValidoMock() };
        jest
          .spyOn(prisma.semanaStudio, 'findUnique')
          .mockResolvedValue(crearSemanaPrismaMock());
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(crearCursoPrismaMock());
        jest.spyOn(validarSemanaService, 'ejecutar').mockResolvedValue({
          valido: true,
          errores: [],
          warnings: [],
          info: [],
        });
        mockTransaction.mockImplementation(async (callback) => {
          const txMock = {
            semanaStudio: {
              update: jest.fn().mockResolvedValue(crearSemanaPrismaMock()),
            },
            cursoStudio: { findUnique: jest.fn(), update: jest.fn() },
          };
          return callback(txMock);
        });

        // Act
        await service.ejecutar('curso-1', 1, dto);

        // Assert
        expect(mockTransaction).toHaveBeenCalledTimes(1);
      });

      it('debe actualizar semana con estado COMPLETA', async () => {
        // Arrange
        const contenido = crearContenidoValidoMock();
        const dto: GuardarSemanaDto = { contenido };
        jest
          .spyOn(prisma.semanaStudio, 'findUnique')
          .mockResolvedValue(crearSemanaPrismaMock());
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(crearCursoPrismaMock());
        jest.spyOn(validarSemanaService, 'ejecutar').mockResolvedValue({
          valido: true,
          errores: [],
          warnings: [],
          info: [],
        });

        const semanaUpdateSpy = jest
          .fn()
          .mockResolvedValue(crearSemanaPrismaMock());
        mockTransaction.mockImplementation(async (callback) => {
          const txMock = {
            semanaStudio: { update: semanaUpdateSpy },
            cursoStudio: { findUnique: jest.fn(), update: jest.fn() },
          };
          return callback(txMock);
        });

        // Act
        await service.ejecutar('curso-1', 1, dto);

        // Assert
        expect(semanaUpdateSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              estado: EstadoSemanaStudio.COMPLETA,
            }),
          }),
        );
      });

      it('debe guardar nombre y descripción desde el contenido JSON', async () => {
        // Arrange
        const contenido = crearContenidoValidoMock();
        contenido.nombre = 'Nombre Personalizado';
        contenido.descripcion = 'Descripción Personalizada';
        const dto: GuardarSemanaDto = { contenido };

        jest
          .spyOn(prisma.semanaStudio, 'findUnique')
          .mockResolvedValue(crearSemanaPrismaMock());
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(crearCursoPrismaMock());
        jest.spyOn(validarSemanaService, 'ejecutar').mockResolvedValue({
          valido: true,
          errores: [],
          warnings: [],
          info: [],
        });

        const semanaUpdateSpy = jest
          .fn()
          .mockResolvedValue(crearSemanaPrismaMock());
        mockTransaction.mockImplementation(async (callback) => {
          const txMock = {
            semanaStudio: { update: semanaUpdateSpy },
            cursoStudio: { findUnique: jest.fn(), update: jest.fn() },
          };
          return callback(txMock);
        });

        // Act
        await service.ejecutar('curso-1', 1, dto);

        // Assert
        expect(semanaUpdateSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              nombre: 'Nombre Personalizado',
              descripcion: 'Descripción Personalizada',
            }),
          }),
        );
      });
    });

    describe('mapeo de datos', () => {
      it('debe mapear respuesta snake_case a camelCase', async () => {
        // Arrange
        const dto: GuardarSemanaDto = { contenido: crearContenidoValidoMock() };
        const semanaActualizada = crearSemanaPrismaMock({
          id: 'sem-123',
          curso_id: 'curso-abc',
          creado_en: new Date('2025-03-01'),
          actualizado_en: new Date('2025-03-15'),
        });

        jest
          .spyOn(prisma.semanaStudio, 'findUnique')
          .mockResolvedValue(crearSemanaPrismaMock());
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(crearCursoPrismaMock());
        jest.spyOn(validarSemanaService, 'ejecutar').mockResolvedValue({
          valido: true,
          errores: [],
          warnings: [],
          info: [],
        });
        mockTransaction.mockImplementation(async (callback) => {
          const txMock = {
            semanaStudio: {
              update: jest.fn().mockResolvedValue(semanaActualizada),
            },
            cursoStudio: { findUnique: jest.fn(), update: jest.fn() },
          };
          return callback(txMock);
        });

        // Act
        const result = await service.ejecutar('curso-abc', 1, dto);

        // Assert
        expect(result).toHaveProperty('cursoId', 'curso-abc');
        expect(result).toHaveProperty('creadoEn');
        expect(result).toHaveProperty('actualizadoEn');
        expect(result).not.toHaveProperty('curso_id');
        expect(result).not.toHaveProperty('creado_en');
        expect(result).not.toHaveProperty('actualizado_en');
      });
    });
  });
});
