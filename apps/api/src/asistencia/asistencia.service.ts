import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { MarcarAsistenciaDto } from './dto/marcar-asistencia.dto';

/**
 * Service responsible for core attendance CRUD operations
 * Handles marking attendance and retrieving attendance lists
 */
@Injectable()
export class AsistenciaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Mark or update student attendance
   * Can be used by teachers or for student self-registration
   */
  async marcarAsistencia(
    claseId: string,
    estudianteId: string,
    dto: MarcarAsistenciaDto,
    docenteId: string | null,
  ) {
    // 1. Verify that class exists and teacher is the owner (if applicable)
    const clase = await this.prisma.clase.findUnique({
      where: { id: claseId },
    });

    if (!clase) {
      throw new NotFoundException('Clase no encontrada');
    }

    // Only validate teacher if docenteId is present (not for self-registration)
    if (docenteId !== null && clase.docente_id !== docenteId) {
      throw new ForbiddenException(
        'Solo el docente titular puede marcar asistencia',
      );
    }

    // 2. Verify that student is enrolled in the class
    const inscripcion = await this.prisma.inscripcionClase.findFirst({
      where: {
        clase_id: claseId,
        estudiante_id: estudianteId,
      },
    });

    if (!inscripcion) {
      throw new BadRequestException(
        'El estudiante no está inscrito en esta clase',
      );
    }

    // 3. Check if attendance record already exists
    const asistenciaExistente = await this.prisma.asistencia.findFirst({
      where: {
        clase_id: claseId,
        estudiante_id: estudianteId,
      },
    });

    // 4. Create or update attendance record
    let asistencia;
    if (asistenciaExistente) {
      asistencia = await this.prisma.asistencia.update({
        where: { id: asistenciaExistente.id },
        data: {
          estado: dto.estado,
          observaciones: dto.observaciones,
          puntos_otorgados: dto.puntos_otorgados || 0,
        },
        include: {
          estudiante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
        },
      });
    } else {
      asistencia = await this.prisma.asistencia.create({
        data: {
          clase_id: claseId,
          estudiante_id: estudianteId,
          estado: dto.estado,
          observaciones: dto.observaciones,
          puntos_otorgados: dto.puntos_otorgados || 0,
        },
        include: {
          estudiante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
        },
      });
    }

    return {
      id: asistencia.id,
      estudiante: asistencia.estudiante,
      estado: asistencia.estado,
      observaciones: asistencia.observaciones,
      puntos_otorgados: asistencia.puntos_otorgados,
      fecha_registro: asistencia.createdAt,
    };
  }

  /**
   * Get attendance list for a class
   * Returns roster with all enrolled students and their attendance status
   */
  async obtenerAsistenciaClase(claseId: string, docenteId?: string) {
    // If teacher, verify they are the class owner
    if (docenteId) {
      const clase = await this.prisma.clase.findUnique({
        where: { id: claseId },
      });

      if (!clase) {
        throw new NotFoundException('Clase no encontrada');
      }

      if (clase.docente_id !== docenteId) {
        throw new ForbiddenException(
          'Solo el docente titular puede ver la asistencia',
        );
      }
    }

    // Optimized: Single query using Promise.all + include relationships
    const [inscripciones, asistencias] = await Promise.all([
      this.prisma.inscripcionClase.findMany({
        where: { clase_id: claseId },
        include: {
          estudiante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              nivel_escolar: true,
            },
          },
        },
      }),
      this.prisma.asistencia.findMany({
        where: { clase_id: claseId },
      }),
    ]);

    // Create a map of attendance by student_id
    const asistenciaMap = new Map(asistencias.map((a) => [a.estudiante_id, a]));

    // Count states
    let totalPresentes = 0;
    let totalAusentes = 0;
    let totalJustificados = 0;

    const lista = inscripciones.map((insc) => {
      const asistencia = asistenciaMap.get(insc.estudiante_id);

      if (asistencia) {
        if (asistencia.estado === 'Presente') totalPresentes++;
        if (asistencia.estado === 'Ausente') totalAusentes++;
        if (asistencia.estado === 'Justificado') totalJustificados++;
      }

      return {
        inscripcion_id: insc.id,
        estudiante: insc.estudiante,
        estado_asistencia: asistencia?.estado || 'Pendiente',
        observaciones: asistencia?.observaciones || null,
        puntos_otorgados: asistencia?.puntos_otorgados || 0,
        asistencia_id: asistencia?.id || null,
      };
    });

    return {
      clase: {
        id: claseId,
      },
      total_inscritos: inscripciones.length,
      total_presentes: totalPresentes,
      total_ausentes: totalAusentes,
      total_justificados: totalJustificados,
      lista,
    };
  }
}
