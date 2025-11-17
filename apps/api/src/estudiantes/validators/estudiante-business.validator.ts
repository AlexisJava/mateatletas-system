import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { esEdadValida, getMensajeErrorEdad } from '../../domain/constants';

/**
 * Validator para reglas de negocio de estudiantes
 *
 * Responsabilidad: Validaciones de negocio que requieren consultas a BD
 * NO confundir con class-validator (validaciones de estructura de DTOs)
 *
 * Ejemplos de validaciones de negocio:
 * - El tutor existe
 * - El equipo existe
 * - La edad es válida para el sistema
 * - El estudiante pertenece al tutor (ownership)
 */
@Injectable()
export class EstudianteBusinessValidator {
  constructor(private prisma: PrismaService) {}

  /**
   * Valida que un tutor existe en la base de datos
   * @throws NotFoundException si el tutor no existe
   */
  async validateTutorExists(tutorId: string): Promise<void> {
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor no encontrado');
    }
  }

  /**
   * Valida que un equipo existe en la base de datos
   * @throws NotFoundException si el equipo no existe
   */
  async validateEquipoExists(equipoId: string): Promise<void> {
    const equipo = await this.prisma.equipo.findUnique({
      where: { id: equipoId },
    });

    if (!equipo) {
      throw new NotFoundException('Equipo no encontrado');
    }
  }

  /**
   * Valida que la edad está en el rango permitido
   * @throws BadRequestException si la edad es inválida
   */
  validateEdad(edad: number): void {
    if (!esEdadValida(edad)) {
      throw new BadRequestException(getMensajeErrorEdad());
    }
  }

  /**
   * Valida que un estudiante pertenece a un tutor (ownership)
   * @throws NotFoundException si el estudiante no existe
   * @throws BadRequestException si el estudiante no pertenece al tutor
   */
  async validateOwnership(
    estudianteId: string,
    tutorId: string,
  ): Promise<void> {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      select: { id: true, tutor_id: true },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (estudiante.tutor_id !== tutorId) {
      throw new BadRequestException(
        'Este estudiante no pertenece al tutor especificado',
      );
    }
  }

  /**
   * Valida que un estudiante existe
   * @throws NotFoundException si el estudiante no existe
   */
  async validateEstudianteExists(estudianteId: string): Promise<void> {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      select: { id: true },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }
  }

  /**
   * Valida que una clase existe
   * @throws NotFoundException si la clase no existe
   */
  async validateClaseExists(claseId: string): Promise<void> {
    const clase = await this.prisma.clase.findUnique({
      where: { id: claseId },
      select: { id: true },
    });

    if (!clase) {
      throw new NotFoundException('Clase no encontrada');
    }
  }

  /**
   * Valida que un sector existe
   * @throws NotFoundException si el sector no existe
   */
  async validateSectorExists(sectorId: string): Promise<void> {
    const sector = await this.prisma.sector.findUnique({
      where: { id: sectorId },
      select: { id: true },
    });

    if (!sector) {
      throw new NotFoundException('Sector no encontrado');
    }
  }
}
