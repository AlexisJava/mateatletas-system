import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CrearClaseDto } from '../dto/crear-clase.dto';
import { NotificacionesService } from '../../notificaciones/notificaciones.service';
import { ClaseBusinessValidator } from '../validators/clase-business.validator';

/**
 * Servicio especializado para comandos (escritura) de clases
 *
 * Responsabilidad: Solo operaciones de escritura
 * - Crear clases
 * - Cancelar clases
 * - Eliminar clases
 * - Asignar estudiantes a clases
 *
 * IMPORTANTE: Usa ClaseBusinessValidator para todas las validaciones
 */
@Injectable()
export class ClaseCommandService {
  private readonly logger = new Logger(ClaseCommandService.name);

  constructor(
    private prisma: PrismaService,
    private validator: ClaseBusinessValidator,
    private notificacionesService: NotificacionesService,
  ) {}

  /**
   * Programar una nueva clase (solo Admin)
   */
  async programarClase(dto: CrearClaseDto) {
    // 1. Validaciones de existencia
    await this.validator.validarDocenteExiste(dto.docenteId);

    if (dto.sectorId) {
      await this.validator.validarSectorExiste(dto.sectorId);
    }

    if (dto.productoId) {
      await this.validator.validarProductoEsCurso(dto.productoId);
    }

    // 2. Validar que la fecha sea futura
    const fechaInicio = new Date(dto.fechaHoraInicio);
    this.validator.validarFechaFutura(fechaInicio);

    // 3. Crear la clase
    const clase = await this.prisma.clase.create({
      data: {
        nombre: dto.nombre,
        docente_id: dto.docenteId,
        sector_id: dto.sectorId || null,
        fecha_hora_inicio: fechaInicio,
        duracion_minutos: dto.duracionMinutos,
        cupos_maximo: dto.cuposMaximo,
        cupos_ocupados: 0,
        descripcion: dto.descripcion ?? null,
        estado: 'Programada',
        producto_id: dto.productoId ?? null,
      },
      include: {
        docente: { select: { nombre: true, apellido: true } },
        producto: {
          select: { nombre: true, tipo: true },
        },
      },
    });

    this.logger.log(`Clase programada: ${clase.id}`);
    return clase;
  }

  /**
   * Cancelar una clase programada
   *
   * RESILIENCIA: Usa Promise.allSettled para notificaciones
   * - Operación principal (cancelar) SIEMPRE funciona
   * - Notificaciones son best-effort (si fallan, no rompen la cancelación)
   *
   * ⚠️ SECURITY: Requiere autenticación y autorización estricta
   * - Admin: Puede cancelar cualquier clase
   * - Docente: Solo puede cancelar SUS clases
   * - Tutor/Estudiante: NO pueden cancelar clases
   */
  async cancelarClase(id: string, userId: string, userRole: string) {
    const clase = await this.prisma.clase.findUnique({
      where: { id },
      include: {
        inscripciones: true,
      },
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${id} no encontrada`);
    }

    // Validaciones de negocio
    this.validator.validarClaseNoCancelada(clase);
    this.validator.validarPermisosCancelacion(clase, userId, userRole);

    // RESILIENCIA: Usar Promise.allSettled para operaciones críticas + secundarias
    // Operación 1 (CRÍTICA): Cancelar clase - DEBE siempre funcionar
    // Operación 2 (SECUNDARIA): Notificar docente - Best effort, si falla no rompe la cancelación
    const [cancelResult, notificacionResult] = await Promise.allSettled([
      // Operación principal: Cancelar clase
      this.prisma.clase.update({
        where: { id },
        data: {
          estado: 'Cancelada',
          cupos_ocupados: 0, // Liberar todos los cupos
        },
        include: {
          docente: { select: { nombre: true, apellido: true } },
        },
      }),

      // Operación secundaria: Notificar al docente
      this.notificacionesService.notificarClaseCancelada(
        clase.docente_id,
        id,
        `${clase.nombre || 'Clase'} - ${clase.fecha_hora_inicio.toLocaleDateString()}`,
      ),
    ]);

    // Verificar resultado de operación principal
    if (cancelResult.status === 'rejected') {
      this.logger.error(`Error al cancelar clase ${id}:`, cancelResult.reason);
      throw cancelResult.reason;
    }

    const claseActualizada = cancelResult.value;

    // Log de notificación (no crítico si falla)
    if (notificacionResult.status === 'rejected') {
      const reason = notificacionResult.reason as Error;
      this.logger.warn(
        `⚠️ Clase ${id} cancelada exitosamente, pero falló notificación al docente:`,
        reason.message,
      );
    } else {
      this.logger.log(
        `✅ Notificación enviada al docente sobre cancelación de clase ${id}`,
      );
    }

    this.logger.warn(
      `Clase ${id} cancelada. ${clase.inscripciones.length} inscripciones afectadas`,
    );

    return claseActualizada;
  }

  /**
   * Eliminar una clase permanentemente (Solo Admin)
   * @param id - ID de la clase a eliminar
   * @returns Mensaje de confirmación
   */
  async eliminarClase(id: string) {
    // Verificar que la clase existe
    const clase = await this.prisma.clase.findUnique({
      where: { id },
      include: {
        inscripciones: true,
        _count: {
          select: { inscripciones: true },
        },
      },
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${id} no encontrada`);
    }

    // Eliminar la clase (las inscripciones se eliminarán en cascada si está configurado en Prisma)
    await this.prisma.clase.delete({
      where: { id },
    });

    this.logger.log(
      `Clase ${id} eliminada permanentemente. ${clase._count.inscripciones} inscripciones eliminadas`,
    );

    return {
      message: 'Clase eliminada exitosamente',
      claseId: id,
      inscripcionesEliminadas: clase._count.inscripciones,
    };
  }

  /**
   * Asignar estudiantes a una clase (solo Admin)
   * POST /api/clases/:id/asignar-estudiantes
   *
   * Este endpoint permite al admin inscribir estudiantes directamente a una clase
   * sin necesidad de que el tutor haga la reserva.
   *
   * @param claseId - ID de la clase
   * @param estudianteIds - Array de IDs de estudiantes a asignar
   * @returns Clase actualizada con inscripciones
   */
  async asignarEstudiantesAClase(claseId: string, estudianteIds: string[]) {
    // 1. Verificar que la clase existe
    const clase = await this.prisma.clase.findUnique({
      where: { id: claseId },
      include: {
        inscripciones: true,
      },
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${claseId} no encontrada`);
    }

    // 2. Validaciones de negocio
    this.validator.validarClaseActiva(clase);
    this.validator.validarCuposDisponibles(clase, estudianteIds.length);

    // 3. Validar que todos los estudiantes existen
    const estudiantes =
      await this.validator.validarEstudiantesExisten(estudianteIds);

    // 4. Validar que los estudiantes no estén ya inscritos
    this.validator.validarEstudiantesNoInscritos(clase, estudianteIds);

    // 5. Crear las inscripciones en una transacción
    const inscripcionesCreadas = await this.prisma.$transaction(
      async (prisma) => {
        // Crear todas las inscripciones
        const inscripciones = await Promise.all(
          estudiantes.map((estudiante) =>
            prisma.inscripcionClase.create({
              data: {
                clase_id: claseId,
                estudiante_id: estudiante.id,
                tutor_id: estudiante.tutor_id,
                observaciones: 'Asignado por administrador',
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
            }),
          ),
        );

        // Actualizar cupos ocupados
        await prisma.clase.update({
          where: { id: claseId },
          data: {
            cupos_ocupados: clase.cupos_ocupados + estudianteIds.length,
          },
        });

        return inscripciones;
      },
    );

    this.logger.log(
      `Admin asignó ${estudianteIds.length} estudiantes a clase ${claseId}`,
    );

    return {
      message: `${estudianteIds.length} estudiante(s) asignado(s) exitosamente`,
      inscripciones: inscripcionesCreadas,
    };
  }
}
