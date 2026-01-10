import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { EstadoAsistencia } from '@prisma/client';
import { PuntosService, TipoAccionPuntos } from './puntos.service';
import { LogrosService } from './logros.service';
import { RankingService } from './ranking.service';
import { RecursosService } from './services/recursos.service';
import { AsignarInsigniaDto } from './dto/asignar-insignia.dto';

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
    private recursosService: RecursosService,
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

    // Obtener información del nivel actual usando RecursosService
    const recursosConNivel =
      await this.recursosService.obtenerRecursosConNivel(estudianteId);
    const nivelInfo = this.formatNivelInfo(recursosConNivel);

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
        puntosToales: recursosConNivel.xp_total, // Ahora usa RecursosEstudiante.xp_total
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
   * Formatear información del nivel desde RecursosService
   * Reemplaza getNivelInfo que usaba NivelConfig (modelo eliminado)
   */
  private formatNivelInfo(recursos: {
    xp_total: number;
    nivel: number;
    xp_progreso: number;
    xp_necesario: number;
    porcentaje_nivel: number;
  }) {
    const nivelActual = recursos.nivel;
    const xpNivelActual = this.recursosService.xpParaNivel(nivelActual);
    const xpSiguienteNivel = this.recursosService.xpParaNivel(nivelActual + 1);

    return {
      nivelActual,
      nombre: this.getNombreNivel(nivelActual),
      descripcion: this.getDescripcionNivel(nivelActual),
      puntosActuales: recursos.xp_total,
      puntosMinimos: xpNivelActual,
      puntosMaximos: xpSiguienteNivel - 1,
      puntosParaSiguienteNivel: recursos.xp_necesario - recursos.xp_progreso,
      porcentajeProgreso: recursos.porcentaje_nivel,
      color: this.getColorNivel(nivelActual),
      icono: this.getIconoNivel(nivelActual),
      siguienteNivel: {
        nivel: nivelActual + 1,
        nombre: this.getNombreNivel(nivelActual + 1),
        puntosRequeridos: xpSiguienteNivel,
      },
    };
  }

  /**
   * Obtener nombre del nivel basado en número
   */
  private getNombreNivel(nivel: number): string {
    const nombres: Record<number, string> = {
      1: 'Explorador Numérico',
      2: 'Aprendiz Matemático',
      3: 'Calculador Novato',
      4: 'Estudiante Destacado',
      5: 'Matemático Junior',
      6: 'Experto en Números',
      7: 'Maestro Matemático',
      8: 'Genio Numérico',
      9: 'Leyenda Matemática',
      10: 'Campeón Supremo',
    };
    return nombres[nivel] || `Nivel ${nivel}`;
  }

  /**
   * Obtener descripción del nivel
   */
  private getDescripcionNivel(nivel: number): string {
    const descripciones: Record<number, string> = {
      1: 'Empezando tu viaje',
      2: 'Aprendiendo los fundamentos',
      3: 'Dominando operaciones básicas',
      4: 'Destacándote en clase',
      5: 'Resolviendo problemas complejos',
      6: 'Experto en múltiples áreas',
      7: 'Maestría en matemáticas',
      8: 'Genio en formación',
      9: 'Una leyenda viviente',
      10: 'El campeón supremo',
    };
    return descripciones[nivel] || 'Avanzando en tu camino';
  }

  /**
   * Obtener color del nivel
   */
  private getColorNivel(nivel: number): string {
    const colores: Record<number, string> = {
      1: '#10b981', // Verde
      2: '#3b82f6', // Azul
      3: '#8b5cf6', // Púrpura
      4: '#f59e0b', // Ámbar
      5: '#ef4444', // Rojo
      6: '#ec4899', // Rosa
      7: '#14b8a6', // Teal
      8: '#f97316', // Naranja
      9: '#6366f1', // Indigo
      10: '#fbbf24', // Dorado
    };
    return colores[nivel] || '#6b7280';
  }

  /**
   * Obtener icono del nivel
   */
  private getIconoNivel(nivel: number): string {
    const iconos: Record<number, string> = {
      1: '🌱',
      2: '📚',
      3: '🔢',
      4: '⭐',
      5: '🎯',
      6: '🏅',
      7: '👑',
      8: '💎',
      9: '🔥',
      10: '🏆',
    };
    return iconos[nivel] || '📊';
  }

  /**
   * Obtener configuración de todos los niveles
   * Reemplaza getAllNiveles que usaba NivelConfig (modelo eliminado)
   */
  getAllNiveles() {
    return Array.from({ length: 10 }, (_, i) => {
      const nivel = i + 1;
      return {
        nivel,
        nombre: this.getNombreNivel(nivel),
        descripcion: this.getDescripcionNivel(nivel),
        puntos_minimos: this.recursosService.xpParaNivel(nivel),
        puntos_maximos: this.recursosService.xpParaNivel(nivel + 1) - 1,
        color: this.getColorNivel(nivel),
        icono: this.getIconoNivel(nivel),
      };
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
   * Obtener tipos de acciones puntuables
   * @delegated PuntosService
   */
  getTiposAccion() {
    return this.puntosService.getTiposAccion();
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
    tipoAccion: TipoAccionPuntos,
    claseId?: string,
    contexto?: string,
  ) {
    return this.puntosService.otorgarPuntos(
      docenteId,
      estudianteId,
      tipoAccion,
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

  /**
   * Asignar una insignia predefinida a un estudiante durante clase en vivo
   * Registra los puntos con contexto de la insignia
   *
   * @param docenteId - ID del docente que asigna
   * @param dto - Datos de la insignia a asignar
   */
  async asignarInsignia(docenteId: string, dto: AsignarInsigniaDto) {
    const contexto = `Insignia: ${dto.nombre} - ${dto.descripcion} (ID: ${dto.insigniaId})`;

    return this.puntosService.otorgarPuntos(
      docenteId,
      dto.estudianteId,
      'LOGRO',
      dto.claseId,
      contexto,
      dto.puntos,
    );
  }
}
