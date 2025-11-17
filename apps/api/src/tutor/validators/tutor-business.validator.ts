import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * TutorBusinessValidator
 *
 * Validaciones de reglas de negocio para el módulo Tutor.
 * Centraliza la lógica de validación para evitar duplicación.
 *
 * Responsabilidades:
 * - Validar existencia de tutor
 * - Validar que el tutor tenga estudiantes
 * - Validar parámetros de entrada
 */
@Injectable()
export class TutorBusinessValidator {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida que un tutor exista en la base de datos
   *
   * @param tutorId - ID del tutor a validar
   * @throws NotFoundException si el tutor no existe
   */
  async validarTutorExiste(tutorId: string): Promise<void> {
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
      select: { id: true },
    });

    if (!tutor) {
      throw new NotFoundException(`Tutor con ID ${tutorId} no encontrado`);
    }
  }

  /**
   * Valida que un tutor tenga al menos un estudiante (hijo) registrado
   *
   * @param tutorId - ID del tutor a validar
   * @throws NotFoundException si el tutor no tiene estudiantes
   */
  async validarTutorTieneEstudiantes(tutorId: string): Promise<void> {
    const count = await this.prisma.estudiante.count({
      where: { tutor_id: tutorId },
    });

    if (count === 0) {
      throw new NotFoundException(
        'El tutor no tiene estudiantes registrados',
      );
    }
  }

  /**
   * Valida el parámetro 'limit' para obtener próximas clases
   *
   * @param limit - Cantidad de clases solicitadas
   * @throws BadRequestException si el límite está fuera del rango permitido
   */
  validarLimitProximasClases(limit: number): void {
    if (limit < 1 || limit > 50) {
      throw new BadRequestException(
        'El parámetro "limit" debe estar entre 1 y 50',
      );
    }
  }
}
