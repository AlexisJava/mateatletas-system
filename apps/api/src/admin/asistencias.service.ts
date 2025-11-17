import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { EstadoAsistencia } from '@prisma/client';
import {
  RegistrarAsistenciasDto,
  ActualizarAsistenciaDto,
  FiltrosHistorialAsistenciasDto,
} from './dto/asistencias.dto';

@Injectable()
export class AsistenciasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registrar asistencias para una fecha específica de un ClaseGrupo
   */
  async registrarAsistencias(
    claseGrupoId: string,
    dto: RegistrarAsistenciasDto,
  ) {
    // Verificar que el grupo existe
    const grupo = await this.prisma.claseGrupo.findUnique({
      where: { id: claseGrupoId },
      include: {
        inscripciones: true,
      },
    });

    if (!grupo) {
      throw new NotFoundException(
        `No se encontró el grupo con ID ${claseGrupoId}`,
      );
    }

    // Validar que todos los estudiantes estén inscritos
    const estudiantesInscritos = grupo.inscripciones.map(
      (i) => i.estudiante_id,
    );
    const estudiantesNoInscritos = dto.asistencias.filter(
      (a) => !estudiantesInscritos.includes(a.estudianteId),
    );

    if (estudiantesNoInscritos.length > 0) {
      throw new BadRequestException(
        'Algunos estudiantes no están inscritos en este horario',
      );
    }

    const fecha = new Date(dto.fecha);

    // Crear o actualizar las asistencias en transacción
    const asistencias = await Promise.all(
      dto.asistencias.map(async (asistencia) => {
        // Buscar si ya existe asistencia para esta combinación
        const existente = await this.prisma.asistenciaClaseGrupo.findFirst({
          where: {
            clase_grupo_id: claseGrupoId,
            estudiante_id: asistencia.estudianteId,
            fecha: fecha,
          },
        });

        if (existente) {
          // Actualizar existente
          return this.prisma.asistenciaClaseGrupo.update({
            where: { id: existente.id },
            data: {
              estado: asistencia.estado,
              observaciones: asistencia.observaciones,
              feedback: asistencia.feedback,
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
          // Crear nuevo
          return this.prisma.asistenciaClaseGrupo.create({
            data: {
              clase_grupo_id: claseGrupoId,
              estudiante_id: asistencia.estudianteId,
              fecha: fecha,
              estado: asistencia.estado,
              observaciones: asistencia.observaciones,
              feedback: asistencia.feedback,
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
      }),
    );

    return {
      success: true,
      data: asistencias,
      message: `Asistencias registradas exitosamente para ${asistencias.length} estudiante(s)`,
    };
  }

  /**
   * Obtener asistencias de un ClaseGrupo para una fecha específica
   */
  async obtenerAsistenciasPorFecha(claseGrupoId: string, fecha: string) {
    const fechaDate = new Date(fecha);

    const asistencias = await this.prisma.asistenciaClaseGrupo.findMany({
      where: {
        clase_grupo_id: claseGrupoId,
        fecha: fechaDate,
      },
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            edad: true,
            nivelEscolar: true,
          },
        },
      },
      orderBy: {
        estudiante: {
          apellido: 'asc',
        },
      },
    });

    return {
      success: true,
      data: asistencias,
      total: asistencias.length,
    };
  }

  /**
   * Obtener historial de asistencias de un ClaseGrupo
   */
  async obtenerHistorialAsistencias(
    claseGrupoId: string,
    filtros?: FiltrosHistorialAsistenciasDto,
  ) {
    const where: {
      clase_grupo_id: string;
      fecha?: { gte?: Date; lte?: Date };
      estudiante_id?: string;
    } = {
      clase_grupo_id: claseGrupoId,
    };

    if (filtros?.fechaDesde || filtros?.fechaHasta) {
      where.fecha = {};
      if (filtros.fechaDesde) {
        where.fecha.gte = new Date(filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        where.fecha.lte = new Date(filtros.fechaHasta);
      }
    }

    if (filtros?.estudianteId) {
      where.estudiante_id = filtros.estudianteId;
    }

    const asistencias = await this.prisma.asistenciaClaseGrupo.findMany({
      where,
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: [{ fecha: 'desc' }, { estudiante: { apellido: 'asc' } }],
    });

    // Agrupar por fecha
    const porFecha = asistencias.reduce(
      (acc: Record<string, typeof asistencias>, asistencia) => {
        const fecha = asistencia.fecha.toISOString().split('T')[0];
        if (!acc[fecha]) {
          acc[fecha] = [];
        }
        acc[fecha].push(asistencia);
        return acc;
      },
      {},
    );

    return {
      success: true,
      data: {
        asistencias,
        por_fecha: porFecha,
      },
      total: asistencias.length,
    };
  }

  /**
   * Actualizar una asistencia individual
   */
  async actualizarAsistencia(
    asistenciaId: string,
    dto: ActualizarAsistenciaDto,
  ) {
    const asistencia = await this.prisma.asistenciaClaseGrupo.findUnique({
      where: { id: asistenciaId },
    });

    if (!asistencia) {
      throw new NotFoundException(
        `No se encontró la asistencia con ID ${asistenciaId}`,
      );
    }

    const actualizada = await this.prisma.asistenciaClaseGrupo.update({
      where: { id: asistenciaId },
      data: {
        estado: dto.estado,
        observaciones: dto.observaciones,
        feedback: dto.feedback,
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

    return {
      success: true,
      data: actualizada,
      message: 'Asistencia actualizada exitosamente',
    };
  }

  /**
   * Obtener estadísticas de asistencia de un estudiante en un ClaseGrupo
   */
  async obtenerEstadisticasEstudiante(
    claseGrupoId: string,
    estudianteId: string,
  ) {
    const asistencias = await this.prisma.asistenciaClaseGrupo.findMany({
      where: {
        clase_grupo_id: claseGrupoId,
        estudiante_id: estudianteId,
      },
    });

    const total = asistencias.length;
    const presentes = asistencias.filter(
      (a) => a.estado === EstadoAsistencia.Presente,
    ).length;
    const ausentes = asistencias.filter(
      (a) => a.estado === EstadoAsistencia.Ausente,
    ).length;
    const justificados = asistencias.filter(
      (a) => a.estado === EstadoAsistencia.Justificado,
    ).length;

    const porcentajeAsistencia = total > 0 ? (presentes / total) * 100 : 0;

    return {
      success: true,
      data: {
        total_clases: total,
        presentes,
        ausentes,
        justificados,
        porcentaje_asistencia: Math.round(porcentajeAsistencia * 100) / 100,
      },
    };
  }
}
