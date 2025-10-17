import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { EstadoAsistencia } from '@prisma/client';

/**
 * Servicio de Logros
 * Gestiona el sistema de logros/achievements: desbloqueo, progreso y tracking
 */
@Injectable()
export class LogrosService {
  constructor(private prisma: PrismaService) {}

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

  /**
   * Calcular racha de asistencia
   * Retorna el número de días consecutivos con asistencia
   */
  async calcularRacha(estudianteId: string): Promise<number> {
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
}
