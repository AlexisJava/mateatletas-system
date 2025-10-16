import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { ReservarClaseDto } from '../dto/reservar-clase.dto';

/**
 * Servicio especializado para gestión de reservas de clases
 * Extraído de ClasesService para separar responsabilidades
 */
@Injectable()
export class ClasesReservasService {
  private readonly logger = new Logger(ClasesReservasService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Reservar un cupo en una clase (Tutor reserva para su estudiante)
   */
  async reservarClase(claseId: string, tutorId: string, dto: ReservarClaseDto) {
    // 1. Verificar que la clase existe y está disponible
    const clase = await this.prisma.clase.findUnique({
      where: { id: claseId },
      include: {
        producto: true,
      },
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${claseId} no encontrada`);
    }

    if (clase.estado === 'Cancelada') {
      throw new BadRequestException('La clase está cancelada');
    }

    if (clase.fecha_hora_inicio <= new Date()) {
      throw new BadRequestException('La clase ya comenzó o pasó');
    }

    if (clase.cupos_ocupados >= clase.cupos_maximo) {
      throw new BadRequestException('La clase está llena');
    }

    // 2. Verificar que el estudiante pertenece al tutor
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: dto.estudianteId },
      include: {
        inscripciones_curso: {
          where: { estado: 'Activo' },
        },
      },
    });

    if (!estudiante) {
      throw new NotFoundException(
        `Estudiante con ID ${dto.estudianteId} no encontrado`,
      );
    }

    if (estudiante.tutor_id !== tutorId) {
      throw new ForbiddenException(
        'El estudiante no pertenece a este tutor',
      );
    }

    // 3. Si la clase es de un curso específico, verificar inscripción activa
    if (clase.producto_id) {
      const tieneInscripcion = estudiante.inscripciones_curso.some(
        (insc) => insc.producto_id === clase.producto_id,
      );

      if (!tieneInscripcion) {
        throw new BadRequestException(
          `El estudiante no está inscrito en el curso: ${clase.producto?.nombre}`,
        );
      }
    }

    // 4. Verificar que no esté ya inscrito
    const yaInscrito = await this.prisma.inscripcionClase.findUnique({
      where: {
        clase_id_estudiante_id: {
          clase_id: claseId,
          estudiante_id: dto.estudianteId,
        },
      },
    });

    if (yaInscrito) {
      throw new BadRequestException(
        'El estudiante ya está inscrito en esta clase',
      );
    }

    // 5. Crear la inscripción y actualizar cupos
    const inscripcion = await this.prisma.$transaction(async (tx) => {
      // Crear inscripción
      const nuevaInscripcion = await tx.inscripcionClase.create({
        data: {
          clase_id: claseId,
          estudiante_id: dto.estudianteId,
          tutor_id: tutorId,
          observaciones: dto.observaciones,
        },
        include: {
          estudiante: { select: { nombre: true, apellido: true } },
          clase: {
            include: {
              rutaCurricular: { select: { nombre: true } },
            },
          },
        },
      });

      // Incrementar cupos ocupados
      await tx.clase.update({
        where: { id: claseId },
        data: { cupos_ocupados: { increment: 1 } },
      });

      return nuevaInscripcion;
    });

    this.logger.log(
      `Inscripción creada: Estudiante ${dto.estudianteId} en clase ${claseId}`,
    );

    return inscripcion;
  }

  /**
   * Cancelar una reserva (Tutor cancela inscripción de su estudiante)
   */
  async cancelarReserva(inscripcionId: string, tutorId: string) {
    const inscripcion = await this.prisma.inscripcionClase.findUnique({
      where: { id: inscripcionId },
      include: {
        clase: true,
      },
    });

    if (!inscripcion) {
      throw new NotFoundException(
        `Inscripción con ID ${inscripcionId} no encontrada`,
      );
    }

    if (inscripcion.tutor_id !== tutorId) {
      throw new ForbiddenException(
        'No tienes permiso para cancelar esta inscripción',
      );
    }

    // Verificar que la clase aún no haya pasado
    if (inscripcion.clase.fecha_hora_inicio <= new Date()) {
      throw new BadRequestException(
        'No se puede cancelar una inscripción de una clase que ya comenzó',
      );
    }

    // Eliminar inscripción y decrementar cupos
    await this.prisma.$transaction(async (tx) => {
      await tx.inscripcionClase.delete({
        where: { id: inscripcionId },
      });

      await tx.clase.update({
        where: { id: inscripcion.clase_id },
        data: { cupos_ocupados: { decrement: 1 } },
      });
    });

    this.logger.log(`Inscripción ${inscripcionId} cancelada por tutor ${tutorId}`);

    return { message: 'Inscripción cancelada exitosamente' };
  }
}
