import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class RachaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtener racha actual del estudiante
   */
  async obtenerRacha(estudianteId: string) {
    let racha = await this.prisma.rachaEstudiante.findUnique({
      where: { estudiante_id: estudianteId },
    });

    // Si no existe, crear registro inicial
    if (!racha) {
      racha = await this.prisma.rachaEstudiante.create({
        data: {
          estudiante_id: estudianteId,
          racha_actual: 0,
          racha_maxima: 0,
          total_dias_activos: 0,
        },
      });
    }

    return racha;
  }

  /**
   * Registrar actividad del día
   * Retorna true si la racha aumentó
   */
  async registrarActividad(estudianteId: string): Promise<{
    racha_actual: number;
    racha_maxima: number;
    es_nueva_racha: boolean;
    rompio_racha: boolean;
  }> {
    const racha = await this.obtenerRacha(estudianteId);
    const ahora = new Date();
    const hoy = this.obtenerDiaInicio(ahora);

    // Si ya hay actividad hoy, no hacer nada
    if (
      racha.ultima_actividad &&
      this.esMismoDia(racha.ultima_actividad, ahora)
    ) {
      return {
        racha_actual: racha.racha_actual,
        racha_maxima: racha.racha_maxima,
        es_nueva_racha: false,
        rompio_racha: false,
      };
    }

    // Verificar si la actividad es del día siguiente consecutivo
    const esConsecutivo =
      racha.ultima_actividad &&
      this.esDiaSiguiente(racha.ultima_actividad, ahora);

    let nuevaRacha = racha.racha_actual;
    let rompioRacha = false;

    if (esConsecutivo) {
      // Aumentar racha
      nuevaRacha = racha.racha_actual + 1;
    } else if (racha.ultima_actividad) {
      // Se rompió la racha
      nuevaRacha = 1;
      rompioRacha = racha.racha_actual > 0;
    } else {
      // Primera actividad
      nuevaRacha = 1;
    }

    const nuevaRachaMaxima = Math.max(racha.racha_maxima, nuevaRacha);
    const esNuevaRacha = nuevaRacha > racha.racha_actual;

    // Actualizar registro
    const rachaActualizada = await this.prisma.rachaEstudiante.update({
      where: { id: racha.id },
      data: {
        racha_actual: nuevaRacha,
        racha_maxima: nuevaRachaMaxima,
        ultima_actividad: ahora,
        inicio_racha_actual: esNuevaRacha
          ? hoy
          : racha.inicio_racha_actual || hoy,
        total_dias_activos: racha.total_dias_activos + 1,
      },
    });

    return {
      racha_actual: rachaActualizada.racha_actual,
      racha_maxima: rachaActualizada.racha_maxima,
      es_nueva_racha: esNuevaRacha,
      rompio_racha: rompioRacha,
    };
  }

  /**
   * Verificar si el estudiante mantiene la racha
   * (actualizar si pasaron más de 24h sin actividad)
   */
  async verificarRacha(estudianteId: string) {
    const racha = await this.obtenerRacha(estudianteId);

    if (!racha.ultima_actividad) {
      return racha;
    }

    const ahora = new Date();
    const diferenciaDias = this.diasEntre(racha.ultima_actividad, ahora);

    // Si pasaron más de 1 día, se rompió la racha
    if (diferenciaDias > 1) {
      return this.prisma.rachaEstudiante.update({
        where: { id: racha.id },
        data: {
          racha_actual: 0,
          inicio_racha_actual: null,
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
      racha_actual: racha.racha_actual,
      racha_maxima: racha.racha_maxima,
      total_dias_activos: racha.total_dias_activos,
      ultima_actividad: racha.ultima_actividad,
      dias_consecutivos: racha.racha_actual,
    };
  }
}
