import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class RecursosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtener recursos de un estudiante
   */
  async obtenerRecursos(estudianteId: string) {
    let recursos = await this.prisma.recursosEstudiante.findUnique({
      where: { estudiante_id: estudianteId },
    });

    // Si no existe, crear registro inicial
    if (!recursos) {
      recursos = await this.prisma.recursosEstudiante.create({
        data: {
          estudiante_id: estudianteId,
          monedas_total: 0,
          xp_total: 0,
        },
      });
    }

    return recursos;
  }

  /**
   * Calcular nivel basado en XP
   */
  calcularNivel(xp_total: number): number {
    // Fórmula: nivel = floor(sqrt(xp / 100)) + 1
    return Math.floor(Math.sqrt(xp_total / 100)) + 1;
  }

  /**
   * Calcular XP requerido para siguiente nivel
   */
  xpParaNivel(nivel: number): number {
    // Fórmula: xp = (nivel - 1)² × 100
    return Math.pow(nivel - 1, 2) * 100;
  }

  /**
   * Agregar monedas
   */
  async agregarMonedas(
    estudianteId: string,
    cantidad: number,
    razon: string,
    metadata?: any,
  ) {
    const recursos = await this.obtenerRecursos(estudianteId);

    const nuevoTotal = recursos.monedas_total + cantidad;

    // Actualizar recursos
    const recursosActualizados = await this.prisma.recursosEstudiante.update({
      where: { id: recursos.id },
      data: { monedas_total: nuevoTotal },
    });

    // Registrar transacción
    await this.prisma.transaccionRecurso.create({
      data: {
        recursos_estudiante_id: recursos.id,
        tipo_recurso: 'MONEDAS',
        cantidad,
        razon,
        metadata: metadata || {},
      },
    });

    return recursosActualizados;
  }

  /**
   * Agregar XP
   */
  async agregarXP(
    estudianteId: string,
    cantidad: number,
    razon: string,
    metadata?: any,
  ) {
    const recursos = await this.obtenerRecursos(estudianteId);

    const nivelAnterior = this.calcularNivel(recursos.xp_total);
    const nuevoTotalXP = recursos.xp_total + cantidad;
    const nivelNuevo = this.calcularNivel(nuevoTotalXP);

    // Actualizar recursos
    const recursosActualizados = await this.prisma.recursosEstudiante.update({
      where: { id: recursos.id },
      data: { xp_total: nuevoTotalXP },
    });

    // Registrar transacción
    await this.prisma.transaccionRecurso.create({
      data: {
        recursos_estudiante_id: recursos.id,
        tipo_recurso: 'XP',
        cantidad,
        razon,
        metadata: metadata || {},
      },
    });

    // Detectar subida de nivel
    const subioNivel = nivelNuevo > nivelAnterior;

    return {
      recursos: recursosActualizados,
      nivel_anterior: nivelAnterior,
      nivel_nuevo: nivelNuevo,
      subio_nivel: subioNivel,
    };
  }

  /**
   * Gastar monedas (canjear cursos)
   */
  async gastarMonedas(
    estudianteId: string,
    cantidad: number,
    razon: string,
    metadata?: any,
  ) {
    const recursos = await this.obtenerRecursos(estudianteId);

    if (recursos.monedas_total < cantidad) {
      throw new NotFoundException(
        `No tienes suficientes monedas. Necesitas ${cantidad} pero tienes ${recursos.monedas_total}`,
      );
    }

    const nuevoTotal = recursos.monedas_total - cantidad;

    // Actualizar recursos
    const recursosActualizados = await this.prisma.recursosEstudiante.update({
      where: { id: recursos.id },
      data: { monedas_total: nuevoTotal },
    });

    // Registrar transacción (negativa)
    await this.prisma.transaccionRecurso.create({
      data: {
        recursos_estudiante_id: recursos.id,
        tipo_recurso: 'MONEDAS',
        cantidad: -cantidad,
        razon,
        metadata: metadata || {},
      },
    });

    return recursosActualizados;
  }

  /**
   * Obtener historial de transacciones
   */
  async obtenerHistorial(estudianteId: string, limite = 50) {
    const recursos = await this.obtenerRecursos(estudianteId);

    return this.prisma.transaccionRecurso.findMany({
      where: { recursos_estudiante_id: recursos.id },
      orderBy: { fecha: 'desc' },
      take: limite,
    });
  }

  /**
   * Obtener recursos con nivel calculado
   */
  async obtenerRecursosConNivel(estudianteId: string) {
    const recursos = await this.obtenerRecursos(estudianteId);
    const nivel = this.calcularNivel(recursos.xp_total);
    const xpParaSiguienteNivel = this.xpParaNivel(nivel + 1);
    const xpNivelActual = this.xpParaNivel(nivel);
    const xpProgreso = recursos.xp_total - xpNivelActual;
    const xpNecesario = xpParaSiguienteNivel - xpNivelActual;

    return {
      ...recursos,
      nivel,
      xp_progreso: xpProgreso,
      xp_necesario: xpNecesario,
      porcentaje_nivel: Math.floor((xpProgreso / xpNecesario) * 100),
    };
  }
}
