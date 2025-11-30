import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EliminarCursoService } from '../eliminar-curso.service';
import { PrismaService } from '../../../../core/database/prisma.service';
import { EstadoCursoStudio } from '@prisma/client';

describe('EliminarCursoService', () => {
  let service: EliminarCursoService;
  let prisma: PrismaService;

  // Factory para crear curso mock
  const crearCursoMock = (
    overrides: {
      id?: string;
      estado?: EstadoCursoStudio;
      nombre?: string;
    } = {},
  ) => ({
    id: overrides.id ?? 'curso-1',
    estado: overrides.estado ?? EstadoCursoStudio.DRAFT,
    nombre: overrides.nombre ?? 'Curso de Prueba',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EliminarCursoService,
        {
          provide: PrismaService,
          useValue: {
            cursoStudio: {
              findUnique: jest.fn(),
              delete: jest.fn().mockResolvedValue({}),
            },
          },
        },
      ],
    }).compile();

    service = module.get<EliminarCursoService>(EliminarCursoService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('ejecutar', () => {
    describe('happy path', () => {
      it('debe eliminar curso en estado DRAFT exitosamente', async () => {
        // Arrange
        const cursoId = 'curso-draft';
        const cursoMock = crearCursoMock({
          id: cursoId,
          estado: EstadoCursoStudio.DRAFT,
          nombre: 'Curso Borrador',
        });

        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(cursoMock);

        // Act
        await service.ejecutar(cursoId);

        // Assert
        expect(prisma.cursoStudio.findUnique).toHaveBeenCalledWith({
          where: { id: cursoId },
          select: { id: true, estado: true, nombre: true },
        });
        expect(prisma.cursoStudio.delete).toHaveBeenCalledWith({
          where: { id: cursoId },
        });
      });

      it('debe no retornar nada (void) al eliminar exitosamente', async () => {
        // Arrange
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(crearCursoMock());

        // Act
        const result = await service.ejecutar('curso-1');

        // Assert
        expect(result).toBeUndefined();
      });
    });

    describe('error handling', () => {
      it('debe lanzar NotFoundException cuando el curso no existe', async () => {
        // Arrange
        const cursoId = 'curso-inexistente';
        jest.spyOn(prisma.cursoStudio, 'findUnique').mockResolvedValue(null);

        // Act & Assert
        await expect(service.ejecutar(cursoId)).rejects.toThrow(
          NotFoundException,
        );
        await expect(service.ejecutar(cursoId)).rejects.toThrow(
          `Curso con ID ${cursoId} no encontrado`,
        );
        expect(prisma.cursoStudio.delete).not.toHaveBeenCalled();
      });

      it('debe lanzar BadRequestException cuando el curso está EN_PROGRESO', async () => {
        // Arrange
        const cursoMock = crearCursoMock({
          id: 'curso-en-progreso',
          estado: EstadoCursoStudio.EN_PROGRESO,
          nombre: 'Curso en Desarrollo',
        });
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(cursoMock);

        // Act & Assert
        await expect(service.ejecutar('curso-en-progreso')).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.ejecutar('curso-en-progreso')).rejects.toThrow(
          'Solo se pueden eliminar cursos en estado DRAFT',
        );
        expect(prisma.cursoStudio.delete).not.toHaveBeenCalled();
      });

      it('debe lanzar BadRequestException cuando el curso está PUBLICADO', async () => {
        // Arrange
        const cursoMock = crearCursoMock({
          id: 'curso-publicado',
          estado: EstadoCursoStudio.PUBLICADO,
          nombre: 'Curso Público',
        });
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(cursoMock);

        // Act & Assert
        await expect(service.ejecutar('curso-publicado')).rejects.toThrow(
          BadRequestException,
        );
        expect(prisma.cursoStudio.delete).not.toHaveBeenCalled();
      });

      it('debe incluir el nombre del curso y estado actual en el mensaje de error', async () => {
        // Arrange
        const cursoMock = crearCursoMock({
          id: 'curso-x',
          estado: EstadoCursoStudio.EN_PROGRESO,
          nombre: 'Química de Harry Potter',
        });
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(cursoMock);

        // Act & Assert
        await expect(service.ejecutar('curso-x')).rejects.toThrow(
          'Solo se pueden eliminar cursos en estado DRAFT. El curso "Química de Harry Potter" está en estado EN_PROGRESO',
        );
      });
    });

    describe('flujo de verificación', () => {
      it('debe verificar existencia y estado antes de eliminar', async () => {
        // Arrange
        const findUniqueSpy = jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(crearCursoMock());
        const deleteSpy = jest.spyOn(prisma.cursoStudio, 'delete');

        // Act
        await service.ejecutar('curso-1');

        // Assert - verificar orden de llamadas
        expect(findUniqueSpy).toHaveBeenCalledTimes(1);
        expect(deleteSpy).toHaveBeenCalledTimes(1);
      });

      it('no debe llamar a delete si el curso no existe', async () => {
        // Arrange
        jest.spyOn(prisma.cursoStudio, 'findUnique').mockResolvedValue(null);

        // Act
        try {
          await service.ejecutar('curso-1');
        } catch {
          // esperado
        }

        // Assert
        expect(prisma.cursoStudio.delete).not.toHaveBeenCalled();
      });

      it('no debe llamar a delete si el curso no está en DRAFT', async () => {
        // Arrange
        jest
          .spyOn(prisma.cursoStudio, 'findUnique')
          .mockResolvedValue(
            crearCursoMock({ estado: EstadoCursoStudio.PUBLICADO }),
          );

        // Act
        try {
          await service.ejecutar('curso-1');
        } catch {
          // esperado
        }

        // Assert
        expect(prisma.cursoStudio.delete).not.toHaveBeenCalled();
      });
    });
  });
});
