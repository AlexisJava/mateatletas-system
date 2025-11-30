import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import { EstadoCursoStudio } from '../../interfaces';

/**
 * Servicio para eliminar cursos
 * Responsabilidad única: Eliminar un curso (solo si está en DRAFT)
 */
@Injectable()
export class EliminarCursoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Elimina un curso y todos sus datos relacionados
   * Solo se puede eliminar cursos en estado DRAFT
   * @param cursoId ID del curso a eliminar
   */
  async ejecutar(cursoId: string): Promise<void> {
    const curso = await this.prisma.cursoStudio.findUnique({
      where: { id: cursoId },
      select: { id: true, estado: true, nombre: true },
    });

    if (!curso) {
      throw new NotFoundException(`Curso con ID ${cursoId} no encontrado`);
    }

    if (curso.estado !== EstadoCursoStudio.DRAFT) {
      throw new BadRequestException(
        `Solo se pueden eliminar cursos en estado DRAFT. El curso "${curso.nombre}" está en estado ${curso.estado}`,
      );
    }

    // Eliminar en cascada (semanas y recursos se eliminan automáticamente por onDelete: Cascade)
    await this.prisma.cursoStudio.delete({
      where: { id: cursoId },
    });
  }
}
