import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { EstadoAsistencia } from '@prisma/client';
import { PuntosService } from './puntos.service';
import { LogrosService } from './logros.service';
import { RankingService } from './ranking.service';

/**
 * Servicio de Gamificación (Coordinador)
 * Orquesta los servicios de puntos, logros y ranking
 * Gestiona el dashboard, niveles y progreso del estudiante
 */
@Injectable()
export class GamificacionService {
  constructor(
    private prisma: PrismaService,
    private puntosService: PuntosService,
    private logrosService: LogrosService,
    private rankingService: RankingService,
  ) {}

  /**
   * Dashboard completo del estudiante
   * Orquesta información de múltiples servicios
   */
  async getDashboardEstudiante(estudianteId: string) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      include: {
        equipo: true,
        tutor: {
          select: { nombre: true, apellido: true },
        },
        inscripciones_clase: {
          include: {
            clase: {
              include: {
                rutaCurricular: true,
                docente: {
                  select: { nombre: true, apellido: true },
                },
              },
            },
          },
        },
        asistencias: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            clase: {
              include: {
                rutaCurricular: true,
              },
            },
          },
        },
      },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Obtener información del nivel actual
    const nivelInfo = await this.getNivelInfo(estudiante.puntos_totales);

    // Calcular puntos totales basados en asistencias
    const puntosAsistencia = estudiante.asistencias.filter(
      (a) => a.estado === EstadoAsistencia.Presente,
    ).length * 10;

    // Calcular próximas clases
    const proximasClases = await this.prisma.clase.findMany({
      where: {
        inscripciones: {
          some: { estudiante_id: estudianteId },
        },
        fecha_hora_inicio: {
          gte: new Date(),
        },
        estado: 'Programada',
      },
      include: {
        rutaCurricular: true,
        docente: {
          select: { nombre: true, apellido: true },
        },
      },
      orderBy: { fecha_hora_inicio: 'asc' },
      take: 5,
    });

    // Ranking del equipo (solo si tiene equipo) - delegado al RankingService
    const equipoRanking = estudiante.equipo_id
      ? await this.rankingService.getEquipoRanking(estudiante.equipo_id)
      : [];

    return {
      estudiante: {
        id: estudiante.id,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        foto_url: estudiante.foto_url,
        avatar_url: estudiante.avatar_url,
        equipo: estudiante.equipo,
      },
      stats: {
        puntosTotales: estudiante.puntos_totales,
        clasesAsistidas: estudiante.asistencias.filter(
          (a) => a.estado === EstadoAsistencia.Presente,
        ).length,
        clasesTotales: estudiante.inscripciones_clase.length,
        racha: await this.logrosService.calcularRacha(estudianteId),
      },
      nivel: nivelInfo,
      proximasClases,
      equipoRanking,
      ultimasAsistencias: estudiante.asistencias.slice(0, 5),
    };
  }

  /**
   * Obtener información del nivel basado en los puntos totales
   */
  async getNivelInfo(puntosActuales: number) {
    // Buscar el nivel actual del estudiante
    const nivelActual = await this.prisma.nivelConfig.findFirst({
      where: {
        puntos_minimos: { lte: puntosActuales },
        puntos_maximos: { gte: puntosActuales },
      },
    });

    // Buscar el siguiente nivel
    const siguienteNivel = await this.prisma.nivelConfig.findFirst({
      where: {
        nivel: { gt: nivelActual?.nivel || 1 },
      },
      orderBy: { nivel: 'asc' },
    });

    if (!nivelActual) {
      // Si no hay nivel configurado, retornar nivel 1 por defecto
      return {
        nivelActual: 1,
        nombre: 'Explorador Numérico',
        descripcion: 'Empezando tu viaje',
        puntosActuales,
        puntosMinimos: 0,
        puntosMaximos: 499,
        puntosParaSiguienteNivel: 500 - puntosActuales,
        porcentajeProgreso: (puntosActuales / 500) * 100,
        color: '#10b981',
        icono: '🌱',
        siguienteNivel: {
          nivel: 2,
          nombre: 'Aprendiz Matemático',
          puntosRequeridos: 500,
        },
      };
    }

    const puntosEnNivel = puntosActuales - nivelActual.puntos_minimos;
    const puntosNecesariosEnNivel =
      nivelActual.puntos_maximos - nivelActual.puntos_minimos;
    const porcentajeProgreso = (puntosEnNivel / puntosNecesariosEnNivel) * 100;

    return {
      nivelActual: nivelActual.nivel,
      nombre: nivelActual.nombre,
      descripcion: nivelActual.descripcion,
      puntosActuales,
      puntosMinimos: nivelActual.puntos_minimos,
      puntosMaximos: nivelActual.puntos_maximos,
      puntosParaSiguienteNivel: siguienteNivel
        ? siguienteNivel.puntos_minimos - puntosActuales
        : 0,
      porcentajeProgreso: Math.min(Math.round(porcentajeProgreso), 100),
      color: nivelActual.color,
      icono: nivelActual.icono,
      siguienteNivel: siguienteNivel
        ? {
            nivel: siguienteNivel.nivel,
            nombre: siguienteNivel.nombre,
            puntosRequeridos: siguienteNivel.puntos_minimos,
          }
        : null,
    };
  }

  /**
   * Obtener todos los niveles configurados
   */
  async getAllNiveles() {
    return this.prisma.nivelConfig.findMany({
      orderBy: { nivel: 'asc' },
    });
  }

  /**
   * Obtener progreso por ruta curricular
   */
  async getProgresoEstudiante(estudianteId: string) {
    const rutas = await this.prisma.rutaCurricular.findMany();

    const progresoPorRuta = await Promise.all(
      rutas.map(async (ruta) => {
        const clasesTotales = await this.prisma.clase.count({
          where: { ruta_curricular_id: ruta.id },
        });

        const clasesAsistidas = await this.prisma.asistencia.count({
          where: {
            estudiante_id: estudianteId,
            estado: EstadoAsistencia.Presente,
            clase: {
              ruta_curricular_id: ruta.id,
            },
          },
        });

        const porcentaje =
          clasesTotales > 0 ? (clasesAsistidas / clasesTotales) * 100 : 0;

        return {
          ruta: ruta.nombre,
          color: ruta.color,
          clasesAsistidas,
          clasesTotales,
          porcentaje: Math.round(porcentaje),
        };
      }),
    );

    return progresoPorRuta;
  }

  // === DELEGATION METHODS ===
  // Métodos que delegan a servicios especializados

  /**
   * Obtener logros del estudiante
   * @delegated LogrosService
   */
  async getLogrosEstudiante(estudianteId: string) {
    return this.logrosService.getLogrosEstudiante(estudianteId);
  }

  /**
   * Desbloquear logro
   * @delegated LogrosService
   */
  async desbloquearLogro(estudianteId: string, logroId: string) {
    return this.logrosService.desbloquearLogro(estudianteId, logroId);
  }

  /**
   * Obtener puntos del estudiante
   * @delegated PuntosService
   */
  async getPuntosEstudiante(estudianteId: string) {
    return this.puntosService.getPuntosEstudiante(estudianteId);
  }

  /**
   * Obtener acciones puntuables
   * @delegated PuntosService
   */
  async getAccionesPuntuables() {
    return this.puntosService.getAccionesPuntuables();
  }

  /**
   * Obtener historial de puntos
   * @delegated PuntosService
   */
  async getHistorialPuntos(estudianteId: string) {
    return this.puntosService.getHistorialPuntos(estudianteId);
  }

  /**
   * Otorgar puntos a un estudiante
   * @delegated PuntosService
   */
  async otorgarPuntos(
    docenteId: string,
    estudianteId: string,
    accionId: string,
    claseId?: string,
    contexto?: string,
  ) {
    return this.puntosService.otorgarPuntos(
      docenteId,
      estudianteId,
      accionId,
      claseId,
      contexto,
    );
  }

  /**
   * Obtener ranking del estudiante
   * @delegated RankingService
   */
  async getRankingEstudiante(estudianteId: string) {
    return this.rankingService.getRankingEstudiante(estudianteId);
  }
}
