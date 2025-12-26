import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { UpdateProgresoDto } from '../dto';

/**
 * Service para gestionar el progreso de estudiantes en contenidos
 * Responsabilidad: Tracking de avance, tiempo y completitud
 */
@Injectable()
export class ProgresoService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene el progreso de un estudiante en un contenido específico
   * @param estudianteId - ID del estudiante
   * @param contenidoId - ID del contenido
   */
  async getProgreso(estudianteId: string, contenidoId: string) {
    const progreso = await this.prisma.progresoContenido.findUnique({
      where: {
        estudianteId_contenidoId: { estudianteId, contenidoId },
      },
      include: {
        contenido: {
          select: {
            id: true,
            titulo: true,
            _count: { select: { slides: true } },
          },
        },
      },
    });

    if (!progreso) {
      throw new NotFoundException('Progreso no encontrado');
    }

    return {
      ...progreso,
      porcentaje: Math.round(
        (progreso.slideActual / progreso.contenido._count.slides) * 100,
      ),
    };
  }

  /**
   * Actualiza el progreso de un estudiante
   * @param estudianteId - ID del estudiante
   * @param contenidoId - ID del contenido
   * @param dto - Datos de progreso
   */
  async updateProgreso(
    estudianteId: string,
    contenidoId: string,
    dto: UpdateProgresoDto,
  ) {
    // Verificar que existe el progreso
    const existente = await this.prisma.progresoContenido.findUnique({
      where: {
        estudianteId_contenidoId: { estudianteId, contenidoId },
      },
    });

    if (!existente) {
      throw new NotFoundException(
        'Progreso no encontrado. Primero accede al contenido.',
      );
    }

    // Preparar datos de actualización
    const updateData: Parameters<
      typeof this.prisma.progresoContenido.update
    >[0]['data'] = {
      slideActual: dto.slideActual,
    };

    // Sumar tiempo adicional
    if (dto.tiempoAdicionalSegundos) {
      updateData.tiempoTotalSegundos =
        existente.tiempoTotalSegundos + dto.tiempoAdicionalSegundos;
    }

    // Marcar como completado (no se revierte)
    if (dto.completado && !existente.completado) {
      updateData.completado = true;
      updateData.fechaCompletitud = new Date();
    }

    return this.prisma.progresoContenido.update({
      where: {
        estudianteId_contenidoId: { estudianteId, contenidoId },
      },
      data: updateData,
    });
  }

  /**
   * Obtiene todos los progresos de un estudiante
   * @param estudianteId - ID del estudiante
   */
  async getAllProgresos(estudianteId: string) {
    const progresos = await this.prisma.progresoContenido.findMany({
      where: { estudianteId },
      include: {
        contenido: {
          select: {
            id: true,
            titulo: true,
            mundoTipo: true,
            imagenPortada: true,
            _count: { select: { slides: true } },
          },
        },
      },
      orderBy: { ultimaActividad: 'desc' },
    });

    return progresos.map((p) => ({
      ...p,
      porcentaje: Math.round((p.slideActual / p.contenido._count.slides) * 100),
    }));
  }
}
