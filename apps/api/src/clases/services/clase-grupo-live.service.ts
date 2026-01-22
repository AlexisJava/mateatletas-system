import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { EstadoClase } from '@prisma/client';

/**
 * Respuesta de operaciones de clase en vivo
 */
interface ClaseEnVivoResponse {
  id: string;
  nombre: string;
  estadoClase: EstadoClase;
  iniciadaEn: Date | null;
  finalizadaEn: Date | null;
  livekitRoomName: string | null;
}

interface IniciarClaseResponse extends ClaseEnVivoResponse {
  mensaje: string;
}

interface FinalizarClaseResponse extends ClaseEnVivoResponse {
  mensaje: string;
  duracionMinutos: number;
}

/**
 * Servicio para gestionar el estado de clases en vivo (LiveKit)
 *
 * Responsabilidades:
 * - Iniciar clase (cambiar estado a EnVivo)
 * - Finalizar clase (cambiar estado a Finalizada)
 * - Validar permisos del docente
 * - Generar nombre de sala LiveKit
 */
@Injectable()
export class ClaseGrupoLiveService {
  private readonly logger = new Logger(ClaseGrupoLiveService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Iniciar una clase en vivo
   *
   * @param claseGrupoId - ID del grupo de clase
   * @param docenteId - ID del docente que inicia la clase
   * @returns Datos actualizados de la clase
   * @throws NotFoundException si el grupo no existe
   * @throws ForbiddenException si el docente no es titular
   * @throws BadRequestException si la clase ya está en vivo o finalizada
   */
  async iniciarClase(
    claseGrupoId: string,
    docenteId: string,
  ): Promise<IniciarClaseResponse> {
    // 1. Obtener el grupo y validar existencia
    const claseGrupo = await this.prisma.claseGrupo.findUnique({
      where: { id: claseGrupoId },
      select: {
        id: true,
        nombre: true,
        docenteId: true,
        estadoClase: true,
        activo: true,
        livekitRoomName: true,
      },
    });

    if (!claseGrupo) {
      throw new NotFoundException(
        `Grupo de clase con ID "${claseGrupoId}" no encontrado`,
      );
    }

    // 2. Validar que el docente es el titular
    if (claseGrupo.docenteId !== docenteId) {
      throw new ForbiddenException(
        'Solo el docente titular puede iniciar esta clase',
      );
    }

    // 3. Validar que el grupo está activo
    if (!claseGrupo.activo) {
      throw new BadRequestException('Este grupo de clase no está activo');
    }

    // 4. Validar estado actual
    if (claseGrupo.estadoClase === 'EnVivo') {
      throw new BadRequestException('La clase ya está en vivo');
    }

    if (claseGrupo.estadoClase === 'Finalizada') {
      throw new BadRequestException(
        'La clase ya ha finalizado. Debe reiniciarse desde el panel de administración.',
      );
    }

    if (claseGrupo.estadoClase === 'Cancelada') {
      throw new BadRequestException(
        'La clase está cancelada. Debe reactivarse desde el panel de administración.',
      );
    }

    // 5. Generar nombre de sala si no existe
    const livekitRoomName =
      claseGrupo.livekitRoomName || `clase-grupo-${claseGrupoId}`;

    // 6. Actualizar estado a EnVivo
    const updated = await this.prisma.claseGrupo.update({
      where: { id: claseGrupoId },
      data: {
        estadoClase: 'EnVivo',
        iniciadaEn: new Date(),
        finalizadaEn: null, // Limpiar por si se reinicia
        livekitRoomName: livekitRoomName,
      },
      select: {
        id: true,
        nombre: true,
        estadoClase: true,
        iniciadaEn: true,
        finalizadaEn: true,
        livekitRoomName: true,
      },
    });

    this.logger.log(
      `Clase iniciada: ${updated.nombre} (${claseGrupoId}) por docente ${docenteId}`,
    );

    return {
      ...updated,
      mensaje: 'Clase iniciada exitosamente',
    };
  }

  /**
   * Finalizar una clase en vivo
   *
   * @param claseGrupoId - ID del grupo de clase
   * @param docenteId - ID del docente que finaliza la clase
   * @returns Datos actualizados de la clase con duración
   * @throws NotFoundException si el grupo no existe
   * @throws ForbiddenException si el docente no es titular
   * @throws BadRequestException si la clase no está en vivo
   */
  async finalizarClase(
    claseGrupoId: string,
    docenteId: string,
  ): Promise<FinalizarClaseResponse> {
    // 1. Obtener el grupo y validar existencia
    const claseGrupo = await this.prisma.claseGrupo.findUnique({
      where: { id: claseGrupoId },
      select: {
        id: true,
        nombre: true,
        docenteId: true,
        estadoClase: true,
        iniciadaEn: true,
        livekitRoomName: true,
      },
    });

    if (!claseGrupo) {
      throw new NotFoundException(
        `Grupo de clase con ID "${claseGrupoId}" no encontrado`,
      );
    }

    // 2. Validar que el docente es el titular
    if (claseGrupo.docenteId !== docenteId) {
      throw new ForbiddenException(
        'Solo el docente titular puede finalizar esta clase',
      );
    }

    // 3. Validar que la clase está en vivo
    if (claseGrupo.estadoClase !== 'EnVivo') {
      throw new BadRequestException(
        `La clase no está en vivo. Estado actual: ${claseGrupo.estadoClase}`,
      );
    }

    // 4. Calcular duración
    const finalizadaEn = new Date();
    let duracionMinutos = 0;

    if (claseGrupo.iniciadaEn) {
      const duracionMs =
        finalizadaEn.getTime() - claseGrupo.iniciadaEn.getTime();
      duracionMinutos = Math.round(duracionMs / (1000 * 60));
    }

    // 5. Actualizar estado a Finalizada
    const updated = await this.prisma.claseGrupo.update({
      where: { id: claseGrupoId },
      data: {
        estadoClase: 'Finalizada',
        finalizadaEn: finalizadaEn,
      },
      select: {
        id: true,
        nombre: true,
        estadoClase: true,
        iniciadaEn: true,
        finalizadaEn: true,
        livekitRoomName: true,
      },
    });

    this.logger.log(
      `Clase finalizada: ${updated.nombre} (${claseGrupoId}) - Duración: ${duracionMinutos} min`,
    );

    return {
      ...updated,
      mensaje: 'Clase finalizada exitosamente',
      duracionMinutos: duracionMinutos,
    };
  }

  /**
   * Obtener estado actual de una clase
   *
   * @param claseGrupoId - ID del grupo de clase
   * @returns Estado actual de la clase
   */
  async obtenerEstadoClase(claseGrupoId: string): Promise<ClaseEnVivoResponse> {
    const claseGrupo = await this.prisma.claseGrupo.findUnique({
      where: { id: claseGrupoId },
      select: {
        id: true,
        nombre: true,
        estadoClase: true,
        iniciadaEn: true,
        finalizadaEn: true,
        livekitRoomName: true,
      },
    });

    if (!claseGrupo) {
      throw new NotFoundException(
        `Grupo de clase con ID "${claseGrupoId}" no encontrado`,
      );
    }

    return claseGrupo;
  }

  /**
   * Reiniciar estado de clase a Programada (solo admin)
   * Útil para reprogramar clases finalizadas o canceladas
   *
   * @param claseGrupoId - ID del grupo de clase
   * @returns Datos actualizados de la clase
   */
  async reiniciarEstadoClase(
    claseGrupoId: string,
  ): Promise<ClaseEnVivoResponse> {
    const claseGrupo = await this.prisma.claseGrupo.findUnique({
      where: { id: claseGrupoId },
      select: { id: true },
    });

    if (!claseGrupo) {
      throw new NotFoundException(
        `Grupo de clase con ID "${claseGrupoId}" no encontrado`,
      );
    }

    const updated = await this.prisma.claseGrupo.update({
      where: { id: claseGrupoId },
      data: {
        estadoClase: 'Programada',
        iniciadaEn: null,
        finalizadaEn: null,
      },
      select: {
        id: true,
        nombre: true,
        estadoClase: true,
        iniciadaEn: true,
        finalizadaEn: true,
        livekitRoomName: true,
      },
    });

    this.logger.log(
      `Estado de clase reiniciado: ${updated.nombre} (${claseGrupoId})`,
    );

    return updated;
  }
}
