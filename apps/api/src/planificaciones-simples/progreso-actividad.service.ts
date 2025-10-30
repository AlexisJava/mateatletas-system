import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { RecursosService } from '../tienda/recursos.service';
import { VerificadorLogrosService } from '../gamificacion/services/verificador-logros.service';
import type {
  IniciarActividad,
  CompletarActividad,
  GuardarProgresoActividad,
  ProgresoActualizadoResponse,
  HistorialProgresoEstudiante,
} from '@mateatletas/contracts';

/**
 * Servicio de Progreso de Actividades
 * Gestiona el tracking de progreso del estudiante en actividades semanales
 *
 * Responsabilidades:
 * - Iniciar actividades
 * - Guardar progreso parcial
 * - Completar actividades
 * - Otorgar recompensas (XP, monedas, gemas)
 * - Desbloquear logros
 * - Generar historial de progreso
 */
@Injectable()
export class ProgresoActividadService {
  constructor(
    private prisma: PrismaService,
    private recursosService: RecursosService,
    private verificadorLogrosService: VerificadorLogrosService,
  ) {}

  // ============================================================================
  // INICIAR ACTIVIDAD
  // ============================================================================

  /**
   * Marca una actividad como iniciada
   * Crea el registro de progreso si no existe
   */
  async iniciarActividad(data: IniciarActividad) {
    const { estudiante_id, actividad_id, asignacion_id } = data;

    // Validar que la actividad existe
    const actividad = await this.prisma.actividadSemanal.findUnique({
      where: { id: actividad_id },
    });

    if (!actividad) {
      throw new NotFoundException('Actividad no encontrada');
    }

    // Validar que la asignación existe
    const asignacion = await this.prisma.asignacionActividadEstudiante.findUnique({
      where: { id: asignacion_id },
    });

    if (!asignacion) {
      throw new NotFoundException('Asignación no encontrada');
    }

    // Crear o actualizar progreso
    const progreso = await this.prisma.progresoEstudianteActividad.upsert({
      where: {
        estudiante_id_actividad_id_asignacion_id: {
          estudiante_id,
          actividad_id,
          asignacion_id,
        },
      },
      update: {
        iniciado: true,
        fecha_inicio: new Date(),
      },
      create: {
        estudiante_id,
        actividad_id,
        asignacion_id,
        iniciado: true,
        fecha_inicio: new Date(),
      },
    });

    return {
      progreso,
      mensaje: 'Actividad iniciada exitosamente',
    };
  }

  // ============================================================================
  // GUARDAR PROGRESO PARCIAL
  // ============================================================================

  /**
   * Guarda el progreso parcial de una actividad sin completarla
   * Útil para juegos que se pueden pausar y continuar
   */
  async guardarProgreso(data: GuardarProgresoActividad) {
    const { estudiante_id, actividad_id, asignacion_id, estado_juego, tiempo_minutos } = data;

    const progreso = await this.prisma.progresoEstudianteActividad.upsert({
      where: {
        estudiante_id_actividad_id_asignacion_id: {
          estudiante_id,
          actividad_id,
          asignacion_id,
        },
      },
      update: {
        estado_juego: estado_juego as never,
        tiempo_total_minutos: {
          increment: tiempo_minutos,
        },
      },
      create: {
        estudiante_id,
        actividad_id,
        asignacion_id,
        iniciado: true,
        fecha_inicio: new Date(),
        estado_juego: estado_juego as never,
        tiempo_total_minutos: tiempo_minutos,
      },
    });

    return {
      progreso,
      mensaje: 'Progreso guardado exitosamente',
    };
  }

  // ============================================================================
  // COMPLETAR ACTIVIDAD
  // ============================================================================

  /**
   * Completa una actividad y otorga recompensas
   * Implementa cascada P5 → P3:
   * 1. Guardar progreso de actividad
   * 2. Otorgar XP/monedas/gemas
   * 3. Verificar y desbloquear logros
   * 4. Actualizar nivel si corresponde
   */
  async completarActividad(data: CompletarActividad): Promise<ProgresoActualizadoResponse> {
    const {
      estudiante_id,
      actividad_id,
      asignacion_id,
      puntos_obtenidos,
      puntaje_intento,
      tiempo_minutos,
      estrellas,
      porcentaje_aciertos,
      respuestas_detalle,
      estado_juego,
    } = data;

    // ✅ TRANSACCIÓN ATÓMICA para garantizar consistencia
    const resultado = await this.prisma.$transaction(async (tx) => {
      // 1. Obtener progreso actual (o crear si no existe)
      const progresoActual = await tx.progresoEstudianteActividad.findUnique({
        where: {
          estudiante_id_actividad_id_asignacion_id: {
            estudiante_id,
            actividad_id,
            asignacion_id,
          },
        },
      });

      const nuevoMejorPuntaje = progresoActual
        ? Math.max(progresoActual.mejor_puntaje, puntaje_intento)
        : puntaje_intento;

      const nuevosIntentos = progresoActual ? progresoActual.intentos + 1 : 1;

      // 2. Actualizar progreso de actividad
      const progreso = await tx.progresoEstudianteActividad.upsert({
        where: {
          estudiante_id_actividad_id_asignacion_id: {
            estudiante_id,
            actividad_id,
            asignacion_id,
          },
        },
        update: {
          completado: true,
          fecha_completado: new Date(),
          puntos_obtenidos: {
            increment: puntos_obtenidos,
          },
          tiempo_total_minutos: {
            increment: tiempo_minutos,
          },
          intentos: nuevosIntentos,
          mejor_puntaje: nuevoMejorPuntaje,
          estado_juego: estado_juego ? (estado_juego as never) : undefined,
          respuestas_detalle: respuestas_detalle ? (respuestas_detalle as never) : undefined,
        },
        create: {
          estudiante_id,
          actividad_id,
          asignacion_id,
          iniciado: true,
          fecha_inicio: new Date(),
          completado: true,
          fecha_completado: new Date(),
          puntos_obtenidos,
          tiempo_total_minutos: tiempo_minutos,
          intentos: 1,
          mejor_puntaje: puntaje_intento,
          estado_juego: estado_juego ? (estado_juego as never) : undefined,
          respuestas_detalle: respuestas_detalle ? (respuestas_detalle as never) : undefined,
        },
      });

      return progreso;
    });

    // 3. Calcular recompensas basadas en estrellas y porcentaje
    const { xp_ganado, monedas_ganadas, gemas_ganadas } = this.calcularRecompensas(
      estrellas,
      porcentaje_aciertos,
    );

    // 4. Otorgar recursos (XP, monedas, gemas)
    const recursosActualizados = await this.recursosService.actualizarRecursosPorActividad({
      estudiante_id,
      actividad_id,
      xp_ganado,
      monedas_ganadas,
      gemas_ganadas: gemas_ganadas || 0,
      metadata: {
        estrellas,
        porcentaje_aciertos,
        puntaje: puntaje_intento,
        intentos: resultado.intentos,
      },
    });

    // 5. Verificar logros desbloqueados
    // TODO: Implementar verificación de logros con VerificadorLogrosService
    const codigosLogros = await this.verificadorLogrosService.verificarLogrosEjercicio(
      estudiante_id,
      {
        precision: porcentaje_aciertos,
        tiempo: tiempo_minutos ? tiempo_minutos * 60 : undefined,
      },
    );

    // Mapear códigos a objetos de logro completos
    const logrosDesbloqueados = [];
    for (const codigo of codigosLogros) {
      const logro = await this.prisma.logro.findUnique({
        where: { codigo },
      });
      if (logro) {
        logrosDesbloqueados.push({
          id: logro.id,
          nombre: logro.nombre,
          descripcion: logro.descripcion,
          puntos: logro.xp_recompensa,
        });
      }
    }

    // 6. Verificar si subió de nivel
    const nivel_anterior = this.calcularNivel(recursosActualizados.recursos.xp_total - xp_ganado);
    const nivel_actual = this.calcularNivel(recursosActualizados.recursos.xp_total);
    const nivel_subido = nivel_actual > nivel_anterior;

    // 7. Construir mensaje de felicitación
    let mensaje = `¡Felicidades! Completaste la actividad con ${estrellas} estrella${estrellas !== 1 ? 's' : ''}.`;

    if (nivel_subido) {
      mensaje += ` ¡Subiste al nivel ${nivel_actual}!`;
    }

    if (logrosDesbloqueados.length > 0) {
      mensaje += ` Desbloqueaste ${logrosDesbloqueados.length} logro${logrosDesbloqueados.length !== 1 ? 's' : ''}!`;
    }

    return {
      progreso: resultado as never,
      recompensas: {
        xp_ganado,
        monedas_ganadas,
        gemas_ganadas,
        nivel_subido,
        nivel_actual,
        logros_desbloqueados: logrosDesbloqueados,
      },
      mensaje,
    };
  }

  // ============================================================================
  // CÁLCULOS DE RECOMPENSAS
  // ============================================================================

  /**
   * Calcula las recompensas basadas en el desempeño
   * Estrellas: 0-3
   * Porcentaje: 0-100
   */
  private calcularRecompensas(estrellas: number, porcentaje: number) {
    // Base rewards
    let xp_ganado = 0;
    let monedas_ganadas = 0;
    let gemas_ganadas: number | undefined = undefined;

    // Recompensas por porcentaje de aciertos
    if (porcentaje >= 90) {
      xp_ganado = 100;
      monedas_ganadas = 50;
    } else if (porcentaje >= 75) {
      xp_ganado = 75;
      monedas_ganadas = 35;
    } else if (porcentaje >= 60) {
      xp_ganado = 50;
      monedas_ganadas = 20;
    } else {
      xp_ganado = 25;
      monedas_ganadas = 10;
    }

    // Bonificación por estrellas
    const bonusEstrellas = estrellas * 15;
    xp_ganado += bonusEstrellas;
    monedas_ganadas += Math.floor(bonusEstrellas / 3);

    // Gemas solo con 3 estrellas y >95% aciertos
    if (estrellas === 3 && porcentaje >= 95) {
      gemas_ganadas = 5;
    } else if (estrellas === 3) {
      gemas_ganadas = 2;
    }

    return { xp_ganado, monedas_ganadas, gemas_ganadas };
  }

  /**
   * Calcula el nivel basado en XP total
   * Fórmula: nivel = floor(sqrt(XP / 100)) + 1
   * Niveles: 1-100
   */
  private calcularNivel(xp_total: number): number {
    return Math.floor(Math.sqrt(xp_total / 100)) + 1;
  }

  // ============================================================================
  // HISTORIAL Y ESTADÍSTICAS
  // ============================================================================

  /**
   * Obtiene el historial completo de progreso del estudiante
   */
  async obtenerHistorial(estudiante_id: string): Promise<HistorialProgresoEstudiante> {
    const [progresos, recursos] = await Promise.all([
      this.prisma.progresoEstudianteActividad.findMany({
        where: { estudiante_id },
        include: {
          actividad: {
            select: {
              id: true,
              titulo: true,
            },
          },
        },
        orderBy: { updated_at: 'desc' },
        take: 20,
      }),
      this.recursosService.obtenerOCrearRecursos(estudiante_id),
    ]);

    const completadas = progresos.filter((p) => p.completado).length;
    const enProgreso = progresos.filter((p) => p.iniciado && !p.completado).length;
    const tiempoTotal = progresos.reduce((sum, p) => sum + p.tiempo_total_minutos, 0);
    const puntosTotal = progresos.reduce((sum, p) => sum + p.puntos_obtenidos, 0);

    // Calcular racha (simplificado - días consecutivos)
    const mejorRacha = this.calcularMejorRacha(progresos);

    const ultimasActividades = progresos.slice(0, 10).map((p) => ({
      id: p.id,
      actividad_titulo: p.actividad.titulo,
      completado: p.completado,
      fecha: p.fecha_completado || p.fecha_inicio || p.created_at,
      puntos: p.puntos_obtenidos,
      estrellas: this.calcularEstrellas(p.mejor_puntaje),
    }));

    return {
      estudiante_id,
      actividades_completadas: completadas,
      actividades_en_progreso: enProgreso,
      tiempo_total_minutos: tiempoTotal,
      puntos_totales: puntosTotal,
      mejor_racha: mejorRacha,
      ultimas_actividades: ultimasActividades,
    };
  }

  /**
   * Calcula las estrellas basadas en el puntaje (0-100)
   */
  private calcularEstrellas(puntaje: number): number {
    if (puntaje >= 90) return 3;
    if (puntaje >= 75) return 2;
    if (puntaje >= 60) return 1;
    return 0;
  }

  /**
   * Calcula la mejor racha de días consecutivos completando actividades
   */
  private calcularMejorRacha(progresos: Array<{ completado: boolean; fecha_completado: Date | null }>): number {
    const fechasCompletadas = progresos
      .filter((p) => p.completado && p.fecha_completado)
      .map((p) => {
        const fecha = p.fecha_completado as Date;
        return fecha.toISOString().split('T')[0]; // Solo la fecha, sin hora
      })
      .sort();

    if (fechasCompletadas.length === 0) return 0;

    let rachaActual = 1;
    let mejorRacha = 1;

    for (let i = 1; i < fechasCompletadas.length; i++) {
      const fechaAnterior = new Date(fechasCompletadas[i - 1]);
      const fechaActual = new Date(fechasCompletadas[i]);
      const diffDias = Math.floor((fechaActual.getTime() - fechaAnterior.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDias === 1) {
        rachaActual++;
        mejorRacha = Math.max(mejorRacha, rachaActual);
      } else if (diffDias > 1) {
        rachaActual = 1;
      }
    }

    return mejorRacha;
  }

  /**
   * Obtiene el progreso de una actividad específica
   */
  async obtenerProgreso(estudiante_id: string, actividad_id: string, asignacion_id: string) {
    const progreso = await this.prisma.progresoEstudianteActividad.findUnique({
      where: {
        estudiante_id_actividad_id_asignacion_id: {
          estudiante_id,
          actividad_id,
          asignacion_id,
        },
      },
      include: {
        actividad: true,
      },
    });

    return progreso;
  }
}
