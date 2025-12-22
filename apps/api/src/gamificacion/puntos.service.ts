import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { EstadoAsistencia } from '@prisma/client';
import { RecursosService } from './services/recursos.service';

/**
 * Tipos de acciones que otorgan puntos
 * Reemplaza el modelo AccionPuntuable eliminado
 */
export type TipoAccionPuntos =
  | 'ASISTENCIA'
  | 'PARTICIPACION'
  | 'LOGRO'
  | 'BONUS'
  | 'TAREA_COMPLETADA'
  | 'QUIZ_APROBADO'
  | 'AYUDA_COMPANERO';

/**
 * Configuración de puntos por tipo de acción
 */
const PUNTOS_POR_ACCION: Record<TipoAccionPuntos, number> = {
  ASISTENCIA: 10,
  PARTICIPACION: 5,
  LOGRO: 50,
  BONUS: 20,
  TAREA_COMPLETADA: 15,
  QUIZ_APROBADO: 25,
  AYUDA_COMPANERO: 10,
};

/**
 * Servicio de Puntos
 * Gestiona el sistema de puntos: asignación, historial y tipos de acciones
 *
 * Refactorizado para:
 * - Usar RecursosService.agregarXP() en lugar de puntos_totales directo
 * - Usar tipo_accion (string) en lugar de FK a AccionPuntuable
 */
@Injectable()
export class PuntosService {
  constructor(
    private prisma: PrismaService,
    private recursosService: RecursosService,
  ) {}

  /**
   * Obtener tipos de acciones puntuables disponibles
   * Reemplaza getAccionesPuntuables() que usaba modelo eliminado
   */
  getTiposAccion(): Array<{ tipo: TipoAccionPuntos; puntos: number }> {
    return Object.entries(PUNTOS_POR_ACCION).map(([tipo, puntos]) => ({
      tipo: tipo as TipoAccionPuntos,
      puntos,
    }));
  }

  /**
   * Obtener historial de puntos otorgados a un estudiante
   */
  async getHistorialPuntos(estudianteId: string) {
    return this.prisma.puntoObtenido.findMany({
      where: { estudiante_id: estudianteId },
      include: {
        docente: {
          select: { nombre: true, apellido: true },
        },
        clase: {
          select: {
            id: true,
            nombre: true,
            fecha_hora_inicio: true,
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
   *
   * @param docenteId - ID del docente que otorga
   * @param estudianteId - ID del estudiante que recibe
   * @param tipoAccion - Tipo de acción (ASISTENCIA, PARTICIPACION, etc.)
   * @param claseId - ID de la clase (opcional)
   * @param contexto - Descripción adicional (opcional)
   * @param puntosCustom - Puntos personalizados (opcional, usa default si no se especifica)
   */
  async otorgarPuntos(
    docenteId: string,
    estudianteId: string,
    tipoAccion: TipoAccionPuntos,
    claseId?: string,
    contexto?: string,
    puntosCustom?: number,
  ) {
    const puntos = puntosCustom ?? PUNTOS_POR_ACCION[tipoAccion];

    if (puntos <= 0) {
      throw new BadRequestException('Los puntos deben ser mayores a 0');
    }

    // 1. Validar que el estudiante existe
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      select: { id: true, nombre: true, apellido: true },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // 2. Validar que el docente existe
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
      select: { id: true, nombre: true, apellido: true },
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    // 3. Si se especifica clase_id, validar que existe
    if (claseId) {
      const clase = await this.prisma.clase.findUnique({
        where: { id: claseId },
      });

      if (!clase) {
        throw new NotFoundException('Clase no encontrada');
      }
    }

    // 4. Crear registro de punto obtenido
    const puntoObtenido = await this.prisma.puntoObtenido.create({
      data: {
        estudiante_id: estudianteId,
        docente_id: docenteId,
        tipo_accion: tipoAccion,
        clase_id: claseId,
        puntos,
        contexto,
      },
      include: {
        estudiante: {
          select: { id: true, nombre: true, apellido: true },
        },
        docente: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    });

    // 5. Actualizar XP usando RecursosService (unificado)
    const resultadoXP = await this.recursosService.agregarXP(
      estudianteId,
      puntos,
      tipoAccion,
      {
        punto_obtenido_id: puntoObtenido.id,
        docente_id: docenteId,
        clase_id: claseId,
      },
    );

    return {
      success: true,
      puntoObtenido,
      xp: resultadoXP,
      mensaje: `Se otorgaron ${puntos} puntos a ${estudiante.nombre} ${estudiante.apellido}`,
    };
  }

  /**
   * Obtener puntos del estudiante
   * Ahora usa RecursosEstudiante.xp_total como fuente única
   */
  async getPuntosEstudiante(estudianteId: string) {
    // Obtener recursos (XP total)
    const recursos =
      await this.recursosService.obtenerRecursosConNivel(estudianteId);

    // Calcular puntos por asistencia
    const asistencias = await this.prisma.asistencia.findMany({
      where: { estudiante_id: estudianteId },
      include: {
        clase: {
          select: { id: true, nombre: true },
        },
      },
    });

    const puntosAsistencia =
      asistencias.filter((a) => a.estado === EstadoAsistencia.Presente).length *
      PUNTOS_POR_ACCION.ASISTENCIA;

    // Puntos por clase
    const puntosPorClase: Record<string, number> = {};
    asistencias
      .filter((a) => a.estado === EstadoAsistencia.Presente)
      .forEach((a) => {
        const claseNombre = a.clase.nombre || 'General';
        puntosPorClase[claseNombre] =
          (puntosPorClase[claseNombre] || 0) + PUNTOS_POR_ACCION.ASISTENCIA;
      });

    return {
      total: recursos.xp_total,
      nivel: recursos.nivel,
      porcentaje_nivel: recursos.porcentaje_nivel,
      asistencia: puntosAsistencia,
      extras: recursos.xp_total - puntosAsistencia,
      porClase: puntosPorClase,
    };
  }
}
