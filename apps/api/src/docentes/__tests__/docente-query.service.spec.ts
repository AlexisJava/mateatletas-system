import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DocenteQueryService } from '../services/docente-query.service';
import { PrismaService } from '../../core/database/prisma.service';

describe('DocenteQueryService', () => {
  let service: DocenteQueryService;
  let prisma: PrismaService;

  const mockDocente = {
    id: 'docente-123',
    email: 'juan@example.com',
    password_hash: 'hashed_password',
    nombre: 'Juan',
    apellido: 'Pérez',
    titulo: 'Licenciado en Matemáticas',
    bio: 'Docente con 10 años de experiencia',
    telefono: '+54123456789',
    especialidades: ['Álgebra', 'Geometría'],
    experiencia_anos: 10,
    disponibilidad_horaria: { lunes: ['09:00-12:00'] },
    nivel_educativo: ['Secundaria'],
    estado: 'activo',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocenteQueryService,
        {
          provide: PrismaService,
          useValue: {
            docente: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<DocenteQueryService>(DocenteQueryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('findAll', () => {
    it('should return paginated list of docentes without password_hash', async () => {
      jest.spyOn(prisma.docente, 'findMany').mockResolvedValue([mockDocente]);
      jest.spyOn(prisma.docente, 'count').mockResolvedValue(1);

      const result = await service.findAll(1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).not.toHaveProperty('password_hash');
      expect(result.data[0].nombre).toBe('Juan');
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('should use default pagination (page 1, limit 20)', async () => {
      jest.spyOn(prisma.docente, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.docente, 'count').mockResolvedValue(0);

      await service.findAll();

      expect(prisma.docente.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
    });

    it('should calculate correct skip value for page 2', async () => {
      jest.spyOn(prisma.docente, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.docente, 'count').mockResolvedValue(0);

      await service.findAll(2, 10);

      expect(prisma.docente.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 10,
      });
    });

    it('should calculate totalPages correctly', async () => {
      jest.spyOn(prisma.docente, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.docente, 'count').mockResolvedValue(45);

      const result = await service.findAll(1, 10);

      expect(result.meta.totalPages).toBe(5); // 45 / 10 = 4.5 → ceil = 5
    });
  });

  describe('findByEmail', () => {
    it('should return docente with password_hash (for authentication)', async () => {
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(mockDocente);

      const result = await service.findByEmail('juan@example.com');

      expect(result).toBeDefined();
      expect(result?.email).toBe('juan@example.com');
      // IMPORTANTE: findByEmail SÍ incluye password_hash para auth
      expect(result?.password_hash).toBe('hashed_password');
    });

    it('should return null if docente does not exist', async () => {
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);

      const result = await service.findByEmail('noexiste@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return docente without password_hash', async () => {
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue({
        ...mockDocente,
        rutasEspecialidad: [],
      });

      const result = await service.findById('docente-123');

      expect(result).toBeDefined();
      expect(result.nombre).toBe('Juan');
      expect(result).not.toHaveProperty('password_hash');
    });

    it('should throw NotFoundException if docente does not exist', async () => {
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);

      await expect(service.findById('docente-999')).rejects.toThrow(
        NotFoundException,
      );

      await expect(service.findById('docente-999')).rejects.toThrow(
        'Docente no encontrado',
      );
    });

    it('should include unique sectores from rutasEspecialidad', async () => {
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue({
        ...mockDocente,
        rutasEspecialidad: [
          {
            id: 'ruta-1',
            sector: {
              nombre: 'Matemáticas',
              icono: '🧮',
              color: '#FF5733',
            },
          },
          {
            id: 'ruta-2',
            sector: {
              nombre: 'Matemáticas', // Duplicado
              icono: '🧮',
              color: '#FF5733',
            },
          },
          {
            id: 'ruta-3',
            sector: {
              nombre: 'Física',
              icono: '⚛️',
              color: '#33CFFF',
            },
          },
        ],
      } as any);

      const result = await service.findById('docente-123');

      expect(result.sectores).toHaveLength(2); // Solo únicos
      expect(result.sectores[0].nombre).toBe('Matemáticas');
      expect(result.sectores[1].nombre).toBe('Física');
    });

    it('should return empty sectores if no rutasEspecialidad', async () => {
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue({
        ...mockDocente,
        rutasEspecialidad: [],
      });

      const result = await service.findById('docente-123');

      expect(result.sectores).toEqual([]);
    });
  });

  describe('findByIds', () => {
    it('should return multiple docentes without password_hash', async () => {
      const mockDocente2 = {
        ...mockDocente,
        id: 'docente-456',
        email: 'maria@example.com',
        nombre: 'María',
      };

      jest
        .spyOn(prisma.docente, 'findMany')
        .mockResolvedValue([mockDocente, mockDocente2]);

      const result = await service.findByIds(['docente-123', 'docente-456']);

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password_hash');
      expect(result[1]).not.toHaveProperty('password_hash');
      expect(result[0].nombre).toBe('Juan');
      expect(result[1].nombre).toBe('María');
    });

    it('should return empty array if no docentes found', async () => {
      jest.spyOn(prisma.docente, 'findMany').mockResolvedValue([]);

      const result = await service.findByIds(['docente-999']);

      expect(result).toEqual([]);
    });

    it('should call prisma with correct where clause', async () => {
      jest.spyOn(prisma.docente, 'findMany').mockResolvedValue([]);

      await service.findByIds(['id1', 'id2', 'id3']);

      expect(prisma.docente.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['id1', 'id2', 'id3'],
          },
        },
      });
    });
  });
});
