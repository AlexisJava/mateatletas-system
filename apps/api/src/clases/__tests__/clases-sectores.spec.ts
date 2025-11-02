import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../core/database/prisma.service';
import { LogrosService } from '../../gamificacion/services/logros.service';

/**
 * Tests para validar que las clases se crean correctamente con sus sectores
 * OBJETIVO: Asegurar que cada clase tiene el sector_id correcto según el docente
 *
 * ⏭️ SKIP: Tests de integración que requieren DB con seed data
 */
describe.skip('Clases - Asignación de Sectores (TDD)', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Creación de clases con sector correcto', () => {
    it('debe crear clase de Matemática con sector_id de Matemática', async () => {
      // 1. Obtener sector de Matemática
      const sectorMatematica = await prisma.sector.findFirst({
        where: { nombre: 'Matemática' },
      });

      expect(sectorMatematica).toBeDefined();

      // 2. Obtener un docente que enseñe Matemática
      const docenteMatematica = await prisma.docente.findFirst({
        where: {
          rutasEspecialidad: {
            some: {
              sectorId: sectorMatematica!.id,
            },
          },
        },
      });

      expect(docenteMatematica).toBeDefined();

      // 3. Crear clase de Matemática
      const clase = await prisma.clase.create({
        data: {
          nombre: 'Test Álgebra Lineal',
          docente_id: docenteMatematica!.id,
          sector_id: sectorMatematica!.id, // 🔑 IMPORTANTE: asignar sector
          fecha_hora_inicio: new Date('2025-11-01T10:00:00Z'),
          duracion_minutos: 60,
          cupos_maximo: 15,
          estado: 'Programada',
        },
        include: {
          sector: true,
        },
      });

      // ✅ VALIDACIONES
      expect(clase.sector_id).toBe(sectorMatematica!.id);
      expect(clase.sector?.nombre).toBe('Matemática');
      expect(clase.sector?.icono).toBe('📐');

      // Limpieza
      await prisma.clase.delete({ where: { id: clase.id } });
    });

    it('debe crear clase de Programación con sector_id de Programación', async () => {
      const sectorProgramacion = await prisma.sector.findFirst({
        where: { nombre: 'Programación' },
      });

      expect(sectorProgramacion).toBeDefined();

      const docenteProgramacion = await prisma.docente.findFirst({
        where: {
          rutasEspecialidad: {
            some: {
              sectorId: sectorProgramacion!.id,
            },
          },
        },
      });

      expect(docenteProgramacion).toBeDefined();

      const clase = await prisma.clase.create({
        data: {
          nombre: 'Test Python Avanzado',
          docente_id: docenteProgramacion!.id,
          sector_id: sectorProgramacion!.id,
          fecha_hora_inicio: new Date('2025-11-01T14:00:00Z'),
          duracion_minutos: 90,
          cupos_maximo: 12,
          estado: 'Programada',
        },
        include: {
          sector: true,
        },
      });

      expect(clase.sector_id).toBe(sectorProgramacion!.id);
      expect(clase.sector?.nombre).toBe('Programación');
      expect(clase.sector?.icono).toBe('💻');

      await prisma.clase.delete({ where: { id: clase.id } });
    });

    it('debe crear clase de Ciencias con sector_id de Ciencias', async () => {
      const sectorCiencias = await prisma.sector.findFirst({
        where: { nombre: 'Ciencias' },
      });

      expect(sectorCiencias).toBeDefined();

      const docenteCiencias = await prisma.docente.findFirst({
        where: {
          rutasEspecialidad: {
            some: {
              sectorId: sectorCiencias!.id,
            },
          },
        },
      });

      expect(docenteCiencias).toBeDefined();

      const clase = await prisma.clase.create({
        data: {
          nombre: 'Test Química Orgánica',
          docente_id: docenteCiencias!.id,
          sector_id: sectorCiencias!.id,
          fecha_hora_inicio: new Date('2025-11-01T16:00:00Z'),
          duracion_minutos: 120,
          cupos_maximo: 10,
          estado: 'Programada',
        },
        include: {
          sector: true,
        },
      });

      expect(clase.sector_id).toBe(sectorCiencias!.id);
      expect(clase.sector?.nombre).toBe('Ciencias');
      expect(clase.sector?.icono).toBe('🔬');

      await prisma.clase.delete({ where: { id: clase.id } });
    });

    it('debe validar que todas las clases tienen su sector asignado correctamente', async () => {
      // Crear múltiples clases de diferentes sectores
      const sectores = await prisma.sector.findMany();

      const clasesCreadas = [];

      for (const sector of sectores) {
        const docente = await prisma.docente.findFirst({
          where: {
            rutasEspecialidad: {
              some: { sectorId: sector.id },
            },
          },
        });

        if (docente) {
          const clase = await prisma.clase.create({
            data: {
              nombre: `Test ${sector.nombre}`,
              docente_id: docente.id,
              sector_id: sector.id,
              fecha_hora_inicio: new Date(),
              duracion_minutos: 60,
              cupos_maximo: 15,
              estado: 'Programada',
            },
            include: {
              sector: true,
            },
          });

          clasesCreadas.push(clase);

          // Validar que coincida
          expect(clase.sector_id).toBe(sector.id);
          expect(clase.sector?.nombre).toBe(sector.nombre);
        }
      }

      // Validar que todas tienen sectores diferentes
      const sectoresUnicos = new Set(clasesCreadas.map((c) => c.sector_id));
      expect(sectoresUnicos.size).toBeGreaterThan(1);

      // Limpieza
      for (const clase of clasesCreadas) {
        await prisma.clase.delete({ where: { id: clase.id } });
      }
    });
  });

  describe('Visualización de clases con colores por sector', () => {
    it('debe retornar clases con información completa del sector para el frontend', async () => {
      // Crear clases de prueba de cada sector
      const sectores = await prisma.sector.findMany();
      const clasesIds = [];

      for (const sector of sectores) {
        const docente = await prisma.docente.findFirst({
          where: {
            rutasEspecialidad: {
              some: { sectorId: sector.id },
            },
          },
        });

        if (docente) {
          const clase = await prisma.clase.create({
            data: {
              nombre: `Clase ${sector.nombre}`,
              docente_id: docente.id,
              sector_id: sector.id,
              fecha_hora_inicio: new Date(),
              duracion_minutos: 60,
              cupos_maximo: 15,
              estado: 'Programada',
            },
          });

          clasesIds.push(clase.id);
        }
      }

      // Obtener clases con el formato que usa el frontend
      const clases = await prisma.clase.findMany({
        where: {
          id: { in: clasesIds },
        },
        include: {
          sector: {
            select: {
              id: true,
              nombre: true,
              icono: true,
              color: true,
            },
          },
          docente: {
            select: {
              nombre: true,
              apellido: true,
            },
          },
          _count: {
            select: {
              inscripciones: true,
            },
          },
        },
      });

      // ✅ VALIDACIONES para el frontend
      expect(clases.length).toBeGreaterThan(0);

      clases.forEach((clase) => {
        // Cada clase debe tener sector completo
        expect(clase.sector).toBeDefined();
        expect(clase.sector?.nombre).toBeDefined();
        expect(clase.sector?.icono).toBeDefined();

        // El frontend puede usar esto para aplicar colores diferentes
        expect(['Matemática', 'Programación', 'Ciencias']).toContain(
          clase.sector?.nombre,
        );
      });

      // Validar que hay diferentes sectores (colores diferentes en el frontend)
      const sectoresEncontrados = new Set(clases.map((c) => c.sector?.nombre));
      expect(sectoresEncontrados.size).toBeGreaterThan(1);

      // Limpieza
      await prisma.clase.deleteMany({
        where: { id: { in: clasesIds } },
      });
    });
  });
});
