import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * Validador de reglas de negocio para el módulo Docentes
 *
 * Implementa validaciones reutilizables siguiendo el patrón CQRS.
 * Todas las validaciones lanzan excepciones específicas con mensajes claros.
 *
 * @example
 * await validator.validarDocenteExiste('docente-123');
 * await validator.validarEmailUnico('juan@example.com');
 */
@Injectable()
export class DocenteBusinessValidator {
  constructor(private prisma: PrismaService) {}

  /**
   * Valida que un docente existe en la base de datos
   * @param id - ID del docente
   * @throws NotFoundException si el docente no existe
   */
  async validarDocenteExiste(id: string): Promise<void> {
    const docente = await this.prisma.docente.findUnique({
      where: { id },
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }
  }

  /**
   * Valida que un email no está en uso por otro docente
   * @param email - Email a validar
   * @param excludeId - ID del docente a excluir (para updates)
   * @throws ConflictException si el email ya está en uso
   */
  async validarEmailUnico(email: string, excludeId?: string): Promise<void> {
    const existingDocente = await this.prisma.docente.findUnique({
      where: { email },
    });

    if (existingDocente && existingDocente.id !== excludeId) {
      throw new ConflictException('El email ya está registrado');
    }
  }

  /**
   * Valida que un docente tiene clases asignadas
   * @param docenteId - ID del docente
   * @returns Cantidad de clases asignadas
   * @throws ConflictException si el docente tiene clases asignadas
   */
  async validarDocenteTieneClases(docenteId: string): Promise<number> {
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
      include: {
        _count: {
          select: {
            clases: true,
          },
        },
      },
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    const clasesCount = docente._count.clases;

    if (clasesCount > 0) {
      throw new ConflictException(
        `No se puede eliminar el docente porque tiene ${clasesCount} clase(s) asignada(s). ` +
          `Debe reasignar las clases a otro docente antes de eliminar.`,
      );
    }

    return clasesCount;
  }

  /**
   * Valida que una reasignación de clases es válida
   * - Verifica que ambos docentes existen
   * - Verifica que no son el mismo docente
   * @param fromDocenteId - ID del docente origen
   * @param toDocenteId - ID del docente destino
   * @throws NotFoundException si algún docente no existe
   * @throws ConflictException si son el mismo docente
   */
  async validarReasignacionValida(
    fromDocenteId: string,
    toDocenteId: string,
  ): Promise<void> {
    if (fromDocenteId === toDocenteId) {
      throw new ConflictException(
        'No se puede reasignar clases al mismo docente',
      );
    }

    const [fromDocente, toDocente] = await Promise.all([
      this.prisma.docente.findUnique({
        where: { id: fromDocenteId },
      }),
      this.prisma.docente.findUnique({
        where: { id: toDocenteId },
      }),
    ]);

    if (!fromDocente) {
      throw new NotFoundException('Docente origen no encontrado');
    }

    if (!toDocente) {
      throw new NotFoundException('Docente destino no encontrado');
    }
  }

  /**
   * Valida que una contraseña cumple con los requisitos de seguridad
   * - Mínimo 8 caracteres
   * - Al menos una letra mayúscula
   * - Al menos una letra minúscula
   * - Al menos un número
   * @param password - Contraseña a validar
   * @throws ConflictException si la contraseña no cumple los requisitos
   */
  validarPasswordSegura(password: string): void {
    if (password.length < 8) {
      throw new ConflictException(
        'La contraseña debe tener al menos 8 caracteres',
      );
    }

    if (!/[A-Z]/.test(password)) {
      throw new ConflictException(
        'La contraseña debe contener al menos una letra mayúscula',
      );
    }

    if (!/[a-z]/.test(password)) {
      throw new ConflictException(
        'La contraseña debe contener al menos una letra minúscula',
      );
    }

    if (!/[0-9]/.test(password)) {
      throw new ConflictException(
        'La contraseña debe contener al menos un número',
      );
    }
  }
}
