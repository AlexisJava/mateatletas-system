import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../core/database/prisma.service';
import { Prisma } from '@prisma/client';
import {
  XpGainedEvent,
  EstudianteNivelUpEvent,
  CasaPuntosActualizadosEvent,
} from '../../common/events';

@Injectable()
export class RecursosService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Obtener recursos de un estudiante
   */
  async obtenerRecursos(estudianteId: string) {
    let recursos = await this.prisma.recursosEstudiante.findUnique({
      where: { estudianteId: estudianteId },
    });

    // Si no existe, crear registro inicial
    if (!recursos) {
      recursos = await this.prisma.recursosEstudiante.create({
        data: {
          estudianteId: estudianteId,
          xpTotal: 0,
        },
      });
    }

    return recursos;
  }

  /**
   * Calcular nivel basado en XP
   */
  calcularNivel(xpTotal: number): number {
    // Fórmula: nivel = floor(sqrt(xp / 100)) + 1
    return Math.floor(Math.sqrt(xpTotal / 100)) + 1;
  }

  /**
   * Calcular XP requerido para siguiente nivel
   */
  xpParaNivel(nivel: number): number {
    // Fórmula: xp = (nivel - 1)² × 100
    return Math.pow(nivel - 1, 2) * 100;
  }

  /**
   * Agregar XP
   */
  async agregarXP(
    estudianteId: string,
    cantidad: number,
    razon: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    const recursos = await this.obtenerRecursos(estudianteId);

    const nivelAnterior = this.calcularNivel(recursos.xpTotal);
    const nuevoTotalXP = recursos.xpTotal + cantidad;
    const nivelNuevo = this.calcularNivel(nuevoTotalXP);

    // Actualizar recursos
    const recursosActualizados = await this.prisma.recursosEstudiante.update({
      where: { id: recursos.id },
      data: { xpTotal: nuevoTotalXP },
    });

    // Registrar transacción
    await this.prisma.transaccionRecurso.create({
      data: {
        recursosEstudianteId: recursos.id,
        tipoRecurso: 'XP',
        cantidad,
        razon,
        metadata: metadata || {},
      },
    });

    // Detectar subida de nivel
    const subioNivel = nivelNuevo > nivelAnterior;

    // Emitir evento XP_GANADO
    this.eventEmitter.emit(
      'xp.ganado',
      new XpGainedEvent(
        estudianteId,
        cantidad,
        razon,
        metadata as Record<string, unknown>,
      ),
    );

    // Emitir evento NIVEL_SUBIDO si corresponde
    if (subioNivel) {
      this.eventEmitter.emit(
        'estudiante.nivel-up',
        new EstudianteNivelUpEvent(estudianteId, nivelAnterior, nivelNuevo, {}),
      );
    }

    // Sprint 3.5: Emitir evento de puntos de casa si el estudiante tiene casa
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      select: {
        nombre: true,
        apellido: true,
        casaId: true,
        casa: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (estudiante?.casa) {
      this.eventEmitter.emit(
        'casa.puntos.actualizado',
        new CasaPuntosActualizadosEvent(
          estudiante.casa.id,
          estudiante.casa.nombre,
          estudianteId,
          `${estudiante.nombre} ${estudiante.apellido}`,
          cantidad,
          nuevoTotalXP,
        ),
      );
    }

    return {
      recursos: recursosActualizados,
      nivelAnterior: nivelAnterior,
      nivelNuevo: nivelNuevo,
      subioNivel: subioNivel,
    };
  }

  /**
   * Obtener historial de transacciones
   */
  async obtenerHistorial(estudianteId: string, limite = 50) {
    const recursos = await this.obtenerRecursos(estudianteId);

    return this.prisma.transaccionRecurso.findMany({
      where: { recursosEstudianteId: recursos.id },
      orderBy: { fecha: 'desc' },
      take: limite,
    });
  }

  /**
   * Obtener recursos con nivel calculado
   */
  async obtenerRecursosConNivel(estudianteId: string) {
    const recursos = await this.obtenerRecursos(estudianteId);
    const nivel = this.calcularNivel(recursos.xpTotal);
    const xpParaSiguienteNivel = this.xpParaNivel(nivel + 1);
    const xpNivelActual = this.xpParaNivel(nivel);
    const xpProgreso = recursos.xpTotal - xpNivelActual;
    const xpNecesario = xpParaSiguienteNivel - xpNivelActual;

    return {
      ...recursos,
      nivel,
      xpProgreso: xpProgreso,
      xpNecesario: xpNecesario,
      porcentajeNivel: Math.floor((xpProgreso / xpNecesario) * 100),
    };
  }
}
