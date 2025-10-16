import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { RegistrarAsistenciaDto } from '../dto/registrar-asistencia.dto';

/**
 * Servicio especializado para gestión de asistencia de clases
 * Extraído de ClasesService para separar responsabilidades
 */
@Injectable()
export class ClasesAsistenciaService {
  private readonly logger = new Logger(ClasesAsistenciaService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Registrar asistencia (Docente registra después de la clase)
   */
  async registrarAsistencia(
    claseId: string,
    docenteId: string,
    dto: RegistrarAsistenciaDto,
  ) {
    // 1. Verificar que la clase existe y pertenece al docente
    const clase = await this.prisma.clase.findUnique({
      where: { id: claseId },
      include: {
        inscripciones: {
          select: { estudiante_id: true },
        },
      },
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${claseId} no encontrada`);
    }

    if (clase.docente_id !== docenteId) {
      throw new ForbiddenException(
        'No tienes permiso para registrar asistencia de esta clase',
      );
    }

    // 2. Verificar que todos los estudiantes estén inscritos en la clase
    const estudiantesInscritos = new Set(
      clase.inscripciones.map((i) => i.estudiante_id),
    );

    for (const asistencia of dto.asistencias) {
      if (!estudiantesInscritos.has(asistencia.estudianteId)) {
        throw new BadRequestException(
          `El estudiante ${asistencia.estudianteId} no está inscrito en esta clase`,
        );
      }
    }

    // 3. Registrar asistencias (upsert para permitir actualizaciones)
    const resultados = await Promise.all(
      dto.asistencias.map(async (asistencia) => {
        return this.prisma.asistencia.upsert({
          where: {
            clase_id_estudiante_id: {
              clase_id: claseId,
              estudiante_id: asistencia.estudianteId,
            },
          },
          update: {
            estado: asistencia.estado,
            observaciones: asistencia.observaciones,
            puntos_otorgados: asistencia.puntosOtorgados || 0,
            fecha_registro: new Date(),
          },
          create: {
            clase_id: claseId,
            estudiante_id: asistencia.estudianteId,
            estado: asistencia.estado,
            observaciones: asistencia.observaciones,
            puntos_otorgados: asistencia.puntosOtorgados || 0,
          },
          include: {
            estudiante: {
              select: { nombre: true, apellido: true },
            },
          },
        });
      }),
    );

    this.logger.log(
      `Asistencia registrada para clase ${claseId}: ${resultados.length} estudiantes`,
    );

    return resultados;
  }
}
