import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import {
  TipoObservacion,
  PrioridadObservacion,
  EstadoObservacion,
  TipoAutorSeguimiento,
  Prisma,
} from '@prisma/client';
import { CreateObservacionDto } from './dto/create-observacion.dto';
import { CreateSeguimientoDto } from './dto/create-seguimiento.dto';
import { FiltrarObservacionesDto } from './dto/filtrar-observaciones.dto';
import { AuthUser } from '../auth/interfaces';
import { Role } from '../auth/decorators/roles.decorator';

/**
 * Transiciones de estado válidas
 * RN-021: Diagrama de estados
 */
const TRANSICIONES_VALIDAS: Record<EstadoObservacion, EstadoObservacion[]> = {
  [EstadoObservacion.Abierta]: [
    EstadoObservacion.EnSeguimiento,
    EstadoObservacion.Resuelta,
  ],
  [EstadoObservacion.EnSeguimiento]: [
    EstadoObservacion.Resuelta,
    EstadoObservacion.Abierta,
  ],
  [EstadoObservacion.Resuelta]: [
    EstadoObservacion.Cerrada,
    EstadoObservacion.EnSeguimiento,
  ],
  [EstadoObservacion.Cerrada]: [], // Terminal - RN-023
};

/**
 * Helper para determinar si el usuario es Admin o Pedagogía
 */
function esAdminOPedagogia(user: AuthUser): boolean {
  return user.roles?.includes(Role.ADMIN) || user.role === Role.ADMIN;
}

/**
 * ObservacionesService
 *
 * Implementa el sistema de observaciones docente con las siguientes características:
 * - Solo docentes pueden crear observaciones de sus estudiantes
 * - Observaciones grupales (múltiples estudiantes)
 * - Seguimientos inmutables (no se editan, solo se agregan)
 * - NO DELETE - las observaciones son inmutables para análisis de datos
 * - Ciclo de estados: Abierta → EnSeguimiento → Resuelta → Cerrada
 */
@Injectable()
export class ObservacionesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear una nueva observación
   *
   * Reglas implementadas:
   * - RN-001: Solo DOCENTE puede crear
   * - RN-002: Debe incluir al menos 1 estudiante
   * - RN-003: fecha_evento no puede ser futura
   * - RN-004: contenido mínimo 10 caracteres, máximo 2000
   * - RN-005: Si prioridad=Urgente, auto-setear notificar_admin=true
   * - RN-006: Si tipo=Incidente, auto-setear requiere_seguimiento=true
   * - RN-007: Si comision_id presente, validar que docente pertenece
   * - RN-008: Docente solo puede crear observaciones de estudiantes en sus comisiones
   */
  async crear(dto: CreateObservacionDto, docenteId: string) {
    // Validaciones sincrónicas (sin DB)
    this.validateBasicFields(dto);
    const fechaEvento = this.parseFechaEvento(dto.fechaEvento);

    // Validaciones async (con DB)
    await this.validateDocenteEstudiantesAccess(dto, docenteId);

    // Crear la observación
    return this.createObservacionRecord(dto, docenteId, fechaEvento);
  }

  /**
   * Valida campos básicos del DTO (RN-002, RN-004)
   */
  private validateBasicFields(dto: CreateObservacionDto): void {
    if (!dto.estudianteIds || dto.estudianteIds.length === 0) {
      throw new BadRequestException('Debe incluir al menos un estudiante');
    }

    if (dto.contenido.length < 10) {
      throw new BadRequestException(
        'Contenido debe tener al menos 10 caracteres',
      );
    }
    if (dto.contenido.length > 2000) {
      throw new BadRequestException(
        'Contenido no puede exceder 2000 caracteres',
      );
    }
  }

  /**
   * Parsea y valida la fecha del evento (RN-003)
   */
  private parseFechaEvento(fechaEvento: string): Date {
    const parts = fechaEvento.split('-').map(Number);
    const year = parts[0] ?? 0;
    const month = parts[1] ?? 1;
    const day = parts[2] ?? 1;
    const fechaEventoDate = new Date(year, month - 1, day);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    if (fechaEventoDate >= manana) {
      throw new BadRequestException('Fecha del evento no puede ser futura');
    }

    return fechaEventoDate;
  }

  /**
   * Valida acceso del docente a los estudiantes (RN-007, RN-008)
   */
  private async validateDocenteEstudiantesAccess(
    dto: CreateObservacionDto,
    docenteId: string,
  ): Promise<void> {
    if (dto.comisionId) {
      await this.validateEstudiantesEnComision(dto, docenteId);
    } else {
      await this.validateEstudiantesEnComisionesDocente(dto, docenteId);
    }
  }

  /**
   * Valida estudiantes cuando se especifica comisión (RN-007, RN-008)
   */
  private async validateEstudiantesEnComision(
    dto: CreateObservacionDto,
    docenteId: string,
  ): Promise<void> {
    const comision = await this.prisma.comision.findFirst({
      where: { id: dto.comisionId, docente_id: docenteId },
    });

    if (!comision) {
      throw new ForbiddenException(
        'No tienes acceso a esta comisión o no existe',
      );
    }

    const inscripciones = await this.prisma.inscripcionComision.findMany({
      where: {
        comision_id: dto.comisionId,
        estudiante_id: { in: dto.estudianteIds },
      },
    });

    if (inscripciones.length !== dto.estudianteIds.length) {
      throw new ForbiddenException(
        'Uno o más estudiantes no están inscritos en la comisión especificada',
      );
    }
  }

  /**
   * Valida estudiantes sin comisión específica (RN-008)
   */
  private async validateEstudiantesEnComisionesDocente(
    dto: CreateObservacionDto,
    docenteId: string,
  ): Promise<void> {
    const comisionesDocente = await this.prisma.comision.findMany({
      where: { docente_id: docenteId },
      select: { id: true },
    });

    const comisionIds = comisionesDocente.map((c) => c.id);

    const inscripciones = await this.prisma.inscripcionComision.findMany({
      where: {
        comision_id: { in: comisionIds },
        estudiante_id: { in: dto.estudianteIds },
      },
    });

    const estudiantesInscritos = [
      ...new Set(inscripciones.map((i) => i.estudiante_id)),
    ];

    if (estudiantesInscritos.length !== dto.estudianteIds.length) {
      throw new ForbiddenException(
        'Uno o más estudiantes no están en ninguna de tus comisiones',
      );
    }
  }

  /**
   * Crea el registro de observación en la DB
   */
  private async createObservacionRecord(
    dto: CreateObservacionDto,
    docenteId: string,
    fechaEvento: Date,
  ) {
    // RN-005: Auto-setear notificar_admin si prioridad es Urgente
    const notificarAdmin =
      dto.prioridad === PrioridadObservacion.Urgente
        ? true
        : (dto.notificarAdmin ?? false);

    // RN-006: Auto-setear requiere_seguimiento si tipo es Incidente
    const requiereSeguimiento =
      dto.tipo === TipoObservacion.Incidente
        ? true
        : (dto.requiereSeguimiento ?? false);

    return this.prisma.observacion.create({
      data: {
        docente_id: docenteId,
        comision_id: dto.comisionId || null,
        contenido: dto.contenido,
        fecha_evento: fechaEvento,
        tipo: dto.tipo,
        prioridad: dto.prioridad ?? PrioridadObservacion.Baja,
        requiere_seguimiento: requiereSeguimiento,
        notificar_admin: notificarAdmin,
        notificar_pedagogia: dto.notificarPedagogia ?? false,
        estado: EstadoObservacion.Abierta,
        estudiantes: {
          create: dto.estudianteIds.map((estudianteId) => ({
            estudiante_id: estudianteId,
          })),
        },
      },
      include: {
        estudiantes: {
          include: {
            estudiante: {
              select: { id: true, nombre: true, apellido: true },
            },
          },
        },
        docente: {
          select: { id: true, nombre: true, apellido: true },
        },
        seguimientos: true,
      },
    });
  }

  /**
   * Agregar seguimiento a una observación
   *
   * Reglas implementadas:
   * - RN-010: Solo autor original, ADMIN o PEDAGOGIA pueden agregar seguimiento
   * - RN-011: Agregar seguimiento cambia estado a EnSeguimiento si estaba Abierta
   * - RN-012: No se puede agregar seguimiento a observación Cerrada
   * - RN-013: contenido mínimo 5 caracteres
   */
  async agregarSeguimiento(
    observacionId: string,
    dto: CreateSeguimientoDto,
    user: AuthUser,
  ) {
    // Buscar la observación
    const observacion = await this.prisma.observacion.findUnique({
      where: { id: observacionId },
    });

    if (!observacion) {
      throw new NotFoundException('Observación no encontrada');
    }

    // RN-012: No se puede agregar seguimiento a observación Cerrada
    if (observacion.estado === EstadoObservacion.Cerrada) {
      throw new BadRequestException(
        'No se puede agregar seguimiento a una observación cerrada',
      );
    }

    // RN-010: Validar permisos - docente solo su observación, admin cualquiera
    const esAdmin = esAdminOPedagogia(user);
    if (!esAdmin && observacion.docente_id !== user.id) {
      throw new ForbiddenException(
        'Solo el autor de la observación puede agregar seguimiento',
      );
    }

    // RN-013: Validar longitud de contenido
    if (dto.contenido.length < 5) {
      throw new BadRequestException(
        'El seguimiento debe tener al menos 5 caracteres',
      );
    }

    // Determinar tipo de autor
    const autorTipo = esAdmin
      ? TipoAutorSeguimiento.Admin
      : TipoAutorSeguimiento.Docente;

    // Crear el seguimiento
    await this.prisma.seguimientoObservacion.create({
      data: {
        observacion_id: observacionId,
        autor_id: user.id,
        autor_tipo: autorTipo,
        contenido: dto.contenido,
      },
    });

    // RN-011: Cambiar estado a EnSeguimiento si estaba Abierta o Resuelta
    if (
      observacion.estado === EstadoObservacion.Abierta ||
      observacion.estado === EstadoObservacion.Resuelta
    ) {
      await this.prisma.observacion.update({
        where: { id: observacionId },
        data: { estado: EstadoObservacion.EnSeguimiento },
      });
    }

    // Retornar observación actualizada
    return this.prisma.observacion.findUnique({
      where: { id: observacionId },
      include: {
        estudiantes: {
          include: {
            estudiante: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
        seguimientos: {
          orderBy: { created_at: 'desc' },
        },
      },
    });
  }

  /**
   * Cambiar estado de una observación
   *
   * Reglas implementadas:
   * - RN-020: Solo autor, ADMIN o PEDAGOGIA pueden cambiar estado
   * - RN-021: Transiciones válidas según diagrama de estados
   * - RN-023: Estado Cerrada es terminal, no se puede reabrir
   */
  async cambiarEstado(
    observacionId: string,
    nuevoEstado: EstadoObservacion,
    user: AuthUser,
  ) {
    // Buscar la observación
    const observacion = await this.prisma.observacion.findUnique({
      where: { id: observacionId },
    });

    if (!observacion) {
      throw new NotFoundException('Observación no encontrada');
    }

    // RN-020: Validar permisos
    const esAdmin = esAdminOPedagogia(user);
    if (!esAdmin && observacion.docente_id !== user.id) {
      throw new ForbiddenException(
        'Solo el autor de la observación puede cambiar su estado',
      );
    }

    // RN-023: Estado Cerrada es terminal
    if (observacion.estado === EstadoObservacion.Cerrada) {
      throw new BadRequestException(
        'No se puede cambiar el estado de una observación cerrada',
      );
    }

    // RN-021: Validar transición
    const transicionesPermitidas = TRANSICIONES_VALIDAS[observacion.estado];
    if (!transicionesPermitidas.includes(nuevoEstado)) {
      throw new BadRequestException(
        `No se puede cambiar de ${observacion.estado} a ${nuevoEstado}`,
      );
    }

    // Preparar datos de actualización
    const updateData: { estado: EstadoObservacion; fecha_resolucion?: Date } = {
      estado: nuevoEstado,
    };

    // Si se marca como Resuelta, registrar timestamp
    if (nuevoEstado === EstadoObservacion.Resuelta) {
      updateData.fecha_resolucion = new Date();
    }

    // Actualizar el estado
    const observacionActualizada = await this.prisma.observacion.update({
      where: { id: observacionId },
      data: updateData,
      include: {
        estudiantes: {
          include: {
            estudiante: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
        seguimientos: true,
      },
    });

    return observacionActualizada;
  }

  /**
   * Listar observaciones con filtros y paginación
   *
   * Reglas implementadas:
   * - RN-040: Docente solo ve sus propias observaciones
   * - RN-041: ADMIN y PEDAGOGIA ven todas las observaciones
   * - RN-042: Por defecto, ordenar por created_at DESC
   * - RN-043: Filtros disponibles
   */
  async listar(
    filtros: FiltrarObservacionesDto,
    user: AuthUser,
  ): Promise<{
    data: Prisma.ObservacionGetPayload<{
      include: {
        estudiantes: {
          include: {
            estudiante: { select: { id: true; nombre: true; apellido: true } };
          };
        };
        docente: { select: { id: true; nombre: true; apellido: true } };
        _count: { select: { seguimientos: true } };
      };
    }>[];
    total: number;
    limit: number;
    offset: number;
  }> {
    // Construir where clause
    const where: Prisma.ObservacionWhereInput = {};

    // RN-040: Docente solo ve sus propias observaciones
    if (!esAdminOPedagogia(user)) {
      where.docente_id = user.id;
    }

    // Por defecto, excluir cerradas a menos que se filtren explícitamente
    if (filtros.estado) {
      where.estado = filtros.estado;
    } else {
      where.estado = { not: EstadoObservacion.Cerrada };
    }

    // Filtros opcionales
    if (filtros.tipo) {
      where.tipo = filtros.tipo;
    }

    if (filtros.prioridad) {
      where.prioridad = filtros.prioridad;
    }

    if (filtros.comisionId) {
      where.comision_id = filtros.comisionId;
    }

    if (filtros.estudianteId) {
      where.estudiantes = {
        some: { estudiante_id: filtros.estudianteId },
      };
    }

    if (filtros.requiereSeguimiento !== undefined) {
      where.requiere_seguimiento = filtros.requiereSeguimiento;
    }

    // Filtro de fecha
    if (filtros.fechaDesde || filtros.fechaHasta) {
      where.fecha_evento = {};
      if (filtros.fechaDesde) {
        where.fecha_evento.gte = new Date(filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        where.fecha_evento.lte = new Date(filtros.fechaHasta);
      }
    }

    // Paginación
    const limit = filtros.limit ?? 20;
    const offset = filtros.offset ?? 0;

    // Ejecutar queries en paralelo
    const [data, total] = await Promise.all([
      this.prisma.observacion.findMany({
        where,
        include: {
          estudiantes: {
            include: {
              estudiante: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                },
              },
            },
          },
          docente: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
          _count: {
            select: { seguimientos: true },
          },
        },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.observacion.count({ where }),
    ]);

    return {
      data,
      total,
      limit,
      offset,
    };
  }

  /**
   * Obtener una observación por ID con todos sus detalles
   *
   * Reglas implementadas:
   * - RN-040: Docente solo ve sus propias observaciones
   * - RN-041: ADMIN ve todas
   */
  async obtenerPorId(observacionId: string, user: AuthUser) {
    const observacion = await this.prisma.observacion.findUnique({
      where: { id: observacionId },
      include: {
        estudiantes: {
          include: {
            estudiante: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        seguimientos: {
          orderBy: { created_at: 'desc' },
        },
        comision: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!observacion) {
      throw new NotFoundException('Observación no encontrada');
    }

    // RN-040: Docente solo ve sus propias observaciones
    if (!esAdminOPedagogia(user) && observacion.docente_id !== user.id) {
      throw new ForbiddenException('No tienes acceso a esta observación');
    }

    return observacion;
  }

  /**
   * Obtener observaciones pendientes de seguimiento
   * Útil para el dashboard del docente
   */
  async obtenerPendientes(user: AuthUser) {
    const where: Prisma.ObservacionWhereInput = {
      requiere_seguimiento: true,
      estado: { not: EstadoObservacion.Cerrada },
    };

    if (!esAdminOPedagogia(user)) {
      where.docente_id = user.id;
    }

    const data = await this.prisma.observacion.findMany({
      where,
      include: {
        estudiantes: {
          include: {
            estudiante: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
      },
      orderBy: [{ prioridad: 'desc' }, { created_at: 'desc' }],
    });

    return { data, total: data.length };
  }

  /**
   * Obtener observaciones de un estudiante específico
   */
  async obtenerPorEstudiante(estudianteId: string, user: AuthUser) {
    const where: Prisma.ObservacionWhereInput = {
      estudiantes: {
        some: { estudiante_id: estudianteId },
      },
    };

    if (!esAdminOPedagogia(user)) {
      where.docente_id = user.id;
    }

    const data = await this.prisma.observacion.findMany({
      where,
      include: {
        seguimientos: {
          orderBy: { created_at: 'desc' },
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return { data, total: data.length };
  }
}
