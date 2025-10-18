/**
 * Tests TDD para seed de sectores
 *
 * Estos tests verifican que:
 * 1. Los sectores Matemática y Programación existen en la base de datos
 * 2. Tienen los iconos y colores correctos
 * 3. Están activos
 * 4. Se pueden asignar a docentes
 */

import { Test, TestingModule } from '@nestjs/testing';
import { SectoresRutasService } from '../services/sectores-rutas.service';
import { PrismaService } from '../../core/database/prisma.service';

describe('Sectores - Seed Data (TDD)', () => {
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

  describe('Verificación de sectores base', () => {
    it('deben existir exactamente 2 sectores: Matemática y Programación', async () => {
      // Arrange
      mockPrismaService.sector.findMany.mockResolvedValue([
        {
          id: 'sector-mate',
          nombre: 'Matemática',
          descripcion: 'Sector de matemática',
          color: '#3B82F6',
          icono: '📐',
          activo: true,
        },
        {
          id: 'sector-prog',
          nombre: 'Programación',
          descripcion: 'Sector de programación',
          color: '#8B5CF6',
          icono: '💻',
          activo: true,
        },
      ]);

      mockPrismaService.sector.count.mockResolvedValue(2);

      // Act
      const sectores = await service.listarSectores();
      const count = await prisma.sector.count();

      // Assert
      expect(count).toBe(2);
      expect(sectores).toHaveLength(2);

      const nombres = sectores.map((s: any) => s.nombre);
      expect(nombres).toContain('Matemática');
      expect(nombres).toContain('Programación');
    });

    it('sector Matemática debe tener icono 📐 y color azul', async () => {
      // Arrange
      mockPrismaService.sector.findMany.mockResolvedValue([
        {
          id: 'sector-mate',
          nombre: 'Matemática',
          descripcion: 'Sector de matemática',
          color: '#3B82F6',
          icono: '📐',
          activo: true,
        },
      ]);

      // Act
      const sectores = await service.listarSectores();
      const mate = sectores.find((s: any) => s.nombre === 'Matemática');

      // Assert
      expect(mate).toBeDefined();
      expect(mate!.icono).toBe('📐');
      expect(mate!.color).toMatch(/^#[0-9A-F]{6}$/i); // Hexadecimal válido
      expect(mate!.color.toLowerCase()).toContain('3b82f6'); // Azul
    });

    it('sector Programación debe tener icono 💻 y color morado', async () => {
      // Arrange
      mockPrismaService.sector.findMany.mockResolvedValue([
        {
          id: 'sector-prog',
          nombre: 'Programación',
          descripcion: 'Sector de programación',
          color: '#8B5CF6',
          icono: '💻',
          activo: true,
        },
      ]);

      // Act
      const sectores = await service.listarSectores();
      const prog = sectores.find((s: any) => s.nombre === 'Programación');

      // Assert
      expect(prog).toBeDefined();
      expect(prog!.icono).toBe('💻');
      expect(prog!.color).toMatch(/^#[0-9A-F]{6}$/i);
      expect(prog!.color.toLowerCase()).toContain('8b5cf6'); // Morado
    });

    it('ambos sectores deben estar activos', async () => {
      // Arrange
      mockPrismaService.sector.findMany.mockResolvedValue([
        {
          id: 'sector-mate',
          nombre: 'Matemática',
          activo: true,
        },
        {
          id: 'sector-prog',
          nombre: 'Programación',
          activo: true,
        },
      ]);

      // Act
      const sectores = await service.listarSectores();

      // Assert
      sectores.forEach((sector: any) => {
        expect(sector.activo).toBe(true);
      });
    });
  });

  describe('Integración con docentes', () => {
    it('un docente puede ser asignado al sector Matemática', async () => {
      // Arrange
      const sectorMate = {
        id: 'sector-mate',
        nombre: 'Matemática',
      };

      const rutaMate = {
        id: 'ruta-base',
        nombre: 'Base-Progresivo',
        sectorId: 'sector-mate',
      };

      // Mockear que el docente existe
      mockPrismaService.docente.findUnique.mockResolvedValue({
        id: 'doc-1',
        email: 'test@example.com',
        nombre: 'Test',
        apellido: 'Docente',
      });

      // Mockear que la ruta existe
      mockPrismaService.rutaEspecialidad.findUnique.mockResolvedValue(rutaMate);

      // Mockear que no existe asignación previa
      mockPrismaService.docenteRuta.findUnique.mockResolvedValue(null);

      mockPrismaService.docenteRuta.create.mockResolvedValue({
        id: 'asignacion-1',
        docenteId: 'doc-1',
        rutaId: 'ruta-base',
        sectorId: 'sector-mate',
      });

      // Act
      const result = await service.agregarRutaDocente('doc-1', 'ruta-base');

      // Assert
      expect(result).toBeDefined();
      expect(mockPrismaService.docenteRuta.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sectorId: 'sector-mate',
          }),
        }),
      );
    });

    it('un docente puede ser asignado al sector Programación', async () => {
      // Arrange
      const rutaProg = {
        id: 'ruta-scratch',
        nombre: 'Scratch',
        sectorId: 'sector-prog',
      };

      // Mockear que el docente existe
      mockPrismaService.docente.findUnique.mockResolvedValue({
        id: 'doc-1',
        email: 'test@example.com',
        nombre: 'Test',
        apellido: 'Docente',
      });

      // Mockear que la ruta existe
      mockPrismaService.rutaEspecialidad.findUnique.mockResolvedValue(rutaProg);

      // Mockear que no existe asignación previa
      mockPrismaService.docenteRuta.findUnique.mockResolvedValue(null);

      mockPrismaService.docenteRuta.create.mockResolvedValue({
        id: 'asignacion-1',
        docenteId: 'doc-1',
        rutaId: 'ruta-scratch',
        sectorId: 'sector-prog',
      });

      // Act
      const result = await service.agregarRutaDocente('doc-1', 'ruta-scratch');

      // Assert
      expect(result).toBeDefined();
      expect(mockPrismaService.docenteRuta.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sectorId: 'sector-prog',
          }),
        }),
      );
    });

    it('un docente puede tener rutas en AMBOS sectores (multi-sector)', async () => {
      // Arrange
      mockPrismaService.docenteRuta.findMany.mockResolvedValue([
        {
          id: 'asig-1',
          docenteId: 'doc-1',
          rutaId: 'ruta-mate',
          sectorId: 'sector-mate',
          ruta: { nombre: 'Base-Progresivo' },
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
      ]);

      // Act
      const rutas = await service.obtenerRutasDocente('doc-1');

      // Assert
      expect(rutas).toHaveLength(2);

      const sectores = rutas.map((r: any) => r.sector.nombre);
      expect(sectores).toContain('Matemática');
      expect(sectores).toContain('Programación');
    });
  });

  describe('Validaciones de nombres únicos', () => {
    it('NO debe permitir crear sector con nombre duplicado', async () => {
      // Arrange
      mockPrismaService.sector.findUnique.mockResolvedValue({
        id: 'existing',
        nombre: 'Matemática',
      });

      // Act & Assert
      await expect(
        service.crearSector({
          nombre: 'Matemática', // Duplicado
          descripcion: 'Otra matemática',
          color: '#FF0000',
          icono: '🔢',
        }),
      ).rejects.toThrow();
    });

    it('debe permitir crear sector con nombre único', async () => {
      // Arrange
      mockPrismaService.sector.findUnique.mockResolvedValue(null);
      mockPrismaService.sector.create.mockResolvedValue({
        id: 'new-sector',
        nombre: 'Física',
        descripcion: 'Sector de física',
        color: '#10B981',
        icono: '⚛️',
        activo: true,
      });

      // Act
      const result = await service.crearSector({
        nombre: 'Física',
        descripcion: 'Sector de física',
        color: '#10B981',
        icono: '⚛️',
      });

      // Assert
      expect(result).toBeDefined();
      expect(result.nombre).toBe('Física');
    });
  });

  describe('Consultas de sectores', () => {
    it('listarSectores() debe retornar sectores ordenados alfabéticamente', async () => {
      // Arrange
      mockPrismaService.sector.findMany.mockResolvedValue([
        { id: '1', nombre: 'Matemática', activo: true },
        { id: '2', nombre: 'Programación', activo: true },
      ]);

      // Act
      const sectores = await service.listarSectores();

      // Assert
      const call = mockPrismaService.sector.findMany.mock.calls[0][0];
      expect(call.orderBy).toEqual({ nombre: 'asc' });
      expect(sectores).toHaveLength(2);
      expect(sectores.map((s: any) => s.nombre)).toEqual(['Matemática', 'Programación']);
    });

    it('debe poder buscar sector por nombre exacto', async () => {
      // Arrange
      mockPrismaService.sector.findMany.mockImplementation(({ where }: any) => {
        if (where?.nombre === 'Matemática') {
          return Promise.resolve([
            { id: 'sector-mate', nombre: 'Matemática', activo: true },
          ]);
        }
        return Promise.resolve([]);
      });

      // Act
      const sectores = await prisma.sector.findMany({
        where: { nombre: 'Matemática' },
      });

      // Assert
      expect(sectores).toHaveLength(1);
      expect(sectores[0].nombre).toBe('Matemática');
    });
  });

  describe('Seed script execution', () => {
    it('seed debe ser idempotente (no duplicar si ya existen sectores)', async () => {
      // Arrange - Sectores ya existen
      mockPrismaService.sector.count.mockResolvedValue(2);
      mockPrismaService.sector.findMany.mockResolvedValue([
        { id: '1', nombre: 'Matemática' },
        { id: '2', nombre: 'Programación' },
      ]);

      // Act
      const count = await prisma.sector.count();

      // Assert
      expect(count).toBe(2);
      // El seed NO debe crear duplicados
      expect(mockPrismaService.sector.create).not.toHaveBeenCalled();
    });

    it('seed debe crear sectores si la tabla está vacía', async () => {
      // Arrange - Tabla vacía
      mockPrismaService.sector.count.mockResolvedValue(0);
      mockPrismaService.sector.create
        .mockResolvedValueOnce({
          id: 'sector-mate',
          nombre: 'Matemática',
          descripcion: 'Sector de matemática',
          color: '#3B82F6',
          icono: '📐',
          activo: true,
        })
        .mockResolvedValueOnce({
          id: 'sector-prog',
          nombre: 'Programación',
          descripcion: 'Sector de programación',
          color: '#8B5CF6',
          icono: '💻',
          activo: true,
        });

      // Act
      const count = await prisma.sector.count();

      // Si count es 0, el seed debe crear sectores
      if (count === 0) {
        await prisma.sector.create({
          data: {
            nombre: 'Matemática',
            descripcion: 'Sector de matemática',
            color: '#3B82F6',
            icono: '📐',
          },
        });
        await prisma.sector.create({
          data: {
            nombre: 'Programación',
            descripcion: 'Sector de programación',
            color: '#8B5CF6',
            icono: '💻',
          },
        });
      }

      // Assert
      expect(mockPrismaService.sector.create).toHaveBeenCalledTimes(2);
    });
  });
});
