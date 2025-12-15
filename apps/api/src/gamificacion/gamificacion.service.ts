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
   *
   * OPTIMIZACIÓN SELECT:
   * - ANTES: Cargaba objetos completos (casa, rutaCurricular, clase)
   * - AHORA: Select solo campos necesarios
   * - Reducción: ~60-70% del payload size
   */
  async getDashboardEstudiante(estudianteId: string) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        fotoUrl: true,
        avatar_gradient: true,
        puntos_totales: true,
        casaId: true,
        casa: {
          select: {
            id: true,
            nombre: true,
            colorPrimary: true,
          },
        },
        tutor: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        inscripciones_clase: {
          select: {
            id: true,
            clase: {
              select: {
                id: true,
                nombre: true,
                fecha_hora_inicio: true,
                estado: true,
                docente: {
                  select: {
                    nombre: true,
                    apellido: true,
                  },
                },
              },
            },
          },
        },
        asistencias: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            estado: true,
            createdAt: true,
            clase: {
              select: {
                id: true,
                nombre: true,
                fecha_hora_inicio: true,
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
    const _puntosAsistencia =
      estudiante.asistencias.filter(
        (a) => a.estado === EstadoAsistencia.Presente,
      ).length * 10;

    // Calcular próximas clases (select optimizado)
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
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        fecha_hora_inicio: true,
        estado: true,
        docente: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: { fecha_hora_inicio: 'asc' },
      take: 5,
    });

    // Ranking de la casa (solo si tiene casa) - delegado al RankingService
    const casaRanking = estudiante.casaId
      ? await this.rankingService.getCasaRanking(estudiante.casaId)
      : [];

    return {
      estudiante: {
        id: estudiante.id,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        fotoUrl: estudiante.fotoUrl,
        avatar_gradient: estudiante.avatar_gradient,
        casa: estudiante.casa
          ? {
              id: estudiante.casa.id,
              nombre: estudiante.casa.nombre,
              color: estudiante.casa.colorPrimary,
            }
          : null,
      },
      stats: {
        puntosToales: estudiante.puntos_totales, // typo intencional para match con schema
        clasesAsistidas: estudiante.asistencias.filter(
          (a) => a.estado === EstadoAsistencia.Presente,
        ).length,
        clasesTotales: estudiante.inscripciones_clase.length,
        racha: await this.logrosService.calcularRacha(estudianteId),
      },
      nivel: nivelInfo,
      proximasClases,
      casaRanking,
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
   * Obtener progreso por clase del estudiante
   * (Anteriormente usaba rutas curriculares, ahora simplificado)
   */
  getProgresoEstudiante(_estudianteId: string): Array<{
    clase: string;
    clasesAsistidas: number;
    clasesTotales: number;
    porcentaje: number;
  }> {
    // Sistema de rutas curriculares eliminado
    // Retorna array vacío hasta que se implemente nuevo sistema de progreso
    return [];
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
  desbloquearLogro(estudianteId: string, logroId: string) {
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
