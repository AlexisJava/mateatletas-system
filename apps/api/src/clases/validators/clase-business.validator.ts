import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Clase, Estudiante } from '@prisma/client';

/**
 * Validador de reglas de negocio para el módulo de Clases
 *
 * Responsabilidad: Validaciones puras sin side effects
 * - Validaciones de existencia (BD)
 * - Validaciones de lógica de negocio
 * - Validaciones de autorización
 * - Validaciones de estado
 *
 * IMPORTANTE: No ejecuta operaciones de escritura
 */
@Injectable()
export class ClaseBusinessValidator {
  constructor(private prisma: PrismaService) {}

  /**
   * Validar que una ruta curricular existe
   * @throws NotFoundException si no existe
   */
  async validarRutaCurricularExiste(rutaCurricularId: string): Promise<void> {
    const ruta = await this.prisma.rutaCurricular.findUnique({
      where: { id: rutaCurricularId },
    });

    if (!ruta) {
      throw new NotFoundException(
        `Ruta curricular con ID ${rutaCurricularId} no encontrada`,
      );
    }
  }

  /**
   * Validar que un docente existe
   * @throws NotFoundException si no existe
   */
  async validarDocenteExiste(docenteId: string): Promise<void> {
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
    });

    if (!docente) {
      throw new NotFoundException(
        `Docente con ID ${docenteId} no encontrado`,
      );
    }
  }

  /**
   * Validar que un sector existe
   * @throws NotFoundException si no existe
   */
  async validarSectorExiste(sectorId: string): Promise<void> {
    const sector = await this.prisma.sector.findUnique({
      where: { id: sectorId },
    });

    if (!sector) {
      throw new NotFoundException(`Sector con ID ${sectorId} no encontrado`);
    }
  }

  /**
   * Validar que un producto existe y es de tipo Curso
   * @throws NotFoundException si no existe
   * @throws BadRequestException si no es de tipo Curso
   */
  async validarProductoEsCurso(productoId: string): Promise<void> {
    const producto = await this.prisma.producto.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      throw new NotFoundException(
        `Producto con ID ${productoId} no encontrado`,
      );
    }

    if (producto.tipo !== 'Curso') {
      throw new BadRequestException(
        'El producto asociado debe ser de tipo Curso',
      );
    }
  }

  /**
   * Validar que la fecha es futura
   * @throws BadRequestException si la fecha no es futura
   */
  validarFechaFutura(fecha: Date): void {
    const ahora = new Date();

    if (fecha <= ahora) {
      throw new BadRequestException('La fecha de inicio debe ser en el futuro');
    }
  }

  /**
   * Validar que la clase no está cancelada
   * @throws BadRequestException si ya está cancelada
   */
  validarClaseNoCancelada(clase: Clase): void {
    if (clase.estado === 'Cancelada') {
      throw new BadRequestException('La clase ya está cancelada');
    }
  }

  /**
   * Validar que la clase está activa (no cancelada)
   * @throws BadRequestException si está cancelada
   */
  validarClaseActiva(clase: Clase): void {
    if (clase.estado === 'Cancelada') {
      throw new BadRequestException(
        'No se pueden realizar operaciones en una clase cancelada',
      );
    }
  }

  /**
   * Validar permisos de cancelación según rol
   *
   * Reglas:
   * - Admin: Puede cancelar cualquier clase
   * - Docente: Solo puede cancelar SUS clases
   * - Tutor/Estudiante: NO pueden cancelar clases
   *
   * @throws ForbiddenException si no tiene permisos
   */
  validarPermisosCancelacion(
    clase: Clase,
    userId: string,
    userRole: string,
  ): void {
    if (userRole === 'admin') {
      // Admin puede cancelar cualquier clase
      return;
    }

    if (userRole === 'docente') {
      // Docente solo puede cancelar SUS clases
      if (clase.docente_id !== userId) {
        throw new ForbiddenException(
          'No tienes permiso para cancelar esta clase',
        );
      }
      return;
    }

    // Cualquier otro rol (tutor, estudiante) NO puede cancelar
    throw new ForbiddenException(
      'Solo admin y docentes pueden cancelar clases',
    );
  }

  /**
   * Validar que hay cupos disponibles
   * @throws BadRequestException si no hay cupos suficientes
   */
  validarCuposDisponibles(
    clase: Clase,
    cantidadEstudiantes: number,
  ): void {
    const cuposDisponibles = clase.cupos_maximo - clase.cupos_ocupados;

    if (cantidadEstudiantes > cuposDisponibles) {
      throw new BadRequestException(
        `No hay suficientes cupos disponibles. Cupos disponibles: ${cuposDisponibles}, intentando asignar: ${cantidadEstudiantes}`,
      );
    }
  }

  /**
   * Validar que todos los estudiantes existen
   * @returns Lista de estudiantes encontrados
   * @throws BadRequestException si algún estudiante no existe
   */
  async validarEstudiantesExisten(
    estudianteIds: string[],
  ): Promise<Estudiante[]> {
    const estudiantes = await this.prisma.estudiante.findMany({
      where: {
        id: { in: estudianteIds },
      },
      include: {
        tutor: true,
      },
    });

    if (estudiantes.length !== estudianteIds.length) {
      throw new BadRequestException(
        'Uno o más estudiantes no fueron encontrados',
      );
    }

    return estudiantes;
  }

  /**
   * Validar que los estudiantes no están ya inscritos en la clase
   * @throws BadRequestException si algún estudiante ya está inscrito
   */
  validarEstudiantesNoInscritos(
    clase: Clase & { inscripciones: { estudiante_id: string }[] },
    estudianteIds: string[],
  ): void {
    const estudiantesYaInscritos = clase.inscripciones
      .map((i) => i.estudiante_id)
      .filter((id) => estudianteIds.includes(id));

    if (estudiantesYaInscritos.length > 0) {
      throw new BadRequestException(
        `Los siguientes estudiantes ya están inscritos: ${estudiantesYaInscritos.join(', ')}`,
      );
    }
  }
}
