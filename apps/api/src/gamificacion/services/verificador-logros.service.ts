import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { LogrosService } from './logros.service';
import { RachaService } from './racha.service';

/**
 * Servicio que verifica y desbloquea logros automáticamente
 * basado en las acciones del estudiante
 */
@Injectable()
export class VerificadorLogrosService {
  private readonly logger = new Logger(VerificadorLogrosService.name);

  constructor(
    private prisma: PrismaService,
    private logrosService: LogrosService,
    private rachaService: RachaService,
  ) {}

  /**
   * Verificar logros después de completar un ejercicio
   */
  async verificarLogrosEjercicio(
    estudianteId: string,
    datos: {
      precision?: number;
      tiempo?: number; // en segundos
    },
  ) {
    const logrosDesbloqueados: string[] = [];

    // Contar ejercicios completados
    const totalEjercicios =
      await this.contarEjerciciosCompletados(estudianteId);

    // Logro: Primer Paso (1 ejercicio)
    if (totalEjercicios === 1) {
      await this.intentarDesbloquear(
        estudianteId,
        'primer_paso',
        logrosDesbloqueados,
      );
    }

    // Verificar precisión 100%
    if (datos.precision === 100) {
      await this.verificarLogrosPrecision(estudianteId, logrosDesbloqueados);
    }

    // Verificar velocidad (<30s)
    if (datos.tiempo && datos.tiempo < 30) {
      await this.verificarLogrosVelocidad(estudianteId, logrosDesbloqueados);
    }

    return logrosDesbloqueados;
  }

  /**
   * Verificar logros de precisión
   */
  private async verificarLogrosPrecision(
    estudianteId: string,
    logrosDesbloqueados: string[],
  ) {
    const perfectos = await this.contarEjerciciosPerfectos(estudianteId);

    const logros = [
      { codigo: 'primera_perfeccion', cantidad: 1 },
      { codigo: 'perfeccionista', cantidad: 10 },
      { codigo: 'ojo_halcon', cantidad: 25 },
      { codigo: 'francotirador', cantidad: 50 },
      { codigo: 'mente_brillante', cantidad: 100 },
    ];

    for (const logro of logros) {
      if (perfectos === logro.cantidad) {
        await this.intentarDesbloquear(
          estudianteId,
          logro.codigo,
          logrosDesbloqueados,
        );
      }
    }
  }

  /**
   * Verificar logros de velocidad
   */
  private async verificarLogrosVelocidad(
    estudianteId: string,
    logrosDesbloqueados: string[],
  ) {
    const rapidos = await this.contarEjerciciosRapidos(estudianteId);

    const logros = [
      { codigo: 'primera_velocidad', cantidad: 1 },
      { codigo: 'acelerado', cantidad: 5 },
      { codigo: 'rapido_furioso', cantidad: 10 },
      { codigo: 'velocista', cantidad: 20 },
      { codigo: 'velocidad_luz', cantidad: 50 },
    ];

    for (const logro of logros) {
      if (rapidos === logro.cantidad) {
        await this.intentarDesbloquear(
          estudianteId,
          logro.codigo,
          logrosDesbloqueados,
        );
      }
    }
  }

  /**
   * Verificar logros después de actualizar racha
   */
  async verificarLogrosRacha(estudianteId: string) {
    const logrosDesbloqueados: string[] = [];

    const racha = await this.rachaService.obtenerRacha(estudianteId);

    const logros = [
      { codigo: 'un_dia_vez', dias: 1 },
      { codigo: 'tres_multitud', dias: 3 },
      { codigo: 'racha_fuego', dias: 7 },
      { codigo: 'dos_semanas_imparables', dias: 14 },
      { codigo: 'imparable', dias: 30 },
      { codigo: 'dedicacion_hierro', dias: 60 },
      { codigo: 'leyenda_viviente', dias: 90 },
    ];

    for (const logro of logros) {
      if (racha.racha_actual === logro.dias) {
        await this.intentarDesbloquear(
          estudianteId,
          logro.codigo,
          logrosDesbloqueados,
        );
      }
    }

    // Verificar días activos totales
    const diasActivos = racha.total_dias_activos;
    const logrosDiasActivos = [
      { codigo: 'segunda_semana', dias: 7 },
      { codigo: 'veterano_gimnasio', dias: 30 },
    ];

    for (const logro of logrosDiasActivos) {
      if (diasActivos === logro.dias) {
        await this.intentarDesbloquear(
          estudianteId,
          logro.codigo,
          logrosDesbloqueados,
        );
      }
    }

    return logrosDesbloqueados;
  }

  /**
   * Verificar logros al subir de nivel
   */
  async verificarLogrosNivel(estudianteId: string, nivelNuevo: number) {
    const logrosDesbloqueados: string[] = [];

    const logros = [
      { codigo: 'nivel_5', nivel: 5 },
      { codigo: 'nivel_7', nivel: 7 },
      { codigo: 'nivel_10', nivel: 10 },
      { codigo: 'maximo_nivel', nivel: 15 },
    ];

    for (const logro of logros) {
      if (nivelNuevo === logro.nivel) {
        await this.intentarDesbloquear(
          estudianteId,
          logro.codigo,
          logrosDesbloqueados,
        );
      }
    }

    return logrosDesbloqueados;
  }

  /**
   * Verificar logros al completar un tema
   */
  async verificarLogrosTemas(estudianteId: string) {
    const logrosDesbloqueados: string[] = [];

    const temasCompletados = await this.contarTemasCompletados(estudianteId);

    const logros = [
      { codigo: 'primera_victoria', cantidad: 1 },
      { codigo: 'doble_nada', cantidad: 2 },
      { codigo: 'trio_perfecto', cantidad: 3 },
      { codigo: 'completista', cantidad: 5 },
      { codigo: 'coleccionista', cantidad: 10 },
      { codigo: 'maestria_total', cantidad: 20 },
    ];

    for (const logro of logros) {
      if (temasCompletados === logro.cantidad) {
        await this.intentarDesbloquear(
          estudianteId,
          logro.codigo,
          logrosDesbloqueados,
        );
      }
    }

    return logrosDesbloqueados;
  }

  /**
   * Verificar logros de asistencia
   */
  async verificarLogrosAsistencia(estudianteId: string) {
    const logrosDesbloqueados: string[] = [];

    const clasesAsistidas = await this.contarClasesAsistidas(estudianteId);

    const logros = [
      { codigo: 'primera_clase', cantidad: 1 },
      { codigo: 'alumno_regular', cantidad: 3 },
    ];

    for (const logro of logros) {
      if (clasesAsistidas === logro.cantidad) {
        await this.intentarDesbloquear(
          estudianteId,
          logro.codigo,
          logrosDesbloqueados,
        );
      }
    }

    return logrosDesbloqueados;
  }

  /**
   * Intentar desbloquear un logro
   */
  private async intentarDesbloquear(
    estudianteId: string,
    codigoLogro: string,
    logrosDesbloqueados: string[],
  ) {
    try {
      const resultado = await this.logrosService.desbloquearLogro(
        estudianteId,
        codigoLogro,
      );

      if (!resultado.ya_desbloqueado) {
        logrosDesbloqueados.push(codigoLogro);
        this.logger.log(
          `Logro "${codigoLogro}" desbloqueado para estudiante ${estudianteId}`,
        );
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error al desbloquear logro "${codigoLogro}": ${message}`,
      );
    }
  }

  // ==========================================
  // MÉTODOS AUXILIARES DE CONTEO
  // ==========================================

  private contarEjerciciosCompletados(_estudianteId: string): Promise<number> {
    // TODO: Implementar con el sistema de ejercicios real
    // Por ahora retorna mock
    return Promise.resolve(0);
  }

  private contarEjerciciosPerfectos(_estudianteId: string): Promise<number> {
    // TODO: Implementar con el sistema de ejercicios real
    return Promise.resolve(0);
  }

  private contarEjerciciosRapidos(_estudianteId: string): Promise<number> {
    // TODO: Implementar con el sistema de ejercicios real
    return Promise.resolve(0);
  }

  private contarTemasCompletados(_estudianteId: string): Promise<number> {
    // TODO: Implementar con el sistema de progreso real
    return Promise.resolve(0);
  }

  private async contarClasesAsistidas(estudianteId: string): Promise<number> {
    return this.prisma.asistencia.count({
      where: {
        estudiante_id: estudianteId,
        estado: 'Presente',
      },
    });
  }
}
