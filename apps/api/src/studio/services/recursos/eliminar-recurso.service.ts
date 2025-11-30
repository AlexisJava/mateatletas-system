import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Servicio para eliminar recursos
 * Responsabilidad única: Eliminar recursos del sistema
 */
@Injectable()
export class EliminarRecursoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Elimina un recurso
   * @param recursoId ID del recurso a eliminar
   */
  async ejecutar(recursoId: string): Promise<void> {
    const recurso = await this.prisma.recursoStudio.findUnique({
      where: { id: recursoId },
    });

    if (!recurso) {
      throw new NotFoundException(`Recurso con ID ${recursoId} no encontrado`);
    }

    // TODO: Eliminar archivo físico en producción
    // await this.eliminarArchivo(recurso.archivo);

    // Eliminar registro de base de datos
    await this.prisma.recursoStudio.delete({
      where: { id: recursoId },
    });
  }

  /**
   * Elimina todos los recursos de un curso
   * Útil para limpieza
   * @param cursoId ID del curso
   */
  async eliminarTodosDeCurso(cursoId: string): Promise<number> {
    // TODO: Eliminar archivos físicos

    const result = await this.prisma.recursoStudio.deleteMany({
      where: { curso_id: cursoId },
    });

    return result.count;
  }

  /**
   * Elimina el archivo del sistema de archivos
   * TODO: Reemplazar por servicio de storage en producción
   */
  private async eliminarArchivo(rutaRelativa: string): Promise<void> {
    const rutaCompleta = path.join(process.cwd(), rutaRelativa);

    try {
      await fs.unlink(rutaCompleta);
    } catch {
      // Ignorar si el archivo no existe
    }
  }
}
