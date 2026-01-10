import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { MiProgresoResponseDto } from '../dto/mi-progreso-response.dto';

/**
 * Service Facade para el endpoint consolidado /estudiantes/mi-progreso
 *
 * Agrega datos de múltiples fuentes en una sola respuesta optimizada:
 * - Datos del estudiante
 * - XP, nivel, progreso
 * - Racha
 * - Logros recientes
 * - Actividad reciente
 *
 * Usa Promise.all para ejecutar queries en paralelo
 */
@Injectable()
export class MiProgresoService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene todos los datos de progreso del estudiante en una sola llamada
   */
  async getMiProgreso(estudianteId: string): Promise<MiProgresoResponseDto> {
    // Ejecutar todas las queries en paralelo
    const [estudiante, recursos, racha, logrosData, actividadesData] =
      await Promise.all([
        this.getEstudianteInfo(estudianteId),
        this.getRecursosConNivel(estudianteId),
        this.getRacha(estudianteId),
        this.getLogrosResumen(estudianteId),
        this.getActividadesRecientes(estudianteId),
      ]);

    return {
      estudiante,
      gamificacion: recursos,
      racha,
      logros: logrosData,
      actividad_reciente: actividadesData,
    };
  }

  /**
   * Obtiene datos básicos del estudiante
   */
  private async getEstudianteInfo(estudianteId: string) {
    const estudiante = await this.prisma.estudiante.findUniqueOrThrow({
      where: { id: estudianteId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        avatarUrl: true,
        casa: {
          select: {
            tipo: true,
          },
        },
      },
    });

    return {
      id: estudiante.id,
      nombre: estudiante.nombre,
      apellido: estudiante.apellido,
      avatarUrl: estudiante.avatarUrl,
      casa: estudiante.casa?.tipo ?? null,
    };
  }

  /**
   * Obtiene recursos con cálculo de nivel
   */
  private async getRecursosConNivel(estudianteId: string) {
    let recursos = await this.prisma.recursosEstudiante.findUnique({
      where: { estudiante_id: estudianteId },
    });

    // Si no existe, crear registro inicial
    if (!recursos) {
      recursos = await this.prisma.recursosEstudiante.create({
        data: {
          estudiante_id: estudianteId,
          xp_total: 0,
        },
      });
    }

    const xpTotal = recursos.xp_total;
    const nivel = this.calcularNivel(xpTotal);
    const xpParaSiguienteNivel = this.xpParaNivel(nivel + 1);
    const xpNivelActual = this.xpParaNivel(nivel);
    const xpProgreso = xpTotal - xpNivelActual;
    const xpNecesario = xpParaSiguienteNivel - xpNivelActual;

    return {
      xp_total: xpTotal,
      nivel,
      xp_progreso: xpProgreso,
      xp_necesario: xpNecesario,
      porcentaje_nivel:
        xpNecesario > 0 ? Math.floor((xpProgreso / xpNecesario) * 100) : 0,
    };
  }

  /**
   * Calcula nivel basado en XP
   * Fórmula: nivel = floor(sqrt(xp / 100)) + 1
   */
  private calcularNivel(xpTotal: number): number {
    return Math.floor(Math.sqrt(xpTotal / 100)) + 1;
  }

  /**
   * Calcula XP requerido para un nivel específico
   * Fórmula: xp = (nivel - 1)^2 * 100
   */
  private xpParaNivel(nivel: number): number {
    return Math.pow(nivel - 1, 2) * 100;
  }

  /**
   * Obtiene estadísticas de racha
   */
  private async getRacha(estudianteId: string) {
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

    return {
      racha_actual: racha.racha_actual,
      racha_maxima: racha.racha_maxima,
      total_dias_activos: racha.total_dias_activos,
      ultima_actividad: racha.ultima_actividad,
    };
  }

  /**
   * Obtiene resumen de logros con los últimos 5 desbloqueados
   */
  private async getLogrosResumen(estudianteId: string) {
    const [desbloqueados, totales, recientes] = await Promise.all([
      // Contar logros desbloqueados
      this.prisma.logroEstudiante.count({
        where: { estudiante_id: estudianteId },
      }),
      // Contar logros totales activos (no secretos)
      this.prisma.logro.count({
        where: { activo: true, secreto: false },
      }),
      // Obtener últimos 5 logros desbloqueados
      this.prisma.logroEstudiante.findMany({
        where: { estudiante_id: estudianteId },
        include: {
          logro: {
            select: {
              nombre: true,
              icono: true,
              rareza: true,
            },
          },
        },
        orderBy: { fecha_desbloqueo: 'desc' },
        take: 5,
      }),
    ]);

    return {
      desbloqueados,
      totales,
      recientes: recientes.map((le) => ({
        nombre: le.logro.nombre,
        icono: le.logro.icono,
        rareza: le.logro.rareza,
        fecha_desbloqueo: le.fecha_desbloqueo,
      })),
    };
  }

  /**
   * Obtiene las últimas 10 actividades del estudiante
   */
  private async getActividadesRecientes(estudianteId: string) {
    const actividades = await this.prisma.actividadFeed.findMany({
      where: { estudiante_id: estudianteId },
      select: {
        tipo: true,
        mensaje: true,
        xp_ganado: true,
        creado_en: true,
      },
      orderBy: { creado_en: 'desc' },
      take: 10,
    });

    return actividades.map((a) => ({
      tipo: a.tipo,
      mensaje: a.mensaje,
      xp_ganado: a.xp_ganado,
      creado_en: a.creado_en,
    }));
  }
}
