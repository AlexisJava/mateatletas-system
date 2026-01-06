import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../core/database/prisma.service';
import { UserLoggedInEvent } from '../../common/events';

/**
 * InscripcionesListener - Escucha eventos de login para gestionar inscripciones
 *
 * Responsabilidades:
 * - Auto-confirmar inscripciones pendientes cuando el estudiante inicia sesión
 *
 * ARQUITECTURA:
 * - Usa Event-Driven Architecture para evitar dependencias circulares
 * - No depende de AuthModule directamente
 * - Escucha el evento 'estudiante.logged-in' emitido por EstudianteAuthService
 */
@Injectable()
export class InscripcionesListener {
  private readonly logger = new Logger(InscripcionesListener.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cuando un estudiante inicia sesión, confirmar inscripciones pendientes
   *
   * Flujo:
   * 1. Admin inscribe estudiante a comisión → estado: Pendiente
   * 2. Estudiante inicia sesión → este listener se ejecuta
   * 3. Inscripciones pendientes → Confirmadas
   */
  @OnEvent('estudiante.logged-in')
  async handleEstudianteLoggedIn(event: UserLoggedInEvent): Promise<void> {
    // Solo procesar eventos de estudiantes
    if (event.userType !== 'estudiante') return;

    const estudianteId = event.userId;

    // Buscar inscripciones pendientes activas (dentro de fechas)
    const hoy = new Date();
    const inscripcionesPendientes =
      await this.prisma.inscripcionComision.findMany({
        where: {
          estudiante_id: estudianteId,
          estado: 'Pendiente',
          comision: {
            activo: true,
            OR: [{ fecha_fin: null }, { fecha_fin: { gte: hoy } }],
          },
        },
        include: {
          comision: {
            select: { nombre: true },
          },
        },
      });

    if (inscripcionesPendientes.length === 0) return;

    // Confirmar todas las inscripciones pendientes
    const ids = inscripcionesPendientes.map((i) => i.id);
    await this.prisma.inscripcionComision.updateMany({
      where: { id: { in: ids } },
      data: { estado: 'Confirmada' },
    });

    const nombres = inscripcionesPendientes
      .map((i) => i.comision.nombre)
      .join(', ');
    this.logger.log(
      `Auto-confirmadas ${inscripcionesPendientes.length} inscripciones para estudiante ${estudianteId}: ${nombres}`,
    );
  }
}
