import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { EstadoAsistencia } from '@prisma/client';

/**
 * Servicio de Gamificación
 * Lógica de negocio para logros, puntos y ranking
 */
@Injectable()
export class GamificacionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Dashboard completo del estudiante
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
      throw new Error('Estudiante no encontrado');
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

    // Ranking del equipo (solo si tiene equipo)
    const equipoRanking = estudiante.equipo_id
      ? await this.getEquipoRanking(estudiante.equipo_id)
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
        puntosToales: estudiante.puntos_totales,
        clasesAsistidas: estudiante.asistencias.filter(
          (a) => a.estado === EstadoAsistencia.Presente,
        ).length,
        clasesTotales: estudiante.inscripciones_clase.length,
        racha: await this.calcularRacha(estudianteId),
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
   * Obtener logros del estudiante
   */
  async getLogrosEstudiante(estudianteId: string) {
    // Logros predefinidos
    const logrosDefinidos = [
      {
        id: 'primera-clase',
        nombre: 'Primera Clase',
        descripcion: 'Asististe a tu primera clase',
        icono: '🎓',
        puntos: 50,
        categoria: 'inicio',
      },
      {
        id: 'asistencia-perfecta',
        nombre: 'Asistencia Perfecta',
        descripcion: 'Asististe a todas las clases de la semana',
        icono: '⭐',
        puntos: 100,
        categoria: 'asistencia',
      },
      {
        id: '10-clases',
        nombre: '10 Clases Completadas',
        descripcion: 'Completaste 10 clases',
        icono: '🔥',
        puntos: 150,
        categoria: 'progreso',
      },
      {
        id: 'maestro-algebra',
        nombre: 'Maestro del Álgebra',
        descripcion: 'Completaste el 100% de Álgebra',
        icono: '📐',
        puntos: 200,
        categoria: 'maestria',
      },
      {
        id: 'ayudante',
        nombre: 'Compañero Solidario',
        descripcion: 'Ayudaste a 5 compañeros',
        icono: '🤝',
        puntos: 120,
        categoria: 'social',
      },
      {
        id: 'racha-7',
        nombre: 'Racha de 7 Días',
        descripcion: 'Asististe 7 días consecutivos',
        icono: '🔥',
        puntos: 180,
        categoria: 'racha',
      },
      {
        id: 'racha-30',
        nombre: 'Racha de 30 Días',
        descripcion: 'Asististe 30 días consecutivos',
        icono: '🔥🔥',
        puntos: 500,
        categoria: 'racha',
      },
      {
        id: 'mvp-mes',
        nombre: 'MVP del Mes',
        descripcion: 'Fuiste el estudiante con más puntos del mes',
        icono: '👑',
        puntos: 300,
        categoria: 'elite',
      },
    ];

    // Verificar cuáles están desbloqueados
    const asistencias = await this.prisma.asistencia.findMany({
      where: {
        estudiante_id: estudianteId,
        estado: EstadoAsistencia.Presente,
      },
    });

    const logrosDesbloqueados: string[] = [];

    // Primera clase
    if (asistencias.length >= 1) logrosDesbloqueados.push('primera-clase');

    // 10 clases
    if (asistencias.length >= 10) logrosDesbloqueados.push('10-clases');

    // Racha de 7 días
    const racha = await this.calcularRacha(estudianteId);
    if (racha >= 7) logrosDesbloqueados.push('racha-7');
    if (racha >= 30) logrosDesbloqueados.push('racha-30');

    return logrosDefinidos.map((logro) => ({
      ...logro,
      desbloqueado: logrosDesbloqueados.includes(logro.id),
      fecha_desbloqueo: logrosDesbloqueados.includes(logro.id)
        ? new Date()
        : null,
    }));
  }

  /**
   * Obtener puntos del estudiante
   */
  async getPuntosEstudiante(estudianteId: string) {
    const asistencias = await this.prisma.asistencia.findMany({
      where: { estudiante_id: estudianteId },
      include: {
        clase: {
          include: { rutaCurricular: true },
        },
      },
    });

    const puntosAsistencia = asistencias.filter(
      (a) => a.estado === EstadoAsistencia.Presente,
    ).length * 10;

    // Puntos por ruta
    const puntosPorRuta: Record<string, number> = {};
    asistencias
      .filter((a) => a.estado === EstadoAsistencia.Presente)
      .forEach((a) => {
        const rutaNombre = a.clase.rutaCurricular?.nombre || 'General';
        puntosPorRuta[rutaNombre] = (puntosPorRuta[rutaNombre] || 0) + 10;
      });

    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      select: { puntos_totales: true },
    });

    return {
      total: estudiante?.puntos_totales || 0,
      asistencia: puntosAsistencia,
      extras: (estudiante?.puntos_totales || 0) - puntosAsistencia,
      porRuta: puntosPorRuta,
    };
  }

  /**
   * Obtener ranking del estudiante
   */
  async getRankingEstudiante(estudianteId: string) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      include: { equipo: true },
    });

    if (!estudiante) {
      throw new Error('Estudiante no encontrado');
    }

    // Ranking del equipo (solo si tiene equipo)
    const rankingEquipo = estudiante.equipo_id
      ? await this.getEquipoRanking(estudiante.equipo_id)
      : [];

    // Ranking global
    const rankingGlobal = await this.getRankingGlobal();

    const posicionEquipo =
      rankingEquipo.findIndex((e) => e.id === estudianteId) + 1;
    const posicionGlobal =
      rankingGlobal.findIndex((e) => e.id === estudianteId) + 1;

    return {
      equipoActual: estudiante.equipo,
      posicionEquipo,
      posicionGlobal,
      rankingEquipo: rankingEquipo.slice(0, 10),
      rankingGlobal: rankingGlobal.slice(0, 20),
    };
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

  /**
   * Obtener acciones puntuables disponibles
   * Para mostrar en el UI del docente
   */
  async getAccionesPuntuables() {
    return this.prisma.accionPuntuable.findMany({
      where: { activo: true },
      orderBy: { puntos: 'desc' },
    });
  }

  /**
   * Obtener historial de puntos otorgados a un estudiante
   */
  async getHistorialPuntos(estudianteId: string) {
    return this.prisma.puntoObtenido.findMany({
      where: { estudiante_id: estudianteId },
      include: {
        accion: true,
        docente: {
          select: { nombre: true, apellido: true },
        },
        clase: {
          select: {
            id: true,
            fecha_hora_inicio: true,
            rutaCurricular: {
              select: { nombre: true, color: true },
            },
          },
        },
      },
      orderBy: { fecha_otorgado: 'desc' },
      take: 50,
    });
  }

  /**
   * Otorgar puntos a un estudiante
   * Llamado por docentes para premiar acciones destacadas
   */
  async otorgarPuntos(
    docenteId: string,
    estudianteId: string,
    accionId: string,
    claseId?: string,
    contexto?: string,
  ) {
    // 1. Validar que la acción existe y está activa
    const accion = await this.prisma.accionPuntuable.findUnique({
      where: { id: accionId },
    });

    if (!accion || !accion.activo) {
      throw new Error('Acción puntuable no encontrada o inactiva');
    }

    // 2. Validar que el estudiante existe
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
    });

    if (!estudiante) {
      throw new Error('Estudiante no encontrado');
    }

    // 3. Validar que el docente existe
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
    });

    if (!docente) {
      throw new Error('Docente no encontrado');
    }

    // 4. Si se especifica clase_id, validar que existe y que el estudiante está inscrito
    if (claseId) {
      const clase = await this.prisma.clase.findUnique({
        where: { id: claseId },
        include: {
          inscripciones: {
            where: { estudiante_id: estudianteId },
          },
        },
      });

      if (!clase) {
        throw new Error('Clase no encontrada');
      }

      if (clase.inscripciones.length === 0) {
        throw new Error('El estudiante no está inscrito en esta clase');
      }
    }

    // 5. Crear registro de punto obtenido
    const puntoObtenido = await this.prisma.puntoObtenido.create({
      data: {
        estudiante_id: estudianteId,
        docente_id: docenteId,
        accion_id: accionId,
        clase_id: claseId,
        puntos: accion.puntos,
        contexto: contexto,
      },
      include: {
        accion: true,
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            puntos_totales: true,
          },
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    // 6. Actualizar puntos_totales del estudiante
    await this.prisma.estudiante.update({
      where: { id: estudianteId },
      data: {
        puntos_totales: {
          increment: accion.puntos,
        },
      },
    });

    return {
      success: true,
      puntoObtenido,
      mensaje: `Se otorgaron ${accion.puntos} puntos a ${estudiante.nombre} ${estudiante.apellido}`,
    };
  }

  /**
   * Desbloquear logro
   */
  async desbloquearLogro(estudianteId: string, logroId: string) {
    // Por ahora solo simulado
    // En producción, guardar en tabla LogrosEstudiante
    return {
      success: true,
      logro: logroId,
      estudiante: estudianteId,
    };
  }

  // === HELPERS ===

  /**
   * Calcular racha de asistencia
   */
  private async calcularRacha(estudianteId: string): Promise<number> {
    const asistencias = await this.prisma.asistencia.findMany({
      where: {
        estudiante_id: estudianteId,
        estado: EstadoAsistencia.Presente,
      },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    if (asistencias.length === 0) return 0;

    let racha = 1;
    for (let i = 1; i < asistencias.length; i++) {
      const diff =
        asistencias[i - 1].createdAt.getTime() -
        asistencias[i].createdAt.getTime();
      const days = diff / (1000 * 60 * 60 * 24);

      if (days <= 1.5) {
        // Tolerancia de 1.5 días
        racha++;
      } else {
        break;
      }
    }

    return racha;
  }

  /**
   * Ranking del equipo
   */
  private async getEquipoRanking(equipoId: string) {
    const estudiantes = await this.prisma.estudiante.findMany({
      where: { equipo_id: equipoId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        foto_url: true,
        puntos_totales: true,
      },
      orderBy: {
        puntos_totales: 'desc',
      },
    });

    return estudiantes.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      apellido: e.apellido,
      avatar: e.foto_url,
      puntos: e.puntos_totales,
    }));
  }

  /**
   * Ranking global
   */
  private async getRankingGlobal() {
    const estudiantes = await this.prisma.estudiante.findMany({
      include: {
        equipo: true,
      },
      orderBy: {
        puntos_totales: 'desc',
      },
    });

    return estudiantes.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      apellido: e.apellido,
      avatar: e.foto_url,
      equipo: e.equipo,
      puntos: e.puntos_totales,
    }));
  }
}
