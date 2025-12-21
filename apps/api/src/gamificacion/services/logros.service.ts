import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { RecursosService } from './recursos.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class LogrosService {
  constructor(
    private prisma: PrismaService,
    private recursosService: RecursosService,
  ) {}

  /**
   * Obtener todos los logros disponibles
   */
  async obtenerLogros(params?: {
    categoria?: string;
    rareza?: string;
    activo?: boolean;
  }) {
    const where: Prisma.LogroWhereInput = {};

    if (params?.categoria) {
      where.categoria = params.categoria;
    }

    if (params?.rareza) {
      where.rareza = params.rareza;
    }

    if (params?.activo !== undefined) {
      where.activo = params.activo;
    }

    return this.prisma.logro.findMany({
      where,
      orderBy: { orden: 'asc' },
    });
  }

  /**
   * Obtener logros de un estudiante
   */
  async obtenerLogrosEstudiante(estudianteId: string) {
    const logrosDesbloqueados = await this.prisma.logroEstudiante.findMany({
      where: { estudiante_id: estudianteId },
      include: {
        logro: true,
      },
      orderBy: { fecha_desbloqueo: 'desc' },
    });

    return logrosDesbloqueados;
  }

  /**
   * Obtener progreso de logros (desbloqueados vs totales)
   */
  async obtenerProgresoLogros(estudianteId: string) {
    const [logrosDesbloqueados, logrosActivos] = await Promise.all([
      this.prisma.logroEstudiante.count({
        where: { estudiante_id: estudianteId },
      }),
      this.prisma.logro.count({
        where: { activo: true, secreto: false },
      }),
    ]);

    const porcentaje = Math.floor((logrosDesbloqueados / logrosActivos) * 100);

    return {
      desbloqueados: logrosDesbloqueados,
      totales: logrosActivos,
      porcentaje,
    };
  }

  /**
   * Desbloquear logro para un estudiante
   */
  async desbloquearLogro(estudianteId: string, codigoLogro: string) {
    // Buscar logro
    const logro = await this.prisma.logro.findUnique({
      where: { codigo: codigoLogro },
    });

    if (!logro) {
      throw new Error(`Logro ${codigoLogro} no encontrado`);
    }

    // Verificar si ya está desbloqueado
    const yaDesbloqueado = await this.prisma.logroEstudiante.findUnique({
      where: {
        estudiante_id_logro_id: {
          estudiante_id: estudianteId,
          logro_id: logro.id,
        },
      },
    });

    if (yaDesbloqueado) {
      return {
        logro_desbloqueado: yaDesbloqueado,
        ya_desbloqueado: true,
      };
    }

    // Desbloquear logro
    const logroDesbloqueado = await this.prisma.logroEstudiante.create({
      data: {
        estudiante_id: estudianteId,
        logro_id: logro.id,
        visto: false,
      },
      include: {
        logro: true,
      },
    });

    // Otorgar recompensas (solo XP)
    const resultadoXP = await this.recursosService.agregarXP(
      estudianteId,
      logro.xp_recompensa,
      `Logro desbloqueado: ${logro.nombre}`,
      { logro_id: logro.id },
    );

    return {
      logro_desbloqueado: logroDesbloqueado,
      ya_desbloqueado: false,
      recompensas: {
        xp: logro.xp_recompensa,
      },
      subio_nivel: resultadoXP.subio_nivel,
      nivel_nuevo: resultadoXP.nivel_nuevo,
    };
  }

  /**
   * Marcar logro como visto
   */
  async marcarLogroVisto(estudianteId: string, logroId: string) {
    return this.prisma.logroEstudiante.updateMany({
      where: {
        estudiante_id: estudianteId,
        logro_id: logroId,
      },
      data: {
        visto: true,
      },
    });
  }

  /**
   * Obtener logros no vistos (para notificaciones)
   */
  async obtenerLogrosNoVistos(estudianteId: string) {
    return this.prisma.logroEstudiante.findMany({
      where: {
        estudiante_id: estudianteId,
        visto: false,
      },
      include: {
        logro: true,
      },
      orderBy: {
        fecha_desbloqueo: 'desc',
      },
    });
  }

  /**
   * Obtener logros por categoría con progreso
   */
  async obtenerLogrosPorCategoria(estudianteId: string) {
    // Obtener todas las categorías
    const categorias = await this.prisma.logro.groupBy({
      by: ['categoria'],
      where: { activo: true },
    });

    const resultado = [];

    for (const { categoria } of categorias) {
      const [logros, desbloqueados] = await Promise.all([
        this.prisma.logro.findMany({
          where: { categoria, activo: true },
        }),
        this.prisma.logroEstudiante.count({
          where: {
            estudiante_id: estudianteId,
            logro: { categoria, activo: true },
          },
        }),
      ]);

      resultado.push({
        categoria,
        total: logros.length,
        desbloqueados,
        porcentaje: Math.floor((desbloqueados / logros.length) * 100),
      });
    }

    return resultado;
  }

  /**
   * Obtener estadísticas de logros por rareza
   */
  async obtenerEstadisticasRareza(estudianteId: string) {
    const rarezas = ['comun', 'raro', 'epico', 'legendario'];
    const resultado = [];

    for (const rareza of rarezas) {
      const [total, desbloqueados] = await Promise.all([
        this.prisma.logro.count({
          where: { rareza, activo: true },
        }),
        this.prisma.logroEstudiante.count({
          where: {
            estudiante_id: estudianteId,
            logro: { rareza, activo: true },
          },
        }),
      ]);

      resultado.push({
        rareza,
        total,
        desbloqueados,
        porcentaje: total > 0 ? Math.floor((desbloqueados / total) * 100) : 0,
      });
    }

    return resultado;
  }
}
