import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { EstadoAsistencia } from '@prisma/client';

/**
 * Servicio de Puntos
 * Gestiona el sistema de puntos: asignación, historial y acciones puntuables
 */
@Injectable()
export class PuntosService {
  constructor(private prisma: PrismaService) {}

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
   * ⚠️ SECURITY: Usa transacción para garantizar atomicidad
   */
  async otorgarPuntos(
    docenteId: string,
    estudianteId: string,
    accionId: string,
    claseId?: string,
    contexto?: string,
  ) {
    // 1. Validar que la acción existe y está activa (fuera de transacción para performance)
    const accion = await this.prisma.accionPuntuable.findUnique({
      where: { id: accionId },
    });

    if (!accion || !accion.activo) {
      throw new NotFoundException('Acción puntuable no encontrada o inactiva');
    }

    // 2. Validar que el estudiante existe (fuera de transacción para performance)
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // 3. Validar que el docente existe (fuera de transacción para performance)
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
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
        throw new NotFoundException('Clase no encontrada');
      }

      if (clase.inscripciones.length === 0) {
        throw new BadRequestException(
          'El estudiante no está inscrito en esta clase',
        );
      }
    }

    // ✅ SECURITY FIX: Envolver creación de punto y actualización de totales en transacción
    // Garantiza atomicidad: o ambas operaciones se completan, o ninguna
    const puntoObtenido = await this.prisma.$transaction(async (tx) => {
      // 5. Crear registro de punto obtenido
      const nuevoPunto = await tx.puntoObtenido.create({
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

      // 6. Actualizar puntos_totales del estudiante (dentro de la misma transacción)
      await tx.estudiante.update({
        where: { id: estudianteId },
        data: {
          puntos_totales: {
            increment: accion.puntos,
          },
        },
      });

      return nuevoPunto;
    });

    return {
      success: true,
      puntoObtenido,
      mensaje: `Se otorgaron ${accion.puntos} puntos a ${estudiante.nombre} ${estudiante.apellido}`,
    };
  }

  /**
   * Obtener puntos del estudiante
   */
  async getPuntosEstudiante(estudianteId: string) {
    const asistencias = await this.prisma.asistencia.findMany({
      where: { estudiante_id: estudianteId },
      include: {
        clase: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    const puntosAsistencia =
      asistencias.filter((a) => a.estado === EstadoAsistencia.Presente).length *
      10;

    // Puntos por clase
    const puntosPorClase: Record<string, number> = {};
    asistencias
      .filter((a) => a.estado === EstadoAsistencia.Presente)
      .forEach((a) => {
        const claseNombre = a.clase.nombre || 'General';
        puntosPorClase[claseNombre] = (puntosPorClase[claseNombre] || 0) + 10;
      });

    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      select: { puntos_totales: true },
    });

    return {
      total: estudiante?.puntos_totales || 0,
      asistencia: puntosAsistencia,
      extras: (estudiante?.puntos_totales || 0) - puntosAsistencia,
      porClase: puntosPorClase,
    };
  }
}
