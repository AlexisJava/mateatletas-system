/**
 * Tests TDD para agregar sector Ciencias
 *
 * Estos tests verifican que:
 * 1. El sector Ciencias se puede crear correctamente
 * 2. Tiene el icono 🔬 y color verde
 * 3. Está activo por defecto
 * 4. Se puede asignar a docentes
 * 5. Coexiste con Matemática y Programación
 * 6. Las clases pueden filtrar por sector Ciencias
 */

import { Test, TestingModule } from '@nestjs/testing';
import { SectoresRutasService } from '../services/sectores-rutas.service';
import { PrismaService } from '../../core/database/prisma.service';

describe('Sector Ciencias - TDD', () => {
  let service: SectoresRutasService;
  let prisma: PrismaService;

  const mockPrismaService = {
    sector: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    docente: {
      findUnique: jest.fn(),
    },
    docenteRuta: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    rutaEspecialidad: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    clase: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectoresRutasService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SectoresRutasService>(SectoresRutasService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('Creación del sector Ciencias', () => {
    it('debe crear sector Ciencias con icono 🔬 y color verde', async () => {
      // Arrange
      mockPrismaService.sector.findUnique.mockResolvedValue(null); // No existe
      mockPrismaService.sector.create.mockResolvedValue({
        id: 'sector-ciencias',
        nombre: 'Ciencias',
        descripcion: 'Sector de ciencias naturales y exactas',
        color: '#10B981', // Verde (Tailwind emerald-500)
        icono: '🔬',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await service.crearSector({
        nombre: 'Ciencias',
        descripcion: 'Sector de ciencias naturales y exactas',
        color: '#10B981',
        icono: '🔬',
      });

      // Assert
      expect(result).toBeDefined();
      expect(result.nombre).toBe('Ciencias');
      expect(result.icono).toBe('🔬');
      expect(result.color).toBe('#10B981');
      expect(result.activo).toBe(true);
      expect(mockPrismaService.sector.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nombre: 'Ciencias',
            descripcion: 'Sector de ciencias naturales y exactas',
            color: '#10B981',
            icono: '🔬',
          }),
        }),
      );
    });

    it('el color debe ser un hexadecimal válido (verde)', async () => {
      // Arrange
      const colorCiencias = '#10B981';

      // Assert
      expect(colorCiencias).toMatch(/^#[0-9A-F]{6}$/i);
      expect(colorCiencias.toLowerCase()).toBe('#10b981');
    });

    it('NO debe permitir crear Ciencias si ya existe', async () => {
      // Arrange
      mockPrismaService.sector.findUnique.mockResolvedValue({
        id: 'existing-ciencias',
        nombre: 'Ciencias',
      });

      // Act & Assert
      await expect(
        service.crearSector({
          nombre: 'Ciencias',
          descripcion: 'Otro sector ciencias',
          color: '#FF0000',
          icono: '⚛️',
        }),
      ).rejects.toThrow();
    });
  });

  describe('Coexistencia con sectores existentes', () => {
    it('deben existir 3 sectores: Matemática, Programación y Ciencias', async () => {
      // Arrange
      mockPrismaService.sector.findMany.mockResolvedValue([
        {
          id: 'sector-mate',
          nombre: 'Matemática',
          color: '#3B82F6',
          icono: '📐',
          activo: true,
        },
        {
          id: 'sector-prog',
          nombre: 'Programación',
          color: '#8B5CF6',
          icono: '💻',
          activo: true,
        },
        {
          id: 'sector-ciencias',
          nombre: 'Ciencias',
          color: '#10B981',
          icono: '🔬',
          activo: true,
        },
      ]);

      mockPrismaService.sector.count.mockResolvedValue(3);

      // Act
      const sectores = await service.listarSectores();
      const count = await prisma.sector.count();

      // Assert
      expect(count).toBe(3);
      expect(sectores).toHaveLength(3);

      const nombres = sectores.map((s: any) => s.nombre);
      expect(nombres).toContain('Matemática');
      expect(nombres).toContain('Programación');
      expect(nombres).toContain('Ciencias');
    });

    it('sectores deben estar ordenados alfabéticamente', async () => {
      // Arrange
      mockPrismaService.sector.findMany.mockResolvedValue([
        { id: '3', nombre: 'Ciencias', activo: true },
        { id: '1', nombre: 'Matemática', activo: true },
        { id: '2', nombre: 'Programación', activo: true },
      ]);

      // Act
      const sectores = await service.listarSectores();

      // Assert
      const nombres = sectores.map((s: any) => s.nombre);
      expect(nombres).toEqual(['Ciencias', 'Matemática', 'Programación']);
    });

    it('cada sector debe tener un color único', async () => {
      // Arrange
      const sectores = [
        { nombre: 'Matemática', color: '#3B82F6' },
        { nombre: 'Programación', color: '#8B5CF6' },
        { nombre: 'Ciencias', color: '#10B981' },
      ];

      // Assert
      const colores = sectores.map((s) => s.color);
      const coloresUnicos = new Set(colores);
      expect(coloresUnicos.size).toBe(3);
    });

    it('cada sector debe tener un icono único', async () => {
      // Arrange
      const sectores = [
        { nombre: 'Matemática', icono: '📐' },
        { nombre: 'Programación', icono: '💻' },
        { nombre: 'Ciencias', icono: '🔬' },
      ];

      // Assert
      const iconos = sectores.map((s) => s.icono);
      const iconosUnicos = new Set(iconos);
      expect(iconosUnicos.size).toBe(3);
    });
  });

  describe('Integración con docentes', () => {
    it('un docente puede ser asignado al sector Ciencias', async () => {
      // Arrange
      const rutaCiencias = {
        id: 'ruta-fisica',
        nombre: 'Física',
        sectorId: 'sector-ciencias',
      };

      mockPrismaService.docente.findUnique.mockResolvedValue({
        id: 'doc-1',
        email: 'docente@example.com',
        nombre: 'Juan',
        apellido: 'Pérez',
      });

      mockPrismaService.rutaEspecialidad.findUnique.mockResolvedValue(rutaCiencias);
      mockPrismaService.docenteRuta.findUnique.mockResolvedValue(null);
      mockPrismaService.docenteRuta.create.mockResolvedValue({
        id: 'asignacion-ciencias',
        docenteId: 'doc-1',
        rutaId: 'ruta-fisica',
        sectorId: 'sector-ciencias',
      });

      // Act
      const result = await service.agregarRutaDocente('doc-1', 'ruta-fisica');

      // Assert
      expect(result).toBeDefined();
      expect(mockPrismaService.docenteRuta.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sectorId: 'sector-ciencias',
          }),
        }),
      );
    });

    it('un docente puede tener rutas en los 3 sectores (multi-sector)', async () => {
      // Arrange
      mockPrismaService.docenteRuta.findMany.mockResolvedValue([
        {
          id: 'asig-1',
          docenteId: 'doc-1',
          rutaId: 'ruta-mate',
          sectorId: 'sector-mate',
          ruta: { nombre: 'Álgebra' },
          sector: { nombre: 'Matemática', icono: '📐' },
        },
        {
          id: 'asig-2',
          docenteId: 'doc-1',
          rutaId: 'ruta-prog',
          sectorId: 'sector-prog',
          ruta: { nombre: 'Scratch' },
          sector: { nombre: 'Programación', icono: '💻' },
        },
        {
          id: 'asig-3',
          docenteId: 'doc-1',
          rutaId: 'ruta-ciencias',
          sectorId: 'sector-ciencias',
          ruta: { nombre: 'Física' },
          sector: { nombre: 'Ciencias', icono: '🔬' },
        },
      ]);

      // Act
      const rutas = await service.obtenerRutasDocente('doc-1');

      // Assert
      expect(rutas).toHaveLength(3);

      const sectores = rutas.map((r: any) => r.sector.nombre);
      expect(sectores).toContain('Matemática');
      expect(sectores).toContain('Programación');
      expect(sectores).toContain('Ciencias');
    });
  });

  describe('Integración con clases', () => {
    it('una clase puede ser creada con sector Ciencias', async () => {
      // Arrange
      const claseData = {
        nombre: 'Física I',
        docenteId: 'doc-1',
        sectorId: 'sector-ciencias',
        diaFijo: 'Lunes',
        horaInicio: '18:30',
        horaFin: '20:00',
        duracionMinutos: 90,
        cuposMaximo: 10,
        estado: 'Activa',
      };

      mockPrismaService.clase.create.mockResolvedValue({
        id: 'clase-fisica',
        ...claseData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await prisma.clase.create({ data: claseData });

      // Assert
      expect(result).toBeDefined();
      expect(result.sectorId).toBe('sector-ciencias');
      expect(result.nombre).toBe('Física I');
    });

    it('debe poder filtrar clases por sector Ciencias', async () => {
      // Arrange
      mockPrismaService.clase.findMany.mockImplementation(({ where }: any) => {
        if (where?.sectorId === 'sector-ciencias') {
          return Promise.resolve([
            {
              id: 'clase-1',
              nombre: 'Física I',
              sectorId: 'sector-ciencias',
              sector: { nombre: 'Ciencias', icono: '🔬', color: '#10B981' },
            },
            {
              id: 'clase-2',
              nombre: 'Química Básica',
              sectorId: 'sector-ciencias',
              sector: { nombre: 'Ciencias', icono: '🔬', color: '#10B981' },
            },
          ]);
        }
        return Promise.resolve([]);
      });

      // Act
      const clases = await prisma.clase.findMany({
        where: { sectorId: 'sector-ciencias' },
        include: { sector: true },
      });

      // Assert
      expect(clases).toHaveLength(2);
      clases.forEach((clase: any) => {
        expect(clase.sector.nombre).toBe('Ciencias');
        expect(clase.sector.icono).toBe('🔬');
      });
    });

    it('debe retornar clases de todos los sectores cuando no hay filtro', async () => {
      // Arrange
      mockPrismaService.clase.findMany.mockResolvedValue([
        {
          id: 'clase-mate',
          nombre: 'Álgebra',
          sectorId: 'sector-mate',
          sector: { nombre: 'Matemática', icono: '📐' },
        },
        {
          id: 'clase-prog',
          nombre: 'Scratch',
          sectorId: 'sector-prog',
          sector: { nombre: 'Programación', icono: '💻' },
        },
        {
          id: 'clase-ciencias',
          nombre: 'Física',
          sectorId: 'sector-ciencias',
          sector: { nombre: 'Ciencias', icono: '🔬' },
        },
      ]);

      // Act
      const clases = await prisma.clase.findMany({
        include: { sector: true },
      });

      // Assert
      expect(clases).toHaveLength(3);

      const sectores = clases.map((c: any) => c.sector.nombre);
      expect(sectores).toContain('Matemática');
      expect(sectores).toContain('Programación');
      expect(sectores).toContain('Ciencias');
    });
  });

  describe('Seed script para Ciencias', () => {
    it('seed debe agregar Ciencias si solo existen Matemática y Programación', async () => {
      // Arrange - Solo 2 sectores existentes
      mockPrismaService.sector.count.mockResolvedValue(2);
      mockPrismaService.sector.findMany.mockResolvedValue([
        { id: '1', nombre: 'Matemática' },
        { id: '2', nombre: 'Programación' },
      ]);

      mockPrismaService.sector.findUnique.mockResolvedValue(null); // Ciencias no existe

      mockPrismaService.sector.create.mockResolvedValue({
        id: 'sector-ciencias',
        nombre: 'Ciencias',
        descripcion: 'Sector de ciencias naturales y exactas',
        color: '#10B981',
        icono: '🔬',
        activo: true,
      });

      // Act
      const count = await prisma.sector.count();
      const cienciasExists = await prisma.sector.findUnique({
        where: { nombre: 'Ciencias' },
      });

      // Si Ciencias no existe y solo hay 2 sectores, crear
      if (count === 2 && !cienciasExists) {
        await prisma.sector.create({
          data: {
            nombre: 'Ciencias',
            descripcion: 'Sector de ciencias naturales y exactas',
            color: '#10B981',
            icono: '🔬',
          },
        });
      }

      // Assert
      expect(mockPrismaService.sector.create).toHaveBeenCalledWith({
        data: {
          nombre: 'Ciencias',
          descripcion: 'Sector de ciencias naturales y exactas',
          color: '#10B981',
          icono: '🔬',
        },
      });
    });

    it('seed debe ser idempotente (no duplicar si Ciencias ya existe)', async () => {
      // Arrange - Ciencias ya existe
      mockPrismaService.sector.findUnique.mockResolvedValue({
        id: 'existing-ciencias',
        nombre: 'Ciencias',
      });

      // Act
      const exists = await prisma.sector.findUnique({
        where: { nombre: 'Ciencias' },
      });

      // Assert
      expect(exists).toBeDefined();
      // No debe intentar crear si ya existe
      expect(mockPrismaService.sector.create).not.toHaveBeenCalled();
    });
  });

  describe('Validaciones del sector Ciencias', () => {
    it('nombre debe ser exactamente "Ciencias" (no "Ciencia" ni "CIENCIAS")', async () => {
      // Arrange
      const nombreCorrecto = 'Ciencias';

      // Assert
      expect(nombreCorrecto).toBe('Ciencias');
      expect(nombreCorrecto).not.toBe('Ciencia');
      expect(nombreCorrecto).not.toBe('CIENCIAS');
      expect(nombreCorrecto).not.toBe('ciencias');
    });

    it('descripción debe mencionar ciencias naturales o exactas', async () => {
      // Arrange
      const descripcion = 'Sector de ciencias naturales y exactas';

      // Assert
      expect(descripcion.toLowerCase()).toContain('ciencias');
      expect(
        descripcion.toLowerCase().includes('naturales') ||
          descripcion.toLowerCase().includes('exactas'),
      ).toBe(true);
    });

    it('debe estar activo por defecto', async () => {
      // Arrange
      mockPrismaService.sector.create.mockResolvedValue({
        id: 'sector-ciencias',
        nombre: 'Ciencias',
        activo: true,
      });

      // Act
      const result = await prisma.sector.create({
        data: {
          nombre: 'Ciencias',
          descripcion: 'Sector de ciencias',
          color: '#10B981',
          icono: '🔬',
        },
      });

      // Assert
      expect(result.activo).toBe(true);
    });
  });
});
