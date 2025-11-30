import { Test, TestingModule } from '@nestjs/testing';
import { ListarCursosService } from '../listar-cursos.service';
import { PrismaService } from '../../../../core/database/prisma.service';
import {
  CategoriaStudio,
  MundoTipo,
  CasaTipo,
  TierNombre,
  EstadoCursoStudio,
  EstadoSemanaStudio,
} from '@prisma/client';

describe('ListarCursosService', () => {
  let service: ListarCursosService;
  let prisma: PrismaService;

  // Factory para crear cursos de test
  const crearCursoMock = (
    overrides: Partial<ReturnType<typeof crearCursoMock>> = {},
  ) => ({
    id: overrides.id ?? 'curso-1',
    nombre: overrides.nombre ?? 'Curso de Prueba',
    descripcion: 'Descripción del curso',
    categoria: overrides.categoria ?? CategoriaStudio.EXPERIENCIA,
    mundo: overrides.mundo ?? MundoTipo.CIENCIAS,
    casa: overrides.casa ?? CasaTipo.VERTEX,
    tier_minimo: TierNombre.ARCADE,
    tipo_experiencia: null,
    materia: null,
    estetica_base: 'Base',
    estetica_variante: null,
    cantidad_semanas: overrides.cantidad_semanas ?? 4,
    actividades_por_semana: 3,
    estado: overrides.estado ?? EstadoCursoStudio.DRAFT,
    landing_mundo: false,
    landing_home: false,
    catalogo_interno: false,
    notificar_upgrade: false,
    fecha_venta: null,
    fecha_disponible: null,
    creado_en: overrides.creado_en ?? new Date('2025-01-01'),
    actualizado_en: overrides.actualizado_en ?? new Date('2025-01-01'),
    semanas: overrides.semanas ?? [],
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListarCursosService,
        {
          provide: PrismaService,
          useValue: {
            cursoStudio: {
              findMany: jest.fn(),
              groupBy: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ListarCursosService>(ListarCursosService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('ejecutar', () => {
    describe('happy path', () => {
      it('debe listar todos los cursos sin filtros con estructura correcta', async () => {
        // Arrange
        const cursosMock = [
          crearCursoMock({
            id: 'curso-1',
            nombre: 'Química de Harry Potter',
            categoria: CategoriaStudio.EXPERIENCIA,
            mundo: MundoTipo.CIENCIAS,
            casa: CasaTipo.VERTEX,
            estado: EstadoCursoStudio.DRAFT,
            cantidad_semanas: 8,
            creado_en: new Date('2025-01-15'),
            actualizado_en: new Date('2025-01-20'),
            semanas: [
              { estado: EstadoSemanaStudio.COMPLETA },
              { estado: EstadoSemanaStudio.COMPLETA },
              { estado: EstadoSemanaStudio.VACIA },
            ],
          }),
        ];
        jest
          .spyOn(prisma.cursoStudio, 'findMany')
          .mockResolvedValue(cursosMock);

        // Act
        const result = await service.ejecutar();

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          id: 'curso-1',
          nombre: 'Química de Harry Potter',
          categoria: CategoriaStudio.EXPERIENCIA,
          mundo: MundoTipo.CIENCIAS,
          casa: CasaTipo.VERTEX,
          estado: EstadoCursoStudio.DRAFT,
          cantidadSemanas: 8,
          semanasCompletas: 2,
          creadoEn: new Date('2025-01-15'),
          actualizadoEn: new Date('2025-01-20'),
        });
      });

      it('debe ordenar cursos por actualizado_en descendente', async () => {
        // Arrange
        const fechaVieja = new Date('2025-01-10');
        const fechaMedia = new Date('2025-01-15');
        const fechaNueva = new Date('2025-01-20');

        const cursosMock = [
          crearCursoMock({
            id: 'curso-nuevo',
            nombre: 'Nuevo',
            actualizado_en: fechaNueva,
          }),
          crearCursoMock({
            id: 'curso-medio',
            nombre: 'Medio',
            actualizado_en: fechaMedia,
          }),
          crearCursoMock({
            id: 'curso-viejo',
            nombre: 'Viejo',
            actualizado_en: fechaVieja,
          }),
        ];
        jest
          .spyOn(prisma.cursoStudio, 'findMany')
          .mockResolvedValue(cursosMock);

        // Act
        const result = await service.ejecutar();

        // Assert
        expect(result[0].id).toBe('curso-nuevo');
        expect(result[1].id).toBe('curso-medio');
        expect(result[2].id).toBe('curso-viejo');
        expect(result[0].actualizadoEn.getTime()).toBeGreaterThan(
          result[1].actualizadoEn.getTime(),
        );
        expect(result[1].actualizadoEn.getTime()).toBeGreaterThan(
          result[2].actualizadoEn.getTime(),
        );
      });
    });

    describe('filtros', () => {
      it('debe filtrar por estado', async () => {
        // Arrange
        const findManySpy = jest
          .spyOn(prisma.cursoStudio, 'findMany')
          .mockResolvedValue([]);

        // Act
        await service.ejecutar({ estado: EstadoCursoStudio.PUBLICADO });

        // Assert
        expect(findManySpy).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { estado: EstadoCursoStudio.PUBLICADO },
          }),
        );
      });

      it('debe filtrar por categoria', async () => {
        // Arrange
        const findManySpy = jest
          .spyOn(prisma.cursoStudio, 'findMany')
          .mockResolvedValue([]);

        // Act
        await service.ejecutar({ categoria: CategoriaStudio.CURRICULAR });

        // Assert
        expect(findManySpy).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { categoria: CategoriaStudio.CURRICULAR },
          }),
        );
      });

      it('debe filtrar por mundo', async () => {
        // Arrange
        const findManySpy = jest
          .spyOn(prisma.cursoStudio, 'findMany')
          .mockResolvedValue([]);

        // Act
        await service.ejecutar({ mundo: MundoTipo.MATEMATICA });

        // Assert
        expect(findManySpy).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { mundo: MundoTipo.MATEMATICA },
          }),
        );
      });

      it('debe filtrar por casa', async () => {
        // Arrange
        const findManySpy = jest
          .spyOn(prisma.cursoStudio, 'findMany')
          .mockResolvedValue([]);

        // Act
        await service.ejecutar({ casa: CasaTipo.QUANTUM });

        // Assert
        expect(findManySpy).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { casa: CasaTipo.QUANTUM },
          }),
        );
      });

      it('debe combinar múltiples filtros simultáneos', async () => {
        // Arrange
        const findManySpy = jest
          .spyOn(prisma.cursoStudio, 'findMany')
          .mockResolvedValue([]);

        // Act
        await service.ejecutar({
          estado: EstadoCursoStudio.EN_PROGRESO,
          categoria: CategoriaStudio.EXPERIENCIA,
          mundo: MundoTipo.CIENCIAS,
          casa: CasaTipo.PULSAR,
        });

        // Assert
        expect(findManySpy).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              estado: EstadoCursoStudio.EN_PROGRESO,
              categoria: CategoriaStudio.EXPERIENCIA,
              mundo: MundoTipo.CIENCIAS,
              casa: CasaTipo.PULSAR,
            },
          }),
        );
      });
    });

    describe('casos vacíos', () => {
      it('debe devolver array vacío si no hay cursos', async () => {
        // Arrange
        jest.spyOn(prisma.cursoStudio, 'findMany').mockResolvedValue([]);

        // Act
        const result = await service.ejecutar();

        // Assert
        expect(result).toEqual([]);
        expect(result).toHaveLength(0);
      });

      it('debe devolver array vacío si filtros no matchean nada', async () => {
        // Arrange
        jest.spyOn(prisma.cursoStudio, 'findMany').mockResolvedValue([]);

        // Act
        const result = await service.ejecutar({
          estado: EstadoCursoStudio.PUBLICADO,
          categoria: CategoriaStudio.CURRICULAR,
        });

        // Assert
        expect(result).toEqual([]);
      });
    });

    describe('mapeo de datos', () => {
      it('debe calcular semanasCompletas correctamente', async () => {
        // Arrange
        const cursosMock = [
          crearCursoMock({
            id: 'curso-con-semanas',
            cantidad_semanas: 8,
            semanas: [
              { estado: EstadoSemanaStudio.COMPLETA },
              { estado: EstadoSemanaStudio.COMPLETA },
              { estado: EstadoSemanaStudio.COMPLETA },
              { estado: EstadoSemanaStudio.EN_PROGRESO },
              { estado: EstadoSemanaStudio.VACIA },
              { estado: EstadoSemanaStudio.VACIA },
              { estado: EstadoSemanaStudio.VACIA },
              { estado: EstadoSemanaStudio.VACIA },
            ],
          }),
        ];
        jest
          .spyOn(prisma.cursoStudio, 'findMany')
          .mockResolvedValue(cursosMock);

        // Act
        const result = await service.ejecutar();

        // Assert
        expect(result[0].semanasCompletas).toBe(3);
        expect(result[0].cantidadSemanas).toBe(8);
      });

      it('debe mapear campos snake_case a camelCase', async () => {
        // Arrange
        const cursoMock = crearCursoMock({
          cantidad_semanas: 6,
          creado_en: new Date('2025-02-01'),
          actualizado_en: new Date('2025-02-15'),
        });
        jest
          .spyOn(prisma.cursoStudio, 'findMany')
          .mockResolvedValue([cursoMock]);

        // Act
        const result = await service.ejecutar();

        // Assert
        expect(result[0]).toHaveProperty('cantidadSemanas', 6);
        expect(result[0]).toHaveProperty('creadoEn');
        expect(result[0]).toHaveProperty('actualizadoEn');
        expect(result[0]).not.toHaveProperty('cantidad_semanas');
        expect(result[0]).not.toHaveProperty('creado_en');
        expect(result[0]).not.toHaveProperty('actualizado_en');
      });

      it('debe manejar curso sin semanas con semanasCompletas igual a 0', async () => {
        // Arrange
        const cursoSinSemanas = crearCursoMock({
          id: 'curso-sin-semanas',
          semanas: [],
        });
        jest
          .spyOn(prisma.cursoStudio, 'findMany')
          .mockResolvedValue([cursoSinSemanas]);

        // Act
        const result = await service.ejecutar();

        // Assert
        expect(result[0].semanasCompletas).toBe(0);
      });
    });
  });

  describe('contarPorEstado', () => {
    it('debe devolver conteo correcto por cada estado', async () => {
      // Arrange
      const groupByMock = [
        { estado: EstadoCursoStudio.DRAFT, _count: { estado: 5 } },
        { estado: EstadoCursoStudio.EN_PROGRESO, _count: { estado: 3 } },
        { estado: EstadoCursoStudio.EN_REVISION, _count: { estado: 2 } },
        { estado: EstadoCursoStudio.PUBLICADO, _count: { estado: 10 } },
      ];
      jest.spyOn(prisma.cursoStudio, 'groupBy').mockResolvedValue(groupByMock);

      // Act
      const result = await service.contarPorEstado();

      // Assert
      expect(result).toEqual({
        DRAFT: 5,
        EN_PROGRESO: 3,
        EN_REVISION: 2,
        PUBLICADO: 10,
      });
    });

    it('debe devolver todos los estados en 0 si no hay cursos', async () => {
      // Arrange
      jest.spyOn(prisma.cursoStudio, 'groupBy').mockResolvedValue([]);

      // Act
      const result = await service.contarPorEstado();

      // Assert
      expect(result).toEqual({
        DRAFT: 0,
        EN_PROGRESO: 0,
        EN_REVISION: 0,
        PUBLICADO: 0,
      });
    });

    it('debe incluir los 4 estados aunque algunos no tengan cursos', async () => {
      // Arrange
      const groupByMock = [
        { estado: EstadoCursoStudio.DRAFT, _count: { estado: 2 } },
        { estado: EstadoCursoStudio.PUBLICADO, _count: { estado: 1 } },
      ];
      jest.spyOn(prisma.cursoStudio, 'groupBy').mockResolvedValue(groupByMock);

      // Act
      const result = await service.contarPorEstado();

      // Assert
      expect(Object.keys(result)).toHaveLength(4);
      expect(result).toEqual({
        DRAFT: 2,
        EN_PROGRESO: 0,
        EN_REVISION: 0,
        PUBLICADO: 1,
      });
    });
  });
});
