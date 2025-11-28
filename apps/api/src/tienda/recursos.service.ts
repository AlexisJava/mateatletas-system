/**
 * RecursosService
 * Maneja XP y Monedas del estudiante
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import type {
  RecursosEstudiante,
  TransaccionRecurso,
  TipoRecurso,
  ActualizarRecursosPorActividad,
  RecursosActualizadosResponse,
} from '@mateatletas/contracts';

@Injectable()
export class RecursosService {
  private readonly logger = new Logger(RecursosService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene o crea los recursos de un estudiante
   */
  async obtenerOCrearRecursos(
    estudianteId: string,
  ): Promise<RecursosEstudiante> {
    this.logger.log(`Obteniendo recursos para estudiante: ${estudianteId}`);

    // Buscar recursos existentes
    let recursos = await this.prisma.recursosEstudiante.findUnique({
      where: { estudiante_id: estudianteId },
    });

    // Si no existen, crear con valores iniciales
    if (!recursos) {
      this.logger.log(
        `Creando recursos iniciales para estudiante: ${estudianteId}`,
      );
      recursos = await this.prisma.recursosEstudiante.create({
        data: {
          estudiante_id: estudianteId,
          xp_total: 0,
          monedas_total: 0,
        },
      });
    }

    return recursos as RecursosEstudiante;
  }

  /**
   * Actualiza recursos después de completar una actividad
   */
  async actualizarRecursosPorActividad(
    data: ActualizarRecursosPorActividad,
  ): Promise<RecursosActualizadosResponse> {
    this.logger.log(
      `Actualizando recursos por actividad para estudiante: ${data.estudiante_id}`,
    );

    const {
      estudiante_id,
      xp_ganado,
      monedas_ganadas,
      actividad_id,
      metadata,
    } = data;

    // Validar que al menos uno de los recursos sea mayor a 0
    if (xp_ganado === 0 && monedas_ganadas === 0) {
      throw new BadRequestException('Debe otorgar al menos XP o Monedas');
    }

    // Obtener o crear recursos
    const recursos = await this.obtenerOCrearRecursos(estudiante_id);

    // Crear transacciones en paralelo
    const transacciones: TransaccionRecurso[] = [];

    if (xp_ganado > 0) {
      const transaccionXP = await this.prisma.transaccionRecurso.create({
        data: {
          recursos_estudiante_id: recursos.id,
          tipo_recurso: 'XP',
          cantidad: xp_ganado,
          razon: 'actividad_completada',
          metadata: {
            actividad_id,
            ...(metadata || {}),
          } as never,
        },
      });
      transacciones.push(transaccionXP as TransaccionRecurso);
    }

    if (monedas_ganadas > 0) {
      const transaccionMonedas = await this.prisma.transaccionRecurso.create({
        data: {
          recursos_estudiante_id: recursos.id,
          tipo_recurso: 'MONEDAS',
          cantidad: monedas_ganadas,
          razon: 'actividad_completada',
          metadata: {
            actividad_id,
            ...(metadata || {}),
          } as never,
        },
      });
      transacciones.push(transaccionMonedas as TransaccionRecurso);
    }

    // Actualizar totales
    const recursosActualizados = await this.prisma.recursosEstudiante.update({
      where: { id: recursos.id },
      data: {
        xp_total: { increment: xp_ganado },
        monedas_total: { increment: monedas_ganadas },
      },
    });

    this.logger.log(
      `Recursos actualizados: +${xp_ganado} XP, +${monedas_ganadas} monedas`,
    );

    return {
      recursos: recursosActualizados as RecursosEstudiante,
      transacciones,
      mensaje: `¡Has ganado ${xp_ganado} XP y ${monedas_ganadas} monedas!`,
    };
  }

  /**
   * Consume recursos (para compras en tienda)
   * Retorna true si la transacción fue exitosa
   */
  async consumirRecursos(
    estudianteId: string,
    tipo: TipoRecurso,
    cantidad: number,
    razon: string,
    metadata?: Record<string, unknown>,
  ): Promise<boolean> {
    this.logger.log(
      `Consumiendo ${cantidad} ${tipo} de estudiante: ${estudianteId}`,
    );

    if (cantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }

    // Validar que el tipo de recurso sea válido (solo XP o MONEDAS)
    if (tipo !== 'XP' && tipo !== 'MONEDAS') {
      throw new BadRequestException(
        `Tipo de recurso inválido: ${tipo}. Solo se permite XP o MONEDAS.`,
      );
    }

    const recursos = await this.obtenerOCrearRecursos(estudianteId);

    // Verificar si tiene suficientes recursos
    const recursoActual =
      tipo === 'XP' ? recursos.xp_total : recursos.monedas_total;

    if (recursoActual < cantidad) {
      throw new BadRequestException(
        `No tienes suficientes ${tipo}. Tienes ${recursoActual}, necesitas ${cantidad}`,
      );
    }

    // Crear transacción negativa
    await this.prisma.transaccionRecurso.create({
      data: {
        recursos_estudiante_id: recursos.id,
        tipo_recurso: tipo,
        cantidad: -cantidad, // Negativo = gasto
        razon,
        metadata: metadata as never,
      },
    });

    // Actualizar total
    const updateData: Record<string, unknown> = {};
    if (tipo === 'XP') {
      updateData.xp_total = { decrement: cantidad };
    } else if (tipo === 'MONEDAS') {
      updateData.monedas_total = { decrement: cantidad };
    }

    await this.prisma.recursosEstudiante.update({
      where: { id: recursos.id },
      data: updateData,
    });

    this.logger.log(`Recursos consumidos exitosamente`);
    return true;
  }

  /**
   * Obtiene el historial de transacciones de un estudiante
   */
  async obtenerHistorial(
    estudianteId: string,
    tipo?: TipoRecurso,
    limit = 50,
  ): Promise<TransaccionRecurso[]> {
    const recursos = await this.obtenerOCrearRecursos(estudianteId);

    const transacciones = await this.prisma.transaccionRecurso.findMany({
      where: {
        recursos_estudiante_id: recursos.id,
        ...(tipo && tipo !== 'GEMAS' ? { tipo_recurso: tipo } : {}),
      },
      orderBy: { fecha: 'desc' },
      take: limit,
    });

    return transacciones as TransaccionRecurso[];
  }

  /**
   * Verifica si el estudiante tiene suficientes recursos
   */
  async verificarRecursosSuficientes(
    estudianteId: string,
    monedasRequeridas: number,
  ): Promise<{ suficientes: boolean; mensaje?: string }> {
    const recursos = await this.obtenerOCrearRecursos(estudianteId);

    if (monedasRequeridas > 0 && recursos.monedas_total < monedasRequeridas) {
      return {
        suficientes: false,
        mensaje: `No tienes suficientes monedas. Tienes ${recursos.monedas_total}, necesitas ${monedasRequeridas}`,
      };
    }

    return { suficientes: true };
  }
}
