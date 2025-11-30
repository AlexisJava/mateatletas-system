import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ActualizarCursoService } from '../actualizar-curso.service';
import { ObtenerCursoService } from '../obtener-curso.service';
import { PrismaService } from '../../../../core/database/prisma.service';
import {
  TierNombre,
  TipoExperienciaStudio,
  MateriaStudio,
  CategoriaStudio,
  MundoTipo,
  CasaTipo,
  EstadoCursoStudio,
} from '@prisma/client';
import { ActualizarCursoDto } from '../../../dto/actualizar-curso.dto';
import { CursoCompleto } from '../../../interfaces';

describe('ActualizarCursoService', () => {
  let service: ActualizarCursoService;
  let prisma: PrismaService;
  let obtenerCursoService: ObtenerCursoService;

  // Factory para crear curso completo mock
  const crearCursoCompletoMock = (
    overrides: Partial<CursoCompleto> = {},
  ): CursoCompleto => ({
    id: overrides.id ?? 'curso-1',
    nombre: overrides.nombre ?? 'Curso Original',
    descripcion: overrides.descripcion ?? 'Descripción original',
    categoria: overrides.categoria ?? CategoriaStudio.EXPERIENCIA,
    mundo: overrides.mundo ?? MundoTipo.CIENCIAS,
    casa: overrides.casa ?? CasaTipo.VERTEX,
    tierMinimo: overrides.tierMinimo ?? TierNombre.ARCADE,
    tipoExperiencia: overrides.tipoExperiencia ?? null,
    materia: overrides.materia ?? null,
    esteticaBase: overrides.esteticaBase ?? 'Estética Original',
    esteticaVariante: overrides.esteticaVariante ?? null,
    cantidadSemanas: overrides.cantidadSemanas ?? 4,
    actividadesPorSemana: overrides.actividadesPorSemana ?? 3,
    estado: overrides.estado ?? EstadoCursoStudio.DRAFT,
    landingMundo: overrides.landingMundo ?? false,
    landingHome: overrides.landingHome ?? false,
    catalogoInterno: overrides.catalogoInterno ?? false,
    notificarUpgrade: overrides.notificarUpgrade ?? false,
    fechaVenta: overrides.fechaVenta ?? null,
    fechaDisponible: overrides.fechaDisponible ?? null,
    creadoEn: overrides.creadoEn ?? new Date('2025-01-01'),
    actualizadoEn: overrides.actualizadoEn ?? new Date('2025-01-15'),
    semanas: overrides.semanas ?? [],
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActualizarCursoService,
        {
          provide: ObtenerCursoService,
          useValue: {
            existe: jest.fn(),
            ejecutar: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            cursoStudio: {
              update: jest.fn().mockResolvedValue({}),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ActualizarCursoService>(ActualizarCursoService);
    prisma = module.get<PrismaService>(PrismaService);
    obtenerCursoService = module.get<ObtenerCursoService>(ObtenerCursoService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('ejecutar', () => {
    describe('happy path', () => {
      it('debe actualizar curso existente y retornar curso completo', async () => {
        // Arrange
        const cursoId = 'curso-existente';
        const dto: ActualizarCursoDto = {
          nombre: 'Nuevo Nombre',
          descripcion: 'Nueva descripción del curso',
        };
        const cursoActualizado = crearCursoCompletoMock({
          id: cursoId,
          nombre: 'Nuevo Nombre',
          descripcion: 'Nueva descripción del curso',
        });

        jest.spyOn(obtenerCursoService, 'existe').mockResolvedValue(true);
        jest
          .spyOn(obtenerCursoService, 'ejecutar')
          .mockResolvedValue(cursoActualizado);

        // Act
        const result = await service.ejecutar(cursoId, dto);

        // Assert
        expect(result).toEqual(cursoActualizado);
        expect(obtenerCursoService.existe).toHaveBeenCalledWith(cursoId);
        expect(prisma.cursoStudio.update).toHaveBeenCalledWith({
          where: { id: cursoId },
          data: {
            nombre: 'Nuevo Nombre',
            descripcion: 'Nueva descripción del curso',
          },
        });
        expect(obtenerCursoService.ejecutar).toHaveBeenCalledWith(cursoId);
      });
    });

    describe('actualización parcial', () => {
      it('debe actualizar solo los campos presentes en el DTO', async () => {
        // Arrange
        const cursoId = 'curso-parcial';
        const dto: ActualizarCursoDto = {
          nombre: 'Solo Nombre Actualizado',
        };

        jest.spyOn(obtenerCursoService, 'existe').mockResolvedValue(true);
        jest
          .spyOn(obtenerCursoService, 'ejecutar')
          .mockResolvedValue(crearCursoCompletoMock());

        // Act
        await service.ejecutar(cursoId, dto);

        // Assert
        expect(prisma.cursoStudio.update).toHaveBeenCalledWith({
          where: { id: cursoId },
          data: { nombre: 'Solo Nombre Actualizado' },
        });
      });

      it('debe enviar objeto vacío cuando el DTO está vacío', async () => {
        // Arrange
        const cursoId = 'curso-vacio';
        const dto: ActualizarCursoDto = {};

        jest.spyOn(obtenerCursoService, 'existe').mockResolvedValue(true);
        jest
          .spyOn(obtenerCursoService, 'ejecutar')
          .mockResolvedValue(crearCursoCompletoMock());

        // Act
        await service.ejecutar(cursoId, dto);

        // Assert
        expect(prisma.cursoStudio.update).toHaveBeenCalledWith({
          where: { id: cursoId },
          data: {},
        });
      });
    });

    describe('error handling', () => {
      it('debe lanzar NotFoundException cuando el curso no existe', async () => {
        // Arrange
        const cursoId = 'curso-inexistente';
        const dto: ActualizarCursoDto = { nombre: 'Test' };

        jest.spyOn(obtenerCursoService, 'existe').mockResolvedValue(false);

        // Act & Assert
        await expect(service.ejecutar(cursoId, dto)).rejects.toThrow(
          NotFoundException,
        );
        await expect(service.ejecutar(cursoId, dto)).rejects.toThrow(
          `Curso con ID ${cursoId} no encontrado`,
        );
        expect(prisma.cursoStudio.update).not.toHaveBeenCalled();
      });
    });

    describe('mapeo de campos camelCase a snake_case', () => {
      it('debe mapear tipoExperiencia a tipo_experiencia', async () => {
        // Arrange
        const dto: ActualizarCursoDto = {
          tipoExperiencia: TipoExperienciaStudio.NARRATIVO,
        };

        jest.spyOn(obtenerCursoService, 'existe').mockResolvedValue(true);
        jest
          .spyOn(obtenerCursoService, 'ejecutar')
          .mockResolvedValue(crearCursoCompletoMock());

        // Act
        await service.ejecutar('curso-1', dto);

        // Assert
        expect(prisma.cursoStudio.update).toHaveBeenCalledWith({
          where: { id: 'curso-1' },
          data: { tipo_experiencia: TipoExperienciaStudio.NARRATIVO },
        });
      });

      it('debe mapear materia correctamente (sin cambio de nombre)', async () => {
        // Arrange
        const dto: ActualizarCursoDto = {
          materia: MateriaStudio.FISICA,
        };

        jest.spyOn(obtenerCursoService, 'existe').mockResolvedValue(true);
        jest
          .spyOn(obtenerCursoService, 'ejecutar')
          .mockResolvedValue(crearCursoCompletoMock());

        // Act
        await service.ejecutar('curso-1', dto);

        // Assert
        expect(prisma.cursoStudio.update).toHaveBeenCalledWith({
          where: { id: 'curso-1' },
          data: { materia: MateriaStudio.FISICA },
        });
      });

      it('debe mapear esteticaBase a estetica_base', async () => {
        // Arrange
        const dto: ActualizarCursoDto = {
          esteticaBase: 'Nueva Estética',
        };

        jest.spyOn(obtenerCursoService, 'existe').mockResolvedValue(true);
        jest
          .spyOn(obtenerCursoService, 'ejecutar')
          .mockResolvedValue(crearCursoCompletoMock());

        // Act
        await service.ejecutar('curso-1', dto);

        // Assert
        expect(prisma.cursoStudio.update).toHaveBeenCalledWith({
          where: { id: 'curso-1' },
          data: { estetica_base: 'Nueva Estética' },
        });
      });

      it('debe mapear esteticaVariante a estetica_variante', async () => {
        // Arrange
        const dto: ActualizarCursoDto = {
          esteticaVariante: 'Variante Nueva',
        };

        jest.spyOn(obtenerCursoService, 'existe').mockResolvedValue(true);
        jest
          .spyOn(obtenerCursoService, 'ejecutar')
          .mockResolvedValue(crearCursoCompletoMock());

        // Act
        await service.ejecutar('curso-1', dto);

        // Assert
        expect(prisma.cursoStudio.update).toHaveBeenCalledWith({
          where: { id: 'curso-1' },
          data: { estetica_variante: 'Variante Nueva' },
        });
      });

      it('debe mapear cantidadSemanas a cantidad_semanas', async () => {
        // Arrange
        const dto: ActualizarCursoDto = {
          cantidadSemanas: 8,
        };

        jest.spyOn(obtenerCursoService, 'existe').mockResolvedValue(true);
        jest
          .spyOn(obtenerCursoService, 'ejecutar')
          .mockResolvedValue(crearCursoCompletoMock());

        // Act
        await service.ejecutar('curso-1', dto);

        // Assert
        expect(prisma.cursoStudio.update).toHaveBeenCalledWith({
          where: { id: 'curso-1' },
          data: { cantidad_semanas: 8 },
        });
      });

      it('debe mapear actividadesPorSemana a actividades_por_semana', async () => {
        // Arrange
        const dto: ActualizarCursoDto = {
          actividadesPorSemana: 5,
        };

        jest.spyOn(obtenerCursoService, 'existe').mockResolvedValue(true);
        jest
          .spyOn(obtenerCursoService, 'ejecutar')
          .mockResolvedValue(crearCursoCompletoMock());

        // Act
        await service.ejecutar('curso-1', dto);

        // Assert
        expect(prisma.cursoStudio.update).toHaveBeenCalledWith({
          where: { id: 'curso-1' },
          data: { actividades_por_semana: 5 },
        });
      });

      it('debe mapear tierMinimo a tier_minimo', async () => {
        // Arrange
        const dto: ActualizarCursoDto = {
          tierMinimo: TierNombre.PRO,
        };

        jest.spyOn(obtenerCursoService, 'existe').mockResolvedValue(true);
        jest
          .spyOn(obtenerCursoService, 'ejecutar')
          .mockResolvedValue(crearCursoCompletoMock());

        // Act
        await service.ejecutar('curso-1', dto);

        // Assert
        expect(prisma.cursoStudio.update).toHaveBeenCalledWith({
          where: { id: 'curso-1' },
          data: { tier_minimo: TierNombre.PRO },
        });
      });
    });

    describe('actualización con múltiples campos', () => {
      it('debe mapear todos los campos correctamente en una sola actualización', async () => {
        // Arrange
        const dto: ActualizarCursoDto = {
          nombre: 'Curso Completo Actualizado',
          descripcion: 'Nueva descripción completa',
          tipoExperiencia: TipoExperienciaStudio.LABORATORIO,
          materia: MateriaStudio.QUIMICA,
          esteticaBase: 'Ciencia Ficción',
          esteticaVariante: 'Espacio',
          cantidadSemanas: 10,
          actividadesPorSemana: 4,
          tierMinimo: TierNombre.ARCADE_PLUS,
        };

        jest.spyOn(obtenerCursoService, 'existe').mockResolvedValue(true);
        jest
          .spyOn(obtenerCursoService, 'ejecutar')
          .mockResolvedValue(crearCursoCompletoMock());

        // Act
        await service.ejecutar('curso-completo', dto);

        // Assert
        expect(prisma.cursoStudio.update).toHaveBeenCalledWith({
          where: { id: 'curso-completo' },
          data: {
            nombre: 'Curso Completo Actualizado',
            descripcion: 'Nueva descripción completa',
            tipo_experiencia: TipoExperienciaStudio.LABORATORIO,
            materia: MateriaStudio.QUIMICA,
            estetica_base: 'Ciencia Ficción',
            estetica_variante: 'Espacio',
            cantidad_semanas: 10,
            actividades_por_semana: 4,
            tier_minimo: TierNombre.ARCADE_PLUS,
          },
        });
      });
    });

    describe('flujo de verificación', () => {
      it('debe verificar existencia antes de actualizar', async () => {
        // Arrange
        const dto: ActualizarCursoDto = { nombre: 'Test' };
        const existeSpy = jest
          .spyOn(obtenerCursoService, 'existe')
          .mockResolvedValue(true);
        jest
          .spyOn(obtenerCursoService, 'ejecutar')
          .mockResolvedValue(crearCursoCompletoMock());

        // Act
        await service.ejecutar('curso-1', dto);

        // Assert
        expect(existeSpy).toHaveBeenCalledWith('curso-1');
        expect(existeSpy).toHaveBeenCalledTimes(1);
      });

      it('debe obtener curso actualizado después de la actualización', async () => {
        // Arrange
        const cursoId = 'curso-flujo';
        const dto: ActualizarCursoDto = { nombre: 'Test' };
        const cursoActualizado = crearCursoCompletoMock({
          id: cursoId,
          nombre: 'Test',
        });

        jest.spyOn(obtenerCursoService, 'existe').mockResolvedValue(true);
        const ejecutarSpy = jest
          .spyOn(obtenerCursoService, 'ejecutar')
          .mockResolvedValue(cursoActualizado);

        // Act
        const result = await service.ejecutar(cursoId, dto);

        // Assert
        expect(ejecutarSpy).toHaveBeenCalledWith(cursoId);
        expect(result).toEqual(cursoActualizado);
      });
    });
  });
});
