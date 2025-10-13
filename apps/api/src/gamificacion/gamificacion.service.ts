import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';

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
                ruta_curricular: true,
                docente: {
                  select: { nombre: true, apellido: true },
                },
              },
            },
          },
        },
        asistencias: {
          orderBy: { fecha: 'desc' },
          take: 10,
          include: {
            clase: {
              include: {
                ruta_curricular: true,
              },
            },
          },
        },
      },
    });

    if (!estudiante) {
      throw new Error('Estudiante no encontrado');
    }

    // Calcular puntos totales
    const puntosAsistencia = estudiante.asistencias.filter(
      (a) => a.estado === 'Presente',
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
        ruta_curricular: true,
        docente: {
          select: { nombre: true, apellido: true },
        },
      },
      orderBy: { fecha_hora_inicio: 'asc' },
      take: 5,
    });

    // Ranking del equipo
    const equipoRanking = await this.getEquipoRanking(estudiante.equipo_id);

    return {
      estudiante: {
        id: estudiante.id,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        avatar: estudiante.avatar,
        equipo: estudiante.equipo,
      },
      stats: {
        puntosToales: puntosAsistencia + estudiante.puntos_extra,
        clasesAsistidas: estudiante.asistencias.filter((a) => a.estado === 'Presente')
          .length,
        clasesTotales: estudiante.inscripciones_clase.length,
        racha: await this.calcularRacha(estudianteId),
      },
      proximasClases,
      equipoRanking,
      ultimasAsistencias: estudiante.asistencias.slice(0, 5),
    };
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
        estado: 'Presente',
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
          include: { ruta_curricular: true },
        },
      },
    });

    const puntosAsistencia = asistencias.filter((a) => a.estado === 'Presente')
      .length * 10;

    // Puntos por ruta
    const puntosPorRuta: Record<string, number> = {};
    asistencias
      .filter((a) => a.estado === 'Presente')
      .forEach((a) => {
        const rutaNombre = a.clase.ruta_curricular?.nombre || 'General';
        puntosPorRuta[rutaNombre] = (puntosPorRuta[rutaNombre] || 0) + 10;
      });

    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      select: { puntos_extra: true },
    });

    return {
      total: puntosAsistencia + (estudiante?.puntos_extra || 0),
      asistencia: puntosAsistencia,
      extras: estudiante?.puntos_extra || 0,
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

    // Ranking del equipo
    const rankingEquipo = await this.getEquipoRanking(estudiante.equipo_id);

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
        const clasesTotales = await this.prisma.clase.countMany({
          where: { ruta_curricular_id: ruta.id },
        });

        const clasesAsistidas = await this.prisma.asistencia.count({
          where: {
            estudiante_id: estudianteId,
            estado: 'Presente',
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
        estado: 'Presente',
      },
      orderBy: { fecha: 'desc' },
      select: { fecha: true },
    });

    if (asistencias.length === 0) return 0;

    let racha = 1;
    for (let i = 1; i < asistencias.length; i++) {
      const diff =
        asistencias[i - 1].fecha.getTime() - asistencias[i].fecha.getTime();
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
      include: {
        asistencias: {
          where: { estado: 'Presente' },
        },
      },
    });

    return estudiantes
      .map((e) => ({
        id: e.id,
        nombre: e.nombre,
        apellido: e.apellido,
        avatar: e.avatar,
        puntos: e.asistencias.length * 10 + e.puntos_extra,
      }))
      .sort((a, b) => b.puntos - a.puntos);
  }

  /**
   * Ranking global
   */
  private async getRankingGlobal() {
    const estudiantes = await this.prisma.estudiante.findMany({
      include: {
        asistencias: {
          where: { estado: 'Presente' },
        },
        equipo: true,
      },
    });

    return estudiantes
      .map((e) => ({
        id: e.id,
        nombre: e.nombre,
        apellido: e.apellido,
        avatar: e.avatar,
        equipo: e.equipo,
        puntos: e.asistencias.length * 10 + e.puntos_extra,
      }))
      .sort((a, b) => b.puntos - a.puntos);
  }
}
