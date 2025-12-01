import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CatalogoService } from './catalogo.service';
import { PrismaService } from '../../core/database/prisma.service';
import { CategoriaComponente } from '@prisma/client';

/**
 * Tests para CatalogoService
 * TDD: Red-Green-Refactor
 */
describe('CatalogoService', () => {
  let service: CatalogoService;
  let prisma: jest.Mocked<PrismaService>;

  const mockComponentes = [
    {
      id: 'comp-1',
      tipo: 'MultipleChoice',
      nombre: 'Opción Múltiple',
      descripcion: 'Pregunta con múltiples opciones',
      categoria: CategoriaComponente.INTERACTIVO,
      icono: 'CircleDot',
      configSchema: {},
      ejemploConfig: {},
      propiedades: null,
      implementado: true,
      habilitado: true,
      orden: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'comp-2',
      tipo: 'FillBlanks',
      nombre: 'Completar Espacios',
      descripcion: 'Texto con espacios en blanco',
      categoria: CategoriaComponente.INTERACTIVO,
      icono: 'TextCursorInput',
      configSchema: {},
      ejemploConfig: {},
      propiedades: null,
      implementado: true,
      habilitado: false,
      orden: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const mockPrismaService = {
      componenteCatalogo: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogoService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CatalogoService>(CatalogoService);
    prisma = module.get(PrismaService);
  });

  describe('listar', () => {
    it('should_return_all_components_ordered_by_orden', async () => {
      prisma.componenteCatalogo.findMany.mockResolvedValue(mockComponentes);

      const result = await service.listar();

      expect(result).toEqual(mockComponentes);
      expect(prisma.componenteCatalogo.findMany).toHaveBeenCalledWith({
        orderBy: { orden: 'asc' },
      });
    });

    it('should_return_empty_array_when_no_components', async () => {
      prisma.componenteCatalogo.findMany.mockResolvedValue([]);

      const result = await service.listar();

      expect(result).toEqual([]);
    });
  });

  describe('listarHabilitados', () => {
    it('should_return_only_enabled_components', async () => {
      const habilitados = mockComponentes.filter((c) => c.habilitado);
      prisma.componenteCatalogo.findMany.mockResolvedValue(habilitados);

      const result = await service.listarHabilitados();

      expect(result).toHaveLength(1);
      expect(result[0].tipo).toBe('MultipleChoice');
      expect(prisma.componenteCatalogo.findMany).toHaveBeenCalledWith({
        where: { habilitado: true },
        orderBy: { orden: 'asc' },
      });
    });
  });

  describe('listarPorCategoria', () => {
    it('should_return_components_filtered_by_category', async () => {
      prisma.componenteCatalogo.findMany.mockResolvedValue(mockComponentes);

      const result = await service.listarPorCategoria(
        CategoriaComponente.INTERACTIVO,
      );

      expect(prisma.componenteCatalogo.findMany).toHaveBeenCalledWith({
        where: { categoria: CategoriaComponente.INTERACTIVO },
        orderBy: { orden: 'asc' },
      });
    });
  });

  describe('obtenerPorTipo', () => {
    it('should_return_component_when_exists', async () => {
      prisma.componenteCatalogo.findUnique.mockResolvedValue(
        mockComponentes[0],
      );

      const result = await service.obtenerPorTipo('MultipleChoice');

      expect(result).toEqual(mockComponentes[0]);
      expect(prisma.componenteCatalogo.findUnique).toHaveBeenCalledWith({
        where: { tipo: 'MultipleChoice' },
      });
    });

    it('should_throw_NotFoundException_when_component_not_found', async () => {
      prisma.componenteCatalogo.findUnique.mockResolvedValue(null);

      await expect(service.obtenerPorTipo('NonExistent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.obtenerPorTipo('NonExistent')).rejects.toThrow(
        'Componente "NonExistent" no encontrado',
      );
    });
  });

  describe('toggle', () => {
    it('should_enable_component_when_habilitado_is_true', async () => {
      const componenteActualizado = { ...mockComponentes[1], habilitado: true };
      prisma.componenteCatalogo.findUnique.mockResolvedValue(
        mockComponentes[1],
      );
      prisma.componenteCatalogo.update.mockResolvedValue(componenteActualizado);

      const result = await service.toggle('FillBlanks', true);

      expect(result.habilitado).toBe(true);
      expect(prisma.componenteCatalogo.update).toHaveBeenCalledWith({
        where: { tipo: 'FillBlanks' },
        data: { habilitado: true },
      });
    });

    it('should_disable_component_when_habilitado_is_false', async () => {
      const componenteActualizado = {
        ...mockComponentes[0],
        habilitado: false,
      };
      prisma.componenteCatalogo.findUnique.mockResolvedValue(
        mockComponentes[0],
      );
      prisma.componenteCatalogo.update.mockResolvedValue(componenteActualizado);

      const result = await service.toggle('MultipleChoice', false);

      expect(result.habilitado).toBe(false);
    });

    it('should_throw_NotFoundException_when_toggling_non_existent_component', async () => {
      prisma.componenteCatalogo.findUnique.mockResolvedValue(null);

      await expect(service.toggle('NonExistent', true)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('marcarImplementado', () => {
    it('should_mark_component_as_implemented', async () => {
      const componenteActualizado = {
        ...mockComponentes[1],
        implementado: true,
      };
      prisma.componenteCatalogo.findUnique.mockResolvedValue(
        mockComponentes[1],
      );
      prisma.componenteCatalogo.update.mockResolvedValue(componenteActualizado);

      const result = await service.marcarImplementado('FillBlanks', true);

      expect(result.implementado).toBe(true);
      expect(prisma.componenteCatalogo.update).toHaveBeenCalledWith({
        where: { tipo: 'FillBlanks' },
        data: { implementado: true },
      });
    });

    it('should_throw_NotFoundException_when_component_not_found', async () => {
      prisma.componenteCatalogo.findUnique.mockResolvedValue(null);

      await expect(
        service.marcarImplementado('NonExistent', true),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
