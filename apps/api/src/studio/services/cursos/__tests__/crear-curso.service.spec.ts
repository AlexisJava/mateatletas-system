import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CrearCursoService } from '../crear-curso.service';
import { PrismaService } from '../../../../core/database/prisma.service';
import { CrearCursoDto } from '../../../dto/crear-curso.dto';
import {
  CategoriaStudio,
  MundoTipo,
  CasaTipo,
  TierNombre,
  TipoExperienciaStudio,
  MateriaStudio,
  EstadoCursoStudio,
} from '@prisma/client';

describe('CrearCursoService', () => {
  let service: CrearCursoService;
  let prisma: PrismaService;

  const mockCursoCreado = {
    id: 'curso-uuid-1',
    nombre: 'La Química de Harry Potter',
    descripcion: 'Aprende química preparando pociones',
    categoria: CategoriaStudio.EXPERIENCIA,
    mundo: MundoTipo.CIENCIAS,
    casa: CasaTipo.VERTEX,
    tier_minimo: TierNombre.ARCADE,
    tipo_experiencia: TipoExperienciaStudio.NARRATIVO,
    materia: null,
    estetica_base: 'Harry Potter',
    estetica_variante: 'Hogwarts',
    cantidad_semanas: 8,
    actividades_por_semana: 3,
    estado: EstadoCursoStudio.BORRADOR,
    landing_mundo: false,
    landing_home: false,
    catalogo_interno: false,
    notificar_upgrade: false,
    fecha_venta: null,
    fecha_disponible: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const validExperienciaDto: CrearCursoDto = {
    categoria: CategoriaStudio.EXPERIENCIA,
    mundo: MundoTipo.CIENCIAS,
    casa: CasaTipo.VERTEX,
    nombre: 'La Química de Harry Potter',
    descripcion: 'Aprende química preparando pociones',
    esteticaBase: 'Harry Potter',
    esteticaVariante: 'Hogwarts',
    tipoExperiencia: TipoExperienciaStudio.NARRATIVO,
    cantidadSemanas: 8,
    actividadesPorSemana: 3,
    tierMinimo: TierNombre.ARCADE,
  };

  const validCurricularDto: CrearCursoDto = {
    categoria: CategoriaStudio.CURRICULAR,
    mundo: MundoTipo.CIENCIAS,
    casa: CasaTipo.QUANTUM,
    nombre: 'Física Básica',
    descripcion: 'Conceptos fundamentales de física',
    esteticaBase: 'Laboratorio',
    materia: MateriaStudio.FISICA,
    cantidadSemanas: 6,
    actividadesPorSemana: 2,
    tierMinimo: TierNombre.ARCADE,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrearCursoService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CrearCursoService>(CrearCursoService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should_be_defined', () => {
    expect(service).toBeDefined();
  });

  describe('ejecutar', () => {
    describe('when_creating_experiencia_curso', () => {
      it('should_create_curso_with_empty_semanas', async () => {
        // Arrange
        const mockTx = {
          cursoStudio: {
            create: jest.fn().mockResolvedValue(mockCursoCreado),
          },
          semanaStudio: {
            createMany: jest.fn().mockResolvedValue({ count: 8 }),
          },
        };
        jest
          .spyOn(prisma, '$transaction')
          .mockImplementation(async (callback) => {
            return callback(
              mockTx as unknown as Parameters<typeof callback>[0],
            );
          });

        // Act
        const result = await service.ejecutar(validExperienciaDto);

        // Assert
        expect(result).toEqual({
          id: 'curso-uuid-1',
          nombre: 'La Química de Harry Potter',
          estado: EstadoCursoStudio.BORRADOR,
          cantidadSemanas: 8,
        });
      });

      it('should_call_cursoStudio_create_with_correct_data', async () => {
        // Arrange
        const mockTx = {
          cursoStudio: {
            create: jest.fn().mockResolvedValue(mockCursoCreado),
          },
          semanaStudio: {
            createMany: jest.fn().mockResolvedValue({ count: 8 }),
          },
        };
        jest
          .spyOn(prisma, '$transaction')
          .mockImplementation(async (callback) => {
            return callback(
              mockTx as unknown as Parameters<typeof callback>[0],
            );
          });

        // Act
        await service.ejecutar(validExperienciaDto);

        // Assert
        expect(mockTx.cursoStudio.create).toHaveBeenCalledWith({
          data: {
            nombre: 'La Química de Harry Potter',
            descripcion: 'Aprende química preparando pociones',
            categoria: CategoriaStudio.EXPERIENCIA,
            mundo: MundoTipo.CIENCIAS,
            casa: CasaTipo.VERTEX,
            tier_minimo: TierNombre.ARCADE,
            tipo_experiencia: TipoExperienciaStudio.NARRATIVO,
            materia: null,
            estetica_base: 'Harry Potter',
            estetica_variante: 'Hogwarts',
            cantidad_semanas: 8,
            actividades_por_semana: 3,
          },
        });
      });

      it('should_create_correct_number_of_semanas', async () => {
        // Arrange
        const mockTx = {
          cursoStudio: {
            create: jest.fn().mockResolvedValue(mockCursoCreado),
          },
          semanaStudio: {
            createMany: jest.fn().mockResolvedValue({ count: 8 }),
          },
        };
        jest
          .spyOn(prisma, '$transaction')
          .mockImplementation(async (callback) => {
            return callback(
              mockTx as unknown as Parameters<typeof callback>[0],
            );
          });

        // Act
        await service.ejecutar(validExperienciaDto);

        // Assert
        expect(mockTx.semanaStudio.createMany).toHaveBeenCalledWith({
          data: [
            { curso_id: 'curso-uuid-1', numero: 1 },
            { curso_id: 'curso-uuid-1', numero: 2 },
            { curso_id: 'curso-uuid-1', numero: 3 },
            { curso_id: 'curso-uuid-1', numero: 4 },
            { curso_id: 'curso-uuid-1', numero: 5 },
            { curso_id: 'curso-uuid-1', numero: 6 },
            { curso_id: 'curso-uuid-1', numero: 7 },
            { curso_id: 'curso-uuid-1', numero: 8 },
          ],
        });
      });
    });

    describe('when_creating_curricular_curso', () => {
      it('should_create_curso_with_materia', async () => {
        // Arrange
        const mockCursoCurricular = {
          ...mockCursoCreado,
          id: 'curso-uuid-2',
          nombre: 'Física Básica',
          categoria: CategoriaStudio.CURRICULAR,
          tipo_experiencia: null,
          materia: MateriaStudio.FISICA,
          cantidad_semanas: 6,
        };

        const mockTx = {
          cursoStudio: {
            create: jest.fn().mockResolvedValue(mockCursoCurricular),
          },
          semanaStudio: {
            createMany: jest.fn().mockResolvedValue({ count: 6 }),
          },
        };
        jest
          .spyOn(prisma, '$transaction')
          .mockImplementation(async (callback) => {
            return callback(
              mockTx as unknown as Parameters<typeof callback>[0],
            );
          });

        // Act
        const result = await service.ejecutar(validCurricularDto);

        // Assert
        expect(result.cantidadSemanas).toBe(6);
        expect(mockTx.cursoStudio.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            categoria: CategoriaStudio.CURRICULAR,
            materia: MateriaStudio.FISICA,
            tipo_experiencia: null,
          }),
        });
      });
    });

    describe('validation_coherencia_tipo', () => {
      it('should_throw_when_experiencia_without_tipoExperiencia', async () => {
        // Arrange
        const invalidDto: CrearCursoDto = {
          ...validExperienciaDto,
          tipoExperiencia: undefined,
        };

        // Act & Assert
        await expect(service.ejecutar(invalidDto)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.ejecutar(invalidDto)).rejects.toThrow(
          'Para categoría EXPERIENCIA, el tipo de experiencia es requerido',
        );
      });

      it('should_throw_when_experiencia_with_materia', async () => {
        // Arrange
        const invalidDto: CrearCursoDto = {
          ...validExperienciaDto,
          materia: MateriaStudio.FISICA,
        };

        // Act & Assert
        await expect(service.ejecutar(invalidDto)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.ejecutar(invalidDto)).rejects.toThrow(
          'Para categoría EXPERIENCIA, no se debe especificar materia',
        );
      });

      it('should_throw_when_curricular_without_materia', async () => {
        // Arrange
        const invalidDto: CrearCursoDto = {
          ...validCurricularDto,
          materia: undefined,
        };

        // Act & Assert
        await expect(service.ejecutar(invalidDto)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.ejecutar(invalidDto)).rejects.toThrow(
          'Para categoría CURRICULAR, la materia es requerida',
        );
      });

      it('should_throw_when_curricular_with_tipoExperiencia', async () => {
        // Arrange
        const invalidDto: CrearCursoDto = {
          ...validCurricularDto,
          tipoExperiencia: TipoExperienciaStudio.NARRATIVO,
        };

        // Act & Assert
        await expect(service.ejecutar(invalidDto)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.ejecutar(invalidDto)).rejects.toThrow(
          'Para categoría CURRICULAR, no se debe especificar tipo de experiencia',
        );
      });
    });

    describe('transaction_behavior', () => {
      it('should_use_transaction_for_atomicity', async () => {
        // Arrange
        const transactionSpy = jest
          .spyOn(prisma, '$transaction')
          .mockImplementation(async (callback) => {
            const mockTx = {
              cursoStudio: {
                create: jest.fn().mockResolvedValue(mockCursoCreado),
              },
              semanaStudio: {
                createMany: jest.fn().mockResolvedValue({ count: 8 }),
              },
            };
            return callback(
              mockTx as unknown as Parameters<typeof callback>[0],
            );
          });

        // Act
        await service.ejecutar(validExperienciaDto);

        // Assert
        expect(transactionSpy).toHaveBeenCalled();
      });

      it('should_rollback_if_semanas_creation_fails', async () => {
        // Arrange
        const mockTx = {
          cursoStudio: {
            create: jest.fn().mockResolvedValue(mockCursoCreado),
          },
          semanaStudio: {
            createMany: jest.fn().mockRejectedValue(new Error('DB Error')),
          },
        };
        jest
          .spyOn(prisma, '$transaction')
          .mockImplementation(async (callback) => {
            return callback(
              mockTx as unknown as Parameters<typeof callback>[0],
            );
          });

        // Act & Assert
        await expect(service.ejecutar(validExperienciaDto)).rejects.toThrow(
          'DB Error',
        );
      });
    });

    describe('response_format', () => {
      it('should_return_CrearCursoResponse_structure', async () => {
        // Arrange
        const mockTx = {
          cursoStudio: {
            create: jest.fn().mockResolvedValue(mockCursoCreado),
          },
          semanaStudio: {
            createMany: jest.fn().mockResolvedValue({ count: 8 }),
          },
        };
        jest
          .spyOn(prisma, '$transaction')
          .mockImplementation(async (callback) => {
            return callback(
              mockTx as unknown as Parameters<typeof callback>[0],
            );
          });

        // Act
        const result = await service.ejecutar(validExperienciaDto);

        // Assert
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('nombre');
        expect(result).toHaveProperty('estado');
        expect(result).toHaveProperty('cantidadSemanas');
        expect(Object.keys(result)).toHaveLength(4);
      });

      it('should_return_estado_BORRADOR_for_new_curso', async () => {
        // Arrange
        const mockTx = {
          cursoStudio: {
            create: jest.fn().mockResolvedValue(mockCursoCreado),
          },
          semanaStudio: {
            createMany: jest.fn().mockResolvedValue({ count: 8 }),
          },
        };
        jest
          .spyOn(prisma, '$transaction')
          .mockImplementation(async (callback) => {
            return callback(
              mockTx as unknown as Parameters<typeof callback>[0],
            );
          });

        // Act
        const result = await service.ejecutar(validExperienciaDto);

        // Assert
        expect(result.estado).toBe(EstadoCursoStudio.BORRADOR);
      });
    });
  });
});
