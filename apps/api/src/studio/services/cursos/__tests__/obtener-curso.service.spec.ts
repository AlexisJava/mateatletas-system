import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ObtenerCursoService } from '../obtener-curso.service';
import { PrismaService } from '../../../../core/database/prisma.service';
import {
  CategoriaStudio,
  MundoTipo,
  CasaTipo,
  TierNombre,
  EstadoCursoStudio,
  EstadoSemanaStudio,
  TipoExperienciaStudio,
  MateriaStudio,
} from '@prisma/client';

describe('ObtenerCursoService', () => {
  let service: ObtenerCursoService;
  let prisma: PrismaService;

  // Factory para crear curso mock completo
  const crearCursoCompletoMock = (
    overrides: Partial<ReturnType<typeof crearCursoCompletoMock>> = {},
  ) => ({
    id: overrides.id ?? 'curso-1',
    nombre: overrides.nombre ?? 'Curso de Prueba',
    descripcion: overrides.descripcion ?? 'Descripción del curso',
    categoria: overrides.categoria ?? CategoriaStudio.EXPERIENCIA,
    mundo: overrides.mundo ?? MundoTipo.CIENCIAS,
    casa: overrides.casa ?? CasaTipo.VERTEX,
    tier_minimo: overrides.tier_minimo ?? TierNombre.ARCADE,
    tipo_experiencia: overrides.tipo_experiencia ?? null,
    materia: overrides.materia ?? null,
    estetica_base: overrides.estetica_base ?? 'Base Estética',
    estetica_variante: overrides.estetica_variante ?? null,
    cantidad_semanas: overrides.cantidad_semanas ?? 4,
    actividades_por_semana: overrides.actividades_por_semana ?? 3,
    estado: overrides.estado ?? EstadoCursoStudio.DRAFT,
    landing_mundo: overrides.landing_mundo ?? false,
    landing_home: overrides.landing_home ?? false,
    catalogo_interno: overrides.catalogo_interno ?? false,
    notificar_upgrade: overrides.notificar_upgrade ?? false,
    fecha_venta: overrides.fecha_venta ?? null,
    fecha_disponible: overrides.fecha_disponible ?? null,
    creado_en: overrides.creado_en ?? new Date('2025-01-01'),
    actualizado_en: overrides.actualizado_en ?? new Date('2025-01-15'),
    semanas: overrides.semanas ?? [],
  });

  // Factory para crear semana mock
  const crearSemanaMock = (
    overrides: Partial<ReturnType<typeof crearSemanaMock>> = {},
  ) => ({
    id: overrides.id ?? 'semana-1',
    numero: overrides.numero ?? 1,
    nombre: overrides.nombre ?? null,
    estado: overrides.estado ?? EstadoSemanaStudio.VACIA,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObtenerCursoService,
        {
          provide: PrismaService,
          useValue: {
            cursoStudio: {
              findUnique: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ObtenerCursoService>(ObtenerCursoService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('ejecutar', () => {
    describe('happy path', () => {
      it('debe obtener curso existente con estructura completa', async () => {
        // Arrange
        const cursoMock = crearCursoCompletoMock({
          id: 'curso-123',
          nombre: 'Química de Harry Potter',
          descripcion: 'Aprende química con pociones mágicas',
          categoria: CategoriaStudio.EXPERIENCIA,
          mundo: MundoTipo.CIENCIAS,
          casa: CasaTipo.VERTEX,
          tier_minimo: TierNombre.ARCADE_PLUS,
          tipo_experiencia: TipoExperienciaStudio.NARRATIVO,
          estetica_base: 'Harry Potter',
          estetica_variante: 'Hogwarts',
          cantidad_semanas: 8,
          actividades_por_semana: 3,
          estado: EstadoCursoStudio.EN_PROGRESO,
          landing_mundo: true,
          landing_home: false,
          catalogo_interno: true,
          notificar_upgrade: true,
          fecha_venta: new Date('2025-03-01'),
          fecha_disponible: new Date('2025-04-01'),
          creado_en: new Date('2025-01-10'),
          actualizado_en: new Date('2025-02-20'),
          semanas: [],
        });
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(cursoMock);

        // Act
        const result = await service.ejecutar('curso-123');

        // Assert
        expect(result).toEqual({
          id: 'curso-123',
          nombre: 'Química de Harry Potter',
          descripcion: 'Aprende química con pociones mágicas',
          categoria: CategoriaStudio.EXPERIENCIA,
          mundo: MundoTipo.CIENCIAS,
          casa: CasaTipo.VERTEX,
          tierMinimo: TierNombre.ARCADE_PLUS,
          tipoExperiencia: TipoExperienciaStudio.NARRATIVO,
          materia: null,
          esteticaBase: 'Harry Potter',
          esteticaVariante: 'Hogwarts',
          cantidadSemanas: 8,
          actividadesPorSemana: 3,
          estado: EstadoCursoStudio.EN_PROGRESO,
          landingMundo: true,
          landingHome: false,
          catalogoInterno: true,
          notificarUpgrade: true,
          fechaVenta: new Date('2025-03-01'),
          fechaDisponible: new Date('2025-04-01'),
          creadoEn: new Date('2025-01-10'),
          actualizadoEn: new Date('2025-02-20'),
          semanas: [],
        });
      });

      it('debe incluir semanas ordenadas por número ascendente', async () => {
        // Arrange
        const semanasMock = [
          crearSemanaMock({
            id: 'sem-1',
            numero: 1,
            nombre: 'Introducción',
            estado: EstadoSemanaStudio.COMPLETA,
          }),
          crearSemanaMock({
            id: 'sem-2',
            numero: 2,
            nombre: 'Fundamentos',
            estado: EstadoSemanaStudio.EN_PROGRESO,
          }),
          crearSemanaMock({
            id: 'sem-3',
            numero: 3,
            nombre: null,
            estado: EstadoSemanaStudio.VACIA,
          }),
        ];
        const cursoMock = crearCursoCompletoMock({
          id: 'curso-con-semanas',
          semanas: semanasMock,
        });
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(cursoMock);

        // Act
        const result = await service.ejecutar('curso-con-semanas');

        // Assert
        expect(result.semanas).toHaveLength(3);
        expect(result.semanas[0].numero).toBe(1);
        expect(result.semanas[1].numero).toBe(2);
        expect(result.semanas[2].numero).toBe(3);
      });
    });

    describe('semanas', () => {
      it('debe mapear semanas con estructura SemanaResumen correcta', async () => {
        // Arrange
        const semanasMock = [
          crearSemanaMock({
            id: 'semana-uuid-1',
            numero: 1,
            nombre: 'Semana de Introducción',
            estado: EstadoSemanaStudio.COMPLETA,
          }),
        ];
        const cursoMock = crearCursoCompletoMock({ semanas: semanasMock });
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(cursoMock);

        // Act
        const result = await service.ejecutar('curso-1');

        // Assert
        expect(result.semanas[0]).toEqual({
          id: 'semana-uuid-1',
          numero: 1,
          nombre: 'Semana de Introducción',
          estado: EstadoSemanaStudio.COMPLETA,
        });
      });

      it('debe devolver array vacío en semanas para curso sin semanas', async () => {
        // Arrange
        const cursoMock = crearCursoCompletoMock({
          id: 'curso-sin-semanas',
          semanas: [],
        });
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(cursoMock);

        // Act
        const result = await service.ejecutar('curso-sin-semanas');

        // Assert
        expect(result.semanas).toEqual([]);
        expect(result.semanas).toHaveLength(0);
      });
    });

    describe('error handling', () => {
      it('debe lanzar NotFoundException cuando el curso no existe', async () => {
        // Arrange
        jest.spyOn(prisma.cursoStudio, 'findUnique').mockResolvedValue(null);

        // Act & Assert
        await expect(service.ejecutar('curso-inexistente')).rejects.toThrow(
          NotFoundException,
        );
        await expect(service.ejecutar('curso-inexistente')).rejects.toThrow(
          'Curso con ID curso-inexistente no encontrado',
        );
      });
    });

    describe('mapeo de datos', () => {
      it('debe mapear todos los campos snake_case a camelCase', async () => {
        // Arrange
        const cursoMock = crearCursoCompletoMock({
          tier_minimo: TierNombre.PRO,
          tipo_experiencia: TipoExperienciaStudio.LABORATORIO,
          estetica_base: 'Ciencia Ficción',
          estetica_variante: 'Marte',
          cantidad_semanas: 10,
          actividades_por_semana: 5,
          landing_mundo: true,
          landing_home: true,
          catalogo_interno: true,
          notificar_upgrade: true,
          fecha_venta: new Date('2025-06-01'),
          fecha_disponible: new Date('2025-07-01'),
          creado_en: new Date('2025-01-01'),
          actualizado_en: new Date('2025-05-01'),
        });
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(cursoMock);

        // Act
        const result = await service.ejecutar('curso-1');

        // Assert - verificar camelCase
        expect(result).toHaveProperty('tierMinimo', TierNombre.PRO);
        expect(result).toHaveProperty(
          'tipoExperiencia',
          TipoExperienciaStudio.LABORATORIO,
        );
        expect(result).toHaveProperty('esteticaBase', 'Ciencia Ficción');
        expect(result).toHaveProperty('esteticaVariante', 'Marte');
        expect(result).toHaveProperty('cantidadSemanas', 10);
        expect(result).toHaveProperty('actividadesPorSemana', 5);
        expect(result).toHaveProperty('landingMundo', true);
        expect(result).toHaveProperty('landingHome', true);
        expect(result).toHaveProperty('catalogoInterno', true);
        expect(result).toHaveProperty('notificarUpgrade', true);
        expect(result).toHaveProperty('fechaVenta');
        expect(result).toHaveProperty('fechaDisponible');
        expect(result).toHaveProperty('creadoEn');
        expect(result).toHaveProperty('actualizadoEn');

        // Assert - verificar que NO tiene snake_case
        expect(result).not.toHaveProperty('tier_minimo');
        expect(result).not.toHaveProperty('tipo_experiencia');
        expect(result).not.toHaveProperty('estetica_base');
        expect(result).not.toHaveProperty('cantidad_semanas');
      });

      it('debe mapear campos nullables correctamente', async () => {
        // Arrange
        const cursoMock = crearCursoCompletoMock({
          tipo_experiencia: null,
          materia: null,
          estetica_variante: null,
          fecha_venta: null,
          fecha_disponible: null,
        });
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(cursoMock);

        // Act
        const result = await service.ejecutar('curso-1');

        // Assert
        expect(result.tipoExperiencia).toBeNull();
        expect(result.materia).toBeNull();
        expect(result.esteticaVariante).toBeNull();
        expect(result.fechaVenta).toBeNull();
        expect(result.fechaDisponible).toBeNull();
      });

      it('debe mapear campos booleanos correctamente', async () => {
        // Arrange
        const cursoMock = crearCursoCompletoMock({
          landing_mundo: true,
          landing_home: false,
          catalogo_interno: true,
          notificar_upgrade: false,
        });
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(cursoMock);

        // Act
        const result = await service.ejecutar('curso-1');

        // Assert
        expect(result.landingMundo).toBe(true);
        expect(result.landingHome).toBe(false);
        expect(result.catalogoInterno).toBe(true);
        expect(result.notificarUpgrade).toBe(false);
      });
    });
  });

  describe('existe', () => {
    it('debe devolver true si el curso existe', async () => {
      // Arrange
      jest.spyOn(prisma.cursoStudio, 'count').mockResolvedValue(1);

      // Act
      const result = await service.existe('curso-existente');

      // Assert
      expect(result).toBe(true);
      expect(prisma.cursoStudio.count).toHaveBeenCalledWith({
        where: { id: 'curso-existente' },
      });
    });

    it('debe devolver false si el curso no existe', async () => {
      // Arrange
      jest.spyOn(prisma.cursoStudio, 'count').mockResolvedValue(0);

      // Act
      const result = await service.existe('curso-inexistente');

      // Assert
      expect(result).toBe(false);
      expect(prisma.cursoStudio.count).toHaveBeenCalledWith({
        where: { id: 'curso-inexistente' },
      });
    });
  });
});
