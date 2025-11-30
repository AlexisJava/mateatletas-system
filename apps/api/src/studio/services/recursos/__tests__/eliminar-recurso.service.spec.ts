import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EliminarRecursoService } from '../eliminar-recurso.service';
import { PrismaService } from '../../../../core/database/prisma.service';

describe('EliminarRecursoService', () => {
  let service: EliminarRecursoService;
  let prisma: jest.Mocked<PrismaService>;

  // Factory para crear recursos de prueba
  const crearRecursoMock = (
    overrides: Partial<{
      id: string;
      curso_id: string;
      tipo: string;
      nombre: string;
      archivo: string;
      tamanio_bytes: number;
      created_at: Date;
      updated_at: Date;
    }> = {},
  ) => ({
    id: 'recurso-123',
    curso_id: 'curso-456',
    tipo: 'IMAGEN',
    nombre: 'imagen-test.png',
    archivo: '/uploads/cursos/curso-456/imagenes/imagen-test.png',
    tamanio_bytes: 1024,
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01'),
    ...overrides,
  });

  beforeEach(async () => {
    const mockPrisma = {
      recursoStudio: {
        findUnique: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EliminarRecursoService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EliminarRecursoService>(EliminarRecursoService);
    prisma = module.get(PrismaService);
  });

  describe('ejecutar', () => {
    const RECURSO_ID = 'recurso-existente-123';

    it('debe eliminar un recurso existente correctamente', async () => {
      // Arrange
      const recursoExistente = crearRecursoMock({ id: RECURSO_ID });
      prisma.recursoStudio.findUnique.mockResolvedValue(recursoExistente);
      prisma.recursoStudio.delete.mockResolvedValue(recursoExistente);

      // Act
      const resultado = await service.ejecutar(RECURSO_ID);

      // Assert
      expect(resultado).toBeUndefined();
      expect(prisma.recursoStudio.delete).toHaveBeenCalledTimes(1);
    });

    it('debe lanzar NotFoundException cuando el recurso no existe', async () => {
      // Arrange
      const recursoIdInexistente = 'recurso-inexistente-999';
      prisma.recursoStudio.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.ejecutar(recursoIdInexistente)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.ejecutar(recursoIdInexistente)).rejects.toThrow(
        `Recurso con ID ${recursoIdInexistente} no encontrado`,
      );
    });

    it('debe buscar el recurso por ID correcto', async () => {
      // Arrange
      const recursoExistente = crearRecursoMock({ id: RECURSO_ID });
      prisma.recursoStudio.findUnique.mockResolvedValue(recursoExistente);
      prisma.recursoStudio.delete.mockResolvedValue(recursoExistente);

      // Act
      await service.ejecutar(RECURSO_ID);

      // Assert
      expect(prisma.recursoStudio.findUnique).toHaveBeenCalledWith({
        where: { id: RECURSO_ID },
      });
    });

    it('debe eliminar el recurso con el ID correcto', async () => {
      // Arrange
      const recursoExistente = crearRecursoMock({ id: RECURSO_ID });
      prisma.recursoStudio.findUnique.mockResolvedValue(recursoExistente);
      prisma.recursoStudio.delete.mockResolvedValue(recursoExistente);

      // Act
      await service.ejecutar(RECURSO_ID);

      // Assert
      expect(prisma.recursoStudio.delete).toHaveBeenCalledWith({
        where: { id: RECURSO_ID },
      });
    });
  });

  describe('eliminarTodosDeCurso', () => {
    const CURSO_ID = 'curso-con-recursos-456';

    it('debe eliminar múltiples recursos y retornar el count', async () => {
      // Arrange
      const cantidadEliminada = 5;
      prisma.recursoStudio.deleteMany.mockResolvedValue({
        count: cantidadEliminada,
      });

      // Act
      const resultado = await service.eliminarTodosDeCurso(CURSO_ID);

      // Assert
      expect(resultado).toBe(cantidadEliminada);
    });

    it('debe retornar 0 cuando el curso no tiene recursos', async () => {
      // Arrange
      const cursoSinRecursos = 'curso-vacio-789';
      prisma.recursoStudio.deleteMany.mockResolvedValue({ count: 0 });

      // Act
      const resultado = await service.eliminarTodosDeCurso(cursoSinRecursos);

      // Assert
      expect(resultado).toBe(0);
    });

    it('debe filtrar por curso_id correcto', async () => {
      // Arrange
      prisma.recursoStudio.deleteMany.mockResolvedValue({ count: 3 });

      // Act
      await service.eliminarTodosDeCurso(CURSO_ID);

      // Assert
      expect(prisma.recursoStudio.deleteMany).toHaveBeenCalledWith({
        where: { curso_id: CURSO_ID },
      });
    });
  });
});
