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
              nivelEscolar: true,
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

  /**
   * Tomar asistencia de múltiples estudiantes en un ClaseGrupo (batch)
   * Usado en el modo "Clase en Vivo" del portal docente
   * Crea o actualiza registros de asistencia usando transacción
   */
  async tomarAsistenciaClaseGrupoBatch(
    clase_grupo_id: string,
    fecha: string,
    asistencias: Array<{
      estudiante_id: string;
      estado: import('@prisma/client').EstadoAsistencia;
      observaciones?: string;
    }>,
    docente_id: string,
  ): Promise<{
    success: boolean;
    registrosCreados: number;
    registrosActualizados: number;
    estudiantes: Array<{
      estudiante_id: string;
      nombre: string;
      apellido: string;
      estado: import('@prisma/client').EstadoAsistencia;
      observaciones: string | null;
    }>;
    mensaje: string;
  }> {
    // 1. Verificar que el ClaseGrupo existe y el docente es el titular
    const claseGrupo = await this.prisma.claseGrupo.findUnique({
      where: { id: clase_grupo_id },
    });

    if (!claseGrupo) {
      throw new NotFoundException('Grupo de clase no encontrado');
    }

    if (claseGrupo.docente_id !== docente_id) {
      throw new ForbiddenException(
        'Solo el docente titular puede tomar asistencia de este grupo',
      );
    }

    // 2. Verificar que todos los estudiantes están inscritos en el grupo
    const estudiantesIds = asistencias.map((a) => a.estudiante_id);
    const inscripciones = await this.prisma.inscripcionClaseGrupo.findMany({
      where: {
        clase_grupo_id,
        estudiante_id: { in: estudiantesIds },
        fecha_baja: null, // Solo inscritos activos
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

    if (inscripciones.length !== estudiantesIds.length) {
      const inscritosIds = inscripciones.map((i) => i.estudiante_id);
      const noInscritos = estudiantesIds.filter(
        (id) => !inscritosIds.includes(id),
      );
      throw new BadRequestException(
        `Los siguientes estudiantes no están inscritos en el grupo: ${noInscritos.join(', ')}`,
      );
    }

    // 3. Usar transacción para crear/actualizar registros de asistencia
    let registrosCreados = 0;
    let registrosActualizados = 0;

    const fechaISO = new Date(fecha);

    const resultados = await this.prisma.$transaction(
      asistencias.map((asistencia) => {
        return this.prisma.asistenciaClaseGrupo.upsert({
          where: {
            clase_grupo_id_estudiante_id_fecha: {
              clase_grupo_id,
              estudiante_id: asistencia.estudiante_id,
              fecha: fechaISO,
            },
          },
          create: {
            clase_grupo_id,
            estudiante_id: asistencia.estudiante_id,
            fecha: fechaISO,
            estado: asistencia.estado,
            observaciones: asistencia.observaciones || null,
          },
          update: {
            estado: asistencia.estado,
            observaciones: asistencia.observaciones || null,
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
      }),
    );

    // Contar cuántos fueron creados vs actualizados
    // (Prisma no nos dice directamente, así que revisamos si existían antes)
    const existentes = await this.prisma.asistenciaClaseGrupo.findMany({
      where: {
        clase_grupo_id,
        estudiante_id: { in: estudiantesIds },
        fecha: fechaISO,
        createdAt: { lt: new Date(Date.now() - 1000) }, // Creados hace más de 1 segundo
      },
    });

    registrosActualizados = existentes.length;
    registrosCreados = asistencias.length - registrosActualizados;

    // 4. Formatear response
    const estudiantesResponse = resultados.map((r) => ({
      estudiante_id: r.estudiante.id,
      nombre: r.estudiante.nombre,
      apellido: r.estudiante.apellido,
      estado: r.estado,
      observaciones: r.observaciones,
    }));

    return {
      success: true,
      registrosCreados,
      registrosActualizados,
      estudiantes: estudiantesResponse,
      mensaje: `Asistencia guardada exitosamente para ${asistencias.length} estudiantes`,
    };
  }
}
