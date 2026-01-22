import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../core/database/prisma.service';
import { RachaActualizadaEvent } from '../../common/events';

@Injectable()
export class RachaService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Obtener racha actual del estudiante
   * Usa upsert para evitar race conditions (P2002)
   */
  async obtenerRacha(estudianteId: string) {
    // Upsert atómico evita TOCTOU race condition
    // Si dos requests llegan simultáneamente, PostgreSQL maneja el conflicto
    return this.prisma.rachaEstudiante.upsert({
      where: { estudianteId: estudianteId },
      create: {
        estudianteId: estudianteId,
        rachaActual: 0,
        rachaMaxima: 0,
        totalDiasActivos: 0,
      },
      update: {}, // No actualizar nada, solo retornar existente
    });
  }

  /**
   * Registrar actividad del día
   * Retorna true si la racha aumentó
   */
  async registrarActividad(estudianteId: string): Promise<{
    rachaActual: number;
    rachaMaxima: number;
    esNuevaRacha: boolean;
    rompioRacha: boolean;
  }> {
    const racha = await this.obtenerRacha(estudianteId);
    const ahora = new Date();
    const hoy = this.obtenerDiaInicio(ahora);

    // Si ya hay actividad hoy, no hacer nada
    if (
      racha.ultimaActividad &&
      this.esMismoDia(racha.ultimaActividad, ahora)
    ) {
      return {
        rachaActual: racha.rachaActual,
        rachaMaxima: racha.rachaMaxima,
        esNuevaRacha: false,
        rompioRacha: false,
      };
    }

    // Verificar si la actividad es del día siguiente consecutivo
    const esConsecutivo =
      racha.ultimaActividad &&
      this.esDiaSiguiente(racha.ultimaActividad, ahora);

    let nuevaRacha = racha.rachaActual;
    let rompioRacha = false;

    if (esConsecutivo) {
      // Aumentar racha
      nuevaRacha = racha.rachaActual + 1;
    } else if (racha.ultimaActividad) {
      // Se rompió la racha
      nuevaRacha = 1;
      rompioRacha = racha.rachaActual > 0;
    } else {
      // Primera actividad
      nuevaRacha = 1;
    }

    const nuevaRachaMaxima = Math.max(racha.rachaMaxima, nuevaRacha);
    const esNuevaRacha = nuevaRacha > racha.rachaActual;

    // Actualizar registro
    const rachaActualizada = await this.prisma.rachaEstudiante.update({
      where: { id: racha.id },
      data: {
        rachaActual: nuevaRacha,
        rachaMaxima: nuevaRachaMaxima,
        ultimaActividad: ahora,
        inicioRachaActual: esNuevaRacha ? hoy : racha.inicioRachaActual || hoy,
        totalDiasActivos: racha.totalDiasActivos + 1,
      },
    });

    // Emitir evento RACHA_ACTUALIZADA
    this.eventEmitter.emit(
      'racha.actualizada',
      new RachaActualizadaEvent(
        estudianteId,
        rachaActualizada.rachaActual,
        rachaActualizada.rachaMaxima,
        esNuevaRacha,
        rompioRacha,
      ),
    );

    return {
      rachaActual: rachaActualizada.rachaActual,
      rachaMaxima: rachaActualizada.rachaMaxima,
      esNuevaRacha: esNuevaRacha,
      rompioRacha: rompioRacha,
    };
  }

  /**
   * Verificar si el estudiante mantiene la racha
   * (actualizar si pasaron más de 24h sin actividad)
   */
  async verificarRacha(estudianteId: string) {
    const racha = await this.obtenerRacha(estudianteId);

    if (!racha.ultimaActividad) {
      return racha;
    }

    const ahora = new Date();
    const diferenciaDias = this.diasEntre(racha.ultimaActividad, ahora);

    // Si pasaron más de 1 día, se rompió la racha
    if (diferenciaDias > 1) {
      return this.prisma.rachaEstudiante.update({
        where: { id: racha.id },
        data: {
          rachaActual: 0,
          inicioRachaActual: null,
        },
      });
    }

    return racha;
  }

  /**
   * Obtener el inicio del día (00:00:00)
   */
  private obtenerDiaInicio(fecha: Date): Date {
    const dia = new Date(fecha);
    dia.setHours(0, 0, 0, 0);
    return dia;
  }

  /**
   * Verificar si dos fechas son del mismo día
   */
  private esMismoDia(fecha1: Date, fecha2: Date): boolean {
    const dia1 = this.obtenerDiaInicio(fecha1);
    const dia2 = this.obtenerDiaInicio(fecha2);
    return dia1.getTime() === dia2.getTime();
  }

  /**
   * Verificar si fecha2 es el día siguiente de fecha1
   */
  private esDiaSiguiente(fecha1: Date, fecha2: Date): boolean {
    const dia1 = this.obtenerDiaInicio(fecha1);
    const dia2 = this.obtenerDiaInicio(fecha2);

    // Agregar 1 día a dia1
    const siguienteDia = new Date(dia1);
    siguienteDia.setDate(siguienteDia.getDate() + 1);

    return siguienteDia.getTime() === dia2.getTime();
  }

  /**
   * Calcular días entre dos fechas
   */
  private diasEntre(fecha1: Date, fecha2: Date): number {
    const dia1 = this.obtenerDiaInicio(fecha1);
    const dia2 = this.obtenerDiaInicio(fecha2);

    const diferenciaMilisegundos = Math.abs(dia2.getTime() - dia1.getTime());
    return Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtener estadísticas de racha
   */
  async obtenerEstadisticas(estudianteId: string) {
    const racha = await this.verificarRacha(estudianteId);

    return {
      rachaActual: racha.rachaActual,
      rachaMaxima: racha.rachaMaxima,
      totalDiasActivos: racha.totalDiasActivos,
      ultimaActividad: racha.ultimaActividad,
      diasConsecutivos: racha.rachaActual,
    };
  }
}
