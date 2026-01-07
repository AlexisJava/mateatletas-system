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
 * Respuesta de operaciones de comisión en vivo
 */
interface ComisionEnVivoResponse {
  id: string;
  nombre: string;
  estado_clase: EstadoClase;
  iniciada_en: Date | null;
  finalizada_en: Date | null;
  livekit_room_name: string | null;
}

interface IniciarComisionResponse extends ComisionEnVivoResponse {
  mensaje: string;
}

interface FinalizarComisionResponse extends ComisionEnVivoResponse {
  mensaje: string;
  duracion_minutos: number;
}

/**
 * Servicio para gestionar el estado de comisiones en vivo (LiveKit)
 *
 * Responsabilidades:
 * - Iniciar clase en comisión (cambiar estado a EnVivo)
 * - Finalizar clase en comisión (cambiar estado a Finalizada)
 * - Validar permisos del docente
 * - Generar nombre de sala LiveKit
 */
@Injectable()
export class ComisionLiveService {
  private readonly logger = new Logger(ComisionLiveService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Iniciar una clase en vivo de comisión
   *
   * @param comisionId - ID de la comisión
   * @param docenteId - ID del docente que inicia la clase
   * @returns Datos actualizados de la comisión
   * @throws NotFoundException si la comisión no existe
   * @throws ForbiddenException si el docente no es el asignado
   * @throws BadRequestException si la clase ya está en vivo o finalizada
   */
  async iniciarClase(
    comisionId: string,
    docenteId: string,
  ): Promise<IniciarComisionResponse> {
    // 1. Obtener la comisión y validar existencia
    const comision = await this.prisma.comision.findUnique({
      where: { id: comisionId },
      select: {
        id: true,
        nombre: true,
        docente_id: true,
        estado_clase: true,
        activo: true,
        livekit_room_name: true,
      },
    });

    if (!comision) {
      throw new NotFoundException(
        `Comisión con ID "${comisionId}" no encontrada`,
      );
    }

    // 2. Validar que el docente es el asignado
    if (comision.docente_id !== docenteId) {
      throw new ForbiddenException(
        'Solo el docente asignado puede iniciar esta clase',
      );
    }

    // 3. Validar que la comisión está activa
    if (!comision.activo) {
      throw new BadRequestException('Esta comisión no está activa');
    }

    // 4. Generar nombre de sala si no existe
    const livekitRoomName =
      comision.livekit_room_name || `comision-${comisionId}`;

    // 5. Actualizar estado a EnVivo
    const updated = await this.prisma.comision.update({
      where: { id: comisionId },
      data: {
        estado_clase: 'EnVivo',
        iniciada_en: new Date(),
        finalizada_en: null, // Limpiar por si se reinicia
        livekit_room_name: livekitRoomName,
      },
      select: {
        id: true,
        nombre: true,
        estado_clase: true,
        iniciada_en: true,
        finalizada_en: true,
        livekit_room_name: true,
      },
    });

    this.logger.log(
      `Comisión iniciada: ${updated.nombre} (${comisionId}) por docente ${docenteId}`,
    );

    return {
      ...updated,
      mensaje: 'Clase de comisión iniciada exitosamente',
    };
  }

  /**
   * Finalizar una clase en vivo de comisión
   *
   * @param comisionId - ID de la comisión
   * @param docenteId - ID del docente que finaliza la clase
   * @returns Datos actualizados de la comisión con duración
   * @throws NotFoundException si la comisión no existe
   * @throws ForbiddenException si el docente no es el asignado
   * @throws BadRequestException si la clase no está en vivo
   */
  async finalizarClase(
    comisionId: string,
    docenteId: string,
  ): Promise<FinalizarComisionResponse> {
    // 1. Obtener la comisión y validar existencia
    const comision = await this.prisma.comision.findUnique({
      where: { id: comisionId },
      select: {
        id: true,
        nombre: true,
        docente_id: true,
        estado_clase: true,
        iniciada_en: true,
        livekit_room_name: true,
      },
    });

    if (!comision) {
      throw new NotFoundException(
        `Comisión con ID "${comisionId}" no encontrada`,
      );
    }

    // 2. Validar que el docente es el asignado
    if (comision.docente_id !== docenteId) {
      throw new ForbiddenException(
        'Solo el docente asignado puede finalizar esta clase',
      );
    }

    // 3. Validar que la clase está en vivo
    if (comision.estado_clase !== 'EnVivo') {
      throw new BadRequestException(
        `La clase no está en vivo. Estado actual: ${comision.estado_clase}`,
      );
    }

    // 4. Calcular duración
    const finalizadaEn = new Date();
    let duracionMinutos = 0;

    if (comision.iniciada_en) {
      const duracionMs =
        finalizadaEn.getTime() - comision.iniciada_en.getTime();
      duracionMinutos = Math.round(duracionMs / (1000 * 60));
    }

    // 5. Actualizar estado a Finalizada
    const updated = await this.prisma.comision.update({
      where: { id: comisionId },
      data: {
        estado_clase: 'Finalizada',
        finalizada_en: finalizadaEn,
      },
      select: {
        id: true,
        nombre: true,
        estado_clase: true,
        iniciada_en: true,
        finalizada_en: true,
        livekit_room_name: true,
      },
    });

    this.logger.log(
      `Comisión finalizada: ${updated.nombre} (${comisionId}) - Duración: ${duracionMinutos} min`,
    );

    return {
      ...updated,
      mensaje: 'Clase de comisión finalizada exitosamente',
      duracion_minutos: duracionMinutos,
    };
  }

  /**
   * Obtener estado actual de una comisión
   *
   * @param comisionId - ID de la comisión
   * @returns Estado actual de la comisión
   */
  async obtenerEstadoClase(
    comisionId: string,
  ): Promise<ComisionEnVivoResponse> {
    const comision = await this.prisma.comision.findUnique({
      where: { id: comisionId },
      select: {
        id: true,
        nombre: true,
        estado_clase: true,
        iniciada_en: true,
        finalizada_en: true,
        livekit_room_name: true,
      },
    });

    if (!comision) {
      throw new NotFoundException(
        `Comisión con ID "${comisionId}" no encontrada`,
      );
    }

    return comision;
  }
}
